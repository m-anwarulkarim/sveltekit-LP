<script lang="ts">
	import { Dialog, Button } from '#lib/components/ui';
	import { ShoppingBag, Package, ExternalLink } from 'lucide-svelte';

	interface OrderItem {
		id?: string;
		name?: string;
		price?: number;
		quantity?: number;
		image?: string | null;
		variant?: string | null;
		color?: string | null;
		size?: string | null;
	}

	interface Props {
		items: OrderItem[] | any;
		orderNumber?: string;
		orderId?: string;
		maxThumbnails?: number;
	}

	let {
		items = [],
		orderNumber,
		orderId,
		maxThumbnails = 3
	}: Props = $props();

	let isModalOpen = $state(false);

	let safeItems = $derived.by<OrderItem[]>(() => {
		if (Array.isArray(items)) return items;
		if (typeof items === 'string') {
			try {
				const parsed = JSON.parse(items);
				return Array.isArray(parsed) ? parsed : [];
			} catch {
				return [];
			}
		}
		return [];
	});

	let visibleItems = $derived(safeItems.slice(0, maxThumbnails));
	let remainingCount = $derived(Math.max(0, safeItems.length - maxThumbnails));
	let totalQuantity = $derived(
		safeItems.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0)
	);
	let totalItemsBill = $derived(
		safeItems.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0)
	);
	let firstItemName = $derived(safeItems[0]?.name || 'পণ্য আইটেম');
</script>

{#if safeItems.length === 0}
	<span class="text-xs text-slate-400 font-sans italic">কোনো পণ্য নেই</span>
{:else}
	<!-- Clickable compact product cell -->
	<button
		type="button"
		onclick={() => (isModalOpen = true)}
		class="group/prod inline-flex flex-col items-start cursor-pointer text-left select-none max-w-[210px] p-1 -m-1 rounded-xl hover:bg-slate-100/70 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5845eb]/30"
		title="ক্লিক করে সব পণ্য বিস্তারিত দেখুন ({safeItems.length}টি আইটেম)"
	>
		<!-- Horizontal Thumbnails Strip (Matches Screenshot) -->
		<div class="flex items-center gap-1.5 flex-nowrap">
			{#each visibleItems as item}
				<div
					class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-100 border border-slate-200/90 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover/prod:border-[#5845eb]/60 group-hover/prod:scale-105 transition-all duration-150"
				>
					{#if item.image}
						<img
							src={item.image}
							alt={item.name || 'পণ্য'}
							class="w-full h-full object-cover"
							loading="lazy"
							decoding="async"
							onerror={(e) => {
								(e.target as HTMLElement).style.display = 'none';
							}}
						/>
					{:else}
						<ShoppingBag class="w-4 h-4 text-slate-400" />
					{/if}

					<!-- Quantity tag on top-right if > 1 -->
					{#if (item.quantity || 1) > 1}
						<span
							class="absolute -top-1 -right-1 bg-slate-900 text-white text-[9px] font-bold font-mono px-1 rounded-full shadow-xs leading-tight"
						>
							x{item.quantity}
						</span>
					{/if}
				</div>
			{/each}

			<!-- & More N text (Matches Screenshot: '& More 3') -->
			{#if remainingCount > 0}
				<span
					class="text-xs font-bold text-slate-700 font-['Outfit',sans-serif] whitespace-nowrap pl-0.5 group-hover/prod:text-[#5845eb] transition-colors"
				>
					& More {remainingCount}
				</span>
			{/if}
		</div>

		<!-- Truncated Title Line below (Matches Screenshot) -->
		<div class="mt-1 min-w-0 max-w-full">
			<span
				class="text-[11px] font-bold text-slate-700 group-hover/prod:text-[#5845eb] transition-colors truncate block leading-snug"
				title={safeItems.map((i) => i.name).join(', ')}
			>
				{firstItemName}
			</span>
			{#if safeItems.length > 1}
				<span class="text-[10px] text-slate-400 font-medium block">
					মোট {totalQuantity} টি পণ্য ({safeItems.length} প্রকার)
				</span>
			{:else if (safeItems[0]?.quantity || 1) > 1}
				<span class="text-[10px] text-slate-400 font-medium block">
					পরিমাণ: <span class="font-bold font-mono text-slate-700">{safeItems[0]?.quantity}</span> টি
				</span>
			{/if}
		</div>
	</button>
{/if}

<!-- Responsive Details Modal -->
<Dialog
	bind:open={isModalOpen}
	title="অর্ডারের পণ্যসমূহ ({safeItems.length}টি আইটেম)"
	description={orderNumber ? `অর্ডার নম্বর: ${orderNumber}` : undefined}
	class="max-w-xl max-h-[85vh] flex flex-col p-5 sm:p-6"
>
	<div class="space-y-4 py-1 flex-1 overflow-y-auto pr-1">
		<!-- Summary header banner -->
		<div class="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3 text-xs">
			<div class="flex items-center gap-2.5">
				<div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
					<Package class="w-4.5 h-4.5" />
				</div>
				<div>
					<div class="font-bold text-slate-900">মোট আইটেম সংখ্যা: {totalQuantity} টি</div>
					<div class="text-[11px] text-slate-500">{safeItems.length}টি ভিন্ন পণ্য সিলেক্ট করা হয়েছে</div>
				</div>
			</div>
			{#if totalItemsBill > 0}
				<div class="text-right">
					<div class="text-[10px] uppercase font-bold text-slate-400">পণ্যের মোট মূল্য</div>
					<div class="text-sm font-black font-mono text-indigo-700">৳{totalItemsBill.toLocaleString('en-US')}</div>
				</div>
			{/if}
		</div>

		<!-- Product items scroll list -->
		<div class="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
			{#each safeItems as item}
				<div class="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
					<div class="flex items-center gap-3 min-w-0">
						<!-- Big image thumbnail -->
						<div class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/90 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
							{#if item.image}
								<img
									src={item.image}
									alt={item.name || 'পণ্য'}
									class="w-full h-full object-cover"
									loading="lazy"
								/>
							{:else}
								<ShoppingBag class="w-5 h-5 text-slate-400" />
							{/if}
						</div>

						<div class="min-w-0">
							<div class="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1" title={item.name}>
								{item.name || 'পণ্য আইটেম'}
							</div>
							<div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
								<span class="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-slate-700 text-[10px]">
									পরিমাণ: {item.quantity || 1} টি
								</span>
								{#if item.price}
									<span class="font-mono text-slate-500">
										৳{Number(item.price).toLocaleString('en-US')} / পিস
									</span>
								{/if}
								{#if item.variant || item.color || item.size}
									<span class="text-indigo-600 font-medium">
										({item.variant || [item.color, item.size].filter(Boolean).join(', ')})
									</span>
								{/if}
							</div>
						</div>
					</div>

					<!-- Item Subtotal -->
					{#if item.price}
						<div class="text-right shrink-0">
							<div class="text-xs sm:text-sm font-black font-mono text-slate-900">
								৳{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-US')}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Modal footer actions -->
	<div class="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
		{#if orderId || orderNumber}
			<a
				href="/admin/orders/{orderNumber || orderId}"
				class="inline-flex items-center gap-1.5 text-xs font-bold text-[#5845eb] hover:text-indigo-800 hover:underline"
			>
				<span>অর্ডার পেজে যান</span>
				<ExternalLink class="w-3.5 h-3.5" />
			</a>
		{:else}
			<div></div>
		{/if}

		<Button
			type="button"
			variant="outline"
			size="sm"
			onclick={() => (isModalOpen = false)}
			class="rounded-xl px-4 font-bold text-xs cursor-pointer"
		>
			বন্ধ করুন
		</Button>
	</div>
</Dialog>
