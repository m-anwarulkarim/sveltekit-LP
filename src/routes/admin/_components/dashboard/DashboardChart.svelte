<script lang="ts">
	import {
		TrendingUp,
		Calendar,
		ShoppingBag,
		ArrowUpRight,
		PieChart,
		Sparkles
	} from 'lucide-svelte';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();

	// Timeframe state: 7 days, 15 days, 30 days
	let selectedTimeframe = $state<'7d' | '15d' | '30d'>('7d');

	let activeChartPoint = $state<{
		date: string;
		fullDate: string;
		sales: number;
		orders: number;
		x: number;
		ySales: number;
		yOrders: number;
	} | null>(null);

	let allOrders = $derived(data?.orders || []);

	// Categorized orders with real D1 counts
	let deliveredOrders = $derived(allOrders.filter((o: any) => o.status === 'delivered'));
	let deliveredCount = $derived(deliveredOrders.length);

	let confirmedOrders = $derived(
		allOrders.filter((o: any) =>
			['confirmed', 'processing', 'printed', 'entry_done', 'shipped'].includes(o.status)
		)
	);

	let webOrders = $derived(
		allOrders.filter((o: any) =>
			!o.isTrashed &&
			['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold'].includes(o.status)
		)
	);

	let trashedOrders = $derived(
		allOrders.filter((o: any) => o.status === 'cancelled' || o.isTrashed)
	);

	let totalCount = $derived(allOrders.length);
	let deliveredRate = $derived(
		totalCount > 0 ? ((deliveredCount / totalCount) * 100).toFixed(1) : '0.0'
	);

	// Trend telemetry calculation based on selected timeframe
	let trendData = $derived.by(() => {
		const now = new Date();
		const daysCount = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '15d' ? 15 : 30;
		const days: {
			date: string;
			fullDate: string;
			sales: number;
			orders: number;
			x: number;
			ySales: number;
			yOrders: number;
		}[] = [];

		const leftMargin = 55;
		const rightMargin = 20;
		const chartWidth = 640;
		const usableWidth = chartWidth - leftMargin - rightMargin;
		const stepX = daysCount > 1 ? usableWidth / (daysCount - 1) : 0;

		for (let i = daysCount - 1; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(d.getDate() - i);
			const year = d.getFullYear();
			const month = d.getMonth();
			const day = d.getDate();

			const dateStr = d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
			const fullDateStr = d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });

			const dayOrders = allOrders.filter((o: any) => {
				if (!o.createdAt) return false;
				const orderDate = new Date(o.createdAt);
				return (
					orderDate.getDate() === day &&
					orderDate.getMonth() === month &&
					orderDate.getFullYear() === year
				);
			});

			const activeOrders = dayOrders.filter((o: any) => o.status !== 'cancelled' && !o.isTrashed);
			const daySales = activeOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
			const dayOrdersCount = activeOrders.length;

			const index = daysCount - 1 - i;
			const x = Math.round(leftMargin + index * stepX);

			days.push({
				date: dateStr,
				fullDate: fullDateStr,
				sales: daySales,
				orders: dayOrdersCount,
				x,
				ySales: 190,
				yOrders: 190
			});
		}

		const maxSales = Math.max(100, ...days.map((d) => d.sales));
		const maxOrders = Math.max(5, ...days.map((d) => d.orders));

		return days.map((d) => ({
			...d,
			ySales: d.sales > 0 ? Math.round(190 - (d.sales / maxSales) * 145) : 190,
			yOrders: d.orders > 0 ? Math.round(190 - (d.orders / maxOrders) * 135) : 190
		}));
	});

	let maxPeriodSales = $derived(Math.max(100, ...trendData.map((d) => d.sales)));
	let periodTotalSales = $derived(trendData.reduce((sum, d) => sum + d.sales, 0));
	let periodTotalOrders = $derived(trendData.reduce((sum, d) => sum + d.orders, 0));

	let highestDay = $derived.by(() => {
		let max = trendData[0];
		for (const d of trendData) {
			if (d.sales > (max?.sales || 0)) {
				max = d;
			}
		}
		return max;
	});

	// Smooth Cubic Bezier Spline Generator for Sales & Orders
	function getSplinePath(points: { x: number; y: number }[]): string {
		if (points.length === 0) return '';
		if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
		if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

		let d = `M ${points[0].x} ${points[0].y}`;
		const tension = 0.2;

		for (let i = 0; i < points.length - 1; i++) {
			const p0 = points[i === 0 ? 0 : i - 1];
			const p1 = points[i];
			const p2 = points[i + 1];
			const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

			const cp1x = p1.x + (p2.x - p0.x) * tension;
			let cp1y = p1.y + (p2.y - p0.y) * tension;
			const cp2x = p2.x - (p3.x - p1.x) * tension;
			let cp2y = p2.y - (p3.y - p1.y) * tension;

			// Prevent curve drooping below 190 or above 35
			cp1y = Math.min(190, Math.max(35, cp1y));
			cp2y = Math.min(190, Math.max(35, cp2y));

			d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
		}
		return d;
	}

	function getSplineAreaPath(points: { x: number; y: number }[], baseY = 190): string {
		if (points.length === 0) return '';
		const spline = getSplinePath(points);
		const first = points[0];
		const last = points[points.length - 1];
		return `${spline} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
	}

	let salesSplinePoints = $derived(trendData.map((d) => ({ x: d.x, y: d.ySales })));
	let ordersSplinePoints = $derived(trendData.map((d) => ({ x: d.x, y: d.yOrders })));

	let salesSplineD = $derived(getSplinePath(salesSplinePoints));
	let salesAreaD = $derived(getSplineAreaPath(salesSplinePoints, 190));
	let ordersSplineD = $derived(getSplinePath(ordersSplinePoints));

	// Multi-segment Donut calculations
	let donutSegments = $derived.by(() => {
		const total = totalCount;
		if (total === 0) return [];
		const C = 251.32; // 2 * pi * 40
		let offset = 0;

		const groups = [
			{ key: 'delivered', label: 'ডেলিভারড', count: deliveredCount, color: '#059669', dot: 'bg-emerald-500' },
			{ key: 'confirmed', label: 'কনফার্মড / শিপড', count: confirmedOrders.length, color: '#0284c7', dot: 'bg-sky-500' },
			{ key: 'web', label: 'ওয়েব অর্ডার', count: webOrders.length, color: '#5845eb', dot: 'bg-[#5845eb]' },
			{ key: 'trashed', label: 'বাতিল', count: trashedOrders.length, color: '#f43f5e', dot: 'bg-rose-500' }
		];

		return groups.map((g) => {
			const segmentLen = (g.count / total) * C;
			const segOffset = -offset;
			offset += segmentLen;
			return {
				...g,
				percent: ((g.count / total) * 100).toFixed(1),
				strokeDasharray: `${segmentLen.toFixed(2)} ${(C - segmentLen).toFixed(2)}`,
				strokeDashoffset: segOffset.toFixed(2)
			};
		});
	});

	function formatTaka(val: number) {
		return '৳' + Math.round(val || 0).toLocaleString('en-US');
	}
</script>

<!-- Visual Dual Analytics Section -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
	<!-- Left 2 Cols: Sales & Orders Spline Chart -->
	<div class="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
		<!-- Chart Header & Timeframe Tabs -->
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
			<div>
				<div class="flex items-center gap-2">
					<h3 class="text-sm font-black text-slate-900">
						{selectedTimeframe === '7d' ? '৭ দিনের' : selectedTimeframe === '15d' ? '১৫ দিনের' : '৩০ দিনের'} বিক্রয় ও অর্ডার প্রবাহ
					</h3>
					<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-[#5845eb] border border-indigo-200">
						<Sparkles class="w-3 h-3 text-[#5845eb]" />
						<span>লাইভ ট্রেন্ড</span>
					</span>
				</div>
				<p class="text-xs text-slate-400 mt-0.5">রেভিনিউ কার্ভ ও ডেইলি পার্সেল বুকিং অগ্রগতি</p>
			</div>

			<div class="flex items-center gap-3">
				<!-- Legend -->
				<div class="hidden sm:flex items-center gap-3 text-xs">
					<div class="flex items-center gap-1.5">
						<span class="w-2.5 h-2.5 rounded-full bg-[#5845eb]"></span>
						<span class="text-slate-600 font-bold">বিক্রয়</span>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
						<span class="text-slate-600 font-bold">অর্ডার</span>
					</div>
				</div>

				<!-- Timeframe Filter Toggle -->
				<div class="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
					<button
						type="button"
						onclick={() => (selectedTimeframe = '7d')}
						class="px-2.5 py-1 rounded-lg transition-all cursor-pointer {selectedTimeframe === '7d' ? 'bg-white text-[#5845eb] shadow-2xs' : 'text-slate-600 hover:text-slate-900'}"
					>
						৭ দিন
					</button>
					<button
						type="button"
						onclick={() => (selectedTimeframe = '15d')}
						class="px-2.5 py-1 rounded-lg transition-all cursor-pointer {selectedTimeframe === '15d' ? 'bg-white text-[#5845eb] shadow-2xs' : 'text-slate-600 hover:text-slate-900'}"
					>
						১৫ দিন
					</button>
					<button
						type="button"
						onclick={() => (selectedTimeframe = '30d')}
						class="px-2.5 py-1 rounded-lg transition-all cursor-pointer {selectedTimeframe === '30d' ? 'bg-white text-[#5845eb] shadow-2xs' : 'text-slate-600 hover:text-slate-900'}"
					>
						৩০ দিন
					</button>
				</div>
			</div>
		</div>

		<!-- Interactive SVG Chart Canvas -->
		<div class="relative w-full h-56 flex items-center justify-center overflow-x-auto select-none">
			<!-- Floating Hover Info Card -->
			{#if activeChartPoint}
				<div class="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xs text-white text-xs px-3.5 py-1.5 rounded-xl shadow-xl z-20 flex items-center gap-2.5 border border-slate-700/80 pointer-events-none transition-all">
					<div class="flex items-center gap-1 font-bold text-slate-200">
						<Calendar class="w-3.5 h-3.5 text-indigo-400" />
						<span>{activeChartPoint.fullDate}</span>
					</div>
					<div class="h-3 w-px bg-slate-700"></div>
					<div class="flex items-center gap-1">
						<span class="w-2 h-2 rounded-full bg-[#5845eb]"></span>
						<span class="font-bold text-indigo-200">{formatTaka(activeChartPoint.sales)}</span>
					</div>
					<div class="h-3 w-px bg-slate-700"></div>
					<div class="flex items-center gap-1">
						<span class="w-2 h-2 rounded-full bg-amber-400"></span>
						<span class="font-bold text-amber-200">{activeChartPoint.orders} টি অর্ডার</span>
					</div>
				</div>
			{/if}

			<svg viewBox="0 0 640 220" class="w-full h-full min-w-[540px] sm:min-w-0 overflow-visible">
				<defs>
					<linearGradient id="areaGradientSalesSmooth" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#5845eb" stop-opacity="0.30" />
						<stop offset="60%" stop-color="#5845eb" stop-opacity="0.08" />
						<stop offset="100%" stop-color="#5845eb" stop-opacity="0.0" />
					</linearGradient>
					<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
						<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#5845eb" flood-opacity="0.3" />
					</filter>
				</defs>

				<!-- Y-Axis Value Labels & Horizontal Gridlines -->
				<!-- Top line -->
				<text x="48" y="44" font-size="9" text-anchor="end" fill="#94a3b8" font-weight="600" class="font-mono">
					{formatTaka(maxPeriodSales)}
				</text>
				<line x1="55" y1="40" x2="620" y2="40" stroke="#f1f5f9" stroke-dasharray="3 3" />

				<!-- Mid line -->
				<text x="48" y="119" font-size="9" text-anchor="end" fill="#94a3b8" font-weight="600" class="font-mono">
					{formatTaka(maxPeriodSales / 2)}
				</text>
				<line x1="55" y1="115" x2="620" y2="115" stroke="#f1f5f9" stroke-dasharray="3 3" />

				<!-- Bottom Baseline -->
				<text x="48" y="193" font-size="9" text-anchor="end" fill="#94a3b8" font-weight="600" class="font-mono">
					৳০
				</text>
				<line x1="55" y1="190" x2="620" y2="190" stroke="#e2e8f0" stroke-width="1.5" />

				<!-- Active Guide Line on Hover -->
				{#if activeChartPoint}
					<line
						x1={activeChartPoint.x}
						y1="35"
						x2={activeChartPoint.x}
						y2="190"
						stroke="#5845eb"
						stroke-width="1.5"
						stroke-dasharray="3 3"
						opacity="0.6"
					/>
				{/if}

				<!-- Sales Area with Gradient -->
				<path
					d={salesAreaD}
					fill="url(#areaGradientSalesSmooth)"
				/>

				<!-- Orders Spline Curve (Amber Dashed Line) -->
				<path
					d={ordersSplineD}
					fill="none"
					stroke="#d97706"
					stroke-width="2"
					stroke-dasharray="4 4"
					stroke-linecap="round"
					opacity="0.8"
				/>

				<!-- Sales Spline Curve (Smooth Indigo Line) -->
				<path
					d={salesSplineD}
					fill="none"
					stroke="#5845eb"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
					filter="url(#glow)"
				/>

				<!-- Interactive Day Slices & Circles -->
				{#each trendData as pt, idx}
					{@const isHovered = activeChartPoint?.x === pt.x}
					{@const stepWidth = trendData.length > 1 ? 565 / (trendData.length - 1) : 40}

					<!-- Transparent Hover Column for easy targeting -->
					<rect
						x={pt.x - stepWidth / 2}
						y="30"
						width={stepWidth}
						height="165"
						fill="transparent"
						class="cursor-pointer"
						onmouseenter={() => (activeChartPoint = pt)}
						onmouseleave={() => (activeChartPoint = null)}
					/>

					<!-- Sales Point Circle -->
					<circle
						cx={pt.x}
						cy={pt.ySales}
						r={isHovered ? '6.5' : pt.sales > 0 ? '4.5' : '3'}
						fill={isHovered ? '#5845eb' : '#ffffff'}
						stroke="#5845eb"
						stroke-width={isHovered ? '2.5' : '2'}
						class="pointer-events-none transition-all duration-200"
					/>

					<!-- Active Outer Halo Ring -->
					{#if isHovered}
						<circle
							cx={pt.x}
							cy={pt.ySales}
							r="11"
							fill="#5845eb"
							fill-opacity="0.18"
							class="pointer-events-none"
						/>
					{/if}

					<!-- X-axis Date Text (filter labels for 15d and 30d so text doesn't overlap) -->
					{#if selectedTimeframe === '7d' || (selectedTimeframe === '15d' && idx % 2 === 0) || (selectedTimeframe === '30d' && idx % 5 === 0) || idx === trendData.length - 1}
						<text
							x={pt.x}
							y="208"
							font-size="9"
							text-anchor="middle"
							fill={isHovered ? '#1e293b' : '#64748b'}
							font-weight={isHovered ? '800' : '600'}
							class="transition-colors pointer-events-none"
						>
							{pt.date}
						</text>
					{/if}
				{/each}
			</svg>
		</div>

		<!-- Bottom Telemetry Bar -->
		<div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2.5 border-t border-slate-100">
			<div class="flex items-center gap-1.5 font-medium">
				<ArrowUpRight class="w-3.5 h-3.5 text-emerald-600" />
				<span>
					সর্বোচ্চ সেলস: <strong class="text-slate-900">{highestDay?.date || 'আজ'} ({formatTaka(highestDay?.sales || 0)})</strong>
				</span>
			</div>
			<div class="flex items-center gap-3">
				<span>মোট অর্ডার: <strong class="text-slate-900">{periodTotalOrders} টি</strong></span>
				<span class="text-slate-300">|</span>
				<span>মোট বিক্রয়: <strong class="text-[#5845eb] font-bold">{formatTaka(periodTotalSales)}</strong></span>
			</div>
		</div>
	</div>

	<!-- Right 1 Col: Donut Ratio Breakdown -->
	<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
		<div>
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-black text-slate-900">অর্ডার স্থিতি বিভাজন</h3>
				<span class="text-[11px] font-bold text-slate-400">মোট {totalCount} টি</span>
			</div>
			<p class="text-xs text-slate-400 mt-0.5">লাইভ পাইপলাইন অনুপাত ও রেশিও</p>
		</div>

		<!-- Segmented SVG Donut Ring -->
		<div class="my-4 flex items-center justify-center">
			<div class="relative w-40 h-40 flex items-center justify-center">
				<svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
					<!-- Base background circle -->
					<circle
						cx="50"
						cy="50"
						r="40"
						stroke="#f1f5f9"
						stroke-width="11"
						fill="none"
					/>

					<!-- Multi-status segments -->
					{#if totalCount > 0}
						{#each donutSegments as seg}
							{#if seg.count > 0}
								<circle
									cx="50"
									cy="50"
									r="40"
									stroke={seg.color}
									stroke-width="11"
									fill="none"
									stroke-dasharray={seg.strokeDasharray}
									stroke-dashoffset={seg.strokeDashoffset}
									class="transition-all duration-500"
								/>
							{/if}
						{/each}
					{:else}
						<circle
							cx="50"
							cy="50"
							r="40"
							stroke="#e2e8f0"
							stroke-width="11"
							fill="none"
							stroke-dasharray="251.32"
							stroke-dashoffset="0"
						/>
					{/if}
				</svg>

				<!-- Center Rate Metric -->
				<div class="absolute inset-0 flex flex-col items-center justify-center text-center">
					<span class="text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
						{deliveredRate}%
					</span>
					<span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
						ডেলিভারি রেট
					</span>
				</div>
			</div>
		</div>

		<!-- Detailed Category Breakdown Legend -->
		<div class="space-y-2 text-xs">
			<div class="flex items-center justify-between py-1 border-b border-slate-50">
				<div class="flex items-center gap-2">
					<span class="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
					<span class="text-slate-600 font-medium">ডেলিভারড</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="font-bold text-slate-900">{deliveredCount} টি</span>
					<span class="text-[10px] text-slate-400 font-mono">({totalCount > 0 ? ((deliveredCount / totalCount) * 100).toFixed(0) : 0}%)</span>
				</div>
			</div>

			<div class="flex items-center justify-between py-1 border-b border-slate-50">
				<div class="flex items-center gap-2">
					<span class="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
					<span class="text-slate-600 font-medium">কনফার্মড / শিপড</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="font-bold text-slate-900">{confirmedOrders.length} টি</span>
					<span class="text-[10px] text-slate-400 font-mono">({totalCount > 0 ? ((confirmedOrders.length / totalCount) * 100).toFixed(0) : 0}%)</span>
				</div>
			</div>

			<div class="flex items-center justify-between py-1 border-b border-slate-50">
				<div class="flex items-center gap-2">
					<span class="w-2.5 h-2.5 rounded-full bg-[#5845eb]"></span>
					<span class="text-slate-600 font-medium">ওয়েব অর্ডার (পেন্ডিং)</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="font-bold text-slate-900">{webOrders.length} টি</span>
					<span class="text-[10px] text-slate-400 font-mono">({totalCount > 0 ? ((webOrders.length / totalCount) * 100).toFixed(0) : 0}%)</span>
				</div>
			</div>

			<div class="flex items-center justify-between py-1">
				<div class="flex items-center gap-2">
					<span class="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></span>
					<span class="text-slate-600 font-medium">বাতিল / ট্র্যাশ</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="font-bold text-slate-900">{trashedOrders.length} টি</span>
					<span class="text-[10px] text-slate-400 font-mono">({totalCount > 0 ? ((trashedOrders.length / totalCount) * 100).toFixed(0) : 0}%)</span>
				</div>
			</div>
		</div>
	</div>
</div>
