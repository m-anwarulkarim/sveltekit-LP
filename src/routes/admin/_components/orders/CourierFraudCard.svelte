<script lang="ts">
	import { Card, Badge } from '#lib/components/ui';
	import {
		ShieldAlert,
		ShieldCheck,
		RotateCw,
		Truck,
		AlertTriangle,
		CheckCircle2,
		AlertCircle,
		Settings
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	interface CourierStats {
		total: number;
		delivered: number;
		cancelled: number;
		successRate: number;
		courierName?: string;
		badgeLabel?: string;
		isConfigured?: boolean;
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

	let riskStatus = $derived.by(() => {
		if (isNewCustomer) {
			return {
				level: 'unknown',
				label: 'নতুন কাস্টমার (রেকর্ড নেই)',
				color: 'text-slate-700 bg-slate-50 border-slate-200',
				barColor: 'bg-emerald-500'
			};
		}
		if (stats!.successRate >= 80) {
			return {
				level: 'low',
				label: 'নিরাপদ কাস্টমার (Low Risk)',
				color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
				barColor: 'bg-emerald-500'
			};
		}
		if (stats!.successRate >= 50) {
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
				const data = await res.json();
				if (data.success && data.stats) {
					stats = data.stats;
					if (data.stats.isConfigured) {
						toast.success(`${data.stats.courierName} থেকে লাইভ ডেটা আপডেট হয়েছে!`);
					} else {
						toast.error('কোনো কুরিয়ার API কনফিগার করা নেই! Settings > Courier থেকে API সেটআপ করুন।');
					}
					onRefresh?.(data.stats);
				}
			} else {
				toast.error('কুরিয়ার সার্ভারের সাথে সংযোগ করা যায়নি');
			}
		} catch (err) {
			console.error('Failed to refresh live courier data:', err);
			toast.error('কুরিয়ার ডেটা রিলোড ব্যর্থ হয়েছে');
		} finally {
			setTimeout(() => {
				isRefreshing = false;
			}, 400);
		}
	}
</script>

<Card class="p-4 bg-white/90 shadow-xs border-slate-200/90 space-y-3 font-['Anek_Bangla',sans-serif]">
	<!-- Header -->
	<div class="flex items-center justify-between pb-2 border-b border-slate-100">
		<div class="flex items-center gap-2">
			<ShieldCheck class="w-4 h-4 text-indigo-600" />
			<h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">
				ফ্রড ও কুরিয়ার হিস্ট্রি
			</h3>
		</div>

		<div class="flex items-center gap-2">
			<Badge
				variant={stats?.isConfigured ? 'purple' : 'outline'}
				class="text-[9px] font-bold py-0.5 px-1.5 uppercase tracking-wider {stats?.isConfigured ? '' : 'text-amber-700 border-amber-300 bg-amber-50'}"
			>
				{stats?.isConfigured ? (stats.badgeLabel || 'COURIER LIVE') : 'API আনকনফিগার্ড'}
			</Badge>

			{#if hasPhone}
				<button
					type="button"
					onclick={handleRefreshClick}
					disabled={isRefreshing}
					class="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
					title="লাইভ কুরিয়ার এপিআই থেকে রিফ্রেশ করুন"
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
				কাস্টমারের ফোন নম্বর অনুযায়ী যুক্তকৃত Steadfast বা Pathao কুরিয়ার থেকে লাইভ ডেলিভারি রেট ও রেকর্ড আসবে।
			</p>
		</div>
	{:else if !stats?.isConfigured}
		<!-- Unconfigured Courier State -->
		<div class="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2 text-center">
			<div class="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-800">
				<AlertCircle class="w-4 h-4 text-amber-600" />
				<span>কুরিয়ার API কনফিগার করা নেই</span>
			</div>
			<p class="text-[11px] text-slate-600 leading-relaxed">
				কাস্টমারের পার্সেল হিস্ট্রি ও ডেলিভারি সাকসেস রেট লাইভ দেখতে সেটিংস থেকে আপনার কুরিয়ার API Key যুক্ত করুন।
			</p>
			<div class="pt-1.5 border-t border-amber-200/80">
				<a
					href="/admin/settings/courier"
					class="text-xs text-indigo-700 font-bold hover:underline inline-flex items-center gap-1"
				>
					<Settings class="w-3.5 h-3.5 text-indigo-600" />
					<span>Settings > Courier থেকে API সেটআপ করুন ➔</span>
				</a>
			</div>
		</div>
	{:else if isNewCustomer}
		<!-- Phone is typed, and courier IS configured, but no delivery history -->
		<div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-center">
			<div class="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
				<CheckCircle2 class="w-4 h-4 text-emerald-500" />
				<span>নতুন কাস্টমার (রেকর্ড নেই)</span>
			</div>
			<p class="text-[11px] text-slate-500">
				যুক্তকৃত কুরিয়ারে ({stats?.courierName || 'কুরিয়ার নেটওয়ার্ক'}) এই ফোন নম্বরে পূর্ববর্তী কোনো ক্যান্সেল বা রিটার্ন হিস্ট্রি পাওয়া যায়নি।
			</p>
		</div>
	{:else}
		<!-- Risk Assessment Status Pill for Returning / Evaluated Customer -->
		<div class="flex items-center justify-between p-2 rounded-xl border text-xs font-bold {riskStatus.color}">
			<div class="flex items-center gap-1.5">
				{#if riskStatus.level === 'low'}
					<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
				{:else if riskStatus.level === 'high'}
					<AlertTriangle class="w-4 h-4 text-rose-600 shrink-0" />
				{:else}
					<Truck class="w-4 h-4 text-amber-600 shrink-0" />
				{/if}
				<span>{riskStatus.label}</span>
			</div>
			<span class="font-mono text-sm">{stats!.successRate}%</span>
		</div>

		<!-- Progress Bar -->
		<div class="space-y-1">
			<div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
				<div
					class="h-full rounded-full transition-all duration-500 {riskStatus.barColor}"
					style="width: {stats!.successRate}%"
				></div>
			</div>
			<div class="flex justify-between text-[10px] text-slate-400 font-medium">
				<span>সাকসেস রেট</span>
				<span class="font-semibold text-slate-600">{stats!.courierName || 'কুরিয়ার নেটওয়ার্ক'}</span>
			</div>
		</div>

		<!-- Mini Metrics Grid -->
		<div class="grid grid-cols-3 gap-2 text-center pt-1">
			<div class="bg-slate-50 p-2 rounded-xl border border-slate-100">
				<span class="text-[10px] font-bold text-slate-500 block">মোট অর্ডার</span>
				<span class="text-sm font-black font-mono text-slate-900">{stats!.total}</span>
			</div>
			<div class="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
				<span class="text-[10px] font-bold text-emerald-700 block">রিসিভড</span>
				<span class="text-sm font-black font-mono text-emerald-700">{stats!.delivered}</span>
			</div>
			<div class="bg-rose-50/60 p-2 rounded-xl border border-rose-100">
				<span class="text-[10px] font-bold text-rose-700 block">ক্যান্সেল</span>
				<span class="text-sm font-black font-mono text-rose-700">{stats!.cancelled}</span>
			</div>
		</div>
	{/if}
</Card>
