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
		FileText
	} from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Local reactive states
	let searchQuery = $state('');
	let selectedTab = $state<'all' | 'vip' | 'safe' | 'high_risk' | 'banned'>('all');
	let isAddModalOpen = $state(false);
	let selectedCustomerNotes = $state<{ id: string; name: string; notes: string } | null>(null);
	let copiedEmail = $state<string | null>(null);

	// Toast state
	let toastMessage = $state<string | null>(null);
	let toastType = $state<'success' | 'error'>('success');

	$effect(() => {
		if (form?.message) {
			toastMessage = form.message;
			toastType = form.success ? 'success' : 'error';
			const timer = setTimeout(() => {
				toastMessage = null;
			}, 3500);
			return () => clearTimeout(timer);
		}
	});

	function showToast(msg: string, type: 'success' | 'error' = 'success') {
		toastMessage = msg;
		toastType = type;
		setTimeout(() => {
			toastMessage = null;
		}, 3500);
	}

	function formatTaka(amount: number) {
		return '৳' + (amount || 0).toLocaleString('en-US');
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		copiedEmail = text;
		showToast(`কপি করা হয়েছে: ${text}`);
		setTimeout(() => {
			if (copiedEmail === text) copiedEmail = null;
		}, 2000);
	}

	function getCleanPhone(phone: string): string {
		const digits = phone.replace(/[^0-9]/g, '');
		if (digits.startsWith('880')) return digits;
		if (digits.startsWith('0')) return '88' + digits;
		return '880' + digits;
	}

	// Filtered customers computed reactively
	let filteredCustomers = $derived.by(() => {
		let list = data.customers || [];

		// Filter by search term
		if (searchQuery.trim()) {
			const term = searchQuery.toLowerCase().trim();
			list = list.filter(
				(c) =>
					c.name.toLowerCase().includes(term) ||
					c.phone.includes(term) ||
					c.address.toLowerCase().includes(term) ||
					c.city.toLowerCase().includes(term)
			);
		}

		// Filter by tab
		if (selectedTab === 'vip') {
			list = list.filter((c) => c.totalSpent >= 5000 || c.totalOrders >= 4);
		} else if (selectedTab === 'safe') {
			list = list.filter((c) => c.riskLevel === 'safe' && !c.isBanned);
		} else if (selectedTab === 'high_risk') {
			list = list.filter((c) => c.riskLevel === 'high_risk' && !c.isBanned);
		} else if (selectedTab === 'banned') {
			list = list.filter((c) => c.isBanned);
		}

		return list;
	});

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
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return avatarColors[Math.abs(hash) % avatarColors.length];
	}
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
	<!-- Toast Notification -->
	{#if toastMessage}
		<div
			class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-medium transition-all transform animate-in fade-in slide-in-from-bottom-3 {toastType ===
			'success'
				? 'bg-slate-900 text-white border border-slate-800'
				: 'bg-rose-600 text-white'}"
		>
			{#if toastType === 'success'}
				<CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0" />
			{:else}
				<AlertTriangle class="w-5 h-5 text-amber-300 shrink-0" />
			{/if}
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Top Telemetry & KPI Cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<!-- Total Customers -->
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
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
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
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
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
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
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
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
	<div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
		<!-- Header Action Bar -->
		<div class="p-5 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
			<div>
				<h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
					<Users class="w-5 h-5 text-[#5845eb]" />
					<span>গ্রাহক ও সিআরএম ম্যানেজমেন্ট</span>
				</h2>
				<p class="text-xs text-slate-500 mt-0.5">
					গ্রাহকের পারচেজ হিস্টোরি, ডেলিভারি সাফল্য রেট, রিস্ক লেভেল ও কুইক কল/হোয়াটসঅ্যাপ একশন
				</p>
			</div>

			<div class="flex items-center gap-3">
				<button
					type="button"
					onclick={() => (isAddModalOpen = true)}
					class="inline-flex items-center gap-2 px-4 py-2 bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
				>
					<Plus class="w-4 h-4" />
					<span>নতুন কাস্টমার যুক্ত করুন</span>
				</button>
			</div>
		</div>

		<!-- Search Bar and Filter Tabs -->
		<div class="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
			<!-- Search Box -->
			<div class="relative flex-1 max-w-md">
				<Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="নাম, ফোন নম্বর, এলাকা বা শহর দিয়ে খুঁজুন..."
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
					<tr class="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider">
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
								<p class="font-medium">কোনো গ্রাহকের তথ্য খুঁজে পাওয়া যায়নি।</p>
								<p class="text-[11px] text-slate-400 mt-1">অন্য কোনো ফিল্টার বা অনুসন্ধান শব্দ চেষ্টা করুন।</p>
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
										{cust.name.slice(0, 2)}
									</div>
									<div>
										<div class="flex items-center gap-1.5">
											<span class="font-bold text-slate-900 text-[13px]">{cust.name}</span>
											{#if cust.totalSpent >= 5000 || cust.totalOrders >= 4}
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
											class="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
										>
											<PhoneCall class="w-3 h-3" />
										</a>
										<!-- WhatsApp Chat -->
										<a
											href="https://wa.me/{getCleanPhone(cust.phone)}"
											target="_blank"
											rel="noopener noreferrer"
											title="WhatsApp এ মেসেজ পাঠান"
											class="p-1 rounded bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
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
									<span class="font-bold text-slate-900">
										{cust.totalOrders} টি অর্ডার
									</span>
									<span class="text-[10px] text-slate-500 mt-0.5">
										({cust.deliveredOrders} ডেলিভার্ড / {cust.cancelledOrders} বাতিল)
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
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Newsletter Subscribers Card -->
	<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
		<div class="p-5 border-b border-slate-200 flex items-center justify-between">
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
					<tr class="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
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
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Add Customer Modal -->
	{#if isAddModalOpen}
		<div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
			<div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
				<div class="p-5 border-b border-slate-200 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="w-8 h-8 rounded-lg bg-indigo-50 text-[#5845eb] flex items-center justify-center">
							<Plus class="w-4 h-4" />
						</div>
						<h3 class="text-base font-bold text-slate-900">নতুন গ্রাহক প্রোফাইল যুক্ত করুন</h3>
					</div>
					<button
						onclick={() => (isAddModalOpen = false)}
						class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
					>
						<X class="w-5 h-5" />
					</button>
				</div>

				<form
					method="POST"
					action="?/createCustomer"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							isAddModalOpen = false;
						};
					}}
					class="p-6 space-y-4"
				>
					<div>
						<label for="cust-name" class="block text-xs font-bold text-slate-700 mb-1">গ্রাহকের পূর্ণ নাম *</label>
						<input
							id="cust-name"
							name="name"
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
								value="ঢাকা"
								class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5845eb]/20 focus:border-[#5845eb] focus:outline-none"
							/>
						</div>
						<div>
							<label for="cust-risk" class="block text-xs font-bold text-slate-700 mb-1">প্রাথমিক রিস্ক স্ট্যাটাস</label>
							<select
								id="cust-risk"
								name="riskLevel"
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
							placeholder="গ্রাহক সম্পর্কে যেকোনো স্পেশাল নোট..."
							class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5845eb]/20 focus:border-[#5845eb] focus:outline-none"
						></textarea>
					</div>

					<div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
						<button
							type="button"
							onclick={() => (isAddModalOpen = false)}
							class="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600"
						>
							বাতিল
						</button>
						<button
							type="submit"
							class="px-5 py-2 bg-[#5845eb] hover:bg-[#4936d6] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
						>
							সেভ করুন
						</button>
					</div>
				</form>
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
						class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
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
							name="notes"
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
							class="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600"
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
