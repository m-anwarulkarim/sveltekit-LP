<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<h5 class={cn('mb-1 font-semibold leading-none tracking-tight text-slate-900', className)}>
	{#if children}
		{@render children()}
	{/if}
</h5>
