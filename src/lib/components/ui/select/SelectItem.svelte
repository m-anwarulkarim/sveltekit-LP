<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';
	import { Check } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface SelectContext {
		getValue: () => string;
		selectItem: (val: string, label: string) => void;
		registerLabel: (val: string, label: string) => void;
	}

	interface Props {
		value: string;
		label?: string;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { value, label, disabled = false, class: className, children }: Props = $props();

	const select = getContext<SelectContext>('SELECT_CONTEXT');
	const isSelected = $derived(select ? select.getValue() === value : false);

	const itemLabel = $derived(label || value);

	$effect(() => {
		if (select && itemLabel) {
			select.registerLabel(value, itemLabel);
		}
	});

	function handleClick() {
		if (!disabled && select) {
			select.selectItem(value, itemLabel);
		}
	}
</script>

<button
	type="button"
	role="option"
	aria-selected={isSelected}
	{disabled}
	onclick={handleClick}
	class={cn(
		'relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-3 pr-8 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 text-left',
		isSelected ? 'bg-indigo-50/70 text-indigo-900 font-medium' : 'text-slate-800',
		className
	)}
>
	<span class="truncate block">
		{#if children}
			{@render children()}
		{:else}
			{itemLabel}
		{/if}
	</span>

	{#if isSelected}
		<span class="absolute right-2.5 flex h-4 w-4 items-center justify-center text-[#5845eb]">
			<Check class="h-4 w-4 stroke-[2.5]" />
		</span>
	{/if}
</button>
