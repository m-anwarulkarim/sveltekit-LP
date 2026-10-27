<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';

	export type AlertVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

	interface Props {
		variant?: AlertVariant;
		class?: string;
		children?: Snippet;
	}

	let { variant = 'default', class: className, children }: Props = $props();

	const variantClasses: Record<AlertVariant, string> = {
		default: 'bg-slate-50 border-slate-200 text-slate-800 [&>svg]:text-slate-800',
		destructive: 'border-rose-200 bg-rose-50/60 text-rose-900 [&>svg]:text-rose-600',
		success: 'border-emerald-200 bg-emerald-50/60 text-emerald-900 [&>svg]:text-emerald-600',
		warning: 'border-amber-200 bg-amber-50/60 text-amber-900 [&>svg]:text-amber-600',
		info: 'border-sky-200 bg-sky-50/60 text-sky-900 [&>svg]:text-sky-600'
	};
</script>

<div
	role="alert"
	class={cn(
		'relative w-full rounded-2xl border p-4 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:h-5 [&>svg]:w-5 [&>svg~*]:pl-8 shadow-xs',
		variantClasses[variant],
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</div>
