<script lang="ts">
	import { ArrowUpDown, ChevronDown } from 'lucide-svelte';

	let {
		sort = 'featured',
		onChange
	}: {
		sort: string;
		onChange: (newSort: string) => void;
	} = $props();

	const sortOptions = [
		{ value: 'featured', label: 'জনপ্রিয়তা (Featured)' },
		{ value: 'price-asc', label: 'দাম: কম থেকে বেশি (Price: Low to High)' },
		{ value: 'price-desc', label: 'দাম: বেশি থেকে কম (Price: High to Low)' },
		{ value: 'discount', label: 'সর্বোচ্চ ছাড় (% Discount)' },
		{ value: 'rating', label: 'সেরা রেটিং (Top Rated)' },
		{ value: 'newest', label: 'নতুন পণ্য (New Arrivals)' }
	];
</script>

<div class="relative inline-flex items-center">
	<div class="relative flex items-center">
		<span class="absolute left-3 text-slate-400 pointer-events-none">
			<ArrowUpDown class="w-3.5 h-3.5" />
		</span>
		<select
			value={sort}
			onchange={(e) => onChange(e.currentTarget.value)}
			class="appearance-none pl-9 pr-8 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 focus:outline-none focus:border-[#2563eb] shadow-xs cursor-pointer transition-all"
		>
			{#each sortOptions as opt}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
		<span class="absolute right-2.5 text-slate-400 pointer-events-none">
			<ChevronDown class="w-3.5 h-3.5" />
		</span>
	</div>
</div>

