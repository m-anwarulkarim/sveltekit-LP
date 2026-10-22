<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import {
		Search,
		PlusCircle,
		PhoneCall,
		CheckCircle2,
		XCircle,
		Clock,
		AlertTriangle,
		PhoneMissed,
		ThumbsUp,
		Phone,
		PauseCircle,
		RotateCcw,
		Printer,
		ClipboardCheck,
		Truck,
		ShieldCheck,
		PackageCheck,
		AlertCircle,
		HelpCircle,
		Trash2,
		FileEdit,
		ChevronDown,
		Package,
		RefreshCw
	} from 'lucide-svelte';

	let { data }: { data: any } = $props();

	// View selection: web, list, new, pre, trash
	let currentView = $derived(page.url.searchParams.get('view') || 'web');

	// Search & date filtering
	let orderSearchQuery = $state('');
	let activeDateFilter = $state('all');

	// Status tabs filters
	let webStatusFilter = $state('all');
	let orderListStatusFilter = $state('all');

	// Multi-select for Order List
	let selectedOrderIds = $state<string[]>([]);

	// Pre-confirmation status tabs (Image 1)
	const WEB_ORDER_STATUS_TABS = [
		{ id: 'all', label: 'সব', icon: Clock },
		{ id: 'pending', label: 'পেন্ডিং', icon: Clock },
		{ id: 'incomplete', label: 'ইনকমপ্লিট', icon: AlertTriangle },
		{ id: 'no_response', label: 'নো রেসপন্স', icon: PhoneMissed },
		{ id: 'good_no_response', label: 'গুড বাট নো রেসপন্স', icon: ThumbsUp },
		{ id: 'busy', label: 'বিজি', icon: Phone },
		{ id: 'hold', label: 'হোল্ড', icon: PauseCircle },
		{ id: 'recall', label: 'রি', icon: RotateCcw },
		{ id: 'confirmed', label: 'কনফার্মড', icon: CheckCircle2 },
		{ id: 'cancelled', label: 'বাতিল', icon: XCircle }
	];

	// Post-confirmation status tabs (Image 2)
	const ORDER_LIST_STATUS_TABS = [
		{ id: 'all', label: 'সব', icon: Clock },
		{ id: 'confirmed', label: 'কনফার্মড', icon: CheckCircle2 },
		{ id: 'printed', label: 'প্রিন্টেড', icon: Printer },
		{ id: 'entry_done', label: 'এন্ট্রি ডান', icon: ClipboardCheck },
		{ id: 'shipped', label: 'শিপড', icon: Truck },
		{ id: 'delivered', label: 'ডেলিভারড', icon: ShieldCheck },
		{ id: 'partial_delivered', label: 'পার্শিয়াল', icon: PackageCheck },
		{ id: 'pending_return', label: 'পেন্ডিং রিটার্ন', icon: AlertCircle },
		{ id: 'returned', label: 'রিটার্ন', icon: RotateCcw },
		{ id: 'cancelled', label: 'বাতিল', icon: XCircle },
		{ id: 'missing', label: 'মিসিং', icon: HelpCircle }
	];

	// Filtered sets
	let webOrders = $derived(
		(data.orders || []).filter((o: any) =>
			['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold', 'recall'].includes(o.status)
		)
	);

	let orderListOrders = $derived(
		(data.orders || []).filter((o: any) =>
			['confirmed', 'printed', 'entry_done', 'shipped', 'delivered', 'partial_delivered', 'pending_return', 'returned', 'missing'].includes(o.status)
		)
	);

	let trashedOrders = $derived((data.orders || []).filter((o: any) => o.status === 'cancelled'));
	let preOrders = $derived((data.orders || []).filter((o: any) => (o.total || 0) > 3000));

	let filteredWebOrders = $derived(
		webOrders.filter((order: any) => {
			const matchesStatus =
				webStatusFilter === 'all'
					? true
					: webStatusFilter === 'good_no_response'
						? order.status === 'good_no_response' || order.status === 'no_response_3'
						: order.status === webStatusFilter;

			const matchesQuery =
				!orderSearchQuery ||
				order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
				order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
				order.customerEmail.toLowerCase().includes(orderSearchQuery.toLowerCase());

			return matchesStatus && matchesQuery;
		})
	);

	let filteredOrderList = $derived(
		orderListOrders.filter((order: any) => {
			const matchesStatus =
				orderListStatusFilter === 'all'
					? true
					: order.status === orderListStatusFilter;

			const matchesQuery =
				!orderSearchQuery ||
				order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
				order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
				order.customerEmail.toLowerCase().includes(orderSearchQuery.toLowerCase());

			return matchesStatus && matchesQuery;
		})
	);

	function formatTaka(amount: number) {
		return '৳' + (amount || 0).toLocaleString('en-US');
	}

	function parseItems(itemsJson: string) {
		try {
			return JSON.parse(itemsJson);
		} catch {
			return [];
		}
	}

	function toggleSelectAllOrderList() {
		if (selectedOrderIds.length === filteredOrderList.length) {
			selectedOrderIds = [];
		} else {
			selectedOrderIds = filteredOrderList.map((o: any) => o.id);
		}
	}

	function toggleSelectOrder(id: string) {
		if (selectedOrderIds.includes(id)) {
			selectedOrderIds = selectedOrderIds.filter(i => i !== id);
		} else {
			selectedOrderIds = [...selectedOrderIds, id];
		}
	}

	function getStatusInfo(status: string) {
		switch (status) {
			case 'pending':
				return { label: 'পেন্ডিং', icon: Clock, bg: 'bg-[#fffbeb]', text: 'text-[#b45309]', border: 'border-[#fde68a]' };
			case 'incomplete':
				return { label: 'ইনকমপ্লিট', icon: AlertTriangle, bg: 'bg-[#fff7ed]', text: 'text-[#c2410c]', border: 'border-[#fed7aa]' };
			case 'no_response':
				return { label: 'নো রেসপন্স', icon: PhoneMissed, bg: 'bg-[#f8fafc]', text: 'text-[#475569]', border: 'border-[#e2e8f0]' };
			case 'good_no_response':
			case 'no_response_3':
				return { label: 'গুড বাট নো রেসপন্স', icon: ThumbsUp, bg: 'bg-[#faf5ff]', text: 'text-[#7e22ce]', border: 'border-[#f3e8ff]' };
			case 'busy':
				return { label: 'বিজি', icon: Phone, bg: 'bg-[#f0f9ff]', text: 'text-[#0369a1]', border: 'border-[#e0f2fe]' };
			case 'hold':
				return { label: 'হোল্ড', icon: PauseCircle, bg: 'bg-[#eef2ff]', text: 'text-[#4338ca]', border: 'border-[#e0e7ff]' };
			case 'recall':
				return { label: 'রি', icon: RotateCcw, bg: 'bg-[#f0fdfa]', text: 'text-[#0f766e]', border: 'border-[#ccfbf1]' };
			case 'confirmed':
				return { label: 'কনফার্মড', icon: CheckCircle2, bg: 'bg-[#ecfdf5]', text: 'text-[#047857]', border: 'border-[#a7f3d0]' };
			case 'printed':
				return { label: 'প্রিন্টেড', icon: Printer, bg: 'bg-[#eff6ff]', text: 'text-[#1d4ed8]', border: 'border-[#bfdbfe]' };
			case 'entry_done':
				return { label: 'এন্ট্রি ডান', icon: ClipboardCheck, bg: 'bg-[#f0fdf4]', text: 'text-[#15803d]', border: 'border-[#bbf7d0]' };
			case 'shipped':
				return { label: 'শিপড', icon: Truck, bg: 'bg-[#ecfeff]', text: 'text-[#0e7490]', border: 'border-[#a5f3fc]' };
			case 'delivered':
				return { label: 'ডেলিভারড', icon: ShieldCheck, bg: 'bg-[#f0fdf4]', text: 'text-[#166534]', border: 'border-[#86efac]' };
			case 'partial_delivered':
				return { label: 'পার্শিয়াল', icon: PackageCheck, bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', border: 'border-[#f59e0b]' };
			case 'pending_return':
				return { label: 'পেন্ডিং রিটার্ন', icon: AlertCircle, bg: 'bg-[#fff7ed]', text: 'text-[#c2410c]', border: 'border-[#fed7aa]' };
			case 'returned':
				return { label: 'রিটার্ন', icon: RotateCcw, bg: 'bg-[#fff1f2]', text: 'text-[#be123c]', border: 'border-[#fecdd3]' };
			case 'cancelled':
				return { label: 'বাতিল', icon: XCircle, bg: 'bg-[#fef2f2]', text: 'text-[#b91c1c]', border: 'border-[#fecaca]' };
			case 'missing':
				return { label: 'মিসিং', icon: HelpCircle, bg: 'bg-[#f4f4f5]', text: 'text-[#52525b]', border: 'border-[#e4e4e7]' };
			default:
				return { label: status, icon: Clock, bg: 'bg-[#faf7f2]', text: 'text-slate-700', border: 'border-[#ede5d8]' };
		}
	}
</script>

<div class="space-y-4 max-w-7xl mx-auto">
	
	<!-- Top Sub-Navigation Pill Header -->
	<div class="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80">
		<a
			href="/admin/orders?view=web"
			class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap {currentView === 'web'
				? 'bg-[#5845eb] text-white shadow-md shadow-indigo-600/20'
				: 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}"
		>
			<span>ওয়েব অর্ডার (Web Orders)</span>
			<span class="px-2 py-0.5 rounded-full text-[10px] {currentView === 'web' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}">
				{webOrders.length}
			</span>
		</a>

		<a
			href="/admin/orders?view=list"
			class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap {currentView === 'list'
				? 'bg-[#5845eb] text-white shadow-md shadow-indigo-600/20'
				: 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}"
		>
			<span>অর্ডার তালিকা (Order List)</span>
			<span class="px-2 py-0.5 rounded-full text-[10px] {currentView === 'list' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}">
				{orderListOrders.length}
			</span>
		</a>

		<a
			href="/admin/orders?view=new"
			class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap {currentView === 'new'
				? 'bg-[#5845eb] text-white shadow-md shadow-indigo-600/20'
				: 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}"
		>
			<PlusCircle class="w-3.5 h-3.5" />
			<span>নতুন অর্ডার তৈরি</span>
		</a>

		<a
			href="/admin/orders?view=pre"
			class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap {currentView === 'pre'
				? 'bg-[#5845eb] text-white shadow-md shadow-indigo-600/20'
				: 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}"
		>
			<span>প্রি-অর্ডার</span>
			{#if preOrders.length > 0}
				<span class="px-2 py-0.5 rounded-full text-[10px] {currentView === 'pre' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}">
					{preOrders.length}
				</span>
			{/if}
		</a>

		<a
			href="/admin/orders?view=trash"
			class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap {currentView === 'trash'
				? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
				: 'bg-white text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-slate-200'}"
		>
			<Trash2 class="w-3.5 h-3.5" />
			<span>মুছে ফেলা (Trash)</span>
			{#if trashedOrders.length > 0}
				<span class="px-2 py-0.5 rounded-full text-[10px] {currentView === 'trash' ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-700'}">
					{trashedOrders.length}
				</span>
			{/if}
		</a>
	</div>

	<!-- ============================================== -->
	<!-- 1. VIEW: WEB ORDERS (PRE-CONFIRMATION)         -->
	<!-- ============================================== -->
	{#if currentView === 'web'}
		<div class="space-y-3 sm:space-y-4">
			
			<!-- Top Pre-Confirmation Status Filter Tabs -->
			<div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
				{#each WEB_ORDER_STATUS_TABS as tab}
					{@const count = tab.id === 'all' 
						? webOrders.length 
						: tab.id === 'good_no_response'
							? webOrders.filter((o: any) => o.status === 'good_no_response' || o.status === 'no_response_3').length
							: webOrders.filter((o: any) => o.status === tab.id).length}
					<button
						onclick={() => webStatusFilter = tab.id}
						class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border {webStatusFilter === tab.id
							? 'bg-[#5845eb] text-white border-[#5845eb] shadow-sm'
							: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}"
					>
						<tab.icon class="w-3.5 h-3.5" />
						<span>{tab.label}</span>
						<span class="text-[11px] font-extrabold {webStatusFilter === tab.id ? 'text-white/80' : 'text-slate-400'}">
							({count})
						</span>
					</button>
				{/each}
			</div>

			<!-- Search & Actions Bar -->
			<div class="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
				<div class="relative flex-1 max-w-md">
					<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						bind:value={orderSearchQuery}
						placeholder="অর্ডার আইডি, গ্রাহকের নাম বা ফোন..."
						class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-all shadow-2xs"
					/>
				</div>

				<div class="flex items-center gap-2">
					<div class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
						<Clock class="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<select bind:value={activeDateFilter} class="bg-transparent focus:outline-none cursor-pointer text-xs">
							<option value="all">সব সময়</option>
							<option value="today">আজকের অর্ডার</option>
							<option value="yesterday">গতকালকের অর্ডার</option>
							<option value="7days">বিগত ৭ দিন</option>
							<option value="30days">বিগত ৩০ দিন</option>
						</select>
					</div>

					<a
						href="/admin/orders?view=new"
						class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5845eb] hover:bg-[#4734d6] text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all shrink-0"
					>
						<PlusCircle class="w-4 h-4" />
						<span>নতুন অর্ডার</span>
					</a>
				</div>
			</div>

			<!-- Orders Table (Desktop) -->
			<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
				<div class="hidden md:block overflow-x-auto">
					<table class="w-full text-left text-xs">
						<thead>
							<tr class="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
								<th class="py-3.5 px-4">অর্ডার</th>
								<th class="py-3.5 px-4">নাম</th>
								<th class="py-3.5 px-4">লোকেশন</th>
								<th class="py-3.5 px-4">নাম্বার</th>
								<th class="py-3.5 px-4">পণ্য</th>
								<th class="py-3.5 px-4">মোট</th>
								<th class="py-3.5 px-4">স্ট্যাটাস</th>
								<th class="py-3.5 px-4 text-center">অ্যাকশন</th>
								<th class="py-3.5 px-4 text-right">সোর্স</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#if filteredWebOrders.length === 0}
								<tr>
									<td colspan="9" class="py-16 text-center text-slate-400">
										কোনো ওয়েব অর্ডার পাওয়া যায়নি।
									</td>
								</tr>
							{/if}

							{#each filteredWebOrders as order (order.id)}
								{@const parsedItems = parseItems(order.items)}
								{@const firstItem = parsedItems[0] || {}}
								{@const statusStyle = getStatusInfo(order.status)}

								<tr class="hover:bg-slate-50/70 transition-colors group">
									<td class="py-3.5 px-4 font-bold align-top">
										<div class="flex items-center gap-1.5">
											<span class="text-[#047857] font-mono font-bold text-sm">#{order.id}</span>
										</div>
										<span class="text-[10px] text-slate-400 block mt-0.5">{firstItem.timeAgo || '12m ago'}</span>
									</td>

									<td class="py-3.5 px-4 align-top">
										<span class="font-bold text-slate-900 block max-w-[150px] truncate">
											{order.customerName}
										</span>
									</td>

									<td class="py-3.5 px-4 align-top max-w-[220px]">
										<span class="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
											{order.shippingAddress}
										</span>
									</td>

									<td class="py-3.5 px-4 align-top">
										<div class="flex items-center gap-1.5 font-mono text-slate-800 font-bold">
											<span>{order.customerEmail}</span>
											<a
												href="tel:{order.customerEmail}"
												class="text-emerald-600 hover:text-emerald-700 p-0.5 rounded transition-colors"
												title="কল করুন"
											>
												<PhoneCall class="w-3.5 h-3.5" />
											</a>
										</div>
										{#if firstItem.altPhone}
											<div class="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
												<span>{firstItem.altPhone}</span>
												<a href="tel:{firstItem.altPhone}" class="text-emerald-600">
													<PhoneCall class="w-2.5 h-2.5" />
												</a>
											</div>
										{/if}
										{#if firstItem.successRate}
											<div class="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
												<span>{firstItem.successRate.delivered}</span>
												<span>|</span>
												<span>{firstItem.successRate.returned}</span>
												<span>|</span>
												<span>{firstItem.successRate.percent}%</span>
											</div>
										{/if}
									</td>

									<td class="py-3.5 px-4 align-top">
										<div class="flex items-center gap-2">
											<div class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
												<Package class="w-4 h-4 text-slate-600" />
											</div>
											<div class="text-[11px] font-medium text-slate-700 truncate max-w-[120px]">
												{firstItem.name || 'AURA পণ্য'}
												{#if parsedItems.length > 1}
													<span class="text-[10px] text-slate-400 block">& More {parsedItems.length - 1}</span>
												{/if}
											</div>
										</div>
									</td>

									<td class="py-3.5 px-4 align-top font-bold text-slate-900 whitespace-nowrap">
										{formatTaka(order.total)}
									</td>

									<td class="py-3.5 px-4 align-top">
										<form method="POST" action="?/updateOrderStatus" use:enhance class="inline-block">
											<input type="hidden" name="orderId" value={order.id} />
											<div class="relative inline-flex items-center">
												<select
													name="status"
													value={order.status === 'no_response_3' ? 'good_no_response' : order.status}
													onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
													class="pl-6 pr-6 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer appearance-none {statusStyle.bg} {statusStyle.text} {statusStyle.border} focus:outline-none"
												>
													<option value="pending">পেন্ডিং</option>
													<option value="incomplete">ইনকমপ্লিট</option>
													<option value="no_response">নো রেসপন্স</option>
													<option value="good_no_response">গুড বাট নো রেসপন্স</option>
													<option value="busy">বিজি</option>
													<option value="hold">হোল্ড</option>
													<option value="recall">রি</option>
													<option value="confirmed">কনফার্মড</option>
													<option value="cancelled">বাতিল</option>
												</select>
												<statusStyle.icon class="w-3.5 h-3.5 absolute left-2 pointer-events-none {statusStyle.text}" />
												<ChevronDown class="w-3 h-3 absolute right-2 pointer-events-none text-slate-400" />
											</div>
										</form>
									</td>

									<td class="py-3.5 px-4 align-top text-center">
										<div class="flex items-center justify-center gap-1">
											<a
												href="/admin/orders?view=new"
												class="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
												title="এডিট"
											>
												<FileEdit class="w-3.5 h-3.5" />
											</a>

											<form method="POST" action="?/quickConfirmOrder" use:enhance class="inline-block">
												<input type="hidden" name="orderId" value={order.id} />
												<button
													type="submit"
													class="p-1 rounded-md text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
													title="অর্ডার কনফার্ম করুন"
												>
													<CheckCircle2 class="w-4 h-4" />
												</button>
											</form>

											<form method="POST" action="?/quickCancelOrder" use:enhance class="inline-block">
												<input type="hidden" name="orderId" value={order.id} />
												<button
													type="submit"
													class="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
													title="বাতিল করুন"
												>
													<XCircle class="w-4 h-4" />
												</button>
											</form>

											<form method="POST" action="?/deleteOrder" use:enhance class="inline-block">
												<input type="hidden" name="orderId" value={order.id} />
												<button
													type="submit"
													class="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
													title="ট্র্যাশে পাঠান"
												>
													<Trash2 class="w-3.5 h-3.5" />
												</button>
											</form>
										</div>
									</td>

									<td class="py-3.5 px-4 align-top text-right whitespace-nowrap">
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold {firstItem.source === 'Facebook' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}">
											{firstItem.source || 'Direct'}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Mobile Cards View -->
				<div class="md:hidden divide-y divide-slate-100">
					{#if filteredWebOrders.length === 0}
						<div class="py-12 text-center text-slate-400 text-xs">
							কোনো ওয়েব অর্ডার পাওয়া যায়নি।
						</div>
					{/if}

					{#each filteredWebOrders as order (order.id)}
						{@const parsedItems = parseItems(order.items)}
						{@const firstItem = parsedItems[0] || {}}
						{@const statusStyle = getStatusInfo(order.status)}

						<div class="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
							<div class="flex items-center justify-between gap-2">
								<div class="flex items-center gap-1.5 flex-wrap">
									<span class="text-[#047857] font-mono font-bold text-sm">#{order.id}</span>
									<span class="text-[10px] text-slate-400">{firstItem.timeAgo || '12m ago'}</span>
								</div>

								<form method="POST" action="?/updateOrderStatus" use:enhance class="inline-block shrink-0">
									<input type="hidden" name="orderId" value={order.id} />
									<div class="relative inline-flex items-center">
										<select
											name="status"
											value={order.status === 'no_response_3' ? 'good_no_response' : order.status}
											onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
											class="pl-6 pr-5 py-1 rounded-lg text-[11px] font-bold border appearance-none {statusStyle.bg} {statusStyle.text} {statusStyle.border} focus:outline-none"
										>
											<option value="pending">পেন্ডিং</option>
											<option value="incomplete">ইনকমপ্লিট</option>
											<option value="no_response">নো রেসপন্স</option>
											<option value="good_no_response">গুড বাট নো রেসপন্স</option>
											<option value="busy">বিজি</option>
											<option value="hold">হোল্ড</option>
											<option value="recall">রি</option>
											<option value="confirmed">কনফার্মড</option>
											<option value="cancelled">বাতিল</option>
										</select>
										<statusStyle.icon class="w-3 h-3 absolute left-1.5 pointer-events-none {statusStyle.text}" />
										<ChevronDown class="w-3 h-3 absolute right-1.5 pointer-events-none text-slate-400" />
									</div>
								</form>
							</div>

							<div class="flex items-start justify-between gap-3 text-xs">
								<div class="space-y-0.5">
									<div class="font-bold text-slate-900">{order.customerName}</div>
									<div class="text-[11px] text-slate-500 leading-relaxed">{order.shippingAddress}</div>
								</div>
								<div class="text-right shrink-0">
									<div class="font-bold text-slate-900 text-sm font-['Outfit']">{formatTaka(order.total)}</div>
								</div>
							</div>

							<div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
								<div class="flex items-center gap-2">
									<a href="tel:{order.customerEmail}" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
										<PhoneCall class="w-3 h-3" />
										<span>{order.customerEmail}</span>
									</a>
								</div>
								<div class="flex items-center gap-1.5">
									<form method="POST" action="?/quickConfirmOrder" use:enhance class="inline-block">
										<input type="hidden" name="orderId" value={order.id} />
										<button type="submit" class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs">কনফার্ম</button>
									</form>
									<form method="POST" action="?/quickCancelOrder" use:enhance class="inline-block">
										<input type="hidden" name="orderId" value={order.id} />
										<button type="submit" class="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">বাতিল</button>
									</form>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- ============================================== -->
	<!-- 2. VIEW: ORDER LIST (POST-CONFIRMATION)        -->
	<!-- ============================================== -->
	{#if currentView === 'list'}
		<div class="space-y-3 sm:space-y-4">
			
			<!-- Top Post-Confirmation Status Filter Tabs -->
			<div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
				{#each ORDER_LIST_STATUS_TABS as tab}
					{@const count = tab.id === 'all' 
						? orderListOrders.length 
						: orderListOrders.filter((o: any) => o.status === tab.id).length}
					<button
						onclick={() => orderListStatusFilter = tab.id}
						class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border {orderListStatusFilter === tab.id
							? 'bg-[#5845eb] text-white border-[#5845eb] shadow-sm'
							: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}"
					>
						<tab.icon class="w-3.5 h-3.5" />
						<span>{tab.label}</span>
						<span class="text-[11px] font-extrabold {orderListStatusFilter === tab.id ? 'text-white/80' : 'text-slate-400'}">
							({count})
						</span>
					</button>
				{/each}
			</div>

			<!-- Search Bar -->
			<div class="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
				<div class="relative flex-1 max-w-md">
					<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						bind:value={orderSearchQuery}
						placeholder="কনফার্মড অর্ডার খুঁজুন..."
						class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-all shadow-2xs"
					/>
				</div>

				<div class="flex items-center gap-2">
					<form method="POST" action="?/syncCourier" use:enhance class="inline-block">
						<button
							type="submit"
							class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs transition-all"
						>
							<RefreshCw class="w-3.5 h-3.5 text-[#5845eb]" />
							<span>কুরিয়ার সিঙ্ক</span>
						</button>
					</form>
				</div>
			</div>

			<!-- Order List Table -->
			<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
				<div class="overflow-x-auto">
					<table class="w-full text-left text-xs">
						<thead>
							<tr class="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
								<th class="py-3 px-3 w-8">
									<input
										type="checkbox"
										checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrderList.length}
										onchange={toggleSelectAllOrderList}
										class="rounded text-[#5845eb] focus:ring-indigo-500"
									/>
								</th>
								<th class="py-3.5 px-4">অর্ডার আইডি</th>
								<th class="py-3.5 px-4">কাস্টমার</th>
								<th class="py-3.5 px-4">ঠিকানা</th>
								<th class="py-3.5 px-4">মোবাইল</th>
								<th class="py-3.5 px-4">মোট</th>
								<th class="py-3.5 px-4">স্ট্যাটাস</th>
								<th class="py-3.5 px-4 text-right">অ্যাকশন</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#if filteredOrderList.length === 0}
								<tr>
									<td colspan="8" class="py-16 text-center text-slate-400">
										কোনো কনফার্মড অর্ডার পাওয়া যায়নি।
									</td>
								</tr>
							{/if}

							{#each filteredOrderList as order (order.id)}
								{@const statusStyle = getStatusInfo(order.status)}
								<tr class="hover:bg-slate-50/70 transition-colors">
									<td class="py-3 px-3">
										<input
											type="checkbox"
											checked={selectedOrderIds.includes(order.id)}
											onchange={() => toggleSelectOrder(order.id)}
											class="rounded text-[#5845eb] focus:ring-indigo-500"
										/>
									</td>
									<td class="py-3.5 px-4 font-mono font-bold text-slate-900">#{order.id}</td>
									<td class="py-3.5 px-4 font-bold text-slate-900">{order.customerName}</td>
									<td class="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">{order.shippingAddress}</td>
									<td class="py-3.5 px-4 font-mono">{order.customerEmail}</td>
									<td class="py-3.5 px-4 font-bold text-slate-900">{formatTaka(order.total)}</td>
									<td class="py-3.5 px-4">
										<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border {statusStyle.bg} {statusStyle.text} {statusStyle.border}">
											<statusStyle.icon class="w-3 h-3" />
											<span>{statusStyle.label}</span>
										</span>
									</td>
									<td class="py-3.5 px-4 text-right">
										<form method="POST" action="?/deleteOrder" use:enhance class="inline-block">
											<input type="hidden" name="orderId" value={order.id} />
											<button type="submit" class="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors" title="মুছে ফেলুন">
												<Trash2 class="w-4 h-4" />
											</button>
										</form>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}

	<!-- ============================================== -->
	<!-- 3. VIEW: NEW ORDER (MANUAL ENTRY)              -->
	<!-- ============================================== -->
	{#if currentView === 'new'}
		<div class="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
			<div class="border-b border-slate-100 pb-4 flex items-center justify-between">
				<div>
					<h3 class="text-base font-black text-slate-900">ম্যানুয়াল কাস্টমার অর্ডার এন্ট্রি</h3>
					<p class="text-xs text-slate-400">সরাসরি ফোন কল বা অফলাইন থেকে অর্ডার সংরক্ষণ করুন</p>
				</div>
				<a href="/admin/orders?view=web" class="text-xs font-bold text-slate-500 hover:text-slate-800">
					ফিরে যান
				</a>
			</div>

			<form method="POST" action="?/createManualOrder" use:enhance class="space-y-4 text-xs">
				<div class="space-y-1.5">
					<label for="order-name" class="text-xs font-bold text-slate-700">কাস্টমার পুরো নাম *</label>
					<input
						id="order-name"
						type="text"
						name="customerName"
						placeholder="উদাঃ মোঃ রফিকুল ইসলাম"
						required
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="order-phone" class="text-xs font-bold text-slate-700">মোবাইল নম্বর *</label>
					<input
						id="order-phone"
						type="text"
						name="customerEmail"
						placeholder="উদাঃ 01711223344"
						required
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="order-address" class="text-xs font-bold text-slate-700">ডেলিভারি পূর্ণ ঠিকানা ও জেলা *</label>
					<textarea
						id="order-address"
						name="shippingAddress"
						rows="3"
						placeholder="বাড়ি নং, রোড নং, এলাকা, থানা ও জেলা..."
						required
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
					></textarea>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="order-product" class="text-xs font-bold text-slate-700">পণ্য নির্বাচন</label>
						<select
							id="order-product"
							name="productName"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
						>
							{#each data.products || [] as prod}
								<option value={prod.name}>{prod.name} - {formatTaka(prod.price)}</option>
							{/each}
						</select>
					</div>

					<div class="space-y-1.5">
						<label for="order-price" class="text-xs font-bold text-slate-700">মোট টাকা (টাকা)</label>
						<input
							id="order-price"
							type="number"
							name="total"
							value="1200"
							required
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
						/>
					</div>
				</div>

				<div class="pt-4 flex items-center justify-end gap-3">
					<a
						href="/admin/orders?view=web"
						class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
					>
						বাতিল
					</a>
					<button
						type="submit"
						class="px-5 py-2 rounded-xl bg-[#5845eb] hover:bg-[#4734d6] text-white font-bold text-xs shadow-md shadow-indigo-600/20"
					>
						অর্ডার সংরক্ষণ করুন
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- ============================================== -->
	<!-- 4. VIEW: PRE-ORDERS                            -->
	<!-- ============================================== -->
	{#if currentView === 'pre'}
		<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
			<div class="p-4 border-b border-slate-100 flex items-center justify-between">
				<div>
					<h3 class="text-sm font-black text-slate-900">প্রি-অর্ডার তালিকা</h3>
					<p class="text-xs text-slate-400">৳৩,০০০-এর বেশি মূল্যের অ্যাডভান্স ও স্পেশাল বুকিং</p>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead>
						<tr class="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
							<th class="py-3 px-4">অর্ডার আইডি</th>
							<th class="py-3 px-4">গ্রাহক</th>
							<th class="py-3 px-4">ফোন</th>
							<th class="py-3 px-4">মূল্য</th>
							<th class="py-3 px-4">স্ট্যাটাস</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#if preOrders.length === 0}
							<tr>
								<td colspan="5" class="py-12 text-center text-slate-400">কোনো প্রি-অর্ডার পাওয়া যায়নি।</td>
							</tr>
						{/if}
						{#each preOrders as order}
							<tr>
								<td class="py-3 px-4 font-mono font-bold text-slate-900">#{order.id}</td>
								<td class="py-3 px-4 font-bold text-slate-800">{order.customerName}</td>
								<td class="py-3 px-4 font-mono">{order.customerEmail}</td>
								<td class="py-3 px-4 font-bold text-[#5845eb]">{formatTaka(order.total)}</td>
								<td class="py-3 px-4">
									<span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
										{order.status}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	<!-- ============================================== -->
	<!-- 5. VIEW: TRASH (মুছে ফেলা ও বাতিল)             -->
	<!-- ============================================== -->
	{#if currentView === 'trash'}
		<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-4">
			<div class="p-4 border-b border-slate-100 flex items-center justify-between">
				<div>
					<h3 class="text-base font-black text-slate-900">মুছে ফেলা ও বাতিলকৃত অর্ডারসমূহ</h3>
					<p class="text-xs text-slate-400">প্রয়োজনে পুনরুদ্ধার বা স্থায়ীভাবে মুছে ফেলার সুবিধা</p>
				</div>
			</div>

			<table class="w-full text-left text-xs">
				<thead>
					<tr class="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
						<th class="py-3 px-4">অর্ডার আইডি</th>
						<th class="py-3 px-4">গ্রাহক</th>
						<th class="py-3 px-4">ঠিকানা</th>
						<th class="py-3 px-4">মূল্য</th>
						<th class="py-3 px-4 text-right">অ্যাকশন</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#if trashedOrders.length === 0}
						<tr>
							<td colspan="5" class="py-12 text-center text-slate-400">
								ট্র্যাশে কোনো অর্ডার নেই।
							</td>
						</tr>
					{/if}
					{#each trashedOrders as tOrder}
						<tr class="hover:bg-slate-50/50">
							<td class="py-3 px-4 font-mono font-bold text-slate-700">#{tOrder.id}</td>
							<td class="py-3 px-4 font-bold text-slate-800">{tOrder.customerName}</td>
							<td class="py-3 px-4 text-slate-500">{tOrder.shippingAddress}</td>
							<td class="py-3 px-4 font-bold">{formatTaka(tOrder.total)}</td>
							<td class="py-3 px-4 text-right">
								<form method="POST" action="?/restoreOrder" use:enhance class="inline-block">
									<input type="hidden" name="orderId" value={tOrder.id} />
									<button
										type="submit"
										class="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] hover:bg-emerald-100 transition-colors"
									>
										পুনরুদ্ধার
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

</div>
