<script lang="ts">
	import type { Product } from '#lib/modules/products/types';
	import ProductCard1 from './ProductCard1.svelte';
	import ProductCard2 from './ProductCard2.svelte';
	import ProductCard3 from './ProductCard3.svelte';

	interface Props {
		product: Product;
		activeCard?: string;
		onQuickView?: (product: Product) => void;
	}

	let {
		product,
		activeCard = 'product_card_3',
		onQuickView
	}: Props = $props();

	let normalized = $derived((activeCard || 'product_card_3').toLowerCase().trim());
</script>

{#if normalized === 'product_card_1'}
	<ProductCard1 {product} {onQuickView} />
{:else if normalized === 'product_card_2'}
	<ProductCard2 {product} {onQuickView} />
{:else}
	<!-- Product Card 3 is Default -->
	<ProductCard3 {product} {onQuickView} />
{/if}
