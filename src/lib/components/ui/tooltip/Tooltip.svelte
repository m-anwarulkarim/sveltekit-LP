<script lang="ts">
	import { setContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
	let isVisible = $state(false);

	setContext('TOOLTIP_CONTEXT', {
		isVisible: () => isVisible,
		show: () => (isVisible = true),
		hide: () => (isVisible = false)
	});
</script>

<div class="relative inline-block">
	{#if children}
		{@render children()}
	{/if}
</div>
