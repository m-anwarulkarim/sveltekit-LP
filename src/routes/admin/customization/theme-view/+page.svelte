<script lang="ts">
	import {
		ArrowLeft,
		AlertTriangle,
		Clock,
		RotateCcw,
		Save,
		Check,
		Palette,
		LayoutGrid,
		Monitor,
		PenTool,
		Search,
		Globe,
		CheckCircle2,
		Sparkles
	} from 'lucide-svelte';

	let activeTab = $state<'appearance' | 'theme_views' | 'page_views' | 'theme_designs'>('appearance');

	// Theme Colors State (from Screenshot 5)
	let primaryColor = $state('#e8007c');
	let secondaryColor = $state('#00c153');
	let tertiaryColor = $state('#ff00ae');

	// Dashboard Style State
	let dashboardStyle = $state<'classic' | 'professional'>('professional');

	// Search Hints State
	let searchKeywords = $state('lipstick, foundation, face serum, moisturizer');

	// Checkout Language State
	let checkoutLanguage = $state<'english' | 'bangla' | 'italian'>('bangla');

	// Theme Preset State
	let selectedThemePreset = $state<'modern' | 'minimal' | 'dark' | 'vibrant'>('modern');

	// Page Layout Toggles
	let showHomeCarousel = $state(true);
	let showHomeBanner = $state(true);
	let showStickyCart = $state(true);
	let productGridCols = $state(4);

	// Font Family
	let selectedFont = $state('Plus Jakarta Sans');
	let buttonRadius = $state('rounded-2xl');

	let toastMessage = $state<string | null>(null);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			toastMessage = null;
		}, 3000);
	}

	function handleSave() {
		showToast('থিম কাস্টমাইজেশন সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
	}

	function handleResetDefaults() {
		if (confirm('আপনি কি ডিফল্ট সেটিংসে ফিরে যেতে চান?')) {
			primaryColor = '#e8007c';
			secondaryColor = '#00c153';
			tertiaryColor = '#ff00ae';
			dashboardStyle = 'professional';
			checkoutLanguage = 'bangla';
			searchKeywords = 'lipstick, foundation, face serum, moisturizer';
			showToast('ডিফল্ট সেটিংস সফলভাবে রিসেট হয়েছে');
		}
	}
</script>

<svelte:head>
	<title>Theme View Customization - Customization - AURA Admin</title>
</svelte:head>

<!-- Toast Alert -->
{#if toastMessage}
	<div class="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
		<CheckCircle2 class="w-4 h-4 text-emerald-400" />
		<span>{toastMessage}</span>
	</div>
{/if}

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
	<!-- Top Action Bar (Exact Match to Screenshot 5) -->
	<div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
		<!-- Left: Back Button & Info Badges -->
		<div class="flex items-center flex-wrap gap-2 sm:gap-3">
			<a
				href="/admin"
				class="w-9 h-9 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-2xs transition-colors shrink-0"
				title="ফিরে যান"
			>
				<ArrowLeft class="w-4 h-4" />
			</a>

			<!-- Cache warning banner -->
			<div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
				<AlertTriangle class="w-3.5 h-3.5 text-amber-600 shrink-0" />
				<span>Note: Changes may take 5-10 mins to reflect due to caching</span>
			</div>

			<!-- Last saved badge -->
			<div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
				<Clock class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
				<span>Last saved: Oct 26, 2026, 7:05:46 PM</span>
			</div>
		</div>

		<!-- Right: Reset & Save Buttons (Matches Screenshot 5) -->
		<div class="flex items-center gap-2.5 shrink-0">
			<!-- Reset Defaults Button -->
			<button
				type="button"
				onclick={handleResetDefaults}
				class="rounded-xl border border-rose-300 bg-white hover:bg-rose-50/50 text-rose-600 px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
			>
				<RotateCcw class="w-3.5 h-3.5" />
				<span>Reset Defaults</span>
			</button>

			<!-- Save Settings Button (Blue solid) -->
			<button
				type="button"
				onclick={handleSave}
				class="rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
			>
				<Check class="w-4 h-4 stroke-[2.5]" />
				<span>Save Settings</span>
			</button>
		</div>
	</div>

	<!-- 4 Navigation Tabs (Appearance & Colors, Theme Views, Page Views, Theme Designs) -->
	<div class="border-b border-slate-200/80">
		<nav class="flex items-center gap-6 overflow-x-auto no-scrollbar">
			<button
				type="button"
				onclick={() => (activeTab = 'appearance')}
				class="pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap {activeTab === 'appearance'
					? 'border-[#2563eb] text-[#2563eb]'
					: 'border-transparent text-slate-500 hover:text-slate-800'}"
			>
				<Palette class="w-4 h-4" />
				<span>Appearance & Colors</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'theme_views')}
				class="pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap {activeTab === 'theme_views'
					? 'border-[#2563eb] text-[#2563eb]'
					: 'border-transparent text-slate-500 hover:text-slate-800'}"
			>
				<LayoutGrid class="w-4 h-4" />
				<span>Theme Views</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'page_views')}
				class="pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap {activeTab === 'page_views'
					? 'border-[#2563eb] text-[#2563eb]'
					: 'border-transparent text-slate-500 hover:text-slate-800'}"
			>
				<Monitor class="w-4 h-4" />
				<span>Page Views</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'theme_designs')}
				class="pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap {activeTab === 'theme_designs'
					? 'border-[#2563eb] text-[#2563eb]'
					: 'border-transparent text-slate-500 hover:text-slate-800'}"
			>
				<PenTool class="w-4 h-4" />
				<span>Theme Designs</span>
			</button>
		</nav>
	</div>

	<!-- TAB 1: Appearance & Colors (Exact 4 Cards from Screenshot 5) -->
	{#if activeTab === 'appearance'}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
			<!-- CARD 1: THEME BRAND COLORS (Top Left) -->
			<div class="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-2xs">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
						<Palette class="w-4 h-4" />
					</div>
					<div>
						<h3 class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight uppercase">
							THEME BRAND COLORS
						</h3>
						<p class="text-[11px] text-slate-500">
							Customize primary, secondary, and tertiary brand colors for your storefront.
						</p>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
					<!-- Primary Color -->
					<div>
						<label class="block text-[11px] font-bold text-slate-600 mb-1.5">Primary Color</label>
						<div class="flex items-center border border-slate-200/90 rounded-2xl p-1.5 bg-slate-50/70 shadow-2xs">
							<input
								type="color"
								bind:value={primaryColor}
								class="w-7 h-7 rounded-xl border-0 p-0 cursor-pointer shrink-0"
							/>
							<input
								type="text"
								bind:value={primaryColor}
								class="w-full bg-transparent px-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
							/>
						</div>
					</div>

					<!-- Secondary Color -->
					<div>
						<label class="block text-[11px] font-bold text-slate-600 mb-1.5">Secondary Color</label>
						<div class="flex items-center border border-slate-200/90 rounded-2xl p-1.5 bg-slate-50/70 shadow-2xs">
							<input
								type="color"
								bind:value={secondaryColor}
								class="w-7 h-7 rounded-xl border-0 p-0 cursor-pointer shrink-0"
							/>
							<input
								type="text"
								bind:value={secondaryColor}
								class="w-full bg-transparent px-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
							/>
						</div>
					</div>

					<!-- Tertiary Color -->
					<div>
						<label class="block text-[11px] font-bold text-slate-600 mb-1.5">Tertiary Color</label>
						<div class="flex items-center border border-slate-200/90 rounded-2xl p-1.5 bg-slate-50/70 shadow-2xs">
							<input
								type="color"
								bind:value={tertiaryColor}
								class="w-7 h-7 rounded-xl border-0 p-0 cursor-pointer shrink-0"
							/>
							<input
								type="text"
								bind:value={tertiaryColor}
								class="w-full bg-transparent px-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- CARD 2: DASHBOARD STYLE (Top Right) -->
			<div class="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-2xs">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
						<LayoutGrid class="w-4 h-4" />
					</div>
					<div>
						<h3 class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight uppercase">
							DASHBOARD STYLE
						</h3>
						<p class="text-[11px] text-slate-500">
							Choose the navigation menu style for your vendor dashboard.
						</p>
					</div>
				</div>

				<div class="space-y-3 pt-2">
					<!-- Option 1: Classic Dashboard -->
					<label
						class="flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer {dashboardStyle === 'classic'
							? 'border-blue-500 bg-blue-50/40 shadow-xs'
							: 'border-slate-200/90 hover:bg-slate-50'}"
					>
						<input
							type="radio"
							name="dashboard_style"
							value="classic"
							bind:group={dashboardStyle}
							class="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
						/>
						<div>
							<h4 class="text-xs font-bold text-slate-900">Classic Dashboard</h4>
							<p class="text-[11px] text-slate-500">Traditional sidebar layout navigation</p>
						</div>
					</label>

					<!-- Option 2: Professional Dashboard (Selected) -->
					<label
						class="flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer {dashboardStyle === 'professional'
							? 'border-blue-500 bg-blue-50/30 shadow-xs ring-1 ring-blue-500/20'
							: 'border-slate-200/90 hover:bg-slate-50'}"
					>
						<input
							type="radio"
							name="dashboard_style"
							value="professional"
							bind:group={dashboardStyle}
							class="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
						/>
						<div>
							<h4 class="text-xs font-bold text-slate-900">Professional Dashboard</h4>
							<p class="text-[11px] text-slate-500">Modernized, compact workspace navigation</p>
						</div>
					</label>
				</div>
			</div>

			<!-- CARD 3: SEARCH HINTS (Bottom Left) -->
			<div class="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-2xs">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
						<Search class="w-4 h-4" />
					</div>
					<div>
						<h3 class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight uppercase">
							SEARCH HINTS
						</h3>
						<p class="text-[11px] text-slate-500">
							Default keywords shown in the shop search input header.
						</p>
					</div>
				</div>

				<div class="pt-2">
					<label class="block text-[11px] font-bold text-slate-600 mb-1.5">
						Keywords (comma separated)
					</label>
					<textarea
						bind:value={searchKeywords}
						rows="3"
						class="w-full bg-slate-50/70 border border-slate-200/90 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:border-[#2563eb] focus:bg-white shadow-2xs transition-all"
					></textarea>
				</div>
			</div>

			<!-- CARD 4: ORDER CHECKOUT LANGUAGE (Bottom Right) -->
			<div class="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-2xs">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
						<Globe class="w-4 h-4" />
					</div>
					<div>
						<h3 class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight uppercase">
							ORDER CHECKOUT LANGUAGE
						</h3>
						<p class="text-[11px] text-slate-500">
							Select customer checkout display language for this store.
						</p>
					</div>
				</div>

				<div class="flex items-center flex-wrap gap-3 pt-2">
					<!-- English -->
					<button
						type="button"
						onclick={() => (checkoutLanguage = 'english')}
						class="px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer {checkoutLanguage === 'english'
							? 'border-blue-500 bg-blue-50 text-blue-700 shadow-2xs'
							: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}"
					>
						<span class="w-2 h-2 rounded-full {checkoutLanguage === 'english' ? 'bg-blue-600' : 'bg-slate-300'}"></span>
						<span>English Checkout</span>
					</button>

					<!-- Bangla (Selected) -->
					<button
						type="button"
						onclick={() => (checkoutLanguage = 'bangla')}
						class="px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer {checkoutLanguage === 'bangla'
							? 'border-blue-500 bg-blue-50 text-blue-700 shadow-2xs'
							: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}"
					>
						<Check class="w-3.5 h-3.5 text-blue-600" />
						<span>Bangla Checkout</span>
					</button>

					<!-- Italian -->
					<button
						type="button"
						onclick={() => (checkoutLanguage = 'italian')}
						class="px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer {checkoutLanguage === 'italian'
							? 'border-blue-500 bg-blue-50 text-blue-700 shadow-2xs'
							: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}"
					>
						<span class="w-2 h-2 rounded-full {checkoutLanguage === 'italian' ? 'bg-blue-600' : 'bg-slate-300'}"></span>
						<span>Italian Checkout</span>
					</button>
				</div>
			</div>
		</div>
	{:else if activeTab === 'theme_views'}
		<!-- TAB 2: Theme Views -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
			{#each [
				{ id: 'modern', name: 'Modern Minimalist', desc: 'Clean white background with soft gradients', color: 'bg-white' },
				{ id: 'vibrant', name: 'Vibrant Magenta', desc: 'Bold e-commerce color accents with high conversions', color: 'bg-pink-50' },
				{ id: 'dark', name: 'Luxury Dark', desc: 'Deep black and obsidian with golden badges', color: 'bg-slate-900 text-white' },
				{ id: 'minimal', name: 'Nordic Clean', desc: 'Soft slate aesthetics with typography focus', color: 'bg-slate-100' }
			] as theme}
				<div
					class="p-5 rounded-3xl border transition-all cursor-pointer space-y-3 {selectedThemePreset === theme.id
						? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md bg-blue-50/20'
						: 'border-slate-200/90 bg-white hover:bg-slate-50'}"
					onclick={() => (selectedThemePreset = theme.id as any)}
				>
					<div class="h-24 rounded-2xl {theme.color} border border-slate-200/70 p-3 flex flex-col justify-between shadow-inner">
						<div class="flex items-center justify-between">
							<span class="w-3 h-3 rounded-full bg-blue-500"></span>
							{#if selectedThemePreset === theme.id}
								<span class="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-bold">Active</span>
							{/if}
						</div>
						<div class="w-16 h-2 rounded-full bg-slate-300/60"></div>
					</div>

					<div>
						<h4 class="text-xs font-bold text-slate-900">{theme.name}</h4>
						<p class="text-[11px] text-slate-500 mt-0.5">{theme.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	{:else if activeTab === 'page_views'}
		<!-- TAB 3: Page Views -->
		<div class="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-6 animate-in fade-in duration-150">
			<h3 class="text-sm font-bold text-slate-900 uppercase">স্টোরফ্রন্ট লেআউট কনফিগারেশন</h3>

			<div class="space-y-4">
				<label class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
					<div>
						<h4 class="text-xs font-bold text-slate-900">হোমপেজ হিরো ক্যারোসেল প্রদর্শন করুন</h4>
						<p class="text-[11px] text-slate-500">হোমপেজের উপরে স্লাইডার ব্যানার সক্রিয় থাকবে</p>
					</div>
					<input type="checkbox" bind:checked={showHomeCarousel} class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
				</label>

				<label class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
					<div>
						<h4 class="text-xs font-bold text-slate-900">প্রোমোশনাল ব্যানার গ্রিড</h4>
						<p class="text-[11px] text-slate-500">ক্যাটাগরি ব্যানারের গ্রিড ডিসপ্লে সক্ষম করুন</p>
					</div>
					<input type="checkbox" bind:checked={showHomeBanner} class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
				</label>

				<label class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
					<div>
						<h4 class="text-xs font-bold text-slate-900">স্টিকি ফ্লোটিং কার্ট বার</h4>
						<p class="text-[11px] text-slate-500">মোবাইল ব্রাউজারে নিচে অর্ডার কার্ট স্টিকি থাকবে</p>
					</div>
					<input type="checkbox" bind:checked={showStickyCart} class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
				</label>
			</div>
		</div>
	{:else}
		<!-- TAB 4: Theme Designs -->
		<div class="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-6 animate-in fade-in duration-150">
			<h3 class="text-sm font-bold text-slate-900 uppercase">টাইপোগ্রাফি ও ডিজাইনের উপাদান</h3>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1.5">ফন্ট ফ্যামিলি (Storefront Typography)</label>
					<select
						bind:value={selectedFont}
						class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
					>
						<option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern & Crisp)</option>
						<option value="Outfit">Outfit (Clean Geometric Sans)</option>
						<option value="Inter">Inter (High Legibility)</option>
						<option value="Hind Siliguri">Hind Siliguri (বাংলা ও ইংরেজির জন্য নিখুঁত)</option>
					</select>
				</div>

				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1.5">বাটন ও কার্ডের কর্নার রেডিয়াস</label>
					<select
						bind:value={buttonRadius}
						class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
					>
						<option value="rounded-2xl">Modern Curved (rounded-2xl)</option>
						<option value="rounded-xl">Subtle Round (rounded-xl)</option>
						<option value="rounded-full">Pill Style (rounded-full)</option>
						<option value="rounded-md">Square / Sharp (rounded-md)</option>
					</select>
				</div>
			</div>
		</div>
	{/if}
</div>
