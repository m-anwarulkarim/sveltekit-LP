<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Users,
		PhoneCall,
		Award,
		ShieldCheck,
		ShieldAlert,
		AlertTriangle,
		Search,
		Plus,
		X,
		Copy,
		Check,
		Ban,
		CheckCircle2,
		ShoppingBag,
		DollarSign,
		MessageSquare,
		ExternalLink,
		FileText,
		Edit,
		Trash2,
		RefreshCw,
		Download,
		Truck,
		Package
	} from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';
	import { toast } from 'svelte-sonner';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Reactive States
	let searchQuery = $state('');
	let selectedTab = $state<'all' | 'vip' | 'safe' | 'high_risk' | 'banned'>('all');
	let copiedEmail = $state<string | null>(null);
	let isSyncing = $state(false);

	// Modals States
	let isCustomerModalOpen = $state(false);
	let customerModalMode = $state<'create' | 'edit'>('create');
	let activeCustomer = $state<any>({
		id: '',
		name: '',
		phone: '',
		email: '',
		address: '',
		city: 'ঢাকা',
		district: 'ঢাকা',
		riskLevel: 'safe',
		internalNotes: ''
	});

	// Notes Modal
	let selectedCustomerNotes = $state<{ id: string; name: string; notes: string } | null>(null);

	// Orders History Modal
	let ordersModalCustomer = $state<any | null>(null);
	let customerOrders = $state<any[]>([]);
	let isLoadingOrders = $state(false);

	// Form message watcher
	$effect(() => {
		if (form?.message) {
			if (form.success) {
				toast.success(form.message);
			} else {
				toast.error(form.message);
			}
		}
	});

	function formatTaka(amount: number) {
		return '৳' + (amount || 0).toLocaleString('en-US');
	}

	function copyToClipboard(text: string) {
		if (typeof navigator !== 'undefined') {
			navigator.clipboard.writeText(text);
			copiedEmail = text;
			toast.success(`কপি করা হয়েছে: ${text}`);
			setTimeout(() => {
				if (copiedEmail === text) copiedEmail = null;
			}, 2000);
		}
	}

	function getCleanPhone(phone: string): string {
		const digits = (phone || '').replace(/[^0-9]/g, '');
		if (digits.startsWith('880')) return digits;
		if (digits.startsWith('0')) return '88' + digits;
		return '880' + digits;
	}

	// Filtered Customers derived reactively
	let filteredCustomers = $derived.by(() => {
		let list = data.customers || [];

		// Search filter
		if (searchQuery.trim()) {
			const term = searchQuery.toLowerCase().trim();
			list = list.filter(
				(c: any) =>
					(c.name || '').toLowerCase().includes(term) ||
					(c.phone || '').includes(term) ||
					(c.address || '').toLowerCase().includes(term) ||
					(c.city || '').toLowerCase().includes(term) ||
					(c.email || '').toLowerCase().includes(term)
			);
		}

		// Tab filter
		if (selectedTab === 'vip') {
			list = list.filter((c: any) => (c.totalSpent || 0) >= 5000 || (c.totalOrders || 0) >= 4);
		} else if (selectedTab === 'safe') {
			list = list.filter((c: any) => c.riskLevel === 'safe' && !c.isBanned);
		} else if (selectedTab === 'high_risk') {
			list = list.filter((c: any) => c.riskLevel === 'high_risk' && !c.isBanned);
		} else if (selectedTab === 'banned') {
			list = list.filter((c: any) => c.isBanned);
		}

		return list;
	});

	// Open Modal for Create
	function openCreateModal() {
		customerModalMode = 'create';
		activeCustomer = {
			id: '',
			name: '',
			phone: '',
			email: '',
			address: '',
			city: 'ঢাকা',
			district: 'ঢাকা',
			riskLevel: 'safe',
			internalNotes: ''
		};
		isCustomerModalOpen = true;
	}

	// Open Modal for Edit
	function openEditModal(cust: any) {
		customerModalMode = 'edit';
		activeCustomer = {
			id: cust.id,
			name: cust.name || '',
			phone: cust.phone || '',
			email: cust.email || '',
			address: cust.address || '',
			city: cust.city || 'ঢাকা',
			district: cust.district || cust.city || 'ঢাকা',
			riskLevel: cust.riskLevel || 'safe',
			internalNotes: cust.internalNotes || ''
		};
		isCustomerModalOpen = true;
	}

	// Fetch & View Customer Orders History
	async function viewCustomerOrders(cust: any) {
		ordersModalCustomer = cust;
		isLoadingOrders = true;
		customerOrders = [];

		try {
			const res = await fetch(`/api/admin/customers/orders?phone=${encodeURIComponent(cust.phone)}`);
			const json = await res.json();
			if (json.success) {
				customerOrders = json.orders || [];
			} else {
				toast.error(json.message || 'অর্ডার হিস্টোরি লোড করা যায়নি');
			}
		} catch (e: any) {
			console.error('Failed to load customer orders:', e);
			toast.error('অর্ডার হিস্টোরি লোড করতে সার্ভার সমস্যা হয়েছে');
		} finally {
			isLoadingOrders = false;
		}
	}

	// Export Customer List as CSV
	function exportCustomersCSV() {
		const customers = filteredCustomers;
		if (customers.length === 0) {
			toast.error('এক্সপোর্ট করার মতো কোনো গ্রাহক নেই!');
			return;
		}

		const headers = ['নাম', 'মোবাইল নম্বর', 'ইমেইল', 'ঠিকানা', 'শহর/জেলা', 'মোট অর্ডার', 'মোট ক্রয় (টাকা)', 'সাকসেস রেট (%)', 'রিস্ক লেভেল', 'ব্ল্যাকলিস্ট'];
		const rows = customers.map((c: any) => [
			`"${(c.name || '').replace(/"/g, '""')}"`,
			`"${c.phone || ''}"`,
			`"${c.email || ''}"`,
			`"${(c.address || '').replace(/"/g, '""')}"`,
			`"${c.city || ''}"`,
			c.totalOrders || 0,
			c.totalSpent || 0,
			`${c.successRate || 100}%`,
			c.riskLevel || 'safe',
			c.isBanned ? 'ব্যানড' : 'সক্রিয়'
		]);

		const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', `customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success('গ্রাহক তালিকা সফলভাবে CSV ফাইল হিসেবে ডাউনলোড হয়েছে!');
	}

	const avatarColors = [
		'bg-blue-100 text-blue-700 border-blue-200',
		'bg-emerald-100 text-emerald-700 border-emerald-200',
		'bg-purple-100 text-purple-700 border-purple-200',
		'bg-amber-100 text-amber-700 border-amber-200',
		'bg-pink-100 text-pink-700 border-pink-200',
		'bg-cyan-100 text-cyan-700 border-cyan-200'
	];

	function getAvatarColor(name: string): string {
		let hash = 0;
		for (let i = 0; i < (name || '').length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return avatarColors[Math.abs(hash) % avatarColors.length];
	}
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
	<!-- Top Telemetry & KPI Cards (Real Data) -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<!-- Total Customers -->
		<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
			<div>
				<p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট নিবন্ধিত ক্রেতা</p>
				<h3 class="text-2xl font-black text-slate-900 mt-1 font-['Outfit']">{data.telemetry?.totalCustomers ?? 0} জন</h3>
				<span class="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
					<CheckCircle2 class="w-3.5 h-3.5" /> ১০০% লাইভ ডাটাবেজ
				</span>
			</div>
			<div class="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb]">
				<Users class="w-6 h-6" />
			</div>
		</div>

		<!-- VIP Club -->
		<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
			<div>
				<p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">ভিআইপি বায়ার ক্লাব</p>
				<h3 class="text-2xl font-black text-amber-600 mt-1 font-['Outfit']">{data.telemetry?.vipCustomers ?? 0} জন</h3>
				<span class="text-[11px] text-amber-700/80 font-medium mt-1 inline-block">
					৳৫,০০০+ কেনাকাটা করেছেন
				</span>
			</div>
			<div class="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
				<Award class="w-6 h-6" />
			</div>
		</div>

		<!-- Repeat Revenue -->
		<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
			<div>
				<p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট সংগৃহীত সেলস</p>
				<h3 class="text-2xl font-black text-slate-900 mt-1 font-['Outfit']">{formatTaka(data.telemetry?.totalSpentAll ?? 0)}</h3>
				<span class="text-[11px] text-slate-500 font-medium mt-1 inline-block">
					গড় ক্রয়: {formatTaka(data.telemetry?.avgSpentPerCustomer ?? 0)}
				</span>
			</div>
			<div class="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
				<DollarSign class="w-6 h-6" />
			</div>
		</div>

		<!-- Risk & Fraud Warning -->
		<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
			<div>
				<p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">হাই-রিস্ক / ব্ল্যাকলিস্ট</p>
				<h3 class="text-2xl font-black text-rose-600 mt-1 font-['Outfit']">{data.telemetry?.highRiskCount ?? 0} জন</h3>
				<span class="text-[11px] text-rose-600 font-medium mt-1 inline-block">
					সতর্ক ডেলিভারি আবশ্যক
				</span>
			</div>
			<div class="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
				<ShieldAlert class="w-6 h-6" />
			</div>
		</div>
	</div>

	<!-- Main Card: Header & Search Filters -->
	<div class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
		<!-- Header Action Bar -->
		<div class="p-5 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
			<div>
				<h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
					<Users class="w-5 h-5 text-[#5845eb]" />
					<span>গ্রাহক ও সিআরএম ম্যানেজমেন্ট</span>
				</h2>
				<p class="text-xs text-slate-500 mt-0.5">
					গ্রাহকের পারচেজ হিস্টোরি, ডেলিভারি সাফল্য রেট, রিস্ক লেভেল ও কুইক কল/হোয়াটসঅ্যাপ একশন
				</p>
			</div>

			<div class="flex items-center gap-2 flex-wrap">
				<!-- Sync from Orders Button -->
				<form
					method="POST"
					action="?/syncOrders"
					use:enhance={() => {
						isSyncing = true;
						return async ({ update }) => {
							await update();
							isSyncing = false;
						};
					}}
				>
					<button
						type="submit"
						disabled={isSyncing}
						class="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
						title="রিয়েল অর্ডারের তথ্য থেকে কাস্টমারদের স্ট্যাটস রিফ্রেশ ও সিঙ্ক করুন"
					>
						<RefreshCw class="w-3.5 h-3.5 {isSyncing ? 'animate-spin text-indigo-600' : ''}" />
						<span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'অর্ডার সিঙ্ক'}</span>
					</button>
				</form>

				<!-- CSV Export Button -->
				<button
					type="button"
					onclick={exportCustomersCSV}
					class="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
					title="মার্কেটিং ও SMS ক্যাম্পেইনের জন্য কাস্টমার ডাটা CSV ফাইল হিসেবে নামিয়ে নিন"
				>
					<Download class="w-3.5 h-3.5" />
					<span>এক্সপোর্ট CSV</span>
				</button>

				<!-- Add Customer Button -->
				<button
					type="button"
					onclick={openCreateModal}
					class="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
				>
					<Plus class="w-4 h-4" />
					<span>নতুন কাস্টমার</span>
				</button>
			</div>
		</div>

		<!-- Search Bar and Filter Tabs -->
		<div class="p-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
			<!-- Search Box -->
			<div class="relative flex-1 max-w-md">
				<Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="নাম, ফোন নম্বর, এলাকা, ইমেইল বা শহর দিয়ে খুঁজুন..."
					class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5845eb]/20 focus:border-[#5845eb] transition-all shadow-2xs"
				/>
				{#if searchQuery}
					<button
						onclick={() => (searchQuery = '')}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
					>
						<X class="w-3.5 h-3.5" />
					</button>
				{/if}
			</div>

			<!-- Filter Tabs -->
			<div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
				<button
					type="button"
					onclick={() => (selectedTab = 'all')}
					class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer {selectedTab ===
					'all'
						? 'bg-slate-900 text-white shadow-xs'
						: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}"
				>
					সব ({data.customers?.length ?? 0})
				</button>

				<button
					type="button"
					onclick={() => (selectedTab = 'vip')}
					class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 {selectedTab ===
					'vip'
						? 'bg-amber-500 text-white shadow-xs'
						: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}"
				>
					<Award class="w-3.5 h-3.5" />
					<span>ভিআইপি ক্লাব</span>
				</button>

				<button
					type="button"
					onclick={() => (selectedTab = 'safe')}
					class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 {selectedTab ===
					'safe'
						? 'bg-emerald-600 text-white shadow-xs'
						: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}"
				>
					<ShieldCheck class="w-3.5 h-3.5" />
					<span>নিরাপদ</span>
				</button>

				<button
					type="button"
					onclick={() => (selectedTab = 'high_risk')}
					class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 {selectedTab ===
					'high_risk'
						? 'bg-rose-600 text-white shadow-xs'
						: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}"
				>
					<AlertTriangle class="w-3.5 h-3.5" />
					<span>হাই-রিস্ক</span>
				</button>

				<button
					type="button"
					onclick={() => (selectedTab = 'banned')}
					class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 {selectedTab ===
					'banned'
						? 'bg-slate-800 text-rose-300 shadow-xs'
						: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}"
				>
					<Ban class="w-3.5 h-3.5" />
					<span>ব্যানড</span>
				</button>
			</div>
		</div>

		<!-- Customers Data Table -->
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead>
					<tr class="border-b border-slate-200/80 bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider">
						<th class="py-3 px-4">গ্রাহকের প্রোফাইল</th>
						<th class="py-3 px-4">যোগাযোগ ও ঠিকানা</th>
						<th class="py-3 px-4 text-center">অর্ডার ও সাকসেস রেট</th>
						<th class="py-3 px-4 text-right">লাইফটাইম ক্রয়</th>
						<th class="py-3 px-4 text-center">নিরাপত্তা / রিস্ক</th>
						<th class="py-3 px-4 text-center">একশন</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#if filteredCustomers.length === 0}
						<tr>
							<td colspan="6" class="py-14 text-center text-slate-400">
								<Users class="w-8 h-8 mx-auto mb-2 text-slate-300" />
								<p class="font-medium text-slate-700">কোনো গ্রাহকের তথ্য পাওয়া যায়নি</p>
								<p class="text-[11px] text-slate-400 mt-1">নতুন গ্রাহক যুক্ত করুন অথবা "অর্ডার সিঙ্ক" বাটনে ক্লিক করে অর্ডার ডাটা লোড করুন।</p>
							</td>
						</tr>
					{/if}

					{#each filteredCustomers as cust (cust.id)}
						<tr class="hover:bg-slate-50/80 transition-colors {cust.isBanned ? 'bg-rose-50/30' : ''}">
							<!-- Customer Profile -->
							<td class="py-3.5 px-4">
								<div class="flex items-center gap-3">
									<div
										class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border {getAvatarColor(
											cust.name
										)}"
									>
										{(cust.name || 'ক').slice(0, 2)}
									</div>
									<div>
										<div class="flex items-center gap-1.5">
											<span class="font-bold text-slate-900 text-[13px]">{cust.name}</span>
											{#if (cust.totalSpent || 0) >= 5000 || (cust.totalOrders || 0) >= 4}
												<span
													class="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5"
												>
													<Award class="w-2.5 h-2.5" /> VIP
												</span>
											{/if}
										</div>
										<p class="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
											{cust.email || 'ইমেইল নেই'}
										</p>
									</div>
								</div>
							</td>

							<!-- Contact & Address -->
							<td class="py-3.5 px-4">
								<div class="space-y-1">
									<div class="flex items-center gap-2">
										<span class="font-mono font-bold text-slate-800">{cust.phone}</span>
										<!-- Direct Call -->
										<a
											href="tel:{cust.phone}"
											title="সরাসরি কল দিন"
											class="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
										>
											<PhoneCall class="w-3 h-3" />
										</a>
										<!-- WhatsApp Chat -->
										<a
											href="https://wa.me/{getCleanPhone(cust.phone)}"
											target="_blank"
											rel="noopener noreferrer"
											title="WhatsApp এ সরাসরি মেসেজ পাঠান"
											class="p-1 rounded bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors cursor-pointer"
										>
											<MessageSquare class="w-3 h-3" />
										</a>
									</div>
									<p class="text-slate-600 text-[11px] max-w-[200px] truncate" title={cust.address}>
										{cust.address}
									</p>
									<span class="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
										{cust.city || 'ঢাকা'}
									</span>
								</div>
							</td>

							<!-- Orders & Success Rate -->
							<td class="py-3.5 px-4 text-center">
								<div class="inline-flex flex-col items-center">
									<button
										type="button"
										onclick={() => viewCustomerOrders(cust)}
										class="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer flex items-center gap-1"
										title="এই গ্রাহকের সমস্ত অর্ডার হিস্টোরি বিস্তারিত দেখুন"
									>
										<span>{cust.totalOrders ?? 0} টি অর্ডার</span>
										<ExternalLink class="w-3 h-3 text-indigo-400" />
									</button>
									<span class="text-[10px] text-slate-500 mt-0.5">
										({cust.deliveredOrders ?? 0} ডেলিভার্ড / {cust.cancelledOrders ?? 0} বাতিল)
									</span>
									<!-- Success Rate Chip -->
									<div class="mt-1.5 flex items-center gap-1">
										<span
											class="px-2 py-0.5 rounded-full text-[10px] font-black {cust.successRate >= 80
												? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
												: cust.successRate >= 50
													? 'bg-amber-50 text-amber-700 border border-amber-200'
													: 'bg-rose-50 text-rose-700 border border-rose-200'}"
										>
											{cust.successRate}% সাফল্য
										</span>
									</div>
								</div>
							</td>

							<!-- Total Spent -->
							<td class="py-3.5 px-4 text-right">
								<span class="font-black text-slate-900 text-sm font-['Outfit'] block">
									{formatTaka(cust.totalSpent)}
								</span>
								<span class="text-[10px] text-slate-400 mt-0.5 block">
									গড়: {formatTaka(cust.totalOrders > 0 ? Math.round(cust.totalSpent / cust.totalOrders) : cust.totalSpent)}
								</span>
							</td>

							<!-- Risk / Security -->
							<td class="py-3.5 px-4 text-center">
								{#if cust.isBanned}
									<div class="inline-flex flex-col items-center gap-1">
										<span
											class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-rose-300 border border-slate-700 flex items-center gap-1"
										>
											<Ban class="w-3 h-3 text-rose-400" />
											<span>ব্ল্যাকলিস্টেড</span>
										</span>
										{#if cust.banReason}
											<span class="text-[10px] text-rose-600 max-w-[120px] truncate" title={cust.banReason}>
												{cust.banReason}
											</span>
										{/if}
									</div>
								{:else if cust.riskLevel === 'high_risk'}
									<div class="inline-flex flex-col items-center gap-1">
										<span
											class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"
										>
											<ShieldAlert class="w-3 h-3" />
											<span>হাই-রিস্ক</span>
										</span>
										<span class="text-[9px] text-rose-500 font-semibold">অগ্রিম পেমেন্ট রিকমেন্ডেড</span>
									</div>
								{:else if cust.riskLevel === 'moderate'}
									<span
										class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 inline-flex"
									>
										<AlertTriangle class="w-3 h-3" />
										<span>সতর্কতা</span>
									</span>
								{:else}
									<span
										class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 inline-flex"
									>
										<ShieldCheck class="w-3 h-3" />
										<span>ভেরিফাইড ও নিরাপদ</span>
									</span>
								{/if}
							</td>

							<!-- Actions -->
							<td class="py-3.5 px-4 text-center">
								<div class="flex items-center justify-center gap-1.5">
									<!-- Order History Button -->
									<button
										type="button"
										onclick={() => viewCustomerOrders(cust)}
										title="অর্ডার হিস্টোরি দেখুন"
										class="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
									>
										<Package class="w-4 h-4" />
									</button>

									<!-- Edit Customer Modal Button -->
									<button
										type="button"
										onclick={() => openEditModal(cust)}
										title="গ্রাহকের তথ্য এডিট করুন"
										class="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
									>
										<Edit class="w-4 h-4" />
									</button>

									<!-- Internal Notes Dialog Button -->
									<button
										type="button"
										onclick={() =>
											(selectedCustomerNotes = {
												id: cust.id,
												name: cust.name,
												notes: cust.internalNotes || ''
											})}
										title="সাপোর্ট নোট দেখুন বা লিখুন"
										class="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
									>
										<FileText class="w-4 h-4" />
									</button>

									<!-- Toggle Ban / Unban Form -->
									<form method="POST" action="?/toggleBan" use:enhance class="inline-block">
										<input type="hidden" name="id" value={cust.id} />
										<input
											type="hidden"
											name="banReason"
											value={cust.isBanned ? '' : 'অ্যাডমিন কর্তৃক নিরাপত্তা তালিকায় রাখা হয়েছে'}
										/>
										<button
											type="submit"
											title={cust.isBanned ? 'গ্রাহককে আনব্যান করুন' : 'গ্রাহককে ব্যান বা ব্লক করুন'}
											class="p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer {cust.isBanned
												? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
												: 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200'}"
										>
											{#if cust.isBanned}
												<CheckCircle2 class="w-3.5 h-3.5" />
											{:else}
												<Ban class="w-3.5 h-3.5" />
											{/if}
										</button>
									</form>

									<!-- Delete Customer Form -->
									<form
										method="POST"
										action="?/deleteCustomer"
										use:enhance={({ cancel }) => {
											if (!confirm(`আপনি কি নিশ্চিত যে গ্রাহক "${cust.name}" এর রেকর্ড মুছে ফেলতে চান?`)) {
												cancel();
											}
										}}
										class="inline-block"
									>
										<input type="hidden" name="id" value={cust.id} />
										<button
											type="submit"
											title="গ্রাহক প্রোফাইল মুছে ফেলুন"
											class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
										>
											<Trash2 class="w-4 h-4" />
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Newsletter Subscribers Card -->
	<div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
		<div class="p-5 border-b border-slate-200/80 flex items-center justify-between">
			<div>
				<h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
					<Award class="w-4 h-4 text-indigo-600" />
					<span>নিবন্ধিত ভিআইপি নিউজলেটার সাবস্ক্রাইবার</span>
				</h3>
				<p class="text-xs text-slate-500 mt-0.5">
					ওয়েবসাইটের ফুটার থেকে সাবস্ক্রাইব করা নিয়মিত পাঠক ও ক্রেতা তালিকা
				</p>
			</div>

			<span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#5845eb] border border-indigo-200">
				{(data.newsletter || []).length} জন গ্রাহক
			</span>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead>
					<tr class="border-b border-slate-200/80 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
						<th class="py-3 px-4">ইমেইল ঠিকানা</th>
						<th class="py-3 px-4">স্ট্যাটাস</th>
						<th class="py-3 px-4 text-right">যোগদানের সময়</th>
						<th class="py-3 px-4 text-center">একশন</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#if (data.newsletter || []).length === 0}
						<tr>
							<td colspan="4" class="py-8 text-center text-slate-400">কোনো নিউজলেটার সাবস্ক্রাইবার নেই।</td>
						</tr>
					{/if}
					{#each data.newsletter || [] as sub}
						<tr class="hover:bg-slate-50/60 transition-colors">
							<td class="py-3 px-4 font-mono font-bold text-slate-800">
								{sub.email}
							</td>
							<td class="py-3 px-4">
								<span
									class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
								>
									সক্রিয় ভিআইপি
								</span>
							</td>
							<td class="py-3 px-4 text-right text-slate-400 font-mono">
								{new Date(sub.createdAt).toLocaleDateString('bn-BD', {
									year: 'numeric',
									month: 'short',
									day: 'numeric'
								})}
							</td>
							<td class="py-3 px-4 text-center">
								<div class="flex items-center justify-center gap-1.5">
									<!-- Copy Email -->
									<button
										type="button"
										onclick={() => copyToClipboard(sub.email)}
										class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
									>
										{#if copiedEmail === sub.email}
											<Check class="w-3 h-3 text-emerald-600" />
											<span class="text-emerald-700">কপি হয়েছে</span>
										{:else}
											<Copy class="w-3 h-3 text-slate-500" />
											<span>ইমেইল কপি</span>
										{/if}
									</button>

									<!-- Delete Subscriber -->
									<form
										method="POST"
										action="?/deleteNewsletter"
										use:enhance={({ cancel }) => {
											if (!confirm('আপনি কি নিশ্চিত যে এই সাবস্ক্রাইবার মুছে ফেলতে চান?')) cancel();
										}}
										class="inline-block"
									>
										<input type="hidden" name="id" value={sub.id} />
										<button
											type="submit"
											title="সাবস্ক্রিপশন বাতিল করুন"
											class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
										>
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Add / Edit Customer Modal -->
	{#if isCustomerModalOpen}
		<div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
			<div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
				<div class="p-5 border-b border-slate-200 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="w-8 h-8 rounded-lg bg-indigo-50 text-[#5845eb] flex items-center justify-center">
							{#if customerModalMode === 'edit'}
								<Edit class="w-4 h-4" />
							{:else}
								<Plus class="w-4 h-4" />
							{/if}
						</div>
						<h3 class="text-base font-bold text-slate-900">
							{customerModalMode === 'edit' ? 'গ্রাহকের তথ্য এডিট করুন' : 'নতুন গ্রাহক প্রোফাইল যুক্ত করুন'}
						</h3>
					</div>
					<button
						onclick={() => (isCustomerModalOpen = false)}
						class="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
					>
						<X class="w-5 h-5" />
					</button>
				</div>

				<form
					method="POST"
					action="?/saveCustomer"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							isCustomerModalOpen = false;
						};
					}}
					class="p-6 space-y-4"
				>
					{#if customerModalMode === 'edit'}
						<input type="hidden" name="id" value={activeCustomer.id} />
					{/if}

					<div>
						<label for="cust-name" class="block text-xs font-bold text-slate-700 mb-1">গ্রাহকের পূর্ণ নাম *</label>
						<input
							id="cust-name"
							name="name"
							bind:value={activeCustomer.name}
							required
							placeholder="যেমন: তানভীর আহমেদ"
							class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5845eb]/20 focus:border-[#5845eb] focus:outline-none"
						/>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div>
							<label for="cust-phone" class="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর *</label>
							<input
								id="cust-phone"
								name="phone"
								bind:value={activeCustomer.phone}
								required
								placeholder="01XXXXXXXXX"
								class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#5845eb]/20 focus:border-[#5845eb] focus:outline-none"
							/>
						</div>
						<div>
							<label for="cust-email" class="block text-xs font-bold text-slate-700 mb-1">ইমেইল (ঐচ্ছিক)</label>
							<input
								id="cust-email"
								name="email"
								type="email"
								bind:value={activeCustomer.email}
								placeholder="customer@email.com"
								class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5845eb]/20 focus:border-[#5845eb] focus:outline-none"
							/>
						</div>
					</div>

					<div>
						<label for="cust-address" class="block text-xs font-bold text-slate-700 mb-1">ডেলিভারি ঠিকানা *</label>
						<input
							id="cust-address"
							name="address"
							bind:value={activeCustomer.address}
							required
							placeholder="হাউজ, রোড, এলাকা..."
							class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5845eb]/20 focus:border-[#5845eb] focus:outline-none"
						/>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div>
							<label for="cust-city" class="block text-xs font-bold text-slate-700 mb-1">জেলা / শহর</label>
							<input
								id="cust-city"
								name="city"
								bind:value={activeCustomer.city}
								class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5845eb]/20 focus:border-[#5845eb] focus:outline-none"
							/>
						</div>
						<div>
							<label for="cust-risk" class="block text-xs font-bold text-slate-700 mb-1">প্রাথমিক রিস্ক স্ট্যাটাস</label>
							<select
								id="cust-risk"
								name="riskLevel"
								bind:value={activeCustomer.riskLevel}
								class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5845eb]/20 focus:border-[#5845eb] focus:outline-none"
							>
								<option value="safe">নিরাপদ (Safe)</option>
								<option value="moderate">সতর্কতা (Moderate)</option>
								<option value="high_risk">হাই-রিস্ক (High Risk)</option>
							</select>
						</div>
					</div>

					<div>
						<label for="cust-notes" class="block text-xs font-bold text-slate-700 mb-1">অভ্যন্তরীণ নোট (ঐচ্ছিক)</label>
						<textarea
							id="cust-notes"
							name="internalNotes"
							rows="2"
							bind:value={activeCustomer.internalNotes}
							placeholder="গ্রাহক সম্পর্কে যেকোনো স্পেশাল নোট..."
							class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5845eb]/20 focus:border-[#5845eb] focus:outline-none"
						></textarea>
					</div>

					<div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
						<button
							type="button"
							onclick={() => (isCustomerModalOpen = false)}
							class="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
						>
							বাতিল
						</button>
						<button
							type="submit"
							class="px-5 py-2 bg-[#5845eb] hover:bg-[#4936d6] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
						>
							{customerModalMode === 'edit' ? 'আপডেট করুন' : 'সেভ করুন'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Customer Orders History Modal -->
	{#if ordersModalCustomer}
		<div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
			<div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
				<!-- Header -->
				<div class="p-5 border-b border-slate-200 flex items-center justify-between shrink-0">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-indigo-50 text-[#5845eb] flex items-center justify-center">
							<Package class="w-5 h-5" />
						</div>
						<div>
							<h3 class="text-base font-bold text-slate-900">{ordersModalCustomer.name} - অর্ডার হিস্টোরি</h3>
							<p class="text-xs text-slate-500 font-mono mt-0.5">
								{ordersModalCustomer.phone} • মোট ব্যয়: {formatTaka(ordersModalCustomer.totalSpent)}
							</p>
						</div>
					</div>
					<button
						onclick={() => (ordersModalCustomer = null)}
						class="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
					>
						<X class="w-5 h-5" />
					</button>
				</div>

				<!-- Orders Body -->
				<div class="p-5 overflow-y-auto flex-1 space-y-3">
					{#if isLoadingOrders}
						<div class="py-12 text-center text-slate-400">
							<RefreshCw class="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
							<p class="text-xs">অর্ডার হিস্টোরি লোড হচ্ছে...</p>
						</div>
					{:else if customerOrders.length === 0}
						<div class="py-12 text-center text-slate-400">
							<ShoppingBag class="w-8 h-8 mx-auto mb-2 text-slate-300" />
							<p class="font-medium text-slate-600">কোনো অর্ডার পাওয়া যায়নি</p>
							<p class="text-[11px] text-slate-400 mt-1">এই মোবাইল নম্বর দিয়ে এখনো কোনো লাইভ অর্ডার রেজিস্টার করা হয়নি।</p>
						</div>
					{:else}
						{#each customerOrders as ord}
							<div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
								<div class="flex items-center justify-between gap-3 mb-2">
									<div class="flex items-center gap-2">
										<a
											href="/admin/orders/{ord.id}"
											target="_blank"
											class="font-mono font-bold text-sm text-indigo-600 hover:underline flex items-center gap-1"
										>
											<span>{ord.orderNumber || ord.id}</span>
											<ExternalLink class="w-3 h-3 text-indigo-400" />
										</a>
										<span class="text-[11px] text-slate-400 font-mono">
											{new Date(ord.createdAt).toLocaleDateString('bn-BD', {
												year: 'numeric',
												month: 'short',
												day: 'numeric'
											})}
										</span>
									</div>

									<div class="flex items-center gap-2">
										<span
											class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider {ord.status ===
											'delivered'
												? 'bg-emerald-100 text-emerald-800'
												: ord.status === 'confirmed'
													? 'bg-blue-100 text-blue-800'
													: ord.status === 'processing'
														? 'bg-indigo-100 text-indigo-800'
														: ord.status === 'shipped'
															? 'bg-purple-100 text-purple-800'
															: ord.status === 'cancelled'
																? 'bg-rose-100 text-rose-800'
																: 'bg-amber-100 text-amber-800'}"
										>
											{ord.status}
										</span>
										<span class="font-black text-slate-900 font-['Outfit'] text-sm">
											{formatTaka(ord.total)}
										</span>
									</div>
								</div>

								<!-- Items List -->
								{#if Array.isArray(ord.items) && ord.items.length > 0}
									<div class="mt-2 pt-2 border-t border-slate-200/60 text-xs space-y-1">
										{#each ord.items as itm}
											<div class="flex items-center justify-between text-slate-700">
												<span class="truncate max-w-[340px]">
													• {itm.name || itm.title || 'পণ্য'} × {itm.quantity || 1}
												</span>
												<span class="font-mono font-semibold">{formatTaka(itm.price * (itm.quantity || 1))}</span>
											</div>
										{/each}
									</div>
								{/if}

								<!-- Delivery Details -->
								<div class="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
									<span class="truncate max-w-[320px]">{ord.shippingAddress}</span>
									{#if ord.trackingCode}
										<span class="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
											{ord.courierProvider || 'Courier'}: {ord.trackingCode}
										</span>
									{/if}
								</div>
							</div>
						{/each}
					{/if}
				</div>

				<!-- Footer -->
				<div class="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
					<button
						type="button"
						onclick={() => (ordersModalCustomer = null)}
						class="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
					>
						বন্ধ করুন
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Customer Notes Modal -->
	{#if selectedCustomerNotes}
		<div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
			<div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
				<div class="p-5 border-b border-slate-200 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<FileText class="w-5 h-5 text-[#5845eb]" />
						<div>
							<h3 class="text-sm font-bold text-slate-900">{selectedCustomerNotes.name}</h3>
							<p class="text-[11px] text-slate-500">অভ্যন্তরীণ সাপোর্ট ও কাস্টমার নোট</p>
						</div>
					</div>
					<button
						onclick={() => (selectedCustomerNotes = null)}
						class="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
					>
						<X class="w-5 h-5" />
					</button>
				</div>

				<form
					method="POST"
					action="?/updateNotes"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							selectedCustomerNotes = null;
						};
					}}
					class="p-5 space-y-4"
				>
					<input type="hidden" name="id" value={selectedCustomerNotes.id} />

					<div>
						<label for="notes-area" class="block text-xs font-bold text-slate-700 mb-1.5">সাপোর্ট নোট</label>
						<textarea
							id="notes-area"
							name="internalNotes"
							rows="4"
							bind:value={selectedCustomerNotes.notes}
							placeholder="যেমন: কাস্টমার বিকেলে কল দিতে বলেছেন, কিংবা কুরিয়ার পছন্দ..."
							class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#5845eb]/20 focus:border-[#5845eb] focus:outline-none"
						></textarea>
					</div>

					<div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
						<button
							type="button"
							onclick={() => (selectedCustomerNotes = null)}
							class="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
						>
							বন্ধ করুন
						</button>
						<button
							type="submit"
							class="px-5 py-2 bg-[#5845eb] hover:bg-[#4936d6] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
						>
							নোট সংরক্ষণ করুন
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>
