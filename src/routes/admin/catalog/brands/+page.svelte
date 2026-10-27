<script lang="ts">
	import {
		Search,
		Plus,
		MoreVertical,
		Headset,
		Filter,
		ArrowDown,
		ChevronLeft,
		ChevronRight,
		Trash2,
		Edit3,
		Eye,
		X,
		CheckCircle2
	} from 'lucide-svelte';
	import { CatalogFilterTabs } from '../../_components/catalog';
	import { INITIAL_BRANDS, type CatalogBrand } from '../../_data.ts';

	let brands = $state<CatalogBrand[]>([...INITIAL_BRANDS]);
	let searchQuery = $state('');
	let activeTab = $state<'all' | 'publish' | 'draft' | 'low_stock' | 'trash'>('all');
	let selectedIds = $state<string[]>([]);
	let currentPage = $state(1);
	let itemsPerPage = 10;

	// Toast notification
	let toastMessage = $state<string | null>(null);
	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => (toastMessage = null), 3000);
	}

	// Modal state
	let isModalOpen = $state(false);
	let isEditing = $state(false);
	let editingId = $state<string | null>(null);
	let formName = $state('');
	let formHomeShow = $state<'Yes' | 'No'>('No');
	let formDate = $state('-');
	let formPriority = $state<string | number>('-');
	let formStatus = $state<'publish' | 'draft'>('publish');

	let openActionMenuId = $state<string | null>(null);

	// Derived counts
	let allCount = $derived(brands.filter((b) => !b.isTrash).length);
	let publishCount = $derived(brands.filter((b) => b.status === 'publish' && !b.isTrash).length);
	let draftCount = $derived(brands.filter((b) => b.status === 'draft' && !b.isTrash).length);
	let lowStockCount = $derived(brands.filter((b) => b.isLowStock && !b.isTrash).length);
	let trashCount = $derived(brands.filter((b) => b.isTrash).length);

	// Filtered list
	let filteredBrands = $derived.by(() => {
		let list = brands.filter((b) => {
			if (activeTab === 'trash') return b.isTrash;
			if (b.isTrash) return false;
			if (activeTab === 'publish') return b.status === 'publish';
			if (activeTab === 'draft') return b.status === 'draft';
			if (activeTab === 'low_stock') return b.isLowStock;
			return true;
		});

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter((b) => b.name.toLowerCase().includes(q));
		}

		return list;
	});

	let totalPages = $derived(Math.max(1, Math.ceil(filteredBrands.length / itemsPerPage)));
	let paginatedItems = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredBrands.slice(start, start + itemsPerPage);
	});

	function handleSelectAll(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		if (checked) {
			selectedIds = paginatedItems.map((b) => b.id);
		} else {
			selectedIds = [];
		}
	}

	function handleSelectRow(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((item) => item !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function openAddModal() {
		isEditing = false;
		editingId = null;
		formName = '';
		formHomeShow = 'No';
		formDate = '-';
		formPriority = '-';
		formStatus = 'publish';
		isModalOpen = true;
	}

	function openEditModal(brand: CatalogBrand) {
		isEditing = true;
		editingId = brand.id;
		formName = brand.name;
		formHomeShow = brand.homeShow;
		formDate = brand.date;
		formPriority = brand.priority;
		formStatus = brand.status;
		openActionMenuId = null;
		isModalOpen = true;
	}

	function handleSave() {
		if (!formName.trim()) {
			alert('Brand Name required');
			return;
		}

		if (isEditing && editingId) {
			brands = brands.map((b) =>
				b.id === editingId
					? {
							...b,
							name: formName.trim(),
							homeShow: formHomeShow,
							date: formDate,
							priority: formPriority,
							status: formStatus
						}
					: b
			);
			showToast('ব্র্যান্ড সফলভাবে আপডেট করা হয়েছে!');
		} else {
			const newBrand: CatalogBrand = {
				id: 'brand-' + Date.now(),
				sl: brands.length + 1,
				name: formName.trim(),
				homeShow: formHomeShow,
				date: formDate,
				status: formStatus,
				priority: formPriority
			};
			brands = [...brands, newBrand];
			showToast('নতুন ব্র্যান্ড তৈরি করা হয়েছে!');
		}

		isModalOpen = false;
	}

	function toggleStatus(brand: CatalogBrand) {
		const newStatus = brand.status === 'publish' ? 'draft' : 'publish';
		brands = brands.map((b) => (b.id === brand.id ? { ...b, status: newStatus } : b));
		openActionMenuId = null;
		showToast(`স্ট্যাটাস ${newStatus === 'publish' ? 'Publish' : 'Draft'}-এ পরিবর্তিত হয়েছে`);
	}

	function moveToTrash(id: string) {
		brands = brands.map((b) => (b.id === id ? { ...b, isTrash: true } : b));
		openActionMenuId = null;
		showToast('ব্র্যান্ড ট্র্যাশে পাঠানো হয়েছে');
	}

	function restoreFromTrash(id: string) {
		brands = brands.map((b) => (b.id === id ? { ...b, isTrash: false } : b));
		openActionMenuId = null;
		showToast('ব্র্যান্ড রিস্টোর করা হয়েছে');
	}
</script>

<svelte:head>
	<title>Brands | AURA Admin</title>
</svelte:head>

<!-- Toast Notification -->
{#if toastMessage}
	<div class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
		<CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
		<span>{toastMessage}</span>
	</div>
{/if}

<div class="space-y-6 max-w-[1400px] mx-auto pb-12">
	<!-- Top Bar: Title & Support Button -->
	<div class="flex items-center justify-between gap-4">
		<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Brands</h1>

		<button
			type="button"
			class="bg-[#5845eb] hover:bg-[#4a39cf] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
		>
			<Headset class="w-3.5 h-3.5" />
			<span>Support</span>
		</button>
	</div>

	<!-- Search & Add Brand Row -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
		<!-- Search Input matching screenshot placeholder -->
		<div class="relative w-full sm:max-w-md">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search Brand..."
				class="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5845eb] shadow-2xs pr-9"
			/>
			<Search class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
		</div>

		<!-- + Add Brand Button -->
		<button
			type="button"
			onclick={openAddModal}
			class="bg-[#5845eb] hover:bg-[#4a39cf] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
		>
			<Plus class="w-4 h-4" />
			<span>Add Brand</span>
		</button>
	</div>

	<!-- Filter Capsules: All Data (8), Publish (8), Draft (0), Low Stock (0), Trash (0) -->
	<CatalogFilterTabs
		{activeTab}
		{allCount}
		{publishCount}
		{draftCount}
		{lowStockCount}
		{trashCount}
		onTabChange={(tab) => {
			activeTab = tab;
			currentPage = 1;
		}}
	/>

	<!-- Data Table Card matching Screenshot 4 -->
	<div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs border-collapse">
				<thead>
					<tr class="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
						<th class="py-3.5 px-4 w-10">
							<input
								type="checkbox"
								checked={selectedIds.length > 0 && selectedIds.length === paginatedItems.length}
								onchange={handleSelectAll}
								class="rounded border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
							/>
						</th>
						<th class="py-3.5 px-4">SL</th>
						<th class="py-3.5 px-4">NAME</th>
						<th class="py-3.5 px-4">DATE</th>
						<th class="py-3.5 px-4">HOME SHOW</th>
						<th class="py-3.5 px-4">
							<div class="flex items-center gap-1.5 cursor-pointer hover:text-slate-700">
								<span>PRIORITY</span>
								<ArrowDown class="w-3 h-3 text-slate-400" />
							</div>
						</th>
						<th class="py-3.5 px-4">
							<div class="flex items-center gap-1.5 cursor-pointer hover:text-slate-700">
								<span>STATUS</span>
								<Filter class="w-3 h-3 text-slate-400" />
							</div>
						</th>
						<th class="py-3.5 px-4 text-right">ACTIONS</th>
					</tr>
				</thead>

				<tbody class="divide-y divide-slate-100">
					{#if paginatedItems.length === 0}
						<tr>
							<td colspan="8" class="py-12 text-center text-slate-400 text-xs">
								কোনো ব্র্যান্ড পাওয়া যায়নি।
							</td>
						</tr>
					{:else}
						{#each paginatedItems as brand, idx (brand.id)}
							<tr class="hover:bg-slate-50/60 transition-colors">
								<!-- Checkbox -->
								<td class="py-3.5 px-4">
									<input
										type="checkbox"
										checked={selectedIds.includes(brand.id)}
										onchange={() => handleSelectRow(brand.id)}
										class="rounded border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
									/>
								</td>

								<!-- SL -->
								<td class="py-3.5 px-4 font-mono text-slate-600">
									{brand.sl ?? (idx + 1)}
								</td>

								<!-- Name -->
								<td class="py-3.5 px-4 font-semibold text-slate-800">
									{brand.name}
								</td>

								<!-- Date -->
								<td class="py-3.5 px-4 text-slate-500 font-mono">
									{brand.date}
								</td>

								<!-- Home Show -->
								<td class="py-3.5 px-4 text-slate-600 font-medium">
									{brand.homeShow}
								</td>

								<!-- Priority -->
								<td class="py-3.5 px-4 font-mono text-slate-600">
									{brand.priority}
								</td>

								<!-- Status -->
								<td class="py-3.5 px-4">
									{#if brand.status === 'publish'}
										<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
											Publish
										</span>
									{:else}
										<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
											Draft
										</span>
									{/if}
								</td>

								<!-- Actions -->
								<td class="py-3.5 px-4 text-right relative">
									<button
										type="button"
										onclick={() => (openActionMenuId = openActionMenuId === brand.id ? null : brand.id)}
										class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
									>
										<MoreVertical class="w-4 h-4" />
									</button>

									{#if openActionMenuId === brand.id}
										<div class="absolute right-4 top-10 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-left text-xs">
											<button
												type="button"
												onclick={() => openEditModal(brand)}
												class="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
											>
												<Edit3 class="w-3.5 h-3.5 text-slate-500" />
												<span>Edit</span>
											</button>

											<button
												type="button"
												onclick={() => toggleStatus(brand)}
												class="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
											>
												<Eye class="w-3.5 h-3.5 text-slate-500" />
												<span>{brand.status === 'publish' ? 'Draft করুন' : 'Publish করুন'}</span>
											</button>

											{#if !brand.isTrash}
												<button
													type="button"
													onclick={() => moveToTrash(brand.id)}
													class="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors"
												>
													<Trash2 class="w-3.5 h-3.5" />
													<span>Trash</span>
												</button>
											{:else}
												<button
													type="button"
													onclick={() => restoreFromTrash(brand.id)}
													class="w-full px-3 py-1.5 flex items-center gap-2 text-emerald-600 hover:bg-emerald-50 transition-colors"
												>
													<CheckCircle2 class="w-3.5 h-3.5" />
													<span>Restore</span>
												</button>
											{/if}
										</div>
									{/if}
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Pagination Footer -->
		{#if filteredBrands.length > 0}
			<div class="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 text-xs text-slate-500 bg-white">
				<span>
					Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredBrands.length)} of {filteredBrands.length} items
				</span>

				<div class="flex items-center gap-2">
					<button
						type="button"
						disabled={currentPage <= 1}
						onclick={() => (currentPage = Math.max(1, currentPage - 1))}
						class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
					>
						<ChevronLeft class="w-4 h-4" />
					</button>

					<span class="font-bold text-slate-800 px-2">
						{currentPage} of {totalPages}
					</span>

					<button
						type="button"
						disabled={currentPage >= totalPages}
						onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
						class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
					>
						<ChevronRight class="w-4 h-4" />
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Add / Edit Brand Modal -->
{#if isModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
		<div class="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
				<h3 class="font-bold text-slate-900 text-sm">
					{isEditing ? 'Edit Brand' : 'Add New Brand'}
				</h3>
				<button
					type="button"
					onclick={() => (isModalOpen = false)}
					class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<div class="p-6 space-y-4 text-xs">
				<div class="space-y-1.5">
					<label for="brand-name" class="font-bold text-slate-700 block">Brand Name *</label>
					<input
						id="brand-name"
						type="text"
						bind:value={formName}
						placeholder="উদাঃ Samsung, Apple, Netac"
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb]"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="brand-home" class="font-bold text-slate-700 block">Home Show</label>
						<select
							id="brand-home"
							bind:value={formHomeShow}
							class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb] bg-white"
						>
							<option value="Yes">Yes</option>
							<option value="No">No</option>
						</select>
					</div>

					<div class="space-y-1.5">
						<label for="brand-priority" class="font-bold text-slate-700 block">Priority</label>
						<input
							id="brand-priority"
							type="text"
							bind:value={formPriority}
							placeholder="-"
							class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb]"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="brand-date" class="font-bold text-slate-700 block">Date</label>
						<input
							id="brand-date"
							type="text"
							bind:value={formDate}
							placeholder="-"
							class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb]"
						/>
					</div>

					<div class="space-y-1.5">
						<label for="brand-status" class="font-bold text-slate-700 block">Status</label>
						<select
							id="brand-status"
							bind:value={formStatus}
							class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb] bg-white"
						>
							<option value="publish">Publish</option>
							<option value="draft">Draft</option>
						</select>
					</div>
				</div>
			</div>

			<div class="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100">
				<button
					type="button"
					onclick={() => (isModalOpen = false)}
					class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleSave}
					class="px-4 py-2 rounded-xl text-xs font-bold bg-[#5845eb] text-white hover:bg-[#4a39cf] shadow-sm shadow-indigo-600/20 cursor-pointer"
				>
					{isEditing ? 'Save Changes' : 'Create Brand'}
				</button>
			</div>
		</div>
	</div>
{/if}
