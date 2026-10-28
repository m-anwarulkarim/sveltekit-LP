<script lang="ts">
	import type { PageData } from './$types';
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { goto } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import {
		Button,
		Input,
		Textarea,
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
		Home,
		ChevronRight,
		ShieldCheck,
		Lock,
		Truck,
		Phone,
		MapPin,
		CreditCard,
		Check,
		ShoppingBag,
		ArrowRight,
		Tag,
		Sparkles,
		Trash2,
		Plus,
		Minus,
		AlertCircle
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// Form fields
	let name = $state('');
	let phone = $state('');
	let altPhone = $state('');
	let district = $state<'dhaka' | 'outside'>('dhaka');
	let address = $state('');
	let orderNote = $state('');
	let paymentMethod = $state<'cod' | 'bkash'>('cod');
	let couponInput = $state('');
	let honeypot = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state('');

	function formatTaka(amount: number) {
		return `৳${amount.toLocaleString('en-BD')}`;
	}

	// Dynamic delivery charge based on district and threshold
	const deliveryFee = $derived.by(() => {
		if (cart.subtotal === 0) return 0;
		if (cart.subtotal >= 600) return 0; // Free delivery over 600 BDT
		return district === 'dhaka' ? 60 : 120;
	});

	const grandTotal = $derived(
		Math.max(0, cart.subtotal - cart.discountAmount + deliveryFee)
	);

	function handleApplyCoupon() {
		if (!couponInput.trim()) return;
		cart.applyCoupon(couponInput);
	}

	async function handlePlaceOrder(e: Event) {
		console.log('[DEBUG] handlePlaceOrder invoked!');
		e.preventDefault();
		errorMessage = '';

		if (data.isLoginRequired && !data.user) {
			console.log('[DEBUG] Login required for checkout');
			errorMessage = 'এই স্টোরে অর্ডার সম্পন্ন করতে অ্যাকাউন্টে লগইন থাকা আবশ্যক।';
			goto('/account?redirectTo=/checkout');
			return;
		}

		if (!name.trim()) {
			console.log('[DEBUG] Name missing');
			errorMessage = 'অনুগ্রহ করে আপনার নাম লিখুন।';
			return;
		}

		const cleanPhone = phone.trim().replace(/\D/g, '');
		if (cleanPhone.length < 11) {
			console.log('[DEBUG] Phone invalid:', cleanPhone);
			errorMessage = 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)।';
			return;
		}

		if (!address.trim()) {
			console.log('[DEBUG] Address missing');
			errorMessage = 'অনুগ্রহ করে পূর্ণ ডেলিভারি ঠিকানা লিখুন।';
			return;
		}

		if (cart.items.length === 0) {
			console.log('[DEBUG] Cart is empty');
			errorMessage = 'আপনার শপিং ব্যাগ খালি! অনুগ্রহ করে পণ্য যোগ করুন।';
			return;
		}

		isSubmitting = true;
		console.log('[DEBUG] Posting to ?/placeOrder with items:', cart.items.length);

		try {
			const formData = new FormData();
			formData.append('customerName', name.trim());
			formData.append('customerPhone', phone.trim());
			formData.append('shippingAddress', address.trim());
			formData.append('deliveryArea', district === 'dhaka' ? 'inside_dhaka' : 'outside_dhaka');
			formData.append('paymentMethod', paymentMethod);
			formData.append('orderNote', orderNote.trim());
			formData.append('website_url', honeypot);
			formData.append(
				'items',
				JSON.stringify(
					cart.items.map((item) => ({
						id: item.id,
						name: item.name,
						price: item.price,
						quantity: item.quantity,
						variantId: item.variantId || null,
						variantName: item.variantName || null,
						image: item.image || null
					}))
				)
			);

			const response = await fetch('?/placeOrder', {
				method: 'POST',
				headers: {
					'x-sveltekit-action': 'true'
				},
				body: formData
			});

			const rawText = await response.text();
			console.log('[DEBUG] rawText:', rawText);
			const result = deserialize(rawText);
			console.log('[DEBUG] result:', JSON.stringify(result));

			if (result.type === 'success' && result.data) {
				const orderData = result.data as any;
				const confirmedId =
					orderData.orderNumber ||
					orderData.orderId ||
					`AUR-${Math.floor(100000 + Math.random() * 900000)}`;

				const orderSnapshot = {
					orderId: confirmedId,
					customerName: name.trim(),
					customerPhone: phone.trim(),
					customerAddress: address.trim(),
					customerCity: district === 'dhaka' ? 'ঢাকা সিটি (Dhaka)' : 'ঢাকার বাইরে (Outside Dhaka)',
					paymentMethod:
						paymentMethod === 'cod'
							? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)'
							: 'বিকাশ / নগদ (bKash/Nagad)',
					items: [...cart.items],
					subtotal: cart.subtotal,
					deliveryCharge: deliveryFee,
					discountAmount: cart.discountAmount,
					total: orderData.total || grandTotal,
					createdAt: new Date().toISOString()
				};

				cart.setLastOrder(orderSnapshot);
				cart.clear();
				goto(`/thank-you?order_id=${confirmedId}`);
			} else if (result.type === 'failure' && result.data) {
				errorMessage = (result.data as any).message || 'অর্ডারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
			} else {
				// Fallback navigation
				const fallbackId = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
				cart.clear();
				goto(`/thank-you?order_id=${fallbackId}`);
			}
		} catch (err: any) {
			console.error('Checkout error:', err);
			errorMessage = err?.message || 'নেটওয়ার্কে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>চেকআউট ও অর্ডার কনফার্মেশন | AURA Store</title>
	<meta name="description" content="নিরাপদ চেকআউট ও ১২-২৪ ঘণ্টায় সারা দেশে দ্রুততম এক্সপ্রেস হোম ডেলিভারি।" />
</svelte:head>

<StoreLayout user={data.user}>
	
	<div class="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 font-['Anek_Bangla',sans-serif]">
		
		<!-- 1. Breadcrumbs Trail -->
		<nav class="flex items-center gap-1.5 text-xs text-slate-400 mb-4 overflow-x-auto no-scrollbar py-1">
			<a href="/" class="hover:text-slate-800 transition-colors flex items-center gap-1 shrink-0">
				<Home class="w-3.5 h-3.5" />
				<span>হোম</span>
			</a>
			<ChevronRight class="w-3.5 h-3.5 text-slate-300 shrink-0" />
			<Button
				variant="link"
				onclick={() => cart.openCart()}
				class="h-auto p-0 text-xs text-slate-400 hover:text-slate-800 font-normal shrink-0"
			>
				শপিং ব্যাগ
			</Button>
			<ChevronRight class="w-3.5 h-3.5 text-slate-300 shrink-0" />
			<span class="text-slate-900 font-bold truncate">
				চেকআউট
			</span>
		</nav>

		<!-- 2. Page Header Card -->
		<Card class="rounded-2xl sm:rounded-3xl border-slate-200/90 shadow-xs mb-6 overflow-hidden">
			<CardContent class="p-5 sm:p-7 flex items-center justify-between gap-4 flex-wrap">
				<div class="flex items-center gap-3.5">
					<div class="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center font-bold text-lg shadow-xs">
						<Lock class="w-5 h-5" />
					</div>
					<div>
						<h1 class="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
							চেকআউট ও অর্ডার কনফার্মেশন
						</h1>
						<p class="text-xs text-slate-500 font-medium mt-0.5">
							১০০% নিরাপদ চেকআউট • কোনো কার্ডের প্রয়োজন নেই • পণ্য হাতে পেয়ে টাকা দিন
						</p>
					</div>
				</div>

				<Badge variant="outline" class="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border-emerald-200 px-3.5 py-1.5 rounded-full shadow-2xs">
					<ShieldCheck class="w-4 h-4 text-emerald-600" />
					<span>ক্যাশ অন ডেলিভারি গ্যারান্টি</span>
				</Badge>
			</CardContent>
		</Card>

		<!-- 3. Empty Cart Notice if 0 items -->
		{#if cart.items.length === 0}
			<Card class="rounded-3xl border-slate-200/90 shadow-xs text-center max-w-lg mx-auto my-8">
				<CardContent class="p-10 sm:p-16 space-y-4">
					<div class="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
						<ShoppingBag class="w-8 h-8" />
					</div>
					<div class="space-y-1">
						<h3 class="text-lg font-bold text-slate-900 font-['Outfit']">
							আপনার ব্যাগটি এখন খালি!
						</h3>
						<p class="text-xs text-slate-500 leading-relaxed">
							চেকআউট সম্পন্ন করার জন্য অনুগ্রহ করে আপনার পছন্দের পণ্য কার্টে যুক্ত করুন।
						</p>
					</div>
					<Button
						variant="blue"
						href="/"
						class="h-auto px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 inline-flex items-center gap-2"
					>
						<span>পণ্য ব্রাউজ করুন</span>
						<ArrowRight class="w-4 h-4" />
					</Button>
				</CardContent>
			</Card>
		{:else}

			<!-- 4. Main 2-Column Grid using shadcn Cards, Inputs, Textarea & Buttons -->
			<form onsubmit={handlePlaceOrder} class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
				<!-- Bot Honeypot Protection (hidden from real users) -->
				<div class="hidden" aria-hidden="true" tabindex="-1">
					<input type="text" name="website_url" bind:value={honeypot} autocomplete="off" />
				</div>
				
				<!-- LEFT COLUMN: Customer & Shipping Details (lg:col-span-7) -->
				<div class="lg:col-span-7 space-y-5">
					
					<!-- Validation Error Alert -->
					{#if errorMessage}
						<Alert variant="destructive" class="rounded-2xl flex items-center gap-2">
							<AlertCircle class="w-4 h-4" />
							<AlertDescription class="text-xs font-bold">
								{errorMessage}
							</AlertDescription>
						</Alert>
					{/if}

					<!-- Member-First Login Required Gate (if checkout_1 is active in theme settings) -->
					{#if data.isLoginRequired && !data.user}
						<Card class="rounded-2xl sm:rounded-3xl border-rose-200 bg-rose-50/40 p-5 sm:p-6 shadow-xs">
							<div class="flex items-start gap-3.5">
								<div class="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
									<Lock class="w-5 h-5" />
								</div>
								<div class="space-y-1.5 flex-1">
									<div class="flex items-center gap-2">
										<h4 class="text-sm font-bold text-slate-900">লগইন থাকা বাধ্যতামূলক</h4>
										<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
											LOGIN REQUIRED
										</span>
									</div>
									<p class="text-xs text-slate-600 leading-relaxed">
										এই স্টোরে অর্ডার সম্পন্ন করতে কাস্টমার অ্যাকাউন্টে লগইন থাকা আবশ্যক। মাত্র ৩০ সেকেন্ডে মোবাইল ওটিপি বা পাসওয়ার্ড দিয়ে লগইন করুন।
									</p>
									<div class="pt-2">
										<Button
											variant="default"
											href="/account?redirectTo=/checkout"
											class="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs inline-flex items-center gap-1.5"
										>
											<Lock class="w-3.5 h-3.5" />
											<span>লগইন বা রেজিস্টার করুন</span>
										</Button>
									</div>
								</div>
							</div>
						</Card>
					{:else if data.user}
						<div class="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 shadow-2xs">
							<span class="flex items-center gap-2">
								<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
								লগইনকৃত অ্যাকাউন্ট: {data.user.name || data.user.phone || data.user.email}
							</span>
							<span class="text-[10px] uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
								VERIFIED MEMBER
							</span>
						</div>
					{/if}

					<!-- Section 1: Customer Delivery Info Card -->
					<Card class="rounded-2xl sm:rounded-3xl border-slate-200/90 shadow-xs overflow-hidden">
						<CardHeader class="p-5 sm:p-6 pb-3 border-b border-slate-100">
							<div class="flex items-center gap-2.5">
								<div class="w-7 h-7 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center font-bold text-xs">
									১
								</div>
								<CardTitle class="text-sm font-bold text-slate-900 font-['Outfit']">
									ডেলিভারি তথ্য
								</CardTitle>
							</div>
						</CardHeader>

						<CardContent class="p-5 sm:p-6 space-y-4">
							<!-- Name -->
							<div>
								<label for="co-name" class="block text-xs font-bold text-slate-700 mb-1.5">
									আপনার পূর্ণ নাম <span class="text-rose-500">*</span>
								</label>
								<Input
									id="co-name"
									type="text"
									required
									bind:value={name}
									placeholder="যেমন: সাকিব আল হাসান"
									class="rounded-xl bg-slate-50 border-slate-200/90 text-xs"
								/>
							</div>

							<!-- Phone Numbers -->
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
								<div>
									<label for="co-phone" class="block text-xs font-bold text-slate-700 mb-1.5">
										মোবাইল নম্বর <span class="text-rose-500">*</span>
									</label>
									<div class="relative">
										<Phone class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
										<Input
											id="co-phone"
											type="tel"
											required
											bind:value={phone}
											placeholder="017xxxxxxxx"
											class="pl-9 rounded-xl bg-slate-50 border-slate-200/90 text-xs font-mono"
										/>
									</div>
								</div>

								<div>
									<label for="co-altphone" class="block text-xs font-bold text-slate-700 mb-1.5">
										বিকল্প মোবাইল নম্বর <span class="text-slate-400 font-normal">(ঐচ্ছিক)</span>
									</label>
									<div class="relative">
										<Phone class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
										<Input
											id="co-altphone"
											type="tel"
											bind:value={altPhone}
											placeholder="018xxxxxxxx"
											class="pl-9 rounded-xl bg-slate-50 border-slate-200/90 text-xs font-mono"
										/>
									</div>
								</div>
							</div>

							<!-- Delivery Area Selection -->
							<div>
								<label class="block text-xs font-bold text-slate-700 mb-1.5">
									ডেলিভারি এরিয়া বেছে নিন <span class="text-rose-500">*</span>
								</label>
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<button
										type="button"
										onclick={() => (district = 'dhaka')}
										class="p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between {district === 'dhaka'
											? 'border-[#2563eb] bg-blue-50/60 shadow-2xs ring-1 ring-[#2563eb]'
											: 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'}"
									>
										<div>
											<div class="text-xs font-bold text-slate-900">ঢাকা সিটির ভিতরে</div>
											<div class="text-[11px] text-slate-500 mt-0.5">ডেলিভারি চার্জ: ৳৬০ (১২-২৪ ঘণ্টা)</div>
										</div>
										{#if district === 'dhaka'}
											<Check class="w-4 h-4 text-[#2563eb] stroke-[3]" />
										{/if}
									</button>

									<button
										type="button"
										onclick={() => (district = 'outside')}
										class="p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between {district === 'outside'
											? 'border-[#2563eb] bg-blue-50/60 shadow-2xs ring-1 ring-[#2563eb]'
											: 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'}"
									>
										<div>
											<div class="text-xs font-bold text-slate-900">ঢাকার বাহিরে (সারা দেশ)</div>
											<div class="text-[11px] text-slate-500 mt-0.5">ডেলিভারি চার্জ: ৳১২০ (২৪-৪৮ ঘণ্টা)</div>
										</div>
										{#if district === 'outside'}
											<Check class="w-4 h-4 text-[#2563eb] stroke-[3]" />
										{/if}
									</button>
								</div>
							</div>

							<!-- Full Delivery Address -->
							<div>
								<label for="co-address" class="block text-xs font-bold text-slate-700 mb-1.5">
									পূর্ণ ডেলিভারি ঠিকানা <span class="text-rose-500">*</span>
								</label>
								<div class="relative">
									<MapPin class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 z-10" />
									<Textarea
										id="co-address"
										required
										rows={2}
										bind:value={address}
										placeholder="বাসা/ফ্ল্যাট নং, রোড নং, এলাকা, থানা ও জেলার নাম..."
										class="pl-9 rounded-xl bg-slate-50 border-slate-200/90 text-xs font-medium resize-none"
									/>
								</div>
							</div>

							<!-- Order Note -->
							<div>
								<label for="co-note" class="block text-xs font-bold text-slate-700 mb-1.5">
									বিশেষ নির্দেশনা / নোট <span class="text-slate-400 font-normal">(ঐচ্ছিক)</span>
								</label>
								<Input
									id="co-note"
									type="text"
									bind:value={orderNote}
									placeholder="যেমন: ফোন না ধরলে দারোয়ানের কাছে পার্সেলটি রাখুন"
									class="rounded-xl bg-slate-50 border-slate-200/90 text-xs"
								/>
							</div>
						</CardContent>
					</Card>

					<!-- Section 2: Payment Method Card -->
					<Card class="rounded-2xl sm:rounded-3xl border-slate-200/90 shadow-xs overflow-hidden">
						<CardHeader class="p-5 sm:p-6 pb-3 border-b border-slate-100">
							<div class="flex items-center gap-2.5">
								<div class="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
									২
								</div>
								<CardTitle class="text-sm font-bold text-slate-900 font-['Outfit']">
									পেমেন্ট মেথড বেছে নিন
								</CardTitle>
							</div>
						</CardHeader>

						<CardContent class="p-5 sm:p-6 space-y-3">
							<!-- COD Option -->
							<button
								type="button"
								onclick={() => (paymentMethod = 'cod')}
								class="w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between {paymentMethod === 'cod'
									? 'border-[#2563eb] bg-blue-50/50 shadow-2xs ring-1 ring-[#2563eb]'
									: 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'}"
							>
								<div class="flex items-center gap-3">
									<div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
										<ShieldCheck class="w-5 h-5" />
									</div>
									<div>
										<div class="text-xs font-bold text-slate-900">
											ক্যাশ অন ডেলিভারি (Cash on Delivery)
										</div>
										<p class="text-[11px] text-slate-500 mt-0.5">
											পার্সেল হাতে পেয়ে ডেলিভারি ম্যানের সামনে চেক করে টাকা দিন
										</p>
									</div>
								</div>
								{#if paymentMethod === 'cod'}
									<div class="w-5 h-5 rounded-full bg-[#2563eb] text-white flex items-center justify-center">
										<Check class="w-3.5 h-3.5 stroke-[3]" />
									</div>
								{/if}
							</button>

							<!-- bKash / Nagad -->
							<button
								type="button"
								onclick={() => (paymentMethod = 'bkash')}
								class="w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between {paymentMethod === 'bkash'
									? 'border-[#2563eb] bg-blue-50/50 shadow-2xs ring-1 ring-[#2563eb]'
									: 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'}"
							>
								<div class="flex items-center gap-3">
									<div class="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold shrink-0">
										<CreditCard class="w-5 h-5" />
									</div>
									<div>
										<div class="text-xs font-bold text-slate-900">
											বিকাশ / নগদ (bKash / Nagad)
										</div>
										<p class="text-[11px] text-slate-500 mt-0.5">
											মোবাইল ব্যাংকিংয়ের মাধ্যমে প্রি-পেমেন্ট বা অগ্রিম পরিশোধ
										</p>
									</div>
								</div>
								{#if paymentMethod === 'bkash'}
									<div class="w-5 h-5 rounded-full bg-[#2563eb] text-white flex items-center justify-center">
										<Check class="w-3.5 h-3.5 stroke-[3]" />
									</div>
								{/if}
							</button>
						</CardContent>
					</Card>

				</div>

				<!-- RIGHT COLUMN: Order Summary Card (lg:col-span-5) -->
				<div class="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
					
					<Card class="rounded-2xl sm:rounded-3xl border-slate-200/90 shadow-sm overflow-hidden">
						
						<!-- Header -->
						<CardHeader class="p-5 sm:p-6 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
							<div class="flex items-center gap-2">
								<ShoppingBag class="w-4 h-4 text-[#2563eb]" />
								<CardTitle class="text-sm font-bold text-slate-900 font-['Outfit']">
									অর্ডার সারাংশ
								</CardTitle>
							</div>
							<Badge variant="secondary" class="text-xs font-bold">
								{cart.count} টি পণ্য
							</Badge>
						</CardHeader>

						<CardContent class="p-5 sm:p-6 space-y-4">
							<!-- Items List in Summary -->
							<div class="max-h-64 overflow-y-auto no-scrollbar space-y-3 pr-1">
								{#each cart.items as item (item.id)}
									<div class="flex items-center gap-3 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
										<img
											src={item.image}
											alt={item.name}
											class="w-12 h-12 rounded-lg object-contain bg-white border border-slate-100 p-0.5 shrink-0"
										/>
										<div class="flex-1 min-w-0">
											<h4 class="text-xs font-bold text-slate-900 truncate" title={item.name}>
												{item.name}
											</h4>
											<div class="text-[11px] text-slate-500 mt-0.5 font-mono">
												{item.quantity} × {formatTaka(item.price)}
											</div>
										</div>

										<!-- Qty adjusters with shadcn Button -->
										<div class="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden shadow-2xs shrink-0">
											<Button
												variant="ghost"
												size="icon"
												onclick={() => cart.updateQuantity(item.id, -1)}
												class="w-5 h-5 rounded-none text-slate-500 hover:bg-slate-100 p-0"
												aria-label="Decrease"
											>
												<Minus class="w-2.5 h-2.5" />
											</Button>
											<span class="w-5 text-center text-[11px] font-bold font-mono">
												{item.quantity}
											</span>
											<Button
												variant="ghost"
												size="icon"
												onclick={() => cart.updateQuantity(item.id, 1)}
												class="w-5 h-5 rounded-none text-slate-500 hover:bg-slate-100 p-0"
												aria-label="Increase"
											>
												<Plus class="w-2.5 h-2.5" />
											</Button>
										</div>

										<div class="text-xs font-black text-slate-900 font-mono shrink-0">
											{formatTaka(item.price * item.quantity)}
										</div>
									</div>
								{/each}
							</div>

							<Separator />

							<!-- Promo Coupon Code Box -->
							<div class="space-y-1">
								<div class="flex items-center gap-2">
									<div class="relative flex-1">
										<Tag class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
										<Input
											type="text"
											bind:value={couponInput}
											placeholder="কুপন কোড (AURA20)"
											class="pl-9 rounded-xl bg-slate-50 border-slate-200/90 uppercase font-mono tracking-wider text-xs"
										/>
									</div>
									<Button
										type="button"
										variant="default"
										onclick={handleApplyCoupon}
										class="h-auto py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 shadow-2xs"
									>
										প্রয়োগ
									</Button>
								</div>

								{#if cart.couponMessage}
									<div class="text-[11px] font-semibold {cart.discountPercent > 0 ? 'text-emerald-600' : 'text-rose-600'} px-1">
										{cart.couponMessage}
									</div>
								{/if}
							</div>

							<Separator />

							<!-- Pricing Breakdown -->
							<div class="space-y-2 text-xs text-slate-600">
								<div class="flex justify-between items-center">
									<span>সাবটোটাল</span>
									<span class="font-bold text-slate-900 font-mono">{formatTaka(cart.subtotal)}</span>
								</div>

								{#if cart.discountAmount > 0}
									<div class="flex justify-between items-center text-emerald-600 font-medium">
										<span>ডিসকাউন্ট ({cart.discountPercent}%)</span>
										<span class="font-bold font-mono">-{formatTaka(cart.discountAmount)}</span>
									</div>
								{/if}

								<div class="flex justify-between items-center">
									<span>ডেলিভারি চার্জ</span>
									{#if deliveryFee === 0}
										<Badge variant="outline" class="font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
											ফ্রি (FREE)
										</Badge>
									{:else}
										<span class="font-bold text-slate-900 font-mono">{formatTaka(deliveryFee)}</span>
									{/if}
								</div>

								<div class="flex justify-between items-center pt-3 border-t border-slate-200 text-sm">
									<span class="font-black text-slate-900">সর্বমোট প্রদেয় টাকা</span>
									<span class="font-black text-xl text-[#2563eb] font-mono">
										{formatTaka(grandTotal)}
									</span>
								</div>
							</div>

							<!-- Desktop Place Order Button -->
							<Button
								type="submit"
								variant="blue"
								disabled={isSubmitting}
								class="w-full h-auto py-3.5 rounded-2xl bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 cursor-pointer"
							>
								{#if isSubmitting}
									<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									<span>অর্ডার নিশ্চিত করা হচ্ছে...</span>
								{:else}
									<span class="text-white font-bold">অর্ডার নিশ্চিত করুন ({formatTaka(grandTotal)})</span>
									<ArrowRight class="w-4 h-4 text-white stroke-[2.5]" />
								{/if}
							</Button>

							<Separator />

							<!-- Trust Guarantees -->
							<div class="space-y-1.5 text-[11px] text-slate-500 font-medium">
								<div class="flex items-center gap-2">
									<ShieldCheck class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
									<span>পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধের সুবিধা</span>
								</div>
								<div class="flex items-center gap-2">
									<Truck class="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
									<span>১২-২৪ ঘণ্টার মধ্যে দ্রুততম এক্সপ্রেস ডেলিভারি</span>
								</div>
								<div class="flex items-center gap-2">
									<Sparkles class="w-3.5 h-3.5 text-amber-500 shrink-0" />
									<span>১০০% অথেনটিক এবং জেনুইন প্রডাক্ট গ্যারান্টি</span>
								</div>
							</div>
						</CardContent>

					</Card>

				</div>

				<!-- Mobile Sticky Bottom Floating Action Bar -->
				<div class="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl p-3 flex items-center justify-between gap-3">
					<div>
						<div class="text-[10px] text-slate-400 font-bold uppercase">সর্বমোট বিল</div>
						<div class="text-base font-black text-[#2563eb] font-mono leading-tight">
							{formatTaka(grandTotal)}
						</div>
					</div>
					<Button
						type="submit"
						variant="blue"
						disabled={isSubmitting}
						class="flex-1 h-auto py-3 px-4 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-98 cursor-pointer"
					>
						{#if isSubmitting}
							<div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							<span>প্রসেসিং...</span>
						{:else}
							<span class="text-white font-bold">অর্ডার নিশ্চিত করুন</span>
							<ArrowRight class="w-3.5 h-3.5 text-white stroke-[2.5]" />
						{/if}
					</Button>
				</div>

			</form>
		{/if}

	</div>

</StoreLayout>
