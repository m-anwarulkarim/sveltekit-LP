<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, ShieldCheck, AlertTriangle } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Fraud Check API Settings Saved!');

	let enableCourierFraudCheck = $state(false);
	let returnRateThreshold = $state(25);
	let autoBlockBadIps = $state(false);
	let steadFastApiKey = $state('');
	let pathaoSecret = $state('');

	function triggerSave(msg = 'Fraud Check API Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Fraud Check API | AURA Enterprise</title>
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
			class="gap-1.5 bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Settings</span>
		</Button>
	</div>

	<Card class="p-6 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center gap-3 pb-3 border-b border-slate-100">
			<div class="w-10 h-10 rounded-full bg-[#1d6ee5] flex items-center justify-center text-white">
				<ShieldCheck class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">Fraud Check API কনফিগারেশন</h3>
				<p class="text-xs text-slate-500">ভুয়া অর্ডার, উচ্চ রিটার্ন রেটের গ্রাহক ও ফেক ট্র্যাফিক সনাক্তকরণ</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="flex items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
				<div>
					<h4 class="text-xs font-bold text-slate-900">কুরিয়ার রিটার্ন হিস্ট্রি চেক সক্রিয় করুন</h4>
					<p class="text-[11px] text-slate-500">অর্ডার আসার সাথে সাথে গ্রাহকের অতীতের সফল ডেলিভারি ও রিটার্ন পারসেন্টেজ চেক হবে</p>
				</div>
				<Switch bind:checked={enableCourierFraudCheck} />
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">রিটার্ন সতর্কতা থ্রেশহোল্ড (%)</label>
					<Input type="number" bind:value={returnRateThreshold} class="font-mono text-sm" />
					<span class="text-[11px] text-slate-400">রিটার্ন রেট এর বেশি হলে অর্ডারে লাল সতর্কবার্তা দেখাবে</span>
				</div>

				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">হাই-রিস্ক আইপি অটো ব্লক</label>
					<div class="pt-2">
						<Switch bind:checked={autoBlockBadIps} />
					</div>
					<span class="text-[11px] text-slate-400">বারবার ফেক রিকোয়েস্ট পাঠালে ব্লক হবে</span>
				</div>
			</div>

			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-700">Steadfast Fraud Checker API Key</label>
				<Input type="password" bind:value={steadFastApiKey} class="font-mono text-sm" />
			</div>

			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-700">Pathao Client Secret</label>
				<Input type="password" bind:value={pathaoSecret} class="font-mono text-sm" />
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			ফ্রড চেক সেটিংস সংরক্ষণ
		</Button>
	</Card>
</div>
