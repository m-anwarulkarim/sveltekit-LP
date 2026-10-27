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
		'flex h-full w-full items-center justify-center rounded-full bg-slate-100 font-medium uppercase text-slate-600',
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</div>
