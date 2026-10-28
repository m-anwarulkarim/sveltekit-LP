<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronLeft, ChevronRight, Percent, Sparkles, Tag, ShieldCheck, ArrowRight } from 'lucide-svelte';

	interface Brand {
		name: string;
		category: string;
		color: string;
		bgColor?: string;
		tag?: string;
	}

	const partnerBrands: Brand[] = [
		{ name: 'Bay', category: 'Footwear', color: '#dc2626' },
		{ name: 'FABRILIFE', category: 'Fashion', color: '#0f172a' },
		{ name: 'GAZI', category: 'Home Appliance', color: '#0284c7' },
		{ name: 'minister', category: 'Electronics', color: '#16a34a' },
		{ name: 'oraimo', category: 'Smart Tech', color: '#65a30d' },
		{ name: 'Dettol', category: 'Hygiene', color: '#059669' },
		{ name: 'Regal', category: 'Furniture', color: '#b91c1c' },
		{ name: 'BEST BUY', category: 'Retail', color: '#e11d48' },
		{ name: 'tp-link', category: 'Networking', color: '#0891b2' },
		{ name: 'Unilever', category: 'Consumer Care', color: '#1d4ed8' }
	];

	interface Slide {
		id: string;
		type: 'brand-campaign' | 'product-deal';
		badge?: string;
		discountOffer?: string;
		savingsBadge?: string;
		title: string;
		subtitle?: string;
		image?: string;
		linkUrl: string;
		bgGradient: string;
		textColor: string;
	}

	const slides: Slide[] = [
		{
			id: 'slide-1',
			type: 'brand-campaign',
			title: 'BIG BRAND DAYS',
			subtitle: 'With Crazy Deals',
			discountOffer: 'Up to 54% Off',
			savingsBadge: 'FREE DELIVERY',
			linkUrl: '/products',
			bgGradient: 'from-[#0284c7] via-[#006ee6] to-[#38bdf8]',
			textColor: 'text-white'
		},
		{
			id: 'slide-2',
			type: 'product-deal',
			badge: 'New Arrivals',
			discountOffer: 'Max Discount Tk 20 | Min Purchase Tk 199',
			savingsBadge: 'Up to 15% Pre-payment Savings',
			title: 'AURA Next-Gen Hardware',
			subtitle: 'Spatial Acoustic & Lifestyle Gear',
			image: '/images/sound-deck.jpg',
			linkUrl: '/products',
			bgGradient: 'from-[#0f172a] via-[#1e293b] to-[#2563eb]',
			textColor: 'text-white'
		},
		{
			id: 'slide-3',
			type: 'product-deal',
			badge: 'Mega Offer',
			discountOffer: 'Flat 40% Off on Planar Magnetic Drivers',
			savingsBadge: 'Official 2-Year Replacement Warranty',
			title: 'Studio Spatial Acoustics',
			subtitle: 'Audiophile Transducers & DACs',
			image: '/images/headphones.jpg',
			linkUrl: '/products',
			bgGradient: 'from-[#1e1b4b] via-[#312e81] to-[#4f46e5]',
			textColor: 'text-white'
		},
		{
			id: 'slide-4',
			type: 'product-deal',
			badge: 'Special Combo',
			discountOffer: 'Free Delivery Across Bangladesh on ৳৯৯৯+',
			savingsBadge: 'Cash on Delivery Available',
			title: 'AURA Wave Spatial Pro',
			subtitle: 'Zero-Latency Wireless Earbuds',
			image: '/images/earbuds.jpg',
			linkUrl: '/combos',
			bgGradient: 'from-[#064e3b] via-[#047857] to-[#059669]',
			textColor: 'text-white'
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

	// Auto Slider Timer: shifts every 4.5 seconds
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
		if (touchStartX - touchEndX > 45) {
			nextSlide();
		} else if (touchEndX - touchStartX > 45) {
			prevSlide();
		}
	}
</script>

<!-- Outer Container with responsive margins sitting on soft light page background -->
<section class="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5 font-['Anek_Bangla',sans-serif]">
	
	<!-- Slider Banner Card (rounded corners, soft shadow matching Cartup screenshot) -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-200/90 bg-slate-900 aspect-[2.35/1] sm:aspect-[2.85/1] md:aspect-[3.3/1] min-h-[160px] sm:min-h-[220px] md:min-h-[270px]"
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
	>
		<!-- Slides Horizontal Track (smooth 60fps CSS transform) -->
		<div
			class="flex w-full h-full transition-transform duration-500 ease-out"
			style="transform: translateX(-{currentSlide * 100}%);"
		>
			{#each slides as slide, index}
				<div class="w-full shrink-0 h-full relative overflow-hidden bg-gradient-to-r {slide.bgGradient} flex items-center">
					
					<!-- Background Ambient Graphic Overlays & Radial Spotlights -->
					<div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.22),transparent_65%)] pointer-events-none"></div>
					<div class="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>

					<!-- SLIDE TYPE 1: EXACT CARTUP "BIG BRAND DAYS" (MATCHING USER REFERENCE IMAGE 2) -->
					{#if slide.type === 'brand-campaign'}
						<div class="w-full h-full flex items-center justify-between px-3.5 sm:px-8 md:px-12 relative z-10">
							
							<!-- Left Side: 3D "BIG BRAND DAYS", Deals ribbon & Free Delivery -->
							<div class="max-w-[48%] sm:max-w-[44%] md:max-w-[40%] flex flex-col justify-center items-start space-y-1.5 sm:space-y-3">
								
								<!-- Big 3D Title with Gold Gem Accents -->
								<div class="relative pt-1 sm:pt-2">
									<!-- 3D Gold Diamonds atop BIG -->
									<div class="absolute -top-1 sm:-top-2 left-1 sm:left-2 flex items-center gap-1 sm:gap-2 z-10">
										<span class="inline-block text-xs sm:text-base md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] animate-pulse">💎</span>
										<span class="inline-block text-xs sm:text-base md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] animate-pulse delay-100">💎</span>
									</div>

									<!-- Extruded 3D "BIG" text -->
									<div class="font-['Outfit',sans-serif] font-black tracking-tight text-white leading-none text-2xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
										BIG
									</div>

									<!-- Red 3D Banner Ribbon: "BRAND DAYS" -->
									<div class="relative -mt-0.5 sm:-mt-1 inline-block">
										<div class="bg-gradient-to-r from-[#dc2626] via-[#e11d48] to-[#f43f5e] text-white font-black font-['Outfit',sans-serif] text-sm sm:text-2xl md:text-3xl lg:text-4xl px-2.5 sm:px-5 py-0.5 sm:py-1 rounded-sm sm:rounded shadow-lg tracking-wider border-t border-white/30 transform -rotate-1">
											BRAND DAYS
										</div>
									</div>
								</div>

								<!-- "With Crazy Deals" Pill Badge -->
								<div>
									<span class="inline-block px-2 sm:px-4 py-0.5 sm:py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/60 text-white font-black text-[9px] sm:text-xs md:text-sm tracking-wide shadow-xs">
										{slide.subtitle}
									</span>
								</div>

								<!-- "FREE DELIVERY" 3D Badge -->
								<div class="pt-0.5 sm:pt-1">
									<div class="inline-flex items-center gap-1.5 px-2 sm:px-3.5 py-0.5 sm:py-1 rounded-sm bg-gradient-to-r from-amber-400 to-yellow-300 border-b-2 border-amber-600 text-slate-900 font-black text-[8px] sm:text-[11px] md:text-xs shadow-md tracking-wider uppercase transform skew-x-[-4deg]">
										<span class="text-rose-600 font-extrabold">⚡</span>
										<span>{slide.savingsBadge}</span>
									</div>
								</div>

								<!-- Terms Disclaimer in faint text -->
								<div class="text-[7.5px] sm:text-[10px] text-white/70 font-medium pl-0.5">
									*T&Cs Apply
								</div>

							</div>

							<!-- Right Side: Frosted Glass Container with "Up to 54% Off" Pill & 10 Brand Badges -->
							<div class="w-[50%] sm:w-[54%] md:w-[56%] h-[88%] sm:h-[85%] relative flex flex-col justify-center">
								
								<!-- Frosted Showcase Container -->
								<div class="relative w-full h-full rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md border border-white/40 p-2 sm:p-3 sm:px-4 shadow-xl flex flex-col justify-between">
									
									<!-- Top Pill: "Up to 54% Off" -->
									<div class="flex justify-center -mt-4 sm:-mt-5">
										<div class="bg-white text-[#e11d48] font-black text-[9px] sm:text-xs md:text-sm px-3 sm:px-5 py-0.5 sm:py-1 rounded-full shadow-md border border-pink-100 flex items-center gap-1 tracking-wide">
											<span>{slide.discountOffer}</span>
										</div>
									</div>

									<!-- 10 Brand Logos Grid (5x2 layout on desktop, responsive on mobile) -->
									<div class="grid grid-cols-5 gap-1 sm:gap-2 my-auto pt-1 sm:pt-2">
										{#each partnerBrands as brand}
											<div class="bg-white rounded-md sm:rounded-xl shadow-xs py-1 px-1 sm:px-2 flex flex-col items-center justify-center h-6 sm:h-9 md:h-11 hover:scale-105 hover:shadow-md transition-all group cursor-pointer border border-slate-100">
												
												<!-- Brand Stylized Monogram / Logo Representation -->
												{#if brand.name === 'Bay'}
													<span class="font-black text-[10px] sm:text-xs md:text-sm text-[#dc2626] font-['Outfit'] tracking-tight">
														Bay
													</span>
												{:else if brand.name === 'FABRILIFE'}
													<div class="flex items-center gap-0.5">
														<span class="text-[8px] sm:text-xs text-slate-800 font-black">❖</span>
														<span class="font-black text-[7px] sm:text-[10px] md:text-xs text-slate-900 tracking-tighter">FABRI</span>
													</div>
												{:else if brand.name === 'GAZI'}
													<div class="text-center leading-tight">
														<span class="font-black text-[9px] sm:text-xs md:text-sm text-[#0284c7]">GAZI</span>
													</div>
												{:else if brand.name === 'minister'}
													<div class="flex items-center gap-0.5">
														<span class="text-[6.5px] sm:text-[8px] text-green-600">●</span>
														<span class="font-bold text-[8px] sm:text-xs text-green-700 italic">minister</span>
													</div>
												{:else if brand.name === 'oraimo'}
													<span class="font-black text-[8.5px] sm:text-xs md:text-sm text-[#65a30d] font-sans tracking-tight">
														oraimo
													</span>
												{:else if brand.name === 'Dettol'}
													<div class="flex items-center gap-0.5">
														<div class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[7px] sm:text-[9px] font-bold">
															+
														</div>
														<span class="font-bold text-[7px] sm:text-[10px] md:text-xs text-emerald-800">Dettol</span>
													</div>
												{:else if brand.name === 'Regal'}
													<div class="text-center leading-tight">
														<span class="font-black text-[8px] sm:text-xs text-[#b91c1c]">Regal</span>
													</div>
												{:else if brand.name === 'BEST BUY'}
													<div class="bg-rose-50 px-1 rounded text-center">
														<span class="font-black text-[7px] sm:text-[9px] md:text-[11px] text-[#e11d48]">BEST BUY</span>
													</div>
												{:else if brand.name === 'tp-link'}
													<div class="flex items-center gap-0.5 text-[#0891b2]">
														<span class="font-black text-[7px] sm:text-[9px]">◌</span>
														<span class="font-bold text-[7.5px] sm:text-[10px] md:text-xs">tp-link</span>
													</div>
												{:else if brand.name === 'Unilever'}
													<div class="flex items-center gap-0.5 text-[#1d4ed8]">
														<span class="font-bold text-[8px] sm:text-xs">U</span>
														<span class="font-bold text-[7px] sm:text-[9px] md:text-[10px]">Unilever</span>
													</div>
												{/if}

											</div>
										{/each}
									</div>

								</div>

							</div>

						</div>

					<!-- SLIDE TYPE 2: PRODUCT SHOWCASE WITH HIGH-CONVERSION RIBBONS -->
					{:else}
						<div class="w-full h-full flex items-center justify-between px-3.5 sm:px-8 md:px-12 relative z-10">
							
							<!-- Left Side: Copy & Promotional Ribbons -->
							<div class="max-w-[60%] sm:max-w-md space-y-1 sm:space-y-2">
								
								<!-- Ribbon Badge -->
								<div>
									<span class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-sm sm:rounded-md bg-[#e11d48] text-white font-black text-[10px] sm:text-xs md:text-sm tracking-wider uppercase shadow-sm">
										{slide.badge}
									</span>
								</div>

								<!-- Discount Offer Blue Pill -->
								<div>
									<span class="inline-block px-1.5 sm:px-2.5 py-0.5 rounded-sm bg-[#0284c7] text-white font-bold text-[8px] sm:text-[11px] md:text-xs shadow-2xs leading-tight">
										{slide.discountOffer}
									</span>
								</div>

								<!-- Savings Badge -->
								<div class="pt-0.5 sm:pt-1">
									<span class="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-sm sm:rounded bg-[#008ba3] border border-cyan-300 text-white font-bold text-[7px] sm:text-[10px] md:text-xs shadow-2xs">
										<Percent class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-300" />
										<span>{slide.savingsBadge}</span>
									</span>
								</div>

								<!-- Title and Subtitle -->
								<div class="hidden sm:block pt-1">
									<h3 class="text-sm sm:text-lg md:text-xl font-black text-white drop-shadow-sm truncate">
										{slide.title}
									</h3>
									<p class="text-[10px] sm:text-xs text-white/80 font-medium truncate">
										{slide.subtitle}
									</p>
								</div>

							</div>

							<!-- Right Side: Product Image Display -->
							<div class="w-[36%] sm:w-[38%] md:w-[40%] h-[85%] relative flex items-center justify-end">
								<div class="relative w-full h-full max-h-48 rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-slate-800/40 backdrop-blur-xs flex items-center justify-center">
									<img
										src={slide.image}
										alt={slide.title}
										class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
									/>
									<div class="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 pointer-events-none"></div>
								</div>
							</div>

						</div>
					{/if}

				</div>
			{/each}
		</div>

		<!-- Bottom Navigation Indicator Dots (Pink dots matching screenshot) -->
		<div class="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 sm:left-1/3 flex items-center gap-1.5 z-20">
			{#each slides as _, i}
				<button
					type="button"
					onclick={() => goToSlide(i)}
					class="transition-all duration-300 rounded-full cursor-pointer {currentSlide === i
						? 'w-2.5 h-2.5 bg-[#e11d48] ring-2 ring-white shadow-xs'
						: 'w-2 h-2 bg-pink-300/80 hover:bg-pink-400'}"
					aria-label="Go to slide {i + 1}"
				></button>
			{/each}
		</div>

		<!-- Bottom-Right Frosted Circular Arrow Controls (matching Cartup screenshot) -->
		<div class="absolute bottom-2 sm:bottom-3 right-2.5 sm:right-5 flex items-center gap-1.5 sm:gap-2 z-20">
			<!-- Prev Button -->
			<button
				type="button"
				onclick={prevSlide}
				class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/45 hover:bg-white/80 backdrop-blur-md border border-white/60 flex items-center justify-center text-[#e11d48] transition-all shadow-xs cursor-pointer active:scale-90"
				title="Previous Slide"
				aria-label="Previous slide"
			>
				<ChevronLeft class="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
			</button>

			<!-- Next Button -->
			<button
				type="button"
				onclick={nextSlide}
				class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/45 hover:bg-white/80 backdrop-blur-md border border-white/60 flex items-center justify-center text-[#e11d48] transition-all shadow-xs cursor-pointer active:scale-90"
				title="Next Slide"
				aria-label="Next slide"
			>
				<ChevronRight class="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
			</button>
		</div>

	</div>

</section>