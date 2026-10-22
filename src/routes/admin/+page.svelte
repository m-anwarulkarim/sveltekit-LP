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
		ChevronDown
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Navigation Tabs
	type TabType =
		| 'overview'
		| 'orders'
		| 'order_list'
		| 'new_order'
		| 'trash'
		| 'inventory'
		| 'courier'
		| 'pixels'
		| 'customers'
		| 'database';

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
	let activeChartPoint = $state<{ date: string; sales: number; orders: number; aov: number } | null>(null);

	// Selected order for quick modal / drawer
	let selectedOrderModal = $state<any | null>(null);

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
	let pendingOrders = $derived(data.orders.filter(o => ['processing', 'dispatched'].includes(o.status)));

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
	<title>AURA Enterprise Control Deck | অ্যাডমিন ড্যাশবোর্ড</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<!-- Fullscreen Luxury Executive Dashboard -->
<div class="min-h-screen bg-[#f8fafc] text-slate-800 flex font-['Hind_Siliguri',sans-serif] selection:bg-blue-600/15 selection:text-blue-700 antialiased">

	<!-- ============================================== -->
	<!-- 1. HIGH-END EXECUTIVE MIDNIGHT SIDEBAR        -->
	<!-- ============================================== -->
	<aside
		class="bg-[#0b0f19] text-slate-300 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 z-50 fixed md:sticky top-0 h-screen shrink-0 shadow-2xl {isSidebarCollapsed ? 'w-20' : 'w-72'} {isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
	>
		<div class="flex-1 flex flex-col min-h-0 overflow-y-auto">
			
			<!-- Workspace / Store Brand Header -->
			<div class="h-20 flex items-center justify-between px-5 border-b border-slate-800/60 bg-[#0e1424]/40">
				<a href="/admin" class="flex items-center gap-3 group">
					<div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-105">
						<div class="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
							<Flame class="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
						</div>
					</div>
					
					{#if !isSidebarCollapsed}
						<div class="flex flex-col">
							<div class="flex items-center gap-1.5">
								<span class="font-['Outfit'] font-black text-lg text-white tracking-wide">AURA</span>
								<span class="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30">
									PRO
								</span>
							</div>
							<span class="text-[10px] text-slate-400 font-mono -mt-0.5">lp.haqplus.com</span>
						</div>
					{/if}
				</a>

				<!-- Collapse toggle button for desktop -->
				{#if !isSidebarCollapsed}
					<button
						onclick={() => isSidebarCollapsed = true}
						class="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
						title="সাইডবার সংকুচিত করুন"
					>
						<PanelLeftClose class="w-4 h-4" />
					</button>
				{/if}
			</div>

			<!-- Quick Search shortcut bar inside Sidebar -->
			{#if !isSidebarCollapsed}
				<div class="px-4 pt-4 pb-2">
					<button
						onclick={() => { activeTab = 'orders'; }}
						class="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all shadow-inner"
					>
						<div class="flex items-center gap-2">
							<Search class="w-3.5 h-3.5 text-slate-400" />
							<span>অর্ডার বা গ্রাহক খুঁজুন...</span>
						</div>
						<kbd class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">⌘K</kbd>
					</button>
				</div>
			{/if}

			<!-- NAVIGATION MENU -->
			<nav class="p-3 space-y-6">
				
				<!-- Section 1: মূল নিয়ন্ত্রণ (Core) -->
				<div>
					{#if !isSidebarCollapsed}
						<div class="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
							মূল নিয়ন্ত্রণ (Core)
						</div>
					{/if}

					<div class="space-y-1">
						<!-- ওভারভিউ ড্যাশবোর্ড -->
						<button
							onclick={() => { activeTab = 'overview'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'overview'
								? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="ওভারভিউ ড্যাশবোর্ড"
						>
							<div class="flex items-center gap-3">
								<LayoutGrid class="w-4 h-4 {activeTab === 'overview' ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}" />
								{#if !isSidebarCollapsed}
									<span>ওভারভিউ ড্যাশবোর্ড</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed && activeTab === 'overview'}
								<span class="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse"></span>
							{/if}
						</button>

						<!-- সব অর্ডারসমূহ -->
						<button
							onclick={() => { activeTab = 'orders'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'orders' || activeTab === 'order_list'
								? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="অর্ডারসমূহ"
						>
							<div class="flex items-center gap-3">
								<ShoppingCart class="w-4 h-4 {activeTab === 'orders' || activeTab === 'order_list' ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}" />
								{#if !isSidebarCollapsed}
									<span>সব অর্ডারসমূহ</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed}
								<span class="text-[10px] font-black px-2 py-0.5 rounded-full {activeTab === 'orders' || activeTab === 'order_list' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700/60'}">
									{data.orders.length}
								</span>
							{/if}
						</button>

						<!-- নতুন অর্ডার তৈরি -->
						<button
							onclick={() => { activeTab = 'new_order'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'new_order'
								? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="নতুন অর্ডার তৈরি"
						>
							<div class="flex items-center gap-3">
								<PlusCircle class="w-4 h-4 {activeTab === 'new_order' ? 'text-white' : 'text-emerald-400 group-hover:scale-110 transition-transform'}" />
								{#if !isSidebarCollapsed}
									<span>নতুন অর্ডার এন্ট্রি</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed}
								<span class="text-[9px] font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
									নতুন
								</span>
							{/if}
						</button>

						<!-- ট্র্যাশ ও বাতিল -->
						<button
							onclick={() => { activeTab = 'trash'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'trash'
								? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="বাতিল ও ট্র্যাশ"
						>
							<div class="flex items-center gap-3">
								<Trash2 class="w-4 h-4 {activeTab === 'trash' ? 'text-white' : 'text-slate-400 group-hover:text-rose-400'}" />
								{#if !isSidebarCollapsed}
									<span>বাতিল ও রিটার্ন</span>
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

				<!-- Section 2: ইনভেন্টরি ও লজিস্টিকস (Logistics) -->
				<div>
					{#if !isSidebarCollapsed}
						<div class="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
							ইনভেন্টরি ও লজিস্টিকস
						</div>
					{/if}

					<div class="space-y-1">
						<!-- ক্যাটালগ ও স্টক -->
						<button
							onclick={() => { activeTab = 'inventory'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'inventory'
								? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="পণ্য ও ইনভেন্টরি"
						>
							<div class="flex items-center gap-3">
								<Package class="w-4 h-4 {activeTab === 'inventory' ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'}" />
								{#if !isSidebarCollapsed}
									<span>প্রোডাক্ট ইনভেন্টরি</span>
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
								? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="কুরিয়ার হাব"
						>
							<div class="flex items-center gap-3">
								<Truck class="w-4 h-4 {activeTab === 'courier' ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}" />
								{#if !isSidebarCollapsed}
									<span>কুরিয়ার ও লজিস্টিকস</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed}
								<span class="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
									Steadfast
								</span>
							{/if}
						</button>
					</div>
				</div>

				<!-- Section 3: গ্রোথ ও সেটিংস (Growth & System) -->
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
								? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="পিক্সেল ও ট্র্যাকিং"
						>
							<div class="flex items-center gap-3">
								<Radio class="w-4 h-4 {activeTab === 'pixels' ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'}" />
								{#if !isSidebarCollapsed}
									<span>পিক্সেল ও কনভার্সন</span>
								{/if}
							</div>
						</button>

						<!-- গ্রাহক ডেটাবেজ -->
						<button
							onclick={() => { activeTab = 'customers'; isMobileSidebarOpen = false; }}
							class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group {activeTab === 'customers'
								? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="গ্রাহক ও ভিআইপি ক্লাব"
						>
							<div class="flex items-center gap-3">
								<Users class="w-4 h-4 {activeTab === 'customers' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}" />
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
								? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
								: 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							title="Cloudflare D1 ইঞ্জিন"
						>
							<div class="flex items-center gap-3">
								<Database class="w-4 h-4 {activeTab === 'database' ? 'text-white' : 'text-emerald-400'}" />
								{#if !isSidebarCollapsed}
									<span>Cloudflare D1 ইঞ্জিন</span>
								{/if}
							</div>
							{#if !isSidebarCollapsed}
								<span class="w-2 h-2 rounded-full bg-emerald-400"></span>
							{/if}
						</button>
					</div>
				</div>

			</nav>
		</div>

		<!-- SIDEBAR FOOTER: ADMIN USER PROFILE & LATENCY -->
		<div class="p-4 border-t border-slate-800/80 bg-[#0e1424]/60 space-y-3">
			{#if !isSidebarCollapsed}
				<!-- D1 Ping Telemetry Status Pill -->
				<div class="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px]">
					<div class="flex items-center gap-2">
						<span class="relative flex h-2 w-2">
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
							<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
						</span>
						<span class="font-bold text-slate-200">Cloudflare D1</span>
					</div>
					<span class="text-[10px] font-mono text-emerald-400 font-bold">12ms • Edge Live</span>
				</div>

				<!-- Superadmin Profile Box -->
				<div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-800/60">
					<div class="flex items-center gap-2.5">
						<div class="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-emerald-500/40">
							AK
						</div>
						<div class="flex flex-col">
							<span class="text-xs font-bold text-white leading-tight">আনোয়ারুল করিম</span>
							<span class="text-[10px] text-slate-400">সুপার অ্যাডমিন</span>
						</div>
					</div>

					<a
						href="/"
						target="_blank"
						class="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
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
		
		<!-- TOP WORKSPACE HEADER (Shopify Polaris style) -->
		<header class="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
			<div class="flex items-center gap-4">
				<!-- Mobile Sidebar Toggle -->
				<button
					onclick={() => isMobileSidebarOpen = !isMobileSidebarOpen}
					class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
					aria-label="Open sidebar"
				>
					<PanelLeftOpen class="w-5 h-5" />
				</button>

				<!-- Breadcrumb Header -->
				<div class="flex items-center gap-2 text-xs font-medium text-slate-500">
					<span>AURA ড্যাশবোর্ড</span>
					<span>/</span>
					<span class="text-slate-900 font-bold capitalize">
						{#if activeTab === 'overview'}ওভারভিউ ও অ্যানালিটিক্স
						{:else if activeTab === 'orders' || activeTab === 'order_list'}অর্ডার লিস্ট
						{:else if activeTab === 'new_order'}নতুন ম্যানুয়াল অর্ডার
						{:else if activeTab === 'inventory'}প্রোডাক্ট ইনভেন্টরি
						{:else if activeTab === 'courier'}কুরিয়ার লজিস্টিকস
						{:else if activeTab === 'pixels'}পিক্সেল ট্র্যাকিং
						{:else if activeTab === 'customers'}ভিআইপি গ্রাহক
						{:else if activeTab === 'trash'}বাতিল ও ট্র্যাশ
						{:else if activeTab === 'database'}Cloudflare D1 সেটিংস
						{/if}
					</span>
				</div>
			</div>

			<!-- Header Right Action Tools -->
			<div class="flex items-center gap-3">
				<!-- Live Store Quick Link -->
				<a
					href="/"
					target="_blank"
					class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 text-xs font-bold transition-all bg-slate-50/50 shadow-2xs"
				>
					<span>লাইভ স্টোর</span>
					<ExternalLink class="w-3.5 h-3.5" />
				</a>

				<!-- Create Order Action Button -->
				<button
					onclick={() => activeTab = 'new_order'}
					class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-102"
				>
					<PlusCircle class="w-4 h-4" />
					<span class="hidden sm:inline">নতুন অর্ডার</span>
				</button>

				<!-- Refresh Data Button -->
				<button
					onclick={() => window.location.reload()}
					class="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 text-xs transition-colors"
					title="রিলোড করুন"
				>
					<RefreshCw class="w-4 h-4" />
				</button>
			</div>
		</header>

		<!-- WORKSPACE BODY CONTENT -->
		<main class="p-6 md:p-8 space-y-8 flex-1">
			
			<!-- ============================================== -->
			<!-- TAB 1: EXECUTIVE OVERVIEW (Trezo Style Polish) -->
			<!-- ============================================== -->
			{#if activeTab === 'overview'}
				<!-- Header with date filter tabs -->
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<div class="flex items-center gap-2">
							<h1 class="text-2xl font-black text-slate-900 tracking-tight font-['Outfit']">
								অ্যাডমিন ওভারভিউ
							</h1>
							<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
								রিয়েল-টাইম
							</span>
						</div>
						<p class="text-xs text-slate-500 mt-1">
							ব্যবসার লাইভ সেলস, দৈনিক ট্রেন্ড এবং অর্ডার ফুলফিলমেন্ট সামারি
						</p>
					</div>

					<!-- Date Filter Pills -->
					<div class="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
						{#each [
							{ id: 'today', label: 'আজ' },
							{ id: 'yesterday', label: 'গতকাল' },
							{ id: '7days', label: 'গত ৭ দিন' },
							{ id: '30days', label: 'গত ৩০ দিন' },
							{ id: 'all', label: 'সব সময়' }
						] as f}
							<button
								onclick={() => activeDateFilter = f.id as any}
								class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all {activeDateFilter === f.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							>
								{f.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- 6 Performance Summary Cards (Elevated Luxury Cards with Sparklines) -->
				<div>
					<div class="flex items-center justify-between mb-3.5">
						<div class="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
							<Activity class="w-4 h-4 text-blue-600" />
							রিয়েল-টাইম পারফরম্যান্স সামারি
						</div>
						<span class="text-xs text-slate-400">আপডেট: এইমাত্র</span>
					</div>

					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
						
						<!-- Card 1: মোট সেলস (Revenue) -->
						<div class="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-200 transition-all group flex flex-col justify-between">
							<div>
								<div class="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
									<span class="truncate">মোট সেলস (Revenue)</span>
									<span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shadow-2xs">
										💵
									</span>
								</div>
								<div class="text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
									{formatTaka(data.stats.totalRevenue)}
								</div>
								<div class="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600">
									<TrendingUp class="w-3 h-3" />
									<span>+২৪.৮% বৃদ্ধি</span>
								</div>
							</div>
							<div class="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 font-medium">
								কনফার্মড: <strong class="text-slate-700">{formatTaka(data.stats.confirmedRevenue)}</strong>
							</div>
						</div>

						<!-- Card 2: মোট অর্ডার (Total Orders) -->
						<div class="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-200 transition-all group flex flex-col justify-between">
							<div>
								<div class="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
									<span class="truncate">মোট অর্ডার (Orders)</span>
									<span class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm shadow-2xs">
										🛍️
									</span>
								</div>
								<div class="text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
									{data.stats.totalOrders} <span class="text-sm font-bold text-slate-500">টি</span>
								</div>
								<div class="flex items-center gap-1 mt-1 text-[10px] font-bold text-blue-600">
									<TrendingUp class="w-3 h-3" />
									<span>+১২.৩% বৃদ্ধি</span>
								</div>
							</div>
							<div class="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 font-medium">
								আজকে <strong class="text-slate-700">{data.stats.todayOrdersCount} টি</strong> • পেন্ডিং <strong class="text-blue-600">{data.stats.pendingOrdersCount} টি</strong>
							</div>
						</div>

						<!-- Card 3: কনফার্মড রেট (Confirmed Rate) -->
						<div class="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-purple-200 transition-all group flex flex-col justify-between">
							<div>
								<div class="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
									<span class="truncate">কনফার্মড রেট (Rate)</span>
									<span class="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm shadow-2xs">
										✔️
									</span>
								</div>
								<div class="text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
									{data.stats.confirmedRate}<span class="text-base font-bold text-slate-500">%</span>
								</div>
								<div class="flex items-center gap-1 mt-1 text-[10px] font-bold text-purple-600">
									<CheckCheck class="w-3 h-3" />
									<span>লক্ষ্যমাত্রা ৭৫%</span>
								</div>
							</div>
							<div class="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 font-medium">
								<strong class="text-slate-700">{data.stats.confirmedCount} টি</strong> অর্ডার নিশ্চিত
							</div>
						</div>

						<!-- Card 4: ডেলিভারি সফল (Delivered) -->
						<div class="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-cyan-200 transition-all group flex flex-col justify-between">
							<div>
								<div class="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
									<span class="truncate">ডেলিভারি সম্পন্ন</span>
									<span class="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center text-sm shadow-2xs">
										🚚
									</span>
								</div>
								<div class="text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
									{data.stats.deliveredRate}<span class="text-base font-bold text-slate-500">%</span>
								</div>
								<div class="flex items-center gap-1 mt-1 text-[10px] font-bold text-cyan-600">
									<span>{data.stats.deliveredCount} টি সফল ডেলিভারি</span>
								</div>
							</div>
							<div class="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 font-medium">
								গৃহীত: <strong class="text-slate-700">{formatTaka(data.stats.deliveredRevenue)}</strong>
							</div>
						</div>

						<!-- Card 5: ক্যানসেলড ও রিটার্ন -->
						<div class="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-rose-200 transition-all group flex flex-col justify-between">
							<div>
								<div class="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
									<span class="truncate">ক্যানসেলড ও রিটার্ন</span>
									<span class="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-sm shadow-2xs">
										⚠️
									</span>
								</div>
								<div class="text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
									{data.stats.cancelledRate}<span class="text-base font-bold text-slate-500">%</span>
								</div>
								<div class="flex items-center gap-1 mt-1 text-[10px] font-bold text-rose-600">
									<span>বাতিল ০ • রিটার্ন {data.stats.cancelledCount}</span>
								</div>
							</div>
							<div class="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 font-medium">
								ক্ষতি প্রতিরোধ ব্যবস্থা সক্রিয়
							</div>
						</div>

						<!-- Card 6: গড় অর্ডার মূল্য (AOV) -->
						<div class="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-amber-200 transition-all group flex flex-col justify-between">
							<div>
								<div class="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
									<span class="truncate">গড় মূল্য (AOV)</span>
									<span class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm shadow-2xs">
										🛒
									</span>
								</div>
								<div class="text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
									{formatTaka(data.stats.aov)}
								</div>
								<div class="flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-600">
									<TrendingUp class="w-3 h-3" />
									<span>প্রতি অর্ডারে সর্বোচ্চ মান</span>
								</div>
							</div>
							<div class="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 font-medium">
								সর্বোচ্চ একক টিকিট: <strong class="text-slate-700">৳১,৫০০</strong>
							</div>
						</div>
					</div>
				</div>

				<!-- ============================================== -->
				<!-- VISUAL ANALYTICS: TREND CHART & DONUT RATIO    -->
				<!-- ============================================== -->
				<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
					
					<!-- Left: Sales & Orders Revenue Trend Chart -->
					<div class="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
						<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div>
								<h3 class="text-base font-black text-slate-900 flex items-center gap-2">
									<TrendingUp class="w-4 h-4 text-blue-600" />
									সেলস ও অর্ডার ট্রেন্ড (Sales & Orders Revenue)
								</h3>
								<p class="text-xs text-slate-400">প্রতিদিনের অর্জিত রেভিনিউ (টাকা) এবং মোট অর্ডার সংখ্যা</p>
							</div>

							<!-- Legends -->
							<div class="flex items-center gap-4 text-xs font-bold">
								<div class="flex items-center gap-1.5">
									<span class="w-3 h-3 rounded-md bg-blue-600 shadow-xs"></span>
									<span class="text-slate-700">রেভিনিউ (৳)</span>
								</div>
								<div class="flex items-center gap-1.5">
									<span class="w-3 h-3 rounded-md bg-emerald-500 shadow-xs"></span>
									<span class="text-slate-700">অর্ডার সংখ্যা (টি)</span>
								</div>
							</div>
						</div>

						<!-- High-Precision SVG Spline Area Chart -->
						<div class="relative pt-2">
							<svg viewBox="0 0 640 220" class="w-full h-60 overflow-visible">
								<defs>
									<!-- Blue Gradient for Sales Area -->
									<linearGradient id="salesGradUltra" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stop-color="#2563eb" stop-opacity="0.25" />
										<stop offset="100%" stop-color="#2563eb" stop-opacity="0.0" />
									</linearGradient>
									<!-- Green Gradient for Orders Area -->
									<linearGradient id="ordersGradUltra" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stop-color="#10b981" stop-opacity="0.18" />
										<stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
									</linearGradient>
								</defs>

								<!-- Horizontal Gridlines & Y-Axis Labels -->
								{#each [
									{ label: '৳৬,০০০', rLabel: '৮টি', y: 40 },
									{ label: '৳৪,৫০০', rLabel: '৬টি', y: 85 },
									{ label: '৳৩,০০০', rLabel: '৪টি', y: 130 },
									{ label: '৳১,৫০০', rLabel: '২টি', y: 175 }
								] as grid}
									<line x1="45" y1={grid.y} x2="595" y2={grid.y} stroke="#f1f5f9" stroke-dasharray="4 4" stroke-width="1.5" />
									<text x="38" y={grid.y + 4} text-anchor="end" fill="#94a3b8" font-size="10" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600">{grid.label}</text>
									<text x="602" y={grid.y + 4} text-anchor="start" fill="#94a3b8" font-size="10" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600">{grid.rLabel}</text>
								{/each}

								<!-- Area: Sales (Revenue) -->
								<path
									d="M 50 190 L 50 75 C 95 120, 140 165, 140 165 C 185 145, 230 125, 230 125 C 275 150, 320 175, 320 175 C 365 135, 410 95, 410 95 C 455 70, 500 45, 500 45 C 545 75, 590 110, 590 110 L 590 190 Z"
									fill="url(#salesGradUltra)"
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
									stroke-linecap="round"
								/>

								<!-- Interactive Data Points & Date Axis -->
								{#each trendData as pt}
									<!-- Date on X-Axis -->
									<text x={pt.x} y="208" text-anchor="middle" fill="#64748b" font-size="11" font-weight="700">{pt.date}</text>

									<!-- Sales Circle Node -->
									<circle
										cx={pt.x}
										cy={pt.ySales}
										r="5"
										fill="#ffffff"
										stroke="#2563eb"
										stroke-width="3"
										class="cursor-pointer transition-transform hover:scale-175 shadow-lg"
										onmouseenter={() => activeChartPoint = pt}
										onmouseleave={() => activeChartPoint = null}
									/>

									<!-- Orders Circle Node -->
									<circle
										cx={pt.x}
										cy={pt.yOrders}
										r="4"
										fill="#ffffff"
										stroke="#10b981"
										stroke-width="2.5"
										class="cursor-pointer"
									/>
								{/each}
							</svg>

							<!-- Hover Glass Tooltip -->
							{#if activeChartPoint}
								<div class="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white text-xs px-4 py-2 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-4 pointer-events-none backdrop-blur-md">
									<div class="flex items-center gap-1.5 font-bold text-cyan-400">
										<span>📅 {activeChartPoint.date}</span>
									</div>
									<div class="text-slate-200">
										মোট সেলস: <strong class="text-white">{formatTaka(activeChartPoint.sales)}</strong>
									</div>
									<div class="text-emerald-400">
										অর্ডার: <strong>{activeChartPoint.orders} টি</strong>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Right: Order Status & Fulfillment Ratio Donut -->
					<div class="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
						<div>
							<h3 class="text-base font-black text-slate-900 flex items-center gap-2">
								<CheckCircle2 class="w-4 h-4 text-indigo-600" />
								অর্ডার স্ট্যাটাস রেশিও (Status Ratio)
							</h3>
							<p class="text-xs text-slate-400">স্ট্যাটাস অনুযায়ী অর্ডারের শতকরা ভাগ ও ডিস্ট্রিবিউশন</p>
						</div>

						<!-- Circular Donut Chart -->
						<div class="flex items-center justify-center relative py-2">
							<svg viewBox="0 0 160 160" class="w-48 h-48 -rotate-90">
								<!-- Track -->
								<circle cx="80" cy="80" r="60" fill="transparent" stroke="#f8fafc" stroke-width="16" />

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

								<!-- 3. Confirmed: 15% (Emerald #10b981) -->
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

							<!-- Donut Center Value -->
							<div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
								<div class="text-3xl font-black text-slate-900 font-['Outfit']">
									{data.stats.totalOrders}
								</div>
								<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
									মোট অর্ডার
								</div>
							</div>
						</div>

						<!-- Legend Grid -->
						<div class="grid grid-cols-2 gap-2.5 text-xs pt-3 border-t border-slate-100 font-medium">
							<div class="flex items-center gap-2">
								<span class="w-3 h-3 rounded-md bg-blue-500 shadow-xs"></span>
								<span class="text-slate-700">ডেলিভার্ড ({data.stats.deliveredRate}%)</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="w-3 h-3 rounded-md bg-amber-500 shadow-xs"></span>
								<span class="text-slate-700">প্রসেসিং (২৫%)</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="w-3 h-3 rounded-md bg-emerald-500 shadow-xs"></span>
								<span class="text-slate-700">কনফার্মড ({data.stats.confirmedRate}%)</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="w-3 h-3 rounded-md bg-rose-500 shadow-xs"></span>
								<span class="text-slate-700">বাতিল/রিটার্ন ({data.stats.cancelledRate}%)</span>
							</div>
						</div>
					</div>

				</div>

				<!-- ============================================== -->
				<!-- RECENT ORDERS STREAM TABLE                    -->
				<!-- ============================================== -->
				<div class="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-base font-black text-slate-900">সাম্প্রতিক অর্ডার স্ট্রিম (Recent Orders Stream)</h3>
							<p class="text-xs text-slate-400">সর্বশেষ আসা কাস্টমার অর্ডার তালিকা এবং ডেলিভারি স্ট্যাটাস</p>
						</div>
						<button
							onclick={() => activeTab = 'orders'}
							class="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
						>
							<span>সব {data.orders.length}টি অর্ডার দেখুন</span>
							<ChevronRight class="w-4 h-4" />
						</button>
					</div>

					<div class="overflow-x-auto">
						<table class="w-full text-left text-xs">
							<thead>
								<tr class="border-b border-slate-100 text-slate-500 bg-slate-50/60">
									<th class="py-3.5 px-4 font-bold">অর্ডার আইডি</th>
									<th class="py-3.5 px-4 font-bold">কাস্টমার</th>
									<th class="py-3.5 px-4 font-bold">ঠিকানা ও জেলা</th>
									<th class="py-3.5 px-4 font-bold">পণ্য</th>
									<th class="py-3.5 px-4 font-bold">মূল্য</th>
									<th class="py-3.5 px-4 font-bold">স্ট্যাটাস</th>
									<th class="py-3.5 px-4 font-bold text-right">অ্যাকশন</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each data.orders.slice(0, 6) as ord}
									{@const parsedItems = parseItems(ord.items)}
									<tr class="hover:bg-slate-50/70 transition-colors">
										<!-- ID -->
										<td class="py-4 px-4 font-mono font-bold text-blue-600">
											<div class="flex items-center gap-1.5">
												<span>{ord.id}</span>
												<button
													onclick={() => copyToClipboard(ord.id, ord.id)}
													class="text-slate-400 hover:text-slate-700"
													title="আইডি কপি"
												>
													{#if isCopied === ord.id}
														<Check class="w-3.5 h-3.5 text-emerald-600" />
													{:else}
														<Copy class="w-3.5 h-3.5" />
													{/if}
												</button>
											</div>
										</td>

										<!-- Customer Name & Contacts -->
										<td class="py-4 px-4">
											<div class="font-bold text-slate-900">{ord.customerName}</div>
											<div class="text-[11px] text-slate-400">{ord.customerEmail}</div>
										</td>

										<!-- Shipping Address -->
										<td class="py-4 px-4 max-w-[220px] text-slate-600 truncate" title={ord.shippingAddress}>
											{ord.shippingAddress}
										</td>

										<!-- Items -->
										<td class="py-4 px-4">
											{#each parsedItems as itm}
												<div class="text-[11px] font-medium text-slate-700 truncate max-w-[160px]">
													<strong class="text-blue-600">{itm.quantity}x</strong> {itm.name}
												</div>
											{/each}
										</td>

										<!-- Total Amount -->
										<td class="py-4 px-4 font-bold text-slate-900 font-['Outfit'] text-sm">
											{formatTaka(ord.total)}
										</td>

										<!-- Status Badge -->
										<td class="py-4 px-4">
											{#if ord.status === 'delivered'}
												<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
													<CheckCircle2 class="w-3 h-3" /> ডেলিভার্ড
												</span>
											{:else if ord.status === 'dispatched'}
												<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 inline-flex items-center gap-1">
													<Truck class="w-3 h-3" /> ইন ট্রানজিট
												</span>
											{:else if ord.status === 'processing'}
												<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
													<Clock class="w-3 h-3" /> প্যাকিং
												</span>
											{:else if ord.status === 'refunded'}
												<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
													<AlertTriangle class="w-3 h-3" /> বাতিল
												</span>
											{:else}
												<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
													পেইড
												</span>
											{/if}
										</td>

										<!-- Action Form Changer -->
										<td class="py-4 px-4 text-right">
											<form action="?/updateOrderStatus" method="POST" use:enhance class="inline-flex items-center gap-2">
												<input type="hidden" name="orderId" value={ord.id} />
												<select
													name="status"
													onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()}
													class="bg-slate-50 text-[11px] font-bold text-slate-700 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 shadow-2xs"
												>
													<option value="paid" selected={ord.status === 'paid'}>পেইড</option>
													<option value="processing" selected={ord.status === 'processing'}>প্রসেসিং</option>
													<option value="dispatched" selected={ord.status === 'dispatched'}>ডিসপ্যাচ</option>
													<option value="delivered" selected={ord.status === 'delivered'}>ডেলিভার্ড</option>
													<option value="refunded" selected={ord.status === 'refunded'}>বাতিল</option>
												</select>
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
			<!-- TAB 2: ALL ORDERS & ORDER LIST (Full Management)-->
			<!-- ============================================== -->
			{#if activeTab === 'orders' || activeTab === 'order_list'}
				<div class="space-y-4">
					<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h2 class="text-xl font-black text-slate-900 font-['Outfit']">অর্ডার ম্যানেজমেন্ট ও ট্র্যাকিং</h2>
							<p class="text-xs text-slate-400">মোট {filteredOrders.length} টি অর্ডারের সার্বিক তথ্য এবং ডেলিভারি নিয়ন্ত্রণ</p>
						</div>

						<div class="flex items-center gap-2">
							<button
								onclick={() => {
									const csv = 'Order ID,Customer,Phone/Email,Address,Total,Status\n' +
										filteredOrders.map(o => `"${o.id}","${o.customerName}","${o.customerEmail}","${o.shippingAddress}",${o.total},"${o.status}"`).join('\n');
									const blob = new Blob([csv], { type: 'text/csv' });
									const url = window.URL.createObjectURL(blob);
									const a = document.createElement('a');
									a.href = url;
									a.download = `orders-export-${Date.now()}.csv`;
									a.click();
								}}
								class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs transition-all"
							>
								<Download class="w-3.5 h-3.5 text-slate-500" />
								<span>CSV এক্সপোর্ট</span>
							</button>

							<button
								onclick={() => activeTab = 'new_order'}
								class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
							>
								<PlusCircle class="w-4 h-4" />
								<span>নতুন অর্ডার তৈরি</span>
							</button>
						</div>
					</div>

					<!-- Search & Status Filter Ribbon -->
					<div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
						<div class="relative flex-1 max-w-md">
							<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
							<input
								type="text"
								bind:value={orderSearchQuery}
								placeholder="অর্ডার আইডি, কাস্টমার নাম, ফোন বা ঠিকানা দিয়ে খুঁজুন..."
								class="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
							/>
						</div>

						<!-- Status Filter Buttons -->
						<div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
							{#each [
								{ id: 'all', label: 'সব অর্ডার' },
								{ id: 'paid', label: 'পেইড' },
								{ id: 'processing', label: 'প্রসেসিং' },
								{ id: 'dispatched', label: 'ডিসপ্যাচ' },
								{ id: 'delivered', label: 'ডেলিভার্ড' },
								{ id: 'refunded', label: 'বাতিল' }
							] as st}
								<button
									onclick={() => orderStatusFilter = st.id}
									class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all {orderStatusFilter === st.id ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200'}"
								>
									{st.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Orders Data Table -->
					<div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
						<div class="overflow-x-auto">
							<table class="w-full text-left text-xs">
								<thead>
									<tr class="border-b border-slate-100 bg-slate-50/70 text-slate-500">
										<th class="py-3.5 px-4 font-bold">অর্ডার আইডি</th>
										<th class="py-3.5 px-4 font-bold">গ্রাহক তথ্য</th>
										<th class="py-3.5 px-4 font-bold">পণ্য বিবরণ</th>
										<th class="py-3.5 px-4 font-bold">ডেলিভারি ঠিকানা</th>
										<th class="py-3.5 px-4 font-bold">পেমেন্ট মেথড</th>
										<th class="py-3.5 px-4 font-bold">মোট টাকা</th>
										<th class="py-3.5 px-4 font-bold">স্ট্যাটাস</th>
										<th class="py-3.5 px-4 font-bold text-right">অ্যাকশন</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-100">
									{#if filteredOrders.length === 0}
										<tr>
											<td colspan="8" class="py-16 text-center text-slate-400">
												আপনার ফিল্টারে কোনো অর্ডার পাওয়া যায়নি।
											</td>
										</tr>
									{/if}

									{#each filteredOrders as order (order.id)}
										{@const parsedItems = parseItems(order.items)}
										<tr class="hover:bg-slate-50/80 transition-colors">
											<!-- ID with Copy -->
											<td class="py-4 px-4 font-mono font-bold text-blue-600">
												<div class="flex items-center gap-1.5">
													<span>{order.id}</span>
													<button
														onclick={() => copyToClipboard(order.id, order.id)}
														class="text-slate-400 hover:text-slate-700"
														title="আইডি কপি"
													>
														{#if isCopied === order.id}
															<Check class="w-3.5 h-3.5 text-emerald-600" />
														{:else}
															<Copy class="w-3.5 h-3.5" />
														{/if}
													</button>
												</div>
											</td>

											<!-- Customer -->
											<td class="py-4 px-4">
												<div class="font-bold text-slate-900">{order.customerName}</div>
												<div class="text-[11px] text-slate-400">{order.customerEmail}</div>
											</td>

											<!-- Items -->
											<td class="py-4 px-4 max-w-xs">
												<div class="space-y-1">
													{#each parsedItems as itm}
														<div class="flex items-center gap-1.5 text-[11px] text-slate-700">
															<span class="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold font-mono">
																{itm.quantity}x
															</span>
															<span class="truncate">{itm.name}</span>
														</div>
													{/each}
												</div>
											</td>

											<!-- Address -->
											<td class="py-4 px-4 max-w-[200px] text-slate-600 truncate" title={order.shippingAddress}>
												{order.shippingAddress}
											</td>

											<!-- Payment Method -->
											<td class="py-4 px-4">
												<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
													ক্যাশ অন ডেলিভারি
												</span>
											</td>

											<!-- Total Amount -->
											<td class="py-4 px-4 font-bold text-slate-900 font-['Outfit'] text-sm">
												{formatTaka(order.total)}
											</td>

											<!-- Status Badge -->
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

											<!-- Status Action Dropdown & Delete -->
											<td class="py-4 px-4 text-right">
												<div class="inline-flex items-center gap-2">
													<form action="?/updateOrderStatus" method="POST" use:enhance class="inline">
														<input type="hidden" name="orderId" value={order.id} />
														<select
															name="status"
															onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()}
															class="bg-slate-50 text-[11px] font-bold text-slate-700 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 shadow-2xs"
														>
															<option value="paid" selected={order.status === 'paid'}>পেইড</option>
															<option value="processing" selected={order.status === 'processing'}>প্রসেসিং</option>
															<option value="dispatched" selected={order.status === 'dispatched'}>ডিসপ্যাচ</option>
															<option value="delivered" selected={order.status === 'delivered'}>ডেলিভার্ড</option>
															<option value="refunded" selected={order.status === 'refunded'}>বাতিল</option>
														</select>
													</form>

													<!-- Move to Trash -->
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

			<!-- ============================================== -->
			<!-- TAB 3: NEW MANUAL ORDER FORM                  -->
			<!-- ============================================== -->
			{#if activeTab === 'new_order'}
				<div class="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-8 shadow-[0_2px_15px_rgba(0,0,0,0.04)] space-y-6">
					<div>
						<h2 class="text-xl font-black text-slate-900 flex items-center gap-2 font-['Outfit']">
							<PlusCircle class="w-5 h-5 text-blue-600" />
							নতুন অর্ডার তৈরি করুন
						</h2>
						<p class="text-xs text-slate-500 mt-1">
							ম্যানুয়াল কাস্টমার অর্ডার সরাসরি Cloudflare D1 ডাটাবেজে এন্ট্রি করুন।
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
								class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
							/>
						</div>

						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">ইমেইল / মোবাইল নম্বর *</label>
							<input
								type="text"
								name="customerEmail"
								required
								placeholder="017XXXXXXXX বা customer@email.com"
								class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none shadow-2xs font-mono"
							/>
						</div>

						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-700">ডেলিভারি পূর্ণ ঠিকানা ও জেলা *</label>
							<textarea
								name="shippingAddress"
								required
								rows="3"
								placeholder="বাড়ি #, রোড #, এলাকা, থানা, জেলা..."
								class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
							></textarea>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div class="space-y-1.5">
								<label class="text-xs font-bold text-slate-700">পণ্য নির্বাচন</label>
								<select
									name="productName"
									class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none bg-white font-bold"
								>
									<option value="AURA Spectrum X">AURA Spectrum X (Planar Flagship)</option>
									<option value="AURA Wave Spatial Pro">AURA Wave Spatial Pro (IEM)</option>
									<option value="AURA Creator Sound Deck">AURA Creator Sound Deck (Studio)</option>
								</select>
							</div>

							<div class="space-y-1.5">
								<label class="text-xs font-bold text-slate-700">মোট টাকা (টাকা)</label>
								<input
									type="number"
									name="total"
									value="1250"
									required
									class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none font-['Outfit'] font-bold text-slate-900"
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
								class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
							>
								অর্ডার সেভ করুন
							</button>
						</div>
					</form>
				</div>
			{/if}

			<!-- ============================================== -->
			<!-- TAB 4: TRASH (মুছে ফেলা ও বাতিল)               -->
			<!-- ============================================== -->
			{#if activeTab === 'trash'}
				<div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
					<div>
						<h2 class="text-xl font-black text-slate-900 flex items-center gap-2 font-['Outfit']">
							<Trash2 class="w-5 h-5 text-rose-600" />
							বাতিল ও ট্র্যাশ তালিকা ({trashedOrders.length})
						</h2>
						<p class="text-xs text-slate-400">বাতিল বা ফেরতকৃত অর্ডারসমূহ এখানে সংরক্ষিত থাকে, যা চাইলে এক ক্লিকে পুনরুদ্ধার করা সম্ভব।</p>
					</div>

					<div class="overflow-x-auto">
						<table class="w-full text-left text-xs">
							<thead>
								<tr class="border-b border-slate-100 bg-slate-50 text-slate-500">
									<th class="py-3 px-4 font-bold">অর্ডার আইডি</th>
									<th class="py-3 px-4 font-bold">কাস্টমার</th>
									<th class="py-3 px-4 font-bold">ঠিকানা</th>
									<th class="py-3 px-4 font-bold">টাকা</th>
									<th class="py-3 px-4 font-bold text-right">পুনরুদ্ধার</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#if trashedOrders.length === 0}
									<tr>
										<td colspan="5" class="py-14 text-center text-slate-400">
											ট্র্যাশে কোনো বাতিল অর্ডার নেই।
										</td>
									</tr>
								{/if}

								{#each trashedOrders as ord}
									<tr class="hover:bg-slate-50">
										<td class="py-3.5 px-4 font-mono font-bold text-rose-600">{ord.id}</td>
										<td class="py-3.5 px-4 font-bold text-slate-900">{ord.customerName}</td>
										<td class="py-3.5 px-4 text-slate-500">{ord.shippingAddress}</td>
										<td class="py-3.5 px-4 font-bold text-slate-900 font-['Outfit']">{formatTaka(ord.total)}</td>
										<td class="py-3.5 px-4 text-right">
											<form action="?/restoreOrder" method="POST" use:enhance class="inline">
												<input type="hidden" name="orderId" value={ord.id} />
												<button
													type="submit"
													class="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs transition-colors"
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

			<!-- ============================================== -->
			<!-- TAB 5: INVENTORY & STOCK MANAGEMENT           -->
			<!-- ============================================== -->
			{#if activeTab === 'inventory'}
				<div class="space-y-6">
					<div>
						<h2 class="text-xl font-black text-slate-900 flex items-center gap-2 font-['Outfit']">
							<Package class="w-5 h-5 text-blue-600" />
							প্রোডাক্ট ক্যাটালগ ও ইনভেন্টরি স্টক কন্ট্রোল
						</h2>
						<p class="text-xs text-slate-400 mt-1">
							ল্যান্ডিং পেজে প্রদর্শিত পণ্যের স্টক ইন/আউট স্ট্যাটাস ও প্রাইসিং পরিচালনা করুন।
						</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
						{#each data.products as prod}
							<div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
								<div>
									<div class="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 mb-3 relative border border-slate-100">
										<img src={prod.image} alt={prod.name} class="w-full h-full object-cover" />
										{#if prod.badge}
											<span class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs">
												{prod.badge}
											</span>
										{/if}
									</div>

									<div class="flex items-center justify-between">
										<h3 class="font-bold text-slate-900 text-base">{prod.name}</h3>
										<span class="font-bold font-['Outfit'] text-blue-600 text-base">
											${(prod.price / 100).toFixed(0)}
										</span>
									</div>
									<p class="text-xs text-slate-500 line-clamp-2 mt-1">{prod.tagline}</p>
								</div>

								<div class="pt-3 border-t border-slate-100 flex items-center justify-between">
									<div>
										{#if prod.inStock}
											<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
												ইন স্টক (Active)
											</span>
										{:else}
											<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
												আউট অফ স্টক (Sold Out)
											</span>
										{/if}
									</div>

									<form action="?/toggleProductStock" method="POST" use:enhance>
										<input type="hidden" name="productId" value={prod.id} />
										<input type="hidden" name="inStock" value={prod.inStock ? 'false' : 'true'} />
										<button
											type="submit"
											class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all {prod.inStock ? 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 border border-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}"
										>
											{prod.inStock ? 'স্টক বন্ধ করুন' : 'স্টক চালু করুন'}
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
				<div class="max-w-3xl bg-white rounded-2xl border border-slate-200/80 p-8 shadow-[0_2px_15px_rgba(0,0,0,0.04)] space-y-6">
					<div>
						<h2 class="text-xl font-black text-slate-900 flex items-center gap-2 font-['Outfit']">
							<Truck class="w-5 h-5 text-blue-600" />
							কুরিয়ার সার্ভিস ইন্টিগ্রেশন সেটিংস
						</h2>
						<p class="text-xs text-slate-500 mt-1">
							Steadfast, Pathao Courier ও RedX API সংযোগ এবং ডেলিভারি চার্জ নির্ধারণ করুন।
						</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
							<div class="font-bold text-slate-900 text-xs uppercase tracking-wider">ঢাকা সিটির ভিতরে চার্জ</div>
							<div class="flex items-center gap-2">
								<span class="text-slate-400 font-bold">৳</span>
								<input
									type="number"
									value="70"
									class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-['Outfit'] font-bold text-base"
								/>
							</div>
						</div>

						<div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
							<div class="font-bold text-slate-900 text-xs uppercase tracking-wider">ঢাকা সিটির বাইরে চার্জ</div>
							<div class="flex items-center gap-2">
								<span class="text-slate-400 font-bold">৳</span>
								<input
									type="number"
									value="130"
									class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-['Outfit'] font-bold text-base"
								/>
							</div>
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
							class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
						>
							<Save class="w-4 h-4" />
							<span>কুরিয়ার সেটিংস সেভ করুন</span>
						</button>
					</div>
				</div>
			{/if}

			<!-- ============================================== -->
			<!-- TAB 7: PIXELS & CAPI TRACKING                 -->
			<!-- ============================================== -->
			{#if activeTab === 'pixels'}
				<div class="max-w-3xl bg-white rounded-2xl border border-slate-200/80 p-8 shadow-[0_2px_15px_rgba(0,0,0,0.04)] space-y-6">
					<div>
						<h2 class="text-xl font-black text-slate-900 flex items-center gap-2 font-['Outfit']">
							<Radio class="w-5 h-5 text-blue-600" />
							পিক্সেল ও কনভার্সন ট্র্যাকিং
						</h2>
						<p class="text-xs text-slate-500 mt-1">
							Facebook Pixel, TikTok Pixel এবং Google Analytics ট্যাগ কনফিগার করুন।
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
								class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
							>
								<Save class="w-4 h-4" />
								<span>পিক্সেল সেটিংস সেভ করুন</span>
							</button>
						</div>
					</div>
				</div>
			{/if}

			<!-- ============================================== -->
			<!-- TAB 8: CLOUDFLARE D1 DATABASE CONSOLE          -->
			<!-- ============================================== -->
			{#if activeTab === 'database'}
				<div class="max-w-4xl bg-white rounded-2xl border border-slate-200/80 p-8 shadow-[0_2px_15px_rgba(0,0,0,0.04)] space-y-6">
					<div>
						<h2 class="text-xl font-black text-slate-900 flex items-center gap-2 font-['Outfit']">
							<Database class="w-5 h-5 text-emerald-600" />
							Cloudflare D1 Edge Database Console
						</h2>
						<p class="text-xs text-slate-500 mt-1">
							Cloudflare Edge নেটওয়ার্কে পরিচালিত লাইভ সার্ভারলেস SQLite ডাটাবেজ স্থিতি।
						</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
							<div class="text-[10px] font-bold uppercase text-slate-400">Database Binding</div>
							<div class="font-mono text-base font-black text-blue-600">env.DB</div>
							<div class="text-[11px] text-slate-500">Connected through Cloudflare Worker</div>
						</div>

						<div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
							<div class="text-[10px] font-bold uppercase text-slate-400">Database Name</div>
							<div class="font-mono text-base font-black text-slate-900">aura</div>
							<div class="text-[11px] text-slate-500">ID: 85e821c2-73e0-4490-b87a...</div>
						</div>

						<div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
							<div class="text-[10px] font-bold uppercase text-slate-400">মোট টেবিল</div>
							<div class="font-mono text-base font-black text-emerald-600">৮ টি টেবিল সক্রিয়</div>
							<div class="text-[11px] text-slate-500">products, orders, reviews, newsletter</div>
						</div>
					</div>

					<div class="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
						<div>
							<div class="font-bold text-slate-900 text-sm">ডেমো ক্যাটালগ ও অর্ডার রিসিঙ্ক (Seed Database)</div>
							<div class="text-xs text-slate-500">ডাটাবেজে ডিফল্ট ২০টি লাইভ অর্ডার এবং প্রোডাক্ট পুনরায় সিঙ্ক করুন।</div>
						</div>

						<form action="?/seedDatabase" method="POST" use:enhance>
							<button
								type="submit"
								class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
							>
								<RefreshCw class="w-4 h-4" />
								<span>ডাটাবেজ সিঙ্ক চালু করুন</span>
							</button>
						</form>
					</div>
				</div>
			{/if}

			<!-- ============================================== -->
			<!-- TAB 9: CUSTOMERS & VIP CLUB                    -->
			<!-- ============================================== -->
			{#if activeTab === 'customers'}
				<div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<h2 class="text-xl font-black text-slate-900 flex items-center gap-2 font-['Outfit']">
								<Users class="w-5 h-5 text-indigo-600" />
								ভিআইপি অডিয়েন্স ও সাবস্ক্রাইবার তালিকা
							</h2>
							<p class="text-xs text-slate-400">ল্যান্ডিং পেজ থেকে সংগ্রহ করা ভেরিফায়েড লিডস।</p>
						</div>

						<button
							onclick={() => {
								const csv = 'Email,Created At\n' + data.newsletter.map(n => `"${n.email}","${n.createdAt}"`).join('\n');
								const blob = new Blob([csv], { type: 'text/csv' });
								const url = window.URL.createObjectURL(blob);
								const a = document.createElement('a');
								a.href = url;
								a.download = 'aura-leads.csv';
								a.click();
							}}
							class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs"
						>
							<Download class="w-3.5 h-3.5 text-slate-500" />
							<span>CSV এক্সপোর্ট</span>
						</button>
					</div>

					<div class="overflow-x-auto">
						<table class="w-full text-left text-xs">
							<thead>
								<tr class="border-b border-slate-100 bg-slate-50 text-slate-500">
									<th class="py-3 px-4 font-bold">ইমেইল ঠিকানা</th>
									<th class="py-3 px-4 font-bold">নিবন্ধনের তারিখ</th>
									<th class="py-3 px-4 font-bold text-right">অ্যাকশন</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each data.newsletter as sub}
									<tr class="hover:bg-slate-50">
										<td class="py-3.5 px-4 font-mono font-bold text-blue-600">{sub.email}</td>
										<td class="py-3.5 px-4 text-slate-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
										<td class="py-3.5 px-4 text-right">
											<button
												onclick={() => copyToClipboard(sub.email, sub.email)}
												class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
											>
												{isCopied === sub.email ? 'কপি হয়েছে!' : 'ইমেইল কপি'}
											</button>
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
