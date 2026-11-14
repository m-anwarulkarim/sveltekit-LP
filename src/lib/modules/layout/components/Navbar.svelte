<script lang="ts">
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { Button, Badge, Separator } from '#lib/components/ui';
	import {
		Globe,
		User,
		ShoppingCart,
		Home,
		Package,
		LayoutGrid,
		HelpCircle,
		Menu,
		X,
		ChevronDown,
		Check,
		Sparkles,
		PhoneCall,
		Flame,
		Headphones,
		BookOpen,
		Watch,
		ShoppingBag,
		Laptop,
		Shirt,
		Smartphone,
		Tv,
		Baby
	} from 'lucide-svelte';
	import { page } from '$app/state';

	import SearchAutocomplete from './SearchAutocomplete.svelte';

	interface Props {
		user: { name?: string; email?: string; image?: string | null } | null;
		onOpenAuth: () => void;
	}

	let { user, onOpenAuth }: Props = $props();

	interface NavCatItem {
		id: string;
		slug: string;
		name: string;
		nameBn: string;
		icon: string;
		productsCount?: number;
	}

	const navCategories = $derived.by<NavCatItem[]>(() => {
		const dbCats = page.data?.categories;
		if (Array.isArray(dbCats) && dbCats.length > 0) {
			return dbCats.map((c: any) => ({
				id: c.id,
				slug: c.slug,
				name: c.name,
				nameBn: c.name,
				icon: c.icon || '📦',
				productsCount: c.productsCount || 0
			}));
		}
		return [];
	});

	const storeConfig = $derived(page.data?.storeConfig);
	const websiteInfo = $derived(page.data?.websiteInfo);
	const storeName = $derived(websiteInfo?.websiteName || 'Store');

	// URL-driven active tab (never stale on direct navigation or refresh)
	const activeTab = $derived.by<'home' | 'products' | 'categories' | 'account' | null>(() => {
		const p = page.url.pathname;
		if (p === '/') return 'home';
		if (p === '/catalog/all-product' || p.startsWith('/products')) return 'products';
		if (p.startsWith('/catalog') || p.startsWith('/categories')) return 'categories';
		if (p.startsWith('/account') || p.startsWith('/auth')) return 'account';
		return null;
	});

	// State
	let isMobileDrawerOpen = $state(false);
	let isCategoryDropdownOpen = $state(false);
	let isLangOpen = $state(false);
	let currentLang = $state<'bn' | 'en'>('bn');
	let isScrolled = $state(false);
	let isAnnouncementDismissed = $state(false);

	let categoryDropdownTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (typeof sessionStorage !== 'undefined') {
			isAnnouncementDismissed = sessionStorage.getItem('nav_ann_dismissed') === '1';
		}
	});

	function dismissAnnouncement() {
		isAnnouncementDismissed = true;
		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.setItem('nav_ann_dismissed', '1');
		}
	}

	function handleScroll() {
		isScrolled = window.scrollY > 4;
	}

	function handleCategoryMouseEnter() {
		if (categoryDropdownTimer) {
			clearTimeout(categoryDropdownTimer);
			categoryDropdownTimer = null;
		}
		isCategoryDropdownOpen = true;
	}

	function handleCategoryMouseLeave() {
		if (categoryDropdownTimer) clearTimeout(categoryDropdownTimer);
		categoryDropdownTimer = setTimeout(() => {
			isCategoryDropdownOpen = false;
		}, 180);
	}

	function handleDocumentClick(e: MouseEvent) {
		const target = e.target as HTMLElement | null;
		if (!target) return;
		if (isCategoryDropdownOpen && !target.closest('.category-dropdown-container')) {
			isCategoryDropdownOpen = false;
		}
		if (isLangOpen && !target.closest('.lang-selector-container')) {
			isLangOpen = false;
		}
	}

	const iconMap: Record<string, any> = {
		headphones: Headphones,
		bookopen: BookOpen,
		watch: Watch,
		shoppingbag: ShoppingBag,
		laptop: Laptop,
		shirt: Shirt,
		smartphone: Smartphone,
		tv: Tv,
		baby: Baby,
		sparkles: Sparkles,
		package: Package,
		layoutgrid: LayoutGrid,
		home: Home
	};

	function getCategoryIconComponent(iconName: string) {
		if (!iconName) return null;
		const clean = iconName.toLowerCase().replace(/[^a-z0-9]/g, '');
		return iconMap[clean] || null;
	}

	// Shared nav link class helper
	function desktopNavClass(active: boolean) {
		return `flex items-center gap-1.5 text-xs font-bold transition-colors group relative pb-0.5
			${active
				? 'text-[#5845eb] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[#5845eb]'
				: 'text-slate-700 hover:text-[#5845eb]'}`;
	}

	function drawerNavClass(active: boolean) {
		return `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-colors
			${active
				? 'bg-indigo-50 text-[#5845eb]'
				: 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`;
	}
</script>

<svelte:window onclick={handleDocumentClick} onscroll={handleScroll} />

<header
	class="w-full bg-white font-['Anek_Bangla',sans-serif] selection:bg-[#5845eb]/20 selection:text-[#5845eb] border-b border-slate-100 sticky top-0 z-40 transition-shadow duration-200
	{isScrolled ? 'shadow-md shadow-slate-200/70' : 'shadow-xs'}"
>

	<!-- 1. Announcement Bar (dismissible) -->
	{#if !isAnnouncementDismissed}
		<div class="bg-gradient-to-r from-[#4936d6] via-[#5845eb] to-[#7c3aed] text-white text-xs sm:text-sm font-bold py-2 pl-4 pr-3 tracking-wide flex items-center justify-center gap-2 relative">
			<span class="inline-block animate-bounce shrink-0">🚚</span>
			<span>৳{storeConfig?.freeShippingThreshold || 600}+ অর্ডার করলেই ডেলিভারি সম্পূর্ণ ফ্রি!</span>
			<button
				type="button"
				onclick={dismissAnnouncement}
				class="ml-auto shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
				aria-label="বন্ধ করুন"
			>
				<X class="w-3.5 h-3.5" />
			</button>
		</div>
	{/if}

	<!-- 2. Main Header Row -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
		<div class="flex items-center justify-between gap-3 sm:gap-6">

			<!-- Left: Hamburger + Brand -->
			<div class="flex items-center gap-2.5 sm:gap-4 shrink-0">
				<Button
					variant="ghost"
					size="icon"
					onclick={() => (isMobileDrawerOpen = true)}
					class="md:hidden -ml-1 h-10 w-10 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
					aria-label="মেনু খুলুন"
				>
					<Menu class="w-6 h-6 stroke-[2.5]" />
				</Button>

				<a href="/" class="flex items-center gap-2.5 group shrink-0">
					{#if websiteInfo?.logoUrl}
						<img
							src={websiteInfo.logoUrl}
							alt={storeName}
							class="h-8 sm:h-9 max-w-[130px] sm:max-w-[170px] object-contain"
						/>
					{:else}
						<div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5845eb] via-[#7c3aed] to-[#9333ea] p-[1.5px] shadow-sm shadow-indigo-600/20 group-hover:scale-105 transition-transform shrink-0">
							<div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
								<Flame class="w-5 h-5 text-[#5845eb]" />
							</div>
						</div>
						<div class="flex flex-col">
							<div class="flex items-center gap-1.5 leading-tight">
								<span class="font-black text-lg sm:text-xl text-slate-900 font-['Outfit'] tracking-tight">
									{storeName}
								</span>
								<Badge variant="purple" class="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-[#5845eb] border border-indigo-200">
									ORIGINAL
								</Badge>
							</div>
							<span class="text-[10.5px] text-slate-500 font-medium -mt-0.5 hidden sm:block">
								{websiteInfo?.shortDescription || 'Next-Gen E-Commerce'}
							</span>
						</div>
					{/if}
				</a>
			</div>

			<!-- Center: Search (Desktop) -->
			<div class="hidden md:flex flex-1 max-w-2xl mx-4">
				<SearchAutocomplete
					placeholder="বীজ বা পছন্দের পণ্য খুঁজুন... (যেমন: oil, মরিচ, noodles)"
					onSearch={() => {
						const el = document.getElementById('products');
						if (el) el.scrollIntoView({ behavior: 'smooth' });
					}}
				/>
			</div>

			<!-- Right: Account, Cart, Language -->
			<div class="flex items-center gap-2 sm:gap-3 shrink-0">

				<!-- Account (Desktop only) -->
				{#if user}
					<Button
						variant="ghost"
						href="/account"
						class="hidden md:inline-flex h-auto items-center gap-2 px-3 py-1.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left font-normal"
					>
						<div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb] shrink-0">
							<User class="w-4 h-4 stroke-[2.5]" />
						</div>
						<div class="flex flex-col leading-tight">
							<span class="text-[10px] text-slate-400 font-medium">প্রোফাইল</span>
							<span class="text-xs font-bold text-slate-800 max-w-[90px] truncate">{user.name || 'আমার একাউন্ট'}</span>
						</div>
					</Button>
				{:else}
					<Button
						variant="ghost"
						href="/auth/login"
						class="hidden md:inline-flex h-auto items-center gap-2 px-3 py-1.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left group font-normal"
					>
						<div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 group-hover:bg-[#5845eb] group-hover:text-white flex items-center justify-center text-[#5845eb] transition-colors shrink-0">
							<User class="w-4 h-4 stroke-[2.5]" />
						</div>
						<div class="flex flex-col leading-tight">
							<span class="text-[10.5px] text-slate-400 font-medium">লগইন করুন</span>
							<span class="text-xs font-black text-slate-800 group-hover:text-[#5845eb] transition-colors">একাউন্ট ও অর্ডার</span>
						</div>
					</Button>
				{/if}

				<!-- Cart Button -->
				<Button
					variant="outline"
					onclick={() => cart.toggleCart()}
					class="h-auto flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-pink-50/80 hover:bg-pink-100/80 text-pink-600 hover:text-pink-700 border-pink-200/90 shadow-2xs transition-all cursor-pointer group active:scale-95"
					aria-label="কার্ট দেখুন"
				>
					<div class="relative flex items-center justify-center">
						<ShoppingCart class="w-4 h-4 text-pink-600 stroke-[2.5] group-hover:scale-110 transition-transform" />
						{#if cart.count > 0}
							<span class="absolute -top-2.5 -right-2.5 h-4 min-w-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs leading-none">
								{cart.count}
							</span>
						{/if}
					</div>
					<span class="text-xs font-black tracking-wide hidden sm:inline">কার্ট</span>
				</Button>

				<!-- Language Selector (click-toggle, works on touch) -->
				<div class="relative lang-selector-container">
					<Button
						variant="outline"
						onclick={() => (isLangOpen = !isLangOpen)}
						class="h-auto flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-2xl border border-slate-200/90 hover:border-[#5845eb] bg-white hover:bg-indigo-50/40 text-slate-700 hover:text-[#5845eb] text-xs font-bold transition-all shadow-2xs cursor-pointer"
						aria-label="ভাষা পরিবর্তন করুন"
						aria-expanded={isLangOpen}
					>
						<Globe class="w-4 h-4 text-[#5845eb] stroke-[2.2]" />
						<span class="font-mono uppercase text-[11px] font-bold hidden sm:inline">
							{currentLang === 'bn' ? 'BN' : 'EN'}
						</span>
						<ChevronDown class="w-3 h-3 text-slate-400 transition-transform duration-200 {isLangOpen ? 'rotate-180' : ''}" />
					</Button>

					{#if isLangOpen}
						<div class="absolute right-0 top-full mt-1.5 w-44 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
							<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-1.5 space-y-1">
								<button
									type="button"
									onclick={() => { currentLang = 'bn'; isLangOpen = false; }}
									class="w-full h-auto flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer
										{currentLang === 'bn' ? 'bg-indigo-50 text-[#5845eb]' : 'text-slate-700 hover:bg-slate-50'}"
								>
									<div class="flex items-center gap-2">
										<span class="text-base leading-none">🇧🇩</span>
										<span>বাংলা (Bangla)</span>
									</div>
									{#if currentLang === 'bn'}
										<Check class="w-3.5 h-3.5 text-[#5845eb] stroke-[3]" />
									{/if}
								</button>
								<button
									type="button"
									onclick={() => { currentLang = 'en'; isLangOpen = false; }}
									class="w-full h-auto flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer
										{currentLang === 'en' ? 'bg-indigo-50 text-[#5845eb]' : 'text-slate-700 hover:bg-slate-50'}"
								>
									<div class="flex items-center gap-2">
										<span class="text-base leading-none">🇬🇧</span>
										<span>English</span>
									</div>
									{#if currentLang === 'en'}
										<Check class="w-3.5 h-3.5 text-[#5845eb] stroke-[3]" />
									{/if}
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Mobile Search Row -->
		<div class="mt-2.5 md:hidden">
			<SearchAutocomplete
				placeholder="পণ্য খুঁজুন..."
				onSearch={() => {
					const el = document.getElementById('products');
					if (el) el.scrollIntoView({ behavior: 'smooth' });
					isMobileDrawerOpen = false;
				}}
			/>
		</div>
	</div>

	<!-- 3. Desktop Category Nav Bar -->
	<div class="hidden md:block border-t border-slate-100 bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-11">

				<!-- Categories Dropdown -->
				<div
					class="relative category-dropdown-container"
					onmouseenter={handleCategoryMouseEnter}
					onmouseleave={handleCategoryMouseLeave}
					role="navigation"
				>
					<Button
						variant="ghost"
						onclick={() => (isCategoryDropdownOpen = !isCategoryDropdownOpen)}
						class="h-auto p-0 hover:bg-transparent flex items-center gap-2 text-xs font-black tracking-wide py-2 cursor-pointer
							{isCategoryDropdownOpen ? 'text-[#5845eb]' : 'text-slate-800 hover:text-[#5845eb]'} transition-colors"
					>
						<LayoutGrid class="w-4 h-4 text-pink-600" />
						<span>সকল ক্যাটাগরি</span>
						<ChevronDown class="w-3 h-3 text-slate-400 transition-transform duration-200 {isCategoryDropdownOpen ? 'rotate-180 text-[#5845eb]' : ''}" />
					</Button>

					{#if isCategoryDropdownOpen}
						<div class="absolute left-0 top-full pt-1.5 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
							<div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-2 space-y-0.5 max-h-96 overflow-y-auto no-scrollbar">
								{#each navCategories as cat}
									{@const IconComp = getCategoryIconComponent(cat.icon)}
									<a
										href="/categories/{cat.slug}"
										onclick={() => (isCategoryDropdownOpen = false)}
										class="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#5845eb] hover:bg-indigo-50/60 transition-colors group/item"
									>
										<div class="flex items-center gap-2.5">
											{#if IconComp}
												<IconComp class="w-4 h-4 text-slate-400 group-hover/item:text-[#5845eb] transition-colors shrink-0" />
											{:else if cat.icon && cat.icon.length <= 4}
												<span class="text-sm shrink-0">{cat.icon}</span>
											{:else}
												<LayoutGrid class="w-4 h-4 text-slate-400 group-hover/item:text-[#5845eb] transition-colors shrink-0" />
											{/if}
											<span>{cat.nameBn || cat.name}</span>
										</div>
										{#if cat.productsCount && cat.productsCount > 0}
											<span class="text-[10px] text-slate-400 font-medium">{cat.productsCount}</span>
										{/if}
									</a>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<Separator orientation="vertical" class="h-4 mx-3 bg-slate-200" />

				<!-- Nav Links with active indicator -->
				<nav class="flex items-center gap-6 flex-1">
					<a href="/" class={desktopNavClass(activeTab === 'home')}>
						<Home class="w-3.5 h-3.5 {activeTab === 'home' ? 'text-[#5845eb]' : 'text-slate-400 group-hover:text-[#5845eb]'} transition-colors" />
						<span>হোম</span>
					</a>
					<a href="/catalog/all-product" class={desktopNavClass(page.url.pathname === '/catalog/all-product' || page.url.pathname.startsWith('/products'))}>
						<Package class="w-3.5 h-3.5 {page.url.pathname === '/catalog/all-product' || page.url.pathname.startsWith('/products') ? 'text-[#5845eb]' : 'text-slate-400 group-hover:text-[#5845eb]'} transition-colors" />
						<span>সকল পণ্য</span>
					</a>
					<a href="/catalog/all-category" class={desktopNavClass(page.url.pathname.startsWith('/catalog/all-category') || page.url.pathname.startsWith('/categories'))}>
						<LayoutGrid class="w-3.5 h-3.5 {page.url.pathname.startsWith('/catalog/all-category') || page.url.pathname.startsWith('/categories') ? 'text-[#5845eb]' : 'text-slate-400 group-hover:text-[#5845eb]'} transition-colors" />
						<span>ক্যাটাগরি</span>
					</a>
					<a href={user ? '/account' : '/auth/login'} class={desktopNavClass(activeTab === 'account')}>
						<User class="w-3.5 h-3.5 {activeTab === 'account' ? 'text-[#5845eb]' : 'text-slate-400 group-hover:text-[#5845eb]'} transition-colors" />
						<span>{user ? 'একাউন্ট' : 'লগইন'}</span>
					</a>
					<a href="/faq" class={desktopNavClass(page.url.pathname === '/faq')}>
						<HelpCircle class="w-3.5 h-3.5 {page.url.pathname === '/faq' ? 'text-[#5845eb]' : 'text-slate-400 group-hover:text-[#5845eb]'} transition-colors" />
						<span>সাহায্য</span>
					</a>
				</nav>

				<!-- Hotline -->
				<div class="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
					<PhoneCall class="w-3.5 h-3.5 text-[#5845eb]" />
					<span>হটলাইন: <strong class="text-slate-900 font-mono">{storeConfig?.hotlinePhone || '0156007230'}</strong></span>
				</div>
			</div>
		</div>
	</div>
</header>

<!-- Mobile Slide-out Drawer -->
{#if isMobileDrawerOpen}
	<button
		type="button"
		onclick={() => (isMobileDrawerOpen = false)}
		class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden cursor-default animate-in fade-in"
		aria-label="মেনু বন্ধ করুন"
	></button>

	<aside class="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 md:hidden shadow-2xl flex flex-col animate-in slide-in-from-left duration-200 font-['Anek_Bangla',sans-serif]">

		<!-- Drawer Header -->
		<div class="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white shrink-0">
			<div class="flex items-center gap-2.5">
				{#if websiteInfo?.logoUrl}
					<img src={websiteInfo.logoUrl} alt={storeName} class="h-8 max-w-[120px] object-contain" />
				{:else}
					<div class="w-9 h-9 rounded-xl bg-[#5845eb] flex items-center justify-center text-white shrink-0">
						<Flame class="w-4.5 h-4.5" />
					</div>
					<span class="font-black text-slate-900 text-base font-['Outfit']">{storeName}</span>
				{/if}
			</div>
			<Button
				variant="ghost"
				size="icon"
				onclick={() => (isMobileDrawerOpen = false)}
				class="h-9 w-9 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer"
				aria-label="মেনু বন্ধ করুন"
			>
				<X class="w-5 h-5" />
			</Button>
		</div>

		<!-- Scrollable content -->
		<div class="flex-1 overflow-y-auto overscroll-contain">

			<!-- Main Nav Links -->
			<div class="p-3 space-y-0.5">
				<a href="/" onclick={() => (isMobileDrawerOpen = false)} class={drawerNavClass(activeTab === 'home')}>
					<Home class="w-5 h-5 shrink-0 {activeTab === 'home' ? 'text-[#5845eb]' : 'text-slate-400'}" />
					<span>হোম পেইজ</span>
				</a>
				<a href="/catalog/all-product" onclick={() => (isMobileDrawerOpen = false)} class={drawerNavClass(page.url.pathname.startsWith('/catalog'))}>
					<Package class="w-5 h-5 shrink-0 {page.url.pathname.startsWith('/catalog') ? 'text-[#5845eb]' : 'text-slate-400'}" />
					<span>সকল পণ্য</span>
				</a>
				<a href="/faq" onclick={() => (isMobileDrawerOpen = false)} class={drawerNavClass(page.url.pathname === '/faq')}>
					<HelpCircle class="w-5 h-5 shrink-0 {page.url.pathname === '/faq' ? 'text-[#5845eb]' : 'text-slate-400'}" />
					<span>সাহায্য ও FAQ</span>
				</a>
				{#if user}
					<a href="/account" onclick={() => (isMobileDrawerOpen = false)} class={drawerNavClass(activeTab === 'account')}>
						<User class="w-5 h-5 shrink-0 {activeTab === 'account' ? 'text-[#5845eb]' : 'text-slate-400'}" />
						<span>আমার একাউন্ট</span>
					</a>
				{:else}
					<a href="/auth/login" onclick={() => (isMobileDrawerOpen = false)} class={drawerNavClass(activeTab === 'account')}>
						<User class="w-5 h-5 shrink-0 {activeTab === 'account' ? 'text-[#5845eb]' : 'text-slate-400'}" />
						<span>লগইন / রেজিস্টার</span>
					</a>
				{/if}
			</div>

			<!-- Categories -->
			<div class="px-3 pb-3">
				<div class="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3.5 pt-2 pb-1.5 flex items-center gap-2">
					<LayoutGrid class="w-3 h-3" />
					ক্যাটাগরি সমূহ
				</div>
				<div class="space-y-0.5">
					{#each navCategories as cat}
						{@const IconComp = getCategoryIconComponent(cat.icon)}
						<a
							href="/categories/{cat.slug}"
							onclick={() => (isMobileDrawerOpen = false)}
							class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#5845eb] transition-colors group/cat"
						>
							<div class="flex items-center gap-2.5">
								{#if IconComp}
									<IconComp class="w-4 h-4 text-slate-400 group-hover/cat:text-[#5845eb] transition-colors shrink-0" />
								{:else if cat.icon && cat.icon.length <= 4}
									<span class="text-base shrink-0">{cat.icon}</span>
								{:else}
									<LayoutGrid class="w-4 h-4 text-slate-400 shrink-0" />
								{/if}
								<span>{cat.nameBn || cat.name}</span>
							</div>
							{#if cat.productsCount && cat.productsCount > 0}
								<span class="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full font-semibold">
									{cat.productsCount}
								</span>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		</div>

		<!-- Drawer Footer -->
		<div class="p-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
			<a
				href="tel:{storeConfig?.hotlinePhone || '0156007230'}"
				class="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-[#5845eb] transition-colors"
			>
				<PhoneCall class="w-4 h-4 text-[#5845eb] shrink-0" />
				<span>হটলাইন: <strong class="font-mono">{storeConfig?.hotlinePhone || '0156007230'}</strong></span>
			</a>
			<div class="text-[11px] text-slate-400 mt-1 ml-6">সকাল ৯টা – রাত ১০টা</div>
		</div>
	</aside>
{/if}

<!-- Mobile Bottom Navigation Bar -->
<nav
	class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] font-['Anek_Bangla',sans-serif]"
	style="padding-bottom: env(safe-area-inset-bottom, 0px);"
>
	<div class="flex items-stretch justify-around px-2">

		<!-- হোম -->
		<a
			href="/"
			class="flex flex-col items-center justify-center gap-0.5 min-h-[56px] flex-1 relative transition-colors
				{activeTab === 'home' ? 'text-[#5845eb]' : 'text-slate-500'}"
		>
			{#if activeTab === 'home'}
				<span class="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-b-full bg-[#5845eb]"></span>
			{/if}
			<div class="p-1 rounded-xl transition-colors {activeTab === 'home' ? 'bg-indigo-50' : ''}">
				<Home class="w-5 h-5 {activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}" />
			</div>
			<span class="text-[10px] font-bold leading-none">হোম</span>
		</a>

		<!-- ক্যাটাগরি -->
		<button
			type="button"
			onclick={() => (isMobileDrawerOpen = true)}
			class="flex flex-col items-center justify-center gap-0.5 min-h-[56px] flex-1 relative transition-colors cursor-pointer
				{activeTab === 'categories' || activeTab === 'products' ? 'text-[#5845eb]' : 'text-slate-500'}"
		>
			{#if activeTab === 'categories' || activeTab === 'products'}
				<span class="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-b-full bg-[#5845eb]"></span>
			{/if}
			<div class="p-1 rounded-xl transition-colors {activeTab === 'categories' || activeTab === 'products' ? 'bg-indigo-50' : ''}">
				<LayoutGrid class="w-5 h-5 {activeTab === 'categories' || activeTab === 'products' ? 'stroke-[2.5]' : 'stroke-[1.8]'}" />
			</div>
			<span class="text-[10px] font-bold leading-none">ক্যাটাগরি</span>
		</button>

		<!-- কার্ট (Center / Featured) -->
		<button
			type="button"
			onclick={() => cart.toggleCart()}
			class="flex flex-col items-center justify-center gap-0.5 min-h-[56px] flex-1 relative cursor-pointer text-slate-500 hover:text-pink-600 transition-colors"
			aria-label="কার্ট"
		>
			<div class="relative">
				<div class="p-2 rounded-2xl {cart.count > 0 ? 'bg-rose-50' : ''} transition-colors">
					<ShoppingCart class="w-5 h-5 {cart.count > 0 ? 'text-rose-500 stroke-[2.5]' : 'stroke-[1.8]'}" />
				</div>
				{#if cart.count > 0}
					<span class="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center leading-none shadow-xs">
						{cart.count}
					</span>
				{/if}
			</div>
			<span class="text-[10px] font-bold leading-none {cart.count > 0 ? 'text-rose-500' : ''}">কার্ট</span>
		</button>

		<!-- একাউন্ট -->
		<a
			href={user ? '/account' : '/auth/login'}
			class="flex flex-col items-center justify-center gap-0.5 min-h-[56px] flex-1 relative transition-colors
				{activeTab === 'account' ? 'text-[#5845eb]' : 'text-slate-500'}"
		>
			{#if activeTab === 'account'}
				<span class="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-b-full bg-[#5845eb]"></span>
			{/if}
			<div class="p-1 rounded-xl transition-colors {activeTab === 'account' ? 'bg-indigo-50' : ''}">
				{#if user?.image}
					<img src={user.image} alt={user.name || ''} class="w-5 h-5 rounded-full object-cover" />
				{:else}
					<User class="w-5 h-5 {activeTab === 'account' ? 'stroke-[2.5]' : 'stroke-[1.8]'}" />
				{/if}
			</div>
			<span class="text-[10px] font-bold leading-none">{user ? 'একাউন্ট' : 'লগইন'}</span>
		</a>
	</div>
</nav>
