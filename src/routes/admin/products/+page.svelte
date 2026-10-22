<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Card, Badge, Dialog } from '#lib/components/ui';
	import {
		Search,
		Plus,
		MoreVertical,
		ChevronDown,
		Check,
		X,
		Trash2,
		Copy,
		Edit,
		Eye,
		Globe,
		Tag,
		ArrowUpDown,
		ArrowDown,
		ArrowUp,
		Columns3,
		LayoutGrid,
		Filter,
		CheckCircle2,
		SlidersHorizontal,
		ExternalLink,
		Package
	} from 'lucide-svelte';

	let { data }: { data: any } = $props();

	// Search & Filter State
	let searchQuery = $state('');
	let activeFilter = $state<'all' | 'published' | 'draft' | 'low_stock'>('all');
	let perPage = $state(10);
	let isPerPageOpen = $state(false);
	let isActionsOpen = $state(false);
	let isColumnsOpen = $state(false);

	// Selected Rows for Floating Action Bar
	let selectedIds = $state<string[]>(['1']);

	// Toast Feedback
	let toastMessage = $state<string | null>(null);
	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => (toastMessage = null), 3000);
	}

	// Action popup menu per row
	let activeActionRowId = $state<string | null>(null);

	// Add Product Modal
	let isAddProductOpen = $state(false);
	let newProductName = $state('');
	let newProductCategory = $state('');
	let newProductPrice = $state(1200);
	let newProductStock = $state(50);

	// Realistic Products Data (Matching User's Reference Screenshot)
	let productsList = $state([
		{
			id: '1',
			sl: 1,
			name: 'Car Paint Touch-up Pen',
			image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=120&auto=format&fit=crop&q=80',
			category: 'CAR COLOUR',
			subCategory: '-',
			status: 'published',
			priority: '-',
			stockType: 'variants',
			variants: [
				{ name: 'WHITE', count: 9997 },
				{ name: 'BLACK', count: 9995 }
			],
			variantsMore: 3,
			openingVariants: [
				{ name: 'WHITE', count: 0 },
				{ name: 'BLACK', count: 0 }
			],
			openingMore: 3,
			tags: ['Best Sale Products', 'New Arrival'],
			tagsMore: 1,
			price: 450
		},
		{
			id: '2',
			sl: 2,
			name: '3d Window View Wall Sticker',
			image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=120&auto=format&fit=crop&q=80',
			category: '3D WALL STICKER',
			subCategory: '-',
			status: 'published',
			priority: '-',
			stockType: 'single',
			stockCount: 9997,
			openingStock: 10000,
			tags: ['New Arrival'],
			tagsMore: 0,
			price: 320
		},
		{
			id: '3',
			sl: 3,
			name: 'Electric Shock Mosquito Killing Lamp',
			image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=120&auto=format&fit=crop&q=80',
			category: 'Mosquito lamp',
			subCategory: '-',
			status: 'published',
			priority: '-',
			stockType: 'single',
			stockCount: 493,
			openingStock: 0,
			tags: ['Best Sale Products'],
			tagsMore: 0,
			price: 850
		},
		{
			id: '4',
			sl: 4,
			name: '3 In One Smart Home Care Combo',
			image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=120&auto=format&fit=crop&q=80',
			category: 'COMBO PACK',
			subCategory: '-',
			status: 'published',
			priority: '-',
			stockType: 'single',
			stockCount: 4963,
			openingStock: 5000,
			tags: ['New Arrival'],
			tagsMore: 0,
			price: 1450
		},
		{
			id: '5',
			sl: 5,
			name: '🌸 Floral Camphor Balls - আলমারি সুগন্ধি ও পোকা...',
			image: 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=120&auto=format&fit=crop&q=80',
			category: 'HOME CARE',
			subCategory: '-',
			status: 'published',
			priority: '-',
			stockType: 'single',
			stockCount: 3977,
			openingStock: 50000,
			tags: ['New Arrival'],
			tagsMore: 0,
			price: 280
		},
		{
			id: '6',
			sl: 6,
			name: 'AURA Spectrum X Wireless Headphone',
			image: '/images/headphones.jpg',
			category: 'AUDIO & GADGET',
			subCategory: '-',
			status: 'published',
			priority: 'High',
			stockType: 'single',
			stockCount: 9999,
			openingStock: 0,
			tags: ['Best Sale Products'],
			tagsMore: 0,
			price: 34900
		},
		{
			id: '7',
			sl: 7,
			name: 'AURA Wave Spatial Pro Earbuds',
			image: '/images/earbuds.jpg',
			category: 'AUDIO & GADGET',
			subCategory: '-',
			status: 'draft',
			priority: '-',
			stockType: 'single',
			stockCount: 4,
			openingStock: 100,
			tags: ['New Arrival'],
			tagsMore: 0,
			price: 18900
		},
		{
			id: '8',
			sl: 8,
			name: 'AURA Creator Sound Deck Pro',
			image: '/images/sound-deck.jpg',
			category: 'STUDIO GEAR',
			subCategory: '-',
			status: 'published',
			priority: '-',
			stockType: 'single',
			stockCount: 3,
			openingStock: 50,
			tags: ['Studio Grade'],
			tagsMore: 0,
			price: 44900
		}
	]);

	// Filtered products derived state
	let filteredProducts = $derived(
		productsList.filter((item) => {
			const matchesSearch =
				item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

			if (!matchesSearch) return false;

			if (activeFilter === 'published') return item.status === 'published';
			if (activeFilter === 'draft') return item.status === 'draft';
			if (activeFilter === 'low_stock') {
				const stock = item.stockCount ?? (item.variants ? item.variants[0]?.count : 0);
				return stock < 10;
			}
			return true;
		})
	);

	// Selection helpers
	let isAllSelected = $derived(
		filteredProducts.length > 0 && selectedIds.length === filteredProducts.length
	);

	function toggleSelectAll() {
		if (isAllSelected) {
			selectedIds = [];
		} else {
			selectedIds = filteredProducts.map((p) => p.id);
		}
	}

	function toggleSelectRow(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((item) => item !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function deleteSelected() {
		productsList = productsList.filter((p) => !selectedIds.includes(p.id));
		showToast(`${selectedIds.length} টি প্রোডাক্ট সফলভাবে ডিলিট করা হয়েছে!`);
		selectedIds = [];
	}

	function cloneProduct(item: any) {
		const newId = String(Date.now());
		const cloned = {
			...item,
			id: newId,
			sl: productsList.length + 1,
			name: `${item.name} (Clone)`
		};
		productsList = [...productsList, cloned];
		activeActionRowId = null;
		showToast(`'${item.name}' ক্লোন করা হয়েছে!`);
	}

	function deleteProduct(id: string) {
		productsList = productsList.filter((p) => p.id !== id);
		selectedIds = selectedIds.filter((item) => item !== id);
		activeActionRowId = null;
		showToast('প্রোডাক্ট সফলভাবে ডিলিট করা হয়েছে!');
	}

	function handleAddProduct(e: Event) {
		e.preventDefault();
		if (!newProductName.trim()) return;

		const newProduct = {
			id: String(Date.now()),
			sl: productsList.length + 1,
			name: newProductName,
			image: '/images/headphones.jpg',
			category: newProductCategory || 'GENERAL',
			subCategory: '-',
			status: 'published',
			priority: '-',
			stockType: 'single',
			stockCount: Number(newProductStock) || 50,
			openingStock: Number(newProductStock) || 50,
			tags: ['New Arrival'],
			tagsMore: 0,
			price: Number(newProductPrice) || 990
		};

		productsList = [newProduct, ...productsList];
		isAddProductOpen = false;
		newProductName = '';
		newProductCategory = '';
		showToast('নতুন প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে!');
	}

	// Close popup menu when clicking outside
	function handleDocumentClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.action-menu-container')) {
			activeActionRowId = null;
		}
		if (!target.closest('.dropdown-container')) {
			isPerPageOpen = false;
			isActionsOpen = false;
			isColumnsOpen = false;
		}
	}
</script>

<svelte:window onclick={handleDocumentClick} />

<svelte:head>
	<title>Product Management | AURA Enterprise</title>
</svelte:head>

<div class="space-y-4 max-w-[1400px] mx-auto pb-24">
	
	<!-- Toast Message -->
	{#if toastMessage}
		<div class="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
			<CheckCircle2 class="w-4 h-4 text-emerald-400" />
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Page Heading & Top Controls Row (Search, Actions, Per Page, Add Product) -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
		
		<!-- Left: Search products... input -->
		<div class="relative w-full sm:w-80">
			<Input
				type="text"
				bind:value={searchQuery}
				placeholder="Search products..."
				class="h-10 pl-4 pr-10 text-xs rounded-xl bg-white border-slate-200 placeholder:text-slate-400 focus-visible:ring-[#5845eb]"
			/>
			<Search class="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
		</div>

		<!-- Right: Actions, Per Page, Add Product Buttons -->
		<div class="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
			
			<!-- Actions Dropdown -->
			<div class="relative dropdown-container">
				<Button
					variant="outline"
					size="sm"
					onclick={() => (isActionsOpen = !isActionsOpen)}
					class="h-10 px-3.5 gap-2 text-xs font-medium text-slate-700 rounded-xl bg-white border-slate-200 shadow-2xs hover:bg-slate-50"
				>
					<LayoutGrid class="w-3.5 h-3.5 text-slate-500" />
					<span>Actions</span>
					<ChevronDown class="w-3.5 h-3.5 text-slate-400" />
				</Button>

				{#if isActionsOpen}
					<div class="absolute right-0 top-11 w-44 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-30 text-xs font-medium text-slate-700 animate-in fade-in-50">
						<button
							type="button"
							onclick={() => {
								productsList = productsList.map((p) => ({ ...p, status: 'published' }));
								isActionsOpen = false;
								showToast('সব প্রোডাক্ট Publish করা হয়েছে!');
							}}
							class="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2"
						>
							<Check class="w-3.5 h-3.5 text-emerald-600" />
							<span>Publish All</span>
						</button>
						<button
							type="button"
							onclick={() => {
								productsList = productsList.map((p) => ({ ...p, status: 'draft' }));
								isActionsOpen = false;
								showToast('সব প্রোডাক্ট Draft করা হয়েছে!');
							}}
							class="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2"
						>
							<Edit class="w-3.5 h-3.5 text-amber-600" />
							<span>Draft All</span>
						</button>
					</div>
				{/if}
			</div>

			<!-- Per Page Dropdown -->
			<div class="relative dropdown-container">
				<Button
					variant="outline"
					size="sm"
					onclick={() => (isPerPageOpen = !isPerPageOpen)}
					class="h-10 px-3.5 gap-2 text-xs font-medium text-slate-700 rounded-xl bg-white border-slate-200 shadow-2xs hover:bg-slate-50"
				>
					<span>Per Page: {perPage}</span>
					<ChevronDown class="w-3.5 h-3.5 text-slate-400" />
				</Button>

				{#if isPerPageOpen}
					<div class="absolute right-0 top-11 w-32 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-30 text-xs font-medium text-slate-700 animate-in fade-in-50">
						{#each [10, 25, 50, 100] as count}
							<button
								type="button"
								onclick={() => {
									perPage = count;
									isPerPageOpen = false;
								}}
								class="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between {perPage === count ? 'text-[#5845eb] font-bold bg-indigo-50/50' : ''}"
							>
								<span>{count}</span>
								{#if perPage === count}
									<Check class="w-3.5 h-3.5" />
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- + Add Product Button (Vibrant Purple matching screenshot) -->
			<Button
				type="button"
				onclick={() => (isAddProductOpen = true)}
				class="h-10 px-4 gap-1.5 text-xs font-bold text-white rounded-xl bg-[#5845eb] hover:bg-[#4936d6] shadow-md shadow-indigo-500/20 shrink-0"
			>
				<Plus class="w-4 h-4 stroke-[2.5]" />
				<span>Add Product</span>
			</Button>

		</div>
	</div>

	<!-- Filter Tabs & Columns Row -->
	<div class="flex items-center justify-between gap-4 flex-wrap">
		
		<!-- Left: All (83), Publish (79), Draft (4), Low Stock (4) Tabs -->
		<div class="flex items-center gap-1.5 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/80">
			
			<!-- All Tab -->
			<button
				type="button"
				onclick={() => (activeFilter = 'all')}
				class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer {activeFilter === 'all'
					? 'bg-white text-[#5845eb] shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>All</span>
				<span class="px-2 py-0.5 rounded-full text-[11px] font-black {activeFilter === 'all' ? 'bg-[#5845eb] text-white' : 'bg-slate-200 text-slate-700'}">
					83
				</span>
			</button>

			<!-- Publish Tab -->
			<button
				type="button"
				onclick={() => (activeFilter = 'published')}
				class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer {activeFilter === 'published'
					? 'bg-white text-[#5845eb] shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Publish</span>
				<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200/80 text-slate-700">
					79
				</span>
			</button>

			<!-- Draft Tab -->
			<button
				type="button"
				onclick={() => (activeFilter = 'draft')}
				class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer {activeFilter === 'draft'
					? 'bg-white text-[#5845eb] shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Draft</span>
				<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200/80 text-slate-700">
					4
				</span>
			</button>

			<!-- Low Stock Tab -->
			<button
				type="button"
				onclick={() => (activeFilter = 'low_stock')}
				class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer {activeFilter === 'low_stock'
					? 'bg-white text-[#5845eb] shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Low Stock</span>
				<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200/80 text-slate-700">
					4
				</span>
			</button>

		</div>

		<!-- Right: Columns Toggle Button -->
		<div class="relative dropdown-container">
			<Button
				variant="outline"
				size="sm"
				onclick={() => (isColumnsOpen = !isColumnsOpen)}
				class="h-9 px-3 gap-2 text-xs font-medium text-slate-700 rounded-xl bg-white border-slate-200 shadow-2xs hover:bg-slate-50"
			>
				<Columns3 class="w-3.5 h-3.5 text-slate-500" />
				<span>Columns</span>
				<ChevronDown class="w-3.5 h-3.5 text-slate-400" />
			</Button>

			{#if isColumnsOpen}
				<div class="absolute right-0 top-10 w-48 bg-white rounded-xl border border-slate-200 shadow-lg p-2 z-30 text-xs font-medium text-slate-700 space-y-1 animate-in fade-in-50">
					<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
						<input type="checkbox" checked class="rounded accent-[#5845eb]" />
						<span>Image</span>
					</label>
					<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
						<input type="checkbox" checked class="rounded accent-[#5845eb]" />
						<span>Category</span>
					</label>
					<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
						<input type="checkbox" checked class="rounded accent-[#5845eb]" />
						<span>Stock</span>
					</label>
					<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
						<input type="checkbox" checked class="rounded accent-[#5845eb]" />
						<span>Opening Stock</span>
					</label>
					<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
						<input type="checkbox" checked class="rounded accent-[#5845eb]" />
						<span>Tags</span>
					</label>
				</div>
			{/if}
		</div>

	</div>

	<!-- Main Product Data Table Container -->
	<div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-visible">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs border-collapse">
				
				<!-- Table Header -->
				<thead>
					<tr class="border-b border-slate-100 bg-white text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
						
						<!-- Select All Checkbox -->
						<th class="py-4 pl-4 pr-2 w-10 text-center">
							<button
								type="button"
								onclick={toggleSelectAll}
								class="w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer {selectedIds.length > 0
									? 'bg-[#5845eb] border-[#5845eb] text-white'
									: 'border-slate-300 hover:border-slate-400 bg-white'}"
							>
								{#if isAllSelected}
									<Check class="w-3.5 h-3.5 stroke-[3]" />
								{:else if selectedIds.length > 0}
									<div class="w-2.5 h-0.5 bg-white rounded-full"></div>
								{/if}
							</button>
						</th>

						<!-- SL -->
						<th class="py-4 px-3 w-12 text-slate-700 font-bold">SL</th>

						<!-- IMAGE -->
						<th class="py-4 px-3 w-16 text-slate-700 font-bold">IMAGE</th>

						<!-- NAME (Sortable) -->
						<th class="py-4 px-4 min-w-[220px] text-slate-700 font-bold">
							<div class="flex items-center gap-1.5 cursor-pointer group">
								<span>NAME</span>
								<ArrowDown class="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
							</div>
						</th>

						<!-- CATEGORY (Filterable) -->
						<th class="py-4 px-4 min-w-[140px] text-slate-700 font-bold">
							<div class="flex items-center gap-1.5 cursor-pointer group">
								<span>CATEGORY</span>
								<Filter class="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
							</div>
						</th>

						<!-- STOCK (Sortable) -->
						<th class="py-4 px-4 min-w-[160px] text-slate-700 font-bold">
							<div class="flex items-center gap-1.5 cursor-pointer group">
								<span>STOCK</span>
								<div class="flex flex-col -space-y-1">
									<ArrowUp class="w-2.5 h-2.5 text-slate-400" />
									<ArrowDown class="w-2.5 h-2.5 text-slate-400" />
								</div>
							</div>
						</th>

						<!-- OPENING STOCK -->
						<th class="py-4 px-4 min-w-[130px] text-slate-700 font-bold">OPENING STOCK</th>

						<!-- TAGS -->
						<th class="py-4 px-4 min-w-[160px] text-slate-700 font-bold">TAGS</th>

						<!-- ACTIONS -->
						<th class="py-4 px-4 w-20 text-right text-slate-700 font-bold">ACTIONS</th>

					</tr>
				</thead>

				<!-- Table Body -->
				<tbody class="divide-y divide-slate-100">
					{#each filteredProducts as product (product.id)}
						{@const isSelected = selectedIds.includes(product.id)}
						<tr
							class="transition-colors group hover:bg-slate-50/70 {isSelected ? 'bg-indigo-50/30' : ''}"
						>
							
							<!-- Row Checkbox -->
							<td class="py-3.5 pl-4 pr-2 text-center">
								<button
									type="button"
									onclick={() => toggleSelectRow(product.id)}
									class="w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer {isSelected
										? 'bg-[#5845eb] border-[#5845eb] text-white shadow-xs'
										: 'border-slate-300 hover:border-slate-400 bg-white'}"
								>
									{#if isSelected}
										<Check class="w-3.5 h-3.5 stroke-[3]" />
									{/if}
								</button>
							</td>

							<!-- SL -->
							<td class="py-3.5 px-3 font-semibold text-slate-600 font-mono text-[13px]">
								{product.sl}
							</td>

							<!-- Image Thumbnail -->
							<td class="py-3.5 px-3">
								<div class="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center">
									{#if product.image}
										<img
											src={product.image}
											alt={product.name}
											class="w-full h-full object-cover"
											loading="lazy"
											onerror={(e: Event) => {
												const target = e.currentTarget as HTMLImageElement;
												target.style.display = 'none';
											}}
										/>
									{:else}
										<Package class="w-5 h-5 text-slate-400" />
									{/if}
								</div>
							</td>

							<!-- Product Name & Status/Priority Badges -->
							<td class="py-3.5 px-4">
								<div class="space-y-1">
									<h4 class="font-bold text-slate-900 text-sm hover:text-[#5845eb] transition-colors cursor-pointer">
										{product.name}
									</h4>
									<div class="flex items-center gap-2 flex-wrap text-[11px]">
										{#if product.status === 'published'}
											<span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold flex items-center gap-1">
												<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
												<span>Published</span>
											</span>
										{:else}
											<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold flex items-center gap-1">
												<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
												<span>Draft</span>
											</span>
										{/if}

										<span class="text-slate-400 font-medium">
											★ Priority: {product.priority}
										</span>
									</div>
								</div>
							</td>

							<!-- Category & Subcategory -->
							<td class="py-3.5 px-4 font-semibold text-slate-700 uppercase tracking-tight text-xs">
								<div>{product.category}</div>
								<div class="text-[11px] text-slate-400 font-normal">{product.subCategory}</div>
							</td>

							<!-- Stock Display -->
							<td class="py-3.5 px-4">
								{#if product.stockType === 'variants' && product.variants}
									<div class="space-y-1">
										<div class="flex items-center gap-1.5 flex-wrap">
											{#each product.variants as variant}
												<span class="px-2 py-0.5 rounded-md border border-slate-200 bg-white text-[11px] font-mono text-slate-700 flex items-center gap-1.5 shadow-2xs">
													<span class="text-slate-400 font-sans">{variant.name}</span>
													<span class="font-bold text-slate-900">{variant.count}</span>
												</span>
											{/each}
										</div>
										{#if product.variantsMore}
											<button type="button" class="text-[11px] font-bold text-[#5845eb] hover:underline flex items-center gap-0.5 cursor-pointer">
												<span>+{product.variantsMore} more</span>
												<ChevronDown class="w-3 h-3" />
											</button>
										{/if}
									</div>
								{:else}
									<span class="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/70 text-emerald-800 font-bold text-xs inline-flex items-center gap-1">
										<span>In stock</span>
										<span>-</span>
										<span class="font-mono">{product.stockCount}</span>
									</span>
								{/if}
							</td>

							<!-- Opening Stock -->
							<td class="py-3.5 px-4">
								{#if product.openingVariants}
									<div class="space-y-1">
										<div class="flex items-center gap-1.5 flex-wrap">
											{#each product.openingVariants as op}
												<span class="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-600 flex items-center gap-1">
													<span class="text-slate-400 font-sans">{op.name}</span>
													<span>{op.count}</span>
												</span>
											{/each}
										</div>
										{#if product.openingMore}
											<button type="button" class="text-[11px] font-bold text-[#5845eb] hover:underline flex items-center gap-0.5 cursor-pointer">
												<span>+{product.openingMore} more</span>
												<ChevronDown class="w-3 h-3" />
											</button>
										{/if}
									</div>
								{:else}
									<span class="font-mono text-slate-700 text-xs font-semibold">
										{product.openingStock ?? 0}
									</span>
								{/if}
							</td>

							<!-- Tags -->
							<td class="py-3.5 px-4">
								<div class="flex items-center gap-1.5 flex-wrap">
									{#each product.tags as tag}
										<span class="px-2.5 py-0.5 rounded-full bg-slate-100/90 text-slate-700 text-[11px] font-medium border border-slate-200/70 whitespace-nowrap">
											{tag}
										</span>
									{/each}
									{#if product.tagsMore}
										<button type="button" class="text-[11px] font-bold text-[#5845eb] hover:underline flex items-center gap-0.5 cursor-pointer">
											<span>+{product.tagsMore} more</span>
											<ChevronDown class="w-3 h-3" />
										</button>
									{/if}
								</div>
							</td>

							<!-- Actions (3-dots Popup Menu) -->
							<td class="py-3.5 px-4 text-right relative action-menu-container">
								<button
									type="button"
									onclick={(e: MouseEvent) => {
										e.stopPropagation();
										activeActionRowId = activeActionRowId === product.id ? null : product.id;
									}}
									class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 ml-auto transition-colors cursor-pointer"
								>
									<MoreVertical class="w-4 h-4" />
								</button>

								<!-- Exact Popover Actions Menu matching screenshot -->
								{#if activeActionRowId === product.id}
									<div class="absolute right-4 top-12 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-40 text-xs font-medium text-slate-700 space-y-0.5 text-left animate-in fade-in-50 zoom-in-95">
										
										<!-- Edit -->
										<button
											type="button"
											onclick={() => {
												showToast(`Editing ${product.name}`);
												activeActionRowId = null;
											}}
											class="w-full px-4 py-2 hover:bg-blue-50/60 text-slate-700 flex items-center gap-2.5 transition-colors"
										>
											<div class="w-5 h-5 rounded flex items-center justify-center text-blue-600">
												<Edit class="w-3.5 h-3.5" />
											</div>
											<span class="font-semibold">Edit</span>
										</button>

										<!-- Details -->
										<button
											type="button"
											onclick={() => {
												showToast(`Details for ${product.name}`);
												activeActionRowId = null;
											}}
											class="w-full px-4 py-2 hover:bg-indigo-50/60 text-slate-700 flex items-center gap-2.5 transition-colors"
										>
											<div class="w-5 h-5 rounded flex items-center justify-center text-[#5845eb]">
												<Eye class="w-3.5 h-3.5" />
											</div>
											<span class="font-semibold">Details</span>
										</button>

										<!-- Details In website -->
										<a
											href="/"
											target="_blank"
											class="w-full px-4 py-2 hover:bg-indigo-50/60 text-slate-700 flex items-center gap-2.5 transition-colors block"
										>
											<div class="w-5 h-5 rounded flex items-center justify-center text-[#5845eb]">
												<Eye class="w-3.5 h-3.5" />
											</div>
											<span class="font-semibold">Details In website</span>
										</a>

										<!-- Clone -->
										<button
											type="button"
											onclick={() => cloneProduct(product)}
											class="w-full px-4 py-2 hover:bg-amber-50/60 text-slate-700 flex items-center gap-2.5 transition-colors"
										>
											<div class="w-5 h-5 rounded flex items-center justify-center text-amber-600">
												<Copy class="w-3.5 h-3.5" />
											</div>
											<span class="font-semibold">Clone</span>
										</button>

										<!-- Delete -->
										<div class="pt-1 mt-1 border-t border-slate-100">
											<button
												type="button"
												onclick={() => deleteProduct(product.id)}
												class="w-full px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 transition-colors"
											>
												<div class="w-5 h-5 rounded flex items-center justify-center text-rose-600">
													<Trash2 class="w-3.5 h-3.5" />
												</div>
												<span class="font-bold">Delete</span>
											</button>
										</div>

									</div>
								{/if}
							</td>

						</tr>
					{/each}
				</tbody>

			</table>
		</div>
	</div>

	<!-- Floating Multi-Select Bottom Action Bar (Exact match with reference screenshot) -->
	{#if selectedIds.length > 0}
		<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
			<div class="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#f5f6fe]/95 backdrop-blur-md border border-[#5845eb]/30 shadow-2xl">
				
				<!-- Close / Deselect Button -->
				<button
					type="button"
					onclick={() => (selectedIds = [])}
					class="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-colors cursor-pointer"
					title="Deselect All"
				>
					<X class="w-4 h-4" />
				</button>

				<!-- Selected Count Badge -->
				<div class="px-3 py-1 rounded-xl bg-[#5845eb] text-white text-xs font-bold shadow-xs">
					{selectedIds.length} Selected
				</div>

				<!-- Status Dropdown Button -->
				<Button
					type="button"
					size="sm"
					class="h-8 px-3 gap-1.5 text-xs font-bold text-white bg-[#5845eb] hover:bg-[#4936d6] rounded-xl shadow-xs"
					onclick={() => {
						productsList = productsList.map((p) =>
							selectedIds.includes(p.id) ? { ...p, status: p.status === 'published' ? 'draft' : 'published' } : p
						);
						showToast(`${selectedIds.length} টি প্রডাক্টের স্ট্যাটাস টগল করা হয়েছে!`);
					}}
				>
					<SlidersHorizontal class="w-3.5 h-3.5" />
					<span>Status</span>
				</Button>

				<!-- Tags Button -->
				<Button
					type="button"
					variant="outline"
					size="sm"
					class="h-8 px-3 gap-1.5 text-xs font-bold text-slate-700 bg-white border-slate-200 hover:bg-slate-50 rounded-xl"
					onclick={() => showToast('ট্যাগ এডিট মোড ওপেন হয়েছে')}
				>
					<Tag class="w-3.5 h-3.5 text-slate-500" />
					<span>Tags</span>
				</Button>

				<!-- Delete Button (Red) -->
				<Button
					type="button"
					size="sm"
					class="h-8 px-3 gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
					onclick={deleteSelected}
				>
					<Trash2 class="w-3.5 h-3.5" />
					<span>Delete</span>
				</Button>

			</div>
		</div>
	{/if}

</div>

<!-- Add Product Modal -->
{#if isAddProductOpen}
	<div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
			
			<div class="flex items-center justify-between pb-3 border-b border-slate-100">
				<div>
					<h3 class="text-base font-bold text-slate-900">Add New Product</h3>
					<p class="text-xs text-slate-500 mt-0.5">নতুন পণ্য এবং প্রাথমিক স্টক তথ্য প্রদান করুন</p>
				</div>
				<button
					type="button"
					onclick={() => (isAddProductOpen = false)}
					class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<form onsubmit={handleAddProduct} class="space-y-4">
				<div class="space-y-1.5">
					<label for="prod-name" class="text-xs font-bold text-slate-700">Product Name</label>
					<Input
						id="prod-name"
						type="text"
						bind:value={newProductName}
						placeholder="e.g. Car Paint Touch-up Pen"
						required
						class="text-xs"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5">
						<label for="prod-cat" class="text-xs font-bold text-slate-700">Category</label>
						<Input
							id="prod-cat"
							type="text"
							bind:value={newProductCategory}
							placeholder="e.g. CAR COLOUR"
							class="text-xs"
						/>
					</div>

					<div class="space-y-1.5">
						<label for="prod-price" class="text-xs font-bold text-slate-700">Price (৳)</label>
						<Input
							id="prod-price"
							type="number"
							bind:value={newProductPrice}
							required
							class="text-xs font-mono"
						/>
					</div>
				</div>

				<div class="space-y-1.5">
					<label for="prod-stock" class="text-xs font-bold text-slate-700">Initial Stock</label>
					<Input
						id="prod-stock"
						type="number"
						bind:value={newProductStock}
						required
						class="text-xs font-mono"
					/>
				</div>

				<div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (isAddProductOpen = false)}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						size="sm"
						class="bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold"
					>
						Add Product
					</Button>
				</div>
			</form>

		</div>
	</div>
{/if}
