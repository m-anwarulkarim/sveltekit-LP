<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';

	interface RadioGroupContext {
		getValue: () => string;
		select: (val: string) => void;
		getName: () => string | undefined;
		isDisabled: () => boolean;
	}

	interface Props {
		value: string;
		id?: string;
		disabled?: boolean;
		class?: string;
	}

	let { value, id, disabled = false, class: className }: Props = $props();

	const group = getContext<RadioGroupContext>('RADIO_GROUP_CONTEXT');
	const isChecked = $derived(group ? group.getValue() === value : false);
	const isItemDisabled = $derived(disabled || (group ? group.isDisabled() : false));

	function handleClick() {
		if (!isItemDisabled && group) {
			group.select(value);
		}
	}
</script>

<button
	type="button"
	role="radio"
	aria-checked={isChecked}
	disabled={isItemDisabled}
	{id}
	onclick={handleClick}
	class={cn(
		'aspect-square h-4 w-4 rounded-full border border-slate-300 text-[#5845eb] shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5845eb] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center transition-all',
		isChecked && 'border-[#5845eb]',
		className
	)}
>
	{#if isChecked}
		<span class="h-2 w-2 rounded-full bg-[#5845eb]"></span>
	{/if}

	{#if group?.getName()}
		<input
			type="radio"
			name={group.getName()}
			{value}
			checked={isChecked}
			class="sr-only"
			tabindex="-1"
		/>
	{/if}
</button>
