/**
 * Google Tag Manager (GTM) & GA4 E-Commerce DataLayer Client Engine
 * 
 * Complies 100% with Google Analytics 4 (GA4) official e-commerce specifications:
 * - Automatically executes `dataLayer.push({ ecommerce: null })` before every e-commerce event to prevent data contamination.
 * - Standardized event structure: view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, purchase.
 * - Complete isolation from Meta Pixel / fbq() to ensure zero event collision or duplication.
 */

export interface GtmClientConfig {
	isEnabled: boolean;
	gtmId?: string; // Format: "GTM-XXXXXXX"
	ga4MeasurementId?: string; // Format: "G-XXXXXXXXXX"
	enableDataLayer?: boolean;
	events?: {
		pageView?: boolean;
		viewItem?: boolean;
		addToCart?: boolean;
		removeFromCart?: boolean;
		viewCart?: boolean;
		beginCheckout?: boolean;
		purchase?: boolean;
	};
}

export interface Ga4Item {
	item_id: string | number;
	item_name: string;
	affiliation?: string;
	currency?: string;
	discount?: number;
	index?: number;
	item_brand?: string;
	item_category?: string;
	item_category2?: string;
	item_variant?: string;
	price: number;
	quantity?: number;
}

declare global {
	interface Window {
		dataLayer: any[];
	}
}

let isGtmScriptInjected = false;
let activeGtmConfig: GtmClientConfig | null = null;

/**
 * Initializes GTM Container script in browser head & noscript in body
 */
export function initGtm(config?: GtmClientConfig | null): void {
	if (typeof window === 'undefined' || !config) return;
	activeGtmConfig = config;

	// Ensure window.dataLayer array exists immediately
	window.dataLayer = window.dataLayer || [];

	// Guard: Only inject script if enabled and has a valid GTM container ID (GTM-XXXXXXX)
	if (!config.isEnabled || !config.gtmId || !config.gtmId.trim().toUpperCase().startsWith('GTM-')) {
		return;
	}

	if (isGtmScriptInjected) return;

	const gtmId = config.gtmId.trim().toUpperCase();

	// Push gtm.start event before loading gtm.js
	window.dataLayer.push({
		'gtm.start': new Date().getTime(),
		event: 'gtm.js'
	});

	// Inject official GTM asynchronous script
	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
	document.head.appendChild(script);

	// Inject noscript fallback in body
	const noscript = document.createElement('noscript');
	const iframe = document.createElement('iframe');
	iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`;
	iframe.height = '0';
	iframe.width = '0';
	iframe.style.display = 'none';
	iframe.style.visibility = 'hidden';
	noscript.appendChild(iframe);
	document.body.insertBefore(noscript, document.body.firstChild);

	isGtmScriptInjected = true;
}

/**
 * Pushes raw event to dataLayer with defensive array check
 */
export function pushToDataLayer(payload: Record<string, any>): void {
	if (typeof window === 'undefined') return;
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push(payload);
}

/**
 * Tracks virtual page view on SvelteKit client-side route transitions (afterNavigate)
 */
export function trackGtmPageView(pageData?: {
	page_title?: string;
	page_location?: string;
	page_path?: string;
}): void {
	if (typeof window === 'undefined') return;
	if (activeGtmConfig && activeGtmConfig.events?.pageView === false) return;

	pushToDataLayer({
		event: 'page_view',
		page_title: pageData?.page_title || document.title,
		page_location: pageData?.page_location || window.location.href,
		page_path: pageData?.page_path || window.location.pathname
	});
}

/**
 * 1. view_item: Triggered when viewing single product details page
 */
export function trackGtmViewItem(data: {
	item: Ga4Item;
	currency?: string;
}): void {
	if (typeof window === 'undefined') return;
	if (activeGtmConfig && activeGtmConfig.events?.viewItem === false) return;

	const currency = data.currency || 'BDT';
	const value = Number(data.item.price) || 0;

	// Google's mandatory rule: Clear previous ecommerce state
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ ecommerce: null });

	window.dataLayer.push({
		event: 'view_item',
		ecommerce: {
			currency,
			value,
			items: [
				{
					item_id: String(data.item.item_id),
					item_name: data.item.item_name,
					item_brand: data.item.item_brand || 'AURA',
					item_category: data.item.item_category || 'General',
					price: value,
					quantity: data.item.quantity || 1
				}
			]
		}
	});
}

/**
 * 2. add_to_cart: Triggered when product is added to cart
 */
export function trackGtmAddToCart(data: {
	item: Ga4Item;
	currency?: string;
}): void {
	if (typeof window === 'undefined') return;
	if (activeGtmConfig && activeGtmConfig.events?.addToCart === false) return;

	const currency = data.currency || 'BDT';
	const qty = Number(data.item.quantity) || 1;
	const price = Number(data.item.price) || 0;

	// Google's mandatory rule: Clear previous ecommerce state
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ ecommerce: null });

	window.dataLayer.push({
		event: 'add_to_cart',
		ecommerce: {
			currency,
			value: price * qty,
			items: [
				{
					item_id: String(data.item.item_id),
					item_name: data.item.item_name,
					item_brand: data.item.item_brand || 'AURA',
					item_category: data.item.item_category || 'General',
					item_variant: data.item.item_variant,
					price,
					quantity: qty
				}
			]
		}
	});
}

/**
 * 3. remove_from_cart: Triggered when product is removed from cart
 */
export function trackGtmRemoveFromCart(data: {
	item: Ga4Item;
	currency?: string;
}): void {
	if (typeof window === 'undefined') return;
	if (activeGtmConfig && activeGtmConfig.events?.removeFromCart === false) return;

	const currency = data.currency || 'BDT';
	const qty = Number(data.item.quantity) || 1;
	const price = Number(data.item.price) || 0;

	// Google's mandatory rule: Clear previous ecommerce state
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ ecommerce: null });

	window.dataLayer.push({
		event: 'remove_from_cart',
		ecommerce: {
			currency,
			value: price * qty,
			items: [
				{
					item_id: String(data.item.item_id),
					item_name: data.item.item_name,
					item_brand: data.item.item_brand || 'AURA',
					item_category: data.item.item_category || 'General',
					price,
					quantity: qty
				}
			]
		}
	});
}

/**
 * 4. view_cart: Triggered when viewing cart drawer or cart modal
 */
export function trackGtmViewCart(data: {
	items: Ga4Item[];
	total: number;
	currency?: string;
}): void {
	if (typeof window === 'undefined') return;
	if (activeGtmConfig && activeGtmConfig.events?.viewCart === false) return;

	const currency = data.currency || 'BDT';

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ ecommerce: null });

	window.dataLayer.push({
		event: 'view_cart',
		ecommerce: {
			currency,
			value: Number(data.total) || 0,
			items: data.items.map((i, idx) => ({
				item_id: String(i.item_id),
				item_name: i.item_name,
				item_brand: i.item_brand || 'AURA',
				item_category: i.item_category || 'General',
				price: Number(i.price) || 0,
				quantity: Number(i.quantity) || 1,
				index: idx + 1
			}))
		}
	});
}

/**
 * 5. begin_checkout: Triggered when entering checkout step
 */
export function trackGtmBeginCheckout(data: {
	items: Ga4Item[];
	total: number;
	coupon?: string;
	currency?: string;
}): void {
	if (typeof window === 'undefined') return;
	if (activeGtmConfig && activeGtmConfig.events?.beginCheckout === false) return;

	const currency = data.currency || 'BDT';

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ ecommerce: null });

	window.dataLayer.push({
		event: 'begin_checkout',
		ecommerce: {
			currency,
			value: Number(data.total) || 0,
			coupon: data.coupon || undefined,
			items: data.items.map((i, idx) => ({
				item_id: String(i.item_id),
				item_name: i.item_name,
				item_brand: i.item_brand || 'AURA',
				item_category: i.item_category || 'General',
				price: Number(i.price) || 0,
				quantity: Number(i.quantity) || 1,
				index: idx + 1
			}))
		}
	});
}

/**
 * 6. purchase: Triggered on order completion (thank-you page)
 */
export function trackGtmPurchase(data: {
	transaction_id: string;
	value: number;
	tax?: number;
	shipping?: number;
	currency?: string;
	coupon?: string;
	items: Ga4Item[];
}): void {
	if (typeof window === 'undefined') return;
	if (activeGtmConfig && activeGtmConfig.events?.purchase === false) return;

	const currency = data.currency || 'BDT';

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ ecommerce: null });

	window.dataLayer.push({
		event: 'purchase',
		ecommerce: {
			transaction_id: String(data.transaction_id),
			value: Number(data.value) || 0,
			tax: Number(data.tax) || 0,
			shipping: Number(data.shipping) || 0,
			currency,
			coupon: data.coupon || undefined,
			items: data.items.map((i, idx) => ({
				item_id: String(i.item_id),
				item_name: i.item_name,
				item_brand: i.item_brand || 'AURA',
				item_category: i.item_category || 'General',
				price: Number(i.price) || 0,
				quantity: Number(i.quantity) || 1,
				index: idx + 1
			}))
		}
	});
}

