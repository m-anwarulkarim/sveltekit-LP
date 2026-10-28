<script lang="ts">
	import type { PageData } from './$types';
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import ProductCard from '#lib/modules/products/components/ProductCard.svelte';
	import type { Product } from '#lib/modules/products/types.ts';
	import { Input, Button, Badge } from '#lib/components/ui';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Home, ChevronRight, Search, Flame, Sparkles, Star, PackageOpen } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const FILTER_TABS = [
		{ id: 'all', label: 'সকল পণ্য (All Products)' },
		{ id: 'best-sale', label: '🔥 Best Sale (হট ডিল)' },
		{ id: 'new-arrival', label: '✨ New Arrivals (নতুন)' },
		{ id: 'popular', label: '⭐ Popular (জনপ্রিয়)' }
	];

	let currentFilter = $derived(page.url.searchParams.get('filter') || data.initialFilter || 'all');
	let searchQuery = $state('');

	const filteredProducts = $derived.by<Product[]>(() => {
		let list = [...data.allProducts];

		if (currentFilter === 'best-sale') {
			list = list.filter(
				(p) =>
					p.badge === 'Bestseller' ||
					p.badge === 'Hot Deal' ||
					p.badge === 'Best Sale' ||
					(p.discountPercent && p.discountPercent >= 24)
			);
		} else if (currentFilter === 'new-arrival') {
			list = list.filter(
				(p) =>
					p.badge === 'New Arrival' ||
					p.badge === 'Gentle' ||
					p.id === 'soundcore-motion-boom' ||
					p.id === 'oraimo-smart-trimmer' ||
					p.id === 'aura-spectrum-x'
			);
		} else if (currentFilter === 'popular') {
			list = list.filter(
				(p) =>
					p.badge === 'Popular' ||
					p.badge === 'Top Rated' ||
					p.badge === 'Trending' ||
					p.reviewsCount >= 150
			);
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter((p) => p.name.toLowerCase().includes(q));
		}

		return list;
	});

	function handleTabClick(tabId: string) {
		const newUrl = new URL(page.url);
		if (tabId === 'all') {
			newUrl.searchParams.delete('filter');
		} else {
			newUrl.searchParams.set('filter', tabId);
		}
		goto(newUrl.toString(), { replaceState: true, keepFocus: true });
	}
</script>

<svelte:head>
	<title>All Products | AURA Store</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 font-['Anek_Bangla',sans-serif]">
		
		<!-- Breadcrumbs -->
		<nav class="flex items-center gap-1.5 text-xs text-slate-400 mb-4 overflow-x-auto no-scrollbar py-1">
			<a href="/" class="hover:text-slate-800 transition-colors flex items-center gap-1 shrink-0">
				<Home class="w-3.5 h-3.5" />
				<span>হোম</span>
			</a>
			<ChevronRight class="w-3.5 h-3.5 text-slate-300 shrink-0" />
			<span class="text-slate-900 font-bold">সকল পণ্য</span>
		</nav>

		<!-- Header with Filter Tabs -->
		<div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 mb-5">
			
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">সকল পণ্য সম্ভার</h1>
						<Badge variant="blue" class="px-2.5 py-0.5 rounded-full text-xs font-black">
							{filteredProducts.length} টি
						</Badge>
					</div>
					<p class="text-xs text-slate-500 font-medium mt-0.5">১০০% অথেনটিক পণ্য • ১২-২৪ ঘণ্টায় সারা দেশে ডেলিভারি</p>
				</div>

				<!-- Search Input with shadcn Input -->
				<div class="relative min-w-[200px] sm:min-w-[260px]">
					<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
					<Input
						type="text"
						bind:value={searchQuery}
						placeholder="পণ্য খুঁজুন..."
						class="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border-slate-200 focus-visible:border-[#2563eb] focus-visible:bg-white transition-all font-medium"
					/>
				</div>
			</div>

			<!-- Filter Tabs with shadcn Button -->
			<div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
				{#each FILTER_TABS as tab}
					<Button
						type="button"
						variant={currentFilter === tab.id ? 'blue' : 'secondary'}
						size="sm"
						onclick={() => handleTabClick(tab.id)}
						class="h-auto px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer {currentFilter === tab.id
							? 'shadow-xs'
							: 'bg-slate-100 hover:bg-slate-200 text-slate-700'}"
					>
						{tab.label}
					</Button>
				{/each}
			</div>

		</div>

		<!-- Products Grid -->
		{#if filteredProducts.length > 0}
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
				{#each filteredProducts as product (product.id)}
					<div class="flex">
						<ProductCard {product} />
					</div>
				{/each}
			</div>
		{:else}
			<div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center max-w-md mx-auto space-y-3">
				<PackageOpen class="w-12 h-12 text-slate-400 mx-auto" />
				<h3 class="text-base font-bold text-slate-800">কোনো পণ্য পাওয়া যায়নি</h3>
				<p class="text-xs text-slate-500">আপনার সার্চ অথবা ফিল্টারের সাথে মিল রেখে কোনো পণ্য পাওয়া যায়নি।</p>
			</div>
		{/if}

	</div>
</StoreLayout>
