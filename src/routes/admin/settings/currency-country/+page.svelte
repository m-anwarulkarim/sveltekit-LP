<script lang="ts">
	import { Button, Card, Input } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, Coins } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Currency Settings Saved!');

	let primaryCurrency = $state('BDT');
	let currencySymbol = $state('৳');
	let symbolPosition = $state<'left' | 'right'>('left');
	let decimalDigits = $state(0);
	let defaultCountry = $state('Bangladesh');
	let timeZone = $state('Asia/Dhaka (GMT+6)');

	function triggerSave(msg = 'Currency Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Shop Currency & Country | AURA Enterprise</title>
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
			class="gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Settings</span>
		</Button>
	</div>

	<Card class="p-6 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center gap-3 pb-3 border-b border-slate-100">
			<div class="w-10 h-10 rounded-full bg-[#f97316] flex items-center justify-center text-white">
				<Coins class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">Shop Currency & Country</h3>
				<p class="text-xs text-slate-500">দোকানের প্রাথমিক মুদ্রা, প্রতীক এবং আঞ্চলিক দেশ নির্ধারণ</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">প্রাথমিক মুদ্রা (Currency)</label>
					<select
						bind:value={primaryCurrency}
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold"
					>
						<option value="BDT">BDT - Bangladeshi Taka (৳)</option>
						<option value="USD">USD - US Dollar ($)</option>
						<option value="EUR">EUR - Euro (€)</option>
					</select>
				</div>

				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">মুদ্রার প্রতীক (Symbol)</label>
					<Input type="text" bind:value={currencySymbol} class="font-mono text-sm" />
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">প্রতীকের অবস্থান</label>
					<select
						bind:value={symbolPosition}
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold"
					>
						<option value="left">বামে (৳১০০)</option>
						<option value="right">ডানে (১০০৳)</option>
					</select>
				</div>

				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">দশমিক সংখ্যা (Decimals)</label>
					<select
						bind:value={decimalDigits}
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold"
					>
						<option value={0}>0 (৳১০০)</option>
						<option value={2}>2 (৳১০০.০০)</option>
					</select>
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">ডিফল্ট দেশ</label>
					<Input type="text" bind:value={defaultCountry} class="text-sm font-semibold" />
				</div>
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">টাইম জোন</label>
					<Input type="text" bind:value={timeZone} class="text-sm font-semibold" disabled />
				</div>
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold"
		>
			কারেন্সি সেটিংস সংরক্ষণ
		</Button>
	</Card>
</div>
