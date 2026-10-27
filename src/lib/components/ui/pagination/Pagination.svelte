<script lang="ts">
	import { cn } from '#lib/utils';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface Props {
		page?: number;
		totalPages?: number;
		class?: string;
		onPageChange?: (page: number) => void;
	}

	let {
		page = $bindable(1),
		totalPages = 1,
		class: className,
		onPageChange
	}: Props = $props();

	function goToPage(p: number) {
		if (p < 1 || p > totalPages || p === page) return;
		page = p;
		onPageChange?.(p);
	}

	const pages = $derived(
		Array.from({ length: totalPages }, (_, i) => i + 1).filter(
			(p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
		)
	);
</script>

<nav
	aria-label="pagination"
	class={cn('mx-auto flex w-full justify-center gap-1 items-center', className)}
>
	<button
		type="button"
		aria-label="Go to previous page"
		disabled={page <= 1}
		onclick={() => goToPage(page - 1)}
		class="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
	>
		<ChevronLeft class="h-4 w-4" />
		<span>Previous</span>
	</button>

	{#each pages as p, i}
		{#if i > 0 && p - pages[i - 1] > 1}
			<span class="flex h-9 w-9 items-center justify-center text-slate-400">...</span>
		{/if}
		<button
			type="button"
			aria-current={p === page ? 'page' : undefined}
			onclick={() => goToPage(p)}
			class={cn(
				'inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer',
				p === page
					? 'bg-[#5845eb] text-white shadow-xs font-semibold'
					: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
			)}
		>
			{p}
		</button>
	{/each}

	<button
		type="button"
		aria-label="Go to next page"
		disabled={page >= totalPages}
		onclick={() => goToPage(page + 1)}
		class="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
	>
		<span>Next</span>
		<ChevronRight class="h-4 w-4" />
	</button>
</nav>
