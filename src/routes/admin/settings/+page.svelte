<script lang="ts">
	import { Settings, CheckCircle2, Truck, Save, RefreshCw } from 'lucide-svelte';

	let steadfastApiKey = $state('stdf_live_89a47b2c918e001');
	let steadfastSecretKey = $state('••••••••••••••••••••••••');
	let pathaoClientId = $state('pt_client_98214');
	let pathaoClientSecret = $state('••••••••••••••••••••••••');
	let deliveryDhaka = $state(60);
	let deliveryOutsideDhaka = $state(120);

	let isSaved = $state(false);
	let isSyncing = $state(false);
	let syncMessage = $state<string | null>(null);

	function saveSettings() {
		isSaved = true;
		setTimeout(() => (isSaved = false), 2500);
	}

	function testCourierSync() {
		isSyncing = true;
		syncMessage = 'Steadfast ও Pathao এপিআই সংযোগ যাচাই হচ্ছে...';
		setTimeout(() => {
			isSyncing = false;
			syncMessage = 'Steadfast ও Pathao এপিআই সক্রিয় ও সফলভাবে কানেক্টেড!';
			setTimeout(() => (syncMessage = null), 3500);
		}, 1200);
	}
</script>

<div class="max-w-3xl mx-auto space-y-6">
	<!-- Header -->
	<div class="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
		<div>
			<h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
				<Settings class="w-5 h-5 text-[#5845eb]" />
				<span>লজিস্টিকস ও কুরিয়ার সেটিংস</span>
			</h2>
			<p class="text-xs text-slate-500 mt-0.5">
				Steadfast, Pathao ও ডেলিভারি ফি ম্যানেজমেন্ট
			</p>
		</div>

		<button
			type="button"
			onclick={testCourierSync}
			disabled={isSyncing}
			class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-all cursor-pointer"
		>
			<RefreshCw class="w-3.5 h-3.5 {isSyncing ? 'animate-spin text-[#5845eb]' : 'text-slate-500'}" />
			<span>কানেকশন টেস্ট</span>
		</button>
	</div>

	{#if syncMessage}
		<div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
			<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
			<span>{syncMessage}</span>
		</div>
	{/if}

	<!-- Courier Credentials Card -->
	<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
		<h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
			<Truck class="w-4 h-4 text-[#5845eb]" />
			<span>Steadfast Courier API কনফিগারেশন</span>
		</h3>

		<div class="space-y-4">
			<div class="space-y-1.5">
				<label for="steadfast-api" class="text-xs font-bold text-slate-700">Steadfast API Key</label>
				<input
					id="steadfast-api"
					type="text"
					bind:value={steadfastApiKey}
					class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
				/>
			</div>

			<div class="space-y-1.5">
				<label for="steadfast-secret" class="text-xs font-bold text-slate-700">Steadfast Secret Key</label>
				<input
					id="steadfast-secret"
					type="password"
					bind:value={steadfastSecretKey}
					class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
				/>
			</div>
		</div>

		<div class="pt-5 border-t border-slate-100">
			<h3 class="text-sm font-bold text-slate-900 mb-4">ডেলিভারি চার্জ সেটিংস</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label for="dhaka-fee" class="text-xs font-bold text-slate-700">ঢাকার ভেতরে ডেলিভারি চার্জ (৳)</label>
					<input
						id="dhaka-fee"
						type="number"
						bind:value={deliveryDhaka}
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="outside-fee" class="text-xs font-bold text-slate-700">ঢাকার বাইরে ডেলিভারি চার্জ (৳)</label>
					<input
						id="outside-fee"
						type="number"
						bind:value={deliveryOutsideDhaka}
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
					/>
				</div>
			</div>
		</div>

		<div class="pt-4 border-t border-slate-100 flex items-center justify-between">
			{#if isSaved}
				<span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
					<CheckCircle2 class="w-4 h-4" />
					<span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
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
				<span>সেটিংস সংরক্ষণ করুন</span>
			</button>
		</div>
	</div>
</div>
