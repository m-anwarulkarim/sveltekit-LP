export interface CartItem {
	id: string;
	name: string;
	price: number; // in cents
	originalPrice: number;
	image: string;
	quantity: number;
	category: string;
}

class CartStore {
	items = $state<CartItem[]>([
		{
			id: 'aura-spectrum-x',
			name: 'AURA Spectrum X',
			price: 34900,
			originalPrice: 42900,
			image: '/images/headphones.jpg',
			quantity: 1,
			category: 'Spatial Audio'
		}
	]);
	isOpen = $state(false);
	couponCode = $state('');
	discountPercent = $state(0);
	couponMessage = $state('');

	get count() {
		return this.items.reduce((total, item) => total + item.quantity, 0);
	}

	get subtotal() {
		return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
	}

	get discountAmount() {
		return Math.round((this.subtotal * this.discountPercent) / 100);
	}

	get total() {
		return Math.max(0, this.subtotal - this.discountAmount);
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

	addItem(product: Omit<CartItem, 'quantity'>) {
		const existing = this.items.find((item) => item.id === product.id);
		if (existing) {
			existing.quantity += 1;
		} else {
			this.items.push({ ...product, quantity: 1 });
		}
		this.isOpen = true;
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
			this.couponMessage = '20% Special Launch Discount Applied!';
			return true;
		} else if (clean === 'VIP30') {
			this.discountPercent = 30;
			this.couponMessage = '30% VIP Member Discount Applied!';
			return true;
		} else {
			this.discountPercent = 0;
			this.couponMessage = 'Invalid promo code. Try AURA20';
			return false;
		}
	}

	clear() {
		this.items = [];
		this.couponCode = '';
		this.discountPercent = 0;
		this.couponMessage = '';
	}
}

export const cart = new CartStore();
