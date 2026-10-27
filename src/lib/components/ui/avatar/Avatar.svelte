<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		size?: 'sm' | 'default' | 'lg' | 'xl';
		class?: string;
		children?: Snippet;
	}

	let { size = 'default', class: className, children }: Props = $props();

	const sizeClasses = {
		sm: 'h-8 w-8 text-xs',
		default: 'h-10 w-10 text-sm',
		lg: 'h-12 w-12 text-base',
		xl: 'h-16 w-16 text-xl'
	};
</script>

<div
	class={cn(
		'relative flex shrink-0 overflow-hidden rounded-full font-medium select-none items-center justify-center bg-slate-100 text-slate-700',
		sizeClasses[size],
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</div>
