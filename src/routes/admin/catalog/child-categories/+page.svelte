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
		FileText
	} from 'lucide-svelte';
	import { CatalogFilterTabs } from '../../_components/catalog';
	import {
		INITIAL_CHILD_CATEGORIES,
		INITIAL_CATEGORIES,
		INITIAL_SUB_CATEGORIES,
		type CatalogChildCategory
	} from '../../_data.ts';

	let childCategories = $state<CatalogChildCategory[]>([...INITIAL_CHILD_CATEGORIES]);
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
	let formCategory = $state('kitchen product');
	let formSubCategory = $state('Purifeir');
	let formImage = $state('');
	let formPriority = $state<string | number>('-');
	let formStatus = $state<'publish' | 'draft'>('publish');

	let openActionMenuId = $state<string | null>(null);

	// Derived counts
	let allCount = $derived(childCategories.filter((c) => !c.isTrash).length);
	let publishCount = $derived(childCategories.filter((c) => c.status === 'publish' && !c.isTrash).length);
	let draftCount = $derived(childCategories.filter((c) => c.status === 'draft' && !c.isTrash).length);
	let lowStockCount = $derived(childCategories.filter((c) => c.isLowStock && !c.isTrash).length);
	let trashCount = $derived(childCategories.filter((c) => c.isTrash).length);

	// Filtered list
	let filteredChildCategories = $derived.by(() => {
		let list = childCategories.filter((c) => {
			if (activeTab === 'trash') return c.isTrash;
			if (c.isTrash) return false;
			if (activeTab === 'publish') return c.status === 'publish';
			if (activeTab === 'draft') return c.status === 'draft';
			if (activeTab === 'low_stock') return c.isLowStock;
			return true;
		});

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(c) =>
					c.name.toLowerCase().includes(q) ||
					c.category.toLowerCase().includes(q) ||
					c.subCategory.toLowerCase().includes(q)
			);
		}

		return list;
	});

	let totalPages = $derived(Math.max(1, Math.ceil(filteredChildCategories.length / itemsPerPage)));
	let paginatedItems = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredChildCategories.slice(start, start + itemsPerPage);
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
		formCategory = INITIAL_CATEGORIES[0]?.name || 'kitchen product';
		formSubCategory = INITIAL_SUB_CATEGORIES[0]?.name || 'Purifeir';
		formImage = '';
		formPriority = '-';
		formStatus = 'publish';
		isModalOpen = true;
	}

	function openEditModal(child: CatalogChildCategory) {
		isEditing = true;
		editingId = child.id;
		formName = child.name;
		formCategory = child.category;
		formSubCategory = child.subCategory;
		formImage = child.image || '';
		formPriority = child.priority;
		formStatus = child.status;
		openActionMenuId = null;
		isModalOpen = true;
	}

	function handleSave() {
		if (!formName.trim()) {
			alert('Child Category Name required');
			return;
		}

		if (isEditing && editingId) {
			childCategories = childCategories.map((c) =>
				c.id === editingId
					? {
							...c,
							name: formName.trim(),
							category: formCategory,
							subCategory: formSubCategory,
							image: formImage.trim(),
							priority: formPriority,
							status: formStatus
						}
					: c
			);
			showToast('চাইল্ড ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!');
		} else {
			const newChild: CatalogChildCategory = {
				id: 'child-' + Date.now(),
				name: formName.trim(),
				category: formCategory,
				subCategory: formSubCategory,
				image: formImage.trim(),
				status: formStatus,
				priority: formPriority
			};
			childCategories = [newChild, ...childCategories];
			showToast('নতুন চাইল্ড ক্যাটাগরি তৈরি করা হয়েছে!');
		}

		isModalOpen = false;
	}

	function toggleStatus(child: CatalogChildCategory) {
		const newStatus = child.status === 'publish' ? 'draft' : 'publish';
		childCategories = childCategories.map((c) => (c.id === child.id ? { ...c, status: newStatus } : c));
		openActionMenuId = null;
		showToast(`স্ট্যাটাস ${newStatus === 'publish' ? 'Publish' : 'Draft'}-এ পরিবর্তিত হয়েছে`);
	}

	function moveToTrash(id: string) {
		childCategories = childCategories.map((c) => (c.id === id ? { ...c, isTrash: true } : c));
		openActionMenuId = null;
		showToast('চাইল্ড ক্যাটাগরি ট্র্যাশে পাঠানো হয়েছে');
	}

	function restoreFromTrash(id: string) {
		childCategories = childCategories.map((c) => (c.id === id ? { ...c, isTrash: false } : c));
		openActionMenuId = null;
		showToast('চাইল্ড ক্যাটাগরি রিস্টোর করা হয়েছে');
	}
</script>

<svelte:head>
	<title>Child Category | AURA Admin</title>
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
		<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Child Category</h1>

		<button
			type="button"
			class="bg-[#5845eb] hover:bg-[#4a39cf] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
		>
			<Headset class="w-3.5 h-3.5" />
			<span>Support</span>
		</button>
	</div>

	<!-- Search & Add Child Category Row -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
		<!-- Search Input -->
		<div class="relative w-full sm:max-w-md">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search Child Category..."
				class="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5845eb] shadow-2xs pr-9"
			/>
			<Search class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
		</div>

		<!-- + Add Child Category Button -->
		<button
			type="button"
			onclick={openAddModal}
			class="bg-[#5845eb] hover:bg-[#4a39cf] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
		>
			<Plus class="w-4 h-4" />
			<span>Add Child Category</span>
		</button>
	</div>

	<!-- Filter Capsules: All Data (0), Publish (0), Draft (0), Low Stock (0), Trash (0) -->
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

	<!-- Data Table Card with exact Empty State matching Screenshot 3 -->
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
								<span>SUB CATEGORY</span>
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
						<!-- Exact Empty State matching Screenshot 3 -->
						<tr>
							<td colspan="8" class="py-24 text-center">
								<div class="flex flex-col items-center justify-center gap-3">
									<div class="relative w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center shadow-inner">
										<div class="w-9 h-9 rounded-xl bg-[#5845eb] flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
											<FileText class="w-5 h-5" />
										</div>
										<span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 ring-4 ring-white"></span>
									</div>

									<h3 class="text-sm font-bold text-slate-800 mt-2">
										No reviews found
									</h3>
									<p class="text-xs text-slate-400 max-w-sm">
										Customer reviews will appear here once available.
									</p>

									<button
										type="button"
										onclick={openAddModal}
										class="mt-2 text-xs font-bold text-[#5845eb] hover:underline cursor-pointer"
									>
										+ Add Child Category
									</button>
								</div>
							</td>
						</tr>
					{:else}
						{#each paginatedItems as child (child.id)}
							<tr class="hover:bg-slate-50/60 transition-colors">
								<td class="py-3.5 px-4">
									<input
										type="checkbox"
										checked={selectedIds.includes(child.id)}
										onchange={() => handleSelectRow(child.id)}
										class="rounded border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
									/>
								</td>

								<td class="py-3.5 px-4">
									<div class="w-12 h-10 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 overflow-hidden">
										{#if child.image}
											<img src={child.image} alt={child.name} class="w-full h-full object-cover" />
										{:else}
											<ImageIcon class="w-4 h-4 text-slate-400" />
										{/if}
									</div>
								</td>

								<td class="py-3.5 px-4 font-semibold text-slate-800">
									{child.name}
								</td>

								<td class="py-3.5 px-4 text-slate-700 font-medium">
									{child.category}
								</td>

								<td class="py-3.5 px-4 text-slate-700 font-medium">
									{child.subCategory}
								</td>

								<td class="py-3.5 px-4">
									{#if child.status === 'publish'}
										<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
											Publish
										</span>
									{:else}
										<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
											Draft
										</span>
									{/if}
								</td>

								<td class="py-3.5 px-4 font-mono text-slate-600">
									{child.priority}
								</td>

								<td class="py-3.5 px-4 text-right relative">
									<button
										type="button"
										onclick={() => (openActionMenuId = openActionMenuId === child.id ? null : child.id)}
										class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
									>
										<MoreVertical class="w-4 h-4" />
									</button>

									{#if openActionMenuId === child.id}
										<div class="absolute right-4 top-10 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-left text-xs">
											<button
												type="button"
												onclick={() => openEditModal(child)}
												class="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
											>
												<Edit3 class="w-3.5 h-3.5 text-slate-500" />
												<span>Edit</span>
											</button>

											<button
												type="button"
												onclick={() => toggleStatus(child)}
												class="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
											>
												<Eye class="w-3.5 h-3.5 text-slate-500" />
												<span>{child.status === 'publish' ? 'Draft করুন' : 'Publish করুন'}</span>
											</button>

											{#if !child.isTrash}
												<button
													type="button"
													onclick={() => moveToTrash(child.id)}
													class="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors"
												>
													<Trash2 class="w-3.5 h-3.5" />
													<span>Trash</span>
												</button>
											{:else}
												<button
													type="button"
													onclick={() => restoreFromTrash(child.id)}
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

		<!-- Pagination Footer matching Screenshot 3 -->
		<div class="flex items-center justify-end px-4 py-3.5 border-t border-slate-100 text-xs text-slate-500 bg-white">
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
	</div>
</div>

<!-- Add / Edit Child Category Modal -->
{#if isModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
		<div class="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
				<h3 class="font-bold text-slate-900 text-sm">
					{isEditing ? 'Edit Child Category' : 'Add New Child Category'}
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
					<label for="child-name" class="font-bold text-slate-700 block">Child Category Name *</label>
					<input
						id="child-name"
						type="text"
						bind:value={formName}
						placeholder="উদাঃ Water Filter Cartridge"
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb]"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="child-cat" class="font-bold text-slate-700 block">Parent Category *</label>
					<select
						id="child-cat"
						bind:value={formCategory}
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb] bg-white"
					>
						{#each INITIAL_CATEGORIES as cat}
							<option value={cat.name}>{cat.name}</option>
						{/each}
						<option value="kitchen product">kitchen product</option>
						<option value="Home Cleaning">Home Cleaning</option>
					</select>
				</div>

				<div class="space-y-1.5">
					<label for="child-subcat" class="font-bold text-slate-700 block">Sub Category *</label>
					<select
						id="child-subcat"
						bind:value={formSubCategory}
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb] bg-white"
					>
						{#each INITIAL_SUB_CATEGORIES as sub}
							<option value={sub.name}>{sub.name}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-1.5">
					<label for="child-img" class="font-bold text-slate-700 block">Image URL (ঐচ্ছিক)</label>
					<input
						id="child-img"
						type="text"
						bind:value={formImage}
						placeholder="https://example.com/image.png"
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb]"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="child-priority" class="font-bold text-slate-700 block">Priority</label>
						<input
							id="child-priority"
							type="text"
							bind:value={formPriority}
							placeholder="-"
							class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb]"
						/>
					</div>

					<div class="space-y-1.5">
						<label for="child-status" class="font-bold text-slate-700 block">Status</label>
						<select
							id="child-status"
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
					{isEditing ? 'Save Changes' : 'Create Child Category'}
				</button>
			</div>
		</div>
	</div>
{/if}
