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

		// Store original price if not already stored
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

<Card class="p-4 bg-white/95 shadow-xs border-slate-200/90 flex flex-col">
	<!-- Header -->
	<div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
		<div class="flex items-center gap-2">
			<ShoppingBag class="w-4 h-4 text-[#5845eb]" />
			<h2 class="text-sm font-black text-slate-900 tracking-tight">অর্ডারকৃত পণ্যসমূহ</h2>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-[10px] text-slate-400 hidden sm:inline">ডাবল-ক্লিকে দাম পরিবর্তনযোগ্য</span>
			<Badge variant="purple" class="px-2 py-0.5 text-[11px] font-bold font-mono">
				{Array.isArray(items) ? items.length : 0} items · {totalPieces} pcs
			</Badge>
		</div>
	</div>

	<!-- Items List -->
	<div class="divide-y divide-slate-100 overflow-y-auto max-h-[380px] py-1 pr-1">
		{#if items.length === 0}
			<div class="py-14 px-4 text-center text-slate-400 space-y-3 my-auto border-2 border-dashed border-slate-200/90 rounded-2xl bg-slate-50/50">
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
			{#each items as item, index}
				<div class="py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 group">
					
					<!-- Product Image & Details -->
					<div class="flex items-center gap-3 min-w-0 flex-1">
						<div class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
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
								<ShoppingBag class="w-5 h-5 text-slate-400" />
							{/if}
						</div>

						<div class="min-w-0 flex-1">
							<h3 class="text-xs font-bold text-slate-900 truncate leading-snug" title={item.name}>
								{item.name}
							</h3>
							
							<div class="flex items-center flex-wrap gap-2 mt-1">
								<!-- Editable Unit Price -->
								{#if editingIndex === index}
									<div class="inline-flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#5845eb] shadow-2xs ring-2 ring-[#5845eb]/15">
										<span class="text-xs font-bold text-indigo-600 pl-1 font-mono">৳</span>
										<input
											type="number"
											min="0"
											bind:value={tempPrice}
											onkeydown={(e) => {
												if (e.key === 'Enter') savePrice(index);
												if (e.key === 'Escape') cancelEditing();
											}}
											class="w-20 h-6 px-1 text-xs font-mono font-black text-slate-900 focus:outline-none"
											autofocus
										/>
										<button
											type="button"
											onclick={() => savePrice(index)}
											class="w-5 h-5 rounded flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors"
											title="সেভ করুন"
										>
											<Check class="w-3.5 h-3.5 stroke-[3]" />
										</button>
										<button
											type="button"
											onclick={cancelEditing}
											class="w-5 h-5 rounded flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
											title="বাতিল"
										>
											<X class="w-3.5 h-3.5" />
										</button>
									</div>
								{:else}
									<div
										role="button"
										tabindex="0"
										ondblclick={() => startEditingPrice(index, item.price)}
										onkeydown={(e) => e.key === 'Enter' && startEditingPrice(index, item.price)}
										class="group/price inline-flex items-center gap-1.5 cursor-pointer py-0.5 px-1.5 -mx-1.5 rounded-lg hover:bg-indigo-50/80 transition-colors"
										title="দাম পরিবর্তন করতে ডাবল ক্লিক বা পেন্সিল বাটনে চাপুন"
									>
										<span class="text-xs font-mono font-black text-[#5845eb]">
											৳{Number(item.price || 0).toLocaleString('en-US')}
										</span>
										<button
											type="button"
											onclick={(e) => {
												e.stopPropagation();
												startEditingPrice(index, item.price);
											}}
											class="p-0.5 rounded text-slate-400 hover:text-[#5845eb] opacity-40 group-hover/price:opacity-100 transition-opacity"
											title="দাম এডিট করুন"
										>
											<Pencil class="w-3 h-3" />
										</button>
										{#if item.originalPrice !== undefined && item.originalPrice !== item.price}
											<span class="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
												কাস্টম রেট
											</span>
										{/if}
									</div>
								{/if}

								{#if item.variant}
									<span class="inline-flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
										<Tag class="w-2.5 h-2.5" />
										<span>{item.variant}</span>
									</span>
								{/if}
							</div>
						</div>
					</div>

					<!-- Stepper & Subtotal -->
					<div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
						<!-- Quantity Stepper -->
						<div class="flex items-center bg-slate-100/90 rounded-lg p-0.5 border border-slate-200/80">
							<button
								type="button"
								onclick={() => onUpdateQuantity(index, item.quantity - 1)}
								class="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
								title="কমান"
							>
								<Minus class="w-3 h-3" />
							</button>

							<span class="w-7 text-center font-mono font-bold text-xs text-slate-900">
								{item.quantity}
							</span>

							<button
								type="button"
								onclick={() => onUpdateQuantity(index, item.quantity + 1)}
								class="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
								title="বাড়ান"
							>
								<Plus class="w-3 h-3" />
							</button>
						</div>

						<!-- Line Item Total -->
						<div class="text-right min-w-[70px]">
							<span class="text-xs font-mono font-black text-slate-900">
								৳{(item.price * item.quantity).toLocaleString('en-US')}
							</span>
						</div>

						<!-- Remove Item Action -->
						<button
							type="button"
							onclick={() => onRemoveItem(index)}
							class="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
							title="আইটেমটি রিমুভ করুন"
						>
							<Trash2 class="w-3.5 h-3.5" />
						</button>
					</div>

				</div>
			{/each}
		{/if}
	</div>
</Card>
