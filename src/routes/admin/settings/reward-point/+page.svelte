<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, Award } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Reward Point Settings Saved!');

	let enableRewards = $state(true);
	let pointsPer100Tk = $state(1);
	let pointValueTk = $state(1);
	let minPointsToRedeem = $state(50);
	let pointsExpiryDays = $state(90);

	function triggerSave(msg = 'Reward Point Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Reward Point Settings | AURA Enterprise</title>
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
			class="gap-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Rewards</span>
		</Button>
	</div>

	<Card class="p-6 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center gap-3 pb-3 border-b border-slate-100">
			<div class="w-10 h-10 rounded-full bg-[#ef4444] flex items-center justify-center text-white">
				<Award class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">Reward Point সিস্টেম</h3>
				<p class="text-xs text-slate-500">গ্রাহকদের কেনাকাটার ওপর লয়্যালটি পয়েন্ট ও রিডিম রুলস</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
				<div>
					<h4 class="text-xs font-bold text-slate-900">রিওয়ার্ড পয়েন্ট প্রোগ্রাম চালু রাখুন</h4>
					<p class="text-[11px] text-slate-500">প্রতিটি সফল অর্ডারে গ্রাহক স্বয়ংক্রিয়ভাবে পয়েন্ট পাবেন</p>
				</div>
				<Switch bind:checked={enableRewards} />
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">প্রতি ১০০ টাকায় পয়েন্ট অর্জন</label>
					<Input type="number" bind:value={pointsPer100Tk} class="font-mono text-sm" />
				</div>
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">১ পয়েন্টের মূল্য (৳)</label>
					<Input type="number" bind:value={pointValueTk} class="font-mono text-sm" />
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">রিডিম করার জন্য ন্যূনতম পয়েন্ট</label>
					<Input type="number" bind:value={minPointsToRedeem} class="font-mono text-sm" />
				</div>
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">পয়েন্টের মেয়াদ (দিন)</label>
					<Input type="number" bind:value={pointsExpiryDays} class="font-mono text-sm" />
				</div>
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold"
		>
			রিওয়ার্ড পয়েন্ট সেটিংস সংরক্ষণ
		</Button>
	</Card>
</div>
