<script lang="ts">
	import { Button, Input, Card, CardContent, Badge } from '#lib/components/ui';
	import {
		Search,
		Calendar,
		Trash2,
		ChevronLeft,
		ChevronRight,
		ChevronDown,
		Check,
		Plus,
		CheckCircle2,
		ShieldAlert,
		ShieldCheck,
		X,
		Loader2,
		Lock,
		Cpu,
		UserCheck,
		Download,
		Edit3,
		Clock,
		AlertTriangle,
		Phone,
		Globe,
		RotateCw
	} from 'lucide-svelte';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data?: any } = $props();

	// Server-synced state
	let blockedList = $state<any[]>(data?.blockedList || []);
	let totalBlocked = $state(data?.totalCount ?? 0);
	let currentPage = $state(data?.currentPage ?? 1);
	let perPage = $state(data?.perPage ?? 10);
	let filterType = $state<'all' | 'permanent' | 'auto' | 'manual'>(data?.filterType || 'all');
	let stats = $state(data?.stats || { total: 0, permanent: 0, auto: 0, manual: 0 });

	// Local UI states
	let searchQuery = $state(data?.searchQuery || '');
	let isPerPageOpen = $state(false);
	let isSaving = $state(false);
	let selectedIds = $state<string[]>([]);
	// Synchronize when server data updates
	$effect(() => {
		blockedList = data?.blockedList ? [...data.blockedList] : [];
		totalBlocked = data?.totalCount ?? 0;
		stats = data?.stats || { total: 0, permanent: 0, auto: 0, manual: 0 };
	});

	function showToast(msg: string) {
		toast.success(msg);
	}

	// Manual Block Modal State
	let isBlockModalOpen = $state(false);
	let manualIp = $state('');
	let manualPhone = $state('');
	let manualDeviceId = $state('');
	let manualType = $state('Manual Admin Block');
	let manualDuration = $state<'permanent' | '24h' | '7d' | '30d'>('permanent');
	let manualReason = $state('Fake Cash on Delivery Orders');

	// Edit Block Modal State
	let editItem = $state<any | null>(null);
	let editReason = $state('');
	let editDuration = $state<'permanent' | '24h' | '7d' | '30d'>('permanent');

	// Common Fraud Reasons
	const COMMON_REASONS = [
		'Fake Cash on Delivery Orders',
		'Spam Order Bot Flood',
		'High Return / Cancellation Abuse',
		'Unreachable Contact / Invalid Address',
		'Automated Web Scraping Abuse'
	];

	// Filtered list by client-side search query
	let filteredList = $derived.by(() => {
		let list = blockedList;

		if (filterType !== 'all') {
			if (filterType === 'permanent') {
				list = list.filter((i) => i.isPermanent);
			} else if (filterType === 'auto') {
				list = list.filter((i) => i.type?.toLowerCase().includes('auto'));
			} else if (filterType === 'manual') {
				list = list.filter((i) => i.type?.toLowerCase().includes('manual'));
			}
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(item) =>
					item.ipAddress?.toLowerCase().includes(q) ||
					item.phoneNo?.toLowerCase().includes(q) ||
					item.reason?.toLowerCase().includes(q) ||
					item.type?.toLowerCase().includes(q)
			);
		}

		return list;
	});

	let totalPages = $derived(Math.max(1, Math.ceil(totalBlocked / perPage)));

	let isAllSelected = $derived(
		filteredList.length > 0 && selectedIds.length === filteredList.length
	);

	function toggleSelectAll() {
		if (isAllSelected) {
			selectedIds = [];
		} else {
			selectedIds = filteredList.map((item) => item.id);
		}
	}

	function toggleSelectRow(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((item) => item !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	async function unblockItem(id: string, ip: string) {
		blockedList = blockedList.filter((item) => item.id !== id);
		selectedIds = selectedIds.filter((item) => item !== id);
		totalBlocked = Math.max(0, totalBlocked - 1);
		showToast(`'${ip}' সফলভাবে আনব্লক করা হয়েছে!`);

		try {
			const fd = new FormData();
			fd.append('id', id);
			fd.append('ipAddress', ip);
			await fetch('?/unblockIp', {
				method: 'POST',
				body: fd
			});
			await invalidateAll();
		} catch (error) {
			console.error('Failed to unblock on server:', error);
		}
	}

	async function handleBulkUnblock() {
		if (selectedIds.length === 0) return;
		const confirmed = await confirmModal({
			title: 'আইপি আনব্লক নিশ্চিতকরণ',
			message: `আপনি কি নিশ্চিতভাবে নির্বাচিত ${selectedIds.length}টি আইটেম আনব্লক করতে চান?`,
			confirmText: 'হ্যাঁ, আনব্লক করুন',
			variant: 'warning',
			icon: 'alert'
		});
		if (!confirmed) {
			return;
		}

		const toUnblock = [...selectedIds];
		const count = toUnblock.length;
		blockedList = blockedList.filter((item) => !toUnblock.includes(item.id));
		selectedIds = [];
		totalBlocked = Math.max(0, totalBlocked - count);
		showToast(`${count}টি আইটেম সফলভাবে আনব্লক করা হয়েছে!`);

		try {
			const fd = new FormData();
			fd.append('ids', JSON.stringify(toUnblock));
			await fetch('?/bulkUnblock', {
				method: 'POST',
				body: fd
			});
			await invalidateAll();
		} catch (e) {
			console.error('Failed to bulk unblock on server:', e);
		}
	}

	async function handleManualBlock(e: Event) {
		e.preventDefault();
		if (!manualIp.trim() && !manualPhone.trim()) {
			showToast('আইপি অথবা ফোন নম্বর প্রদান করা আবশ্যক!');
			return;
		}

		isSaving = true;
		const targetIp = manualIp.trim() || '127.0.0.1';
		const targetPhone = manualPhone.trim() || '-';

		const formData = new FormData();
		formData.append('ipAddress', targetIp);
		formData.append('phoneNo', targetPhone);
		formData.append('deviceId', manualDeviceId.trim() || '-');
		formData.append('type', manualType);
		formData.append('duration', manualDuration);
		formData.append('reason', manualReason.trim());

		try {
			const res = await fetch('?/blockIp', {
				method: 'POST',
				body: formData
			});
			const result: any = await res.json();
			const newId = result?.data?.item?.id || String(Date.now());

			let blockUntilLabel = 'Permanent';
			if (manualDuration !== 'permanent') {
				const d = new Date();
				if (manualDuration === '24h') d.setHours(d.getHours() + 24);
				if (manualDuration === '7d') d.setDate(d.getDate() + 7);
				if (manualDuration === '30d') d.setDate(d.getDate() + 30);
				blockUntilLabel = d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
			}

			const newItem = {
				id: newId,
				sl: 1,
				ipAddress: targetIp,
				deviceId: manualDeviceId.trim() || '-',
				phoneNo: targetPhone,
				type: manualType,
				reason: manualReason.trim(),
				isPermanent: manualDuration === 'permanent',
				blockUntil: blockUntilLabel,
				date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
			};

			blockedList = [newItem, ...blockedList];
			totalBlocked += 1;
			if (manualDuration === 'permanent') stats.permanent += 1;
			if (manualType.includes('Auto')) stats.auto += 1;
			else stats.manual += 1;

			isBlockModalOpen = false;
			manualIp = '';
			manualPhone = '';
			manualDeviceId = '';
			showToast(`'${targetIp !== '127.0.0.1' ? targetIp : targetPhone}' সফলভাবে ব্লকলিস্টে যুক্ত করা হয়েছে!`);
			await invalidateAll();
		} catch (error) {
			console.error('Error blocking IP:', error);
			showToast('আইপি ব্লক করতে সমস্যা হয়েছে');
		} finally {
			isSaving = false;
		}
	}

	function openEditModal(item: any) {
		editItem = { ...item };
		editReason = item.reason || 'Restricted Activity';
		editDuration = item.isPermanent ? 'permanent' : '7d';
	}

	async function handleUpdateBlock(e: Event) {
		e.preventDefault();
		if (!editItem) return;

		isSaving = true;
		const formData = new FormData();
		formData.append('id', editItem.id);
		formData.append('reason', editReason.trim());
		formData.append('duration', editDuration);

		try {
			await fetch('?/updateBlock', {
				method: 'POST',
				body: formData
			});

			blockedList = blockedList.map((item) => {
				if (item.id === editItem.id) {
					return {
						...item,
						reason: editReason.trim(),
						isPermanent: editDuration === 'permanent',
						blockUntil: editDuration === 'permanent' ? 'Permanent' : 'Temporary'
					};
				}
				return item;
			});

			showToast('ব্লক রেকর্ড সফলভাবে আপডেট করা হয়েছে!');
			await invalidateAll();
			editItem = null;
		} catch (err) {
			console.error('Failed to update block:', err);
			showToast('আপডেট করতে ব্যর্থ হয়েছে');
		} finally {
			isSaving = false;
		}
	}

	function exportCsv() {
		if (blockedList.length === 0) {
			showToast('এক্সপোর্ট করার মতো কোনো ব্লক রেকর্ড নেই।');
			return;
		}

		const headers = 'SL,IP Address,Device ID,Phone No,Block Type,Reason,Block Until,Date Added\n';
		const rows = blockedList
			.map(
				(i, idx) =>
					`"${idx + 1}","${i.ipAddress}","${i.deviceId}","${i.phoneNo}","${i.type}","${i.reason}","${i.blockUntil}","${i.date}"`
			)
			.join('\n');

		const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute('download', `aura_ip_blacklist_${Date.now()}.csv`);
		link.click();
		showToast('আইপি ব্লকলিস্ট CSV ফরম্যাটে ডাউনলোড হয়েছে!');
	}

	function handleDocumentClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.dropdown-container')) {
			isPerPageOpen = false;
		}
	}
</script>

<svelte:window onclick={handleDocumentClick} />

<svelte:head>
	<title>IP & Phone Sentinel Blacklist | Admin Deck</title>
</svelte:head>

<div class="space-y-6 max-w-[1400px] mx-auto pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
	
	<!-- 1. Header Row -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
		<div class="space-y-1">
			<div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
				<span>Admin Panel</span>
				<span>/</span>
				<span class="text-slate-700">Security Sentinel</span>
				<span>/</span>
				<span class="text-[#5845eb] font-bold">IP & Phone Blacklist</span>
			</div>

			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
					<ShieldAlert class="w-5 h-5 stroke-[2.2]" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-['Outfit']">
							IP & Phone Blacklist
						</h1>
						<Badge class="bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs px-2.5 py-0.5">
							{totalBlocked} Active Blocks
						</Badge>
					</div>
					<p class="text-xs text-slate-500 font-medium">
						সন্দেহজনক বট, ফ্রড অর্ডার ও অবাঞ্ছিত ফোন নম্বর ব্লক এবং সেন্টিনেল ট্র্যাকিং
					</p>
				</div>
			</div>
		</div>

		<!-- Top Right Action Controls -->
		<div class="flex flex-wrap items-center gap-2.5">
			{#if selectedIds.length > 0}
				<Button
					type="button"
					size="sm"
					onclick={handleBulkUnblock}
					class="h-9 px-3.5 gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer animate-in fade-in"
				>
					<Trash2 class="w-3.5 h-3.5" />
					<span>আনব্লক করুন ({selectedIds.length})</span>
				</Button>
			{/if}

			<Button
				variant="outline"
				size="sm"
				onclick={exportCsv}
				class="h-9 px-3.5 gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border-slate-200 rounded-xl shadow-2xs cursor-pointer"
			>
				<Download class="w-3.5 h-3.5 text-slate-500" />
				<span>Export CSV</span>
			</Button>

			<Button
				type="button"
				size="sm"
				onclick={() => (isBlockModalOpen = true)}
				class="h-9 px-3.5 gap-1.5 text-xs font-bold text-white bg-[#5845eb] hover:bg-[#4936d6] rounded-xl shadow-xs cursor-pointer"
			>
				<Plus class="w-4 h-4 stroke-[2.5]" />
				<span>Block New IP / Phone</span>
			</Button>
		</div>
	</div>

	<!-- 2. KPI Metrics Grid -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		
		<!-- Card 1: Total Blacklisted -->
		<Card class="border-slate-200/90 shadow-2xs bg-gradient-to-br from-white to-slate-50/50 hover:border-slate-300 transition-all">
			<CardContent class="p-4 space-y-2">
				<div class="flex items-center justify-between text-slate-400">
					<span class="text-[11px] font-bold text-slate-500">Total Blacklisted</span>
					<div class="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
						<ShieldAlert class="w-4 h-4" />
					</div>
				</div>
				<div class="flex items-baseline justify-between">
					<span class="text-2xl font-black text-slate-900 font-['Outfit']">{stats.total}</span>
					<span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">Live D1</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 2: Permanent Blocks -->
		<Card class="border-slate-200/90 shadow-2xs bg-gradient-to-br from-white to-rose-50/20 hover:border-rose-200 transition-all">
			<CardContent class="p-4 space-y-2">
				<div class="flex items-center justify-between text-slate-400">
					<span class="text-[11px] font-bold text-slate-500">Permanent Blocks</span>
					<div class="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
						<Lock class="w-4 h-4" />
					</div>
				</div>
				<div class="flex items-baseline justify-between">
					<span class="text-2xl font-black text-rose-600 font-['Outfit']">{stats.permanent}</span>
					<span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">Strict</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 3: Auto-Blocked (Sentinel) -->
		<Card class="border-slate-200/90 shadow-2xs bg-gradient-to-br from-white to-amber-50/20 hover:border-amber-200 transition-all">
			<CardContent class="p-4 space-y-2">
				<div class="flex items-center justify-between text-slate-400">
					<span class="text-[11px] font-bold text-slate-500">Auto Fraud Blocks</span>
					<div class="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
						<Cpu class="w-4 h-4" />
					</div>
				</div>
				<div class="flex items-baseline justify-between">
					<span class="text-2xl font-black text-amber-600 font-['Outfit']">{stats.auto}</span>
					<span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">Automated</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 4: Manual Admin Blocks -->
		<Card class="border-slate-200/90 shadow-2xs bg-gradient-to-br from-white to-indigo-50/20 hover:border-indigo-200 transition-all">
			<CardContent class="p-4 space-y-2">
				<div class="flex items-center justify-between text-slate-400">
					<span class="text-[11px] font-bold text-slate-500">Manual Admin Blocks</span>
					<div class="w-7 h-7 rounded-xl bg-indigo-50 text-[#5845eb] flex items-center justify-center">
						<UserCheck class="w-4 h-4" />
					</div>
				</div>
				<div class="flex items-baseline justify-between">
					<span class="text-2xl font-black text-[#5845eb] font-['Outfit']">{stats.manual}</span>
					<span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">Staff Added</span>
				</div>
			</CardContent>
		</Card>

	</div>

	<!-- 3. Filter Tabs & Search Controls Row -->
	<div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
		
		<!-- Category Filter Chips -->
		<div class="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
			<button
				type="button"
				onclick={() => (filterType = 'all')}
				class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer {filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}"
			>
				All Blocks ({stats.total})
			</button>
			<button
				type="button"
				onclick={() => (filterType = 'permanent')}
				class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer {filterType === 'permanent' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}"
			>
				Permanent ({stats.permanent})
			</button>
			<button
				type="button"
				onclick={() => (filterType = 'auto')}
				class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer {filterType === 'auto' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}"
			>
				Auto-Blocked ({stats.auto})
			</button>
			<button
				type="button"
				onclick={() => (filterType = 'manual')}
				class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer {filterType === 'manual' ? 'bg-white text-[#5845eb] shadow-xs' : 'text-slate-500 hover:text-slate-800'}"
			>
				Manual ({stats.manual})
			</button>
		</div>

		<!-- Search Input & Per-Page Row -->
		<div class="flex items-center gap-3">
			<div class="relative w-full sm:w-72">
				<Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search IP, phone or reason..."
					class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-colors"
				/>
			</div>

			<!-- Per Page Selector -->
			<div class="relative dropdown-container">
				<button
					type="button"
					onclick={() => (isPerPageOpen = !isPerPageOpen)}
					class="h-8 px-3 gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center shadow-2xs cursor-pointer"
					aria-label="Select per page"
				>
					<span>{perPage} / page</span>
					<ChevronDown class="w-3.5 h-3.5 text-slate-400" />
				</button>

				{#if isPerPageOpen}
					<div class="absolute right-0 top-10 w-28 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-30 text-xs font-medium text-slate-700 animate-in fade-in-50">
						{#each [10, 25, 50, 100] as count}
							<button
								type="button"
								onclick={() => {
									perPage = count;
									isPerPageOpen = false;
								}}
								class="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer {perPage === count ? 'text-[#5845eb] font-bold bg-indigo-50/50' : ''}"
							>
								<span>{count}</span>
								{#if perPage === count}
									<Check class="w-3.5 h-3.5 text-[#5845eb]" />
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

	</div>

	<!-- 4. IP Block List Data Table -->
	<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
		
		<!-- Table Top Controls Header -->
		<div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<span class="text-xs font-black text-slate-900 tracking-tight">Active Blacklist</span>
				<Badge variant="outline" class="font-bold text-xs bg-slate-50 text-slate-700">
					Showing {filteredList.length} of {totalBlocked}
				</Badge>
			</div>

			<!-- Right: Pagination -->
			<div class="flex items-center gap-2 text-xs text-slate-500">
				<button
					type="button"
					disabled={currentPage <= 1}
					onclick={() => (currentPage = Math.max(1, currentPage - 1))}
					aria-label="Previous page"
					class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
				>
					<ChevronLeft class="w-4 h-4" />
				</button>

				<div class="w-8 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-800 text-xs shadow-2xs">
					{currentPage}
				</div>

				<span>of {totalPages}</span>

				<button
					type="button"
					disabled={currentPage >= totalPages}
					onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
					aria-label="Next page"
					class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
				>
					<ChevronRight class="w-4 h-4" />
				</button>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs border-collapse">
				
				<!-- Table Header -->
				<thead>
					<tr class="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-600 select-none">
						<!-- Select All Checkbox -->
						<th class="py-3.5 pl-4 pr-2 w-10 text-center">
							<button
								type="button"
								onclick={toggleSelectAll}
								aria-label="Select all rows"
								class="w-4.5 h-4.5 rounded border flex items-center justify-center transition-colors cursor-pointer {selectedIds.length > 0
									? 'bg-[#5845eb] border-[#5845eb] text-white'
									: 'border-slate-300 hover:border-slate-400 bg-white'}"
							>
								{#if isAllSelected}
									<Check class="w-3 h-3 stroke-[3]" />
								{:else if selectedIds.length > 0}
									<div class="w-2 h-0.5 bg-white rounded-full"></div>
								{/if}
							</button>
						</th>

						<th class="py-3.5 px-3 w-12 font-bold">SL</th>
						<th class="py-3.5 px-4 font-bold min-w-[180px]">IP Address</th>
						<th class="py-3.5 px-4 font-bold min-w-[140px]">Phone Number</th>
						<th class="py-3.5 px-4 font-bold min-w-[160px]">Block Type</th>
						<th class="py-3.5 px-4 font-bold min-w-[180px]">Reason & Notes</th>
						<th class="py-3.5 px-4 font-bold min-w-[140px]">Duration</th>
						<th class="py-3.5 px-4 font-bold min-w-[140px]">Date Added</th>
						<th class="py-3.5 px-4 font-bold text-right pr-6 w-28">Actions</th>
					</tr>
				</thead>

				<!-- Table Body -->
				<tbody class="divide-y divide-slate-100 text-slate-700">
					{#if filteredList.length === 0}
						<tr>
							<td colspan="9" class="py-14 text-center text-slate-400">
								<div class="flex flex-col items-center justify-center gap-2">
									<div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
										<ShieldCheck class="w-6 h-6 stroke-[2]" />
									</div>
									<span class="font-bold text-sm text-slate-800">কোনো ব্লক করা আইপি বা ফোন নম্বর নেই</span>
									<p class="text-xs text-slate-400 max-w-sm">
										আপনার স্টোরফ্রন্ট সুরক্ষিত। কোনো ফ্রড বা ক্ষতিকর ট্র্যাফিক শনাক্ত হলে তা এখানে যুক্ত হবে।
									</p>
									<Button
										type="button"
										size="sm"
										onclick={() => (isBlockModalOpen = true)}
										class="mt-2 h-8 px-3 rounded-xl bg-[#5845eb] text-white text-xs font-bold cursor-pointer"
									>
										<Plus class="w-3.5 h-3.5" />
										<span>নতুন আইপি ব্লক করুন</span>
									</Button>
								</div>
							</td>
						</tr>
					{:else}
						{#each filteredList as item (item.id)}
							{@const isSelected = selectedIds.includes(item.id)}
							<tr class="transition-colors hover:bg-slate-50/70 {isSelected ? 'bg-indigo-50/20' : ''}">
								
								<!-- Row Checkbox -->
								<td class="py-3.5 pl-4 pr-2 text-center">
									<button
										type="button"
										onclick={() => toggleSelectRow(item.id)}
										aria-label={`Select ${item.ipAddress}`}
										class="w-4.5 h-4.5 rounded border flex items-center justify-center transition-colors cursor-pointer {isSelected
											? 'bg-[#5845eb] border-[#5845eb] text-white'
											: 'border-slate-300 hover:border-slate-400 bg-white'}"
									>
										{#if isSelected}
											<Check class="w-3 h-3 stroke-[3]" />
										{/if}
									</button>
								</td>

								<!-- SL -->
								<td class="py-3.5 px-3 font-semibold text-slate-400 font-mono text-xs">
									{item.sl}
								</td>

								<!-- IP Address -->
								<td class="py-3.5 px-4 font-mono text-xs text-slate-900 break-all select-all font-bold">
									<div class="flex items-center gap-1.5">
										<Globe class="w-3.5 h-3.5 text-slate-400 shrink-0" />
										<span>{item.ipAddress}</span>
									</div>
								</td>

								<!-- Phone No -->
								<td class="py-3.5 px-4 font-mono text-xs text-slate-800 select-all font-medium">
									{#if item.phoneNo && item.phoneNo !== '-'}
										<div class="flex items-center gap-1.5">
											<Phone class="w-3 h-3 text-slate-400 shrink-0" />
											<span>{item.phoneNo}</span>
										</div>
									{:else}
										<span class="text-slate-300 font-mono">-</span>
									{/if}
								</td>

								<!-- Type (Badge) -->
								<td class="py-3.5 px-4">
									{#if item.type?.toLowerCase().includes('auto')}
										<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
											Auto Sentinel
										</span>
									{:else}
										<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-[#5845eb] border border-indigo-200 whitespace-nowrap">
											Manual Admin
										</span>
									{/if}
								</td>

								<!-- Reason -->
								<td class="py-3.5 px-4 text-xs text-slate-600 max-w-[220px] truncate" title={item.reason}>
									{item.reason}
								</td>

								<!-- Duration -->
								<td class="py-3.5 px-4 text-xs whitespace-nowrap">
									{#if item.isPermanent}
										<Badge variant="outline" class="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">
											Permanent
										</Badge>
									{:else}
										<span class="text-slate-600 font-mono text-[11px] flex items-center gap-1">
											<Clock class="w-3 h-3 text-slate-400" />
											{item.blockUntil}
										</span>
									{/if}
								</td>

								<!-- Date Added -->
								<td class="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap font-mono">
									{item.date}
								</td>

								<!-- Actions -->
								<td class="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
									<div class="flex items-center justify-end gap-1.5">
										<!-- Edit Action -->
										<button
											type="button"
											onclick={() => openEditModal(item)}
											class="p-1.5 rounded-lg text-slate-500 hover:text-[#5845eb] hover:bg-indigo-50 transition-colors cursor-pointer"
											title="Edit Details"
											aria-label="Edit block"
										>
											<Edit3 class="w-3.5 h-3.5" />
										</button>

										<!-- Unblock Action -->
										<button
											type="button"
											onclick={() => unblockItem(item.id, item.ipAddress)}
											class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
											title="Unblock / Remove"
											aria-label={`Unblock ${item.ipAddress}`}
										>
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</div>
								</td>

							</tr>
						{/each}
					{/if}
				</tbody>

			</table>
		</div>
	</div>

</div>

<!-- 5. Manual Block Modal -->
{#if isBlockModalOpen}
	<div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95">
			
			<div class="flex items-center justify-between pb-3 border-b border-slate-100">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
						<ShieldAlert class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900">Block New IP or Phone</h3>
						<p class="text-xs text-slate-500">সন্দেহজনক আইপি অথবা ফোন নম্বর ব্লকলিস্টে যুক্ত করুন</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (isBlockModalOpen = false)}
					class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
					aria-label="Close modal"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<form onsubmit={handleManualBlock} class="space-y-4">
				
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
					<!-- IP Address -->
					<div class="space-y-1.5">
						<label for="block-ip" class="text-xs font-bold text-slate-700 block">IP Address (IPv4 / IPv6)</label>
						<Input
							id="block-ip"
							type="text"
							bind:value={manualIp}
							placeholder="e.g. 103.217.111.246"
							class="text-xs font-mono rounded-xl"
						/>
					</div>

					<!-- Phone Number -->
					<div class="space-y-1.5">
						<label for="block-phone" class="text-xs font-bold text-slate-700 block">Phone Number</label>
						<Input
							id="block-phone"
							type="text"
							bind:value={manualPhone}
							placeholder="e.g. 01811174567"
							class="text-xs font-mono rounded-xl"
						/>
					</div>
				</div>

				<!-- Duration Presets -->
				<div class="space-y-1.5">
					<span class="text-xs font-bold text-slate-700 block">Block Duration</span>
					<div class="grid grid-cols-4 gap-2">
						{#each [
							{ id: 'permanent', label: 'Permanent' },
							{ id: '24h', label: '24 Hours' },
							{ id: '7d', label: '7 Days' },
							{ id: '30d', label: '30 Days' }
						] as dur}
							<button
								type="button"
								onclick={() => (manualDuration = dur.id as any)}
								class="py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer {manualDuration === dur.id
									? 'bg-[#5845eb] text-white border-[#5845eb] shadow-xs'
									: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}"
							>
								{dur.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Reason Presets & Custom -->
				<div class="space-y-1.5">
					<label for="block-reason-select" class="text-xs font-bold text-slate-700 block">Block Reason</label>
					<select
						id="block-reason-select"
						bind:value={manualReason}
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] cursor-pointer"
					>
						{#each COMMON_REASONS as r}
							<option value={r}>{r}</option>
						{/each}
					</select>
				</div>

				<!-- Optional Custom Reason Note -->
				<div class="space-y-1.5">
					<label for="block-reason-custom" class="text-[11px] font-semibold text-slate-500 block">Detailed Notes (Optional)</label>
					<Input
						id="block-reason-custom"
						type="text"
						bind:value={manualReason}
						placeholder="Add specific incident notes..."
						class="text-xs rounded-xl"
					/>
				</div>

				<div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (isBlockModalOpen = false)}
						class="cursor-pointer rounded-xl"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						size="sm"
						disabled={isSaving}
						class="bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer disabled:opacity-50 flex items-center gap-2 rounded-xl"
					>
						{#if isSaving}
							<Loader2 class="w-3.5 h-3.5 animate-spin" />
							<span>ব্লক করা হচ্ছে...</span>
						{:else}
							<span>Confirm Blacklist</span>
						{/if}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- 6. Edit Block Modal -->
{#if editItem}
	<div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
			
			<div class="flex items-center justify-between pb-3 border-b border-slate-100">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#5845eb]">
						<Edit3 class="w-4 h-4" />
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900">Edit Block Record</h3>
						<p class="text-xs text-slate-500">{editItem.ipAddress}</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (editItem = null)}
					class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
					aria-label="Close modal"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<form onsubmit={handleUpdateBlock} class="space-y-4">
				
				<!-- Duration -->
				<div class="space-y-1.5">
					<span class="text-xs font-bold text-slate-700 block">Block Duration</span>
					<div class="grid grid-cols-4 gap-2">
						{#each [
							{ id: 'permanent', label: 'Permanent' },
							{ id: '24h', label: '24 Hours' },
							{ id: '7d', label: '7 Days' },
							{ id: '30d', label: '30 Days' }
						] as dur}
							<button
								type="button"
								onclick={() => (editDuration = dur.id as any)}
								class="py-1.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer {editDuration === dur.id
									? 'bg-[#5845eb] text-white border-[#5845eb] shadow-xs'
									: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}"
							>
								{dur.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Reason -->
				<div class="space-y-1.5">
					<label for="edit-block-reason" class="text-xs font-bold text-slate-700 block">Reason</label>
					<Input
						id="edit-block-reason"
						type="text"
						bind:value={editReason}
						class="text-xs rounded-xl"
					/>
				</div>

				<div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (editItem = null)}
						class="cursor-pointer rounded-xl"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						size="sm"
						disabled={isSaving}
						class="bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold cursor-pointer disabled:opacity-50 flex items-center gap-2 rounded-xl"
					>
						{#if isSaving}
							<Loader2 class="w-3.5 h-3.5 animate-spin" />
							<span>আপডেট হচ্ছে...</span>
						{:else}
							<span>Save Changes</span>
						{/if}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
