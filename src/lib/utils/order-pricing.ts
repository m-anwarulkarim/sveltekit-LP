/**
 * Pricing rules shared by the storefront (what the customer sees) and the server
 * (what is actually charged), so the two can never drift apart.
 */

export const PRODUCT_BUNDLES = [
	{
		id: 'standard',
		name: 'Standard Edition',
		subtitle: '১টি একক প্যাক',
		multiplier: 1,
		discount: 0
	},
	{
		id: 'combo',
		name: 'Combo Value Pack (Save 10%)',
		subtitle: '২টি প্যাক • ১০% অতিরিক্ত ছাড়',
		multiplier: 2,
		discount: 0.1
	},
	{
		id: 'pro-duo',
		name: 'Pro Duo Bundle (Save 15%)',
		subtitle: 'সেরা ভ্যালু কম্বো • ১৫% ছাড়',
		multiplier: 2,
		discount: 0.15
	}
] as const;

export type ProductBundle = (typeof PRODUCT_BUNDLES)[number];

/** Cart lines for a bundle use the id `<productId>-<bundleId>`. */
export function parseCartItemId(cartItemId: string): { productId: string; bundle: ProductBundle } {
	for (const bundle of PRODUCT_BUNDLES) {
		if (bundle.id !== 'standard' && cartItemId.endsWith(`-${bundle.id}`)) {
			return { productId: cartItemId.slice(0, -(bundle.id.length + 1)), bundle };
		}
	}
	return { productId: cartItemId, bundle: PRODUCT_BUNDLES[0] };
}

export function getBundlePrice(basePrice: number, bundle: ProductBundle): number {
	const price = basePrice * bundle.multiplier;
	return bundle.discount > 0 ? Math.round(price * (1 - bundle.discount)) : price;
}

export type DeliveryArea = 'inside_dhaka' | 'outside_dhaka' | 'sub_area';

export interface DeliveryRules {
	subtotal: number;
	area: DeliveryArea;
	store?: {
		insideDhakaCharge?: number;
		outsideDhakaCharge?: number;
		subAreaCharge?: number;
		enableFreeDelivery?: boolean;
		freeShippingThreshold?: number;
	} | null;
	productSettings?: { enableDeliveryCharge?: boolean; productType?: string } | null;
	hasFreeDeliveryOffer?: boolean;
}

export function computeDeliveryCharge(rules: DeliveryRules): number {
	const { subtotal, area, store, productSettings, hasFreeDeliveryOffer } = rules;
	if (productSettings?.enableDeliveryCharge === false) return 0;
	if (productSettings?.productType === 'digital') return 0;
	if (subtotal === 0 || hasFreeDeliveryOffer) return 0;
	if (store?.enableFreeDelivery && subtotal >= (store.freeShippingThreshold || 2000)) return 0;
	if (area === 'inside_dhaka') return store?.insideDhakaCharge ?? 60;
	if (area === 'sub_area') return store?.subAreaCharge ?? 100;
	return store?.outsideDhakaCharge ?? 120;
}

/** Offer discounts are stored as text: "5%" or a flat amount such as "50". */
export function computeOfferDiscount(discount: string | number | null | undefined, subtotal: number): number {
	const value = String(discount ?? '').trim();
	if (!value) return 0;
	const amount = parseFloat(value) || 0;
	if (value.endsWith('%')) return Math.round((subtotal * amount) / 100);
	return Math.min(subtotal, amount);
}

export interface CouponTerms {
	discountType: string;
	discountValue: number;
	minOrderAmount?: number | null;
	maxDiscountAmount?: number | null;
}

export function computeCouponDiscount(coupon: CouponTerms | null | undefined, subtotal: number): number {
	if (!coupon || subtotal < (coupon.minOrderAmount || 0)) return 0;
	const raw =
		coupon.discountType === 'fixed'
			? coupon.discountValue
			: Math.round((subtotal * coupon.discountValue) / 100);
	const capped = coupon.maxDiscountAmount ? Math.min(raw, coupon.maxDiscountAmount) : raw;
	return Math.min(subtotal, Math.max(0, capped));
}

/** Delivery and package rules for each landing page template. */
export interface LandingPackage {
	qty?: number;
	price?: number;
	title?: string;
	deliveryFee?: number;
	freeDelivery?: boolean;
}

export interface LandingOffer {
	unitPrice: number;
	quantity: number;
	subtotal: number;
	deliveryCharge: number;
	packageTitle: string | null;
}

export function resolveLandingOffer(input: {
	template?: string | null;
	customPrice?: number | null;
	productPrice?: number | null;
	packages?: LandingPackage[] | null;
	packageIndex?: number | null;
	quantity?: number | null;
	deliveryArea?: 'inside_dhaka' | 'outside_dhaka';
}): LandingOffer {
	const template = input.template || 'style_1_animated';
	const packages = Array.isArray(input.packages) ? input.packages : [];
	const index = Number.isInteger(input.packageIndex) ? Number(input.packageIndex) : -1;
	const pkg = index >= 0 && index < packages.length ? packages[index] : null;
	const quantity = Math.min(Math.max(1, Math.floor(Number(input.quantity) || 1)), 100);
	const isOutside = input.deliveryArea === 'outside_dhaka';

	if (template === 'style_2_direct') {
		const base = Number(input.customPrice) || Number(input.productPrice) || 200;
		if (!pkg) {
			return { unitPrice: base, quantity: 1, subtotal: base, deliveryCharge: base > 0 ? 45 : 0, packageTitle: null };
		}
		const position = index + 1;
		const packageQty = Number(pkg.qty) || position;
		const subtotal = Number(pkg.price) || base * position;
		const deliveryCharge = pkg.freeDelivery ? 0 : Number(pkg.deliveryFee) || (index === 0 ? 45 : 0);
		return {
			unitPrice: Math.round(subtotal / packageQty),
			quantity: packageQty,
			subtotal,
			deliveryCharge,
			packageTitle: pkg.title || `${position}টি প্যাকেট`
		};
	}

	if (template === 'style_3_lighthouse') {
		const base = Number(input.customPrice) || Number(input.productPrice) || 350;
		const unitPrice = pkg ? Number(pkg.price) || base * (index + 1) : base;
		const isFree = pkg ? Boolean(pkg.freeDelivery || index > 0) : false;
		return {
			unitPrice,
			quantity,
			subtotal: unitPrice * quantity,
			deliveryCharge: isFree ? 0 : isOutside ? 120 : 70,
			packageTitle: pkg ? pkg.title || `${index + 1} পিস কম্বো প্যাক` : null
		};
	}

	const unitPrice = Number(input.customPrice) || Number(input.productPrice) || 1200;
	return {
		unitPrice,
		quantity,
		subtotal: unitPrice * quantity,
		deliveryCharge: isOutside ? 120 : 60,
		packageTitle: null
	};
}
