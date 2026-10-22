<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		class?: string;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div
	class={cn(
		'rounded-2xl border border-slate-200#lib/90 bg-white text-slate-900 shadow-xs transition-all',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
