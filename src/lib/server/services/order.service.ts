import { eq, desc, and, or, sql, ne, inArray, gte, getTableColumns } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import {
	checkoutOrderSchema,
	type CheckoutOrderItemInput,
	type UpdateOrderStatusInput
} from '../validations/order.validation';
import { CustomerService } from './customer.service';
import { SecurityService } from './security.service';
import { NotificationService } from './notification.service';
import { SettingsService } from './settings.service';
import { CouponService } from './coupon.service';
import { StockService, type StockChange } from './stock.service';
import { normalizeBdPhone } from '../utils/phone';
import { normalizeOrderStatus } from '../../constants/order-status';
import {
	computeCouponDiscount,
	computeDeliveryCharge,
	computeOfferDiscount,
	getBundlePrice,
	getBundlesWithLabel,
	parseCartItemId
} from '../../utils/order-pricing';

type Db = DrizzleD1Database<typeof schema>;

export interface OrderCreationContext {
	ipAddress?: string;
	userAgent?: string;
	source?: string;
	deviceFingerprint?: string;
	userId?: string | null;
	/** Runs slow, non-critical work after the response (platform.ctx.waitUntil). */
	defer?: (work: Promise<unknown>) => void;
	/** Price set by a landing page offer. When present, cart pricing rules are skipped. */
	landingOffer?: {
		productId: string | null;
		productName: string;
		image?: string | null;
		unitPrice: number;
		quantity: number;
		subtotal: number;
		deliveryCharge: number;
	};
}

export interface PricedOrderItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	variantId: string | null;
	variantName: string | null;
	image: string | null;
}

export interface OrderCreationResult {
	orderId: string;
	orderNumber: string;
	subtotal: number;
	deliveryCharge: number;
	discountAmount: number;
	total: number;
	customerName: string;
	customerPhone: string;
	items: PricedOrderItem[];
}

/** An order problem the customer can act on. Its message is safe to show them. */
export class OrderValidationError extends Error {}

/** The server's total differs from the one the customer confirmed. */
export class OrderPriceChangedError extends OrderValidationError {
	constructor(
		message: string,
		readonly total: number
	) {
		super(message);
	}
}

export type AdminOrderScope = 'active' | 'incomplete' | 'pre' | 'trash';

const ORDER_SEQUENCE_GROUP = 'system';
const ORDER_SEQUENCE_KEY = 'order_sequence';
const FIRST_ORDER_SEQUENCE = 1000;

/**
 * Enterprise E-Commerce Order Service
 * Handles order lifecycle, atomic batch persistence, inventory, and notes
 */
export class OrderService {
	/**
	 * Returns the next order number from an atomic counter, so concurrent checkouts can
	 * never receive the same one. The counter is seeded once from existing orders.
	 */
	static async generateNextOrderNumber(db: Db): Promise<string> {
		const { storeSettings } = schema;
		const whereCounter = and(
			eq(storeSettings.group, ORDER_SEQUENCE_GROUP),
			eq(storeSettings.key, ORDER_SEQUENCE_KEY)
		);

		const updated = await db
			.update(storeSettings)
			.set({ value: sql`cast(cast(${storeSettings.value} as integer) + 1 as text)` })
			.where(whereCounter)
			.returning({ value: storeSettings.value })
			.get();
		if (updated) return updated.value;

		const existing = await db.select({ orderNumber: schema.orders.orderNumber }).from(schema.orders);
		let maxSeq = FIRST_ORDER_SEQUENCE;
		for (const { orderNumber } of existing) {
			const num = parseInt((orderNumber || '').replace(/\D/g, ''), 10);
			if (num >= FIRST_ORDER_SEQUENCE && num < 100000 && num > maxSeq) maxSeq = num;
		}

		const seeded = await db
			.insert(storeSettings)
			.values({ group: ORDER_SEQUENCE_GROUP, key: ORDER_SEQUENCE_KEY, value: String(maxSeq + 1) })
			.onConflictDoUpdate({
				target: [storeSettings.group, storeSettings.key],
				set: { value: sql`cast(cast(${storeSettings.value} as integer) + 1 as text)` }
			})
			.returning({ value: storeSettings.value })
			.get();
		return seeded.value;
	}

	/**
	 * Rebuilds cart lines from the database so a tampered price, name or product can
	 * never reach an order.
	 */
	private static async priceCartItems(db: Db, rawItems: CheckoutOrderItemInput[]) {
		const parsed = rawItems.map((item) => ({ ...item, ...parseCartItemId(item.id) }));
		const productIds = [...new Set(parsed.map((item) => item.productId))];
		const variantIds = [...new Set(parsed.flatMap((item) => (item.variantId ? [item.variantId] : [])))];

		const [productRows, variantRows] = await Promise.all([
			db.select().from(schema.products).where(inArray(schema.products.id, productIds)).all(),
			variantIds.length > 0
				? db
						.select()
						.from(schema.productVariants)
						.where(inArray(schema.productVariants.id, variantIds))
						.all()
				: Promise.resolve([] as (typeof schema.productVariants.$inferSelect)[])
		]);
		const productsById = new Map(productRows.map((p) => [p.id, p]));
		const variantsById = new Map(variantRows.map((v) => [v.id, v]));

		const requestedStock = new Map<string, number>();
		const stockChanges: StockChange[] = [];
		const items: PricedOrderItem[] = [];

		for (const line of parsed) {
			const product = productsById.get(line.productId);
			if (!product || product.status === 'draft' || product.status === 'archived') {
				throw new OrderValidationError(
					'আপনার কার্টের একটি পণ্য আর পাওয়া যাচ্ছে না। কার্ট থেকে সরিয়ে আবার চেষ্টা করুন।'
				);
			}
			if (!product.inStock && !product.isPreOrder) {
				throw new OrderValidationError(`"${product.name}" পণ্যটি এখন স্টকে নেই।`);
			}

			const variant = line.variantId ? variantsById.get(line.variantId) : undefined;
			if (line.variantId && variant?.productId !== product.id) {
				throw new OrderValidationError(`"${product.name}" পণ্যের নির্বাচিত ভ্যারিয়েন্টটি পাওয়া যায়নি।`);
			}

			const units = line.quantity * line.bundle.multiplier;
			const totalRequested = (requestedStock.get(product.id) || 0) + units;
			requestedStock.set(product.id, totalRequested);
			if (product.totalStock > 0 && totalRequested > product.totalStock && !product.isPreOrder) {
				throw new OrderValidationError(`"${product.name}" পণ্যের মাত্র ${product.totalStock}টি স্টকে আছে।`);
			}

			const isBundle = line.bundle.id !== 'standard';
			if (isBundle && !product.enableBundle) {
				throw new OrderValidationError(`"${product.name}" পণ্যে এখন প্যাকেজ অফার চালু নেই। কার্ট থেকে সরিয়ে আবার যোগ করুন।`);
			}
			const bundleName = getBundlesWithLabel(product.bundleUnitLabel).find((b) => b.id === line.bundle.id)?.name ?? line.bundle.name;
			items.push({
				id: line.id,
				name: isBundle ? `${product.name} [${bundleName}]` : product.name,
				price: getBundlePrice(variant?.price ?? product.price, line.bundle),
				quantity: line.quantity,
				variantId: variant?.id ?? null,
				variantName: variant?.name ?? null,
				image: variant?.image || product.image || null
			});
			stockChanges.push({ productId: product.id, variantId: variant?.id ?? null, quantity: units });
		}

		return { items, stockChanges };
	}

	private static async isFirstOrder(db: Db, phone: string): Promise<boolean> {
		const previous = await db
			.select({ id: schema.orders.id })
			.from(schema.orders)
			.where(
				and(
					eq(schema.orders.customerPhone, phone),
					ne(schema.orders.status, 'incomplete'),
					eq(schema.orders.isTrashed, false)
				)
			)
			.limit(1)
			.get();
		return !previous;
	}

	private static async assertPaymentMethodEnabled(db: Db, method: string) {
		const config = await SettingsService.getPaymentConfig(db);
		const enabled: Record<string, boolean> = {
			cod: config.enableCOD,
			bkash: config.enableBkash,
			nagad: config.enableNagad,
			card: config.enableSSLCommerz
		};
		if (!enabled[method]) {
			throw new OrderValidationError('নির্বাচিত পেমেন্ট পদ্ধতিটি এখন চালু নেই।');
		}
	}

	/**
	 * Creates a new storefront order with atomic database persistence
	 */
	static async createWebOrder(
		db: Db,
		rawData: unknown,
		context?: OrderCreationContext
	): Promise<OrderCreationResult> {
		// 1. Validate payload using strict Zod schema
		const validationResult = checkoutOrderSchema.safeParse(rawData);
		if (!validationResult.success) {
			throw new OrderValidationError(
				validationResult.error.issues[0]?.message || 'ভুল ইনপুট প্রদান করা হয়েছে'
			);
		}
		const data = validationResult.data;

		// 2. Honeypot Bot Deterrence Check
		if (data.website_url && data.website_url.trim().length > 0) {
			throw new OrderValidationError('স্বয়ংক্রিয় রোবট দ্বারা স্প্যাম শনাক্ত হয়েছে');
		}

		// 3. Sentinel IP & Phone Blacklist Check
		const block = await SecurityService.isBlocked(
			db,
			context?.ipAddress || '127.0.0.1',
			data.customerPhone
		);
		if (block.blocked) {
			throw new OrderValidationError(
				`আপনার ফোন নম্বর বা আইপি অ্যাড্রেস সিস্টেম দ্বারা সীমাবদ্ধ (Blocked)। কারণ: ${block.reason || 'Restricted Activity'}`
			);
		}

		// 4. Compute the financial breakdown on the server
		let items: PricedOrderItem[];
		let stockChanges: StockChange[] = [];
		let subtotal: number;
		let deliveryCharge: number;
		let discountAmount = 0;
		let appliedCoupon: { id: string; code: string } | null = null;

		const offer = context?.landingOffer;
		if (offer) {
			if (offer.productId) {
				const product = await db
					.select()
					.from(schema.products)
					.where(eq(schema.products.id, offer.productId))
					.get();
				if (product) {
					if (!product.inStock && !product.isPreOrder) {
						throw new OrderValidationError(`"${product.name}" পণ্যটি বর্তমানে স্টক আউট।`);
					}
					if (product.totalStock > 0 && offer.quantity > product.totalStock && !product.isPreOrder) {
						throw new OrderValidationError(`"${product.name}" পণ্যের মাত্র ${product.totalStock}টি স্টকে আছে।`);
					}
				}
			}
			items = [
				{
					id: offer.productId || 'lp-prod',
					name: offer.productName,
					price: offer.unitPrice,
					quantity: offer.quantity,
					variantId: null,
					variantName: null,
					image: offer.image || null
				}
			];
			if (offer.productId) {
				stockChanges = [{ productId: offer.productId, quantity: offer.quantity }];
			}
			subtotal = offer.subtotal;
			deliveryCharge = offer.deliveryCharge;
		} else {
			await this.assertPaymentMethodEnabled(db, data.paymentMethod);

			const priced = await this.priceCartItems(db, data.items);
			items = priced.items;
			stockChanges = priced.stockChanges;
			subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

			if (data.couponCode) {
				const coupon = await CouponService.validateCoupon(db, data.couponCode, subtotal);
				if (!coupon.valid) throw new OrderValidationError(coupon.message);
				discountAmount += computeCouponDiscount(coupon.coupon, subtotal);
				appliedCoupon = { id: coupon.coupon.id, code: coupon.coupon.code };
			}

			const [storeConfig, productSettings, offers] = await Promise.all([
				SettingsService.getStoreDeliveryConfig(db),
				SettingsService.getProductSettings(db),
				SettingsService.getManageOffers(db)
			]);

			const activeOffer = (type: string) =>
				offers.find((o) => o.offerType === type && o.status === 'active');
			if (data.paymentMethod !== 'cod') {
				discountAmount += computeOfferDiscount(activeOffer('Online Payment')?.discount, subtotal);
			}
			const hasFreeDeliveryOffer =
				Boolean(activeOffer('Free Delivery (1st Order)')) &&
				(await this.isFirstOrder(db, data.customerPhone));

			deliveryCharge = computeDeliveryCharge({
				subtotal,
				area: data.deliveryArea,
				store: storeConfig,
				productSettings,
				hasFreeDeliveryOffer
			});
		}

		discountAmount = Math.min(discountAmount, subtotal);
		const total = Math.max(0, subtotal - discountAmount + deliveryCharge);

		if (typeof data.expectedTotal === 'number' && data.expectedTotal !== total) {
			throw new OrderPriceChangedError(
				`অর্ডারের মোট মূল্য পরিবর্তিত হয়ে ৳${total.toLocaleString('en-US')} হয়েছে। এই মূল্যে অর্ডার করতে আবার অর্ডার বাটনে ক্লিক করুন।`,
				total
			);
		}

		const orderId = crypto.randomUUID();
		const orderNumber = await this.generateNextOrderNumber(db);

		// 5. Upsert Customer in Customer 360 database
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

		// 6. Atomic Database Execution
		const statements: any[] = [
			db.insert(schema.orders).values({
				id: orderId,
				orderNumber,
				customerId: customerId || null,
				userId: context?.userId || null,
				customerName: data.customerName,
				customerEmail: data.customerPhone, // Store phone as identifier
				customerPhone: data.customerPhone,
				alternatePhone: data.alternatePhone || null,
				shippingAddress: data.shippingAddress,
				deliveryArea: data.deliveryArea,
				subtotal,
				deliveryCharge,
				discountAmount,
				advancePayment: 0,
				dueAmount: total,
				total,
				paymentMethod: data.paymentMethod,
				paymentStatus: 'pending',
				status: 'pending',
				orderType: 'web',
				items: JSON.stringify(items),
				source: context?.source || 'Web Checkout',
				ipAddress: context?.ipAddress || null,
				userAgent: context?.userAgent || null,
				deviceFingerprint: context?.deviceFingerprint || null
			}),
			...items.map((item, index) =>
				db.insert(schema.orderItems).values({
					id: crypto.randomUUID(),
					orderId,
					productId: stockChanges[index]?.productId ?? null,
					variantId: item.variantId,
					productName: item.name,
					variantName: item.variantName,
					unitPrice: item.price,
					quantity: item.quantity,
					// A landing package price can differ from unit x quantity after rounding.
					subtotal: offer ? offer.subtotal : item.price * item.quantity,
					productImage: item.image
				})
			),
			// The customer finished checkout, so close their abandoned-checkout record.
			db
				.update(schema.orders)
				.set({ isTrashed: true, recoveryStatus: 'converted' })
				.where(
					and(
						eq(schema.orders.customerPhone, data.customerPhone),
						eq(schema.orders.status, 'incomplete')
					)
				),
			...StockService.decrementStatements(db, stockChanges)
		];

		const notes = [
			data.orderNote?.trim(),
			appliedCoupon ? `কুপন: ${appliedCoupon.code}` : ''
		].filter(Boolean);
		if (notes.length > 0) {
			statements.push(
				db.insert(schema.orderNotes).values({
					id: crypto.randomUUID(),
					orderId,
					adminName: 'Customer (Order Note)',
					note: notes.join(' | '),
					callStatus: 'customer_note'
				})
			);
		}

		if (appliedCoupon) {
			statements.push(
				db
					.update(schema.coupons)
					.set({ usageCount: sql`${schema.coupons.usageCount} + 1` })
					.where(eq(schema.coupons.id, appliedCoupon.id))
			);
		}

		try {
			await db.batch(statements as [any, ...any[]]);
		} catch (dbErr) {
			console.error('Failed to persist order to database:', dbErr);
			throw new Error('Order persistence failed');
		}

		// 7. Non-critical follow-ups must never fail an order that is already saved
		const followUps = Promise.all([
			customerId
				? CustomerService.incrementCustomerOrderStats(db, customerId, total).catch((e) =>
						console.error('Customer stats increment failed:', e)
					)
				: Promise.resolve(),
			NotificationService.createNotification(db, {
				title: `নতুন অর্ডার #${orderNumber} প্রাপ্ত হয়েছে`,
				description: `কাস্টমার ${data.customerName} (${data.customerPhone}) ${items.length}টি আইটেম অর্ডার করেছেন। মোট বিল: ৳${total.toLocaleString('en-US')}।`,
				category: 'order',
				link: `/admin/orders/${orderId}`
			}).catch((e) => console.error('Failed to trigger order notification:', e))
		]);
		if (context?.defer) context.defer(followUps);
		else await followUps;

		return {
			orderId,
			orderNumber,
			subtotal,
			deliveryCharge,
			discountAmount,
			total,
			customerName: data.customerName,
			customerPhone: data.customerPhone,
			items
		};
	}

	/**
	 * Retrieves all orders from the database with optional status/trashed filtering
	 */
	static async getAllOrders(db: Db, options?: { isTrashed?: boolean; status?: string }) {
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

	/** Orders for one admin list page, limited on the server to what that page shows. */
	static async listAdminOrders(db: Db, scope: AdminOrderScope) {
		const { orders } = schema;
		const conditions = {
			active: eq(orders.isTrashed, false),
			incomplete: and(eq(orders.isTrashed, false), eq(orders.status, 'incomplete')),
			pre: and(eq(orders.isTrashed, false), or(gte(orders.total, 2500), eq(orders.status, 'pre_order'), eq(orders.source, 'Pre-Order'))),
			trash: or(eq(orders.isTrashed, true), inArray(orders.status, ['cancelled', 'refunded']))
		};

		const rows = await db
			.select()
			.from(orders)
			.where(conditions[scope])
			.orderBy(desc(orders.createdAt))
			.all();

		return rows.map((o) => ({
			...o,
			isTrashed: Boolean(o.isTrashed),
			status: normalizeOrderStatus(o.status)
		}));
	}

	/** Lightweight dashboard query: only the columns the UI reads, capped at 500 rows. */
	static async listDashboardOrders(db: Db) {
		const rows = await db
			.select({
				id: schema.orders.id,
				orderNumber: schema.orders.orderNumber,
				status: schema.orders.status,
				total: schema.orders.total,
				createdAt: schema.orders.createdAt,
				customerName: schema.orders.customerName,
				customerPhone: schema.orders.customerPhone,
				customerEmail: schema.orders.customerEmail,
				shippingAddress: schema.orders.shippingAddress,
				deliveryArea: schema.orders.deliveryArea,
				isTrashed: schema.orders.isTrashed
			})
			.from(schema.orders)
			.orderBy(desc(schema.orders.createdAt))
			.limit(500)
			.all();
		return rows.map((o) => ({ ...o, status: normalizeOrderStatus(o.status) }));
	}

	/** Lightweight index for matching a phone number's past orders while creating an order. */
	static async listOrderHistoryIndex(db: Db) {
		return await db
			.select({
				id: schema.orders.id,
				status: schema.orders.status,
				total: schema.orders.total,
				createdAt: schema.orders.createdAt,
				customerPhone: schema.orders.customerPhone,
				customerEmail: schema.orders.customerEmail
			})
			.from(schema.orders)
			.where(eq(schema.orders.isTrashed, false))
			.orderBy(desc(schema.orders.createdAt))
			.limit(500)
			.all();
	}

	static async listCustomerOrderHistory(
		db: Db,
		identifier: { email?: string | null; phone?: string | null } | string,
		excludeOrderId?: string
	) {
		let email: string | null = null;
		let phone: string | null = null;

		if (typeof identifier === 'string') {
			email = identifier;
		} else if (identifier) {
			email = identifier.email || null;
			phone = identifier.phone || null;
		}

		const matchConditions: any[] = [];
		if (phone && phone.trim()) {
			matchConditions.push(eq(schema.orders.customerPhone, phone.trim()));
		}
		if (email && email.trim()) {
			matchConditions.push(eq(schema.orders.customerEmail, email.trim()));
		}

		if (matchConditions.length === 0) {
			return [];
		}

		const whereClause = excludeOrderId
			? and(or(...matchConditions), ne(schema.orders.id, excludeOrderId))
			: or(...matchConditions);

		return await db
			.select({
				id: schema.orders.id,
				orderNumber: schema.orders.orderNumber,
				status: schema.orders.status,
				total: schema.orders.total,
				createdAt: schema.orders.createdAt
			})
			.from(schema.orders)
			.where(whereClause)
			.orderBy(desc(schema.orders.createdAt))
			.limit(50)
			.all();
	}

	/**
	 * Retrieves an order by its ID or human-readable order number. Admin use only:
	 * the result contains customer details.
	 */
	static async getOrderById(db: Db, idOrNumber: string, options?: { includeTrashed?: boolean }) {
		const clean = (idOrNumber || '').trim();
		const withoutHash = clean.replace(/^#/, '');

		const order = await db
			.select()
			.from(schema.orders)
			.where(
				and(
					or(
						eq(schema.orders.id, clean),
						eq(schema.orders.orderNumber, clean),
						eq(schema.orders.orderNumber, withoutHash)
					),
					options?.includeTrashed ? undefined : eq(schema.orders.isTrashed, false)
				)
			)
			.get();

		if (!order) return null;

		const [items, notes] = await Promise.all([
			db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id)),
			db
				.select()
				.from(schema.orderNotes)
				.where(eq(schema.orderNotes.orderId, order.id))
				.orderBy(desc(schema.orderNotes.createdAt))
		]);

		return { ...order, itemsList: items, notesList: notes };
	}

	/**
	 * Confirmation page data. The lookup is by the unguessable order UUID only, and the
	 * result leaves out every customer detail.
	 */
	static async getPublicOrderSummary(db: Db, orderId: string) {
		return (
			(await db
				.select({
					orderNumber: schema.orders.orderNumber,
					items: schema.orders.items,
					subtotal: schema.orders.subtotal,
					deliveryCharge: schema.orders.deliveryCharge,
					discountAmount: schema.orders.discountAmount,
					total: schema.orders.total,
					status: schema.orders.status,
					paymentStatus: schema.orders.paymentStatus
				})
				.from(schema.orders)
				.where(and(eq(schema.orders.id, orderId), eq(schema.orders.isTrashed, false)))
				.get()) ?? null
		);
	}

	/**
	 * Public order tracking. Needs both the order number and the matching phone number,
	 * because order numbers are sequential and easy to guess.
	 */
	static async trackPublicOrder(db: Db, orderNumber: string, phone: string) {
		const number = orderNumber.trim().replace(/^#/, '');
		const normalizedPhone = normalizeBdPhone(phone);
		if (!number || !normalizedPhone) return null;

		const order = await db
			.select({
				id: schema.orders.id,
				orderNumber: schema.orders.orderNumber,
				status: schema.orders.status,
				createdAt: schema.orders.createdAt,
				total: schema.orders.total,
				courierProvider: schema.orders.courierProvider,
				trackingCode: schema.orders.trackingCode
			})
			.from(schema.orders)
			.where(
				and(
					or(eq(schema.orders.orderNumber, number), eq(schema.orders.orderNumber, `#${number}`)),
					eq(schema.orders.customerPhone, normalizedPhone),
					eq(schema.orders.isTrashed, false)
				)
			)
			.orderBy(desc(schema.orders.createdAt))
			.limit(1)
			.get();

		if (!order) return null;

		const items = await db
			.select({
				name: schema.orderItems.productName,
				quantity: schema.orderItems.quantity,
				price: schema.orderItems.unitPrice
			})
			.from(schema.orderItems)
			.where(eq(schema.orderItems.orderId, order.id))
			.all();

		const { id: _id, ...publicOrder } = order;
		return { ...publicOrder, items };
	}

	/**
	 * Updates order lifecycle status and registers an admin audit note
	 */
	static async updateOrderStatus(db: Db, input: UpdateOrderStatusInput, actorName = 'Admin Staff') {
		const order = await db
			.select()
			.from(schema.orders)
			.where(eq(schema.orders.id, input.orderId))
			.get();

		if (!order) {
			throw new Error('অর্ডার পাওয়া যায়নি');
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

		await StockService.syncForStatusChange(db, order, input.status);
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
