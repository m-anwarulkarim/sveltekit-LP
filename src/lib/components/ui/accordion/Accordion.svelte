<script lang="ts">
	import { setContext } from 'svelte';
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'single' | 'multiple';
		value?: string | string[];
		class?: string;
		children?: Snippet;
	}

	let {
		type = 'single',
		value = $bindable(type === 'single' ? '' : []),
		class: className,
		children
	}: Props = $props();

	function toggleItem(id: string) {
		if (type === 'single') {
			value = value === id ? '' : id;
		} else if (Array.isArray(value)) {
			value = value.includes(id) ? value.filter((v) => v !== id) : [...value, id];
		}
	}

	setContext('ACCORDION_CONTEXT', {
		isExpanded: (id: string) => (Array.isArray(value) ? value.includes(id) : value === id),
		toggleItem
	});
</script>

<div class={cn('divide-y divide-slate-200 border-b border-t border-slate-200', className)}>
	{#if children}
		{@render children()}
	{/if}
</div>
