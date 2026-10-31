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
	import { CatalogFilterTabs } from '../../_components/catalog';
	import type { CatalogSubCategory } from '../../_data.ts';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';

	let { data }: { data?: any } = $props();

	let subCategories = $state<any[]>(data?.subCategories || []);

	// Synchronize when server data updates
	$effect(() => {
		subCategories = data?.subCategories ? [...data.subCategories] : [];
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
	let formCategoryId = $state('');
	let formImage = $state('');
	let formPriority = $state<number>(0);
	let formStatus = $state<'publish' | 'draft'>('publish');

	let openActionMenuId = $state<string | null>(null);

	// Derived counts
	let allCount = $derived(subCategories.filter((c) => !c.isTrash).length);
	let publishCount = $derived(subCategories.filter((c) => c.status === 'publish' && !c.isTrash).length);
	let draftCount = $derived(subCategories.filter((c) => c.status === 'draft' && !c.isTrash).length);
	let lowStockCount = $derived(subCategories.filter((c) => c.isLowStock && !c.isTrash).length);
	let trashCount = $derived(subCategories.filter((c) => c.isTrash).length);

	// Filtered list
	let filteredSubCategories = $derived.by(() => {
		let list = subCategories.filter((c) => {
			if (activeTab === 'trash') return c.isTrash;
			if (c.isTrash) return false;
			if (activeTab === 'publish') return c.status === 'publish';
			if (activeTab === 'draft') return c.status === 'draft';
			if (activeTab === 'low_stock') return c.isLowStock;
			return true;
		});

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.category && c.category.toLowerCase().includes(q)));
		}

		return list;
	});

	let totalPages = $derived(Math.max(1, Math.ceil(filteredSubCategories.length / itemsPerPage)));
	let paginatedItems = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredSubCategories.slice(start, start + itemsPerPage);
	});

	function handleSelectAll(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		if (checked) {
			selectedIds = paginatedItems.map((c) => c.id);
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
		formCategoryId = data?.parentCategories?.[0]?.id || '';
		formImage = '';
		formPriority = 0;
		formStatus = 'publish';
		isModalOpen = true;
	}

	function openEditModal(sub: any) {
		isEditing = true;
		editingId = sub.id;
		formName = sub.name;
		formCategoryId = sub.categoryId || '';
		formImage = sub.image || '';
		formPriority = typeof sub.priority === 'number' ? sub.priority : 0;
		formStatus = sub.status || 'publish';
		openActionMenuId = null;
		isModalOpen = true;
	}

	async function handleSave() {
		if (!formName.trim()) {
			showToast('সাব ক্যাটাগরির নাম দেওয়া বাধ্যতামূলক!');
			return;
		}
		if (!formCategoryId) {
			showToast('প্যারেন্ট ক্যাটাগরি নির্বাচন করুন!');
			return;
		}

		isSaving = true;
		const formData = new FormData();
		formData.append('name', formName.trim());
		formData.append('categoryId', formCategoryId);
		formData.append('image', formImage.trim());
		formData.append('priority', String(formPriority));
		formData.append('status', formStatus);

		try {
			if (isEditing && editingId) {
				formData.append('id', editingId);
				await fetch('?/updateSubCategory', {
					method: 'POST',
					body: formData
				});
				showToast('সাব ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!');
			} else {
				await fetch('?/createSubCategory', {
					method: 'POST',
					body: formData
				});
				showToast('নতুন সাব ক্যাটাগরি তৈরি করা হয়েছে!');
			}
			isModalOpen = false;
			await invalidateAll();
		} catch (error) {
			console.error('Error saving sub-category:', error);
			showToast('সাব ক্যাটাগরি সংরক্ষণে ত্রুটি হয়েছে');
		} finally {
			isSaving = false;
		}
	}

	async function toggleStatus(sub: any) {
		const newStatus = sub.status === 'publish' ? 'draft' : 'publish';
		subCategories = subCategories.map((c) => (c.id === sub.id ? { ...c, status: newStatus } : c));
		openActionMenuId = null;
		showToast(`স্ট্যাটাস ${newStatus === 'publish' ? 'Publish' : 'Draft'}-এ পরিবর্তিত হয়েছে`);

		try {
			const fd = new FormData();
			fd.append('id', sub.id);
			await fetch('?/toggleStatus', {
				method: 'POST',
				body: fd
			});
			await invalidateAll();
		} catch (e) {
			console.error('Error toggling subcategory status:', e);
		}
	}

	async function moveToTrash(id: string) {
		subCategories = subCategories.map((c) => (c.id === id ? { ...c, isTrash: true } : c));
		openActionMenuId = null;
		showToast('সাব ক্যাটাগরি মুছে ফেলা হয়েছে');

		try {
			const fd = new FormData();
			fd.append('id', id);
			await fetch('?/deleteSubCategory', {
				method: 'POST',
				body: fd
			});
			await invalidateAll();
		} catch (e) {
			console.error('Error deleting sub-category:', e);
		}
	}

	function restoreFromTrash(id: string) {
		subCategories = subCategories.map((c) => (c.id === id ? { ...c, isTrash: false } : c));
		openActionMenuId = null;
		showToast('সাব ক্যাটাগরি রিস্টোর করা হয়েছে');
	}

	async function handleBulkDelete() {
		if (selectedIds.length === 0) return;
		const confirmed = await confirmModal({
			title: 'সাব ক্যাটাগরি মুছে ফেলা',
			message: `আপনি কি নিশ্চিতভাবে নির্বাচিত ${selectedIds.length}টি সাব ক্যাটাগরি মুছে ফেলতে চান?`,
			confirmText: 'হ্যাঁ, মুছে ফেলুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) {
			return;
		}

		const count = selectedIds.length;
		const toDelete = [...selectedIds];
		subCategories = subCategories.filter((c) => !toDelete.includes(c.id));
		selectedIds = [];
		showToast(`${count}টি সাব ক্যাটাগরি মুছে ফেলা হয়েছে`);

		try {
			const fd = new FormData();
			fd.append('ids', JSON.stringify(toDelete));
			await fetch('?/bulkDelete', {
				method: 'POST',
				body: fd
			});
			await invalidateAll();
		} catch (e) {
			console.error('Error bulk deleting subcategories:', e);
		}
	}
</script>

<svelte:head>
	<title>Sub Category | AURA Admin</title>
</svelte:head>

<div class="space-y-6 max-w-[1400px] mx-auto pb-12">
	<!-- Top Bar: Title & Support Button -->
	<div class="flex items-center justify-between gap-4">
		<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Sub Category</h1>

		<button
			type="button"
			class="bg-[#5845eb] hover:bg-[#4a39cf] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
		>
			<Headset class="w-3.5 h-3.5" />
			<span>Support</span>
		</button>
	</div>

	<!-- Search & Add Sub Category Row -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
		<!-- Search Input -->
		<div class="relative w-full sm:max-w-md">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search Sub Category..."
				class="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5845eb] shadow-2xs pr-9"
			/>
			<Search class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
		</div>

		<!-- + Add Sub Category Button -->
		<button
			type="button"
			onclick={openAddModal}
			class="bg-[#5845eb] hover:bg-[#4a39cf] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
		>
			<Plus class="w-4 h-4" />
			<span>Add Sub Category</span>
		</button>
	</div>

	<!-- Filter Capsules: All Data (2), Publish (2), Draft (0), Low Stock (0), Trash (0) -->
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
								checked={selectedIds.length > 0 && selectedIds.length === paginatedItems.length}
								onchange={handleSelectAll}
								class="rounded border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
							/>
						</th>
						<th class="py-3.5 px-4">IMAGE</th>
						<th class="py-3.5 px-4">NAME</th>
						<th class="py-3.5 px-4">
							<div class="flex items-center gap-1.5 cursor-pointer hover:text-slate-700">
								<span>CATEGORY</span>
								<Filter class="w-3 h-3 text-slate-400" />
							</div>
						</th>
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
					{#if paginatedItems.length === 0}
						<tr>
							<td colspan="7" class="py-12 text-center text-slate-400 text-xs">
								কোনো সাব-ক্যাটাগরি পাওয়া যায়নি।
							</td>
						</tr>
					{:else}
						{#each paginatedItems as sub, index (sub.id)}
							<tr class="hover:bg-slate-50/60 transition-colors">
								<!-- Checkbox -->
								<td class="py-3.5 px-4">
									<input
										type="checkbox"
										checked={selectedIds.includes(sub.id)}
										onchange={() => handleSelectRow(sub.id)}
										class="rounded border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
									/>
								</td>

								<!-- Image -->
								<td class="py-3.5 px-4">
									<div class="w-12 h-10 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 overflow-hidden">
										{#if sub.image}
											<img src={sub.image} alt={sub.name} class="w-full h-full object-cover" />
										{:else}
											<ImageIcon class="w-4 h-4 text-slate-400" />
										{/if}
									</div>
								</td>

								<!-- Name -->
								<td class="py-3.5 px-4 font-semibold text-slate-800">
									{sub.name}
								</td>

								<!-- Category -->
								<td class="py-3.5 px-4">
									<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-[#5845eb] border border-indigo-100">
										{sub.category}
									</span>
								</td>

								<!-- Status -->
								<td class="py-3.5 px-4">
									{#if sub.status === 'publish'}
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
									{sub.priority}
								</td>

								<!-- Actions -->
								<td class="py-3.5 px-4 text-right relative">
									<button
										type="button"
										onclick={() => (openActionMenuId = openActionMenuId === sub.id ? null : sub.id)}
										class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
									>
										<MoreVertical class="w-4 h-4" />
									</button>

									{#if openActionMenuId === sub.id}
										<div class="absolute right-4 {index >= paginatedItems.length - 2 && paginatedItems.length > 2 ? 'bottom-10 top-auto origin-bottom-right' : 'top-10'} w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-left text-xs">
											<button
												type="button"
												onclick={() => openEditModal(sub)}
												class="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
											>
												<Edit3 class="w-3.5 h-3.5 text-slate-500" />
												<span>Edit</span>
											</button>

											<button
												type="button"
												onclick={() => toggleStatus(sub)}
												class="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
											>
												<Eye class="w-3.5 h-3.5 text-slate-500" />
												<span>{sub.status === 'publish' ? 'Draft করুন' : 'Publish করুন'}</span>
											</button>

											{#if !sub.isTrash}
												<button
													type="button"
													onclick={() => moveToTrash(sub.id)}
													class="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors"
												>
													<Trash2 class="w-3.5 h-3.5" />
													<span>Trash</span>
												</button>
											{:else}
												<button
													type="button"
													onclick={() => restoreFromTrash(sub.id)}
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
		{#if filteredSubCategories.length > 0}
			<div class="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 text-xs text-slate-500 bg-white">
				<span>
					Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredSubCategories.length)} of {filteredSubCategories.length} items
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

<!-- Add / Edit Sub Category Modal -->
{#if isModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
		<div class="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
				<h3 class="font-bold text-slate-900 text-sm">
					{isEditing ? 'Edit Sub Category' : 'Add New Sub Category'}
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
					<label for="sub-name" class="font-bold text-slate-700 block">Sub Category Name *</label>
					<input
						id="sub-name"
						type="text"
						bind:value={formName}
						placeholder="উদাঃ Purifeir, Cleaning"
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb]"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="sub-parent" class="font-bold text-slate-700 block">Parent Category *</label>
					<select
						id="sub-parent"
						bind:value={formCategoryId}
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb] bg-white"
					>
						<option value="" disabled>-- ক্যাটাগরি বেছে নিন --</option>
						{#each (data?.parentCategories || []) as cat}
							<option value={cat.id}>{cat.name}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-1.5">
					<label for="sub-img" class="font-bold text-slate-700 block">Image URL (ঐচ্ছিক)</label>
					<input
						id="sub-img"
						type="text"
						bind:value={formImage}
						placeholder="https://example.com/image.png"
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb]"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="sub-priority" class="font-bold text-slate-700 block">Priority</label>
						<input
							id="sub-priority"
							type="text"
							bind:value={formPriority}
							placeholder="-"
							class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb]"
						/>
					</div>

					<div class="space-y-1.5">
						<label for="sub-status" class="font-bold text-slate-700 block">Status</label>
						<select
							id="sub-status"
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
					disabled={isSaving}
					class="px-4 py-2 rounded-xl text-xs font-bold bg-[#5845eb] text-white hover:bg-[#4a39cf] shadow-sm shadow-indigo-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
				>
					{#if isSaving}
						<Loader2 class="w-3.5 h-3.5 animate-spin" />
						<span>সংরক্ষণ হচ্ছে...</span>
					{:else}
						<span>{isEditing ? 'Save Changes' : 'Create Sub Category'}</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
