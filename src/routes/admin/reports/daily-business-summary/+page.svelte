<script lang="ts">
	import {
		Calendar,
		Printer,
		FileDown,
		RotateCcw,
		Sparkles,
		TrendingUp,
		ShoppingBag,
		DollarSign,
		CheckCircle2,
		ArrowRight
	} from 'lucide-svelte';
	import { Button, Input } from '#lib/components/ui';

	// Date range state
	let startDate = $state('2026-10-23');
	let endDate = $state('2026-10-23');
	let isGenerating = $state(false);

	// Report metrics
	let totalOrdersReceived = $state(1);
	let totalOrdersDelivered = $state(0);
	let totalOrdersPending = $state(1);
	let totalOrdersCancelled = $state(0);
	let returnOrders = $state(0);

	let totalOrderValue = $state(420);
	let advanceCollected = $state(0);
	let dueAmount = $derived(totalOrderValue - advanceCollected);

	let deliveryCharge = $state(120);
	let courierCost = $state(130);
	let packagingCost = $state(25);
	let netEstimatedProfit = $derived(totalOrderValue - courierCost - packagingCost);

	function handleGenerate() {
		isGenerating = true;
		setTimeout(() => {
			isGenerating = false;
		}, 400);
	}

	function handleClear() {
		startDate = '2026-10-23';
		endDate = '2026-10-23';
	}

	function handlePrint() {
		window.print();
	}

	function handleDownloadPDF() {
		window.print();
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

	<!-- Control Panel (Period Selector + Action Buttons) - Exact match with screenshot -->
	<div class="bg-white rounded-2xl border border-slate-200/90 p-4 md:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
		<!-- Period Date Picker -->
		<div class="relative w-full sm:w-80">
			<label for="report-period" class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
				Period
			</label>
			<div class="relative">
				<Calendar class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
				<Input
					id="report-period"
					type="text"
					value="{startDate} — {endDate}"
					readonly
					class="pl-10 text-xs font-semibold bg-slate-50/70 border-slate-200"
				/>
			</div>
		</div>

		<!-- Action Buttons: Generate, Clear, Download PDF, Print -->
		<div class="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-5">
			<!-- Generate Button (Purple) -->
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

			<!-- Download PDF Button (Indigo) -->
			<Button
				type="button"
				onclick={handleDownloadPDF}
				variant="default"
				size="sm"
				class="bg-indigo-600 hover:bg-indigo-700 font-bold flex items-center gap-1.5"
			>
				<FileDown class="w-4 h-4" />
				<span>Download PDF</span>
			</Button>

			<!-- Print Button (Cyan / Sky) -->
			<Button
				type="button"
				onclick={handlePrint}
				variant="default"
				size="sm"
				class="bg-sky-600 hover:bg-sky-700 font-bold flex items-center gap-1.5"
			>
				<Printer class="w-4 h-4" />
				<span>Print</span>
			</Button>
		</div>
	</div>

	<!-- Printable Report Canvas (Exact match with reference screenshot) -->
	<div class="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-10 shadow-2xs space-y-8 print:border-none print:shadow-none print:p-0">
		<!-- Report Header Title & Date Range -->
		<div class="border-b border-slate-100 pb-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-xl font-bold text-slate-900">
						Daily Business Summary Report
					</h3>
					<p class="text-xs font-medium text-slate-500 mt-1">
						Period: <strong class="text-slate-800">Oct 23, 2026 - Oct 23, 2026</strong>
					</p>
				</div>
				<div class="text-right">
					<span class="text-[11px] font-mono text-slate-400">Generated: Oct 23, 2026 00:24 AM</span>
					<div class="text-xs font-bold text-indigo-600">AURA Commerce Deck</div>
				</div>
			</div>
		</div>

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
							<td class="py-2.5 px-5 font-medium border-r border-slate-200">Steadfast Courier Payable</td>
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
