<script lang="ts">
	import { cn } from '#lib/utils';
	import type { Snippet } from 'svelte';
	import { X } from 'lucide-svelte';

	interface Props {
		open?: boolean;
		title?: string;
		description?: string;
		children?: Snippet;
		footer?: Snippet;
		class?: string;
		onclose?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		description,
		children,
		footer,
		class: className,
		onclose
	}: Props = $props();

	function close() {
		open = false;
		onclose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			close();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
		onclick={close}
		role="presentation"
	></div>

	<!-- Modal Panel -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
		<div
			class={cn(
				'pointer-events-auto relative w-full max-w-lg rounded-2xl bg-white p-6 text-slate-900 shadow-2xl transition-all border border-slate-200/90 animate-in zoom-in-95 duration-150',
				className
			)}
			role="dialog"
			aria-modal="true"
		>
			<!-- Close button -->
			<button
				onclick={close}
				class="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
				aria-label="Close dialog"
			>
				<X class="w-4 h-4" />
			</button>

			<!-- Header -->
			{#if title || description}
				<div class="flex flex-col space-y-1.5 pb-4">
					{#if title}
						<h2 class="text-lg font-bold text-slate-900">{title}</h2>
					{/if}
					{#if description}
						<p class="text-xs text-slate-500 font-medium">{description}</p>
					{/if}
				</div>
			{/if}

			<!-- Content Body -->
			{#if children}
				<div class="py-2">
					{@render children()}
				</div>
			{/if}

			<!-- Footer -->
			{#if footer}
				<div class="mt-4 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
