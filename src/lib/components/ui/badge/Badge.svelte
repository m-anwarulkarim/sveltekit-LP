<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'purple';
		children?: Snippet;
		class?: string;
	}

	let {
		variant = 'default',
		class: className,
		children,
		...restProps
	}: Props = $props();

	const variantClasses = {
		default: 'border-transparent bg-slate-900 text-white',
		secondary: 'border-transparent bg-slate-100 text-slate-900',
		destructive: 'border-transparent bg-rose-100 text-rose-700',
		outline: 'border-slate-200 text-slate-800',
		success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
		warning: 'border-amber-200 bg-amber-50 text-amber-700',
		purple: 'border-indigo-200 bg-indigo-50 text-[#5845eb]'
	};
</script>

<div
	class={cn(
		'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
		variantClasses[variant],
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
