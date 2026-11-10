<script lang="ts">
	import { Search, Calendar, Filter, X, ChevronDown, Check } from 'lucide-svelte';
	import { Input, Button } from '#lib/components/ui';

	interface Props {
		selectedDateRange: string;
		selectedProvider: string;
		selectedStatus: string;
		searchQuery: string;
		totalCount: number;
		onDateChange: (range: string) => void;
		onProviderChange: (provider: string) => void;
		onStatusChange: (status: string) => void;
		onSearchChange: (q: string) => void;
		onResetFilters: () => void;
	}

	let {
		selectedDateRange = $bindable('all'),
		selectedProvider = $bindable('all'),
		selectedStatus = $bindable('all'),
		searchQuery = $bindable(''),
		totalCount = 0,
		onDateChange,
		onProviderChange,
		onStatusChange,
		onSearchChange,
		onResetFilters
	}: Props = $props();

	const DATE_RANGES = [
		{ id: 'all', label: 'সব সময়' },
		{ id: 'today', label: 'আজ (Today)' },
		{ id: 'yesterday', label: 'গতকাল' },
		{ id: '7days', label: 'গত ৭ দিন' },
		{ id: '30days', label: 'গত ৩০ দিন' },
		{ id: 'this_month', label: 'চলতি মাস' }
	];

	const PROVIDERS = [
		{ id: 'all', label: 'সকল কুরিয়ার (All Providers)' },
		{ id: 'steadfast', label: 'Steadfast Courier' },
		{ id: 'pathao', label: 'Pathao Courier' },
		{ id: 'redx', label: 'REDX' },
		{ id: 'paperfly', label: 'Paperfly' },
		{ id: 'carrybee', label: 'CarryBee' }
	];

	const STATUS_TABS = [
		{ id: 'all', label: 'সকল পার্সেল' },
		{ id: 'in_transit', label: 'ইন-ট্রানজিট (পথে)' },
		{ id: 'delivered', label: 'ডেলিভারি সম্পন্ন' },
		{ id: 'returned', label: 'রিটার্ন / বাতিল' },
		{ id: 'hold', label: 'হোল্ড / সমস্যা' }
	];

	let hasActiveFilters = $derived(
		selectedDateRange !== 'all' || selectedProvider !== 'all' || selectedStatus !== 'all' || searchQuery.trim().length > 0
	);
</script>

<div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3 font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Row 1: Status Tabs + Active Filter Reset -->
	<div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
		<!-- Status Filter Pills -->
		<div class="flex flex-wrap items-center gap-1.5">
			{#each STATUS_TABS as tab}
				<button
					type="button"
					onclick={() => onStatusChange(tab.id)}
					class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer {selectedStatus === tab.id
						? 'bg-[#5845eb] text-white shadow-xs'
						: 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700'}"
				>
					{tab.label}
				</button>
			{/each}
		</div>

		<!-- Match count and clear button -->
		<div class="flex items-center gap-2">
			<span class="text-xs font-semibold text-slate-500">
				মোট <strong class="text-slate-800">{totalCount}</strong> টি পার্সেল
			</span>
			{#if hasActiveFilters}
				<button
					type="button"
					onclick={onResetFilters}
					class="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
				>
					<X class="w-3 h-3" />
					<span>ফিল্টার মুছুন</span>
				</button>
			{/if}
		</div>
	</div>

	<!-- Row 2: Search, Date Range, & Provider Selector -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
		<!-- Search Input -->
		<div class="lg:col-span-6 relative">
			<Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
			<Input
				type="text"
				placeholder="অর্ডার নং, ট্র্যাকিং কোড, কনসাইনমেন্ট আইডি বা কাস্টমার ফোন..."
				bind:value={searchQuery}
				oninput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
				class="pl-10 text-xs rounded-xl h-10 border-slate-200 bg-slate-50/50 focus:bg-white"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => { searchQuery = ''; onSearchChange(''); }}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
				>
					<X class="w-3.5 h-3.5" />
				</button>
			{/if}
		</div>

		<!-- Date Range Selector -->
		<div class="lg:col-span-3 relative">
			<div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
				<Calendar class="w-3.5 h-3.5" />
			</div>
			<select
				value={selectedDateRange}
				onchange={(e) => onDateChange((e.target as HTMLSelectElement).value)}
				class="w-full pl-9 pr-8 h-10 rounded-xl bg-slate-50/50 hover:bg-slate-100/70 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5845eb]/20 cursor-pointer appearance-none transition-all"
			>
				{#each DATE_RANGES as dr}
					<option value={dr.id}>{dr.label}</option>
				{/each}
			</select>
			<div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
				<ChevronDown class="w-3.5 h-3.5" />
			</div>
		</div>

		<!-- Provider Selector -->
		<div class="lg:col-span-3 relative">
			<div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
				<Filter class="w-3.5 h-3.5" />
			</div>
			<select
				value={selectedProvider}
				onchange={(e) => onProviderChange((e.target as HTMLSelectElement).value)}
				class="w-full pl-9 pr-8 h-10 rounded-xl bg-slate-50/50 hover:bg-slate-100/70 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5845eb]/20 cursor-pointer appearance-none transition-all"
			>
				{#each PROVIDERS as pr}
					<option value={pr.id}>{pr.label}</option>
				{/each}
			</select>
			<div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
				<ChevronDown class="w-3.5 h-3.5" />
			</div>
		</div>
	</div>
</div>
