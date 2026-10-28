<script lang="ts">
	import ProductSection from './ProductSection.svelte';
	import type { Product } from '../types';

	interface Props {
		title?: string;
		subtitle?: string;
		seeAllLink?: string;
		products?: Product[];
	}

	let {
		title = 'Best Picks',
		subtitle = '',
		seeAllLink = '/catalog/all-product',
		products = []
	}: Props = $props();
</script>

<ProductSection
	{title}
	{subtitle}
	{seeAllLink}
	{products}
	icon="star"
	iconColor="text-amber-500"
/>
