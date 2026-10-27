<script lang="ts">
	import { setContext } from 'svelte';
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		defaultValue?: string;
		open?: boolean;
		disabled?: boolean;
		onValueChange?: (val: string) => void;
		class?: string;
		children?: Snippet;
	}

	let {
		value = $bindable(),
		defaultValue = '',
		open = $bindable(false),
		disabled = false,
		onValueChange,
		class: className,
		children
	}: Props = $props();

	let internalValue = $state('');
	let selectedLabel = $state('');

	$effect(() => {
		if (value !== undefined) {
			internalValue = value;
		} else if (!internalValue && defaultValue) {
			internalValue = defaultValue;
		}
	});

	function selectItem(val: string, label: string) {
		internalValue = val;
		value = val;
		selectedLabel = label;
		open = false;
		onValueChange?.(val);
	}

	function toggleOpen() {
		if (!disabled) {
			open = !open;
		}
	}

	setContext('SELECT_CONTEXT', {
		getValue: () => internalValue,
		getLabel: () => selectedLabel,
		isOpen: () => open,
		isDisabled: () => disabled,
		toggleOpen,
		close: () => (open = false),
		selectItem,
		registerLabel: (val: string, label: string) => {
			if (val === internalValue && !selectedLabel) {
				selectedLabel = label;
			}
		}
	});
</script>

<div class={cn('relative inline-block w-full', className)}>
	{#if children}
		{@render children()}
	{/if}
</div>
