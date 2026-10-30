<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, MessageSquare } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('SMS Gateway Settings Saved!');

	let smsProvider = $state('greenweb');
	let apiKey = $state('');
	let senderId = $state('');
	let sendOnNewOrder = $state(false);
	let sendOnShipping = $state(false);
	let sendOnDelivery = $state(false);
	let newOrderTemplate = $state('প্রিয় {customer_name}, আপনার অর্ডার #{order_id} সফলভাবে গৃহীত হয়েছে। মোট মূল্য: ৳{amount}। ধন্যবাদ!');

	function triggerSave(msg = 'SMS Gateway Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>SMS Gateway Settings | AURA Enterprise</title>
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
				<MessageSquare class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">SMS গেটওয়ে কনফিগারেশন</h3>
				<p class="text-xs text-slate-500">অর্ডার প্লেস, ডেলিভারি ও ওটিপি ভেরিফিকেশনের স্বয়ংক্রিয় এসএমএস সেটআপ</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">এসএমএস প্রোভাইডার</label>
					<select
						bind:value={smsProvider}
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#f97316]"
					>
						<option value="greenweb">Greenweb SMS Gateway</option>
						<option value="bulksmsbd">BulkSMSBD</option>
						<option value="onnorokom">Onnorokom SMS</option>
						<option value="mimsms">MiMSMS Gateway</option>
					</select>
				</div>

				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">Sender ID / Masking Name</label>
					<Input type="text" bind:value={senderId} class="font-mono text-sm" />
				</div>
			</div>

			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-700">API Key / Auth Token</label>
				<Input type="password" bind:value={apiKey} class="font-mono text-sm" />
			</div>

			<div class="pt-2 border-t border-slate-100 space-y-3">
				<h4 class="text-xs font-bold text-slate-800">অটোমেটিক এসএমএস ট্রিগার</h4>

				<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
					<span class="text-xs font-medium text-slate-700">নতুন অর্ডারে গ্রাহককে কনফার্মেশন এসএমএস পাঠানো</span>
					<Switch bind:checked={sendOnNewOrder} />
				</div>

				<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
					<span class="text-xs font-medium text-slate-700">পার্সেল কুরিয়ারে শিফট হলে ট্র্যাকিং আইডি সহ এসএমএস</span>
					<Switch bind:checked={sendOnShipping} />
				</div>

				<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
					<span class="text-xs font-medium text-slate-700">সফল ডেলিভারির পর গ্রাহককে ধন্যবাদ এসএমএস</span>
					<Switch bind:checked={sendOnDelivery} />
				</div>
			</div>

			<div class="space-y-1.5 pt-2">
				<label class="text-xs font-bold text-slate-700">নতুন অর্ডার এসএমএস টেমপ্লেট</label>
				<textarea
					bind:value={newOrderTemplate}
					rows="3"
					class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#f97316]"
				></textarea>
				<span class="text-[11px] text-slate-400">ট্যাগ: {'{customer_name}'}, {'{order_id}'}, {'{amount}'}</span>
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold"
		>
			এসএমএস সেটিংস সংরক্ষণ
		</Button>
	</Card>
</div>
