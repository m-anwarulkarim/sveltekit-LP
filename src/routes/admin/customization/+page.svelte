<script lang="ts">
	import { Sliders, Save, Check } from 'lucide-svelte';

	let metaPixel = $state('819203847192039');
	let metaCapi = $state('EAAGNOXXXXXXXXXXXX');
	let tiktokPixel = $state('C9J829XLS8');
	let gtmId = $state('GTM-W8L9P2');
	let isSaved = $state(false);

	function saveSettings() {
		isSaved = true;
		setTimeout(() => (isSaved = false), 2500);
	}
</script>

<div class="max-w-3xl mx-auto space-y-6">
	<!-- Header -->
	<div class="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
		<div>
			<h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
				<Sliders class="w-5 h-5 text-[#5845eb]" />
				<span>পিক্সেল ও কনভার্সন ট্র্যাকিং</span>
			</h2>
			<p class="text-xs text-slate-500 mt-0.5">
				Meta Pixel, Facebook Conversion API (CAPI), TikTok Pixel এবং Google Tag Manager
			</p>
		</div>
	</div>

	<!-- Form Card -->
	<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
		<div class="space-y-1.5">
			<label for="meta-pixel-id" class="text-xs font-bold text-slate-700">Meta Pixel ID (Facebook)</label>
			<input
				id="meta-pixel-id"
				type="text"
				bind:value={metaPixel}
				placeholder="উদাঃ 819203847192039"
				class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
			/>
		</div>

		<div class="space-y-1.5">
			<label for="meta-capi-token" class="text-xs font-bold text-slate-700">Facebook Conversion API (CAPI) Access Token</label>
			<input
				id="meta-capi-token"
				type="password"
				bind:value={metaCapi}
				placeholder="EAAGNO..."
				class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
			/>
			<span class="text-[10px] text-slate-400">সার্ভার-সাইড ইভেন্ট ট্র্যাকিংয়ের জন্য ফেসবুক ডেভলপার টোকেন</span>
		</div>

		<div class="space-y-1.5">
			<label for="tiktok-pixel-id" class="text-xs font-bold text-slate-700">TikTok Pixel ID</label>
			<input
				id="tiktok-pixel-id"
				type="text"
				bind:value={tiktokPixel}
				placeholder="উদাঃ C9J8XXXXX"
				class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
			/>
		</div>

		<div class="space-y-1.5">
			<label for="gtm-container-id" class="text-xs font-bold text-slate-700">Google Tag Manager (GTM) Container ID</label>
			<input
				id="gtm-container-id"
				type="text"
				bind:value={gtmId}
				placeholder="উদাঃ GTM-XXXXXXX"
				class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
			/>
		</div>

		<div class="pt-4 border-t border-slate-100 flex items-center justify-between">
			{#if isSaved}
				<span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
					<Check class="w-4 h-4" />
					<span>পিক্সেল সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
				</span>
			{:else}
				<span></span>
			{/if}

			<button
				type="button"
				onclick={saveSettings}
				class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5845eb] hover:bg-[#4734d6] text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
			>
				<Save class="w-4 h-4" />
				<span>আপডেট সংরক্ষণ করুন</span>
			</button>
		</div>
	</div>
</div>
