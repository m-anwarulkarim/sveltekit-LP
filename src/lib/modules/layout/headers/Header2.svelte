<script lang="ts">
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { page } from '$app/state';
	import {
		Search,
		User,
		ShoppingCart,
		Menu,
		X,
		Flame,
		ChevronRight,
		Phone,
		Sparkles
	} from 'lucide-svelte';
	import { DEFAULT_HEADER_DATA } from './data';
	import { CATEGORIES_DATA } from '#lib/modules/products/categories.data';

	interface Props {
		user?: { name?: string; email?: string; image?: string | null } | null;
		onOpenAuth?: () => void;
	}

	let { user = null, onOpenAuth = () => {} }: Props = $props();

	// Real dynamic categories and store config
	const navCategories = $derived.by(() => {
		const dbCats = page.data?.categories;
		if (Array.isArray(dbCats) && dbCats.length > 0) {
			return dbCats.map((c: any) => ({
				id: c.id,
				slug: c.slug,
				name: c.name,
				icon: c.icon || '📦'
			}));
		}
		return CATEGORIES_DATA;
	});

	const storeConfig = $derived(page.data?.storeConfig);

	let isMobileMenuOpen = $state(false);
	let isSearchOpen = $state(false);
	let searchQuery = $state('');

	function handleSearchSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!searchQuery.trim()) return;
		window.location.href = `/catalog/all-product?search=${encodeURIComponent(searchQuery.trim())}`;
		isSearchOpen = false;
	}
</script>

<!-- Header 2: Modern Minimalist Clean (Apple / Scandinavian Aesthetic) -->
<header class="w-full bg-white/90 backdrop-blur-xl font-['Anek_Bangla',sans-serif] border-b border-slate-200/80 sticky top-0 z-40 transition-all">
	<!-- 1. Sleek Top Micro-Ribbon -->
	<div class="bg-slate-950 text-slate-300 text-[11px] font-semibold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
		<span class="inline-flex items-center gap-1 text-purple-400 font-bold">
			<Sparkles class="w-3 h-3" />
			{DEFAULT_HEADER_DATA.announcementText}
		</span>
		<span class="text-slate-600 hidden sm:inline">|</span>
		<span class="hidden sm:inline text-slate-400">হটলাইন: {DEFAULT_HEADER_DATA.phoneHotline}</span>
	</div>

	<!-- 2. Main Navigation Bar -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
		<!-- Left: Mobile Menu Trigger & Desktop Nav Links -->
		<div class="flex items-center gap-3">
			<!-- Mobile Hamburger -->
			<button
				type="button"
				onclick={() => (isMobileMenuOpen = true)}
				class="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
				aria-label="Open Navigation Menu"
			>
				<Menu class="w-5 h-5" />
			</button>

			<!-- Desktop Nav Links -->
			<nav class="hidden lg:flex items-center gap-6 text-[13px] font-bold text-slate-700">
				{#each DEFAULT_HEADER_DATA.menuItems as item}
					<a
						href={item.href}
						class="hover:text-[#5845eb] transition-colors relative py-1 group flex items-center gap-1"
					>
						<span>{item.label}</span>
						{#if item.badge}
							<span class="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200/80">
								{item.badge}
							</span>
						{/if}
						<span class="absolute bottom-0 inset-x-0 h-0.5 bg-[#5845eb] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
					</a>
				{/each}
			</nav>
		</div>

		<!-- Center: Distinctive Brand Logo -->
		<a href="/" class="flex items-center gap-2.5 group">
			<div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#5845eb] via-[#7c3aed] to-[#9333ea] flex items-center justify-center text-white shadow-sm shadow-indigo-600/20 group-hover:scale-105 transition-transform">
				<Flame class="w-5 h-5" />
			</div>
			<div class="flex flex-col">
				<span class="font-black text-xl text-slate-900 tracking-tight font-['Outfit']">
					{DEFAULT_HEADER_DATA.brandName}
				</span>
			</div>
		</a>

		<!-- Right: Search, Account & Cart -->
		<div class="flex items-center gap-2 sm:gap-3 shrink-0">
			<!-- Search Trigger Button -->
			<button
				type="button"
				onclick={() => (isSearchOpen = !isSearchOpen)}
				class="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
				title="পণ্য খুঁজুন"
			>
				<Search class="w-4 h-4 text-slate-500" />
				<span class="hidden md:inline text-xs font-medium text-slate-400">পণ্য খুঁজুন...</span>
			</button>

			<!-- Account Button -->
			{#if user}
				<a
					href="/account"
					class="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all shadow-2xs"
				>
					<User class="w-4 h-4 text-[#5845eb]" />
					<span class="hidden md:inline text-xs font-bold text-slate-800 truncate max-w-[80px]">
						{user.name?.split(' ')[0] || 'প্রোফাইল'}
					</span>
				</a>
			{:else}
				<a
					href="/auth/login"
					class="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs"
					aria-label="লগইন করুন"
				>
					<User class="w-4 h-4 text-[#5845eb]" />
					<span class="hidden md:inline text-xs font-bold text-slate-800">লগইন</span>
				</a>
			{/if}

			<!-- Cart Button with Pill Badge & Total Amount -->
			<button
				type="button"
				onclick={() => cart.toggleCart()}
				class="h-10 px-3 sm:px-4 rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white flex items-center gap-2 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 shrink-0"
				aria-label="View Cart"
			>
				<div class="relative">
					<ShoppingCart class="w-4 h-4" />
					{#if cart.totalQuantity > 0}
						<span class="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
							{cart.totalQuantity}
						</span>
					{/if}
				</div>
				<span class="text-xs font-black hidden sm:inline">
					৳{cart.totalPrice}
				</span>
			</button>
		</div>
	</div>

	<!-- 3. Expandable Search Bar Drawer (Desktop & Mobile) -->
	{#if isSearchOpen}
		<div class="border-t border-slate-100 bg-slate-50/95 px-4 sm:px-6 lg:px-8 py-3 animate-in slide-in-from-top-2 duration-150">
			<form onsubmit={handleSearchSubmit} class="max-w-3xl mx-auto flex items-center gap-2">
				<div class="relative flex-1">
					<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="search"
						bind:value={searchQuery}
						placeholder="পছন্দের পণ্য, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন..."
						class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5845eb] shadow-2xs transition-all"
						autofocus
					/>
				</div>
				<button
					type="submit"
					class="px-5 py-2.5 rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
				>
					সার্চ
				</button>
				<button
					type="button"
					onclick={() => (isSearchOpen = false)}
					class="p-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-600 transition-colors cursor-pointer"
					title="বন্ধ করুন"
				>
					<X class="w-4 h-4" />
				</button>
			</form>
		</div>
	{/if}

	<!-- 4. Mobile Drawer Navigation -->
	{#if isMobileMenuOpen}
		<!-- Backdrop -->
		<div
			class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
			onclick={() => (isMobileMenuOpen = false)}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && (isMobileMenuOpen = false)}
		></div>

		<!-- Drawer Content -->
		<div class="fixed top-0 left-0 bottom-0 z-50 w-[300px] bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
			<!-- Drawer Header -->
			<div class="p-5 border-b border-slate-100 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-xl bg-[#5845eb] text-white flex items-center justify-center">
						<Flame class="w-4 h-4" />
					</div>
					<span class="font-black text-lg text-slate-900 font-['Outfit']">{DEFAULT_HEADER_DATA.brandName}</span>
				</div>
				<button
					type="button"
					onclick={() => (isMobileMenuOpen = false)}
					class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Drawer Nav Links -->
			<div class="p-5 space-y-5 flex-1">
				<div class="space-y-1">
					<span class="text-[10px] font-black uppercase tracking-wider text-slate-400">ন্যাভিগেশন মেনু</span>
					<div class="space-y-1 pt-1">
						{#each DEFAULT_HEADER_DATA.menuItems as item}
							<a
								href={item.href}
								onclick={() => (isMobileMenuOpen = false)}
								class="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#5845eb] hover:bg-indigo-50/50 transition-colors"
							>
								<span>{item.label}</span>
								{#if item.badge}
									<span class="px-2 py-0.5 rounded text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-200">
										{item.badge}
									</span>
								{:else}
									<ChevronRight class="w-3.5 h-3.5 text-slate-400" />
								{/if}
							</a>
						{/each}
					</div>
				</div>

				<!-- Category Shortcuts in Drawer -->
				<div class="space-y-1 pt-2 border-t border-slate-100">
					<span class="text-[10px] font-black uppercase tracking-wider text-slate-400">পপুলার ক্যাটাগরি</span>
					<div class="grid grid-cols-2 gap-2 pt-2">
						{#each navCategories.slice(0, 8) as cat}
							<a
								href="/categories/{cat.slug}"
								onclick={() => (isMobileMenuOpen = false)}
								class="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 text-[11px] font-bold text-slate-700 hover:text-[#5845eb] truncate transition-colors text-center"
							>
								{cat.name}
							</a>
						{/each}
					</div>
				</div>
			</div>

			<!-- Drawer Footer Contact -->
			<div class="p-5 bg-slate-50 border-t border-slate-100 space-y-2 text-xs">
				<div class="flex items-center gap-2 text-slate-600 font-medium">
					<Phone class="w-3.5 h-3.5 text-[#5845eb]" />
					<span>হটলাইন: {storeConfig?.hotlinePhone || DEFAULT_HEADER_DATA.phoneHotline}</span>
				</div>
				<p class="text-[10.5px] text-slate-400">© 2026 {DEFAULT_HEADER_DATA.brandName}. All rights reserved.</p>
			</div>
		</div>
	{/if}
</header>
