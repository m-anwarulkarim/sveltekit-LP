<script lang="ts">
	import { Button } from '#lib/components/ui/button';
	import { Card, CardContent } from '#lib/components/ui/card';
	import { Input } from '#lib/components/ui/input';
	import { Badge } from '#lib/components/ui/badge';
	import { ArrowLeft, CheckCircle2, Truck, Check, Loader2, Sparkles, MapPin, ShieldCheck, HelpCircle } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { data }: { data: any } = $props();

	let deliveryDhaka = $state(data?.deliveryConfig?.insideDhakaCharge ?? 60);
	let deliveryOutsideDhaka = $state(data?.deliveryConfig?.outsideDhakaCharge ?? 120);
	let deliverySubArea = $state(data?.deliveryConfig?.subAreaCharge ?? 100);
	let enableFreeDeliveryAbove = $state(data?.deliveryConfig?.enableFreeDelivery ?? false);
	let freeDeliveryThreshold = $state(data?.deliveryConfig?.freeShippingThreshold ?? 2000);

	$effect(() => {
		if (data?.deliveryConfig) {
			deliveryDhaka = data.deliveryConfig.insideDhakaCharge ?? 60;
			deliveryOutsideDhaka = data.deliveryConfig.outsideDhakaCharge ?? 120;
			deliverySubArea = data.deliveryConfig.subAreaCharge ?? 100;
			enableFreeDeliveryAbove = data.deliveryConfig.enableFreeDelivery ?? false;
			freeDeliveryThreshold = data.deliveryConfig.freeShippingThreshold ?? 2000;
		}
	});

	let isSaving = $state(false);
</script>

<svelte:head>
	<title>ডেলিভারি চার্জ সেটিংস | seedbd Admin</title>
</svelte:head>

<div class="space-y-6 max-w-4xl mx-auto font-['Anek_Bangla',sans-serif] p-4 sm:p-6 lg:p-8">
	<!-- Top Bar -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
		<div class="flex items-center gap-3">
			<a href="/admin/settings">
				<Button variant="outline" size="sm" class="gap-2 rounded-xl h-9">
					<ArrowLeft class="w-4 h-4" />
					<span>সেটিংস তালিকায় ফিরুন</span>
				</Button>
			</a>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">ডেলিভারি চার্জ নির্ধারণ</h1>
				<p class="text-xs text-slate-500 mt-0.5">গ্রাহকের চেকআউটের জন্য এলাকাভিত্তিক শিপিং চার্জ ও ফ্রি শিপিং পলিসি সেট করুন</p>
			</div>
		</div>
	</div>

	<form
		method="POST"
		action="?/saveCharges"
		use:enhance={() => {
			isSaving = true;
			return async ({ result, update }) => {
				isSaving = false;
				if (result.type === 'success') {
					toast.success('ডেলিভারি চার্জ সেটিংস সফলভাবে ডাটাবেসে সংরক্ষিত হয়েছে');
				} else {
					toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
				}
				await update();
			};
		}}
		class="space-y-6"
	>
		<input type="hidden" name="enableFreeDelivery" value={enableFreeDeliveryAbove ? 'true' : 'false'} />

		<!-- Main Delivery Charge Card -->
		<Card class="bg-white border border-slate-200/90 shadow-xs rounded-3xl overflow-hidden">
			<CardContent class="p-6 space-y-6">
				<div class="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
							<Truck class="w-5 h-5" />
						</div>
						<div>
							<h3 class="text-base font-bold text-slate-900">এলাকাভিত্তিক শিপিং রেট</h3>
							<p class="text-xs text-slate-500">ঢাকার ভেতরে, উপ-শহর এবং ঢাকার বাইরের ডেলিভারি চার্জ নির্ধারণ করুন</p>
						</div>
					</div>

					<Badge variant="outline" class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
						100% Live DB
					</Badge>
				</div>

				<!-- 3 Rate Inputs Grid -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<!-- Inside Dhaka -->
					<div class="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-2 hover:border-indigo-200 transition-colors">
						<div class="flex items-center justify-between">
							<label for="inside-dhaka" class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
								<MapPin class="w-3.5 h-3.5 text-indigo-600" />
								<span>ঢাকার ভেতরে (৳)</span>
							</label>
							<Badge variant="secondary" class="text-[10px] font-bold">Dhaka Metro</Badge>
						</div>
						<div class="relative">
							<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">৳</span>
							<Input
								id="inside-dhaka"
								name="insideDhakaCharge"
								type="number"
								min="0"
								step="1"
								required
								bind:value={deliveryDhaka}
								class="pl-8 font-mono text-base font-black text-slate-900 h-11 rounded-xl bg-white"
							/>
						</div>
						<p class="text-[11px] text-slate-400">ঢাকা সিটির অভ্যন্তরে হোম ডেলিভারি রেট</p>
					</div>

					<!-- Sub Area / Upashohor -->
					<div class="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-2 hover:border-indigo-200 transition-colors">
						<div class="flex items-center justify-between">
							<label for="sub-area" class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
								<MapPin class="w-3.5 h-3.5 text-amber-600" />
								<span>উপ-শহর / সাব-এরিয়া (৳)</span>
							</label>
							<Badge variant="secondary" class="text-[10px] font-bold">Sub-Urban</Badge>
						</div>
						<div class="relative">
							<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">৳</span>
							<Input
								id="sub-area"
								name="subAreaCharge"
								type="number"
								min="0"
								step="1"
								required
								bind:value={deliverySubArea}
								class="pl-8 font-mono text-base font-black text-slate-900 h-11 rounded-xl bg-white"
							/>
						</div>
						<p class="text-[11px] text-slate-400">সাভার, কেরানীগঞ্জ, টঙ্গী, নারায়ণগঞ্জ, গাজীপুর ইত্যাদি</p>
					</div>

					<!-- Outside Dhaka -->
					<div class="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-2 hover:border-indigo-200 transition-colors">
						<div class="flex items-center justify-between">
							<label for="outside-dhaka" class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
								<MapPin class="w-3.5 h-3.5 text-rose-600" />
								<span>ঢাকার বাইরে (৳)</span>
							</label>
							<Badge variant="secondary" class="text-[10px] font-bold">All Districts</Badge>
						</div>
						<div class="relative">
							<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">৳</span>
							<Input
								id="outside-dhaka"
								name="outsideDhakaCharge"
								type="number"
								min="0"
								step="1"
								required
								bind:value={deliveryOutsideDhaka}
								class="pl-8 font-mono text-base font-black text-slate-900 h-11 rounded-xl bg-white"
							/>
						</div>
						<p class="text-[11px] text-slate-400">সমগ্র বাংলাদেশের অন্যান্য সকল জেলা ও থানার রেট</p>
					</div>
				</div>

				<!-- Free Delivery Threshold Section -->
				<div class="pt-5 border-t border-slate-100 space-y-4">
					<div class="flex items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
						<div class="space-y-0.5">
							<div class="text-sm font-bold text-slate-900 flex items-center gap-2">
								<Sparkles class="w-4 h-4 text-indigo-600" />
								<span>নির্দিষ্ট পরিমাণের অর্ডারে ফ্রি ডেলিভারি অফার</span>
							</div>
							<p class="text-xs text-slate-500">গ্রাহকের কার্ট টোটাল নির্দিষ্ট টাকার বেশি হলে ডেলিভারি চার্জ স্বয়ংক্রিয়ভাবে ৳০ (ফ্রি) হয়ে যাবে</p>
						</div>
						<button
							type="button"
							onclick={() => (enableFreeDeliveryAbove = !enableFreeDeliveryAbove)}
							class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer {enableFreeDeliveryAbove ? 'bg-indigo-600' : 'bg-slate-300'}"
						>
							<span
								class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {enableFreeDeliveryAbove ? 'translate-x-6' : 'translate-x-1'}"
							></span>
						</button>
					</div>

					{#if enableFreeDeliveryAbove}
						<div class="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 max-w-sm animate-in fade-in slide-in-from-top-1">
							<label for="threshold" class="text-xs font-bold text-slate-700 block">সর্বনিম্ন কতো টাকার অর্ডারে ডেলিভারি ফ্রি হবে? (৳)</label>
							<div class="relative">
								<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">৳</span>
								<Input
									id="threshold"
									name="freeShippingThreshold"
									type="number"
									min="1"
									bind:value={freeDeliveryThreshold}
									class="pl-8 font-mono text-base font-black text-indigo-600 h-10 rounded-xl"
								/>
							</div>
							<p class="text-[11px] text-slate-400">যেমন: ৳২,০০০ বা তার বেশি অর্ডারে পুরো ডেলিভারি ফ্রি</p>
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>

		<!-- Live Calculation Preview Card for Admin Verification -->
		<Card class="bg-slate-50/80 border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
			<CardContent class="p-6 space-y-4">
				<div class="flex items-center gap-2 pb-2 border-b border-slate-200/70">
					<ShieldCheck class="w-4 h-4 text-indigo-600" />
					<h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">চেকআউট প্রিভিউ (গ্রাহক যেভাবে হিসাব দেখবে)</h4>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
					<div class="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
						<div class="font-bold text-slate-700">ঢাকার ভেতরে:</div>
						<div class="text-slate-500">পণ্য: ৳১,০০০</div>
						<div class="text-slate-500">ডেলিভারি: <strong class="text-slate-900 font-mono">৳{deliveryDhaka}</strong></div>
						<div class="pt-1 border-t border-slate-100 font-black text-indigo-600 font-mono">
							মোট: ৳{(1000 + Number(deliveryDhaka)).toLocaleString('en-BD')}
						</div>
					</div>

					<div class="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
						<div class="font-bold text-slate-700">উপ-শহরে:</div>
						<div class="text-slate-500">পণ্য: ৳১,০০০</div>
						<div class="text-slate-500">ডেলিভারি: <strong class="text-slate-900 font-mono">৳{deliverySubArea}</strong></div>
						<div class="pt-1 border-t border-slate-100 font-black text-indigo-600 font-mono">
							মোট: ৳{(1000 + Number(deliverySubArea)).toLocaleString('en-BD')}
						</div>
					</div>

					<div class="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
						<div class="font-bold text-slate-700">ঢাকার বাইরে:</div>
						<div class="text-slate-500">পণ্য: ৳১,০০০</div>
						<div class="text-slate-500">ডেলিভারি: <strong class="text-slate-900 font-mono">৳{deliveryOutsideDhaka}</strong></div>
						<div class="pt-1 border-t border-slate-100 font-black text-indigo-600 font-mono">
							মোট: ৳{(1000 + Number(deliveryOutsideDhaka)).toLocaleString('en-BD')}
						</div>
					</div>
				</div>

				{#if enableFreeDeliveryAbove}
					<div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
						<CheckCircle2 class="w-4 h-4 text-emerald-600 flex-shrink-0" />
						<span>
							অর্ডারের মূল্য <strong>৳{freeDeliveryThreshold.toLocaleString('en-BD')}</strong> বা তার বেশি হলে যেকোনো এলাকার জন্যই ডেলিভারি <strong>সম্পূর্ণ ফ্রি (৳০)</strong> হবে।
						</span>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Bottom Submit Button -->
		<div class="flex items-center justify-end gap-3 pt-2">
			<a href="/admin/settings">
				<Button type="button" variant="outline" class="rounded-xl h-11 px-5 text-xs font-bold">
					বাতিল
				</Button>
			</a>
			<Button
				type="submit"
				disabled={isSaving}
				class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-8 rounded-xl shadow-sm text-xs gap-2"
			>
				{#if isSaving}
					<Loader2 class="w-4 h-4 animate-spin" />
					<span>সংরক্ষণ হচ্ছে...</span>
				{:else}
					<Check class="w-4 h-4" />
					<span>ডেলিভারি চার্জ সংরক্ষণ করুন</span>
				{/if}
			</Button>
		</div>
	</form>
</div>
