<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Truck, Check } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Delivery Charge Settings Saved!');

	let deliveryDhaka = $state(60);
	let deliveryOutsideDhaka = $state(120);
	let deliverySubArea = $state(100);
	let enableFreeDeliveryAbove = $state(false);
	let freeDeliveryThreshold = $state(2000);

	function triggerSave(msg = 'Delivery Charge Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Delivery Charge | AURA Enterprise</title>
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
			onclick={() => triggerSave('Delivery Charge Settings Saved!')}
			class="gap-1.5 bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Charges</span>
		</Button>
	</div>

	<Card class="p-6 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl">
		<div class="flex items-center gap-3 pb-3 border-b border-slate-100">
			<div class="w-10 h-10 rounded-full bg-[#1d6ee5] flex items-center justify-center text-white">
				<Truck class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">ডেলিভারি চার্জ নির্ধারণ</h3>
				<p class="text-xs text-slate-500">ঢাকার ভেতরে, উপ-শহর ও ঢাকার বাইরে শিপিং রেট সেট করুন</p>
			</div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div class="space-y-1.5">
				<label for="dhaka" class="text-xs font-bold text-slate-700">ঢাকার ভেতরে চার্জ (৳)</label>
				<Input
					id="dhaka"
					type="number"
					bind:value={deliveryDhaka}
					class="font-mono text-sm"
				/>
				<span class="text-[11px] text-slate-400">ঢাকা সিটির অভ্যন্তরীণ ডেলিভারি রেট</span>
			</div>

			<div class="space-y-1.5">
				<label for="outside-dhaka" class="text-xs font-bold text-slate-700">ঢাকার বাইরে চার্জ (৳)</label>
				<Input
					id="outside-dhaka"
					type="number"
					bind:value={deliveryOutsideDhaka}
					class="font-mono text-sm"
				/>
				<span class="text-[11px] text-slate-400">সমগ্র বাংলাদেশের অন্যান্য জেলার রেট</span>
			</div>

			<div class="space-y-1.5 sm:col-span-2">
				<label for="sub-area" class="text-xs font-bold text-slate-700">সাব-এরিয়া / উপ-শহর চার্জ (৳)</label>
				<Input
					id="sub-area"
					type="number"
					bind:value={deliverySubArea}
					class="font-mono text-sm"
				/>
				<span class="text-[11px] text-slate-400">সাভার, কেরানীগঞ্জ, টঙ্গী, নারায়ণগঞ্জ ইত্যাদি এলাকার জন্য</span>
			</div>
		</div>

		<!-- Free delivery threshold -->
		<div class="pt-4 border-t border-slate-100 space-y-3">
			<div class="flex items-center justify-between gap-4">
				<div>
					<h4 class="text-sm font-bold text-slate-900">নির্দিষ্ট অর্ডারে ফ্রি ডেলিভারি</h4>
					<p class="text-xs text-slate-500">একটি নির্দিষ্ট টাকার বেশি অর্ডারে স্বয়ংক্রিয়ভাবে শিপিং চার্জ ফ্রি হবে</p>
				</div>
				<Switch bind:checked={enableFreeDeliveryAbove} />
			</div>

			{#if enableFreeDeliveryAbove}
				<div class="pt-2">
					<label for="threshold" class="text-xs font-bold text-slate-700 block mb-1">সর্বনিম্ন অর্ডার মূল্য (৳)</label>
					<Input
						id="threshold"
						type="number"
						bind:value={freeDeliveryThreshold}
						class="font-mono text-sm max-w-xs"
					/>
				</div>
			{/if}
		</div>

		<div class="pt-2">
			<Button
				type="button"
				onclick={() => triggerSave('Delivery Charge Settings Saved!')}
				class="w-full bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
			>
				Save Delivery Charges
			</Button>
		</div>
	</Card>
</div>
