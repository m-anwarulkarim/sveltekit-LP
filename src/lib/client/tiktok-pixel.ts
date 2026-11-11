/**
 * Client-side TikTok Pixel helper. Loads only when the admin has saved a
 * Pixel ID in Settings → TikTok Pixel. Funnel events are forwarded from the
 * Meta Pixel dispatcher so both networks always see the same funnel.
 */

export interface TikTokClientConfig {
	pixelId?: string;
	testEventCode?: string;
}

declare global {
	interface Window {
		ttq: any;
		TiktokAnalyticsObject: string;
	}
}

let initialized = false;
let active = false;

/** Meta standard event name → TikTok standard event name */
const EVENT_MAP: Record<string, string> = {
	ViewContent: 'ViewContent',
	AddToCart: 'AddToCart',
	InitiateCheckout: 'InitiateCheckout',
	Purchase: 'CompletePayment'
};

export function initTikTokPixel(config?: TikTokClientConfig | null): void {
	if (typeof window === 'undefined' || initialized) return;
	const pixelId = config?.pixelId?.trim();
	if (!pixelId) return;
	initialized = true;

	/* eslint-disable */
	(function (w: any, d: any, t: any) {
		w.TiktokAnalyticsObject = t;
		var ttq = (w[t] = w[t] || []);
		ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
		ttq.setAndDefer = function (t: any, e: any) {
			t[e] = function () {
				t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
			};
		};
		for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
		ttq.instance = function (t: any) {
			var e = ttq._i[t] || [];
			for (var n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
			return e;
		};
		ttq.load = function (e: any, n: any) {
			var r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
			ttq._i = ttq._i || {};
			ttq._i[e] = [];
			ttq._i[e]._u = r;
			ttq._t = ttq._t || {};
			ttq._t[e] = +new Date();
			ttq._o = ttq._o || {};
			ttq._o[e] = n || {};
			var s = d.createElement('script');
			s.type = 'text/javascript';
			s.async = !0;
			s.src = r + '?sdkid=' + e + '&lib=' + t;
			var a = d.getElementsByTagName('script')[0];
			a.parentNode.insertBefore(s, a);
		};
		ttq.load(pixelId);
		ttq.page();
	})(window, document, 'ttq');
	/* eslint-enable */

	active = true;
}

export function trackTikTokPageView(): void {
	if (!active || typeof window === 'undefined' || !window.ttq) return;
	try {
		window.ttq.page();
	} catch {}
}

/** Called from the Meta Pixel dispatcher with Meta-shaped params. */
export function forwardToTikTok(metaEventName: string, params: Record<string, any> = {}): void {
	if (!active || typeof window === 'undefined' || !window.ttq) return;
	const name = EVENT_MAP[metaEventName];
	if (!name) return;
	try {
		const ids: string[] = Array.isArray(params.content_ids) ? params.content_ids : [];
		const contents = Array.isArray(params.contents)
			? params.contents.map((c: any) => ({
					content_id: String(c.id ?? ''),
					quantity: Number(c.quantity) || 1,
					price: Number(c.item_price) || 0
				}))
			: ids.map((id) => ({ content_id: String(id), quantity: 1 }));
		window.ttq.track(name, {
			contents,
			content_type: 'product',
			value: Number(params.value) || 0,
			currency: params.currency || 'BDT'
		});
	} catch {}
}
