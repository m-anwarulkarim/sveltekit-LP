<script lang="ts">
	import type { SubCategory } from '#lib/modules/products/categories.data';
	import { Sparkles } from 'lucide-svelte';

	let {
		subCategories = [],
		selectedSub = 'all',
		onSelect
	}: {
		subCategories: SubCategory[];
		selectedSub: string;
		onSelect: (sub: string) => void;
	} = $props();
</script>

<div class="w-full overflow-x-auto no-scrollbar py-2">
	<div class="flex items-center gap-2 min-w-max">
		{#each subCategories as sub}
			{@const isActive = selectedSub === sub.slug || (selectedSub === '' && sub.slug === 'all')}
			<button
				type="button"
				onclick={() => onSelect(sub.slug)}
				class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 {isActive
					? 'bg-[#2563eb] text-white shadow-blue-500/20'
					: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'}"
			>
				{#if sub.slug === 'all'}
					<Sparkles class="w-3.5 h-3.5 {isActive ? 'text-amber-300' : 'text-slate-400'}" />
				{/if}
				<span>{sub.name}</span>
			</button>
		{/each}
	</div>
</div>

