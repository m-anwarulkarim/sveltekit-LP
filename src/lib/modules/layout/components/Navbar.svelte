<script lang="ts">
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { Button, Input, Badge } from '#lib/components/ui';
	import {
		Globe,
		Search,
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
		LogOut,
		Flame
	} from 'lucide-svelte';

	import SearchAutocomplete from './SearchAutocomplete.svelte';

	interface Props {
		user: { name?: string; email?: string; image?: string | null } | null;
		onOpenAuth: () => void;
	}

	let { user, onOpenAuth }: Props = $props();

	// State
	let searchQuery = $state('');
	let isMobileDrawerOpen = $state(false);
	let isCategoryDropdownOpen = $state(false);
	let currentLang = $state<'bn' | 'en'>('bn');
	let activeMobileTab = $state<'home' | 'categories' | 'cart' | 'account'>('home');
	let activeCategoryChip = $state('সব');

	// Category Chips matching Screenshot 2
	const CATEGORY_CHIPS = [
		'সব',
		'ফুল',
		'শাক - সবজি',
		'করলা-সিম-বরবটি',
		'কম্বো প্যাক',
		'ফলমূল',
		'গার্ডেনিং টুলস',
		'অর্গানিক সার'
	];

	// All Categories List for Dropdown / Drawer
	const ALL_CATEGORIES = [
		{ name: 'ফুল বীজ ও চারা', count: 42, icon: '🌸' },
		{ name: 'শাক ও সবজি বীজ', count: 68, icon: '🥬' },
		{ name: 'করলা, সিম ও বরবটি', count: 24, icon: '🥒' },
		{ name: 'ফলমূল ও বাগান গাছ', count: 35, icon: '🍓' },
		{ name: 'স্পেশাল কম্বো প্যাক', count: 12, icon: '🎁' },
		{ name: 'গার্ডেনিং ও কৃষি টুলস', count: 19, icon: '🌱' },
		{ name: 'জৈব ও ভার্মিকম্পোস্ট সার', count: 15, icon: '🌾' }
	];

	function handleSearch(e: SubmitEvent) {
		e.preventDefault();
		if (!searchQuery.trim()) return;
		const el = document.getElementById('products');
		if (el) el.scrollIntoView({ behavior: 'smooth' });
	}

	function scrollToSection(id: string) {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		}
		isMobileDrawerOpen = false;
	}
</script>

<header class="w-full bg-white font-['Hind_Siliguri',sans-serif] selection:bg-[#5845eb]/20 selection:text-[#5845eb] border-b border-slate-100 shadow-xs relative z-40">
	
	<!-- 1. Top Announcement Bar (Dashboard Theme: Purple Gradient) -->
	<div class="bg-gradient-to-r from-[#4936d6] via-[#5845eb] to-[#7c3aed] text-white text-xs sm:text-sm font-bold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-xs">
		<span class="inline-block animate-bounce">🚚</span>
		<span>৳৬০০+ অর্ডার করলেই ডেলিভারি সম্পূর্ণ ফ্রি!</span>
	</div>

	<!-- 2. Main Header Row (Desktop & Mobile) -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
		<div class="flex items-center justify-between gap-3 sm:gap-6">
			
			<!-- Left: Mobile Hamburger & Brand Logo -->
			<div class="flex items-center gap-2.5 sm:gap-4 shrink-0">
				<!-- Mobile Hamburger Icon -->
				<button
					type="button"
					onclick={() => (isMobileDrawerOpen = true)}
					class="md:hidden p-2 -ml-1 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
					aria-label="Open Mobile Menu"
				>
					<Menu class="w-6 h-6 stroke-[2.5]" />
				</button>

				<!-- Brand Identity -->
				<a href="/" class="flex items-center gap-2.5 group">
					<div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5845eb] via-[#7c3aed] to-[#9333ea] p-[1.5px] shadow-sm shadow-indigo-600/20 group-hover:scale-105 transition-transform shrink-0">
						<div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
							<Flame class="w-5 h-5 text-[#5845eb]" />
						</div>
					</div>
					<div class="flex flex-col">
						<div class="flex items-center gap-1.5 leading-tight">
							<span class="font-black text-lg sm:text-xl text-slate-900 font-['Outfit'] tracking-tight">
								AURA
							</span>
							<span class="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-[#5845eb] border border-indigo-200">
								ORIGINAL
							</span>
						</div>
						<span class="text-[10.5px] text-slate-500 font-medium -mt-0.5 hidden xs:block">
							Next-Gen E-Commerce
						</span>
					</div>
				</a>
			</div>

			<!-- Center: Wide Search Bar (Desktop) -->
			<div class="hidden md:flex flex-1 max-w-2xl mx-4">
				<SearchAutocomplete
					placeholder="বীজ বা পছন্দের পণ্য খুঁজুন... (যেমন: oil, মরিচ, noodles)"
					onSearch={(q) => {
						const el = document.getElementById('products');
						if (el) el.scrollIntoView({ behavior: 'smooth' });
					}}
				/>
			</div>

			<!-- Right Actions: Account, Cart & Language Selector -->
			<div class="flex items-center gap-2 sm:gap-4 shrink-0">
				
				<!-- 1. Account & Orders (Desktop) -->
				{#if user}
					<a
						href="/account"
						class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
					>
						<div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb] shrink-0">
							<User class="w-4 h-4 stroke-[2.5]" />
						</div>
						<div class="flex flex-col leading-tight">
							<span class="text-[10px] text-slate-400 font-medium">প্রোফাইল</span>
							<span class="text-xs font-bold text-slate-800 max-w-[90px] truncate">{user.name || 'আমার একাউন্ট'}</span>
						</div>
					</a>
				{:else}
					<button
						type="button"
						onclick={onOpenAuth}
						class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left cursor-pointer group"
					>
						<div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 group-hover:bg-[#5845eb] group-hover:text-white flex items-center justify-center text-[#5845eb] transition-colors shrink-0">
							<User class="w-4 h-4 stroke-[2.5]" />
						</div>
						<div class="flex flex-col leading-tight">
							<span class="text-[10.5px] text-slate-400 font-medium">লগইন করুন</span>
							<span class="text-xs font-black text-slate-800 group-hover:text-[#5845eb] transition-colors">একাউন্ট ও অর্ডার</span>
						</div>
					</button>
				{/if}

				<!-- 2. Cart Pill Button -->
				<button
					type="button"
					onclick={() => cart.toggleCart()}
					class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-pink-50/80 hover:bg-pink-100/80 text-pink-600 border border-pink-200/90 shadow-2xs transition-all cursor-pointer group active:scale-95"
					aria-label="View Cart"
				>
					<div class="relative flex items-center justify-center">
						<ShoppingCart class="w-4 h-4 text-pink-600 stroke-[2.5] group-hover:scale-110 transition-transform" />
						{#if cart.count > 0}
							<span class="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-xs">
								{cart.count}
							</span>
						{/if}
					</div>
					<span class="text-xs font-black tracking-wide hidden xs:inline">কার্ট</span>
				</button>

				<!-- 3. Language Selector (Hover reveals Bangla + English with Globe Icon) -->
				<div class="relative group">
					<button
						type="button"
						class="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-2xl border border-slate-200/90 hover:border-[#5845eb] bg-white hover:bg-indigo-50/40 text-slate-700 hover:text-[#5845eb] text-xs font-bold transition-all shadow-2xs cursor-pointer"
						aria-label="Change Language"
					>
						<Globe class="w-4 h-4 text-[#5845eb] stroke-[2.2]" />
						<span class="font-mono uppercase text-[11px] font-bold">
							{currentLang === 'bn' ? 'BN' : 'EN'}
						</span>
						<ChevronDown class="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
					</button>

					<!-- Floating Hover Dropdown Menu -->
					<div class="absolute right-0 top-full pt-1.5 w-44 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50">
						<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-1.5 space-y-1">
							<!-- Bangla Option -->
							<button
								type="button"
								onclick={() => (currentLang = 'bn')}
								class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer {currentLang === 'bn'
									? 'bg-indigo-50 text-[#5845eb]'
									: 'text-slate-700 hover:bg-slate-50'}"
							>
								<div class="flex items-center gap-2">
									<span class="text-base leading-none">🇧🇩</span>
									<span>বাংলা (Bangla)</span>
								</div>
								{#if currentLang === 'bn'}
									<Check class="w-3.5 h-3.5 text-[#5845eb] stroke-[3]" />
								{/if}
							</button>

							<!-- English Option -->
							<button
								type="button"
								onclick={() => (currentLang = 'en')}
								class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer {currentLang === 'en'
									? 'bg-indigo-50 text-[#5845eb]'
									: 'text-slate-700 hover:bg-slate-50'}"
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
				</div>
			</div>
		</div>

		<!-- Mobile Search Row (Matches Screenshot 2) -->
		<div class="mt-2.5 md:hidden">
			<SearchAutocomplete
				placeholder="বীজ বা পণ্য খুঁজুন..."
				onSearch={(q) => {
					const el = document.getElementById('products');
					if (el) el.scrollIntoView({ behavior: 'smooth' });
				}}
			/>
		</div>
	</div>

	<!-- 3. Bottom Desktop Category Navigation Bar (Exact Match to Screenshot 1) -->
	<div class="hidden md:block border-t border-slate-100 bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-11">
				
				<!-- Left: "সকল ক্যাটাগরি" Dropdown Button -->
				<div class="relative">
					<button
						type="button"
						onclick={() => (isCategoryDropdownOpen = !isCategoryDropdownOpen)}
						class="flex items-center gap-2 text-xs font-black tracking-wide text-slate-800 hover:text-[#5845eb] transition-colors py-2 cursor-pointer group"
					>
						<LayoutGrid class="w-4 h-4 text-pink-600 group-hover:text-[#5845eb] transition-colors" />
						<span>সকল ক্যাটাগরি</span>
						<ChevronDown class="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
					</button>

					<!-- Category Dropdown Menu -->
					{#if isCategoryDropdownOpen}
						<div class="absolute left-0 top-full pt-1 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
							<div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-2 space-y-1">
								{#each ALL_CATEGORIES as cat}
									<a
										href="#products"
										onclick={() => (isCategoryDropdownOpen = false)}
										class="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#5845eb] hover:bg-indigo-50/60 transition-colors"
									>
										<div class="flex items-center gap-2.5">
											<span class="text-sm">{cat.icon}</span>
											<span>{cat.name}</span>
										</div>
										<span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
											{cat.count}
										</span>
									</a>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Divider -->
				<div class="h-4 w-px bg-slate-200 mx-3"></div>

				<!-- Center / Right Links with Icons (Exact match to Screenshot 1) -->
				<nav class="flex items-center gap-6 flex-1">
					<a
						href="/"
						class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#5845eb] transition-colors group"
					>
						<Home class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] transition-colors" />
						<span>হোম</span>
					</a>

					<a
						href="#products"
						class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#5845eb] transition-colors group"
					>
						<Package class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] transition-colors" />
						<span>সকল পণ্য</span>
					</a>

					<a
						href="#products"
						class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#5845eb] transition-colors group"
					>
						<LayoutGrid class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] transition-colors" />
						<span>ক্যাটাগরি</span>
					</a>

					{#if user}
						<a
							href="/account"
							class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#5845eb] transition-colors group"
						>
							<User class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] transition-colors" />
							<span>একাউন্ট</span>
						</a>
					{:else}
						<button
							type="button"
							onclick={onOpenAuth}
							class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#5845eb] transition-colors cursor-pointer group"
						>
							<User class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] transition-colors" />
							<span>একাউন্ট</span>
						</button>
					{/if}

					<a
						href="#faq"
						class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#5845eb] transition-colors group"
					>
						<HelpCircle class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] transition-colors" />
						<span>সাহায্য</span>
					</a>
				</nav>

				<!-- Hot Support Line / Right Quick Contact -->
				<div class="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500">
					<PhoneCall class="w-3.5 h-3.5 text-[#5845eb]" />
					<span>হটলাইন: <strong class="text-slate-900 font-mono">01860-229546</strong></span>
				</div>
			</div>
		</div>
	</div>

	<!-- 4. Mobile Category Chips (Horizontally Scrollable - Exact Match to Screenshot 2) -->
	<div class="md:hidden border-t border-slate-100 bg-slate-50/50 py-2 px-3 overflow-x-auto no-scrollbar flex items-center gap-2">
		{#each CATEGORY_CHIPS as chip}
			<button
				type="button"
				onclick={() => {
					activeCategoryChip = chip;
					scrollToSection('products');
				}}
				class="px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-2xs cursor-pointer {activeCategoryChip === chip
					? 'bg-[#5845eb] text-white border-[#5845eb] shadow-sm shadow-indigo-600/20'
					: 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100'}"
			>
				{chip}
			</button>
		{/each}
	</div>
</header>

<!-- 5. Mobile Slide-out Drawer (Categories, Links, Support) -->
{#if isMobileDrawerOpen}
	<!-- Backdrop -->
	<button
		type="button"
		onclick={() => (isMobileDrawerOpen = false)}
		class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden cursor-default animate-in fade-in"
		aria-label="Close Mobile Drawer"
	></button>

	<!-- Drawer Content -->
	<aside class="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 md:hidden shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200 font-['Hind_Siliguri',sans-serif]">
		<div>
			<!-- Drawer Header -->
			<div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-xl bg-[#5845eb] flex items-center justify-center text-white">
						<Flame class="w-4 h-4" />
					</div>
					<span class="font-black text-slate-900 text-base font-['Outfit']">AURA</span>
				</div>
				<button
					type="button"
					onclick={() => (isMobileDrawerOpen = false)}
					class="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer"
					aria-label="Close"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Drawer Navigation Links -->
			<div class="p-3 space-y-1">
				<a
					href="/"
					onclick={() => (isMobileDrawerOpen = false)}
					class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-[#5845eb] transition-colors"
				>
					<Home class="w-4 h-4 text-slate-400" />
					<span>হোম পেইজ</span>
				</a>

				<a
					href="#products"
					onclick={() => scrollToSection('products')}
					class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-[#5845eb] transition-colors"
				>
					<Package class="w-4 h-4 text-slate-400" />
					<span>সকল পণ্য</span>
				</a>

				<a
					href="#faq"
					onclick={() => scrollToSection('faq')}
					class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-[#5845eb] transition-colors"
				>
					<HelpCircle class="w-4 h-4 text-slate-400" />
					<span>সাহায্য ও সাধারণ প্রশ্ন (FAQ)</span>
				</a>

				{#if user}
					<a
						href="/account"
						onclick={() => (isMobileDrawerOpen = false)}
						class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-[#5845eb] transition-colors"
					>
						<User class="w-4 h-4 text-slate-400" />
						<span>আমার একাউন্ট</span>
					</a>
				{:else}
					<button
						type="button"
						onclick={() => {
							isMobileDrawerOpen = false;
							onOpenAuth();
						}}
						class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-[#5845eb] transition-colors cursor-pointer text-left"
					>
						<User class="w-4 h-4 text-slate-400" />
						<span>লগইন / রেজিস্টার করুন</span>
					</button>
				{/if}
			</div>

			<!-- Category Section in Drawer -->
			<div class="px-3 pt-2">
				<div class="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3.5 py-1">
					ক্যাটাগরি সমূহ
				</div>
				<div class="space-y-0.5 mt-1">
					{#each ALL_CATEGORIES as cat}
						<a
							href="#products"
							onclick={() => scrollToSection('products')}
							class="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
						>
							<div class="flex items-center gap-2">
								<span>{cat.icon}</span>
								<span>{cat.name}</span>
							</div>
							<span class="text-[10px] font-bold text-slate-400">({cat.count})</span>
						</a>
					{/each}
				</div>
			</div>
		</div>

		<!-- Drawer Footer Contact -->
		<div class="p-4 border-t border-slate-100 bg-slate-50/50">
			<div class="text-xs text-slate-500 font-medium">
				হটলাইন: <strong class="text-slate-900 font-mono font-bold">01860-229546</strong>
			</div>
			<div class="text-[11px] text-slate-400 mt-1">
				সকাল ৯টা - রাত ১০টা পর্যন্ত খোলা
			</div>
		</div>
	</aside>
{/if}

<!-- 6. Mobile Bottom Navigation Bar (Exact Match to Red Box in Screenshot 2) -->
<nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-3 py-1.5 flex items-center justify-around font-['Hind_Siliguri',sans-serif]">
	
	<!-- 1. হোম (Home) -->
	<a
		href="/"
		onclick={() => (activeMobileTab = 'home')}
		class="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all {activeMobileTab === 'home'
			? 'text-[#5845eb] font-bold'
			: 'text-slate-500 hover:text-slate-800'}"
	>
		<Home class="w-5 h-5 {activeMobileTab === 'home' ? 'text-[#5845eb] stroke-[2.5]' : 'stroke-[1.8]'}" />
		<span class="text-[10.5px] mt-0.5 leading-none">হোম</span>
	</a>

	<!-- 2. ক্যাটাগরি (Categories) -->
	<button
		type="button"
		onclick={() => {
			activeMobileTab = 'categories';
			isMobileDrawerOpen = true;
		}}
		class="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer {activeMobileTab === 'categories'
			? 'text-[#5845eb] font-bold'
			: 'text-slate-500 hover:text-slate-800'}"
	>
		<LayoutGrid class="w-5 h-5 {activeMobileTab === 'categories' ? 'text-[#5845eb] stroke-[2.5]' : 'stroke-[1.8]'}" />
		<span class="text-[10.5px] mt-0.5 leading-none">ক্যাটাগরি</span>
	</button>

	<!-- 3. কার্ট (Cart) -->
	<button
		type="button"
		onclick={() => {
			activeMobileTab = 'cart';
			cart.toggleCart();
		}}
		class="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer relative {activeMobileTab === 'cart'
			? 'text-[#5845eb] font-bold'
			: 'text-slate-500 hover:text-slate-800'}"
	>
		<div class="relative">
			<ShoppingCart class="w-5 h-5 {activeMobileTab === 'cart' ? 'text-[#5845eb] stroke-[2.5]' : 'stroke-[1.8]'}" />
			{#if cart.count > 0}
				<span class="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-xs">
					{cart.count}
				</span>
			{/if}
		</div>
		<span class="text-[10.5px] mt-0.5 leading-none">কার্ট</span>
	</button>

	<!-- 4. একাউন্ট (Account) -->
	{#if user}
		<a
			href="/account"
			onclick={() => (activeMobileTab = 'account')}
			class="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all {activeMobileTab === 'account'
				? 'text-[#5845eb] font-bold'
				: 'text-slate-500 hover:text-slate-800'}"
		>
			<User class="w-5 h-5 {activeMobileTab === 'account' ? 'text-[#5845eb] stroke-[2.5]' : 'stroke-[1.8]'}" />
			<span class="text-[10.5px] mt-0.5 leading-none">একাউন্ট</span>
		</a>
	{:else}
		<button
			type="button"
			onclick={() => {
				activeMobileTab = 'account';
				onOpenAuth();
			}}
			class="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer {activeMobileTab === 'account'
				? 'text-[#5845eb] font-bold'
				: 'text-slate-500 hover:text-slate-800'}"
		>
			<User class="w-5 h-5 {activeMobileTab === 'account' ? 'text-[#5845eb] stroke-[2.5]' : 'stroke-[1.8]'}" />
			<span class="text-[10.5px] mt-0.5 leading-none">একাউন্ট</span>
		</button>
	{/if}
</nav>
