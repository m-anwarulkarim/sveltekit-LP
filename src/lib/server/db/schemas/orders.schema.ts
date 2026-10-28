import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { customers } from './customers.schema';
import { products, productVariants } from './products.schema';

// 1. Orders Table (Full Admin Orders + Storefront Support)
export const orders = sqliteTable(
	'orders',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		orderNumber: text('order_number'), // e.g. #AUR-87472 or INV-1229
		customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
		userId: text('user_id'), // Link to Better Auth user if logged in

		// Customer Details Snapshot
		customerName: text('customer_name').notNull(),
		customerEmail: text('customer_email').notNull(),
		customerPhone: text('customer_phone'),
		alternatePhone: text('alternate_phone'),
		shippingAddress: text('shipping_address').notNull(),
		deliveryArea: text('delivery_area').default('inside_dhaka'), // 'inside_dhaka' | 'outside_dhaka'

		// Financials
		subtotal: integer('subtotal').default(0),
		deliveryCharge: integer('delivery_charge').notNull().default(0),
		discountAmount: integer('discount_amount').notNull().default(0),
		advancePayment: integer('advance_payment').notNull().default(0),
		dueAmount: integer('due_amount').default(0),
		total: integer('total').notNull(),
		paymentMethod: text('payment_method').notNull().default('cod'), // 'cod' | 'bkash' | 'nagad' | 'card'
		paymentStatus: text('payment_status').notNull().default('pending'),

		// Order Lifecycle Status
		status: text('status').notNull().default('pending'),
		// 'pending' | 'incomplete' | 'no_response' | 'busy' | 'good_busy' | 'hold' | 'recall' |
		// 'processing' | 'confirmed' | 'printed' | 'entry_done' | 'partial_delivered' | 'delivered' | 'cancelled' | 'returned'
		orderType: text('order_type').notNull().default('web'), // 'web' | 'manual' | 'landing_page' | 'pre_order'

		// Drop-off Lead Recovery Tracking
		dropOffStage: text('drop_off_stage'),
		recoveryStatus: text('recovery_status'), // 'called' | 'whatsapp_sent' | 'followup' | 'converted'

		// Courier & Shipping Details
		courierProvider: text('courier_provider'), // 'Steadfast' | 'Pathao' | 'REDX'
		trackingCode: text('tracking_code'),
		consignmentId: text('consignment_id'),
		courierStatus: text('courier_status'),
		courierCost: integer('courier_cost').default(0),
		packagingCost: integer('packaging_cost').default(0),

		// Items JSON string for backwards compatibility
		items: text('items').notNull(),

		// Traffic Attribution & Fraud Detection
		source: text('source').default('Direct'),
		landingPageId: text('landing_page_id'),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		deviceFingerprint: text('device_fingerprint'),

		// Admin Operations & Soft Delete
		assignedAdminId: text('assigned_admin_id'),
		isTrashed: integer('is_trashed', { mode: 'boolean' }).notNull().default(false),

		// Timestamps
		confirmedAt: integer('confirmed_at', { mode: 'timestamp_ms' }),
		shippedAt: integer('shipped_at', { mode: 'timestamp_ms' }),
		deliveredAt: integer('delivered_at', { mode: 'timestamp_ms' }),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index('orders_number_idx').on(table.orderNumber),
		index('orders_customer_phone_idx').on(table.customerPhone),
		index('orders_status_created_idx').on(table.status, table.createdAt),
		index('orders_type_status_idx').on(table.orderType, table.status),
		index('orders_trashed_status_idx').on(table.isTrashed, table.status),
		index('orders_tracking_idx').on(table.trackingCode),
		index('orders_created_idx').on(table.createdAt)
	]
);

// 2. Normalized Order Items Table
export const orderItems = sqliteTable(
	'order_items',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		orderId: text('order_id')
			.notNull()
			.references(() => orders.id, { onDelete: 'cascade' }),
		productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
		variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
		productName: text('product_name').notNull(),
		variantName: text('variant_name'),
		unitPrice: integer('unit_price').notNull(),
		costPrice: integer('cost_price'),
		quantity: integer('quantity').notNull().default(1),
		subtotal: integer('subtotal').notNull(),
		productImage: text('product_image')
	},
	(table) => [
		index('order_items_order_idx').on(table.orderId),
		index('order_items_product_idx').on(table.productId)
	]
);

// 3. Order Call Notes & Merchant History Table
export const orderNotes = sqliteTable(
	'order_notes',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		orderId: text('order_id')
			.notNull()
			.references(() => orders.id, { onDelete: 'cascade' }),
		adminUserId: text('admin_user_id'),
		adminName: text('admin_name').notNull().default('Admin Staff'),
		note: text('note').notNull(),
		callStatus: text('call_status'), // 'call_received' | 'not_answering' | 'busy' | 'switched_off' | 'customer_note'
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [index('order_notes_order_created_idx').on(table.orderId, table.createdAt)]
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderNote = typeof orderNotes.$inferSelect;
export type NewOrderNote = typeof orderNotes.$inferInsert;
