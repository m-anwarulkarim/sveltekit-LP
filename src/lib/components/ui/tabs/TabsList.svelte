<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<div
	class={cn(
		'inline-flex h-11 items-center justify-center rounded-xl bg-slate-100 p-1 text-slate-500',
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</div>
