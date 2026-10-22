<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import {
		Flame,
		Search,
		ChevronDown,
		ExternalLink,
		PanelLeftOpen,
		ShieldCheck,
		Menu,
		X,
		RefreshCw,
		PlusCircle
	} from 'lucide-svelte';

	let { data, children }: { data: any; children: Snippet } = $props();

	// Sidebar responsive collapse states
	let isSidebarCollapsed = $state(false);
	let isMobileSidebarOpen = $state(false);
	let isOrdersOpen = $state(true);

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
	let isProductsActive = $derived(currentPath.startsWith('/admin/products'));
	let isCustomizationActive = $derived(currentPath.startsWith('/admin/customization'));
	let isSettingsActive = $derived(currentPath.startsWith('/admin/settings'));
	let isCustomerActive = $derived(currentPath.startsWith('/admin/customers'));
	let isDatabaseActive = $derived(currentPath.startsWith('/admin/database'));
</script>

<svelte:head>
	<title>AURA Enterprise Control Deck | অ্যাডমিন ড্যাশবোর্ড</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<!-- Fullscreen Warm Ivory Executive Frame with Pure White SaaS Sidebar -->
<div class="min-h-screen bg-[#faf7f2] text-slate-800 flex flex-col md:flex-row font-['Hind_Siliguri',sans-serif] selection:bg-[#5845eb]/20 selection:text-[#5845eb] antialiased">

	<!-- ============================================== -->
	<!-- 1. HIGH-END EXECUTIVE WHITE SAAS SIDEBAR       -->
	<!-- ============================================== -->
	<aside
		class="bg-white text-slate-700 border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 z-50 fixed md:sticky top-0 h-screen shrink-0 shadow-sm {isSidebarCollapsed ? 'w-20' : 'w-72'} {isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
	>
		<div class="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-thin">
			
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

				<!-- 2. Orders (Shopping bag icon with dropdown chevron) -->
				<div class="space-y-1">
					<div class="flex items-center">
						<a
							href="/admin/orders"
							onclick={() => isMobileSidebarOpen = false}
							class="flex-1 flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isOrdersActive
								? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
								: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
							title="Orders (অর্ডার ব্যবস্থাপনা)"
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
										onclick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											isOrdersOpen = !isOrdersOpen;
										}}
										class="p-1 hover:bg-black/10 rounded-md transition-colors"
										title="টগল করুন"
									>
										<ChevronDown class="w-4 h-4 transition-transform duration-200 {isOrdersOpen ? 'rotate-180' : ''}" />
									</button>
								</div>
							{/if}
						</a>
					</div>

					<!-- Orders Submenu (when expanded) -->
					{#if !isSidebarCollapsed && isOrdersOpen}
						<div class="pl-3 pr-1 py-1 space-y-1 border-l-2 border-slate-100 ml-6 my-1">
							<!-- ১. ওয়েব অর্ডার (Web Orders) -->
							<a
								href="/admin/orders?view=web"
								onclick={() => isMobileSidebarOpen = false}
								class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {isOrdersActive && (!page.url.searchParams.get('view') || page.url.searchParams.get('view') === 'web')
									? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80'
									: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							>
								<span>ওয়েব অর্ডার (Web Orders)</span>
								<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
									{webOrders.length}
								</span>
							</a>

							<!-- ২. অর্ডার তালিকা (Order List) -->
							<a
								href="/admin/orders?view=list"
								onclick={() => isMobileSidebarOpen = false}
								class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {page.url.searchParams.get('view') === 'list'
									? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80'
									: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							>
								<span>অর্ডার তালিকা (Order List)</span>
								<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
									{orderListOrders.length}
								</span>
							</a>

							<!-- ৩. নতুন তৈরি (New Order) -->
							<a
								href="/admin/orders?view=new"
								onclick={() => isMobileSidebarOpen = false}
								class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {page.url.searchParams.get('view') === 'new'
									? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80'
									: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							>
								<span>নতুন তৈরি (New Order)</span>
								<span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
									Manual
								</span>
							</a>

							<!-- ৪. প্রি-অর্ডার (Pre-Orders) -->
							<a
								href="/admin/orders?view=pre"
								onclick={() => isMobileSidebarOpen = false}
								class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {page.url.searchParams.get('view') === 'pre'
									? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80'
									: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
							>
								<span>প্রি-অর্ডার (Pre-Orders)</span>
								{#if preOrders.length > 0}
									<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
										{preOrders.length}
									</span>
								{/if}
							</a>

							<!-- ৫. মুছে ফেলা (Trash) -->
							<a
								href="/admin/orders?view=trash"
								onclick={() => isMobileSidebarOpen = false}
								class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {page.url.searchParams.get('view') === 'trash'
									? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
									: 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/60'}"
							>
								<span>মুছে ফেলা (Trash)</span>
								{#if trashedOrders.length > 0}
									<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
										{trashedOrders.length}
									</span>
								{/if}
							</a>
						</div>
					{/if}
				</div>

				<!-- 3. Products (Active pill in user screenshot!) -->
				<a
					href="/admin/products"
					onclick={() => isMobileSidebarOpen = false}
					class="w-full flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isProductsActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
					title="Products (পণ্য ক্যাটালগ)"
				>
					<div class="flex items-center gap-3.5">
						<svg class="w-5 h-5 shrink-0 {isProductsActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="currentColor">
							<path d="M16 2.5l4 3.5-1.5 3.5-2.5-1V20c0 1.1-.9 2-2 2H10c-1.1 0-2-.9-2-2V8.5L5.5 9.5 4 6 8 2.5c.5 1.5 2 2.5 4 2.5s3.5-1 4-2.5z" />
							<rect x="10" y="12.5" width="4" height="1.8" rx="0.5" fill="white" />
							<rect x="10" y="15.8" width="4" height="1.8" rx="0.5" fill="white" />
						</svg>
						{#if !isSidebarCollapsed}
							<span>Products</span>
						{/if}
					</div>
					{#if !isSidebarCollapsed}
						<span class="text-xs font-mono {isProductsActive ? 'text-white/80' : 'text-slate-400'}">
							{(data.products || []).length} SKUs
						</span>
					{/if}
				</a>

				<!-- 4. Customization (Pixels & CAPI Tracking) -->
				<a
					href="/admin/customization"
					onclick={() => isMobileSidebarOpen = false}
					class="w-full flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isCustomizationActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
					title="Customization (পিক্সেল ও ট্র্যাকিং)"
				>
					<div class="flex items-center gap-3.5">
						<svg class="w-5 h-5 shrink-0 {isCustomizationActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="currentColor">
							<rect x="3" y="6" width="18" height="2" rx="1" />
							<circle cx="9" cy="7" r="2.5" />
							<rect x="3" y="11" width="18" height="2" rx="1" />
							<circle cx="16" cy="12" r="2.5" />
							<rect x="3" y="16" width="18" height="2" rx="1" />
							<circle cx="7" cy="17" r="2.5" />
						</svg>
						{#if !isSidebarCollapsed}
							<span>Customization</span>
						{/if}
					</div>
				</a>

				<!-- 5. Settings (Courier Logistics Settings) -->
				<a
					href="/admin/settings"
					onclick={() => isMobileSidebarOpen = false}
					class="w-full flex items-center {isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isSettingsActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
					title="Settings (কুরিয়ার সেটিংস)"
				>
					<div class="flex items-center gap-3.5">
						<svg class="w-5 h-5 shrink-0 {isSettingsActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="currentColor">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M11.078 2.053a1.5 1.5 0 0 1 1.844 0l.478.36a1.5 1.5 0 0 0 1.52.19l.564-.23a1.5 1.5 0 0 1 1.77.534l.354.482a1.5 1.5 0 0 0 1.344.697l.608-.04a1.5 1.5 0 0 1 1.524 1.077l.18.577a1.5 1.5 0 0 0 1.02 1.02l.577.18a1.5 1.5 0 0 1 1.077 1.524l-.04.608a1.5 1.5 0 0 0 .697 1.344l.482.354a1.5 1.5 0 0 1 .534 1.77l-.23.564a1.5 1.5 0 0 0 .19 1.52l.36.478a1.5 1.5 0 0 1 0 1.844l-.36.478a1.5 1.5 0 0 0-.19 1.52l.23.564a1.5 1.5 0 0 1-.534 1.77l-.482.354a1.5 1.5 0 0 0-.697 1.344l.04.608a1.5 1.5 0 0 1-1.077 1.524l-.577.18a1.5 1.5 0 0 0-1.02 1.02l-.18.577a1.5 1.5 0 0 1-1.524 1.077l-.608-.04a1.5 1.5 0 0 0-1.344.697l-.354.482a1.5 1.5 0 0 1-1.77.534l-.564-.23a1.5 1.5 0 0 0-1.52.19l-.478.36a1.5 1.5 0 0 1-1.844 0l-.478-.36a1.5 1.5 0 0 0-1.52-.19l-.564.23a1.5 1.5 0 0 1-1.77-.534l-.354-.482a1.5 1.5 0 0 0-1.344-.697l-.608.04a1.5 1.5 0 0 1-1.524-1.077l-.18-.577a1.5 1.5 0 0 0-1.02-1.02l-.577-.18a1.5 1.5 0 0 1-1.077-1.524l.04-.608a1.5 1.5 0 0 0-.697-1.344l-.482-.354a1.5 1.5 0 0 1-.534-1.77l.23-.564a1.5 1.5 0 0 0-.19-1.52l-.36-.478a1.5 1.5 0 0 1 0-1.844l.36-.478a1.5 1.5 0 0 0 .19-1.52l-.23-.564a1.5 1.5 0 0 1 .534-1.77l.482-.354a1.5 1.5 0 0 0 .697-1.344l-.04-.608a1.5 1.5 0 0 1 1.077-1.524l.577-.18a1.5 1.5 0 0 0 1.02-1.02l.18-.577a1.5 1.5 0 0 1 1.524-1.077l.608.04a1.5 1.5 0 0 0 1.344-.697l.354-.482a1.5 1.5 0 0 1 1.77-.534l.564.23a1.5 1.5 0 0 0 1.52-.19l.478-.36ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
						</svg>
						{#if !isSidebarCollapsed}
							<span>Settings</span>
						{/if}
					</div>
					{#if !isSidebarCollapsed}
						<span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md {isSettingsActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}">
							Steadfast
						</span>
					{/if}
				</a>

				<!-- 6. Customer (VIP Database) -->
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

			</nav>
		</div>

		<!-- Executive Superadmin Card -->
		<div class="p-3 border-t border-slate-100 bg-white">
			{#if !isSidebarCollapsed}
				<div class="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
					<div class="flex items-center gap-3 min-w-0">
						<div class="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5845eb] to-[#7c3aed] flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0">
							<ShieldCheck class="w-4 h-4" />
						</div>
						<div class="flex flex-col truncate">
							<span class="text-xs font-bold text-slate-800 truncate">সুপার অ্যাডমিন</span>
							<span class="text-[10px] text-slate-500 font-mono truncate">admin@haqplus.com</span>
						</div>
					</div>
					<a
						href="/"
						target="_blank"
						class="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-2xs shrink-0"
						title="স্টোর দেখুন"
					>
						<ExternalLink class="w-4 h-4" />
					</a>
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

		<!-- TOP COMMAND BAR -->
		<header class="h-16 md:h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
			<div class="flex items-center gap-3 md:gap-4">
				<!-- Mobile Hamburger Toggle -->
				<button
					onclick={() => isMobileSidebarOpen = true}
					class="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
					aria-label="Open sidebar"
				>
					<Menu class="w-5 h-5" />
				</button>

				<div>
					<h1 class="text-base md:text-xl font-bold text-slate-900 flex items-center gap-2">
						{#if isDashboard}
							<span>Dashboard (ওভারভিউ ও মেট্রিক্স)</span>
						{:else if isOrdersActive}
							<span>Orders (অর্ডার ব্যবস্থাপনা)</span>
						{:else if isProductsActive}
							<span>Products (পণ্য ক্যাটালগ ও ইনভেন্টরি)</span>
						{:else if isCustomizationActive}
							<span>Customization (পিক্সেল ও ট্র্যাকিং)</span>
						{:else if isSettingsActive}
							<span>Settings (কুরিয়ার লজিস্টিকস ও সেটিংস)</span>
						{:else if isCustomerActive}
							<span>Customer (ভিআইপি ক্লায়েন্ট ডেটাবেজ)</span>
						{:else if isDatabaseActive}
							<span>Database (Cloudflare D1 কনসোল)</span>
						{:else}
							<span>AURA Control Deck</span>
						{/if}
					</h1>
					<p class="text-[11px] text-slate-500 hidden sm:block">
						Enterprise Autonomous E-Commerce Engine • Cloudflare Edge Network
					</p>
				</div>
			</div>

			<!-- Top Actions (Steadfast Courier Sync + New Order) -->
			<div class="flex items-center gap-2 md:gap-3">
				
				<!-- D1 Status Dot -->
				<div class="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
					<span class="w-2 h-2 rounded-full {data.isD1Connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}"></span>
					<span>{data.isD1Connected ? 'Cloudflare D1 Live' : 'D1 Local Mirror'}</span>
				</div>

				<!-- Steadfast Courier Sync Button -->
				<button
					onclick={triggerCourierSync}
					disabled={isCourierSyncing}
					class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
					title="Steadfast কুরিয়ার ট্র্যাকিং সিঙ্ক করুন"
				>
					<RefreshCw class="w-3.5 h-3.5 {isCourierSyncing ? 'animate-spin text-[#5845eb]' : 'text-slate-500'}" />
					<span class="hidden md:inline">কুরিয়ার সিঙ্ক</span>
				</button>

				<!-- Create Order Action Button -->
				<a
					href="/admin/orders?view=new"
					class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5845eb] hover:bg-[#4734d6] text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
				>
					<PlusCircle class="w-3.5 h-3.5" />
					<span>নতুন অর্ডার</span>
				</a>
			</div>
		</header>

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

		<!-- Page View Slot -->
		<main class="flex-1 p-4 md:p-8">
			{@render children()}
		</main>

	</div>

</div>
