<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, RefreshCw } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Bizmation Sync Settings Saved!');

	let enableSync = $state(false);
	let bizmationStoreId = $state('');
	let apiKey = $state('');
	let syncInventory = $state(false);
	let syncIntervalMinutes = $state(15);
	let syncOrdersToAccounting = $state(false);

	function triggerSave(msg = 'Bizmation Sync Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Bizmation Sync | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-2xl mx-auto p-4 sm:p-6">
	{#if isSaved}
		<div class="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
			<CheckCircle2 class="w-4 h-4" />
			<span>{saveMessage}</span>
		</div>
	{/if}

	<div class="flex items-center justify-between gap-4 pb-2">
		<a href="/admin/settings">
			<Button variant="outline" size="sm" class="gap-2">
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</Button>
		</a>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="gap-1.5 bg-[#06b6d4] hover:bg-[#0891b2] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Sync</span>
		</Button>
	</div>

	<Card class="p-6 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center gap-3 pb-3 border-b border-slate-100">
			<div class="w-10 h-10 rounded-full bg-[#06b6d4] flex items-center justify-center text-white">
				<RefreshCw class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">Bizmation Sync কনফিগারেশন</h3>
				<p class="text-xs text-slate-500">Bizmation ক্লাউড ইআরপি ও অ্যাকাউন্টিং ইনভেন্টরি সিঙ্ক্রোনাইজেশন</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="flex items-center justify-between p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100">
				<div>
					<h4 class="text-xs font-bold text-slate-900">Bizmation অটো সিঙ্ক সক্রিয় রাখুন</h4>
					<p class="text-[11px] text-slate-500">দোকানের স্টক ও অর্ডার ডাটা ক্লাউডে সিঙ্ক হবে</p>
				</div>
				<Switch bind:checked={enableSync} />
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">Bizmation Store ID</label>
					<Input type="text" bind:value={bizmationStoreId} class="font-mono text-sm" />
				</div>
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">সিঙ্ক বিরতি (মিনিট)</label>
					<Input type="number" bind:value={syncIntervalMinutes} class="font-mono text-sm" />
				</div>
			</div>

			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-700">Bizmation API Secret Key</label>
				<Input type="password" bind:value={apiKey} class="font-mono text-sm" />
			</div>

			<div class="pt-2 border-t border-slate-100 space-y-3">
				<div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
					<div>
						<h4 class="text-xs font-bold text-slate-900">ইনভেন্টরি ও স্টক অটো সিঙ্ক</h4>
						<p class="text-[11px] text-slate-500">গোডাউনে কোনো মাল সেল হলে ওয়েবসাইটে সাথে সাথে স্টক কমবে</p>
					</div>
					<Switch bind:checked={syncInventory} />
				</div>

				<div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
					<div>
						<h4 class="text-xs font-bold text-slate-900">অর্ডার লেজারে অটো পোস্টিং</h4>
						<p class="text-[11px] text-slate-500">ডেলিভারি হওয়া অর্ডার স্বয়ংক্রিয়ভাবে সেলস জার্নালে এন্ট্রি হবে</p>
					</div>
					<Switch bind:checked={syncOrdersToAccounting} />
				</div>
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-white font-bold"
		>
			সিঙ্ক সেটিংস সংরক্ষণ
		</Button>
	</Card>
</div>
