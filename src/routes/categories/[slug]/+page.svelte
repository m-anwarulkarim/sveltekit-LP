<script lang="ts">
	import type { PageData } from './$types';
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import ProductCard from '#lib/modules/products/components/ProductCard.svelte';
	import type { Product } from '#lib/modules/products/types.ts';
	import { Button, Badge } from '#lib/components/ui';
	import { page } from '$app/state';
	import {
		Home,
		ChevronRight,
		SlidersHorizontal,
		PackageOpen,
		Sparkles,
		ShieldCheck,
		Zap,
		Layers
	} from 'lucide-svelte';
	import CategoryFilterSidebar from './_components/CategoryFilterSidebar.svelte';
	import CategoryMobileFilterDrawer from './_components/CategoryMobileFilterDrawer.svelte';
	import CategorySubchips from './_components/CategorySubchips.svelte';
	import ActiveFilterBadges from './_components/ActiveFilterBadges.svelte';
	import CategorySortDropdown from './_components/CategorySortDropdown.svelte';

	let { data }: { data: PageData } = $props();

	// Filter states
	let selectedSub = $state<string>('all');
	let selectedBrands = $state<string[]>([]);
	let minPrice = $state<number | null>(null);
	let maxPrice = $state<number | null>(null);
	let selectedRating = $state<number | null>(null);
	let inStockOnly = $state<boolean>(false);
	let expressOnly = $state<boolean>(false);
	let onSaleOnly = $state<boolean>(false);
	let searchQuery = $state<string>('');
	let currentSort = $state<string>('featured');

	// Mobile drawer state
	let isMobileDrawerOpen = $state<boolean>(false);

	// Read initial query params from URL if any
	$effect(() => {
		const subParam = page.url.searchParams.get('sub');
		if (subParam) selectedSub = subParam;
		const sortParam = page.url.searchParams.get('sort');
		if (sortParam) currentSort = sortParam;
	});

	// Handle filter updates
	function handleFilterUpdate(key: string, value: any) {
		if (key === 'selectedSub') selectedSub = value;
		else if (key === 'selectedBrands') selectedBrands = value;
		else if (key === 'minPrice') minPrice = value;
		else if (key === 'maxPrice') maxPrice = value;
		else if (key === 'selectedRating') selectedRating = value;
		else if (key === 'inStockOnly') inStockOnly = value;
		else if (key === 'expressOnly') expressOnly = value;
		else if (key === 'onSaleOnly') onSaleOnly = value;
		else if (key === 'searchQuery') searchQuery = value;
		else if (key === 'currentSort') currentSort = value;
	}

	function resetAllFilters() {
		selectedSub = 'all';
		selectedBrands = [];
		minPrice = null;
		maxPrice = null;
		selectedRating = null;
		inStockOnly = false;
		expressOnly = false;
		onSaleOnly = false;
		searchQuery = '';
		currentSort = 'featured';
	}

	// Filtered Products computation
	const filteredProducts = $derived.by<Product[]>(() => {
		let list = [...data.products];

		// If no products in category, fallback to store products for demo preview if applicable
		if (list.length === 0 && data.allStoreProducts) {
			list = data.allStoreProducts.slice(0, 8);
		}

		// 1. Sub-category
		if (selectedSub && selectedSub !== 'all') {
			list = list.filter((p) => p.subCategory === selectedSub);
		}

		// 2. Brands
		if (selectedBrands.length > 0) {
			list = list.filter((p) => p.brand && selectedBrands.includes(p.brand));
		}

		// 3. Price Range
		if (minPrice !== null) {
			list = list.filter((p) => p.price >= minPrice!);
		}
		if (maxPrice !== null) {
			list = list.filter((p) => p.price <= maxPrice!);
		}

		// 4. Rating
		if (selectedRating !== null) {
			list = list.filter((p) => p.rating >= selectedRating!);
		}

		// 5. In-stock
		if (inStockOnly) {
			list = list.filter((p) => p.inStock !== false);
		}

		// 6. Express delivery
		if (expressOnly) {
			list = list.filter((p) => p.deliveryTime?.includes('12-24'));
		}

		// 7. On sale / discount
		if (onSaleOnly) {
			list = list.filter((p) => (p.discountPercent || 0) > 0);
		}

		// 8. Search query
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(p) =>
					p.name.toLowerCase().includes(q) ||
					(p.tagline && p.tagline.toLowerCase().includes(q)) ||
					(p.brand && p.brand.toLowerCase().includes(q))
			);
		}

		// 9. Sorting
		if (currentSort === 'price-asc') {
			list.sort((a, b) => a.price - b.price);
		} else if (currentSort === 'price-desc') {
			list.sort((a, b) => b.price - a.price);
		} else if (currentSort === 'discount') {
			list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
		} else if (currentSort === 'rating') {
			list.sort((a, b) => b.rating - a.rating);
		} else if (currentSort === 'newest') {
			list.sort((a, b) => (b.badge === 'New Arrival' ? 1 : -1));
		}

		return list;
	});

	// Active filter items list for badges
	const activeFilterItems = $derived.by(() => {
		const items: {
			type: 'subCategory' | 'brand' | 'price' | 'rating' | 'inStock' | 'express' | 'search';
			label: string;
			value: string;
		}[] = [];

		if (selectedSub && selectedSub !== 'all') {
			const subObj = data.category.subCategories.find((s) => s.slug === selectedSub);
			items.push({
				type: 'subCategory',
				label: subObj ? subObj.name : selectedSub,
				value: selectedSub
			});
		}

		selectedBrands.forEach((b) => {
			items.push({
				type: 'brand',
				label: `ব্র্যান্ড: ${b}`,
				value: b
			});
		});

		if (minPrice !== null && maxPrice !== null) {
			items.push({
				type: 'price',
				label: `৳${minPrice} - ৳${maxPrice}`,
				value: 'range'
			});
		} else if (minPrice !== null) {
			items.push({
				type: 'price',
				label: `> ৳${minPrice}`,
				value: 'min'
			});
		} else if (maxPrice !== null) {
			items.push({
				type: 'price',
				label: `< ৳${maxPrice}`,
				value: 'max'
			});
		}

		if (selectedRating !== null) {
			items.push({
				type: 'rating',
				label: `${selectedRating}★ ও তদূর্ধ্ব`,
				value: String(selectedRating)
			});
		}

		if (inStockOnly) {
			items.push({
				type: 'inStock',
				label: 'ইন-স্টক পণ্য',
				value: 'inStock'
			});
		}

		if (expressOnly) {
			items.push({
				type: 'express',
				label: '১২-২৪ ঘণ্টা ডেলিভারি',
				value: 'express'
			});
		}

		if (searchQuery.trim()) {
			items.push({
				type: 'search',
				label: `সার্চ: "${searchQuery}"`,
				value: 'search'
			});
		}

		return items;
	});

	function removeActiveFilter(item: { type: string; value: string }) {
		if (item.type === 'subCategory') selectedSub = 'all';
		else if (item.type === 'brand') {
			selectedBrands = selectedBrands.filter((b) => b !== item.value);
		} else if (item.type === 'price') {
			minPrice = null;
			maxPrice = null;
		} else if (item.type === 'rating') selectedRating = null;
		else if (item.type === 'inStock') inStockOnly = false;
		else if (item.type === 'express') expressOnly = false;
		else if (item.type === 'search') searchQuery = '';
	}
</script>

<svelte:head>
	<title>{data.category.name} | {data.category.nameBn} - AURA Store</title>
	<meta name="description" content="{data.category.desc}. সেরা দামে অরিজিনাল কালেকশন ও ১২-২৪ ঘণ্টায় দ্রুততম ডেলিভারি।" />
</svelte:head>

<StoreLayout user={data.user}>
	
	<div class="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 font-['Anek_Bangla',sans-serif]">
		
		<!-- 1. Breadcrumbs Trail -->
		<nav class="flex items-center gap-1.5 text-xs text-slate-400 mb-3 overflow-x-auto no-scrollbar py-1">
			<a href="/" class="hover:text-slate-800 transition-colors flex items-center gap-1 shrink-0">
				<Home class="w-3.5 h-3.5" />
				<span>হোম</span>
			</a>
			<ChevronRight class="w-3.5 h-3.5 text-slate-300 shrink-0" />
			<a href="/catalog/all-category" class="hover:text-slate-800 transition-colors shrink-0">
				ক্যাটাগরি
			</a>
			<ChevronRight class="w-3.5 h-3.5 text-slate-300 shrink-0" />
			<span class="text-slate-900 font-bold truncate">
				{data.category.nameBn}
			</span>
		</nav>

		<!-- 2. Rich Category Hero Banner -->
		<div
			class="relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-5 sm:mb-6 text-white overflow-hidden shadow-lg bg-gradient-to-r {data.category.bannerGradient}"
		>
			<!-- Ambient background pattern -->
			<div class="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
			<div class="absolute right-10 bottom-0 text-white/10 text-8xl sm:text-9xl font-black select-none pointer-events-none font-['Outfit']">
				{data.category.icon}
			</div>

			<div class="relative z-10 max-w-2xl space-y-3">
				<div class="flex items-center gap-2">
					<span class="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 text-white border border-white/20">
						<span>{data.category.icon}</span>
						<span>অফিসিয়াল ক্যাটাগরি</span>
					</span>
					<span class="px-3 py-1 rounded-full bg-amber-400/90 text-slate-950 text-xs font-extrabold flex items-center gap-1 shadow-sm">
						<Zap class="w-3 h-3 fill-slate-950" />
						<span>১২-২৪ ঘণ্টায় এক্সপ্রেস ডেলিভারি</span>
					</span>
				</div>

				<div>
					<h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-['Outfit'] tracking-tight flex items-baseline gap-3 flex-wrap">
						<span>{data.category.nameBn}</span>
						<span class="text-base sm:text-lg text-white/75 font-normal">({data.category.name})</span>
					</h1>
					<p class="text-xs sm:text-sm text-white/90 font-medium mt-1 leading-relaxed max-w-xl">
						{data.category.desc}
					</p>
				</div>

				<!-- Quick Sub-Category Pills Bar -->
				<div class="pt-1">
					<CategorySubchips
						subCategories={data.category.subCategories}
						{selectedSub}
						onSelect={(sub) => handleFilterUpdate('selectedSub', sub)}
					/>
				</div>
			</div>
		</div>

		<!-- 3. Main 2-Column Content Layout (Desktop Sticky Sidebar + Product Grid) -->
		<div class="flex flex-col lg:flex-row gap-5 items-start">
			
			<!-- Left Sticky Sidebar (Desktop only) -->
			<div class="hidden lg:block w-72 shrink-0 sticky top-24">
				<CategoryFilterSidebar
					subCategories={data.category.subCategories}
					brands={data.category.brands}
					{selectedSub}
					{selectedBrands}
					{minPrice}
					{maxPrice}
					{selectedRating}
					{inStockOnly}
					{expressOnly}
					{onSaleOnly}
					{searchQuery}
					onUpdate={handleFilterUpdate}
					onResetAll={resetAllFilters}
				/>
			</div>

			<!-- Right Products Main Section -->
			<div class="flex-1 w-full min-w-0">
				
				<!-- Product Grid Controls Header -->
				<div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 sm:p-4 mb-4 flex items-center justify-between gap-3 flex-wrap">
					
					<!-- Product Count Info -->
					<div class="flex items-center gap-2">
						<h2 class="text-xs sm:text-sm font-bold text-slate-900 font-['Outfit']">
							{filteredProducts.length} টি পণ্য পাওয়া গেছে
						</h2>
						{#if activeFilterItems.length > 0}
							<Badge variant="blue" class="text-xs font-semibold py-0.5 px-2">
								ফিল্টার যুক্ত
							</Badge>
						{/if}
					</div>

					<div class="flex items-center gap-2">
						<!-- Mobile Filter Button with shadcn Button -->
						<Button
							variant="secondary"
							size="sm"
							onclick={() => (isMobileDrawerOpen = true)}
							class="lg:hidden h-auto px-3.5 py-2 rounded-xl text-slate-800 text-xs font-bold flex items-center gap-1.5"
						>
							<SlidersHorizontal class="w-3.5 h-3.5 text-[#2563eb]" />
							<span>ফিল্টার</span>
							{#if activeFilterItems.length > 0}
								<Badge variant="blue" class="w-4 h-4 rounded-full text-white text-[10px] p-0 flex items-center justify-center font-bold">
									{activeFilterItems.length}
								</Badge>
							{/if}
						</Button>

						<!-- Sort Dropdown -->
						<CategorySortDropdown
							sort={currentSort}
							onChange={(newSort) => handleFilterUpdate('currentSort', newSort)}
						/>
					</div>

				</div>

				<!-- Active Selected Filter Pills -->
				<ActiveFilterBadges
					activeFilters={activeFilterItems}
					onRemove={removeActiveFilter}
					onClearAll={resetAllFilters}
				/>

				<!-- 4. Products Grid -->
				{#if filteredProducts.length > 0}
					<div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
						{#each filteredProducts as product (product.id)}
							<div class="flex">
								<ProductCard {product} />
							</div>
						{/each}
					</div>
				{:else}
					<!-- Empty State -->
					<div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-10 sm:p-16 text-center max-w-md mx-auto space-y-4 my-6">
						<div class="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center mx-auto shadow-inner">
							<PackageOpen class="w-8 h-8" />
						</div>
						<div class="space-y-1.5">
							<h3 class="text-base sm:text-lg font-bold text-slate-900 font-['Outfit']">
								কোনো পণ্য খুঁজে পাওয়া যায়নি!
							</h3>
							<p class="text-xs text-slate-500 leading-relaxed">
								আপনার নির্বাচিত ফিল্টারের সাথে মিলে এমন কোনো পণ্য মেলেনি। অনুগ্রহ করে ফিল্টার পরিবর্তন বা রিসেট করুন।
							</p>
						</div>
						<Button
							variant="blue"
							onclick={resetAllFilters}
							class="h-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md"
						>
							সকল ফিল্টার রিসেট করুন
						</Button>
					</div>
				{/if}

			</div>

		</div>

	</div>

	<!-- Mobile Filter Bottom Sheet Drawer -->
	<CategoryMobileFilterDrawer
		isOpen={isMobileDrawerOpen}
		onClose={() => (isMobileDrawerOpen = false)}
		subCategories={data.category.subCategories}
		brands={data.category.brands}
		{selectedSub}
		{selectedBrands}
		{minPrice}
		{maxPrice}
		{selectedRating}
		{inStockOnly}
		{expressOnly}
		{onSaleOnly}
		{searchQuery}
		resultCount={filteredProducts.length}
		onUpdate={handleFilterUpdate}
		onResetAll={resetAllFilters}
	/>

</StoreLayout>

