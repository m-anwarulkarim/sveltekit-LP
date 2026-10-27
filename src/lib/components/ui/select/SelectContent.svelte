<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface SelectContext {
		isOpen: () => boolean;
		close: () => void;
	}

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children }: Props = $props();

	const select = getContext<SelectContext>('SELECT_CONTEXT');
</script>

{#if select && select.isOpen()}
	<!-- Backdrop for outside click -->
	<button
		type="button"
		class="fixed inset-0 z-40 cursor-default bg-transparent"
		tabindex="-1"
		aria-hidden="true"
		onclick={() => select.close()}
	></button>

	<div
		class={cn(
			'absolute left-0 top-full z-50 mt-1.5 max-h-64 w-full min-w-[8rem] overflow-auto rounded-xl border border-slate-200 bg-white p-1 text-slate-900 shadow-xl animate-in fade-in-80 zoom-in-95',
			className
		)}
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
