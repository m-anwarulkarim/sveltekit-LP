<script lang="ts">
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
		SlidersHorizontal
	} from 'lucide-svelte';

	interface AssetProduct {
		id: string;
		name: string;
		sku: string;
		variant: string;
		stock: number;
		costPerUnit: number;
		salePerUnit: number;
		image: string;
	}

	let products = $state<AssetProduct[]>([
		{
			id: '1',
			name: 'Water ফসেট ফিল্টার ৫০ পিছ সাথে ১০ পিছ বেল্ট',
			sku: '-',
			variant: '-',
			stock: 47581,
			costPerUnit: 80,
			salePerUnit: 350,
			image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=80'
		},
		{
			id: '2',
			name: 'Pain Relief Patch 1 Packet 5 Pis',
			sku: '-',
			variant: '-',
			stock: 923,
			costPerUnit: 70,
			salePerUnit: 550,
			image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=100&auto=format&fit=crop&q=80'
		},
		{
			id: '3',
			name: 'Water ফসেট ফিল্টার ৩০ পিছ সাথে ৯ পিছ বেল্ট',
			sku: '-',
			variant: '-',
			stock: 8586,
			costPerUnit: 50,
			salePerUnit: 300,
			image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=80'
		},
		{
			id: '4',
			name: 'Magic ম্যাজিক ফোম ৫০ পিছ',
			sku: '-',
			variant: '-',
			stock: 4914,
			costPerUnit: 275,
			salePerUnit: 1050,
			image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=100&auto=format&fit=crop&q=80'
		},
		{
			id: '5',
			name: 'Pudina Leaf Fresh Extract 50ml Drops',
			sku: 'PUD-01',
			variant: '50ml',
			stock: 12400,
			costPerUnit: 110,
			salePerUnit: 420,
			image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&auto=format&fit=crop&q=80'
		},
		{
			id: '6',
			name: 'Cosmos Herbal Glow Hair Oil 200ml',
			sku: 'COS-02',
			variant: '200ml',
			stock: 5800,
			costPerUnit: 190,
			salePerUnit: 690,
			image: 'https://images.unsplash.com/photo-1608248597359-26797b539c39?w=100&auto=format&fit=crop&q=80'
		}
	]);

	let searchQuery = $state('');
	let isRefreshing = $state(false);
	let isQuantityMode = $state(true);

	function refreshData() {
		isRefreshing = true;
		setTimeout(() => {
			isRefreshing = false;
		}, 600);
	}

	let filteredProducts = $derived(
		products.filter((p) => {
			if (!searchQuery.trim()) return true;
			const q = searchQuery.toLowerCase().trim();
			return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
		})
	);

	let pageStockQty = $derived(filteredProducts.reduce((sum, p) => sum + p.stock, 0));
	let pageTotalCost = $derived(filteredProducts.reduce((sum, p) => sum + p.stock * p.costPerUnit, 0));
	let pageTotalRetail = $derived(filteredProducts.reduce((sum, p) => sum + p.stock * p.salePerUnit, 0));
</script>

<svelte:head>
	<title>Asset Valuation | AURA Reports</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Hero Banner Card (Exact match with reference screenshot) -->
	<div class="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white rounded-3xl border border-emerald-200/80 p-5 md:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<div class="w-13 h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
				<Package class="w-7 h-7" />
			</div>
			<div>
				<h2 class="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
					Asset Valuation
				</h2>
				<p class="text-xs text-slate-600 mt-0.5">
					Total inventory value at cost and retail price, including product variations.
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2.5 shrink-0">
			<!-- Quantity Mode Toggle -->
			<button
				type="button"
				onclick={() => (isQuantityMode = !isQuantityMode)}
				class="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/60 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
			>
				<SlidersHorizontal class="w-3.5 h-3.5 text-emerald-700" />
				<span>Quantity mode</span>
			</button>

			<!-- Refresh Button -->
			<button
				type="button"
				onclick={refreshData}
				class="px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
			>
				<RefreshCw class="w-3.5 h-3.5 text-slate-500 {isRefreshing ? 'animate-spin' : ''}" />
				<span>Refresh</span>
			</button>
		</div>
	</div>

	<!-- 4 Metric KPI Cards Grid (Exact match with screenshot) -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- 1. Total Asset Value (Cost) -->
		<div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
			<div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
				<Wallet class="w-6 h-6" />
			</div>
			<div>
				<div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
					TOTAL ASSET VALUE (COST)
				</div>
				<div class="text-lg md:text-xl font-black text-slate-900 tracking-tight mt-0.5">
					৳ 216,456,244
				</div>
			</div>
		</div>

		<!-- 2. Retail Value -->
		<div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
			<div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
				<Tag class="w-6 h-6" />
			</div>
			<div>
				<div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
					RETAIL VALUE
				</div>
				<div class="text-lg md:text-xl font-black text-slate-900 tracking-tight mt-0.5">
					৳ 622,004,175
				</div>
			</div>
		</div>

		<!-- 3. Potential Profit -->
		<div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
			<div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
				<TrendingUp class="w-6 h-6" />
			</div>
			<div>
				<div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
					POTENTIAL PROFIT
				</div>
				<div class="text-lg md:text-xl font-black text-slate-900 tracking-tight mt-0.5">
					৳ 405,547,931
				</div>
			</div>
		</div>

		<!-- 4. Products -->
		<div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
			<div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
				<Boxes class="w-6 h-6" />
			</div>
			<div>
				<div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
					PRODUCTS
				</div>
				<div class="text-lg md:text-xl font-black text-slate-900 tracking-tight mt-0.5">
					79 / 83
				</div>
				<span class="text-[10px] text-slate-400 font-semibold">Published / Total</span>
			</div>
		</div>
	</div>

	<!-- Search & Summary Stats Strip -->
	<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
		<!-- Search Input (Matching Screenshot) -->
		<div class="relative w-full lg:w-96">
			<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
			<input
				type="text"
				placeholder="Search product"
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

	<!-- Table Section: Stock Valuation Lines (Exact match) -->
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
					83
				</span>
			</div>

			<!-- Table Pagination ( < 1 of 4 > ) -->
			<div class="flex items-center gap-2 text-xs text-slate-500">
				<button type="button" disabled class="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-300 cursor-not-allowed">
					<ChevronLeft class="w-3.5 h-3.5" />
				</button>
				<span class="font-bold text-slate-800 px-1">1</span>
				<span>of 4</span>
				<button type="button" class="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer">
					<ChevronRight class="w-3.5 h-3.5" />
				</button>
			</div>
		</div>

		<!-- Product Inventory Table -->
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
						<th class="py-3 px-4">PRODUCT</th>
						<th class="py-3 px-4">SKU</th>
						<th class="py-3 px-4">VARIANT</th>
						<th class="py-3 px-4 text-right">STOCK</th>
						<th class="py-3 px-4 text-right">COST / UNIT</th>
						<th class="py-3 px-4 text-right">SALE / UNIT</th>
						<th class="py-3 px-4 text-right">COST VALUE</th>
						<th class="py-3 px-4 text-right pr-6">RETAIL VALUE</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 text-xs">
					{#each filteredProducts as product}
						{@const costValue = product.stock * product.costPerUnit}
						{@const retailValue = product.stock * product.salePerUnit}
						<tr class="hover:bg-slate-50/80 transition-colors">
							<!-- Product Image + Name -->
							<td class="py-3.5 px-4">
								<div class="flex items-center gap-3">
									<img
										src={product.image}
										alt={product.name}
										class="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
									/>
									<span class="font-semibold text-slate-800 max-w-xs leading-snug">
										{product.name}
									</span>
								</div>
							</td>

							<!-- SKU -->
							<td class="py-3.5 px-4 text-slate-400 font-mono text-center">
								{product.sku}
							</td>

							<!-- Variant -->
							<td class="py-3.5 px-4 text-slate-400 text-center">
								{product.variant}
							</td>

							<!-- Stock -->
							<td class="py-3.5 px-4 text-right font-bold text-indigo-600">
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
								৳ {costValue.toLocaleString()}
							</td>

							<!-- Retail Value -->
							<td class="py-3.5 px-4 text-right font-bold text-emerald-600 pr-6">
								৳ {retailValue.toLocaleString()}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
