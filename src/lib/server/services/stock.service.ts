import { eq, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { normalizeOrderStatus } from '../../constants/order-status';
import { parseCartItemId } from '../../utils/order-pricing';

type Db = DrizzleD1Database<typeof schema>;

export interface StockChange {
	productId: string;
	variantId?: string | null;
	quantity: number;
}

// Orders in these states are not holding any stock.
const STOCK_FREE_STATUSES = new Set(['incomplete', 'cancelled', 'returned']);

function holdsStock(status: string): boolean {
	return !STOCK_FREE_STATUSES.has(normalizeOrderStatus(status));
}

export class StockService {
	/**
	 * Statements that take stock, for use inside the order's atomic batch.
	 * A total_stock of 0 means the store does not track stock for that product, so it
	 * is left alone and is never flipped to out of stock.
	 */
	static decrementStatements(db: Db, changes: StockChange[]) {
		const { products, productVariants } = schema;
		return changes.flatMap(({ productId, variantId, quantity }) => {
			const statements: any[] = [
				db
					.update(products)
					.set({
						inStock: sql`case when ${products.totalStock} > 0 and ${products.totalStock} - ${quantity} <= 0 then 0 else ${products.inStock} end`,
						totalStock: sql`max(${products.totalStock} - ${quantity}, 0)`,
						stock: sql`max(coalesce(${products.stock}, 0) - ${quantity}, 0)`,
						salesCount: sql`${products.salesCount} + ${quantity}`
					})
					.where(eq(products.id, productId))
			];
			if (variantId) {
				statements.push(
					db
						.update(productVariants)
						.set({ stock: sql`max(${productVariants.stock} - ${quantity}, 0)` })
						.where(eq(productVariants.id, variantId))
				);
			}
			return statements;
		});
	}

	private static restoreStatements(db: Db, changes: StockChange[]) {
		const { products, productVariants } = schema;
		return changes.flatMap(({ productId, variantId, quantity }) => {
			const statements: any[] = [
				db
					.update(products)
					.set({
						totalStock: sql`case when ${products.totalStock} = 0 and ${products.inStock} = 1 then 0 else ${products.totalStock} + ${quantity} end`,
						stock: sql`case when ${products.totalStock} = 0 and ${products.inStock} = 1 then ${products.stock} else coalesce(${products.stock}, 0) + ${quantity} end`,
						inStock: true,
						salesCount: sql`max(${products.salesCount} - ${quantity}, 0)`
					})
					.where(eq(products.id, productId))
			];
			if (variantId) {
				statements.push(
					db
						.update(productVariants)
						.set({ stock: sql`${productVariants.stock} + ${quantity}` })
						.where(eq(productVariants.id, variantId))
				);
			}
			return statements;
		});
	}

	/** Reads the stock an order holds from its saved line items. */
	private static changesFromOrderItems(itemsJson: string): StockChange[] {
		let items: any[] = [];
		try {
			items = JSON.parse(itemsJson);
		} catch {
			return [];
		}
		if (!Array.isArray(items)) return [];

		return items.flatMap((item) => {
			if (typeof item?.id !== 'string') return [];
			const { productId, bundle } = parseCartItemId(item.id);
			const quantity = (Number(item.quantity) || 0) * bundle.multiplier;
			return quantity > 0 ? [{ productId, variantId: item.variantId || null, quantity }] : [];
		});
	}

	/**
	 * Call before changing a web order's status: releases stock when an order is
	 * cancelled or returned, and takes it again when the order comes back.
	 * Manual orders never take stock at creation, so they are skipped.
	 */
	static async syncForStatusChange(
		db: Db,
		order: { orderType: string; status: string; items: string },
		newStatus: string
	) {
		if (order.orderType !== 'web') return;

		const held = holdsStock(order.status);
		const willHold = holdsStock(newStatus);
		if (held === willHold) return;

		const changes = this.changesFromOrderItems(order.items);
		if (changes.length === 0) return;

		const statements = willHold
			? this.decrementStatements(db, changes)
			: this.restoreStatements(db, changes);
		await db.batch(statements as [any, ...any[]]);
	}
}
