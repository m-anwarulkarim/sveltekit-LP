<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, Tag } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('GTM & Data Layer Settings Saved!');

	let gtmId = $state('GTM-K89372X');
	let ga4MeasurementId = $state('G-984729184');
	let enableDataLayer = $state(true);
	let trackAddToCart = $state(true);
	let trackCheckout = $state(true);
	let trackPurchase = $state(true);

	function triggerSave(msg = 'GTM & Data Layer Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Tag Manager & Data Layer | AURA Enterprise</title>
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
			<span>Save GTM</span>
		</Button>
	</div>

	<Card class="p-6 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center gap-3 pb-3 border-b border-slate-100">
			<div class="w-10 h-10 rounded-full bg-[#1d6ee5] flex items-center justify-center text-white">
				<Tag class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">Tag Manager, Analytics and Data Layer</h3>
				<p class="text-xs text-slate-500">Google Tag Manager ও ই-কমার্স ডেটালেয়ার ট্র্যাকিং সেটআপ</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-700">Google Tag Manager Container ID</label>
				<Input type="text" bind:value={gtmId} placeholder="GTM-XXXXXXX" class="font-mono text-sm" />
			</div>

			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-700">Google Analytics 4 Measurement ID</label>
				<Input type="text" bind:value={ga4MeasurementId} placeholder="G-XXXXXXXXXX" class="font-mono text-sm" />
			</div>

			<div class="pt-2 border-t border-slate-100 space-y-3">
				<h4 class="text-xs font-bold text-slate-800">Enhanced E-commerce Events</h4>

				<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
					<div>
						<span class="text-xs font-bold text-slate-900">add_to_cart ইভেন্ট ট্র্যাকিং</span>
						<p class="text-[11px] text-slate-500">কার্টে পণ্য যুক্ত করার ইভেন্ট পুশ</p>
					</div>
					<Switch bind:checked={trackAddToCart} />
				</div>

				<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
					<div>
						<span class="text-xs font-bold text-slate-900">begin_checkout ইভেন্ট ট্র্যাকিং</span>
						<p class="text-[11px] text-slate-500">চেকআউট ফর্ম খোলার ইভেন্ট</p>
					</div>
					<Switch bind:checked={trackCheckout} />
				</div>

				<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
					<div>
						<span class="text-xs font-bold text-slate-900">purchase ইভেন্ট ট্র্যাকিং</span>
						<p class="text-[11px] text-slate-500">সফল অর্ডারের মোট মূল্য ও আইটেমসহ ডেটালেয়ারে প্রেরণ</p>
					</div>
					<Switch bind:checked={trackPurchase} />
				</div>
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			ট্যাগ ম্যানেজার কনফিগারেশন সংরক্ষণ
		</Button>
	</Card>
</div>
