<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, Receipt } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Invoice Settings Saved!');

	let companyName = $state('The Color Light House');
	let companyPhone = $state('+8801860229546');
	let companyAddress = $state('Nawabpur Kaptan Bazar Complex, Dhaka-1100');
	let paperSize = $state<'A4' | 'POS80'>('POS80');
	let showQrCode = $state(true);
	let invoiceFooterNote = $state('পণ্য ডেলিভারি পাওয়ার সময় ভালো করে চেক করে গ্রহণ করুন। ধন্যবাদ!');

	function triggerSave(msg = 'Invoice Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Invoice Settings | AURA Enterprise</title>
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
			<span>Save Invoice</span>
		</Button>
	</div>

	<Card class="p-6 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center gap-3 pb-3 border-b border-slate-100">
			<div class="w-10 h-10 rounded-full bg-[#1d6ee5] flex items-center justify-center text-white">
				<Receipt class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">Invoice Settings</h3>
				<p class="text-xs text-slate-500">প্রিন্ট ইনভয়েস, পিওএস থার্মাল রসিদ ও ফুটনোট কনফিগারেশন</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">কোম্পানির নাম (Invoice Header)</label>
					<Input type="text" bind:value={companyName} class="text-sm font-semibold" />
				</div>
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">যোগাযোগের মোবাইল নম্বর</label>
					<Input type="text" bind:value={companyPhone} class="font-mono text-sm" />
				</div>
			</div>

			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-700">ঠিকানা</label>
				<Input type="text" bind:value={companyAddress} class="text-sm" />
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">কাগজের সাইজ (Paper Format)</label>
					<select
						bind:value={paperSize}
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold"
					>
						<option value="POS80">POS 80mm (Thermal Receipt)</option>
						<option value="A4">A4 Full Page Invoice</option>
					</select>
				</div>
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">QR কোড ট্র্যাকিং প্রিন্ট</label>
					<div class="pt-2">
						<Switch bind:checked={showQrCode} />
					</div>
				</div>
			</div>

			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-700">ইনভয়েসের নিচের শর্তাবলী / নোট</label>
				<textarea
					bind:value={invoiceFooterNote}
					rows="3"
					class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#1d6ee5]"
				></textarea>
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			ইনভয়েস সেটিংস সংরক্ষণ
		</Button>
	</Card>
</div>
