<script lang="ts">
	import type {
		CourierPaymentItem,
		CourierReturnRequestItem,
		CourierParcelStateItem
	} from '#lib/server/services/courier.service';
	import {
		Wallet,
		RotateCcw,
		Layers,
		RefreshCw,
		AlertCircle,
		ChevronLeft,
		ChevronRight,
		Inbox,
		Copy,
		Settings
	} from 'lucide-svelte';
	import { Button } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';

	type TabId = 'payments' | 'returns' | 'states';

	const TABS: { id: TabId; label: string; icon: any }[] = [
		{ id: 'payments', label: 'পেমেন্ট হিস্ট্রি', icon: Wallet },
		{ id: 'returns', label: 'রিটার্ন রিকোয়েস্ট', icon: RotateCcw },
		{ id: 'states', label: 'পার্সেল স্টেট', icon: Layers }
	];

	let activeTab = $state<TabId>('payments');
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);

	let payments = $state<CourierPaymentItem[]>([]);
	let returns = $state<CourierReturnRequestItem[]>([]);
	let states = $state<CourierParcelStateItem[]>([]);

	let currentPage = $state(1);
	let lastPage = $state(1);
	let totalRecords = $state(0);

	// Tabs already fetched, so switching back does not re-hit the courier API.
	let loadedTabs = $state<Set<TabId>>(new Set());

	async function loadTab(tab: TabId, pageNumber = 1, force = false) {
		if (isLoading) return;
		if (!force && loadedTabs.has(tab) && pageNumber === currentPage) return;

		isLoading = true;
		errorMessage = null;

		try {
			const res = await fetch(`/api/admin/courier/account?tab=${tab}&page=${pageNumber}`);
			const result: any = await res.json();

			if (!result?.success) {
				errorMessage = result?.message || 'কুরিয়ার থেকে তথ্য আনা যায়নি';
				if (tab === 'payments') payments = [];
				if (tab === 'returns') returns = [];
				if (tab === 'states') states = [];
				return;
			}

			if (tab === 'payments') payments = result.items ?? [];
			if (tab === 'returns') returns = result.items ?? [];
			if (tab === 'states') states = result.items ?? [];

			currentPage = result.currentPage ?? pageNumber;
			lastPage = result.lastPage ?? 1;
			totalRecords = result.total ?? (result.items?.length ?? 0);

			loadedTabs = new Set([...loadedTabs, tab]);
		} catch (err) {
			console.error('Courier account report fetch failed:', err);
			errorMessage = 'সার্ভারে সংযোগ করা যায়নি';
		} finally {
			isLoading = false;
		}
	}

	function switchTab(tab: TabId) {
		if (tab === activeTab) return;
		activeTab = tab;
		currentPage = 1;
		if (!loadedTabs.has(tab)) loadTab(tab, 1);
	}

	function goToPage(target: number) {
		if (target < 1 || target > lastPage || isLoading) return;
		loadTab(activeTab, target, true);
	}

	function formatTaka(amount: number): string {
		return '৳ ' + Math.round(amount || 0).toLocaleString('en-IN');
	}

	function formatDate(value?: string): string {
		if (!value) return '—';
		const d = new Date(value);
		if (isNaN(d.getTime())) return value;
		return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function copyText(text: string, label: string) {
		if (!text) return;
		navigator.clipboard.writeText(text);
		toast.success(`${label} কপি করা হয়েছে!`);
	}

	function statusClass(status?: string): string {
		const s = (status || '').toLowerCase();
		if (s.includes('paid') || s.includes('success') || s.includes('complete') || s.includes('approve')) {
			return 'bg-emerald-50 text-emerald-700 border-emerald-200';
		}
		if (s.includes('pending') || s.includes('process') || s.includes('review')) {
			return 'bg-amber-50 text-amber-700 border-amber-200';
		}
		if (s.includes('cancel') || s.includes('reject') || s.includes('fail')) {
			return 'bg-rose-50 text-rose-700 border-rose-200';
		}
		return 'bg-slate-100 text-slate-600 border-slate-200';
	}

	let isEmpty = $derived.by(() => {
		if (activeTab === 'payments') return payments.length === 0;
		if (activeTab === 'returns') return returns.length === 0;
		return states.length === 0;
	});

	$effect(() => {
		if (!loadedTabs.has('payments')) loadTab('payments', 1);
	});
</script>

<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
		<div class="flex items-center gap-2.5">
			<div class="w-9 h-9 rounded-xl bg-indigo-50 text-[#5845eb] flex items-center justify-center">
				<Wallet class="w-4.5 h-4.5 stroke-[2.3]" />
			</div>
			<div>
				<h2 class="text-sm font-black text-slate-900 tracking-tight">কুরিয়ার অ্যাকাউন্ট রিপোর্ট</h2>
				<p class="text-[11px] text-slate-500">
					কুরিয়ার থেকে সরাসরি আনা পেমেন্ট, রিটার্ন ও পার্সেলের লাইভ তথ্য
				</p>
			</div>
		</div>

		<Button
			type="button"
			variant="outline"
			size="sm"
			onclick={() => loadTab(activeTab, currentPage, true)}
			disabled={isLoading}
			class="text-xs font-bold gap-1.5 rounded-xl cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0"
		>
			<RefreshCw class="w-3.5 h-3.5 text-slate-500 {isLoading ? 'animate-spin' : ''}" />
			<span>{isLoading ? 'লোড হচ্ছে...' : 'রিফ্রেশ'}</span>
		</Button>
	</div>

	<!-- Tabs -->
	<div class="flex items-center gap-1 px-3 pt-3 overflow-x-auto no-scrollbar">
		{#each TABS as tab (tab.id)}
			{@const Icon = tab.icon}
			<button
				type="button"
				onclick={() => switchTab(tab.id)}
				class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer
					{activeTab === tab.id
						? 'bg-[#5845eb] text-white shadow-xs'
						: 'text-slate-600 hover:bg-slate-100'}"
			>
				<Icon class="w-3.5 h-3.5" />
				<span>{tab.label}</span>
			</button>
		{/each}
	</div>

	<div class="p-4 sm:p-5">
		{#if isLoading}
			<div class="py-12 text-center space-y-2">
				<RefreshCw class="w-6 h-6 mx-auto text-slate-300 animate-spin" />
				<p class="text-xs text-slate-500 font-medium">কুরিয়ার থেকে তথ্য আনা হচ্ছে...</p>
			</div>
		{:else if errorMessage}
			<div class="py-10 px-4 text-center space-y-2.5 bg-slate-50 rounded-2xl border border-slate-200">
				<AlertCircle class="w-7 h-7 mx-auto text-slate-400 stroke-[1.5]" />
				<p class="text-xs font-bold text-slate-700">তথ্য আনা যায়নি</p>
				<p class="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">{errorMessage}</p>
				<a
					href="/admin/settings/courier"
					class="inline-flex items-center gap-1 text-[11px] font-bold text-[#5845eb] hover:underline"
				>
					<Settings class="w-3 h-3" />
					<span>কুরিয়ার সেটিংস দেখুন</span>
				</a>
			</div>
		{:else if isEmpty}
			<div class="py-12 text-center space-y-2">
				<Inbox class="w-7 h-7 mx-auto text-slate-300 stroke-[1.5]" />
				<p class="text-xs font-semibold text-slate-600">কোনো রেকর্ড পাওয়া যায়নি</p>
				<p class="text-[11px] text-slate-400">
					{activeTab === 'payments'
						? 'কুরিয়ার এখনো কোনো পেমেন্ট পাঠায়নি'
						: activeTab === 'returns'
							? 'কোনো রিটার্ন রিকোয়েস্ট নেই'
							: 'কোনো সক্রিয় পার্সেল নেই'}
				</p>
			</div>

		<!-- PAYMENTS -->
		{:else if activeTab === 'payments'}
			<div class="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
				<table class="w-full text-xs min-w-[640px]">
					<thead>
						<tr class="text-left text-slate-500 border-b border-slate-100">
							<th class="pb-2.5 font-bold">তারিখ</th>
							<th class="pb-2.5 font-bold">ট্রানজেকশন</th>
							<th class="pb-2.5 font-bold">মাধ্যম</th>
							<th class="pb-2.5 font-bold text-center">পার্সেল</th>
							<th class="pb-2.5 font-bold text-right">পরিমাণ</th>
							<th class="pb-2.5 font-bold text-right">স্ট্যাটাস</th>
						</tr>
					</thead>
					<tbody>
						{#each payments as p (p.id)}
							<tr class="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
								<td class="py-3 text-slate-600 font-medium whitespace-nowrap">{formatDate(p.createdAt)}</td>
								<td class="py-3">
									{#if p.transactionId}
										<button
											type="button"
											onclick={() => copyText(p.transactionId!, 'ট্রানজেকশন আইডি')}
											class="inline-flex items-center gap-1 font-mono text-[11px] text-slate-700 hover:text-[#5845eb] cursor-pointer"
											title="কপি করুন"
										>
											<span>{p.transactionId}</span>
											<Copy class="w-3 h-3 opacity-50" />
										</button>
									{:else}
										<span class="text-slate-400">—</span>
									{/if}
									{#if p.accountNumber}
										<div class="text-[10px] text-slate-400 font-mono mt-0.5">{p.accountNumber}</div>
									{/if}
								</td>
								<td class="py-3 text-slate-600">{p.paymentMethod || '—'}</td>
								<td class="py-3 text-center font-mono font-bold text-slate-700">
									{p.totalParcels || '—'}
								</td>
								<td class="py-3 text-right font-mono font-black text-emerald-600 whitespace-nowrap">
									{formatTaka(p.amount)}
								</td>
								<td class="py-3 text-right">
									{#if p.status}
										<span class="px-2 py-0.5 rounded-full border text-[10px] font-bold {statusClass(p.status)}">
											{p.status}
										</span>
									{:else}
										<span class="text-slate-400">—</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

		<!-- RETURNS -->
		{:else if activeTab === 'returns'}
			<div class="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
				<table class="w-full text-xs min-w-[640px]">
					<thead>
						<tr class="text-left text-slate-500 border-b border-slate-100">
							<th class="pb-2.5 font-bold">তারিখ</th>
							<th class="pb-2.5 font-bold">ইনভয়েস</th>
							<th class="pb-2.5 font-bold">ট্র্যাকিং</th>
							<th class="pb-2.5 font-bold">কারণ</th>
							<th class="pb-2.5 font-bold text-right">স্ট্যাটাস</th>
						</tr>
					</thead>
					<tbody>
						{#each returns as r (r.id)}
							<tr class="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
								<td class="py-3 text-slate-600 font-medium whitespace-nowrap">{formatDate(r.createdAt)}</td>
								<td class="py-3 font-mono text-[11px] text-slate-700">{r.invoice || '—'}</td>
								<td class="py-3">
									{#if r.trackingCode}
										<button
											type="button"
											onclick={() => copyText(r.trackingCode!, 'ট্র্যাকিং কোড')}
											class="inline-flex items-center gap-1 font-mono text-[11px] text-slate-700 hover:text-[#5845eb] cursor-pointer"
											title="কপি করুন"
										>
											<span>{r.trackingCode}</span>
											<Copy class="w-3 h-3 opacity-50" />
										</button>
									{:else}
										<span class="text-slate-400">—</span>
									{/if}
								</td>
								<td class="py-3 text-slate-600 max-w-[220px] truncate" title={r.reason}>
									{r.reason || '—'}
								</td>
								<td class="py-3 text-right">
									{#if r.status}
										<span class="px-2 py-0.5 rounded-full border text-[10px] font-bold {statusClass(r.status)}">
											{r.status}
										</span>
									{:else}
										<span class="text-slate-400">—</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

		<!-- PARCEL STATES -->
		{:else}
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
				{#each states as s (s.state)}
					<div class="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-1">
						<p class="text-[11px] font-bold text-slate-500 truncate" title={s.label}>{s.label}</p>
						<p class="text-xl font-black font-mono text-slate-900">{s.count}</p>
						{#if s.codAmount > 0}
							<p class="text-[11px] font-bold text-emerald-600 font-mono">{formatTaka(s.codAmount)}</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<!-- Pagination -->
		{#if !isLoading && !errorMessage && !isEmpty && activeTab !== 'states' && lastPage > 1}
			<div class="flex items-center justify-between gap-3 pt-4 mt-3 border-t border-slate-100">
				<p class="text-[11px] text-slate-500 font-medium">
					পৃষ্ঠা {currentPage} / {lastPage}
					{#if totalRecords > 0}· মোট {totalRecords}টি{/if}
				</p>
				<div class="flex items-center gap-1.5">
					<button
						type="button"
						onclick={() => goToPage(currentPage - 1)}
						disabled={currentPage <= 1}
						class="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
						aria-label="আগের পৃষ্ঠা"
					>
						<ChevronLeft class="w-4 h-4" />
					</button>
					<button
						type="button"
						onclick={() => goToPage(currentPage + 1)}
						disabled={currentPage >= lastPage}
						class="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
						aria-label="পরের পৃষ্ঠা"
					>
						<ChevronRight class="w-4 h-4" />
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
