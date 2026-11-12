<script lang="ts">
	import type { Product } from '../types';
	import DynamicProductCard from '#lib/modules/layout/product-cards/DynamicProductCard.svelte';
	import { page } from '$app/state';
	import { LayoutGrid, ChevronDown, Loader2 } from 'lucide-svelte';

	interface Props {
		products: Product[];
		pageSize?: number;
	}

	let { products = [], pageSize = 20 }: Props = $props();

	let visibleCount = $state(pageSize);
	let isLoading = $state(false);

	const visibleProducts = $derived(products.slice(0, visibleCount));
	const hasMore = $derived(visibleCount < products.length);
	const totalCount = $derived(products.length);

	function loadMore() {
		isLoading = true;
		// small delay for perceived loading feel
		setTimeout(() => {
			visibleCount = Math.min(visibleCount + pageSize, totalCount);
			isLoading = false;
		}, 300);
	}
</script>

<section class="w-full px-3 sm:px-4 md:px-6 py-6 sm:py-8">
	<!-- Section Header -->
	<div class="flex items-center justify-between mb-5 pb-3 border-b border-slate-200">
		<div class="flex items-center gap-2.5">
			<div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
				<LayoutGrid class="w-5 h-5" />
			</div>
			<div>
				<h2 class="text-base sm:text-lg font-black text-slate-900 leading-tight">সকল পণ্য</h2>
				<p class="text-xs text-slate-500">মোট {totalCount}টি পণ্য</p>
			</div>
		</div>
		<span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
			{visibleCount} / {totalCount}
		</span>
	</div>

	<!-- Product Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
		{#each visibleProducts as product (product.id)}
			<DynamicProductCard {product} activeCard={page.data?.themeConfig?.views?.productCard} />
		{/each}
	</div>

	<!-- Load More -->
	{#if hasMore}
		<div class="flex justify-center mt-8">
			<button
				onclick={loadMore}
				disabled={isLoading}
				class="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
			>
				{#if isLoading}
					<Loader2 class="w-4 h-4 animate-spin" />
					<span>লোড হচ্ছে...</span>
				{:else}
					<ChevronDown class="w-4 h-4" />
					<span>আরও দেখুন ({Math.min(pageSize, totalCount - visibleCount)}টি)</span>
				{/if}
			</button>
		</div>
	{:else if totalCount > 0}
		<p class="text-center text-xs text-slate-400 mt-8 font-medium">সব {totalCount}টি পণ্য দেখানো হয়েছে</p>
	{/if}
</section>
