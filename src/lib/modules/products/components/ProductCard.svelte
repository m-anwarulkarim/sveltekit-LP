<script lang="ts">
	import type { Product } from '../types';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { Star, Check, ShoppingBag, Eye } from 'lucide-svelte';

	interface Props {
		product: Product;
		onQuickView: (product: Product) => void;
	}

	let { product, onQuickView }: Props = $props();

	function formatPrice(cents: number) {
		return `$${(cents / 100).toFixed(0)}`;
	}

	function handleAddToCart() {
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

<div class="glass-card rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden border border-white/10 hover:border-violet-500/40">
	<div>
		<!-- Top Badge & Quick View button -->
		<div class="flex items-center justify-between mb-4">
			<span class="text-[11px] font-semibold px-2.5 py-1 rounded-full border {product.badgeColor}">
				{product.badge}
			</span>
			<button
				onclick={() => onQuickView(product)}
				class="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
				title="Quick View Specifications"
			>
				<Eye class="w-4 h-4" />
			</button>
		</div>

		<!-- Product Image -->
		<div class="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/5 mb-5 flex items-center justify-center p-3">
			<img
				src={product.image}
				alt={product.name}
				class="w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
				loading="lazy"
			/>
		</div>

		<!-- Star Rating -->
		<div class="flex items-center gap-1.5 mb-2">
			<div class="flex text-amber-400">
				{#each Array(5) as _}
					<Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
				{/each}
			</div>
			<span class="text-xs font-bold text-slate-200">{product.rating}</span>
			<span class="text-[11px] text-slate-500">({product.reviewsCount})</span>
		</div>

		<h3 class="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors font-heading mb-1">
			{product.name}
		</h3>
		<p class="text-xs text-slate-400 mb-4 line-clamp-2">
			{product.tagline}
		</p>

		<!-- Feature Bullets -->
		<div class="space-y-1.5 mb-6">
			{#each product.features.slice(0, 3) as feat}
				<div class="flex items-center gap-2 text-[11px] text-slate-300">
					<Check class="w-3.5 h-3.5 text-cyan-400 shrink-0" />
					<span class="truncate">{feat}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Price & Action -->
	<div class="pt-4 border-t border-white/10 flex items-center justify-between">
		<div>
			<div class="text-xs text-slate-400 line-through">{formatPrice(product.originalPrice)}</div>
			<div class="text-xl font-extrabold text-white font-heading">{formatPrice(product.price)}</div>
		</div>

		<button
			onclick={handleAddToCart}
			class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all hover:scale-105 active:scale-95"
		>
			<ShoppingBag class="w-3.5 h-3.5" />
			<span>Add to Bag</span>
		</button>
	</div>
</div>
