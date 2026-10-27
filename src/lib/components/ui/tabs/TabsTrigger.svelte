<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface TabsContext {
		getActive: () => string;
		setActive: (val: string) => void;
	}

	interface Props {
		value: string;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { value, disabled = false, class: className, children }: Props = $props();

	const tabs = getContext<TabsContext>('TABS_CONTEXT');
	const isActive = $derived(tabs ? tabs.getActive() === value : false);

	function handleClick() {
		if (!disabled && tabs) {
			tabs.setActive(value);
		}
	}
</script>

<button
	type="button"
	role="tab"
	aria-selected={isActive}
	{disabled}
	onclick={handleClick}
	class={cn(
		'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
		isActive
			? 'bg-white text-slate-900 shadow-sm font-semibold'
			: 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</button>
