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
		Save
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Navigation tabs: mirrors Trezo Bengali E-commerce structure
	type TabType =
		| 'overview'
		| 'orders'
		| 'order_list'
		| 'new_order'
		| 'trash'
		| 'pixels'
		| 'courier'
		| 'landing_pages';

	let activeTab = $state<TabType>('overview');
	let isSidebarCollapsed = $state(false);
	let isMobileSidebarOpen = $state(false);

	// Date filter state
	let activeDateFilter = $state<'today' | 'yesterday' | '7days' | '30days' | 'all'>('all');

	// Order Search and status filters
	let orderSearchQuery = $state('');
	let orderStatusFilter = $state<string>('all');
	let isCopied = $state<string | null>(null);

	// Interactive chart hover state
	let activeChartPoint = $state<{ date: string; sales: number; orders: number } | null>(null);

	// Sample 7-day trend data for the smooth area chart
	const trendData = [
		{ date: '১৬ অক্টো', sales: 4800, orders: 7, x: 50, ySales: 75, yOrders: 70 },
		{ date: '১৭ অক্টো', sales: 1800, orders: 3, x: 140, ySales: 165, yOrders: 135 },
		{ date: '১৮ অক্টো', sales: 3200, orders: 5, x: 230, ySales: 125, yOrders: 105 },
		{ date: '১৯ অক্টো', sales: 1500, orders: 2, x: 320, ySales: 175, yOrders: 150 },
		{ date: '২০ অক্টো', sales: 4200, orders: 6, x: 410, ySales: 95, yOrders: 85 },
		{ date: '২১ অক্টো', sales: 5900, orders: 8, x: 500, ySales: 45, yOrders: 55 },
		{ date: '২২ অক্টো', sales: 3600, orders: 5, x: 590, ySales: 110, yOrders: 105 }
	];

	// Derived filtered orders
	let filteredOrders = $derived(
		data.orders.filter(order => {
			const query = orderSearchQuery.toLowerCase();
			const matchesSearch =
				order.id.toLowerCase().includes(query) ||
				order.customerName.toLowerCase().includes(query) ||
				order.customerEmail.toLowerCase().includes(query) ||
				order.shippingAddress.toLowerCase().includes(query);
			const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
			return matchesSearch && matchesStatus;
		})
	);

	// Trashed orders (refunded or cancelled)
	let trashedOrders = $derived(data.orders.filter(o => o.status === 'refunded'));

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
</script>

<svelte:head>
	<title>Trezo | অ্যাডমিন প্যানেল</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<!-- Fullscreen Trezo Light Administrative Portal -->
<div class="min-h-screen bg-[#f4f6fa] text-slate-800 flex font-['Hind_Siliguri',sans-serif] selection:bg-blue-500/20 selection:text-blue-700">

	<!-- LEFT SIDEBAR -->
	<aside
		class="bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 z-50 fixed md:sticky top-0 h-screen shrink-0 {isSidebarCollapsed ? 'w-20' : 'w-64'} {isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
	>
		<!-- Sidebar Top: Logo -->
		<div class="overflow-y-auto">
			<div class="h-16 flex items-center justify-between px-5 border-b border-slate-100">
				<a href="/admin" class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
						<Flame class="w-5 h-5 fill-white" />
					</div>
					{#if !isSidebarCollapsed}
						<div class="flex items-center gap-1.5 font-['Outfit'] font-bold text-xl text-slate-900 tracking-tight">
							<span>Trezo</span>
							<span class="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
								Aura
							</span>
						</div>
					{/if}
				</a>
			</div>

			<!-- Sidebar Menu Groups -->
			<div class="p-3 space-y-6">
				
				<!-- Group 1: অর্ডার ম্যানেজমেন্ট -->
				<div>
					{#if !isSidebarCollapsed}
						<div class="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
							অর্ডার ম্যানেজমেন্ট
						</div>
					{/if}

					<div class="space-y-1">
						<!-- ওভারভিউ -->
						<button
							onclick={() => { activeTab = 'overview'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all {activeTab === 'overview'
								? 'bg-blue-50 text-blue-600 font-bold'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							title="ওভারভিউ"
						>
							<div class="flex items-center gap-3">
								<LayoutGrid class="w-4 h-4 {activeTab === 'overview' ? 'text-blue-600' : 'text-slate-400'}" />
								{#if !isSidebarCollapsed}
									<span>ওভারভিউ</span>
								{/if}
							</div>
						</button>

						<!-- অর্ডারসমূহ -->
						<button
							onclick={() => { activeTab = 'orders'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all {activeTab === 'orders'
								? 'bg-blue-50 text-blue-600 font-bold'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							title="অর্ডারসমূহ"
						>
							<div class="flex items-center gap-3">
								<ShoppingCart class="w-4 h-4 {activeTab === 'orders' ? 'text-blue-600' : 'text-slate-400'}" />
								{#if !isSidebarCollapsed}
									<span>অর্ডারসমূহ</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed}
								<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
									{data.orders.length}
								</span>
							{/if}
						</button>

						<!-- অর্ডার লিস্ট -->
						<button
							onclick={() => { activeTab = 'order_list'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all {activeTab === 'order_list'
								? 'bg-blue-50 text-blue-600 font-bold'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							title="অর্ডার লিস্ট"
						>
							<div class="flex items-center gap-3">
								<ListOrdered class="w-4 h-4 {activeTab === 'order_list' ? 'text-blue-600' : 'text-slate-400'}" />
								{#if !isSidebarCollapsed}
									<span>অর্ডার লিস্ট</span>
								{/if}
							</div>
						</button>

						<!-- নতুন অর্ডার -->
						<button
							onclick={() => { activeTab = 'new_order'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all {activeTab === 'new_order'
								? 'bg-blue-50 text-blue-600 font-bold'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							title="নতুন অর্ডার"
						>
							<div class="flex items-center gap-3">
								<PlusCircle class="w-4 h-4 {activeTab === 'new_order' ? 'text-blue-600' : 'text-slate-400'}" />
								{#if !isSidebarCollapsed}
									<span>নতুন অর্ডার</span>
								{/if}
							</div>
						</button>

						<!-- মুছে ফেলা (Trash) -->
						<button
							onclick={() => { activeTab = 'trash'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all {activeTab === 'trash'
								? 'bg-rose-50 text-rose-600 font-bold'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							title="মুছে ফেলা"
						>
							<div class="flex items-center gap-3">
								<Trash2 class="w-4 h-4 {activeTab === 'trash' ? 'text-rose-600' : 'text-slate-400'}" />
								{#if !isSidebarCollapsed}
									<span>মুছে ফেলা</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed && trashedOrders.length > 0}
								<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
									{trashedOrders.length}
								</span>
							{/if}
						</button>
					</div>
				</div>

				<!-- Group 2: সেটিংস -->
				<div>
					{#if !isSidebarCollapsed}
						<div class="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
							সেটিংস
						</div>
					{/if}

					<div class="space-y-1">
						<!-- পিক্সেল ও ট্র্যাকিং -->
						<button
							onclick={() => { activeTab = 'pixels'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all {activeTab === 'pixels'
								? 'bg-blue-50 text-blue-600 font-bold'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							title="পিক্সেল ও ট্র্যাকিং"
						>
							<div class="flex items-center gap-3">
								<Radio class="w-4 h-4 {activeTab === 'pixels' ? 'text-blue-600' : 'text-slate-400'}" />
								{#if !isSidebarCollapsed}
									<span>পিক্সেল ও ট্র্যাকিং</span>
								{/if}
							</div>
						</button>

						<!-- কুরিয়ার সেটিংস -->
						<button
							onclick={() => { activeTab = 'courier'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all {activeTab === 'courier'
								? 'bg-blue-50 text-blue-600 font-bold'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							title="কুরিয়ার সেটিংস"
						>
							<div class="flex items-center gap-3">
								<Truck class="w-4 h-4 {activeTab === 'courier' ? 'text-blue-600' : 'text-slate-400'}" />
								{#if !isSidebarCollapsed}
									<span>কুরিয়ার সেটিংস</span>
								{/if}
							</div>
						</button>

						<!-- ল্যান্ডিং পেজসমূহ -->
						<button
							onclick={() => { activeTab = 'landing_pages'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all {activeTab === 'landing_pages'
								? 'bg-blue-50 text-blue-600 font-bold'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							title="ল্যান্ডিং পেজসমূহ"
						>
							<div class="flex items-center gap-3">
								<Globe class="w-4 h-4 {activeTab === 'landing_pages' ? 'text-blue-600' : 'text-slate-400'}" />
								{#if !isSidebarCollapsed}
									<span>ল্যান্ডিং পেজসমূহ</span>
								{/if}
							</div>
						</button>
					</div>
				</div>

			</div>
		</div>

		<!-- Sidebar Bottom: D1 Status & Quick Sync -->
		<div class="p-4 border-t border-slate-100 space-y-2">
			{#if !isSidebarCollapsed}
				<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
					<div class="flex items-center justify-between mb-1.5">
						<span class="font-bold text-slate-700 flex items-center gap-1.5">
							<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
							Cloudflare D1
						</span>
						<span class="text-[10px] font-bold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.2 rounded">
							লাইভ
						</span>
					</div>
					<div class="text-[11px] text-slate-500 font-mono">DB: aura (SQLite)</div>
				</div>

				<form action="?/seedDatabase" method="POST" use:enhance>
					<button
						type="submit"
						class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-all border border-blue-200/60"
					>
						<RefreshCw class="w-3.5 h-3.5" />
						<span>ডেমো ডাটা সিঙ্ক করুন</span>
					</button>
				</form>
			{/if}
		</div>
	</aside>

	<!-- MOBILE SIDEBAR OVERLAY BACKDROP -->
	{#if isMobileSidebarOpen}
		<button
			type="button"
			onclick={() => isMobileSidebarOpen = false}
			class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
			aria-label="Close sidebar"
		></button>
	{/if}

	<!-- MAIN WORKSPACE -->
	<div class="flex-1 flex flex-col min-w-0 min-h-screen">
		
		<!-- TOP HEADER BAR -->
		<header class="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
			<div class="flex items-center gap-3">
				<!-- Sidebar Collapse Toggle Button -->
				<button
					onclick={() => {
						if (window.innerWidth < 768) {
							isMobileSidebarOpen = !isMobileSidebarOpen;
						} else {
							isSidebarCollapsed = !isSidebarCollapsed;
						}
					}}
					class="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
					title="সাইডবার টগল করুন"
				>
					{#if isSidebarCollapsed}
						<PanelLeftOpen class="w-5 h-5" />
					{:else}
						<PanelLeftClose class="w-5 h-5" />
					{/if}
				</button>

				<div class="font-bold text-slate-800 text-base">
					অ্যাডমিন প্যানেল
				</div>
			</div>

			<!-- Top Right Action Controls -->
			<div class="flex items-center gap-3">
				<a
					href="/"
					target="_blank"
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 text-xs font-semibold transition-all bg-white shadow-2xs"
				>
					<span>ওয়েবসাইট দেখুন</span>
					<ExternalLink class="w-3.5 h-3.5" />
				</a>

				<button
					onclick={() => window.location.reload()}
					class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 text-xs transition-colors"
					title="রিফ্রেশ"
				>
					<RefreshCw class="w-4 h-4" />
				</button>

				<a
					href="/"
					class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-50 text-xs transition-colors"
					title="প্রস্থান"
				>
					<LogOut class="w-4 h-4" />
				</a>
			</div>
		</header>

		<!-- WORKSPACE BODY -->
		<main class="p-6 md:p-8 space-y-8 flex-1">
			
			<!-- TAB 1: OVERVIEW (Mirrors uploaded screenshot exactly) -->
			{#if activeTab === 'overview'}
				<!-- Header with date filter tabs -->
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
							<LayoutGrid class="w-6 h-6 text-blue-600" />
							অ্যাডমিন ওভারভিউ
						</h1>
						<p class="text-xs text-slate-500 mt-1">
							ব্যবসার রিয়েল-টাইম পারফরম্যান্স এবং অর্ডারের সারসংক্ষেপ
						</p>
					</div>

					<!-- Date Filter Pills -->
					<div class="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
						<button
							onclick={() => activeDateFilter = 'today'}
							class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all {activeDateFilter === 'today' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
						>
							আজ
						</button>
						<button
							onclick={() => activeDateFilter = 'yesterday'}
							class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all {activeDateFilter === 'yesterday' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
						>
							গতকাল
						</button>
						<button
							onclick={() => activeDateFilter = '7days'}
							class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all {activeDateFilter === '7days' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
						>
							গত ৭ দিন
						</button>
						<button
							onclick={() => activeDateFilter = '30days'}
							class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all {activeDateFilter === '30days' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
						>
							গত ৩০ দিন
						</button>
						<button
							onclick={() => activeDateFilter = 'all'}
							class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all {activeDateFilter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
						>
							সব সময়
						</button>
					</div>
				</div>

				<!-- Section Title: রিয়েল-টাইম পারফরম্যান্স সামারি -->
				<div>
					<div class="flex items-center gap-2 text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">
						<TrendingUp class="w-4 h-4 text-blue-500" />
						রিয়েল-টাইম পারফরম্যান্স সামারি
					</div>

					<!-- 6 Performance Summary Cards -->
					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
						<!-- Card 1: মোট সেলস (Revenue) -->
						<div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
							<div>
								<div class="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
									<span class="truncate">মোট সেলস (Revenue)</span>
									<span class="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
										💵
									</span>
								</div>
								<div class="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
									{formatTaka(data.stats.totalRevenue)}
								</div>
							</div>
							<div class="text-[11px] text-slate-400 mt-2 font-medium">
								কনফার্মড: {formatTaka(data.stats.confirmedRevenue)}
							</div>
						</div>

						<!-- Card 2: মোট অর্ডার (Total Orders) -->
						<div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
							<div>
								<div class="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
									<span class="truncate">মোট অর্ডার (Total O...)</span>
									<span class="p-1.5 rounded-lg bg-blue-50 text-blue-600">
										🛍️
									</span>
								</div>
								<div class="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
									{data.stats.totalOrders} টি
								</div>
							</div>
							<div class="text-[11px] text-slate-400 mt-2 font-medium">
								আজকে {data.stats.todayOrdersCount} টি • পেন্ডিং {data.stats.pendingOrdersCount} টি
							</div>
						</div>

						<!-- Card 3: কনফার্মড রেট (Confirmed Rate) -->
						<div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
							<div>
								<div class="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
									<span class="truncate">কনফার্মড রেট (Confi...)</span>
									<span class="p-1.5 rounded-lg bg-purple-50 text-purple-600">
										✔️
									</span>
								</div>
								<div class="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
									{data.stats.confirmedRate}%
								</div>
							</div>
							<div class="text-[11px] text-slate-400 mt-2 font-medium">
								{data.stats.confirmedCount} টি অর্ডার কনফার্মড
							</div>
						</div>

						<!-- Card 4: ডেলিভারি সফল (Delivered) -->
						<div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
							<div>
								<div class="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
									<span class="truncate">ডেলিভারি সফল (Del...)</span>
									<span class="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
										🚚
									</span>
								</div>
								<div class="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
									{data.stats.deliveredRate}%
								</div>
							</div>
							<div class="text-[11px] text-slate-400 mt-2 font-medium">
								{data.stats.deliveredCount} টি ({formatTaka(data.stats.deliveredRevenue)})
							</div>
						</div>

						<!-- Card 5: ক্যানসেলড ও রিটার্ন -->
						<div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
							<div>
								<div class="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
									<span class="truncate">ক্যানসেলড ও রিটার্ন</span>
									<span class="p-1.5 rounded-lg bg-rose-50 text-rose-600">
										⚠️
									</span>
								</div>
								<div class="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
									{data.stats.cancelledRate}%
								</div>
							</div>
							<div class="text-[11px] text-slate-400 mt-2 font-medium">
								বাতিল: 0 • রিটার্ন: {data.stats.cancelledCount}
							</div>
						</div>

						<!-- Card 6: গড় অর্ডার মূল্য (AOV) -->
						<div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
							<div>
								<div class="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
									<span class="truncate">গড় অর্ডার মূল্য (AOV)</span>
									<span class="p-1.5 rounded-lg bg-amber-50 text-amber-600">
										🛒
									</span>
								</div>
								<div class="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
									{formatTaka(data.stats.aov)}
								</div>
							</div>
							<div class="text-[11px] text-slate-400 mt-2 font-medium">
								প্রতি অর্ডারে গড়ে প্রাপ্তি
							</div>
						</div>
					</div>
				</div>

				<!-- Section Title: অ্যানালিটিক্স ও ট্রেন্ড চার্ট -->
				<div>
					<div class="flex items-center gap-2 text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">
						📈 অ্যানালিটিক্স ও ট্রেন্ড চার্ট
					</div>

					<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
						
						<!-- Left Chart: সেলস ও অর্ডার ট্রেন্ড (Sales & Orders Trend) -->
						<div class="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
							<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
								<div>
									<h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
										<TrendingUp class="w-4 h-4 text-blue-600" />
										সেলস ও অর্ডার ট্রেন্ড (Sales & Orders Trend)
									</h3>
									<p class="text-xs text-slate-400">দিন ভিত্তিক মোট সেলস (টাকা) ও অর্ডারের পরিবর্তন</p>
								</div>

								<!-- Chart Legends -->
								<div class="flex items-center gap-4 text-xs font-semibold">
									<div class="flex items-center gap-1.5">
										<span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
										<span class="text-slate-600">রেভিনিউ (৳)</span>
									</div>
									<div class="flex items-center gap-1.5">
										<span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
										<span class="text-slate-600">অর্ডার (টি)</span>
									</div>
								</div>
							</div>

							<!-- SVG Interactive Multi-Axis Area Chart -->
							<div class="relative pt-4">
								<svg viewBox="0 0 640 220" class="w-full h-56 overflow-visible">
									<defs>
										<!-- Blue Gradient for Sales Area -->
										<linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stop-color="#3b82f6" stop-opacity="0.28" />
											<stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
										</linearGradient>
										<!-- Green Gradient for Orders Area -->
										<linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stop-color="#10b981" stop-opacity="0.22" />
											<stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
										</linearGradient>
									</defs>

									<!-- Horizontal Gridlines & Y-Axis Labels -->
									{#each [
										{ label: '৳৬০০০', rLabel: '৮টি', y: 40 },
										{ label: '৳৪৫০০', rLabel: '৬টি', y: 85 },
										{ label: '৳৩০০০', rLabel: '৪টি', y: 130 },
										{ label: '৳১৫০০', rLabel: '২টি', y: 175 }
									] as grid}
										<line x1="45" y1={grid.y} x2="595" y2={grid.y} stroke="#f1f5f9" stroke-dasharray="4 4" stroke-width="1.5" />
										<text x="40" y={grid.y + 4} text-anchor="end" fill="#94a3b8" font-size="10" font-family="sans-serif">{grid.label}</text>
										<text x="600" y={grid.y + 4} text-anchor="start" fill="#94a3b8" font-size="10" font-family="sans-serif">{grid.rLabel}</text>
									{/each}

									<!-- Area: Sales (Revenue) -->
									<path
										d="M 50 190 L 50 75 C 95 120, 140 165, 140 165 C 185 145, 230 125, 230 125 C 275 150, 320 175, 320 175 C 365 135, 410 95, 410 95 C 455 70, 500 45, 500 45 C 545 75, 590 110, 590 110 L 590 190 Z"
										fill="url(#salesGrad)"
									/>

									<!-- Line: Sales (Revenue) -->
									<path
										d="M 50 75 C 95 120, 140 165, 140 165 C 185 145, 230 125, 230 125 C 275 150, 320 175, 320 175 C 365 135, 410 95, 410 95 C 455 70, 500 45, 500 45 C 545 75, 590 110, 590 110"
										fill="none"
										stroke="#2563eb"
										stroke-width="3"
										stroke-linecap="round"
									/>

									<!-- Line: Orders -->
									<path
										d="M 50 70 C 95 100, 140 135, 140 135 C 185 120, 230 105, 230 105 C 275 130, 320 150, 320 150 C 365 120, 410 85, 410 85 C 455 70, 500 55, 500 55 C 545 80, 590 105, 590 105"
										fill="none"
										stroke="#10b981"
										stroke-width="2.5"
										stroke-dasharray="2 0"
										stroke-linecap="round"
									/>

									<!-- Data Points and Date Labels -->
									{#each trendData as pt}
										<!-- Date on X-Axis -->
										<text x={pt.x} y="208" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">{pt.date}</text>

										<!-- Sales Circle -->
										<circle
											cx={pt.x}
											cy={pt.ySales}
											r="4.5"
											fill="#ffffff"
											stroke="#2563eb"
											stroke-width="2.5"
											class="cursor-pointer transition-transform hover:scale-150"
											onmouseenter={() => activeChartPoint = pt}
											onmouseleave={() => activeChartPoint = null}
										/>

										<!-- Orders Circle -->
										<circle
											cx={pt.x}
											cy={pt.yOrders}
											r="3.5"
											fill="#ffffff"
											stroke="#10b981"
											stroke-width="2"
											class="cursor-pointer"
										/>
									{/each}
								</svg>

								<!-- Hover Tooltip -->
								{#if activeChartPoint}
									<div class="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-3 pointer-events-none">
										<span class="font-bold text-blue-300">{activeChartPoint.date}</span>
										<span>সেলস: <strong>{formatTaka(activeChartPoint.sales)}</strong></span>
										<span class="text-emerald-400">অর্ডার: <strong>{activeChartPoint.orders} টি</strong></span>
									</div>
								{/if}
							</div>
						</div>

						<!-- Right Chart: অর্ডার স্ট্যাটাস (Status Ratio) -->
						<div class="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
							<div>
								<h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
									<LayoutGrid class="w-4 h-4 text-purple-600" />
									অর্ডার স্ট্যাটাস (Status Ratio)
								</h3>
								<p class="text-xs text-slate-400">স্ট্যাটাস অনুযায়ী অর্ডারের শতকরা ভাগ</p>
							</div>

							<!-- Donut Chart -->
							<div class="flex items-center justify-center relative py-4">
								<svg viewBox="0 0 160 160" class="w-44 h-44 -rotate-90">
									<!-- Track background -->
									<circle cx="80" cy="80" r="60" fill="transparent" stroke="#f1f5f9" stroke-width="16" />

									<!-- 1. Delivered: 40% (Blue #3b82f6) -->
									<circle
										cx="80"
										cy="80"
										r="60"
										fill="transparent"
										stroke="#3b82f6"
										stroke-width="16"
										stroke-dasharray="150.8 377"
										stroke-dashoffset="0"
									/>

									<!-- 2. Processing: 25% (Orange #f97316) -->
									<circle
										cx="80"
										cy="80"
										r="60"
										fill="transparent"
										stroke="#f97316"
										stroke-width="16"
										stroke-dasharray="94.2 377"
										stroke-dashoffset="-150.8"
									/>

									<!-- 3. Paid: 15% (Emerald #10b981) -->
									<circle
										cx="80"
										cy="80"
										r="60"
										fill="transparent"
										stroke="#10b981"
										stroke-width="16"
										stroke-dasharray="56.5 377"
										stroke-dashoffset="-245"
									/>

									<!-- 4. Cancelled/Returned: 20% (Rose #ef4444) -->
									<circle
										cx="80"
										cy="80"
										r="60"
										fill="transparent"
										stroke="#ef4444"
										stroke-width="16"
										stroke-dasharray="75.4 377"
										stroke-dashoffset="-301.5"
									/>
								</svg>

								<!-- Donut Center Text -->
								<div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
									<div class="text-2xl font-black text-slate-900 font-['Outfit']">
										{data.stats.totalOrders}
									</div>
									<div class="text-[11px] font-bold text-slate-400">
										মোট অর্ডার
									</div>
								</div>
							</div>

							<!-- Donut Legends -->
							<div class="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
								<div class="flex items-center gap-2">
									<span class="w-3 h-3 rounded-full bg-blue-500"></span>
									<span class="text-slate-600">ডেলিভারি ({data.stats.deliveredRate}%)</span>
								</div>
								<div class="flex items-center gap-2">
									<span class="w-3 h-3 rounded-full bg-amber-500"></span>
									<span class="text-slate-600">প্রসেসিং (২৫%)</span>
								</div>
								<div class="flex items-center gap-2">
									<span class="w-3 h-3 rounded-full bg-emerald-500"></span>
									<span class="text-slate-600">কনফার্মড ({data.stats.confirmedRate}%)</span>
								</div>
								<div class="flex items-center gap-2">
									<span class="w-3 h-3 rounded-full bg-rose-500"></span>
									<span class="text-slate-600">বাতিল ({data.stats.cancelledRate}%)</span>
								</div>
							</div>
						</div>

					</div>
				</div>

				<!-- Recent Orders Quick Table Preview -->
				<div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-base font-bold text-slate-900">সাম্প্রতিক অর্ডারসমূহ (Recent Orders)</h3>
							<p class="text-xs text-slate-400">সর্বশেষ আসা কাস্টমার অর্ডার তালিকা</p>
						</div>
						<button
							onclick={() => activeTab = 'orders'}
							class="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
						>
							<span>সব দেখুন</span>
							<ChevronRight class="w-4 h-4" />
						</button>
					</div>

					<div class="overflow-x-auto">
						<table class="w-full text-left text-xs">
							<thead>
								<tr class="border-b border-slate-100 text-slate-500 bg-slate-50/50">
									<th class="py-3 px-4 font-semibold">অর্ডার আইডি</th>
									<th class="py-3 px-4 font-semibold">কাস্টমার</th>
									<th class="py-3 px-4 font-semibold">ঠিকানা</th>
									<th class="py-3 px-4 font-semibold">মূল্য</th>
									<th class="py-3 px-4 font-semibold">স্ট্যাটাস</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each data.orders.slice(0, 5) as ord}
									<tr class="hover:bg-slate-50/60 transition-colors">
										<td class="py-3.5 px-4 font-mono font-bold text-blue-600">{ord.id}</td>
										<td class="py-3.5 px-4 font-medium text-slate-900">{ord.customerName}</td>
										<td class="py-3.5 px-4 text-slate-500 max-w-xs truncate">{ord.shippingAddress}</td>
										<td class="py-3.5 px-4 font-bold text-slate-900 font-['Outfit']">{formatTaka(ord.total)}</td>
										<td class="py-3.5 px-4">
											{#if ord.status === 'delivered'}
												<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ডেলিভার্ড</span>
											{:else if ord.status === 'dispatched'}
												<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">ইন ট্রানজিট</span>
											{:else if ord.status === 'processing'}
												<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">প্যাকিং</span>
											{:else if ord.status === 'refunded'}
												<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">বাতিল/রিটার্ন</span>
											{:else}
												<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">পেইড</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<!-- TAB 2: ORDERS & ORDER LIST (Comprehensive Data Table) -->
			{#if activeTab === 'orders' || activeTab === 'order_list'}
				<div class="space-y-4">
					<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h2 class="text-xl font-bold text-slate-900">অর্ডার লিস্ট ও ম্যানেজমেন্ট</h2>
							<p class="text-xs text-slate-400">মোট {filteredOrders.length} টি অর্ডারের বিস্তারিত তথ্য</p>
						</div>

						<button
							onclick={() => activeTab = 'new_order'}
							class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
						>
							<PlusCircle class="w-4 h-4" />
							<span>নতুন অর্ডার যোগ করুন</span>
						</button>
					</div>

					<!-- Search & Filter Controls -->
					<div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
						<div class="relative flex-1 max-w-md">
							<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
							<input
								type="text"
								bind:value={orderSearchQuery}
								placeholder="অর্ডার আইডি, কাস্টমার নাম, ফোন বা ঠিকানা খুঁজুন..."
								class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
							/>
						</div>

						<!-- Status Filter Buttons -->
						<div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
							{#each [
								{ id: 'all', label: 'সব' },
								{ id: 'paid', label: 'পেইড' },
								{ id: 'processing', label: 'প্রসেসিং' },
								{ id: 'dispatched', label: 'ডিসপ্যাচ' },
								{ id: 'delivered', label: 'ডেলিভার্ড' },
								{ id: 'refunded', label: 'বাতিল' }
							] as st}
								<button
									onclick={() => orderStatusFilter = st.id}
									class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all {orderStatusFilter === st.id ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
								>
									{st.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Orders Table -->
					<div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
						<div class="overflow-x-auto">
							<table class="w-full text-left text-xs">
								<thead>
									<tr class="border-b border-slate-100 bg-slate-50/60 text-slate-500">
										<th class="py-3.5 px-4 font-semibold">অর্ডার আইডি</th>
										<th class="py-3.5 px-4 font-semibold">কাস্টমার তথ্য</th>
										<th class="py-3.5 px-4 font-semibold">আইটেম</th>
										<th class="py-3.5 px-4 font-semibold">ডেলিভারি ঠিকানা</th>
										<th class="py-3.5 px-4 font-semibold">মোট মূল্য</th>
										<th class="py-3.5 px-4 font-semibold">স্ট্যাটাস</th>
										<th class="py-3.5 px-4 font-semibold text-right">অ্যাকশন</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-100">
									{#if filteredOrders.length === 0}
										<tr>
											<td colspan="7" class="py-12 text-center text-slate-400">
												কোনো অর্ডার পাওয়া যায়নি।
											</td>
										</tr>
									{/if}

									{#each filteredOrders as order (order.id)}
										{@const parsedItems = parseItems(order.items)}
										<tr class="hover:bg-slate-50/50 transition-colors">
											<td class="py-4 px-4 font-mono font-bold text-blue-600">
												<div class="flex items-center gap-1.5">
													<span>{order.id}</span>
													<button
														onclick={() => copyToClipboard(order.id, order.id)}
														class="text-slate-400 hover:text-slate-700"
														title="আইডি কপি করুন"
													>
														{#if isCopied === order.id}
															<Check class="w-3.5 h-3.5 text-emerald-600" />
														{:else}
															<Copy class="w-3.5 h-3.5" />
														{/if}
													</button>
												</div>
											</td>

											<td class="py-4 px-4">
												<div class="font-bold text-slate-900">{order.customerName}</div>
												<div class="text-[11px] text-slate-400">{order.customerEmail}</div>
											</td>

											<td class="py-4 px-4 max-w-xs">
												<div class="space-y-1">
													{#each parsedItems as itm}
														<div class="flex items-center gap-1 text-[11px] text-slate-700">
															<span class="font-bold text-blue-600">{itm.quantity}x</span>
															<span class="truncate">{itm.name}</span>
														</div>
													{/each}
												</div>
											</td>

											<td class="py-4 px-4 max-w-[200px] text-slate-600 truncate" title={order.shippingAddress}>
												{order.shippingAddress}
											</td>

											<td class="py-4 px-4 font-bold text-slate-900 font-['Outfit']">
												{formatTaka(order.total)}
											</td>

											<td class="py-4 px-4">
												{#if order.status === 'delivered'}
													<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 inline-flex items-center gap-1">
														<CheckCircle2 class="w-3 h-3" /> ডেলিভার্ড
													</span>
												{:else if order.status === 'dispatched'}
													<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-50 border border-cyan-200 text-cyan-700 inline-flex items-center gap-1">
														<Truck class="w-3 h-3" /> ইন ট্রানজিট
													</span>
												{:else if order.status === 'processing'}
													<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700 inline-flex items-center gap-1">
														<Clock class="w-3 h-3" /> প্যাকিং
													</span>
												{:else if order.status === 'refunded'}
													<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700 inline-flex items-center gap-1">
														<AlertTriangle class="w-3 h-3" /> বাতিল
													</span>
												{:else}
													<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 border border-blue-200 text-blue-700 inline-flex items-center gap-1">
														পেইড
													</span>
												{/if}
											</td>

											<td class="py-4 px-4 text-right">
												<div class="inline-flex items-center gap-2">
													<form action="?/updateOrderStatus" method="POST" use:enhance class="inline">
														<input type="hidden" name="orderId" value={order.id} />
														<select
															name="status"
															onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()}
															class="bg-slate-50 text-[11px] text-slate-700 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 font-medium"
														>
															<option value="paid" selected={order.status === 'paid'}>পেইড</option>
															<option value="processing" selected={order.status === 'processing'}>প্রসেসিং</option>
															<option value="dispatched" selected={order.status === 'dispatched'}>ডিসপ্যাচ</option>
															<option value="delivered" selected={order.status === 'delivered'}>ডেলিভার্ড</option>
															<option value="refunded" selected={order.status === 'refunded'}>বাতিল</option>
														</select>
													</form>

													<!-- Move to Trash Button -->
													<form action="?/deleteOrder" method="POST" use:enhance class="inline">
														<input type="hidden" name="orderId" value={order.id} />
														<button
															type="submit"
															class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
															title="মুছে ফেলুন"
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
				</div>
			{/if}

			<!-- TAB 3: NEW ORDER FORM (নতুন অর্ডার) -->
			{#if activeTab === 'new_order'}
				<div class="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-6">
					<div>
						<h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
							<PlusCircle class="w-5 h-5 text-blue-600" />
							নতুন অর্ডার তৈরি করুন
						</h2>
						<p class="text-xs text-slate-500 mt-1">
							ম্যানুয়াল কাস্টমার অর্ডার সরাসরি Cloudflare D1 ডাটাবেজে সেভ করুন।
						</p>
					</div>

					<form action="?/createManualOrder" method="POST" use:enhance class="space-y-4">
						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">কাস্টমার নাম *</label>
							<input
								type="text"
								name="customerName"
								required
								placeholder="যেমন: তানভীর আহমেদ"
								class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none"
							/>
						</div>

						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">ইমেইল / ফোন নম্বর</label>
							<input
								type="text"
								name="customerEmail"
								placeholder="017XXXXXXXX বা email@domain.com"
								class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none"
							/>
						</div>

						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">ডেলিভারি পূর্ণ ঠিকানা *</label>
							<textarea
								name="shippingAddress"
								required
								rows="3"
								placeholder="বাড়ি, রোড, এলাকা, থানা, জেলা..."
								class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none"
							></textarea>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div class="space-y-1.5">
								<label class="text-xs font-bold text-slate-700">পণ্য নির্বাচন</label>
								<select
									name="productName"
									class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none bg-white font-medium"
								>
									<option value="AURA Spectrum X">AURA Spectrum X (Planar Flagship)</option>
									<option value="AURA Wave Spatial Pro">AURA Wave Spatial Pro (IEM)</option>
									<option value="AURA Creator Sound Deck">AURA Creator Sound Deck</option>
								</select>
							</div>

							<div class="space-y-1.5">
								<label class="text-xs font-bold text-slate-700">মোট টাকা (টাকা)</label>
								<input
									type="number"
									name="total"
									value="1250"
									required
									class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none font-['Outfit']"
								/>
							</div>
						</div>

						<div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
							<button
								type="button"
								onclick={() => activeTab = 'orders'}
								class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
							>
								বাতিল
							</button>

							<button
								type="submit"
								class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
							>
								অর্ডার সেভ করুন
							</button>
						</div>
					</form>
				</div>
			{/if}

			<!-- TAB 4: TRASH (মুছে ফেলা) -->
			{#if activeTab === 'trash'}
				<div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
					<div>
						<h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
							<Trash2 class="w-5 h-5 text-rose-600" />
							মুছে ফেলা অর্ডার ও ট্র্যাশ ({trashedOrders.length})
						</h2>
						<p class="text-xs text-slate-400">বাতিল বা ফেরতকৃত অর্ডারসমূহ এখানে জমা থাকে।</p>
					</div>

					<div class="overflow-x-auto">
						<table class="w-full text-left text-xs">
							<thead>
								<tr class="border-b border-slate-100 bg-slate-50 text-slate-500">
									<th class="py-3 px-4">অর্ডার আইডি</th>
									<th class="py-3 px-4">কাস্টমার</th>
									<th class="py-3 px-4">ঠিকানা</th>
									<th class="py-3 px-4">মূল্য</th>
									<th class="py-3 px-4 text-right">পুনরুদ্ধার</th>
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

								{#each trashedOrders as ord}
									<tr class="hover:bg-slate-50">
										<td class="py-3.5 px-4 font-mono font-bold text-rose-600">{ord.id}</td>
										<td class="py-3.5 px-4 font-medium text-slate-900">{ord.customerName}</td>
										<td class="py-3.5 px-4 text-slate-500">{ord.shippingAddress}</td>
										<td class="py-3.5 px-4 font-bold text-slate-900 font-['Outfit']">{formatTaka(ord.total)}</td>
										<td class="py-3.5 px-4 text-right">
											<form action="?/restoreOrder" method="POST" use:enhance class="inline">
												<input type="hidden" name="orderId" value={ord.id} />
												<button
													type="submit"
													class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs"
												>
													পুনরুদ্ধার করুন
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

			<!-- TAB 5: PIXELS & TRACKING (পিক্সেল ও ট্র্যাকিং) -->
			{#if activeTab === 'pixels'}
				<div class="max-w-3xl bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-6">
					<div>
						<h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
							<Radio class="w-5 h-5 text-blue-600" />
							পিক্সেল ও কনভার্সন ট্র্যাকিং
						</h2>
						<p class="text-xs text-slate-500 mt-1">
							ফেসবুক, টিকটক এবং গুগল অ্যানালিটিক্স ট্যাগ কোড কনফিগার করুন।
						</p>
					</div>

					<div class="space-y-4">
						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">Facebook Pixel ID (Meta)</label>
							<input
								type="text"
								placeholder="যেমন: 104928472918472"
								class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none font-mono"
							/>
						</div>

						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">TikTok Pixel ID</label>
							<input
								type="text"
								placeholder="যেমন: C9284KJSHD8372"
								class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none font-mono"
							/>
						</div>

						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">Google Tag Manager (GTM) Container ID</label>
							<input
								type="text"
								placeholder="যেমন: GTM-XXXXXXX"
								class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none font-mono"
							/>
						</div>

						<div class="pt-4 border-t border-slate-100 flex justify-end">
							<button
								type="button"
								class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20"
							>
								<Save class="w-4 h-4" />
								<span>পিক্সেল সেভ করুন</span>
							</button>
						</div>
					</div>
				</div>
			{/if}

			<!-- TAB 6: COURIER SETTINGS (কুরিয়ার সেটিংস) -->
			{#if activeTab === 'courier'}
				<div class="max-w-3xl bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-6">
					<div>
						<h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
							<Truck class="w-5 h-5 text-blue-600" />
							কুরিয়ার সার্ভিস ইন্টিগ্রেশন সেটিংস
						</h2>
						<p class="text-xs text-slate-500 mt-1">
							Steadfast, Pathao Courier ও RedX API সংযোগ এবং ডেলিভারি চার্জ।
						</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
							<div class="font-bold text-slate-900 text-sm">ঢাকা সিটির ভিতরে চার্জ</div>
							<input
								type="number"
								value="70"
								class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-['Outfit'] font-bold text-sm"
							/>
						</div>

						<div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
							<div class="font-bold text-slate-900 text-sm">ঢাকা সিটির বাইরে চার্জ</div>
							<input
								type="number"
								value="130"
								class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-['Outfit'] font-bold text-sm"
							/>
						</div>
					</div>

					<div class="space-y-4 pt-4 border-t border-slate-100">
						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">Steadfast API Key</label>
							<input
								type="text"
								placeholder="Steadfast API Key পেস্ট করুন..."
								class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none font-mono"
							/>
						</div>

						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">Steadfast Secret Key</label>
							<input
								type="password"
								placeholder="••••••••••••••••"
								class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none font-mono"
							/>
						</div>
					</div>

					<div class="flex justify-end">
						<button
							type="button"
							class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20"
						>
							<Save class="w-4 h-4" />
							<span>কুরিয়ার সেটিংস সেভ করুন</span>
						</button>
					</div>
				</div>
			{/if}

			<!-- TAB 7: LANDING PAGES (ল্যান্ডিং পেজসমূহ) -->
			{#if activeTab === 'landing_pages'}
				<div class="space-y-6">
					<div>
						<h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
							<Globe class="w-5 h-5 text-blue-600" />
							ল্যান্ডিং পেজ ও পণ্য স্টক কন্ট্রোল
						</h2>
						<p class="text-xs text-slate-400 mt-1">
							ল্যান্ডিং পেজে প্রদর্শিত পণ্যের স্টক ইন/আউট করুন।
						</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
						{#each data.products as prod}
							<div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between">
								<div>
									<div class="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
										<img src={prod.image} alt={prod.name} class="w-full h-full object-cover" />
										{#if prod.badge}
											<span class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
												{prod.badge}
											</span>
										{/if}
									</div>

									<h3 class="font-bold text-slate-900 text-sm">{prod.name}</h3>
									<p class="text-xs text-slate-500 line-clamp-2 mt-1">{prod.tagline}</p>
								</div>

								<div class="pt-3 border-t border-slate-100 flex items-center justify-between">
									<div>
										{#if prod.inStock}
											<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
												ইন স্টক
											</span>
										{:else}
											<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
												আউট অফ স্টক
											</span>
										{/if}
									</div>

									<form action="?/toggleProductStock" method="POST" use:enhance>
										<input type="hidden" name="productId" value={prod.id} />
										<input type="hidden" name="inStock" value={prod.inStock ? 'false' : 'true'} />
										<button
											type="submit"
											class="px-3 py-1 rounded-lg text-xs font-bold transition-all {prod.inStock ? 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}"
										>
											{prod.inStock ? 'স্টক শেষ করুন' : 'স্টক চালু করুন'}
										</button>
									</form>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

		</main>
	</div>
</div>
