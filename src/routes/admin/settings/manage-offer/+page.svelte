<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Tag, Check, Plus, Trash2 } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Offers Settings Saved!');

	let enableCoupons = $state(true);
	let enableBundleDiscounts = $state(true);
	let enableTopNotificationBar = $state(true);
	let topNotificationText = $state('🔥 আজকের স্পেশাল অফার: ২টা অর্ডার করলে ফ্রি ডেলিভারি!');

	function triggerSave(msg = 'Offers Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Manage Offers | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-3xl mx-auto">
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
			onclick={() => triggerSave('Offers Settings Saved!')}
			class="gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Offers</span>
		</Button>
	</div>

	<Card class="p-6 sm:p-8 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl">
		<div class="flex items-start gap-4 pb-4 border-b border-slate-100">
			<div class="w-12 h-12 rounded-full bg-[#f97316] flex items-center justify-center text-white shrink-0 shadow-sm">
				<Tag class="w-6 h-6" />
			</div>
			<div>
				<h3 class="font-bold text-slate-900 text-base">Manage Offers & Coupons</h3>
				<p class="text-xs text-slate-500 mt-0.5">
					ডিসকাউন্ট কুপন, বান্ডেল ডিল ও টপ ব্যানার নোটিফিকেশন নিয়ন্ত্রণ
				</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
				<div>
					<span class="text-xs text-slate-800 font-bold block">Enable Coupon Codes on Checkout</span>
					<span class="text-[11px] text-slate-500">Allow customers to apply promo codes</span>
				</div>
				<Switch bind:checked={enableCoupons} />
			</div>

			<div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
				<div>
					<span class="text-xs text-slate-800 font-bold block">Enable Multi-Product Bundle Discounts</span>
					<span class="text-[11px] text-slate-500">Show buy 2 get 10% off automated tier discounts</span>
				</div>
				<Switch bind:checked={enableBundleDiscounts} />
			</div>

			<div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
				<div>
					<span class="text-xs text-slate-800 font-bold block">Top Announcement Bar</span>
					<span class="text-[11px] text-slate-500">Show animated offer banner at the top of landing page</span>
				</div>
				<Switch bind:checked={enableTopNotificationBar} />
			</div>

			{#if enableTopNotificationBar}
				<div class="space-y-1.5 pt-2">
					<label for="banner-text" class="text-xs font-bold text-slate-700 block">Offer Banner Message</label>
					<Input
						id="banner-text"
						type="text"
						bind:value={topNotificationText}
						class="text-xs"
					/>
				</div>
			{/if}

			<Button
				type="button"
				onclick={() => triggerSave('Offers Settings Saved!')}
				class="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold"
			>
				Save Offer Settings
			</Button>
		</div>
	</Card>
</div>
