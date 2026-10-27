<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface TooltipContext {
		show: () => void;
		hide: () => void;
	}

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
	const tooltip = getContext<TooltipContext>('TOOLTIP_CONTEXT');
</script>

<div
	role="button"
	tabindex="0"
	class="inline-flex cursor-pointer"
	onmouseenter={() => tooltip?.show()}
	onmouseleave={() => tooltip?.hide()}
	onfocus={() => tooltip?.show()}
	onblur={() => tooltip?.hide()}
>
	{#if children}
		{@render children()}
	{/if}
</div>
