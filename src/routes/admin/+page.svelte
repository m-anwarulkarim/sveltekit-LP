<script lang="ts">
	import {
		DollarSign,
		TrendingUp,
		Inbox,
		CheckCircle2,
		Truck,
		Trash2,
		Tag,
		ArrowRight,
		Package
	} from 'lucide-svelte';

	let { data }: { data: any } = $props();

	let webOrders = $derived(
		(data.orders || []).filter((o: any) =>
			['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold', 'recall'].includes(o.status)
		)
	);

	let orderListOrders = $derived(
		(data.orders || []).filter((o: any) =>
			['confirmed', 'printed', 'entry_done', 'shipped', 'delivered', 'partial_delivered', 'pending_return', 'returned', 'missing'].includes(o.status)
		)
	);

	let trashedOrders = $derived((data.orders || []).filter((o: any) => o.status === 'cancelled'));

	// 7-day trend telemetry points
	const trendData = [
		{ date: '১৫ অক্টো', sales: 3400, orders: 4, x: 50, ySales: 160 },
		{ date: '১৬ অক্টো', sales: 4800, orders: 6, x: 140, ySales: 120 },
		{ date: '১৭ অক্টো', sales: 2900, orders: 3, x: 230, ySales: 175 },
		{ date: '১৮ অক্টো', sales: 5200, orders: 7, x: 320, ySales: 110 },
		{ date: '১৯ অক্টো', sales: 4100, orders: 5, x: 410, ySales: 145 },
		{ date: '২০ অক্টো', sales: 6500, orders: 9, x: 500, ySales: 70 },
		{ date: '২১ অক্টো', sales: 5900, orders: 8, x: 590, ySales: 90 }
	];

	let activeChartPoint = $state<{ date: string; sales: number; orders: number } | null>(null);

	function formatTaka(amount: number) {
		return '৳' + (amount || 0).toLocaleString('en-US');
	}

	function parseItems(itemsJson: string) {
		try {
			return JSON.parse(itemsJson);
		} catch {
			return [];
		}
	}
</script>

<div class="space-y-6 max-w-7xl mx-auto">
	
	<!-- 6 KPI Metric Summary Cards -->
	<div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
		
		<!-- 1. Total Revenue -->
		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-slate-500">মোট বিক্রয়</span>
				<div class="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
					<DollarSign class="w-4 h-4" />
				</div>
			</div>
			<div class="text-xl font-black text-slate-900 font-['Outfit'] truncate">
				{formatTaka(data.stats?.totalRevenue || 0)}
			</div>
			<div class="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
				<TrendingUp class="w-3 h-3" />
				<span>+১৮.৪% প্রবৃদ্ধি</span>
			</div>
		</div>

		<!-- 2. Web Orders -->
		<a
			href="/admin/orders?view=web"
			class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all block group"
		>
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-slate-500 group-hover:text-slate-900">ওয়েব অর্ডার</span>
				<div class="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
					<Inbox class="w-4 h-4" />
				</div>
			</div>
			<div class="text-xl font-black text-slate-900 font-['Outfit']">
				{webOrders.length} টি
			</div>
			<div class="mt-1 text-[11px] font-bold text-amber-700 truncate">
				কল প্রয়োজন
			</div>
		</a>

		<!-- 3. Confirmed Orders -->
		<a
			href="/admin/orders?view=list"
			class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all block group"
		>
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-slate-500 group-hover:text-slate-900">কনফার্মড</span>
				<div class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
					<CheckCircle2 class="w-4 h-4" />
				</div>
			</div>
			<div class="text-xl font-black text-slate-900 font-['Outfit']">
				{orderListOrders.length} টি
			</div>
			<div class="mt-1 text-[11px] font-bold text-emerald-600 truncate">
				ডেলিভারি পাইপলাইন
			</div>
		</a>

		<!-- 4. Delivered Orders -->
		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-slate-500">ডেলিভারড</span>
				<div class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
					<Truck class="w-4 h-4" />
				</div>
			</div>
			<div class="text-xl font-black text-slate-900 font-['Outfit']">
				{data.stats?.deliveredCount || 0} টি
			</div>
			<div class="mt-1 text-[11px] font-bold text-emerald-600">
				{data.stats?.deliveredRate || '0'}% সাকসেস
			</div>
		</div>

		<!-- 5. Cancelled / Trashed -->
		<a
			href="/admin/orders?view=trash"
			class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all block group"
		>
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-slate-500 group-hover:text-rose-600">বাতিল</span>
				<div class="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
					<Trash2 class="w-4 h-4" />
				</div>
			</div>
			<div class="text-xl font-black text-slate-900 font-['Outfit']">
				{trashedOrders.length} টি
			</div>
			<div class="mt-1 text-[11px] font-bold text-rose-600">
				{data.stats?.cancelledRate || '0'}% বাতিল
			</div>
		</a>

		<!-- 6. Average Order Value -->
		<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-slate-500">গড় অর্ডার মূল্য</span>
				<div class="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-[#5845eb]">
					<Tag class="w-4 h-4" />
				</div>
			</div>
			<div class="text-xl font-black text-slate-900 font-['Outfit'] truncate">
				{formatTaka(data.stats?.aov || 0)}
			</div>
			<div class="mt-1 text-[11px] font-bold text-slate-500 truncate">
				প্রতি কার্ট ভ্যালু
			</div>
		</div>
	</div>

	<!-- Visual Dual Analytics Section -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		
		<!-- Left 2 Cols: Sales Spline Chart -->
		<div class="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
				<div>
					<h3 class="text-sm font-black text-slate-900">৭ দিনের বিক্রয় ও অর্ডার প্রবাহ</h3>
					<p class="text-xs text-slate-400">লাইভ রেভিনিউ ট্রেন্ড ও ডেলিভারি ট্র্যাকিং</p>
				</div>
				<div class="flex items-center gap-3 text-xs">
					<div class="flex items-center gap-1.5">
						<span class="w-2.5 h-2.5 rounded-full bg-[#5845eb]"></span>
						<span class="text-slate-600 font-bold">বিক্রয়</span>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
						<span class="text-slate-600 font-bold">অর্ডার</span>
					</div>
				</div>
			</div>

			<!-- Interactive SVG Chart Canvas -->
			<div class="relative w-full h-52 flex items-center justify-center overflow-x-auto">
				<svg viewBox="0 0 640 220" class="w-full h-full min-w-[500px] sm:min-w-0 overflow-visible">
					<defs>
						<linearGradient id="areaGradientSales" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stop-color="#5845eb" stop-opacity="0.25" />
							<stop offset="100%" stop-color="#5845eb" stop-opacity="0.0" />
						</linearGradient>
					</defs>

					<!-- Grid lines -->
					<line x1="40" y1="40" x2="600" y2="40" stroke="#f1f5f9" stroke-dasharray="3 3" />
					<line x1="40" y1="90" x2="600" y2="90" stroke="#f1f5f9" stroke-dasharray="3 3" />
					<line x1="40" y1="140" x2="600" y2="140" stroke="#f1f5f9" stroke-dasharray="3 3" />
					<line x1="40" y1="190" x2="600" y2="190" stroke="#f1f5f9" />

					<!-- Sales Area -->
					<polygon
						points="50,190 50,75 140,165 230,125 320,175 410,95 500,45 590,110 590,190"
						fill="url(#areaGradientSales)"
					/>

					<!-- Sales Spline Line -->
					<polyline
						points="50,75 140,165 230,125 320,175 410,95 500,45 590,110"
						fill="none"
						stroke="#5845eb"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>

					<!-- Orders Line -->
					<polyline
						points="50,70 140,135 230,105 320,150 410,85 500,55 590,105"
						fill="none"
						stroke="#d97706"
						stroke-width="2"
						stroke-dasharray="4 4"
						stroke-linecap="round"
					/>

					<!-- Interactive Points -->
					{#each trendData as pt}
						<circle
							role="button"
							tabindex="0"
							aria-label={`${pt.date}: ${pt.sales} Taka`}
							cx={pt.x}
							cy={pt.ySales}
							r="5"
							fill="#ffffff"
							stroke="#5845eb"
							stroke-width="2.5"
							class="cursor-pointer hover:r-7 transition-all"
							onmouseenter={() => (activeChartPoint = pt)}
							onmouseleave={() => (activeChartPoint = null)}
						/>
						<text x={pt.x} y="210" font-size="10" text-anchor="middle" fill="#64748b" font-weight="600">
							{pt.date}
						</text>
					{/each}
				</svg>
			</div>

			<div class="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
				<span>সর্বোচ্চ সেলস: ২১ অক্টো (৳৫,৯০০)</span>
				<span>সাপ্তাহিক মোট: ৳২২,৮০০</span>
			</div>
		</div>

		<!-- Right 1 Col: Donut Ratio Breakdown -->
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
			<div>
				<h3 class="text-sm font-black text-slate-900">অর্ডার স্থিতি বিভাজন</h3>
				<p class="text-xs text-slate-400">লাইভ পাইপলাইন অনুপাত</p>
			</div>

			<div class="my-4 flex items-center justify-center">
				<div class="relative w-36 h-36 flex items-center justify-center">
					<svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
						<circle cx="50" cy="50" r="40" stroke="#f1f5f9" stroke-width="12" fill="none" />
						<circle
							cx="50" cy="50" r="40"
							stroke="#047857" stroke-width="12" fill="none"
							stroke-dasharray="251.2"
							stroke-dashoffset={251.2 * (1 - ((data.stats?.deliveredCount || 0) / (data.orders?.length || 1)))}
							stroke-linecap="round"
						/>
					</svg>
					<div class="absolute inset-0 flex flex-col items-center justify-center text-center">
						<span class="text-2xl font-black text-slate-900 font-['Outfit']">{data.stats?.deliveredRate || '0'}%</span>
						<span class="text-[9px] font-bold text-slate-400 uppercase">ডেলিভারড</span>
					</div>
				</div>
			</div>

			<div class="space-y-2 text-xs">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full bg-[#047857]"></span>
						<span class="text-slate-600">ডেলিভারড</span>
					</div>
					<span class="font-bold text-slate-900">{data.stats?.deliveredCount || 0} টি</span>
				</div>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full bg-[#5845eb]"></span>
						<span class="text-slate-600">ওয়েব অর্ডার</span>
					</div>
					<span class="font-bold text-slate-900">{webOrders.length} টি</span>
				</div>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
						<span class="text-slate-600">বাতিল</span>
					</div>
					<span class="font-bold text-slate-900">{trashedOrders.length} টি</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Recent Web Orders Quick Preview -->
	<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
		<div class="p-4 border-b border-slate-100 flex items-center justify-between">
			<div>
				<h3 class="text-sm font-bold text-slate-900">সাম্প্রতিক ওয়েব অর্ডারসমূহ</h3>
				<p class="text-xs text-slate-400">কনফার্মেশন ও কলের অপেক্ষায় থাকা অর্ডার</p>
			</div>

			<a
				href="/admin/orders?view=web"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#5845eb] text-xs font-bold transition-colors"
			>
				<span>সব অর্ডার দেখুন</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead>
					<tr class="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
						<th class="py-3 px-4">অর্ডার আইডি</th>
						<th class="py-3 px-4">গ্রাহক</th>
						<th class="py-3 px-4">ঠিকানা</th>
						<th class="py-3 px-4">মোবাইল নম্বর</th>
						<th class="py-3 px-4">মূল্য</th>
						<th class="py-3 px-4">স্ট্যাটাস</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each webOrders.slice(0, 5) as order}
						{@const parsedItems = parseItems(order.items)}
						{@const firstItem = parsedItems[0] || {}}
						<tr class="hover:bg-slate-50/50">
							<td class="py-3.5 px-4 font-mono font-bold text-[#047857]">#{order.id}</td>
							<td class="py-3.5 px-4 font-bold text-slate-900">{order.customerName}</td>
							<td class="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">{order.shippingAddress}</td>
							<td class="py-3.5 px-4 font-mono">{order.customerEmail}</td>
							<td class="py-3.5 px-4 font-bold text-slate-900">{formatTaka(order.total)}</td>
							<td class="py-3.5 px-4">
								<span class="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
									{order.status}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

</div>
