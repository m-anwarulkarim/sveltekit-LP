<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Badge, Card } from '#lib/components/ui';
	import {
		ChevronLeft,
		ChevronRight,
		Truck,
		ShieldCheck,
		Sparkles,
		Percent,
		Smartphone,
		Flame,
		Home,
		ShoppingBag,
		ArrowRight
	} from 'lucide-svelte';

	// Slide definitions matching e-commerce platforms like Cartup / Daraz
	interface BannerSlide {
		id: string;
		categoryTag: string;
		title: string;
		subtitle: string;
		discountBadge: string;
		savingBadge: string;
		deliveryOffer: string;
		linkUrl: string;
		theme: {
			bgGradient: string;
			accentColor: string;
			textColor: string;
		};
		imageType: 'grocery' | 'electronics' | 'home-decor' | 'beauty';
	}

	const slides: BannerSlide[] = [
		{
			id: 'slide-grocery',
			categoryTag: 'SUPER DEALS',
			title: 'Monthly Grocery',
			subtitle: 'Up to 60% Off',
			discountBadge: 'Up to 60% Off',
			savingBadge: 'Up to 15% Pre-payment Savings',
			deliveryOffer: 'Get Tk. 50 Off on Delivery',
			linkUrl: '/products',
			theme: {
				bgGradient: 'from-[#82e078] via-[#a3f09b] to-[#c7f9c0]',
				accentColor: '#15803d',
				textColor: 'text-emerald-950'
			},
			imageType: 'grocery'
		},
		{
			id: 'slide-gadgets',
			categoryTag: 'OFFICIAL STORE',
			title: 'Mega Gadget Fest',
			subtitle: 'Up to 50% Off',
			discountBadge: 'Spatial IEMs & Audio',
			savingBadge: 'Up to 20% Instant Cashback',
			deliveryOffer: 'Free Express Delivery ৳৬০০+',
			linkUrl: '/products',
			theme: {
				bgGradient: 'from-[#4338ca] via-[#6366f1] to-[#a5b4fc]',
				accentColor: '#4338ca',
				textColor: 'text-white'
			},
			imageType: 'electronics'
		},
		{
			id: 'slide-decor',
			categoryTag: 'LIFESTYLE',
			title: 'Home Decor & Living',
			subtitle: 'Starting from ৳490',
			discountBadge: '3D Wall Art & Lamps',
			savingBadge: 'Buy 2 Get 1 Free Promo',
			deliveryOffer: 'Cash on Delivery Across BD',
			linkUrl: '/products',
			theme: {
				bgGradient: 'from-[#f97316] via-[#fb923c] to-[#fed7aa]',
				accentColor: '#c2410c',
				textColor: 'text-amber-950'
			},
			imageType: 'home-decor'
		},
		{
			id: 'slide-beauty',
			categoryTag: 'PREMIUM CARE',
			title: 'Glow & Beauty Care',
			subtitle: '100% Authentic Brands',
			discountBadge: 'Flat 30% Off',
			savingBadge: 'Official Guarantee',
			deliveryOffer: 'Fast 24-48h Delivery',
			linkUrl: '/products',
			theme: {
				bgGradient: 'from-[#db2777] via-[#f472b6] to-[#fbcfe8]',
				accentColor: '#be185d',
				textColor: 'text-rose-950'
			},
			imageType: 'beauty'
		}
	];

	// Quick feature badges immediately below the banner
	const FEATURE_BADGES = [
		{
			title: 'Lowest Price',
			subtitle: 'Best Deal Guaranteed',
			icon: Percent,
			color: 'text-rose-600 bg-rose-50 border-rose-100',
			badge: 'DEALS',
			badgeVariant: 'destructive' as const
		},
		{
			title: '100% Authentic',
			subtitle: 'Verified Quality',
			icon: ShieldCheck,
			color: 'text-blue-600 bg-blue-50 border-blue-100',
			badge: 'AURA',
			badgeVariant: 'purple' as const
		},
		{
			title: 'Mobiles & Tech',
			subtitle: 'Smart Devices',
			icon: Smartphone,
			color: 'text-amber-600 bg-amber-50 border-amber-100',
			badge: 'HOT',
			badgeVariant: 'warning' as const
		},
		{
			title: 'Latest Drops',
			subtitle: 'New Collections',
			icon: Flame,
			color: 'text-orange-600 bg-orange-50 border-orange-100',
			badge: 'NEW',
			badgeVariant: 'outline' as const
		},
		{
			title: 'Glow & Go',
			subtitle: 'Beauty & Wellness',
			icon: Sparkles,
			color: 'text-pink-600 bg-pink-50 border-pink-100',
			badge: 'CARE',
			badgeVariant: 'secondary' as const
		},
		{
			title: 'Home Decor',
			subtitle: 'Modern Essentials',
			icon: Home,
			color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
			badge: 'LIVING',
			badgeVariant: 'success' as const
		}
	];

	// Slider State (Svelte 5 Runes)
	let currentSlide = $state(0);
	let isHovered = $state(false);
	let touchStartX = 0;
	let touchEndX = 0;

	function nextSlide() {
		currentSlide = (currentSlide + 1) % slides.length;
	}

	function prevSlide() {
		currentSlide = (currentSlide - 1 + slides.length) % slides.length;
	}

	function goToSlide(index: number) {
		currentSlide = index;
	}

	// Auto Slider Timer: changes every 4.5 seconds
	onMount(() => {
		const interval = setInterval(() => {
			if (!isHovered) {
				nextSlide();
			}
		}, 4500);

		return () => clearInterval(interval);
	});

	// Mobile Touch Swipe Handling
	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].screenX;
		if (touchStartX - touchEndX > 50) {
			nextSlide();
		} else if (touchEndX - touchStartX > 50) {
			prevSlide();
		}
	}
</script>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 select-none font-['Hind_Siliguri',sans-serif]">
	
	<!-- 1. The Main Hero Banner Slider Container (using shadcn Card) -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<Card
		class="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 bg-slate-100 p-0"
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
	>
		<!-- Slides Track (CSS Transform sliding) -->
		<div
			class="flex transition-transform duration-700 ease-out h-[220px] sm:h-[300px] md:h-[350px] lg:h-[380px]"
			style="transform: translateX(-{currentSlide * 100}%);"
		>
			{#each slides as slide, index}
				<div class="w-full shrink-0 h-full relative overflow-hidden bg-gradient-to-r {slide.theme.bgGradient} flex items-center">
					
					<!-- Abstract background overlay graphics -->
					<div class="absolute inset-0 bg-white/20 backdrop-blur-[1px] pointer-events-none"></div>
					<div class="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/30 blur-2xl pointer-events-none"></div>
					<div class="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full bg-white/40 blur-3xl pointer-events-none"></div>

					<!-- Slide Content Grid -->
					<div class="w-full h-full max-w-6xl mx-auto px-6 sm:px-12 lg:px-16 flex items-center justify-between relative z-10">
						
						<!-- Left Side: Copy & Promo Badges -->
						<div class="max-w-md sm:max-w-lg space-y-2 sm:space-y-3">
							
							<!-- Category Tag (shadcn Badge) -->
							<Badge variant="purple" class="shadow-xs font-black tracking-wider text-[10px] sm:text-xs">
								<Sparkles class="w-3 h-3 mr-1" />
								<span>{slide.categoryTag}</span>
							</Badge>

							<!-- Big Promotional Title (3D Stylized) -->
							<h2 class="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight {slide.theme.textColor} drop-shadow-sm leading-tight">
								{slide.title}
							</h2>

							<!-- Subtitle & Discount Highlight -->
							<div class="text-base sm:text-xl md:text-2xl font-black {slide.theme.textColor} flex items-center gap-2">
								<Badge variant="outline" class="bg-white/85 backdrop-blur-md px-3 py-1 text-sm sm:text-base border-white/60 shadow-xs">
									{slide.subtitle}
								</Badge>
							</div>

							<!-- Pre-payment / Savings Badge (shadcn Badge) -->
							<div class="flex flex-wrap items-center gap-2 pt-1">
								<Badge class="bg-[#0284c7] hover:bg-[#0369a1] text-white border-sky-400 py-1.5 px-3 text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20">
									<Percent class="w-3.5 h-3.5 mr-1" />
									<span>{slide.savingBadge}</span>
								</Badge>
							</div>

							<!-- Delivery Offer Tag (shadcn Badge) -->
							<div class="flex items-center gap-2">
								<Badge variant="default" class="bg-slate-900/90 text-white py-1 px-2.5 text-[11px] sm:text-xs font-semibold shadow-xs">
									<Truck class="w-3.5 h-3.5 mr-1 text-emerald-400" />
									<span>{slide.deliveryOffer}</span>
									<span class="text-[9px] text-slate-400 ml-1 hidden sm:inline">*T&Cs Apply</span>
								</Badge>
							</div>

						</div>

						<!-- Right Side: Promotional Illustration Graphics -->
						<div class="hidden sm:flex items-center justify-center shrink-0 w-64 md:w-80 lg:w-96 relative">
							{#if slide.imageType === 'grocery'}
								<!-- 3D Grocery Cart Illustration -->
								<div class="relative transform hover:scale-105 transition-transform duration-300">
									<Card class="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-white/75 backdrop-blur-md border border-white/80 p-4 shadow-xl flex flex-col items-center justify-center text-center space-y-2">
										<div class="text-6xl drop-shadow-md animate-bounce">🛒</div>
										<Badge variant="success" class="font-black px-3 py-1 shadow-xs">
											GROCERY COMBO
										</Badge>
										<div class="text-[11px] font-bold text-slate-700 leading-tight">
											Dettol • Mr. White • Fab • Lizol <br />
											<span class="text-emerald-700 font-black">সরাসরি হোম ডেলিভারি</span>
										</div>
									</Card>
								</div>
							{:else if slide.imageType === 'electronics'}
								<!-- Electronics / Tech Graphic -->
								<div class="relative transform hover:scale-105 transition-transform duration-300">
									<Card class="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 p-4 shadow-2xl flex flex-col items-center justify-center text-center space-y-2">
										<div class="text-6xl drop-shadow-md">🎧</div>
										<Badge variant="purple" class="font-black px-3 py-1 shadow-xs bg-indigo-600 text-white border-indigo-400">
											FLAGSHIP AUDIO
										</Badge>
										<div class="text-[11px] font-bold text-white/90 leading-tight">
											AURA Spatial IEMs & Wireless <br />
											<span class="text-cyan-200 font-black">Official 2-Year Warranty</span>
										</div>
									</Card>
								</div>
							{:else if slide.imageType === 'home-decor'}
								<!-- Home Decor Graphic -->
								<div class="relative transform hover:scale-105 transition-transform duration-300">
									<Card class="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-white/80 backdrop-blur-md border border-white/90 p-4 shadow-xl flex flex-col items-center justify-center text-center space-y-2">
										<div class="text-6xl drop-shadow-md">🛋️</div>
										<Badge variant="warning" class="font-black px-3 py-1 shadow-xs">
											3D WALL STICKER
										</Badge>
										<div class="text-[11px] font-bold text-slate-700 leading-tight">
											Waterproof Scenic View Decals <br />
											<span class="text-amber-800 font-black">স্মার্ট হোম অ্যাম্বিয়েন্স</span>
										</div>
									</Card>
								</div>
							{:else}
								<!-- Beauty & Care Graphic -->
								<div class="relative transform hover:scale-105 transition-transform duration-300">
									<Card class="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-white/80 backdrop-blur-md border border-white/90 p-4 shadow-xl flex flex-col items-center justify-center text-center space-y-2">
										<div class="text-6xl drop-shadow-md">✨</div>
										<Badge variant="destructive" class="font-black px-3 py-1 shadow-xs">
											GLOW ESSENTIALS
										</Badge>
										<div class="text-[11px] font-bold text-slate-700 leading-tight">
											100% Authentic Imported Care <br />
											<span class="text-rose-800 font-black">স্পেশাল কম্বো অফার</span>
										</div>
									</Card>
								</div>
							{/if}
						</div>

					</div>

				</div>
			{/each}
		</div>

		<!-- Navigation Arrows (using shadcn Button) -->
		<div class="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-2 z-20">
			<Button
				variant="outline"
				size="icon"
				onclick={prevSlide}
				class="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border-slate-200/80 cursor-pointer"
				title="পূর্ববর্তী স্লাইড"
			>
				<ChevronLeft class="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
			</Button>

			<Button
				variant="outline"
				size="icon"
				onclick={nextSlide}
				class="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border-slate-200/80 cursor-pointer"
				title="পরবর্তী স্লাইড"
			>
				<ChevronRight class="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
			</Button>
		</div>

		<!-- Pagination Indicator Dots (Bottom Center matching screenshot) -->
		<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-slate-900/25 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
			{#each slides as _, i}
				<button
					type="button"
					onclick={() => goToSlide(i)}
					class="transition-all duration-300 rounded-full cursor-pointer {currentSlide === i
						? 'w-6 h-2 bg-[#db2777] shadow-xs'
						: 'w-2 h-2 bg-white/70 hover:bg-white'}"
					aria-label="Go to slide {i + 1}"
				></button>
			{/each}
		</div>

	</Card>

	<!-- 2. Quick Feature Badges Bar (using shadcn Card & Badge) -->
	<div class="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
		{#each FEATURE_BADGES as item}
			<a href="/products" class="block group">
				<Card class="p-2.5 sm:p-3 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex items-center gap-2.5 cursor-pointer bg-white">
					<!-- Icon Container -->
					<div class="w-10 h-10 rounded-xl {item.color} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
						<item.icon class="w-5 h-5 stroke-[2]" />
					</div>

					<!-- Text Labels -->
					<div class="min-w-0">
						<div class="flex items-center gap-1">
							<h3 class="text-xs sm:text-sm font-bold text-slate-800 truncate leading-snug group-hover:text-[#5845eb] transition-colors">
								{item.title}
							</h3>
						</div>
						<p class="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
							{item.subtitle}
						</p>
					</div>
				</Card>
			</a>
		{/each}
	</div>

</section>
