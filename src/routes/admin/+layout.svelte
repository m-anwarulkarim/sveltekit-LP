<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { Dialog, Button } from '#lib/components/ui';
	import {
		Flame,
		Search,
		ChevronDown,
		ExternalLink,
		Menu,
		X,
		RefreshCw,
		Play,
		Headphones,
		Globe,
		Languages,
		Bell,
		Crown,
		CheckCircle2,
		User,
		LogOut,
		Info,
		PanelLeftOpen,
		LayoutGrid,
		ReceiptText
	} from 'lucide-svelte';

	let { data, children }: { data: any; children: Snippet } = $props();

	// Sidebar responsive collapse states
	let isSidebarCollapsed = $state(false);
	let isMobileSidebarOpen = $state(false);
	let isMobileSearchOpen = $state(false);
	let isOrdersOpen = $state(false);
	let ordersDropdownRef = $state<HTMLDivElement | null>(null);

	// Top Navbar Interactive Modals & Dropdowns State
	let isTutorialModalOpen = $state(false);
	let isPackageModalOpen = $state(false);

	function handleClickOutside(event: MouseEvent) {
		if (ordersDropdownRef && !ordersDropdownRef.contains(event.target as Node)) {
			isOrdersOpen = false;
		}
	}

	// Quick search input
	let orderSearchQuery = $state('');

	// Courier API Sync Telemetry
	let isCourierSyncing = $state(false);
	let courierSyncMessage = $state<string | null>(null);

	// Derived counts from layout data
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

	// Active route helpers
	let currentPath = $derived(page.url.pathname);
	let isDashboard = $derived(currentPath === '/admin');
	let isOrdersActive = $derived(currentPath.startsWith('/admin/orders'));
	let isSettingsActive = $derived(currentPath.startsWith('/admin/settings'));
	let isCustomerActive = $derived(currentPath.startsWith('/admin/customers'));
	let isDatabaseActive = $derived(currentPath.startsWith('/admin/database'));
	let isIpBlockActive = $derived(currentPath.startsWith('/admin/ip-block'));
	let isProfileActive = $derived(currentPath.startsWith('/admin/profile'));
	let isSupportActive = $derived(currentPath.startsWith('/admin/support'));
	let isNotificationsActive = $derived(currentPath.startsWith('/admin/notifications'));
</script>

<svelte:head>
	<title>AURA Enterprise Control Deck | অ্যাডমিন ড্যাশবোর্ড</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<svelte:window onclick={handleClickOutside} />

<!-- Fullscreen Warm Ivory Executive Frame with Pure White SaaS Sidebar -->
<div class="admin-theme min-h-screen bg-[#faf7f2] text-slate-800 flex flex-col md:flex-row font-['Hind_Siliguri',sans-serif] selection:bg-[#5845eb]/20 selection:text-[#5845eb] antialiased">

	<!-- ============================================== -->
	<!-- 1. HIGH-END EXECUTIVE WHITE SAAS SIDEBAR       -->
	<!-- ============================================== -->
	<aside
		class="bg-white text-slate-700 border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 z-50 fixed md:sticky top-0 h-screen shrink-0 shadow-sm {isSidebarCollapsed ? 'w-20' : 'w-72'} {isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
	>
		<div class="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
			
			<!-- Header (AURA Store Brand + <> Toggle Button) -->
			<div class="h-16 md:h-20 flex items-center {isSidebarCollapsed ? 'justify-center flex-col gap-2.5 py-3' : 'justify-between px-5'} border-b border-slate-100">
				{#if !isSidebarCollapsed}
					<a href="/admin" class="flex items-center gap-3 group">
						<div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5845eb] via-[#7c3aed] to-[#9333ea] p-[1.5px] shadow-md shadow-indigo-600/20 transition-transform group-hover:scale-105">
							<div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
								<Flame class="w-5 h-5 text-[#5845eb]" />
							</div>
						</div>
						
						<div class="flex flex-col">
							<div class="flex items-center gap-1.5">
								<span class="font-['Outfit'] font-black text-lg text-slate-900 tracking-wide">AURA</span>
								<span class="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200">
									PRO
								</span>
							</div>
							<span class="text-[11px] text-slate-400 font-mono -mt-0.5">lp.haqplus.com</span>
						</div>
					</a>

					<div class="flex items-center gap-1.5">
						<!-- Desktop <> Toggle Button -->
						<button
							onclick={() => isSidebarCollapsed = true}
							class="hidden md:flex w-9 h-9 rounded-2xl border border-slate-200/90 items-center justify-center text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs cursor-pointer"
							title="সাইডবার সংকুচিত করুন"
							aria-label="Collapse sidebar"
						>
							<svg class="w-4 h-4 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="16 18 22 12 16 6" />
								<polyline points="8 6 2 12 8 18" />
							</svg>
						</button>

						<!-- Mobile Close Button (X) -->
						<button
							onclick={() => isMobileSidebarOpen = false}
							class="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
							aria-label="Close sidebar"
						>
							<X class="w-5 h-5" />
						</button>
					</div>
				{:else}
					<!-- Collapsed Mode Header (Centered Logo & <> Toggle Button) -->
					<div class="flex flex-col items-center gap-2.5 py-3">
						<div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5845eb] via-[#7c3aed] to-[#9333ea] p-[1.5px] shadow-sm">
							<div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
								<Flame class="w-5 h-5 text-[#5845eb]" />
							</div>
						</div>
						<button
							onclick={() => isSidebarCollapsed = false}
							class="w-9 h-9 rounded-2xl border border-slate-200/90 flex items-center justify-center text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs cursor-pointer"
							title="সাইডবার প্রসারিত করুন"
							aria-label="Expand sidebar"
						>
							<svg class="w-4 h-4 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="16 18 22 12 16 6" />
								<polyline points="8 6 2 12 8 18" />
							</svg>
						</button>
					</div>
				{/if}
			</div>

			<!-- Quick Global Search (Visible when expanded) -->
			{#if !isSidebarCollapsed}
				<div class="p-3 pb-1">
					<div class="relative">
						<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
						<input
							type="text"
							placeholder="অর্ডার বা কাস্টমার খুঁজুন..."
							bind:value={orderSearchQuery}
							class="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-10 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-all shadow-2xs"
						/>
					</div>
				</div>
			{/if}

			<!-- Navigation Links Menu (Modular SvelteKit Sub-Routes) -->
			<nav class="p-3 space-y-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
				
				<!-- 1. Dashboard (Overview & Analytics) -->
				<a
					href="/admin"
					onclick={() => isMobileSidebarOpen = false}
					class="w-full flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isDashboard
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
					title="Dashboard (ওভারভিউ ও মেট্রিক্স)"
				>
					<div class="flex items-center gap-3.5">
						<svg class="w-5 h-5 shrink-0 {isDashboard ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="currentColor">
							<rect x="3" y="3" width="7.5" height="7.5" rx="2" />
							<rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
							<rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
							<rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
						</svg>
						{#if !isSidebarCollapsed}
							<span>Dashboard</span>
						{/if}
					</div>
				</a>

				<!-- 2. Orders (Shopping bag icon with dropdown chevron, defaults to /admin/orders) -->
				<div bind:this={ordersDropdownRef} class="space-y-1 relative">
					<a
						href="/admin/orders"
						onclick={() => {
							if (isSidebarCollapsed) isSidebarCollapsed = false;
							isOrdersOpen = true;
						}}
						class="w-full flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isOrdersActive
							? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
							: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'} cursor-pointer"
						title="Orders (Web Orders)"
					>
						<div class="flex items-center gap-3.5">
							<svg class="w-5 h-5 shrink-0 {isOrdersActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="currentColor">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M6 5C4.89543 5 4 5.89543 4 7L3.1 17C2.98 18.3 3.99 19.5 5.3 19.5H18.7C20.01 19.5 21.02 18.3 20.9 17L20 7C20 5.89543 19.1046 5 18 5H6ZM8 8C8 7.44772 8.44772 7 9 7H15C15.5523 7 16 7.44772 16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8Z" />
							</svg>
							{#if !isSidebarCollapsed}
								<span>Orders</span>
							{/if}
						</div>
						{#if !isSidebarCollapsed}
							<div class="flex items-center gap-2">
								<span class="text-xs font-bold px-2 py-0.5 rounded-full {isOrdersActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}">
									{webOrders.length + orderListOrders.length}
								</span>
								<button
									type="button"
									onclick={(e: MouseEvent) => {
										e.preventDefault();
										e.stopPropagation();
										isOrdersOpen = !isOrdersOpen;
									}}
									class="p-0.5 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
									aria-label="Toggle orders dropdown"
								>
									<ChevronDown class="w-4 h-4 transition-transform duration-200 {isOrdersOpen ? 'rotate-180' : ''}" />
								</button>
							</div>
						{/if}
					</a>

					<!-- Orders Submenu (when expanded) -->
					{#if !isSidebarCollapsed && isOrdersOpen}
						<div class="pl-3 pr-1 py-1 space-y-1 border-l-2 border-slate-100 ml-6 my-1 animate-in fade-in duration-150">
							<!-- 1. Web Orders -->
							<a
								href="/admin/orders"
								onclick={() => isMobileSidebarOpen = false}
								class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {currentPath === '/admin/orders'
									? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
									: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							>
								<span>Web Orders</span>
								<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
									{webOrders.length}
								</span>
							</a>

							<!-- 2. Order List -->
							<a
								href="/admin/orders/list"
								onclick={() => isMobileSidebarOpen = false}
								class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {currentPath === '/admin/orders/list'
									? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
									: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							>
								<span>Order List</span>
								<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
									{orderListOrders.length}
								</span>
							</a>

							<!-- 3. New Order -->
							<a
								href="/admin/orders/new"
								onclick={() => isMobileSidebarOpen = false}
								class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {currentPath === '/admin/orders/new'
									? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
									: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							>
								<span>New Order</span>
								<span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
									Manual
								</span>
							</a>

							<!-- 4. Pre-Orders -->
							<a
								href="/admin/orders/pre"
								onclick={() => isMobileSidebarOpen = false}
								class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {currentPath === '/admin/orders/pre'
									? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
									: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							>
								<span>Pre-Orders</span>
								{#if preOrders.length > 0}
									<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
										{preOrders.length}
									</span>
								{/if}
							</a>

							<!-- 5. Trash -->
							<a
								href="/admin/orders/trash"
								onclick={() => isMobileSidebarOpen = false}
								class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {currentPath === '/admin/orders/trash'
									? 'bg-rose-50 text-rose-700 font-bold border border-rose-200 shadow-2xs'
									: 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/60'}"
							>
								<span>Trash</span>
								{#if trashedOrders.length > 0}
									<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
										{trashedOrders.length}
									</span>
								{/if}
							</a>
						</div>
					{/if}
				</div>

				<!-- 3. Settings -->
				<a
					href="/admin/settings"
					onclick={() => isMobileSidebarOpen = false}
					class="w-full flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isSettingsActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
					title="Settings"
				>
					<div class="flex items-center gap-3.5">
						<svg class="w-5 h-5 shrink-0 {isSettingsActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="currentColor">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2.5a2.25 2.25 0 0 0-2.228 1.93l-.11.758a1.25 1.25 0 0 1-1.385.992l-.75-.12a2.25 2.25 0 0 0-2.476 1.155l-.65 1.126a2.25 2.25 0 0 0 .428 2.7l.557.53a1.25 1.25 0 0 1 0 1.706l-.557.53a2.25 2.25 0 0 0-.428 2.7l.65 1.126a2.25 2.25 0 0 0 2.476 1.155l.75-.12a1.25 1.25 0 0 1 1.385.992l.11.758a2.25 2.25 0 0 0 2.228 1.93h1.3a2.25 2.25 0 0 0 2.228-1.93l.11-.758a1.25 1.25 0 0 1 1.385-.992l.75.12a2.25 2.25 0 0 0 2.476-1.155l.65-1.126a2.25 2.25 0 0 0-.428-2.7l-.557-.53a1.25 1.25 0 0 1 0-1.706l.557-.53a2.25 2.25 0 0 0 .428-2.7l-.65-1.126a2.25 2.25 0 0 0-2.476-1.155l-.75.12a1.25 1.25 0 0 1-1.385-.992l-.11-.758A2.25 2.25 0 0 0 13.3 2.5h-1.3ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
						</svg>
						{#if !isSidebarCollapsed}
							<span>Settings</span>
						{/if}
					</div>
				</a>

				<!-- 6. IP Block -->
				<a
					href="/admin/ip-block"
					onclick={() => isMobileSidebarOpen = false}
					class="w-full flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isIpBlockActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
					title="IP Block (আইপি ও ফোন ব্লক লিস্ট)"
				>
					<div class="flex items-center gap-3.5">
						<svg class="w-5 h-5 shrink-0 {isIpBlockActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="2" y="3" width="20" height="14" rx="2" />
							<circle cx="12" cy="10" r="2.5" fill="currentColor" />
							<path d="M8 21h8M12 17v4" stroke-width="2" stroke-linecap="round" />
						</svg>
						{#if !isSidebarCollapsed}
							<span>IP Block</span>
						{/if}
					</div>
					{#if !isSidebarCollapsed}
						<span class="text-xs font-bold px-2 py-0.5 rounded-full {isIpBlockActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}">
							44.9k
						</span>
					{/if}
				</a>

				<!-- 7. Customer (VIP Database) -->
				<a
					href="/admin/customers"
					onclick={() => isMobileSidebarOpen = false}
					class="w-full flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isCustomerActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
					title="Customer (গ্রাহক ডেটাবেজ)"
				>
					<div class="flex items-center gap-3.5">
						<svg class="w-5 h-5 shrink-0 {isCustomerActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-5.5 8c0-2.5 3-4 5.5-4s5.5 1.5 5.5 4v1h-11v-1Z" />
							<path d="M5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-3 10c0-1.8 1.8-3 3.8-3.4-.5.8-.8 1.8-.8 2.9v1.5H2V18Z" opacity="0.8" />
							<path d="M19 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-1 9.5c0-1.1-.3-2.1-.8-2.9 2 .4 3.8 1.6 3.8 3.4v1H18v-1.5Z" opacity="0.8" />
						</svg>
						{#if !isSidebarCollapsed}
							<span>Customer</span>
						{/if}
					</div>
					{#if !isSidebarCollapsed}
						<span class="text-xs font-bold px-2 py-0.5 rounded-full {isCustomerActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}">
							{(data.newsletter || []).length}
						</span>
					{/if}
				</a>

				<!-- 7. Database (Cloudflare D1 Console) -->
				<a
					href="/admin/database"
					onclick={() => isMobileSidebarOpen = false}
					class="w-full flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isDatabaseActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
					title="Database (Cloudflare D1 কনসোল)"
				>
					<div class="flex items-center gap-3.5">
						<svg class="w-5 h-5 shrink-0 {isDatabaseActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="currentColor">
							<rect x="4" y="3" width="16" height="18" rx="3.5" />
							<rect x="8" y="7" width="8" height="2" rx="1" fill="white" />
							<rect x="8" y="11" width="8" height="2" rx="1" fill="white" />
							<rect x="8" y="15" width="5" height="2" rx="1" fill="white" />
						</svg>
						{#if !isSidebarCollapsed}
							<span>Database</span>
						{/if}
					</div>
					{#if !isSidebarCollapsed}
						<span class="w-2.5 h-2.5 rounded-full {data.isD1Connected ? 'bg-emerald-400' : 'bg-amber-400'} ring-4 ring-white/20"></span>
					{/if}
				</a>

				<!-- 8. Landing page (Live Store link) -->
				<a
					href="/"
					target="_blank"
					class="w-full flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] text-slate-800 hover:text-black hover:bg-slate-100/70 group"
					title="Landing page (লাইভ স্টোর দেখুন)"
				>
					<div class="flex items-center gap-3.5">
						<svg class="w-5 h-5 text-slate-800 group-hover:text-black shrink-0" viewBox="0 0 24 24" fill="currentColor">
							<rect x="4" y="4" width="16" height="12" rx="2" />
							<path d="M2 19h20c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1z" />
							<rect x="10" y="13" width="4" height="1.5" rx="0.5" fill="white" />
						</svg>
						{#if !isSidebarCollapsed}
							<span>Landing page</span>
						{/if}
					</div>
					{#if !isSidebarCollapsed}
						<ExternalLink class="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
					{/if}
				</a>

				<!-- 9. Support -->
				<a
					href="/admin/support"
					onclick={() => isMobileSidebarOpen = false}
					class="w-full flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isSupportActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
					title="Support (সাপোর্ট সেন্টার)"
				>
					<div class="flex items-center gap-3.5">
						<Headphones class="w-5 h-5 shrink-0 {isSupportActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" />
						{#if !isSidebarCollapsed}
							<span>Support</span>
						{/if}
					</div>
					{#if !isSidebarCollapsed}
						<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="অনলাইন"></span>
					{/if}
				</a>

				<!-- 10. Profile -->
				<a
					href="/admin/profile"
					onclick={() => isMobileSidebarOpen = false}
					class="w-full flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isProfileActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
					title="Profile"
				>
					<div class="flex items-center gap-3.5">
						<User class="w-5 h-5 shrink-0 {isProfileActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" />
						{#if !isSidebarCollapsed}
							<span>Profile</span>
						{/if}
					</div>
				</a>

				<!-- 10. Logout -->
				<button
					type="button"
					onclick={() => alert('লগআউট করা হচ্ছে...')}
					class="w-full flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] text-slate-800 hover:text-rose-600 hover:bg-rose-50/60 group cursor-pointer text-left"
					title="Logout"
				>
					<div class="flex items-center gap-3.5">
						<LogOut class="w-5 h-5 shrink-0 text-slate-800 group-hover:text-rose-600" />
						{#if !isSidebarCollapsed}
							<span>Logout</span>
						{/if}
					</div>
				</button>

			</nav>
		</div>

		<!-- Admin Panel Info Card (Matching Screenshot) -->
		<div class="p-3 border-t border-slate-100 bg-white">
			{#if !isSidebarCollapsed}
				<div class="p-3 bg-blue-50/40 rounded-2xl border border-blue-100/80 text-xs text-slate-600 space-y-1">
					<div class="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
						<Info class="w-3.5 h-3.5 text-blue-600" />
						<span>ADMIN PANEL</span>
					</div>
					<div class="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
						<span>Current version</span>
						<span class="font-mono font-bold text-slate-700">v1.0.47</span>
					</div>
					<div class="flex items-center justify-between text-[11px] text-slate-500">
						<span>Last update</span>
						<span class="font-semibold text-slate-700">20 Aug 2026</span>
					</div>
					<div class="pt-1 flex justify-center">
						<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
							<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
							<span>Panel up to date</span>
						</span>
					</div>
				</div>
			{:else}
				<div class="flex justify-center">
					<button
						onclick={() => isSidebarCollapsed = false}
						class="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
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

		<!-- TOP COMMAND BAR (Exact Match with User's Mobile & Desktop Reference) -->
		<header class="h-16 md:h-20 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
			<div class="flex items-center gap-3 md:gap-4 min-w-0">
				
				<!-- Mobile Store Brand Logo (Exact match with user reference screenshot) -->
				<a href="/admin" class="flex md:hidden items-center gap-1.5 shrink-0 group" title="হোমপেজ">
					<div class="flex flex-col items-center justify-center">
						<svg class="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
							<polyline points="9 21 9 12 15 12 15 21" />
						</svg>
						<span class="text-[6.5px] font-black text-pink-500 uppercase tracking-tighter leading-none -mt-0.5">
							COLOR LIGHT
						</span>
					</div>
				</a>

				<!-- Desktop Page Title & Action Buttons -->
				<div class="hidden md:flex items-center gap-3 md:gap-4 shrink-0">
					<h1 class="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
						{#if isDashboard}
							<span>Dashboard</span>
						{:else if isOrdersActive}
							<span>Orders</span>
						{:else if isSettingsActive}
							<span>Settings</span>
						{:else if isIpBlockActive}
							<span>IP Block</span>
						{:else if isCustomerActive}
							<span>Customers</span>
						{:else if isDatabaseActive}
							<span>Database</span>
						{:else if isProfileActive}
							<span>Profile</span>
						{:else if isSupportActive}
							<span>Support</span>
						{:else if isNotificationsActive}
							<span>Notifications</span>
						{:else}
							<span>AURA Control</span>
						{/if}
					</h1>

					<!-- Tutorial & Support Action Buttons (Desktop) -->
					<div class="hidden sm:flex items-center gap-2.5">
						<!-- Tutorial Button -->
						<button
							type="button"
							onclick={() => (isTutorialModalOpen = true)}
							class="rounded-xl border border-red-300 bg-white hover:bg-red-50/50 px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-bold text-red-600 shadow-[0_0_10px_rgba(239,68,68,0.12)] transition-all cursor-pointer hover:border-red-400"
							title="ভিডিও টিউটোরিয়াল দেখুন"
						>
							<Play class="w-3.5 h-3.5 fill-red-600 text-red-600" />
							<span>Tutorial</span>
						</button>

						<!-- Support Button -->
						<a
							href="/admin/support"
							class="rounded-xl bg-[#5845eb] hover:bg-[#4936d6] px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-bold text-white shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
							title="সাপোর্ট হেল্পলাইন ও সেন্টার"
						>
							<Headphones class="w-3.5 h-3.5 text-white" />
							<span>Support</span>
						</a>
					</div>
				</div>
			</div>

			<!-- Right Navbar Actions (Exact Match with Reference Screenshot) -->
			<div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

				<!-- 1. Mobile Support Button (Purple rounded tile matching screenshot) -->
				<a
					href="/admin/support"
					class="md:hidden w-9 h-9 rounded-2xl bg-[#5845eb] hover:bg-[#4936d6] text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0 transition-transform active:scale-95"
					title="সাপোর্ট হেল্পলাইন ও সেন্টার"
				>
					<Headphones class="w-4 h-4 text-white" />
				</a>

				<!-- 2. Globe Button (Live Store) -->
				<a
					href="/"
					target="_blank"
					class="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200/90 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs shrink-0"
					title="লাইভ ওয়েবসাইট দেখুন"
				>
					<Globe class="w-4 h-4" />
				</a>

				<!-- 3. Language Switcher (文A) -->
				<button
					type="button"
					onclick={() => alert('ভাষা: বাংলা এবং English উভয়ই সক্রিয়')}
					class="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200/90 bg-white flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer shrink-0"
					title="ভাষা পরিবর্তন (Bangla / English)"
				>
					<Languages class="w-4 h-4" />
				</button>

				<!-- 4. Search Icon Button -->
				<button
					type="button"
					onclick={() => (isMobileSearchOpen = !isMobileSearchOpen)}
					class="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200/90 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer shrink-0"
					title="সার্চ করুন"
				>
					<Search class="w-4 h-4" />
				</button>

				<!-- 5. Notification Bell (Desktop only) -->
				<div class="hidden md:block relative">
					<a
						href="/admin/notifications"
						class="w-9 h-9 rounded-full border border-slate-200/90 bg-white flex items-center justify-center {isNotificationsActive ? 'text-[#5845eb] border-[#5845eb]' : 'text-slate-600 hover:text-slate-900'} hover:bg-slate-50 transition-colors shadow-2xs relative"
						title="নোটিফিকেশন সেন্টার"
					>
						<Bell class="w-4 h-4" />
						<span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
					</a>
				</div>

				<!-- 6. Store / Profile Circle (COLOR LIGHT) -->
				<a
					href="/admin/profile"
					class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950 border border-slate-200 flex items-center justify-center text-white overflow-hidden shadow-2xs hover:ring-2 hover:ring-[#5845eb]/30 transition-all cursor-pointer shrink-0"
					title="প্রোফাইল সেটিংস"
				>
					<div class="text-[7px] sm:text-[7.5px] font-black uppercase tracking-tighter text-center leading-[1.05] bg-gradient-to-tr from-pink-400 to-indigo-400 bg-clip-text text-transparent">
						COLOR<br/>LIGHT
					</div>
				</a>

				<!-- 7. Golden "Premium Package" Pill (Desktop Only) -->
				<button
					type="button"
					onclick={() => (isPackageModalOpen = true)}
					class="hidden md:flex rounded-2xl bg-gradient-to-r from-[#eab308] via-[#facc15] to-[#f59e0b] p-1 pr-3 items-center gap-2 shadow-sm border border-amber-300 hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0"
					title="প্রিমিয়াম প্যাকেজ মেয়াদ"
				>
					<!-- Inner Golden Tile with Crown -->
					<div class="w-7 h-7 rounded-xl bg-amber-400/90 border border-amber-200/80 flex items-center justify-center shadow-inner">
						<Crown class="w-4 h-4 fill-amber-950 text-amber-950" />
					</div>
					<!-- Two-line text -->
					<div class="flex flex-col text-left">
						<span class="text-[10px] text-amber-950 font-bold leading-none tracking-tight">Premium Package</span>
						<span class="text-[11px] font-black text-rose-600 leading-tight">5 days left</span>
					</div>
				</button>

			</div>
		</header>

		<!-- Mobile Slide-down Search Bar -->
		{#if isMobileSearchOpen}
			<div class="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 shadow-xs">
				<div class="relative flex-1">
					<Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						placeholder="অর্ডার, কাস্টমার বা সেটিংস খুঁজুন..."
						bind:value={orderSearchQuery}
						class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb]"
					/>
				</div>
				<button
					type="button"
					onclick={() => (isMobileSearchOpen = false)}
					class="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
					aria-label="Close search"
				>
					<X class="w-4 h-4" />
				</button>
			</div>
		{/if}

		<!-- Courier Sync Alert Banner -->
		{#if courierSyncMessage}
			<div class="bg-indigo-50 border-b border-indigo-200 px-4 md:px-8 py-2.5 flex items-center justify-between text-xs text-indigo-900 font-semibold animate-in fade-in duration-200">
				<div class="flex items-center gap-2">
					<RefreshCw class="w-4 h-4 animate-spin text-indigo-600" />
					<span>{courierSyncMessage}</span>
				</div>
				<button onclick={() => (courierSyncMessage = null)} class="text-indigo-500 hover:text-indigo-800">
					<X class="w-4 h-4" />
				</button>
			</div>
		{/if}

		<!-- Page View Slot (with bottom padding for mobile floating bar) -->
		<main class="flex-1 p-4 md:p-8 pb-24 md:pb-8">
			{@render children()}
		</main>

	</div>

	<!-- ============================================== -->
	<!-- 3. MOBILE BOTTOM NAVIGATION BAR (Exact Match)  -->
	<!-- ============================================== -->
	<div class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5">
		<div class="grid grid-cols-4 items-center">
			
			<!-- 1. Dashboard -->
			<a
				href="/admin"
				class="flex flex-col items-center justify-center gap-1 py-1 transition-colors {isDashboard ? 'text-[#5845eb]' : 'text-slate-600 hover:text-slate-900'}"
			>
				<LayoutGrid class="w-5 h-5 {isDashboard ? 'stroke-[2.5]' : 'stroke-2'}" />
				<span class="text-[11px] {isDashboard ? 'font-bold' : 'font-medium'} leading-none">Dashboard</span>
			</a>

			<!-- 2. Order List -->
			<a
				href="/admin/orders/list"
				class="flex flex-col items-center justify-center gap-1 py-1 transition-colors {currentPath === '/admin/orders/list' ? 'text-[#5845eb]' : 'text-slate-600 hover:text-slate-900'}"
			>
				<ReceiptText class="w-5 h-5 {currentPath === '/admin/orders/list' ? 'stroke-[2.5]' : 'stroke-2'}" />
				<span class="text-[11px] {currentPath === '/admin/orders/list' ? 'font-bold' : 'font-medium'} leading-none">Order List</span>
			</a>

			<!-- 3. Notification -->
			<a
				href="/admin/notifications"
				class="flex flex-col items-center justify-center gap-1 py-1 transition-colors {isNotificationsActive ? 'text-[#5845eb]' : 'text-slate-600 hover:text-slate-900'} relative"
			>
				<div class="relative">
					<Bell class="w-5 h-5 {isNotificationsActive ? 'stroke-[2.5]' : 'stroke-2'}" />
					<span class="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
						4
					</span>
				</div>
				<span class="text-[11px] {isNotificationsActive ? 'font-bold' : 'font-medium'} leading-none">Notification</span>
			</a>

			<!-- 4. Menu -->
			<button
				type="button"
				onclick={() => (isMobileSidebarOpen = !isMobileSidebarOpen)}
				class="flex flex-col items-center justify-center gap-1 py-1 transition-colors text-slate-600 hover:text-slate-900 cursor-pointer"
			>
				<Menu class="w-5 h-5 stroke-2" />
				<span class="text-[11px] font-medium leading-none">Menu</span>
			</button>

		</div>
	</div>

	<!-- ============================================== -->
	<!-- 3. TOP NAVBAR INTERACTIVE MODALS               -->
	<!-- ============================================== -->
	
	<!-- 1. Tutorial Modal -->
	<Dialog bind:open={isTutorialModalOpen} title="AURA E-Commerce ভিডিও টিউটোরিয়াল">
		<div class="space-y-4 py-2">
			<div class="p-4 rounded-2xl bg-red-50 border border-red-200/80 flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
					<Play class="w-5 h-5 fill-current" />
				</div>
				<div>
					<h4 class="font-bold text-slate-900 text-sm">সহজ গাইডলাইন ও ভিডিও নির্দেশনা</h4>
					<p class="text-xs text-slate-500">আপনার অনলাইন শপের যাবতীয় ফিচার ব্যবহারের সম্পূর্ণ গাইড</p>
				</div>
			</div>

			<div class="space-y-2.5 text-xs text-slate-700">
				<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
					<div class="flex items-center gap-2.5">
						<span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">১</span>
						<span class="font-semibold text-slate-800">অর্ডার কনফার্ম ও কুরিয়ার বুকিং প্রক্রিয়া</span>
					</div>
					<span class="text-[11px] font-bold text-indigo-600">৩ মিনিট</span>
				</div>
				<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
					<div class="flex items-center gap-2.5">
						<span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">২</span>
						<span class="font-semibold text-slate-800">Facebook Pixel ও CAPI টোকেন সেটআপ</span>
					</div>
					<span class="text-[11px] font-bold text-indigo-600">৫ মিনিট</span>
				</div>
				<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
					<div class="flex items-center gap-2.5">
						<span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">৩</span>
						<span class="font-semibold text-slate-800">ল্যান্ডিং পেজ টেক্সট, প্রোডাক্ট ও ছবি কাস্টমাইজেশন</span>
					</div>
					<span class="text-[11px] font-bold text-indigo-600">৪ মিনিট</span>
				</div>
			</div>

			<div class="flex justify-end pt-2">
				<Button type="button" variant="outline" onclick={() => (isTutorialModalOpen = false)}>
					বন্ধ করুন
				</Button>
			</div>
		</div>
	</Dialog>

	<!-- 2. Premium Package Modal -->
	<Dialog bind:open={isPackageModalOpen} title="AURA প্রিমিয়াম প্যাকেজ বিবরণ">
		<div class="space-y-4 py-2">
			<div class="p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-amber-950 shadow-md flex items-center justify-between">
				<div class="flex items-center gap-3.5">
					<div class="w-12 h-12 rounded-xl bg-amber-600/30 border border-amber-300 flex items-center justify-center shadow-inner">
						<Crown class="w-6 h-6 fill-current text-amber-950" />
					</div>
					<div>
						<h3 class="font-black text-lg leading-tight">Enterprise Pro Package</h3>
						<p class="text-xs font-semibold text-amber-900">আনলিমিটেড অর্ডার, লাইভ এপিআই ও ক্লাউডফ্লেয়ার এজ হোস্টিং</p>
					</div>
				</div>
				<div class="text-right">
					<div class="text-[10px] font-bold uppercase tracking-wider text-amber-900">মেয়াদ বাকি</div>
					<div class="text-xl font-black text-rose-700">৫ দিন</div>
				</div>
			</div>

			<div class="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
				<div class="flex items-center gap-2">
					<CheckCircle2 class="w-4 h-4 text-emerald-600" />
					<span>Steadfast ও Pathao কুরিয়ার অটো বুকিং এপিআই সক্রিয়</span>
				</div>
				<div class="flex items-center gap-2">
					<CheckCircle2 class="w-4 h-4 text-emerald-600" />
					<span>Meta Facebook Pixel ও Conversions API (CAPI) ট্র্যাকিং</span>
				</div>
				<div class="flex items-center gap-2">
					<CheckCircle2 class="w-4 h-4 text-emerald-600" />
					<span>২৪/৭ প্রায়োরিটি ডেডিকেটেড ম্যানেজার সাপোর্ট</span>
				</div>
			</div>

			<div class="flex items-center justify-end gap-2 pt-2">
				<Button type="button" variant="outline" onclick={() => (isPackageModalOpen = false)}>
					পরে রিনিউ করব
				</Button>
				<Button
					type="button"
					onclick={() => {
						alert('রিনিউয়াল রিকোয়েস্ট পাঠানো হয়েছে। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।');
						isPackageModalOpen = false;
					}}
					class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold"
				>
					এখনই রিনিউ করুন (৳১,৪৯০ / মাস)
				</Button>
			</div>
		</div>
	</Dialog>

</div>

<style>
	:global(.admin-theme) {
		color-scheme: light !important;
	}
	.no-scrollbar {
		-ms-overflow-style: none !important;
		scrollbar-width: none !important;
	}
	.no-scrollbar::-webkit-scrollbar {
		display: none !important;
		width: 0 !important;
		height: 0 !important;
		background: transparent !important;
	}
</style>

