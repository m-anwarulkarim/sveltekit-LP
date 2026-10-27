<script lang="ts">
	import { Card, Badge } from '#lib/components/ui';
	import {
		ShieldAlert,
		ShieldCheck,
		RotateCw,
		Truck,
		AlertTriangle,
		CheckCircle2,
		XCircle
	} from 'lucide-svelte';

	interface CourierStats {
		total: number;
		delivered: number;
		cancelled: number;
		successRate: number;
		courierName?: string;
	}

	interface Props {
		phone: string;
		stats?: CourierStats | null;
		onRefresh?: () => void;
	}

	let {
		phone,
		stats = null,
		onRefresh
	}: Props = $props();

	let isRefreshing = $state(false);

	let hasPhone = $derived(!!phone && phone.trim().length >= 6);

	let riskStatus = $derived.by(() => {
		if (!stats || stats.total === 0) {
			return {
				level: 'unknown',
				label: 'নতুন কাস্টমার (রেকর্ড নেই)',
				color: 'text-slate-600 bg-slate-100 border-slate-200',
				barColor: 'bg-slate-400'
			};
		}
		if (stats.successRate >= 85) {
			return {
				level: 'low',
				label: 'নিরাপদ কাস্টমার (Low Risk)',
				color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
				barColor: 'bg-emerald-500'
			};
		}
		if (stats.successRate >= 65) {
			return {
				level: 'medium',
				label: 'মাঝারি ঝুঁকি (ফোন ভেরিফাই করুন)',
				color: 'text-amber-700 bg-amber-50 border-amber-200',
				barColor: 'bg-amber-500'
			};
		}
		return {
			level: 'high',
			label: 'উচ্চ ঝুঁকি (অগ্রিম ডেলিভারি চার্জ নিন!)',
			color: 'text-rose-700 bg-rose-50 border-rose-200',
			barColor: 'bg-rose-500'
		};
	});

	function handleRefreshClick() {
		if (!hasPhone) return;
		isRefreshing = true;
		onRefresh?.();
		setTimeout(() => {
			isRefreshing = false;
		}, 800);
	}
</script>

<Card class="p-4 bg-white/90 shadow-xs border-slate-200/90 space-y-3">
	<!-- Header -->
	<div class="flex items-center justify-between pb-2 border-b border-slate-100">
		<div class="flex items-center gap-2">
			<ShieldCheck class="w-4 h-4 text-indigo-600" />
			<h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">
				ফ্রড ও কুরিয়ার হিস্ট্রি
			</h3>
		</div>

		<div class="flex items-center gap-2">
			<span class="text-[10px] font-bold text-slate-400">
				BD COURIER
			</span>
			{#if hasPhone}
				<button
					type="button"
					onclick={handleRefreshClick}
					class="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
					title="কুরিয়ার ডেটা রিফ্রেশ করুন"
				>
					<RotateCw class="w-3.5 h-3.5 {isRefreshing ? 'animate-spin text-indigo-600' : ''}" />
				</button>
			{/if}
		</div>
	</div>

	{#if !hasPhone}
		<!-- Empty / Inactive state when no phone is typed -->
		<div class="py-6 px-3 text-center text-slate-400 space-y-1.5 bg-slate-50/60 rounded-xl border border-slate-100">
			<ShieldAlert class="w-7 h-7 mx-auto text-slate-300 stroke-1" />
			<p class="text-xs font-bold text-slate-600">কুরিয়ার হিস্ট্রি খালি</p>
			<p class="text-[11px] text-slate-400 leading-relaxed">
				কাস্টমারের ফোন নম্বর লিখলে স্বয়ংক্রিয়ভাবে Steadfast ও Pathao কুরিয়ারের ডেলিভারি রেট ও ফ্রড রেকর্ড যাচাই হবে।
			</p>
		</div>
	{:else if !stats || stats.total === 0}
		<!-- Phone is typed, but no history in courier -->
		<div class="p-3 text-center bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
			<div class="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
				<CheckCircle2 class="w-4 h-4 text-emerald-500" />
				<span>নতুন কাস্টমার (রেকর্ড নেই)</span>
			</div>
			<p class="text-[11px] text-slate-400">এই নম্বরে অতীতে কোনো ডেলিভারি বা রিটার্ন রেকর্ড নেই।</p>
		</div>
	{:else}
		<!-- Risk Assessment Status Pill -->
		<div class="flex items-center justify-between p-2 rounded-xl border text-xs font-bold {riskStatus.color}">
			<div class="flex items-center gap-1.5">
				{#if riskStatus.level === 'low'}
					<CheckCircle2 class="w-4 h-4 text-emerald-600" />
				{:else if riskStatus.level === 'high'}
					<AlertTriangle class="w-4 h-4 text-rose-600" />
				{:else}
					<Truck class="w-4 h-4 text-amber-600" />
				{/if}
				<span>{riskStatus.label}</span>
			</div>
			<span class="font-mono text-sm">{stats.successRate}%</span>
		</div>

		<!-- Progress Bar -->
		<div class="space-y-1">
			<div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
				<div
					class="h-full rounded-full transition-all duration-500 {riskStatus.barColor}"
					style="width: {stats.successRate}%"
				></div>
			</div>
			<div class="flex justify-between text-[10px] text-slate-400 font-medium">
				<span>সাকসেস রেট</span>
				<span>{stats.courierName || 'Steadfast & Pathao'}</span>
			</div>
		</div>

		<!-- Mini Metrics Grid -->
		<div class="grid grid-cols-3 gap-2 text-center pt-1">
			<div class="bg-slate-50 p-2 rounded-xl border border-slate-100">
				<span class="text-[10px] font-bold text-slate-500 block">মোট অর্ডার</span>
				<span class="text-sm font-black font-mono text-slate-900">{stats.total}</span>
			</div>
			<div class="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
				<span class="text-[10px] font-bold text-emerald-700 block">রিসিভড</span>
				<span class="text-sm font-black font-mono text-emerald-700">{stats.delivered}</span>
			</div>
			<div class="bg-rose-50/60 p-2 rounded-xl border border-rose-100">
				<span class="text-[10px] font-bold text-rose-700 block">ক্যান্সেল</span>
				<span class="text-sm font-black font-mono text-rose-700">{stats.cancelled}</span>
			</div>
		</div>
	{/if}
</Card>

