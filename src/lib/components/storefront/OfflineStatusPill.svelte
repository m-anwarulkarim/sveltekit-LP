<script lang="ts">
	import { network } from '#lib/stores/network.svelte';
	import { WifiOff, CheckCircle2, RotateCw } from 'lucide-svelte';

	let isChecking = $state(false);

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

{#if network.isOffline || network.wasOffline}
	<div
		class="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-[9998] pointer-events-auto transition-all duration-300 ease-out font-['Anek_Bangla',sans-serif]"
		role="status"
		aria-live="polite"
	>
		{#if network.wasOffline}
			<!-- Reconnected Celebratory Toast -->
			<div
				class="flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full bg-emerald-600 text-white shadow-[0_10px_35px_rgba(5,150,105,0.45)] border border-emerald-400/30 animate-in fade-in zoom-in-95 duration-200"
			>
				<CheckCircle2 class="w-4 h-4 text-emerald-100 shrink-0 animate-bounce" />
				<span class="text-xs sm:text-sm font-semibold tracking-wide">
					সংযোগ ফিরে এসেছে! আপনি অনলাইনে আছেন
				</span>
			</div>
		{:else}
			<!-- Offline Passive Glass Pill -->
			<div
				class="flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-full bg-slate-950/92 backdrop-blur-xl text-white shadow-[0_12px_40px_rgba(0,0,0,0.55)] border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200"
			>
				<!-- Pulsing Red/Amber Radar Dot -->
				<div class="relative flex items-center justify-center shrink-0">
					<span class="absolute inline-flex h-4 w-4 rounded-full bg-rose-500 opacity-60 animate-ping"></span>
					<div class="relative w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
						<WifiOff class="w-3.5 h-3.5" />
					</div>
				</div>

				<!-- Message -->
				<div class="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-tight">
					<span class="text-xs sm:text-sm font-semibold text-rose-200">
						ইন্টারনেট সংযোগ বিচ্ছিন্ন
					</span>
					<span class="text-[11px] sm:text-xs text-slate-300">
						(অফলাইন মোড সক্রিয়)
					</span>
				</div>

				<!-- Divider -->
				<div class="w-px h-4 bg-white/20"></div>

				<!-- Manual Check Button -->
				<button
					type="button"
					onclick={handleRetry}
					disabled={isChecking || network.isReconnecting}
					class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-100 hover:text-white text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
					title="সংযোগ পুনরায় চেক করুন"
				>
					<RotateCw class="w-3 h-3 {isChecking || network.isReconnecting ? 'animate-spin text-rose-400' : ''}" />
					<span class="hidden sm:inline">চেক করুন</span>
				</button>
			</div>
		{/if}
	</div>
{/if}
