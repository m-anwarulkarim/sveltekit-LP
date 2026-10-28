import { z } from 'zod';
import { normalizeBdPhone, isValidBdPhone } from '../utils/phone';

/**
 * Single Cart / Order Item Schema
 */
export const checkoutOrderItemSchema = z.object({
	id: z.string().min(1, 'পণ্য আইডি আবশ্যক'),
	name: z.string().min(1, 'পণ্যের নাম আবশ্যক'),
	price: z.number().int().nonnegative('মূল্য অকার্যকর হতে পারে না'),
	quantity: z.number().int().positive('পরিমাণ অন্তত ১ হতে হবে'),
	variantId: z.string().optional().nullable(),
	variantName: z.string().optional().nullable(),
	image: z.string().optional().nullable()
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

	customerPhone: z
		.string()
		.trim()
		.transform((val) => normalizeBdPhone(val))
		.refine((val) => isValidBdPhone(val), {
			message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
		}),

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

	deliveryArea: z.enum(['inside_dhaka', 'outside_dhaka']).default('inside_dhaka'),

	paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'card']).default('cod'),

	orderNote: z.string().max(500, 'নোট ৫০০ অক্ষরের মধ্যে রাখুন').optional().nullable(),

	items: z
		.array(checkoutOrderItemSchema)
		.min(1, 'অর্ডার করতে আপনার কার্টে অন্তত একটি পণ্য যোগ করুন'),

	// Honeypot field: invisible in UI, filled only by automated spam bots
	website_url: z.string().optional().nullable()
});

export type CheckoutOrderItemInput = z.infer<typeof checkoutOrderItemSchema>;
export type CheckoutOrderInput = z.infer<typeof checkoutOrderSchema>;

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

