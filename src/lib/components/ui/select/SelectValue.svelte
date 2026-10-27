<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';

	interface SelectContext {
		getValue: () => string;
		getLabel: () => string;
	}

	interface Props {
		placeholder?: string;
		class?: string;
	}

	let { placeholder = 'Select an option', class: className }: Props = $props();

	const select = getContext<SelectContext>('SELECT_CONTEXT');
	const currentLabel = $derived(select?.getLabel() || select?.getValue() || '');
</script>

<span class={cn('truncate', !currentLabel && 'text-slate-400', className)}>
	{currentLabel || placeholder}
</span>
