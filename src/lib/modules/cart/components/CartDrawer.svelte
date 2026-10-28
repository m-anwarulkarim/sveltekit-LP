<script lang="ts">
	import { cart } from '../cart.svelte';
	import {
		Button,
		Input,
		Badge,
		Separator,
		Progress
	} from '#lib/components/ui';
	import {
		X,
		Trash2,
		Plus,
		Minus,
		ShoppingBag,
		ArrowRight,
		Tag,
		ShieldCheck,
		Sparkles,
		Truck,
		Zap
	} from 'lucide-svelte';

	interface Props {
		onCheckout?: () => void;
	}

	let { onCheckout }: Props = $props();
	let couponInput = $state('');

	function handleApplyCoupon() {
		if (!couponInput.trim()) return;
		cart.applyCoupon(couponInput);
	}

	function formatTaka(amount: number) {
		return `৳${amount.toLocaleString('en-BD')}`;
	}

	const freeShippingThreshold = 600;
	const remainingForFreeShipping = $derived(
		Math.max(0, freeShippingThreshold - cart.subtotal)
	);
	const freeShippingProgress = $derived(
		Math.min(100, Math.round((cart.subtotal / freeShippingThreshold) * 100))
	);
</script>

{#if cart.isOpen}
	<!-- Backdrop with smooth fade -->
	<div
		onclick={() => cart.closeCart()}
		onkeydown={(e) => e.key === 'Escape' && cart.closeCart()}
		role="button"
		tabindex="0"
		class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
		aria-label="Close cart backdrop"
	></div>

	<!-- Drawer Container (Light Modern E-Commerce Design) -->
	<aside
		class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200/90 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 font-['Anek_Bangla',sans-serif]"
		aria-label="Shopping Cart Drawer"
	>
		<!-- 1. Header -->
		<div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center font-bold shadow-xs">
					<ShoppingBag class="w-5 h-5" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h3 class="text-base font-bold text-slate-900 font-['Outfit']">আপনার শপিং ব্যাগ</h3>
						<Badge variant="blue" class="px-2 py-0.5 text-xs font-bold rounded-full">
							{cart.count} টি
						</Badge>
					</div>
					<p class="text-xs text-slate-500 font-medium">১২-২৪ ঘণ্টায় এক্সপ্রেস হোম ডেলিভারি</p>
				</div>
			</div>

			<Button
				variant="ghost"
				size="icon"
				onclick={() => cart.closeCart()}
				class="w-8 h-8 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100"
				aria-label="Close cart"
			>
				<X class="w-4 h-4" />
			</Button>
		</div>

		<!-- 2. Free Express Delivery Threshold Bar using shadcn Progress & Badge -->
		<div class="px-5 py-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border-b border-slate-100">
			<div class="flex items-center justify-between text-xs mb-2 font-medium">
				{#if cart.subtotal >= freeShippingThreshold}
					<span class="text-emerald-700 font-bold flex items-center gap-1.5">
						<Sparkles class="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
						🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন!
					</span>
				{:else}
					<span class="text-slate-700">
						আর মাত্র <strong class="text-[#2563eb] font-bold">{formatTaka(remainingForFreeShipping)}</strong> যোগ করলেই ফ্রি ডেলিভারি!
					</span>
				{/if}
				<Badge variant="outline" class="text-[10px] font-bold text-slate-600 font-mono py-0 px-1.5">
					{freeShippingProgress}%
				</Badge>
			</div>
			<!-- Progress Bar -->
			<Progress value={freeShippingProgress} class="h-1.5 bg-slate-200" />
		</div>

		<!-- 3. Cart Items List -->
		<div class="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
			{#if cart.items.length === 0}
				<div class="text-center py-16 flex flex-col items-center gap-3">
					<div class="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
						<ShoppingBag class="w-8 h-8 stroke-[1.5]" />
					</div>
					<div class="space-y-1">
						<h4 class="text-base font-bold text-slate-900 font-['Outfit']">আপনার ব্যাগটি এখন খালি</h4>
						<p class="text-xs text-slate-500 max-w-xs">
							আপনার পছন্দের পণ্যগুলো কার্টে যুক্ত করুন এবং দ্রুততম হোম ডেলিভারির সুবিধা নিন।
						</p>
					</div>
					<Button
						variant="blue"
						onclick={() => cart.closeCart()}
						class="mt-2 h-auto px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
					>
						পণ্য ব্রাউজ করুন
					</Button>
				</div>
			{:else}
				{#each cart.items as item (item.id)}
					<div class="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex gap-3.5 items-center group">
						<!-- Product Thumbnail -->
						<img
							src={item.image}
							alt={item.name}
							class="w-16 h-16 rounded-xl object-contain border border-slate-100 bg-slate-50/70 p-1 shrink-0"
						/>

						<!-- Details -->
						<div class="flex-1 min-w-0">
							<Badge variant="secondary" class="text-[10px] font-bold text-[#2563eb] uppercase tracking-wider py-0 px-1.5 mb-0.5 truncate">
								{item.category}
							</Badge>
							<h4 class="text-xs sm:text-[13px] font-bold text-slate-900 truncate" title={item.name}>
								{item.name}
							</h4>
							<div class="text-xs font-black text-slate-900 mt-1 font-mono">
								{formatTaka(item.price)}
							</div>

							<!-- Quantity Adjusters & Delete using shadcn Button -->
							<div class="flex items-center justify-between mt-2">
								<div class="flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs">
									<Button
										variant="ghost"
										size="icon"
										onclick={() => cart.updateQuantity(item.id, -1)}
										class="w-6 h-6 rounded-none text-slate-600 hover:bg-slate-200 p-0"
										aria-label="Decrease quantity"
									>
										<Minus class="w-3 h-3" />
									</Button>
									<span class="w-7 text-center text-xs font-bold text-slate-900 font-mono">
										{item.quantity}
									</span>
									<Button
										variant="ghost"
										size="icon"
										onclick={() => cart.updateQuantity(item.id, 1)}
										class="w-6 h-6 rounded-none text-slate-600 hover:bg-slate-200 p-0"
										aria-label="Increase quantity"
									>
										<Plus class="w-3 h-3" />
									</Button>
								</div>

								<Button
									variant="ghost"
									size="icon"
									onclick={() => cart.removeItem(item.id)}
									class="w-7 h-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-0"
									title="মুছে ফেলুন"
									aria-label="Remove item"
								>
									<Trash2 class="w-3.5 h-3.5" />
								</Button>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- 4. Footer & Checkout Section -->
		{#if cart.items.length > 0}
			<div class="p-5 border-t border-slate-100 bg-white space-y-3.5 shadow-lg">
				
				<!-- Promo Code Input using shadcn Input & Button -->
				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<div class="relative flex-1">
							<Tag class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
							<Input
								type="text"
								bind:value={couponInput}
								placeholder="কুপন কোড (যেমন: AURA20)"
								class="pl-9 rounded-xl bg-slate-50 border-slate-200/90 uppercase font-mono tracking-wider text-xs"
							/>
						</div>
						<Button
							type="button"
							variant="default"
							onclick={handleApplyCoupon}
							class="h-auto py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 shadow-2xs"
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

				<!-- Pricing Summary -->
				<div class="space-y-1.5 text-xs text-slate-600 pt-1">
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
						<span class="flex items-center gap-1">
							<Truck class="w-3.5 h-3.5 text-slate-400" />
							ডেলিভারি চার্জ
						</span>
						{#if cart.deliveryCharge === 0}
							<Badge variant="outline" class="font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
								ফ্রি (FREE)
							</Badge>
						{:else}
							<span class="font-bold text-slate-900 font-mono">{formatTaka(cart.deliveryCharge)}</span>
						{/if}
					</div>

					<div class="flex justify-between items-center pt-2 border-t border-slate-100">
						<span class="text-sm font-black text-slate-900">সর্বমোট (Total)</span>
						<span class="text-base sm:text-lg font-black text-[#2563eb] font-mono">
							{formatTaka(cart.total)}
						</span>
					</div>
				</div>

				<!-- Primary Checkout Button linking to /checkout with shadcn Button -->
				<Button
					variant="blue"
					href="/checkout"
					onclick={() => cart.closeCart()}
					class="w-full h-auto py-3.5 rounded-2xl text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98"
				>
					<span>অর্ডার সম্পন্ন করুন</span>
					<ArrowRight class="w-4 h-4 stroke-[2.5]" />
				</Button>

				<!-- Trust Guarantee Footnote -->
				<div class="flex items-center justify-center gap-3 text-[11px] text-slate-400 pt-1 font-medium">
					<span class="flex items-center gap-1">
						<ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
						ক্যাশ অন ডেলিভারি
					</span>
					<span>•</span>
					<span class="flex items-center gap-1">
						<Zap class="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
						১২-২৪ ঘণ্টা ডেলিভারি
					</span>
				</div>

			</div>
		{/if}

	</aside>
{/if}
