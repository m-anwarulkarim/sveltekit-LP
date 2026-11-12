<script lang="ts">
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		AccountSidebar,
		AccountOverviewTab,
		OrdersTab,
		AddressBookTab,
		ProfileSecurityTab,
		CustomerSupportTab
	} from './_components';
	import {
		LayoutDashboard,
		Package,
		MapPin,
		User,
		PhoneCall,
		Home,
		ChevronRight
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// Initialize active tab from URL query param (?tab=...) or default to 'overview'
	let activeTab = $state<'overview' | 'orders' | 'address' | 'profile' | 'support'>(
		(page.url.searchParams.get('tab') as any) || 'overview'
	);

	function handleTabChange(tab: string) {
		activeTab = tab as any;
		const url = new URL(page.url.href);
		if (tab === 'overview') {
			url.searchParams.delete('tab');
		} else {
			url.searchParams.set('tab', tab);
		}
		goto(url.toString(), { noScroll: true, keepFocus: true });
	}

	const orderCount = $derived(data.orders?.length || 0);

	const MOBILE_NAV_TABS = [
		{ id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
		{ id: 'orders', label: 'অর্ডারসমূহ', icon: Package, badge: orderCount > 0 ? orderCount : null },
		{ id: 'address', label: 'ঠিকানা', icon: MapPin },
		{ id: 'profile', label: 'প্রোফাইল', icon: User },
		{ id: 'support', label: 'সহায়তা', icon: PhoneCall }
	];
</script>

<svelte:head>
	<title>আমার অ্যাকাউন্ট ও ড্যাশবোর্ড | AURA | Seed BD</title>
	<meta name="description" content="দারাজ স্টাইল গ্রাহক প্রোফাইল, অর্ডার ট্র্যাকিং, ডেলিভারি ক্যাশ মেমো ও ঠিকানা খাতা।" />
</svelte:head>

<StoreLayout user={data.user}>
	<div class="bg-slate-50/60 min-h-[85vh] py-6 sm:py-10">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 font-['Anek_Bangla',sans-serif]">
			
			<!-- Breadcrumb Navigation -->
			<nav class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
				<a href="/" class="hover:text-[#5845eb] transition-colors flex items-center gap-1">
					<Home class="w-3.5 h-3.5" />
					<span>হোম</span>
				</a>
				<ChevronRight class="w-3.5 h-3.5 text-slate-400" />
				<span class="text-slate-800 font-bold">আমার অ্যাকাউন্ট (Manage My Account)</span>
			</nav>

			<!-- Mobile Horizontal Scrollable Tab Bar (Daraz App Style) -->
			<div class="lg:hidden bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
				{#each MOBILE_NAV_TABS as tab}
					{@const isActive = activeTab === tab.id}
					{@const Icon = tab.icon}
					<button
						type="button"
						onclick={() => handleTabChange(tab.id)}
						class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer {isActive
							? 'bg-[#5845eb] text-white shadow-xs'
							: 'text-slate-700 hover:bg-slate-100'}"
					>
						<Icon class="w-3.5 h-3.5" />
						<span>{tab.label}</span>
						{#if tab.badge}
							<span
								class="px-1.5 py-0.2 rounded-full text-[10px] font-mono {isActive
									? 'bg-white/25 text-white'
									: 'bg-indigo-50 text-[#5845eb]'}"
							>
								{tab.badge}
							</span>
						{/if}
					</button>
				{/each}
			</div>

			<!-- Main 2-Column Responsive Grid (Daraz Desktop Layout) -->
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
				<!-- Left Column: Sidebar (Desktop) -->
				<div class="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24">
					<AccountSidebar
						user={data.user}
						{activeTab}
						{orderCount}
						onTabChange={handleTabChange}
					/>
				</div>

				<!-- Right Column: Active Tab Content (Daraz Desktop View) -->
				<div class="lg:col-span-8 xl:col-span-9">
					{#if activeTab === 'overview'}
						<AccountOverviewTab
							user={data.user}
							customer={data.customer}
							orders={data.orders}
							onNavigateTab={handleTabChange}
						/>
					{:else if activeTab === 'orders'}
						<OrdersTab orders={data.orders} />
					{:else if activeTab === 'address'}
						<AddressBookTab
							customer={data.customer}
							user={data.user}
							orders={data.orders}
						/>
					{:else if activeTab === 'profile'}
						<ProfileSecurityTab
							user={data.user}
							customer={data.customer}
						/>
					{:else if activeTab === 'support'}
						<CustomerSupportTab />
					{/if}
				</div>
			</div>

		</div>
	</div>
</StoreLayout>
