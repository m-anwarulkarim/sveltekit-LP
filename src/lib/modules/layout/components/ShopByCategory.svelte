<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronLeft, ChevronRight, ArrowRight, Sprout, Sparkles, Shovel } from 'lucide-svelte';

	interface Props {
		categories?: any[];
	}

	let { categories = [] }: Props = $props();

	interface Category {
		id: string;
		name: string;
		slug: string;
		image?: string;
		icon?: string;
		accentColor?: string;
	}

	// Derived active categories: live database records only
	const activeCategories = $derived.by<Category[]>(() => {
		if (categories && categories.length > 0) {
			return categories.map((c) => ({
				id: c.id,
				name: c.name,
				slug: c.slug || c.id,
				image: c.image || '',
				icon: c.icon || '🌱',
				accentColor: c.accentColor || '#10b981'
			}));
		}
		return [];
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

{#if activeCategories.length > 0}
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
				class="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors group cursor-pointer"
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
						<div class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-white border border-slate-100 group-hover:border-emerald-300 shadow-xs group-hover:shadow-md transition-all duration-300 flex items-center justify-center p-2.5 sm:p-3 relative transform group-hover:-translate-y-1 overflow-hidden">
							
							{#if category.image}
								<img
									src={category.image}
									alt={category.name}
									width={160}
									height={160}
									decoding="async"
									class="w-full h-full object-contain p-1 transform group-hover:scale-105 transition-transform"
									loading="lazy"
									onerror={(e) => {
										(e.currentTarget as HTMLElement).style.display = 'none';
										const fallback = (e.currentTarget as HTMLElement).nextElementSibling as HTMLElement;
										if (fallback) fallback.classList.remove('hidden');
									}}
								/>
								<div class="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50/60 to-teal-50/40 rounded-xl">
									{#if category.icon}
										<span class="text-3xl sm:text-4xl filter drop-shadow-xs transform group-hover:scale-110 transition-transform">{category.icon}</span>
									{:else}
										<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
											<Sprout class="w-6 h-6" />
										</div>
									{/if}
								</div>
							{:else if category.icon}
								<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50/60 to-teal-50/40 rounded-xl">
									<span class="text-3xl sm:text-4xl filter drop-shadow-xs transform group-hover:scale-110 transition-transform">{category.icon}</span>
								</div>
							{:else}
								<!-- Generic Modern Agricultural Category Icon -->
								<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
									<Sprout class="w-5 h-5 sm:w-6 sm:h-6" />
								</div>
							{/if}

						</div>

						<!-- Category Label Below the Card (Matching screenshot styling) -->
						<span class="mt-2 text-xs sm:text-[13px] font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors max-w-[80px] sm:max-w-[100px] md:max-w-[110px] truncate leading-tight">
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
{/if}
