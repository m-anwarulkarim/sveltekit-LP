<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<div class={cn('px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider', className)}>
	{#if children}
		{@render children()}
	{/if}
</div>
