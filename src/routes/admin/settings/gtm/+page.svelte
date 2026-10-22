<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Tag, Check } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('GTM & Analytics Settings Saved!');

	let gtmContainerId = $state('GTM-W8L9P2');
	let ga4MeasurementId = $state('G-XXXXXXXXXX');
	let enableDataLayer = $state(true);
	let enableEcommerceEvents = $state(true);

	function triggerSave(msg = 'GTM & Analytics Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Tag Manager & Analytics | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-2xl mx-auto">
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
			onclick={() => triggerSave('GTM & Analytics Settings Saved!')}
			class="gap-1.5 bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Changes</span>
		</Button>
	</div>

	<Card class="p-6 sm:p-8 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl">
		<div class="flex items-start gap-4 pb-4 border-b border-slate-100">
			<div class="w-12 h-12 rounded-full bg-[#1d6ee5] flex items-center justify-center text-white shrink-0 shadow-sm">
				<Tag class="w-6 h-6" />
			</div>
			<div>
				<h3 class="font-bold text-slate-900 text-base">Google Tag Manager & Analytics</h3>
				<p class="text-xs text-slate-500 mt-0.5">
					GTM Container ID, GA4 Measurement ID এবং E-commerce DataLayer ইভেন্ট কনফিগারেশন
				</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="space-y-1.5">
				<label for="gtm-id" class="text-xs font-bold text-slate-700 block">Google Tag Manager ID</label>
				<Input
					id="gtm-id"
					type="text"
					bind:value={gtmContainerId}
					placeholder="GTM-XXXXXXX"
					class="font-mono text-xs"
				/>
				<span class="text-[11px] text-slate-400 block">আপনার GTM কন্টেইনার আইডি প্রদান করুন</span>
			</div>

			<div class="space-y-1.5">
				<label for="ga4-id" class="text-xs font-bold text-slate-700 block">Google Analytics 4 (GA4) Measurement ID</label>
				<Input
					id="ga4-id"
					type="text"
					bind:value={ga4MeasurementId}
					placeholder="G-XXXXXXXXXX"
					class="font-mono text-xs"
				/>
			</div>

			<div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
				<div>
					<span class="text-xs text-slate-800 font-bold block">Push Standard window.dataLayer</span>
					<span class="text-[11px] text-slate-500">Enable default dataLayer initialization</span>
				</div>
				<Switch bind:checked={enableDataLayer} />
			</div>

			<div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
				<div>
					<span class="text-xs text-slate-800 font-bold block">Enhanced Ecommerce Events</span>
					<span class="text-[11px] text-slate-500">Auto push view_item, begin_checkout, and purchase events</span>
				</div>
				<Switch bind:checked={enableEcommerceEvents} />
			</div>

			<Button
				type="button"
				onclick={() => triggerSave('GTM & Analytics Settings Saved!')}
				class="w-full bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
			>
				Save Tag Manager Settings
			</Button>
		</div>
	</Card>
</div>
