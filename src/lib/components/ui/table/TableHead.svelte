<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLThAttributes } from 'svelte/elements';

	interface Props extends HTMLThAttributes {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<th
	class={cn(
		'h-10 px-4 text-left align-middle font-semibold text-xs text-slate-500 uppercase tracking-wider [&:has([role=checkbox])]:pr-0',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</th>
