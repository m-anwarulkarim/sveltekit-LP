<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<h3 class={cn('text-lg font-semibold text-slate-900', className)}>
	{#if children}
		{@render children()}
	{/if}
</h3>
