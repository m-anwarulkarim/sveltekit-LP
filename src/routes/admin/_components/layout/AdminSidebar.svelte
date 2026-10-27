<script lang="ts">
	import { page } from '$app/state';
	import {
		Flame,
		Search,
		ChevronDown,
		X,
		Headphones,
		User,
		LogOut,
		Info,
		PanelLeftOpen,
		BadgeCheck,
		Target,
		Package,
		SlidersHorizontal,
		Activity
	} from 'lucide-svelte';

	interface Props {
		collapsed?: boolean;
		mobileOpen?: boolean;
		data: any;
	}

	let {
		collapsed = $bindable(false),
		mobileOpen = $bindable(false),
		data
	}: Props = $props();

	type SubmenuType = 'dashboard' | 'orders' | 'customization' | 'catalog' | 'reports';
	let openSubmenu = $state<SubmenuType | null>(null);
	let orderSearchQuery = $state('');

	// Synchronize open submenu with current active route
	$effect(() => {
		const path = page.url.pathname;
		if (path === '/admin' || path.startsWith('/admin/my-activity') || path.startsWith('/admin/bot-activity')) {
			openSubmenu = 'dashboard';
		} else if (path.startsWith('/admin/orders')) {
			openSubmenu = 'orders';
		} else if (path.startsWith('/admin/customization')) {
			openSubmenu = 'customization';
		} else if (path.startsWith('/admin/catalog')) {
			openSubmenu = 'catalog';
		} else if (path.startsWith('/admin/reports')) {
			openSubmenu = 'reports';
		} else {
			openSubmenu = null; // Auto-close all submenus when visiting single-page routes
		}
	});

	function toggleSubmenu(menu: SubmenuType) {
		if (collapsed) collapsed = false;
		openSubmenu = openSubmenu === menu ? null : menu;
	}

	function closeAllSubmenus() {
		openSubmenu = null;
	}

	let isDashboardOpen = $derived(openSubmenu === 'dashboard');
	let isOrdersOpen = $derived(openSubmenu === 'orders');
	let isCustomizationOpen = $derived(openSubmenu === 'customization');
	let isCatalogOpen = $derived(openSubmenu === 'catalog');
	let isReportsOpen = $derived(openSubmenu === 'reports');

	// Derived counts from layout data
	let webOrders = $derived(
		(data?.orders || []).filter((o: any) =>
			['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold', 'recall'].includes(o.status)
		)
	);

	let orderListOrders = $derived(
		(data?.orders || []).filter((o: any) =>
			['processing', 'confirmed', 'printed', 'entry_done', 'shipped', 'delivered', 'partial_delivered', 'pending_return', 'returned', 'missing'].includes(o.status)
		)
	);

	let trashedOrders = $derived((data?.orders || []).filter((o: any) => o.status === 'cancelled'));
	let preOrders = $derived((data?.orders || []).filter((o: any) => (o.total || 0) > 3000));

	// Active route helpers
	let currentPath = $derived(page.url.pathname);
	let isDashboard = $derived(currentPath === '/admin');
	let isMyActivityActive = $derived(currentPath.startsWith('/admin/my-activity'));
	let isBotActivityActive = $derived(currentPath.startsWith('/admin/bot-activity'));
	let isDashboardGroupActive = $derived(isDashboard || isMyActivityActive || isBotActivityActive);
	let isOrdersActive = $derived(currentPath.startsWith('/admin/orders'));
	let isProductsActive = $derived(currentPath.startsWith('/admin/products'));
	let isCustomizationActive = $derived(currentPath.startsWith('/admin/customization'));
	let isSettingsActive = $derived(currentPath.startsWith('/admin/settings'));
	let isCatalogActive = $derived(currentPath.startsWith('/admin/catalog'));
	let isCustomerActive = $derived(currentPath.startsWith('/admin/customers'));
	let isDatabaseActive = $derived(currentPath.startsWith('/admin/database'));
	let isIpBlockActive = $derived(currentPath.startsWith('/admin/ip-block'));
	let isProfileActive = $derived(currentPath.startsWith('/admin/profile'));
	let isSupportActive = $derived(currentPath.startsWith('/admin/support'));
	let isLandingPagesActive = $derived(currentPath.startsWith('/admin/landing-pages'));
	let isTutorialsActive = $derived(currentPath.startsWith('/admin/tutorials'));
	let isNewReleaseActive = $derived(currentPath.startsWith('/admin/new-release'));
	let isAdminControlActive = $derived(currentPath.startsWith('/admin/admin-control'));
	let isReportsActive = $derived(currentPath.startsWith('/admin/reports'));
	let isDailySummaryActive = $derived(currentPath === '/admin/reports/daily-business-summary' || currentPath === '/admin/reports');
	let isAssetValuationActive = $derived(currentPath === '/admin/reports/asset-valuation');
	let isDailyTargetActive = $derived(currentPath.startsWith('/admin/daily-target'));
</script>

<aside
	class="admin-sidebar bg-white text-slate-700 border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 z-50 fixed md:sticky top-0 h-screen shrink-0 shadow-sm {collapsed ? 'w-20' : 'w-72'} {mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
>
	<!-- Fixed Top Header Section of Sidebar (Always Sticky, Never Scrolls) -->
	<div class="shrink-0 bg-white z-20">
		<!-- Header (AURA Store Brand + <> Toggle Button) -->
		<div class="h-16 md:h-20 flex items-center {collapsed ? 'justify-center flex-col gap-2.5 py-3' : 'justify-between px-5'} border-b border-slate-100">
			{#if !collapsed}
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
						type="button"
						onclick={() => (collapsed = true)}
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
						type="button"
						onclick={() => (mobileOpen = false)}
						class="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
						aria-label="Close sidebar"
					>
						<X class="w-5 h-5" />
					</button>
				</div>
			{:else}
				<!-- Collapsed Mode Header -->
				<div class="flex flex-col items-center gap-2.5 py-3">
					<div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5845eb] via-[#7c3aed] to-[#9333ea] p-[1.5px] shadow-sm">
						<div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
							<Flame class="w-5 h-5 text-[#5845eb]" />
						</div>
					</div>
					<button
						type="button"
						onclick={() => (collapsed = false)}
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
		{#if !collapsed}
			<div class="p-3 pb-2 border-b border-slate-100/60 bg-white">
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
	</div>

	<!-- Scrollable Navigation Links Menu -->
	<div class="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
		<nav class="p-3 space-y-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
			
			<!-- 1. Dashboard Dropdown (With Overview, My Activity, Bot Activity) -->
			<div class="space-y-1 relative">
				<button
					type="button"
					onclick={() => toggleSubmenu('dashboard')}
					class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isDashboardGroupActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'} cursor-pointer"
					title="Dashboard"
				>
					<div class="flex items-center gap-3.5">
						<svg class="w-5 h-5 shrink-0 {isDashboardGroupActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="currentColor">
							<rect x="3" y="3" width="7.5" height="7.5" rx="2" />
							<rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
							<rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
							<rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
						</svg>
						{#if !collapsed}
							<span>Dashboard</span>
						{/if}
					</div>
					{#if !collapsed}
						<ChevronDown class="w-4 h-4 transition-transform duration-200 {isDashboardOpen ? 'rotate-180' : ''} {isDashboardGroupActive ? 'text-white' : 'text-slate-400'}" />
					{/if}
				</button>

				<!-- Dashboard Submenu -->
				{#if !collapsed && isDashboardOpen}
					<div class="pl-4 pr-1 py-1 space-y-1 ml-4 my-1 animate-in fade-in duration-150 text-sm">
						<!-- 1. Overview -->
						<a
							href="/admin"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath === '/admin'
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath === '/admin' ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Overview</span>
						</a>

						<!-- 2. My Activity -->
						<a
							href="/admin/my-activity"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath === '/admin/my-activity'
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath === '/admin/my-activity' ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>My Activity</span>
						</a>

						<!-- 3. Bot Activity -->
						<a
							href="/admin/bot-activity"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath === '/admin/bot-activity'
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath === '/admin/bot-activity' ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Bot Activity</span>
						</a>
					</div>
				{/if}
			</div>

			<!-- 2. Orders Dropdown -->
			<div class="space-y-1 relative">
				<button
					type="button"
					onclick={() => toggleSubmenu('orders')}
					class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isOrdersActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'} cursor-pointer"
					title="Orders"
				>
					<div class="flex items-center gap-3.5">
						<svg class="w-5 h-5 shrink-0 {isOrdersActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="currentColor">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M6 5C4.89543 5 4 5.89543 4 7L3.1 17C2.98 18.3 3.99 19.5 5.3 19.5H18.7C20.01 19.5 21.02 18.3 20.9 17L20 7C20 5.89543 19.1046 5 18 5H6ZM8 8C8 7.44772 8.44772 7 9 7H15C15.5523 7 16 7.44772 16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8Z" />
						</svg>
						{#if !collapsed}
							<span>Orders</span>
						{/if}
					</div>
					{#if !collapsed}
						<div class="flex items-center gap-2">
							<span class="text-xs font-bold px-2 py-0.5 rounded-full {isOrdersActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}">
								{webOrders.length + orderListOrders.length}
							</span>
							<ChevronDown class="w-4 h-4 transition-transform duration-200 {isOrdersOpen ? 'rotate-180' : ''} {isOrdersActive ? 'text-white' : 'text-slate-400'}" />
						</div>
					{/if}
				</button>

				<!-- Orders Submenu -->
				{#if !collapsed && isOrdersOpen}
					<div class="pl-3 pr-1 py-1 space-y-1 border-l-2 border-slate-100 ml-6 my-1 animate-in fade-in duration-150">
							<a
							href="/admin/orders/new"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {currentPath === '/admin/orders/new'
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span>New Order</span>
							<span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
								Manual
							</span>
						</a>
						<a
							href="/admin/orders"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {currentPath === '/admin/orders'
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span>Web Orders</span>
							<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
								{webOrders.length}
							</span>
						</a>

						<a
							href="/admin/orders/list"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all {currentPath === '/admin/orders/list'
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span>Order List</span>
							<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
								{orderListOrders.length}
							</span>
						</a>

					

						<a
							href="/admin/orders/pre"
							onclick={() => (mobileOpen = false)}
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

						<a
							href="/admin/orders/trash"
							onclick={() => (mobileOpen = false)}
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

			<!-- 3. Products -->
			<a
				href="/admin/products"
				onclick={() => {
					mobileOpen = false;
					closeAllSubmenus();
				}}
				class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isProductsActive
					? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
					: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
				title="Products"
			>
				<div class="flex items-center gap-3.5">
					<Package class="w-5 h-5 shrink-0 {isProductsActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" />
					{#if !collapsed}
						<span>Products</span>
					{/if}
				</div>
				{#if !collapsed}
					<span class="text-xs font-bold px-2 py-0.5 rounded-full {isProductsActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}">
						{(data?.products || []).length || 83}
					</span>
				{/if}
			</a>

			<!-- 4. Customization Dropdown -->
			<div class="space-y-1 relative">
				<button
					type="button"
					onclick={() => toggleSubmenu('customization')}
					class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isCustomizationActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'} cursor-pointer"
					title="Customization"
				>
					<div class="flex items-center gap-3.5">
						<SlidersHorizontal class="w-5 h-5 shrink-0 {isCustomizationActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" />
						{#if !collapsed}
							<span>Customization</span>
						{/if}
					</div>
					{#if !collapsed}
						<ChevronDown class="w-4 h-4 transition-transform duration-200 {isCustomizationOpen ? 'rotate-180' : ''}" />
					{/if}
				</button>

				<!-- Customization Submenu -->
				{#if !collapsed && isCustomizationOpen}
					<div class="pl-4 pr-1 py-1 space-y-1 ml-4 my-1 animate-in fade-in duration-150 text-sm">
						<!-- 1. Carousel -->
						<a
							href="/admin/customization/carousel"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath === '/admin/customization/carousel'
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath === '/admin/customization/carousel' ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Carousel</span>
						</a>

						<!-- 2. Banner -->
						<a
							href="/admin/customization/banner"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath === '/admin/customization/banner'
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath === '/admin/customization/banner' ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Banner</span>
						</a>

						<!-- 3. PopUp -->
						<a
							href="/admin/customization/popup"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath.startsWith('/admin/customization/popup') || currentPath.startsWith('/admin/customization/all-popup')
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath.startsWith('/admin/customization/popup') || currentPath.startsWith('/admin/customization/all-popup') ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>PopUp</span>
						</a>

						<!-- 4. Website Information -->
						<a
							href="/admin/customization/website-information"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath === '/admin/customization/website-information'
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath === '/admin/customization/website-information' ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Website Information</span>
						</a>

						<!-- 5. Navbar & Header -->
						<a
							href="/admin/customization/navbar"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath === '/admin/customization/navbar'
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath === '/admin/customization/navbar' ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Navbar & Header</span>
						</a>

						<!-- 6. Footer -->
						<a
							href="/admin/customization/footer"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath === '/admin/customization/footer'
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath === '/admin/customization/footer' ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Footer</span>
						</a>

						<!-- 7. Theme View -->
						<a
							href="/admin/customization/theme-view"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath === '/admin/customization/theme-view'
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath === '/admin/customization/theme-view' ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Theme View</span>
						</a>
					</div>
				{/if}
			</div>

			<!-- 5. Settings -->
			<a
				href="/admin/settings"
				onclick={() => {
					mobileOpen = false;
					closeAllSubmenus();
				}}
				class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isSettingsActive
					? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
					: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
				title="Settings"
			>
				<div class="flex items-center gap-3.5">
					<svg class="w-5 h-5 shrink-0 {isSettingsActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="currentColor">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2.5a2.25 2.25 0 0 0-2.228 1.93l-.11.758a1.25 1.25 0 0 1-1.385.992l-.75-.12a2.25 2.25 0 0 0-2.476 1.155l-.65 1.126a2.25 2.25 0 0 0 .428 2.7l.557.53a1.25 1.25 0 0 1 0 1.706l-.557.53a2.25 2.25 0 0 0-.428 2.7l.65 1.126a2.25 2.25 0 0 0 2.476 1.155l.75-.12a1.25 1.25 0 0 1 1.385.992l.11.758a2.25 2.25 0 0 0 2.228 1.93h1.3a2.25 2.25 0 0 0 2.228-1.93l.11-.758a1.25 1.25 0 0 1 1.385-.992l.75.12a2.25 2.25 0 0 0 2.476-1.155l.65-1.126a2.25 2.25 0 0 0-.428-2.7l-.557-.53a1.25 1.25 0 0 1 0-1.706l.557-.53a2.25 2.25 0 0 0 .428-2.7l-.65-1.126a2.25 2.25 0 0 0-2.476-1.155l-.75.12a1.25 1.25 0 0 1-1.385-.992l-.11-.758A2.25 2.25 0 0 0 13.3 2.5h-1.3ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
					</svg>
					{#if !collapsed}
						<span>Settings</span>
					{/if}
				</div>
			</a>

			<!-- 6. Catalog Dropdown -->
			<div class="space-y-1 relative">
				<button
					type="button"
					onclick={() => toggleSubmenu('catalog')}
					class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isCatalogActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'} cursor-pointer"
					title="Catalog"
				>
					<div class="flex items-center gap-3.5">
						<!-- Catalog Icon matching screenshot -->
						<div class="w-5 h-5 flex items-center justify-center {isCatalogActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}">
							<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
								<rect x="3" y="3" width="7" height="18" rx="2" />
								<rect x="14" y="3" width="7" height="18" rx="2" />
							</svg>
						</div>
						{#if !collapsed}
							<span>Catalog</span>
						{/if}
					</div>
					{#if !collapsed}
						<ChevronDown
							class="w-4 h-4 transition-transform duration-200 {isCatalogOpen ? 'rotate-180' : ''} {isCatalogActive ? 'text-white' : 'text-slate-400'}"
						/>
					{/if}
				</button>

				{#if isCatalogOpen && !collapsed}
					<div class="pl-4 pr-1 py-1 space-y-1 text-xs transition-all">
						<!-- 1. Categories -->
						<a
							href="/admin/catalog/categories"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath.startsWith('/admin/catalog/categories') || currentPath.startsWith('/admin/catalog/all-category')
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath.startsWith('/admin/catalog/categories') || currentPath.startsWith('/admin/catalog/all-category') ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Categories</span>
						</a>

						<!-- 2. Sub Categories -->
						<a
							href="/admin/catalog/sub-categories"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath.startsWith('/admin/catalog/sub-categories') || currentPath.startsWith('/admin/catalog/all-sub-category')
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath.startsWith('/admin/catalog/sub-categories') || currentPath.startsWith('/admin/catalog/all-sub-category') ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Sub Categories</span>
						</a>

						<!-- 3. Child Categories -->
						<a
							href="/admin/catalog/child-categories"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath.startsWith('/admin/catalog/child-categories') || currentPath.startsWith('/admin/catalog/all-child-category') || currentPath.startsWith('/admin/catalog/all_child_category')
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath.startsWith('/admin/catalog/child-categories') || currentPath.startsWith('/admin/catalog/all-child-category') || currentPath.startsWith('/admin/catalog/all_child_category') ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Child Categories</span>
						</a>

						<!-- 4. Brand -->
						<a
							href="/admin/catalog/brands"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath.startsWith('/admin/catalog/brands') || currentPath.startsWith('/admin/catalog/all-brand')
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath.startsWith('/admin/catalog/brands') || currentPath.startsWith('/admin/catalog/all-brand') ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Brand</span>
						</a>

						<!-- 5. Tags -->
						<a
							href="/admin/catalog/tags"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all {currentPath.startsWith('/admin/catalog/tags') || currentPath.startsWith('/admin/catalog/all-tag') || currentPath.startsWith('/admin/catalog/tag')
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {currentPath.startsWith('/admin/catalog/tags') || currentPath.startsWith('/admin/catalog/all-tag') || currentPath.startsWith('/admin/catalog/tag') ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Tags</span>
						</a>
					</div>
				{/if}
			</div>

			<!-- 7. IP Block -->
			<a
				href="/admin/ip-block"
				onclick={() => {
					mobileOpen = false;
					closeAllSubmenus();
				}}
				class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isIpBlockActive
					? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
					: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
				title="IP Block"
			>
				<div class="flex items-center gap-3.5">
					<svg class="w-5 h-5 shrink-0 {isIpBlockActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="2" y="3" width="20" height="14" rx="2" />
						<circle cx="12" cy="10" r="2.5" fill="currentColor" />
						<path d="M8 21h8M12 17v4" stroke-width="2" stroke-linecap="round" />
					</svg>
					{#if !collapsed}
						<span>IP Block</span>
					{/if}
				</div>
				{#if !collapsed}
					<span class="text-xs font-bold px-2 py-0.5 rounded-full {isIpBlockActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}">
						44.9k
					</span>
				{/if}
			</a>

			<!-- 8. Customers -->
			<a
				href="/admin/customers"
				onclick={() => {
					mobileOpen = false;
					closeAllSubmenus();
				}}
				class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isCustomerActive
					? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
					: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
				title="Customer"
			>
				<div class="flex items-center gap-3.5">
					<svg class="w-5 h-5 shrink-0 {isCustomerActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-5.5 8c0-2.5 3-4 5.5-4s5.5 1.5 5.5 4v1h-11v-1Z" />
						<path d="M5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-3 10c0-1.8 1.8-3 3.8-3.4-.5.8-.8 1.8-.8 2.9v1.5H2V18Z" opacity="0.8" />
						<path d="M19 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-1 9.5c0-1.1-.3-2.1-.8-2.9 2 .4 3.8 1.6 3.8 3.4v1H18v-1.5Z" opacity="0.8" />
					</svg>
					{#if !collapsed}
						<span>Customer</span>
					{/if}
				</div>
				{#if !collapsed}
					<span class="text-xs font-bold px-2 py-0.5 rounded-full {isCustomerActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}">
						{(data?.newsletter || []).length}
					</span>
				{/if}
			</a>

			<!-- 9. Database -->
			<a
				href="/admin/database"
				onclick={() => {
					mobileOpen = false;
					closeAllSubmenus();
				}}
				class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isDatabaseActive
					? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
					: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
				title="Database"
			>
				<div class="flex items-center gap-3.5">
					<svg class="w-5 h-5 shrink-0 {isDatabaseActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="currentColor">
						<rect x="4" y="3" width="16" height="18" rx="3.5" />
						<rect x="8" y="7" width="8" height="2" rx="1" fill="white" />
						<rect x="8" y="11" width="8" height="2" rx="1" fill="white" />
						<rect x="8" y="15" width="5" height="2" rx="1" fill="white" />
					</svg>
					{#if !collapsed}
						<span>Database</span>
					{/if}
				</div>
				{#if !collapsed}
					<span class="w-2.5 h-2.5 rounded-full {data?.isD1Connected ? 'bg-emerald-400' : 'bg-amber-400'} ring-4 ring-white/20"></span>
				{/if}
			</a>

			<!-- 10. Landing page -->
			<a
				href="/admin/landing-pages"
				onclick={() => {
					mobileOpen = false;
					closeAllSubmenus();
				}}
				class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isLandingPagesActive
					? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
					: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
				title="Landing page"
			>
				<div class="flex items-center gap-3.5">
					<svg class="w-5 h-5 {isLandingPagesActive ? 'text-white' : 'text-slate-800 group-hover:text-black'} shrink-0" viewBox="0 0 24 24" fill="currentColor">
						<rect x="4" y="4" width="16" height="12" rx="2" />
						<path d="M2 19h20c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1z" />
						<rect x="10" y="13" width="4" height="1.5" rx="0.5" fill="white" />
					</svg>
					{#if !collapsed}
						<span>Landing page</span>
					{/if}
				</div>
				{#if !collapsed}
					<span class="text-xs font-bold px-2 py-0.5 rounded-full {isLandingPagesActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}">
						3
					</span>
				{/if}
			</a>

			<!-- 11. Daily Target -->
			<a
				href="/admin/daily-target"
				onclick={() => {
					mobileOpen = false;
					closeAllSubmenus();
				}}
				class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isDailyTargetActive
					? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
					: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
				title="Daily Target"
			>
				<div class="flex items-center gap-3.5">
					<Target class="w-5 h-5 shrink-0 {isDailyTargetActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" />
					{#if !collapsed}
						<span>Daily Target</span>
					{/if}
				</div>
			</a>

			<!-- 12. Reports Dropdown -->
			<div class="space-y-1 relative">
				<button
					type="button"
					onclick={() => toggleSubmenu('reports')}
					class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isReportsActive
						? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
						: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'} cursor-pointer"
					title="Reports"
				>
					<div class="flex items-center gap-3.5">
						<svg class="w-5 h-5 shrink-0 {isReportsActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
							<line x1="16" y1="13" x2="8" y2="13" />
							<line x1="16" y1="17" x2="8" y2="17" />
							<line x1="10" y1="9" x2="8" y2="9" />
						</svg>
						{#if !collapsed}
							<span>Reports</span>
						{/if}
					</div>
					{#if !collapsed}
						<ChevronDown class="w-4 h-4 transition-transform duration-200 {isReportsOpen ? 'rotate-180' : ''} {isReportsActive ? 'text-white' : 'text-slate-400'}" />
					{/if}
				</button>

				<!-- Reports Submenu -->
				{#if !collapsed && isReportsOpen}
					<div class="pl-3 pr-1 py-1 space-y-1 border-l-2 border-slate-100 ml-6 my-1 animate-in fade-in duration-150 text-xs">
						<a
							href="/admin/reports/daily-business-summary"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all {isDailySummaryActive
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {isDailySummaryActive ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Daily Business Summary</span>
						</a>

						<a
							href="/admin/reports/asset-valuation"
							onclick={() => (mobileOpen = false)}
							class="w-full flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all {isAssetValuationActive
								? 'bg-indigo-50 text-[#5845eb] font-bold border border-indigo-200/80 shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<span class="w-1.5 h-1.5 rounded-full {isAssetValuationActive ? 'bg-[#5845eb]' : 'bg-slate-400'}"></span>
							<span>Asset Valuation</span>
						</a>
					</div>
				{/if}
			</div>

			<!-- 13. Admin Control -->
			<a
				href="/admin/admin-control"
				onclick={() => {
					mobileOpen = false;
					closeAllSubmenus();
				}}
				class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isAdminControlActive
					? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
					: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
				title="Admin Control"
			>
				<div class="flex items-center gap-3.5">
					<svg class="w-5 h-5 shrink-0 {isAdminControlActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="2" y="5" width="20" height="14" rx="2" />
						<line x1="2" y1="10" x2="22" y2="10" />
						<line x1="6" y1="15" x2="6.01" y2="15" stroke-width="3" />
						<line x1="10" y1="15" x2="10.01" y2="15" stroke-width="3" />
						<line x1="14" y1="15" x2="14.01" y2="15" stroke-width="3" />
						<line x1="18" y1="15" x2="18.01" y2="15" stroke-width="3" />
					</svg>
					{#if !collapsed}
						<span>Admin Control</span>
					{/if}
				</div>
			</a>

			<!-- 14. Support -->
			<a
				href="/admin/support"
				onclick={() => {
					mobileOpen = false;
					closeAllSubmenus();
				}}
				class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isSupportActive
					? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
					: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
				title="Support"
			>
				<div class="flex items-center gap-3.5">
					<Headphones class="w-5 h-5 shrink-0 {isSupportActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" />
					{#if !collapsed}
						<span>Support</span>
					{/if}
				</div>
				{#if !collapsed}
					<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="অনলাইন"></span>
				{/if}
			</a>

			<!-- 15. Tutorials -->
			<a
				href="/admin/tutorials"
				onclick={() => {
					mobileOpen = false;
					closeAllSubmenus();
				}}
				class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isTutorialsActive
					? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
					: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
				title="Tutorials"
			>
				<div class="flex items-center gap-3.5">
					<svg class="w-5 h-5 shrink-0 {isTutorialsActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10" />
						<polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
					</svg>
					{#if !collapsed}
						<span>Tutorials</span>
					{/if}
				</div>
			</a>

			<!-- 16. New Release -->
			<a
				href="/admin/new-release"
				onclick={() => {
					mobileOpen = false;
					closeAllSubmenus();
				}}
				class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isNewReleaseActive
					? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
					: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
				title="New Release"
			>
				<div class="flex items-center gap-3.5">
					<BadgeCheck class="w-5 h-5 shrink-0 {isNewReleaseActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" />
					{#if !collapsed}
						<span>New Release</span>
					{/if}
				</div>
			</a>

			<!-- 17. Profile -->
			<a
				href="/admin/profile"
				onclick={() => {
					mobileOpen = false;
					closeAllSubmenus();
				}}
				class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] {isProfileActive
					? 'bg-[#5845eb] text-white shadow-[0_10px_22px_-4px_rgba(88,69,235,0.38)]'
					: 'text-slate-800 hover:text-black hover:bg-slate-100/70 group'}"
				title="Profile"
			>
				<div class="flex items-center gap-3.5">
					<User class="w-5 h-5 shrink-0 {isProfileActive ? 'text-white' : 'text-slate-800 group-hover:text-black'}" />
					{#if !collapsed}
						<span>Profile</span>
					{/if}
				</div>
			</a>

			<!-- 18. Logout -->
			<button
				type="button"
				onclick={() => {
					closeAllSubmenus();
					alert('লগআউট করা হচ্ছে...');
				}}
				class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'justify-between px-4 py-3.5'} rounded-2xl transition-all font-semibold text-[15px] text-slate-800 hover:text-rose-600 hover:bg-rose-50/60 group cursor-pointer text-left"
				title="Logout"
			>
				<div class="flex items-center gap-3.5">
					<LogOut class="w-5 h-5 shrink-0 text-slate-800 group-hover:text-rose-600" />
					{#if !collapsed}
						<span>Logout</span>
					{/if}
				</div>
			</button>

		</nav>
	</div>

	<!-- Admin Panel Info Card -->
	<div class="p-3 border-t border-slate-100 bg-white">
		{#if !collapsed}
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
					type="button"
					onclick={() => (collapsed = false)}
					class="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
					title="সাইডবার খুলুন"
				>
					<PanelLeftOpen class="w-5 h-5" />
				</button>
			</div>
		{/if}
	</div>
</aside>
