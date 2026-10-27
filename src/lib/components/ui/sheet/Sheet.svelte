<script lang="ts">
	import { setContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		children?: Snippet;
	}

	let { open = $bindable(false), onOpenChange, children }: Props = $props();

	function toggle() {
		open = !open;
		onOpenChange?.(open);
	}

	function close() {
		open = false;
		onOpenChange?.(false);
	}

	setContext('SHEET_CONTEXT', {
		isOpen: () => open,
		toggle,
		close
	});
</script>

{#if children}
	{@render children()}
{/if}
