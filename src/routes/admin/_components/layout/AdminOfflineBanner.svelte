<script lang="ts">
	import { network } from '#lib/stores/network.svelte';
	import { WifiOff, CheckCircle2, RotateCw, AlertTriangle } from 'lucide-svelte';

	let isRetrying = $state(false);

	async function handleCheck() {
		if (isRetrying) return;
		isRetrying = true;
		try {
			await network.checkConnection();
		} finally {
			isRetrying = false;
		}
	}
</script>

{#if network.isOffline || network.wasOffline}
	<div class="w-full z-[9990] font-['Anek_Bangla',sans-serif] animate-in slide-in-from-top-2 duration-200">
		{#if network.wasOffline}
			<!-- Reconnected Banner -->
			<div class="bg-emerald-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-sm">
				<CheckCircle2 class="w-4 h-4 text-emerald-200 shrink-0 animate-bounce" />
				<span>ইন্টারনেট সংযোগ পুনঃস্থাপিত হয়েছে! ড্যাশবোর্ড আবার লাইভ।</span>
			</div>
		{:else}
			<!-- Offline Safety Warning Banner -->
			<div class="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2.5 shadow-md border-b border-amber-600/40 flex flex-col sm:flex-row items-center justify-between gap-2.5">
				<div class="flex items-center gap-2.5 text-center sm:text-left">
					<div class="relative flex items-center justify-center shrink-0">
						<span class="absolute inline-flex h-3.5 w-3.5 rounded-full bg-rose-600 opacity-75 animate-ping"></span>
						<div class="relative w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center">
							<WifiOff class="w-3 h-3" />
						</div>
					</div>
					<div class="text-xs sm:text-sm font-medium leading-snug">
						<span class="font-bold text-slate-950">ইন্টারনেট সংযোগ বিচ্ছিন্ন!</span>
						<span class="text-slate-900 hidden md:inline ml-1">
							অর্ডার আপডেট বা কুরিয়ার বুকিং করার আগে নেট চেক করুন। আপনার বর্তমান ফর্মের ডেটা সুরক্ষিত রয়েছে।
						</span>
					</div>
				</div>

				<button
					type="button"
					onclick={handleCheck}
					disabled={isRetrying || network.isReconnecting}
					class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 text-white hover:bg-slate-900 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
				>
					<RotateCw class="w-3 h-3 {isRetrying || network.isReconnecting ? 'animate-spin text-amber-400' : ''}" />
					<span>{isRetrying || network.isReconnecting ? 'চেক হচ্ছে...' : 'সংযোগ চেক করুন'}</span>
				</button>
			</div>
		{/if}
	</div>
{/if}
