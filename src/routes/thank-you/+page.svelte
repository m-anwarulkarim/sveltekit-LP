<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import { cart, type OrderDetails } from '#lib/modules/cart/cart.svelte';
	import {
		Button,
		Badge,
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		Separator
	} from '#lib/components/ui';
	import {
		CheckCircle2,
		PackageCheck,
		Truck,
		PhoneCall,
		Copy,
		Check,
		Home,
		ArrowRight,
		Clock,
		MapPin,
		ShieldCheck,
		Sparkles
	} from 'lucide-svelte';
	import { trackMetaEvent } from '#lib/client/meta-pixel';

	let { data }: { data: PageData } = $props();

	let order = $state<OrderDetails | null>(null);
	let isCopied = $state(false);

	const displayOrderId = $derived(data.dbOrder?.orderNumber || order?.orderId || data.orderId || '1001');

	onMount(() => {
		order = cart.loadLastOrder();

		// Idempotent Browser Purchase Event Tracking (Single fire guard per Order ID)
		const effectiveOrderId = displayOrderId;
		if (effectiveOrderId && typeof window !== 'undefined') {
			const trackKey = `fb_tracked_purchase_${effectiveOrderId}`;
			if (!sessionStorage.getItem(trackKey)) {
				sessionStorage.setItem(trackKey, 'true');
				let items = order?.items || [];
				if ((!items || items.length === 0) && data.dbOrder?.items) {
					try {
						items = typeof data.dbOrder.items === 'string' ? JSON.parse(data.dbOrder.items) : data.dbOrder.items;
					} catch {
						items = [];
					}
				}
				const contentIds = items.map((i: any) => String(i.sku || i.id || i.productId));
				trackMetaEvent(
					'Purchase',
					{
						content_type: 'product',
						content_ids: contentIds,
						value: Number(data.dbOrder?.total || order?.total || 0),
						currency: 'BDT',
						num_items: items.length
					},
					effectiveOrderId
				);
			}
		}
	});

	function copyOrderId() {
		navigator.clipboard.writeText(displayOrderId);
		isCopied = true;
		setTimeout(() => {
			isCopied = false;
		}, 2000);
	}

	function formatTaka(amount: number) {
		return `৳${amount.toLocaleString('en-BD')}`;
	}
</script>

<svelte:head>
	<title>অর্ডার সফল হয়েছে (Order Confirmed) | AURA Store</title>
</svelte:head>

<StoreLayout user={data.user}>
	
	<div class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-['Anek_Bangla',sans-serif]">
		
		<!-- 1. Top Celebration Banner using shadcn Card & Badge -->
		<Card class="rounded-3xl border-slate-200/90 shadow-xs p-6 sm:p-10 text-center relative overflow-hidden mb-6">
			<CardContent class="p-0">
				<!-- Subtle ambient decoration -->
				<div class="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-emerald-50 blur-2xl pointer-events-none"></div>
				<div class="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-blue-50 blur-2xl pointer-events-none"></div>

				<!-- Success Icon with pulsating rings -->
				<div class="relative z-10 mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 flex items-center justify-center text-emerald-600 mb-4 shadow-lg shadow-emerald-500/10">
					<CheckCircle2 class="w-10 h-10 stroke-[2.5]" />
				</div>

				<div class="relative z-10 space-y-2 max-w-xl mx-auto">
					<Badge variant="outline" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
						<Sparkles class="w-3.5 h-3.5 text-emerald-600" />
						<span>অর্ডারটি সফলভাবে সম্পন্ন হয়েছে</span>
					</Badge>

					<h1 class="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit'] tracking-tight">
						ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে
					</h1>

					<p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
						খুব শীঘ্রই আমাদের সাপোর্ট প্রতিনিধি আপনার সাথে ফোনে যোগাযোগ করে অর্ডারটি ভেরিফাই করবেন এবং পার্সেলটি পাঠিয়ে দেবেন।
					</p>
				</div>

				<!-- Order ID Pill with Copy button -->
				<div class="relative z-10 mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
					<span class="text-xs text-slate-500 font-medium">অর্ডার আইডি:</span>
					<strong class="text-sm font-black text-[#2563eb] font-mono tracking-wider">
						#{displayOrderId}
					</strong>
					<Button
						variant="ghost"
						size="icon"
						onclick={copyOrderId}
						class="h-7 w-7 rounded-lg text-slate-500 hover:text-slate-800 p-0 ml-1"
						title="কপি করুন"
					>
						{#if isCopied}
							<Check class="w-4 h-4 text-emerald-600" />
						{:else}
							<Copy class="w-4 h-4" />
						{/if}
					</Button>
				</div>
			</CardContent>
		</Card>

		<!-- 2. Two Columns Details Grid: Delivery & Summary using shadcn Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
			
			<!-- Left: Delivery Information Card -->
			<Card class="rounded-3xl border-slate-200/90 shadow-xs p-5 sm:p-6 overflow-hidden">
				<CardHeader class="p-0 pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
					<div class="w-8 h-8 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center font-bold">
						<Truck class="w-4 h-4" />
					</div>
					<div>
						<CardTitle class="text-sm font-bold text-slate-900 font-['Outfit']">ডেলিভারি তথ্য</CardTitle>
						<p class="text-[11px] text-slate-400">কাস্টমার ও ডেলিভারি লোকেশন</p>
					</div>
				</CardHeader>

				<CardContent class="p-0 pt-4 space-y-3 text-xs">
					<div class="flex justify-between items-start">
						<span class="text-slate-500">গ্রাহকের নাম:</span>
						<span class="font-bold text-slate-900 text-right">{order?.customerName || 'সম্মানিত গ্রাহক'}</span>
					</div>

					<div class="flex justify-between items-start">
						<span class="text-slate-500">মোবাইল নম্বর:</span>
						<span class="font-bold text-slate-900 font-mono text-right">{order?.customerPhone || '০১৮৬০-২২৯৫৪৬'}</span>
					</div>

					<div class="flex justify-between items-start">
						<span class="text-slate-500">ডেলিভারি ঠিকানা:</span>
						<span class="font-bold text-slate-900 text-right max-w-[220px]">{order?.customerAddress || 'ঢাকা, বাংলাদেশ'}</span>
					</div>

					<div class="flex justify-between items-start">
						<span class="text-slate-500">পেমেন্ট মেথড:</span>
						<Badge variant="outline" class="font-bold text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1">
							<ShieldCheck class="w-3.5 h-3.5" />
							<span>{order?.paymentMethod || 'ক্যাশ অন ডেলিভারি (COD)'}</span>
						</Badge>
					</div>

					<Separator class="my-2" />

					<div class="flex justify-between items-start pt-1">
						<span class="text-slate-500 flex items-center gap-1">
							<Clock class="w-3.5 h-3.5 text-[#2563eb]" />
							প্রত্যাশিত ডেলিভারি:
						</span>
						<span class="font-bold text-slate-900 text-right">১২-২৪ ঘণ্টার মধ্যে</span>
					</div>
				</CardContent>
			</Card>

			<!-- Right: Order Payment Summary Card -->
			<Card class="rounded-3xl border-slate-200/90 shadow-xs p-5 sm:p-6 overflow-hidden">
				<CardHeader class="p-0 pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
					<div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
						<PackageCheck class="w-4 h-4" />
					</div>
					<div>
						<CardTitle class="text-sm font-bold text-slate-900 font-['Outfit']">পেমেন্ট সারসংক্ষেপ</CardTitle>
						<p class="text-[11px] text-slate-400">সর্বমোট প্রদেয় টাকার হিসাব</p>
					</div>
				</CardHeader>

				<CardContent class="p-0 pt-4 space-y-2.5 text-xs">
					<div class="flex justify-between items-center text-slate-600">
						<span>সাবটোটাল:</span>
						<span class="font-bold text-slate-900 font-mono">
							{formatTaka(order?.subtotal || 1490)}
						</span>
					</div>

					{#if (order?.discountAmount || 0) > 0}
						<div class="flex justify-between items-center text-emerald-600">
							<span>ডিসকাউন্ট:</span>
							<span class="font-bold font-mono">
								-{formatTaka(order?.discountAmount || 0)}
							</span>
						</div>
					{/if}

					<div class="flex justify-between items-center text-slate-600">
						<span>ডেলিভারি চার্জ:</span>
						{#if order?.deliveryCharge === 0}
							<Badge variant="outline" class="font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
								ফ্রি (FREE)
							</Badge>
						{:else}
							<span class="font-bold text-slate-900 font-mono">{formatTaka(order?.deliveryCharge || 0)}</span>
						{/if}
					</div>

					<Separator class="my-2" />

					<div class="flex justify-between items-center pt-1 text-sm">
						<span class="font-black text-slate-900">সর্বমোট প্রদেয় টাকা:</span>
						<span class="font-black text-xl text-[#2563eb] font-mono">
							{formatTaka(order?.total || 1490)}
						</span>
					</div>

					<div class="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-xs text-blue-900 mt-2 space-y-1">
						<div class="font-bold flex items-center gap-1.5 text-[#2563eb]">
							<ShieldCheck class="w-4 h-4" />
							<span>পণ্য যাচাই করে মূল্য দিন</span>
						</div>
						<p class="text-[11px] text-blue-800/80 leading-relaxed">
							ডেলিভারি ম্যানের সামনে পার্সেলটি খুলে যাচাই করে তারপর টাকা পরিশোধ করার সম্পূর্ণ স্বাধীনতা রয়েছে।
						</p>
					</div>
				</CardContent>
			</Card>

		</div>

		<!-- 3. Ordered Products Card (if items available) -->
		{#if order?.items && order.items.length > 0}
			<Card class="rounded-3xl border-slate-200/90 shadow-xs p-5 sm:p-6 mb-6 overflow-hidden">
				<CardHeader class="p-0 pb-2 border-b border-slate-100">
					<CardTitle class="text-sm font-bold text-slate-900 font-['Outfit']">
						অর্ডারকৃত পণ্যসমূহ ({order.items.length} টি)
					</CardTitle>
				</CardHeader>
				<CardContent class="p-0 pt-3 space-y-3">
					{#each order.items as item}
						<div class="flex items-center gap-3.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
							<img
								src={item.image}
								alt={item.name}
								class="w-14 h-14 rounded-xl object-contain border border-slate-100 bg-slate-50 p-1 shrink-0"
							/>
							<div class="flex-1 min-w-0">
								<h4 class="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.name}</h4>
								<span class="text-[11px] text-slate-500 font-medium">
									পরিমাণ: {item.quantity} টি × {formatTaka(item.price)}
								</span>
							</div>
							<div class="text-xs sm:text-sm font-black text-slate-900 font-mono shrink-0">
								{formatTaka(item.price * item.quantity)}
							</div>
						</div>
					{/each}
				</CardContent>
			</Card>
		{/if}

		<!-- 4. Action Buttons with shadcn Button -->
		<div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
			<Button
				variant="blue"
				href="/"
				class="w-full sm:w-auto h-auto px-6 py-3 rounded-2xl font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
			>
				<Home class="w-4 h-4" />
				<span>আরও কেনাকাটা করুন</span>
			</Button>

			<Button
				variant="outline"
				href="/track-order?orderId={displayOrderId}"
				class="w-full sm:w-auto h-auto px-6 py-3 rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2"
			>
				<Truck class="w-4 h-4 text-slate-500" />
				<span>অর্ডার ট্র্যাক করুন</span>
			</Button>
		</div>

		<!-- 5. 24/7 Helpline Card -->
		<Card class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-5 sm:p-6 text-white border-0 shadow-lg">
			<CardContent class="p-0 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
				<div class="space-y-1">
					<h4 class="text-sm font-bold font-['Outfit'] text-white">কোনো প্রশ্ন বা সহায়তার প্রয়োজন?</h4>
					<p class="text-xs text-slate-400">আমাদের কাস্টমার কেয়ার টিম সবসময় আপনার সেবায় প্রস্তুত।</p>
				</div>
				<Button
					variant="secondary"
					href="tel:01860229546"
					class="h-auto px-5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-black flex items-center gap-2 hover:bg-slate-100 shrink-0 shadow-md border-0"
				>
					<PhoneCall class="w-4 h-4 text-[#2563eb]" />
					<span class="font-mono">01860-229546</span>
				</Button>
			</CardContent>
		</Card>

	</div>

</StoreLayout>
