<script lang="ts">
	import { cn } from '#lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
	}

	let { class: className, ...restProps }: Props = $props();
</script>

<div
	class={cn('animate-pulse rounded-xl bg-slate-200/80', className)}
	{...restProps}
></div>
