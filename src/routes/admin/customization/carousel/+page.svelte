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

	// Modal State
	let isModalOpen = $state(false);
	let editingItem = $state<CarouselItem | null>(null);
	let modalName = $state('');
	let modalUrl = $state('/Home');
	let modalUrlType = $state<'Internal' | 'External' | string>('Internal');
	let modalSerial = $state('1');
	let modalStatus = $state<'PUBLISH' | 'DRAFT' | 'Publish' | 'Draft' | string>('PUBLISH');
	let modalImage = $state('/images/banners/banner-home.svg');

	function showToast(msg: string) {
		toast.success(msg);
	}

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

	function openAddModal() {
		editingItem = null;
		modalName = '';
		modalUrl = '/Home';
		modalUrlType = 'Internal';
		modalSerial = '1';
		modalStatus = 'PUBLISH';
		modalImage = '/images/banners/banner-home.svg';
		isModalOpen = true;
	}

	function openEditModal(item: CarouselItem) {
		editingItem = item;
		modalName = item.name;
		modalUrl = item.url;
		modalUrlType = item.urlType === 'External' ? 'External' : 'Internal';
		modalSerial = item.serial;
		modalStatus = (item.status || '').toUpperCase().startsWith('DRAFT') ? 'DRAFT' : 'PUBLISH';
		modalImage = item.image;
		isModalOpen = true;
	}

	function handleSave(e: SubmitEvent) {
		e.preventDefault();
		if (!modalName.trim()) return;

		if (editingItem) {
			carousels = carousels.map((c) =>
				c.id === editingItem!.id
					? {
							...c,
							name: modalName,
							url: modalUrl,
							urlType: modalUrlType,
							serial: modalSerial,
							status: modalStatus,
							image: modalImage
					  }
					: c
			);
			showToast(`"${modalName}" ক্যারোসেল আপডেট হয়েছে`);
		} else {
			const newItem: CarouselItem = {
				id: `car-${Date.now()}`,
				name: modalName,
				url: modalUrl,
				urlType: modalUrlType,
				serial: modalSerial,
				status: modalStatus,
				image: modalImage
			};
			carousels = [...carousels, newItem];
			showToast(`নতুন ক্যারোসেল যুক্ত হয়েছে`);
		}
		isModalOpen = false;
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
		showToast(`স্ট্যাটাস পরিবর্তিত হয়েছে: ${newStatus}`);

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
				showToast(`"${clone.name}" সফলভাবে ডুপ্লিকেট হয়েছে!`);
			} else {
				showToast(`ক্যারোসেল ডুপ্লিকেট হয়েছে!`);
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
		showToast(`ক্যারোসেল মুছে ফেলা হয়েছে`);

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
	<title>Carousel - Customization - Haq Plus Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
	<!-- Top Controls Row (Search Left, + Add Carousel Right) -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
		<!-- Search Input (Exact match to screenshot 1) -->
		<div class="relative w-full sm:w-80">
			<input
				type="text"
				placeholder="Search carousels..."
				bind:value={searchQuery}
				class="w-full bg-white border border-slate-200/90 rounded-2xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] focus:ring-2 focus:ring-[#5845eb]/15 transition-all shadow-2xs"
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
				onclick={() => (activeTab = 'all')}
				class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'all'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>All Data</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'all' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					{allCount}
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'publish')}
				class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'publish'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Publish</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'publish' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					{publishCount}
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'draft')}
				class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'draft'
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
				onclick={() => (activeTab = 'low_stock')}
				class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'low_stock'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Low Stock</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'low_stock' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					3
				</span>
			</button>

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

	<!-- Carousel Table Card (Exact match to Screenshot 1) -->
	<div class="bg-white border border-slate-200/90 rounded-3xl shadow-xs min-h-[360px] pb-12">
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

<!-- Add / Edit Carousel Modal -->
{#if isModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
		<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
			<div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
				<h3 class="text-base font-bold text-slate-900">
					{editingItem ? 'ক্যারোসেল এডিট করুন' : 'নতুন ক্যারোসেল যুক্ত করুন'}
				</h3>
				<button type="button" onclick={() => (isModalOpen = false)} class="p-2 text-slate-400 hover:text-slate-700">
					<X class="w-5 h-5" />
				</button>
			</div>

			<form onsubmit={handleSave} class="p-6 space-y-4">
				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1.5">ক্যারোসেল নাম *</label>
					<input
						type="text"
						bind:value={modalName}
						required
						placeholder="যেমন: Summer Promo"
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#5845eb] focus:bg-white"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1.5">URL Type</label>
						<select
							bind:value={modalUrlType}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#5845eb]"
						>
							<option value="Internal">Internal</option>
							<option value="External">External</option>
						</select>
					</div>
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1.5">সিরিয়াল নম্বর</label>
						<input
							type="text"
							bind:value={modalSerial}
							placeholder="1"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono"
						/>
					</div>
				</div>

				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1.5">টার্গেট URL</label>
					<input
						type="text"
						bind:value={modalUrl}
						placeholder="/Home বা https://example.com"
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1.5">স্ট্যাটাস</label>
						<select
							bind:value={modalStatus}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold"
						>
							<option value="PUBLISH">PUBLISH</option>
							<option value="DRAFT">DRAFT</option>
						</select>
					</div>
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1.5">ব্যানার ইমেজ পাথ</label>
						<input
							type="text"
							bind:value={modalImage}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono"
						/>
					</div>
				</div>

				<div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
					<button
						type="button"
						onclick={() => (isModalOpen = false)}
						class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
					>
						বাতিল
					</button>
					<button
						type="submit"
						class="px-5 py-2.5 rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold"
					>
						সংরক্ষণ
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

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
