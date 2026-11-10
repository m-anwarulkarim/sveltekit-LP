<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		Truck,
		RefreshCw,
		Printer,
		Download,
		Settings,
		CheckCircle2,
		AlertCircle
	} from 'lucide-svelte';
	import { Button } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import {
		CourierStatsCards,
		CourierFilterBar,
		CourierConsignmentsTable,
		RiderManifestModal
	} from './_components';

	let { data }: { data: PageData } = $props();

	const fallbackKpis = {
		dispatchedToday: 0,
		inTransitCount: 0,
		deliveredCount: 0,
		returnedCount: 0,
		holdCount: 0,
		totalConsignments: 0,
		deliverySuccessRate: 100,
		totalCodAmount: 0,
		deliveredCodAmount: 0,
		courierFeeTotal: 0,
		netPayableTotal: 0,
		liveBalance: 0,
		liveBalanceProvider: 'Steadfast',
		liveBalanceSuccess: false,
		liveBalanceMessage: 'ব্যালেন্স সিঙ্ক হয়নি'
	};

	// Reactive states
	let kpis = $state(data?.kpis ?? fallbackKpis);
	let consignments = $state(data?.consignments ?? []);
	let totalMatching = $state(data?.totalMatching ?? 0);

	$effect(() => {
		kpis = data?.kpis ?? fallbackKpis;
		consignments = data?.consignments ?? [];
		totalMatching = data?.totalMatching ?? 0;
	});

	// Filter states initialized from server data
	let selectedDateRange = $state(data?.filters?.dateRange || 'all');
	let selectedProvider = $state(data?.filters?.provider || 'all');
	let selectedStatus = $state(data?.filters?.status || 'all');
	let searchQuery = $state(data?.filters?.search || '');

	// Selection state for batch operations
	let selectedIds = $state<string[]>([]);

	// Modals & Loaders
	let isManifestModalOpen = $state(false);
	let isSyncing = $state(false);
	let isRefreshingBalance = $state(false);

	// Multi-select helpers
	function toggleSelect(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((item) => item !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function selectAll() {
		selectedIds = consignments.map((c) => c.id);
	}

	function clearSelection() {
		selectedIds = [];
	}

	// Filter update handlers with URL update
	function updateFilters(newParams: Record<string, string>) {
		const url = new URL(page.url.href);
		Object.entries(newParams).forEach(([key, val]) => {
			if (!val || val === 'all') {
				url.searchParams.delete(key);
			} else {
				url.searchParams.set(key, val);
			}
		});
		goto(url.toString(), { noScroll: true });
	}

	function handleDateChange(range: string) {
		selectedDateRange = range as any;
		updateFilters({ range });
	}

	function handleProviderChange(provider: string) {
		selectedProvider = provider;
		updateFilters({ provider });
	}

	function handleStatusChange(status: string) {
		selectedStatus = status;
		updateFilters({ status });
	}

	let searchTimeout: any;
	function handleSearchChange(q: string) {
		searchQuery = q;
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			updateFilters({ q });
		}, 350);
	}

	function handleResetFilters() {
		selectedDateRange = 'all';
		selectedProvider = 'all';
		selectedStatus = 'all';
		searchQuery = '';
		goto('/admin/courier');
	}

	// 1-Click Sync Active Consignments
	async function handleSyncStatus() {
		isSyncing = true;
		try {
			const res = await fetch('/api/admin/courier/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					orderIds: selectedIds.length > 0 ? selectedIds : undefined
				})
			});
			const result: any = await res.json();
			if (result?.success) {
				toast.success(result.message || 'কুরিয়ার স্ট্যাটাস সফলভাবে সিঙ্ক হয়েছে!');
				// Refresh page data
				goto(page.url.href, { invalidateAll: true });
			} else {
				toast.error(result?.message || 'সিঙ্ক করতে সমস্যা হয়েছে');
			}
		} catch (err: any) {
			toast.error('সার্ভারে সমস্যা হয়েছে: ' + err.message);
		} finally {
			isSyncing = false;
		}
	}

	// Refresh Live Balance
	async function handleRefreshBalance(silent = false) {
		isRefreshingBalance = true;
		try {
			const res = await fetch('/api/admin/courier/balance');
			const result: any = await res.json();
			if (result?.success && result.balance !== undefined) {
				kpis = {
					...kpis,
					liveBalance: result.balance,
					liveBalanceProvider: result.provider,
					liveBalanceSuccess: true
				};
				if (!silent) toast.success('কুরিয়ার লাইভ ব্যালেন্স আপডেট হয়েছে!');
			} else {
				kpis = {
					...kpis,
					liveBalanceSuccess: false,
					liveBalanceMessage: result?.message || 'ব্যালেন্স আপডেট করা যায়নি'
				};
				if (!silent) toast.error(result?.message || 'ব্যালেন্স আপডেট করা যায়নি');
			}
		} catch (err) {
			if (!silent) toast.error('ব্যালেন্স ফেচ করতে সমস্যা হয়েছে');
		} finally {
			isRefreshingBalance = false;
		}
	}

	onMount(() => {
		handleRefreshBalance(true);
	});

	// CSV Export
	function handleExportCsv() {
		const targetList = selectedIds.length > 0
			? consignments.filter((c) => selectedIds.includes(c.id))
			: consignments;

		if (targetList.length === 0) {
			toast.error('এক্সপোর্ট করার মতো কোনো পার্সেল নেই');
			return;
		}

		const headers = [
			'Order Number',
			'Customer Name',
			'Customer Phone',
			'Address',
			'Courier Provider',
			'Tracking Code',
			'Consignment ID',
			'COD Amount',
			'Courier Cost',
			'Net Payable',
			'Courier Status',
			'Date'
		];

		const rows = targetList.map((item) => [
			item.orderNumber,
			`"${(item.customerName || '').replace(/"/g, '""')}"`,
			item.customerPhone,
			`"${(item.shippingAddress || '').replace(/"/g, '""')}"`,
			item.courierProvider,
			item.trackingCode,
			item.consignmentId,
			item.codAmount,
			item.courierCost,
			item.netPayable,
			item.courierStatus,
			item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : ''
		]);

		const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', `courier_manifest_${new Date().toISOString().split('T')[0]}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		toast.success(`${targetList.length}টি পার্সেলের CSV সফলভাবে ডাউনলোড হয়েছে!`);
	}
</script>

<svelte:head>
	<title>কুরিয়ার হাব ও পেমেন্ট ট্র্যাকিং | AURA Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
		<div class="space-y-1">
			<div class="flex items-center gap-2.5">
				<div class="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shadow-2xs">
					<Truck class="w-5 h-5 stroke-[2.3]" />
				</div>
				<div>
					<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
						কুরিয়ার হাব ও পেমেন্ট ট্র্যাকিং (Courier Hub)
					</h1>
					<p class="text-xs text-slate-500 font-medium">
						দৈনিক কুরিয়ার বুকিং, ইন-ট্রানজিট ডেলিভারি, ওয়ালেট ব্যালেন্স ও পেমেন্ট রিকনসিলিয়েশন
					</p>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-wrap items-center gap-2">
			<!-- 1-Click Sync Status -->
			<Button
				type="button"
				variant="blue"
				size="sm"
				onclick={handleSyncStatus}
				disabled={isSyncing}
				class="text-xs font-bold gap-1.5 rounded-xl cursor-pointer shadow-xs bg-[#5845eb] hover:bg-[#4836d4] text-white"
			>
				<RefreshCw class="w-3.5 h-3.5 {isSyncing ? 'animate-spin' : ''}" />
				<span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'স্ট্যাটাস সিঙ্ক করুন'}</span>
			</Button>

			<!-- Print Rider Manifest -->
			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={() => (isManifestModalOpen = true)}
				class="text-xs font-bold gap-1.5 rounded-xl cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50"
			>
				<Printer class="w-3.5 h-3.5 text-slate-500" />
				<span>পিকআপ চালান (Print)</span>
			</Button>

			<!-- CSV Export -->
			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={handleExportCsv}
				class="text-xs font-bold gap-1.5 rounded-xl cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50"
			>
				<Download class="w-3.5 h-3.5 text-slate-500" />
				<span>এক্সপোর্ট (CSV)</span>
			</Button>

			<!-- Courier Gateway Settings -->
			<a
				href="/admin/settings/courier"
				class="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer inline-flex items-center justify-center"
				title="কুরিয়ার API সেটিংস"
			>
				<Settings class="w-4 h-4" />
			</a>
		</div>
	</div>

	<!-- 1. Top KPI & Financial Stats Cards -->
	<CourierStatsCards
		{kpis}
		onRefreshBalance={handleRefreshBalance}
		{isRefreshingBalance}
	/>

	<!-- 2. Filters & Search Bar -->
	<CourierFilterBar
		bind:selectedDateRange
		bind:selectedProvider
		bind:selectedStatus
		bind:searchQuery
		totalCount={totalMatching}
		onDateChange={handleDateChange}
		onProviderChange={handleProviderChange}
		onStatusChange={handleStatusChange}
		onSearchChange={handleSearchChange}
		onResetFilters={handleResetFilters}
	/>

	<!-- 3. Consignments & Tracking Table -->
	<CourierConsignmentsTable
		{consignments}
		bind:selectedIds
		onToggleSelect={toggleSelect}
		onSelectAll={selectAll}
		onClearSelection={clearSelection}
	/>
</div>

<!-- Printable Rider Manifest Modal -->
<RiderManifestModal
	bind:isOpen={isManifestModalOpen}
	consignments={selectedIds.length > 0 ? consignments.filter((c) => selectedIds.includes(c.id)) : consignments}
	onClose={() => (isManifestModalOpen = false)}
/>

