<script lang="ts">
	import {
		Search,
		Plus,
		ChevronDown,
		LayoutGrid,
		SlidersHorizontal,
		Columns3,
		Download,
		Check,
		Trash2,
		Eye,
		Copy,
		Sparkles
	} from 'lucide-svelte';

	interface Props {
		searchQuery: string;
		activeTab: 'all' | 'publish' | 'draft' | 'low_stock';
		counts: {
			all: number;
			publish: number;
			draft: number;
			lowStock: number;
		};
		perPage: number;
		columns: {
			sl: boolean;
			image: boolean;
			name: boolean;
			category: boolean;
			stock: boolean;
			openingStock: boolean;
			tags: boolean;
			actions: boolean;
		};
		selectedCount: number;
		onAddProduct: () => void;
		onBulkAction: (action: string) => void;
	}

	let {
		searchQuery = $bindable(''),
		activeTab = $bindable('all'),
		counts,
		perPage = $bindable(10),
		columns = $bindable(),
		selectedCount = 0,
		onAddProduct,
		onBulkAction
	}: Props = $props();

	let isActionsOpen = $state(false);
	let isPerPageOpen = $state(false);
	let isColumnsOpen = $state(false);

	let actionsRef = $state<HTMLDivElement | null>(null);
	let perPageRef = $state<HTMLDivElement | null>(null);
	let columnsRef = $state<HTMLDivElement | null>(null);

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Node;
		if (actionsRef && !actionsRef.contains(target)) isActionsOpen = false;
		if (perPageRef && !perPageRef.contains(target)) isPerPageOpen = false;
		if (columnsRef && !columnsRef.contains(target)) isColumnsOpen = false;
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="space-y-4">
	<!-- Top Controls Row (Search Left, Action Buttons Right) -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
		<!-- Search Input (Matches Reference with icon on right) -->
		<div class="relative w-full sm:w-80">
			<input
				type="text"
				placeholder="Search products..."
				bind:value={searchQuery}
				class="w-full bg-white border border-slate-200/90 rounded-2xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] focus:ring-2 focus:ring-[#5845eb]/15 transition-all shadow-2xs"
			/>
			<div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
				<Search class="w-4 h-4" />
			</div>
		</div>

		<!-- Action Controls (Actions, Per Page, + Add Product, Columns) -->
		<div class="flex items-center flex-wrap sm:flex-nowrap gap-2 sm:gap-2.5">
			<!-- 1. Actions Dropdown -->
			<div bind:this={actionsRef} class="relative">
				<button
					type="button"
					onclick={() => (isActionsOpen = !isActionsOpen)}
					class="rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
					title="বাল্ক অ্যাকশনসমূহ"
				>
					<LayoutGrid class="w-3.5 h-3.5 text-slate-500" />
					<ChevronDown class="w-3 h-3 text-slate-400 transition-transform {isActionsOpen ? 'rotate-180' : ''}" />
					<span class="ml-0.5">Actions</span>
				</button>

				{#if isActionsOpen}
					<div class="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 z-50 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
						{#if selectedCount > 0}
							<div class="px-3 py-1.5 text-[11px] font-bold text-[#5845eb] bg-indigo-50/70 border-b border-indigo-100/60 mb-1">
								{selectedCount} টি প্রোডাক্ট সিলেক্টেড
							</div>
						{/if}
						<button
							type="button"
							onclick={() => {
								onBulkAction('select_all');
								isActionsOpen = false;
							}}
							class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
						>
							<Check class="w-3.5 h-3.5 text-slate-400" />
							<span>Select All</span>
						</button>
						<button
							type="button"
							onclick={() => {
								onBulkAction('publish');
								isActionsOpen = false;
							}}
							class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-emerald-700 flex items-center gap-2 cursor-pointer"
						>
							<Sparkles class="w-3.5 h-3.5 text-emerald-600" />
							<span>Publish Selected</span>
						</button>
						<button
							type="button"
							onclick={() => {
								onBulkAction('draft');
								isActionsOpen = false;
							}}
							class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
						>
							<SlidersHorizontal class="w-3.5 h-3.5 text-slate-400" />
							<span>Move to Draft</span>
						</button>
						<button
							type="button"
							onclick={() => {
								onBulkAction('export');
								isActionsOpen = false;
							}}
							class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
						>
							<Download class="w-3.5 h-3.5 text-slate-400" />
							<span>Export CSV</span>
						</button>
						<div class="h-px bg-slate-100 my-1"></div>
						<button
							type="button"
							onclick={() => {
								onBulkAction('delete');
								isActionsOpen = false;
							}}
							class="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
						>
							<Trash2 class="w-3.5 h-3.5 text-rose-500" />
							<span>Delete Selected</span>
						</button>
					</div>
				{/if}
			</div>

			<!-- 2. Per Page Dropdown -->
			<div bind:this={perPageRef} class="relative">
				<button
					type="button"
					onclick={() => (isPerPageOpen = !isPerPageOpen)}
					class="rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
				>
					<ChevronDown class="w-3 h-3 text-slate-400 transition-transform {isPerPageOpen ? 'rotate-180' : ''}" />
					<span>Per Page: {perPage}</span>
				</button>

				{#if isPerPageOpen}
					<div class="absolute right-0 top-full mt-1.5 w-32 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 z-50 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
						{#each [10, 20, 50, 100] as count}
							<button
								type="button"
								onclick={() => {
									perPage = count;
									isPerPageOpen = false;
								}}
								class="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer {perPage === count ? 'text-[#5845eb] font-bold bg-indigo-50/50' : 'text-slate-700'}"
							>
								<span>{count}</span>
								{#if perPage === count}
									<Check class="w-3.5 h-3.5 text-[#5845eb]" />
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- 3. + Add Product Button (Exact Purple Style from Screenshot) -->
			<button
				type="button"
				onclick={onAddProduct}
				class="rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 shrink-0"
			>
				<Plus class="w-4 h-4 stroke-[2.5]" />
				<span>Add Product</span>
			</button>

			<!-- 4. Columns Dropdown Toggle -->
			<div bind:this={columnsRef} class="relative">
				<button
					type="button"
					onclick={() => (isColumnsOpen = !isColumnsOpen)}
					class="rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
					title="কলাম দৃশ্যমানতা কনফিগার করুন"
				>
					<Columns3 class="w-3.5 h-3.5 text-slate-500" />
					<ChevronDown class="w-3 h-3 text-slate-400 transition-transform {isColumnsOpen ? 'rotate-180' : ''}" />
					<span class="ml-0.5">Columns</span>
				</button>

				{#if isColumnsOpen}
					<div class="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2 z-50 text-xs font-medium animate-in fade-in zoom-in-95 duration-100 space-y-1">
						<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
							<input type="checkbox" bind:checked={columns.sl} class="rounded text-[#5845eb] focus:ring-[#5845eb]" />
							<span>SL</span>
						</label>
						<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
							<input type="checkbox" bind:checked={columns.image} class="rounded text-[#5845eb] focus:ring-[#5845eb]" />
							<span>Image</span>
						</label>
						<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
							<input type="checkbox" bind:checked={columns.name} class="rounded text-[#5845eb] focus:ring-[#5845eb]" />
							<span>Name</span>
						</label>
						<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
							<input type="checkbox" bind:checked={columns.category} class="rounded text-[#5845eb] focus:ring-[#5845eb]" />
							<span>Category</span>
						</label>
						<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
							<input type="checkbox" bind:checked={columns.stock} class="rounded text-[#5845eb] focus:ring-[#5845eb]" />
							<span>Stock</span>
						</label>
						<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
							<input type="checkbox" bind:checked={columns.openingStock} class="rounded text-[#5845eb] focus:ring-[#5845eb]" />
							<span>Opening Stock</span>
						</label>
						<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
							<input type="checkbox" bind:checked={columns.tags} class="rounded text-[#5845eb] focus:ring-[#5845eb]" />
							<span>Tags</span>
						</label>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Bottom Row: Filter Tabs Capsule Bar (Matches Reference Design) -->
	<div class="flex items-center">
		<div class="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 shadow-2xs gap-1">
			<!-- 1. All -->
			<button
				type="button"
				onclick={() => (activeTab = 'all')}
				class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'all'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>All</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'all' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					{counts.all}
				</span>
			</button>

			<!-- 2. Publish -->
			<button
				type="button"
				onclick={() => (activeTab = 'publish')}
				class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'publish'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Publish</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'publish' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					{counts.publish}
				</span>
			</button>

			<!-- 3. Draft -->
			<button
				type="button"
				onclick={() => (activeTab = 'draft')}
				class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'draft'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Draft</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'draft' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					{counts.draft}
				</span>
			</button>

			<!-- 4. Low Stock -->
			<button
				type="button"
				onclick={() => (activeTab = 'low_stock')}
				class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'low_stock'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Low Stock</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'low_stock' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					{counts.lowStock}
				</span>
			</button>
		</div>
	</div>
</div>
