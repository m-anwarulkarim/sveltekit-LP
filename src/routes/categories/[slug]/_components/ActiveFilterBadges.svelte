<script lang="ts">
	import { X, RotateCcw } from 'lucide-svelte';

	interface ActiveFilterItem {
		type: 'subCategory' | 'brand' | 'price' | 'rating' | 'inStock' | 'express' | 'search';
		label: string;
		value: string;
	}

	let {
		activeFilters = [],
		onRemove,
		onClearAll
	}: {
		activeFilters: ActiveFilterItem[];
		onRemove: (item: ActiveFilterItem) => void;
		onClearAll: () => void;
	} = $props();
</script>

{#if activeFilters.length > 0}
	<div class="flex items-center flex-wrap gap-2 py-2 mb-3">
		<span class="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
			ফিল্টার:
		</span>

		{#each activeFilters as item (item.type + item.value)}
			<span
				class="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-blue-50/80 border border-blue-200/90 text-blue-800 text-xs font-semibold shadow-2xs group transition-all"
			>
				<span>{item.label}</span>
				<button
					type="button"
					onclick={() => onRemove(item)}
					class="p-0.5 rounded-full hover:bg-blue-200/70 text-blue-600 transition-colors cursor-pointer"
					title="মুছুন"
				>
					<X class="w-3 h-3" />
				</button>
			</span>
		{/each}

		<button
			type="button"
			onclick={onClearAll}
			class="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline ml-1 cursor-pointer transition-colors"
		>
			<RotateCcw class="w-3 h-3" />
			<span>সব রিসেট</span>
		</button>
	</div>
{/if}

