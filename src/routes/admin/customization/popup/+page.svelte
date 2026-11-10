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
		AppWindow,
		Clock,
		Sparkles,
		ExternalLink,
		MousePointerClick
	} from 'lucide-svelte';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Badge } from '#lib/components/ui/badge';
	import { Card } from '#lib/components/ui/card';
	import { invalidateAll } from '$app/navigation';

	interface PopupItem {
		id: string;
		image: string;
		name: string;
		url: string;
		urlType: 'Internal' | 'External' | string;
		triggerType: 'on_load' | 'exit_intent' | 'delay_seconds' | string;
		delaySeconds: number;
		priority: string;
		status: 'PUBLISH' | 'DRAFT' | 'Publish' | 'Draft' | string;
	}

	let { data }: { data: any } = $props();

	let popups = $state<PopupItem[]>([]);

	$effect(() => {
		popups = data?.popups || [];
	});

	let searchQuery = $state('');
	let activeTab = $state<'all' | 'publish' | 'draft' | 'trash'>('all');
	let selectedIds = $state<string[]>([]);

	// Fixed Floating Dropdown (Immune to Table / Card overflow clipping)
	let activeActionItem = $state<PopupItem | null>(null);
	let menuPosition = $state<{ top: number; left: number } | null>(null);

	function handleActionClick(item: PopupItem, e: MouseEvent) {
		e.stopPropagation();
		if (activeActionItem?.id === item.id) {
			closeActionMenu();
			return;
		}
		const button = e.currentTarget as HTMLElement;
		const rect = button.getBoundingClientRect();

		const menuWidth = 176;
		const menuHeight = 140; // 3 items (Edit, Toggle Status, Delete)

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

	let filteredPopups = $derived.by(() => {
		let list = [...popups];
		if (activeTab === 'publish') {
			list = list.filter((p) => (p.status || '').toUpperCase().startsWith('PUB'));
		} else if (activeTab === 'draft') {
			list = list.filter((p) => (p.status || '').toUpperCase().startsWith('DRAFT'));
		} else if (activeTab === 'trash') {
			list = [];
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(p) =>
					(p.name || '').toLowerCase().includes(q) ||
					(p.url && p.url.toLowerCase().includes(q)) ||
					(p.triggerType && p.triggerType.toLowerCase().includes(q))
			);
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

	async function toggleStatus(item: PopupItem) {
		try {
			const formData = new FormData();
			formData.append('id', item.id);
			formData.append('status', item.status);

			const res = await fetch('?/toggleStatus', {
				method: 'POST',
				body: formData
			});
			const result: any = await res.json();

			if (result.type === 'success' || result.status === 200) {
				const isPub = (item.status || '').toUpperCase().startsWith('PUB');
				item.status = isPub ? 'DRAFT' : 'PUBLISH';
				toast.success('পপআপ স্ট্যাটাস পরিবর্তিত হয়েছে');
			} else {
				toast.error('স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে');
			}
		} catch (err) {
			toast.error('সার্ভারে সমস্যা হয়েছে');
		}
	}

	async function handleDelete(item: PopupItem) {
		const confirmed = await confirmModal({
			title: 'পপআপ মুছে ফেলা',
			message: `আপনি কি "${item.name}" পপআপটি স্থায়ীভাবে মুছতে চান?`,
			confirmText: 'হ্যাঁ, মুছে ফেলুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) return;

		try {
			const formData = new FormData();
			formData.append('id', item.id);

			const res = await fetch('?/deletePopup', {
				method: 'POST',
				body: formData
			});
			const result: any = await res.json();

			if (result.type === 'success' || result.status === 200) {
				popups = popups.filter((p) => p.id !== item.id);
				selectedIds = selectedIds.filter((id) => id !== item.id);
				toast.success('পপআপ মুছে ফেলা হয়েছে');
				await invalidateAll();
			} else {
				toast.error('মুছে ফেলতে ব্যর্থ হয়েছে');
			}
		} catch (err) {
			toast.error('সার্ভারে সমস্যা হয়েছে');
		}
	}

	async function handleBulkDelete() {
		if (selectedIds.length === 0) return;

		const confirmed = await confirmModal({
			title: 'একসাথে পপআপ মুছে ফেলা',
			message: `আপনি নির্বাচিত ${selectedIds.length}টি পপআপ মুছতে চান?`,
			confirmText: 'সব মুছুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) return;

		try {
			const formData = new FormData();
			formData.append('ids', JSON.stringify(selectedIds));

			const res = await fetch('?/bulkDelete', {
				method: 'POST',
				body: formData
			});
			const result: any = await res.json();

			if (result.type === 'success' || result.status === 200) {
				popups = popups.filter((p) => !selectedIds.includes(p.id));
				selectedIds = [];
				toast.success('নির্বাচিত পপআপগুলো মুছে ফেলা হয়েছে');
				await invalidateAll();
			} else {
				toast.error('মুছতে ব্যর্থ হয়েছে');
			}
		} catch (err) {
			toast.error('সার্ভারে সমস্যা হয়েছে');
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
	<title>Popup & Offers - Customization - Haq Plus Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-['Anek_Bangla',sans-serif]">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-2.5">
			<div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
				<AppWindow class="w-5 h-5" />
			</div>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">পপআপ ও ডিসকাউন্ট অফার</h1>
				<p class="text-xs text-slate-500 mt-0.5">গ্রাহকদের জন্য আকর্ষণীয় অফার ও ডিসকাউন্ট পপআপ উইন্ডো পরিচালনা করুন</p>
			</div>
		</div>

		<!-- Direct Link to Dedicated Separate New Page -->
		<div class="flex items-center gap-2">
			<a
				href="/admin/customization/popup/edit-popup/new"
				class="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
			>
				<Plus class="w-4 h-4" />
				<span>নতুন পপআপ তৈরি</span>
			</a>
		</div>
	</div>

	<!-- Top Filter & Search Controls -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
		<div class="relative w-full sm:w-80">
			<Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
			<Input
				type="text"
				placeholder="পপআপ সার্চ করুন..."
				bind:value={searchQuery}
				class="pl-10 h-10 bg-white border-slate-200/90 rounded-2xl text-xs font-medium focus-visible:ring-indigo-500 shadow-2xs"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => (searchQuery = '')}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
				>
					<X class="w-3.5 h-3.5" />
				</button>
			{/if}
		</div>

		<!-- Status Tabs -->
		<div class="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 shadow-2xs gap-1 self-start sm:self-auto">
			<button
				type="button"
				onclick={() => (activeTab = 'all')}
				class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'all'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>সব</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-200/80 text-slate-700'}">
					{popups.length}
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'publish')}
				class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'publish'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>সক্রিয় (Active)</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'publish' ? 'bg-emerald-600 text-white' : 'bg-slate-200/80 text-slate-700'}">
					{popups.filter(p => p.status === 'PUBLISH').length}
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'draft')}
				class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'draft'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>ড্রাফট (Draft)</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black {activeTab === 'draft' ? 'bg-slate-700 text-white' : 'bg-slate-200/80 text-slate-700'}">
					{popups.filter(p => p.status === 'DRAFT').length}
				</span>
			</button>
		</div>
	</div>

	<!-- Bulk Actions Bar -->
	{#if selectedIds.length > 0}
		<div class="flex items-center justify-between p-3 px-4 bg-indigo-50 border border-indigo-200 rounded-2xl animate-in fade-in slide-in-from-top-1">
			<div class="flex items-center gap-2 text-xs font-bold text-indigo-900">
				<CheckCircle2 class="w-4 h-4 text-indigo-600" />
				<span>{selectedIds.length}টি পপআপ নির্বাচিত</span>
			</div>
			<Button
				variant="destructive"
				size="sm"
				onclick={handleBulkDelete}
				class="rounded-xl h-8 px-3 text-xs gap-1.5 font-bold"
			>
				<Trash2 class="w-3.5 h-3.5" />
				<span>নির্বাচিতগুলো মুছুন</span>
			</Button>
		</div>
	{/if}

	<!-- Popup Table Card (With min-h and unclipped dropdown positioning) -->
	<Card class="rounded-3xl border-slate-200/90 shadow-xs min-h-[360px] pb-12">
		<div class="overflow-x-auto no-scrollbar">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-500 uppercase select-none">
						<th class="py-4 pl-5 pr-2 w-10">
							<input
								type="checkbox"
								checked={isAllSelected}
								onchange={toggleSelectAll}
								disabled={filteredPopups.length === 0}
								class="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-40"
								aria-label="Select all"
							/>
						</th>
						<th class="py-4 px-4 min-w-[100px]">ইমেজ</th>
						<th class="py-4 px-4 min-w-[180px]">পপআপের নাম ও টাইমিং</th>
						<th class="py-4 px-4 min-w-[180px]">টার্গেট লিংক</th>
						<th class="py-4 px-4 min-w-[120px]">ট্রিগার মেকানিজম</th>
						<th class="py-4 px-4 min-w-[110px]">স্ট্যাটাস</th>
						<th class="py-4 pr-6 pl-3 w-16 text-right">অ্যাকশন</th>
					</tr>
				</thead>

				<tbody class="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
					{#if filteredPopups.length === 0}
						<tr>
							<td colspan="7" class="py-20 text-center">
								<div class="flex flex-col items-center justify-center gap-3">
									<div class="relative">
										<div class="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
											<AppWindow class="w-8 h-8" />
										</div>
										<span class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white"></span>
									</div>

									<div class="space-y-1">
										<h4 class="text-sm sm:text-base font-bold text-slate-900">কোনো পপআপ পাওয়া যায়নি</h4>
										<p class="text-xs text-slate-400">নতুন অফার পপআপ তৈরি করতে উপরের "নতুন পপআপ তৈরি" বাটনে ক্লিক করুন।</p>
									</div>
								</div>
							</td>
						</tr>
					{:else}
						{#each filteredPopups as item, index (item.id)}
							{@const isSelected = selectedIds.includes(item.id)}
							{@const isNearBottom = index >= filteredPopups.length - 1 || filteredPopups.length <= 2}
							<tr class="hover:bg-slate-50/80 transition-colors {isSelected ? 'bg-indigo-50/40' : ''}">
								<td class="py-4 pl-5 pr-2">
									<input
										type="checkbox"
										checked={isSelected}
										onchange={() => toggleSelectRow(item.id)}
										class="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
										aria-label="Select {item.name}"
									/>
								</td>
								<td class="py-4 px-4">
									<div class="w-16 h-11 rounded-xl border border-slate-200/90 bg-slate-50 overflow-hidden shadow-2xs flex items-center justify-center p-0.5">
										<img src={item.image} alt={item.name} class="w-full h-full object-cover rounded-lg" />
									</div>
								</td>
								<td class="py-4 px-4">
									<a
										href="/admin/customization/popup/edit-popup/{item.id}"
										class="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors line-clamp-1"
									>
										{item.name}
									</a>
									<div class="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
										<Clock class="w-3 h-3 text-slate-400" />
										<span>
											{item.triggerType === 'delay_seconds'
												? `${item.delaySeconds || 4} সেকেন্ড পর ডিসপ্লে`
												: item.triggerType === 'exit_intent'
												? 'Exit Intent (মাউস উপরে নিলে)'
												: 'পেজ লোডের সাথে সাথে'}
										</span>
									</div>
								</td>
								<td class="py-4 px-4">
									<a
										href={item.url}
										target="_blank"
										class="inline-flex items-center gap-1 font-mono text-xs text-indigo-600 hover:text-indigo-800 hover:underline max-w-[200px] truncate"
									>
										<span>{item.url}</span>
										<ExternalLink class="w-3 h-3 flex-shrink-0" />
									</a>
								</td>
								<td class="py-4 px-4">
									<Badge
										variant="outline"
										class="text-[11px] font-semibold {item.triggerType === 'exit_intent'
											? 'border-amber-200 bg-amber-50 text-amber-700'
											: item.triggerType === 'delay_seconds'
											? 'border-indigo-200 bg-indigo-50 text-indigo-700'
											: 'border-slate-200 bg-slate-50 text-slate-700'}"
									>
										{item.triggerType === 'delay_seconds'
											? '⏱️ Delay'
											: item.triggerType === 'exit_intent'
											? '🚪 Exit Intent'
											: '⚡ On Load'}
									</Badge>
								</td>
								<td class="py-4 px-4">
									<button
										type="button"
										onclick={() => toggleStatus(item)}
										class="inline-flex items-center gap-1.5 cursor-pointer"
										title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
									>
										<span
											class="w-2.5 h-2.5 rounded-full {item.status === 'PUBLISH'
												? 'bg-emerald-500 animate-pulse'
												: 'bg-slate-300'}"
										></span>
										<Badge
											variant={item.status === 'PUBLISH' ? 'default' : 'secondary'}
											class="text-[11px] font-bold uppercase {item.status === 'PUBLISH'
												? 'bg-emerald-600 hover:bg-emerald-700 text-white'
												: 'bg-slate-100 text-slate-600'}"
										>
											{item.status}
										</Badge>
									</button>
								</td>
								<td class="py-4 pr-6 pl-3 text-right">
									<button
										type="button"
										onclick={(e) => handleActionClick(item, e)}
										class="w-8 h-8 rounded-xl border border-slate-200/90 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors ml-auto shadow-2xs cursor-pointer {activeActionItem?.id === item.id ? 'bg-slate-100 border-indigo-300 text-[#5845eb]' : ''}"
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
	</Card>

	<!-- Footer Notes / Summary -->
	<div class="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 px-1">
		<div>
			মোট <strong class="text-slate-900">{popups.length}</strong>টি পপআপ কনফিগার করা রয়েছে।
		</div>
		<div class="flex items-center gap-2">
			<span>💡 সেরা ফলাফলের জন্য পপআপে পরিষ্কার ইমেজ ও আকর্ষণীয় ডিসকাউন্ট কোড ব্যবহার করুন।</span>
		</div>
	</div>
</div>

<!-- FLOATING FIXED-COORDINATE ACTION MENU (Never clipped by card or table overflow!) -->
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
			href="/admin/customization/popup/edit-popup/{activeActionItem.id}"
			class="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
		>
			<Edit3 class="w-3.5 h-3.5 text-slate-400" />
			<span>এডিট করুন</span>
		</a>

		<button
			type="button"
			onclick={() => {
				const itm = activeActionItem;
				closeActionMenu();
				if (itm) toggleStatus(itm);
			}}
			class="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
		>
			<Eye class="w-3.5 h-3.5 text-slate-400" />
			<span>স্ট্যাটাস পরিবর্তন</span>
		</button>

		<div class="h-px bg-slate-100 my-1"></div>

		<button
			type="button"
			onclick={() => {
				const itm = activeActionItem;
				closeActionMenu();
				if (itm) handleDelete(itm);
			}}
			class="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer transition-colors"
		>
			<Trash2 class="w-3.5 h-3.5 text-rose-500" />
			<span>মুছে ফেলুন</span>
		</button>
	</div>
{/if}
