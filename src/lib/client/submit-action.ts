import { deserialize } from '$app/forms';

export type SubmitActionResult =
	| { ok: true; data: Record<string, any> }
	| { ok: false; message: string; data?: Record<string, any> };

const GENERIC_ERROR = 'অর্ডার করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';

/**
 * Posts to a SvelteKit form action and decodes its response. Every failure comes back
 * as ok: false, so a caller can never treat a rejected order as a successful one.
 */
export async function submitAction(url: string, body: FormData): Promise<SubmitActionResult> {
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'x-sveltekit-action': 'true' },
			body
		});

		if (response.status === 429) {
			return { ok: false, message: 'অনেকবার চেষ্টা করা হয়েছে। এক মিনিট পরে আবার চেষ্টা করুন।' };
		}

		const result = deserialize(await response.text());
		if (result.type === 'success') {
			return { ok: true, data: (result.data ?? {}) as Record<string, any> };
		}
		if (result.type === 'failure') {
			const data = (result.data ?? {}) as Record<string, any>;
			return { ok: false, message: data.message || GENERIC_ERROR, data };
		}
		return { ok: false, message: GENERIC_ERROR };
	} catch (err) {
		console.error('Action request failed:', err);
		return { ok: false, message: 'নেটওয়ার্কে সমস্যা হয়েছে। আবার চেষ্টা করুন।' };
	}
}
