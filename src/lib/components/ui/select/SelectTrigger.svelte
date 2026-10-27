<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';
	import { ChevronDown } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface SelectContext {
		getValue: () => string;
		isOpen: () => boolean;
		isDisabled: () => boolean;
		toggleOpen: () => void;
	}

	interface Props {
		class?: string;
		placeholder?: string;
		children?: Snippet;
	}

	let { class: className, placeholder = 'Select an option...', children }: Props = $props();

	const select = getContext<SelectContext>('SELECT_CONTEXT');
</script>

<button
	type="button"
	aria-expanded={select ? select.isOpen() : false}
	aria-haspopup="listbox"
	disabled={select ? select.isDisabled() : false}
	onclick={() => select?.toggleOpen()}
	class={cn(
		'flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5845eb] focus:border-[#5845eb] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
		className
	)}
>
	<span class="truncate">
		{#if children}
			{@render children()}
		{:else}
			<span class="text-slate-400">{placeholder}</span>
		{/if}
	</span>
	<ChevronDown class="h-4 w-4 text-slate-500 opacity-60 shrink-0 ml-2" />
</button>
