import { trackMetaEvent } from '#lib/client/meta-pixel';
import { trackGtmAddToCart, trackGtmRemoveFromCart, trackGtmViewCart } from '#lib/client/gtm';

export interface CartItem {
	id: string;
	name: string;
	price: number; // in BDT Taka
	originalPrice: number;
	image: string;
	quantity: number;
	category: string;
	variantId?: string | null;
	variantName?: string | null;
}

export interface OrderDetails {
	orderId: string;
	customerName: string;
	customerPhone: string;
	customerAddress: string;
	customerCity: string;
	paymentMethod: string;
	items: CartItem[];
	subtotal: number;
	deliveryCharge: number;
	discountAmount: number;
	total: number;
	createdAt: string;
}

const STORAGE_KEY_ITEMS = 'aura_cart_items';
const STORAGE_KEY_COUPON = 'aura_cart_coupon';
const STORAGE_KEY_LAST_ORDER = 'aura_last_order';

class CartStore {
	items = $state<CartItem[]>([]);
	isOpen = $state(false);
	couponCode = $state('');
	discountPercent = $state(0);
	couponMessage = $state('');
	lastOrder = $state<OrderDetails | null>(null);

	private currentUserId: string | null = null;
	private debounceTimer: any = null;
	private isSyncingWithServer = false;

	constructor() {
		if (typeof window !== 'undefined') {
			this.loadFromStorage();

			// Sync across browser tabs if cart is updated elsewhere
			window.addEventListener('storage', (e) => {
				if (e.key === STORAGE_KEY_ITEMS || e.key === STORAGE_KEY_COUPON) {
					this.loadFromStorage();
				}
			});
		}
	}

	/**
	 * Syncs cart with logged-in user's database cart (Hybrid Approach)
	 */
	async syncWithUser(user: { id?: string } | null | undefined) {
		const newUserId = user?.id || null;
		if (this.currentUserId === newUserId && newUserId) return;
		this.currentUserId = newUserId;

		if (!this.currentUserId || typeof window === 'undefined') return;

		this.isSyncingWithServer = true;
		try {
			const res = await fetch('/api/cart');
			if (res.ok) {
				const data: any = await res.json();
				if (data.success && data.cart) {
					const serverItems: CartItem[] = Array.isArray(data.cart.items) ? data.cart.items : [];

					// If local cart is empty but server has items, load from server
					if (this.items.length === 0 && serverItems.length > 0) {
						this.items = serverItems;
						if (data.cart.couponCode) {
							this.couponCode = data.cart.couponCode;
							this.discountPercent = Number(data.cart.discountPercent) || 0;
						}
						this.saveToStorage();
					} else if (this.items.length > 0) {
						// Merge: Combine items from local and server without duplicating
						for (const sItem of serverItems) {
							const exists = this.items.find(
								(i) =>
									i.id === sItem.id &&
									(i.variantId || null) === (sItem.variantId || null)
							);
							if (!exists) {
								this.items.push(sItem);
							}
						}
						this.saveToStorage();
						// Push the merged cart back to the server
						this.pushToServerImmediate();
					}
				} else if (this.items.length > 0) {
					// User just logged in and has items in local cart -> sync to server
					this.pushToServerImmediate();
				}
			}
		} catch (e) {
			console.error('Failed to sync cart with server:', e);
		} finally {
			this.isSyncingWithServer = false;
		}
	}

	/**
	 * Debounced push to database for logged in user (600ms)
	 */
	private pushToServer() {
		if (!this.currentUserId || typeof window === 'undefined' || this.isSyncingWithServer) return;
		if (this.debounceTimer) clearTimeout(this.debounceTimer);
		this.debounceTimer = setTimeout(() => {
			this.pushToServerImmediate();
		}, 600);
	}

	/**
	 * Immediate push to database
	 */
	private async pushToServerImmediate() {
		if (!this.currentUserId || typeof window === 'undefined') return;
		try {
			await fetch('/api/cart', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: $state.snapshot(this.items),
					couponCode: this.couponCode,
					discountPercent: this.discountPercent
				})
			});
		} catch (e) {
			console.error('Failed to push cart to server:', e);
		}
	}

	private loadFromStorage() {
		if (typeof window === 'undefined') return;
		try {
			const savedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
			if (savedItems) {
				const parsed = JSON.parse(savedItems);
				if (Array.isArray(parsed)) {
					this.items = parsed;
				}
			}
			const savedCoupon = localStorage.getItem(STORAGE_KEY_COUPON);
			if (savedCoupon) {
				const parsed = JSON.parse(savedCoupon);
				if (parsed && typeof parsed === 'object') {
					this.couponCode = typeof parsed.code === 'string' ? parsed.code : '';
					this.discountPercent = Number(parsed.discountPercent) || 0;
					this.couponMessage = typeof parsed.message === 'string' ? parsed.message : '';
				}
			}
		} catch (e) {
			console.error('Failed to load cart from localStorage:', e);
		}
	}

	private saveToStorage() {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(this.items));
			localStorage.setItem(
				STORAGE_KEY_COUPON,
				JSON.stringify({
					code: this.couponCode,
					discountPercent: this.discountPercent,
					message: this.couponMessage
				})
			);
		} catch (e) {
			console.error('Failed to save cart to localStorage:', e);
		}
	}

	get count() {
		return this.items.reduce((total, item) => total + item.quantity, 0);
	}

	get totalQuantity() {
		return this.count;
	}

	get subtotal() {
		return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
	}

	get discountAmount() {
		return Math.round((this.subtotal * this.discountPercent) / 100);
	}

	get deliveryCharge() {
		if (this.subtotal === 0) return 0;
		return this.subtotal >= 600 ? 0 : 60;
	}

	get total() {
		return Math.max(0, this.subtotal - this.discountAmount + this.deliveryCharge);
	}

	get totalPrice() {
		return this.total;
	}

	toggleCart() {
		this.isOpen = !this.isOpen;
	}

	openCart() {
		this.isOpen = true;
		if (typeof window !== 'undefined' && this.items.length > 0) {
			try {
				trackGtmViewCart({
					items: this.items.map((i) => ({
						item_id: String(i.id),
						item_name: i.name,
						price: Number(i.price) || 0,
						quantity: Number(i.quantity) || 1,
						item_category: i.category || 'General',
						item_variant: i.variantName || undefined
					})),
					total: this.subtotal
				});
			} catch {}
		}
	}

	closeCart() {
		this.isOpen = false;
	}

	addItem(product: Omit<CartItem, 'quantity'>, openDrawer: boolean = true) {
		const existing = this.items.find(
			(item) => item.id === product.id && (item.variantId || null) === (product.variantId || null)
		);
		if (existing) {
			existing.quantity += 1;
		} else {
			this.items.push({ ...product, quantity: 1 });
		}
		if (openDrawer) {
			this.isOpen = true;
		}
		this.saveToStorage();
		this.pushToServer();

		// Centralized Meta Pixel AddToCart event
		if (typeof window !== 'undefined') {
			try {
				trackMetaEvent('AddToCart', {
					content_name: product.name,
					content_ids: [String(product.id)],
					content_type: 'product',
					value: Number(product.price) || 0,
					currency: 'BDT'
				});
			} catch {}

			// Centralized GTM GA4 AddToCart event (Isolated & standard-compliant)
			try {
				trackGtmAddToCart({
					item: {
						item_id: String(product.id),
						item_name: product.name,
						price: Number(product.price) || 0,
						quantity: 1,
						item_category: product.category || 'General',
						item_variant: product.variantName || undefined
					}
				});
			} catch {}
		}
	}

	removeItem(id: string) {
		const removed = this.items.find((item) => item.id === id);
		this.items = this.items.filter((item) => item.id !== id);
		this.saveToStorage();
		this.pushToServer();

		if (removed && typeof window !== 'undefined') {
			try {
				trackGtmRemoveFromCart({
					item: {
						item_id: String(removed.id),
						item_name: removed.name,
						price: Number(removed.price) || 0,
						quantity: Number(removed.quantity) || 1,
						item_category: removed.category || 'General',
						item_variant: removed.variantName || undefined
					}
				});
			} catch {}
		}
	}

	updateQuantity(id: string, delta: number) {
		const item = this.items.find((i) => i.id === id);
		if (item) {
			item.quantity += delta;
			if (item.quantity <= 0) {
				this.removeItem(id);
				return;
			}
		}
		this.saveToStorage();
		this.pushToServer();
	}

	applyCoupon(code: string) {
		const clean = code.trim().toUpperCase();
		if (clean === 'AURA20') {
			this.discountPercent = 20;
			this.couponCode = clean;
			this.couponMessage = '২০% স্পেশাল লঞ্চ ডিসকাউন্ট যুক্ত হয়েছে!';
			this.saveToStorage();
			this.pushToServer();
			return true;
		} else if (clean === 'VIP30') {
			this.discountPercent = 30;
			this.couponCode = clean;
			this.couponMessage = '৩০% ভিআইপি মেম্বার ডিসকাউন্ট যুক্ত হয়েছে!';
			this.saveToStorage();
			this.pushToServer();
			return true;
		} else {
			this.discountPercent = 0;
			this.couponMessage = 'ভুল প্রোমোকোড। ট্রাই করুন: AURA20';
			this.saveToStorage();
			this.pushToServer();
			return false;
		}
	}

	clear() {
		this.items = [];
		this.couponCode = '';
		this.discountPercent = 0;
		this.couponMessage = '';
		this.saveToStorage();

		if (this.currentUserId && typeof window !== 'undefined') {
			fetch('/api/cart', { method: 'DELETE' }).catch(() => {});
		}
	}

	setLastOrder(order: OrderDetails) {
		this.lastOrder = order;
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(STORAGE_KEY_LAST_ORDER, JSON.stringify(order));
			} catch (e) {
				console.error(e);
			}
		}
	}

	loadLastOrder(): OrderDetails | null {
		if (this.lastOrder) return this.lastOrder;
		if (typeof window !== 'undefined') {
			try {
				const saved = localStorage.getItem(STORAGE_KEY_LAST_ORDER);
				if (saved) {
					this.lastOrder = JSON.parse(saved);
					return this.lastOrder;
				}
			} catch (e) {
				console.error(e);
			}
		}
		return null;
	}
}

export const cart = new CartStore();
