<script lang="ts">
	import { cn } from '#lib/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		class?: string;
		value?: any;
	}

	let { class: className, value = $bindable(), ...restProps }: Props = $props();
</script>

<input
	class={cn(
		'flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-[#5845eb] focus-visible:ring-2 focus-visible:ring-[#5845eb]/20 disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs',
		className
	)}
	bind:value
	{...restProps}
/>
