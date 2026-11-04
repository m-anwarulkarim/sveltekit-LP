<script lang="ts">
	import { TrendingUp, DollarSign, PackageCheck, AlertCircle } from 'lucide-svelte';

	interface Props {
		regularPrice: number;
		salesPrice: number;
		costPrice?: number;
		stockValue?: number;
		lowStockQty?: number;
		openingStock?: number;
		/** Stock on hand right now. Shown only when editing an existing product. */
		currentStock?: number;
		showCurrentStock?: boolean;
		/** True when variants exist, because then the stock is the sum of the variants. */
		stockLocked?: boolean;
		sku?: string;
		isWholesale?: boolean;
	}

	let {
		regularPrice = $bindable(0),
		salesPrice = $bindable(0),
		costPrice = $bindable(0),
		stockValue = $bindable(0),
		lowStockQty = $bindable(5),
		openingStock = $bindable(0),
		currentStock = $bindable(0),
		showCurrentStock = false,
		stockLocked = false,
		sku = $bindable(''),
		isWholesale = $bindable(false)
	}: Props = $props();

	// Derived calculations
	let discountPercent = $derived(
		regularPrice > salesPrice && regularPrice > 0
			? Math.round(((regularPrice - salesPrice) / regularPrice) * 100)
			: 0
	);

	let profitPerUnit = $derived(
		costPrice !== undefined && costPrice > 0 && salesPrice > costPrice
			? salesPrice - costPrice
			: 0
	);

	let marginPercent = $derived(
		salesPrice > 0 && profitPerUnit > 0
			? Math.round((profitPerUnit / salesPrice) * 100)
			: 0
	);

	// Auto-calculate stock value if cost price or sales price exists
	$effect(() => {
		const unitValue = (costPrice && costPrice > 0) ? costPrice : salesPrice;
		const units = showCurrentStock ? currentStock : openingStock;
		if (units && units > 0 && unitValue > 0) {
			stockValue = units * unitValue;
		}
	});
</script>

<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-5">
	<!-- Card Header with Wholesale Toggle -->
	<div class="flex items-center justify-between border-b border-slate-100 pb-4">
		<h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
			<span>Price And Stock</span>
		</h2>

		<label class="flex items-center gap-2 text-slate-700 font-semibold text-sm cursor-pointer select-none">
			<input
				type="checkbox"
				bind:checked={isWholesale}
				class="w-4 h-4 rounded text-[#5845eb] focus:ring-[#5845eb] border-slate-300 transition-colors"
			/>
			<span>Is Wholesale</span>
		</label>
	</div>

	<!-- Price Inputs Grid (Regular Price & Sales Price) -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div class="space-y-1.5">
			<div class="flex items-center justify-between">
				<label for="regular-price-input" class="block text-xs font-bold text-slate-700">Regular Price (৳)</label>
				{#if discountPercent > 0}
					<span class="text-[11px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200">
						{discountPercent}% OFF
					</span>
				{/if}
			</div>
			<div class="relative">
				<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
				<input
					id="regular-price-input"
					type="number"
					min="0"
					bind:value={regularPrice}
					placeholder="2260"
					class="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-semibold transition-all"
				/>
			</div>
		</div>

		<div class="space-y-1.5">
			<label for="sales-price-input" class="block text-xs font-bold text-slate-700">
				Sales Price (৳) <span class="text-rose-500">*</span>
			</label>
			<div class="relative">
				<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5845eb] font-bold text-sm">৳</span>
				<input
					id="sales-price-input"
					type="number"
					min="0"
					bind:value={salesPrice}
					placeholder="780"
					class="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-bold transition-all bg-indigo-50/20"
					required
				/>
			</div>
		</div>
	</div>

	<!-- Cost Price, Stock Value & Low Stock Qty -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="space-y-1.5">
			<label for="cost-price-input" class="block text-xs font-bold text-slate-700">
				Cost Price (৳) <span class="text-slate-400 font-normal">(Internal)</span>
			</label>
			<div class="relative">
				<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
				<input
					id="cost-price-input"
					type="number"
					min="0"
					bind:value={costPrice}
					placeholder="170"
					class="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-medium transition-all"
				/>
			</div>
		</div>

		<div class="space-y-1.5">
			<label for="stock-value-input" class="block text-xs font-bold text-slate-700">Stock Value (৳)</label>
			<div class="relative">
				<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
				<input
					id="stock-value-input"
					type="number"
					min="0"
					bind:value={stockValue}
					placeholder="3977"
					class="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-medium transition-all bg-slate-50"
				/>
			</div>
		</div>

		<div class="space-y-1.5">
			<label for="low-stock-input" class="block text-xs font-bold text-slate-700">Low Stock Qty</label>
			<input
				id="low-stock-input"
				type="number"
				min="0"
				bind:value={lowStockQty}
				placeholder="50"
				class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-medium transition-all"
			/>
		</div>
	</div>

	<!-- Opening Stock & SKU -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div class="space-y-1.5">
			<label for="opening-stock-input" class="block text-xs font-bold text-slate-700">
				Opening Stock <span class="text-slate-400 font-normal">(শুরুর স্টক)</span>
			</label>
			<input
				id="opening-stock-input"
				type="number"
				min="0"
				bind:value={openingStock}
				placeholder="যেমন: 100"
				class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-medium transition-all"
			/>
		</div>

		<div class="space-y-1.5">
			<label for="product-sku-input" class="block text-xs font-bold text-slate-700">SKU (Product Code)</label>
			<input
				id="product-sku-input"
				type="text"
				bind:value={sku}
				placeholder="Enter SKU e.g. CAM-BALL-96"
				class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-mono transition-all uppercase"
			/>
		</div>
	</div>

	{#if showCurrentStock}
		<div class="space-y-1.5">
			<label for="current-stock-input" class="block text-xs font-bold text-slate-700">
				Current Stock <span class="text-slate-400 font-normal">(এখন হাতে আছে)</span>
			</label>
			<input
				id="current-stock-input"
				type="number"
				min="0"
				bind:value={currentStock}
				disabled={stockLocked}
				class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm transition-all disabled:bg-slate-50 disabled:text-slate-500"
			/>
			<p class="text-[11px] text-slate-500">
				{stockLocked
					? 'ভ্যারিয়েন্ট থাকায় স্টক ভ্যারিয়েন্টের যোগফল থেকে আসে।'
					: 'অর্ডারে এই সংখ্যা নিজে থেকে কমে। শুধু গণনা ঠিক করতে চাইলে বদলান।'}
			</p>
		</div>
	{/if}

	<!-- Profit Margin Indicator (Helper UX) -->
	{#if profitPerUnit > 0}
		<div class="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-800">
			<div class="flex items-center gap-2">
				<TrendingUp class="w-4 h-4 text-emerald-600" />
				<span class="font-bold">Estimated Profit per Unit:</span>
				<span class="font-extrabold text-sm font-mono">৳{profitPerUnit}</span>
			</div>
			<div class="flex items-center gap-1 font-bold">
				<span>Margin:</span>
				<span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold">{marginPercent}%</span>
			</div>
		</div>
	{/if}
</div>

