<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		rootMargin?: string;
		children: import('svelte').Snippet;
		placeholder?: import('svelte').Snippet;
	}

	let { rootMargin = '200px', children, placeholder }: Props = $props();

	let visible = $state(false);
	let sentinel: HTMLDivElement | undefined = $state();

	onMount(() => {
		if (!sentinel) return;
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					visible = true;
					io.disconnect();
				}
			},
			{ rootMargin }
		);
		io.observe(sentinel);
		return () => io.disconnect();
	});
</script>

{#if visible}
	{@render children()}
{:else}
	<div bind:this={sentinel} class="min-h-[280px]">
		{#if placeholder}
			{@render placeholder()}
		{:else}
			<div class="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3.5">
				<div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-3 sm:p-6 animate-pulse">
					<div class="h-6 w-48 bg-slate-200 rounded mb-4"></div>
					<div class="flex gap-2.5 sm:gap-4 overflow-hidden">
						{#each Array(6) as _}
							<div class="w-[calc((100%-10px)/2)] sm:w-48 md:w-52 shrink-0">
								<div class="aspect-square bg-slate-100 rounded-lg mb-2"></div>
								<div class="h-3 bg-slate-100 rounded w-3/4 mb-1"></div>
								<div class="h-3 bg-slate-100 rounded w-1/2"></div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
