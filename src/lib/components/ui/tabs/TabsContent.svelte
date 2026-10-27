<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface TabsContext {
		getActive: () => string;
	}

	interface Props {
		value: string;
		class?: string;
		children?: Snippet;
	}

	let { value, class: className, children }: Props = $props();

	const tabs = getContext<TabsContext>('TABS_CONTEXT');
	const isActive = $derived(tabs ? tabs.getActive() === value : false);
</script>

{#if isActive}
	<div
		role="tabpanel"
		class={cn(
			'mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 animate-in fade-in-50 duration-200',
			className
		)}
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
