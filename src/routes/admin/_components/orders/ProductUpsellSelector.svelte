<script lang="ts">
	import { Card, Input, Badge } from '#lib/components/ui';
	import {
		Search,
		Plus,
		Check,
		ShoppingBag,
		Layers,
		CheckCircle2
	} from 'lucide-svelte';
	import type { OrderItem } from './OrderedItemsTable.svelte';

	interface Product {
		id: string;
		name: string;
		price: number;
		image?: string;
		stock?: number;
		category?: string;
	}

	interface Props {
		catalogProducts: Product[];
		orderedItems: OrderItem[];
		onAddProduct: (product: Product) => void;
	}

	let {
		catalogProducts = [],
		orderedItems = [],
		onAddProduct
	}: Props = $props();

	let searchQuery = $state('');
	let selectedCategory = $state('all');

	// Extract unique categories
	let categories = $derived.by(() => {
		const set = new Set<string>();
		catalogProducts.forEach((p) => {
			if (p.category && p.category !== '-') set.add(p.category);
		});
		return ['all', ...Array.from(set)];
	});

	// Filtered catalog products
	let filteredCatalog = $derived.by(() => {
		return catalogProducts.filter((p) => {
			const matchesCategory =
				selectedCategory === 'all' ? true : p.category === selectedCategory;
			const matchesSearch =
				searchQuery === ''
					? true
					: (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
						(p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
			return matchesCategory && matchesSearch;
		});
	});

	function getItemQuantityInOrder(productId: string): number {
		const found = orderedItems.find((it) => it.id === productId);
		return found ? found.quantity : 0;
	}
</script>

<Card class="p-4 bg-white/90 shadow-xs border-slate-200/90 flex flex-col">
	<!-- Header -->
	<div class="flex items-center justify-between pb-3 border-b border-slate-100">
		<div class="flex items-center gap-2">
			<Layers class="w-4 h-4 text-[#5845eb]" />
			<h2 class="text-sm font-black text-slate-900 tracking-tight">প্রোডাক্ট সার্চ ও আপসেল</h2>
		</div>
		<span class="text-[11px] font-bold text-slate-400">
			{filteredCatalog.length} টি পণ্য পাওয়া গেছে
		</span>
	</div>

	<!-- Search & Category Filters -->
	<div class="space-y-2 py-3 border-b border-slate-100">
		<div class="relative">
			<Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
			<Input
				type="text"
				bind:value={searchQuery}
				placeholder="পণ্য খুঁজুন বা যুক্ত করুন..."
				class="h-9 pl-8 text-xs font-medium focus:border-[#5845eb]"
			/>
		</div>

		<!-- Category Chips -->
		{#if categories.length > 2}
			<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
				{#each categories as cat}
					<button
						type="button"
						onclick={() => (selectedCategory = cat)}
						class="text-[10px] font-bold px-2 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer {selectedCategory === cat
							? 'bg-[#5845eb] text-white'
							: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
					>
						{cat === 'all' ? 'সব পণ্য' : cat}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Products List -->
	<div class="divide-y divide-slate-100 overflow-y-auto overscroll-contain max-h-[380px] py-1 pr-1">
		{#if filteredCatalog.length === 0}
			<div class="py-10 text-center text-slate-400">
				<p class="text-xs font-semibold">কোনো পণ্য খুঁজে পাওয়া যায়নি</p>
			</div>
		{:else}
			{#each filteredCatalog as prod}
				{@const inOrderQty = getItemQuantityInOrder(prod.id)}
				{@const isStockOut = prod.stock !== undefined && prod.stock <= 0}
				<div class="py-2.5 flex items-center justify-between gap-2.5 hover:bg-slate-50/70 px-1 rounded-xl transition-colors">
					
					<!-- Product Info -->
					<div class="flex items-center gap-2.5 min-w-0">
						<div class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
							{#if prod.image}
								<img
									src={prod.image}
									alt={prod.name}
									class="w-full h-full object-cover"
									onerror={(e) => {
										(e.target as HTMLElement).style.display = 'none';
									}}
								/>
							{:else}
								<ShoppingBag class="w-4 h-4 text-slate-400" />
							{/if}
						</div>

						<div class="min-w-0">
							<h4 class="text-xs font-bold text-slate-900 truncate leading-snug">
								{prod.name}
							</h4>
							<div class="flex items-center gap-2 mt-0.5">
								<span class="text-xs font-mono font-bold text-[#5845eb]">
									৳{prod.price.toLocaleString('en-US')}
								</span>
								<span class="text-[10px] font-semibold {isStockOut ? 'text-rose-600 bg-rose-50' : 'text-emerald-700 bg-emerald-50'} px-1.5 py-0.2 rounded">
									{isStockOut ? 'স্টক শেষ' : `${prod.stock ?? 100} in stock`}
								</span>
							</div>
						</div>
					</div>

					<!-- Add Button / In Order Status -->
					<div class="shrink-0">
						{#if inOrderQty > 0}
							<button
								type="button"
								onclick={() => onAddProduct(prod)}
								class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
								title="আরেকটি যোগ করুন"
							>
								<Check class="w-3.5 h-3.5" />
								<span>{inOrderQty}</span>
							</button>
						{:else}
							<button
								type="button"
								onclick={() => onAddProduct(prod)}
								class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#5845eb] text-slate-700 hover:text-white transition-colors cursor-pointer shadow-2xs"
								title="অর্ডারে যোগ করুন"
							>
								<Plus class="w-4 h-4" />
							</button>
						{/if}
					</div>

				</div>
			{/each}
		{/if}
	</div>
</Card>

