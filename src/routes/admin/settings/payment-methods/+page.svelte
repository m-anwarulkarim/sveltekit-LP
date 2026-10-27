<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, CreditCard } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Payment Methods Saved!');

	let enableCOD = $state(true);
	let enableBkash = $state(true);
	let bkashAppKey = $state('bkash_live_app_key_83921');
	let bkashAppSecret = $state('bkash_live_app_secret_99482');
	let enableNagad = $state(true);
	let nagadMerchantId = $state('6839201948');
	let enableRocket = $state(false);
	let enableSSLCommerz = $state(false);
	let sslStoreId = $state('');

	function triggerSave(msg = 'Payment Methods Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Payment Methods | AURA Enterprise</title>
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
			<span>Save Gateways</span>
		</Button>
	</div>

	<Card class="p-6 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center gap-3 pb-3 border-b border-slate-100">
			<div class="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center text-white">
				<CreditCard class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">পেমেন্ট গেটওয়ে কনফিগারেশন</h3>
				<p class="text-xs text-slate-500">ক্যাশ অন ডেলিভারি, বিকাশ, নগদ ও অনলাইন পেমেন্ট মেথড ম্যানেজ করুন</p>
			</div>
		</div>

		<div class="space-y-4">
			<!-- 1. COD -->
			<div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
				<div>
					<h4 class="text-xs font-bold text-slate-900">Cash on Delivery (ক্যাশ অন ডেলিভারি)</h4>
					<p class="text-[11px] text-slate-500">পণ্য হাতে পেয়ে মূল্য পরিশোধ</p>
				</div>
				<Switch bind:checked={enableCOD} />
			</div>

			<!-- 2. bKash -->
			<div class="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-3">
				<div class="flex items-center justify-between">
					<div>
						<h4 class="text-xs font-bold text-pink-900">bKash Payment Gateway</h4>
						<p class="text-[11px] text-pink-700">বিকাশ অনলাইন পেমেন্ট এপিআই</p>
					</div>
					<Switch bind:checked={enableBkash} />
				</div>
				{#if enableBkash}
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
						<div>
							<label class="text-[11px] font-bold text-slate-600 block mb-1">bKash App Key</label>
							<Input type="text" bind:value={bkashAppKey} class="font-mono text-xs" />
						</div>
						<div>
							<label class="text-[11px] font-bold text-slate-600 block mb-1">bKash App Secret</label>
							<Input type="password" bind:value={bkashAppSecret} class="font-mono text-xs" />
						</div>
					</div>
				{/if}
			</div>

			<!-- 3. Nagad -->
			<div class="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-3">
				<div class="flex items-center justify-between">
					<div>
						<h4 class="text-xs font-bold text-orange-900">Nagad Payment Gateway</h4>
						<p class="text-[11px] text-orange-700">নগদ অনলাইন গেটওয়ে</p>
					</div>
					<Switch bind:checked={enableNagad} />
				</div>
				{#if enableNagad}
					<div class="pt-2">
						<label class="text-[11px] font-bold text-slate-600 block mb-1">Nagad Merchant ID</label>
						<Input type="text" bind:value={nagadMerchantId} class="font-mono text-xs max-w-sm" />
					</div>
				{/if}
			</div>

			<!-- 4. SSLCommerz -->
			<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
				<div class="flex items-center justify-between">
					<div>
						<h4 class="text-xs font-bold text-slate-900">SSLCommerz (কার্ড / নেট ব্যাংকিং)</h4>
						<p class="text-[11px] text-slate-500">ভিসা, মাস্টারকার্ড ও সকল বাংলাদেশি ব্যাংক</p>
					</div>
					<Switch bind:checked={enableSSLCommerz} />
				</div>
				{#if enableSSLCommerz}
					<div class="pt-2">
						<label class="text-[11px] font-bold text-slate-600 block mb-1">SSLCommerz Store ID</label>
						<Input type="text" bind:value={sslStoreId} placeholder="Store ID লিখুন" class="font-mono text-xs max-w-sm" />
					</div>
				{/if}
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold"
		>
			পেমেন্ট মেথড সংরক্ষণ
		</Button>
	</Card>
</div>
