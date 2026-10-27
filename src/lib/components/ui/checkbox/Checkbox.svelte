<script lang="ts">
	import { cn } from '#lib/utils';
	import { Check } from 'lucide-svelte';

	interface Props {
		checked?: boolean;
		disabled?: boolean;
		id?: string;
		name?: string;
		value?: string;
		class?: string;
		onCheckedChange?: (checked: boolean) => void;
	}

	let {
		checked = $bindable(false),
		disabled = false,
		id,
		name,
		value,
		class: className,
		onCheckedChange
	}: Props = $props();

	function toggle() {
		if (disabled) return;
		checked = !checked;
		onCheckedChange?.(checked);
	}
</script>

<button
	type="button"
	role="checkbox"
	aria-checked={checked}
	{disabled}
	{id}
	onclick={toggle}
	class={cn(
		'peer h-4 w-4 shrink-0 rounded border border-slate-300 bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5845eb] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center',
		checked && 'bg-[#5845eb] border-[#5845eb] text-white',
		className
	)}
>
	{#if checked}
		<Check class="h-3 w-3 stroke-[3]" />
	{/if}

	{#if name}
		<input type="checkbox" {name} {value} {checked} class="sr-only" tabindex="-1" />
	{/if}
</button>
