<script lang="ts">
	import type { Product } from '#lib/modules/products/types';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { Star, ShoppingBag, Eye, Check } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	interface Props {
		product: Product;
		onQuickView?: (product: Product) => void;
	}

	let { product, onQuickView }: Props = $props();

	const isOutOfStock = $derived(
		!product.isPreOrder &&
			(product.inStock === false || (product.totalStock !== undefined && product.totalStock <= 0))
	);

	const discountPercent = $derived.by(() => {
		if (product.discountPercent) return product.discountPercent;
		if (product.originalPrice > product.price) {
			return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
		}
		return 0;
	});

	let isAdded = $state(false);

	function handleAddToCart(e: MouseEvent) {
		e.stopPropagation();
		if (isOutOfStock) {
			toast.warning(`"${product.name}" পণ্যটি বর্তমানে স্টক আউট!`);
			return;
		}
		cart.addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			originalPrice: product.originalPrice,
			image: product.image,
			category: product.categoryLabel,
			inStock: product.inStock,
			totalStock: product.totalStock,
			isPreOrder: product.isPreOrder
		});
		isAdded = true;
		setTimeout(() => {
			isAdded = false;
		}, 1400);
	}
</script>

<!-- Product Card 1: Classic Clean E-Commerce Card (Fully Mobile Responsive) -->
<div
	role="link"
	tabindex="0"
	onclick={() => goto(`/products/${product.slug || product.id}`)}
	onkeydown={(e) => {
		if (e.key === 'Enter' && e.target === e.currentTarget) {
			goto(`/products/${product.slug || product.id}`);
		}
	}}
	class="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all p-2 sm:p-3 flex flex-col justify-between group cursor-pointer w-full select-none"
>
	<!-- Image Container -->
	<div class="relative w-full aspect-square rounded-lg sm:rounded-xl bg-slate-50 overflow-hidden mb-2 sm:mb-2.5">
		<img
			src={product.image}
			alt={product.name}
			loading="lazy"
			class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 {isOutOfStock ? 'grayscale opacity-75' : ''}"
		/>
		{#if isOutOfStock}
			<div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-2">
				<span class="bg-rose-600 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
					স্টক শেষ
				</span>
			</div>
		{/if}
		{#if discountPercent > 0}
			<span class="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] sm:text-[10px] font-black uppercase shadow-xs">
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
				class="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
				title="কুইক ভিউ"
			>
				<Eye class="w-3.5 h-3.5" />
			</button>
		{/if}
	</div>

	<!-- Title & Category (Uniform height across 1 or 2 lines) -->
	<div class="flex-1 flex flex-col justify-start">
		<span class="text-[9.5px] sm:text-[10.5px] font-bold text-slate-400 uppercase tracking-wider truncate">
			{product.categoryLabel || 'বীজ'}
		</span>
		<h3
			class="text-[11.5px] sm:text-[13px] font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-tight line-clamp-2 min-h-[1.9rem] sm:min-h-[2.2rem] mt-0.5"
			title={product.name}
		>
			{product.name}
		</h3>
	</div>

	<!-- Price & Add Button (Collision-Free Responsive Layout) -->
	<div class="flex items-center justify-between gap-1 sm:gap-2 mt-2 pt-2 border-t border-slate-100">
		<div class="flex flex-col min-w-0 flex-1">
			<span class="text-xs sm:text-sm font-black text-slate-900 leading-tight">৳{product.price}</span>
			{#if product.originalPrice > product.price}
				<span class="text-[9.5px] sm:text-[11px] text-slate-400 line-through leading-none mt-0.5">৳{product.originalPrice}</span>
			{/if}
		</div>

		{#if isOutOfStock}
			<span class="px-2 py-1 rounded-lg bg-slate-100 text-slate-400 text-[10px] sm:text-xs font-bold border border-slate-200">
				স্টক শেষ
			</span>
		{:else}
			<button
				type="button"
				onclick={handleAddToCart}
				class="h-7 w-7 sm:h-8 sm:w-auto sm:px-3 rounded-lg sm:rounded-xl {isAdded
					? 'bg-emerald-600 text-white'
					: 'bg-slate-900 hover:bg-emerald-600 text-white'} text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shrink-0 shadow-2xs active:scale-90"
				title="কার্টে যোগ করুন"
				aria-label="কার্টে যোগ করুন"
			>
				{#if isAdded}
					<Check class="w-3.5 h-3.5 stroke-[3]" />
				{:else}
					<ShoppingBag class="w-3.5 h-3.5" />
				{/if}
				<span class="hidden sm:inline">{isAdded ? 'যোগ হয়েছে' : 'কার্টে যোগ'}</span>
			</button>
		{/if}
	</div>
</div>

