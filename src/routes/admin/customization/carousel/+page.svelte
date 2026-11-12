<script lang="ts">
	import {
		Search,
		Plus,
		MoreVertical,
		Edit3,
		Copy,
		Trash2,
		ExternalLink,
		ChevronLeft,
		ChevronRight,
		CheckCircle2,
		X,
		Sparkles,
		Eye
	} from 'lucide-svelte';
	import { Button, Input, Badge } from '#lib/components/ui';
import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';

	interface CarouselItem {
		id: string;
		image: string;
		mobileImage?: string;
		name: string;
		url: string;
		urlType: 'Internal' | 'External' | string;
		serial: string;
		status: 'PUBLISH' | 'DRAFT' | 'Publish' | 'Draft' | string;
		description?: string;
		startDate?: string | null;
		endDate?: string | null;
		viewCount?: number;
		clickCount?: number;
		ctr?: string;
	}

	let { data }: { data?: any } = $props();

	let carousels = $state<CarouselItem[]>(data?.carousels || [
		{
			id: 'car-1',
			image: '/images/banners/banner-home.svg',
			name: 'Banner',
			url: '/Home',
			urlType: 'Internal',
			serial: '1',
			status: 'PUBLISH'
		},
		{
			id: 'car-2',
			image: '/images/banners/banner-citizens.svg',
			name: 'Citizens',
			url: 'https://www.citizens.com.bd/',
			urlType: 'External',
			serial: '1',
			status: 'PUBLISH'
		},
		{
			id: 'car-3',
			image: '/images/banners/banner-combo.svg',
			name: 'Combo Offer',
			url: '/Products',
			urlType: 'Internal',
			serial: '-',
			status: 'PUBLISH'
		}
	]);

	$effect(() => {
		if (data?.carousels) {
			carousels = [...data.carousels];
		}
	});

	let searchQuery = $state('');
	let activeTab = $state<'all' | 'publish' | 'draft' | 'low_stock' | 'trash'>('all');
	let selectedIds = $state<string[]>([]);

	// Fixed Floating Dropdown (Immune to Table / Card overflow clipping)
	let activeActionItem = $state<CarouselItem | null>(null);
	let menuPosition = $state<{ top: number; left: number } | null>(null);



	function handleActionClick(item: CarouselItem, e: MouseEvent) {
		e.stopPropagation();
		if (activeActionItem?.id === item.id) {
			closeActionMenu();
			return;
		}
		const button = e.currentTarget as HTMLElement;
		const rect = button.getBoundingClientRect();

		const menuWidth = 176;
		const menuHeight = 170; // 4 items (Edit, Duplicate, Toggle Status, Delete)

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

	let filteredCarousels = $derived.by(() => {
		let list = [...carousels];
		if (activeTab === 'publish') {
			list = list.filter((c) => (c.status || '').toUpperCase().startsWith('PUB'));
		} else if (activeTab === 'draft') {
			list = list.filter((c) => (c.status || '').toUpperCase().startsWith('DRAFT'));
		} else if (activeTab === 'trash') {
			list = [];
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter((c) => (c.name || '').toLowerCase().includes(q) || (c.url && c.url.toLowerCase().includes(q)));
		}
		return list;
	});

	let isAllSelected = $derived(
		filteredCarousels.length > 0 && filteredCarousels.every((c) => selectedIds.includes(c.id))
	);

	function toggleSelectAll() {
		if (isAllSelected) {
			selectedIds = [];
		} else {
			selectedIds = filteredCarousels.map((c) => c.id);
		}
	}

	function toggleSelectRow(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((item) => item !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}




	let publishCount = $derived(carousels.filter((c) => (c.status || '').toUpperCase().startsWith('PUB')).length);
	let draftCount = $derived(carousels.filter((c) => (c.status || '').toUpperCase().startsWith('DRAFT')).length);
	let allCount = $derived(carousels.length);

	async function handleToggleStatus(item: CarouselItem) {
		const oldStatus = item.status;
		const isPub = (oldStatus || '').toUpperCase().startsWith('PUB');
		const newStatus = isPub ? 'DRAFT' : 'PUBLISH';
		item.status = newStatus;
		closeActionMenu();
		toast.success(`স্ট্যাটাস পরিবর্তিত হয়েছে: ${newStatus}`);

		try {
			const fd = new FormData();
			fd.append('id', item.id);
			fd.append('status', oldStatus);
			await fetch('?/toggleStatus', {
				method: 'POST',
				body: fd
			});
		} catch (e) {
			console.error(e);
		}
	}

	async function handleDuplicate(item: CarouselItem) {
		closeActionMenu();

		try {
			const fd = new FormData();
			fd.append('id', item.id);
			const res = await fetch('?/duplicateCarousel', {
				method: 'POST',
				body: fd
			});
			const result: any = await res.json();
			if (result?.data?.clone) {
				const clone = result.data.clone;
				carousels = [
					...carousels,
					{
						id: clone.id,
						image: clone.image,
						name: clone.name,
						url: clone.targetUrl,
						urlType: clone.urlType || 'Internal',
						serial: String(clone.sortOrder || 1),
						status: 'DRAFT',
						description: clone.description || ''
					}
				];
				toast.success(`"${clone.name}" সফলভাবে ডুপ্লিকেট হয়েছে!`);
			} else {
				toast.success(`ক্যারোসেল ডুপ্লিকেট হয়েছে!`);
			}
		} catch (e) {
			console.error(e);
		}
	}

	async function handleDelete(item: CarouselItem) {
		const confirmed = await confirmModal({
			title: 'ক্যারোসেল মুছে ফেলা',
			message: `আপনি কি "${item.name}" মুছতে চান?`,
			confirmText: 'হ্যাঁ, মুছে ফেলুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) return;

		carousels = carousels.filter((c) => c.id !== item.id);
		selectedIds = selectedIds.filter((id) => id !== item.id);
		toast.success(`ক্যারোসেল মুছে ফেলা হয়েছে`);

		try {
			const fd = new FormData();
			fd.append('id', item.id);
			await fetch('?/deleteCarousel', {
				method: 'POST',
				body: fd
			});
		} catch (e) {
			console.error(e);
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
	<title>Carousel - Customization - Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
	<!-- Top Controls Row (Search Left, + Add Carousel Right) -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
		<!-- Search Input (Exact match to screenshot 1) -->
		<div class="relative w-full sm:w-80">
			<Input
				type="text"
				placeholder="Search carousels..."
				bind:value={searchQuery}
				class="rounded-2xl pl-4 pr-10 h-10 text-xs sm:text-sm shadow-2xs w-full bg-white"
			/>
			<div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
				<Search class="w-4 h-4" />
			</div>
		</div>

		<!-- + Add Carousel Button -->
		<a
			href="/admin/customization/edit-carousel/new"
			class="rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 shrink-0"
		>
			<Plus class="w-4 h-4 stroke-[2.5]" />
			<span>Add Carousel</span>
		</a>
	</div>

	<!-- Filter Tabs Capsule (All Data [3], Publish [3], Draft [0], Low Stock [3], Trash [0]) -->
	<div class="flex items-center">
		<div class="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 shadow-2xs gap-1">
			

			<button
				type="button"
				onclick={() => (activeTab = 'trash')}
				class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'trash'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Trash</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'trash' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					0
				</span>
			</button>
		</div>
	</div>

	<!-- MOBILE VIEW (< md): Responsive Cards List -->
	<div class="block md:hidden space-y-3">
		{#if filteredCarousels.length === 0}
			<div class="bg-white border border-slate-200/80 rounded-3xl p-8 text-center space-y-2">
				<p class="text-sm font-bold text-slate-700">No carousel found</p>
				<p class="text-xs text-slate-400">Try changing the filter</p>
			</div>
		{:else}
			{#each filteredCarousels as item (item.id)}
				{@const isSelected = selectedIds.includes(item.id)}
				{@const isPub = (item.status || '').toUpperCase().startsWith('PUB')}
				<div class="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-3 transition-colors {isSelected ? 'bg-indigo-50/20 border-indigo-200' : ''}">
					<div class="flex items-start gap-3">
						<input
							type="checkbox"
							checked={isSelected}
							onchange={() => toggleSelectRow(item.id)}
							class="w-4 h-4 mt-1 rounded-md border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer shrink-0"
						/>
						<div class="w-18 h-10 rounded-xl border border-slate-200/80 bg-slate-50 overflow-hidden shadow-2xs shrink-0 flex items-center justify-center p-0.5">
							<img src={item.image} alt={item.name} class="w-full h-full object-cover rounded-lg" />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between gap-2">
								<h4 class="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
								<Badge variant={isPub ? 'default' : 'secondary'} class="text-[10px] font-black uppercase shrink-0 {isPub ? 'bg-emerald-600 text-white' : ''}">
									{isPub ? 'Published' : 'Draft'}
								</Badge>
							</div>
							<p class="text-xs text-slate-500 font-mono truncate mt-0.5">{item.url}</p>
						</div>
					</div>
					<div class="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
						<span class="text-xs text-slate-500 font-medium">
							Serial: <strong class="text-slate-800 font-mono">{item.serial}</strong>
							&middot; {item.urlType}
						</span>
						<div class="flex items-center gap-1.5">
							<a
								href="/admin/customization/edit-carousel/{item.id}"
								class="px-2.5 py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
							>
								<Edit3 class="w-3.5 h-3.5 text-slate-500" />
								<span>Edit</span>
							</a>
							<button
								type="button"
								onclick={() => handleDelete(item)}
								class="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
							>
								<Trash2 class="w-3.5 h-3.5 text-rose-500" />
							</button>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- DESKTOP VIEW (>= md): Full Data Table -->
	<div class="hidden md:block bg-white border border-slate-200/90 rounded-3xl shadow-xs min-h-[360px] pb-12">
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
						<th class="py-4 px-4 min-w-[120px]">IMAGE</th>
						<th class="py-4 px-4 min-w-[140px]">NAME</th>
						<th class="py-4 px-4 min-w-[200px]">URL</th>
						<th class="py-4 px-4 min-w-[120px]">URL TYPE</th>
						<th class="py-4 px-4 min-w-[100px]">SERIAL</th>
						<th class="py-4 px-4 min-w-[120px]">STATUS</th>
						<th class="py-4 pr-6 pl-3 w-16 text-right">ACTIONS</th>
					</tr>
				</thead>

				<tbody class="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
					{#each filteredCarousels as item, index (item.id)}
						{@const isSelected = selectedIds.includes(item.id)}
						{@const isNearBottom = index >= filteredCarousels.length - 1 || filteredCarousels.length <= 2}
						<tr class="hover:bg-slate-50/70 transition-colors {isSelected ? 'bg-indigo-50/30' : ''}">
							<!-- Checkbox -->
							<td class="py-4 pl-5 pr-2">
								<input
									type="checkbox"
									checked={isSelected}
									onchange={() => toggleSelectRow(item.id)}
									class="w-4 h-4 rounded-md border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
									aria-label="Select {item.name}"
								/>
							</td>

							<!-- Image Thumbnail -->
							<td class="py-4 px-4">
								<div class="w-20 h-10 rounded-xl border border-slate-200/80 bg-slate-50 overflow-hidden shadow-2xs flex items-center justify-center p-0.5">
									<img src={item.image} alt={item.name} class="w-full h-full object-cover rounded-lg" />
								</div>
							</td>

							<!-- Name -->
							<td class="py-4 px-4">
								<span class="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</span>
							</td>

							<!-- URL -->
							<td class="py-4 px-4">
								<span class="text-xs text-slate-700 font-mono break-all">{item.url}</span>
							</td>

							<!-- URL Type -->
							<td class="py-4 px-4">
								<span class="text-xs text-slate-700">{item.urlType}</span>
							</td>

							<!-- Serial -->
							<td class="py-4 px-4">
								<span class="text-xs font-semibold text-slate-800 font-mono">{item.serial}</span>
							</td>

							<!-- Status -->
							<td class="py-4 px-4">
								<span class="font-bold text-slate-900 uppercase text-xs tracking-wider">
									{item.status}
								</span>
							</td>

							<!-- Actions (3-dots vertical) -->
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
				</tbody>
			</table>
		</div>
	</div>

	<!-- Pagination (< 1 of 1 >) -->
	<div class="flex items-center justify-end gap-2 text-xs font-semibold text-slate-600 pt-2">
		<button
			type="button"
			disabled
			class="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center opacity-40 cursor-not-allowed"
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
		>
			<ChevronRight class="w-4 h-4" />
		</button>
	</div>
</div>



<!-- FLOATING FIXED-COORDINATE ACTION MENU (Never clipped by table overflow!) -->
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
			href="/admin/customization/edit-carousel/{activeActionItem.id}"
			class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
		>
			<Edit3 class="w-3.5 h-3.5 text-slate-400" />
			<span>Edit</span>
		</a>

		<button
			type="button"
			onclick={() => {
				const itm = activeActionItem;
				closeActionMenu();
				if (itm) handleDuplicate(itm);
			}}
			class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
		>
			<Copy class="w-3.5 h-3.5 text-slate-400" />
			<span>Duplicate</span>
		</button>

		<button
			type="button"
			onclick={() => {
				const itm = activeActionItem;
				closeActionMenu();
				if (itm) handleToggleStatus(itm);
			}}
			class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
		>
			<Eye class="w-3.5 h-3.5 text-slate-400" />
			<span>Toggle Status</span>
		</button>

		<div class="h-px bg-slate-100 my-1"></div>

		<button
			type="button"
			onclick={() => {
				const itm = activeActionItem;
				closeActionMenu();
				if (itm) handleDelete(itm);
			}}
			class="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer transition-colors"
		>
			<Trash2 class="w-3.5 h-3.5 text-rose-500" />
			<span>Delete</span>
		</button>
	</div>
{/if}
