<script lang="ts">
	import { confirmStore } from '#lib/stores/confirm.svelte';
	import { Trash2, AlertTriangle, HelpCircle, X } from 'lucide-svelte';
	import { Button } from '#lib/components/ui';

	function handleKeydown(e: KeyboardEvent) {
		if (!confirmStore.isOpen) return;
		if (e.key === 'Escape') {
			confirmStore.handleCancel();
		} else if (e.key === 'Enter') {
			confirmStore.handleConfirm();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if confirmStore.isOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
		onclick={() => confirmStore.handleCancel()}
		role="presentation"
	></div>

	<!-- Dialog Panel -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
		<div
			class="pointer-events-auto relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 text-slate-900 shadow-2xl border border-slate-200/90 animate-in zoom-in-95 fade-in duration-200 font-['Anek_Bangla',sans-serif]"
			role="dialog"
			aria-modal="true"
		>
			<!-- Close Button -->
			<button
				type="button"
				onclick={() => confirmStore.handleCancel()}
				class="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
				aria-label="Close dialog"
			>
				<X class="w-4 h-4" />
			</button>

			<!-- Header with Icon & Title -->
			<div class="flex items-start gap-4 mb-4">
				<div
					class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 {confirmStore.variant === 'destructive'
						? 'bg-rose-50 text-rose-600 border border-rose-200'
						: confirmStore.variant === 'warning'
							? 'bg-amber-50 text-amber-600 border border-amber-200'
							: 'bg-indigo-50 text-[#5845eb] border border-indigo-200'}"
				>
					{#if confirmStore.icon === 'trash'}
						<Trash2 class="w-6 h-6 stroke-[2]" />
					{:else if confirmStore.icon === 'alert'}
						<AlertTriangle class="w-6 h-6 stroke-[2]" />
					{:else}
						<HelpCircle class="w-6 h-6 stroke-[2]" />
					{/if}
				</div>

				<div class="space-y-1 pt-1 pr-6">
					<h3 class="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
						{confirmStore.title}
					</h3>
					<p class="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
						{confirmStore.message}
					</p>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={() => confirmStore.handleCancel()}
					class="h-9.5 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer shadow-2xs"
				>
					{confirmStore.cancelText}
				</Button>

				<Button
					type="button"
					size="sm"
					onclick={() => confirmStore.handleConfirm()}
					class="h-9.5 px-4.5 rounded-xl text-white font-bold text-xs cursor-pointer shadow-xs transition-all {confirmStore.variant === 'destructive'
						? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
						: confirmStore.variant === 'warning'
							? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
							: 'bg-[#5845eb] hover:bg-[#4936d6] shadow-indigo-600/20'}"
				>
					{confirmStore.confirmText}
				</Button>
			</div>
		</div>
	</div>
{/if}
