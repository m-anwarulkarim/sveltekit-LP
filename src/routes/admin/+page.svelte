<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		LayoutGrid,
		ShoppingCart,
		ListOrdered,
		PlusCircle,
		Trash2,
		Radio,
		Truck,
		Globe,
		Database,
		RefreshCw,
		LogOut,
		Search,
		CheckCircle2,
		Clock,
		AlertTriangle,
		ExternalLink,
		ChevronRight,
		Copy,
		Check,
		DollarSign,
		Package,
		Sparkles,
		Flame,
		PanelLeftClose,
		PanelLeftOpen,
		TrendingUp,
		TrendingDown,
		Save,
		ShieldCheck,
		Users,
		Tag,
		CreditCard,
		PhoneCall,
		MessageSquare,
		SlidersHorizontal,
		ArrowUpRight,
		Filter,
		Download,
		Printer,
		FileText,
		CheckCheck,
		Layers,
		Activity,
		Settings,
		HelpCircle,
		Bell,
		Mail,
		ChevronDown,
		Calendar,
		ShoppingBag,
		Coins,
		Receipt,
		Phone,
		PhoneMissed,
		PhoneOff,
		PhoneForwarded,
		PauseCircle,
		RotateCcw,
		XCircle,
		Eye,
		FileEdit,
		Undo2,
		PackageCheck,
		ClipboardCheck,
		AlertCircle,
		Inbox,
		Send,
		ThumbsUp,
		Menu,
		X,
		MapPin,
		User
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Navigation Tabs
	type TabType =
		| 'overview'
		| 'web_orders'
		| 'order_list'
		| 'orders'
		| 'pre_order'
		| 'new_order'
		| 'trash'
		| 'inventory'
		| 'courier'
		| 'pixels'
		| 'customers'
		| 'database';

	let activeTab = $state<TabType>('web_orders');
	let isSidebarCollapsed = $state(false);
	let isMobileSidebarOpen = $state(false);

	// Date filter state
	let activeDateFilter = $state<'all' | 'today' | 'yesterday' | '7days' | '30days'>('all');

	// Order Search and status filters
	let orderSearchQuery = $state('');
	let webStatusFilter = $state<string>('pending');
	let orderListStatusFilter = $state<string>('all');
	
	// Clipboard and Sync states
	let isCopied = $state<string | null>(null);
	let isCourierSyncing = $state(false);
	let courierSyncMessage = $state<string | null>(null);

	// Batch selection for Order List
	let selectedOrderIds = $state<string[]>([]);

	// Interactive chart hover state
	let activeChartPoint = $state<{ date: string; sales: number; orders: number; aov: number } | null>(null);

	// Sample 7-day trend data for the smooth area chart
	const trendData = [
		{ date: '১৬ অক্টো', sales: 4800, orders: 7, aov: 685, x: 50, ySales: 75, yOrders: 70 },
		{ date: '১৭ অক্টো', sales: 1800, orders: 3, aov: 600, x: 140, ySales: 165, yOrders: 135 },
		{ date: '১৮ অক্টো', sales: 3200, orders: 5, aov: 640, x: 230, ySales: 125, yOrders: 105 },
		{ date: '১৯ অক্টো', sales: 1500, orders: 2, aov: 750, x: 320, ySales: 175, yOrders: 150 },
		{ date: '২০ অক্টো', sales: 4200, orders: 6, aov: 700, x: 410, ySales: 95, yOrders: 85 },
		{ date: '২১ অক্টো', sales: 5900, orders: 8, aov: 737, x: 500, ySales: 45, yOrders: 55 },
		{ date: '২২ অক্টো', sales: 3600, orders: 5, aov: 720, x: 590, ySales: 110, yOrders: 105 }
	];

	// ==============================================================
	// STATUS CONFIGURATIONS FROM USER SCREENSHOTS
	// ==============================================================

	// ১. ওয়েব অর্ডার (Pre-Confirmation: কনফার্মেশনের আগের পর্যায় - Image 1)
	// User Requirement: "৩য় বার নো রেসপন্স" এর জায়গায় "গুড বাট নো রেসপন্স" (Good but no response)
	const WEB_ORDER_STATUS_TABS = [
		{ id: 'pending', label: 'পেন্ডিং', icon: Clock },
		{ id: 'incomplete', label: 'ইনকমপ্লিট', icon: AlertTriangle },
		{ id: 'no_response', label: 'নো রেসপন্স', icon: PhoneMissed },
		{ id: 'good_no_response', label: 'গুড বাট নো রেসপন্স', icon: ThumbsUp },
		{ id: 'busy', label: 'বিজি', icon: Phone },
		{ id: 'hold', label: 'হোল্ড', icon: PauseCircle },
		{ id: 'recall', label: 'রি', icon: RotateCcw },
		{ id: 'cancelled', label: 'বাতিল', icon: XCircle },
		{ id: 'confirmed', label: 'কনফার্মড', icon: CheckCircle2 },
		{ id: 'all', label: 'সব', icon: Layers }
	];

	// ২. অর্ডার তালিকা (Post-Confirmation: কুরিয়ার ও ফুলফিলমেন্ট পর্যায় - Image 2)
	const ORDER_LIST_STATUS_TABS = [
		{ id: 'confirmed', label: 'কনফার্মড', icon: CheckCircle2 },
		{ id: 'printed', label: 'প্রিন্টেড', icon: Printer },
		{ id: 'entry_done', label: 'এন্ট্রি ডান', icon: ClipboardCheck },
		{ id: 'shipped', label: 'শিপড', icon: Truck },
		{ id: 'delivered', label: 'ডেলিভারড', icon: ShieldCheck },
		{ id: 'partial_delivered', label: 'পার্শিয়াল', icon: PackageCheck },
		{ id: 'pending_return', label: 'পেন্ডিং রিটার্ন', icon: AlertCircle },
		{ id: 'returned', label: 'রিটার্ন', icon: RotateCcw },
		{ id: 'cancelled', label: 'বাতিল', icon: XCircle },
		{ id: 'missing', label: 'মিসিং', icon: HelpCircle },
		{ id: 'all', label: 'সব', icon: ListOrdered }
	];

	const PRE_CONFIRMATION_STATUSES = [
		'pending',
		'incomplete',
		'no_response',
		'no_response_3',
		'good_no_response',
		'busy',
		'hold',
		'recall'
	];

	const POST_CONFIRMATION_STATUSES = [
		'confirmed',
		'printed',
		'entry_done',
		'shipped',
		'delivered',
		'partial_delivered',
		'pending_return',
		'returned',
		'missing'
	];

	// Derived: Pre-confirmation Web Orders
	let webOrders = $derived(
		data.orders.filter(order => {
			if (order.status === 'cancelled') return !order.id.startsWith('INV-');
			return PRE_CONFIRMATION_STATUSES.includes(order.status) || !order.id.startsWith('INV-');
		})
	);

	let filteredWebOrders = $derived(
		webOrders.filter(order => {
			const query = orderSearchQuery.toLowerCase();
			const matchesSearch =
				order.id.toLowerCase().includes(query) ||
				order.customerName.toLowerCase().includes(query) ||
				order.customerEmail.toLowerCase().includes(query) ||
				order.shippingAddress.toLowerCase().includes(query);
			
			// Match status (including mapping no_response_3 to good_no_response)
			let currentStatus = order.status;
			if (currentStatus === 'no_response_3') currentStatus = 'good_no_response';
			
			const matchesStatus = webStatusFilter === 'all' || currentStatus === webStatusFilter;
			return matchesSearch && matchesStatus;
		})
	);

	// Derived: Post-confirmation Confirmed Orders (Order List)
	let orderListOrders = $derived(
		data.orders.filter(order => {
			if (order.status === 'cancelled') return order.id.startsWith('INV-');
			return POST_CONFIRMATION_STATUSES.includes(order.status) || order.id.startsWith('INV-');
		})
	);

	let filteredOrderList = $derived(
		orderListOrders.filter(order => {
			const query = orderSearchQuery.toLowerCase();
			const matchesSearch =
				order.id.toLowerCase().includes(query) ||
				order.customerName.toLowerCase().includes(query) ||
				order.customerEmail.toLowerCase().includes(query) ||
				order.shippingAddress.toLowerCase().includes(query);
			const matchesStatus = orderListStatusFilter === 'all' || order.status === orderListStatusFilter;
			return matchesSearch && matchesStatus;
		})
	);

	// Trashed orders (cancelled)
	let trashedOrders = $derived(data.orders.filter(o => o.status === 'cancelled'));

	// Pre-orders (special items / advance bookings)
	let preOrders = $derived(data.orders.filter(o => o.total > 3000));

	function formatTaka(amount: number) {
		return '৳' + amount.toLocaleString('en-US');
	}

	function parseItems(itemsJson: string) {
		try {
			return JSON.parse(itemsJson);
		} catch {
			return [];
		}
	}

	function copyToClipboard(text: string, id: string) {
		navigator.clipboard.writeText(text);
		isCopied = id;
		setTimeout(() => (isCopied = null), 2000);
	}

	function triggerCourierSync() {
		isCourierSyncing = true;
		courierSyncMessage = 'Steadfast ও Pathao এপিআই-এর সাথে ডেটা সিঙ্ক হচ্ছে...';
		setTimeout(() => {
			isCourierSyncing = false;
			courierSyncMessage = 'কুরিয়ার ট্র্যাকিং সফলভাবে সিঙ্ক সম্পন্ন হয়েছে!';
			setTimeout(() => {
				courierSyncMessage = null;
			}, 3500);
		}, 1200);
	}

	function toggleSelectAllOrderList() {
		if (selectedOrderIds.length === filteredOrderList.length) {
			selectedOrderIds = [];
		} else {
			selectedOrderIds = filteredOrderList.map(o => o.id);
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

<svelte:head>
	<title>AURA Enterprise Control Deck | অ্যাডমিন ড্যাশবোর্ড</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<!-- Fullscreen Warm Ivory / Terracotta Amber Executive Dashboard (NO EMOJIS - 100% RESPONSIVE) -->
<div class="min-h-screen bg-[#faf7f2] text-slate-800 flex flex-col md:flex-row font-['Hind_Siliguri',sans-serif] selection:bg-[#d97706]/20 selection:text-[#9a3412] antialiased">

	<!-- ============================================== -->
	<!-- 1. HIGH-END EXECUTIVE MIDNIGHT SIDEBAR        -->
	<!-- ============================================== -->
	<aside
		class="bg-[#0c101a] text-slate-300 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 z-50 fixed md:sticky top-0 h-screen shrink-0 shadow-2xl {isSidebarCollapsed ? 'w-20' : 'w-72'} {isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
	>
		<div class="flex-1 flex flex-col min-h-0 overflow-y-auto">
			
			<!-- Workspace / Store Brand Header -->
			<div class="h-16 md:h-20 flex items-center justify-between px-4 md:px-5 border-b border-slate-800/60 bg-[#0e1424]/40">
				<a href="/admin" class="flex items-center gap-3 group">
					<div class="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-[#ea580c] via-[#d97706] to-[#f59e0b] p-[1.5px] shadow-lg shadow-amber-600/25 transition-transform group-hover:scale-105">
						<div class="w-full h-full bg-[#0c101a] rounded-[10px] flex items-center justify-center">
							<Flame class="w-4 h-4 md:w-5 md:h-5 text-[#f59e0b] fill-[#f59e0b]/20" />
						</div>
					</div>
					
					{#if !isSidebarCollapsed}
						<div class="flex flex-col">
							<div class="flex items-center gap-1.5">
								<span class="font-['Outfit'] font-black text-base md:text-lg text-white tracking-wide">AURA</span>
								<span class="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-widest bg-[#d97706]/20 text-[#fbbf24] border border-[#d97706]/30">
									PRO
								</span>
							</div>
							<span class="text-[10px] text-slate-400 font-mono -mt-0.5">lp.haqplus.com</span>
						</div>
					{/if}
				</a>

				<!-- Desktop Collapse / Mobile Close -->
				<div class="flex items-center gap-1">
					{#if !isSidebarCollapsed}
						<button
							onclick={() => isSidebarCollapsed = true}
							class="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
							title="সাইডবার সংকুচিত করুন"
							aria-label="Collapse sidebar"
						>
							<PanelLeftClose class="w-4 h-4" />
						</button>
					{/if}
					
					<!-- Mobile Drawer Close Button (X) -->
					<button
						onclick={() => isMobileSidebarOpen = false}
						class="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
						aria-label="Close sidebar"
					>
						<X class="w-5 h-5" />
					</button>
				</div>
			</div>

			<!-- Sidebar Quick Search Bar -->
			{#if !isSidebarCollapsed}
				<div class="p-3">
					<div class="relative">
						<Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
						<input
							type="text"
							placeholder="অনুসন্ধান করুন..."
							bind:value={orderSearchQuery}
							class="w-full bg-[#141b2d] border border-slate-700/60 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#d97706] transition-all"
						/>
					</div>
				</div>
			{/if}

			<!-- Navigation Links Menu -->
			<nav class="p-3 space-y-5">
				
				<!-- Section 0: ওভারভিউ -->
				<div>
					<button
						onclick={() => { activeTab = 'overview'; isMobileSidebarOpen = false; }}
						class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'overview'
							? 'bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white shadow-lg shadow-amber-600/30'
							: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
						title="ওভারভিউ ও অ্যানালিটিক্স"
					>
						<div class="flex items-center gap-3">
							<LayoutGrid class="w-4 h-4 {activeTab === 'overview' ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'}" />
							{#if !isSidebarCollapsed}
								<span>ওভারভিউ ও মেট্রিক্স</span>
							{/if}
						</div>
						{#if !isSidebarCollapsed && activeTab === 'overview'}
							<span class="w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse"></span>
						{/if}
					</button>
				</div>

				<!-- Section 1: অর্ডারসমূহ (Matches Screenshots Hierarchy) -->
				<div>
					{#if !isSidebarCollapsed}
						<div class="px-3 mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
							<span>অর্ডারসমূহ</span>
							<ChevronDown class="w-3 h-3 text-slate-400" />
						</div>
					{/if}

					<div class="space-y-1">
						<!-- ১. নতুন তৈরি (+ নতুন তৈরি) -->
						<button
							onclick={() => { activeTab = 'new_order'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'new_order'
								? 'bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white shadow-lg shadow-amber-600/30'
								: 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60'}"
							title="নতুন অর্ডার তৈরি"
						>
							<div class="flex items-center gap-3">
								<PlusCircle class="w-4 h-4 {activeTab === 'new_order' ? 'text-white' : 'text-emerald-400 group-hover:scale-110 transition-transform'}" />
								{#if !isSidebarCollapsed}
									<span>নতুন তৈরি</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed}
								<span class="text-[9px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
									Manual
								</span>
							{/if}
						</button>

						<!-- ২. ওয়েব অর্ডার (Pre-Confirmation - Image 1) -->
						<button
							onclick={() => { activeTab = 'web_orders'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'web_orders' || activeTab === 'orders'
								? 'bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white shadow-lg shadow-amber-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="ওয়েব অর্ডার (কল ও কনফার্মেশনের আগের পর্যায়)"
						>
							<div class="flex items-center gap-3">
								<Inbox class="w-4 h-4 {activeTab === 'web_orders' || activeTab === 'orders' ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'}" />
								{#if !isSidebarCollapsed}
									<span>ওয়েব অর্ডার</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed}
								<span class="text-[10px] font-black px-2 py-0.5 rounded-full {activeTab === 'web_orders' || activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}">
									{webOrders.length}
								</span>
							{/if}
						</button>

						<!-- ৩. প্রি-অর্ডার -->
						<button
							onclick={() => { activeTab = 'pre_order'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'pre_order'
								? 'bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white shadow-lg shadow-amber-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="প্রি-অর্ডার"
						>
							<div class="flex items-center gap-3">
								<Calendar class="w-4 h-4 {activeTab === 'pre_order' ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'}" />
								{#if !isSidebarCollapsed}
									<span>প্রি-অর্ডার</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed && preOrders.length > 0}
								<span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
									{preOrders.length}
								</span>
							{/if}
						</button>

						<!-- ৪. অর্ডার তালিকা (Post-Confirmation - Image 2) -->
						<button
							onclick={() => { activeTab = 'order_list'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'order_list'
								? 'bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white shadow-lg shadow-amber-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="অর্ডার তালিকা (কনফার্মেশনের পর কুরিয়ার ও ডেলিভারি পর্যায়)"
						>
							<div class="flex items-center gap-3">
								<ListOrdered class="w-4 h-4 {activeTab === 'order_list' ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'}" />
								{#if !isSidebarCollapsed}
									<span>অর্ডার তালিকা</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed}
								<span class="text-[10px] font-black px-2 py-0.5 rounded-full {activeTab === 'order_list' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700/60'}">
									{orderListOrders.length}
								</span>
							{/if}
						</button>

						<!-- ৫. মুছে ফেলা (Trash) -->
						<button
							onclick={() => { activeTab = 'trash'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'trash'
								? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="মুছে ফেলা অর্ডারসমূহ"
						>
							<div class="flex items-center gap-3">
								<Trash2 class="w-4 h-4 {activeTab === 'trash' ? 'text-white' : 'text-slate-400 group-hover:text-rose-400'}" />
								{#if !isSidebarCollapsed}
									<span>মুছে ফেলা</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed && trashedOrders.length > 0}
								<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
									{trashedOrders.length}
								</span>
							{/if}
						</button>
					</div>
				</div>

				<!-- Section 2: পণ্য ও ইনভেন্টরি -->
				<div>
					{#if !isSidebarCollapsed}
						<div class="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
							পণ্য ও লজিস্টিকস
						</div>
					{/if}

					<div class="space-y-1">
						<!-- ক্যাটালগ ও স্টক -->
						<button
							onclick={() => { activeTab = 'inventory'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'inventory'
								? 'bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white shadow-lg shadow-amber-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="পণ্য ও ইনভেন্টরি"
						>
							<div class="flex items-center gap-3">
								<Package class="w-4 h-4 {activeTab === 'inventory' ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'}" />
								{#if !isSidebarCollapsed}
									<span>পণ্য ক্যাটালগ</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed}
								<span class="text-[10px] font-mono text-slate-400">
									{data.products.length} SKUs
								</span>
							{/if}
						</button>

						<!-- কুরিয়ার হাব -->
						<button
							onclick={() => { activeTab = 'courier'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'courier'
								? 'bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white shadow-lg shadow-amber-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="কুরিয়ার হাব"
						>
							<div class="flex items-center gap-3">
								<Truck class="w-4 h-4 {activeTab === 'courier' ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'}" />
								{#if !isSidebarCollapsed}
									<span>কুরিয়ার ও লজিস্টিকস</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed}
								<span class="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
									Steadfast
								</span>
							{/if}
						</button>
					</div>
				</div>

				<!-- Section 3: গ্রোথ ও সেটিংস -->
				<div>
					{#if !isSidebarCollapsed}
						<div class="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
							গ্রোথ ও সিস্টেম
						</div>
					{/if}

					<div class="space-y-1">
						<!-- পিক্সেল ও ট্র্যাকিং -->
						<button
							onclick={() => { activeTab = 'pixels'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'pixels'
								? 'bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white shadow-lg shadow-amber-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="পিক্সেল ও ট্র্যাকিং"
						>
							<div class="flex items-center gap-3">
								<Radio class="w-4 h-4 {activeTab === 'pixels' ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'}" />
								{#if !isSidebarCollapsed}
									<span>পিক্সেল ও কনভার্সন</span>
								{/if}
							</div>
						</button>

						<!-- গ্রাহক ডেটাবেজ -->
						<button
							onclick={() => { activeTab = 'customers'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'customers'
								? 'bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white shadow-lg shadow-amber-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="গ্রাহক ও ভিআইপি ক্লাব"
						>
							<div class="flex items-center gap-3">
								<Users class="w-4 h-4 {activeTab === 'customers' ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'}" />
								{#if !isSidebarCollapsed}
									<span>গ্রাহক ও ভিআইপি ক্লাব</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed}
								<span class="text-[10px] font-bold text-slate-400">{data.newsletter.length}</span>
							{/if}
						</button>

						<!-- Cloudflare D1 ইঞ্জিন -->
						<button
							onclick={() => { activeTab = 'database'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'database'
								? 'bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white shadow-lg shadow-amber-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="Cloudflare D1 ডেটাবেজ কনসোল"
						>
							<div class="flex items-center gap-3">
								<Database class="w-4 h-4 {activeTab === 'database' ? 'text-white' : 'text-amber-400'}" />
								{#if !isSidebarCollapsed}
									<span>D1 ইঞ্জিন কনসোল</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed}
								<span class="w-2 h-2 rounded-full {data.isD1Connected ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
							{/if}
						</button>
					</div>
				</div>
			</nav>
		</div>

		<!-- Executive Superadmin Card -->
		<div class="p-3 border-t border-slate-800/80 bg-[#0c101a]">
			{#if !isSidebarCollapsed}
				<div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ea580c] to-[#d97706] flex items-center justify-center font-bold text-white text-xs shadow-md">
							<ShieldCheck class="w-4 h-4" />
						</div>
						<div class="flex flex-col">
							<span class="text-xs font-bold text-slate-200">সুপার অ্যাডমিন</span>
							<span class="text-[10px] text-slate-400">admin@haqplus.com</span>
						</div>
					</div>
					<a
						href="/"
						target="_blank"
						class="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
						title="স্টোর দেখুন"
					>
						<ExternalLink class="w-4 h-4" />
					</a>
				</div>
			{:else}
				<div class="flex justify-center">
					<button
						onclick={() => isSidebarCollapsed = false}
						class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
						title="সাইডবার খুলুন"
					>
						<PanelLeftOpen class="w-5 h-5" />
					</button>
				</div>
			{/if}
		</div>
	</aside>

	<!-- MOBILE BACKDROP -->
	{#if isMobileSidebarOpen}
		<button
			type="button"
			onclick={() => isMobileSidebarOpen = false}
			class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden"
			aria-label="Close sidebar"
		></button>
	{/if}

	<!-- ============================================== -->
	<!-- 2. MAIN EXECUTIVE WORKSPACE CANVAS             -->
	<!-- ============================================== -->
	<div class="flex-1 flex flex-col min-w-0 min-h-screen">
		
		<!-- TOP WORKSPACE HEADER (Responsive layout) -->
		<header class="h-16 bg-white/95 backdrop-blur-md border-b border-[#ede5d8] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
			<div class="flex items-center gap-3 sm:gap-4 min-w-0">
				<!-- Mobile Sidebar Toggle -->
				<button
					onclick={() => isMobileSidebarOpen = !isMobileSidebarOpen}
					class="md:hidden p-2 rounded-xl text-slate-700 bg-[#faf7f2] border border-[#ede5d8] hover:bg-[#fff7ed] transition-colors shrink-0"
					aria-label="Open sidebar"
				>
					<Menu class="w-5 h-5" />
				</button>

				<!-- Breadcrumb Header -->
				<div class="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-500 truncate">
					<span class="hidden sm:inline">AURA ড্যাশবোর্ড</span>
					<span class="hidden sm:inline">/</span>
					<span class="text-slate-900 font-bold capitalize truncate">
						{#if activeTab === 'overview'}ওভারভিউ ও অ্যানালিটিক্স
						{:else if activeTab === 'web_orders' || activeTab === 'orders'}ওয়েব অর্ডার
						{:else if activeTab === 'order_list'}অর্ডার তালিকা
						{:else if activeTab === 'pre_order'}প্রি-অর্ডার
						{:else if activeTab === 'new_order'}ম্যানুয়াল অর্ডার
						{:else if activeTab === 'inventory'}প্রোডাক্ট ইনভেন্টরি
						{:else if activeTab === 'courier'}কুরিয়ার লজিস্টিকস
						{:else if activeTab === 'pixels'}পিক্সেল ট্র্যাকিং
						{:else if activeTab === 'customers'}ভিআইপি গ্রাহক
						{:else if activeTab === 'trash'}মুছে ফেলা
						{:else if activeTab === 'database'}D1 সেটিংস
						{/if}
					</span>
				</div>
			</div>

			<!-- Header Right Action Tools -->
			<div class="flex items-center gap-2 sm:gap-3 shrink-0">
				<!-- Live Store Quick Link -->
				<a
					href="/"
					target="_blank"
					class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#ede5d8] text-xs font-bold text-slate-700 bg-white hover:bg-[#fff7ed] hover:border-amber-300 transition-all shadow-2xs"
					title="লাইভ স্টোর ভিজিট"
				>
					<ExternalLink class="w-3.5 h-3.5 text-[#c25e00]" />
					<span class="hidden sm:inline">লাইভ স্টোর</span>
				</a>

				<!-- Quick Create Order Button -->
				<button
					onclick={() => activeTab = 'new_order'}
					class="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#d97706] hover:from-[#c2410c] hover:to-[#b45309] text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all hover:scale-[1.02]"
				>
					<PlusCircle class="w-3.5 h-3.5" />
					<span class="hidden sm:inline">নতুন অর্ডার</span>
					<span class="sm:hidden">অর্ডার</span>
				</button>
			</div>
		</header>

		<!-- Courier Sync Toast Banner (If Triggered) -->
		{#if courierSyncMessage}
			<div class="bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs font-bold shadow-md transition-all">
				<div class="flex items-center gap-2 truncate">
					<RefreshCw class="w-4 h-4 shrink-0 {isCourierSyncing ? 'animate-spin' : ''}" />
					<span class="truncate">{courierSyncMessage}</span>
				</div>
				<button onclick={() => courierSyncMessage = null} class="text-white/80 hover:text-white p-1">
					<X class="w-4 h-4" />
				</button>
			</div>
		{/if}

		<!-- WORKSPACE BODY CONTENT AREA (Full Width & Responsive Padding) -->
		<main class="flex-1 p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
			
			<!-- ============================================== -->
			<!-- TAB 0: EXECUTIVE OVERVIEW                      -->
			<!-- ============================================== -->
			{#if activeTab === 'overview'}
				<!-- 6 KPI Metric Summary Cards (Responsive 2 cols on mobile, 3 on tablet, 6 on desktop) -->
				<div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
					
					<!-- 1. Total Revenue -->
					<div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ede5d8] shadow-[0_2px_10px_rgba(180,83,9,0.03)] hover:shadow-[0_4px_16px_rgba(180,83,9,0.08)] transition-all">
						<div class="flex items-center justify-between mb-1 sm:mb-2">
							<span class="text-[11px] sm:text-xs font-bold text-slate-500">মোট বিক্রয়</span>
							<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#fff7ed] flex items-center justify-center text-[#c25e00]">
								<DollarSign class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							</div>
						</div>
						<div class="text-base sm:text-xl font-black text-[#0f172a] font-['Outfit'] truncate">
							{formatTaka(data.stats.totalRevenue)}
						</div>
						<div class="mt-1 flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600">
							<TrendingUp class="w-3 h-3" />
							<span>+১৮.৪%</span>
						</div>
					</div>

					<!-- 2. Web Orders (Pre-Confirmation) -->
					<button
						onclick={() => activeTab = 'web_orders'}
						class="text-left bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ede5d8] shadow-[0_2px_10px_rgba(180,83,9,0.03)] hover:shadow-[0_4px_16px_rgba(180,83,9,0.08)] transition-all"
					>
						<div class="flex items-center justify-between mb-1 sm:mb-2">
							<span class="text-[11px] sm:text-xs font-bold text-slate-500">ওয়েব অর্ডার</span>
							<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#fffbeb] flex items-center justify-center text-[#b45309]">
								<Inbox class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							</div>
						</div>
						<div class="text-base sm:text-xl font-black text-[#0f172a] font-['Outfit']">
							{webOrders.length} টি
						</div>
						<div class="mt-1 text-[10px] sm:text-[11px] font-bold text-amber-700 truncate">
							কল প্রয়োজন
						</div>
					</button>

					<!-- 3. Confirmed Orders (Order List) -->
					<button
						onclick={() => activeTab = 'order_list'}
						class="text-left bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ede5d8] shadow-[0_2px_10px_rgba(180,83,9,0.03)] hover:shadow-[0_4px_16px_rgba(180,83,9,0.08)] transition-all"
					>
						<div class="flex items-center justify-between mb-1 sm:mb-2">
							<span class="text-[11px] sm:text-xs font-bold text-slate-500">কনফার্মড</span>
							<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#ecfdf5] flex items-center justify-center text-[#047857]">
								<CheckCircle2 class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							</div>
						</div>
						<div class="text-base sm:text-xl font-black text-[#0f172a] font-['Outfit']">
							{orderListOrders.length} টি
						</div>
						<div class="mt-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 truncate">
							ডেলিভারি পাইপলাইন
						</div>
					</button>

					<!-- 4. Delivered Orders -->
					<div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ede5d8] shadow-[0_2px_10px_rgba(180,83,9,0.03)] hover:shadow-[0_4px_16px_rgba(180,83,9,0.08)] transition-all">
						<div class="flex items-center justify-between mb-1 sm:mb-2">
							<span class="text-[11px] sm:text-xs font-bold text-slate-500">ডেলিভারড</span>
							<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#166534]">
								<Truck class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							</div>
						</div>
						<div class="text-base sm:text-xl font-black text-[#0f172a] font-['Outfit']">
							{data.stats.deliveredCount} টি
						</div>
						<div class="mt-1 text-[10px] sm:text-[11px] font-bold text-emerald-600">
							{data.stats.deliveredRate}% সাকসেস
						</div>
					</div>

					<!-- 5. Trashed / Cancelled -->
					<button
						onclick={() => activeTab = 'trash'}
						class="text-left bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ede5d8] shadow-[0_2px_10px_rgba(180,83,9,0.03)] hover:shadow-[0_4px_16px_rgba(180,83,9,0.08)] transition-all"
					>
						<div class="flex items-center justify-between mb-1 sm:mb-2">
							<span class="text-[11px] sm:text-xs font-bold text-slate-500">বাতিল</span>
							<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#fff1f2] flex items-center justify-center text-[#be123c]">
								<Trash2 class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							</div>
						</div>
						<div class="text-base sm:text-xl font-black text-[#0f172a] font-['Outfit']">
							{trashedOrders.length} টি
						</div>
						<div class="mt-1 text-[10px] sm:text-[11px] font-bold text-rose-600">
							{data.stats.cancelledRate}% বাতিল হার
						</div>
					</button>

					<!-- 6. Average Order Value -->
					<div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ede5d8] shadow-[0_2px_10px_rgba(180,83,9,0.03)] hover:shadow-[0_4px_16px_rgba(180,83,9,0.08)] transition-all">
						<div class="flex items-center justify-between mb-1 sm:mb-2">
							<span class="text-[11px] sm:text-xs font-bold text-slate-500">গড় অর্ডার (AOV)</span>
							<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#fff7ed] flex items-center justify-center text-[#c25e00]">
								<Tag class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							</div>
						</div>
						<div class="text-base sm:text-xl font-black text-[#0f172a] font-['Outfit'] truncate">
							{formatTaka(data.stats.aov)}
						</div>
						<div class="mt-1 text-[10px] sm:text-[11px] font-bold text-slate-500 truncate">
							প্রতি কার্ট ভ্যালু
						</div>
					</div>
				</div>

				<!-- Visual Dual Analytics Section -->
				<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
					
					<!-- Left 2 Cols: Smooth Vector Area Sales Spline Chart -->
					<div class="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-[#ede5d8] shadow-[0_2px_12px_rgba(180,83,9,0.03)] flex flex-col justify-between">
						<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-[#ede5d8]">
							<div>
								<h3 class="text-sm font-black text-[#0f172a]">৭ দিনের বিক্রয় ও অর্ডার প্রবাহ</h3>
								<p class="text-xs text-slate-400">লাইভ রেভিনিউ ট্রেন্ড ও ডেলিভারি ট্র্যাকিং</p>
							</div>
							<div class="flex items-center gap-3 text-xs">
								<div class="flex items-center gap-1.5">
									<span class="w-2.5 h-2.5 rounded-full bg-[#ea580c]"></span>
									<span class="text-slate-600 font-bold">বিক্রয়</span>
								</div>
								<div class="flex items-center gap-1.5">
									<span class="w-2.5 h-2.5 rounded-full bg-[#d97706]"></span>
									<span class="text-slate-600 font-bold">অর্ডার</span>
								</div>
							</div>
						</div>

						<!-- Interactive SVG Chart Canvas (Responsive) -->
						<div class="relative w-full h-48 sm:h-56 flex items-center justify-center overflow-x-auto">
							<svg viewBox="0 0 640 220" class="w-full h-full min-w-[500px] sm:min-w-0 overflow-visible">
								<defs>
									<linearGradient id="areaGradientSales" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stop-color="#ea580c" stop-opacity="0.25" />
										<stop offset="100%" stop-color="#ea580c" stop-opacity="0.0" />
									</linearGradient>
								</defs>

								<!-- Grid lines -->
								<line x1="40" y1="40" x2="600" y2="40" stroke="#f4eee4" stroke-dasharray="3 3" />
								<line x1="40" y1="90" x2="600" y2="90" stroke="#f4eee4" stroke-dasharray="3 3" />
								<line x1="40" y1="140" x2="600" y2="140" stroke="#f4eee4" stroke-dasharray="3 3" />
								<line x1="40" y1="190" x2="600" y2="190" stroke="#f4eee4" />

								<!-- Sales Area -->
								<polygon
									points="50,190 50,75 140,165 230,125 320,175 410,95 500,45 590,110 590,190"
									fill="url(#areaGradientSales)"
								/>

								<!-- Sales Spline Line -->
								<polyline
									points="50,75 140,165 230,125 320,175 410,95 500,45 590,110"
									fill="none"
									stroke="#ea580c"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>

								<!-- Orders Line -->
								<polyline
									points="50,70 140,135 230,105 320,150 410,85 500,55 590,105"
									fill="none"
									stroke="#d97706"
									stroke-width="2"
									stroke-dasharray="4 4"
									stroke-linecap="round"
								/>

								<!-- Interactive Points -->
								{#each trendData as pt}
									<circle
										role="button"
										tabindex="0"
										aria-label={`${pt.date}: ${pt.sales} Taka`}
										cx={pt.x}
										cy={pt.ySales}
										r="5"
										fill="#ffffff"
										stroke="#ea580c"
										stroke-width="2.5"
										class="cursor-pointer hover:r-7 transition-all"
										onmouseenter={() => activeChartPoint = pt}
										onmouseleave={() => activeChartPoint = null}
									/>
									<text x={pt.x} y="210" font-size="10" text-anchor="middle" fill="#64748b" font-weight="600">
										{pt.date}
									</text>
								{/each}
							</svg>
						</div>

						<div class="mt-3 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 pt-2 border-t border-[#ede5d8]">
							<span>সর্বোচ্চ সেলস: ২১ অক্টো (৳৫,৯০০)</span>
							<span>সাপ্তাহিক মোট: ৳২২,৮০০</span>
						</div>
					</div>

					<!-- Right 1 Col: Donut Status Ratio -->
					<div class="bg-white p-4 sm:p-5 rounded-2xl border border-[#ede5d8] shadow-[0_2px_12px_rgba(180,83,9,0.03)] flex flex-col justify-between">
						<div>
							<h3 class="text-sm font-black text-[#0f172a]">অর্ডার স্থিতি বিভাজন</h3>
							<p class="text-xs text-slate-400">লাইভ পাইপলাইন অনুপাত</p>
						</div>

						<div class="my-4 flex items-center justify-center">
							<div class="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
								<svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
									<circle cx="50" cy="50" r="40" stroke="#f4eee4" stroke-width="12" fill="none" />
									<circle
										cx="50" cy="50" r="40"
										stroke="#047857" stroke-width="12" fill="none"
										stroke-dasharray="251.2"
										stroke-dashoffset={251.2 * (1 - (data.stats.deliveredCount / (data.orders.length || 1)))}
										stroke-linecap="round"
									/>
								</svg>
								<div class="absolute inset-0 flex flex-col items-center justify-center text-center">
									<span class="text-xl sm:text-2xl font-black text-[#0f172a] font-['Outfit']">{data.stats.deliveredRate}%</span>
									<span class="text-[9px] font-bold text-slate-400 uppercase">ডেলিভারড</span>
								</div>
							</div>
						</div>

						<div class="space-y-2 text-xs">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="w-2.5 h-2.5 rounded-full bg-[#047857]"></span>
									<span class="text-slate-600">ডেলিভারড</span>
								</div>
								<span class="font-bold text-slate-900">{data.stats.deliveredCount} টি</span>
							</div>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="w-2.5 h-2.5 rounded-full bg-[#ea580c]"></span>
									<span class="text-slate-600">ওয়েব অর্ডার</span>
								</div>
								<span class="font-bold text-slate-900">{webOrders.length} টি</span>
							</div>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="w-2.5 h-2.5 rounded-full bg-[#be123c]"></span>
									<span class="text-slate-600">বাতিল</span>
								</div>
								<span class="font-bold text-slate-900">{trashedOrders.length} টি</span>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- ============================================================== -->
			<!-- TAB 1: ওয়েব অর্ডার (Pre-Confirmation - Image 1 + Responsive)    -->
			<!-- ============================================================== -->
			{#if activeTab === 'web_orders' || activeTab === 'orders'}
				<div class="space-y-3 sm:space-y-4">
					
					<!-- Top Pre-Confirmation Status Filter Tabs (Swipeable on Mobile) -->
					<div class="flex items-center gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none">
						{#each WEB_ORDER_STATUS_TABS as tab}
							{@const count = tab.id === 'all' 
								? webOrders.length 
								: tab.id === 'good_no_response'
									? webOrders.filter(o => o.status === 'good_no_response' || o.status === 'no_response_3').length
									: webOrders.filter(o => o.status === tab.id).length}
							<button
								onclick={() => webStatusFilter = tab.id}
								class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold shrink-0 transition-all shadow-2xs border {webStatusFilter === tab.id
									? 'bg-[#fffbeb] text-[#92400e] border-[#f59e0b] ring-1 ring-[#f59e0b]/40 shadow-xs'
									: 'bg-white hover:bg-[#faf7f2] text-slate-700 border-[#ede5d8]'}"
							>
								<tab.icon class="w-3.5 h-3.5 {webStatusFilter === tab.id ? 'text-[#b45309]' : 'text-slate-400'}" />
								<span>{tab.label}</span>
								<span class="text-[11px] font-extrabold {webStatusFilter === tab.id ? 'text-[#b45309]' : 'text-slate-400'}">
									({count})
								</span>
							</button>
						{/each}
					</div>

					<!-- Subheader Search and Date Filter Ribbon (Responsive Stacking) -->
					<div class="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#ede5d8] shadow-[0_2px_10px_rgba(180,83,9,0.03)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
						<div class="relative flex-1 max-w-md">
							<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
							<input
								type="text"
								bind:value={orderSearchQuery}
								placeholder="অর্ডার আইডি, নাম বা ফোন..."
								class="w-full bg-[#faf7f2] border border-[#ede5d8] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#c25e00] focus:bg-white transition-all shadow-2xs"
							/>
						</div>

						<div class="flex items-center gap-2">
							<div class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#faf7f2] border border-[#ede5d8] text-xs font-bold text-slate-700 flex-1 sm:flex-none">
								<Clock class="w-3.5 h-3.5 text-slate-400 shrink-0" />
								<select
									bind:value={activeDateFilter}
									class="bg-transparent focus:outline-none cursor-pointer w-full text-xs"
								>
									<option value="all">সব সময়</option>
									<option value="today">আজকের অর্ডার</option>
									<option value="yesterday">গতকালকের অর্ডার</option>
									<option value="7days">বিগত ৭ দিন</option>
									<option value="30days">বিগত ৩০ দিন</option>
								</select>
							</div>

							<button
								onclick={() => activeTab = 'new_order'}
								class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#d97706] hover:from-[#c2410c] hover:to-[#b45309] text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all shrink-0"
							>
								<PlusCircle class="w-4 h-4" />
								<span class="hidden sm:inline">নতুন অর্ডার</span>
								<span class="sm:hidden">নতুন</span>
							</button>
						</div>
					</div>

					<!-- Web Orders Container: DUAL VIEW (Mobile Cards + Desktop Table) -->
					<div class="bg-white rounded-2xl border border-[#ede5d8] overflow-hidden shadow-[0_2px_12px_rgba(180,83,9,0.03)]">
						
						<!-- 1. DESKTOP TABLE VIEW (Visible on >= 768px) -->
						<div class="hidden md:block overflow-x-auto">
							<table class="w-full text-left text-xs">
								<thead>
									<tr class="border-b border-[#ede5d8] bg-[#faf7f2]/90 text-slate-500 font-bold">
										<th class="py-3 px-4">অর্ডার</th>
										<th class="py-3 px-4">নাম</th>
										<th class="py-3 px-4">লোকেশন</th>
										<th class="py-3 px-4">নাম্বার</th>
										<th class="py-3 px-4">পণ্য</th>
										<th class="py-3 px-4">মোট</th>
										<th class="py-3 px-4">স্ট্যাটাস</th>
										<th class="py-3 px-4 text-center">এডিট</th>
										<th class="py-3 px-4 text-right">সোর্স</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-[#f4eee4]">
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

										<tr class="hover:bg-[#fbf9f5] transition-colors group">
											
											<!-- অর্ডার কলাম (আইডি + সময়) -->
											<td class="py-3 px-4 font-bold align-top">
												<div class="text-[#047857] font-mono font-bold text-sm">
													{order.id}
												</div>
												<div class="text-[10px] text-slate-400 font-normal">
													{firstItem.timeAgo || '12 minutes ago'}
												</div>
											</td>

											<!-- নাম -->
											<td class="py-3 px-4 align-top">
												<span class="font-bold text-[#0f172a] block max-w-[150px] truncate">
													{order.customerName}
												</span>
											</td>

											<!-- লোকেশন -->
											<td class="py-3 px-4 align-top max-w-[220px]">
												<span class="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
													{order.shippingAddress}
												</span>
											</td>

											<!-- নাম্বার ও ডেলিভারি সাকসেস রেশিও (Steadfast Ratio Pill) -->
											<td class="py-3 px-4 align-top">
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

												<!-- Steadfast Ratio Pill (30 | 2 | 95%) -->
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

											<!-- পণ্য বিবরণ থাম্বনেইল -->
											<td class="py-3 px-4 align-top">
												<div class="flex items-center gap-2">
													<div class="w-8 h-8 rounded-lg bg-[#faf7f2] border border-[#ede5d8] overflow-hidden shrink-0 flex items-center justify-center">
														<Package class="w-4 h-4 text-[#c25e00]" />
													</div>
													<div class="text-[11px] font-medium text-slate-700 truncate max-w-[120px]">
														{firstItem.name || 'AURA প্রডাক্ট'}
														{#if parsedItems.length > 1}
															<span class="text-[10px] text-slate-400 block">& More {parsedItems.length - 1}</span>
														{/if}
													</div>
												</div>
											</td>

											<!-- মোট টাকা -->
											<td class="py-3 px-4 align-top font-bold text-[#0f172a] whitespace-nowrap">
												{formatTaka(order.total)}
											</td>

											<!-- ইনলাইন স্ট্যাটাস ড্রপডাউন -->
											<td class="py-3 px-4 align-top">
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

											<!-- এডিট ও কুইক অ্যাকশন আইকন বাটন -->
											<td class="py-3 px-4 align-top text-center">
												<div class="flex items-center justify-center gap-1">
													
													<!-- Edit Icon -->
													<button
														onclick={() => activeTab = 'new_order'}
														class="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-[#faf7f2] transition-colors"
														title="এডিট"
													>
														<FileEdit class="w-3.5 h-3.5" />
													</button>

													<!-- Quick Confirm Checkmark Button -->
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

													<!-- Quick Cancel Cross Button -->
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

													<!-- Delete to Trash Button -->
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

											<!-- সোর্স -->
											<td class="py-3 px-4 align-top text-right whitespace-nowrap">
												<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold {firstItem.source === 'Facebook' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}">
													{firstItem.source || 'Direct'}
												</span>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<!-- 2. MOBILE CARD VIEW (Visible on < 768px: 100% Touch-Friendly Responsiveness) -->
						<div class="md:hidden divide-y divide-[#ede5d8]/80">
							{#if filteredWebOrders.length === 0}
								<div class="py-12 text-center text-slate-400 text-xs">
									কোনো ওয়েব অর্ডার পাওয়া যায়নি।
								</div>
							{/if}

							{#each filteredWebOrders as order (order.id)}
								{@const parsedItems = parseItems(order.items)}
								{@const firstItem = parsedItems[0] || {}}
								{@const statusStyle = getStatusInfo(order.status)}

								<div class="p-3.5 space-y-3 hover:bg-[#faf7f2]/50 transition-colors">
									
									<!-- Card Top Row: Order ID, Time, Source, and Status Dropdown -->
									<div class="flex items-center justify-between gap-2">
										<div class="flex items-center gap-1.5 flex-wrap">
											<span class="text-[#047857] font-mono font-bold text-sm">#{order.id}</span>
											<span class="text-[10px] text-slate-400">{firstItem.timeAgo || '12m ago'}</span>
											<span class="px-1.5 py-0.2 rounded-full text-[9px] font-bold {firstItem.source === 'Facebook' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}">
												{firstItem.source || 'Direct'}
											</span>
										</div>

										<!-- Touch-Friendly Status Dropdown -->
										<form method="POST" action="?/updateOrderStatus" use:enhance class="inline-block shrink-0">
											<input type="hidden" name="orderId" value={order.id} />
											<div class="relative inline-flex items-center">
												<select
													name="status"
													value={order.status === 'no_response_3' ? 'good_no_response' : order.status}
													onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
													class="pl-6 pr-5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer appearance-none {statusStyle.bg} {statusStyle.text} {statusStyle.border} focus:outline-none"
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
												<statusStyle.icon class="w-3.5 h-3.5 absolute left-1.5 pointer-events-none {statusStyle.text}" />
												<ChevronDown class="w-3 h-3 absolute right-1.5 pointer-events-none text-slate-400" />
											</div>
										</form>
									</div>

									<!-- Customer Info Box with 1-Tap Dial Button -->
									<div class="flex items-start justify-between gap-2 bg-[#faf7f2] p-2.5 rounded-xl border border-[#ede5d8]">
										<div class="space-y-0.5 min-w-0 flex-1">
											<div class="font-bold text-xs text-[#0f172a] truncate">{order.customerName}</div>
											
											<!-- Phone + Steadfast Success Ratio -->
											<div class="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 flex-wrap">
												<span>{order.customerEmail}</span>
												{#if firstItem.successRate}
													<span class="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-300">
														{firstItem.successRate.delivered}|{firstItem.successRate.returned}|{firstItem.successRate.percent}%
													</span>
												{/if}
											</div>

											<!-- Address -->
											<div class="flex items-start gap-1 text-[11px] text-slate-500 pt-0.5">
												<MapPin class="w-3 h-3 shrink-0 text-slate-400 mt-0.5" />
												<span class="line-clamp-2 leading-tight">{order.shippingAddress}</span>
											</div>
										</div>

										<!-- Direct 1-Tap Phone Call -->
										<a
											href="tel:{order.customerEmail}"
											class="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 shadow-2xs shrink-0 flex items-center justify-center transition-colors"
											title="সরাসরি কল দিন"
										>
											<PhoneCall class="w-4 h-4" />
										</a>
									</div>

									<!-- Product & Total Price Row -->
									<div class="flex items-center justify-between text-xs pt-1">
										<div class="flex items-center gap-2 min-w-0">
											<div class="w-7 h-7 rounded-lg bg-[#faf7f2] border border-[#ede5d8] flex items-center justify-center shrink-0">
												<Package class="w-3.5 h-3.5 text-[#c25e00]" />
											</div>
											<div class="text-[11px] font-medium text-slate-700 truncate">
												{firstItem.name || 'AURA প্রডাক্ট'}
												{#if parsedItems.length > 1}
													<span class="text-[10px] text-slate-400"> +{parsedItems.length - 1} টি</span>
												{/if}
											</div>
										</div>

										<div class="text-sm font-black text-[#0f172a] whitespace-nowrap font-['Outfit']">
											{formatTaka(order.total)}
										</div>
									</div>

									<!-- Touch Action Buttons Grid -->
									<div class="grid grid-cols-4 gap-1.5 pt-2 border-t border-[#ede5d8]">
										<!-- 1. Quick Confirm Button -->
										<form method="POST" action="?/quickConfirmOrder" use:enhance class="w-full">
											<input type="hidden" name="orderId" value={order.id} />
											<button
												type="submit"
												class="w-full py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors"
											>
												<CheckCircle2 class="w-3.5 h-3.5" />
												<span>কনফার্ম</span>
											</button>
										</form>

										<!-- 2. Edit Button -->
										<button
											onclick={() => activeTab = 'new_order'}
											class="w-full py-1.5 px-2 rounded-xl bg-[#faf7f2] border border-[#ede5d8] text-slate-700 hover:bg-white font-bold text-xs flex items-center justify-center gap-1"
										>
											<FileEdit class="w-3.5 h-3.5 text-slate-500" />
											<span>এডিট</span>
										</button>

										<!-- 3. Cancel Button -->
										<form method="POST" action="?/quickCancelOrder" use:enhance class="w-full">
											<input type="hidden" name="orderId" value={order.id} />
											<button
												type="submit"
												class="w-full py-1.5 px-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1"
											>
												<XCircle class="w-3.5 h-3.5 text-rose-600" />
												<span>বাতিল</span>
											</button>
										</form>

										<!-- 4. Trash Button -->
										<form method="POST" action="?/deleteOrder" use:enhance class="w-full">
											<input type="hidden" name="orderId" value={order.id} />
											<button
												type="submit"
												class="w-full py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs flex items-center justify-center gap-1"
											>
												<Trash2 class="w-3.5 h-3.5 text-slate-500" />
												<span>মুছুন</span>
											</button>
										</form>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}

			<!-- ============================================================== -->
			<!-- TAB 2: অর্ডার তালিকা (Post-Confirmation - Image 2 + Responsive) -->
			<!-- ============================================================== -->
			{#if activeTab === 'order_list'}
				<div class="space-y-3 sm:space-y-4">
					
					<!-- Top Post-Confirmation Status Filter Tabs (Swipeable on Mobile) -->
					<div class="flex items-center gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none">
						{#each ORDER_LIST_STATUS_TABS as tab}
							{@const count = tab.id === 'all' 
								? orderListOrders.length 
								: orderListOrders.filter(o => o.status === tab.id).length}
							<button
								onclick={() => orderListStatusFilter = tab.id}
								class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold shrink-0 transition-all shadow-2xs border {orderListStatusFilter === tab.id
									? 'bg-[#fffbeb] text-[#92400e] border-[#f59e0b] ring-1 ring-[#f59e0b]/40 shadow-xs'
									: 'bg-white hover:bg-[#faf7f2] text-slate-700 border-[#ede5d8]'}"
							>
								<tab.icon class="w-3.5 h-3.5 {orderListStatusFilter === tab.id ? 'text-[#b45309]' : 'text-slate-400'}" />
								<span>{tab.label}</span>
								<span class="text-[11px] font-extrabold {orderListStatusFilter === tab.id ? 'text-[#b45309]' : 'text-slate-400'}">
									({count})
								</span>
							</button>
						{/each}
					</div>

					<!-- Subheader Bar with Courier Sync Button (Responsive Stacking) -->
					<div class="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#ede5d8] shadow-[0_2px_10px_rgba(180,83,9,0.03)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
						<div class="relative flex-1 max-w-md">
							<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
							<input
								type="text"
								bind:value={orderSearchQuery}
								placeholder="অর্ডার আইডি, নাম বা ফোন..."
								class="w-full bg-[#faf7f2] border border-[#ede5d8] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#c25e00] focus:bg-white transition-all shadow-2xs"
							/>
						</div>

						<div class="flex items-center gap-2">
							<!-- Date Filter Dropdown -->
							<div class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#faf7f2] border border-[#ede5d8] text-xs font-bold text-slate-700 flex-1 sm:flex-none">
								<Clock class="w-3.5 h-3.5 text-slate-400 shrink-0" />
								<select
									bind:value={activeDateFilter}
									class="bg-transparent focus:outline-none cursor-pointer w-full text-xs"
								>
									<option value="all">সব সময়</option>
									<option value="today">আজ</option>
									<option value="yesterday">গতকাল</option>
									<option value="7days">বিগত ৭ দিন</option>
									<option value="30days">বিগত ৩০ দিন</option>
								</select>
							</div>

							<!-- Courier Sync Button (Matches Image 2: কুরিয়ার সিঙ্ক) -->
							<button
								onclick={triggerCourierSync}
								disabled={isCourierSyncing}
								class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#faf7f2] hover:bg-[#fff7ed] border border-[#ede5d8] hover:border-amber-400 text-slate-800 font-bold text-xs shadow-2xs transition-all shrink-0"
							>
								<RefreshCw class="w-3.5 h-3.5 text-[#c25e00] {isCourierSyncing ? 'animate-spin' : ''}" />
								<span>কুরিয়ার সিঙ্ক</span>
							</button>
						</div>
					</div>

					<!-- Post-Confirmation Orders Container: DUAL VIEW (Mobile Cards + Desktop Table) -->
					<div class="bg-white rounded-2xl border border-[#ede5d8] overflow-hidden shadow-[0_2px_12px_rgba(180,83,9,0.03)]">
						
						<!-- 1. DESKTOP TABLE VIEW (Visible on >= 768px) -->
						<div class="hidden md:block overflow-x-auto">
							<table class="w-full text-left text-xs">
								<thead>
									<tr class="border-b border-[#ede5d8] bg-[#faf7f2]/90 text-slate-500 font-bold">
										<th class="py-3 px-3 w-8">
											<input
												type="checkbox"
												checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrderList.length}
												onchange={toggleSelectAllOrderList}
												class="rounded text-amber-600 focus:ring-amber-500"
											/>
										</th>
										<th class="py-3 px-3">কনফার্ম</th>
										<th class="py-3 px-4">অর্ডার</th>
										<th class="py-3 px-4">কাস্টমার</th>
										<th class="py-3 px-4">নাম্বার</th>
										<th class="py-3 px-4">পণ্য</th>
										<th class="py-3 px-4">সোর্স</th>
										<th class="py-3 px-4">মোট</th>
										<th class="py-3 px-4">স্ট্যাটাস</th>
										<th class="py-3 px-3 text-center">সিঙ্ক</th>
										<th class="py-3 px-3 text-center">ট্যাগ</th>
										<th class="py-3 px-4 text-right">অ্যাকশন</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-[#f4eee4]">
									{#if filteredOrderList.length === 0}
										<tr>
											<td colspan="12" class="py-16 text-center text-slate-400">
												কোনো কনফার্মড অর্ডার পাওয়া যায়নি।
											</td>
										</tr>
									{/if}

									{#each filteredOrderList as order (order.id)}
										{@const parsedItems = parseItems(order.items)}
										{@const firstItem = parsedItems[0] || {}}
										{@const statusStyle = getStatusInfo(order.status)}
										{@const isSelected = selectedOrderIds.includes(order.id)}

										<tr class="hover:bg-[#fbf9f5] transition-colors {isSelected ? 'bg-amber-50/40' : ''}">
											
											<!-- Checkbox -->
											<td class="py-3 px-3 align-top">
												<input
													type="checkbox"
													checked={isSelected}
													onchange={() => toggleSelectOrder(order.id)}
													class="rounded text-amber-600 focus:ring-amber-500 mt-0.5"
												/>
											</td>

											<!-- কনফার্ম সময় -->
											<td class="py-3 px-3 align-top whitespace-nowrap text-slate-500">
												{firstItem.confirmedAt || firstItem.timeAgo || '১ দিন আগে'}
											</td>

											<!-- অর্ডার ও সাব-স্ট্যাটাস ব্যাজ (INV-1227 + partial_delivered) -->
											<td class="py-3 px-4 align-top">
												<div class="font-bold text-[#0f172a] font-mono">
													{order.id}
												</div>
												<div class="mt-1 inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
													<FileText class="w-2.5 h-2.5" />
													<span>{firstItem.subStatus || order.status}</span>
												</div>
											</td>

											<!-- কাস্টমার নাম ও ঠিকানা -->
											<td class="py-3 px-4 align-top max-w-[200px]">
												<span class="font-bold text-[#0f172a] block">
													{order.customerName}
												</span>
												<span class="text-slate-500 text-[11px] line-clamp-1">
													{order.shippingAddress}
												</span>
											</td>

											<!-- ফোন নাম্বার -->
											<td class="py-3 px-4 align-top font-mono font-bold text-slate-800 whitespace-nowrap">
												{order.customerEmail}
											</td>

											<!-- পণ্য থাম্বনেইল -->
											<td class="py-3 px-4 align-top">
												<div class="w-7 h-7 rounded-md bg-[#faf7f2] border border-[#ede5d8] flex items-center justify-center">
													<Package class="w-3.5 h-3.5 text-[#c25e00]" />
												</div>
											</td>

											<!-- সোর্স (Facebook / Direct) -->
											<td class="py-3 px-4 align-top">
												<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
													{firstItem.source || 'Facebook'}
												</span>
											</td>

											<!-- মোট টাকা -->
											<td class="py-3 px-4 align-top font-bold text-[#0f172a] whitespace-nowrap">
												{formatTaka(order.total)}
											</td>

											<!-- ইনলাইন স্ট্যাটাস ড্রপডাউন (Post-Confirmation) -->
											<td class="py-3 px-4 align-top">
												<form method="POST" action="?/updateOrderStatus" use:enhance class="inline-block">
													<input type="hidden" name="orderId" value={order.id} />
													<div class="relative inline-flex items-center">
														<select
															name="status"
															value={order.status}
															onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
															class="pl-6 pr-6 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer appearance-none {statusStyle.bg} {statusStyle.text} {statusStyle.border} focus:outline-none"
														>
															<option value="confirmed">কনফার্মড</option>
															<option value="printed">প্রিন্টেড</option>
															<option value="entry_done">এন্ট্রি ডান</option>
															<option value="shipped">শিপড</option>
															<option value="delivered">ডেলিভারড</option>
															<option value="partial_delivered">পার্শিয়াল</option>
															<option value="pending_return">পেন্ডিং রিটার্ন</option>
															<option value="returned">রিটার্ন</option>
															<option value="cancelled">বাতিল</option>
															<option value="missing">মিসিং</option>
														</select>
														<statusStyle.icon class="w-3.5 h-3.5 absolute left-2 pointer-events-none {statusStyle.text}" />
														<ChevronDown class="w-3 h-3 absolute right-2 pointer-events-none text-slate-400" />
													</div>
												</form>
											</td>

											<!-- সিঙ্ক আইকন -->
											<td class="py-3 px-3 align-top text-center">
												<button
													onclick={triggerCourierSync}
													class="p-1 text-slate-400 hover:text-[#c25e00] rounded hover:bg-[#faf7f2] transition-colors"
													title="কুরিয়ার সিঙ্ক করুন"
												>
													<RefreshCw class="w-3.5 h-3.5" />
												</button>
											</td>

											<!-- ট্যাগ (Copy) -->
											<td class="py-3 px-3 align-top text-center">
												<button
													onclick={() => copyToClipboard(`${order.id} - ${order.customerName} - ${order.customerEmail}`, order.id)}
													class="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-[#faf7f2] transition-colors"
													title="কপি করুন"
												>
													{#if isCopied === order.id}
														<Check class="w-3.5 h-3.5 text-emerald-600" />
													{:else}
														<Copy class="w-3.5 h-3.5" />
													{/if}
												</button>
											</td>

											<!-- অ্যাকশন (View / Edit) -->
											<td class="py-3 px-4 align-top text-right">
												<div class="flex items-center justify-end gap-1">
													<button
														class="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-[#faf7f2]"
														title="ইনভয়েস প্রিন্ট"
													>
														<Printer class="w-3.5 h-3.5" />
													</button>
													<button
														onclick={() => activeTab = 'new_order'}
														class="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-[#faf7f2]"
														title="এডিট"
													>
														<FileEdit class="w-3.5 h-3.5" />
													</button>
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<!-- 2. MOBILE CARD VIEW FOR ORDER LIST (Visible on < 768px: 100% Responsive) -->
						<div class="md:hidden divide-y divide-[#ede5d8]/80">
							{#if filteredOrderList.length === 0}
								<div class="py-12 text-center text-slate-400 text-xs">
									কোনো কনফার্মড অর্ডার পাওয়া যায়নি।
								</div>
							{/if}

							{#each filteredOrderList as order (order.id)}
								{@const parsedItems = parseItems(order.items)}
								{@const firstItem = parsedItems[0] || {}}
								{@const statusStyle = getStatusInfo(order.status)}
								{@const isSelected = selectedOrderIds.includes(order.id)}

								<div class="p-3.5 space-y-3 hover:bg-[#faf7f2]/50 transition-colors {isSelected ? 'bg-amber-50/40' : ''}">
									
									<!-- Card Top Row: Checkbox, Invoice ID, Courier Sub-status, Time -->
									<div class="flex items-center justify-between gap-2">
										<div class="flex items-center gap-2">
											<input
												type="checkbox"
												checked={isSelected}
												onchange={() => toggleSelectOrder(order.id)}
												class="rounded text-amber-600 focus:ring-amber-500"
											/>
											<span class="font-bold text-[#0f172a] font-mono text-sm">{order.id}</span>
											<span class="text-[10px] text-slate-400">{firstItem.confirmedAt || firstItem.timeAgo || '১ দিন আগে'}</span>
										</div>

										<!-- Substatus badge -->
										<div class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
											<FileText class="w-2.5 h-2.5" />
											<span>{firstItem.subStatus || order.status}</span>
										</div>
									</div>

									<!-- Customer Info & Address -->
									<div class="bg-[#faf7f2] p-2.5 rounded-xl border border-[#ede5d8] space-y-1">
										<div class="flex items-center justify-between">
											<span class="font-bold text-xs text-[#0f172a]">{order.customerName}</span>
											<span class="font-mono text-xs font-bold text-slate-700">{order.customerEmail}</span>
										</div>
										<div class="flex items-start gap-1 text-[11px] text-slate-500">
											<MapPin class="w-3 h-3 shrink-0 text-slate-400 mt-0.5" />
											<span class="line-clamp-2 leading-tight">{order.shippingAddress}</span>
										</div>
									</div>

									<!-- Product & Price Row -->
									<div class="flex items-center justify-between text-xs">
										<div class="flex items-center gap-2">
											<div class="w-7 h-7 rounded-md bg-[#faf7f2] border border-[#ede5d8] flex items-center justify-center">
												<Package class="w-3.5 h-3.5 text-[#c25e00]" />
											</div>
											<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
												{firstItem.source || 'Facebook'}
											</span>
										</div>

										<div class="text-sm font-black text-[#0f172a] font-['Outfit']">
											{formatTaka(order.total)}
										</div>
									</div>

									<!-- Status Dropdown & Action Icons Row -->
									<div class="flex items-center justify-between gap-2 pt-2 border-t border-[#ede5d8]">
										<!-- Status Dropdown -->
										<form method="POST" action="?/updateOrderStatus" use:enhance class="flex-1">
											<input type="hidden" name="orderId" value={order.id} />
											<div class="relative flex items-center">
												<select
													name="status"
													value={order.status}
													onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
													class="w-full pl-6 pr-5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer appearance-none {statusStyle.bg} {statusStyle.text} {statusStyle.border} focus:outline-none"
												>
													<option value="confirmed">কনফার্মড</option>
													<option value="printed">প্রিন্টেড</option>
													<option value="entry_done">এন্ট্রি ডান</option>
													<option value="shipped">শিপড</option>
													<option value="delivered">ডেলিভারড</option>
													<option value="partial_delivered">পার্শিয়াল</option>
													<option value="pending_return">পেন্ডিং রিটার্ন</option>
													<option value="returned">রিটার্ন</option>
													<option value="cancelled">বাতিল</option>
													<option value="missing">মিসিং</option>
												</select>
												<statusStyle.icon class="w-3.5 h-3.5 absolute left-1.5 pointer-events-none {statusStyle.text}" />
												<ChevronDown class="w-3 h-3 absolute right-1.5 pointer-events-none text-slate-400" />
											</div>
										</form>

										<!-- Quick Action Buttons -->
										<div class="flex items-center gap-1 shrink-0">
											<button
												onclick={triggerCourierSync}
												class="p-2 text-slate-600 hover:text-[#c25e00] rounded-xl bg-[#faf7f2] border border-[#ede5d8]"
												title="কুরিয়ার সিঙ্ক"
											>
												<RefreshCw class="w-3.5 h-3.5" />
											</button>

											<button
												onclick={() => copyToClipboard(`${order.id} - ${order.customerName} - ${order.customerEmail}`, order.id)}
												class="p-2 text-slate-600 hover:text-slate-900 rounded-xl bg-[#faf7f2] border border-[#ede5d8]"
												title="কপি"
											>
												{#if isCopied === order.id}
													<Check class="w-3.5 h-3.5 text-emerald-600" />
												{:else}
													<Copy class="w-3.5 h-3.5" />
												{/if}
											</button>

											<button
												class="p-2 text-slate-600 hover:text-slate-900 rounded-xl bg-[#faf7f2] border border-[#ede5d8]"
												title="প্রিন্ট"
											>
												<Printer class="w-3.5 h-3.5" />
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}

			<!-- ============================================== -->
			<!-- TAB 3: NEW MANUAL ORDER FORM                  -->
			<!-- ============================================== -->
			{#if activeTab === 'new_order'}
				<div class="max-w-2xl bg-white p-4 sm:p-6 rounded-2xl border border-[#ede5d8] shadow-[0_2px_12px_rgba(180,83,9,0.03)] space-y-6">
					<div class="border-b border-[#ede5d8] pb-4 flex items-center justify-between">
						<div>
							<h3 class="text-base font-black text-[#0f172a]">ম্যানুয়াল কাস্টমার অর্ডার এন্ট্রি</h3>
							<p class="text-xs text-slate-400">সরাসরি ফোন কল বা অফলাইন থেকে অর্ডার সংরক্ষণ করুন</p>
						</div>
						<button
							onclick={() => activeTab = 'web_orders'}
							class="text-xs font-bold text-slate-500 hover:text-slate-800"
						>
							বাতিল
						</button>
					</div>

					<form method="POST" action="?/createManualOrder" use:enhance class="space-y-4 text-xs">
						<div class="space-y-1.5">
							<label for="order-customer-name" class="text-xs font-bold text-slate-700">কাস্টমার পুরো নাম *</label>
							<input
								id="order-customer-name"
								type="text"
								name="customerName"
								placeholder="উদাঃ মোঃ রফিকুল ইসলাম"
								required
								class="w-full bg-[#faf7f2] border border-[#ede5d8] rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#c25e00]"
							/>
						</div>

						<div class="space-y-1.5">
							<label for="order-customer-phone" class="text-xs font-bold text-slate-700">মোবাইল নম্বর *</label>
							<input
								id="order-customer-phone"
								type="text"
								name="customerEmail"
								placeholder="উদাঃ 01711223344"
								required
								class="w-full bg-[#faf7f2] border border-[#ede5d8] rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#c25e00]"
							/>
						</div>

						<div class="space-y-1.5">
							<label for="order-shipping-address" class="text-xs font-bold text-slate-700">ডেলিভারি পূর্ণ ঠিকানা ও জেলা *</label>
							<textarea
								id="order-shipping-address"
								name="shippingAddress"
								rows="3"
								placeholder="বাড়ি নং, রোড নং, এলাকা, থানা ও জেলা..."
								required
								class="w-full bg-[#faf7f2] border border-[#ede5d8] rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#c25e00]"
							></textarea>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div class="space-y-1.5">
								<label for="order-product-name" class="text-xs font-bold text-slate-700">পণ্য নির্বাচন</label>
								<select
									id="order-product-name"
									name="productName"
									class="w-full bg-[#faf7f2] border border-[#ede5d8] rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#c25e00]"
								>
									{#each data.products as prod}
										<option value={prod.name}>{prod.name} - {formatTaka(prod.price)}</option>
									{/each}
								</select>
							</div>

							<div class="space-y-1.5">
								<label for="order-total-price" class="text-xs font-bold text-slate-700">মোট টাকা (টাকা)</label>
								<input
									id="order-total-price"
									type="number"
									name="total"
									value="1200"
									required
									class="w-full bg-[#faf7f2] border border-[#ede5d8] rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#c25e00]"
								/>
							</div>
						</div>

						<div class="pt-4 flex items-center justify-end gap-3">
							<button
								type="button"
								onclick={() => activeTab = 'web_orders'}
								class="px-4 py-2 rounded-xl border border-[#ede5d8] text-slate-600 hover:bg-[#faf7f2] font-bold text-xs"
							>
								ফিরে যান
							</button>
							<button
								type="submit"
								class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white font-bold text-xs shadow-md shadow-amber-600/20"
							>
								অর্ডার সংরক্ষণ করুন
							</button>
						</div>
					</form>
				</div>
			{/if}

			<!-- ============================================== -->
			<!-- TAB 4: TRASH (মুছে ফেলা ও বাতিল)               -->
			<!-- ============================================== -->
			{#if activeTab === 'trash'}
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-black text-[#0f172a]">মুছে ফেলা ও বাতিলকৃত অর্ডারসমূহ</h3>
							<p class="text-xs text-slate-400">প্রয়োজনে পুনরুদ্ধার বা স্থায়ীভাবে মুছে ফেলার সুবিধা</p>
						</div>
					</div>

					<div class="bg-white rounded-2xl border border-[#ede5d8] overflow-hidden shadow-2xs">
						<table class="w-full text-left text-xs">
							<thead>
								<tr class="border-b border-[#ede5d8] bg-[#faf7f2]/90 text-slate-500 font-bold">
									<th class="py-3 px-4">অর্ডার আইডি</th>
									<th class="py-3 px-4">গ্রাহক</th>
									<th class="py-3 px-4">ঠিকানা</th>
									<th class="py-3 px-4">মূল্য</th>
									<th class="py-3 px-4 text-right">অ্যাকশন</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-[#f4eee4]">
								{#if trashedOrders.length === 0}
									<tr>
										<td colspan="5" class="py-12 text-center text-slate-400">
											ট্র্যাশে কোনো অর্ডার নেই।
										</td>
									</tr>
								{/if}
								{#each trashedOrders as tOrder}
									<tr class="hover:bg-[#faf7f2]/50">
										<td class="py-3 px-4 font-mono font-bold text-slate-700">{tOrder.id}</td>
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
				</div>
			{/if}

			<!-- ============================================== -->
			<!-- TAB 5: INVENTORY & STOCK MANAGEMENT           -->
			<!-- ============================================== -->
			{#if activeTab === 'inventory'}
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-black text-[#0f172a]">পণ্য ক্যাটালগ ও স্টক নিয়ন্ত্রণ</h3>
							<p class="text-xs text-slate-400">লাইভ ইনভেন্টরি ও ইন-স্টক সুইচ</p>
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each data.products as prod}
							<div class="bg-white p-5 rounded-2xl border border-[#ede5d8] shadow-2xs space-y-4">
								<div class="flex items-center justify-between">
									<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-[#c25e00] border border-amber-200">
										{prod.badge || 'PRO'}
									</span>
									<span class="text-xs font-mono font-bold {prod.inStock ? 'text-emerald-600' : 'text-rose-600'}">
										{prod.inStock ? 'স্টকে আছে' : 'স্টক শেষ'}
									</span>
								</div>

								<div>
									<h4 class="font-bold text-sm text-[#0f172a]">{prod.name}</h4>
									<p class="text-xs text-slate-500 line-clamp-2 mt-1">{prod.tagline}</p>
								</div>

								<div class="flex items-center justify-between pt-3 border-t border-[#ede5d8]">
									<span class="font-bold text-base text-[#0f172a]">{formatTaka(prod.price)}</span>
									
									<form method="POST" action="?/toggleProductStock" use:enhance>
										<input type="hidden" name="productId" value={prod.id} />
										<input type="hidden" name="inStock" value={(!prod.inStock).toString()} />
										<button
											type="submit"
											class="px-3 py-1.5 rounded-xl font-bold text-xs {prod.inStock ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'} transition-colors"
										>
											{prod.inStock ? 'আউট অফ স্টক করুন' : 'ইন-স্টক করুন'}
										</button>
									</form>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- ============================================== -->
			<!-- TAB 6: COURIER & LOGISTICS HUB                 -->
			<!-- ============================================== -->
			{#if activeTab === 'courier'}
				<div class="max-w-2xl bg-white p-4 sm:p-6 rounded-2xl border border-[#ede5d8] shadow-2xs space-y-6">
					<div>
						<h3 class="text-base font-black text-[#0f172a]">কুরিয়ার লজিস্টিকস এপিআই ইন্টিগ্রেশন</h3>
						<p class="text-xs text-slate-400">Steadfast, Pathao ও Paperfly সরাসরি পার্সেল বুকিং কনফিগারেশন</p>
					</div>

					<div class="space-y-4 pt-4 border-t border-[#ede5d8]">
						<div class="space-y-1.5">
							<label for="steadfast-api-key" class="text-xs font-bold text-slate-700">Steadfast API Key</label>
							<input
								id="steadfast-api-key"
								type="text"
								value="stdf_live_89a47b2c918e001"
								class="w-full bg-[#faf7f2] border border-[#ede5d8] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800"
							/>
						</div>

						<div class="space-y-1.5">
							<label for="steadfast-secret-key" class="text-xs font-bold text-slate-700">Steadfast Secret Key</label>
							<input
								id="steadfast-secret-key"
								type="password"
								value="••••••••••••••••••••••••"
								class="w-full bg-[#faf7f2] border border-[#ede5d8] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800"
							/>
						</div>

						<div class="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div class="flex items-center gap-2 text-xs font-bold text-emerald-600">
								<CheckCircle2 class="w-4 h-4 shrink-0" />
								<span>Steadfast Webhook সক্রিয় আছে</span>
							</div>
							<button
								onclick={triggerCourierSync}
								class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white font-bold text-xs shadow-md"
							>
								সেটিংস সংরক্ষণ করুন
							</button>
						</div>
					</div>
				</div>
			{/if}

			<!-- ============================================== -->
			<!-- TAB 7: PIXELS & CAPI TRACKING                 -->
			<!-- ============================================== -->
			{#if activeTab === 'pixels'}
				<div class="max-w-2xl bg-white p-4 sm:p-6 rounded-2xl border border-[#ede5d8] shadow-2xs space-y-6">
					<div>
						<h3 class="text-base font-black text-[#0f172a]">পিক্সেল ও সার্ভার সাইড ট্র্যাকিং (CAPI)</h3>
						<p class="text-xs text-slate-400">Meta Pixel, TikTok Pixel এবং Google Tag Manager ট্র্যাকিং কোড</p>
					</div>

					<div class="space-y-4">
						<div class="space-y-1.5">
							<label for="meta-pixel-id" class="text-xs font-bold text-slate-700">Facebook Pixel ID (Meta)</label>
							<input
								id="meta-pixel-id"
								type="text"
								value="819203847192039"
								class="w-full bg-[#faf7f2] border border-[#ede5d8] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800"
							/>
						</div>

						<div class="space-y-1.5">
							<label for="tiktok-pixel-id" class="text-xs font-bold text-slate-700">TikTok Pixel ID</label>
							<input
								id="tiktok-pixel-id"
								type="text"
								placeholder="C9J8XXXXX"
								class="w-full bg-[#faf7f2] border border-[#ede5d8] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800"
							/>
						</div>

						<div class="space-y-1.5">
							<label for="gtm-container-id" class="text-xs font-bold text-slate-700">Google Tag Manager (GTM) Container ID</label>
							<input
								id="gtm-container-id"
								type="text"
								placeholder="GTM-XXXXXXX"
								class="w-full bg-[#faf7f2] border border-[#ede5d8] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800"
							/>
						</div>

						<div class="pt-4 flex justify-end">
							<button class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white font-bold text-xs shadow-md">
								আপডেট সংরক্ষণ করুন
							</button>
						</div>
					</div>
				</div>
			{/if}

			<!-- ============================================== -->
			<!-- TAB 8: CLOUDFLARE D1 DATABASE CONSOLE          -->
			<!-- ============================================== -->
			{#if activeTab === 'database'}
				<div class="bg-white p-4 sm:p-6 rounded-2xl border border-[#ede5d8] shadow-2xs space-y-6">
					<div class="flex items-center justify-between pb-4 border-b border-[#ede5d8]">
						<div>
							<h3 class="text-base font-black text-[#0f172a]">Cloudflare D1 ডেটাবেজ স্ট্যাটাস</h3>
							<p class="text-xs text-slate-400">এজ ডাটাবেজ হেলথ ও স্কিমা টেলিমেট্রি</p>
						</div>
						<div class="flex items-center gap-2">
							<span class="w-2.5 h-2.5 rounded-full {data.isD1Connected ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
							<span class="text-xs font-bold text-slate-700">
								{data.isD1Connected ? 'D1 লাইভ কানেক্টেড' : 'লোকাল মেমোরি মোড'}
							</span>
						</div>
					</div>

					<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
						<div class="p-3.5 sm:p-4 rounded-xl bg-[#faf7f2] border border-[#ede5d8]">
							<span class="text-xs text-slate-500 block">মোট প্রোডাক্টস</span>
							<span class="text-lg font-black text-[#0f172a]">{data.products.length}</span>
						</div>
						<div class="p-3.5 sm:p-4 rounded-xl bg-[#faf7f2] border border-[#ede5d8]">
							<span class="text-xs text-slate-500 block">মোট অর্ডারস</span>
							<span class="text-lg font-black text-[#0f172a]">{data.orders.length}</span>
						</div>
						<div class="p-3.5 sm:p-4 rounded-xl bg-[#faf7f2] border border-[#ede5d8]">
							<span class="text-xs text-slate-500 block">গ্রাহক রিভিউ</span>
							<span class="text-lg font-black text-[#0f172a]">{data.reviews.length}</span>
						</div>
						<div class="p-3.5 sm:p-4 rounded-xl bg-[#faf7f2] border border-[#ede5d8]">
							<span class="text-xs text-slate-500 block">নিউজলেটার</span>
							<span class="text-lg font-black text-[#0f172a]">{data.newsletter.length}</span>
						</div>
					</div>

					<div class="pt-4 border-t border-[#ede5d8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
						<span class="text-xs text-slate-500">
							ডেটাবেজ নতুন করে রিসিড করতে নিচের বাটনটি ব্যবহার করুন:
						</span>
						<form method="POST" action="?/seedDatabase" use:enhance>
							<button
								type="submit"
								class="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#faf7f2] hover:bg-rose-50 border border-[#ede5d8] hover:border-rose-300 text-slate-700 hover:text-rose-700 font-bold text-xs transition-colors"
							>
								D1 ডেটাবেজ রিসিড করুন
							</button>
						</form>
					</div>
				</div>
			{/if}

			<!-- ============================================== -->
			<!-- TAB 9: CUSTOMERS & VIP CLUB                    -->
			<!-- ============================================== -->
			{#if activeTab === 'customers'}
				<div class="bg-white p-4 sm:p-6 rounded-2xl border border-[#ede5d8] shadow-2xs space-y-4">
					<div>
						<h3 class="text-base font-black text-[#0f172a]">গ্রাহক ডেটাবেজ ও ভিআইপি ক্লাব</h3>
						<p class="text-xs text-slate-400">নিবন্ধিত কাস্টমার ও রিপিট বায়ার টেলিমেট্রি</p>
					</div>

					<div class="overflow-x-auto">
						<table class="w-full text-left text-xs">
							<thead>
								<tr class="border-b border-[#ede5d8] text-slate-500 font-bold">
									<th class="py-3 px-4">ইমেইল / ফোন</th>
									<th class="py-3 px-4">স্ট্যাটাস</th>
									<th class="py-3 px-4 text-right">যোগদানের তারিখ</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-[#f4eee4]">
								{#each data.newsletter as sub}
									<tr>
										<td class="py-3 px-4 font-mono font-bold text-slate-800">{sub.email}</td>
										<td class="py-3 px-4">
											<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
												সক্রিয় ভিআইপি
											</span>
										</td>
										<td class="py-3 px-4 text-right text-slate-400">
											{new Date(sub.createdAt).toLocaleDateString('bn-BD')}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

		</main>
	</div>
</div>
