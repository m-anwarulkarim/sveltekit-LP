<script lang="ts">
	import { invalidateAll } from '$app/navigation';
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
		CheckCircle2,
		RotateCw,
		RotateCcw,
		Globe,
		ExternalLink,
		PackageCheck,
		AlertTriangle
	} from 'lucide-svelte';
	import { CatalogFilterTabs } from '../../_components/catalog';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import type { BrandItem } from '#lib/server/services/brand.service';

	let { data }: { data: PageData } = $props();

	// Reactive local state initialized from server
	let brands = $derived<BrandItem[]>(data?.brands || []);
	let searchQuery = $state('');
	let activeTab = $state<'all' | 'publish' | 'draft' | 'low_stock' | 'trash'>(data?.activeTab || 'all');
	let selectedIds = $state<string[]>([]);
	let currentPage = $state(1);
	let itemsPerPage = 10;

	// Modal state
	let isModalOpen = $state(false);
	let isEditing = $state(false);
	let editingId = $state<string | null>(null);
	let formName = $state('');
	let formSlug = $state('');
	let formLogo = $state('');
	let formWebsite = $state('');
	let formHomeShow = $state<'Yes' | 'No'>('No');
	let formPriority = $state<string | number>(0);
	let formStatus = $state<'publish' | 'draft'>('publish');
	let isSubmitting = $state(false);

	let openActionMenuId = $state<string | null>(null);

	// Derived counts directly from database
	let allCount = $derived(data?.counts?.allCount ?? 0);
	let publishCount = $derived(data?.counts?.publishCount ?? 0);
	let draftCount = $derived(data?.counts?.draftCount ?? 0);
	let trashCount = $derived(data?.counts?.trashCount ?? 0);

	// Client-side search and filtering for high-speed responsiveness
	let filteredBrands = $derived.by(() => {
		let list = brands.filter((b) => {
			if (activeTab === 'trash') return b.isTrash;
			if (b.isTrash) return false;
			if (activeTab === 'publish') return b.isActive;
			if (activeTab === 'draft') return !b.isActive;
			return true;
		});

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(b) =>
					b.name.toLowerCase().includes(q) ||
					(b.slug && b.slug.toLowerCase().includes(q))
			);
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

	function formatDate(timestamp: any): string {
		if (!timestamp) return '-';
		try {
			const d = new Date(Number(timestamp) || timestamp);
			if (isNaN(d.getTime())) return '-';
			return d.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			});
		} catch {
			return '-';
		}
	}

	function openAddModal() {
		isEditing = false;
		editingId = null;
		formName = '';
		formSlug = '';
		formLogo = '';
		formWebsite = '';
		formHomeShow = 'No';
		formPriority = 0;
		formStatus = 'publish';
		isModalOpen = true;
	}

	function openEditModal(brand: BrandItem) {
		isEditing = true;
		editingId = brand.id;
		formName = brand.name;
		formSlug = brand.slug;
		formLogo = brand.logo || '';
		formWebsite = brand.website || '';
		formHomeShow = brand.isFeatured ? 'Yes' : 'No';
		formPriority = brand.sortOrder ?? 0;
		formStatus = brand.isActive ? 'publish' : 'draft';
		openActionMenuId = null;
		isModalOpen = true;
	}

	async function handleSave() {
		if (!formName.trim()) {
			toast.error('ব্র্যান্ডের নাম প্রদান করুন');
			return;
		}

		isSubmitting = true;
		const fd = new FormData();
		fd.append('name', formName.trim());
		if (formSlug.trim()) fd.append('slug', formSlug.trim());
		if (formLogo.trim()) fd.append('logo', formLogo.trim());
		if (formWebsite.trim()) fd.append('website', formWebsite.trim());
		fd.append('homeShow', formHomeShow);
		fd.append('priority', String(formPriority));
		fd.append('status', formStatus);

		const actionName = isEditing && editingId ? '?/updateBrand' : '?/createBrand';
		if (isEditing && editingId) {
			fd.append('id', editingId);
		}

		try {
			const res = await fetch(actionName, {
				method: 'POST',
				body: fd
			});
			const result = (await res.json()) as any;

			if (result.type === 'success' || result.status === 200) {
				await invalidateAll();
				toast.success(
					isEditing
						? 'ব্র্যান্ড সফলভাবে আপডেট করা হয়েছে!'
						: 'নতুন ব্র্যান্ড সফলভাবে তৈরি করা হয়েছে!'
				);
				isModalOpen = false;
			} else {
				toast.error(result?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
			}
		} catch (err) {
			console.error(err);
			toast.error('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে');
		} finally {
			isSubmitting = false;
		}
	}

	async function toggleStatus(brand: BrandItem) {
		const fd = new FormData();
		fd.append('id', brand.id);
		openActionMenuId = null;

		try {
			const res = await fetch('?/toggleStatus', { method: 'POST', body: fd });
			const result = (await res.json()) as any;
			if (result.type === 'success' || result.status === 200) {
				await invalidateAll();
				const label = !brand.isActive ? 'Publish' : 'Draft';
				toast.success(`স্ট্যাটাস ${label}-এ পরিবর্তিত হয়েছে`);
			} else {
				toast.error(result?.data?.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ');
			}
		} catch (err) {
			toast.error('সমস্যা হয়েছে');
		}
	}

	async function moveToTrash(id: string) {
		const fd = new FormData();
		fd.append('id', id);
		openActionMenuId = null;

		try {
			const res = await fetch('?/trashBrand', { method: 'POST', body: fd });
			const result = (await res.json()) as any;
			if (result.type === 'success' || result.status === 200) {
				await invalidateAll();
				toast.success('ব্র্যান্ড ট্র্যাশে পাঠানো হয়েছে');
			} else {
				toast.error(result?.data?.message || 'ব্যর্থ হয়েছে');
			}
		} catch (err) {
			toast.error('সমস্যা হয়েছে');
		}
	}

	async function restoreFromTrash(id: string) {
		const fd = new FormData();
		fd.append('id', id);
		openActionMenuId = null;

		try {
			const res = await fetch('?/restoreBrand', { method: 'POST', body: fd });
			const result = (await res.json()) as any;
			if (result.type === 'success' || result.status === 200) {
				await invalidateAll();
				toast.success('ব্র্যান্ড রিস্টোর করা হয়েছে');
			} else {
				toast.error(result?.data?.message || 'ব্যর্থ হয়েছে');
			}
		} catch (err) {
			toast.error('সমস্যা হয়েছে');
		}
	}

	async function deletePermanently(id: string) {
		if (!confirm('আপনি কি নিশ্চিত যে এই ব্র্যান্ডটি স্থায়ীভাবে মুছে ফেলতে চান?')) return;
		const fd = new FormData();
		fd.append('id', id);
		openActionMenuId = null;

		try {
			const res = await fetch('?/deleteBrand', { method: 'POST', body: fd });
			const result = (await res.json()) as any;
			if (result.type === 'success' || result.status === 200) {
				await invalidateAll();
				toast.success('ব্র্যান্ড স্থায়ীভাবে মুছে ফেলা হয়েছে');
			} else {
				toast.error(result?.data?.message || 'মুছে ফেলতে ব্যর্থ');
			}
		} catch (err) {
			toast.error('সমস্যা হয়েছে');
		}
	}

	async function handleBulkAction(action: 'publish' | 'draft' | 'trash' | 'restore' | 'delete') {
		if (selectedIds.length === 0) return;
		if (action === 'delete' && !confirm(`নির্বাচিত ${selectedIds.length} টি ব্র্যান্ড স্থায়ীভাবে মুছে ফেলতে চান?`)) {
			return;
		}

		const fd = new FormData();
		fd.append('ids', JSON.stringify(selectedIds));
		fd.append('action', action);

		try {
			const res = await fetch('?/bulkAction', { method: 'POST', body: fd });
			const result = (await res.json()) as any;
			if (result.type === 'success' || result.status === 200) {
				await invalidateAll();
				toast.success(result?.data?.message || 'বাল্ক অ্যাকশন সম্পন্ন হয়েছে!');
				selectedIds = [];
			} else {
				toast.error(result?.data?.message || 'ব্যর্থ হয়েছে');
			}
		} catch (err) {
			toast.error('বাল্ক অ্যাকশনে সমস্যা হয়েছে');
		}
	}
</script>

<svelte:head>
	<title>Brands Management | AURA Admin</title>
</svelte:head>

<div class="space-y-6 max-w-[1400px] mx-auto pb-16">
	<!-- Top Bar: Title & Support Button -->
	<div class="flex items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Brands</h1>
			<p class="text-xs text-slate-500 mt-0.5">
				পণ্য ক্যাটালগ ব্র্যান্ড ও প্রস্তুতকারক তালিকা পরিচালনা করুন
			</p>
		</div>

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
		<!-- Search Input -->
		<div class="relative w-full sm:max-w-md">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search Brand by name or slug..."
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

	<!-- Filter Capsules: All Data, Publish, Draft, Trash -->
	<CatalogFilterTabs
		{activeTab}
		{allCount}
		{publishCount}
		{draftCount}
		{trashCount}
		onTabChange={(tab) => {
			activeTab = tab;
			currentPage = 1;
			selectedIds = [];
		}}
	/>

	<!-- Bulk Actions Floating Bar (When items selected) -->
	{#if selectedIds.length > 0}
		<div class="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
			<div class="flex items-center gap-2 text-xs font-bold text-indigo-950">
				<span class="w-6 h-6 rounded-lg bg-[#5845eb] text-white flex items-center justify-center text-[11px]">
					{selectedIds.length}
				</span>
				<span>টি ব্র্যান্ড নির্বাচিত হয়েছে</span>
			</div>

			<div class="flex items-center gap-2">
				{#if activeTab !== 'trash'}
					<button
						type="button"
						onclick={() => handleBulkAction('publish')}
						class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
					>
						Publish All
					</button>
					<button
						type="button"
						onclick={() => handleBulkAction('draft')}
						class="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer"
					>
						Draft All
					</button>
					<button
						type="button"
						onclick={() => handleBulkAction('trash')}
						class="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
					>
						Trash Selected
					</button>
				{:else}
					<button
						type="button"
						onclick={() => handleBulkAction('restore')}
						class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
					>
						Restore Selected
					</button>
					<button
						type="button"
						onclick={() => handleBulkAction('delete')}
						class="px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs font-bold hover:bg-red-800 transition-colors cursor-pointer"
					>
						Delete Permanently
					</button>
				{/if}
				<button
					type="button"
					onclick={() => (selectedIds = [])}
					class="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
				>
					Clear
				</button>
			</div>
		</div>
	{/if}

	<!-- Data Table Card -->
	<div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden min-h-[260px]">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs border-collapse">
				<thead>
					<tr class="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
						<th class="py-3.5 px-4 w-10">
							<input
								type="checkbox"
								checked={paginatedItems.length > 0 && selectedIds.length === paginatedItems.length}
								onchange={handleSelectAll}
								class="rounded border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
							/>
						</th>
						<th class="py-3.5 px-4 w-14">SL</th>
						<th class="py-3.5 px-4">BRAND NAME</th>
						<th class="py-3.5 px-4">DATE</th>
						<th class="py-3.5 px-4">HOME SHOW</th>
						<th class="py-3.5 px-4">PRIORITY</th>
						<th class="py-3.5 px-4">STATUS</th>
						<th class="py-3.5 px-4 text-right">ACTIONS</th>
					</tr>
				</thead>

				<tbody class="divide-y divide-slate-100">
					{#if paginatedItems.length === 0}
						<tr>
							<td colspan="8" class="py-14 text-center text-slate-400 text-xs">
								<div class="flex flex-col items-center justify-center gap-2">
									<PackageCheck class="w-8 h-8 text-slate-300 stroke-1" />
									<span>কোনো ব্র্যান্ডের রেকর্ড পাওয়া যায়নি।</span>
								</div>
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
								<td class="py-3.5 px-4 font-mono text-slate-500">
									{(currentPage - 1) * itemsPerPage + idx + 1}
								</td>

								<!-- Name & Metadata -->
								<td class="py-3.5 px-4">
									<div class="flex items-center gap-3">
										{#if brand.logo}
											<img
												src={brand.logo}
												alt={brand.name}
												class="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-200 shrink-0"
											/>
										{:else}
											<div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-[#5845eb] font-bold text-xs flex items-center justify-center shrink-0">
												{brand.name.slice(0, 2).toUpperCase()}
											</div>
										{/if}

										<div>
											<div class="flex items-center gap-2">
												<span class="font-bold text-slate-900 text-xs">{brand.name}</span>
												{#if brand.productsCount && brand.productsCount > 0}
													<span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
														{brand.productsCount} items
													</span>
												{/if}
											</div>
											<div class="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
												<span>/{brand.slug}</span>
												{#if brand.website}
													<a
														href={brand.website}
														target="_blank"
														rel="noopener noreferrer"
														class="text-indigo-600 hover:underline inline-flex items-center gap-0.5"
													>
														<Globe class="w-3 h-3" />
														<span>ওয়েবসাইট</span>
													</a>
												{/if}
											</div>
										</div>
									</div>
								</td>

								<!-- Date -->
								<td class="py-3.5 px-4 text-slate-500 font-mono text-xs">
									{formatDate(brand.createdAt)}
								</td>

								<!-- Home Show -->
								<td class="py-3.5 px-4">
									{#if brand.isFeatured}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
											Yes
										</span>
									{:else}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
											No
										</span>
									{/if}
								</td>

								<!-- Priority -->
								<td class="py-3.5 px-4 font-mono text-slate-600 font-bold">
									{brand.sortOrder !== 0 ? brand.sortOrder : '-'}
								</td>

								<!-- Status -->
								<td class="py-3.5 px-4">
									{#if brand.isTrash}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
											Trash
										</span>
									{:else if brand.isActive}
										<button
											type="button"
											onclick={() => toggleStatus(brand)}
											title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
											class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
										>
											Publish
										</button>
									{:else}
										<button
											type="button"
											onclick={() => toggleStatus(brand)}
											title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
											class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
										>
											Draft
										</button>
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
										<div class="absolute right-4 {idx >= paginatedItems.length - 2 && paginatedItems.length > 2 ? 'bottom-10 top-auto origin-bottom-right' : 'top-10'} w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-left text-xs animate-in fade-in">
											<button
												type="button"
												onclick={() => openEditModal(brand)}
												class="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
											>
												<Edit3 class="w-3.5 h-3.5 text-slate-500" />
												<span>Edit Brand</span>
											</button>

											{#if !brand.isTrash}
												<button
													type="button"
													onclick={() => toggleStatus(brand)}
													class="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
												>
													<Eye class="w-3.5 h-3.5 text-slate-500" />
													<span>{brand.isActive ? 'Draft করুন' : 'Publish করুন'}</span>
												</button>

												<button
													type="button"
													onclick={() => moveToTrash(brand.id)}
													class="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
												>
													<Trash2 class="w-3.5 h-3.5" />
													<span>Move to Trash</span>
												</button>
											{:else}
												<button
													type="button"
													onclick={() => restoreFromTrash(brand.id)}
													class="w-full px-3 py-1.5 flex items-center gap-2 text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
												>
													<RotateCcw class="w-3.5 h-3.5" />
													<span>Restore Brand</span>
												</button>

												<button
													type="button"
													onclick={() => deletePermanently(brand.id)}
													class="w-full px-3 py-1.5 flex items-center gap-2 text-red-700 hover:bg-red-50 transition-colors font-bold cursor-pointer"
												>
													<Trash2 class="w-3.5 h-3.5" />
													<span>Delete Forever</span>
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
		{#if totalPages > 1}
			<div class="px-4 py-3 bg-slate-50/50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
				<span>
					Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBrands.length)} of {filteredBrands.length} brands
				</span>

				<div class="flex items-center gap-1.5">
					<button
						type="button"
						disabled={currentPage <= 1}
						onclick={() => (currentPage = Math.max(1, currentPage - 1))}
						class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
					>
						<ChevronLeft class="w-4 h-4" />
					</button>

					<span class="px-2 font-mono text-slate-700 font-bold">{currentPage} / {totalPages}</span>

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
		<div class="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
				<div>
					<h3 class="font-bold text-slate-900 text-sm">
						{isEditing ? 'Edit Brand' : 'Add New Brand'}
					</h3>
					<p class="text-[11px] text-slate-500">
						{isEditing ? 'বিদ্যমান ব্র্যান্ডের তথ্য আপডেট করুন' : 'নতুন ব্র্যান্ডের নাম ও প্যারামিটার যুক্ত করুন'}
					</p>
				</div>
				<button
					type="button"
					onclick={() => (isModalOpen = false)}
					class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<div class="p-6 space-y-4 text-xs">
				<div class="space-y-1.5">
					<label for="brand-name" class="font-bold text-slate-700 block">
						Brand Name <span class="text-red-500">*</span>
					</label>
					<input
						id="brand-name"
						type="text"
						bind:value={formName}
						placeholder="উদাঃ Samsung, Apple, COSRX"
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb] shadow-2xs"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="brand-slug" class="font-bold text-slate-700 block">
						Custom Slug (ঐচ্ছিক)
					</label>
					<input
						id="brand-slug"
						type="text"
						bind:value={formSlug}
						placeholder="খালি রাখলে স্বয়ংক্রিয় তৈরি হবে"
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb] font-mono shadow-2xs"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="brand-logo" class="font-bold text-slate-700 block">
						Logo Image URL (ঐচ্ছিক)
					</label>
					<input
						id="brand-logo"
						type="text"
						bind:value={formLogo}
						placeholder="https://example.com/logo.png"
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb] shadow-2xs"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="brand-home" class="font-bold text-slate-700 block">Home Show</label>
						<select
							id="brand-home"
							bind:value={formHomeShow}
							class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb] bg-white shadow-2xs"
						>
							<option value="Yes">Yes</option>
							<option value="No">No</option>
						</select>
					</div>

					<div class="space-y-1.5">
						<label for="brand-priority" class="font-bold text-slate-700 block">Priority (Order)</label>
						<input
							id="brand-priority"
							type="number"
							bind:value={formPriority}
							placeholder="0"
							class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb] shadow-2xs"
						/>
					</div>
				</div>

				<div class="space-y-1.5">
					<label for="brand-status" class="font-bold text-slate-700 block">Status</label>
					<select
						id="brand-status"
						bind:value={formStatus}
						class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5845eb] bg-white shadow-2xs"
					>
						<option value="publish">Publish (Active)</option>
						<option value="draft">Draft (Inactive)</option>
					</select>
				</div>
			</div>

			<div class="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100">
				<button
					type="button"
					onclick={() => (isModalOpen = false)}
					disabled={isSubmitting}
					class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
				>
					বাতিল
				</button>
				<button
					type="button"
					onclick={handleSave}
					disabled={isSubmitting}
					class="px-5 py-2 rounded-xl text-xs font-bold bg-[#5845eb] text-white hover:bg-[#4a39cf] shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
				>
					{#if isSubmitting}
						<RotateCw class="w-3.5 h-3.5 animate-spin" />
						<span>সংরক্ষণ হচ্ছে...</span>
					{:else}
						<CheckCircle2 class="w-3.5 h-3.5" />
						<span>{isEditing ? 'Save Changes' : 'Create Brand'}</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
