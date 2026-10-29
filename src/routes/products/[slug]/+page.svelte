<script lang="ts">
	import type { PageData } from './$types';
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import ProductGallery from './_components/ProductGallery.svelte';
	import ProductBuyBox from './_components/ProductBuyBox.svelte';
	import ProductTabs from './_components/ProductTabs.svelte';
	import RelatedProducts from './_components/RelatedProducts.svelte';
	import MobileStickyBuyBar from './_components/MobileStickyBuyBar.svelte';
	import { ChevronRight, Home } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { trackMetaEvent } from '#lib/client/meta-pixel';

	let { data }: { data: PageData } = $props();

	const product = $derived(data.product);
	const relatedProducts = $derived(data.relatedProducts || []);

	// Fire Standard Meta Pixel ViewContent event
	$effect(() => {
		if (product && typeof window !== 'undefined') {
			const matchId = String(product.sku || product.id);
			trackMetaEvent('ViewContent', {
				content_name: product.name,
				content_ids: [matchId],
				content_type: 'product',
				value: Number(product.salePrice || product.price || 0),
				currency: 'BDT'
			});
		}
	});
</script>

<svelte:head>
	<title>{product.name} | AURA Store</title>
	<meta
		name="description"
		content={product.description || `${product.name} - কিনুন সেরা মূল্যে AURA স্টোর থেকে।`}
	/>
	<meta property="og:title" content="{product.name} | AURA Store" />
	<meta property="og:description" content={product.tagline || product.name} />
	<meta property="og:image" content={product.image} />
	<link rel="canonical" href="https://lp.haqplus.com/products/{product.slug}" />
	{#if data?.productJsonLd}
		{@html `<script type="application/ld+json">${JSON.stringify(data.productJsonLd)}</script>`}
	{/if}
	{#if data?.breadcrumbsJsonLd}
		{@html `<script type="application/ld+json">${JSON.stringify(data.breadcrumbsJsonLd)}</script>`}
	{/if}
</svelte:head>

<StoreLayout user={data.user}>
	
	<div class="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 font-['Anek_Bangla',sans-serif]">
		
		<!-- 1. Breadcrumbs Navigation Trail -->
		<nav class="flex items-center gap-1.5 text-xs text-slate-400 mb-4 sm:mb-6 overflow-x-auto no-scrollbar py-1">
			<a href="/" class="hover:text-slate-800 transition-colors flex items-center gap-1 shrink-0">
				<Home class="w-3.5 h-3.5" />
				<span>হোম</span>
			</a>
			<ChevronRight class="w-3.5 h-3.5 text-slate-300 shrink-0" />
			<a href="/catalog/all-category" class="hover:text-slate-800 transition-colors shrink-0">
				ক্যাটাগরি
			</a>
			<ChevronRight class="w-3.5 h-3.5 text-slate-300 shrink-0" />
			<span class="hover:text-slate-800 transition-colors text-slate-600 font-semibold shrink-0">
				{product.categoryLabel}
			</span>
			<ChevronRight class="w-3.5 h-3.5 text-slate-300 shrink-0" />
			<span class="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
				{product.name}
			</span>
		</nav>

		<!-- 2. Main Product Showcase (2-Column Grid on Desktop) -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start mb-8 sm:mb-12">
			
			<!-- Left: Interactive Media Gallery (5 cols) -->
			<div class="lg:col-span-5 w-full">
				<ProductGallery {product} />
			</div>

			<!-- Right: Buy Box & Checkout Actions (7 cols) -->
			<div class="lg:col-span-7 w-full">
				<ProductBuyBox
					{product}
					onBuyNow={() => goto('/checkout')}
				/>
			</div>

		</div>

		<!-- 3. Tabbed Information & Specifications Section -->
		<div class="mb-8 sm:mb-12">
			<ProductTabs {product} />
		</div>

		<!-- 4. Related Products Carousel -->
		{#if relatedProducts.length > 0}
			<div class="mb-12">
				<RelatedProducts products={relatedProducts} />
			</div>
		{/if}

	</div>

	<!-- 5. Mobile Sticky Bottom Action Bar -->
	<MobileStickyBuyBar
		{product}
		onBuyNow={() => goto('/checkout')}
	/>

</StoreLayout>

