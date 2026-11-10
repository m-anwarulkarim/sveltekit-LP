<script lang="ts">
	import {
		DashboardStats,
		DashboardChart,
		RecentOrdersTable,
		MainDashboardCourierWidget
	} from './_components/dashboard';
	import { Activity, ArrowRight, LayoutDashboard } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { AdminDateRangePicker } from './_components/common';

	let { data }: { data: any } = $props();

	let activeRange = $derived(data.activeRange || 'today');
	let activeFrom = $derived(data.activeFrom || null);
	let activeTo = $derived(data.activeTo || null);

	function handleDateChange(range: string, from?: string, to?: string) {
		let url = `/admin?range=${encodeURIComponent(range)}`;
		if (range === 'custom' && from && to) {
			url += `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
		}
		goto(url, { keepFocus: true, noScroll: true });
	}
</script>

<div class="space-y-6 max-w-7xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Dashboard Header with Universal Premium Date Filter -->
	<div class="bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb] shadow-2xs shrink-0">
				<LayoutDashboard class="w-5 h-5 stroke-[2.2]" />
			</div>
			<div>
				<h1 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
					স্টোর ওভারভিউ ও অ্যানালিটিক্স
				</h1>
				<p class="text-xs text-slate-500 font-['Anek_Bangla',sans-serif] mt-0.5">
					নির্বাচিত সময়ের বিক্রয়, অর্ডার, ট্রাফিক ও কুরিয়ার পারফরম্যান্স মনিটর করুন
				</p>
			</div>
		</div>

		<AdminDateRangePicker
			{activeRange}
			{activeFrom}
			{activeTo}
			onSelect={handleDateChange}
		/>
	</div>

	<!-- Live Storefront Traffic Bar (Quick Glance) -->
	<div class="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<div class="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
				<Activity class="w-4.5 h-4.5 stroke-[2.5]" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<span class="text-xs sm:text-sm font-bold text-slate-900">রিয়েল-টাইম ট্রাফিক</span>
					<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
						<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
						{data.trafficQuick?.activeNow ?? 0} জন অনলাইনে
					</span>
				</div>
				<p class="text-[11px] text-slate-500">
					আজকে স্টোরে মোট {data.trafficQuick?.todaySessions ?? 0} জন অনন্য ভিজিটর এসেছেন
				</p>
			</div>
		</div>

		<a
			href="/admin/visitors"
			class="inline-flex items-center gap-1.5 text-xs font-bold text-[#5845eb] hover:text-[#4936d6] bg-indigo-50/80 hover:bg-indigo-100/80 px-3 py-1.5 rounded-2xl border border-indigo-200/80 transition-all cursor-pointer"
		>
			<span>পূর্ণাঙ্গ ট্রাফিক রিপোর্ট</span>
			<ArrowRight class="w-3.5 h-3.5" />
		</a>
	</div>

	<!-- 6 KPI Metric Summary Cards -->
	<DashboardStats {data} />

	<!-- Courier Operations & Live Delivery Overview Widget -->
	<MainDashboardCourierWidget courierSummary={data.courierSummary} />

	<!-- Visual Dual Analytics Section -->
	<DashboardChart {data} />

	<!-- Recent Web Orders Quick Preview -->
	<RecentOrdersTable {data} />
</div>
