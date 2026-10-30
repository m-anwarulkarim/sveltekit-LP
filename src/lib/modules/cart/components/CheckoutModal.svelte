<script lang="ts">
	import { cart } from '../cart.svelte';
	import { goto } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import { trackMetaEvent } from '#lib/client/meta-pixel';
	import { trackGtmBeginCheckout } from '#lib/client/gtm';
	import { getAttributionSource } from '#lib/client/attribution';
	import { toast } from 'svelte-sonner';
	import { Button, Badge, Input, Textarea } from '#lib/components/ui';
	import {
		Lock,
		ArrowRight,
		X,
		Phone,
		MapPin,
		Check
	} from 'lucide-svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		enableBkash?: boolean;
	}

	let { isOpen, onClose, enableBkash = false }: Props = $props();

	let name = $state('');
	let phone = $state('');
	let address = $state('');
	let city = $state('ঢাকা (Dhaka)');
	let paymentMethod = $state<'cod' | 'bkash'>('cod');
	let isSubmitting = $state(false);

	function formatTaka(amount: number) {
		return `৳${amount.toLocaleString('en-BD')}`;
	}

	$effect(() => {
		if (isOpen && cart.items.length > 0 && typeof window !== 'undefined') {
			trackMetaEvent('InitiateCheckout', {
				content_ids: cart.items.map((i) => String(i.id)),
				content_type: 'product',
				num_items: cart.items.length,
				value: Number(cart.total),
				currency: 'BDT'
			});

			trackGtmBeginCheckout({
				items: cart.items.map((i) => ({
					item_id: String(i.id),
					item_name: i.name,
					price: Number(i.price) || 0,
					quantity: Number(i.quantity) || 1,
					item_category: i.category || 'General',
					item_variant: i.variantName || undefined
				})),
				total: Number(cart.total),
				coupon: cart.couponCode || undefined
			});
		}
	});

	let incompleteTimer: any = null;
	function triggerIncompleteCapture() {
		if (incompleteTimer) clearTimeout(incompleteTimer);
		incompleteTimer = setTimeout(async () => {
			const cleanPhone = phone.trim().replace(/\D/g, '');
			if (cleanPhone.length >= 10 && cart.items.length > 0) {
				try {
					await fetch('/api/checkout/incomplete', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							customerName: name.trim() || 'অপরিচিত কাস্টমার',
							customerPhone: phone.trim(),
							shippingAddress: address.trim() || 'ঠিকানা দেওয়া হয়নি',
							deliveryArea: city.includes('ঢাকা') ? 'inside_dhaka' : 'outside_dhaka',
							items: cart.items,
							subtotal: cart.subtotal,
							deliveryCharge: city.includes('ঢাকা') ? 60 : 120,
							total: cart.total,
							source: getAttributionSource()
						})
					});
				} catch (err) {
					// silent fallback
				}
			}
		}, 1200);
	}

	async function handleCheckoutSubmit(e: Event) {
		e.preventDefault();
		if (!name.trim() || !phone.trim() || !address.trim()) return;

		isSubmitting = true;

		try {
			const formData = new FormData();
			formData.append('customerName', name.trim());
			formData.append('customerPhone', phone.trim());
			formData.append('shippingAddress', address.trim());
			formData.append('deliveryArea', city.includes('ঢাকা') ? 'inside_dhaka' : 'outside_dhaka');
			formData.append('paymentMethod', paymentMethod);
			formData.append('orderNote', '');
			formData.append('website_url', '');
			formData.append('source', getAttributionSource());
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

			const response = await fetch('/checkout?/placeOrder', {
				method: 'POST',
				headers: {
					'x-sveltekit-action': 'true'
				},
				body: formData
			});

			const result = deserialize(await response.text());
			let confirmedId = `AURA-${Math.floor(100000 + Math.random() * 900000)}`;
			let orderTotal = cart.total;

			if (result.type === 'success' && result.data) {
				const d = result.data as any;
				confirmedId = d.orderNumber || d.orderId || confirmedId;
				orderTotal = d.total || orderTotal;

				// Snapshot order details before clearing cart
				const orderSnapshot = {
					orderId: confirmedId,
					customerName: name.trim(),
					customerPhone: phone.trim(),
					customerAddress: address.trim(),
					customerCity: city,
					paymentMethod: paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'বিকাশ অনলাইন পেমেন্ট (bKash)',
					items: [...cart.items],
					subtotal: cart.subtotal,
					deliveryCharge: cart.deliveryCharge,
					discountAmount: cart.discountAmount,
					total: orderTotal,
					createdAt: new Date().toISOString()
				};

				// If customer chose bKash, initialize bKash PGW URL
				if (paymentMethod === 'bkash' && d.orderId) {
					try {
						const bkashRes = await fetch('/api/payment/bkash/create', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								orderId: d.orderId,
								orderNumber: d.orderNumber || confirmedId,
								amount: orderTotal,
								customerPhone: phone.trim()
							})
						});
						const bkashData = await bkashRes.json();
						if (bkashData.success && bkashData.bkashURL) {
							cart.setLastOrder(orderSnapshot);
							cart.clear();
							isSubmitting = false;
							onClose();
							window.location.href = bkashData.bkashURL;
							return;
						} else {
							toast.error(bkashData.message || 'বিকাশ গেটওয়ে সংযোগে সমস্যা হয়েছে');
						}
					} catch (bkErr) {
						console.error('Failed to trigger bKash redirect:', bkErr);
					}
				}

				// Save snapshot for thank-you page
				cart.setLastOrder(orderSnapshot);
				cart.clear();
				isSubmitting = false;
				onClose();

				// Navigate to dedicated Thank You Page
				goto(`/thank-you?order_id=${confirmedId}`);
				return;
			}
		} catch (error) {
			console.error('Checkout submit error:', error);
			const fallbackId = `AURA-${Math.floor(100000 + Math.random() * 900000)}`;
			cart.clear();
			isSubmitting = false;
			onClose();
			goto(`/thank-you?order_id=${fallbackId}`);
		}
	}

	function handleClose() {
		if (isSubmitting) return;
		onClose();
	}
</script>

{#if isOpen}
	<!-- Backdrop with smooth blur -->
	<div
		onclick={(e) => e.target === e.currentTarget && handleClose()}
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
		role="button"
		tabindex="0"
		class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in font-['Anek_Bangla',sans-serif]"
		aria-label="Close checkout modal"
	>
		<!-- Modal Card (Modern Light E-Commerce) -->
		<div
			role="document"
			class="relative w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto no-scrollbar"
		>
			<!-- Close Button using shadcn Button -->
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onclick={handleClose}
				class="absolute top-4 right-4 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full h-8 w-8 p-0 cursor-pointer"
				aria-label="Close modal"
			>
				<X class="w-4 h-4" />
			</Button>

			<!-- Header -->
			<div class="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
				<div class="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center font-bold shadow-xs">
					<Lock class="w-5 h-5" />
				</div>
				<div>
					<h3 class="text-lg font-bold text-slate-900 font-['Outfit']">অর্ডার কনফার্ম করুন</h3>
					<p class="text-xs text-slate-500 font-medium">১২-২৪ ঘণ্টার মধ্যে এক্সপ্রেস ডেলিভারি পেতে নিচের তথ্য দিন</p>
				</div>
			</div>

			<!-- Checkout Form -->
			<form onsubmit={handleCheckoutSubmit} class="space-y-4">
				
				<!-- Customer Name & Phone using shadcn Input -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
					<div>
						<label for="checkout-name" class="block text-xs font-bold text-slate-700 mb-1.5">
							আপনার পূর্ণ নাম <span class="text-rose-500">*</span>
						</label>
						<Input
							id="checkout-name"
							type="text"
							required
							bind:value={name}
							placeholder="যেমন: সাকিব আল হাসান"
							class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-slate-200/90 text-xs text-slate-900 focus-visible:border-[#2563eb] focus-visible:bg-white font-medium"
						/>
					</div>

					<div>
						<label for="checkout-phone" class="block text-xs font-bold text-slate-700 mb-1.5">
							মোবাইল নম্বর <span class="text-rose-500">*</span>
						</label>
						<div class="relative">
							<Phone class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
							<Input
								id="checkout-phone"
								type="tel"
								required
								bind:value={phone}
								oninput={triggerIncompleteCapture}
								onblur={triggerIncompleteCapture}
								placeholder="017xxxxxxxx"
								class="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border-slate-200/90 text-xs text-slate-900 font-mono focus-visible:border-[#2563eb] focus-visible:bg-white font-medium"
							/>
						</div>
					</div>
				</div>

				<!-- Delivery Address using shadcn Textarea -->
				<div>
					<label for="checkout-address" class="block text-xs font-bold text-slate-700 mb-1.5">
						ডেলিভারির পূর্ণ ঠিকানা <span class="text-rose-500">*</span>
					</label>
					<div class="relative">
						<MapPin class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 z-10" />
						<Textarea
							id="checkout-address"
							required
							rows={2}
							bind:value={address}
							placeholder="বাড়ি/ফ্ল্যাট নম্বর, রোড, এলাকা, থানার নাম..."
							class="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border-slate-200/90 text-slate-900 focus-visible:border-[#2563eb] focus-visible:bg-white font-medium resize-none min-h-[4rem]"
						/>
					</div>
				</div>

				<!-- City / District Selector -->
				<div>
					<label for="checkout-city" class="block text-xs font-bold text-slate-700 mb-1.5">
						জেলা / শহর
					</label>
					<select
						id="checkout-city"
						bind:value={city}
						class="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200/90 text-slate-800 font-medium focus:outline-none focus:border-[#2563eb] cursor-pointer"
					>
						<option value="ঢাকা (Dhaka)">ঢাকা (Dhaka)</option>
						<option value="চট্টগ্রাম (Chattogram)">চট্টগ্রাম (Chattogram)</option>
						<option value="সিলেট (Sylhet)">সিলেট (Sylhet)</option>
						<option value="রাজশাহী (Rajshahi)">রাজশাহী (Rajshahi)</option>
						<option value="খুলনা (Khulna)">খুলনা (Khulna)</option>
						<option value="বরিশাল (Barishal)">বরিশাল (Barishal)</option>
						<option value="রংপুর (Rangpur)">রংপুর (Rangpur)</option>
						<option value="ময়মনসিংহ (Mymensingh)">ময়মনসিংহ (Mymensingh)</option>
						<option value="অন্যান্য জেলা">অন্যান্য জেলা (All BD)</option>
					</select>
				</div>

				<!-- Payment Method Selection -->
				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1.5">পেমেন্ট মেথড</label>
					<div class="grid {enableBkash ? 'grid-cols-2' : 'grid-cols-1'} gap-3">
						<!-- Cash on Delivery (Default) -->
						<button
							type="button"
							onclick={() => (paymentMethod = 'cod')}
							class="p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between {paymentMethod === 'cod'
								? 'border-[#2563eb] bg-blue-50/50 shadow-2xs ring-1 ring-[#2563eb]'
								: 'border-slate-200 bg-white hover:bg-slate-50'}"
						>
							<div class="flex items-center justify-between mb-1">
								<div class="flex items-center gap-1.5">
									<span class="text-xs font-bold text-slate-900">ক্যাশ অন ডেলিভারি (COD)</span>
									<span class="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-bold">ডিফল্ট</span>
								</div>
								{#if paymentMethod === 'cod'}
									<div class="w-4 h-4 rounded-full bg-[#2563eb] text-white flex items-center justify-center">
										<Check class="w-3 h-3 stroke-[3]" />
									</div>
								{/if}
							</div>
							<p class="text-[11px] text-slate-500">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন</p>
						</button>

						<!-- bKash (Only if enabled) -->
						{#if enableBkash}
							<button
								type="button"
								onclick={() => (paymentMethod = 'bkash')}
								class="p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between {paymentMethod === 'bkash'
									? 'border-[#2563eb] bg-blue-50/50 shadow-2xs ring-1 ring-[#2563eb]'
									: 'border-slate-200 bg-white hover:bg-slate-50'}"
							>
								<div class="flex items-center justify-between mb-1">
									<span class="text-xs font-bold text-slate-900">বিকাশ পেমেন্ট</span>
									{#if paymentMethod === 'bkash'}
										<div class="w-4 h-4 rounded-full bg-[#2563eb] text-white flex items-center justify-center">
											<Check class="w-3 h-3 stroke-[3]" />
										</div>
									{/if}
								</div>
								<p class="text-[11px] text-slate-500">অনলাইন ইনস্ট্যান্ট মোবাইল ব্যাংকিং</p>
							</button>
						{/if}
					</div>
				</div>

				<!-- Mini Order Summary Card -->
				<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
					<div class="flex justify-between text-slate-600">
						<span>আইটেম সংখ্যা:</span>
						<span class="font-bold text-slate-900">{cart.count} টি</span>
					</div>
					<div class="flex justify-between text-slate-600">
						<span>সাবটোটাল:</span>
						<span class="font-bold text-slate-900 font-mono">{formatTaka(cart.subtotal)}</span>
					</div>
					{#if cart.discountAmount > 0}
						<div class="flex justify-between text-emerald-600">
							<span>ডিসকাউন্ট:</span>
							<span class="font-bold font-mono">-{formatTaka(cart.discountAmount)}</span>
						</div>
					{/if}
					<div class="flex justify-between text-slate-600">
						<span>ডেলিভারি চার্জ:</span>
						{#if cart.deliveryCharge === 0}
							<Badge variant="outline" class="font-bold text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] px-1.5 py-0">
								ফ্রি (FREE)
							</Badge>
						{:else}
							<span class="font-bold text-slate-900 font-mono">{formatTaka(cart.deliveryCharge)}</span>
						{/if}
					</div>
					<div class="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
						<span class="font-black text-slate-900">সর্বমোট প্রদেয়:</span>
						<span class="font-black text-lg text-[#2563eb] font-mono">{formatTaka(cart.total)}</span>
					</div>
				</div>

				<!-- Submit Button with shadcn Button -->
				<Button
					type="submit"
					variant="blue"
					disabled={isSubmitting}
					class="w-full h-auto py-3.5 rounded-2xl text-white text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 active:scale-98 cursor-pointer disabled:opacity-50"
				>
					{#if isSubmitting}
						<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
						<span>অর্ডার প্রসেস হচ্ছে...</span>
					{:else}
						<span>অর্ডার নিশ্চিত করুন ({formatTaka(cart.total)})</span>
						<ArrowRight class="w-4 h-4 stroke-[2.5]" />
					{/if}
				</Button>

				<!-- Assurance -->
				<p class="text-[11px] text-center text-slate-400 font-medium">
					🔒 ১০০% নিরাপদ চেকআউট • কোনো প্রি-পেমেন্ট বা কার্ডের প্রয়োজন নেই
				</p>

			</form>
		</div>
	</div>
{/if}
