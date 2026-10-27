<script lang="ts">
	import { cn } from '#lib/utils';

	interface Props {
		value?: number;
		max?: number;
		class?: string;
		indicatorClass?: string;
	}

	let {
		value = 0,
		max = 100,
		class: className,
		indicatorClass
	}: Props = $props();

	const percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
</script>

<div
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={max}
	aria-valuenow={value}
	class={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100', className)}
>
	<div
		class={cn('h-full w-full flex-1 bg-[#5845eb] transition-all duration-300 ease-in-out', indicatorClass)}
		style="transform: translateX(-{100 - percentage}%);"
	></div>
</div>
