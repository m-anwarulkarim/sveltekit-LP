<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface DropdownContext {
		isOpen: () => boolean;
		toggleOpen: () => void;
	}

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children }: Props = $props();

	const menu = getContext<DropdownContext>('DROPDOWN_CONTEXT');
</script>

<div
	role="button"
	tabindex="0"
	aria-expanded={menu ? menu.isOpen() : false}
	aria-haspopup="true"
	onclick={() => menu?.toggleOpen()}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			menu?.toggleOpen();
		}
	}}
	class={cn('inline-flex items-center cursor-pointer', className)}
>
	{#if children}
		{@render children()}
	{/if}
</div>
