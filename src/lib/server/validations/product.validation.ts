import { z } from 'zod';

/** A product problem the admin can fix. Its message is safe to show them. */
export class ProductValidationError extends Error {}

const money = (label: string) =>
	z.coerce
		.number({ error: `${label} সঠিক সংখ্যা হতে হবে` })
		.min(0, `${label} ঋণাত্মক হতে পারে না`)
		.max(100_000_000, `${label} অনেক বড় হয়ে গেছে`)
		.transform((n) => Math.round(n));

const quantity = (label: string) =>
	z.coerce
		.number({ error: `${label} সঠিক সংখ্যা হতে হবে` })
		.min(0, `${label} ঋণাত্মক হতে পারে না`)
		.max(10_000_000, `${label} অনেক বড় হয়ে গেছে`)
		.transform((n) => Math.floor(n));

const text = (label: string, max: number) =>
	z.string().trim().max(max, `${label} সর্বোচ্চ ${max} অক্ষরের হতে পারে`);

// A pasted base64 picture would bloat the database row, so only real addresses are accepted.
const imageUrl = z
	.string()
	.trim()
	.max(2000, 'ছবির ঠিকানা অনেক বড়')
	.refine((u) => !u.startsWith('data:'), 'ছবি আপলোড সম্পূর্ণ হয়নি। ছবিটি আবার আপলোড করুন।')
	.refine(
		(u) => /^https?:\/\//i.test(u) || (u.startsWith('/') && !u.startsWith('//')),
		'ছবির ঠিকানা সঠিক নয়'
	);
const optionalImageUrl = z.union([z.literal(''), imageUrl]);

const specificationSchema = z.object({
	key: text('স্পেসিফিকেশনের নাম', 100),
	value: text('স্পেসিফিকেশনের মান', 500)
});

const variantSchema = z.object({
	id: z.string().max(100).nullish(),
	name: text('ভ্যারিয়েন্টের নাম', 100),
	stock: quantity('ভ্যারিয়েন্টের স্টক').default(0),
	openingStock: quantity('ভ্যারিয়েন্টের ওপেনিং স্টক').nullish(),
	sku: text('ভ্যারিয়েন্ট SKU', 80).nullish(),
	price: money('ভ্যারিয়েন্টের দাম').nullish(),
	image: optionalImageUrl.nullish()
});

export const productInputSchema = z
	.object({
		name: z
			.string({ error: 'প্রোডাক্টের নাম আবশ্যক' })
			.trim()
			.min(1, 'প্রোডাক্টের নাম আবশ্যক')
			.max(200, 'প্রোডাক্টের নাম সর্বোচ্চ ২০০ অক্ষরের হতে পারে'),
		slug: text('Slug', 160).nullish(),
		tagline: text('ট্যাগলাইন', 300).nullish(),
		price: money('বিক্রয় মূল্য').refine((n) => n > 0, 'বিক্রয় মূল্য ০ এর বেশি হতে হবে'),
		originalPrice: money('রেগুলার মূল্য').nullish(),
		costPrice: money('ক্রয় মূল্য').nullish(),
		/** Current stock. Sent only when the admin really changed it. */
		stock: quantity('স্টক').nullish(),
		openingStock: quantity('ওপেনিং স্টক').nullish(),
		lowStockQty: quantity('লো স্টক সংখ্যা').nullish(),
		sku: text('SKU', 80).nullish(),
		model: text('মডেল', 120).nullish(),
		badge: text('ব্যাজ', 40).nullish(),
		category: text('ক্যাটাগরি', 120).nullish(),
		subCategory: text('সাব-ক্যাটাগরি', 120).nullish(),
		childCategory: text('চাইল্ড-ক্যাটাগরি', 120).nullish(),
		brand: text('ব্র্যান্ড', 120).nullish(),
		status: z.enum(['published', 'draft', 'archived']).default('published'),
		isPreOrder: z.boolean().nullish(),
		isWholesale: z.boolean().nullish(),
		enableBundle: z.boolean().nullish(),
		bundleUnitLabel: text('বান্ডেল ইউনিট', 20).nullish(),
		enableProcessing: z.boolean().nullish(),
		urgencyMessage: text('জরুরি বার্তা', 300).nullish(),
		processingOptions: z.array(text('Processing অপশন', 100).min(1)).max(20).nullish(),
		image: z
			.string({ error: 'কমপক্ষে একটি ছবি দিন' })
			.trim()
			.min(1, 'কমপক্ষে একটি ছবি দিন')
			.pipe(imageUrl),
		images: z.array(imageUrl).max(20, 'সর্বোচ্চ ২০টি ছবি দেওয়া যাবে').nullish(),
		sizeChartImage: optionalImageUrl.nullish(),
		description: z.string().max(50_000, 'বিবরণ অনেক বড় হয়ে গেছে').nullish(),
		returnPolicy: z.string().max(5000, 'রিটার্ন পলিসি অনেক বড় হয়ে গেছে').nullish(),
		seoTitle: text('SEO টাইটেল', 200).nullish(),
		seoDescription: text('SEO বিবরণ', 500).nullish(),
		seoKeywords: text('SEO কিওয়ার্ড', 500).nullish(),
		specifications: z
			.array(specificationSchema)
			.max(50, 'সর্বোচ্চ ৫০টি স্পেসিফিকেশন দেওয়া যাবে')
			.transform((rows) => rows.filter((r) => r.key || r.value))
			.refine((rows) => rows.every((r) => r.key), 'স্পেসিফিকেশনের নাম ফাঁকা রাখা যাবে না')
			.optional(),
		variants: z
			.array(variantSchema)
			.max(50, 'সর্বোচ্চ ৫০টি ভ্যারিয়েন্ট দেওয়া যাবে')
			.refine((rows) => rows.every((r) => r.name), 'ভ্যারিয়েন্টের নাম ফাঁকা রাখা যাবে না')
			.optional()
	})
	.refine((d) => !d.originalPrice || d.originalPrice >= d.price, {
		path: ['originalPrice'],
		message: 'রেগুলার মূল্য বিক্রয় মূল্যের কম হতে পারে না'
	});

export type ProductInput = z.output<typeof productInputSchema>;

export function parseProductInput(raw: unknown): ProductInput {
	const result = productInputSchema.safeParse(raw);
	if (!result.success) {
		throw new ProductValidationError(result.error.issues[0]?.message || 'প্রোডাক্টের তথ্য সঠিক নয়');
	}
	return result.data;
}
