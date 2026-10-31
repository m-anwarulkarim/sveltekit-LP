import { eq, and, desc, asc, sql, gte, lte } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface AssetValuationProduct {
	id: string;
	name: string;
	sku: string;
	variant: string;
	stock: number;
	costPerUnit: number;
	salePerUnit: number;
	image: string;
	status: string;
	totalCost: number;
	totalRetail: number;
	potentialProfit: number;
}

export interface AssetValuationReportData {
	products: AssetValuationProduct[];
	totalAssetCost: number;
	totalRetailValue: number;
	potentialProfit: number;
	publishedCount: number;
	totalCount: number;
	totalStockQty: number;
}

export interface DailyBusinessSummaryFilter {
	startDate?: string; // YYYY-MM-DD
	endDate?: string; // YYYY-MM-DD
}

export interface DailyOrderItemDetail {
	id: string;
	orderNumber: string;
	customerName: string;
	customerPhone: string;
	status: string;
	total: number;
	advancePayment: number;
	dueAmount: number;
	deliveryCharge: number;
	courierCost: number;
	packagingCost: number;
	createdAt: string;
}

export interface DailyBusinessSummaryData {
	startDate: string;
	endDate: string;
	totalOrdersReceived: number;
	totalOrdersDelivered: number;
	totalOrdersPending: number;
	totalOrdersCancelled: number;
	returnOrders: number;
	totalOrderValue: number;
	advanceCollected: number;
	dueAmount: number;
	deliveryCharge: number;
	courierCost: number;
	packagingCost: number;
	netEstimatedProfit: number;
	orders: DailyOrderItemDetail[];
}

export class ReportService {
	/**
	 * Computes live asset valuation across all catalog products
	 */
	static async getAssetValuationReport(
		db: DrizzleD1Database<typeof schema>
	): Promise<AssetValuationReportData> {
		try {
			const dbProducts = await db
				.select()
				.from(schema.products)
				.orderBy(desc(schema.products.createdAt))
				.all();

			let totalAssetCost = 0;
			let totalRetailValue = 0;
			let totalStockQty = 0;
			let publishedCount = 0;

			const products: AssetValuationProduct[] = dbProducts.map((p) => {
				const stock = p.totalStock ?? p.stock ?? 0;
				const salePerUnit = p.salePrice ?? p.price ?? 0;
				// If costPrice is not defined, estimate 60% of retail price
				const costPerUnit = p.costPrice ?? Math.round(salePerUnit * 0.6);

				const itemTotalCost = stock * costPerUnit;
				const itemTotalRetail = stock * salePerUnit;
				const itemPotentialProfit = itemTotalRetail - itemTotalCost;

				totalStockQty += stock;
				totalAssetCost += itemTotalCost;
				totalRetailValue += itemTotalRetail;

				if (p.status === 'published' || p.status === 'active') {
					publishedCount++;
				}

				return {
					id: p.id,
					name: p.name,
					sku: p.sku || '-',
					variant: p.model || '-',
					stock,
					costPerUnit,
					salePerUnit,
					image: p.image || '/images/placeholder.svg',
					status: p.status,
					totalCost: itemTotalCost,
					totalRetail: itemTotalRetail,
					potentialProfit: itemPotentialProfit
				};
			});

			const potentialProfit = totalRetailValue - totalAssetCost;

			return {
				products,
				totalAssetCost,
				totalRetailValue,
				potentialProfit,
				publishedCount,
				totalCount: dbProducts.length,
				totalStockQty
			};
		} catch (error) {
			console.error('Failed to compute asset valuation report:', error);
			return {
				products: [],
				totalAssetCost: 0,
				totalRetailValue: 0,
				potentialProfit: 0,
				publishedCount: 0,
				totalCount: 0,
				totalStockQty: 0
			};
		}
	}

	/**
	 * Computes daily business summary report for a given date range
	 */
	static async getDailyBusinessSummaryReport(
		db: DrizzleD1Database<typeof schema>,
		filter: DailyBusinessSummaryFilter = {}
	): Promise<DailyBusinessSummaryData> {
		const todayStr = new Date().toISOString().split('T')[0];
		const startDate = filter.startDate || todayStr;
		const endDate = filter.endDate || todayStr;

		try {
			// Convert to Bangladesh Time (UTC+6) start and end millisecond timestamps
			const startTs = new Date(`${startDate}T00:00:00+06:00`).getTime();
			const endTs = new Date(`${endDate}T23:59:59.999+06:00`).getTime();

			// Fetch orders within date range (excluding trashed orders)
			const dbOrders = await db
				.select()
				.from(schema.orders)
				.where(
					and(
						eq(schema.orders.isTrashed, false),
						gte(schema.orders.createdAt, new Date(startTs)),
						lte(schema.orders.createdAt, new Date(endTs))
					)
				)
				.orderBy(desc(schema.orders.createdAt))
				.all();

			const ordersToProcess = dbOrders;

			let totalOrdersReceived = ordersToProcess.length;
			let totalOrdersDelivered = 0;
			let totalOrdersPending = 0;
			let totalOrdersCancelled = 0;
			let returnOrders = 0;

			let totalOrderValue = 0;
			let advanceCollected = 0;
			let dueAmount = 0;
			let deliveryCharge = 0;
			let courierCost = 0;
			let packagingCost = 0;

			const orderDetails: DailyOrderItemDetail[] = ordersToProcess.map((o) => {
				const status = (o.status || 'pending').toLowerCase();
				if (status === 'delivered') totalOrdersDelivered++;
				else if (status === 'cancelled') totalOrdersCancelled++;
				else if (status === 'returned') returnOrders++;
				else totalOrdersPending++;

				const orderTotal = o.total || 0;
				const orderAdvance = o.advancePayment || 0;
				const orderDue = o.dueAmount ?? Math.max(0, orderTotal - orderAdvance);
				const orderDeliveryCharge = o.deliveryCharge || 0;
				const orderCourierCost = o.courierCost || 0;
				const orderPackagingCost = o.packagingCost || 0;

				totalOrderValue += orderTotal;
				advanceCollected += orderAdvance;
				dueAmount += orderDue;
				deliveryCharge += orderDeliveryCharge;
				courierCost += orderCourierCost;
				packagingCost += orderPackagingCost;

				const createdDate = o.createdAt ? new Date(o.createdAt) : new Date();
				const formattedDate = createdDate.toLocaleString('en-US', {
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				});

				return {
					id: o.id,
					orderNumber: o.orderNumber ? `#${o.orderNumber}` : `#${o.id.slice(0, 8)}`,
					customerName: o.customerName || 'Anonymous',
					customerPhone: o.customerPhone || '-',
					status: o.status || 'pending',
					total: orderTotal,
					advancePayment: orderAdvance,
					dueAmount: orderDue,
					deliveryCharge: orderDeliveryCharge,
					courierCost: orderCourierCost,
					packagingCost: orderPackagingCost,
					createdAt: formattedDate
				};
			});

			const netEstimatedProfit = totalOrderValue - courierCost - packagingCost;

			return {
				startDate,
				endDate,
				totalOrdersReceived,
				totalOrdersDelivered,
				totalOrdersPending,
				totalOrdersCancelled,
				returnOrders,
				totalOrderValue,
				advanceCollected,
				dueAmount,
				deliveryCharge,
				courierCost,
				packagingCost,
				netEstimatedProfit,
				orders: orderDetails
			};
		} catch (error) {
			console.error('Failed to compute daily business summary:', error);
			return {
				startDate,
				endDate,
				totalOrdersReceived: 0,
				totalOrdersDelivered: 0,
				totalOrdersPending: 0,
				totalOrdersCancelled: 0,
				returnOrders: 0,
				totalOrderValue: 0,
				advanceCollected: 0,
				dueAmount: 0,
				deliveryCharge: 0,
				courierCost: 0,
				packagingCost: 0,
				netEstimatedProfit: 0,
				orders: []
			};
		}
	}
}

