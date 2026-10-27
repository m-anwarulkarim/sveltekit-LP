<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';
	import { X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface SheetContext {
		isOpen: () => boolean;
		close: () => void;
	}

	export type SheetSide = 'top' | 'bottom' | 'left' | 'right';

	interface Props {
		side?: SheetSide;
		class?: string;
		children?: Snippet;
	}

	let { side = 'right', class: className, children }: Props = $props();

	const sheet = getContext<SheetContext>('SHEET_CONTEXT');

	const sideClasses: Record<SheetSide, string> = {
		top: 'inset-x-0 top-0 border-b max-h-[85vh] animate-in slide-in-from-top duration-300',
		bottom: 'inset-x-0 bottom-0 border-t max-h-[85vh] animate-in slide-in-from-bottom duration-300',
		left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-md animate-in slide-in-from-left duration-300',
		right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-md animate-in slide-in-from-right duration-300'
	};
</script>

{#if sheet && sheet.isOpen()}
	<!-- Backdrop -->
	<button
		type="button"
		class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-300 cursor-default"
		onclick={() => sheet.close()}
		tabindex="-1"
		aria-label="Close backdrop"
	></button>

	<!-- Drawer panel -->
	<div
		role="dialog"
		aria-modal="true"
		class={cn(
			'fixed z-50 flex flex-col bg-white p-6 shadow-2xl transition ease-in-out',
			sideClasses[side],
			className
		)}
	>
		<button
			type="button"
			class="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5845eb] cursor-pointer"
			onclick={() => sheet.close()}
		>
			<X class="h-5 w-5" />
			<span class="sr-only">Close</span>
		</button>

		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
