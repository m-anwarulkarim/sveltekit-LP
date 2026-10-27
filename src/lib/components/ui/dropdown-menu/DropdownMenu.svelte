<script lang="ts">
	import { setContext } from 'svelte';
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		class?: string;
		children?: Snippet;
	}

	let { open = $bindable(false), onOpenChange, class: className, children }: Props = $props();

	function toggleOpen() {
		open = !open;
		onOpenChange?.(open);
	}

	function close() {
		open = false;
		onOpenChange?.(false);
	}

	setContext('DROPDOWN_CONTEXT', {
		isOpen: () => open,
		toggleOpen,
		close
	});
</script>

<div class={cn('relative inline-block text-left', className)}>
	{#if children}
		{@render children()}
	{/if}
</div>
