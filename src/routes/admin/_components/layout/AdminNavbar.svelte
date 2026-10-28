<script lang="ts">
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { adminSearch } from '#lib/components/ui';
	import {
		Search,
		X,
		RefreshCw,
		Play,
		Headphones,
		Globe,
		Languages,
		Bell,
		Crown
	} from 'lucide-svelte';

	interface Props {
		onOpenTutorial?: () => void;
		onOpenPackage?: () => void;
		searchQuery?: string;
		unreadCount?: number;
	}

	let {
		onOpenTutorial,
		onOpenPackage,
		unreadCount = 0
	}: Props = $props();

	// Courier API Sync Telemetry
	let isCourierSyncing = $state(false);

	function triggerCourierSync() {
		isCourierSyncing = true;
		toast.info('Steadfast ও Pathao এপিআই-এর সাথে ডেটা সিঙ্ক হচ্ছে...');
		setTimeout(() => {
			isCourierSyncing = false;
			toast.success('কুরিয়ার ট্র্যাকিং সফলভাবে সিঙ্ক সম্পন্ন হয়েছে!');
		}, 1200);
	}

	// Active route helpers
	let currentPath = $derived(page.url.pathname);
	let isDashboard = $derived(currentPath === '/admin');
	let isMyActivityActive = $derived(currentPath.startsWith('/admin/my-activity'));
	let isBotActivityActive = $derived(currentPath.startsWith('/admin/bot-activity'));
	let isOrdersActive = $derived(currentPath.startsWith('/admin/orders'));
	let isProductsActive = $derived(currentPath.startsWith('/admin/products'));
	let isCarouselActive = $derived(currentPath === '/admin/customization/carousel');
	let isBannerActive = $derived(currentPath === '/admin/customization/banner');
	let isPopupActive = $derived(currentPath.startsWith('/admin/customization/popup') || currentPath.startsWith('/admin/customization/all-popup'));
	let isWebsiteInfoActive = $derived(currentPath === '/admin/customization/website-information');
	let isThemeViewActive = $derived(currentPath === '/admin/customization/theme-view');
	let isSettingsActive = $derived(currentPath.startsWith('/admin/settings'));
	let isCatalogCategories = $derived(currentPath.startsWith('/admin/catalog/categories') || currentPath.startsWith('/admin/catalog/all-category'));
	let isCatalogSubCategories = $derived(currentPath.startsWith('/admin/catalog/sub-categories') || currentPath.startsWith('/admin/catalog/all-sub-category'));
	let isCatalogChildCategories = $derived(currentPath.startsWith('/admin/catalog/child-categories') || currentPath.startsWith('/admin/catalog/all-child-category') || currentPath.startsWith('/admin/catalog/all_child_category'));
	let isCatalogBrands = $derived(currentPath.startsWith('/admin/catalog/brands') || currentPath.startsWith('/admin/catalog/all-brand'));
	let isCatalogTags = $derived(currentPath.startsWith('/admin/catalog/tags') || currentPath.startsWith('/admin/catalog/all-tag') || currentPath.startsWith('/admin/catalog/tag'));
	let isCatalogActive = $derived(currentPath.startsWith('/admin/catalog'));
	let isCustomerActive = $derived(currentPath.startsWith('/admin/customers'));
	let isDatabaseActive = $derived(currentPath.startsWith('/admin/database'));
	let isIpBlockActive = $derived(currentPath.startsWith('/admin/ip-block'));
	let isProfileActive = $derived(currentPath.startsWith('/admin/profile'));
	let isSupportActive = $derived(currentPath.startsWith('/admin/support'));
	let isNotificationsActive = $derived(currentPath.startsWith('/admin/notifications'));
	let isLandingPagesActive = $derived(currentPath.startsWith('/admin/landing-pages'));
	let isTutorialsActive = $derived(currentPath.startsWith('/admin/tutorials'));
	let isNewReleaseActive = $derived(currentPath.startsWith('/admin/new-release'));
	let isAdminControlActive = $derived(currentPath.startsWith('/admin/admin-control'));
	let isReportsActive = $derived(currentPath.startsWith('/admin/reports'));
	let isDailySummaryActive = $derived(currentPath === '/admin/reports/daily-business-summary' || currentPath === '/admin/reports');
	let isAssetValuationActive = $derived(currentPath === '/admin/reports/asset-valuation');
	let isDailyTargetActive = $derived(currentPath.startsWith('/admin/daily-target'));
</script>

<!-- TOP COMMAND BAR (Exact Match with Reference Design) -->
<header
	class="h-16 md:h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs transition-shadow"
	style="position: sticky; top: 0; z-index: 40;"
>
	<div class="flex items-center gap-3 md:gap-4 min-w-0">
		<!-- Mobile Store Brand Logo -->
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
				{:else if isMyActivityActive}
					<span>My Activity</span>
				{:else if isBotActivityActive}
					<span>Bot Activity</span>
				{:else if isProductsActive}
					<span>Product</span>
				{:else if isCarouselActive}
					<span>Carousel</span>
				{:else if isBannerActive}
					<span>Banner</span>
				{:else if isPopupActive}
					<span>Popup</span>
				{:else if isWebsiteInfoActive}
					<span>Website Information</span>
				{:else if isThemeViewActive}
					<span>Theme View Customization</span>
				{:else if isOrdersActive}
					<span>Orders</span>
				{:else if isSettingsActive}
					<span>Settings</span>
				{:else if isCatalogCategories}
					<span>Category</span>
				{:else if isCatalogSubCategories}
					<span>Sub Category</span>
				{:else if isCatalogChildCategories}
					<span>Child Category</span>
				{:else if isCatalogBrands}
					<span>Brands</span>
				{:else if isCatalogTags}
					<span>Tags</span>
				{:else if isCatalogActive}
					<span>Catalog</span>
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
				{:else if isLandingPagesActive}
					<span>Landing page</span>
				{:else if isDailyTargetActive}
					<span>Daily Target</span>
				{:else if isDailySummaryActive}
					<span>Daily Business Summary Report</span>
				{:else if isAssetValuationActive}
					<span>Asset Valuation</span>
				{:else if isReportsActive}
					<span>Reports</span>
				{:else if isTutorialsActive}
					<span>Tutorials</span>
				{:else if isNewReleaseActive}
					<span>New Release</span>
				{:else if isAdminControlActive}
					<span>Vendor Admins</span>
				{:else}
					<span>AURA Control</span>
				{/if}
			</h1>

			<!-- Tutorial & Support Action Buttons (Desktop) -->
			<div class="hidden sm:flex items-center gap-2.5">
				<!-- Tutorial Button -->
				<button
					type="button"
					onclick={() => onOpenTutorial?.()}
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

	<!-- Right Navbar Actions -->
	<div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
		<!-- 1. Mobile Support Button -->
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

		<!-- 3. Language Switcher -->
		<button
			type="button"
			onclick={() => toast.info('ভাষা: বাংলা এবং English উভয়ই সক্রিয়')}
			class="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200/90 bg-white flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer shrink-0"
			title="ভাষা পরিবর্তন (Bangla / English)"
		>
			<Languages class="w-4 h-4" />
		</button>

		<!-- 4. Search Icon Button (Global Command Palette Trigger) -->
		<button
			type="button"
			onclick={() => adminSearch.open()}
			class="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200/90 bg-white flex items-center justify-center text-slate-600 hover:text-[#5845eb] hover:border-[#5845eb]/40 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer shrink-0"
			title="সার্চ করুন (Ctrl + K)"
			aria-label="গ্লোবাল সার্চ"
		>
			<Search class="w-4 h-4" />
		</button>

		<!-- 5. Notification Bell (Desktop only) -->
		<div class="hidden md:block relative">
			<a
				href="/admin/notifications"
				class="w-9 h-9 rounded-full border border-slate-200/90 bg-white flex items-center justify-center {isNotificationsActive ? 'text-[#5845eb] border-[#5845eb]' : 'text-slate-600 hover:text-slate-900'} hover:bg-slate-50 transition-colors shadow-2xs relative"
				title="নোটিফিকেশন সেন্টার ({unreadCount} টি অপঠিত)"
			>
				<Bell class="w-4 h-4" />
				{#if unreadCount > 0}
					<span class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9.5px] font-black flex items-center justify-center leading-none ring-2 ring-white">
						{unreadCount > 99 ? '99+' : unreadCount}
					</span>
				{/if}
			</a>
		</div>

		<!-- 6. Store / Profile Circle -->
		<a
			href="/admin/profile"
			class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950 border border-slate-200 flex items-center justify-center text-white overflow-hidden shadow-2xs hover:ring-2 hover:ring-[#5845eb]/30 transition-all cursor-pointer shrink-0"
			title="প্রোফাইল সেটিংস"
		>
			{#if page.data?.ownerProfile?.avatarUrl}
				<img
					src={page.data.ownerProfile.avatarUrl}
					alt={page.data.ownerProfile.name || 'Owner'}
					class="w-full h-full object-cover"
				/>
			{:else}
				<div class="text-[7px] sm:text-[7.5px] font-black uppercase tracking-tighter text-center leading-[1.05] bg-gradient-to-tr from-pink-400 to-indigo-400 bg-clip-text text-transparent">
					COLOR<br/>LIGHT
				</div>
			{/if}
		</a>

		<!-- 7. Golden "Premium Package" Pill (Desktop Only) -->
		<button
			type="button"
			onclick={() => onOpenPackage?.()}
			class="hidden md:flex rounded-2xl bg-gradient-to-r from-[#eab308] via-[#facc15] to-[#f59e0b] p-1 pr-3 items-center gap-2 shadow-sm border border-amber-300 hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0"
			title="প্রিমিয়াম প্যাকেজ মেয়াদ"
		>
			<div class="w-7 h-7 rounded-xl bg-amber-400/90 border border-amber-200/80 flex items-center justify-center shadow-inner">
				<Crown class="w-4 h-4 fill-amber-950 text-amber-950" />
			</div>
			<div class="flex flex-col text-left">
				<span class="text-[10px] text-amber-950 font-bold leading-none tracking-tight">Premium Package</span>
				<span class="text-[11px] font-black text-rose-600 leading-tight">5 days left</span>
			</div>
		</button>
	</div>
</header>
