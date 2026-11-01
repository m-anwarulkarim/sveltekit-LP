<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import {
		Package,
		RefreshCw,
		Layers,
		Search,
		TrendingUp,
		Tag,
		Wallet,
		Boxes,
		ChevronLeft,
		ChevronRight,
		SlidersHorizontal,
		FileDown
	} from 'lucide-svelte';
	import type { AssetValuationReportData, AssetValuationProduct } from '#lib/server/services/report.service';

	let { data }: { data: { report: AssetValuationReportData } } = $props();

	let allProducts = $derived<AssetValuationProduct[]>(data?.report?.products || []);
	let totalAssetCost = $derived(data?.report?.totalAssetCost || 0);
	let totalRetailValue = $derived(data?.report?.totalRetailValue || 0);
	let potentialProfit = $derived(data?.report?.potentialProfit || 0);
	let publishedCount = $derived(data?.report?.publishedCount || 0);
	let totalCount = $derived(data?.report?.totalCount || 0);

	let searchQuery = $state('');
	let isRefreshing = $state(false);
	let isQuantityMode = $state(false);
	let currentPage = $state(1);
	const pageSize = 10;

	async function refreshData() {
		isRefreshing = true;
		try {
			await invalidateAll();
			toast.success('ইনভেন্টরি এসেট ডাটা সফলভাবে রিফ্রেশ হয়েছে!');
		} catch (e) {
			toast.error('ডাটা রিফ্রেশ করতে সমস্যা হয়েছে');
		} finally {
			isRefreshing = false;
		}
	}

	// Filter & Sort Products
	let filteredProducts = $derived.by(() => {
		let list = allProducts.filter((p) => {
			if (!searchQuery.trim()) return true;
			const q = searchQuery.toLowerCase().trim();
			return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
		});

		if (isQuantityMode) {
			// In quantity mode, sort descending by stock
			list = [...list].sort((a, b) => b.stock - a.stock);
		}

		return list;
	});

	// Reset page when search or mode changes
	$effect(() => {
		if (searchQuery || isQuantityMode) {
			currentPage = 1;
		}
	});

	let totalPages = $derived(Math.max(1, Math.ceil(filteredProducts.length / pageSize)));

	let paginatedProducts = $derived(
		filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	let pageStockQty = $derived(paginatedProducts.reduce((sum, p) => sum + p.stock, 0));
	let pageTotalCost = $derived(paginatedProducts.reduce((sum, p) => sum + p.totalCost, 0));
	let pageTotalRetail = $derived(paginatedProducts.reduce((sum, p) => sum + p.totalRetail, 0));

	function goToPrevPage() {
		if (currentPage > 1) currentPage--;
	}

	function goToNextPage() {
		if (currentPage < totalPages) currentPage++;
	}

	function exportToCSV() {
		if (filteredProducts.length === 0) {
			toast.error('এক্সপোর্ট করার মতো কোনো প্রোডাক্ট নেই');
			return;
		}

		const headers = [
			'Product Name',
			'SKU',
			'Variant',
			'Stock',
			'Cost Per Unit (BDT)',
			'Sale Per Unit (BDT)',
			'Cost Value (BDT)',
			'Retail Value (BDT)',
			'Status'
		];
		const rows = filteredProducts.map((p) => [
			`"${p.name.replace(/"/g, '""')}"`,
			`"${p.sku}"`,
			`"${p.variant}"`,
			p.stock,
			p.costPerUnit,
			p.salePerUnit,
			p.totalCost,
			p.totalRetail,
			p.status
		]);

		const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute(
			'download',
			`Asset_Valuation_Report_${new Date().toISOString().split('T')[0]}.csv`
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success('ইনভেন্টরি এসেট রিপোর্ট CSV ফাইলে ডাউনলোড হয়েছে!');
	}
</script>

<svelte:head>
	<title>Asset Valuation | AURA Reports</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Hero Banner Card -->
	<div
		class="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white rounded-3xl border border-emerald-200/80 p-5 md:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
	>
		<div class="flex items-center gap-4">
			<div
				class="w-13 h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0"
			>
				<Package class="w-7 h-7" />
			</div>
			<div>
				<h2 class="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
					Asset Valuation Report
				</h2>
				<p class="text-xs text-slate-600 mt-0.5">
					Total inventory value at cost and retail price, including product variations & live stock.
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2.5 shrink-0">
			<!-- Quantity Mode Toggle -->
			<button
				type="button"
				onclick={() => {
					isQuantityMode = !isQuantityMode;
					toast.info(isQuantityMode ? 'Quantity mode সক্রিয়: সর্বোচ্চ স্টক অনুযায়ী সাজানো হয়েছে' : 'স্ট্যান্ডার্ড ভিউ সক্রিয়');
				}}
				class="px-3.5 py-2 rounded-xl border {isQuantityMode
					? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
					: 'border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/60 text-emerald-800'} text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
			>
				<SlidersHorizontal class="w-3.5 h-3.5 {isQuantityMode ? 'text-white' : 'text-emerald-700'}" />
				<span>Quantity mode</span>
			</button>

			<!-- Refresh Button -->
			<button
				type="button"
				onclick={refreshData}
				disabled={isRefreshing}
				class="px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
			>
				<RefreshCw class="w-3.5 h-3.5 text-slate-500 {isRefreshing ? 'animate-spin' : ''}" />
				<span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
			</button>

			<!-- Export CSV Button -->
			<button
				type="button"
				onclick={exportToCSV}
				class="px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
			>
				<FileDown class="w-3.5 h-3.5 text-indigo-600" />
				<span>Export CSV</span>
			</button>
		</div>
	</div>

	<!-- 4 Metric KPI Cards Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- 1. Total Asset Value (Cost) -->
		<div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
			<div
				class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0"
			>
				<Wallet class="w-6 h-6" />
			</div>
			<div>
				<div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
					TOTAL ASSET VALUE (COST)
				</div>
				<div class="text-lg md:text-xl font-black text-slate-900 tracking-tight mt-0.5">
					৳ {totalAssetCost.toLocaleString()}
				</div>
				<span class="text-[10px] text-slate-400 font-semibold">ক্রয়মূল্য অনুযায়ী মোট মজুদ</span>
			</div>
		</div>

		<!-- 2. Retail Value -->
		<div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
			<div
				class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0"
			>
				<Tag class="w-6 h-6" />
			</div>
			<div>
				<div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
					RETAIL VALUE
				</div>
				<div class="text-lg md:text-xl font-black text-slate-900 tracking-tight mt-0.5">
					৳ {totalRetailValue.toLocaleString()}
				</div>
				<span class="text-[10px] text-slate-400 font-semibold">বিক্রয়মূল্য অনুযায়ী স্টক মূল্য</span>
			</div>
		</div>

		<!-- 3. Potential Profit -->
		<div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
			<div
				class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0"
			>
				<TrendingUp class="w-6 h-6" />
			</div>
			<div>
				<div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
					POTENTIAL PROFIT
				</div>
				<div class="text-lg md:text-xl font-black text-slate-900 tracking-tight mt-0.5">
					৳ {potentialProfit.toLocaleString()}
				</div>
				<span class="text-[10px] text-slate-400 font-semibold">সম্ভাব্য মোট লাভ</span>
			</div>
		</div>

		<!-- 4. Products -->
		<div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
			<div
				class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0"
			>
				<Boxes class="w-6 h-6" />
			</div>
			<div>
				<div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
					PRODUCTS
				</div>
				<div class="text-lg md:text-xl font-black text-slate-900 tracking-tight mt-0.5">
					{publishedCount} / {totalCount}
				</div>
				<span class="text-[10px] text-slate-400 font-semibold">Published / Total Products</span>
			</div>
		</div>
	</div>

	<!-- Search & Summary Stats Strip -->
	<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
		<!-- Search Input -->
		<div class="relative w-full lg:w-96">
			<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
			<input
				type="text"
				placeholder="প্রোডাক্ট নাম বা SKU দিয়ে খুঁজুন..."
				bind:value={searchQuery}
				class="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] transition-all shadow-2xs"
			/>
		</div>

		<!-- Live Aggregated Chips on Right -->
		<div class="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
			<div class="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80">
				Page stock qty: <strong class="text-slate-900">{pageStockQty.toLocaleString()}</strong>
			</div>
			<div class="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80">
				Page cost: <strong class="text-slate-900">৳ {pageTotalCost.toLocaleString()}</strong>
			</div>
			<div class="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80">
				Page retail: <strong class="text-slate-900">৳ {pageTotalRetail.toLocaleString()}</strong>
			</div>
		</div>
	</div>

	<!-- Table Section: Stock Valuation Lines -->
	<div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
		<!-- Table Header Bar -->
		<div class="p-4 border-b border-slate-100 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<div class="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
					<Layers class="w-3.5 h-3.5" />
				</div>
				<h3 class="font-bold text-slate-800 text-sm">
					Stock Valuation Lines
				</h3>
				<span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
					{filteredProducts.length} items
				</span>
			</div>

			<!-- Table Pagination -->
			{#if totalPages > 1}
				<div class="flex items-center gap-2 text-xs text-slate-500">
					<button
						type="button"
						onclick={goToPrevPage}
						disabled={currentPage === 1}
						class="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed"
					>
						<ChevronLeft class="w-3.5 h-3.5" />
					</button>
					<span class="font-bold text-slate-800 px-1">{currentPage}</span>
					<span>of {totalPages}</span>
					<button
						type="button"
						onclick={goToNextPage}
						disabled={currentPage === totalPages}
						class="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed"
					>
						<ChevronRight class="w-3.5 h-3.5" />
					</button>
				</div>
			{/if}
		</div>

		<!-- Product Inventory Table -->
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
						<th class="py-3 px-4">PRODUCT</th>
						<th class="py-3 px-4 text-center">SKU</th>
						<th class="py-3 px-4 text-center">VARIANT</th>
						<th class="py-3 px-4 text-right">STOCK</th>
						<th class="py-3 px-4 text-right">COST / UNIT</th>
						<th class="py-3 px-4 text-right">SALE / UNIT</th>
						<th class="py-3 px-4 text-right">COST VALUE</th>
						<th class="py-3 px-4 text-right pr-6">RETAIL VALUE</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 text-xs">
					{#if paginatedProducts.length === 0}
						<tr>
							<td colspan="8" class="py-12 text-center text-slate-400">
								কোনো প্রোডাক্ট পাওয়া যায়নি
							</td>
						</tr>
					{:else}
						{#each paginatedProducts as product (product.id)}
							<tr class="hover:bg-slate-50/80 transition-colors">
								<!-- Product Image + Name -->
								<td class="py-3.5 px-4">
									<div class="flex items-center gap-3">
										<img
											src={product.image}
											alt={product.name}
											class="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
											onerror={(e) => {
												(e.currentTarget as HTMLImageElement).src = '/images/placeholder.svg';
											}}
										/>
										<div class="min-w-0">
											<span class="font-semibold text-slate-800 line-clamp-1 max-w-sm block leading-snug">
												{product.name}
											</span>
											{#if product.status !== 'published'}
												<span class="inline-block mt-0.5 text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
													{product.status}
												</span>
											{/if}
										</div>
									</div>
								</td>

								<!-- SKU -->
								<td class="py-3.5 px-4 text-slate-500 font-mono text-center text-[11px]">
									{product.sku}
								</td>

								<!-- Variant -->
								<td class="py-3.5 px-4 text-slate-400 text-center">
									{product.variant}
								</td>

								<!-- Stock -->
								<td class="py-3.5 px-4 text-right font-bold {product.stock <= 5 ? 'text-rose-600' : 'text-indigo-600'}">
									{product.stock.toLocaleString()}
								</td>

								<!-- Cost / Unit -->
								<td class="py-3.5 px-4 text-right text-slate-600">
									৳ {product.costPerUnit.toLocaleString()}
								</td>

								<!-- Sale / Unit -->
								<td class="py-3.5 px-4 text-right font-medium text-slate-800">
									৳ {product.salePerUnit.toLocaleString()}
								</td>

								<!-- Cost Value -->
								<td class="py-3.5 px-4 text-right font-semibold text-blue-600">
									৳ {product.totalCost.toLocaleString()}
								</td>

								<!-- Retail Value -->
								<td class="py-3.5 px-4 text-right font-bold text-emerald-600 pr-6">
									৳ {product.totalRetail.toLocaleString()}
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
