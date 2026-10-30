/**
 * Bulletproof Client-side Meta Pixel Tracking Helper
 * Handles fbevents.js initialization, SPA afterNavigate PageViews, and event deduplication
 */

export interface ClientPixelConfig {
	trackingMode: 'native_direct' | 'capi_only' | 'disabled';
	pixelId?: string;
	backupPixelId?: string;
	defaultCurrency?: string;
	events?: {
		pageView: boolean;
		viewContent: boolean;
		addToCart: boolean;
		initiateCheckout: boolean;
		purchase: boolean;
	};
}

let isPixelInitialized = false;
let activeConfig: ClientPixelConfig | null = null;

declare global {
	interface Window {
		fbq: any;
		_fbq: any;
	}
}

/**
 * Initializes Meta Pixel snippet in the browser with guardrails against double loading
 */
export function initMetaPixel(config?: ClientPixelConfig | null): void {
	if (typeof window === 'undefined' || !config) return;
	activeConfig = config;
	if (config.trackingMode !== 'native_direct' || !config.pixelId) return;
	if (isPixelInitialized) return;

	// Official Meta Pixel Bootstrap snippet
	/* eslint-disable */
	(function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
		if (f.fbq) return;
		n = f.fbq = function () {
			n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
		};
		if (!f._fbq) f._fbq = n;
		n.push = n;
		n.loaded = !0;
		n.version = '2.0';
		n.queue = [];
		t = b.createElement(e);
		t.async = !0;
		t.src = v;
		s = b.getElementsByTagName(e)[0];
		s.parentNode.insertBefore(t, s);
	})(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
	/* eslint-enable */

	const primaryId = config.pixelId.trim();
	if (window.fbq) {
		window.fbq('init', primaryId);

		if (config.backupPixelId && config.backupPixelId.trim()) {
			window.fbq('init', config.backupPixelId.trim());
		}

		if (config.events?.pageView !== false) {
			window.fbq('track', 'PageView');
		}

		isPixelInitialized = true;
	}
}

/**
 * Triggers PageView event on SvelteKit client-side route transitions (afterNavigate)
 */
export function trackPageView(config?: ClientPixelConfig | null): void {
	if (typeof window === 'undefined') return;
	const cfg = config || activeConfig;
	if (!cfg || cfg.trackingMode !== 'native_direct' || !cfg.pixelId) return;

	if (typeof window.fbq === 'function' && cfg.events?.pageView !== false) {
		window.fbq('track', 'PageView');
	}
}

/**
 * Fires a standard Meta event with optional deduplication eventID
 * Respects event toggles configured in the admin dashboard
 */
export function trackMetaEvent(
	eventName: string,
	params: Record<string, any> = {},
	eventId?: string
): void {
	if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;

	// Check if this specific event has been disabled in Dashboard Settings
	if (activeConfig?.events) {
		if (eventName === 'PageView' && activeConfig.events.pageView === false) return;
		if (eventName === 'ViewContent' && activeConfig.events.viewContent === false) return;
		if (eventName === 'AddToCart' && activeConfig.events.addToCart === false) return;
		if (eventName === 'InitiateCheckout' && activeConfig.events.initiateCheckout === false) return;
		if (eventName === 'Purchase' && activeConfig.events.purchase === false) return;
	}

	if (eventId) {
		window.fbq('track', eventName, params, { eventID: eventId });
	} else {
		window.fbq('track', eventName, params);
	}
}

