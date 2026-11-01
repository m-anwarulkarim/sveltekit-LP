<script lang="ts">
	import { Button, Input, Badge } from '#lib/components/ui';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';
	import {
		Search,
		Plus,
		MoreVertical,
		Edit3,
		Trash2,
		Eye,
		ChevronLeft,
		ChevronRight,
		CheckCircle2,
		X,
		ExternalLink,
		SlidersHorizontal
	} from 'lucide-svelte';

	interface BannerItem {
		id: string;
		image: string;
		title: string;
		url: string;
		serial?: string;
		priority?: string;
		status: 'PUBLISHED' | 'DRAFT' | 'Publish' | 'Draft' | string;
	}

	let { data }: { data?: any } = $props();

	let banners = $state<BannerItem[]>(data?.banners || [
		{
			id: 'ban-1',
			image: '/images/banners/banner-home.svg',
			title: 'bannar1',
			url: '/home',
			serial: '10',
			status: 'DRAFT'
		}
	]);

	$effect(() => {
		if (data?.banners) {
			banners = [...data.banners];
		}
	});

	let searchQuery = $state('');
	let activeTab = $state<'all' | 'published' | 'draft' | 'trash'>('all');
	let selectedIds = $state<string[]>([]);

	// Fixed Coordinate Dropdown State (Completely eliminates table clipping)
	let activeActionItem = $state<BannerItem | null>(null);
	let menuPosition = $state<{ top: number; left: number } | null>(null);

	// Dynamic tab counts based on actual data
	let allCount = $derived(banners.length);
	let publishedCount = $derived(
		banners.filter((b) => (b.status || '').toUpperCase().startsWith('PUB')).length
	);
	let draftCount = $derived(
		banners.filter((b) => (b.status || '').toUpperCase().startsWith('DRAFT')).length
	);
	let trashCount = $derived(0);

	function handleActionClick(item: BannerItem, e: MouseEvent) {
		e.stopPropagation();
		if (activeActionItem?.id === item.id) {
			closeActionMenu();
			return;
		}
		const button = e.currentTarget as HTMLElement;
		const rect = button.getBoundingClientRect();

		const menuWidth = 176;
		const menuHeight = 140;

		const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
		const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

		let left = rect.right - menuWidth;
		if (left < 10) left = 10;
		if (left + menuWidth > windowWidth - 10) {
			left = windowWidth - menuWidth - 10;
		}

		const spaceBelow = windowHeight - rect.bottom;
		const spaceAbove = rect.top;
		const openUpwards = spaceBelow < menuHeight + 10 && spaceAbove > spaceBelow;

		const top = openUpwards ? Math.max(10, rect.top - menuHeight - 6) : rect.bottom + 6;

		menuPosition = { top, left };
		activeActionItem = item;
	}

	function closeActionMenu() {
		activeActionItem = null;
		menuPosition = null;
	}

	let filteredBanners = $derived.by(() => {
		let list = [...banners];
		if (activeTab === 'published') {
			list = list.filter((b) => (b.status || '').toUpperCase().startsWith('PUB'));
		} else if (activeTab === 'draft') {
			list = list.filter((b) => (b.status || '').toUpperCase().startsWith('DRAFT'));
		} else if (activeTab === 'trash') {
			list = [];
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(b) =>
					b.title.toLowerCase().includes(q) ||
					(b.url && b.url.toLowerCase().includes(q))
			);
		}
		return list;
	});

	let isAllSelected = $derived(
		filteredBanners.length > 0 && filteredBanners.every((b) => selectedIds.includes(b.id))
	);

	function toggleSelectAll() {
		if (isAllSelected) {
			selectedIds = [];
		} else {
			selectedIds = filteredBanners.map((b) => b.id);
		}
	}

	function toggleSelectRow(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((item) => item !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	async function toggleStatus(item: BannerItem) {
		const oldStatus = item.status;
		const isCurrentlyPub = (oldStatus || '').toUpperCase().startsWith('PUB');
		const nextStatus = isCurrentlyPub ? 'Draft' : 'Publish';

		// Optimistic UI update
		item.status = nextStatus;
		closeActionMenu();

		try {
			const fd = new FormData();
			fd.append('id', item.id);
			fd.append('status', oldStatus);

			const res = await fetch('?/toggleStatus', {
				method: 'POST',
				body: fd
			});
			const result = await res.json();
			if (result.type === 'success' || result.status === 200) {
				toast.success(`স্ট্যাটাস পরিবর্তন হয়েছে: ${nextStatus}`);
			} else {
				item.status = oldStatus;
				toast.error('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে!');
			}
		} catch (e) {
			item.status = oldStatus;
			toast.error('সার্ভারে যোগাযোগ করা যায়নি!');
		}
	}

	async function handleDelete(item: BannerItem) {
		closeActionMenu();
		const confirmed = await confirmModal({
			title: 'ব্যানার মুছে ফেলা',
			message: `আপনি কি "${item.title}" ব্যানারটি মুছে ফেলতে চান?`,
			confirmText: 'হ্যাঁ, মুছে ফেলুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) return;

		// Optimistic UI update
		const previousList = [...banners];
		banners = banners.filter((b) => b.id !== item.id);
		selectedIds = selectedIds.filter((id) => id !== item.id);

		try {
			const fd = new FormData();
			fd.append('id', item.id);

			const res = await fetch('?/deleteBanner', {
				method: 'POST',
				body: fd
			});
			const result = await res.json();
			if (result.type === 'success' || result.status === 200) {
				toast.success(`"${item.title}" ব্যানারটি মুছে ফেলা হয়েছে`);
			} else {
				banners = previousList;
				toast.error('ব্যানার ডিলিট করা যায়নি!');
			}
		} catch (e) {
			banners = previousList;
			toast.error('সার্ভারে যোগাযোগ করা যায়নি!');
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') closeActionMenu();
	}}
	onresize={closeActionMenu}
/>

<svelte:head>
	<title>Banner - Customization - AURA Admin</title>
</svelte:head>

<div class="p-3 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto font-['Anek_Bangla',sans-serif]">
	
	<!-- Top Controls: Search Bar & Add Banner Button (Fully Responsive Row) -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
		<!-- Search with integrated search button -->
		<div class="relative w-full sm:w-80 md:w-96 flex items-center">
			<Input
				type="text"
				placeholder="Search banners..."
				bind:value={searchQuery}
				class="rounded-r-none border-r-0 rounded-l-2xl pl-4 pr-3 py-2 text-xs sm:text-sm shadow-2xs h-10 w-full bg-white"
			/>
			<Button
				type="button"
				variant="secondary"
				class="bg-[#e9e6fd] hover:bg-[#d8d3fc] text-[#5845eb] px-4 py-2 rounded-l-none rounded-r-2xl border border-l-0 border-indigo-200 shadow-2xs h-10 shrink-0 cursor-pointer"
				aria-label="Search"
			>
				<Search class="w-4 h-4" />
			</Button>
		</div>

		<!-- + Add Banner Button -->
		<a
			href="/admin/customization/banner/edit-banner/new"
			class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5845eb] hover:bg-[#4936d6] text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer shrink-0 h-10"
		>
			<Plus class="w-4 h-4 stroke-[2.5]" />
			<span>Add Banner</span>
		</a>
	</div>

	<!-- Filter Tabs Capsule with horizontal scroll support on small screens -->
	<div class="w-full overflow-x-auto no-scrollbar py-1">
		<div class="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 shadow-2xs gap-1 min-w-max">
			<button
				type="button"
				onclick={() => (activeTab = 'all')}
				class="px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'all'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>All Banners</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'all' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					{allCount}
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'published')}
				class="px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'published'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Published</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'published' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					{publishedCount}
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'draft')}
				class="px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'draft'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Draft</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'draft' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					{draftCount}
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'trash')}
				class="px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'trash'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Trash</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'trash' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					{trashCount}
				</span>
			</button>
		</div>
	</div>

	<!-- Bulk Selection Bar (Shows when 1 or more items are selected) -->
	{#if selectedIds.length > 0}
		<div class="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs text-indigo-900 animate-in fade-in">
			<div class="flex items-center gap-2 font-bold">
				<span class="w-5 h-5 rounded-full bg-[#5845eb] text-white flex items-center justify-center text-[10px]">
					{selectedIds.length}
				</span>
				<span>ব্যানার সিলেক্ট করা হয়েছে</span>
			</div>
			<button
				type="button"
				onclick={() => (selectedIds = [])}
				class="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
			>
				Clear
			</button>
		</div>
	{/if}

	<!-- 1. MOBILE VIEW (< md): Responsive Cards List -->
	<div class="block md:hidden space-y-3">
		{#if filteredBanners.length === 0}
			<div class="bg-white border border-slate-200/80 rounded-3xl p-8 text-center space-y-2">
				<p class="text-sm font-bold text-slate-700">কোনো ব্যানার পাওয়া যায়নি</p>
				<p class="text-xs text-slate-400">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
			</div>
		{:else}
			{#each filteredBanners as item (item.id)}
				{@const isSelected = selectedIds.includes(item.id)}
				{@const isPub = (item.status || '').toUpperCase().startsWith('PUB')}
				<div class="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-3 transition-colors {isSelected ? 'bg-indigo-50/20 border-indigo-200' : ''}">
					<!-- Top Row: Checkbox + Thumbnail + Title + Status -->
					<div class="flex items-start gap-3">
						<input
							type="checkbox"
							checked={isSelected}
							onchange={() => toggleSelectRow(item.id)}
							class="w-4 h-4 mt-1 rounded-md border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer shrink-0"
							aria-label="Select {item.title}"
						/>

						<div class="w-18 h-10 rounded-xl border border-slate-200/80 bg-slate-50 overflow-hidden shadow-2xs shrink-0 flex items-center justify-center p-0.5">
							<img src={item.image} alt={item.title} class="w-full h-full object-cover rounded-lg" />
						</div>

						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between gap-2">
								<h4 class="font-bold text-slate-900 text-sm truncate">{item.title}</h4>
								<span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 {isPub ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
									{isPub ? 'Published' : 'Draft'}
								</span>
							</div>
							<p class="text-xs text-slate-500 font-mono truncate mt-0.5">{item.url}</p>
						</div>
					</div>

					<!-- Bottom Row: Serial & Actions -->
					<div class="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
						<span class="text-xs text-slate-500 font-medium">
							Serial: <strong class="text-slate-800 font-mono">{item.serial || item.priority || '10'}</strong>
						</span>

						<div class="flex items-center gap-1.5">
							<button
								type="button"
								onclick={() => toggleStatus(item)}
								class="px-2.5 py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
								title="Toggle Status"
							>
								<Eye class="w-3.5 h-3.5 text-slate-500" />
								<span>{isPub ? 'Draft' : 'Publish'}</span>
							</button>

							<a
								href="/admin/customization/banner/edit-banner/{item.id}"
								class="px-2.5 py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
								title="Edit"
							>
								<Edit3 class="w-3.5 h-3.5 text-slate-500" />
								<span>Edit</span>
							</a>

							<button
								type="button"
								onclick={() => handleDelete(item)}
								class="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
								title="Delete"
							>
								<Trash2 class="w-3.5 h-3.5 text-rose-500" />
							</button>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- 2. DESKTOP VIEW (>= md): Full Data Table -->
	<div class="hidden md:block bg-white border border-slate-200/90 rounded-3xl shadow-xs min-h-[380px] pb-16">
		<div class="overflow-x-auto no-scrollbar">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-bold tracking-wider text-slate-500 uppercase select-none">
						<th class="py-4 pl-5 pr-2 w-10">
							<input
								type="checkbox"
								checked={isAllSelected}
								onchange={toggleSelectAll}
								class="w-4 h-4 rounded-md border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
								aria-label="Select all"
							/>
						</th>
						<th class="py-4 px-4 min-w-[110px]">IMAGE</th>
						<th class="py-4 px-4 min-w-[140px]">TITLE</th>
						<th class="py-4 px-4 min-w-[180px]">URL</th>
						<th class="py-4 px-4 min-w-[90px]">SERIAL</th>
						<th class="py-4 px-4 min-w-[110px]">STATUS</th>
						<th class="py-4 pr-6 pl-3 w-20 text-right">ACTIONS</th>
					</tr>
				</thead>

				<tbody class="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
					{#if filteredBanners.length === 0}
						<tr>
							<td colspan="7" class="py-12 text-center text-slate-400">
								<p class="font-bold text-slate-700 text-sm">কোনো ব্যানার পাওয়া যায়নি</p>
								<p class="text-xs text-slate-400 mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করে দেখুন</p>
							</td>
						</tr>
					{:else}
						{#each filteredBanners as item (item.id)}
							{@const isSelected = selectedIds.includes(item.id)}
							{@const isPub = (item.status || '').toUpperCase().startsWith('PUB')}
							<tr class="hover:bg-slate-50/70 transition-colors {isSelected ? 'bg-indigo-50/30' : ''}">
								<!-- Checkbox -->
								<td class="py-4 pl-5 pr-2">
									<input
										type="checkbox"
										checked={isSelected}
										onchange={() => toggleSelectRow(item.id)}
										class="w-4 h-4 rounded-md border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
										aria-label="Select {item.title}"
									/>
								</td>

								<!-- Image Thumbnail -->
								<td class="py-4 px-4">
									<div class="w-20 h-10 rounded-xl border border-slate-200/80 bg-slate-50 overflow-hidden shadow-2xs flex items-center justify-center p-0.5">
										<img src={item.image} alt={item.title} class="w-full h-full object-cover rounded-lg" />
									</div>
								</td>

								<!-- Title -->
								<td class="py-4 px-4">
									<span class="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</span>
								</td>

								<!-- URL -->
								<td class="py-4 px-4">
									<span class="text-xs text-slate-700 font-mono">{item.url}</span>
								</td>

								<!-- Serial -->
								<td class="py-4 px-4">
									<span class="text-xs font-semibold text-slate-800 font-mono">{item.serial || item.priority || '10'}</span>
								</td>

								<!-- Status Badge -->
								<td class="py-4 px-4">
									<span class="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider {isPub ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
										{isPub ? 'PUBLISHED' : 'DRAFT'}
									</span>
								</td>

								<!-- Actions Trigger Button -->
								<td class="py-4 pr-6 pl-3 text-right">
									<button
										type="button"
										onclick={(e) => handleActionClick(item, e)}
										class="w-8 h-8 rounded-xl border border-slate-200/80 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors ml-auto shadow-2xs cursor-pointer {activeActionItem?.id === item.id ? 'bg-slate-100 border-indigo-300 text-[#5845eb]' : ''}"
										aria-label="Action menu"
									>
										<MoreVertical class="w-4 h-4" />
									</button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Pagination Bar -->
	<div class="flex items-center justify-between sm:justify-end gap-2 text-xs font-semibold text-slate-600 pt-2">
		<span class="text-xs text-slate-400 sm:hidden">Showing {filteredBanners.length} banners</span>
		<div class="flex items-center gap-1.5 ml-auto sm:ml-0">
			<button
				type="button"
				disabled
				class="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center opacity-40 cursor-not-allowed"
				aria-label="Previous page"
			>
				<ChevronLeft class="w-4 h-4" />
			</button>
			<span class="px-3 py-1 bg-white border border-slate-200 rounded-xl shadow-2xs font-mono">
				1
			</span>
			<span class="text-slate-400">of 1</span>
			<button
				type="button"
				disabled
				class="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center opacity-40 cursor-not-allowed"
				aria-label="Next page"
			>
				<ChevronRight class="w-4 h-4" />
			</button>
		</div>
	</div>
</div>

<!-- FLOATING FIXED-COORDINATE ACTION MENU (Never clipped by table or cards overflow!) -->
{#if activeActionItem && menuPosition}
	<!-- Fixed click-outside backdrop covering entire screen -->
	<button
		type="button"
		class="fixed inset-0 z-50 bg-transparent cursor-default border-none outline-none"
		tabindex="-1"
		aria-hidden="true"
		onclick={closeActionMenu}
	></button>

	<!-- Dropdown Menu Box (Fixed Positioning at calculated coordinates) -->
	<div
		style="position: fixed; top: {menuPosition.top}px; left: {menuPosition.left}px;"
		class="w-44 bg-white border border-slate-200/90 rounded-2xl shadow-2xl py-1.5 z-60 text-xs font-medium text-left animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5"
		onclick={(e) => e.stopPropagation()}
	>
		<a
			href="/admin/customization/banner/edit-banner/{activeActionItem.id}"
			class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
		>
			<Edit3 class="w-3.5 h-3.5 text-slate-400" />
			<span>Edit</span>
		</a>

		<button
			type="button"
			onclick={() => toggleStatus(activeActionItem!)}
			class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
		>
			<Eye class="w-3.5 h-3.5 text-slate-400" />
			<span>Toggle Status</span>
		</button>

		<div class="h-px bg-slate-100 my-1"></div>

		<button
			type="button"
			onclick={() => handleDelete(activeActionItem!)}
			class="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer transition-colors"
		>
			<Trash2 class="w-3.5 h-3.5 text-rose-500" />
			<span>Delete</span>
		</button>
	</div>
{/if}
