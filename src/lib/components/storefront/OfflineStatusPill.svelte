<script lang="ts">
	import { network } from '#lib/stores/network.svelte';
	import { WifiOff, CheckCircle2, RotateCw, X } from 'lucide-svelte';

	let isChecking = $state(false);
	let isDismissed = $state(false);

	$effect(() => {
		// When offline state triggers, reset dismissal so alert is clearly visible
		if (network.isOffline) {
			isDismissed = false;
		}
	});

	async function handleRetry() {
		if (isChecking) return;
		isChecking = true;
		try {
			await network.checkConnection();
		} finally {
			isChecking = false;
		}
	}
</script>

{#if (network.isOffline && !isDismissed) || network.wasOffline}
	<aside
		class="fixed top-[calc(10px+env(safe-area-inset-top,0px))] sm:top-5 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto transition-all duration-300 ease-out font-['Anek_Bangla',sans-serif] w-[calc(100vw-1.25rem)] sm:w-auto max-w-md sm:max-w-xl px-1 sm:px-0"
		role="status"
		aria-live="polite"
	>
		{#if network.wasOffline}
			<!-- Reconnected Celebratory Toast -->
			<div
				class="w-full sm:w-auto mx-auto flex items-center justify-center gap-2 sm:gap-2.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl sm:rounded-full bg-emerald-600 text-white shadow-[0_10px_35px_rgba(5,150,105,0.45)] border border-emerald-400/30 animate-in fade-in zoom-in-95 duration-200"
			>
				<CheckCircle2 class="w-4 h-4 text-emerald-100 shrink-0 animate-bounce" />
				<span class="text-xs sm:text-sm font-semibold tracking-wide text-center">
					সংযোগ ফিরে এসেছে! আপনি অনলাইনে আছেন
				</span>
			</div>
		{:else}
			<!-- Offline Passive Glass Pill -->
			<div
				class="w-full sm:w-auto mx-auto flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl sm:rounded-full bg-slate-950/95 backdrop-blur-xl text-white shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-white/15 animate-in fade-in slide-in-from-top-3 duration-200"
			>
				<!-- Pulsing Red/Amber Radar Dot -->
				<div class="relative flex items-center justify-center shrink-0">
					<span class="absolute inline-flex h-4 w-4 rounded-full bg-rose-500 opacity-60 animate-ping"></span>
					<div class="relative w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
						<WifiOff class="w-3.5 h-3.5" />
					</div>
				</div>

				<!-- Responsive Message -->
				<div class="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-tight">
					<span class="text-xs sm:text-sm font-bold text-rose-200 truncate">
						ইন্টারনেট সংযোগ বিচ্ছিন্ন
					</span>
					<span class="text-[10px] sm:text-xs text-slate-300 truncate">
						(অফলাইন মোড সক্রিয়)
					</span>
				</div>

				<!-- Actions Container -->
				<div class="shrink-0 flex items-center gap-1.5 sm:gap-2">
					<!-- Manual Check Button -->
					<button
						type="button"
						onclick={handleRetry}
						disabled={isChecking || network.isReconnecting}
						class="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-slate-100 hover:text-white text-[11px] sm:text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 border border-white/10"
						title="সংযোগ পুনরায় চেক করুন"
					>
						<RotateCw class="w-3 h-3 {isChecking || network.isReconnecting ? 'animate-spin text-rose-300' : ''}" />
						<span class="hidden xs:inline">{isChecking || network.isReconnecting ? 'চেক হচ্ছে...' : 'চেক করুন'}</span>
						<span class="xs:hidden">{isChecking || network.isReconnecting ? '...' : 'চেক'}</span>
					</button>

					<!-- Dismiss Button -->
					<button
						type="button"
						onclick={() => (isDismissed = true)}
						class="p-1 rounded-lg sm:rounded-full text-slate-400 hover:text-white hover:bg-white/15 active:scale-90 transition-colors cursor-pointer"
						title="নোটিফিকেশন বন্ধ করুন"
						aria-label="Dismiss offline alert"
					>
						<X class="w-3.5 h-3.5" />
					</button>
				</div>
			</div>
		{/if}
	</aside>
{/if}
