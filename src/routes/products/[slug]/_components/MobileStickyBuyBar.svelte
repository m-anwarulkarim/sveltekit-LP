<script lang="ts">
	import type { Product } from '#lib/modules/products/types.ts';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { Button } from '#lib/components/ui';
	import { Zap, ShoppingBag } from 'lucide-svelte';

	interface Props {
		product: Product;
		onBuyNow: () => void;
	}

	let { product, onBuyNow }: Props = $props();

	function handleAddToCart() {
		cart.addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			originalPrice: product.originalPrice,
			image: product.image,
			category: product.categoryLabel
		});
		cart.openCart();
	}

	function handleBuyNow() {
		cart.addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			originalPrice: product.originalPrice,
			image: product.image,
			category: product.categoryLabel
		}, false);
		cart.closeCart();
		onBuyNow();
	}
</script>

<!-- Mobile Sticky Bottom Floating Action Bar -->
<div class="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-3 md:hidden font-['Anek_Bangla',sans-serif]">
	<div class="flex items-center justify-between gap-3 max-w-lg mx-auto">
		
		<!-- Left: Mini Product Info -->
		<div class="flex items-center gap-2.5 min-w-0">
			<div class="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 p-1 shrink-0 overflow-hidden">
				<img src={product.image} alt={product.name} class="w-full h-full object-contain" />
			</div>
			<div class="min-w-0">
				<div class="text-[11px] font-bold text-slate-800 truncate">{product.name}</div>
				<div class="text-sm font-black text-slate-900 leading-tight font-mono">৳{product.price}</div>
			</div>
		</div>

		<!-- Right: Action Buttons with shadcn Button -->
		<div class="flex items-center gap-2 shrink-0">
			<!-- Add to Cart Icon Button -->
			<Button
				type="button"
				variant="outline"
				size="icon"
				onclick={handleAddToCart}
				class="w-10 h-10 rounded-xl bg-slate-100 border-slate-200 text-slate-700"
				title="কার্টে যোগ করুন"
				aria-label="Add to cart"
			>
				<ShoppingBag class="w-5 h-5 text-teal-700" />
			</Button>

			<!-- Buy Now Primary Button -->
			<Button
				type="button"
				variant="default"
				onclick={handleBuyNow}
				class="h-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 border-0"
			>
				<Zap class="w-3.5 h-3.5 fill-slate-950 stroke-none" />
				<span>অর্ডার করুন</span>
			</Button>
		</div>

	</div>
</div>
