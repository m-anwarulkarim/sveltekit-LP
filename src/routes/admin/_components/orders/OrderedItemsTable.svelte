<script lang="ts">
	import { Card, Badge, Button } from '#lib/components/ui';
	import {
		ShoppingBag,
		Plus,
		Minus,
		Trash2,
		PackageOpen,
		Tag,
		Pencil,
		Check,
		X
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	export interface OrderItem {
		id: string;
		name: string;
		price: number;
		originalPrice?: number;
		quantity: number;
		image?: string;
		variant?: string;
	}

	interface Props {
		items: OrderItem[];
		onUpdateQuantity: (index: number, newQty: number) => void;
		onRemoveItem: (index: number) => void;
		onUpdatePrice?: (index: number, newPrice: number) => void;
	}

	let {
		items = $bindable(),
		onUpdateQuantity,
		onRemoveItem,
		onUpdatePrice
	}: Props = $props();

	// Inline Price Editing State
	let editingIndex = $state<number | null>(null);
	let tempPrice = $state<number>(0);

	function startEditingPrice(index: number, currentPrice: number) {
		editingIndex = index;
		tempPrice = Number(currentPrice) || 0;
	}

	function savePrice(index: number) {
		if (editingIndex === null || !items[index]) return;
		const parsed = Math.max(0, Number(tempPrice) || 0);

		// Track original price if customized
		if (items[index].originalPrice === undefined) {
			items[index].originalPrice = items[index].price;
		}

		items[index].price = parsed;
		onUpdatePrice?.(index, parsed);
		editingIndex = null;
		toast.success(`"${items[index].name}"-এর দাম ৳${parsed} নির্ধারণ করা হয়েছে!`);
	}

	function cancelEditing() {
		editingIndex = null;
	}

	let totalPieces = $derived(
		Array.isArray(items) ? items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0) : 0
	);
</script>

<Card class="p-4 bg-white/95 shadow-xs border-slate-200/90 flex flex-col space-y-3">
	<!-- Card Header -->
	<div class="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
		<div class="flex items-center gap-2">
			<ShoppingBag class="w-4 h-4 text-[#5845eb]" />
			<h2 class="text-sm font-black text-slate-900 tracking-tight">অর্ডারকৃত পণ্যসমূহ</h2>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-[10px] text-slate-400 font-medium hidden sm:inline">দাম পরিবর্তনে ক্লিক করুন</span>
			<Badge variant="purple" class="px-2 py-0.5 text-[11px] font-bold font-mono">
				{Array.isArray(items) ? items.length : 0} items · {totalPieces} pcs
			</Badge>
		</div>
	</div>

	<!-- Items List (Fully responsive 2-tier card layout per item) -->
	<div class="space-y-2.5 overflow-y-auto overscroll-contain max-h-[380px] pr-1">
		{#if items.length === 0}
			<div class="py-12 px-4 text-center text-slate-400 space-y-2.5 border-2 border-dashed border-slate-200/90 rounded-2xl bg-slate-50/50">
				<div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-[#5845eb]">
					<ShoppingBag class="w-6 h-6 stroke-1.5" />
				</div>
				<div class="space-y-1">
					<p class="text-xs font-bold text-slate-800">এখনো কোনো পণ্য নির্বাচন করা হয়নি</p>
					<p class="text-[11px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
						ডানপাশের ক্যাটালগ থেকে পণ্য খুঁজুন এবং <span class="text-indigo-600 font-bold">[+]</span> আইকনে ক্লিক করে অর্ডারে যুক্ত করুন।
					</p>
				</div>
			</div>
		{:else}
			{#each items as item, index (item.id || index)}
				<div class="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5 hover:border-slate-300 transition-all group">
					
					<!-- Tier 1: Product Thumbnail, Title & Trash Button -->
					<div class="flex items-center justify-between gap-2.5 min-w-0">
						<div class="flex items-center gap-2.5 min-w-0 flex-1">
							<!-- Image -->
							<div class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
								{#if item.image}
									<img
										src={item.image}
										alt={item.name}
										class="w-full h-full object-cover"
										onerror={(e) => {
											(e.target as HTMLElement).style.display = 'none';
										}}
									/>
								{:else}
									<ShoppingBag class="w-4 h-4 text-slate-400" />
								{/if}
							</div>

							<!-- Title & Variant -->
							<div class="min-w-0 flex-1">
								<h3 class="text-xs font-bold text-slate-900 truncate leading-snug" title={item.name}>
									{item.name}
								</h3>
								{#if item.variant}
									<span class="inline-flex items-center gap-0.5 text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium mt-0.5">
										<Tag class="w-2.5 h-2.5" />
										<span>{item.variant}</span>
									</span>
								{/if}
							</div>
						</div>

						<!-- Delete Button -->
						<button
							type="button"
							onclick={() => onRemoveItem(index)}
							class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
							title="আইটেমটি রিমুভ করুন"
						>
							<Trash2 class="w-3.5 h-3.5" />
						</button>
					</div>

					<!-- Tier 2: Dedicated Controls Bar (Price Editor on Left | Quantity Stepper & Line Total on Right) -->
					<div class="flex flex-wrap items-center justify-between gap-2 bg-slate-50/90 p-2 sm:p-2.5 rounded-xl border border-slate-100">
						
						<!-- Left: Unit Price (Normal vs Editable Mode) -->
						<div class="min-w-0">
							{#if editingIndex === index}
								<!-- Inline Price Input Mode -->
								<div class="inline-flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border-2 border-[#5845eb] shadow-sm ring-2 ring-[#5845eb]/10">
									<span class="text-xs font-black text-[#5845eb] font-mono">৳</span>
									<input
										type="number"
										min="0"
										bind:value={tempPrice}
										onkeydown={(e) => {
											if (e.key === 'Enter') savePrice(index);
											if (e.key === 'Escape') cancelEditing();
										}}
										class="w-18 h-6 px-1 text-xs font-mono font-black text-slate-900 bg-transparent focus:outline-none"
										autofocus
									/>
									<button
										type="button"
										onclick={() => savePrice(index)}
										class="w-6 h-6 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
										title="দাম সেভ করুন"
									>
										<Check class="w-3.5 h-3.5 stroke-[3]" />
									</button>
									<button
										type="button"
										onclick={cancelEditing}
										class="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
										title="বাতিল করুন"
									>
										<X class="w-3.5 h-3.5" />
									</button>
								</div>
							{:else}
								<!-- Normal Price Display (Click or Double click or pencil to edit) -->
								<button
									type="button"
									onclick={() => startEditingPrice(index, item.price)}
									ondblclick={() => startEditingPrice(index, item.price)}
									class="group/price inline-flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-[#5845eb]/40 shadow-2xs transition-all text-left"
									title="দাম পরিবর্তন করতে ক্লিক বা ডাবল-ক্লিক করুন"
								>
									<span class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">দর:</span>
									<span class="text-xs font-mono font-black text-[#5845eb]">
										৳{Number(item.price || 0).toLocaleString('en-US')}
									</span>
									<Pencil class="w-3 h-3 text-slate-400 group-hover/price:text-[#5845eb] transition-colors" />
									{#if item.originalPrice !== undefined && item.originalPrice !== item.price}
										<span class="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
											কাস্টম
										</span>
									{/if}
								</button>
							{/if}
						</div>

						<!-- Right: Stepper & Subtotal -->
						<div class="flex items-center gap-2.5 shrink-0 ml-auto">
							<!-- Stepper -->
							<div class="flex items-center bg-white rounded-lg border border-slate-200/90 shadow-2xs">
								<button
									type="button"
									onclick={() => onUpdateQuantity(index, item.quantity - 1)}
									class="w-7 h-7 rounded-l flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
									title="কমান"
								>
									<Minus class="w-3.5 h-3.5" />
								</button>

								<span class="w-7 text-center font-mono font-bold text-xs text-slate-900">
									{item.quantity}
								</span>

								<button
									type="button"
									onclick={() => onUpdateQuantity(index, item.quantity + 1)}
									class="w-7 h-7 rounded-r flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
									title="বাড়ান"
								>
									<Plus class="w-3.5 h-3.5" />
								</button>
							</div>

							<!-- Total for this item -->
							<div class="text-right min-w-[55px]">
								<span class="text-xs font-mono font-black text-slate-900">
									৳{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-US')}
								</span>
							</div>
						</div>

					</div>

				</div>
			{/each}
		{/if}
	</div>
</Card>
