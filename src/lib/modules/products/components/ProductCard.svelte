<script lang="ts">
	import type { Product } from '../types';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { Button } from '#lib/components/ui';
	import { Star, Zap, Check } from 'lucide-svelte';
	import OptimizedImage from '#lib/components/storefront/OptimizedImage.svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	interface Props {
		product: Product;
		onQuickView?: (product: Product) => void;
	}

	let { product, onQuickView }: Props = $props();

	// Stock out status detection
	const isOutOfStock = $derived(
		!product.isPreOrder &&
			(product.inStock === false || (product.totalStock !== undefined && product.totalStock <= 0))
	);

	// Calculate discount percentage if not explicitly provided
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

	function handleBuyNow(e: MouseEvent) {
		e.stopPropagation();
		if (isOutOfStock) {
			toast.warning(`"${product.name}" পণ্যটি বর্তমানে স্টক আউট!`);
			return;
		}
		cart.addItem(
			{
				id: product.id,
				name: product.name,
				price: product.price,
				originalPrice: product.originalPrice,
				image: product.image,
				category: product.categoryLabel,
				inStock: product.inStock,
				totalStock: product.totalStock,
				isPreOrder: product.isPreOrder
			},
			false
		);
		cart.closeCart();
		goto('/checkout');
	}
</script>

<!-- Product Card Matching Screenshot Style -->
<div
	class="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 p-2 sm:p-3 flex flex-col justify-between relative group hover:-translate-y-1 w-full select-none"
>
	<!-- Top-Left Hanging Blue Discount Badge (Matching Screenshot) -->
	{#if discountPercent > 0}
		<div
			class="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 bg-rose-600 text-white px-1 sm:px-1.5 py-0.5 rounded-xs sm:rounded-sm shadow-2xs flex flex-col items-center justify-center leading-none text-center"
		>
			<span class="text-[8px] sm:text-[9.5px] font-black">{discountPercent}%</span>
			<span class="text-[6px] sm:text-[7px] font-black uppercase tracking-tight mt-0.5">OFF</span>
		</div>
	{/if}

	<!-- Top & Image Area -->
	<div>
		<!-- Product Image (Aspect Square, crisp white background) -->
		<a href="/products/{product.slug}" class="block relative w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-slate-50/80 mb-1.5 p-1 sm:p-1.5 cursor-pointer">
			<OptimizedImage
				src={product.image}
				alt={product.name}
				width={400}
				height={400}
				class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 {isOutOfStock ? 'grayscale opacity-75' : ''}"
			/>
			{#if isOutOfStock}
				<div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-2">
					<span class="bg-rose-600 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
						স্টক শেষ
					</span>
				</div>
			{/if}
		</a>

		<!-- Delivery Time Pill Badge (e.g. 12-24 HOURS with lightning/rocket icon) -->
		<div class="mb-1 sm:mb-1.5 flex items-center">
			<span class="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-800 text-slate-100 text-[8px] sm:text-[9.5px] font-bold shadow-2xs">
				<Zap class="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
				<span>{product.deliveryTime || '12-24 HOURS'}</span>
			</span>
		</div>

		<!-- Product Title (Clamped to 2 lines, clean typography) -->
		<a href="/products/{product.slug}" class="block cursor-pointer">
			<h3
				class="text-[11px] sm:text-[13px] font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-tight line-clamp-2 min-h-[1.9rem] sm:min-h-[2.2rem] mb-1"
				title={product.name}
			>
				{product.name}
			</h3>
		</a>

		<!-- Star Rating & Review Count -->
		{#if product.rating && product.reviewsCount}
			<div class="flex items-center gap-1 mb-1.5 sm:mb-2">
				<div class="flex text-amber-400 gap-0.5" role="img" aria-label="{product.rating} / 5">
					{#each Array(5) as _, i}
						<Star
							class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 {i < Math.round(product.rating)
								? 'fill-amber-400'
								: ''}"
						/>
					{/each}
				</div>
				<span class="text-[10px] sm:text-[11px] text-slate-400 font-medium">
					({product.reviewsCount})
				</span>
			</div>
		{/if}
	</div>

	<!-- Bottom Price & Action Buttons -->
	<div class="pt-1.5 sm:pt-2 border-t border-slate-100 flex flex-col gap-1.5 sm:gap-2 mt-auto">
		<!-- Price display -->
		<div class="flex items-baseline gap-1.5 min-w-0">
			<span class="text-xs sm:text-sm md:text-[15px] font-black text-slate-900 leading-tight">
				৳{product.price}
			</span>
			{#if product.originalPrice > product.price}
				<span class="text-[9px] sm:text-[10.5px] text-slate-400 line-through font-medium">
					৳{product.originalPrice}
				</span>
			{/if}
		</div>

		<!-- Action Buttons: Buy Now & ADD -->
		{#if isOutOfStock}
			<div class="w-full">
				<Button
					type="button"
					variant="secondary"
					size="sm"
					disabled
					class="h-7 sm:h-7.5 w-full rounded-lg bg-slate-100 text-slate-400 font-bold text-[10px] sm:text-xs cursor-not-allowed border border-slate-200"
				>
					স্টক আউট (Stock Out)
				</Button>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-1 sm:gap-1.5 w-full">
				<!-- Buy Now (Instant Checkout) -->
				<Button
					type="button"
					variant="default"
					size="sm"
					onclick={handleBuyNow}
					class="h-7 sm:h-7.5 px-1 sm:px-2 rounded-lg bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-[9px] sm:text-xs shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
				>
					<Zap class="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current shrink-0" />
					<span class="truncate">Buy Now</span>
				</Button>

				<!-- ADD Button (Cart drawer) -->
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={handleAddToCart}
					class="h-7 sm:h-7.5 px-1 sm:px-2 rounded-lg border-emerald-300 bg-emerald-50/50 hover:bg-emerald-600 text-emerald-800 hover:text-white text-[9px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-200 active:scale-95 flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
				>
					{#if isAdded}
						<Check class="w-3 h-3 text-emerald-600 stroke-[3]" />
						<span class="text-emerald-700">ADDED</span>
					{:else}
						<span>ADD</span>
					{/if}
				</Button>
			</div>
		{/if}
	</div>
</div>
