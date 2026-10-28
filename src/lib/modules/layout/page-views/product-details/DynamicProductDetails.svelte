<script lang="ts">
	import ProductDetails1 from './ProductDetails1.svelte';
	import ProductDetails2 from './ProductDetails2.svelte';

	interface Props {
		activeProductDetails?: string;
		isStandalonePreview?: boolean;
	}

	let {
		activeProductDetails = 'product_details_1',
		isStandalonePreview = false
	}: Props = $props();

	let normalized = $derived((activeProductDetails || 'product_details_1').toLowerCase().trim());
</script>

{#if normalized === 'product_details_2'}
	<ProductDetails2 {isStandalonePreview} />
{:else}
	<!-- Product Details 1 is Default -->
	<ProductDetails1 {isStandalonePreview} />
{/if}

