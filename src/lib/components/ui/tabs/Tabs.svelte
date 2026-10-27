<script lang="ts">
	import { setContext } from 'svelte';
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		defaultValue?: string;
		onValueChange?: (value: string) => void;
		class?: string;
		children?: Snippet;
	}

	let {
		value = $bindable(),
		defaultValue = '',
		onValueChange,
		class: className,
		children
	}: Props = $props();

	let activeTab = $state('');

	$effect(() => {
		if (value !== undefined) {
			activeTab = value;
		} else if (!activeTab && defaultValue) {
			activeTab = defaultValue;
		}
	});

	function setActive(newValue: string) {
		activeTab = newValue;
		value = newValue;
		onValueChange?.(newValue);
	}

	setContext('TABS_CONTEXT', {
		getActive: () => activeTab,
		setActive
	});
</script>

<div class={cn('w-full', className)}>
	{#if children}
		{@render children()}
	{/if}
</div>
