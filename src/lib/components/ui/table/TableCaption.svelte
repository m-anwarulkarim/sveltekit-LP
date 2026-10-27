<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableCaptionElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<caption class={cn('mt-4 text-xs text-slate-500 italic', className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</caption>
