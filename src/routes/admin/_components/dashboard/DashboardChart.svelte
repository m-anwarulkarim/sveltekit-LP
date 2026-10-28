<script lang="ts">
	interface Props {
		data: any;
	}

	let { data }: Props = $props();

	let activeChartPoint = $state<{ date: string; sales: number; orders: number } | null>(null);

	let allOrders = $derived(data?.orders || []);

	let webOrders = $derived(
		allOrders.filter((o: any) =>
			['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold', 'recall'].includes(o.status)
		)
	);

	let trashedOrders = $derived(allOrders.filter((o: any) => o.status === 'cancelled'));

	// Real 7-day trend telemetry calculation
	let trendData = $derived.by(() => {
		const now = new Date();
		const days: { date: string; sales: number; orders: number; x: number; ySales: number; yOrders: number }[] = [];

		for (let i = 6; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(d.getDate() - i);
			const year = d.getFullYear();
			const month = d.getMonth();
			const day = d.getDate();

			const dateStr = d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });

			const dayOrders = allOrders.filter((o: any) => {
				if (!o.createdAt) return false;
				const orderDate = new Date(o.createdAt);
				return (
					orderDate.getDate() === day &&
					orderDate.getMonth() === month &&
					orderDate.getFullYear() === year
				);
			});

			const activeOrders = dayOrders.filter((o: any) => o.status !== 'cancelled');
			const daySales = activeOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
			const dayOrdersCount = dayOrders.length;

			days.push({
				date: dateStr,
				sales: daySales,
				orders: dayOrdersCount,
				x: 50 + (6 - i) * 90,
				ySales: 190,
				yOrders: 190
			});
		}

		const maxSales = Math.max(100, ...days.map((d) => d.sales));
		const maxOrders = Math.max(5, ...days.map((d) => d.orders));

		return days.map((d) => ({
			...d,
			ySales: d.sales > 0 ? Math.round(190 - (d.sales / maxSales) * 140) : 190,
			yOrders: d.orders > 0 ? Math.round(190 - (d.orders / maxOrders) * 130) : 190
		}));
	});

	let weeklyTotal = $derived(trendData.reduce((sum, d) => sum + d.sales, 0));
	let highestDay = $derived.by(() => {
		let max = trendData[0];
		for (const d of trendData) {
			if (d.sales > (max?.sales || 0)) {
				max = d;
			}
		}
		return max;
	});

	let areaPoints = $derived.by(() => {
		if (trendData.length === 0) return '50,190 590,190';
		const linePts = trendData.map((d) => `${d.x},${d.ySales}`).join(' ');
		return `50,190 ${linePts} 590,190`;
	});

	let salesPoints = $derived(trendData.map((d) => `${d.x},${d.ySales}`).join(' '));
	let ordersPoints = $derived(trendData.map((d) => `${d.x},${d.yOrders}`).join(' '));
</script>

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
			{#if activeChartPoint}
				<div class="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-semibold px-3 py-1 rounded-xl shadow-lg z-20 pointer-events-none">
					{activeChartPoint.date}: ৳{activeChartPoint.sales.toLocaleString('en-US')} ({activeChartPoint.orders} অর্ডার)
				</div>
			{/if}

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
					points={areaPoints}
					fill="url(#areaGradientSales)"
				/>

				<!-- Sales Spline Line -->
				<polyline
					points={salesPoints}
					fill="none"
					stroke="#5845eb"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>

				<!-- Orders Line -->
				<polyline
					points={ordersPoints}
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
			<span>সর্বোচ্চ সেলস: {highestDay?.date || 'আজ'} (৳{highestDay?.sales ? highestDay.sales.toLocaleString('en-US') : '০'})</span>
			<span>সাপ্তাহিক মোট: ৳{weeklyTotal.toLocaleString('en-US')}</span>
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
						stroke-dashoffset={allOrders.length > 0 ? 251.2 * (1 - ((data?.stats?.deliveredCount || 0) / allOrders.length)) : 251.2}
						stroke-linecap="round"
					/>
				</svg>
				<div class="absolute inset-0 flex flex-col items-center justify-center text-center">
					<span class="text-2xl font-black text-slate-900 font-['Outfit']">{data?.stats?.deliveredRate || '0'}%</span>
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
				<span class="font-bold text-slate-900">{data?.stats?.deliveredCount || 0} টি</span>
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
