<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	export type ButtonVariant =
		| 'default'
		| 'destructive'
		| 'outline'
		| 'secondary'
		| 'ghost'
		| 'link'
		| 'success'
		| 'purple';

	export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

	interface BaseProps {
		variant?: ButtonVariant;
		size?: ButtonSize;
		children?: Snippet;
		class?: string;
		loading?: boolean;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
	}

	type Props = BaseProps & Record<string, any>;

	let {
		variant = 'default',
		size = 'default',
		class: className,
		children,
		loading = false,
		disabled = false,
		href,
		type = 'button',
		...restProps
	}: Props = $props();

	const variantClasses: Record<ButtonVariant, string> = {
		default: 'bg-[#5845eb] text-white hover:bg-[#4936d6] shadow-sm shadow-indigo-500/20 active:scale-[0.98]',
		destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-500/20 active:scale-[0.98]',
		outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 active:scale-[0.98]',
		secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200/80 active:scale-[0.98]',
		ghost: 'hover:bg-slate-100 hover:text-slate-900 text-slate-700',
		link: 'text-[#5845eb] underline-offset-4 hover:underline',
		success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 active:scale-[0.98]',
		purple: 'bg-[#5845eb] text-white hover:bg-[#4936d6] shadow-sm shadow-indigo-500/20 active:scale-[0.98]'
	};

	const sizeClasses: Record<ButtonSize, string> = {
		default: 'h-10 px-4 py-2 text-sm',
		sm: 'h-8 px-3 text-xs rounded-lg',
		lg: 'h-12 px-6 text-base rounded-xl',
		icon: 'h-9 w-9 p-0'
	};
</script>

{#if href}
	<a
		{href}
		class={cn(
			'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5845eb] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer no-underline',
			variantClasses[variant],
			sizeClasses[size],
			className
		)}
		{...restProps}
	>
		{#if loading}
			<svg class="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		{/if}
		{#if children}
			{@render children()}
		{/if}
	</a>
{:else}
	<button
		{type}
		class={cn(
			'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5845eb] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
			variantClasses[variant],
			sizeClasses[size],
			className
		)}
		disabled={disabled || loading}
		{...restProps}
	>
		{#if loading}
			<svg class="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		{/if}
		{#if children}
			{@render children()}
		{/if}
	</button>
{/if}
