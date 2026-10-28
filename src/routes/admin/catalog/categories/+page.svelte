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
		CheckCircle2,
		Loader2,
		AlertCircle
	} from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';
	import { CatalogFilterTabs } from '../../_components/catalog';
	import type { CatalogCategory } from '../../_data.ts';

	let { data }: { data?: any } = $props();

	// Category state initialized from real server load
	let categories = $state<CatalogCategory[]>(data?.categories || []);

	// Synchronize when server data updates
	$effect(() => {
		categories = data?.categories ? [...data.categories] : [];
	});

	let searchQuery = $state('');
	let activeTab = $state<'all' | 'publish' | 'draft' | 'low_stock' | 'trash'>('all');
	let selectedIds = $state<string[]>([]);
	let currentPage = $state(1);
	let itemsPerPage = 10;
	let isSaving = $state(false);

	function showToast(msg: string) {
		toast.success(msg);
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

	async function handleSave() {
		if (!formName.trim()) {
			showToast('ক্যাটাগরির নাম দেওয়া বাধ্যতামূলক!');
			return;
		}

		isSaving = true;
		const formData = new FormData();
		formData.append('name', formName.trim());
		formData.append('image', formImage.trim());
		formData.append('priority', String(formPriority));
		formData.append('status', formStatus);

		try {
			if (isEditing && editingId) {
				formData.append('id', editingId);
				await fetch('?/updateCategory', {
					method: 'POST',
					body: formData
				});

				// Optimistic UI update
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
				const response = await fetch('?/createCategory', {
					method: 'POST',
					body: formData
				});
				const result: any = await response.json();

				const newId = result?.data?.category?.id || 'cat-' + Date.now();
				const newCat: CatalogCategory = {
					id: newId,
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
			await invalidateAll();
		} catch (error) {
			console.error('Error saving category:', error);
			showToast('ক্যাটাগরি সংরক্ষণে ত্রুটি হয়েছে');
		} finally {
			isSaving = false;
		}
	}

	async function toggleStatus(cat: CatalogCategory) {
		const newStatus = cat.status === 'publish' ? 'draft' : 'publish';
		openActionMenuId = null;

		// Optimistic UI update
		categories = categories.map((c) => (c.id === cat.id ? { ...c, status: newStatus } : c));
		showToast(`স্ট্যাটাস ${newStatus === 'publish' ? 'Publish' : 'Draft'}-এ পরিবর্তিত হয়েছে`);

		try {
			const fd = new FormData();
			fd.append('id', cat.id);
			await fetch('?/toggleStatus', {
				method: 'POST',
				body: fd
			});
			await invalidateAll();
		} catch (e) {
			console.error('Error toggling status on server:', e);
		}
	}

	async function moveToTrash(id: string) {
		openActionMenuId = null;
		categories = categories.map((c) => (c.id === id ? { ...c, isTrash: true } : c));
		showToast('ক্যাটাগরি ট্র্যাশে পাঠানো হয়েছে');

		try {
			const fd = new FormData();
			fd.append('id', id);
			await fetch('?/deleteCategory', {
				method: 'POST',
				body: fd
			});
			await invalidateAll();
		} catch (e) {
			console.error('Error deleting category on server:', e);
		}
	}

	function restoreFromTrash(id: string) {
		categories = categories.map((c) => (c.id === id ? { ...c, isTrash: false } : c));
		openActionMenuId = null;
		showToast('ক্যাটাগরি রিস্টোর করা হয়েছে');
	}

	async function handleBulkDelete() {
		if (selectedIds.length === 0) return;
		const confirmed = await confirmModal({
			title: 'ক্যাটাগরি মুছে ফেলা',
			message: `আপনি কি নিশ্চিতভাবে নির্বাচিত ${selectedIds.length}টি ক্যাটাগরি মুছে ফেলতে চান?`,
			confirmText: 'হ্যাঁ, মুছে ফেলুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) {
			return;
		}

		const count = selectedIds.length;
		const toDelete = [...selectedIds];
		categories = categories.filter((c) => !toDelete.includes(c.id));
		selectedIds = [];
		showToast(`${count}টি ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে`);

		try {
			const fd = new FormData();
			fd.append('ids', JSON.stringify(toDelete));
			await fetch('?/bulkDelete', {
				method: 'POST',
				body: fd
			});
			await invalidateAll();
		} catch (e) {
			console.error('Error bulk deleting categories:', e);
		}
	}
</script>

<svelte:head>
	<title>Category | AURA Admin</title>
</svelte:head>

<div class="space-y-6 max-w-[1400px] mx-auto pb-12 font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Top Bar: Title & Support Button -->
	<div class="flex items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Category</h1>
			<p class="text-xs text-slate-500 mt-1">পণ্যসমূহের প্রধান ক্যাটাগরি তালিকা ও সংগঠন পরিচালনা করুন</p>
		</div>

		<a
			href="/admin/support"
			class="bg-[#5845eb] hover:bg-[#4a39cf] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
		>
			<Headset class="w-3.5 h-3.5" />
			<span>Support</span>
		</a>
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

		<!-- Action Buttons -->
		<div class="flex items-center gap-3">
			{#if selectedIds.length > 0}
				<button
					type="button"
					onclick={handleBulkDelete}
					class="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer animate-in fade-in"
				>
					<Trash2 class="w-4 h-4" />
					<span>মুছে ফেলুন ({selectedIds.length})</span>
				</button>
			{/if}

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
	</div>

	<!-- Filter Capsules: All Data, Publish, Draft, Low Stock, Trash -->
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
	<div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden min-h-[260px]">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs border-collapse">
				<thead>
					<tr class="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
						<th class="py-3.5 px-4 w-10">
							<input
								type="checkbox"
								checked={selectedIds.length > 0 && selectedIds.length === paginatedCategories.length}
								onchange={handleSelectAll}
								aria-label="Select all categories"
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
						{#each paginatedCategories as category, index (category.id)}
							<tr class="hover:bg-slate-50/60 transition-colors">
								<!-- Checkbox -->
								<td class="py-3.5 px-4">
									<input
										type="checkbox"
										checked={selectedIds.includes(category.id)}
										onchange={() => handleSelectRow(category.id)}
										aria-label={`Select ${category.name}`}
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
									<span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
										{category.productsCount}
									</span>
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
										aria-label="Actions menu"
									>
										<MoreVertical class="w-4 h-4" />
									</button>

									<!-- Dropdown Menu -->
									{#if openActionMenuId === category.id}
										<div class="absolute right-4 {index >= paginatedCategories.length - 2 && paginatedCategories.length > 2 ? 'bottom-10 top-auto origin-bottom-right' : 'top-10'} w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-left text-xs animate-in fade-in duration-100">
											<button
												type="button"
												onclick={() => openEditModal(category)}
												class="w-full px-3 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
											>
												<Edit3 class="w-3.5 h-3.5 text-slate-500" />
												<span>Edit</span>
											</button>

											<button
												type="button"
												onclick={() => toggleStatus(category)}
												class="w-full px-3 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
											>
												<Eye class="w-3.5 h-3.5 text-slate-500" />
												<span>{category.status === 'publish' ? 'Draft করুন' : 'Publish করুন'}</span>
											</button>

											{#if !category.isTrash}
												<button
													type="button"
													onclick={() => moveToTrash(category.id)}
													class="w-full px-3 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
												>
													<Trash2 class="w-3.5 h-3.5" />
													<span>Trash</span>
												</button>
											{:else}
												<button
													type="button"
													onclick={() => restoreFromTrash(category.id)}
													class="w-full px-3 py-2 flex items-center gap-2 text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
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
						aria-label="Previous page"
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
						aria-label="Next page"
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
					aria-label="Close modal"
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
						placeholder="উদাঃ /images/products/soundcore.svg"
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
							class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb] bg-white cursor-pointer"
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
					disabled={isSaving}
					onclick={handleSave}
					class="px-4 py-2 rounded-xl text-xs font-bold bg-[#5845eb] text-white hover:bg-[#4a39cf] shadow-sm shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
				>
					{#if isSaving}
						<Loader2 class="w-3.5 h-3.5 animate-spin" />
						<span>সংরক্ষণ হচ্ছে...</span>
					{:else}
						<span>{isEditing ? 'Save Changes' : 'Create Category'}</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
