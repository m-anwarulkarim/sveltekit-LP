<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface TooltipContext {
		isVisible: () => boolean;
	}

	interface Props {
		side?: 'top' | 'bottom' | 'left' | 'right';
		class?: string;
		children?: Snippet;
	}

	let { side = 'top', class: className, children }: Props = $props();

	const tooltip = getContext<TooltipContext>('TOOLTIP_CONTEXT');

	const sideClasses = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2'
	};
</script>

{#if tooltip && tooltip.isVisible()}
	<div
		role="tooltip"
		class={cn(
			'absolute z-50 overflow-hidden rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-md animate-in fade-in-50 zoom-in-95 pointer-events-none whitespace-nowrap',
			sideClasses[side],
			className
		)}
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
