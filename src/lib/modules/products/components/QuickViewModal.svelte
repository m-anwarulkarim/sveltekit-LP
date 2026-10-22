<script lang="ts">
	import type { Product } from '../types';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { Check } from 'lucide-svelte';

	interface Props {
		product: Product | null;
		onClose: () => void;
	}

	let { product, onClose }: Props = $props();

	function formatPrice(cents: number) {
		return `$${(cents / 100).toFixed(0)}`;
	}

	function handleAddToCart() {
		if (!product) return;
		cart.addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			originalPrice: product.originalPrice,
			image: product.image,
			category: product.categoryLabel
		});
		onClose();
	}
</script>

{#if product}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
		<div class="relative w-full max-w-2xl bg-[#11131f] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
				<div class="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/60">
					<img src={product.image} alt={product.name} class="w-full h-full object-cover" />
				</div>
				<div class="flex flex-col gap-4">
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold uppercase tracking-wider text-cyan-400">
							{product.categoryLabel}
						</span>
						<button
							onclick={onClose}
							class="text-slate-400 hover:text-white p-1 rounded-lg"
							aria-label="Close dialog"
						>
							✕
						</button>
					</div>

					<h3 class="text-2xl font-extrabold text-white font-heading">{product.name}</h3>
					<p class="text-xs text-slate-300 leading-relaxed">{product.description}</p>

					<div class="space-y-2 py-2">
						<div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Specifications:</div>
						{#each product.features as feat}
							<div class="flex items-center gap-2 text-xs text-slate-200">
								<Check class="w-4 h-4 text-emerald-400" />
								<span>{feat}</span>
							</div>
						{/each}
					</div>

					<div class="flex items-center justify-between pt-4 border-t border-white/10">
						<div class="text-2xl font-black text-white font-heading">{formatPrice(product.price)}</div>
						<button
							onclick={handleAddToCart}
							class="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs shadow-lg hover:scale-105 transition-transform"
						>
							Add to Bag Now
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
