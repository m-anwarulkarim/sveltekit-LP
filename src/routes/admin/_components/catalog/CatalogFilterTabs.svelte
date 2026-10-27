<script lang="ts">
	interface Props {
		activeTab: 'all' | 'publish' | 'draft' | 'low_stock' | 'trash';
		allCount: number;
		publishCount: number;
		draftCount: number;
		lowStockCount?: number;
		trashCount?: number;
		onTabChange: (tab: 'all' | 'publish' | 'draft' | 'low_stock' | 'trash') => void;
	}

	let {
		activeTab,
		allCount,
		publishCount,
		draftCount,
		lowStockCount = 0,
		trashCount = 0,
		onTabChange
	}: Props = $props();
</script>

<!-- Filter Capsules matching SaleEcom reference -->
<div class="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/60 w-fit overflow-x-auto max-w-full text-xs">
	<!-- 1. All Data -->
	<button
		type="button"
		onclick={() => onTabChange('all')}
		class="px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap {activeTab === 'all'
			? 'bg-[#5845eb] text-white shadow-sm shadow-indigo-600/20'
			: 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}"
	>
		<span>All Data</span>
		<span class="px-1.5 py-0.2 rounded-full text-[11px] font-black {activeTab === 'all' ? 'bg-white text-[#5845eb]' : 'bg-slate-200 text-slate-700'}">
			{allCount}
		</span>
	</button>

	<!-- 2. Publish -->
	<button
		type="button"
		onclick={() => onTabChange('publish')}
		class="px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap {activeTab === 'publish'
			? 'bg-[#5845eb] text-white font-bold shadow-sm shadow-indigo-600/20'
			: 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}"
	>
		<span>Publish</span>
		<span class="px-1.5 py-0.2 rounded-full text-[11px] font-semibold {activeTab === 'publish' ? 'bg-white text-[#5845eb]' : 'bg-slate-200 text-slate-700'}">
			{publishCount}
		</span>
	</button>

	<!-- 3. Draft -->
	<button
		type="button"
		onclick={() => onTabChange('draft')}
		class="px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap {activeTab === 'draft'
			? 'bg-[#5845eb] text-white font-bold shadow-sm shadow-indigo-600/20'
			: 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}"
	>
		<span>Draft</span>
		<span class="px-1.5 py-0.2 rounded-full text-[11px] font-semibold {activeTab === 'draft' ? 'bg-white text-[#5845eb]' : 'bg-slate-200 text-slate-700'}">
			{draftCount}
		</span>
	</button>

	<!-- 4. Low Stock -->
	<button
		type="button"
		onclick={() => onTabChange('low_stock')}
		class="px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap {activeTab === 'low_stock'
			? 'bg-[#5845eb] text-white font-bold shadow-sm shadow-indigo-600/20'
			: 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}"
	>
		<span>Low Stock</span>
		<span class="px-1.5 py-0.2 rounded-full text-[11px] font-semibold {activeTab === 'low_stock' ? 'bg-white text-[#5845eb]' : 'bg-slate-200 text-slate-700'}">
			{lowStockCount}
		</span>
	</button>

	<!-- 5. Trash -->
	<button
		type="button"
		onclick={() => onTabChange('trash')}
		class="px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap {activeTab === 'trash'
			? 'bg-rose-600 text-white font-bold shadow-sm shadow-rose-600/20'
			: 'text-slate-600 hover:text-rose-600 hover:bg-white/60'}"
	>
		<span>Trash</span>
		<span class="px-1.5 py-0.2 rounded-full text-[11px] font-semibold {activeTab === 'trash' ? 'bg-white text-rose-600' : 'bg-slate-200 text-slate-700'}">
			{trashCount}
		</span>
	</button>
</div>
