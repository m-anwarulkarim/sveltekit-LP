import { eq, desc, and, or } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import {
	checkoutOrderSchema,
	type CheckoutOrderInput,
	type UpdateOrderStatusInput
} from '../validations/order.validation';
import { CustomerService } from './customer.service';

export interface OrderCreationContext {
	ipAddress?: string;
	userAgent?: string;
	source?: string;
}

export interface OrderCreationResult {
	orderId: string;
	orderNumber: string;
	total: number;
	customerName: string;
	customerPhone: string;
}

/**
 * Enterprise E-Commerce Order Service
 * Handles order lifecycle, atomic batch persistence, inventory, and notes
 */
export class OrderService {
	/**
	 * Generates a clean, sequential order reference code starting from 1001.
	 * e.g. 1001, 1002, 1003...
	 */
	static async generateNextOrderNumber(db: DrizzleD1Database<typeof schema>): Promise<string> {
		try {
			const existingOrders = await db
				.select({ orderNumber: schema.orders.orderNumber })
				.from(schema.orders);

			let maxSeq = 1000;
			for (const o of existingOrders) {
				if (o.orderNumber) {
					const cleaned = o.orderNumber.replace(/\D/g, '');
					if (cleaned) {
						const num = parseInt(cleaned, 10);
						// Consider numbers in sequential range (>= 1000 and < 100000)
						if (!isNaN(num) && num >= 1000 && num < 100000) {
							if (num > maxSeq) {
								maxSeq = num;
							}
						}
					}
				}
			}
			return String(maxSeq + 1);
		} catch (err) {
			console.error('Failed to compute next sequential order number:', err);
			return '1001';
		}
	}

	static generateOrderNumber(): string {
		const randomSuffix = Math.floor(1001 + Math.random() * 8999);
		return String(randomSuffix);
	}

	/**
	 * Creates a new storefront order with atomic database persistence
	 */
	static async createWebOrder(
		db: DrizzleD1Database<typeof schema>,
		rawData: unknown,
		context?: OrderCreationContext
	): Promise<OrderCreationResult> {
		// 1. Validate payload using strict Zod schema
		const validationResult = checkoutOrderSchema.safeParse(rawData);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0]?.message || 'ভুল ইনপুট প্রদান করা হয়েছে';
			throw new Error(firstError);
		}

		const data = validationResult.data;

		// 2. Honeypot Bot Deterrence Check
		if (data.website_url && data.website_url.trim().length > 0) {
			throw new Error('স্বয়ংক্রিয় রোবট দ্বারা স্প্যাম শনাক্ত হয়েছে');
		}

		// 3. Compute Financial Breakdown
		const subtotal = data.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
		const deliveryCharge = data.deliveryArea === 'inside_dhaka' ? 60 : 120;
		const total = subtotal + deliveryCharge;

		const orderId = crypto.randomUUID();
		const orderNumber = await this.generateNextOrderNumber(db);

		// 4. Upsert Customer in Customer 360 database
		let customerId: string | undefined;
		try {
			const customer = await CustomerService.getOrCreateCustomer(db, {
				name: data.customerName,
				phone: data.customerPhone,
				address: data.shippingAddress
			});
			customerId = customer.id;
		} catch (err) {
			console.error('Customer upsert failed:', err);
		}

		// 5. Prepare Order Record
		const newOrder: typeof schema.orders.$inferInsert = {
			id: orderId,
			orderNumber,
			customerId: customerId || null,
			customerName: data.customerName,
			customerEmail: data.customerPhone, // Store phone as identifier
			customerPhone: data.customerPhone,
			alternatePhone: data.alternatePhone || null,
			shippingAddress: data.shippingAddress,
			deliveryArea: data.deliveryArea,
			subtotal,
			deliveryCharge,
			discountAmount: 0,
			advancePayment: 0,
			dueAmount: total,
			total,
			paymentMethod: data.paymentMethod,
			paymentStatus: 'pending',
			status: 'pending',
			orderType: 'web',
			items: JSON.stringify(data.items),
			source: context?.source || 'Web Checkout',
			ipAddress: context?.ipAddress || null,
			userAgent: context?.userAgent || null
		};

		// 6. Prepare Normalized Order Items (safely check foreign key)
		let validProductIds = new Set<string>();
		try {
			const existing = await db.select({ id: schema.products.id }).from(schema.products).all();
			validProductIds = new Set(existing.map((p) => p.id));
		} catch {
			// ignore lookup failure
		}

		const orderItemsToInsert: (typeof schema.orderItems.$inferInsert)[] = data.items.map((item) => ({
			id: crypto.randomUUID(),
			orderId,
			productId: validProductIds.has(item.id) ? item.id : null,
			variantId: null,
			productName: item.name,
			variantName: item.variantName || null,
			unitPrice: item.price,
			quantity: item.quantity,
			subtotal: item.price * item.quantity,
			productImage: item.image || null
		}));

		// 7. Atomic Database Execution
		try {
			// If db supports batching (D1)
			if (typeof (db as any).batch === 'function') {
				const batchQueries: any[] = [
					db.insert(schema.orders).values(newOrder),
					...orderItemsToInsert.map((item) => db.insert(schema.orderItems).values(item))
				];

				if (data.orderNote && data.orderNote.trim().length > 0) {
					batchQueries.push(
						db.insert(schema.orderNotes).values({
							id: crypto.randomUUID(),
							orderId,
							adminName: 'Customer (Order Note)',
							note: data.orderNote.trim(),
							callStatus: 'customer_note'
						})
					);
				}

				await (db as any).batch(batchQueries);
			} else {
				// Standard fallback (PostgreSQL / MySQL / SQLite transaction)
				await db.insert(schema.orders).values(newOrder);
				for (const item of orderItemsToInsert) {
					await db.insert(schema.orderItems).values(item);
				}
				if (data.orderNote && data.orderNote.trim().length > 0) {
					await db.insert(schema.orderNotes).values({
						id: crypto.randomUUID(),
						orderId,
						adminName: 'Customer (Order Note)',
						note: data.orderNote.trim(),
						callStatus: 'customer_note'
					});
				}
			}

			// Update customer lifetime stats
			if (customerId) {
				await CustomerService.incrementCustomerOrderStats(db, customerId, total).catch((e) =>
					console.error('Customer stats increment failed:', e)
				);
			}
		} catch (dbErr: any) {
			console.error('Failed to persist order to database:', dbErr);
			throw new Error(`অর্ডার সংরক্ষণ করা সম্ভব হয়নি: ${dbErr?.message || 'Database error'}`);
		}

		return {
			orderId,
			orderNumber,
			total,
			customerName: data.customerName,
			customerPhone: data.customerPhone
		};
	}

	/**
	 * Retrieves all orders from the database with optional status/trashed filtering
	 */
	static async getAllOrders(
		db: DrizzleD1Database<typeof schema>,
		options?: { isTrashed?: boolean; status?: string }
	) {
		const conditions: any[] = [];
		if (options?.isTrashed !== undefined) {
			conditions.push(eq(schema.orders.isTrashed, options.isTrashed));
		}
		if (options?.status) {
			conditions.push(eq(schema.orders.status, options.status));
		}

		let query = db.select().from(schema.orders);
		if (conditions.length > 0) {
			query = query.where(and(...conditions)) as any;
		}

		return await query.orderBy(desc(schema.orders.createdAt)).all();
	}

	/**
	 * Retrieves an order by its ID or human-readable order number
	 */
	static async getOrderById(db: DrizzleD1Database<typeof schema>, idOrNumber: string) {
		const clean = (idOrNumber || '').trim();
		const withoutHash = clean.replace(/^#/, '');

		// 1. Direct UUID or Exact Match
		const order = await db
			.select()
			.from(schema.orders)
			.where(and(eq(schema.orders.id, clean), eq(schema.orders.isTrashed, false)))
			.get();

		if (order) {
			const items = await db
				.select()
				.from(schema.orderItems)
				.where(eq(schema.orderItems.orderId, order.id));
			const notes = await db
				.select()
				.from(schema.orderNotes)
				.where(eq(schema.orderNotes.orderId, order.id))
				.orderBy(desc(schema.orderNotes.createdAt));

			return { ...order, itemsList: items, notesList: notes };
		}

		// 2. Fallback lookup by order number (with or without hash)
		const orderByNumber = await db
			.select()
			.from(schema.orders)
			.where(
				and(
					or(
						eq(schema.orders.orderNumber, clean),
						eq(schema.orders.orderNumber, withoutHash)
					),
					eq(schema.orders.isTrashed, false)
				)
			)
			.get();

		if (!orderByNumber) return null;

		const items = await db
			.select()
			.from(schema.orderItems)
			.where(eq(schema.orderItems.orderId, orderByNumber.id));
		const notes = await db
			.select()
			.from(schema.orderNotes)
			.where(eq(schema.orderNotes.orderId, orderByNumber.id))
			.orderBy(desc(schema.orderNotes.createdAt));

		return { ...orderByNumber, itemsList: items, notesList: notes };
	}

	/**
	 * Updates order lifecycle status and registers an admin audit note
	 */
	static async updateOrderStatus(
		db: DrizzleD1Database<typeof schema>,
		input: UpdateOrderStatusInput,
		actorName = 'Admin Staff'
	) {
		const order = await db
			.select()
			.from(schema.orders)
			.where(eq(schema.orders.id, input.orderId))
			.get();

		if (!order) {
			throw new Error('অর্ডার পাওয়া যায়নি');
		}

		const updatePayload: Record<string, any> = {
			status: input.status,
			updatedAt: new Date()
		};

		if (input.status === 'confirmed' && !order.confirmedAt) {
			updatePayload.confirmedAt = new Date();
		} else if (input.status === 'shipped' && !order.shippedAt) {
			updatePayload.shippedAt = new Date();
		} else if (input.status === 'delivered' && !order.deliveredAt) {
			updatePayload.deliveredAt = new Date();
		}

		await db.update(schema.orders).set(updatePayload).where(eq(schema.orders.id, input.orderId));

		if (input.note && input.note.trim().length > 0) {
			await db.insert(schema.orderNotes).values({
				id: crypto.randomUUID(),
				orderId: input.orderId,
				adminName: actorName,
				note: input.note.trim(),
				callStatus: input.callStatus || 'call_received'
			});
		}

		return { success: true, updatedStatus: input.status };
	}
}

