import { slugify } from '#lib/utils/slug';
import type { CreateLandingInput, Style2Package } from '../services/landing-page.service';

export const LANDING_TEMPLATES = ['style_1_animated', 'style_2_direct', 'style_3_lighthouse'] as const;
export const LANDING_STATUSES = ['Published', 'Draft'] as const;

const MAX_PACKAGES = 3;
const MAX_IMAGES = 20;
const MAX_BULLETS = 10;
const MAX_REVIEWS = 6;
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{5,18}$/;

export type LandingFormResult =
	| { ok: true; data: CreateLandingInput }
	| { ok: false; message: string };

function str(formData: FormData, key: string, max: number): string {
	return (formData.get(key)?.toString() ?? '').trim().slice(0, max);
}

/** Empty means "not set"; anything else must be a finite, non-negative number. */
function optionalMoney(raw: string): number | undefined | null {
	if (raw === '') return undefined;
	const value = Number(raw);
	return Number.isFinite(value) && value >= 0 ? value : null;
}

function parseJsonArray(raw: string): unknown[] {
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function parsePackages(raw: string): Style2Package[] | string {
	const items = parseJsonArray(raw).slice(0, MAX_PACKAGES);
	const packages: Style2Package[] = [];

	for (let i = 0; i < items.length; i++) {
		const item = items[i] as Record<string, unknown>;
		const label = `প্যাকেজ ${i + 1}`;
		const title = String(item?.title ?? '').trim().slice(0, 60);
		const price = Number(item?.price);
		const originalPrice = item?.originalPrice === '' || item?.originalPrice == null ? undefined : Number(item.originalPrice);
		const deliveryFee = item?.deliveryFee === '' || item?.deliveryFee == null ? 0 : Number(item.deliveryFee);

		if (!title) return `${label} এর নাম লিখুন`;
		if (!Number.isFinite(price) || price <= 0) return `${label} এর অফার মূল্য সঠিক নয়`;
		if (originalPrice !== undefined && (!Number.isFinite(originalPrice) || originalPrice < 0)) {
			return `${label} এর রেগুলার মূল্য সঠিক নয়`;
		}
		if (!Number.isFinite(deliveryFee) || deliveryFee < 0) return `${label} এর ডেলিভারি চার্জ সঠিক নয়`;

		const qty = Number(item?.qty);
		packages.push({
			id: String(item?.id ?? `pack_${i + 1}`).slice(0, 40),
			title,
			subtitle: String(item?.subtitle ?? '').trim().slice(0, 80),
			freeGift: String(item?.freeGift ?? '').trim().slice(0, 80),
			tag: String(item?.tag ?? '').trim().slice(0, 60),
			price,
			originalPrice,
			deliveryFee,
			freeDelivery: Boolean(item?.freeDelivery),
			popular: Boolean(item?.popular),
			...(Number.isInteger(qty) && qty > 0 && qty <= 100 ? { qty } : {})
		});
	}

	return packages;
}

export interface LandingReview {
	name: string;
	location: string;
	text: string;
	rating: number;
	badge: string;
}

function parseReviews(raw: string): LandingReview[] {
	const items = parseJsonArray(raw).slice(0, MAX_REVIEWS);
	const reviews: LandingReview[] = [];
	for (const item of items) {
		const r = item as Record<string, unknown>;
		const name = String(r?.name ?? '').trim().slice(0, 60);
		const text = String(r?.text ?? '').trim().slice(0, 500);
		if (!name || !text) continue;
		const rating = Number(r?.rating);
		reviews.push({
			name,
			location: String(r?.location ?? '').trim().slice(0, 60),
			text,
			rating: Number.isFinite(rating) && rating >= 1 && rating <= 5 ? Math.round(rating) : 5,
			badge: String(r?.badge ?? '').trim().slice(0, 40)
		});
	}
	return reviews;
}

function parseImages(raw: string): string[] {
	const seen = new Set<string>();
	for (const entry of parseJsonArray(raw)) {
		if (typeof entry !== 'string') continue;
		const url = entry.trim();
		if (url.length > 2000) continue;
		if (/^https?:\/\//i.test(url) || (url.startsWith('/') && !url.startsWith('//'))) seen.add(url);
		if (seen.size >= MAX_IMAGES) break;
	}
	return [...seen];
}

/**
 * Reads the landing page form once, for both create and update. Text is trimmed and capped,
 * enum fields are checked against a whitelist, and numbers must be real numbers.
 */
export function parseLandingPageForm(formData: FormData): LandingFormResult {
	const title = str(formData, 'title', 200);
	if (!title) return { ok: false, message: 'ল্যান্ডিং পেজের শিরোনাম লিখুন' };

	const slug = slugify(str(formData, 'slug', 200)) || slugify(title) || `offer-${Date.now()}`;

	const template = str(formData, 'template', 40) || 'style_1_animated';
	if (!(LANDING_TEMPLATES as readonly string[]).includes(template)) {
		return { ok: false, message: 'টেমপ্লেট সঠিক নয়' };
	}

	const status = str(formData, 'status', 20) || 'Published';
	if (!(LANDING_STATUSES as readonly string[]).includes(status)) {
		return { ok: false, message: 'পাবলিশ স্ট্যাটাস সঠিক নয়' };
	}

	const customPrice = optionalMoney(str(formData, 'customPrice', 20));
	if (customPrice === null) return { ok: false, message: 'অফার প্রাইস সঠিক নয়' };
	const customOriginalPrice = optionalMoney(str(formData, 'customOriginalPrice', 20));
	if (customOriginalPrice === null) return { ok: false, message: 'রেগুলার প্রাইস সঠিক নয়' };

	const countdownRaw = Number(formData.get('countdownMinutes'));
	const countdownMinutes = Number.isFinite(countdownRaw) && countdownRaw > 0
		? Math.min(1440, Math.max(5, Math.round(countdownRaw)))
		: 35;

	const packages = parsePackages(formData.get('packages')?.toString() ?? '[]');
	if (typeof packages === 'string') return { ok: false, message: packages };

	const contactPhone = str(formData, 'contactPhone', 20);
	if (contactPhone && !PHONE_PATTERN.test(contactPhone)) {
		return { ok: false, message: 'হটলাইন নম্বর সঠিক নয়' };
	}

	const bulletPoints = (formData.get('bulletPoints')?.toString() ?? '')
		.split('\n')
		.map((line) => line.trim().slice(0, 200))
		.filter(Boolean)
		.slice(0, MAX_BULLETS);

	const tag = str(formData, 'tag', 60) || 'স্পেশাল অফার';

	return {
		ok: true,
		data: {
			title,
			slug,
			productId: str(formData, 'productId', 64) || null,
			tag,
			template,
			status: status as 'Published' | 'Draft',
			headline: str(formData, 'headline', 200) || title,
			subheadline: str(formData, 'subheadline', 600),
			offerBadge: str(formData, 'offerBadge', 100) || tag,
			countdownMinutes,
			customPrice,
			customOriginalPrice,
			bulletPoints: bulletPoints.length > 0 ? bulletPoints : undefined,
			packages,
			trustBox1Title: str(formData, 'trustBox1Title', 120) || undefined,
			trustBox1Desc: str(formData, 'trustBox1Desc', 400) || undefined,
			trustBox2Title: str(formData, 'trustBox2Title', 120) || undefined,
			trustBox2Desc: str(formData, 'trustBox2Desc', 400) || undefined,
			contactPhone: contactPhone || undefined,
			galleryImages: parseImages(formData.get('galleryImages')?.toString() ?? '[]'),
			reviews: parseReviews(formData.get('reviews')?.toString() ?? '[]')
		}
	};
}
