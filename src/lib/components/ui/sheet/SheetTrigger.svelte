<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface SheetContext {
		isOpen: () => boolean;
		toggle: () => void;
	}

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children }: Props = $props();

	const sheet = getContext<SheetContext>('SHEET_CONTEXT');
</script>

<div
	role="button"
	tabindex="0"
	aria-expanded={sheet ? sheet.isOpen() : false}
	onclick={() => sheet?.toggle()}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			sheet?.toggle();
		}
	}}
	class={cn('inline-flex items-center cursor-pointer', className)}
>
	{#if children}
		{@render children()}
	{/if}
</div>
