<script lang="ts">
	import { Button } from '#lib/components/ui';
	import {
		DollarSign,
		TrendingUp,
		Inbox,
		CheckCircle2,
		Truck,
		Trash2,
		Tag,
		ChevronDown,
		ChevronUp,
		Clock,
		AlertTriangle,
		PhoneMissed,
		ThumbsUp,
		Phone,
		PauseCircle,
		RotateCcw,
		Printer,
		ClipboardCheck,
		ShieldCheck,
		PackageCheck,
		AlertCircle,
		XCircle,
		HelpCircle
	} from 'lucide-svelte';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();

	let isExpanded = $state(false);

	let orders = $derived(data?.orders || []);

	// Summary counts
	let webOrders = $derived(
		orders.filter((o: any) =>
			['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold', 'recall'].includes(o.status)
		)
	);

	let orderListOrders = $derived(
		orders.filter((o: any) =>
			['processing', 'confirmed', 'printed', 'entry_done', 'shipped', 'delivered', 'partial_delivered', 'pending_return', 'returned', 'missing'].includes(o.status)
		)
	);

	let trashedOrders = $derived(orders.filter((o: any) => o.status === 'cancelled'));

	// Web Orders (Pre-Confirmation) Status Counts
	let pendingCount = $derived(orders.filter((o: any) => o.status === 'pending').length);
	let incompleteCount = $derived(orders.filter((o: any) => o.status === 'incomplete').length);
	let noResponseCount = $derived(orders.filter((o: any) => o.status === 'no_response' || o.status === 'no_response_3').length);
	let goodNoResponseCount = $derived(orders.filter((o: any) => o.status === 'good_no_response').length);
	let busyCount = $derived(orders.filter((o: any) => o.status === 'busy').length);
	let holdCount = $derived(orders.filter((o: any) => o.status === 'hold').length);
	let recallCount = $derived(orders.filter((o: any) => o.status === 'recall').length);

	// Order List (Post-Confirmation) Status Counts
	let processingCount = $derived(orders.filter((o: any) => o.status === 'processing').length);
	let confirmedCount = $derived(orders.filter((o: any) => o.status === 'confirmed').length);
	let printedCount = $derived(orders.filter((o: any) => o.status === 'printed').length);
	let entryDoneCount = $derived(orders.filter((o: any) => o.status === 'entry_done').length);
	let shippedCount = $derived(orders.filter((o: any) => o.status === 'shipped').length);
	let deliveredCount = $derived(orders.filter((o: any) => o.status === 'delivered').length);
	let partialDeliveredCount = $derived(orders.filter((o: any) => o.status === 'partial_delivered').length);
	let pendingReturnCount = $derived(orders.filter((o: any) => o.status === 'pending_return').length);
	let returnedCount = $derived(orders.filter((o: any) => o.status === 'returned').length);
	let cancelledCount = $derived(orders.filter((o: any) => o.status === 'cancelled').length);
	let missingCount = $derived(orders.filter((o: any) => o.status === 'missing').length);

	function formatTaka(amount: number) {
		return '৳' + (amount || 0).toLocaleString('en-US');
	}

	// Web Orders (Pre-Confirmation) Statuses - Colorful Tints
	let webStatusList = $derived([
		{
			id: 'pending',
			label: 'পেন্ডিং',
			enLabel: 'Pending',
			count: pendingCount,
			icon: Clock,
			cardClass: 'bg-[#fffbeb] border-[#fde68a] hover:border-amber-400 text-amber-950',
			iconBox: 'bg-amber-500 text-white shadow-xs shadow-amber-500/20',
			badgeClass: 'text-amber-800 bg-amber-100/80',
			href: '/admin/orders?status=pending'
		},
		{
			id: 'incomplete',
			label: 'ইনকমপ্লিট',
			enLabel: 'Incomplete',
			count: incompleteCount,
			icon: AlertTriangle,
			cardClass: 'bg-[#fff7ed] border-[#fed7aa] hover:border-orange-400 text-orange-950',
			iconBox: 'bg-orange-500 text-white shadow-xs shadow-orange-500/20',
			badgeClass: 'text-orange-800 bg-orange-100/80',
			href: '/admin/orders?status=incomplete'
		},
		{
			id: 'no_response',
			label: 'নো রেসপন্স',
			enLabel: 'No Response',
			count: noResponseCount,
			icon: PhoneMissed,
			cardClass: 'bg-[#fefce8] border-[#fef08a] hover:border-yellow-400 text-yellow-950',
			iconBox: 'bg-yellow-500 text-white shadow-xs shadow-yellow-500/20',
			badgeClass: 'text-yellow-800 bg-yellow-100/80',
			href: '/admin/orders?status=no_response'
		},
		{
			id: 'good_no_response',
			label: 'গুড বাট নো রেসপন্স',
			enLabel: 'Good No Response',
			count: goodNoResponseCount,
			icon: ThumbsUp,
			cardClass: 'bg-[#eff6ff] border-[#bfdbfe] hover:border-blue-400 text-blue-950',
			iconBox: 'bg-blue-500 text-white shadow-xs shadow-blue-500/20',
			badgeClass: 'text-blue-800 bg-blue-100/80',
			href: '/admin/orders?status=good_no_response'
		},
		{
			id: 'busy',
			label: 'বিজি',
			enLabel: 'Busy',
			count: busyCount,
			icon: Phone,
			cardClass: 'bg-[#f8fafc] border-[#cbd5e1] hover:border-slate-400 text-slate-900',
			iconBox: 'bg-slate-600 text-white shadow-xs shadow-slate-500/20',
			badgeClass: 'text-slate-800 bg-slate-200/80',
			href: '/admin/orders?status=busy'
		},
		{
			id: 'hold',
			label: 'হোল্ড',
			enLabel: 'Hold',
			count: holdCount,
			icon: PauseCircle,
			cardClass: 'bg-[#eef2ff] border-[#c7d2fe] hover:border-indigo-400 text-indigo-950',
			iconBox: 'bg-[#5845eb] text-white shadow-xs shadow-indigo-500/20',
			badgeClass: 'text-indigo-800 bg-indigo-100/80',
			href: '/admin/orders?status=hold'
		},
		{
			id: 'recall',
			label: 'রি-কল',
			enLabel: 'Recall',
			count: recallCount,
			icon: RotateCcw,
			cardClass: 'bg-[#faf5ff] border-[#e9d5ff] hover:border-purple-400 text-purple-950',
			iconBox: 'bg-purple-600 text-white shadow-xs shadow-purple-500/20',
			badgeClass: 'text-purple-800 bg-purple-100/80',
			href: '/admin/orders?status=recall'
		}
	]);

	// Order List (Post-Confirmation) Statuses - Colorful Tints
	let pipelineStatusList = $derived([
		{
			id: 'processing',
			label: 'প্রসেসিং',
			enLabel: 'Processing',
			count: processingCount,
			icon: CheckCircle2,
			cardClass: 'bg-[#ecfdf5] border-[#a7f3d0] hover:border-emerald-400 text-emerald-950',
			iconBox: 'bg-emerald-600 text-white shadow-xs shadow-emerald-500/20',
			badgeClass: 'text-emerald-800 bg-emerald-100/80',
			href: '/admin/orders/list?status=processing'
		},
		{
			id: 'confirmed',
			label: 'কনফার্মড',
			enLabel: 'Confirmed',
			count: confirmedCount,
			icon: CheckCircle2,
			cardClass: 'bg-[#f0fdf4] border-[#bbf7d0] hover:border-green-400 text-green-950',
			iconBox: 'bg-green-600 text-white shadow-xs shadow-green-500/20',
			badgeClass: 'text-green-800 bg-green-100/80',
			href: '/admin/orders/list?status=confirmed'
		},
		{
			id: 'printed',
			label: 'প্রিন্টেড',
			enLabel: 'Printed',
			count: printedCount,
			icon: Printer,
			cardClass: 'bg-[#ecfeff] border-[#a5f3fc] hover:border-cyan-400 text-cyan-950',
			iconBox: 'bg-cyan-600 text-white shadow-xs shadow-cyan-500/20',
			badgeClass: 'text-cyan-800 bg-cyan-100/80',
			href: '/admin/orders/list?status=printed'
		},
		{
			id: 'entry_done',
			label: 'এন্ট্রি ডান',
			enLabel: 'Entry Done',
			count: entryDoneCount,
			icon: ClipboardCheck,
			cardClass: 'bg-[#f0fdfa] border-[#99f6e4] hover:border-teal-400 text-teal-950',
			iconBox: 'bg-teal-600 text-white shadow-xs shadow-teal-500/20',
			badgeClass: 'text-teal-800 bg-teal-100/80',
			href: '/admin/orders/list?status=entry_done'
		},
		{
			id: 'shipped',
			label: 'শিপড',
			enLabel: 'Shipped',
			count: shippedCount,
			icon: Truck,
			cardClass: 'bg-[#f0f9ff] border-[#bae6fd] hover:border-sky-400 text-sky-950',
			iconBox: 'bg-sky-500 text-white shadow-xs shadow-sky-500/20',
			badgeClass: 'text-sky-800 bg-sky-100/80',
			href: '/admin/orders/list?status=shipped'
		},
		{
			id: 'delivered',
			label: 'ডেলিভারড',
			enLabel: 'Delivered',
			count: deliveredCount,
			icon: ShieldCheck,
			cardClass: 'bg-[#ecfdf5] border-[#6ee7b7] hover:border-emerald-500 text-emerald-950',
			iconBox: 'bg-emerald-600 text-white shadow-xs shadow-emerald-500/20',
			badgeClass: 'text-emerald-800 bg-emerald-100/80',
			href: '/admin/orders/list?status=delivered'
		},
		{
			id: 'partial_delivered',
			label: 'পার্শিয়াল',
			enLabel: 'Partial Delivered',
			count: partialDeliveredCount,
			icon: PackageCheck,
			cardClass: 'bg-[#f7fee7] border-[#d9f99d] hover:border-lime-400 text-lime-950',
			iconBox: 'bg-lime-600 text-white shadow-xs shadow-lime-500/20',
			badgeClass: 'text-lime-800 bg-lime-100/80',
			href: '/admin/orders/list?status=partial_delivered'
		},
		{
			id: 'pending_return',
			label: 'পেন্ডিং রিটার্ন',
			enLabel: 'Pending Return',
			count: pendingReturnCount,
			icon: AlertCircle,
			cardClass: 'bg-[#fffbeb] border-[#fcd34d] hover:border-amber-500 text-amber-950',
			iconBox: 'bg-amber-600 text-white shadow-xs shadow-amber-500/20',
			badgeClass: 'text-amber-800 bg-amber-100/80',
			href: '/admin/orders/list?status=pending_return'
		},
		{
			id: 'returned',
			label: 'রিটার্ন',
			enLabel: 'Returned',
			count: returnedCount,
			icon: RotateCcw,
			cardClass: 'bg-[#fff1f2] border-[#fecdd3] hover:border-rose-400 text-rose-950',
			iconBox: 'bg-rose-600 text-white shadow-xs shadow-rose-500/20',
			badgeClass: 'text-rose-800 bg-rose-100/80',
			href: '/admin/orders/list?status=returned'
		},
		{
			id: 'cancelled',
			label: 'বাতিল',
			enLabel: 'Cancelled',
			count: cancelledCount,
			icon: XCircle,
			cardClass: 'bg-[#fef2f2] border-[#fca5a5] hover:border-red-400 text-red-950',
			iconBox: 'bg-red-600 text-white shadow-xs shadow-red-500/20',
			badgeClass: 'text-red-800 bg-red-100/80',
			href: '/admin/orders/trash'
		},
		{
			id: 'missing',
			label: 'মিসিং',
			enLabel: 'Missing',
			count: missingCount,
			icon: HelpCircle,
			cardClass: 'bg-[#f1f5f9] border-[#cbd5e1] hover:border-slate-400 text-slate-900',
			iconBox: 'bg-slate-600 text-white shadow-xs shadow-slate-500/20',
			badgeClass: 'text-slate-800 bg-slate-200/80',
			href: '/admin/orders/list?status=missing'
		}
	]);
</script>

<div class="space-y-3.5">
	<!-- 6 Vibrant Colorful KPI Metric Summary Cards -->
	<div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
		
		<!-- 1. Total Revenue (Indigo / Violet Vibrant Theme) -->
		<div class="bg-gradient-to-br from-[#f5f3ff] via-[#ffffff] to-[#ede9fe]/70 p-4 rounded-3xl border border-[#dcd4fe] shadow-xs hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-400 transition-all group">
			<div class="flex items-center justify-between mb-2.5">
				<span class="text-xs font-bold text-indigo-700 tracking-tight">মোট বিক্রয়</span>
				<div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5845eb] to-[#7c3aed] text-white shadow-sm shadow-indigo-500/25 flex items-center justify-center transition-transform group-hover:scale-105">
					<DollarSign class="w-4 h-4 stroke-[2.5]" />
				</div>
			</div>
			<div class="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight truncate">
				{formatTaka(data?.stats?.totalRevenue || 0)}
			</div>
			<div class="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
				<TrendingUp class="w-3 h-3 stroke-[2.5]" />
				<span>+১৮.৪% প্রবৃদ্ধি</span>
			</div>
		</div>

		<!-- 2. Web Orders (Amber / Orange Vibrant Theme) -->
		<a
			href="/admin/orders"
			class="bg-gradient-to-br from-[#fff7ed] via-[#ffffff] to-[#ffedd5]/70 p-4 rounded-3xl border border-[#fed7aa] shadow-xs hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-400 transition-all block group"
		>
			<div class="flex items-center justify-between mb-2.5">
				<span class="text-xs font-bold text-amber-800 tracking-tight">ওয়েব অর্ডার</span>
				<div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/25 flex items-center justify-center transition-transform group-hover:scale-105">
					<Inbox class="w-4 h-4 stroke-[2.5]" />
				</div>
			</div>
			<div class="text-xl sm:text-2xl font-black text-amber-950 font-['Outfit'] tracking-tight">
				{webOrders.length} টি
			</div>
			<div class="mt-2 inline-flex items-center text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-lg border border-amber-200/70 truncate">
				কল প্রয়োজন
			</div>
		</a>

		<!-- 3. Confirmed Orders (Emerald / Green Vibrant Theme) -->
		<a
			href="/admin/orders/list"
			class="bg-gradient-to-br from-[#f0fdf4] via-[#ffffff] to-[#dcfce7]/70 p-4 rounded-3xl border border-[#bbf7d0] shadow-xs hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-400 transition-all block group"
		>
			<div class="flex items-center justify-between mb-2.5">
				<span class="text-xs font-bold text-emerald-800 tracking-tight">কনফার্মড</span>
				<div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25 flex items-center justify-center transition-transform group-hover:scale-105">
					<CheckCircle2 class="w-4 h-4 stroke-[2.5]" />
				</div>
			</div>
			<div class="text-xl sm:text-2xl font-black text-emerald-950 font-['Outfit'] tracking-tight">
				{orderListOrders.length} টি
			</div>
			<div class="mt-2 inline-flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-lg border border-emerald-200/70 truncate">
				ডেলিভারি পাইপলাইন
			</div>
		</a>

		<!-- 4. Delivered Orders (Cyan / Sky Vibrant Theme) -->
		<div class="bg-gradient-to-br from-[#f0f9ff] via-[#ffffff] to-[#e0f2fe]/70 p-4 rounded-3xl border border-[#bae6fd] shadow-xs hover:shadow-lg hover:shadow-sky-500/10 hover:border-sky-400 transition-all group">
			<div class="flex items-center justify-between mb-2.5">
				<span class="text-xs font-bold text-sky-800 tracking-tight">ডেলিভারড</span>
				<div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/25 flex items-center justify-center transition-transform group-hover:scale-105">
					<Truck class="w-4 h-4 stroke-[2.5]" />
				</div>
			</div>
			<div class="text-xl sm:text-2xl font-black text-sky-950 font-['Outfit'] tracking-tight">
				{data?.stats?.deliveredCount || 0} টি
			</div>
			<div class="mt-2 inline-flex items-center text-[11px] font-bold text-sky-800 bg-sky-100/70 px-2 py-0.5 rounded-lg border border-sky-200/70">
				{data?.stats?.deliveredRate || '0'}% সাকসেস
			</div>
		</div>

		<!-- 5. Cancelled / Trashed (Rose / Pink Vibrant Theme) -->
		<a
			href="/admin/orders/trash"
			class="bg-gradient-to-br from-[#fff1f2] via-[#ffffff] to-[#ffe4e6]/70 p-4 rounded-3xl border border-[#fecdd3] shadow-xs hover:shadow-lg hover:shadow-rose-500/10 hover:border-rose-400 transition-all block group"
		>
			<div class="flex items-center justify-between mb-2.5">
				<span class="text-xs font-bold text-rose-800 tracking-tight">বাতিল</span>
				<div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-sm shadow-rose-500/25 flex items-center justify-center transition-transform group-hover:scale-105">
					<Trash2 class="w-4 h-4 stroke-[2.5]" />
				</div>
			</div>
			<div class="text-xl sm:text-2xl font-black text-rose-950 font-['Outfit'] tracking-tight">
				{trashedOrders.length} টি
			</div>
			<div class="mt-2 inline-flex items-center text-[11px] font-bold text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded-lg border border-rose-200/70">
				{data?.stats?.cancelledRate || '0'}% বাতিল
			</div>
		</a>

		<!-- 6. Average Order Value (Violet / Purple Vibrant Theme) -->
		<div class="bg-gradient-to-br from-[#fdf4ff] via-[#ffffff] to-[#fae8ff]/70 p-4 rounded-3xl border border-[#f5d0fe] shadow-xs hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-400 transition-all group">
			<div class="flex items-center justify-between mb-2.5">
				<span class="text-xs font-bold text-purple-800 tracking-tight">গড় অর্ডার মূল্য</span>
				<div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-fuchsia-600 text-white shadow-sm shadow-purple-500/25 flex items-center justify-center transition-transform group-hover:scale-105">
					<Tag class="w-4 h-4 stroke-[2.5]" />
				</div>
			</div>
			<div class="text-xl sm:text-2xl font-black text-purple-950 font-['Outfit'] tracking-tight truncate">
				{formatTaka(data?.stats?.aov || 0)}
			</div>
			<div class="mt-2 inline-flex items-center text-[11px] font-bold text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded-lg border border-purple-200/70 truncate">
				প্রতি কার্ট ভ্যালু
			</div>
		</div>
	</div>

	<!-- "See more" / "See less" Toggle Button (Placed at the exact red highlighted position) -->
	<div class="flex justify-center pt-0.5 pb-0.5">
		<Button
			type="button"
			variant="outline"
			size="sm"
			onclick={() => (isExpanded = !isExpanded)}
			class="rounded-full bg-white hover:bg-indigo-50/80 text-slate-700 hover:text-[#5845eb] border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-md text-xs font-bold px-4 py-1 h-8 gap-1.5 transition-all group cursor-pointer"
		>
			{#if isExpanded}
				<span class="text-[#5845eb]">See less</span>
				<ChevronUp class="w-3.5 h-3.5 text-[#5845eb]" />
			{:else}
				<span>See more</span>
				<ChevronDown class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] transition-transform duration-200" />
			{/if}
		</Button>
	</div>

	<!-- Expanded All Order Statuses Section (Colorful & Vibrant) -->
	{#if isExpanded}
		<div class="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
			<!-- 1. Web Orders Statuses (Pre-Confirmation) -->
			<div class="bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20 p-4 sm:p-5 rounded-3xl border border-amber-200/80 shadow-2xs">
				<div class="flex items-center justify-between mb-3 pb-2 border-b border-amber-100">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50"></span>
						<h3 class="text-xs sm:text-sm font-black text-amber-950 tracking-tight">
							ওয়েব অর্ডার পাইপলাইন (Pre-Confirmation Statuses)
						</h3>
					</div>
					<span class="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
						মোট {webOrders.length} টি
					</span>
				</div>

				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
					{#each webStatusList as st}
						{@const IconComponent = st.icon}
						<a
							href={st.href}
							class="p-3 rounded-2xl border transition-all block group {st.cardClass} shadow-2xs hover:shadow-md"
						>
							<div class="flex items-center justify-between mb-1.5">
								<span class="text-[11px] font-bold truncate">
									{st.label}
								</span>
								<div class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 {st.iconBox}">
									<IconComponent class="w-3 h-3 stroke-[2.5]" />
								</div>
							</div>
							<div class="text-base font-black font-['Outfit']">
								{st.count} টি
							</div>
							<div class="text-[9.5px] font-medium opacity-75 mt-0.5 truncate">
								{st.enLabel}
							</div>
						</a>
					{/each}
				</div>
			</div>

			<!-- 2. Order List Statuses (Post-Confirmation) -->
			<div class="bg-gradient-to-br from-emerald-50/30 via-white to-sky-50/20 p-4 sm:p-5 rounded-3xl border border-emerald-200/80 shadow-2xs">
				<div class="flex items-center justify-between mb-3 pb-2 border-b border-emerald-100">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50"></span>
						<h3 class="text-xs sm:text-sm font-black text-emerald-950 tracking-tight">
							ডেলিভারি পাইপলাইন স্ট্যাটাস (Post-Confirmation Pipeline)
						</h3>
					</div>
					<span class="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
						মোট {orderListOrders.length + trashedOrders.length} টি
					</span>
				</div>

				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
					{#each pipelineStatusList as st}
						{@const IconComponent = st.icon}
						<a
							href={st.href}
							class="p-3 rounded-2xl border transition-all block group {st.cardClass} shadow-2xs hover:shadow-md"
						>
							<div class="flex items-center justify-between mb-1.5">
								<span class="text-[11px] font-bold truncate">
									{st.label}
								</span>
								<div class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 {st.iconBox}">
									<IconComponent class="w-3 h-3 stroke-[2.5]" />
								</div>
							</div>
							<div class="text-base font-black font-['Outfit']">
								{st.count} টি
							</div>
							<div class="text-[9.5px] font-medium opacity-75 mt-0.5 truncate">
								{st.enLabel}
							</div>
						</a>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
