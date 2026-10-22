<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		children?: Snippet;
		class?: string;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<p class={cn('text-xs text-slate-500 font-medium', className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</p>
