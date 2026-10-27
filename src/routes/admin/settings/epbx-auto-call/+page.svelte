<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, PhoneCall } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('ePBX Settings Saved!');

	let enableAutoCall = $state(true);
	let ivrProvider = $state('bangladesh_epbx');
	let apiUrl = $state('https://api.epbx.com.bd/v1/call');
	let authToken = $state('epbx_token_83921849');
	let retryAttempts = $state(2);
	let promptAudioUrl = $state('/audio/order-confirm-ivr.mp3');

	function triggerSave(msg = 'ePBX Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>ePBX Auto Call Settings | AURA Enterprise</title>
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
				<PhoneCall class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">ePBX Auto Call কনফিগারেশন</h3>
				<p class="text-xs text-slate-500">গ্রাহকের কাছে স্বয়ংক্রিয় ভয়েস কল পাঠিয়ে ১ ও ২ চেপে অর্ডার কনফার্মেশন</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
				<div>
					<h4 class="text-xs font-bold text-slate-900">স্বয়ংক্রিয় আইভিআর কল সক্রিয় রাখুন</h4>
					<p class="text-[11px] text-slate-500">নতুন অর্ডার আসার ৩ মিনিটের মধ্যে কাস্টমারকে কল করা হবে</p>
				</div>
				<Switch bind:checked={enableAutoCall} />
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">ePBX API এন্ডপয়েন্ট</label>
					<Input type="text" bind:value={apiUrl} class="font-mono text-xs" />
				</div>
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">কল না ধরলে পুনরায় চেষ্টা (বার)</label>
					<Input type="number" bind:value={retryAttempts} class="font-mono text-sm" />
				</div>
			</div>

			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-700">Auth Token / API Secret</label>
				<Input type="password" bind:value={authToken} class="font-mono text-sm" />
			</div>

			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-700">আইভিআর অডিও প্রম্পট ফাইল URL</label>
				<Input type="text" bind:value={promptAudioUrl} class="font-mono text-xs" />
				<span class="text-[11px] text-slate-400">অডিও ফরম্যাট: MP3 বা WAV</span>
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			অটো কল গেটওয়ে সংরক্ষণ
		</Button>
	</Card>
</div>
