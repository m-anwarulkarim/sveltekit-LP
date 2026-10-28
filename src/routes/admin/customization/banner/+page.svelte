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
		X
	} from 'lucide-svelte';

	interface BannerItem {
		id: string;
		image: string;
		title: string;
		url: string;
		serial: string;
		status: 'PUBLISHED' | 'DRAFT';
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
	let activeActionId = $state<string | null>(null);

	// Modal State
	let isModalOpen = $state(false);
	let editingItem = $state<BannerItem | null>(null);
	let modalTitle = $state('');
	let modalUrl = $state('/home');
	let modalSerial = $state('10');
	let modalStatus = $state<'PUBLISHED' | 'DRAFT'>('DRAFT');
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

	let filteredBanners = $derived.by(() => {
		let list = [...banners];
		if (activeTab === 'published') {
			list = list.filter((b) => b.status === 'PUBLISHED');
		} else if (activeTab === 'draft') {
			list = list.filter((b) => b.status === 'DRAFT');
		} else if (activeTab === 'trash') {
			list = [];
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter((b) => b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q));
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

	function openAddModal() {
		editingItem = null;
		modalTitle = '';
		modalUrl = '/home';
		modalSerial = '1';
		modalStatus = 'PUBLISHED';
		modalImage = '/images/banners/banner-home.svg';
		isModalOpen = true;
	}

	function openEditModal(item: BannerItem) {
		editingItem = item;
		modalTitle = item.title;
		modalUrl = item.url;
		modalSerial = item.serial;
		modalStatus = item.status;
		modalImage = item.image;
		isModalOpen = true;
	}

	function handleSave(e: SubmitEvent) {
		e.preventDefault();
		if (!modalTitle.trim()) return;

		if (editingItem) {
			banners = banners.map((b) =>
				b.id === editingItem!.id
					? {
							...b,
							title: modalTitle,
							url: modalUrl,
							serial: modalSerial,
							status: modalStatus,
							image: modalImage
					  }
					: b
			);
			showToast(`"${modalTitle}" ব্যানার আপডেট করা হয়েছে`);
		} else {
			const newItem: BannerItem = {
				id: `ban-${Date.now()}`,
				title: modalTitle,
				url: modalUrl,
				serial: modalSerial,
				status: modalStatus,
				image: modalImage
			};
			banners = [...banners, newItem];
			showToast(`নতুন ব্যানার যুক্ত করা হয়েছে`);
		}
		isModalOpen = false;
	}

	async function handleDelete(item: BannerItem) {
		const confirmed = await confirmModal({
			title: 'ব্যানার মুছে ফেলা',
			message: `আপনি কি "${item.title}" ব্যানারটি মুছে ফেলতে চান?`,
			confirmText: 'হ্যাঁ, মুছে ফেলুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) return;

		banners = banners.filter((b) => b.id !== item.id);
		selectedIds = selectedIds.filter((id) => id !== item.id);
		showToast(`ব্যানারটি মুছে ফেলা হয়েছে`);
	}
</script>

<svelte:window onclick={handleWindowClick} />

<svelte:head>
	<title>Banner - Customization - AURA Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
	<!-- Top Search & Add Banner Row (Matches Screenshot 2) -->
	<div class="space-y-3">
		<!-- Search with integrated purple search button -->
		<div class="relative w-full sm:w-96 flex items-center">
			<Input
				type="text"
				placeholder="Search banners..."
				bind:value={searchQuery}
				class="rounded-r-none border-r-0 rounded-l-2xl pl-4 pr-3 py-2.5 text-xs sm:text-sm shadow-2xs"
			/>
			<Button
				type="button"
				variant="secondary"
				class="bg-[#e9e6fd] hover:bg-[#d8d3fc] text-[#5845eb] px-4 py-2.5 rounded-l-none rounded-r-2xl border border-l-0 border-indigo-200 shadow-2xs"
				aria-label="Search"
			>
				<Search class="w-4 h-4" />
			</Button>
		</div>

		<!-- + Add Banner Button -->
		<div>
			<a
				href="/admin/customization/banner/edit-banner/new"
				class="inline-flex items-center gap-1.5 rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-95 shrink-0 transition-all cursor-pointer"
			>
				<Plus class="w-4 h-4 stroke-[2.5]" />
				<span>Add Banner</span>
			</a>
		</div>
	</div>

	<!-- Filter Tabs Capsule (All Banners [1], Published [0], Draft [1], Trash [0]) -->
	<div class="flex items-center">
		<div class="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 shadow-2xs gap-1">
			<button
				type="button"
				onclick={() => (activeTab = 'all')}
				class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'all'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>All Banners</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'all' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					1
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'published')}
				class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'published'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Published</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'published' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					0
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
					1
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

	<!-- Table Card (Exact match to Screenshot 2) -->
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
						<th class="py-4 px-4 min-w-[140px]">TITLE</th>
						<th class="py-4 px-4 min-w-[200px]">URL</th>
						<th class="py-4 px-4 min-w-[100px]">SERIAL</th>
						<th class="py-4 px-4 min-w-[120px]">STATUS</th>
						<th class="py-4 pr-6 pl-3 w-16 text-right">ACTIONS</th>
					</tr>
				</thead>

				<tbody class="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
					{#each filteredBanners as item, index (item.id)}
						{@const isSelected = selectedIds.includes(item.id)}
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
								<span class="text-xs font-semibold text-slate-800 font-mono">{item.serial}</span>
							</td>

							<!-- Status -->
							<td class="py-4 px-4">
								<span class="font-bold text-slate-900 uppercase text-xs tracking-wider">
									{item.status}
								</span>
							</td>

							<!-- Actions -->
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
									<div class="absolute right-6 {index >= filteredBanners.length - 2 && filteredBanners.length > 2 ? 'bottom-12 top-auto origin-bottom-right' : 'top-12'} w-36 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 z-50 text-xs font-medium text-left animate-in fade-in zoom-in-95 duration-100">
										<a
											href="/admin/customization/banner/edit-banner/{item.id}"
											class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
										>
											<Edit3 class="w-3.5 h-3.5 text-slate-400" />
											<span>Edit</span>
										</a>
										<button
											type="button"
											onclick={() => {
												item.status = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
												activeActionId = null;
												showToast(`স্ট্যাটাস পরিবর্তন হয়েছে`);
											}}
											class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
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

<!-- Modal -->
{#if isModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
		<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
			<div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
				<h3 class="text-base font-bold text-slate-900">
					{editingItem ? 'ব্যানার এডিট করুন' : 'নতুন ব্যানার যুক্ত করুন'}
				</h3>
				<button type="button" onclick={() => (isModalOpen = false)} class="p-2 text-slate-400 hover:text-slate-700">
					<X class="w-5 h-5" />
				</button>
			</div>

			<form onsubmit={handleSave} class="p-6 space-y-4">
				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1.5">ব্যানার টাইটেল *</label>
					<Input
						type="text"
						bind:value={modalTitle}
						required
						placeholder="যেমন: Top Promo Banner"
						class="bg-slate-50 border-slate-200 text-xs"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1.5">টার্গেট URL</label>
						<Input
							type="text"
							bind:value={modalUrl}
							class="bg-slate-50 border-slate-200 text-xs font-mono"
						/>
					</div>
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1.5">সিরিয়াল নম্বর</label>
						<Input
							type="text"
							bind:value={modalSerial}
							class="bg-slate-50 border-slate-200 text-xs font-mono"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1.5">স্ট্যাটাস</label>
						<select
							bind:value={modalStatus}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#5845eb]"
						>
							<option value="PUBLISHED">PUBLISHED</option>
							<option value="DRAFT">DRAFT</option>
						</select>
					</div>
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1.5">ইমেজ পাথ</label>
						<Input
							type="text"
							bind:value={modalImage}
							class="bg-slate-50 border-slate-200 text-xs font-mono"
						/>
					</div>
				</div>

				<div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
					<Button
						type="button"
						variant="outline"
						onclick={() => (isModalOpen = false)}
						class="px-4 py-2 text-xs font-bold"
					>
						বাতিল
					</Button>
					<Button
						type="submit"
						class="px-5 py-2 bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold"
					>
						সংরক্ষণ
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
