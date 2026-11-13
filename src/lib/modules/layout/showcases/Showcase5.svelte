<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface Props {
		carousels?: any[];
	}

	let { carousels = [] }: Props = $props();

	let slides = $derived(
		carousels.length > 0
			? carousels.filter((c: any) => c.image)
			: [{ id: 'placeholder', image: '/images/banners/banner-home.svg', targetUrl: '/', name: '' }]
	);

	let currentSlide = $state(0);
	let isHovered = $state(false);
	let touchStartX = 0;

	function nextSlide() {
		if (slides.length <= 1) return;
		currentSlide = (currentSlide + 1) % slides.length;
	}

	function prevSlide() {
		if (slides.length <= 1) return;
		currentSlide = (currentSlide - 1 + slides.length) % slides.length;
	}

	onMount(() => {
		const interval = setInterval(() => {
			if (!isHovered) nextSlide();
		}, 4500);
		return () => clearInterval(interval);
	});

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}

	function handleTouchEnd(e: TouchEvent) {
		const diff = touchStartX - e.changedTouches[0].screenX;
		if (diff > 45) nextSlide();
		else if (diff < -45) prevSlide();
	}
</script>

<section class="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-200/90 bg-slate-100 aspect-[2.35/1] sm:aspect-[2.85/1] md:aspect-[3.3/1] min-h-[160px] sm:min-h-[220px] md:min-h-[270px]"
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
	>
		<div
			class="flex w-full h-full transition-transform duration-500 ease-out"
			style="transform: translateX(-{currentSlide * 100}%);"
		>
			{#each slides as slide, index}
				<a
					href={slide.targetUrl || '/'}
					class="w-full shrink-0 h-full block select-none"
				>
					{#if slide.mobileImage}
						<picture class="w-full h-full block">
							<source media="(max-width: 640px)" srcset={slide.mobileImage} />
							<img
								src={slide.image}
								alt={slide.name || 'Banner'}
								class="w-full h-full object-cover"
								loading={index === 0 ? 'eager' : 'lazy'}
								fetchpriority={index === 0 ? 'high' : 'auto'}
							/>
						</picture>
					{:else}
						<img
							src={slide.image}
							alt={slide.name || 'Banner'}
							class="w-full h-full object-cover"
							loading={index === 0 ? 'eager' : 'lazy'}
							fetchpriority={index === 0 ? 'high' : 'auto'}
						/>
					{/if}
				</a>
			{/each}
		</div>

		{#if slides.length > 1}
			<div class="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
				{#each slides as _, i}
					<button
						type="button"
						onclick={() => (currentSlide = i)}
						class="transition-all duration-300 rounded-full cursor-pointer {currentSlide === i
							? 'w-2.5 h-2.5 bg-white ring-2 ring-white/50 shadow-md'
							: 'w-2 h-2 bg-white/60 hover:bg-white/80'}"
						aria-label="Go to slide {i + 1}"
					></button>
				{/each}
			</div>

			<div class="absolute bottom-2 sm:bottom-3 right-2.5 sm:right-5 flex items-center gap-1.5 sm:gap-2 z-20">
				<button
					type="button"
					onclick={prevSlide}
					class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/45 hover:bg-white/80 backdrop-blur-md border border-white/60 flex items-center justify-center text-slate-700 transition-all shadow-xs cursor-pointer active:scale-90"
					aria-label="Previous slide"
				>
					<ChevronLeft class="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
				</button>
				<button
					type="button"
					onclick={nextSlide}
					class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/45 hover:bg-white/80 backdrop-blur-md border border-white/60 flex items-center justify-center text-slate-700 transition-all shadow-xs cursor-pointer active:scale-90"
					aria-label="Next slide"
				>
					<ChevronRight class="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
				</button>
			</div>
		{/if}
	</div>
</section>
