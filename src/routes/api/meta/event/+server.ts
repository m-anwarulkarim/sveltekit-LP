import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index';
import { PixelService } from '#lib/server/services/pixel.service';

// Purchase is sent from the order action itself, so it is not accepted here.
const ALLOWED_EVENTS = new Set(['ViewContent', 'AddToCart', 'InitiateCheckout']);

function str(v: unknown, max: number): string | undefined {
	return typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined;
}

function num(v: unknown): number | undefined {
	const n = Number(v);
	return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function sanitizeCustomData(raw: any): Record<string, any> {
	const out: Record<string, any> = {};
	if (!raw || typeof raw !== 'object') return out;

	const value = num(raw.value);
	if (value !== undefined) out.value = value;
	const contentName = str(raw.content_name, 200);
	if (contentName) out.content_name = contentName;
	const numItems = num(raw.num_items);
	if (numItems !== undefined) out.num_items = Math.floor(numItems);

	if (Array.isArray(raw.content_ids)) {
		out.content_ids = raw.content_ids
			.slice(0, 50)
			.map((id: unknown) => str(String(id ?? ''), 100))
			.filter(Boolean);
	}
	if (Array.isArray(raw.contents)) {
		out.contents = raw.contents.slice(0, 50).flatMap((c: any) => {
			const id = str(String(c?.id ?? ''), 100);
			if (!id) return [];
			return [{ id, quantity: Math.max(1, Math.floor(num(c.quantity) ?? 1)), item_price: num(c.item_price) ?? 0 }];
		});
	}
	return out;
}

export const POST: RequestHandler = async ({ request, platform, cookies, url, getClientAddress }) => {
	let body: any;
	try {
		body = await request.json();
	} catch {
		return new Response(null, { status: 400 });
	}

	const eventName = str(body?.event_name, 40);
	const eventId = str(body?.event_id, 100);
	if (!eventName || !ALLOWED_EVENTS.has(eventName) || !eventId) {
		return new Response(null, { status: 400 });
	}

	const sourceUrl = str(body?.event_source_url, 500);
	const eventSourceUrl = sourceUrl?.startsWith(url.origin) ? sourceUrl : url.origin;

	let ipAddress = request.headers.get('cf-connecting-ip') || undefined;
	if (!ipAddress) {
		try {
			ipAddress = getClientAddress();
		} catch {}
	}

	const work = PixelService.sendCAPIEvent(getDb(platform), {
		eventName,
		eventId,
		customData: sanitizeCustomData(body?.custom_data),
		eventSourceUrl,
		ipAddress,
		userAgent: request.headers.get('user-agent') || undefined,
		fbp: cookies.get('_fbp') || undefined,
		fbc: cookies.get('_fbc') || undefined
	}).catch((err) => console.error('CAPI event dispatch error:', err));

	if (platform?.ctx?.waitUntil) platform.ctx.waitUntil(work);
	else await work;

	return new Response(null, { status: 204 });
};
