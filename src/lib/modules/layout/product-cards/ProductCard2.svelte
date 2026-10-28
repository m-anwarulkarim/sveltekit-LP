<script lang="ts">
	import type { Product } from '#lib/modules/products/types';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { Heart, ShoppingBag, Eye, Star } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	interface Props {
		product: Product;
		onQuickView?: (product: Product) => void;
	}

	let { product, onQuickView }: Props = $props();

	const discountPercent = $derived.by(() => {
		if (product.discountPercent) return product.discountPercent;
		if (product.originalPrice > product.price) {
			return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
		}
		return 0;
	});

	function handleAddToCart(e: MouseEvent) {
		e.stopPropagation();
		cart.addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			originalPrice: product.originalPrice,
			image: product.image,
			category: product.categoryLabel
		});
	}
</script>

<!-- Product Card 2: Minimalist Boutique Card with Soft Framing -->
<div
	onclick={() => goto(`/products/${product.slug || product.id}`)}
	class="group relative bg-white/80 hover:bg-white rounded-2xl p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-100 flex flex-col justify-between cursor-pointer"
>
	<!-- Thumbnail & Overlay Badges -->
	<div class="relative w-full aspect-square rounded-xl bg-slate-50/80 overflow-hidden mb-3">
		<img
			src={product.image}
			alt={product.name}
			loading="lazy"
			class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
		/>

		{#if discountPercent > 0}
			<span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-white text-[10px] font-bold tracking-wider backdrop-blur-xs shadow-xs">
				-{discountPercent}%
			</span>
		{/if}

		<!-- Floating Action Bar -->
		<div class="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
			{#if onQuickView}
				<button
					type="button"
					onclick={(e) => {
						e.stopPropagation();
						onQuickView(product);
					}}
					title="কুইক ভিউ"
					class="w-8 h-8 rounded-full bg-white/95 text-slate-700 hover:text-blue-600 hover:bg-white shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-90"
				>
					<Eye class="w-3.5 h-3.5" />
				</button>
			{/if}
			<button
				type="button"
				onclick={handleAddToCart}
				title="কার্টে যোগ করুন"
				class="px-3 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
			>
				<ShoppingBag class="w-3.5 h-3.5" />
				<span>Add</span>
			</button>
		</div>
	</div>

	<!-- Content Details -->
	<div class="space-y-1.5">
		{#if product.categoryLabel}
			<span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
				{product.categoryLabel}
			</span>
		{/if}

		<h3 class="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
			{product.name}
		</h3>

		<div class="flex items-center gap-1 text-amber-400 text-[11px]">
			<Star class="w-3 h-3 fill-amber-400 text-amber-400" />
			<span class="font-bold text-slate-700">{product.rating || 4.8}</span>
			<span class="text-slate-400 text-[10px]">({product.reviewsCount || 12})</span>
		</div>

		<div class="flex items-baseline gap-2 pt-1">
			<span class="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
				৳{product.price.toLocaleString()}
			</span>
			{#if product.originalPrice > product.price}
				<span class="text-xs text-slate-400 line-through font-mono">
					৳{product.originalPrice.toLocaleString()}
				</span>
			{/if}
		</div>
	</div>
</div>

