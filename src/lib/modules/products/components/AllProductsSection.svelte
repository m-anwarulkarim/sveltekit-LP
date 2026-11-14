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
		setTimeout(() => {
			visibleCount = Math.min(visibleCount + pageSize, totalCount);
			isLoading = false;
		}, 300);
	}
</script>

{#if products && products.length > 0}
<section class="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3.5 font-['Anek_Bangla',sans-serif]">
	<!-- Outer White Panel — matches ProductSection -->
	<div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-3 sm:p-6">

		<!-- Section Header -->
		<div class="flex items-center justify-between gap-2 mb-3 sm:mb-5 pb-3 border-b border-slate-100">
			<div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
				<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
					<LayoutGrid class="w-4 h-4 text-slate-600" />
				</div>
				<div class="min-w-0">
					<h2 class="text-[13px] sm:text-base md:text-xl font-bold text-slate-900 font-['Outfit',sans-serif] tracking-tight leading-tight">সকল পণ্য</h2>
					<p class="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight mt-0.5">মোট {totalCount}টি পণ্য</p>
				</div>
			</div>
			<span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
				{visibleCount} / {totalCount}
			</span>
		</div>

		<!-- Product Grid — same card width logic as carousel: 2 on mobile, then 3/4/5 -->
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 md:gap-5">
			{#each visibleProducts as product (product.id)}
				<DynamicProductCard {product} activeCard={page.data?.themeConfig?.views?.productCard} />
			{/each}
		</div>

		<!-- Load More -->
		{#if hasMore}
			<div class="flex justify-center mt-6 sm:mt-8">
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
			<p class="text-center text-xs text-slate-400 mt-6 sm:mt-8 font-medium">সব {totalCount}টি পণ্য দেখানো হয়েছে</p>
		{/if}

	</div>
</section>
{/if}
