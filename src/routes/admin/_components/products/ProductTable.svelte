<script lang="ts">
	import type { AdminProduct } from '../../_data';
	import {
		ArrowDown,
		ArrowUp,
		ArrowUpDown,
		Filter,
		Star,
		MoreVertical,
		Edit3,
		Copy,
		Trash2,
		Eye,
		ToggleLeft,
		ToggleRight,
		ChevronDown,
		ChevronUp,
		PackageOpen,
		Sparkles
	} from 'lucide-svelte';

	interface Props {
		products: AdminProduct[];
		columns: {
			sl: boolean;
			image: boolean;
			name: boolean;
			category: boolean;
			stock: boolean;
			openingStock: boolean;
			tags: boolean;
			actions: boolean;
		};
		selectedIds: string[];
		sortField: 'name' | 'stock' | 'sl';
		sortOrder: 'asc' | 'desc';
		onToggleSelectAll: () => void;
		onToggleSelectRow: (id: string) => void;
		onSort: (field: 'name' | 'stock' | 'sl') => void;
		onEdit: (product: AdminProduct) => void;
		onDuplicate: (product: AdminProduct) => void;
		onDelete: (product: AdminProduct) => void;
		onToggleStatus: (product: AdminProduct) => void;
	}

	let {
		products,
		columns,
		selectedIds = $bindable([]),
		sortField,
		sortOrder,
		onToggleSelectAll,
		onToggleSelectRow,
		onSort,
		onEdit,
		onDuplicate,
		onDelete,
		onToggleStatus
	}: Props = $props();

	// Tracking which product rows have their variant stack expanded
	let expandedVariants = $state<Record<string, boolean>>({});
	let expandedTags = $state<Record<string, boolean>>({});

	// Active row actions dropdown
	let activeActionId = $state<string | null>(null);

	function toggleVariantExpand(id: string) {
		expandedVariants[id] = !expandedVariants[id];
	}

	function toggleTagExpand(id: string) {
		expandedTags[id] = !expandedTags[id];
	}

	function handleActionClick(id: string, e: MouseEvent) {
		e.stopPropagation();
		activeActionId = activeActionId === id ? null : id;
	}

	function handleWindowClick() {
		activeActionId = null;
	}

	let isAllSelected = $derived(
		products.length > 0 && products.every((p) => selectedIds.includes(p.id))
	);
	let isSomeSelected = $derived(
		products.some((p) => selectedIds.includes(p.id)) && !isAllSelected
	);
</script>

<svelte:window onclick={handleWindowClick} />

<div class="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
	<div class="overflow-x-auto no-scrollbar">
		<table class="w-full text-left border-collapse">
			<!-- Table Header (Exact Match to Screenshot) -->
			<thead>
				<tr class="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-bold tracking-wider text-slate-500 uppercase select-none">
					<!-- 1. Checkbox Select All -->
					<th class="py-4 pl-5 pr-2 w-10">
						<div class="flex items-center">
							<input
								type="checkbox"
								checked={isAllSelected}
								indeterminate={isSomeSelected}
								onchange={onToggleSelectAll}
								class="w-4 h-4 rounded-md border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
								aria-label="Select all products"
							/>
						</div>
					</th>

					<!-- 2. SL -->
					{#if columns.sl}
						<th class="py-4 px-3 w-12 text-slate-600 font-bold">SL</th>
					{/if}

					<!-- 3. IMAGE -->
					{#if columns.image}
						<th class="py-4 px-3 w-16">IMAGE</th>
					{/if}

					<!-- 4. NAME (Sortable with down arrow) -->
					{#if columns.name}
						<th class="py-4 px-4 min-w-[240px]">
							<button
								type="button"
								onclick={() => onSort('name')}
								class="flex items-center gap-1.5 hover:text-slate-900 transition-colors uppercase font-bold cursor-pointer group"
							>
								<span>NAME</span>
								{#if sortField === 'name'}
									{#if sortOrder === 'asc'}
										<ArrowUp class="w-3.5 h-3.5 text-[#5845eb]" />
									{:else}
										<ArrowDown class="w-3.5 h-3.5 text-[#5845eb]" />
									{/if}
								{:else}
									<ArrowDown class="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
								{/if}
							</button>
						</th>
					{/if}

					<!-- 5. CATEGORY (With filter funnel icon) -->
					{#if columns.category}
						<th class="py-4 px-4 min-w-[150px]">
							<div class="flex items-center gap-1.5">
								<span>CATEGORY</span>
								<Filter class="w-3 h-3 text-slate-400" />
							</div>
						</th>
					{/if}

					<!-- 6. STOCK (Sortable with up/down arrows) -->
					{#if columns.stock}
						<th class="py-4 px-4 min-w-[170px]">
							<button
								type="button"
								onclick={() => onSort('stock')}
								class="flex items-center gap-1.5 hover:text-slate-900 transition-colors uppercase font-bold cursor-pointer group"
							>
								<span>STOCK</span>
								<div class="flex items-center -space-x-0.5 text-slate-400 group-hover:text-slate-600">
									<ArrowUp class="w-3 h-3 {sortField === 'stock' && sortOrder === 'asc' ? 'text-[#5845eb]' : ''}" />
									<ArrowDown class="w-3 h-3 {sortField === 'stock' && sortOrder === 'desc' ? 'text-[#5845eb]' : ''}" />
								</div>
							</button>
						</th>
					{/if}

					<!-- 7. OPENING STOCK -->
					{#if columns.openingStock}
						<th class="py-4 px-4 min-w-[150px]">OPENING STOCK</th>
					{/if}

					<!-- 8. TAGS -->
					{#if columns.tags}
						<th class="py-4 px-4 min-w-[180px]">TAGS</th>
					{/if}

					<!-- 9. ACTIONS -->
					{#if columns.actions}
						<th class="py-4 pr-6 pl-3 w-16 text-right">ACTIONS</th>
					{/if}
				</tr>
			</thead>

			<!-- Table Body Rows -->
			<tbody class="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
				{#if products.length === 0}
					<tr>
						<td colspan="9" class="py-16 text-center text-slate-400">
							<div class="flex flex-col items-center justify-center gap-3">
								<div class="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
									<PackageOpen class="w-7 h-7" />
								</div>
								<div class="space-y-1">
									<p class="font-bold text-slate-700 text-sm">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
									<p class="text-xs text-slate-400 max-w-sm mx-auto">ডাটাবেজে বর্তমানে কোনো প্রোডাক্ট নেই অথবা আপনার সার্চ ফিল্টারের সাথে মিলছে না।</p>
								</div>
								<a
									href="/admin/products/new"
									class="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5845eb] text-white rounded-xl text-xs font-bold hover:bg-[#4936d6] transition-all shadow-sm shadow-indigo-500/20"
								>
									<span>+ নতুন প্রোডাক্ট যোগ করুন</span>
								</a>
							</div>
						</td>
					</tr>
				{:else}
					{#each products as product, index (product.id)}
						{@const isSelected = selectedIds.includes(product.id)}
						{@const isVariantsExpanded = expandedVariants[product.id] || false}
						{@const isTagsExpanded = expandedTags[product.id] || false}
						{@const hasVariants = product.variants && product.variants.length > 0}
						{@const visibleVariants = hasVariants
							? isVariantsExpanded
								? product.variants!
								: product.variants!.slice(0, 2)
							: []}
						{@const remainingVariantsCount = hasVariants
							? product.variants!.length - 2
							: 0}

						{@const hasTags = product.tags && product.tags.length > 0}
						{@const visibleTags = hasTags
							? isTagsExpanded
								? product.tags!
								: product.tags!.slice(0, 2)
							: []}
						{@const remainingTagsCount = hasTags
							? product.tags!.length - 2
							: 0}

						<tr class="hover:bg-slate-50/70 transition-colors group {isSelected ? 'bg-indigo-50/30' : ''}">
							<!-- Checkbox -->
							<td class="py-4 pl-5 pr-2">
								<input
									type="checkbox"
									checked={isSelected}
									onchange={() => onToggleSelectRow(product.id)}
									class="w-4 h-4 rounded-md border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
									aria-label="Select {product.name}"
								/>
							</td>

							<!-- SL -->
							{#if columns.sl}
								<td class="py-4 px-3 text-slate-500 font-semibold">{index + 1}</td>
							{/if}

							<!-- IMAGE -->
							{#if columns.image}
								<td class="py-4 px-3">
									<div class="w-12 h-12 rounded-2xl border border-slate-200/80 bg-slate-50 p-1 flex items-center justify-center overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
										<img
											src={product.image}
											alt={product.name}
											class="w-full h-full object-contain rounded-xl"
											onerror={(e) => {
												// Fallback if image path fails
												(e.currentTarget as HTMLImageElement).src = '/images/headphones.jpg';
											}}
										/>
									</div>
								</td>
							{/if}

							<!-- NAME -->
							{#if columns.name}
								<td class="py-4 px-4">
									<div class="space-y-1.5">
										<!-- Title -->
										<button
											type="button"
											onclick={() => onEdit(product)}
											class="font-bold text-slate-900 hover:text-[#5845eb] text-sm text-left transition-colors cursor-pointer block line-clamp-1"
										>
											{product.name}
										</button>

										<!-- Published Badge & Priority -->
										<div class="flex items-center gap-2">
											{#if product.status === 'published'}
												<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
													Published
												</span>
											{:else}
												<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
													Draft
												</span>
											{/if}

											<!-- Priority -->
											<span class="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
												<Star class="w-3 h-3 text-slate-400 fill-slate-300/40" />
												<span>Priority: {product.priority || '-'}</span>
											</span>
										</div>
									</div>
								</td>
							{/if}

							<!-- CATEGORY -->
							{#if columns.category}
								<td class="py-4 px-4">
									<div class="flex flex-col">
										<span class="font-bold text-slate-800 uppercase text-xs tracking-tight">
											{product.category}
										</span>
										<span class="text-[11px] text-slate-400 -mt-0.5">
											{product.subCategory || '-'}
										</span>
									</div>
								</td>
							{/if}

							<!-- STOCK (Variants Stack or Single Pill) -->
							{#if columns.stock}
								<td class="py-4 px-4">
									{#if hasVariants}
										<div class="flex flex-col gap-1 items-start">
											{#each visibleVariants as variant}
												<div class="inline-flex items-center justify-between gap-2.5 px-2.5 py-0.8 rounded-lg border border-emerald-200/90 bg-emerald-50/50 text-emerald-700 text-[11px] font-bold font-mono">
													<span>{variant.name}</span>
													<span class="text-emerald-800">{variant.stock}</span>
												</div>
											{/each}

											{#if remainingVariantsCount > 0}
												<button
													type="button"
													onclick={() => toggleVariantExpand(product.id)}
													class="text-[11px] font-bold text-[#5845eb] hover:text-[#4936d6] inline-flex items-center gap-0.5 mt-0.5 cursor-pointer"
												>
													{#if isVariantsExpanded}
														<span>Show less</span>
														<ChevronUp class="w-3 h-3" />
													{:else}
														<span>+{remainingVariantsCount} more</span>
														<ChevronDown class="w-3 h-3" />
													{/if}
												</button>
											{/if}
										</div>
									{:else}
										<!-- Single item stock badge -->
										{#if product.isLowStock || (product.stock !== undefined && product.stock <= 5)}
											<span class="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">
												Low stock · {product.stock ?? 0}
											</span>
										{:else if product.stock === 0 || !product.inStock}
											<span class="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-rose-50 text-rose-700 border border-rose-200">
												Out of stock
											</span>
										{:else}
											<span class="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
												In stock · {product.stock ?? 999}
											</span>
										{/if}
									{/if}
								</td>
							{/if}

							<!-- OPENING STOCK -->
							{#if columns.openingStock}
								<td class="py-4 px-4">
									{#if hasVariants}
										<div class="flex flex-col gap-1 items-start">
											{#each visibleVariants as variant}
												<div class="inline-flex items-center justify-between gap-2.5 px-2 py-0.8 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-[11px] font-semibold font-mono">
													<span>{variant.name}</span>
													<span class="text-slate-900 font-bold">{variant.openingStock ?? 0}</span>
												</div>
											{/each}

											{#if remainingVariantsCount > 0}
												<button
													type="button"
													onclick={() => toggleVariantExpand(product.id)}
													class="text-[11px] font-bold text-[#5845eb] hover:text-[#4936d6] inline-flex items-center gap-0.5 mt-0.5 cursor-pointer"
												>
													{#if isVariantsExpanded}
														<span>Show less</span>
														<ChevronUp class="w-3 h-3" />
													{:else}
														<span>+{remainingVariantsCount} more</span>
														<ChevronDown class="w-3 h-3" />
													{/if}
												</button>
											{/if}
										</div>
									{:else}
										<span class="font-bold text-slate-800 text-xs font-mono">
											{product.openingStock ?? 0}
										</span>
									{/if}
								</td>
							{/if}

							<!-- TAGS (Pill tags matching reference) -->
							{#if columns.tags}
								<td class="py-4 px-4">
									{#if hasTags}
										<div class="flex flex-col gap-1 items-start">
											{#each visibleTags as tag}
												<span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/70 whitespace-nowrap">
													{tag}
												</span>
											{/each}

											{#if remainingTagsCount > 0}
												<button
													type="button"
													onclick={() => toggleTagExpand(product.id)}
													class="text-[11px] font-bold text-[#5845eb] hover:text-[#4936d6] inline-flex items-center gap-0.5 mt-0.5 cursor-pointer"
												>
													{#if isTagsExpanded}
														<span>Show less</span>
														<ChevronUp class="w-3 h-3" />
													{:else}
														<span>+{remainingTagsCount} more</span>
														<ChevronDown class="w-3 h-3" />
													{/if}
												</button>
											{/if}
										</div>
									{:else}
										<span class="text-slate-400 text-xs">-</span>
									{/if}
								</td>
							{/if}

							<!-- ACTIONS (Vertical 3-dots Dropdown) -->
							{#if columns.actions}
								<td class="py-4 pr-6 pl-3 text-right relative">
									<button
										type="button"
										onclick={(e) => handleActionClick(product.id, e)}
										class="w-8 h-8 rounded-xl border border-slate-200/80 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors ml-auto shadow-2xs cursor-pointer"
										title="অ্যাকশন মেনু"
										aria-label="Actions for {product.name}"
									>
										<MoreVertical class="w-4 h-4" />
									</button>

									<!-- Dropdown Menu -->
									{#if activeActionId === product.id}
										<div class="absolute right-6 top-12 w-44 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 z-50 text-xs font-medium text-left animate-in fade-in zoom-in-95 duration-100">
											<button
												type="button"
												onclick={() => {
													onEdit(product);
													activeActionId = null;
												}}
												class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
											>
												<Edit3 class="w-3.5 h-3.5 text-slate-400" />
												<span>Edit Product</span>
											</button>
											<button
												type="button"
												onclick={() => {
													onDuplicate(product);
													activeActionId = null;
												}}
												class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
											>
												<Copy class="w-3.5 h-3.5 text-slate-400" />
												<span>Duplicate</span>
											</button>
											<button
												type="button"
												onclick={() => {
													onToggleStatus(product);
													activeActionId = null;
												}}
												class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
											>
												{#if product.status === 'published'}
													<ToggleLeft class="w-3.5 h-3.5 text-amber-500" />
													<span>Set as Draft</span>
												{:else}
													<ToggleRight class="w-3.5 h-3.5 text-emerald-500" />
													<span>Publish Product</span>
												{/if}
											</button>
											<div class="h-px bg-slate-100 my-1"></div>
											<button
												type="button"
												onclick={() => {
													onDelete(product);
													activeActionId = null;
												}}
												class="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
											>
												<Trash2 class="w-3.5 h-3.5 text-rose-500" />
												<span>Delete</span>
											</button>
										</div>
									{/if}
								</td>
							{/if}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
