<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Input, Textarea, Switch, Badge } from '#lib/components/ui';
	import {
		ArrowLeft,
		CheckCircle2,
		Check,
		Banknote,
		ShieldAlert,
		AlertCircle,
		Loader2,
		Smartphone,
		Clock,
		Sparkles,
		Eye,
		Coins,
		Percent
	} from 'lucide-svelte';

	let { data, form } = $props();

	let isSaving = $state(false);
	let toast = $state<{ type: 'success' | 'error'; message: string } | null>(null);
	let toastTimer: any = null;

	let enableAdvancePayment = $state(Boolean(data?.advancePaymentConfig?.enableAdvancePayment));
	let advanceType = $state<'fixed' | 'percentage'>(
		data?.advancePaymentConfig?.advanceType === 'percentage' ? 'percentage' : 'fixed'
	);
	let advanceAmount = $state<number>(data?.advancePaymentConfig?.advanceAmount ?? 150);
	let onlyOutsideDhaka = $state(Boolean(data?.advancePaymentConfig?.onlyOutsideDhaka));
	let autoCancelMinutes = $state<number>(data?.advancePaymentConfig?.autoCancelMinutes ?? 30);
	let bkashNumber = $state<string>(data?.advancePaymentConfig?.bkashNumber || '');
	let nagadNumber = $state<string>(data?.advancePaymentConfig?.nagadNumber || '');
	let rocketNumber = $state<string>(data?.advancePaymentConfig?.rocketNumber || '');
	let instructions = $state<string>(
		data?.advancePaymentConfig?.instructions ||
			'অনুগ্রহ করে উল্লিখিত নাম্বারে সেন্ড মানি বা পেমেন্ট করে ট্রানজেকশন আইডি প্রদান করুন।'
	);

	function showToast(message: string, type: 'success' | 'error' = 'success') {
		if (toastTimer) clearTimeout(toastTimer);
		toast = { type, message };
		toastTimer = setTimeout(() => {
			toast = null;
		}, 3500);
	}

	// Watch server form response if non-JS fallback or direct post happens
	$effect(() => {
		if (form?.success) {
			showToast(form.message || 'অগ্রিম পেমেন্ট সেটিংস ডাটাবেসে সংরক্ষিত হয়েছে!');
		} else if (form?.message && !form?.success) {
			showToast(form.message, 'error');
		}
	});
</script>

<svelte:head>
	<title>Advance Payment সেটিংস | Haq Plus Admin</title>
</svelte:head>

<div class="space-y-6 max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
	<!-- Floating Toast Notification -->
	{#if toast}
		<div
			class="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 {toast.type ===
			'success'
				? 'bg-emerald-600 text-white'
				: 'bg-rose-600 text-white'}"
		>
			{#if toast.type === 'success'}
				<CheckCircle2 class="w-5 h-5 shrink-0 text-emerald-100" />
			{:else}
				<AlertCircle class="w-5 h-5 shrink-0 text-rose-100" />
			{/if}
			<span>{toast.message}</span>
		</div>
	{/if}

	<!-- Header Bar -->
	<div class="flex flex-wrap items-center justify-between gap-4 pb-2">
		<div class="flex items-center gap-3">
			<a href="/admin/settings">
				<Button variant="outline" size="sm" class="gap-2 rounded-xl text-slate-700 hover:bg-slate-100">
					<ArrowLeft class="w-4 h-4" />
					<span>সেটিংস মেনু</span>
				</Button>
			</a>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
					<span>অগ্রিম পেমেন্ট কনফিগারেশন</span>
					<Badge
						variant="outline"
						class="text-[11px] font-bold px-2 py-0.5 rounded-full {enableAdvancePayment
							? 'bg-emerald-50 text-emerald-700 border-emerald-200'
							: 'bg-slate-100 text-slate-500 border-slate-200'}"
					>
						{enableAdvancePayment ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
					</Badge>
				</h1>
				<p class="text-xs sm:text-sm text-slate-500 mt-0.5">
					ভুয়া অর্ডার ও রিটার্ন প্রতিরোধে কাস্টমারদের কাছ থেকে আংশিক বা ডেলিভারি ফি অগ্রিম গ্রহণ করুন
				</p>
			</div>
		</div>

		<Button
			type="submit"
			form="advance-payment-form"
			disabled={isSaving}
			class="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm px-5"
		>
			{#if isSaving}
				<Loader2 class="w-4 h-4 animate-spin" />
				<span>সংরক্ষণ হচ্ছে...</span>
			{:else}
				<Check class="w-4 h-4" />
				<span>পরিবর্তন সংরক্ষণ করুন</span>
			{/if}
		</Button>
	</div>

	<!-- Main Settings Form -->
	<form
		id="advance-payment-form"
		method="POST"
		action="?/save"
		use:enhance={() => {
			isSaving = true;
			return async ({ result, update }) => {
				isSaving = false;
				if (result.type === 'success') {
					showToast((result.data as any)?.message || 'অগ্রিম পেমেন্ট সেটিংস সংরক্ষিত হয়েছে!');
					await update({ reset: false });
				} else if (result.type === 'failure') {
					showToast((result.data as any)?.message || 'সংরক্ষণ ব্যর্থ হয়েছে!', 'error');
				}
			};
		}}
		class="space-y-6"
	>
		<!-- Hidden Inputs for Checkbox/Switch and Select Values -->
		<input type="hidden" name="enableAdvancePayment" value={enableAdvancePayment ? 'true' : 'false'} />
		<input type="hidden" name="advanceType" value={advanceType} />
		<input type="hidden" name="onlyOutsideDhaka" value={onlyOutsideDhaka ? 'true' : 'false'} />

		<Card class="p-6 sm:p-7 space-y-6 bg-white border border-slate-200/90 shadow-sm rounded-3xl">
			<!-- Header inside Card -->
			<div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
				<div
					class="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md {enableAdvancePayment
						? 'bg-emerald-600 shadow-emerald-500/20'
						: 'bg-slate-400 shadow-slate-400/20'}"
				>
					<Banknote class="w-6 h-6" />
				</div>
				<div>
					<h3 class="text-base sm:text-lg font-bold text-slate-900">Advance Payment নীতিমালা ও পরিমাণ</h3>
					<p class="text-xs text-slate-500">
						সিস্টেমের মাধ্যমে অগ্রিম অর্থ আদায় করে কুরিয়ার ক্যান্সেলেশন রেশিও ৯০% পর্যন্ত কমান
					</p>
				</div>
			</div>

			<!-- Main Toggle -->
			<div
				class="flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 {enableAdvancePayment
					? 'bg-emerald-50/70 border-emerald-200'
					: 'bg-slate-50 border-slate-200'}"
			>
				<div class="space-y-0.5 pr-2">
					<div class="flex items-center gap-2">
						<h4 class="text-sm font-bold text-slate-900">অগ্রিম পেমেন্ট বাধ্যতামূলক করুন</h4>
						{#if enableAdvancePayment}
							<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
								চালু
							</span>
						{/if}
					</div>
					<p class="text-xs text-slate-600">
						সক্রিয় থাকলে কাস্টমার চেকআউটে অগ্রিম নির্দিষ্ট ফি বা ডেলিভারি চার্জ না দেওয়া পর্যন্ত অর্ডার কনফার্ম হবে না
					</p>
				</div>
				<Switch bind:checked={enableAdvancePayment} />
			</div>

			{#if enableAdvancePayment}
				<div class="space-y-6 pt-2 animate-in fade-in duration-200">
					<!-- Advance Type Switcher (Fixed vs Percentage) -->
					<div class="space-y-2">
						<label class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
							<span>অগ্রিম চার্জের ধরন</span>
							<span class="text-slate-400 font-normal">(অর্ডারের উপর কীভাবে হিসাব হবে)</span>
						</label>
						<div class="grid grid-cols-2 gap-3 max-w-md">
							<button
								type="button"
								onclick={() => (advanceType = 'fixed')}
								class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all {advanceType ===
								'fixed'
									? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
									: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}"
							>
								<Coins class="w-4 h-4" />
								<span>নির্দিষ্ট টাকা (Fixed ৳)</span>
							</button>

							<button
								type="button"
								onclick={() => (advanceType = 'percentage')}
								class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all {advanceType ===
								'percentage'
									? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
									: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}"
							>
								<Percent class="w-4 h-4" />
								<span>শতকরা হার (Percentage %)</span>
							</button>
						</div>
					</div>

					<!-- Amount & Auto-Cancel Inputs -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700 flex items-center justify-between">
								<span>
									{advanceType === 'fixed' ? 'অগ্রিম টাকার পরিমাণ' : 'অগ্রিম শতকরা হার'}
								</span>
								<span class="text-[11px] text-slate-400 font-normal">
									{advanceType === 'fixed' ? 'যেমন: ১৫০ বা ২০০' : 'যেমন: ১০% বা ২০%'}
								</span>
							</label>
							<div class="relative">
								<Input
									type="number"
									name="advanceAmount"
									bind:value={advanceAmount}
									min="1"
									required
									class="font-mono text-sm pl-8 pr-10 rounded-xl"
								/>
								<div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
									{advanceType === 'fixed' ? '৳' : '%'}
								</div>
								<div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
									{advanceType === 'fixed' ? 'টাকা' : 'পারসেন্ট'}
								</div>
							</div>
						</div>

						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700 flex items-center justify-between">
								<span>পেমেন্ট পেন্ডিং অটো-বাতিল সময়</span>
								<span class="text-[11px] text-slate-400 font-normal">মিনিটে</span>
							</label>
							<div class="relative">
								<Input
									type="number"
									name="autoCancelMinutes"
									bind:value={autoCancelMinutes}
									min="5"
									max="1440"
									class="font-mono text-sm pl-9 pr-12 rounded-xl"
								/>
								<Clock class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
								<div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">মিনিট</div>
							</div>
						</div>
					</div>

					<!-- Geographical Restriction Toggle -->
					<div
						class="flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200 {onlyOutsideDhaka
							? 'bg-amber-50/70 border-amber-200'
							: 'bg-slate-50 border-slate-200'}"
					>
						<div class="space-y-0.5 pr-2">
							<div class="flex items-center gap-2">
								<h4 class="text-xs sm:text-sm font-bold text-slate-900">শুধুমাত্র ঢাকার বাইরের অর্ডারে কার্যকর</h4>
								{#if onlyOutsideDhaka}
									<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">
										ঢাকার বাইরে
									</span>
								{/if}
							</div>
							<p class="text-[11px] sm:text-xs text-slate-500">
								চালু থাকলে ঢাকার ভেতরের কাস্টমাররা ০ অগ্রিম ফি দিয়ে ফুল ক্যাশ অন ডেলিভারিতে অর্ডার করতে পারবে
							</p>
						</div>
						<Switch bind:checked={onlyOutsideDhaka} />
					</div>

					<!-- Payment Numbers Section -->
					<div class="space-y-3 pt-2">
						<label class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
							<Smartphone class="w-4 h-4 text-emerald-600" />
							<span>পেমেন্ট গ্রহণের মোবাইল একাউন্ট নম্বরসমূহ</span>
						</label>

						<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
							<!-- bKash -->
							<div class="space-y-1.5 p-3 rounded-2xl bg-rose-50/40 border border-rose-100">
								<span class="text-xs font-bold text-rose-700 flex items-center gap-1">
									<span class="w-2 h-2 rounded-full bg-rose-500"></span>
									বিকাশ নম্বর (Personal/Merchant)
								</span>
								<Input
									type="text"
									name="bkashNumber"
									bind:value={bkashNumber}
									placeholder="01XXXXXXXXX"
									class="font-mono text-xs bg-white rounded-xl"
								/>
							</div>

							<!-- Nagad -->
							<div class="space-y-1.5 p-3 rounded-2xl bg-orange-50/40 border border-orange-100">
								<span class="text-xs font-bold text-orange-700 flex items-center gap-1">
									<span class="w-2 h-2 rounded-full bg-orange-500"></span>
									নগদ নম্বর (Personal/Merchant)
								</span>
								<Input
									type="text"
									name="nagadNumber"
									bind:value={nagadNumber}
									placeholder="01XXXXXXXXX"
									class="font-mono text-xs bg-white rounded-xl"
								/>
							</div>

							<!-- Rocket -->
							<div class="space-y-1.5 p-3 rounded-2xl bg-purple-50/40 border border-purple-100 sm:col-span-2 md:col-span-1">
								<span class="text-xs font-bold text-purple-700 flex items-center gap-1">
									<span class="w-2 h-2 rounded-full bg-purple-500"></span>
									রকেট নম্বর (ঐচ্ছিক)
								</span>
								<Input
									type="text"
									name="rocketNumber"
									bind:value={rocketNumber}
									placeholder="01XXXXXXXXX"
									class="font-mono text-xs bg-white rounded-xl"
								/>
							</div>
						</div>
					</div>

					<!-- Instructions Textarea -->
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700 flex items-center justify-between">
							<span>চেকআউট পেজে প্রদর্শিত নির্দেশনাবলী</span>
							<span class="text-[11px] text-slate-400 font-normal">কাস্টমার পেমেন্ট করার সময় এটি দেখতে পাবে</span>
						</label>
						<Textarea
							name="instructions"
							bind:value={instructions}
							rows={3}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-sans"
						/>
					</div>

					<!-- Live Preview Box -->
					<div class="mt-6 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50">
						<div class="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
							<div class="flex items-center gap-2 text-xs font-bold text-slate-700">
								<Eye class="w-4 h-4 text-emerald-600" />
								<span>চেকআউটে কাস্টমার যেভাবে দেখবে (Live Preview)</span>
							</div>
							<span class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Preview</span>
						</div>

						<div class="p-4 sm:p-5">
							<div class="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 space-y-2.5">
								<div class="flex items-start gap-2.5">
									<ShieldAlert class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
									<div class="space-y-1">
										<h5 class="text-xs sm:text-sm font-bold text-amber-950">
											অগ্রিম চার্জ আবশ্যক ({onlyOutsideDhaka ? 'ঢাকার বাইরের ডেলিভারি' : 'সকল অর্ডার'})
										</h5>
										<p class="text-xs text-amber-800 leading-relaxed">
											{instructions}
										</p>
									</div>
								</div>

								<div class="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60 text-xs">
									<div class="bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold text-slate-800">
										অগ্রিম প্রদেয়: <strong class="text-emerald-700 font-mono">
											{advanceType === 'fixed' ? `৳ ${advanceAmount}` : `${advanceAmount}%`}
										</strong>
									</div>

									{#if bkashNumber}
										<div class="bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 text-rose-800 font-mono text-[11px] font-bold">
											বিকাশ: {bkashNumber}
										</div>
									{/if}

									{#if nagadNumber}
										<div class="bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 text-orange-800 font-mono text-[11px] font-bold">
											নগদ: {nagadNumber}
										</div>
									{/if}

									{#if rocketNumber}
										<div class="bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 text-purple-800 font-mono text-[11px] font-bold">
											রকেট: {rocketNumber}
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Bottom Save Button -->
			<div class="pt-4 border-t border-slate-100 flex items-center justify-end">
				<Button
					type="submit"
					disabled={isSaving}
					class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-8 shadow-sm flex items-center justify-center gap-2"
				>
					{#if isSaving}
						<Loader2 class="w-4 h-4 animate-spin" />
						<span>সংরক্ষণ হচ্ছে...</span>
					{:else}
						<Check class="w-4 h-4" />
						<span>সংরক্ষণ করুন</span>
					{/if}
				</Button>
			</div>
		</Card>
	</form>
</div>
