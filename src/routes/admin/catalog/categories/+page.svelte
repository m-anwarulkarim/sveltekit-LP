<script lang="ts">
	import {
		Search,
		Plus,
		MoreVertical,
		Headset,
		Filter,
		ArrowUpDown,
		ChevronLeft,
		ChevronRight,
		Image as ImageIcon,
		Trash2,
		Edit3,
		Eye,
		X,
		CheckCircle2
	} from 'lucide-svelte';
	import { CatalogFilterTabs } from '../../_components/catalog';
	import { INITIAL_CATEGORIES, type CatalogCategory } from '../../_data.ts';

	// Category state
	let categories = $state<CatalogCategory[]>([...INITIAL_CATEGORIES]);
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
	let formImage = $state('');
	let formPriority = $state<number>(0);
	let formStatus = $state<'publish' | 'draft'>('publish');

	// Active dropdown menu for actions
	let openActionMenuId = $state<string | null>(null);

	// Derived counts
	let allCount = $derived(categories.filter((c) => !c.isTrash).length);
	let publishCount = $derived(categories.filter((c) => c.status === 'publish' && !c.isTrash).length);
	let draftCount = $derived(categories.filter((c) => c.status === 'draft' && !c.isTrash).length);
	let lowStockCount = $derived(categories.filter((c) => c.isLowStock && !c.isTrash).length);
	let trashCount = $derived(categories.filter((c) => c.isTrash).length);

	// Filtered list
	let filteredCategories = $derived.by(() => {
		let list = categories.filter((c) => {
			if (activeTab === 'trash') return c.isTrash;
			if (c.isTrash) return false;
			if (activeTab === 'publish') return c.status === 'publish';
			if (activeTab === 'draft') return c.status === 'draft';
			if (activeTab === 'low_stock') return c.isLowStock;
			return true;
		});

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter((c) => c.name.toLowerCase().includes(q));
		}

		return list;
	});

	// Pagination
	let totalPages = $derived(Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage)));
	let paginatedCategories = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredCategories.slice(start, start + itemsPerPage);
	});

	function handleSelectAll(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		if (checked) {
			selectedIds = paginatedCategories.map((c) => c.id);
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
		formImage = '';
		formPriority = 0;
		formStatus = 'publish';
		isModalOpen = true;
	}

	function openEditModal(cat: CatalogCategory) {
		isEditing = true;
		editingId = cat.id;
		formName = cat.name;
		formImage = cat.image || '';
		formPriority = typeof cat.priority === 'number' ? cat.priority : 0;
		formStatus = cat.status;
		openActionMenuId = null;
		isModalOpen = true;
	}

	function handleSave() {
		if (!formName.trim()) {
			alert('Category Name required');
			return;
		}

		if (isEditing && editingId) {
			categories = categories.map((c) =>
				c.id === editingId
					? {
							...c,
							name: formName.trim(),
							image: formImage.trim(),
							priority: formPriority,
							status: formStatus
						}
					: c
			);
			showToast('ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!');
		} else {
			const newCat: CatalogCategory = {
				id: 'cat-' + Date.now(),
				name: formName.trim(),
				image: formImage.trim(),
				productsCount: 0,
				status: formStatus,
				priority: formPriority
			};
			categories = [newCat, ...categories];
			showToast('নতুন ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে!');
		}

		isModalOpen = false;
	}

	function toggleStatus(cat: CatalogCategory) {
		const newStatus = cat.status === 'publish' ? 'draft' : 'publish';
		categories = categories.map((c) => (c.id === cat.id ? { ...c, status: newStatus } : c));
		openActionMenuId = null;
		showToast(`স্ট্যাটাস ${newStatus === 'publish' ? 'Publish' : 'Draft'}-এ পরিবর্তিত হয়েছে`);
	}

	function moveToTrash(id: string) {
		categories = categories.map((c) => (c.id === id ? { ...c, isTrash: true } : c));
		openActionMenuId = null;
		showToast('ক্যাটাগরি ট্র্যাশে পাঠানো হয়েছে');
	}

	function restoreFromTrash(id: string) {
		categories = categories.map((c) => (c.id === id ? { ...c, isTrash: false } : c));
		openActionMenuId = null;
		showToast('ক্যাটাগরি রিস্টোর করা হয়েছে');
	}
</script>

<svelte:head>
	<title>Category | AURA Admin</title>
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
		<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Category</h1>

		<button
			type="button"
			class="bg-[#5845eb] hover:bg-[#4a39cf] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
		>
			<Headset class="w-3.5 h-3.5" />
			<span>Support</span>
		</button>
	</div>

	<!-- Search & Add Category Row -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
		<!-- Search Input -->
		<div class="relative w-full sm:max-w-md">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search Category..."
				class="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5845eb] shadow-2xs pr-9"
			/>
			<Search class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
		</div>

		<!-- + Add Category Button -->
		<button
			type="button"
			onclick={openAddModal}
			class="bg-[#5845eb] hover:bg-[#4a39cf] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
		>
			<Plus class="w-4 h-4" />
			<span>Add Category</span>
		</button>
	</div>

	<!-- Filter Capsules: All Data (32), Publish (22), Draft (10), Low Stock (0), Trash (0) -->
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

	<!-- Data Table Card -->
	<div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs border-collapse">
				<thead>
					<tr class="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
						<th class="py-3.5 px-4 w-10">
							<input
								type="checkbox"
								checked={selectedIds.length > 0 && selectedIds.length === paginatedCategories.length}
								onchange={handleSelectAll}
								class="rounded border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
							/>
						</th>
						<th class="py-3.5 px-4">IMAGE</th>
						<th class="py-3.5 px-4">NAME</th>
						<th class="py-3.5 px-4">PRODUCTS</th>
						<th class="py-3.5 px-4">
							<div class="flex items-center gap-1.5 cursor-pointer hover:text-slate-700">
								<span>STATUS</span>
								<Filter class="w-3 h-3 text-slate-400" />
							</div>
						</th>
						<th class="py-3.5 px-4">
							<div class="flex items-center gap-1.5 cursor-pointer hover:text-slate-700">
								<span>PRIORITY</span>
								<ArrowUpDown class="w-3 h-3 text-slate-400" />
							</div>
						</th>
						<th class="py-3.5 px-4 text-right">ACTIONS</th>
					</tr>
				</thead>

				<tbody class="divide-y divide-slate-100">
					{#if paginatedCategories.length === 0}
						<tr>
							<td colspan="7" class="py-12 text-center text-slate-400 text-xs">
								কোনো ক্যাটাগরি পাওয়া যায়নি।
							</td>
						</tr>
					{:else}
						{#each paginatedCategories as category (category.id)}
							<tr class="hover:bg-slate-50/60 transition-colors">
								<!-- Checkbox -->
								<td class="py-3.5 px-4">
									<input
										type="checkbox"
										checked={selectedIds.includes(category.id)}
										onchange={() => handleSelectRow(category.id)}
										class="rounded border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
									/>
								</td>

								<!-- Image -->
								<td class="py-3.5 px-4">
									<div class="w-12 h-10 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 overflow-hidden">
										{#if category.image}
											<img src={category.image} alt={category.name} class="w-full h-full object-cover" />
										{:else}
											<ImageIcon class="w-4 h-4 text-slate-400" />
										{/if}
									</div>
								</td>

								<!-- Name -->
								<td class="py-3.5 px-4 font-semibold text-slate-800">
									{category.name}
								</td>

								<!-- Products Count -->
								<td class="py-3.5 px-4 font-medium text-slate-700">
									{category.productsCount}
								</td>

								<!-- Status -->
								<td class="py-3.5 px-4">
									{#if category.status === 'publish'}
										<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
											Publish
										</span>
									{:else}
										<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
											Draft
										</span>
									{/if}
								</td>

								<!-- Priority -->
								<td class="py-3.5 px-4 font-mono text-slate-600">
									{category.priority ?? 0}
								</td>

								<!-- Actions -->
								<td class="py-3.5 px-4 text-right relative">
									<button
										type="button"
										onclick={() => (openActionMenuId = openActionMenuId === category.id ? null : category.id)}
										class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
									>
										<MoreVertical class="w-4 h-4" />
									</button>

									<!-- Dropdown Menu -->
									{#if openActionMenuId === category.id}
										<div class="absolute right-4 top-10 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-left text-xs">
											<button
												type="button"
												onclick={() => openEditModal(category)}
												class="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
											>
												<Edit3 class="w-3.5 h-3.5 text-slate-500" />
												<span>Edit</span>
											</button>

											<button
												type="button"
												onclick={() => toggleStatus(category)}
												class="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
											>
												<Eye class="w-3.5 h-3.5 text-slate-500" />
												<span>{category.status === 'publish' ? 'Draft করুন' : 'Publish করুন'}</span>
											</button>

											{#if !category.isTrash}
												<button
													type="button"
													onclick={() => moveToTrash(category.id)}
													class="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors"
												>
													<Trash2 class="w-3.5 h-3.5" />
													<span>Trash</span>
												</button>
											{:else}
												<button
													type="button"
													onclick={() => restoreFromTrash(category.id)}
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
		{#if filteredCategories.length > 0}
			<div class="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 text-xs text-slate-500 bg-white">
				<span>
					Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} items
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

<!-- Add / Edit Category Modal -->
{#if isModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
		<div class="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
			<!-- Modal Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
				<h3 class="font-bold text-slate-900 text-sm">
					{isEditing ? 'Edit Category' : 'Add New Category'}
				</h3>
				<button
					type="button"
					onclick={() => (isModalOpen = false)}
					class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Modal Body -->
			<div class="p-6 space-y-4 text-xs">
				<div class="space-y-1.5">
					<label for="cat-name" class="font-bold text-slate-700 block">Category Name *</label>
					<input
						id="cat-name"
						type="text"
						bind:value={formName}
						placeholder="উদাঃ Car Colour, Wall Decor"
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb]"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="cat-img" class="font-bold text-slate-700 block">Image URL (ঐচ্ছিক)</label>
					<input
						id="cat-img"
						type="text"
						bind:value={formImage}
						placeholder="https://example.com/image.png"
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb]"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="cat-priority" class="font-bold text-slate-700 block">Priority</label>
						<input
							id="cat-priority"
							type="number"
							bind:value={formPriority}
							min="0"
							class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb]"
						/>
					</div>

					<div class="space-y-1.5">
						<label for="cat-status" class="font-bold text-slate-700 block">Status</label>
						<select
							id="cat-status"
							bind:value={formStatus}
							class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb] bg-white"
						>
							<option value="publish">Publish</option>
							<option value="draft">Draft</option>
						</select>
					</div>
				</div>
			</div>

			<!-- Modal Footer -->
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
					{isEditing ? 'Save Changes' : 'Create Category'}
				</button>
			</div>
		</div>
	</div>
{/if}
