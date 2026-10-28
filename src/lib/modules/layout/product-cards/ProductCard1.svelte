<script lang="ts">
	import type { Product } from '#lib/modules/products/types';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { Star, ShoppingBag, Eye } from 'lucide-svelte';
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

<!-- Product Card 1: Classic Clean E-Commerce Card -->
<div
	onclick={() => goto(`/products/${product.slug || product.id}`)}
	class="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all p-3 flex flex-col justify-between group cursor-pointer"
>
	<!-- Image Container -->
	<div class="relative w-full aspect-square rounded-lg bg-slate-50 overflow-hidden mb-3">
		<img
			src={product.image}
			alt={product.name}
			loading="lazy"
			class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
		/>
		{#if discountPercent > 0}
			<span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase shadow-xs">
				-{discountPercent}%
			</span>
		{/if}

		{#if onQuickView}
			<button
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					onQuickView(product);
				}}
				class="absolute bottom-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
				title="কুইক ভিউ"
			>
				<Eye class="w-3.5 h-3.5" />
			</button>
		{/if}
	</div>

	<!-- Title & Category -->
	<div>
		<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.categoryLabel}</span>
		<h3 class="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-[#2563eb] transition-colors">
			{product.name}
		</h3>
	</div>

	<!-- Price & Add Button -->
	<div class="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100">
		<div class="flex flex-col">
			<span class="text-sm font-black text-slate-900">৳{product.price}</span>
			{#if product.originalPrice > product.price}
				<span class="text-[11px] text-slate-400 line-through">৳{product.originalPrice}</span>
			{/if}
		</div>

		<button
			type="button"
			onclick={handleAddToCart}
			class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#2563eb] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
		>
			<ShoppingBag class="w-3.5 h-3.5" />
			<span>কার্টে যোগ</span>
		</button>
	</div>
</div>

