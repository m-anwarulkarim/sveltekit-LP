<script lang="ts">
	import { ShieldCheck, RotateCw, AlertCircle, Settings } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	interface SmartPosResult {
		phone: string;
		totalParcels: number;
		deliveredParcels: number;
		cancelledParcels: number;
		successRate: number;
		successRateFormatted: string;
		riskTag: 'Safe' | 'Moderate' | 'High Risk' | 'New' | string;
		providerName: string;
		hasData: boolean;
	}

	interface Props {
		phone: string;
		isConfigured?: boolean;
	}

	let { phone, isConfigured = false }: Props = $props();

	let result = $state<SmartPosResult | null>(null);
	let isLoading = $state(false);
	let errorMsg = $state('');
	let hasFetched = $state(false);

	let hasPhone = $derived(!!phone && phone.trim().length >= 6);

	let prevPhone = $state('');

	$effect(() => {
		if (phone !== prevPhone) {
			prevPhone = phone;
			hasFetched = false;
			result = null;
			errorMsg = '';
		}
	});

	$effect(() => {
		if (hasPhone && isConfigured && !hasFetched) {
			fetchFraudCheck();
		}
	});

	let riskStatus = $derived.by(() => {
		if (!result || !result.hasData) {
			return {
				label: 'তথ্য নেই',
				colorClass: 'bg-blue-50 text-blue-700 border-blue-200/90',
				barColor: 'bg-blue-400',
				textColor: 'text-blue-600'
			};
		}
		const rate = result.successRate;
		if (rate >= 70) return { label: 'Safe', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/90', barColor: 'bg-emerald-500', textColor: 'text-emerald-600' };
		if (rate >= 50) return { label: 'Moderate', colorClass: 'bg-amber-50 text-amber-700 border-amber-200/90', barColor: 'bg-amber-500', textColor: 'text-amber-600' };
		return { label: 'High Risk', colorClass: 'bg-rose-50 text-rose-700 border-rose-200/90', barColor: 'bg-rose-500', textColor: 'text-rose-600' };
	});

	async function fetchFraudCheck(forceRefresh = false) {
		if (!hasPhone || isLoading) return;
		isLoading = true;
		errorMsg = '';

		try {
			const res = await fetch('/api/admin/fraud-check/smartpos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone, forceRefresh })
			});

			if (res.ok) {
				const data: any = await res.json();
				if (data.success && data.result) {
					result = data.result;
					hasFetched = true;
					if (forceRefresh) toast.success('SmartPOS ফ্রড ডেটা আপডেট হয়েছে!');
				} else {
					errorMsg = data.message || 'ফ্রড চেক ব্যর্থ হয়েছে';
					hasFetched = true;
				}
			} else {
				errorMsg = 'SmartPOS সার্ভার থেকে তথ্য পাওয়া যায়নি';
				hasFetched = true;
			}
		} catch (err) {
			console.error('SmartPOS fraud check error:', err);
			errorMsg = 'সংযোগ ব্যর্থ হয়েছে';
			hasFetched = true;
		} finally {
			isLoading = false;
		}
	}
</script>

{#if isConfigured}
	<div class="rounded-2xl bg-white border border-slate-200/90 p-4 text-slate-800 shadow-xs space-y-3.5 font-sans">
		<!-- Header -->
		<div class="flex items-center justify-between pb-1 border-b border-slate-100">
			<div class="flex items-center gap-2">
				<ShieldCheck class="w-4 h-4 text-violet-600" />
				<h3 class="text-sm font-bold text-slate-800 tracking-wide">SmartPOS Fraud Check</h3>
			</div>
			{#if hasPhone}
				<button
					type="button"
					onclick={() => fetchFraudCheck(true)}
					disabled={isLoading}
					class="p-1 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-slate-100 transition-colors cursor-pointer"
					title="SmartPOS থেকে রিফ্রেশ করুন"
				>
					<RotateCw class="w-4 h-4 {isLoading ? 'animate-spin text-violet-600' : ''}" />
				</button>
			{/if}
		</div>

		<!-- Source badge -->
		<div class="flex items-center justify-between pt-0.5">
			<div class="flex items-center gap-1.5">
				<ShieldCheck class="w-3.5 h-3.5 text-violet-500" />
				<span class="text-[10px] font-bold tracking-wider text-slate-500 uppercase">SmartPOS Bangladesh</span>
			</div>
			{#if result?.hasData}
				<span class="px-3 py-0.5 rounded-full text-xs font-bold border {riskStatus.colorClass}">
					{riskStatus.label}
				</span>
			{/if}
		</div>

		{#if !hasPhone}
			<div class="py-5 px-3 text-center text-slate-400 space-y-1 bg-slate-50/80 rounded-xl border border-slate-200/60">
				<ShieldCheck class="w-6 h-6 mx-auto text-slate-400 stroke-1" />
				<p class="text-xs font-semibold text-slate-600">ফোন নম্বর প্রদান করুন</p>
				<p class="text-[11px] text-slate-400">SmartPOS API দিয়ে ফ্রড স্কোর যাচাই করা হবে</p>
			</div>
		{:else if isLoading && !result}
			<div class="py-6 text-center space-y-2">
				<RotateCw class="w-5 h-5 mx-auto animate-spin text-violet-500" />
				<p class="text-xs text-slate-500">SmartPOS API থেকে তথ্য আনা হচ্ছে...</p>
			</div>
		{:else if errorMsg && !result}
			<div class="py-5 px-3.5 text-center space-y-2 bg-slate-50 rounded-xl border border-slate-200">
				<AlertCircle class="w-6 h-6 mx-auto text-slate-400 stroke-[1.5]" />
				<p class="text-xs font-bold text-slate-700">{errorMsg}</p>
			</div>
		{:else if result}
			<!-- Stats -->
			<div class="grid grid-cols-3 gap-2.5">
				<div class="bg-slate-50/90 rounded-xl py-3 px-2 text-center border border-slate-200/80 shadow-2xs">
					<span class="text-xl font-black font-mono text-slate-900 block">{result.totalParcels}</span>
					<span class="text-xs text-slate-500 font-semibold block mt-0.5">Total</span>
				</div>
				<div class="bg-emerald-50/60 rounded-xl py-3 px-2 text-center border border-emerald-100 shadow-2xs">
					<span class="text-xl font-black font-mono text-emerald-600 block">{result.deliveredParcels}</span>
					<span class="text-xs text-emerald-700/80 font-semibold block mt-0.5">Received</span>
				</div>
				<div class="bg-rose-50/60 rounded-xl py-3 px-2 text-center border border-rose-100 shadow-2xs">
					<span class="text-xl font-black font-mono text-rose-600 block">{result.cancelledParcels}</span>
					<span class="text-xs text-rose-700/80 font-semibold block mt-0.5">Cancel</span>
				</div>
			</div>

			<!-- Progress bar -->
			<div class="flex items-center gap-3 pt-0.5">
				{#if !result.hasData}
					<div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
						<div class="h-full rounded-full bg-blue-300 transition-all duration-500 w-full opacity-30"></div>
					</div>
					<span class="text-xs font-bold text-blue-500 shrink-0">তথ্য নেই</span>
				{:else}
					<div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
						<div
							class="h-full rounded-full transition-all duration-500 {riskStatus.barColor}"
							style="width: {result.successRate}%"
						></div>
					</div>
					<span class="text-sm font-black font-mono {riskStatus.textColor} shrink-0">
						{result.successRateFormatted}
					</span>
				{/if}
			</div>
		{:else}
			<!-- Not yet loaded -->
			<div class="py-5 px-3 text-center space-y-1 bg-violet-50/50 rounded-xl border border-violet-100">
				<ShieldCheck class="w-6 h-6 mx-auto text-violet-400 stroke-1" />
				<p class="text-xs font-semibold text-slate-600">SmartPOS ফ্রড চেক</p>
				<button
					type="button"
					onclick={() => fetchFraudCheck()}
					class="text-[11px] text-violet-600 hover:underline font-bold cursor-pointer"
				>
					এখনই চেক করুন →
				</button>
			</div>
		{/if}
	</div>
{/if}
