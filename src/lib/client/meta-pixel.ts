/**
 * Client-side Meta Pixel + Conversions API helper.
 * Browser events go to fbq; ViewContent/AddToCart/InitiateCheckout are also mirrored to the server
 * with the same event_id so Meta deduplicates them. Purchase is sent server-side by the order action.
 */

import { forwardToTikTok } from '#lib/client/tiktok-pixel';

export interface ClientPixelConfig {
	trackingMode: 'native_direct' | 'capi_only' | 'disabled';
	pixelId?: string;
	backupPixelId?: string;
	defaultCurrency?: string;
	capiEnabled?: boolean;
	/**
	 * Present only when the admin's Test Mode toggle is active. When set, it is attached to every
	 * browser fbq call so Meta routes those events to the Test Events tab (same destination as the
	 * CAPI mirror), letting the "Deduplicated" badge appear for the Browser+Server pair.
	 */
	testEventCode?: string;
	events?: {
		pageView: boolean;
		viewContent: boolean;
		addToCart: boolean;
		initiateCheckout: boolean;
		purchase: boolean;
	};
}

const SERVER_MIRRORED_EVENTS = new Set(['ViewContent', 'AddToCart', 'InitiateCheckout']);

let isPixelInitialized = false;
let activeConfig: ClientPixelConfig | null = null;

/**
 * Child pages (product, thank-you) run their effects before the layout's onMount has loaded the pixel.
 * On a hard page load their events would be lost, so they wait here until initMetaPixel has decided
 * whether tracking is on. Bounded so a store with tracking off never grows it.
 */
type PendingEvent = { name: string; params: Record<string, any>; id?: string };
const MAX_PENDING = 20;
let pendingEvents: PendingEvent[] = [];
let configResolved = false;

declare global {
	interface Window {
		fbq: any;
		_fbq: any;
	}
}

function newEventId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
	return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function readCookie(name: string): string | undefined {
	const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : undefined;
}

function writeCookie(name: string, value: string) {
	const secure = location.protocol === 'https:' ? '; Secure' : '';
	document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${90 * 24 * 3600}; Path=/; SameSite=Lax${secure}`;
}

/** Without fbevents.js (capi_only) nobody sets _fbp/_fbc, so the server would have no browser IDs to send. */
function ensureFbCookies() {
	try {
		if (!readCookie('_fbp')) {
			writeCookie('_fbp', `fb.1.${Date.now()}.${Math.floor(Math.random() * 1e10)}`);
		}
		const fbclid = new URLSearchParams(location.search).get('fbclid');
		if (fbclid && !readCookie('_fbc')?.endsWith(`.${fbclid}`)) {
			writeCookie('_fbc', `fb.1.${Date.now()}.${fbclid}`);
		}
	} catch {}
}

/**
 * Initializes Meta Pixel snippet in the browser with guardrails against double loading
 */
export function initMetaPixel(config?: ClientPixelConfig | null): void {
	if (typeof window === 'undefined' || !config) return;
	activeConfig = config;
	configResolved = true;

	if (config.trackingMode === 'disabled' || (config.trackingMode === 'native_direct' && !config.pixelId)) {
		pendingEvents = [];
		return;
	}

	ensureFbCookies();

	if (config.trackingMode !== 'capi_only' && !isPixelInitialized && config.pixelId) {
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

		window.fbq('init', config.pixelId.trim());
		if (config.backupPixelId && config.backupPixelId.trim()) {
			window.fbq('init', config.backupPixelId.trim());
		}
		if (config.events?.pageView !== false) {
			if (config.testEventCode) {
				window.fbq('track', 'PageView', {}, { test_event_code: config.testEventCode });
			} else {
				window.fbq('track', 'PageView');
			}
		}
		isPixelInitialized = true;
	}

	const queued = pendingEvents;
	pendingEvents = [];
	for (const e of queued) dispatchEvent(e.name, e.params, e.id);
}

/**
 * Triggers PageView event on SvelteKit client-side route transitions (afterNavigate)
 */
export function trackPageView(config?: ClientPixelConfig | null): void {
	if (typeof window === 'undefined') return;
	const cfg = config || activeConfig;
	if (!cfg || cfg.trackingMode !== 'native_direct' || !cfg.pixelId) return;

	if (typeof window.fbq === 'function' && cfg.events?.pageView !== false) {
		if (cfg.testEventCode) {
			window.fbq('track', 'PageView', {}, { test_event_code: cfg.testEventCode });
		} else {
			window.fbq('track', 'PageView');
		}
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
	if (typeof window === 'undefined') return;

	if (!configResolved) {
		if (pendingEvents.length < MAX_PENDING) {
			pendingEvents.push({ name: eventName, params, id: eventId });
		}
		return;
	}
	dispatchEvent(eventName, params, eventId);
}

// Global Event Deduplication Engine to prevent duplicate event firing across components
const recentEventTimestamps = new Map<string, number>();
const trackedPurchases = new Set<string>();
const DEDUPE_WINDOW_MS = 1500; // 1.5s throttle window for identical events

function isDuplicateEvent(eventName: string, params: Record<string, any>, eventId?: string): boolean {
	// Purchase events are strictly 1 per order per session
	if (eventName === 'Purchase' && eventId) {
		if (trackedPurchases.has(eventId)) return true;
		trackedPurchases.add(eventId);
		return false;
	}

	// For standard funnel events, throttle identical payloads within DEDUPE_WINDOW_MS
	const contentKey = Array.isArray(params.content_ids)
		? params.content_ids.slice().sort().join(',')
		: (params.content_name || params.value || '');
	const dedupeKey = `${eventName}:${contentKey}`;
	const now = Date.now();
	const lastFired = recentEventTimestamps.get(dedupeKey);

	if (lastFired && now - lastFired < DEDUPE_WINDOW_MS) {
		return true; // Duplicate call detected and dropped
	}

	recentEventTimestamps.set(dedupeKey, now);
	return false;
}

function isEventEnabled(eventName: string): boolean {
	const events = activeConfig?.events;
	if (!events) return true;
	if (eventName === 'PageView') return events.pageView !== false;
	if (eventName === 'ViewContent') return events.viewContent !== false;
	if (eventName === 'AddToCart') return events.addToCart !== false;
	if (eventName === 'InitiateCheckout') return events.initiateCheckout !== false;
	if (eventName === 'Purchase') return events.purchase !== false;
	return true;
}

function dispatchEvent(eventName: string, params: Record<string, any>, eventId?: string): void {
	const cfg = activeConfig;
	if (!cfg || cfg.trackingMode === 'disabled' || !isEventEnabled(eventName)) return;

	// Deduplication Guard: Stop duplicate events from firing
	if (isDuplicateEvent(eventName, params, eventId)) {
		return;
	}

	// TikTok sees the same funnel; it no-ops unless a TikTok Pixel ID is configured.
	forwardToTikTok(eventName, params);

	// First-party funnel counter for the admin Visitors dashboard
	if (['ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'].includes(eventName)) {
		try {
			fetch('/api/track/event', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				keepalive: true,
				body: JSON.stringify({
					event_name: eventName,
					value: Number(params.value) || 0,
					path: location.pathname
				})
			}).catch(() => {});
		} catch {}
	}

	const mirror = cfg.capiEnabled && SERVER_MIRRORED_EVENTS.has(eventName);
	const id = eventId || (mirror ? newEventId() : undefined);

	if (cfg.trackingMode === 'native_direct' && typeof window.fbq === 'function') {
		const options: Record<string, any> = {};
		if (id) options.eventID = id;
		if (cfg.testEventCode) options.test_event_code = cfg.testEventCode;
		if (Object.keys(options).length > 0) {
			window.fbq('track', eventName, params, options);
		} else {
			window.fbq('track', eventName, params);
		}
	}

	if (mirror && id) {
		try {
			fetch('/api/meta/event', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				keepalive: true,
				body: JSON.stringify({
					event_name: eventName,
					event_id: id,
					event_source_url: location.href,
					custom_data: params
				})
			}).catch(() => {});
		} catch {}
	}
}
