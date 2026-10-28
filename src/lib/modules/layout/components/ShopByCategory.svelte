<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronLeft, ChevronRight, ArrowRight, LayoutGrid } from 'lucide-svelte';

	interface Props {
		categories?: any[];
	}

	let { categories = [] }: Props = $props();

	interface Category {
		id: string;
		name: string;
		slug: string;
		image?: string;
		iconType:
			| 'book'
			| 'electronics'
			| 'ebook'
			| 'beauty'
			| 'audiobook'
			| 'admission'
			| 'stationery'
			| 'science'
			| 'groceries'
			| 'fashion'
			| 'gadgets'
			| 'home'
			| 'generic';
		accentColor?: string;
	}

	function getCategoryIconType(cat: { iconType?: string; slug?: string; name?: string }): Category['iconType'] {
		const s = (cat.slug || '').toLowerCase();
		const n = (cat.name || '').toLowerCase();
		if (s.includes('book') || n.includes('বই') || n.includes('সাহিত্য')) return 'book';
		if (s.includes('elect') || n.includes('ইলেকট্রনিক') || s.includes('audio') || n.includes('অডিও') || s.includes('sound')) return 'electronics';
		if (s.includes('ebook') || n.includes('ইবুক')) return 'ebook';
		if (s.includes('beauty') || s.includes('health') || n.includes('বিউটি') || n.includes('স্কিন') || n.includes('রূপচর্চা')) return 'beauty';
		if (s.includes('audiobook') || n.includes('অডিওবুক')) return 'audiobook';
		if (s.includes('admission') || n.includes('ভর্তি') || n.includes('পরীক্ষা') || n.includes('শিক্ষা')) return 'admission';
		if (s.includes('stationery') || n.includes('স্টেশনারি') || n.includes('খাতা') || n.includes('কলম')) return 'stationery';
		if (s.includes('science') || n.includes('বিজ্ঞান')) return 'science';
		if (s.includes('grocer') || n.includes('গ্রোসারি') || n.includes('খাদ্য') || n.includes('বাজার')) return 'groceries';
		if (s.includes('fashion') || s.includes('cloth') || n.includes('ফ্যাশন') || n.includes('পোশাক') || s.includes('style')) return 'fashion';
		if (s.includes('gadget') || s.includes('watch') || n.includes('ঘড়ি') || n.includes('স্মার্ট') || s.includes('phone') || s.includes('device')) return 'gadgets';
		if (s.includes('home') || n.includes('হোম') || n.includes('আসবাবপত্র') || s.includes('living')) return 'home';
		return 'gadgets';
	}

	const defaultCategories: Category[] = [
		{
			id: 'cat-1',
			name: 'বই',
			slug: 'books',
			iconType: 'book',
			accentColor: '#1e3a8a'
		},
		{
			id: 'cat-2',
			name: 'Electronics',
			slug: 'electronics',
			iconType: 'electronics',
			accentColor: '#0284c7'
		},
		{
			id: 'cat-3',
			name: 'Ebook',
			slug: 'ebook',
			iconType: 'ebook',
			accentColor: '#334155'
		},
		{
			id: 'cat-4',
			name: 'Beauty & Health',
			slug: 'beauty-health',
			iconType: 'beauty',
			accentColor: '#9333ea'
		},
		{
			id: 'cat-5',
			name: 'Audiobook',
			slug: 'audiobook',
			iconType: 'audiobook',
			accentColor: '#0d9488'
		},
		{
			id: 'cat-6',
			name: 'ভর্তি পরীক্ষার প্রস্তুতি',
			slug: 'admission-prep',
			iconType: 'admission',
			accentColor: '#2563eb'
		},
		{
			id: 'cat-7',
			name: 'Stationery',
			slug: 'stationery',
			iconType: 'stationery',
			accentColor: '#eab308'
		},
		{
			id: 'cat-8',
			name: 'Science Kit',
			slug: 'science-kit',
			iconType: 'science',
			accentColor: '#ea580c'
		},
		{
			id: 'cat-9',
			name: 'Groceries',
			slug: 'groceries',
			iconType: 'groceries',
			accentColor: '#16a34a'
		},
		{
			id: 'cat-10',
			name: 'Fashion & Style',
			slug: 'fashion',
			iconType: 'fashion',
			accentColor: '#ec4899'
		},
		{
			id: 'cat-11',
			name: 'Smart Gadgets',
			slug: 'smart-gadgets',
			iconType: 'gadgets',
			accentColor: '#6366f1'
		},
		{
			id: 'cat-12',
			name: 'Home & Living',
			slug: 'home-living',
			iconType: 'home',
			accentColor: '#059669'
		}
	];

	// Derived active categories: live database records when available, fallback to default mock list
	const activeCategories = $derived.by<Category[]>(() => {
		if (categories && categories.length > 0) {
			return categories.map((c) => ({
				id: c.id,
				name: c.name,
				slug: c.slug || c.id,
				image: c.image || '',
				iconType: getCategoryIconType(c),
				accentColor: c.accentColor || '#5845eb'
			}));
		}
		return defaultCategories;
	});

	let scrollContainer: HTMLDivElement | null = $state(null);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(true);

	function updateScrollState() {
		if (!scrollContainer) return;
		const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
		canScrollLeft = scrollLeft > 10;
		canScrollRight = scrollLeft + clientWidth < scrollWidth - 10;
	}

	function scroll(direction: 'left' | 'right') {
		if (!scrollContainer) return;
		const scrollAmount = Math.max(scrollContainer.clientWidth * 0.7, 260);
		scrollContainer.scrollBy({
			left: direction === 'right' ? scrollAmount : -scrollAmount,
			behavior: 'smooth'
		});
	}

	onMount(() => {
		updateScrollState();
		const handleResize = () => updateScrollState();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- Shop By Category Container Section -->
<section class="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5 font-['Anek_Bangla',sans-serif]">
	
	<!-- Outer White Card matching User's Screenshot -->
	<div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 relative">
		
		<!-- Section Header -->
		<div class="flex items-center justify-between mb-3.5 sm:mb-4 px-1">
			<h2 class="text-base sm:text-lg md:text-xl font-bold text-slate-800 font-['Outfit',sans-serif] tracking-tight flex items-center gap-2">
				<span>Shop By Category</span>
			</h2>
			<a
				href="/catalog/all-category"
				class="text-xs sm:text-sm font-semibold text-[#5845eb] hover:text-[#4338ca] flex items-center gap-1 transition-colors group cursor-pointer"
			>
				<span>সব দেখুন</span>
				<ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
			</a>
		</div>

		<!-- Carousel Wrapper with Edge Buttons -->
		<div class="relative group/carousel">
			
			<!-- Left Scroll Arrow Button (appears when scrolled right) -->
			{#if canScrollLeft}
				<button
					type="button"
					onclick={() => scroll('left')}
					class="absolute left-0 top-1/2 -translate-y-8 z-20 w-7 sm:w-8 h-10 sm:h-12 bg-white/95 backdrop-blur-xs rounded-r-lg border-y border-r border-slate-200/90 shadow-md flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-all cursor-pointer active:scale-95"
					title="Scroll Left"
					aria-label="Scroll Left"
				>
					<ChevronLeft class="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
				</button>
			{/if}

			<!-- Scrollable Category Track -->
			<div
				bind:this={scrollContainer}
				onscroll={updateScrollState}
				class="flex items-start gap-3 sm:gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-1.5 px-0.5"
			>
				{#each activeCategories as category}
					<a
						href="/categories/{category.slug}"
						class="flex flex-col items-center shrink-0 group text-center cursor-pointer"
					>
						<!-- Rounded White Image Box (matching user's screenshot) -->
						<div class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-white border border-slate-100 group-hover:border-indigo-300 shadow-xs group-hover:shadow-md transition-all duration-300 flex items-center justify-center p-2.5 sm:p-3 relative transform group-hover:-translate-y-1 overflow-hidden">
							
							{#if category.image}
								<img
									src={category.image}
									alt={category.name}
									class="w-full h-full object-contain p-1 transform group-hover:scale-105 transition-transform"
									loading="lazy"
								/>
							{:else if category.iconType === 'book'}
								<!-- 1. বই (3D Hardcover Book with Bookmark & Gold Spine) -->
								<svg class="w-full h-full transform group-hover:scale-105 transition-transform drop-shadow-sm" viewBox="0 0 100 100" fill="none">
									<defs>
										<linearGradient id="bookCover" x1="0" y1="0" x2="1" y2="1">
											<stop offset="0%" stop-color="#1e293b" />
											<stop offset="50%" stop-color="#0f172a" />
											<stop offset="100%" stop-color="#1e3a8a" />
										</linearGradient>
										<linearGradient id="bookPages" x1="0" y1="0" x2="1" y2="0">
											<stop offset="0%" stop-color="#f8fafc" />
											<stop offset="100%" stop-color="#e2e8f0" />
										</linearGradient>
									</defs>
									<!-- Shadow -->
									<ellipse cx="50" cy="85" rx="36" ry="6" fill="#64748b" opacity="0.2" />
									<!-- Pages block -->
									<polygon points="34,22 72,26 72,78 34,74" fill="url(#bookPages)" stroke="#cbd5e1" stroke-width="0.8" />
									<line x1="36" y1="28" x2="70" y2="32" stroke="#e2e8f0" stroke-width="1" />
									<line x1="36" y1="36" x2="70" y2="40" stroke="#e2e8f0" stroke-width="1" />
									<line x1="36" y1="44" x2="70" y2="48" stroke="#e2e8f0" stroke-width="1" />
									<!-- Main Book Front Cover -->
									<polygon points="26,18 64,22 64,74 26,70" fill="url(#bookCover)" rx="2" />
									<!-- Book Spine -->
									<polygon points="21,21 26,18 26,70 21,73" fill="#090d16" />
									<!-- Golden Spine Decorative Pattern -->
									<rect x="29" y="24" width="7" height="44" rx="1" fill="#f59e0b" opacity="0.85" />
									<line x1="32" y1="26" x2="32" y2="66" stroke="#fbbf24" stroke-width="1" stroke-dasharray="2 2" />
									<!-- Bangla Title Typography -->
									<text x="40" y="46" font-family="'Anek Bangla', sans-serif" font-weight="bold" font-size="7" fill="#fbbf24">বই সমগ্র</text>
									<text x="40" y="55" font-family="'Anek Bangla', sans-serif" font-size="5" fill="#e2e8f0">সাহিত্য</text>
									<!-- Red Bookmark ribbon -->
									<polygon points="46,19 50,19 49,30 48,27 47,30" fill="#ef4444" />
								</svg>

							{:else if category.iconType === 'electronics'}
								<!-- 2. Electronics (Console, Game Controller, Tablet, Headphones) -->
								<svg class="w-full h-full transform group-hover:scale-105 transition-transform drop-shadow-sm" viewBox="0 0 100 100" fill="none">
									<ellipse cx="50" cy="84" rx="38" ry="6" fill="#64748b" opacity="0.2" />
									<!-- Console / Soundbar -->
									<rect x="42" y="22" width="22" height="52" rx="3" fill="#1e293b" stroke="#334155" stroke-width="1" />
									<line x1="44" y1="28" x2="62" y2="28" stroke="#38bdf8" stroke-width="1.5" />
									<!-- Tablet / Phone -->
									<rect x="26" y="38" width="22" height="36" rx="2" fill="#0f172a" stroke="#475569" stroke-width="1" />
									<rect x="28" y="41" width="18" height="28" rx="1" fill="#0284c7" opacity="0.8" />
									<!-- Headphone Arc -->
									<path d="M18 55 C 18 42, 28 34, 40 34" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round" />
									<rect x="15" y="52" width="6" height="12" rx="3" fill="#e11d48" />
									<!-- Gamepad Controller -->
									<path d="M58 56 Q 66 52 74 56 Q 78 66 74 72 Q 70 70 66 72 Q 62 70 58 72 Q 54 66 58 56 Z" fill="#090d16" stroke="#475569" stroke-width="1" />
									<circle cx="63" cy="62" r="1.5" fill="#38bdf8" />
									<circle cx="70" cy="60" r="1" fill="#ef4444" />
									<circle cx="72" cy="63" r="1" fill="#22c55e" />
									<circle cx="68" cy="64" r="1" fill="#eab308" />
								</svg>

							{:else if category.iconType === 'ebook'}
								<!-- 3. Ebook (Kindle E-Reader with Text & Clean Bezel) -->
								<svg class="w-full h-full transform group-hover:scale-105 transition-transform drop-shadow-sm" viewBox="0 0 100 100" fill="none">
									<ellipse cx="50" cy="85" rx="32" ry="5" fill="#64748b" opacity="0.2" />
									<!-- E-Reader Body -->
									<rect x="25" y="16" width="50" height="66" rx="4" fill="#1e293b" stroke="#0f172a" stroke-width="1.5" />
									<!-- Screen (Soft Light E-Ink Display) -->
									<rect x="30" y="22" width="40" height="50" rx="1" fill="#f8fafc" />
									<!-- Simulated E-Book Text Lines -->
									{#each [28, 33, 38, 43, 48, 53, 58, 63] as lineY}
										<line x1="34" y1={lineY} x2="66" y2={lineY} stroke="#475569" stroke-width="1.5" stroke-linecap="round" />
									{/each}
									<line x1="34" y1="67" x2="52" y2="67" stroke="#475569" stroke-width="1.5" stroke-linecap="round" />
									<!-- Kindle Brand / Home Button -->
									<circle cx="50" cy="76" r="2" fill="#64748b" />
								</svg>

							{:else if category.iconType === 'beauty'}
								<!-- 4. Beauty & Health (Perfume Bottle, Skincare Cream & Lotion) -->
								<svg class="w-full h-full transform group-hover:scale-105 transition-transform drop-shadow-sm" viewBox="0 0 100 100" fill="none">
									<ellipse cx="50" cy="85" rx="36" ry="5" fill="#64748b" opacity="0.2" />
									<!-- Tall Green Lotion Bottle -->
									<rect x="42" y="24" width="16" height="52" rx="4" fill="#059669" />
									<rect x="46" y="18" width="8" height="6" rx="1" fill="#047857" />
									<rect x="44" y="38" width="12" height="18" rx="1" fill="white" opacity="0.85" />
									<!-- Teal Shampoo Bottle -->
									<rect x="60" y="36" width="18" height="40" rx="4" fill="#0d9488" />
									<rect x="64" y="30" width="10" height="6" rx="1" fill="#115e59" />
									<!-- Purple Perfume Bottle with Facets -->
									<rect x="22" y="44" width="22" height="32" rx="3" fill="#9333ea" />
									<rect x="29" y="38" width="8" height="6" rx="1" fill="#d8b4fe" />
									<circle cx="33" cy="34" r="3" fill="#facc15" />
									<!-- Highlight reflections -->
									<line x1="25" y1="48" x2="25" y2="72" stroke="white" stroke-width="1.5" opacity="0.4" stroke-linecap="round" />
								</svg>

							{:else if category.iconType === 'audiobook'}
								<!-- 5. Audiobook (Studio Headphones Around Open Book with Sound Waves) -->
								<svg class="w-full h-full transform group-hover:scale-105 transition-transform drop-shadow-sm" viewBox="0 0 100 100" fill="none">
									<ellipse cx="50" cy="85" rx="36" ry="5" fill="#64748b" opacity="0.2" />
									<!-- Open Book -->
									<path d="M28 62 C 38 60, 48 65, 50 67 C 52 65, 62 60, 72 62 L 72 75 C 62 73, 52 77, 50 79 C 48 77, 38 73, 28 75 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
									<!-- Equalizer Sound Wave on book pages -->
									<line x1="42" y1="52" x2="42" y2="60" stroke="#0284c7" stroke-width="1.5" stroke-linecap="round" />
									<line x1="46" y1="48" x2="46" y2="62" stroke="#0284c7" stroke-width="2" stroke-linecap="round" />
									<line x1="50" y1="44" x2="50" y2="64" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" />
									<line x1="54" y1="48" x2="54" y2="62" stroke="#0284c7" stroke-width="2" stroke-linecap="round" />
									<line x1="58" y1="52" x2="58" y2="60" stroke="#0284c7" stroke-width="1.5" stroke-linecap="round" />
									<!-- Headphones Arch -->
									<path d="M22 56 C 22 34, 34 22, 50 22 C 66 22, 78 34, 78 56" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round" fill="none" />
									<!-- Headphone Earcups -->
									<rect x="18" y="52" width="8" height="18" rx="4" fill="#1e293b" stroke="#0284c7" stroke-width="1" />
									<rect x="74" y="52" width="8" height="18" rx="4" fill="#1e293b" stroke="#0284c7" stroke-width="1" />
								</svg>

							{:else if category.iconType === 'admission'}
								<!-- 6. ভর্তি পরীক্ষার প্রস্তুতি (Admission Exam Prep 2026 Badge & Cap) -->
								<svg class="w-full h-full transform group-hover:scale-105 transition-transform drop-shadow-sm" viewBox="0 0 100 100" fill="none">
									<ellipse cx="50" cy="85" rx="34" ry="5" fill="#64748b" opacity="0.2" />
									<!-- Shield Badge Outline -->
									<path d="M50 20 L 76 28 C 76 56, 50 78, 50 78 C 50 78, 24 56, 24 28 Z" fill="#eff6ff" stroke="#2563eb" stroke-width="2" />
									<!-- Graduation Cap (Mortarboard) -->
									<polygon points="50,22 72,30 50,38 28,30" fill="#1e3a8a" />
									<rect x="42" y="34" width="16" height="8" rx="1" fill="#1e40af" />
									<!-- Tassel -->
									<path d="M66 31 L 70 38 L 70 44" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" />
									<circle cx="70" cy="45" r="1.5" fill="#f59e0b" />
									<!-- Banner with 2026 -->
									<rect x="30" y="52" width="40" height="12" rx="2" fill="#1d4ed8" />
									<text x="50" y="61" text-anchor="middle" font-family="'Outfit', sans-serif" font-weight="900" font-size="8" fill="#ffffff">2026</text>
									<!-- Bangla Text Simulation -->
									<text x="50" y="47" text-anchor="middle" font-family="'Anek Bangla', sans-serif" font-weight="bold" font-size="6.5" fill="#1e40af">ভর্তি পরীক্ষা</text>
								</svg>

							{:else if category.iconType === 'stationery'}
								<!-- 7. Stationery (Backpack with Books, Notebooks, Pencils) -->
								<svg class="w-full h-full transform group-hover:scale-105 transition-transform drop-shadow-sm" viewBox="0 0 100 100" fill="none">
									<ellipse cx="50" cy="85" rx="36" ry="5" fill="#64748b" opacity="0.2" />
									<!-- Blue Backpack Body -->
									<path d="M34 38 C 34 26, 40 22, 50 22 C 60 22, 66 26, 66 38 L 72 74 C 72 78, 68 80, 50 80 C 32 80, 28 78, 28 74 Z" fill="#0284c7" stroke="#0369a1" stroke-width="1.5" />
									<!-- Front Pocket (Bright Yellow) -->
									<rect x="34" y="52" width="32" height="22" rx="4" fill="#eab308" stroke="#ca8a04" stroke-width="1" />
									<line x1="38" y1="58" x2="62" y2="58" stroke="#a16207" stroke-width="1.5" />
									<!-- Stacked Notebooks Sticking Out -->
									<rect x="44" y="16" width="22" height="18" rx="2" fill="#ef4444" transform="rotate(8 44 16)" />
									<rect x="36" y="15" width="20" height="18" rx="2" fill="#3b82f6" transform="rotate(-6 36 15)" />
									<!-- Pencils & Rulers -->
									<rect x="30" y="18" width="3" height="22" rx="1" fill="#f97316" transform="rotate(-15 30 18)" />
									<rect x="68" y="24" width="4" height="20" rx="1" fill="#22c55e" transform="rotate(20 68 24)" />
								</svg>

							{:else if category.iconType === 'science'}
								<!-- 8. Science Kit (Orange Science Box with Lightning & Atom) -->
								<svg class="w-full h-full transform group-hover:scale-105 transition-transform drop-shadow-sm" viewBox="0 0 100 100" fill="none">
									<ellipse cx="50" cy="85" rx="34" ry="5" fill="#64748b" opacity="0.2" />
									<!-- Orange Science Box 3D Perspective -->
									<polygon points="32,24 68,20 80,30 44,34" fill="#fdba74" />
									<polygon points="44,34 80,30 80,72 44,76" fill="#ea580c" />
									<polygon points="32,24 44,34 44,76 32,66" fill="#c2410c" />
									<!-- Atom Orbits / Circle -->
									<ellipse cx="62" cy="52" rx="12" ry="6" stroke="#fed7aa" stroke-width="1" fill="none" transform="rotate(25 62 52)" />
									<ellipse cx="62" cy="52" rx="12" ry="6" stroke="#fed7aa" stroke-width="1" fill="none" transform="rotate(-25 62 52)" />
									<!-- Lightning Bolt -->
									<polygon points="63,42 56,54 62,54 61,62 68,50 62,50" fill="#facc15" stroke="#b45309" stroke-width="0.8" />
									<!-- Box Title Text -->
									<text x="62" y="38" text-anchor="middle" font-family="'Outfit', sans-serif" font-weight="900" font-size="4" fill="#ffffff">SCIENCE LAB</text>
								</svg>

							{:else if category.iconType === 'groceries'}
								<!-- 9. Groceries (Loaded Chrome Supermarket Shopping Cart) -->
								<svg class="w-full h-full transform group-hover:scale-105 transition-transform drop-shadow-sm" viewBox="0 0 100 100" fill="none">
									<ellipse cx="50" cy="85" rx="36" ry="5" fill="#64748b" opacity="0.2" />
									<!-- Cart Items (Fruits, Bottles, Veggies) -->
									<circle cx="44" cy="40" r="7" fill="#ef4444" />
									<circle cx="56" cy="40" r="6" fill="#f97316" />
									<rect x="48" y="30" width="8" height="16" rx="2" fill="#22c55e" />
									<rect x="36" y="32" width="7" height="14" rx="1" fill="#3b82f6" />
									<rect x="62" y="34" width="7" height="14" rx="1" fill="#eab308" />
									<!-- Shopping Cart Wire Basket -->
									<polygon points="26,38 74,38 68,62 34,62" fill="white" fill-opacity="0.2" stroke="#475569" stroke-width="1.8" />
									<!-- Cart Grid Lines -->
									<line x1="36" y1="38" x2="40" y2="62" stroke="#64748b" stroke-width="1" />
									<line x1="48" y1="38" x2="50" y2="62" stroke="#64748b" stroke-width="1" />
									<line x1="60" y1="38" x2="60" y2="62" stroke="#64748b" stroke-width="1" />
									<line x1="29" y1="46" x2="72" y2="46" stroke="#64748b" stroke-width="1" />
									<line x1="32" y1="54" x2="70" y2="54" stroke="#64748b" stroke-width="1" />
									<!-- Cart Chassis & Handle -->
									<path d="M22 34 L 26 38 L 34 62 L 68 62 L 64 74 L 38 74" stroke="#334155" stroke-width="2" stroke-linecap="round" fill="none" />
									<!-- Wheels -->
									<circle cx="42" cy="78" r="3.5" fill="#1e293b" stroke="#cbd5e1" stroke-width="1" />
									<circle cx="62" cy="78" r="3.5" fill="#1e293b" stroke="#cbd5e1" stroke-width="1" />
								</svg>

							{:else if category.iconType === 'fashion'}
								<!-- 10. Fashion & Apparel -->
								<svg class="w-full h-full transform group-hover:scale-105 transition-transform drop-shadow-sm" viewBox="0 0 100 100" fill="none">
									<ellipse cx="50" cy="85" rx="34" ry="5" fill="#64748b" opacity="0.2" />
									<!-- Hanger & Jacket -->
									<path d="M50 24 C 54 24, 54 20, 50 18 C 46 16, 46 22, 50 24 Z" stroke="#e11d48" stroke-width="1.5" fill="none" />
									<path d="M50 24 L 28 34 L 34 46 L 40 44 L 40 74 L 60 74 L 60 44 L 66 46 L 72 34 Z" fill="#ec4899" stroke="#be185d" stroke-width="1.5" />
									<!-- Collar -->
									<polygon points="50,30 42,42 50,42" fill="#fda4af" />
									<polygon points="50,30 58,42 50,42" fill="#fda4af" />
								</svg>

							{:else if category.iconType === 'gadgets'}
								<!-- 11. Smart Gadgets (Smartwatch & Earbuds) -->
								<svg class="w-full h-full transform group-hover:scale-105 transition-transform drop-shadow-sm" viewBox="0 0 100 100" fill="none">
									<ellipse cx="50" cy="85" rx="32" ry="5" fill="#64748b" opacity="0.2" />
									<!-- Watch Strap -->
									<rect x="42" y="16" width="16" height="66" rx="4" fill="#312e81" />
									<!-- Watch Case -->
									<rect x="36" y="34" width="28" height="32" rx="7" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5" />
									<!-- Watch Screen -->
									<rect x="39" y="37" width="22" height="26" rx="5" fill="#0f172a" />
									<circle cx="50" cy="50" r="8" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="12 4" fill="none" />
									<text x="50" y="52" text-anchor="middle" font-family="'Outfit', sans-serif" font-weight="bold" font-size="6" fill="#ffffff">10:45</text>
								</svg>

							{:else if category.iconType === 'home'}
								<!-- 12. Home & Living (Armchair & Plant) -->
								<svg class="w-full h-full transform group-hover:scale-105 transition-transform drop-shadow-sm" viewBox="0 0 100 100" fill="none">
									<ellipse cx="50" cy="85" rx="36" ry="5" fill="#64748b" opacity="0.2" />
									<!-- Sofa Chair -->
									<path d="M30 48 C 30 38, 38 34, 50 34 C 62 34, 70 38, 70 48 L 70 68 L 30 68 Z" fill="#059669" />
									<rect x="26" y="48" width="8" height="20" rx="3" fill="#047857" />
									<rect x="66" y="48" width="8" height="20" rx="3" fill="#047857" />
									<rect x="34" y="54" width="32" height="12" rx="3" fill="#10b981" />
									<!-- Wooden Legs -->
									<line x1="32" y1="68" x2="28" y2="78" stroke="#b45309" stroke-width="2.5" stroke-linecap="round" />
									<line x1="68" y1="68" x2="72" y2="78" stroke="#b45309" stroke-width="2.5" stroke-linecap="round" />
								</svg>
							{:else}
								<!-- Generic Modern Category Icon -->
								<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
									<LayoutGrid class="w-5 h-5 sm:w-6 sm:h-6" />
								</div>
							{/if}

						</div>

						<!-- Category Label Below the Card (Matching screenshot styling) -->
						<span class="mt-2 text-xs sm:text-[13px] font-semibold text-slate-700 group-hover:text-[#5845eb] transition-colors max-w-[80px] sm:max-w-[100px] md:max-w-[110px] truncate leading-tight">
							{category.name}
						</span>

					</a>
				{/each}
			</div>

			<!-- Right Scroll Arrow Button (matching user's screenshot) -->
			{#if canScrollRight}
				<button
					type="button"
					onclick={() => scroll('right')}
					class="absolute right-0 top-1/2 -translate-y-8 z-20 w-7 sm:w-8 h-10 sm:h-12 bg-white/95 backdrop-blur-xs rounded-l-lg border-y border-l border-slate-200/90 shadow-md flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-all cursor-pointer active:scale-95"
					title="Scroll Right"
					aria-label="Scroll Right"
				>
					<ChevronRight class="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
				</button>
			{/if}

		</div>

	</div>

</section>
