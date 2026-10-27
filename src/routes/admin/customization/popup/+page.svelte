<script lang="ts">
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
		AppWindow
	} from 'lucide-svelte';

	interface PopupItem {
		id: string;
		image: string;
		name: string;
		url: string;
		urlType: 'Internal' | 'External';
		priority: string;
		status: 'PUBLISH' | 'DRAFT';
	}

	let popups = $state<PopupItem[]>([]);

	let searchQuery = $state('');
	let activeTab = $state<'all' | 'publish' | 'draft' | 'trash'>('all');
	let selectedIds = $state<string[]>([]);
	let activeActionId = $state<string | null>(null);

	// Modal State
	let isModalOpen = $state(false);
	let editingItem = $state<PopupItem | null>(null);
	let modalName = $state('');
	let modalUrl = $state('/products');
	let modalUrlType = $state<'Internal' | 'External'>('Internal');
	let modalPriority = $state('1');
	let modalStatus = $state<'PUBLISH' | 'DRAFT'>('PUBLISH');
	let modalImage = $state('/images/banners/banner-combo.svg');

	let toastMessage = $state<string | null>(null);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			toastMessage = null;
		}, 3000);
	}

	function handleActionClick(id: string, e: MouseEvent) {
		e.stopPropagation();
		activeActionId = activeActionId === id ? null : id;
	}

	function handleWindowClick() {
		activeActionId = null;
	}

	let filteredPopups = $derived.by(() => {
		let list = [...popups];
		if (activeTab === 'publish') {
			list = list.filter((p) => p.status === 'PUBLISH');
		} else if (activeTab === 'draft') {
			list = list.filter((p) => p.status === 'DRAFT');
		} else if (activeTab === 'trash') {
			list = [];
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter((p) => p.name.toLowerCase().includes(q) || p.url.toLowerCase().includes(q));
		}
		return list;
	});

	let isAllSelected = $derived(
		filteredPopups.length > 0 && filteredPopups.every((p) => selectedIds.includes(p.id))
	);

	function toggleSelectAll() {
		if (isAllSelected) {
			selectedIds = [];
		} else {
			selectedIds = filteredPopups.map((p) => p.id);
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
		modalUrl = '/products';
		modalUrlType = 'Internal';
		modalPriority = '1';
		modalStatus = 'PUBLISH';
		modalImage = '/images/banners/banner-combo.svg';
		isModalOpen = true;
	}

	function openEditModal(item: PopupItem) {
		editingItem = item;
		modalName = item.name;
		modalUrl = item.url;
		modalUrlType = item.urlType;
		modalPriority = item.priority;
		modalStatus = item.status;
		modalImage = item.image;
		isModalOpen = true;
	}

	function handleSave(e: SubmitEvent) {
		e.preventDefault();
		if (!modalName.trim()) return;

		if (editingItem) {
			popups = popups.map((p) =>
				p.id === editingItem!.id
					? {
							...p,
							name: modalName,
							url: modalUrl,
							urlType: modalUrlType,
							priority: modalPriority,
							status: modalStatus,
							image: modalImage
					  }
					: p
			);
			showToast(`"${modalName}" পপআপ আপডেট হয়েছে`);
		} else {
			const newItem: PopupItem = {
				id: `pop-${Date.now()}`,
				name: modalName,
				url: modalUrl,
				urlType: modalUrlType,
				priority: modalPriority,
				status: modalStatus,
				image: modalImage
			};
			popups = [...popups, newItem];
			showToast(`নতুন পপআপ সফলভাবে যুক্ত হয়েছে`);
		}
		isModalOpen = false;
	}

	function handleDelete(item: PopupItem) {
		if (confirm(`আপনি কি "${item.name}" পপআপটি মুছতে চান?`)) {
			popups = popups.filter((p) => p.id !== item.id);
			selectedIds = selectedIds.filter((id) => id !== item.id);
			showToast(`পপআপটি মুছে ফেলা হয়েছে`);
		}
	}
</script>

<svelte:window onclick={handleWindowClick} />

<svelte:head>
	<title>Popup - Customization - AURA Admin</title>
</svelte:head>

<!-- Toast Alert -->
{#if toastMessage}
	<div class="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
		<CheckCircle2 class="w-4 h-4 text-emerald-400" />
		<span>{toastMessage}</span>
	</div>
{/if}

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
	<!-- Top Controls Row (Search Left, + Add Popup Right) -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
		<div class="relative w-full sm:w-80">
			<input
				type="text"
				placeholder="Search popups..."
				bind:value={searchQuery}
				class="w-full bg-white border border-slate-200/90 rounded-2xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] focus:ring-2 focus:ring-[#5845eb]/15 transition-all shadow-2xs"
			/>
			<div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
				<Search class="w-4 h-4" />
			</div>
		</div>

		<button
			type="button"
			onclick={openAddModal}
			class="rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 shrink-0"
		>
			<Plus class="w-4 h-4 stroke-[2.5]" />
			<span>Add Popup</span>
		</button>
	</div>

	<!-- Filter Tabs Capsule (All [0], Publish [0], Draft [0], Trash [0]) -->
	<div class="flex items-center">
		<div class="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 shadow-2xs gap-1">
			<button
				type="button"
				onclick={() => (activeTab = 'all')}
				class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'all'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>All</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'all' ? 'bg-[#5845eb] text-white' : 'bg-slate-200/80 text-slate-700'}">
					{popups.length}
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
					{popups.filter(p => p.status === 'PUBLISH').length}
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
					{popups.filter(p => p.status === 'DRAFT').length}
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

	<!-- Popup Table Card (Exact Match to Screenshot 3 with Empty State) -->
	<div class="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
		<div class="overflow-x-auto no-scrollbar">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-bold tracking-wider text-slate-500 uppercase select-none">
						<th class="py-4 pl-5 pr-2 w-10">
							<input
								type="checkbox"
								checked={isAllSelected}
								onchange={toggleSelectAll}
								disabled={filteredPopups.length === 0}
								class="w-4 h-4 rounded-md border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer disabled:opacity-40"
								aria-label="Select all"
							/>
						</th>
						<th class="py-4 px-4 min-w-[120px]">IMAGE</th>
						<th class="py-4 px-4 min-w-[140px]">NAME</th>
						<th class="py-4 px-4 min-w-[200px]">URL</th>
						<th class="py-4 px-4 min-w-[120px]">URL TYPE</th>
						<th class="py-4 px-4 min-w-[160px]">CUSTOMIZATION.PRIORITY</th>
						<th class="py-4 px-4 min-w-[120px]">STATUS</th>
						<th class="py-4 pr-6 pl-3 w-16 text-right">ACTIONS</th>
					</tr>
				</thead>

				<tbody class="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
					{#if filteredPopups.length === 0}
						<!-- Exact Empty State Matching Screenshot 3 -->
						<tr>
							<td colspan="8" class="py-20 text-center">
								<div class="flex flex-col items-center justify-center gap-3">
									<div class="relative">
										<div class="w-16 h-16 rounded-full bg-[#f1effd] flex items-center justify-center text-[#5845eb]">
											<!-- Popup window glyph -->
											<svg class="w-7 h-7 text-[#5845eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
												<rect x="2" y="4" width="20" height="16" rx="2" />
												<line x1="2" y1="9" x2="22" y2="9" />
											</svg>
										</div>
										<!-- Small orange dot at top right of icon matching screenshot 3 -->
										<span class="absolute top-1 right-0 w-2.5 h-2.5 rounded-full bg-amber-500"></span>
									</div>

									<div class="space-y-0.5">
										<h4 class="text-sm sm:text-base font-bold text-slate-800">No popups found</h4>
										<p class="text-xs text-slate-400">Popup items will appear here once available.</p>
									</div>
								</div>
							</td>
						</tr>
					{:else}
						{#each filteredPopups as item}
							{@const isSelected = selectedIds.includes(item.id)}
							<tr class="hover:bg-slate-50/70 transition-colors {isSelected ? 'bg-indigo-50/30' : ''}">
								<td class="py-4 pl-5 pr-2">
									<input
										type="checkbox"
										checked={isSelected}
										onchange={() => toggleSelectRow(item.id)}
										class="w-4 h-4 rounded-md border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
										aria-label="Select {item.name}"
									/>
								</td>
								<td class="py-4 px-4">
									<div class="w-16 h-10 rounded-xl border border-slate-200/80 bg-slate-50 overflow-hidden shadow-2xs flex items-center justify-center p-0.5">
										<img src={item.image} alt={item.name} class="w-full h-full object-cover rounded-lg" />
									</div>
								</td>
								<td class="py-4 px-4 font-bold text-slate-900">{item.name}</td>
								<td class="py-4 px-4 text-slate-700 font-mono text-xs">{item.url}</td>
								<td class="py-4 px-4">{item.urlType}</td>
								<td class="py-4 px-4 font-mono font-semibold">{item.priority}</td>
								<td class="py-4 px-4 font-bold uppercase">{item.status}</td>
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
										<div class="absolute right-6 top-12 w-36 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 z-50 text-xs font-medium text-left animate-in fade-in zoom-in-95 duration-100">
											<button
												type="button"
												onclick={() => {
													openEditModal(item);
													activeActionId = null;
												}}
												class="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
											>
												<Edit3 class="w-3.5 h-3.5 text-slate-400" />
												<span>Edit</span>
											</button>
											<button
												type="button"
												onclick={() => {
													item.status = item.status === 'PUBLISH' ? 'DRAFT' : 'PUBLISH';
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
					{/if}
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
					{editingItem ? 'পপআপ এডিট করুন' : 'নতুন পপআপ যুক্ত করুন'}
				</h3>
				<button type="button" onclick={() => (isModalOpen = false)} class="p-2 text-slate-400 hover:text-slate-700">
					<X class="w-5 h-5" />
				</button>
			</div>

			<form onsubmit={handleSave} class="p-6 space-y-4">
				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1.5">পপআপের নাম *</label>
					<input
						type="text"
						bind:value={modalName}
						required
						placeholder="যেমন: Flash Sale 50% Off Popup"
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#5845eb] focus:bg-white"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1.5">টার্গেট URL</label>
						<input
							type="text"
							bind:value={modalUrl}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono"
						/>
					</div>
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
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1.5">প্রায়োরিটি</label>
						<input
							type="text"
							bind:value={modalPriority}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono"
						/>
					</div>
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
				</div>

				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1.5">ব্যানার/পপআপ ইমেজ পাথ</label>
					<input
						type="text"
						bind:value={modalImage}
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono"
					/>
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
