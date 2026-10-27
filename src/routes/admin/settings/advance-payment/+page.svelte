<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, Banknote, ShieldAlert } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Advance Payment Settings Saved!');

	let enableAdvancePayment = $state(true);
	let advanceType = $state<'fixed' | 'percentage'>('fixed');
	let advanceAmount = $state(150);
	let onlyOutsideDhaka = $state(true);
	let autoCancelMinutes = $state(30);
	let bkashNumber = $state('01700000000');
	let nagadNumber = $state('01800000000');
	let instructions = $state('অনুগ্রহ করে উল্লিখিত নাম্বারে সেন্ড মানি বা পেমেন্ট করে ট্রানজেকশন আইডি প্রদান করুন।');

	function triggerSave(msg = 'Advance Payment Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Advance Payment Settings | AURA Enterprise</title>
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
			class="gap-1.5 bg-[#10b981] hover:bg-[#059669] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Settings</span>
		</Button>
	</div>

	<Card class="p-6 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center gap-3 pb-3 border-b border-slate-100">
			<div class="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center text-white">
				<Banknote class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">Advance Payment সেটিংস</h3>
				<p class="text-xs text-slate-500">অর্ডার কনফার্মেশনের জন্য অগ্রিম ডেলিভারি বা বুকিং চার্জ নির্ধারণ করুন</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="flex items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
				<div>
					<h4 class="text-xs font-bold text-slate-900">অগ্রিম পেমেন্ট বাধ্যতামূলক করুন</h4>
					<p class="text-[11px] text-slate-500">অর্ডার প্লেস করার সময় কাস্টমারকে অগ্রিম ফি পরিশোধ করতে হবে</p>
				</div>
				<Switch bind:checked={enableAdvancePayment} />
			</div>

			{#if enableAdvancePayment}
				<div class="space-y-4 pt-2">
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">অগ্রিম টাকার পরিমাণ (৳)</label>
							<Input type="number" bind:value={advanceAmount} class="font-mono text-sm" />
						</div>

						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">পেমেন্ট না করলে অটো বাতিল (মিনিট)</label>
							<Input type="number" bind:value={autoCancelMinutes} class="font-mono text-sm" />
						</div>
					</div>

					<div class="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
						<div>
							<h4 class="text-xs font-bold text-slate-900">শুধুমাত্র ঢাকার বাইরের অর্ডারে কার্যকর</h4>
							<p class="text-[11px] text-slate-500">ঢাকার ভেতরের কাস্টমার ফুল ক্যাশ অন ডেলিভারি পাবে</p>
						</div>
						<Switch bind:checked={onlyOutsideDhaka} />
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">বিকাশ পার্সোনাল/মার্চেন্ট নম্বর</label>
							<Input type="text" bind:value={bkashNumber} class="font-mono text-sm" />
						</div>
						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">নগদ নম্বর</label>
							<Input type="text" bind:value={nagadNumber} class="font-mono text-sm" />
						</div>
					</div>

					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700">চেকআউটে প্রদর্শিত নির্দেশনাবলী</label>
						<textarea
							bind:value={instructions}
							rows="3"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#10b981]"
						></textarea>
					</div>
				</div>
			{/if}
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold"
		>
			সংরক্ষণ করুন
		</Button>
	</Card>
</div>
