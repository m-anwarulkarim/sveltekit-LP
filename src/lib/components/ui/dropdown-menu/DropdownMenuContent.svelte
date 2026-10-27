<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface DropdownContext {
		isOpen: () => boolean;
		close: () => void;
	}

	interface Props {
		align?: 'left' | 'right' | 'center';
		class?: string;
		children?: Snippet;
	}

	let { align = 'right', class: className, children }: Props = $props();

	const menu = getContext<DropdownContext>('DROPDOWN_CONTEXT');

	const alignClasses = {
		left: 'left-0 origin-top-left',
		right: 'right-0 origin-top-right',
		center: 'left-1/2 -translate-x-1/2 origin-top'
	};
</script>

{#if menu && menu.isOpen()}
	<!-- Backdrop to close dropdown -->
	<button
		type="button"
		class="fixed inset-0 z-40 cursor-default bg-transparent"
		tabindex="-1"
		aria-hidden="true"
		onclick={() => menu.close()}
	></button>

	<div
		role="menu"
		class={cn(
			'absolute z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 text-slate-800 shadow-xl ring-1 ring-black/5 animate-in fade-in-80 zoom-in-95 focus:outline-none',
			alignClasses[align],
			className
		)}
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
