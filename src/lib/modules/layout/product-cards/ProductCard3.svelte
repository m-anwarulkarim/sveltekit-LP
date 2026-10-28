<script lang="ts">
	import type { Product } from '#lib/modules/products/types';
	import ProductCard from '#lib/modules/products/components/ProductCard.svelte';

	interface Props {
		product: Product;
		onQuickView?: (product: Product) => void;
	}

	let { product, onQuickView }: Props = $props();
</script>

<!-- High-Conversion Sale Card (Product Card 3 Default) -->
<ProductCard {product} {onQuickView} />

