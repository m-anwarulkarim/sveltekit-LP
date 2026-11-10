<script lang="ts">
	import {
		Package,
		Truck,
		CheckCircle2,
		RotateCcw,
		AlertCircle,
		Clock,
		ExternalLink,
		Copy,
		Check,
		FileText,
		Repeat,
		ShoppingBag,
		MapPin
	} from 'lucide-svelte';
	import { Button } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { goto } from '$app/navigation';

	interface Props {
		order: any;
		onViewInvoice: (order: any) => void;
	}

	let { order, onViewInvoice }: Props = $props();

	let copiedTracking = $state(false);

	function copyTrackingCode(code: string) {
		if (!code) return;
		navigator.clipboard.writeText(code);
		copiedTracking = true;
		toast.success('ট্র্যাকিং কোড কপি করা হয়েছে!');
		setTimeout(() => (copiedTracking = false), 2000);
	}

	function formatTaka(amount: number): string {
		return '৳ ' + Math.round(amount || 0).toLocaleString('en-IN');
	}

	function formatDate(d: any): string {
		if (!d) return 'আজ';
		const dateObj = new Date(d);
		if (isNaN(dateObj.getTime())) return 'আজ';
		return dateObj.toLocaleDateString('bn-BD', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	// Parse items JSON safely
	let itemsList = $derived.by(() => {
		if (!order?.items) return [];
		try {
			const parsed = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	});

	// Normalize status
	const status = $derived(String(order.status || '').toLowerCase());
	const isDelivered = $derived(status === 'delivered' || status === 'partial_delivered');
	const isReturned = $derived(status === 'returned' || status === 'pending_return');
	const isCancelled = $derived(status === 'cancelled');
	const isShipped = $derived(status === 'shipped' || Boolean(order.trackingCode) || isDelivered);
	const isProcessing = $derived(status === 'processing' || status === 'confirmed' || status === 'printed' || isShipped);

	// Status badge styling
	let statusBadge = $derived.by(() => {
		if (isDelivered) {
			return { label: 'ডেলিভারি সম্পন্ন', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
		}
		if (isReturned) {
			return { label: 'রিটার্ন / ফেরত', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: RotateCcw };
		}
		if (isCancelled) {
			return { label: 'বাতিল হয়েছে', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: AlertCircle };
		}
		if (status === 'shipped' || order.courierStatus === 'in_transit') {
			return { label: 'অন দ্য ওয়ে (কুরিয়ারে)', bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: Truck };
		}
		if (status === 'processing' || status === 'confirmed') {
			return { label: 'প্রসেসিং / প্যাকিং', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock };
		}
		return { label: 'অর্ডার পেন্ডিং', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock };
	});

	// 1-Click Re-order function
	function handleReorder() {
		if (itemsList.length === 0) {
			toast.error('পুনরায় অর্ডার করার জন্য কোনো পণ্য পাওয়া যায়নি');
			return;
		}

		for (const it of itemsList) {
			cart.addItem({
				id: it.id || 'prod',
				name: it.name || 'পণ্য',
				price: Number(it.price) || 0,
				image: it.image || '',
				variantId: it.variantId || null,
				variantName: it.variantName || null,
				quantity: Number(it.quantity) || 1
			});
		}

		toast.success('আইটেম কার্টে যোগ করা হয়েছে!');
		goto('/checkout');
	}

	// Live courier tracking link
	let trackingUrl = $derived.by(() => {
		const code = order.trackingCode || order.consignmentId;
		if (!code) return null;
		const provider = (order.courierProvider || '').toLowerCase();
		if (provider.includes('steadfast')) {
			return `https://steadfast.com.bd/tracking?tracking_code=${encodeURIComponent(code)}`;
		}
		if (provider.includes('pathao')) {
			return `https://merchant.pathao.com/tracking?consignment_id=${encodeURIComponent(code)}`;
		}
		return null;
	});
</script>

<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Order Card Header -->
	<div class="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-2 sm:gap-3">
			<div class="w-9 h-9 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0">
				<Package class="w-4.5 h-4.5 stroke-[2.2]" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<span class="text-xs sm:text-sm font-black text-slate-900 font-mono">
						#{order.orderNumber || order.id?.slice(0, 8)}
					</span>
					<span class="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 {statusBadge.bg}">
						<statusBadge.icon class="w-3 h-3" />
						<span>{statusBadge.label}</span>
					</span>
				</div>
				<div class="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-2">
					<span>অর্ডারের তারিখ: <strong class="text-slate-700">{formatDate(order.createdAt)}</strong></span>
					<span>•</span>
					<span class="capitalize">{order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : (order.paymentMethod || 'অনলাইন পেমেন্ট')}</span>
				</div>
			</div>
		</div>

		<div class="text-right">
			<div class="text-base sm:text-lg font-black text-[#5845eb]">
				{formatTaka(order.total)}
			</div>
			<div class="text-[10px] text-slate-400 font-medium">
				{itemsList.length}টি পণ্যের চালান
			</div>
		</div>
	</div>

	<!-- Daraz-Style Delivery Stepper / Tracking Bar -->
	{#if !isCancelled && !isReturned}
		<div class="px-5 py-4 bg-indigo-50/25 border-b border-slate-100">
			<div class="relative flex items-center justify-between max-w-lg mx-auto">
				<!-- Connector line -->
				<div class="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0 rounded-full"></div>
				<div
					class="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-[#5845eb] z-0 rounded-full transition-all duration-500"
					style="width: {isDelivered ? '94%' : isShipped ? '65%' : isProcessing ? '33%' : '0%'};"
				></div>

				<!-- Step 1: Placed -->
				<div class="relative z-10 flex flex-col items-center">
					<div class="w-7 h-7 rounded-full bg-[#5845eb] text-white flex items-center justify-center shadow-xs text-xs font-bold">
						✓
					</div>
					<span class="text-[10px] font-bold text-slate-800 mt-1">অর্ডার জমা</span>
				</div>

				<!-- Step 2: Processing -->
				<div class="relative z-10 flex flex-col items-center">
					<div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors {isProcessing ? 'bg-[#5845eb] text-white shadow-xs' : 'bg-slate-200 text-slate-500'}">
						{#if isProcessing}✓{:else}2{/if}
					</div>
					<span class="text-[10px] font-bold {isProcessing ? 'text-slate-800' : 'text-slate-400'} mt-1">প্রসেসিং</span>
				</div>

				<!-- Step 3: Shipped -->
				<div class="relative z-10 flex flex-col items-center">
					<div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors {isShipped ? 'bg-[#5845eb] text-white shadow-xs' : 'bg-slate-200 text-slate-500'}">
						{#if isShipped}✓{:else}3{/if}
					</div>
					<span class="text-[10px] font-bold {isShipped ? 'text-slate-800' : 'text-slate-400'} mt-1">কুরিয়ারে</span>
				</div>

				<!-- Step 4: Delivered -->
				<div class="relative z-10 flex flex-col items-center">
					<div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors {isDelivered ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500'}">
						{#if isDelivered}✓{:else}4{/if}
					</div>
					<span class="text-[10px] font-bold {isDelivered ? 'text-emerald-700' : 'text-slate-400'} mt-1">ডেলিভার্ড</span>
				</div>
			</div>
		</div>
	{/if}

	<!-- Courier Tracking Info Banner (If parcel is with courier) -->
	{#if order.trackingCode || order.courierProvider}
		<div class="px-5 py-3 bg-amber-50/60 border-b border-amber-100 flex flex-wrap items-center justify-between gap-2 text-xs">
			<div class="flex items-center gap-2">
				<Truck class="w-4 h-4 text-amber-600 shrink-0" />
				<span class="font-semibold text-slate-700">
					কুরিয়ার: <strong class="text-slate-900">{order.courierProvider || 'Steadfast Courier'}</strong>
				</span>
				{#if order.trackingCode}
					<span class="text-slate-400">|</span>
					<span class="font-mono bg-white px-2 py-0.5 rounded border border-amber-200 text-slate-800 font-bold">
						{order.trackingCode}
					</span>
					<button
						type="button"
						onclick={() => copyTrackingCode(order.trackingCode)}
						class="p-1 rounded hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
						title="ট্র্যাকিং নম্বর কপি করুন"
					>
						{#if copiedTracking}
							<Check class="w-3.5 h-3.5 text-emerald-600" />
						{:else}
							<Copy class="w-3.5 h-3.5" />
						{/if}
					</button>
				{/if}
			</div>

			{#if trackingUrl}
				<a
					href={trackingUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1 font-bold text-[#5845eb] hover:underline"
				>
					<span>লাইভ পার্সেল ট্র্যাক করুন</span>
					<ExternalLink class="w-3 h-3" />
				</a>
			{/if}
		</div>
	{/if}

	<!-- Items List -->
	<div class="p-4 sm:p-5 divide-y divide-slate-100">
		{#if itemsList.length > 0}
			{#each itemsList as item}
				<div class="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
					<div class="flex items-center gap-3.5 min-w-0">
						<!-- Product Thumbnail -->
						<div class="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
							{#if item.image}
								<img
									src={item.image}
									alt={item.name || 'Product'}
									class="w-full h-full object-cover"
									loading="lazy"
								/>
							{:else}
								<ShoppingBag class="w-5 h-5 text-slate-400" />
							{/if}
						</div>

						<!-- Details -->
						<div class="min-w-0">
							<h4 class="text-xs sm:text-sm font-bold text-slate-900 truncate">
								{item.name || 'অর্ডারকৃত পণ্য'}
							</h4>
							{#if item.variantName}
								<p class="text-[11px] text-slate-500 font-medium">ভ্যারিয়েন্ট: {item.variantName}</p>
							{/if}
							<p class="text-[11px] text-slate-500 mt-0.5">
								পরিমাণ: <strong class="text-slate-800">{item.quantity || 1}টি</strong> × {formatTaka(item.price || 0)}
							</p>
						</div>
					</div>

					<div class="text-right shrink-0">
						<span class="text-xs sm:text-sm font-black text-slate-900 font-mono">
							{formatTaka((item.price || 0) * (item.quantity || 1))}
						</span>
					</div>
				</div>
			{/each}
		{:else}
			<div class="py-2 text-xs text-slate-600">
				{order.itemsSummary || 'পণ্য অর্ডার'}
			</div>
		{/if}
	</div>

	<!-- Shipping Address Snippet -->
	{#if order.shippingAddress}
		<div class="px-5 py-2.5 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
			<MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
			<span class="truncate">ডেলিভারি ঠিকানা: {order.shippingAddress}</span>
		</div>
	{/if}

	<!-- Order Action Footer (Daraz-style buttons) -->
	<div class="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
		<div class="text-xs text-slate-500 font-medium">
			ডেলিভারি চার্জ: <strong class="text-slate-700">{formatTaka(order.deliveryCharge || 0)}</strong>
		</div>

		<div class="flex items-center gap-2">
			<!-- View Invoice Memo -->
			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={() => onViewInvoice(order)}
				class="text-xs font-bold gap-1.5 rounded-xl cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50"
			>
				<FileText class="w-3.5 h-3.5 text-slate-500" />
				<span>ক্যাশ মেমো (Invoice)</span>
			</Button>

			<!-- 1-Click Reorder Button -->
			<Button
				type="button"
				size="sm"
				onclick={handleReorder}
				class="text-xs font-bold gap-1.5 rounded-xl cursor-pointer shadow-xs bg-[#5845eb] hover:bg-[#4936d6] text-white"
			>
				<Repeat class="w-3.5 h-3.5" />
				<span>আবার অর্ডার করুন</span>
			</Button>
		</div>
	</div>
</div>
