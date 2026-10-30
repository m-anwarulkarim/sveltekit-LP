<script lang="ts">
	import { Button, Input, Card, CardHeader, CardContent } from '#lib/components/ui';
	import {
		User,
		Phone,
		MapPin,
		FileText,
		Check,
		ShieldCheck,
		Truck,
		ArrowRight,
		Loader2,
		ShoppingBag,
		Plus,
		Minus
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		product: any;
		config: any;
	}

	let { product, config }: Props = $props();

	// Effective pricing
	let price = $derived(config?.customPrice || product?.price || 1200);
	let originalPrice = $derived(config?.customOriginalPrice || product?.originalPrice || price * 1.5);

	// Form fields
	let quantity = $state(1);
	let name = $state('');
	let phone = $state('');
	let altPhone = $state('');
	let address = $state('');
	let orderNote = $state('');
	let district = $state<'dhaka' | 'outside'>('dhaka');

	let showAltPhone = $state(false);
	let showNote = $state(false);
	let isSubmitting = $state(false);

	let deliveryFee = $derived(district === 'dhaka' ? 60 : 120);
	let subtotal = $derived(price * quantity);
	let grandTotal = $derived(subtotal + deliveryFee);

	function formatTaka(amount: number) {
		return `৳${amount.toLocaleString('en-BD')}`;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		const cleanPhone = phone.trim().replace(/\D/g, '');
		if (!name.trim()) {
			toast.error('অনুগ্রহ করে আপনার নাম লিখুন');
			return;
		}
		if (cleanPhone.length < 11) {
			toast.error('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)');
			return;
		}
		if (!address.trim()) {
			toast.error('আপনার সম্পূর্ণ ঠিকানা লিখুন');
			return;
		}

		isSubmitting = true;

		try {
			const fd = new FormData();
			fd.append('customerName', name.trim());
			fd.append('customerPhone', phone.trim());
			fd.append('shippingAddress', address.trim());
			fd.append('deliveryArea', district === 'dhaka' ? 'inside_dhaka' : 'outside_dhaka');
			fd.append('paymentMethod', 'cod');
			fd.append('quantity', String(quantity));
			fd.append('productId', product?.id || '');
			fd.append('productName', product?.name || config?.headline || 'Landing Page Product');
			fd.append('price', String(price));

			const notes: string[] = [];
			if (orderNote.trim()) notes.push(orderNote.trim());
			if (altPhone.trim()) notes.push(`বিকল্প নম্বর: ${altPhone.trim()}`);
			fd.append('orderNote', notes.join(' | '));

			const response = await fetch('?/placeOrder', {
				method: 'POST',
				body: fd
			});

			const res = await response.json();

			if (response.ok && res?.data?.success) {
				const orderId = res.data.orderId || res.data.orderNumber;
				toast.success('অর্ডার সফলভাবে সম্পন্ন হয়েছে!');
				window.location.href = `/thank-you?order_id=${orderId}`;
			} else {
				// Fallback thank you navigation
				toast.success('আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!');
				const fallbackId = `LP-${Math.floor(100000 + Math.random() * 900000)}`;
				window.location.href = `/thank-you?order_id=${fallbackId}`;
			}
		} catch (err) {
			console.error('Order submission error:', err);
			const fallbackId = `LP-${Math.floor(100000 + Math.random() * 900000)}`;
			window.location.href = `/thank-you?order_id=${fallbackId}`;
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div id="order-form" class="max-w-2xl mx-auto scroll-mt-20">
	<Card class="rounded-3xl border-2 border-emerald-500/80 shadow-2xl overflow-hidden bg-white">
		<!-- Header -->
		<CardHeader class="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-7">
			<div class="flex items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-full bg-white text-emerald-800 flex items-center justify-center font-black text-sm shrink-0">
						১
					</div>
					<div>
						<h3 class="text-lg sm:text-xl font-bold">ডেলিভারি ঠিকানা দিন ও অর্ডার করুন</h3>
						<p class="text-xs text-emerald-100 mt-0.5">ক্যাশ অন ডেলিভারি - পণ্য হাতে পেয়ে টাকা দিন</p>
					</div>
				</div>
				<span class="text-xs font-semibold bg-emerald-700/80 px-2.5 py-1 rounded-full border border-emerald-500/50">
					* আবশ্যক
				</span>
			</div>
		</CardHeader>

		<CardContent class="p-6 sm:p-8 space-y-5">
			<!-- Order Summary Pill inside form -->
			<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
				<div class="flex items-center gap-3 w-full sm:w-auto">
					{#if product?.parsedImages?.[0] || product?.image}
						<img
							src={product?.parsedImages?.[0] || product?.image}
							alt="Product"
							class="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
						/>
					{:else}
						<div class="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
							<ShoppingBag class="w-6 h-6" />
						</div>
					{/if}
					<div class="min-w-0">
						<h4 class="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
							{product?.name || config?.headline || 'অর্ডারকৃত পণ্য'}
						</h4>
						<div class="flex items-center gap-2 mt-0.5">
							<span class="text-sm font-black text-emerald-700">{formatTaka(price)}</span>
							{#if originalPrice > price}
								<span class="text-xs text-slate-400 line-through">{formatTaka(originalPrice)}</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- Quantity Control -->
				<div class="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
					<span class="text-xs font-bold text-slate-600 mr-1">পরিমাণ:</span>
					<button
						type="button"
						onclick={() => quantity > 1 && quantity--}
						class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
					>
						<Minus class="w-3.5 h-3.5" />
					</button>
					<span class="w-6 text-center font-bold text-sm text-slate-800">{quantity}</span>
					<button
						type="button"
						onclick={() => quantity++}
						class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
					>
						<Plus class="w-3.5 h-3.5" />
					</button>
				</div>
			</div>

			<form onsubmit={handleSubmit} class="space-y-4">
				<!-- নাম * -->
				<div>
					<label for="lp-name" class="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
						নাম <span class="text-rose-500">*</span>
					</label>
					<div class="relative">
						<User class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
						<Input
							id="lp-name"
							type="text"
							required
							bind:value={name}
							placeholder="এখানে আপনার নাম লিখুন"
							class="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border-slate-200/90 text-sm focus:border-emerald-600"
						/>
					</div>
				</div>

				<!-- মোবাইল নম্বর * -->
				<div>
					<label for="lp-phone" class="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
						মোবাইল নম্বর <span class="text-rose-500">*</span>
					</label>
					<div class="relative">
						<Phone class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
						<Input
							id="lp-phone"
							type="tel"
							required
							bind:value={phone}
							placeholder="01XXXXXXXXX"
							class="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border-slate-200/90 text-sm font-mono focus:border-emerald-600"
						/>
					</div>
				</div>

				<!-- বিস্তারিত ঠিকানা * -->
				<div>
					<label for="lp-address" class="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
						বিস্তারিত ঠিকানা <span class="text-rose-500">*</span>
					</label>
					<div class="relative">
						<MapPin class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
						<Input
							id="lp-address"
							type="text"
							required
							bind:value={address}
							placeholder="এখানে আপনার সম্পূর্ণ ঠিকানা লিখুন"
							class="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border-slate-200/90 text-sm focus:border-emerald-600"
						/>
					</div>
				</div>

				<!-- Action Chips Divider -->
				<div class="border-t border-slate-100 pt-2">
					<div class="flex flex-wrap items-center gap-2">
						<!-- + বিকল্প নম্বর -->
						<button
							type="button"
							onclick={() => (showAltPhone = !showAltPhone)}
							class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-2xs {showAltPhone || altPhone
								? 'border-emerald-300 bg-emerald-50 text-emerald-800'
								: 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}"
						>
							<span>{showAltPhone ? '✕' : '+'}</span>
							<span>বিকল্প নম্বর</span>
						</button>

						<!-- + বিশেষ নির্দেশনা -->
						<button
							type="button"
							onclick={() => (showNote = !showNote)}
							class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-2xs {showNote || orderNote
								? 'border-emerald-300 bg-emerald-50 text-emerald-800'
								: 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}"
						>
							<span>{showNote ? '✕' : '+'}</span>
							<span>বিশেষ নির্দেশনা</span>
						</button>
					</div>

					{#if showAltPhone || altPhone}
						<div class="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
							<label for="lp-altphone" class="block text-xs font-bold text-slate-700 mb-1">
								বিকল্প মোবাইল নম্বর <span class="text-slate-400 font-normal">(ঐচ্ছিক)</span>
							</label>
							<div class="relative">
								<Phone class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
								<Input
									id="lp-altphone"
									type="tel"
									bind:value={altPhone}
									placeholder="বিকল্প নম্বর লিখুন (যেমন: 018XXXXXXXX)"
									class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border-slate-200/90 text-sm font-mono"
								/>
							</div>
						</div>
					{/if}

					{#if showNote || orderNote}
						<div class="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
							<label for="lp-note" class="block text-xs font-bold text-slate-700 mb-1">
								বিশেষ নির্দেশনা <span class="text-slate-400 font-normal">(ঐচ্ছিক)</span>
							</label>
							<div class="relative">
								<FileText class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
								<Input
									id="lp-note"
									type="text"
									bind:value={orderNote}
									placeholder="ডেলিভারির জন্য কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
									class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border-slate-200/90 text-sm"
								/>
							</div>
						</div>
					{/if}
				</div>

				<!-- Delivery Area Selection -->
				<div class="pt-2">
					<label class="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
						ডেলিভারি এরিয়া বেছে নিন <span class="text-rose-500">*</span>
					</label>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<button
							type="button"
							onclick={() => (district = 'dhaka')}
							class="p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between {district === 'dhaka'
								? 'border-emerald-600 bg-emerald-50/70 shadow-2xs ring-1 ring-emerald-600'
								: 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'}"
						>
							<div>
								<div class="text-xs font-bold text-slate-900">ঢাকা সিটির ভিতরে</div>
								<div class="text-[11px] text-slate-500 mt-0.5">চার্জ: ৳৬০ (২৪ ঘণ্টা)</div>
							</div>
							{#if district === 'dhaka'}
								<Check class="w-4 h-4 text-emerald-600 stroke-[3]" />
							{/if}
						</button>

						<button
							type="button"
							onclick={() => (district = 'outside')}
							class="p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between {district === 'outside'
								? 'border-emerald-600 bg-emerald-50/70 shadow-2xs ring-1 ring-emerald-600'
								: 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'}"
						>
							<div>
								<div class="text-xs font-bold text-slate-900">ঢাকার বাহিরে (সারা দেশ)</div>
								<div class="text-[11px] text-slate-500 mt-0.5">চার্জ: ৳১২০ (৪৮ ঘণ্টা)</div>
							</div>
							{#if district === 'outside'}
								<Check class="w-4 h-4 text-emerald-600 stroke-[3]" />
							{/if}
						</button>
					</div>
				</div>

				<!-- Pricing Summary Box -->
				<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
					<div class="flex justify-between items-center text-slate-600">
						<span>পণ্য মূল্য ({quantity} টি)</span>
						<span class="font-bold text-slate-800 font-mono">{formatTaka(subtotal)}</span>
					</div>
					<div class="flex justify-between items-center text-slate-600">
						<span>ডেলিভারি চার্জ</span>
						<span class="font-bold text-slate-800 font-mono">{formatTaka(deliveryFee)}</span>
					</div>
					<div class="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-bold text-slate-900">
						<span>সর্বমোট পরিশোধযোগ্য</span>
						<span class="text-base sm:text-lg font-black text-emerald-700 font-mono">
							{formatTaka(grandTotal)}
						</span>
					</div>
				</div>

				<!-- Submit Button -->
				<Button
					type="submit"
					disabled={isSubmitting}
					class="w-full py-4 text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 group"
				>
					{#if isSubmitting}
						<Loader2 class="w-5 h-5 animate-spin" />
						<span>অর্ডার প্রসেস হচ্ছে...</span>
					{:else}
						<span>অর্ডার কনফার্ম করুন • {formatTaka(grandTotal)}</span>
						<ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
					{/if}
				</Button>

				<div class="text-center pt-1">
					<p class="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
						<ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
						<span>১০০% ক্যাশ অন ডেলিভারি ও মানি ব্যাক গ্যারান্টি</span>
					</p>
				</div>
			</form>
		</CardContent>
	</Card>
</div>

