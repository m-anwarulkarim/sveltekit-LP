<script lang="ts">
	import type { Product } from '#lib/modules/products/types.ts';
	import ProductSection from '#lib/modules/products/components/ProductSection.svelte';

	interface Props {
		products: Product[];
	}

	let { products }: Props = $props();
</script>

{#if products && products.length > 0}
	<ProductSection
		title="Related Products"
		subtitle="একই ক্যাটাগরির সেরা পণ্যসমূহ"
		icon="sparkles"
		iconColor="text-blue-600"
		badgeText="RECOMMENDED"
		badgeBg="bg-blue-50 text-[#2563eb] border border-blue-200"
		{products}
		seeAllLink="/catalog/all-product"
	/>
{/if}

