<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableRowElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<tr
	class={cn(
		'border-b border-slate-100 transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-slate-100',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</tr>
