<script lang="ts">
	import type { Product } from '../types';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { Button, Badge } from '#lib/components/ui';
	import { Check, X } from 'lucide-svelte';

	interface Props {
		product: Product | null;
		onClose: () => void;
	}

	let { product, onClose }: Props = $props();

	function formatPrice(amount: number) {
		return `৳${amount}`;
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
						<Badge variant="outline" class="text-xs font-bold uppercase tracking-wider text-cyan-400 border-cyan-400/30 bg-cyan-500/10">
							{product.categoryLabel}
						</Badge>
						<Button
							variant="ghost"
							size="icon"
							onclick={onClose}
							class="h-8 w-8 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
							aria-label="Close dialog"
						>
							<X class="w-4 h-4" />
						</Button>
					</div>

					<h3 class="text-2xl font-extrabold text-white font-heading">{product.name}</h3>
					<p class="text-xs text-slate-300 leading-relaxed">{product.description}</p>

					<div class="space-y-2 py-2">
						<div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Specifications:</div>
						{#each product.features || [] as feat}
							<div class="flex items-center gap-2 text-xs text-slate-200">
								<Check class="w-4 h-4 text-emerald-400" />
								<span>{feat}</span>
							</div>
						{/each}
					</div>

					<div class="flex items-center justify-between pt-4 border-t border-white/10">
						<div class="text-2xl font-black text-white font-heading">{formatPrice(product.price)}</div>
						<Button
							variant="default"
							onclick={handleAddToCart}
							class="h-auto px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg hover:scale-105 transition-transform border-0"
						>
							Add to Bag Now
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}