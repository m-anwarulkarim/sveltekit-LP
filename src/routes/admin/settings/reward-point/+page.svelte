<script lang="ts">
	import { Button } from '#lib/components/ui/button';
	import { ArrowLeft, Save, Headphones, Check, Loader2 } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { data }: { data: any } = $props();

	let isEnabled = $state(data?.rewardConfig?.isEnabled ?? true);
	let pointsThreshold = $state(data?.rewardConfig?.pointsThreshold ?? 100);
	let currencyValue = $state(data?.rewardConfig?.currencyValue ?? 10);
	let calcMethod = $state<'manual' | 'percentage'>(data?.rewardConfig?.calcMethod ?? 'manual');

	$effect(() => {
		if (data?.rewardConfig) {
			isEnabled = data.rewardConfig.isEnabled ?? true;
			pointsThreshold = data.rewardConfig.pointsThreshold ?? 100;
			currencyValue = data.rewardConfig.currencyValue ?? 10;
			calcMethod = data.rewardConfig.calcMethod ?? 'manual';
		}
	});

	// Dynamic calculation of 1 point value
	let singlePointValue = $derived.by(() => {
		const pts = Number(pointsThreshold) || 100;
		const val = Number(currencyValue) || 10;
		if (pts <= 0) return '0.00';
		return (val / pts).toFixed(2);
	});

	let isSaving = $state(false);
</script>

<svelte:head>
	<title>Reward Point Settings - Settings - AURA Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-7 max-w-5xl mx-auto font-['Anek_Bangla',sans-serif]">
	<!-- Top Sub-Header Bar (Exact match to Screenshot) -->
	<div class="flex items-center justify-between gap-4 pb-2">
		<div>
			<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Reward Point Settings</h1>
		</div>

		<div class="flex items-center gap-2">
			<a
				href="https://wa.me/8801860229546"
				target="_blank"
				class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
			>
				<Headphones class="w-3.5 h-3.5 text-[#5845eb]" />
				<span>header.support</span>
			</a>
		</div>
	</div>

	<!-- Back to Settings Button (Exact match to Screenshot) -->
	<div>
		<a
			href="/admin/settings"
			class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all"
		>
			<ArrowLeft class="w-4 h-4 text-slate-500" />
			<span>Back to Settings</span>
		</a>
	</div>

	<!-- Main Configuration Form (Exact match to Screenshot) -->
	<form
		method="POST"
		action="?/saveRewardPoint"
		use:enhance={() => {
			isSaving = true;
			return async ({ result, update }) => {
				isSaving = false;
				if (result.type === 'success') {
					toast.success('রিওয়ার্ড পয়েন্ট সেটিংস সফলভাবে সংরক্ষিত হয়েছে');
				} else {
					toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
				}
				await update();
			};
		}}
		class="space-y-7"
	>
		<input type="hidden" name="isEnabled" value={isEnabled ? 'true' : 'false'} />
		<input type="hidden" name="calcMethod" value={calcMethod} />

		<!-- 1. Section Title: rewardPoint.title -->
		<div>
			<h2 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
				rewardPoint.title
			</h2>
		</div>

		<!-- 2. Enable Label & Checkbox (Exact match to Screenshot with purple filled square) -->
		<div class="space-y-2">
			<div class="text-xs font-bold text-slate-800">
				rewardPoint.enableLabel
			</div>

			<label class="inline-flex items-center gap-2.5 cursor-pointer select-none">
				<button
					type="button"
					onclick={() => (isEnabled = !isEnabled)}
					class="w-5 h-5 rounded-md flex items-center justify-center transition-colors {isEnabled
						? 'bg-[#5845eb] text-white'
						: 'border border-slate-300 bg-white text-transparent'}"
					aria-label="Toggle enable reward points"
				>
					<Check class="w-3.5 h-3.5 stroke-[3]" />
				</button>
				<span class="text-xs font-bold text-slate-900">
					rewardPoint.enableLabel
				</span>
			</label>

			<p class="text-[11px] text-slate-400">
				rewardPoint.enableHint
			</p>
		</div>

		<!-- 3. Value Config Section (Exact match to Screenshot with Floating Labels & "=") -->
		<div class="space-y-3">
			<h3 class="text-xs font-bold text-slate-900">
				rewardPoint.valueConfig
			</h3>

			<!-- Two Floating Outlined Inputs Row with "=" -->
			<div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 max-w-xl">
				<!-- Points Input Box -->
				<div class="flex-1 space-y-1">
					<div class="relative rounded-xl border border-[#5845eb] focus-within:ring-2 focus-within:ring-[#5845eb]/10 bg-white">
						<span class="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-bold text-[#5845eb] select-none">
							rewardPoint.pointsLabel*
						</span>
						<input
							type="number"
							name="pointsThreshold"
							min="1"
							required
							bind:value={pointsThreshold}
							class="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-transparent rounded-xl focus:outline-none"
						/>
					</div>
					<p class="text-[10px] text-slate-400 pl-1">
						rewardPoint.pointsHint
					</p>
				</div>

				<!-- Equal Sign "=" -->
				<div class="text-slate-500 font-bold text-lg select-none text-center self-center sm:self-auto sm:pb-4">
					=
				</div>

				<!-- Currency Value Input Box -->
				<div class="flex-1 space-y-1">
					<div class="relative rounded-xl border border-slate-300 hover:border-slate-400 focus-within:border-[#5845eb] focus-within:ring-2 focus-within:ring-[#5845eb]/10 bg-white">
						<span class="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-bold text-slate-500 select-none">
							rewardPoint.currencyLabel (BDT)*
						</span>
						<input
							type="number"
							name="currencyValue"
							min="1"
							required
							bind:value={currencyValue}
							class="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-transparent rounded-xl focus:outline-none"
						/>
					</div>
					<p class="text-[10px] text-slate-400 pl-1">
						rewardPoint.currencyHint
					</p>
				</div>
			</div>

			<!-- Dynamic Calculation Summary Box (Exact match to Screenshot) -->
			<div class="p-4 bg-slate-100/80 rounded-2xl border border-slate-200/60 max-w-xl space-y-0.5">
				<div class="text-xs font-black text-slate-900">
					{pointsThreshold || 0} rewardPoint.points = {currencyValue || 0} BDT
				</div>
				<div class="text-[11px] text-slate-500">
					(1 point = {singlePointValue} BDT)
				</div>
			</div>
		</div>

		<!-- 4. Calculation Method Section (Exact match to Screenshot Radio Buttons) -->
		<div class="space-y-3 pt-1">
			<h3 class="text-xs font-bold text-slate-900">
				rewardPoint.calcMethod
			</h3>

			<div class="space-y-2.5 max-w-md">
				<!-- Radio 1: rewardPoint.calcManual -->
				<label class="flex items-center gap-2.5 cursor-pointer select-none">
					<button
						type="button"
						onclick={() => (calcMethod = 'manual')}
						class="w-4 h-4 rounded-full border flex items-center justify-center transition-all {calcMethod === 'manual'
							? 'border-[#5845eb]'
							: 'border-slate-400'}"
						aria-label="Select manual calculation"
					>
						{#if calcMethod === 'manual'}
							<span class="w-2 h-2 rounded-full bg-[#5845eb]"></span>
						{/if}
					</button>
					<span class="text-xs font-medium text-slate-800">
						rewardPoint.calcManual
					</span>
				</label>

				<!-- Radio 2: rewardPoint.calcPercentage -->
				<label class="flex items-center gap-2.5 cursor-pointer select-none">
					<button
						type="button"
						onclick={() => (calcMethod = 'percentage')}
						class="w-4 h-4 rounded-full border flex items-center justify-center transition-all {calcMethod === 'percentage'
							? 'border-[#5845eb]'
							: 'border-slate-400'}"
						aria-label="Select percentage calculation"
					>
						{#if calcMethod === 'percentage'}
							<span class="w-2 h-2 rounded-full bg-[#5845eb]"></span>
						{/if}
					</button>
					<span class="text-xs font-medium text-slate-800">
						rewardPoint.calcPercentage
					</span>
				</label>
			</div>
		</div>

		<!-- 5. Save Button (Exact match to Screenshot with Save Icon & Purple Style) -->
		<div class="pt-3">
			<Button
				type="submit"
				disabled={isSaving}
				class="bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold h-10 px-5 rounded-xl shadow-xs text-xs gap-2 cursor-pointer transition-all inline-flex items-center"
			>
				{#if isSaving}
					<Loader2 class="w-4 h-4 animate-spin" />
					<span>সংরক্ষণ হচ্ছে...</span>
				{:else}
					<Save class="w-4 h-4" />
					<span>rewardPoint.save</span>
				{/if}
			</Button>
		</div>
	</form>
</div>
