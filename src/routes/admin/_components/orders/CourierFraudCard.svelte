<script lang="ts">
	import {
		Shield,
		RotateCw,
		Truck,
		AlertCircle,
		Settings,
		CheckCircle2
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	interface CourierBreakdownItem {
		total: number;
		delivered: number;
		cancelled: number;
		successRate: number;
	}

	interface CourierStats {
		total: number;
		delivered: number;
		cancelled: number;
		successRate: number;
		successRateFormatted?: string;
		riskTag?: 'Safe' | 'Moderate' | 'High Risk' | string;
		courierName?: string;
		badgeLabel?: string;
		isConfigured?: boolean;
		byCourier?: {
			steadfast?: CourierBreakdownItem;
			pathao?: CourierBreakdownItem;
			[key: string]: CourierBreakdownItem | undefined;
		};
	}

	interface Props {
		phone: string;
		stats?: CourierStats | null;
		onRefresh?: (updatedStats?: CourierStats) => void;
	}

	let {
		phone,
		stats = $bindable(null),
		onRefresh
	}: Props = $props();

	let isRefreshing = $state(false);

	let hasPhone = $derived(!!phone && phone.trim().length >= 6);

	let isNewCustomer = $derived(
		!stats || stats.total === 0 || (stats.delivered === 0 && stats.cancelled === 0)
	);

	let displaySuccessRate = $derived.by(() => {
		if (!stats || stats.total === 0) return 100;
		return Math.round(((stats.delivered / stats.total) * 100) * 100) / 100;
	});

	let displaySuccessRateFormatted = $derived.by(() => {
		if (stats?.successRateFormatted) return stats.successRateFormatted;
		if (!stats || stats.total === 0) return '100%';
		return `${((stats.delivered / stats.total) * 100).toFixed(2).replace(/\.00$/, '')}%`;
	});

	let riskStatus = $derived.by(() => {
		if (isNewCustomer) {
			return {
				tag: 'Safe',
				label: 'Safe',
				colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
				barColor: 'bg-emerald-500',
				textRateColor: 'text-emerald-600'
			};
		}
		const rate = displaySuccessRate;
		if (rate >= 70) {
			return {
				tag: 'Safe',
				label: 'Safe',
				colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
				barColor: 'bg-emerald-500',
				textRateColor: 'text-emerald-600'
			};
		}
		if (rate >= 50) {
			return {
				tag: 'Moderate',
				label: 'Moderate',
				colorClass: 'bg-amber-50 text-amber-700 border-amber-200/90',
				barColor: 'bg-amber-500',
				textRateColor: 'text-amber-600'
			};
		}
		return {
			tag: 'High Risk',
			label: 'High Risk',
			colorClass: 'bg-rose-50 text-rose-700 border-rose-200/90',
			barColor: 'bg-rose-500',
			textRateColor: 'text-rose-600'
		};
	});

	async function handleRefreshClick() {
		if (!hasPhone || isRefreshing) return;
		isRefreshing = true;

		try {
			const res = await fetch('/api/admin/courier/check-fraud', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone, forceRefresh: true })
			});

			if (res.ok) {
				const data: any = await res.json();
				if (data.success && data.stats) {
					stats = data.stats;
					if (data.stats.isConfigured) {
						toast.success('কুরিয়ার লাইভ ডেটা সফলভাবে আপডেট হয়েছে!');
					} else {
						toast.info('কোনো কুরিয়ার API চালু নেই। লোকাল হিস্ট্রি লোড হয়েছে।');
					}
					onRefresh?.(data.stats);
				}
			} else {
				toast.error('কুরিয়ার সার্ভার থেকে তথ্য পাওয়া যায়নি');
			}
		} catch (err) {
			console.error('Failed to refresh courier fraud check:', err);
			toast.error('কুরিয়ার ডেটা রিলোড ব্যর্থ হয়েছে');
		} finally {
			setTimeout(() => {
				isRefreshing = false;
			}, 400);
		}
	}
</script>

<!-- Light Theme Fraud Check Card matching dashboard aesthetic -->
<div class="rounded-2xl bg-white border border-slate-200/90 p-4 text-slate-800 shadow-xs space-y-3.5 font-sans">
	<!-- Top Bar: Fraud Check title & Refresh Button -->
	<div class="flex items-center justify-between pb-1 border-b border-slate-100">
		<div class="flex items-center gap-2">
			<Shield class="w-4 h-4 text-indigo-600" />
			<h3 class="text-sm font-bold text-slate-800 tracking-wide">
				Fraud Check
			</h3>
		</div>

		{#if hasPhone}
			<button
				type="button"
				onclick={handleRefreshClick}
				disabled={isRefreshing}
				class="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
				title="কুরিয়ার লাইভ সার্ভার থেকে রিফ্রেশ করুন"
			>
				<RotateCw class="w-4 h-4 {isRefreshing ? 'animate-spin text-indigo-600' : ''}" />
			</button>
		{/if}
	</div>

	<!-- Sub-header: Haq Plus Brand Identity & Risk Status Pill -->
	<div class="flex items-center justify-between pt-0.5">
		<div class="flex items-center gap-1.5">
			<Shield class="w-4 h-4 text-indigo-500" />
			<span class="text-xs font-black tracking-wider text-slate-800 uppercase">
				Haq Plus
			</span>
		</div>

		<span
			class="px-3 py-0.5 rounded-full text-xs font-bold border {riskStatus.colorClass}"
		>
			{riskStatus.label}
		</span>
	</div>

	{#if !hasPhone}
		<!-- Empty Phone State -->
		<div class="py-6 px-3 text-center text-slate-400 space-y-1 bg-slate-50/80 rounded-xl border border-slate-200/60">
			<Shield class="w-6 h-6 mx-auto text-slate-400 stroke-1" />
			<p class="text-xs font-semibold text-slate-600">ফোন নম্বর প্রদান করুন</p>
			<p class="text-[11px] text-slate-400">গ্রাহকের ফোন নম্বর অনুযায়ী কুরিয়ার ডেলিভারি রেকর্ড প্রদর্শিত হবে</p>
		</div>
	{:else}
		<!-- 3 Stat Blocks (Total / Received / Cancel) in Light Theme -->
		<div class="grid grid-cols-3 gap-2.5">
			<!-- Total -->
			<div class="bg-slate-50/90 rounded-xl py-3 px-2 text-center border border-slate-200/80 shadow-2xs">
				<span class="text-xl font-black font-mono text-slate-900 block">
					{stats?.total ?? 0}
				</span>
				<span class="text-xs text-slate-500 font-semibold block mt-0.5">
					Total
				</span>
			</div>

			<!-- Received -->
			<div class="bg-emerald-50/60 rounded-xl py-3 px-2 text-center border border-emerald-100 shadow-2xs">
				<span class="text-xl font-black font-mono text-emerald-600 block">
					{stats?.delivered ?? 0}
				</span>
				<span class="text-xs text-emerald-700/80 font-semibold block mt-0.5">
					Received
				</span>
			</div>

			<!-- Cancel -->
			<div class="bg-rose-50/60 rounded-xl py-3 px-2 text-center border border-rose-100 shadow-2xs">
				<span class="text-xl font-black font-mono text-rose-600 block">
					{stats?.cancelled ?? 0}
				</span>
				<span class="text-xs text-rose-700/80 font-semibold block mt-0.5">
					Cancel
				</span>
			</div>
		</div>

		<!-- Overall Delivery Percentage Bar -->
		<div class="flex items-center gap-3 pt-0.5">
			<div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
				<div
					class="h-full rounded-full transition-all duration-500 {riskStatus.barColor}"
					style="width: {displaySuccessRate}%"
				></div>
			</div>
			<span class="text-sm font-black font-mono {riskStatus.textRateColor} shrink-0">
				{displaySuccessRateFormatted}
			</span>
		</div>

		<!-- BY COURIER Breakdown Section -->
		<div class="pt-2 border-t border-slate-100 space-y-3">
			<h4 class="text-[10px] font-bold tracking-wider uppercase text-slate-400">
				BY COURIER
			</h4>

			{#if stats?.byCourier?.pathao || stats?.byCourier?.steadfast}
				<!-- Pathao Row -->
				{#if stats?.byCourier?.pathao}
					{@const pa = stats.byCourier.pathao}
					<div class="space-y-1">
						<div class="flex items-center justify-between text-xs">
							<div class="flex items-center gap-1.5 text-slate-700 font-bold">
								<Truck class="w-3.5 h-3.5 text-emerald-600" />
								<span>Pathao</span>
							</div>
							<span class="font-mono font-bold text-slate-600">
								{pa.delivered}/{pa.total}
							</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
								<div
									class="h-full rounded-full bg-emerald-500 transition-all duration-500"
									style="width: {pa.successRate}%"
								></div>
							</div>
							<span class="text-[11px] font-mono font-bold text-emerald-600 shrink-0 w-8 text-right">
								{pa.successRate}%
							</span>
						</div>
					</div>
				{/if}

				<!-- SteadFast Row -->
				{#if stats?.byCourier?.steadfast}
					{@const st = stats.byCourier.steadfast}
					<div class="space-y-1">
						<div class="flex items-center justify-between text-xs">
							<div class="flex items-center gap-1.5 text-slate-700 font-bold">
								<Truck class="w-3.5 h-3.5 text-amber-600" />
								<span>SteadFast</span>
							</div>
							<span class="font-mono font-bold text-slate-600">
								{st.delivered}/{st.total}
							</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
								<div
									class="h-full rounded-full bg-amber-500 transition-all duration-500"
									style="width: {st.successRate}%"
								></div>
							</div>
							<span class="text-[11px] font-mono font-bold text-amber-600 shrink-0 w-8 text-right">
								{st.successRate}%
							</span>
						</div>
					</div>
				{/if}
			{:else}
				<!-- Fallback when individual courier breakdown isn't populated yet -->
				<div class="space-y-2">
					<div class="space-y-1">
						<div class="flex items-center justify-between text-xs">
							<div class="flex items-center gap-1.5 text-slate-600 font-semibold">
								<Truck class="w-3.5 h-3.5 text-slate-400" />
								<span>{stats?.courierName || 'SteadFast / Pathao'}</span>
							</div>
							<span class="font-mono font-bold text-slate-600">
								{stats?.delivered ?? 0}/{stats?.total ?? 0}
							</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
								<div
									class="h-full rounded-full {riskStatus.barColor} transition-all duration-500"
									style="width: {displaySuccessRate}%"
								></div>
							</div>
							<span class="text-[11px] font-mono font-bold text-slate-500 shrink-0 w-8 text-right">
								{Math.round(displaySuccessRate)}%
							</span>
						</div>
					</div>

					{#if !stats?.isConfigured}
						<div class="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-2 mt-2">
							<div class="flex items-center gap-1.5 text-[11px] text-amber-800">
								<AlertCircle class="w-3.5 h-3.5 shrink-0 text-amber-600" />
								<span>কুরিয়ার API কনফিগার করা নেই</span>
							</div>
							<a
								href="/admin/settings/fraud-check-api"
								class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 hover:underline"
							>
								<Settings class="w-3 h-3" />
								<span>সেটআপ</span>
							</a>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
