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
		CheckCircle2,
		Loader2,
		Tag as TagIcon
	} from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';
	import { CatalogFilterTabs } from '../../_components/catalog';
	import type { CatalogTag } from '../../_data.ts';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';

	let { data }: { data?: any } = $props();

	// Tags state initialized from real server data
	let tags = $state<CatalogTag[]>(data?.tags || []);

	// Synchronize when server data updates
	$effect(() => {
		tags = data?.tags ? [...data.tags] : [];
	});

	let searchQuery = $state('');
	let activeTab = $state<'all' | 'publish' | 'draft' | 'low_stock' | 'trash'>('all');
	let selectedIds = $state<string[]>([]);
	let currentPage = $state(1);
	let itemsPerPage = 10;

	function showToast(msg: string) {
		toast.success(msg);
	}

	let openActionMenuId = $state<string | null>(null);

	// Derived counts
	let allCount = $derived(tags.filter((t) => !t.isTrash).length);
	let publishCount = $derived(tags.filter((t) => t.status === 'publish' && !t.isTrash).length);
	let draftCount = $derived(tags.filter((t) => t.status === 'draft' && !t.isTrash).length);
	let lowStockCount = $derived(tags.filter((t) => t.isLowStock && !t.isTrash).length);
	let trashCount = $derived(tags.filter((t) => t.isTrash).length);

	// Filtered list
	let filteredTags = $derived.by(() => {
		let list = tags.filter((t) => {
			if (activeTab === 'trash') return t.isTrash;
			if (t.isTrash) return false;
			if (activeTab === 'publish') return t.status === 'publish';
			if (activeTab === 'draft') return t.status === 'draft';
			if (activeTab === 'low_stock') return t.isLowStock;
			return true;
		});

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter((t) => t.name.toLowerCase().includes(q));
		}

		return list;
	});

	let totalPages = $derived(Math.max(1, Math.ceil(filteredTags.length / itemsPerPage)));
	let paginatedItems = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredTags.slice(start, start + itemsPerPage);
	});

	function handleSelectAll(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		if (checked) {
			selectedIds = paginatedItems.map((t) => t.id);
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



	async function toggleStatus(tag: CatalogTag) {
		const newStatus = tag.status === 'publish' ? 'draft' : 'publish';
		openActionMenuId = null;

		tags = tags.map((t) => (t.id === tag.id ? { ...t, status: newStatus } : t));
		showToast(`স্ট্যাটাস ${newStatus === 'publish' ? 'Publish' : 'Draft'}-এ পরিবর্তিত হয়েছে`);

		try {
			const fd = new FormData();
			fd.append('id', tag.id);
			await fetch('?/toggleStatus', {
				method: 'POST',
				body: fd
			});
			await invalidateAll();
		} catch (e) {
			console.error('Error toggling tag status:', e);
		}
	}

	async function moveToTrash(id: string) {
		openActionMenuId = null;
		const confirmed = await confirmModal({
			title: 'ট্যাগ মুছে ফেলা',
			message: 'আপনি কি নিশ্চিতভাবে এই ট্যাগটি মুছে ফেলতে চান?',
			confirmText: 'হ্যাঁ, মুছে ফেলুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) return;

		tags = tags.map((t) => (t.id === id ? { ...t, isTrash: true } : t));
		showToast('ট্যাগ মুছে ফেলা হয়েছে');

		try {
			const fd = new FormData();
			fd.append('id', id);
			await fetch('?/deleteTag', {
				method: 'POST',
				body: fd
			});
			await invalidateAll();
		} catch (e) {
			console.error('Error deleting tag:', e);
		}
	}

	function restoreFromTrash(id: string) {
		tags = tags.map((t) => (t.id === id ? { ...t, isTrash: false } : t));
		openActionMenuId = null;
		showToast('ট্যাগ রিস্টোর করা হয়েছে');
	}

	async function handleBulkDelete() {
		if (selectedIds.length === 0) return;
		const confirmed = await confirmModal({
			title: 'ট্যাগ মুছে ফেলা',
			message: `আপনি কি নিশ্চিতভাবে নির্বাচিত ${selectedIds.length}টি ট্যাগ মুছে ফেলতে চান?`,
			confirmText: 'হ্যাঁ, মুছে ফেলুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) {
			return;
		}

		const count = selectedIds.length;
		const toDelete = [...selectedIds];
		tags = tags.filter((t) => !toDelete.includes(t.id));
		selectedIds = [];
		showToast(`${count}টি ট্যাগ সফলভাবে মুছে ফেলা হয়েছে`);

		try {
			const fd = new FormData();
			fd.append('ids', JSON.stringify(toDelete));
			await fetch('?/bulkDelete', {
				method: 'POST',
				body: fd
			});
			await invalidateAll();
		} catch (e) {
			console.error('Error bulk deleting tags:', e);
		}
	}
</script>

<svelte:head>
	<title>Tags | Haq Plus Admin</title>
</svelte:head>

<div class="space-y-6 max-w-[1400px] mx-auto pb-12 font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Top Bar: Title & Support Button -->
	<div class="flex items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Tags</h1>
			<p class="text-xs text-slate-500 mt-1">পণ্য ফিল্টারিং ও স্পেশাল অফার ট্যাগসমূহ পরিচালনা করুন</p>
		</div>

		<a
			href="/admin/support"
			class="bg-[#5845eb] hover:bg-[#4a39cf] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
		>
			<Headset class="w-3.5 h-3.5" />
			<span>Support</span>
		</a>
	</div>

	<!-- Search & Add Tag Row -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
		<!-- Search Input -->
		<div class="relative w-full sm:max-w-md">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search Tag..."
				class="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5845eb] shadow-2xs pr-9"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => { searchQuery = ''; currentPage = 1; }}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
					aria-label="Clear search"
				>
					<X class="w-4 h-4" />
				</button>
			{:else}
				<Search class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
			{/if}
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

			<!-- + Add Tag Button -->
			<a
				href="/admin/catalog/tags/new"
				class="bg-[#5845eb] hover:bg-[#4a39cf] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
			>
				<Plus class="w-4 h-4" />
				<span>Add Tag</span>
			</a>
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
								checked={selectedIds.length > 0 && selectedIds.length === paginatedItems.length}
								onchange={handleSelectAll}
								aria-label="Select all tags"
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
								{#if searchQuery.trim()}
									<div class="flex flex-col items-center gap-2">
										<span>&#39;{searchQuery}&#39; এর জন্য কোনো ট্যাগ পাওয়া যায়নি।</span>
										<button type="button" onclick={() => { searchQuery = ''; currentPage = 1; }} class="text-[#5845eb] hover:underline font-semibold cursor-pointer">সার্চ ক্লিয়ার করুন</button>
									</div>
								{:else}
									কোনো ট্যাগ পাওয়া যায়নি।
								{/if}
							</td>
						</tr>
					{:else}
						{#each paginatedItems as tag, idx (tag.id)}
							<tr class="hover:bg-slate-50/60 transition-colors">
								<!-- Checkbox -->
								<td class="py-3.5 px-4">
									<input
										type="checkbox"
										checked={selectedIds.includes(tag.id)}
										onchange={() => handleSelectRow(tag.id)}
										aria-label={`Select ${tag.name}`}
										class="rounded border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
									/>
								</td>

								<!-- SL -->
								<td class="py-3.5 px-4 font-mono text-slate-500 font-semibold">
									{tag.sl ?? (idx + 1)}
								</td>

								<!-- Name -->
								<td class="py-3.5 px-4">
									<span class="inline-flex items-center gap-1.5 font-bold text-slate-800">
										<TagIcon class="w-3.5 h-3.5 text-indigo-500" />
										<span>{tag.name}</span>
									</span>
								</td>

								<!-- Date -->
								<td class="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
									{tag.date}
								</td>

								<!-- Home Show -->
								<td class="py-3.5 px-4">
									{#if tag.homeShow === 'Yes'}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
											Yes
										</span>
									{:else}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
											No
										</span>
									{/if}
								</td>

								<!-- Priority -->
								<td class="py-3.5 px-4 font-mono text-slate-600">
									{tag.priority}
								</td>

								<!-- Status -->
								<td class="py-3.5 px-4">
									{#if tag.status === 'publish'}
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
										onclick={() => (openActionMenuId = openActionMenuId === tag.id ? null : tag.id)}
										class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
										aria-label="Actions menu"
									>
										<MoreVertical class="w-4 h-4" />
									</button>

									{#if openActionMenuId === tag.id}
										<div class="absolute right-4 {idx >= paginatedItems.length - 2 && paginatedItems.length > 2 ? 'bottom-10 top-auto origin-bottom-right' : 'top-10'} w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-left text-xs animate-in fade-in duration-100">
											<a
												href="/admin/catalog/tags/edit/{tag.id}"
												class="w-full px-3 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
											>
												<Edit3 class="w-3.5 h-3.5 text-slate-500" />
												<span>Edit</span>
											</a>

											<button
												type="button"
												onclick={() => toggleStatus(tag)}
												class="w-full px-3 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
											>
												<Eye class="w-3.5 h-3.5 text-slate-500" />
												<span>{tag.status === 'publish' ? 'Draft করুন' : 'Publish করুন'}</span>
											</button>

											{#if !tag.isTrash}
												<button
													type="button"
													onclick={() => moveToTrash(tag.id)}
													class="w-full px-3 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
												>
													<Trash2 class="w-3.5 h-3.5" />
													<span>Trash</span>
												</button>
											{:else}
												<button
													type="button"
													onclick={() => restoreFromTrash(tag.id)}
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
		{#if filteredTags.length > 0}
			<div class="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 text-xs text-slate-500 bg-white">
				<span>
					Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTags.length)} of {filteredTags.length} items
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

