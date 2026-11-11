<script lang="ts">
	import { PRODUCT_BUNDLES, getBundlePrice, computeDeliveryCharge } from '#lib/utils/order-pricing';
	import type { Product } from '#lib/modules/products/types';
	import { submitAction } from '#lib/client/submit-action';
	import { network } from '#lib/stores/network.svelte';
	import { getAttributionSource } from '#lib/client/attribution';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import ProductGallery from './ProductGallery.svelte';
	import ProductTabs from './ProductTabs.svelte';
	import RelatedProducts from './RelatedProducts.svelte';
	import {
		Button,
		Input,
		Badge,
		Card,
		CardHeader,
		CardTitle,
		CardContent,
		Separator,
		Alert,
		AlertDescription
	} from '#lib/components/ui';
	import {
		Star,
		Plus,
		Minus,
		ShoppingBag,
		ShieldCheck,
		Truck,
		CheckCircle2,
		Phone,
		MessageCircle,
		MapPin,
		User,
		FileText,
		Check,
		CreditCard,
		AlertCircle,
		ArrowRight,
		Sparkles,
		RotateCcw,
		Zap
	} from 'lucide-svelte';

	interface Props {
		product: Product;
		reviews?: any[];
		relatedProducts?: Product[];
		productSettings?: any;
		storeConfig?: any;
		websiteInfo?: any;
		paymentConfig?: any;
		user?: any;
	}

	let {
		product,
		reviews = [],
		relatedProducts = [],
		productSettings,
		storeConfig,
		websiteInfo,
		paymentConfig = { enableCOD: true, enableBkash: false, enableNagad: false },
		user
	}: Props = $props();

	// Stock out status detection
	const isOutOfStock = $derived(
		!product.isPreOrder &&
			(product.inStock === false ||
				(product.totalStock !== undefined && product.totalStock <= 0 && product.inStock !== true))
	);

	// Variant / Package options
	const variantOptions = PRODUCT_BUNDLES;
	let selectedVariantId = $state('standard');
	const selectedVariant = $derived(
		variantOptions.find((v) => v.id === selectedVariantId) || variantOptions[0]
	);

	// Quantity state
	let quantity = $state(1);

	// Dynamic Price Calculation
	const singleVariantPrice = $derived(getBundlePrice(product.price, selectedVariant));
	const activePrice = $derived(singleVariantPrice * quantity);

	const activeOriginalPrice = $derived.by(() => {
		return (product.originalPrice || product.price) * selectedVariant.multiplier * quantity;
	});

	const savingsAmount = $derived(
		activeOriginalPrice > activePrice ? activeOriginalPrice - activePrice : 0
	);

	const activeDiscountPercent = $derived.by(() => {
		if (activeOriginalPrice > activePrice) {
			return Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100);
		}
		return 0;
	});

	function formatTaka(amount: number) {
		return `৳${amount.toLocaleString('en-BD')}`;
	}

	function increment() {
		quantity += 1;
	}

	function decrement() {
		if (quantity > 1) quantity -= 1;
	}

	function handleAddToCart() {
		if (isOutOfStock) {
			toast.warning(`"${product.name}" পণ্যটি বর্তমানে স্টক আউট!`);
			return;
		}
		for (let i = 0; i < quantity; i++) {
			cart.addItem({
				id: selectedVariant.id === 'standard' ? product.id : `${product.id}-${selectedVariant.id}`,
				name:
					selectedVariant.id === 'standard'
						? product.name
						: `${product.name} [${selectedVariant.name}]`,
				price: singleVariantPrice,
				originalPrice: (product.originalPrice || product.price) * selectedVariant.multiplier,
				image: product.image,
				category: product.categoryLabel,
				inStock: product.inStock,
				totalStock: product.totalStock,
				isPreOrder: product.isPreOrder
			});
		}
		toast.success(`"${product.name}" শপিং ব্যাগে যোগ করা হয়েছে!`);
		cart.openCart();
	}

	// Form fields
	let customerName = $state('');
	let customerPhone = $state('');
	let customerAddress = $state('');
	let district = $state<'dhaka' | 'outside'>('dhaka');
	let orderNote = $state('');
	let paymentMethod = $state<'cod' | 'bkash'>('cod');
	let honeypot = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state('');

	// Compute Delivery Charge matching server rules
	const deliveryFee = $derived(
		computeDeliveryCharge({
			subtotal: activePrice,
			area: district === 'dhaka' ? 'inside_dhaka' : 'outside_dhaka',
			store: storeConfig,
			productSettings
		})
	);

	const grandTotal = $derived(Math.max(0, activePrice + deliveryFee));

	// Contact phone & WhatsApp for instant call/chat
	const hotlinePhone = $derived(
		websiteInfo?.contactPhone || storeConfig?.orderPhone || '01700000000'
	);
	const hotlineWhatsApp = $derived(
		websiteInfo?.contactPhone ? websiteInfo.contactPhone.replace(/\D/g, '') : '8801700000000'
	);

	// Debounced lead capture for drop-offs
	let incompleteTimer: any = null;
	function triggerIncompleteCapture() {
		if (incompleteTimer) clearTimeout(incompleteTimer);
		incompleteTimer = setTimeout(async () => {
			const cleanPhone = customerPhone.trim().replace(/\D/g, '');
			if (cleanPhone.length >= 10 && product) {
				try {
					await fetch('/api/checkout/incomplete', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							customerName: customerName.trim() || 'অপরিচিত কাস্টমার',
							customerPhone: customerPhone.trim(),
							shippingAddress: customerAddress.trim() || 'ঠিকানা দেওয়া হয়নি',
							deliveryArea: district === 'dhaka' ? 'inside_dhaka' : 'outside_dhaka',
							items: [
								{
									id: selectedVariant.id === 'standard' ? product.id : `${product.id}-${selectedVariant.id}`,
									name:
										selectedVariant.id === 'standard'
											? product.name
											: `${product.name} [${selectedVariant.name}]`,
									price: singleVariantPrice,
									quantity: quantity,
									image: product.image
								}
							],
							subtotal: activePrice,
							deliveryCharge: deliveryFee,
							total: grandTotal,
							source: getAttributionSource()
						})
					});
				} catch {
					// silent fallback
				}
			}
		}, 1200);
	}

	// Smooth Scroll to Order Form from Mobile Sticky Bar
	export function scrollToOrderForm() {
		const formEl = document.getElementById('order-form');
		if (formEl) {
			formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
			const inputEl = document.getElementById('inline-co-name');
			if (inputEl) {
				setTimeout(() => inputEl.focus(), 400);
			}
		}
	}

	// Handle Direct Order Submission
	async function handlePlaceOrder(e?: Event) {
		if (e) e.preventDefault();
		errorMessage = '';

		if (isOutOfStock) {
			errorMessage = `"${product.name}" পণ্যটি বর্তমানে স্টক আউট!`;
			toast.error(errorMessage);
			return;
		}

		if (!customerName.trim()) {
			errorMessage = 'অনুগ্রহ করে আপনার নাম লিখুন।';
			const el = document.getElementById('inline-co-name');
			if (el) el.focus();
			return;
		}

		const cleanPhone = customerPhone.trim().replace(/\D/g, '');
		if (cleanPhone.length < 11) {
			errorMessage = 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)।';
			const el = document.getElementById('inline-co-phone');
			if (el) el.focus();
			return;
		}

		const isDigital = productSettings?.productType === 'digital';
		const requireAddress = !isDigital || Boolean(productSettings?.enableAddress);

		if (requireAddress && !customerAddress.trim()) {
			errorMessage = 'অনুগ্রহ করে আপনার সম্পূর্ণ ঠিকানা লিখুন।';
			const el = document.getElementById('inline-co-address');
			if (el) el.focus();
			return;
		}

		// Offline Hybrid System: Show Offline Order Modal if internet drops
		if (network.isOffline) {
			network.openOfflineOrderModal({
				customerName: customerName.trim(),
				customerPhone: customerPhone.trim(),
				shippingAddress: customerAddress.trim(),
				total: grandTotal,
				retryAction: () => handlePlaceOrder()
			});
			return;
		}

		isSubmitting = true;

		try {
			const formData = new FormData();
			formData.append('customerName', customerName.trim());
			formData.append('customerPhone', customerPhone.trim());
			formData.append(
				'shippingAddress',
				customerAddress.trim() || (isDigital ? 'ডিজিটাল ডেলিভারি (অনলাইন)' : '')
			);
			formData.append('deliveryArea', district === 'dhaka' ? 'inside_dhaka' : 'outside_dhaka');
			formData.append('paymentMethod', paymentMethod);
			if (orderNote.trim()) formData.append('orderNote', orderNote.trim());
			formData.append('website_url', honeypot);
			formData.append('source', getAttributionSource());
			formData.append('expectedTotal', String(grandTotal));

			// Single Product Direct Order Payload
			const itemsPayload = [
				{
					id: product.id,
					quantity: quantity,
					variantId: selectedVariant.id !== 'standard' ? selectedVariant.id : null
				}
			];
			formData.append('items', JSON.stringify(itemsPayload));

			const result = await submitAction('?/placeOrder', formData);

			if (!result.ok) {
				if (network.isOffline || result.message?.includes('নেটওয়ার্ক')) {
					network.openOfflineOrderModal({
						customerName: customerName.trim(),
						customerPhone: customerPhone.trim(),
						shippingAddress: customerAddress.trim(),
						total: grandTotal,
						retryAction: () => handlePlaceOrder()
					});
					return;
				}
				errorMessage = result.message;
				toast.error(result.message);
				return;
			}

			const orderData = result.data;
			const orderSnapshot = {
				orderId: orderData.orderNumber,
				customerName: customerName.trim(),
				customerPhone: customerPhone.trim(),
				customerAddress: customerAddress.trim(),
				customerCity: district === 'dhaka' ? 'ঢাকা সিটি (Dhaka)' : 'ঢাকার বাইরে (Outside Dhaka)',
				paymentMethod:
					paymentMethod === 'cod'
						? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)'
						: 'বিকাশ অনলাইন পেমেন্ট (bKash)',
				items: [
					{
						id: product.id,
						name:
							selectedVariant.id === 'standard'
								? product.name
								: `${product.name} [${selectedVariant.name}]`,
						price: singleVariantPrice,
						quantity: quantity,
						image: product.image
					}
				],
				subtotal: activePrice,
				deliveryCharge: deliveryFee,
				discountAmount: 0,
				total: orderData.total,
				createdAt: new Date().toISOString()
			};

			// Handle bKash Gateway redirect if selected
			if (paymentMethod === 'bkash') {
				try {
					const bkashRes = await fetch('/api/payment/bkash/create', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ orderId: orderData.orderId })
					});
					const bkashData: any = await bkashRes.json();
					if (bkashData.success && bkashData.bkashURL) {
						cart.setLastOrder(orderSnapshot);
						window.location.href = bkashData.bkashURL;
						return;
					}
					toast.error(bkashData.message || 'বিকাশ গেটওয়ে সংযোগে সমস্যা হয়েছে');
				} catch (bkErr) {
					console.error('Failed to trigger bKash redirect:', bkErr);
					toast.error('বিকাশ গেটওয়ে সংযোগে সমস্যা হয়েছে');
				}
			}

			cart.setLastOrder(orderSnapshot);
			goto(`/thank-you?order_id=${orderData.orderId}`);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-8 font-['Anek_Bangla',sans-serif]">

	<!-- 1. Top Section: Product Showcase + Inline Order Form (2-Col Desktop / 1-Col Mobile) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">

		<!-- LEFT COLUMN (lg:col-span-6): Product Media Gallery & Fast Highlights -->
		<div class="lg:col-span-6 w-full space-y-6">
			<ProductGallery {product} />

			<!-- Mobile Quick Call / WhatsApp Bar (Visible on mobile right under gallery) -->
			<div class="flex items-center gap-2 p-3 bg-emerald-50/90 border border-emerald-200 rounded-2xl sm:hidden">
				<a
					href="tel:{hotlinePhone}"
					class="flex-1 py-2 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
				>
					<Phone class="w-3.5 h-3.5" />
					<span>কল করুন</span>
				</a>
				<a
					href="https://wa.me/{hotlineWhatsApp}?text={encodeURIComponent(`হ্যালো, আমি ${product.name} কিনতে আগ্রহী।`)}"
					target="_blank"
					rel="noreferrer"
					class="flex-1 py-2 px-3 bg-white text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
				>
					<MessageCircle class="w-3.5 h-3.5 text-emerald-600" />
					<span>হোয়াটসঅ্যাপ</span>
				</a>
			</div>

			<!-- Desktop Highlights Box -->
			<div class="hidden lg:block bg-slate-50/80 rounded-2xl border border-slate-200/90 p-5 space-y-3">
				<h3 class="text-xs font-black uppercase tracking-wider text-slate-500">
					কেন আমাদের থেকে কিনবেন?
				</h3>
				<div class="grid grid-cols-2 gap-3 text-xs text-slate-700">
					<div class="flex items-center gap-2">
						<ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0" />
						<span>১০০% আসল ও জেনুইন পণ্য</span>
					</div>
					<div class="flex items-center gap-2">
						<Truck class="w-4 h-4 text-[#2563eb] shrink-0" />
						<span>সারা দেশে ক্যাশ অন ডেলিভারি</span>
					</div>
					<div class="flex items-center gap-2">
						<RotateCcw class="w-4 h-4 text-amber-600 shrink-0" />
						<span>৭ দিনের সহজ রিটার্ন পলিসি</span>
					</div>
					<div class="flex items-center gap-2">
						<CheckCircle2 class="w-4 h-4 text-blue-600 shrink-0" />
						<span>পার্সেল দেখে টাকা পরিশোধ</span>
					</div>
				</div>
			</div>
		</div>

		<!-- RIGHT COLUMN (lg:col-span-6): Product Summary + Poltisheba Style Direct Order Form -->
		<div class="lg:col-span-6 w-full space-y-5">

			<!-- Mini Product Summary Header -->
			<div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
				
				<!-- Badges & In Stock -->
				<div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
					<div class="flex items-center gap-2">
						<Badge variant="blue" class="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider">
							{product.categoryLabel}
						</Badge>
						{#if product.badge}
							<Badge variant="destructive" class="px-2 py-0.5 text-[11px] font-bold">
								{product.badge}
							</Badge>
						{/if}
					</div>

					{#if isOutOfStock}
						<Badge variant="outline" class="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border-rose-200 px-2.5 py-1 rounded-full">
							<span class="w-2 h-2 rounded-full bg-rose-500"></span>
							<span>স্টক শেষ</span>
						</Badge>
					{:else}
						<Badge variant="outline" class="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-200 px-2.5 py-1 rounded-full">
							<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
							<span>ইন স্টক (মজুদ আছে)</span>
						</Badge>
					{/if}
				</div>

				<!-- Title -->
				<h1 class="text-xl sm:text-2xl font-black text-slate-900 leading-snug font-['Outfit',sans-serif]">
					{product.name}
				</h1>

				<!-- Ratings -->
				<div class="flex items-center gap-2 text-xs">
					<div class="flex text-amber-400 gap-0.5">
						{#each Array(5) as _}
							<Star class="w-4 h-4 fill-amber-400 text-amber-400" />
						{/each}
					</div>
					<span class="font-bold text-slate-800 text-sm">{product.rating}.0</span>
					<span class="text-slate-400 font-medium">({product.reviewsCount} জন কাস্টমার রিভিউ)</span>
				</div>

				<!-- Price Display -->
				<div class="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between gap-3">
					<div class="flex items-baseline gap-2.5">
						<span class="text-2xl sm:text-3xl font-black text-[#2563eb] font-['Outfit',sans-serif]">
							{formatTaka(activePrice)}
						</span>
						{#if activeOriginalPrice > activePrice}
							<span class="text-sm text-slate-400 line-through font-medium">
								{formatTaka(activeOriginalPrice)}
							</span>
						{/if}
					</div>
					{#if savingsAmount > 0}
						<Badge variant="rose" class="text-xs font-bold px-2.5 py-1">
							সেভ {formatTaka(savingsAmount)} ({activeDiscountPercent}% ছাড়)
						</Badge>
					{/if}
				</div>

				<!-- Variant Selector -->
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700 block">
						প্যাকেজ / ভ্যারিয়েন্ট বেছে নিন:
					</label>
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
						{#each variantOptions as variant}
							{@const isSelected = selectedVariantId === variant.id}
							<button
								type="button"
								onclick={() => (selectedVariantId = variant.id)}
								class="p-2.5 text-xs font-bold text-left rounded-xl border transition-all flex flex-col items-start gap-0.5 cursor-pointer {isSelected
									? 'bg-[#2563eb] text-white border-[#2563eb] shadow-xs ring-2 ring-blue-300'
									: 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}"
							>
								<span>{variant.name}</span>
								<span class="text-[10px] font-medium {isSelected ? 'text-blue-100' : 'text-slate-400'}">
									{variant.subtitle}
								</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Quantity Selector -->
				<div class="flex items-center justify-between gap-3 pt-1">
					<span class="text-xs font-bold text-slate-700">পরিমাণ (Quantity):</span>
					<div class="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-2xs">
						<button
							type="button"
							onclick={decrement}
							class="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 disabled:opacity-40 flex items-center justify-center cursor-pointer"
							disabled={quantity <= 1 || isOutOfStock}
							aria-label="পরিমাণ কমান"
						>
							<Minus class="w-3.5 h-3.5" />
						</button>
						<span class="w-10 text-center font-black text-sm text-slate-900 font-['Outfit']">
							{quantity}
						</span>
						<button
							type="button"
							onclick={increment}
							class="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 disabled:opacity-40 flex items-center justify-center cursor-pointer"
							disabled={isOutOfStock}
							aria-label="পরিমাণ বাড়ান"
						>
							<Plus class="w-3.5 h-3.5" />
						</button>
					</div>
				</div>

				<!-- Dual Quick Actions: Add to Cart (Secondary) & Direct Order Scroll (Primary) -->
				<div class="flex items-center gap-2 pt-2">
					<button
						type="button"
						onclick={handleAddToCart}
						disabled={isOutOfStock}
						class="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
					>
						<ShoppingBag class="w-4 h-4 text-slate-500" />
						<span>কার্টে রাখুন</span>
					</button>
					<button
						type="button"
						onclick={scrollToOrderForm}
						disabled={isOutOfStock}
						class="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-40"
					>
						<Zap class="w-4 h-4 fill-white" />
						<span>সরাসরি অর্ডার করুন</span>
					</button>
				</div>

			</div>

			<!-- INLINE DIRECT CHECKOUT ORDER FORM (The Poltisheba Style Star Feature) -->
			<div
				id="order-form"
				class="bg-white rounded-2xl sm:rounded-3xl border-2 border-emerald-500/80 shadow-lg shadow-emerald-500/10 overflow-hidden"
			>
				<!-- Form Header Banner -->
				<div class="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 sm:p-5 text-white">
					<div class="flex items-center gap-2.5">
						<div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shrink-0">
							<Zap class="w-5 h-5 fill-white" />
						</div>
						<div>
							<h2 class="text-base sm:text-lg font-black tracking-tight leading-tight">
								অর্ডার করতে নিচের তথ্যগুলো দিন
							</h2>
							<p class="text-[11px] text-emerald-100 mt-0.5">
								সরাসরি ক্যাশ অন ডেলিভারিতে অর্ডার কনফার্ম হবে • কোনো অগ্রিম টাকা লাগবে না
							</p>
						</div>
					</div>
				</div>

				<form onsubmit={handlePlaceOrder} class="p-5 sm:p-6 space-y-4">
					<!-- Bot Honeypot -->
					<div class="hidden" aria-hidden="true" tabindex="-1">
						<input type="text" name="website_url" aria-label="website_url" bind:value={honeypot} autocomplete="off" />
					</div>

					<!-- Error Alert -->
					{#if errorMessage}
						<Alert variant="destructive" class="rounded-2xl flex items-center gap-2">
							<AlertCircle class="w-4 h-4 shrink-0" />
							<AlertDescription class="text-xs font-bold">
								{errorMessage}
							</AlertDescription>
						</Alert>
					{/if}

					<!-- নাম * -->
					<div>
						<label for="inline-co-name" class="block text-xs font-bold text-slate-800 mb-1.5">
							আপনার নাম <span class="text-rose-500">*</span>
						</label>
						<div class="relative">
							<User class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
							<Input
								id="inline-co-name"
								type="text"
								required
								bind:value={customerName}
								placeholder="সম্পূর্ণ নাম লিখুন"
								class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border-slate-200 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-emerald-600"
							/>
						</div>
					</div>

					<!-- মোবাইল নম্বর * -->
					<div>
						<label for="inline-co-phone" class="block text-xs font-bold text-slate-800 mb-1.5">
							মোবাইল নম্বর <span class="text-rose-500">*</span>
						</label>
						<div class="relative">
							<Phone class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
							<Input
								id="inline-co-phone"
								type="tel"
								required
								bind:value={customerPhone}
								oninput={triggerIncompleteCapture}
								onblur={triggerIncompleteCapture}
								placeholder="01XXXXXXXXX (১১ ডিজিট)"
								class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border-slate-200 text-xs sm:text-sm font-mono text-slate-800 focus:bg-white focus:border-emerald-600"
							/>
						</div>
					</div>

					<!-- সম্পূর্ণ ঠিকানা * -->
					<div>
						<label for="inline-co-address" class="block text-xs font-bold text-slate-800 mb-1.5">
							সম্পূর্ণ ঠিকানা <span class="text-rose-500">*</span>
						</label>
						<div class="relative">
							<MapPin class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
							<Input
								id="inline-co-address"
								type="text"
								required
								bind:value={customerAddress}
								placeholder="বাসা নং, রোড নং, এলাকা, থানা ও জেলা"
								class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border-slate-200 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-emerald-600"
							/>
						</div>
					</div>

					<!-- ডেলিভারি এরিয়া বাটন সিলেক্টর (ঢাকা / ঢাকার বাইরে) -->
					<div>
						<label class="block text-xs font-bold text-slate-800 mb-1.5">
							ডেলিভারি এরিয়া বেছে নিন <span class="text-rose-500">*</span>
						</label>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
							<button
								type="button"
								onclick={() => (district = 'dhaka')}
								class="p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between {district === 'dhaka'
									? 'border-emerald-600 bg-emerald-50/70 shadow-2xs ring-1 ring-emerald-600'
									: 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'}"
							>
								<div>
									<div class="text-xs font-bold text-slate-900">ঢাকা সিটির ভিতরে</div>
									<div class="text-[10px] text-slate-500 mt-0.5">ডেলিভারি চার্জ: ৳৬০ (১২-২৪ ঘণ্টা)</div>
								</div>
								{#if district === 'dhaka'}
									<Check class="w-4 h-4 text-emerald-600 stroke-[3]" />
								{/if}
							</button>

							<button
								type="button"
								onclick={() => (district = 'outside')}
								class="p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between {district === 'outside'
									? 'border-emerald-600 bg-emerald-50/70 shadow-2xs ring-1 ring-emerald-600'
									: 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'}"
							>
								<div>
									<div class="text-xs font-bold text-slate-900">ঢাকার বাহিরে (সারাদেশ)</div>
									<div class="text-[10px] text-slate-500 mt-0.5">ডেলিভারি চার্জ: ৳১২০ (২৪-৪৮ ঘণ্টা)</div>
								</div>
								{#if district === 'outside'}
									<Check class="w-4 h-4 text-emerald-600 stroke-[3]" />
								{/if}
							</button>
						</div>
					</div>

					<!-- পেমেন্ট মেথড (ডিফল্ট ক্যাশ অন ডেলিভারি) -->
					{#if paymentConfig.enableBkash}
						<div>
							<label class="block text-xs font-bold text-slate-800 mb-1.5">
								পেমেন্ট মেথড
							</label>
							<div class="grid grid-cols-2 gap-2.5">
								<button
									type="button"
									onclick={() => (paymentMethod = 'cod')}
									class="p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between {paymentMethod === 'cod'
										? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
										: 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'}"
								>
									<span class="text-xs font-bold text-slate-900">ক্যাশ অন ডেলিভারি</span>
									{#if paymentMethod === 'cod'}
										<Check class="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
									{/if}
								</button>
								<button
									type="button"
									onclick={() => (paymentMethod = 'bkash')}
									class="p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between {paymentMethod === 'bkash'
										? 'border-pink-600 bg-pink-50/70 ring-1 ring-pink-600'
										: 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'}"
								>
									<span class="text-xs font-bold text-pink-700">বিকাশ অনলাইন</span>
									{#if paymentMethod === 'bkash'}
										<Check class="w-3.5 h-3.5 text-pink-600 stroke-[3]" />
									{/if}
								</button>
							</div>
						</div>
					{/if}

					<!-- বিশেষ নির্দেশনা (ঐচ্ছিক) -->
					<div>
						<label for="inline-co-note" class="block text-xs font-semibold text-slate-600 mb-1">
							বিশেষ নির্দেশনা <span class="text-slate-400 font-normal">(ঐচ্ছিক)</span>
						</label>
						<Input
							id="inline-co-note"
							type="text"
							bind:value={orderNote}
							placeholder="ডেলিভারির জন্য কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
							class="w-full px-3 py-2 rounded-xl bg-slate-50 border-slate-200 text-xs text-slate-800"
						/>
					</div>

					<Separator />

					<!-- Live Order Bill Summary -->
					<div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2 text-xs text-slate-600">
						<div class="flex justify-between items-center">
							<span>পণ্য মূল্য ({quantity}টি {selectedVariant.name}):</span>
							<span class="font-bold text-slate-900 font-mono">{formatTaka(activePrice)}</span>
						</div>
						<div class="flex justify-between items-center">
							<span>ডেলিভারি চার্জ ({district === 'dhaka' ? 'ঢাকা সিটি' : 'ঢাকার বাইরে'}):</span>
							<span class="font-bold text-slate-900 font-mono">{formatTaka(deliveryFee)}</span>
						</div>
						<div class="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
							<span class="font-black text-slate-900">সর্বমোট প্রদেয় টাকা:</span>
							<span class="font-black text-xl text-emerald-700 font-mono">
								{formatTaka(grandTotal)}
							</span>
						</div>
					</div>

					<!-- Primary Large CTA Submit Button -->
					{#if isOutOfStock}
						<Button
							type="button"
							variant="secondary"
							disabled
							class="w-full h-auto py-3.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-black border border-slate-200 cursor-not-allowed"
						>
							স্টক শেষ (Stock Out)
						</Button>
					{:else}
						<Button
							type="submit"
							variant="default"
							disabled={isSubmitting}
							class="w-full h-auto py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-98 cursor-pointer"
						>
							{#if isSubmitting}
								<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
								<span>অর্ডার প্রসেসিং হচ্ছে...</span>
							{:else}
								<span>অর্ডার কনফার্ম করুন ({formatTaka(grandTotal)})</span>
								<ArrowRight class="w-5 h-5 stroke-[2.5]" />
							{/if}
						</Button>
					{/if}

					<!-- Security & Trust Badges under Button -->
					<div class="pt-2 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 font-medium border-t border-slate-100">
						<div class="flex flex-col items-center gap-1">
							<ShieldCheck class="w-4 h-4 text-emerald-600" />
							<span>১০০% নিরাপদ</span>
						</div>
						<div class="flex flex-col items-center gap-1">
							<Truck class="w-4 h-4 text-[#2563eb]" />
							<span>দ্রুততম ডেলিভারি</span>
						</div>
						<div class="flex flex-col items-center gap-1">
							<CheckCircle2 class="w-4 h-4 text-teal-600" />
							<span>দেখে নেওয়ার সুযোগ</span>
						</div>
					</div>

				</form>
			</div>

			<!-- Direct Phone Call / WhatsApp Help Center Card -->
			<div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3 flex-wrap">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
						<Phone class="w-4 h-4" />
					</div>
					<div>
						<div class="text-xs font-bold text-slate-900">যেকোনো তথ্যের জন্য কল করুন</div>
						<div class="text-xs font-black text-amber-800 font-mono">{hotlinePhone}</div>
					</div>
				</div>
				<a
					href="tel:{hotlinePhone}"
					class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
				>
					<span>এখনই কল দিন</span>
					<ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>

		</div>

	</div>

	<!-- 2. Detailed Tabs Section (Description, Specifications, Reviews) -->
	<div class="pt-4">
		<ProductTabs {product} {reviews} />
	</div>

	<!-- 3. Related Products Carousel -->
	{#if relatedProducts.length > 0}
		<div class="pt-4">
			<RelatedProducts products={relatedProducts} />
		</div>
	{/if}

	<!-- 4. Mobile Sticky Bottom Floating Action Bar for Direct Order -->
	<div class="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-3 lg:hidden font-['Anek_Bangla',sans-serif]">
		<div class="flex items-center justify-between gap-3 max-w-lg mx-auto">
			<div class="flex items-center gap-2.5 min-w-0">
				<div class="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0 overflow-hidden">
					<img src={product.image} alt={product.name} class="w-full h-full object-contain" />
				</div>
				<div class="min-w-0">
					<div class="text-[11px] font-bold text-slate-800 truncate">{product.name}</div>
					<div class="text-sm font-black text-emerald-700 leading-tight font-mono">{formatTaka(grandTotal)}</div>
				</div>
			</div>

			<div class="flex items-center gap-2 shrink-0">
				<!-- Add to Cart Icon Button -->
				<button
					type="button"
					onclick={handleAddToCart}
					disabled={isOutOfStock}
					class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer disabled:opacity-40"
					title="কার্টে যোগ করুন"
					aria-label="Add to cart"
				>
					<ShoppingBag class="w-4 h-4 text-slate-700" />
				</button>

				<Button
					type="button"
					variant="default"
					onclick={scrollToOrderForm}
					class="h-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5 cursor-pointer shrink-0"
				>
					<Zap class="w-3.5 h-3.5 fill-white" />
					<span>অর্ডার করুন</span>
				</Button>
			</div>
		</div>
	</div>

</div>
