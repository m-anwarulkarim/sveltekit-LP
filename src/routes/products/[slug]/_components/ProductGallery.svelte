<script lang="ts">
	import type { Product } from '#lib/modules/products/types.ts';
	import { Button, Badge } from '#lib/components/ui';
	import { ChevronLeft, ChevronRight, Maximize2, X, Zap } from 'lucide-svelte';

	interface Props {
		product: Product;
	}

	let { product }: Props = $props();

	// Gallery images list (uses product.image and complementary angles)
	const galleryImages = $derived.by(() => {
		const imgs = [product.image];
		// If single image, provide complementary viewports
		if (imgs.length === 1) {
			imgs.push(product.image, product.image);
		}
		return imgs;
	});

	let activeIndex = $state(0);
	let isLightboxOpen = $state(false);
	let zoomStyle = $state('');

	function handleMouseMove(e: MouseEvent) {
		const target = e.currentTarget as HTMLElement;
		const { left, top, width, height } = target.getBoundingClientRect();
		const x = ((e.clientX - left) / width) * 100;
		const y = ((e.clientY - top) / height) * 100;
		zoomStyle = `transform-origin: ${x}% ${y}%; transform: scale(1.75);`;
	}

	function handleMouseLeave() {
		zoomStyle = 'transform-origin: center center; transform: scale(1);';
	}

	function nextImage() {
		activeIndex = (activeIndex + 1) % galleryImages.length;
	}

	function prevImage() {
		activeIndex = (activeIndex - 1 + galleryImages.length) % galleryImages.length;
	}
</script>

<div class="space-y-4">
	<!-- 1. Main Stage Image Viewer -->
	<div class="relative w-full aspect-square rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden group">
		<!-- Hanging Discount Badge (Matching Screenshot) -->
		{#if product.discountPercent && product.discountPercent > 0}
			<div class="absolute top-3.5 left-3.5 z-20 bg-red-600 text-white px-2 py-1 rounded-sm shadow-sm flex flex-col items-center justify-center leading-none text-center">
				<span class="text-xs font-black">{product.discountPercent}%</span>
				<span class="text-[8px] font-black uppercase tracking-tight mt-0.5">OFF</span>
			</div>
		{/if}

		<!-- Fullscreen Lightbox Button with shadcn Button -->
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onclick={() => (isLightboxOpen = true)}
			class="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-xs border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100 p-0 cursor-pointer"
			title="Fullscreen Image"
			aria-label="Fullscreen Image"
		>
			<Maximize2 class="w-4 h-4" />
		</Button>

		<!-- Interactive Image Container with Hover Magnifier -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="w-full h-full flex items-center justify-center p-6 sm:p-10 overflow-hidden cursor-crosshair"
			onmousemove={handleMouseMove}
			onmouseleave={handleMouseLeave}
		>
			<img
				src={galleryImages[activeIndex]}
				alt={product.name}
				class="w-full h-full object-contain transition-transform duration-200 ease-out"
				style={zoomStyle}
			/>
		</div>

		<!-- Mobile Navigation Arrows Overlay with shadcn Button -->
		{#if galleryImages.length > 1}
			<div class="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onclick={prevImage}
					class="w-8 h-8 rounded-full bg-white/90 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-white transition-all cursor-pointer pointer-events-auto active:scale-95 p-0"
					aria-label="Previous image"
				>
					<ChevronLeft class="w-4 h-4 stroke-[2.5]" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onclick={nextImage}
					class="w-8 h-8 rounded-full bg-white/90 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-white transition-all cursor-pointer pointer-events-auto active:scale-95 p-0"
					aria-label="Next image"
				>
					<ChevronRight class="w-4 h-4 stroke-[2.5]" />
				</Button>
			</div>
		{/if}

		<!-- Fast Delivery Pill Bottom Overlay using shadcn Badge -->
		<div class="absolute bottom-3.5 left-3.5 z-20 pointer-events-none">
			<Badge variant="outline" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border-transparent backdrop-blur-xs text-white text-[10.5px] font-bold shadow-sm">
				<Zap class="w-3 h-3 text-amber-400 fill-amber-400" />
				<span>{product.deliveryTime || '12-24 HOURS DELIVERY'}</span>
			</Badge>
		</div>
	</div>

	<!-- 2. Thumbnails Strip -->
	{#if galleryImages.length > 1}
		<div class="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-1">
			{#each galleryImages as img, idx}
				<button
					type="button"
					onclick={() => (activeIndex = idx)}
					class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border-2 p-1.5 transition-all cursor-pointer shrink-0 overflow-hidden {activeIndex === idx
						? 'border-[#2563eb] shadow-sm ring-2 ring-blue-100 scale-102'
						: 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'}"
					aria-label="View thumbnail {idx + 1}"
				>
					<img src={img} alt="Thumbnail {idx + 1}" class="w-full h-full object-contain" />
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Lightbox Fullscreen Modal -->
{#if isLightboxOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
		onclick={() => (isLightboxOpen = false)}
	>
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onclick={() => (isLightboxOpen = false)}
			class="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer p-0"
			aria-label="Close Lightbox"
		>
			<X class="w-6 h-6" />
		</Button>

		<div class="max-w-3xl max-h-[85vh] p-4 flex items-center justify-center">
			<img
				src={galleryImages[activeIndex]}
				alt={product.name}
				class="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
			/>
		</div>
	</div>
{/if}
