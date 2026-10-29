import { trackMetaEvent } from '#lib/client/meta-pixel';

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

class CartStore {
	items = $state<CartItem[]>([]);
	isOpen = $state(false);
	couponCode = $state('');
	discountPercent = $state(0);
	couponMessage = $state('');
	lastOrder = $state<OrderDetails | null>(null);

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
	}

	closeCart() {
		this.isOpen = false;
	}

	addItem(product: Omit<CartItem, 'quantity'>, openDrawer: boolean = true) {
		const existing = this.items.find((item) => item.id === product.id);
		if (existing) {
			existing.quantity += 1;
		} else {
			this.items.push({ ...product, quantity: 1 });
		}
		if (openDrawer) {
			this.isOpen = true;
		}

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
		}
	}

	removeItem(id: string) {
		this.items = this.items.filter((item) => item.id !== id);
	}

	updateQuantity(id: string, delta: number) {
		const item = this.items.find((i) => i.id === id);
		if (item) {
			item.quantity += delta;
			if (item.quantity <= 0) {
				this.removeItem(id);
			}
		}
	}

	applyCoupon(code: string) {
		const clean = code.trim().toUpperCase();
		if (clean === 'AURA20') {
			this.discountPercent = 20;
			this.couponCode = clean;
			this.couponMessage = '২০% স্পেশাল লঞ্চ ডিসকাউন্ট যুক্ত হয়েছে!';
			return true;
		} else if (clean === 'VIP30') {
			this.discountPercent = 30;
			this.couponCode = clean;
			this.couponMessage = '৩০% ভিআইপি মেম্বার ডিসকাউন্ট যুক্ত হয়েছে!';
			return true;
		} else {
			this.discountPercent = 0;
			this.couponMessage = 'ভুল প্রোমোকোড। ট্রাই করুন: AURA20';
			return false;
		}
	}

	clear() {
		this.items = [];
		this.couponCode = '';
		this.discountPercent = 0;
		this.couponMessage = '';
	}

	setLastOrder(order: OrderDetails) {
		this.lastOrder = order;
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('aura_last_order', JSON.stringify(order));
			} catch (e) {
				console.error(e);
			}
		}
	}

	loadLastOrder(): OrderDetails | null {
		if (this.lastOrder) return this.lastOrder;
		if (typeof window !== 'undefined') {
			try {
				const saved = localStorage.getItem('aura_last_order');
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
