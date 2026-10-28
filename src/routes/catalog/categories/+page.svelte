<script lang="ts">
	import type { PageData } from './$types';
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import ProductCard from '#lib/modules/products/components/ProductCard.svelte';
	import type { Product } from '#lib/modules/products/types.ts';
	import { Input, Button, Badge } from '#lib/components/ui';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		Home,
		ChevronRight,
		Search,
		PackageOpen
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const CATEGORY_TABS = [
		{ id: 'all', name: 'সকল পণ্য (All)', slug: 'all' },
		{ id: 'electronics', name: 'Electronics', slug: 'electronics' },
		{ id: 'beauty-health', name: 'Beauty & Health', slug: 'beauty-health' },
		{ id: 'books', name: 'বই (Books)', slug: 'books' },
		{ id: 'ebook', name: 'Ebook', slug: 'ebook' },
		{ id: 'audiobook', name: 'Audiobook', slug: 'audiobook' },
		{ id: 'admission-prep', name: 'ভর্তি প্রস্তুতি', slug: 'admission-prep' },
		{ id: 'stationery', name: 'Stationery', slug: 'stationery' },
		{ id: 'science-kit', name: 'Science Kit', slug: 'science-kit' },
		{ id: 'groceries', name: 'Groceries', slug: 'groceries' },
		{ id: 'fashion', name: 'Fashion & Style', slug: 'fashion' },
		{ id: 'smart-gadgets', name: 'Smart Gadgets', slug: 'smart-gadgets' },
		{ id: 'home-living', name: 'Home & Living', slug: 'home-living' }
	];

	// Reactive filter from URL query
	let currentFilter = $derived(page.url.searchParams.get('filter') || data.initialFilter || 'all');
	let currentSort = $state<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount'>('featured');
	let searchQuery = $state('');

	// Active category title
	const activeCategoryObj = $derived(
		CATEGORY_TABS.find((c) => c.slug === currentFilter || c.id === currentFilter) || CATEGORY_TABS[0]
	);

	// Filter and sort products
	const filteredProducts = $derived.by<Product[]>(() => {
		let list = [...data.allProducts];

		// 1. Category Filter
		if (currentFilter !== 'all') {
			list = list.filter(
				(p) =>
					p.category === currentFilter ||
					p.categoryLabel.toLowerCase().includes(currentFilter.toLowerCase()) ||
					(currentFilter === 'electronics' && (p.category === 'electronics' || p.category === 'headphones' || p.category === 'in-ears')) ||
					(currentFilter === 'beauty-health' && p.category === 'beauty-health')
			);
		}

		// 2. Search Query Filter
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(p) =>
					p.name.toLowerCase().includes(q) ||
					(p.tagline && p.tagline.toLowerCase().includes(q)) ||
					p.categoryLabel.toLowerCase().includes(q)
			);
		}

		// 3. Sorting
		if (currentSort === 'price-asc') {
			list.sort((a, b) => a.price - b.price);
		} else if (currentSort === 'price-desc') {
			list.sort((a, b) => b.price - a.price);
		} else if (currentSort === 'rating') {
			list.sort((a, b) => b.rating - a.rating);
		} else if (currentSort === 'discount') {
			list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
		}

		return list;
	});

	function handleCategoryClick(slug: string) {
		const newUrl = new URL(page.url);
		if (slug === 'all') {
			newUrl.searchParams.delete('filter');
		} else {
			newUrl.searchParams.set('filter', slug);
		}
		goto(newUrl.toString(), { replaceState: true, keepFocus: true });
	}
</script>

<svelte:head>
	<title>{activeCategoryObj.name} | AURA Store Catalog</title>
	<meta
		name="description"
		content="Explore {activeCategoryObj.name} products at best prices with express 12-24 hours delivery across Bangladesh."
	/>
</svelte:head>

<StoreLayout user={data.user}>
	
	<div class="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 font-['Anek_Bangla',sans-serif]">
		
		<!-- 1. Breadcrumbs Trail -->
		<nav class="flex items-center gap-1.5 text-xs text-slate-400 mb-4 overflow-x-auto no-scrollbar py-1">
			<a href="/" class="hover:text-slate-800 transition-colors flex items-center gap-1 shrink-0">
				<Home class="w-3.5 h-3.5" />
				<span>হোম</span>
			</a>
			<ChevronRight class="w-3.5 h-3.5 text-slate-300 shrink-0" />
			<a href="/catalog/categories" class="hover:text-slate-800 transition-colors shrink-0">
				ক্যাটালগ
			</a>
			<ChevronRight class="w-3.5 h-3.5 text-slate-300 shrink-0" />
			<span class="text-slate-900 font-bold truncate">
				{activeCategoryObj.name}
			</span>
		</nav>

		<!-- 2. Category Title Header & Search/Sort Bar -->
		<div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 mb-5">
			
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit',sans-serif] tracking-tight">
							{activeCategoryObj.name}
						</h1>
						<Badge variant="blue" class="px-2.5 py-0.5 rounded-full text-xs font-black">
							{filteredProducts.length} টি পণ্য
						</Badge>
					</div>
					<p class="text-xs text-slate-500 font-medium mt-0.5">
						১০০% অরিজিনাল অথেনটিক কালেকশন • ১২-২৪ ঘণ্টায় দ্রুততম হোম ডেলিভারি
					</p>
				</div>

				<!-- Sort & Search Inputs -->
				<div class="flex items-center gap-2.5 flex-wrap">
					<!-- Search in Category with shadcn Input -->
					<div class="relative min-w-[180px] sm:min-w-[220px]">
						<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
						<Input
							type="text"
							bind:value={searchQuery}
							placeholder="এই ক্যাটাগরিতে খুঁজুন..."
							class="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border-slate-200 focus-visible:border-[#2563eb] focus-visible:bg-white transition-all font-medium"
						/>
					</div>

					<!-- Sort Dropdown -->
					<div class="relative">
						<select
							bind:value={currentSort}
							class="pl-3 pr-8 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-[#2563eb] cursor-pointer"
						>
							<option value="featured">জনপ্রিয়তা (Featured)</option>
							<option value="price-asc">দাম: কম থেকে বেশি</option>
							<option value="price-desc">দাম: বেশি থেকে কম</option>
							<option value="discount">সর্বোচ্চ ছাড় (% Off)</option>
							<option value="rating">সেরা রেটিং (Top Rated)</option>
						</select>
					</div>
				</div>
			</div>

			<!-- 3. Horizontal Scrollable Category Chips with shadcn Button -->
			<div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
				{#each CATEGORY_TABS as tab}
					<Button
						type="button"
						variant={currentFilter === tab.slug || (currentFilter === 'all' && tab.slug === 'all') ? 'blue' : 'secondary'}
						size="sm"
						onclick={() => handleCategoryClick(tab.slug)}
						class="h-auto px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer {currentFilter === tab.slug || (currentFilter === 'all' && tab.slug === 'all')
							? 'shadow-xs'
							: 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'}"
					>
						{tab.name}
					</Button>
				{/each}
			</div>

		</div>

		<!-- 4. Products Grid -->
		{#if filteredProducts.length > 0}
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
				{#each filteredProducts as product (product.id)}
					<div class="flex">
						<ProductCard {product} />
					</div>
				{/each}
			</div>
		{:else}
			<!-- Friendly Empty State with shadcn Button -->
			<div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-10 sm:p-16 text-center max-w-lg mx-auto space-y-4">
				<div class="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center mx-auto shadow-inner">
					<PackageOpen class="w-8 h-8" />
				</div>
				<div class="space-y-1.5">
					<h3 class="text-base sm:text-lg font-bold text-slate-900 font-['Outfit']">
						এই ক্যাটাগরিতে পণ্য দ্রুত আসছে!
					</h3>
					<p class="text-xs text-slate-500 leading-relaxed">
						'{activeCategoryObj.name}' ক্যাটাগরির নতুন স্টক দ্রুত ইনভেন্টরিতে যুক্ত করা হচ্ছে। অনুগ্রহ করে অন্যান্য ক্যাটাগরি ব্রাউজ করুন।
					</p>
				</div>
				<Button
					type="button"
					variant="blue"
					onclick={() => handleCategoryClick('all')}
					class="h-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer"
				>
					সকল পণ্য দেখুন
				</Button>
			</div>
		{/if}

	</div>

</StoreLayout>
