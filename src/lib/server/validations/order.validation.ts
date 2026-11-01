import { z } from 'zod';
import { normalizeBdPhone, isValidBdPhone } from '../utils/phone';

/**
 * Single Cart / Order Item Schema.
 * Only the product, variant and quantity are trusted from the browser. Name and price
 * are always re-read from the database.
 */
export const checkoutOrderItemSchema = z.object({
	id: z.string().min(1, 'পণ্য আইডি আবশ্যক').max(200),
	quantity: z.number().int().positive('পরিমাণ অন্তত ১ হতে হবে').max(100, 'একসাথে সর্বোচ্চ ১০০টি অর্ডার করা যাবে'),
	variantId: z.string().max(200).optional().nullable()
});

const phoneField = z
	.string()
	.trim()
	.transform((val) => normalizeBdPhone(val))
	.refine((val) => isValidBdPhone(val), {
		message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
	});

/**
 * Public Web Checkout Form Schema
 */
export const checkoutOrderSchema = z.object({
	customerName: z
		.string()
		.trim()
		.min(2, 'আপনার সম্পূর্ণ নাম দিন (কমপক্ষে ২ অক্ষর)')
		.max(100, 'নাম ১০০ অক্ষরের মধ্যে হতে হবে'),

	customerPhone: phoneField,

	alternatePhone: z
		.string()
		.optional()
		.nullable()
		.transform((val) => (val ? normalizeBdPhone(val) : ''))
		.refine((val) => !val || isValidBdPhone(val), {
			message: 'বিকল্প নম্বরটি সঠিক ১১ ডিজিটের হতে হবে'
		}),

	shippingAddress: z
		.string()
		.trim()
		.min(5, 'বিস্তারিত ডেলিভারি ঠিকানা দিন (বাসা/হোল্ডিং নং, রোড, এলাকা)')
		.max(300, 'ঠিকানা ৩০০ অক্ষরের মধ্যে রাখুন'),

	deliveryArea: z.enum(['inside_dhaka', 'outside_dhaka', 'sub_area']).default('inside_dhaka'),

	paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'card']).default('cod'),

	orderNote: z.string().max(1000, 'নোট ১০০০ অক্ষরের মধ্যে রাখুন').optional().nullable(),

	couponCode: z.string().trim().max(50).optional().nullable(),

	// The total the customer saw. A mismatch stops the order instead of charging a surprise.
	expectedTotal: z.number().int().nonnegative().optional().nullable(),

	items: z
		.array(checkoutOrderItemSchema)
		.min(1, 'অর্ডার করতে আপনার কার্টে অন্তত একটি পণ্য যোগ করুন')
		.max(50, 'একটি অর্ডারে সর্বোচ্চ ৫০টি পণ্য রাখা যাবে'),

	// Honeypot field: invisible in UI, filled only by automated spam bots
	website_url: z.string().optional().nullable()
});

export type CheckoutOrderItemInput = z.infer<typeof checkoutOrderItemSchema>;
export type CheckoutOrderInput = z.infer<typeof checkoutOrderSchema>;

/** Abandoned checkout capture: everything except the phone number is optional. */
export const incompleteOrderSchema = z.object({
	customerPhone: phoneField,
	customerName: z.string().trim().max(100).optional().nullable(),
	shippingAddress: z.string().trim().max(300).optional().nullable(),
	deliveryArea: z.enum(['inside_dhaka', 'outside_dhaka', 'sub_area']).optional().nullable(),
	source: z.string().trim().max(200).optional().nullable(),
	subtotal: z.number().nonnegative().max(100_000_000).optional().nullable(),
	deliveryCharge: z.number().nonnegative().max(100_000).optional().nullable(),
	total: z.number().nonnegative().max(100_000_000).optional().nullable(),
	items: z
		.array(
			z.object({
				id: z.string().max(200).optional().nullable(),
				productId: z.string().max(200).optional().nullable(),
				name: z.string().max(300).optional().nullable(),
				price: z.number().nonnegative().max(100_000_000).optional().nullable(),
				quantity: z.number().int().positive().max(100).optional().nullable(),
				image: z.string().max(2000).optional().nullable()
			})
		)
		.max(50)
		.optional()
		.nullable()
});

/**
 * Order Status Update Schema (Admin Panel)
 */
export const updateOrderStatusSchema = z.object({
	orderId: z.string().min(1, 'Order ID আবশ্যক'),
	status: z.enum([
		'pending',
		'confirmed',
		'processing',
		'hold',
		'shipped',
		'delivered',
		'cancelled',
		'returned',
		'incomplete'
	]),
	note: z.string().max(500).optional().nullable(),
	callStatus: z
		.enum(['call_received', 'not_answering', 'busy', 'switched_off', 'customer_note'])
		.optional()
		.nullable()
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
