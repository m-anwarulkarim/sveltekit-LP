<script lang="ts">
	import { cn } from '#lib/utils';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
		class?: string;
		value?: any;
	}

	let { class: className, value = $bindable(), ...restProps }: Props = $props();
</script>

<textarea
	class={cn(
		'flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-[#5845eb] focus-visible:ring-2 focus-visible:ring-[#5845eb]/20 disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs resize-y',
		className
	)}
	bind:value
	{...restProps}
></textarea>
