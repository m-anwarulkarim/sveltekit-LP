<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import {
		Calendar,
		Printer,
		FileDown,
		Sparkles,
		ShoppingBag,
		CheckCircle2,
		Clock,
		XCircle,
		RotateCcw,
		CalendarDays
	} from 'lucide-svelte';
	import { Button, Input } from '#lib/components/ui';
	import type { DailyBusinessSummaryData } from '#lib/server/services/report.service';

	let { data }: { data: { summary: DailyBusinessSummaryData } } = $props();

	const todayStr = new Date().toISOString().split('T')[0];

	// Date range state
	let startDate = $state(data?.summary?.startDate || todayStr);
	let endDate = $state(data?.summary?.endDate || todayStr);
	let isGenerating = $state(false);

	$effect(() => {
		if (data?.summary) {
			startDate = data.summary.startDate;
			endDate = data.summary.endDate;
		}
	});

	// Metrics derived from server load
	let summary = $derived(data?.summary || {});
	let totalOrdersReceived = $derived(summary.totalOrdersReceived ?? 0);
	let totalOrdersDelivered = $derived(summary.totalOrdersDelivered ?? 0);
	let totalOrdersPending = $derived(summary.totalOrdersPending ?? 0);
	let totalOrdersCancelled = $derived(summary.totalOrdersCancelled ?? 0);
	let returnOrders = $derived(summary.returnOrders ?? 0);

	let totalOrderValue = $derived(summary.totalOrderValue ?? 0);
	let advanceCollected = $derived(summary.advanceCollected ?? 0);
	let dueAmount = $derived(summary.dueAmount ?? 0);

	let deliveryCharge = $derived(summary.deliveryCharge ?? 0);
	let courierCost = $derived(summary.courierCost ?? 0);
	let packagingCost = $derived(summary.packagingCost ?? 0);
	let netEstimatedProfit = $derived(summary.netEstimatedProfit ?? 0);
	let ordersList = $derived(summary.orders || []);

	async function handleGenerate() {
		if (isGenerating) return;

		if (!startDate || !endDate) {
			toast.error('শুরুর এবং শেষের তারিখ নির্বাচন করুন');
			return;
		}
		if (new Date(startDate) > new Date(endDate)) {
			toast.error('শুরুর তারিখ শেষের তারিখের চেয়ে বেশি হতে পারবে না');
			return;
		}

		isGenerating = true;
		try {
			await goto(`/admin/reports/daily-business-summary?startDate=${startDate}&endDate=${endDate}`, {
				reset: false,
				invalidateAll: true
			});
			toast.success('রিপোর্ট ডাটা সফলভাবে তৈরি হয়েছে');
		} catch (e: any) {
			if (e?.message?.includes('cancelled') || e?.name === 'AbortError') {
				return;
			}
			console.error('Report generate error:', e);
			toast.error('রিপোর্ট লোড করতে সমস্যা হয়েছে');
		} finally {
			isGenerating = false;
		}
	}

	function setQuickRange(preset: 'today' | 'yesterday' | 'week' | 'month' | 'all') {
		const now = new Date();
		if (preset === 'today') {
			startDate = todayStr;
			endDate = todayStr;
		} else if (preset === 'yesterday') {
			const y = new Date(now);
			y.setDate(y.getDate() - 1);
			const yStr = y.toISOString().split('T')[0];
			startDate = yStr;
			endDate = yStr;
		} else if (preset === 'week') {
			const w = new Date(now);
			w.setDate(w.getDate() - 7);
			startDate = w.toISOString().split('T')[0];
			endDate = todayStr;
		} else if (preset === 'month') {
			const m = new Date(now.getFullYear(), now.getMonth(), 1);
			startDate = m.toISOString().split('T')[0];
			endDate = todayStr;
		} else if (preset === 'all') {
			startDate = '2025-01-01';
			endDate = todayStr;
		}
		handleGenerate();
	}

	function handleClear() {
		startDate = todayStr;
		endDate = todayStr;
		handleGenerate();
	}

	function handlePrint() {
		window.print();
	}

	function handleDownloadPDF() {
		window.print();
	}

	function exportToCSV() {
		if (ordersList.length === 0) {
			toast.error('এক্সপোর্ট করার মতো কোনো অর্ডার নেই');
			return;
		}

		const headers = [
			'Order Number',
			'Date',
			'Customer Name',
			'Phone',
			'Status',
			'Total (BDT)',
			'Advance (BDT)',
			'Due (BDT)',
			'Delivery Charge (BDT)',
			'Courier Cost (BDT)'
		];
		const rows = ordersList.map((o) => [
			`"${o.orderNumber}"`,
			`"${o.createdAt}"`,
			`"${o.customerName.replace(/"/g, '""')}"`,
			`"${o.customerPhone}"`,
			o.status,
			o.total,
			o.advancePayment,
			o.dueAmount,
			o.deliveryCharge,
			o.courierCost
		]);

		const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute('download', `Business_Summary_${startDate}_to_${endDate}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success('অর্ডার সামারি CSV ফাইলে ডাউনলোড হয়েছে!');
	}
</script>

<svelte:head>
	<title>Daily Business Summary Report | AURA Reports</title>
</svelte:head>

<div class="space-y-6 max-w-5xl mx-auto pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Page Title Heading -->
	<div>
		<h2 class="text-2xl font-bold text-slate-900 tracking-tight">
			Daily Business Summary Report
		</h2>
		<p class="text-xs text-slate-500 mt-0.5">
			দৈনিক অর্ডার সংখ্যা, ডেলিভারি স্ট্যাটাস ও বিক্রয় আয়ের সমন্বিত বিজনেস সামারি রিপোর্ট
		</p>
	</div>

	<!-- Control Panel (Period Selector + Quick Presets + Action Buttons) -->
	<div
		class="bg-white rounded-2xl border border-slate-200/90 p-4 md:p-5 shadow-2xs flex flex-col space-y-4 print:hidden"
	>
		<!-- Quick Presets -->
		<div class="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
			<span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
				Quick Range:
			</span>
			<button
				type="button"
				onclick={() => setQuickRange('today')}
				class="px-2.5 py-1 text-xs rounded-lg font-semibold border transition-all cursor-pointer {startDate === todayStr && endDate === todayStr ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}"
			>
				Today
			</button>
			<button
				type="button"
				onclick={() => setQuickRange('yesterday')}
				class="px-2.5 py-1 text-xs rounded-lg font-semibold border transition-all cursor-pointer bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
			>
				Yesterday
			</button>
			<button
				type="button"
				onclick={() => setQuickRange('week')}
				class="px-2.5 py-1 text-xs rounded-lg font-semibold border transition-all cursor-pointer bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
			>
				Last 7 Days
			</button>
			<button
				type="button"
				onclick={() => setQuickRange('month')}
				class="px-2.5 py-1 text-xs rounded-lg font-semibold border transition-all cursor-pointer bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
			>
				This Month
			</button>
			<button
				type="button"
				onclick={() => setQuickRange('all')}
				class="px-2.5 py-1 text-xs rounded-lg font-semibold border transition-all cursor-pointer bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
			>
				All Time
			</button>
		</div>

		<!-- Date Inputs & Action Buttons Row -->
		<div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
			<!-- Date Pickers -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
				<div>
					<label for="start-date" class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
						From Date
					</label>
					<div class="relative">
						<Calendar class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
						<input
							id="start-date"
							type="date"
							bind:value={startDate}
							class="w-full pl-10 pr-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
						/>
					</div>
				</div>

				<div>
					<label for="end-date" class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
						To Date
					</label>
					<div class="relative">
						<Calendar class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
						<input
							id="end-date"
							type="date"
							bind:value={endDate}
							class="w-full pl-10 pr-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
						/>
					</div>
				</div>
			</div>

			<!-- Action Buttons: Generate, Clear, Download PDF, Print -->
			<div class="flex flex-wrap items-center gap-2.5">
				<!-- Generate Button -->
				<Button
					type="button"
					onclick={handleGenerate}
					disabled={isGenerating}
					variant="default"
					size="sm"
					class="bg-[#5845eb] hover:bg-[#4936d6] font-bold"
				>
					{#if isGenerating}
						<span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
					{/if}
					<span>Generate</span>
				</Button>

				<!-- Clear Button -->
				<Button
					type="button"
					onclick={handleClear}
					variant="outline"
					size="sm"
					class="font-bold text-slate-600 hover:text-slate-900"
				>
					Clear
				</Button>

				<!-- Export CSV Button -->
				<Button
					type="button"
					onclick={exportToCSV}
					variant="outline"
					size="sm"
					class="border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-700 font-bold flex items-center gap-1.5"
				>
					<FileDown class="w-4 h-4 text-indigo-600" />
					<span>Export CSV</span>
				</Button>

				<!-- Download PDF Button -->
				<Button
					type="button"
					onclick={handleDownloadPDF}
					variant="default"
					size="sm"
					class="bg-indigo-600 hover:bg-indigo-700 font-bold flex items-center gap-1.5 text-white"
				>
					<FileDown class="w-4 h-4" />
					<span>Download PDF</span>
				</Button>

				<!-- Print Button -->
				<Button
					type="button"
					onclick={handlePrint}
					variant="default"
					size="sm"
					class="bg-sky-600 hover:bg-sky-700 font-bold flex items-center gap-1.5 text-white"
				>
					<Printer class="w-4 h-4" />
					<span>Print</span>
				</Button>
			</div>
		</div>
	</div>

	<!-- Printable Report Canvas -->
	<div
		class="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-10 shadow-2xs space-y-8 print:border-none print:shadow-none print:p-0"
	>
		<!-- Report Header Title & Date Range -->
		<div class="border-b border-slate-100 pb-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-xl font-bold text-slate-900">
						Daily Business Summary Report
					</h3>
					<p class="text-xs font-medium text-slate-500 mt-1">
						Period: <strong class="text-slate-800">{startDate} — {endDate}</strong>
					</p>
				</div>
				<div class="text-right">
					<span class="text-[11px] font-mono text-slate-400">
						Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
					</span>
					<div class="text-xs font-bold text-indigo-600">AURA Enterprise Deck</div>
				</div>
			</div>
		</div>

		<!-- Zero orders notice if period has no orders -->
		{#if totalOrdersReceived === 0}
			<div class="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3 print:hidden">
				<CalendarDays class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
				<div class="text-xs">
					<strong class="font-bold">এই সময়ে কোনো অর্ডার নেই:</strong>
					<span class="text-amber-800 ml-1">
						নির্বাচিত তারিখের মধ্যে ({startDate} থেকে {endDate}) কোনো অর্ডার পাওয়া যায়নি। পূর্বের অর্ডার দেখতে উপরের <strong>"Yesterday"</strong>, <strong>"Last 7 Days"</strong>, <strong>"This Month"</strong> বা <strong>"All Time"</strong> অপশনে ক্লিক করুন।
					</span>
				</div>
			</div>
		{/if}

		<!-- 1. Order Overview Section -->
		<div class="space-y-3">
			<h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
				<span class="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center">1</span>
				<span>Order Overview</span>
			</h4>

			<div class="overflow-hidden rounded-xl border border-slate-300">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="bg-slate-50/70 border-b border-slate-300 text-xs font-bold text-slate-700">
							<th class="py-3 px-5 w-2/3 border-r border-slate-300">Item</th>
							<th class="py-3 px-5 text-right font-bold">Quantity</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200 text-xs text-slate-800">
						<tr class="hover:bg-slate-50/50">
							<td class="py-2.5 px-5 font-medium border-r border-slate-200">Total Orders Received</td>
							<td class="py-2.5 px-5 text-right font-bold text-slate-900">{totalOrdersReceived}</td>
						</tr>
						<tr class="hover:bg-slate-50/50">
							<td class="py-2.5 px-5 font-medium border-r border-slate-200">Total Orders Delivered</td>
							<td class="py-2.5 px-5 text-right font-bold text-emerald-600">{totalOrdersDelivered}</td>
						</tr>
						<tr class="hover:bg-slate-50/50">
							<td class="py-2.5 px-5 font-medium border-r border-slate-200">Total Orders Pending</td>
							<td class="py-2.5 px-5 text-right font-bold text-amber-600">{totalOrdersPending}</td>
						</tr>
						<tr class="hover:bg-slate-50/50">
							<td class="py-2.5 px-5 font-medium border-r border-slate-200">Total Orders Cancelled</td>
							<td class="py-2.5 px-5 text-right font-bold text-rose-600">{totalOrdersCancelled}</td>
						</tr>
						<tr class="hover:bg-slate-50/50 bg-slate-50/30">
							<td class="py-2.5 px-5 font-medium border-r border-slate-200">Return Orders</td>
							<td class="py-2.5 px-5 text-right font-bold text-slate-700">{returnOrders}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- 2. Sales & Income Summary Section -->
		<div class="space-y-3">
			<h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
				<span class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center">2</span>
				<span>Sales & Income Summary</span>
			</h4>

			<div class="overflow-hidden rounded-xl border border-slate-300">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="bg-slate-50/70 border-b border-slate-300 text-xs font-bold text-slate-700">
							<th class="py-3 px-5 w-2/3 border-r border-slate-300">Description</th>
							<th class="py-3 px-5 text-right font-bold">Amount (BDT)</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200 text-xs text-slate-800">
						<tr class="hover:bg-slate-50/50">
							<td class="py-2.5 px-5 font-medium border-r border-slate-200">Total Order Value</td>
							<td class="py-2.5 px-5 text-right font-bold text-slate-900">৳ {totalOrderValue.toLocaleString()}</td>
						</tr>
						<tr class="hover:bg-slate-50/50">
							<td class="py-2.5 px-5 font-medium border-r border-slate-200">Advance Collected</td>
							<td class="py-2.5 px-5 text-right font-bold text-emerald-600">৳ {advanceCollected.toLocaleString()}</td>
						</tr>
						<tr class="hover:bg-slate-50/50 bg-slate-50/40">
							<td class="py-2.5 px-5 font-bold text-slate-900 border-r border-slate-200">Due Amount</td>
							<td class="py-2.5 px-5 text-right font-bold text-rose-600">৳ {dueAmount.toLocaleString()}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- 3. Logistics & Estimated Margin Summary -->
		<div class="space-y-3">
			<h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
				<span class="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 text-xs font-bold flex items-center justify-center">3</span>
				<span>Logistics & Estimated Margin</span>
			</h4>

			<div class="overflow-hidden rounded-xl border border-slate-300">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="bg-slate-50/70 border-b border-slate-300 text-xs font-bold text-slate-700">
							<th class="py-3 px-5 w-2/3 border-r border-slate-300">Metric</th>
							<th class="py-3 px-5 text-right font-bold">Amount (BDT)</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200 text-xs text-slate-800">
						<tr class="hover:bg-slate-50/50">
							<td class="py-2.5 px-5 font-medium border-r border-slate-200">Delivery Charge (Customer Paid)</td>
							<td class="py-2.5 px-5 text-right font-medium text-slate-700">৳ {deliveryCharge.toLocaleString()}</td>
						</tr>
						<tr class="hover:bg-slate-50/50">
							<td class="py-2.5 px-5 font-medium border-r border-slate-200">Courier Expense Payable</td>
							<td class="py-2.5 px-5 text-right font-medium text-slate-700">৳ {courierCost.toLocaleString()}</td>
						</tr>
						<tr class="hover:bg-slate-50/50">
							<td class="py-2.5 px-5 font-medium border-r border-slate-200">Packaging & Materials Cost</td>
							<td class="py-2.5 px-5 text-right font-medium text-slate-700">৳ {packagingCost.toLocaleString()}</td>
						</tr>
						<tr class="bg-indigo-50/40">
							<td class="py-3 px-5 font-bold text-indigo-950 border-r border-slate-200">Estimated Net Profit Margin</td>
							<td class="py-3 px-5 text-right font-black text-indigo-700 text-sm">৳ {netEstimatedProfit.toLocaleString()}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- 4. Orders Breakdown in this Period -->
		{#if ordersList.length > 0}
			<div class="space-y-3 pt-2">
				<h4 class="text-base font-bold text-slate-900 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 text-xs font-bold flex items-center justify-center">4</span>
						<span>Orders Breakdown ({ordersList.length})</span>
					</div>
				</h4>

				<div class="overflow-x-auto rounded-xl border border-slate-300">
					<table class="w-full text-left border-collapse text-xs">
						<thead>
							<tr class="bg-slate-50/70 border-b border-slate-300 text-slate-600 font-bold">
								<th class="py-2.5 px-4">Order #</th>
								<th class="py-2.5 px-4">Customer</th>
								<th class="py-2.5 px-4">Phone</th>
								<th class="py-2.5 px-4 text-center">Status</th>
								<th class="py-2.5 px-4 text-right">Total</th>
								<th class="py-2.5 px-4 text-right">Advance</th>
								<th class="py-2.5 px-4 text-right">Due</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-200 text-slate-800">
							{#each ordersList as order}
								<tr class="hover:bg-slate-50/50">
									<td class="py-2.5 px-4 font-mono font-bold text-indigo-600">{order.orderNumber}</td>
									<td class="py-2.5 px-4 font-semibold">{order.customerName}</td>
									<td class="py-2.5 px-4 font-mono text-slate-500">{order.customerPhone}</td>
									<td class="py-2.5 px-4 text-center">
										{#if order.status === 'delivered'}
											<span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Delivered</span>
										{:else if order.status === 'cancelled'}
											<span class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">Cancelled</span>
										{:else if order.status === 'returned'}
											<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold">Returned</span>
										{:else}
											<span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">Pending</span>
										{/if}
									</td>
									<td class="py-2.5 px-4 text-right font-bold text-slate-900">৳ {order.total.toLocaleString()}</td>
									<td class="py-2.5 px-4 text-right font-medium text-emerald-600">৳ {order.advancePayment.toLocaleString()}</td>
									<td class="py-2.5 px-4 text-right font-bold text-rose-600">৳ {order.dueAmount.toLocaleString()}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- Signatures / Footer for official print -->
		<div class="pt-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
			<div>
				<div class="w-36 border-t border-slate-300 pt-1 text-center font-semibold text-slate-600">Prepared By</div>
			</div>
			<div>
				<div class="w-36 border-t border-slate-300 pt-1 text-center font-semibold text-slate-600">Approved By</div>
			</div>
		</div>
	</div>
</div>
