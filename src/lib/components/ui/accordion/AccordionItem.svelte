<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '#lib/utils';
	import { ChevronDown } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface AccordionContext {
		isExpanded: (id: string) => boolean;
		toggleItem: (id: string) => void;
	}

	interface Props {
		value: string;
		title: string;
		class?: string;
		children?: Snippet;
	}

	let { value, title, class: className, children }: Props = $props();

	const accordion = getContext<AccordionContext>('ACCORDION_CONTEXT');
	const isOpen = $derived(accordion ? accordion.isExpanded(value) : false);
</script>

<div class={cn('py-1', className)}>
	<button
		type="button"
		aria-expanded={isOpen}
		onclick={() => accordion?.toggleItem(value)}
		class="flex w-full items-center justify-between py-3.5 text-left text-sm font-semibold text-slate-800 hover:text-[#5845eb] transition-colors cursor-pointer"
	>
		<span>{title}</span>
		<ChevronDown
			class={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180 text-[#5845eb]')}
		/>
	</button>

	{#if isOpen}
		<div class="pb-3 text-sm text-slate-600 leading-relaxed animate-in fade-in-50 duration-200">
			{#if children}
				{@render children()}
			{/if}
		</div>
	{/if}
</div>
