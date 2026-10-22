<script lang="ts">
	import { Button, Input, Card } from '#lib/components/ui';
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
		X
	} from 'lucide-svelte';

	let searchQuery = $state('');
	let perPage = $state(10);
	let isPerPageOpen = $state(false);
	let currentPage = $state(1);
	let totalPages = $state(4496);
	let totalBlocked = $state(44958);

	let selectedIds = $state<string[]>([]);
	let toastMessage = $state<string | null>(null);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => (toastMessage = null), 3000);
	}

	// Manual Block Modal State
	let isBlockModalOpen = $state(false);
	let manualIp = $state('');
	let manualPhone = $state('');
	let manualReason = $state('Suspected Fraudulent Orders');

	// Initial Block List Data (Exact Match with Reference Screenshot)
	let blockedList = $state([
		{
			id: '1',
			sl: 1,
			ipAddress: '2404:1c40:45b:9e22:18dd:246a:9f7c:92a2',
			deviceId: '-',
			phoneNo: '01811174567',
			type: 'Auto Block After 1 Orders',
			blockUntil: 'Oct 11, 2026, 5:14:56 AM',
			date: 'Oct 11, 2026, 12:14:56 AM'
		},
		{
			id: '2',
			sl: 2,
			ipAddress: '103.217.111.246',
			deviceId: '-',
			phoneNo: '01974142304',
			type: 'Auto Block After 1 Orders',
			blockUntil: 'Oct 11, 2026, 5:03:40 AM',
			date: 'Oct 11, 2026, 12:03:40 AM'
		},
		{
			id: '3',
			sl: 3,
			ipAddress: '103.75.138.13',
			deviceId: '-',
			phoneNo: '01856996410',
			type: 'Auto Block After 1 Orders',
			blockUntil: 'Oct 11, 2026, 4:52:13 AM',
			date: 'Oct 10, 2026, 11:52:13 PM'
		},
		{
			id: '4',
			sl: 4,
			ipAddress: '103.167.17.53',
			deviceId: '-',
			phoneNo: '+8801763172390',
			type: 'Auto Block After 1 Orders',
			blockUntil: 'Oct 11, 2026, 4:40:07 AM',
			date: 'Oct 10, 2026, 11:40:07 PM'
		},
		{
			id: '5',
			sl: 5,
			ipAddress: '103.159.72.71',
			deviceId: '-',
			phoneNo: '01862907227',
			type: 'Auto Block After 1 Orders',
			blockUntil: 'Oct 11, 2026, 4:38:24 AM',
			date: 'Oct 10, 2026, 11:38:24 PM'
		},
		{
			id: '6',
			sl: 6,
			ipAddress: '203.190.10.74',
			deviceId: '-',
			phoneNo: '01727492677',
			type: 'Auto Block After 1 Orders',
			blockUntil: 'Oct 11, 2026, 4:18:07 AM',
			date: 'Oct 10, 2026, 11:18:07 PM'
		},
		{
			id: '7',
			sl: 7,
			ipAddress: '103.134.88.19',
			deviceId: '-',
			phoneNo: '01711223344',
			type: 'Auto Block After 1 Orders',
			blockUntil: 'Oct 11, 2026, 3:55:12 AM',
			date: 'Oct 10, 2026, 10:55:12 PM'
		},
		{
			id: '8',
			sl: 8,
			ipAddress: '118.179.223.45',
			deviceId: '-',
			phoneNo: '01988776655',
			type: 'Manual Block',
			blockUntil: 'Permanent',
			date: 'Oct 10, 2026, 09:30:15 PM'
		}
	]);

	// Filtered list by Search
	let filteredList = $derived(
		blockedList.filter(
			(item) =>
				item.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.phoneNo.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

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

	function unblockItem(id: string, ip: string) {
		blockedList = blockedList.filter((item) => item.id !== id);
		selectedIds = selectedIds.filter((item) => item !== id);
		totalBlocked = Math.max(0, totalBlocked - 1);
		showToast(`আইপি '${ip}' সফলভাবে আনব্লক করা হয়েছে!`);
	}

	function handleManualBlock(e: Event) {
		e.preventDefault();
		if (!manualIp.trim() && !manualPhone.trim()) return;

		const newItem = {
			id: String(Date.now()),
			sl: blockedList.length + 1,
			ipAddress: manualIp || '103.45.12.89',
			deviceId: '-',
			phoneNo: manualPhone || '-',
			type: 'Manual Admin Block',
			blockUntil: 'Oct 20, 2026, 12:00:00 AM',
			date: new Date().toLocaleDateString('en-US', {
				month: 'short',
				day: '2-digit',
				year: 'numeric'
			}) + ', ' + new Date().toLocaleTimeString('en-US')
		};

		blockedList = [newItem, ...blockedList];
		totalBlocked += 1;
		isBlockModalOpen = false;
		manualIp = '';
		manualPhone = '';
		showToast('আইপি/ফোন সফলভাবে ব্লক লিস্টে যুক্ত করা হয়েছে!');
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
	<title>IP Block List | AURA Enterprise</title>
</svelte:head>

<div class="space-y-4 max-w-[1400px] mx-auto pb-16">
	
	<!-- Toast Message -->
	{#if toastMessage}
		<div class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
			<CheckCircle2 class="w-4 h-4 text-emerald-400" />
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Header Title -->
	<div class="flex items-center justify-between gap-4 pt-1">
		<h1 class="text-xl font-bold text-slate-900 tracking-tight">IP Block List</h1>

		<Button
			type="button"
			size="sm"
			onclick={() => (isBlockModalOpen = true)}
			class="h-9 px-3.5 gap-1.5 text-xs font-bold text-white bg-[#5845eb] hover:bg-[#4936d6] rounded-xl shadow-xs"
		>
			<Plus class="w-4 h-4 stroke-[2.5]" />
			<span>Block New IP</span>
		</Button>
	</div>

	<!-- Search & Per-Page Controls Row -->
	<div class="flex items-center justify-between gap-3">
		
		<!-- Search Input with Attached Purple Search Button -->
		<div class="flex items-center w-full max-w-md">
			<Input
				type="text"
				bind:value={searchQuery}
				placeholder="Search by IP or Phone"
				class="h-10 text-xs rounded-r-none rounded-l-xl bg-slate-50/70 border-slate-200 border-r-0 placeholder:text-slate-400 focus-visible:ring-[#5845eb]"
			/>
			<button
				type="button"
				class="h-10 px-4 bg-[#cfc7fa] hover:bg-[#b8abf8] text-[#5845eb] rounded-r-xl border border-l-0 border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
				title="Search"
			>
				<Search class="w-4 h-4 stroke-[2.5]" />
			</button>
		</div>

		<!-- Right: Per Page Select (e.g. ▾ 10) -->
		<div class="relative dropdown-container">
			<button
				type="button"
				onclick={() => (isPerPageOpen = !isPerPageOpen)}
				class="h-9 px-3 gap-1.5 text-xs font-bold text-white rounded-xl bg-[#5845eb] hover:bg-[#4936d6] flex items-center shadow-xs cursor-pointer"
			>
				<ChevronDown class="w-3.5 h-3.5" />
				<span>{perPage}</span>
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
							class="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between {perPage === count ? 'text-[#5845eb] font-bold bg-indigo-50/50' : ''}"
						>
							<span>{count}</span>
							{#if perPage === count}
								<Check class="w-3.5 h-3.5" />
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

	</div>

	<!-- Tab & Pagination Header Bar -->
	<div class="flex items-center justify-between border-b border-slate-200 pb-2 pt-2">
		
		<!-- Left: IP Block List Tab with Count Badge and Active Underline -->
		<div class="flex items-center gap-2 border-b-2 border-[#5845eb] pb-2 -mb-2 px-1">
			<span class="text-xs font-bold text-[#5845eb]">IP Block List</span>
			<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#5845eb] text-white">
				{totalBlocked}
			</span>
		</div>

		<!-- Right: Pagination (< [ 1 ] of 4496 >) -->
		<div class="flex items-center gap-2 text-xs text-slate-500">
			<button
				type="button"
				disabled={currentPage <= 1}
				onclick={() => (currentPage = Math.max(1, currentPage - 1))}
				class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
				class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
			>
				<ChevronRight class="w-4 h-4" />
			</button>
		</div>

	</div>

	<!-- IP Block List Data Table -->
	<div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs border-collapse">
				
				<!-- Table Header -->
				<thead>
					<tr class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-600 select-none">
						<!-- Select All Checkbox -->
						<th class="py-3.5 pl-4 pr-2 w-10 text-center">
							<button
								type="button"
								onclick={toggleSelectAll}
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
						<th class="py-3.5 px-4 font-bold min-w-[200px]">IP Address</th>
						<th class="py-3.5 px-3 font-bold w-20">Device ID</th>
						<th class="py-3.5 px-4 font-bold min-w-[130px]">Phone No</th>
						<th class="py-3.5 px-4 font-bold min-w-[180px]">Type</th>
						<th class="py-3.5 px-4 font-bold min-w-[180px]">Block Until</th>
						<th class="py-3.5 px-4 font-bold min-w-[180px]">
							<div class="flex items-center gap-1.5">
								<span>Date</span>
								<Calendar class="w-3.5 h-3.5 text-purple-600" />
							</div>
						</th>
						<th class="py-3.5 px-4 font-bold text-right w-24">Common.Act</th>
					</tr>
				</thead>

				<!-- Table Body -->
				<tbody class="divide-y divide-slate-100 text-slate-700">
					{#each filteredList as item (item.id)}
						{@const isSelected = selectedIds.includes(item.id)}
						<tr class="transition-colors hover:bg-slate-50/70 {isSelected ? 'bg-indigo-50/20' : ''}">
							
							<!-- Row Checkbox -->
							<td class="py-3.5 pl-4 pr-2 text-center">
								<button
									type="button"
									onclick={() => toggleSelectRow(item.id)}
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
							<td class="py-3.5 px-3 font-semibold text-slate-500 font-mono text-xs">
								{item.sl}
							</td>

							<!-- IP Address -->
							<td class="py-3.5 px-4 font-mono text-xs text-slate-800 break-all select-all">
								{item.ipAddress}
							</td>

							<!-- Device ID -->
							<td class="py-3.5 px-3 text-slate-400">
								{item.deviceId}
							</td>

							<!-- Phone No -->
							<td class="py-3.5 px-4 font-mono text-xs text-slate-800 font-medium select-all">
								{item.phoneNo}
							</td>

							<!-- Type (Orange Pill Badge) -->
							<td class="py-3.5 px-4">
								<span class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-orange-50/80 text-orange-600 border border-orange-200/70 whitespace-nowrap">
									{item.type}
								</span>
							</td>

							<!-- Block Until -->
							<td class="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
								{item.blockUntil}
							</td>

							<!-- Date -->
							<td class="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
								{item.date}
							</td>

							<!-- Common.Act (Red Trash Unblock Action) -->
							<td class="py-3.5 px-4 text-right">
								<button
									type="button"
									onclick={() => unblockItem(item.id, item.ipAddress)}
									class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors ml-auto cursor-pointer"
									title="Unblock / Delete"
								>
									<Trash2 class="w-4 h-4" />
								</button>
							</td>

						</tr>
					{/each}
				</tbody>

			</table>
		</div>
	</div>

</div>

<!-- Manual Block Modal -->
{#if isBlockModalOpen}
	<div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
			<div class="flex items-center justify-between pb-3 border-b border-slate-100">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
						<ShieldAlert class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900">Block New IP / Phone</h3>
						<p class="text-xs text-slate-500">সন্দেহজনক আইপি অথবা ফোন নাম্বার ব্লক করুন</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (isBlockModalOpen = false)}
					class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<form onsubmit={handleManualBlock} class="space-y-4">
				<div class="space-y-1.5">
					<label for="block-ip" class="text-xs font-bold text-slate-700">IP Address (IPv4 or IPv6)</label>
					<Input
						id="block-ip"
						type="text"
						bind:value={manualIp}
						placeholder="e.g. 103.217.111.246"
						class="text-xs font-mono"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="block-phone" class="text-xs font-bold text-slate-700">Customer Phone Number</label>
					<Input
						id="block-phone"
						type="text"
						bind:value={manualPhone}
						placeholder="e.g. 01811174567"
						class="text-xs font-mono"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="block-reason" class="text-xs font-bold text-slate-700">Reason</label>
					<Input
						id="block-reason"
						type="text"
						bind:value={manualReason}
						class="text-xs"
					/>
				</div>

				<div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (isBlockModalOpen = false)}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						size="sm"
						class="bg-rose-600 hover:bg-rose-700 text-white font-bold"
					>
						Confirm Block
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
