<script lang="ts">
	import type { CourierHubKPIs } from '#lib/server/services/courier.service';
	import {
		Wallet,
		Truck,
		PackageCheck,
		RotateCcw,
		Coins,
		RefreshCw,
		CheckCircle2,
		AlertCircle,
		ArrowUpRight,
		Clock
	} from 'lucide-svelte';

	interface Props {
		kpis?: CourierHubKPIs;
		onRefreshBalance?: () => void;
		isRefreshingBalance?: boolean;
	}

	const defaultKpis: CourierHubKPIs = {
		dispatchedToday: 0,
		inTransitCount: 0,
		deliveredCount: 0,
		returnedCount: 0,
		holdCount: 0,
		totalConsignments: 0,
		deliverySuccessRate: 100,
		totalCodAmount: 0,
		deliveredCodAmount: 0,
		courierFeeTotal: 0,
		netPayableTotal: 0,
		liveBalance: 0,
		liveBalanceProvider: 'Steadfast',
		liveBalanceSuccess: false,
		liveBalanceMessage: 'ব্যালেন্স সিঙ্ক হয়নি'
	};

	let { kpis = defaultKpis, onRefreshBalance, isRefreshingBalance = false }: Props = $props();

	function formatTaka(amount: number): string {
		return '৳ ' + Math.round(amount || 0).toLocaleString('en-IN');
	}
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
	<!-- 1. Live Courier Wallet Balance -->
	<div class="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
		<div class="flex items-center justify-between">
			<span class="text-xs font-semibold text-emerald-100 flex items-center gap-1.5">
				<Wallet class="w-4 h-4 text-emerald-200" />
				<span>কুরিয়ার ব্যালেন্স</span>
			</span>
			<button
				type="button"
				onclick={onRefreshBalance}
				disabled={isRefreshingBalance}
				class="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50"
				title="ব্যালেন্স রিফ্রেশ করুন"
				aria-label="Refresh Balance"
			>
				<RefreshCw class="w-3.5 h-3.5 {isRefreshingBalance ? 'animate-spin' : ''}" />
			</button>
		</div>

		<div class="my-2">
			<div class="text-xl sm:text-2xl font-black tracking-tight">
				{formatTaka(kpis.liveBalance)}
			</div>
			<div class="text-[11px] text-emerald-100/90 font-medium mt-0.5 flex items-center gap-1">
				<span>প্রোভাইডার:</span>
				<span class="font-bold underline decoration-emerald-300">{kpis.liveBalanceProvider || 'Steadfast'}</span>
			</div>
		</div>

		<div class="text-[10px] text-emerald-200 bg-white/10 px-2 py-0.5 rounded-md inline-block font-medium truncate">
			{kpis.liveBalanceSuccess ? 'লাইভ উত্তোলনযোগ্য' : (kpis.liveBalanceMessage || 'ব্যালেন্স সিঙ্ক হয়নি')}
		</div>
	</div>

	<!-- 2. Dispatched Today -->
	<div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
		<div class="flex items-center justify-between">
			<span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
				<Clock class="w-4 h-4 text-sky-500" />
				<span>আজকের বুকিং</span>
			</span>
			<span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">
				Today
			</span>
		</div>

		<div class="my-2">
			<div class="text-2xl font-black text-slate-900">
				{kpis.dispatchedToday}টি
			</div>
			<div class="text-[11px] text-slate-400 font-medium mt-0.5">
				আজ কুরিয়ারে হস্তান্তর
			</div>
		</div>

		<div class="text-[11px] font-semibold text-sky-600 flex items-center gap-1">
			<span>মোট পাঠানো: {kpis.totalConsignments}টি</span>
		</div>
	</div>

	<!-- 3. In Transit (Road / Out for delivery) -->
	<div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
		<div class="flex items-center justify-between">
			<span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
				<Truck class="w-4 h-4 text-amber-500" />
				<span>ইন-ট্রানজিট</span>
			</span>
			<span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 animate-pulse">
				On Road
			</span>
		</div>

		<div class="my-2">
			<div class="text-2xl font-black text-slate-900">
				{kpis.inTransitCount}টি
			</div>
			<div class="text-[11px] text-slate-400 font-medium mt-0.5">
				ডেলিভারির উদ্দেশ্যে পথে
			</div>
		</div>

		<div class="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
			<span>সক্রিয় চালান</span>
		</div>
	</div>

	<!-- 4. Delivered Successfully -->
	<div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
		<div class="flex items-center justify-between">
			<span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
				<CheckCircle2 class="w-4 h-4 text-emerald-600" />
				<span>ডেলিভারি সম্পন্ন</span>
			</span>
			<span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
				{kpis.deliverySuccessRate}%
			</span>
		</div>

		<div class="my-2">
			<div class="text-2xl font-black text-emerald-600">
				{kpis.deliveredCount}টি
			</div>
			<div class="text-[11px] text-slate-400 font-medium mt-0.5">
				সফল কাস্টমার ডেলিভারি
			</div>
		</div>

		<div class="text-[11px] font-semibold text-emerald-600 truncate">
			COD: {formatTaka(kpis.deliveredCodAmount)}
		</div>
	</div>

	<!-- 5. Returned / Cancelled -->
	<div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
		<div class="flex items-center justify-between">
			<span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
				<RotateCcw class="w-4 h-4 text-rose-500" />
				<span>রিটার্ন / ফেরত</span>
			</span>
			{#if kpis.holdCount > 0}
				<span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700" title="হোল্ড বা রি-অ্যাটেম্পট">
					{kpis.holdCount} হোল্ড
				</span>
			{/if}
		</div>

		<div class="my-2">
			<div class="text-2xl font-black text-rose-600">
				{kpis.returnedCount}টি
			</div>
			<div class="text-[11px] text-slate-400 font-medium mt-0.5">
				ডেলিভারি ব্যর্থ বা ফেরত
			</div>
		</div>

		<div class="text-[11px] font-semibold text-rose-600">
			ক্ষতি / রিটার্ন হার
		</div>
	</div>

	<!-- 6. Total COD & Net Payout Receivable -->
	<div class="bg-slate-900 text-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
		<div class="flex items-center justify-between">
			<span class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
				<Coins class="w-4 h-4 text-indigo-400" />
				<span>নিট প্রাপ্য পাওনা</span>
			</span>
			<span class="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300">
				Net COD
			</span>
		</div>

		<div class="my-2">
			<div class="text-xl sm:text-2xl font-black text-white">
				{formatTaka(kpis.netPayableTotal)}
			</div>
			<div class="text-[11px] text-slate-400 font-medium mt-0.5">
				চার্জ বাদে কুরিয়ার পাওনা
			</div>
		</div>

		<div class="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-1.5 mt-0.5">
			<span>কুরিয়ার ফি:</span>
			<span class="text-slate-300 font-bold">{formatTaka(kpis.courierFeeTotal)}</span>
		</div>
	</div>
</div>

