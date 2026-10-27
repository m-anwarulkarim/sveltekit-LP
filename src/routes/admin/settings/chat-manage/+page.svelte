<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, MessageCircle } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Chat Settings Saved!');

	let enableWhatsApp = $state(true);
	let whatsappNumber = $state('+8801860229546');
	let whatsappDefaultMessage = $state('হ্যালো! প্রোডাক্ট সম্পর্কে বিস্তারিত জানতে চাই।');
	let buttonPosition = $state<'bottom-right' | 'bottom-left'>('bottom-right');

	let enableMessenger = $state(true);
	let messengerPageId = $state('109283910293847');

	let enableTawkTo = $state(false);
	let tawkPropertyId = $state('');

	function triggerSave(msg = 'Chat Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Chat Manage | AURA Enterprise</title>
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
				<MessageCircle class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">Chat Manage কনফিগারেশন</h3>
				<p class="text-xs text-slate-500">হোয়াটসঅ্যাপ ফ্লোটিং বাটন, মেসেঞ্জার এবং লাইভ চ্যাট উইজেট সেটআপ</p>
			</div>
		</div>

		<div class="space-y-4">
			<!-- WhatsApp Chat -->
			<div class="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
				<div class="flex items-center justify-between">
					<div>
						<h4 class="text-xs font-bold text-emerald-900">WhatsApp Floating Chat</h4>
						<p class="text-[11px] text-emerald-700">ওয়েবসাইটে হোয়াটসঅ্যাপ সরাসরি চ্যাট বাটন</p>
					</div>
					<Switch bind:checked={enableWhatsApp} />
				</div>
				{#if enableWhatsApp}
					<div class="space-y-3 pt-2">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<label class="text-[11px] font-bold text-slate-600 block mb-1">WhatsApp নম্বর (কান্ট্রি কোড সহ)</label>
								<Input type="text" bind:value={whatsappNumber} class="font-mono text-xs" />
							</div>
							<div>
								<label class="text-[11px] font-bold text-slate-600 block mb-1">বাটনের অবস্থান</label>
								<select
									bind:value={buttonPosition}
									class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
								>
									<option value="bottom-right">Bottom Right (নিচে ডানে)</option>
									<option value="bottom-left">Bottom Left (নিচে বামে)</option>
								</select>
							</div>
						</div>
						<div>
							<label class="text-[11px] font-bold text-slate-600 block mb-1">ডিফল্ট মেসেজ</label>
							<Input type="text" bind:value={whatsappDefaultMessage} class="text-xs" />
						</div>
					</div>
				{/if}
			</div>

			<!-- Facebook Messenger -->
			<div class="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
				<div class="flex items-center justify-between">
					<div>
						<h4 class="text-xs font-bold text-blue-900">Facebook Messenger Chat</h4>
						<p class="text-[11px] text-blue-700">ফেসবুক পেজ ইনবক্স চ্যাট প্লাগইন</p>
					</div>
					<Switch bind:checked={enableMessenger} />
				</div>
				{#if enableMessenger}
					<div class="pt-2">
						<label class="text-[11px] font-bold text-slate-600 block mb-1">Facebook Page ID</label>
						<Input type="text" bind:value={messengerPageId} class="font-mono text-xs max-w-sm" />
					</div>
				{/if}
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			চ্যাট সেটিংস সংরক্ষণ
		</Button>
	</Card>
</div>
