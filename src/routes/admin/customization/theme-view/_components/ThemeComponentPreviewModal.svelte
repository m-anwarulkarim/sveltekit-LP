<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		X,
		Monitor,
		Smartphone,
		Check,
		Sparkles
	} from 'lucide-svelte';

	interface Props {
		isOpen: boolean;
		title: string;
		subtitle?: string;
		isActive?: boolean;
		activateLabel?: string;
		defaultViewport?: 'desktop' | 'mobile';
		onClose: () => void;
		onActivate?: () => void;
		children: Snippet;
	}

	let {
		isOpen = false,
		title,
		subtitle = 'লাইভ কম্পোনেন্ট প্রিভিউ (ডেস্কটপ ও ৩৯০px মোবাইল রেসপন্সিভ টেস্ট)',
		isActive = false,
		activateLabel = 'এই অপশনটি অ্যাক্টিভ করুন',
		defaultViewport = 'desktop',
		onClose,
		onActivate,
		children
	}: Props = $props();

	let viewport = $state<'desktop' | 'mobile'>('desktop');

	$effect(() => {
		if (isOpen) {
			viewport = defaultViewport;
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-['Anek_Bangla',sans-serif]"
		role="dialog"
		aria-modal="true"
	>
		<!-- Universal Modal Container -->
		<div
			class="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
		>
			<!-- 1. Top Control Bar -->
			<div
				class="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-4 shrink-0"
			>
				<!-- Left: Title & Badge -->
				<div class="flex items-center gap-2.5 min-w-0">
					<div class="w-8 h-8 rounded-xl bg-purple-50 text-[#5845eb] flex items-center justify-center shrink-0">
						<Sparkles class="w-4 h-4" />
					</div>
					<div class="min-w-0">
						<div class="flex items-center gap-2">
							<h3 class="text-sm sm:text-base font-bold text-slate-900 truncate">
								{title}
							</h3>
							{#if isActive}
								<span
									class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0"
								>
									বর্তমানে সক্রিয়
								</span>
							{/if}
						</div>
						<p class="text-[11px] text-slate-500 truncate">
							{subtitle}
						</p>
					</div>
				</div>

				<!-- Center: Viewport Switcher (Desktop vs Mobile 390px) -->
				<div class="flex items-center bg-slate-200/70 p-1 rounded-xl shrink-0">
					<button
						type="button"
						onclick={() => (viewport = 'desktop')}
						class="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer {viewport ===
						'desktop'
							? 'bg-white text-slate-900 shadow-2xs'
							: 'text-slate-600 hover:text-slate-900'}"
					>
						<Monitor class="w-3.5 h-3.5" />
						<span>Desktop</span>
					</button>

					<button
						type="button"
						onclick={() => (viewport = 'mobile')}
						class="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer {viewport ===
						'mobile'
							? 'bg-white text-slate-900 shadow-2xs'
							: 'text-slate-600 hover:text-slate-900'}"
					>
						<Smartphone class="w-3.5 h-3.5" />
						<span>Mobile (390px)</span>
					</button>
				</div>

				<!-- Right: Actions & Close -->
				<div class="flex items-center gap-2 shrink-0">
					{#if !isActive && onActivate}
						<button
							type="button"
							onclick={() => {
								onActivate();
								onClose();
							}}
							class="px-3.5 py-1.5 rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
						>
							<Check class="w-3.5 h-3.5 stroke-[2.5]" />
							<span class="hidden md:inline">{activateLabel}</span>
							<span class="md:hidden">অ্যাক্টিভ</span>
						</button>
					{/if}

					<button
						type="button"
						onclick={onClose}
						aria-label="Close"
						class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
					>
						<X class="w-4 h-4" />
					</button>
				</div>
			</div>

			<!-- 2. Reusable Body Canvas -->
			<div class="flex-1 overflow-y-auto bg-slate-100/70 p-4 sm:p-8 flex justify-center items-start">
				{#if viewport === 'mobile'}
					<!-- 390px Mobile Smartphone Frame -->
					<div
						class="w-[390px] min-h-[580px] bg-white rounded-[40px] shadow-2xl border-8 border-slate-900 overflow-hidden flex flex-col shrink-0 my-4 relative transform translate-z-0"
					>
						<!-- Speaker Notch -->
						<div class="w-full h-6 bg-slate-900 flex items-center justify-center shrink-0">
							<div class="w-16 h-3 rounded-full bg-slate-800"></div>
						</div>

						<!-- Dynamic Component Content -->
						<div class="overflow-x-hidden flex-1 relative flex flex-col justify-between">
							{@render children()}
						</div>

						<!-- Home Indicator -->
						<div class="w-full h-5 bg-slate-900 flex items-center justify-center shrink-0">
							<div class="w-24 h-1 rounded-full bg-slate-700"></div>
						</div>
					</div>
				{:else}
					<!-- Full Desktop Canvas -->
					<div class="w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
						{@render children()}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
