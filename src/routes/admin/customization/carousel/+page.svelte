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
		name: string;
		url: string;
		urlType: 'Internal' | 'External';
		serial: string;
		status: 'PUBLISH' | 'DRAFT';
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
	let activeActionId = $state<string | null>(null);

	// Modal State
	let isModalOpen = $state(false);
	let editingItem = $state<CarouselItem | null>(null);
	let modalName = $state('');
	let modalUrl = $state('/Home');
	let modalUrlType = $state<'Internal' | 'External'>('Internal');
	let modalSerial = $state('1');
	let modalStatus = $state<'PUBLISH' | 'DRAFT'>('PUBLISH');
	let modalImage = $state('/images/banners/banner-home.svg');

	function showToast(msg: string) {
		toast.success(msg);
	}

	function handleActionClick(id: string, e: MouseEvent) {
		e.stopPropagation();
		activeActionId = activeActionId === id ? null : id;
	}

	function handleWindowClick() {
		activeActionId = null;
	}

	let filteredCarousels = $derived.by(() => {
		let list = [...carousels];
		if (activeTab === 'publish') {
			list = list.filter((c) => c.status === 'PUBLISH');
		} else if (activeTab === 'draft') {
			list = list.filter((c) => c.status === 'DRAFT');
		} else if (activeTab === 'trash') {
			list = [];
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter((c) => c.name.toLowerCase().includes(q) || c.url.toLowerCase().includes(q));
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
		modalUrlType = item.urlType;
		modalSerial = item.serial;
		modalStatus = item.status;
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

	let publishCount = $derived(carousels.filter((c) => c.status === 'PUBLISH' || c.status === 'Publish').length);
	let draftCount = $derived(carousels.filter((c) => c.status === 'DRAFT' || c.status === 'Draft').length);
	let allCount = $derived(carousels.length);

	async function handleToggleStatus(item: CarouselItem) {
		const oldStatus = item.status;
		const newStatus = oldStatus === 'PUBLISH' || oldStatus === 'Publish' ? 'DRAFT' : 'PUBLISH';
		item.status = newStatus as any;
		activeActionId = null;
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
		activeActionId = null;

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

<svelte:window onclick={handleWindowClick} />

<svelte:head>
	<title>Carousel - Customization - AURA Admin</title>
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
	<div class="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden min-h-[260px]">
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
							<td class="py-4 pr-6 pl-3 text-right relative">
								<button
									type="button"
									onclick={(e) => handleActionClick(item.id, e)}
									class="w-8 h-8 rounded-xl border border-slate-200/80 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors ml-auto shadow-2xs cursor-pointer"
									aria-label="Action menu"
								>
									<MoreVertical class="w-4 h-4" />
								</button>

								{#if activeActionId === item.id}
									<div class="absolute right-6 {index >= filteredCarousels.length - 2 && filteredCarousels.length > 2 ? 'bottom-12 top-auto origin-bottom-right' : 'top-12'} w-36 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 z-50 text-xs font-medium text-left animate-in fade-in zoom-in-95 duration-100">
										<a
											href="/admin/customization/edit-carousel/{item.id}"
											class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
										>
											<Edit3 class="w-3.5 h-3.5 text-slate-400" />
											<span>Edit</span>
										</a>
										<button
											type="button"
											onclick={() => handleDuplicate(item)}
											class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
										>
											<Copy class="w-3.5 h-3.5 text-slate-400" />
											<span>Duplicate</span>
										</button>
										<button
											type="button"
											onclick={() => handleToggleStatus(item)}
											class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
										>
											<Eye class="w-3.5 h-3.5 text-slate-400" />
											<span>Toggle Status</span>
										</button>
										<div class="h-px bg-slate-100 my-1"></div>
										<button
											type="button"
											onclick={() => {
												handleDelete(item);
												activeActionId = null;
											}}
											class="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
										>
											<Trash2 class="w-3.5 h-3.5 text-rose-500" />
											<span>Delete</span>
										</button>
									</div>
								{/if}
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
