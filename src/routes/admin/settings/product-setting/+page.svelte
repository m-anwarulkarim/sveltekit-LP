<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Settings, Check } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Product Settings Saved!');

	let lowStockThreshold = $state(5);
	let autoMarkOutOfStock = $state(true);
	let showStockRemainingBadge = $state(true);
	let enableSkuGeneration = $state(true);
	let skuPrefix = $state('AUR-');

	function triggerSave(msg = 'Product Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Product Settings | AURA Enterprise</title>
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
			onclick={() => triggerSave('Product Settings Saved!')}
			class="gap-1.5 bg-[#10b981] hover:bg-[#059669] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Settings</span>
		</Button>
	</div>

	<Card class="p-6 sm:p-8 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl">
		<div class="flex items-start gap-4 pb-4 border-b border-slate-100">
			<div class="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center text-white shrink-0 shadow-sm">
				<Settings class="w-6 h-6" />
			</div>
			<div>
				<h3 class="font-bold text-slate-900 text-base">Product & Inventory Settings</h3>
				<p class="text-xs text-slate-500 mt-0.5">
					ইনভেন্টরি অ্যালার্ট, স্টক শেষ হওয়ার স্বয়ংক্রিয় হ্যান্ডলিং ও SKU পলিসি
				</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="space-y-1.5">
				<label for="low-stock" class="text-xs font-bold text-slate-700 block">Low Stock Alert Threshold</label>
				<Input
					id="low-stock"
					type="number"
					bind:value={lowStockThreshold}
					class="font-mono text-sm max-w-xs"
				/>
				<span class="text-[11px] text-slate-400 block">স্টক এই সংখ্যার নিচে নামলে অ্যাডমিনে লাল ওয়ার্নিং অ্যালার্ট আসবে</span>
			</div>

			<div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
				<div>
					<span class="text-xs text-slate-800 font-bold block">Auto Mark as Out of Stock</span>
					<span class="text-[11px] text-slate-500">স্টক ০ হলে স্বয়ংক্রিয়ভাবে অর্ডার নেওয়া বন্ধ হবে</span>
				</div>
				<Switch bind:checked={autoMarkOutOfStock} />
			</div>

			<div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
				<div>
					<span class="text-xs text-slate-800 font-bold block">Show 'Only X Left' Urgency Badge</span>
					<span class="text-[11px] text-slate-500">ল্যান্ডিং পেজে গ্রাহকদের দ্রুত অর্ডারে উৎসাহিত করতে বাকি স্টক দেখান</span>
				</div>
				<Switch bind:checked={showStockRemainingBadge} />
			</div>

			<div class="space-y-1.5 pt-2 border-t border-slate-100">
				<label for="sku-prefix" class="text-xs font-bold text-slate-700 block">Automatic SKU Prefix</label>
				<Input
					id="sku-prefix"
					type="text"
					bind:value={skuPrefix}
					class="font-mono text-xs max-w-xs uppercase"
				/>
			</div>

			<Button
				type="button"
				onclick={() => triggerSave('Product Settings Saved!')}
				class="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold"
			>
				Save Product Settings
			</Button>
		</div>
	</Card>
</div>
