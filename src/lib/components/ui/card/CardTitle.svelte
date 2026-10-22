<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		children?: Snippet;
		class?: string;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<h3
	class={cn('text-lg font-bold leading-none tracking-tight text-slate-900', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</h3>
