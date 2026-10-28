<script lang="ts">
	import { onMount } from 'svelte';
	import type { Product } from '../types';
	import ProductCard from './ProductCard.svelte';
	import { Button } from '#lib/components/ui';
	import {
		ChevronLeft,
		ChevronRight,
		ArrowRight,
		Flame,
		Sparkles,
		Star,
		TrendingUp,
		Zap,
		Tag
	} from 'lucide-svelte';

	interface Props {
		title: string;
		subtitle?: string;
		icon?: 'flame' | 'sparkles' | 'star' | 'trending' | 'zap' | 'tag';
		iconColor?: string;
		badgeText?: string;
		badgeBg?: string;
		seeAllLink?: string;
		products: Product[];
	}

	let {
		title = 'Best Picks',
		subtitle = '',
		icon = 'star',
		iconColor = 'text-amber-500',
		badgeText = '',
		badgeBg = 'bg-rose-50 text-rose-600 border border-rose-200',
		seeAllLink = '/catalog/all-product',
		products = []
	}: Props = $props();

	let trackEl: HTMLDivElement | null = $state(null);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(true);

	function updateScrollState() {
		if (!trackEl) return;
		const { scrollLeft, scrollWidth, clientWidth } = trackEl;
		canScrollLeft = scrollLeft > 10;
		canScrollRight = scrollLeft + clientWidth < scrollWidth - 10;
	}

	function scroll(direction: 'left' | 'right') {
		if (!trackEl) return;
		const scrollAmount = trackEl.clientWidth;
		trackEl.scrollBy({
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

<!-- Reusable Product Section Carousel -->
<section class="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3.5 select-none font-['Anek_Bangla',sans-serif]">
	
	<!-- Outer White Panel -->
	<div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-3 sm:p-6 relative">
		
		<!-- Section Header Row: Completely Responsive & Zero Collision -->
		<div class="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 px-0.5">
			
			<!-- Left: Title, Icon & Optional Badge -->
			<div class="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
				<!-- Icon Representation -->
				<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
					{#if icon === 'flame'}
						<Flame class="w-4 h-4 sm:w-4.5 sm:h-4.5 {iconColor}" />
					{:else if icon === 'sparkles'}
						<Sparkles class="w-4 h-4 sm:w-4.5 sm:h-4.5 {iconColor}" />
					{:else if icon === 'trending'}
						<TrendingUp class="w-4 h-4 sm:w-4.5 sm:h-4.5 {iconColor}" />
					{:else if icon === 'zap'}
						<Zap class="w-4 h-4 sm:w-4.5 sm:h-4.5 {iconColor}" />
					{:else if icon === 'tag'}
						<Tag class="w-4 h-4 sm:w-4.5 sm:h-4.5 {iconColor}" />
					{:else}
						<Star class="w-4 h-4 sm:w-4.5 sm:h-4.5 {iconColor}" />
					{/if}
				</div>

				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
						<h2 class="text-[13px] sm:text-base md:text-xl font-bold text-slate-900 font-['Outfit',sans-serif] tracking-tight leading-tight truncate">
							{title}
						</h2>
						{#if badgeText}
							<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider shrink-0 {badgeBg}">
								{badgeText}
							</span>
						{/if}
					</div>
					{#if subtitle}
						<p class="text-[10px] sm:text-xs text-slate-400 font-medium truncate leading-tight mt-0.5">
							{subtitle}
						</p>
					{/if}
				</div>
			</div>

			<!-- Right: See All Link -->
			<a
				href={seeAllLink}
				class="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-500 hover:text-[#5845eb] transition-colors flex items-center gap-0.5 sm:gap-1 shrink-0 ml-auto whitespace-nowrap pl-1 group"
			>
				<span>see all</span>
				<ArrowRight class="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
			</a>
		</div>

		<!-- Product Carousel Row: Exactly 2 cards clearly visible in 1 line on mobile -->
		<div class="relative group/picks">
			
			<!-- Left Circular Navigation Button (appears when scrolled right) -->
			{#if canScrollLeft}
				<Button
					type="button"
					variant="outline"
					size="icon"
					onclick={() => scroll('left')}
					class="absolute -left-1.5 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-9 sm:h-9 bg-white/95 backdrop-blur-xs rounded-full border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer active:scale-95 p-0"
					title="Scroll Left"
					aria-label="Scroll Left"
				>
					<ChevronLeft class="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.5]" />
				</Button>
			{/if}

			<!-- Scrollable Products Track: 2 cards per row on mobile (w-[calc((100%-10px)/2)]) -->
			<div
				bind:this={trackEl}
				onscroll={updateScrollState}
				class="flex items-stretch gap-2.5 sm:gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 snap-x snap-mandatory"
			>
				{#each products as product (product.id)}
					<div class="w-[calc((100%-10px)/2)] sm:w-48 md:w-52 shrink-0 flex snap-start">
						<ProductCard {product} />
					</div>
				{/each}
			</div>

			<!-- Right Circular Navigation Button -->
			{#if canScrollRight}
				<Button
					type="button"
					variant="outline"
					size="icon"
					onclick={() => scroll('right')}
					class="absolute -right-1.5 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-9 sm:h-9 bg-white/95 backdrop-blur-xs rounded-full border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer active:scale-95 p-0"
					title="Scroll Right"
					aria-label="Scroll Right"
				>
					<ChevronRight class="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.5]" />
				</Button>
			{/if}

		</div>

	</div>

</section>
