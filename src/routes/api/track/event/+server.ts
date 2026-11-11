import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { VisitorAnalyticsService } from '#lib/server/services/visitor-analytics.service';
import { ADMIN_SESSION_COOKIE } from '#lib/server/services/admin-auth.service';

const ALLOWED_EVENTS = new Set(['ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase']);

/** First-party funnel beacon fired by the browser pixel dispatcher. */
export const POST: RequestHandler = async ({ request, cookies, platform }) => {
	// Admin browsing the storefront must not pollute shopper analytics
	if (cookies.get(ADMIN_SESSION_COOKIE)) return json({ ok: true });

	const sessionId = cookies.get('v_sid');
	if (!sessionId) return json({ ok: true });

	let body: Record<string, unknown> = {};
	try {
		body = (await request.json()) as Record<string, unknown>;
	} catch {
		return json({ ok: false }, { status: 400 });
	}

	const eventType = String(body.event_name || '');
	if (!ALLOWED_EVENTS.has(eventType)) return json({ ok: false }, { status: 400 });

	const task = VisitorAnalyticsService.recordFunnelEvent(getDb(platform), {
		sessionId,
		eventType,
		path: typeof body.path === 'string' ? body.path : '',
		value: Number(body.value) || 0
	});
	if (platform?.ctx?.waitUntil) platform.ctx.waitUntil(task);
	else await task;

	return json({ ok: true });
};
