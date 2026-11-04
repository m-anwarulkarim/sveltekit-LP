import { fail } from '@sveltejs/kit';
import { ProductValidationError } from '../validations/product.validation';

/**
 * Turns a thrown error into a form-action failure. A problem the admin can fix keeps its
 * message; anything else is logged and shown as a generic line so internals never leak.
 */
export function productActionError(error: unknown, fallback: string, context: string) {
	if (error instanceof ProductValidationError) {
		return fail(400, { message: error.message });
	}
	console.error(`${context}:`, error);
	return fail(500, { message: fallback });
}

/** Reads the JSON the product form sends in a single `productData` field. */
export function readProductPayload(formData: FormData): unknown {
	const raw = formData.get('productData')?.toString();
	if (!raw) throw new ProductValidationError('প্রোডাক্টের তথ্য পাওয়া যায়নি');
	try {
		return JSON.parse(raw);
	} catch {
		throw new ProductValidationError('প্রোডাক্টের তথ্যের ফরম্যাট সঠিক নয়');
	}
}

/** Reads a JSON array of ids from a form field. */
export function readIdList(formData: FormData, field: string): string[] {
	try {
		const parsed = JSON.parse(formData.get(field)?.toString() || '[]');
		return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
	} catch {
		return [];
	}
}
