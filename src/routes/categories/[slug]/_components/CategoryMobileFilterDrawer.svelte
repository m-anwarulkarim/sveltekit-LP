<script lang="ts">
	import type { SubCategory } from '#lib/modules/products/categories.data';
	import { Input, Button, Checkbox } from '#lib/components/ui';
	import {
		X,
		RotateCcw,
		Search,
		Star,
		Check,
		Zap,
		SlidersHorizontal
	} from 'lucide-svelte';

	interface MobileDrawerProps {
		isOpen: boolean;
		onClose: () => void;
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
		resultCount: number;
		onUpdate: (key: string, value: any) => void;
		onResetAll: () => void;
	}

	let {
		isOpen = false,
		onClose,
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
		resultCount = 0,
		onUpdate,
		onResetAll
	}: MobileDrawerProps = $props();

	let localMin = $state(minPrice ? String(minPrice) : '');
	let localMax = $state(maxPrice ? String(maxPrice) : '');

	$effect(() => {
		localMin = minPrice ? String(minPrice) : '';
		localMax = maxPrice ? String(maxPrice) : '';
	});

	function applyPrice() {
		onUpdate('minPrice', localMin ? Number(localMin) : null);
		onUpdate('maxPrice', localMax ? Number(localMax) : null);
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
</script>

{#if isOpen}
	<!-- Backdrop overlay -->
	<div
		role="button"
		tabindex="0"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity"
		aria-label="Close mobile filter backdrop"
	></div>

	<!-- Bottom Sheet Content -->
	<div
		class="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col font-['Anek_Bangla',sans-serif] animate-in slide-in-from-bottom duration-300"
		role="dialog"
		aria-modal="true"
	>
		<!-- Handle indicator -->
		<div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3"></div>

		<!-- Top Header -->
		<div class="flex items-center justify-between px-5 py-3 border-b border-slate-100">
			<div class="flex items-center gap-2">
				<SlidersHorizontal class="w-4 h-4 text-[#2563eb]" />
				<h3 class="text-sm font-bold text-slate-900 font-['Outfit']">ফিল্টার ও পছন্দসমূহ</h3>
			</div>
			<div class="flex items-center gap-2">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onclick={onResetAll}
					class="h-auto px-2 py-1 text-xs text-rose-600 font-bold hover:text-rose-700 hover:bg-rose-50"
				>
					রিসেট
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onclick={onClose}
					class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 p-0"
					aria-label="Close drawer"
				>
					<X class="w-4 h-4" />
				</Button>
			</div>
		</div>

		<!-- Scrollable Filter Content -->
		<div class="overflow-y-auto px-5 py-4 space-y-5 flex-1">
			<!-- 1. Search in category using shadcn Input -->
			<div>
				<label for="mobile-filter-search" class="block text-xs font-bold text-slate-700 mb-1.5">পণ্য সার্চ করুন</label>
				<div class="relative">
					<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
					<Input
						id="mobile-filter-search"
						type="text"
						value={searchQuery}
						oninput={(e) => onUpdate('searchQuery', e.currentTarget.value)}
						placeholder="পণ্যের নাম লিখুন..."
						class="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border-slate-200 focus-visible:border-[#2563eb]"
					/>
				</div>
			</div>

			<!-- 2. Sub-categories -->
			{#if subCategories.length > 0}
				<div>
					<h4 class="text-xs font-bold text-slate-900 mb-2">সাব-ক্যাটাগরি</h4>
					<div class="flex flex-wrap gap-1.5">
						{#each subCategories as sub}
							{@const isSelected = selectedSub === sub.slug || (selectedSub === '' && sub.slug === 'all')}
							<button
								type="button"
								onclick={() => onUpdate('selectedSub', sub.slug)}
								class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer {isSelected
									? 'bg-[#2563eb] text-white shadow-xs'
									: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
							>
								{sub.name}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- 3. Price Range with shadcn Input & Button -->
			<div>
				<h4 class="text-xs font-bold text-slate-900 mb-2">মূল্য সীমা (টাকা)</h4>
				<div class="flex items-center gap-2">
					<Input
						type="number"
						bind:value={localMin}
						placeholder="মিনিমাম"
						class="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border-slate-200"
					/>
					<span class="text-slate-400">-</span>
					<Input
						type="number"
						bind:value={localMax}
						placeholder="ম্যাক্সিমাম"
						class="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border-slate-200"
					/>
					<Button
						type="button"
						variant="blue"
						size="sm"
						onclick={applyPrice}
						class="h-auto px-4 py-2 rounded-xl text-xs font-bold shrink-0 shadow-xs"
					>
						প্রয়োগ
					</Button>
				</div>
			</div>

			<!-- 4. Brands -->
			{#if brands.length > 0}
				<div>
					<h4 class="text-xs font-bold text-slate-900 mb-2">ব্র্যান্ড</h4>
					<div class="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
						{#each brands as b}
							{@const checked = selectedBrands.includes(b)}
							<button
								type="button"
								onclick={() => toggleBrand(b)}
								class="p-2 rounded-xl text-left text-xs font-medium border flex items-center justify-between transition-colors cursor-pointer {checked
									? 'border-[#2563eb] bg-blue-50/70 text-[#2563eb] font-bold'
									: 'border-slate-200 text-slate-700 hover:bg-slate-50'}"
							>
								<span class="truncate">{b}</span>
								{#if checked}
									<Check class="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- 5. Rating -->
			<div>
				<h4 class="text-xs font-bold text-slate-900 mb-2">কাস্টমার রেটিং</h4>
				<div class="grid grid-cols-3 gap-2">
					{#each [5, 4, 3] as ratingVal}
						{@const isSelected = selectedRating === ratingVal}
						<button
							type="button"
							onclick={() => onUpdate('selectedRating', isSelected ? null : ratingVal)}
							class="py-2 px-2 rounded-xl text-center text-xs font-bold border transition-colors flex flex-col items-center gap-1 cursor-pointer {isSelected
								? 'border-amber-500 bg-amber-50 text-amber-900'
								: 'border-slate-200 text-slate-700 hover:bg-slate-50'}"
						>
							<div class="flex items-center text-amber-400">
								{#each Array(5) as _, i}
									<Star class="w-2.5 h-2.5 {i < ratingVal ? 'fill-amber-400' : 'text-slate-200'}" />
								{/each}
							</div>
							<span class="text-[10px]">{ratingVal}★ ও তদূর্ধ্ব</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- 6. Delivery & Stock Options using shadcn Checkbox -->
			<div class="space-y-2.5 pt-1">
				<label class="flex items-center justify-between text-xs text-slate-700 p-2.5 rounded-xl bg-slate-50 cursor-pointer">
					<span class="font-bold">শুধুমাত্র ইন-স্টক পণ্য</span>
					<Checkbox
						checked={inStockOnly}
						onCheckedChange={(val) => onUpdate('inStockOnly', val)}
						class={inStockOnly ? 'bg-[#2563eb] border-[#2563eb]' : ''}
					/>
				</label>
				<label class="flex items-center justify-between text-xs text-slate-700 p-2.5 rounded-xl bg-slate-50 cursor-pointer">
					<span class="font-bold text-[#2563eb] flex items-center gap-1">
						<Zap class="w-3.5 h-3.5 fill-[#2563eb]" />
						<span>১২-২৪ ঘণ্টায় ডেলিভারি</span>
					</span>
					<Checkbox
						checked={expressOnly}
						onCheckedChange={(val) => onUpdate('expressOnly', val)}
						class={expressOnly ? 'bg-[#2563eb] border-[#2563eb]' : ''}
					/>
				</label>
				<label class="flex items-center justify-between text-xs text-slate-700 p-2.5 rounded-xl bg-slate-50 cursor-pointer">
					<span class="font-bold">ডিসকাউন্ট বা অফার পণ্য</span>
					<Checkbox
						checked={onSaleOnly}
						onCheckedChange={(val) => onUpdate('onSaleOnly', val)}
						class={onSaleOnly ? 'bg-[#2563eb] border-[#2563eb]' : ''}
					/>
				</label>
			</div>
		</div>

		<!-- Bottom Fixed Action Bar with shadcn Button -->
		<div class="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
			<Button
				type="button"
				variant="secondary"
				onclick={onResetAll}
				class="w-1/3 h-auto py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all text-center"
			>
				সব মুছুন
			</Button>
			<Button
				type="button"
				variant="blue"
				onclick={onClose}
				class="flex-1 h-auto py-3 rounded-2xl text-white text-xs font-bold transition-all text-center shadow-lg shadow-blue-500/25"
			>
				{resultCount}টি পণ্য দেখুন
			</Button>
		</div>
	</div>
{/if}
