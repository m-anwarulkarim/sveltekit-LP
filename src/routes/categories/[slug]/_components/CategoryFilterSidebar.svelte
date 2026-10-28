<script lang="ts">
	import type { SubCategory } from '#lib/modules/products/categories.data';
	import { Input, Button, Checkbox, Badge } from '#lib/components/ui';
	import {
		SlidersHorizontal,
		RotateCcw,
		Search,
		Star,
		Check,
		ChevronDown,
		ChevronUp,
		Zap
	} from 'lucide-svelte';

	interface FilterProps {
		subCategories: SubCategory[];
		brands: string[];
		selectedSub: string;
		selectedBrands: string[];
		minPrice: number | null;
		maxPrice: number | null;
		selectedRating: number | null;
		inStockOnly: boolean;
		expressOnly: boolean;
		onSaleOnly: boolean;
		searchQuery: string;
		onUpdate: (key: string, value: any) => void;
		onResetAll: () => void;
	}

	let {
		subCategories = [],
		brands = [],
		selectedSub,
		selectedBrands = [],
		minPrice,
		maxPrice,
		selectedRating,
		inStockOnly,
		expressOnly,
		onSaleOnly,
		searchQuery,
		onUpdate,
		onResetAll
	}: FilterProps = $props();

	// Section Collapse states
	let openSub = $state(true);
	let openPrice = $state(true);
	let openBrands = $state(true);
	let openRating = $state(true);
	let openAvailability = $state(true);

	// Local price inputs
	let localMin = $state(minPrice ? String(minPrice) : '');
	let localMax = $state(maxPrice ? String(maxPrice) : '');
	let brandSearch = $state('');

	$effect(() => {
		localMin = minPrice ? String(minPrice) : '';
		localMax = maxPrice ? String(maxPrice) : '';
	});

	function applyPriceFilter() {
		const minVal = localMin.trim() ? Number(localMin) : null;
		const maxVal = localMax.trim() ? Number(localMax) : null;
		onUpdate('minPrice', minVal);
		onUpdate('maxPrice', maxVal);
	}

	function setQuickPrice(min: number | null, max: number | null) {
		localMin = min ? String(min) : '';
		localMax = max ? String(max) : '';
		onUpdate('minPrice', min);
		onUpdate('maxPrice', max);
	}

	function toggleBrand(b: string) {
		let updated: string[];
		if (selectedBrands.includes(b)) {
			updated = selectedBrands.filter((item) => item !== b);
		} else {
			updated = [...selectedBrands, b];
		}
		onUpdate('selectedBrands', updated);
	}

	const filteredBrands = $derived(
		brandSearch.trim()
			? brands.filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase().trim()))
			: brands
	);
</script>

<aside class="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 font-['Anek_Bangla',sans-serif]">
	<!-- Top Filter Header -->
	<div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
		<div class="flex items-center gap-2 text-slate-900 font-bold text-sm">
			<SlidersHorizontal class="w-4 h-4 text-[#2563eb]" />
			<span>ফিল্টার সমূহ</span>
		</div>
		<Button
			type="button"
			variant="ghost"
			size="sm"
			onclick={onResetAll}
			class="h-auto p-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-1 transition-colors cursor-pointer"
		>
			<RotateCcw class="w-3 h-3" />
			<span>রিসেট</span>
		</Button>
	</div>

	<!-- 1. Search Within Category using shadcn Input -->
	<div class="mb-5">
		<label for="filter-search" class="block text-xs font-bold text-slate-700 mb-1.5">ক্যাটাগরিতে খুঁজুন</label>
		<div class="relative">
			<Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
			<Input
				id="filter-search"
				type="text"
				value={searchQuery}
				oninput={(e) => onUpdate('searchQuery', e.currentTarget.value)}
				placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
				class="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border-slate-200/90 focus-visible:border-[#2563eb] focus-visible:bg-white font-medium"
			/>
		</div>
	</div>

	<!-- 2. Sub-categories -->
	{#if subCategories.length > 0}
		<div class="border-b border-slate-100 pb-4 mb-4">
			<button
				type="button"
				onclick={() => (openSub = !openSub)}
				class="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-slate-950 transition-colors py-1 cursor-pointer"
			>
				<span>সাব-ক্যাটাগরি</span>
				{#if openSub}
					<ChevronUp class="w-3.5 h-3.5 text-slate-400" />
				{:else}
					<ChevronDown class="w-3.5 h-3.5 text-slate-400" />
				{/if}
			</button>

			{#if openSub}
				<div class="mt-2.5 space-y-1">
					{#each subCategories as sub}
						{@const isSelected = selectedSub === sub.slug || (selectedSub === '' && sub.slug === 'all')}
						<button
							type="button"
							onclick={() => onUpdate('selectedSub', sub.slug)}
							class="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer {isSelected
								? 'bg-blue-50 text-[#2563eb] font-bold'
								: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
						>
							<span>{sub.name}</span>
							{#if isSelected}
								<Check class="w-3.5 h-3.5 text-[#2563eb]" />
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- 3. Price Range Filter -->
	<div class="border-b border-slate-100 pb-4 mb-4">
		<button
			type="button"
			onclick={() => (openPrice = !openPrice)}
			class="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-slate-950 transition-colors py-1 cursor-pointer"
		>
			<span>মূল্য সীমা (টাকা)</span>
			{#if openPrice}
				<ChevronUp class="w-3.5 h-3.5 text-slate-400" />
			{:else}
				<ChevronDown class="w-3.5 h-3.5 text-slate-400" />
			{/if}
		</button>

		{#if openPrice}
			<div class="mt-2.5 space-y-3">
				<!-- Quick price buttons using shadcn Button -->
				<div class="grid grid-cols-3 gap-1 text-[11px] font-semibold">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => setQuickPrice(null, 1000)}
						class="h-7 px-1 text-[11px] font-medium rounded-md text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border-slate-200"
					>
						&lt; ১০০০৳
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => setQuickPrice(1000, 3000)}
						class="h-7 px-1 text-[11px] font-medium rounded-md text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border-slate-200"
					>
						১হাজার-৩হাজার
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => setQuickPrice(3000, null)}
						class="h-7 px-1 text-[11px] font-medium rounded-md text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border-slate-200"
					>
						৩০০০৳+
					</Button>
				</div>

				<!-- Min - Max Input Boxes with shadcn Input & Button -->
				<div class="flex items-center gap-2">
					<div class="relative flex-1">
						<span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs z-10">৳</span>
						<Input
							type="number"
							bind:value={localMin}
							placeholder="Min"
							class="h-8 pl-6 pr-2 py-1 text-xs rounded-lg bg-slate-50 border-slate-200/90 font-mono"
						/>
					</div>
					<span class="text-slate-400 text-xs">-</span>
					<div class="relative flex-1">
						<span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs z-10">৳</span>
						<Input
							type="number"
							bind:value={localMax}
							placeholder="Max"
							class="h-8 pl-6 pr-2 py-1 text-xs rounded-lg bg-slate-50 border-slate-200/90 font-mono"
						/>
					</div>
					<Button
						type="button"
						variant="blue"
						size="sm"
						onclick={applyPriceFilter}
						class="h-8 px-3 rounded-lg text-xs font-bold"
					>
						Go
					</Button>
				</div>
			</div>
		{/if}
	</div>

	<!-- 4. Brands Filter -->
	{#if brands.length > 0}
		<div class="border-b border-slate-100 pb-4 mb-4">
			<button
				type="button"
				onclick={() => (openBrands = !openBrands)}
				class="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-slate-950 transition-colors py-1 cursor-pointer"
			>
				<span>ব্র্যান্ড / পাবলিশার ({brands.length})</span>
				{#if openBrands}
					<ChevronUp class="w-3.5 h-3.5 text-slate-400" />
				{:else}
					<ChevronDown class="w-3.5 h-3.5 text-slate-400" />
				{/if}
			</button>

			{#if openBrands}
				<div class="mt-2.5 space-y-2">
					{#if brands.length > 6}
						<div class="relative mb-2">
							<Input
								type="text"
								bind:value={brandSearch}
								placeholder="ব্র্যান্ড খুঁজুন..."
								class="h-7 px-2.5 py-1 text-[11px] rounded-md bg-slate-50 border-slate-200"
							/>
						</div>
					{/if}

					<div class="max-h-48 overflow-y-auto no-scrollbar space-y-1.5">
						{#each filteredBrands as b}
							{@const checked = selectedBrands.includes(b)}
							<label class="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-950 cursor-pointer group py-0.5">
								<Checkbox
									checked={checked}
									onCheckedChange={() => toggleBrand(b)}
									class={checked ? 'bg-[#2563eb] border-[#2563eb]' : ''}
								/>
								<span class="group-hover:translate-x-0.5 transition-transform {checked ? 'font-bold text-[#2563eb]' : ''}">{b}</span>
							</label>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- 5. Rating Filter -->
	<div class="border-b border-slate-100 pb-4 mb-4">
		<button
			type="button"
			onclick={() => (openRating = !openRating)}
			class="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-slate-950 transition-colors py-1 cursor-pointer"
		>
			<span>কাস্টমার রিভিউ রেটিং</span>
			{#if openRating}
				<ChevronUp class="w-3.5 h-3.5 text-slate-400" />
			{:else}
				<ChevronDown class="w-3.5 h-3.5 text-slate-400" />
			{/if}
		</button>

		{#if openRating}
			<div class="mt-2.5 space-y-1.5">
				{#each [5, 4, 3] as ratingVal}
					{@const isSelected = selectedRating === ratingVal}
					<button
						type="button"
						onclick={() => onUpdate('selectedRating', isSelected ? null : ratingVal)}
						class="w-full flex items-center justify-between px-2 py-1 rounded-md text-xs transition-colors cursor-pointer {isSelected
							? 'bg-amber-50 text-amber-900 font-bold'
							: 'hover:bg-slate-50 text-slate-700'}"
					>
						<div class="flex items-center gap-1.5">
							<div class="flex items-center text-amber-400">
								{#each Array(5) as _, i}
									<Star class="w-3 h-3 {i < ratingVal ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}" />
								{/each}
							</div>
							<span class="text-[11px]">{ratingVal}★ ও তদূর্ধ্ব</span>
						</div>
						{#if isSelected}
							<Check class="w-3.5 h-3.5 text-amber-600" />
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- 6. Availability & Fast Delivery Toggles using shadcn Checkbox -->
	<div>
		<button
			type="button"
			onclick={() => (openAvailability = !openAvailability)}
			class="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-slate-950 transition-colors py-1 cursor-pointer"
		>
			<span>ডেলিভারি ও স্টক</span>
			{#if openAvailability}
				<ChevronUp class="w-3.5 h-3.5 text-slate-400" />
			{:else}
				<ChevronDown class="w-3.5 h-3.5 text-slate-400" />
			{/if}
		</button>

		{#if openAvailability}
			<div class="mt-2.5 space-y-2">
				<!-- In Stock Only -->
				<label class="flex items-center justify-between text-xs text-slate-700 cursor-pointer group py-1">
					<span>শুধুমাত্র ইন-স্টক পণ্য</span>
					<Checkbox
						checked={inStockOnly}
						onCheckedChange={(val) => onUpdate('inStockOnly', val)}
						class={inStockOnly ? 'bg-[#2563eb] border-[#2563eb]' : ''}
					/>
				</label>

				<!-- Express Delivery 12-24 Hours -->
				<label class="flex items-center justify-between text-xs text-slate-700 cursor-pointer group py-1">
					<span class="flex items-center gap-1 text-[#2563eb] font-semibold">
						<Zap class="w-3.5 h-3.5 fill-[#2563eb]" />
						<span>১২-২৪ ঘণ্টায় ডেলিভারি</span>
					</span>
					<Checkbox
						checked={expressOnly}
						onCheckedChange={(val) => onUpdate('expressOnly', val)}
						class={expressOnly ? 'bg-[#2563eb] border-[#2563eb]' : ''}
					/>
				</label>

				<!-- Discounted Deals Only -->
				<label class="flex items-center justify-between text-xs text-slate-700 cursor-pointer group py-1">
					<span>অফার যুক্ত পণ্য (% Off)</span>
					<Checkbox
						checked={onSaleOnly}
						onCheckedChange={(val) => onUpdate('onSaleOnly', val)}
						class={onSaleOnly ? 'bg-[#2563eb] border-[#2563eb]' : ''}
					/>
				</label>
			</div>
		{/if}
	</div>
</aside>
