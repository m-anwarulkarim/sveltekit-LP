import { deserialize } from '$app/forms';

export type SubmitActionResult =
	| { ok: true; data: Record<string, any> }
	| { ok: false; message: string; data?: Record<string, any> };

// Callers that do not pass their own message are the order forms.
const DEFAULT_ERROR = 'অর্ডার করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';

/**
 * Posts to a SvelteKit form action and decodes its response. Every failure comes back
 * as ok: false, so a caller can never treat a rejected request as a successful one.
 */
export async function submitAction(
	url: string,
	body: FormData,
	fallbackMessage: string = DEFAULT_ERROR
): Promise<SubmitActionResult> {
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'x-sveltekit-action': 'true' },
			body
		});

		if (response.status === 429) {
			return { ok: false, message: 'অনেকবার চেষ্টা করা হয়েছে। এক মিনিট পরে আবার চেষ্টা করুন।' };
		}

		const text = await response.text();
		let result: ReturnType<typeof deserialize>;
		try {
			result = deserialize(text);
		} catch {
			// Not an action response: the server stopped the request before the action ran.
			if (response.redirected && response.url.includes('/auth/')) {
				return { ok: false, message: 'লগইনের মেয়াদ শেষ হয়ে গেছে। আবার লগইন করুন।' };
			}
			if (response.status === 403 && text.trim() === 'Forbidden') {
				return { ok: false, message: 'এই কাজের অনুমতি আপনার নেই।' };
			}
			try {
				const json = JSON.parse(text);
				if (json?.message) return { ok: false, message: String(json.message) };
			} catch {
				// Not JSON either.
			}
			return { ok: false, message: fallbackMessage };
		}

		if (result.type === 'success') {
			return { ok: true, data: (result.data ?? {}) as Record<string, any> };
		}
		if (result.type === 'failure') {
			const data = (result.data ?? {}) as Record<string, any>;
			return { ok: false, message: data.message || fallbackMessage, data };
		}
		return { ok: false, message: fallbackMessage };
	} catch (err) {
		console.error('Action request failed:', err);
		return { ok: false, message: 'নেটওয়ার্কে সমস্যা হয়েছে। আবার চেষ্টা করুন।' };
	}
}
