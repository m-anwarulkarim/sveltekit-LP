<script lang="ts">
	import { setContext } from 'svelte';
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		defaultValue?: string;
		disabled?: boolean;
		name?: string;
		class?: string;
		onValueChange?: (val: string) => void;
		children?: Snippet;
	}

	let {
		value = $bindable(),
		defaultValue = '',
		disabled = false,
		name,
		class: className,
		onValueChange,
		children
	}: Props = $props();

	let internalValue = $state('');

	$effect(() => {
		if (value !== undefined) {
			internalValue = value;
		} else if (!internalValue && defaultValue) {
			internalValue = defaultValue;
		}
	});

	function select(val: string) {
		internalValue = val;
		value = val;
		onValueChange?.(val);
	}

	setContext('RADIO_GROUP_CONTEXT', {
		getValue: () => internalValue,
		select,
		getName: () => name,
		isDisabled: () => disabled
	});
</script>

<div role="radiogroup" class={cn('grid gap-2.5', className)}>
	{#if children}
		{@render children()}
	{/if}
</div>
