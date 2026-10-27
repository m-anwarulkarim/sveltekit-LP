<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface DropdownContext {
		close: () => void;
	}

	interface Props {
		disabled?: boolean;
		destructive?: boolean;
		class?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		disabled = false,
		destructive = false,
		class: className,
		onclick,
		children
	}: Props = $props();

	const menu = getContext<DropdownContext>('DROPDOWN_CONTEXT');

	function handleClick(e: MouseEvent) {
		if (disabled) return;
		onclick?.(e);
		menu?.close();
	}
</script>

<button
	type="button"
	role="menuitem"
	{disabled}
	onclick={handleClick}
	class={cn(
		'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 text-left',
		destructive ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700' : 'text-slate-700 hover:text-slate-900',
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</button>
