<script lang="ts">
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import DynamicShowcase from '#lib/modules/layout/showcases/DynamicShowcase.svelte';
	import DynamicCategoryView from '#lib/modules/layout/category-views/DynamicCategoryView.svelte';
	import ProductSection from '#lib/modules/products/components/ProductSection.svelte';
	import {
		getBestSaleProducts,
		getNewArrivals,
		getPopularProducts
	} from '#lib/modules/products/products.data';
	import type { Product } from '#lib/modules/products/types';
	import PromotionalBannerStrip from '#lib/components/storefront/PromotionalBannerStrip.svelte';
	import LazySection from '#lib/components/storefront/LazySection.svelte';
	import { page } from '$app/state';
	import type { PageData } from './$types';

	const SECTION_SIZE = 12;

	let { data }: { data: PageData } = $props();

	const allProducts = $derived.by<Product[]>(() => {
		return data?.dbProducts || [];
	});

	const bestSaleItems = $derived(getBestSaleProducts(allProducts).slice(0, SECTION_SIZE));
	const newArrivalItems = $derived(getNewArrivals(allProducts).slice(0, SECTION_SIZE));
	const popularItems = $derived(getPopularProducts(allProducts).slice(0, SECTION_SIZE));

	const siteName = $derived(data.websiteInfo?.websiteName || 'Store');
	const pageTitle = $derived(
		`${siteName} | বাংলাদেশের সেরা বীজ ও কৃষি সরঞ্জামের অনলাইন শপ`
	);
	const pageDescription = $derived(
		`${siteName} — সবজি, ফুল ও ফলের বীজ, কীটনাশক, সার ও কৃষি টুলস। দ্রুত ডেলিভারি ও সেরা দামে অর্ডার করুন।`
	);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content="{page.url.origin}/apple-touch-icon.png" />
</svelte:head>

<StoreLayout user={data.user}>
	<h1 class="sr-only">{pageTitle}</h1>

	<!-- 1. Hero Showcase Banner -->
	<DynamicShowcase
		activeShowcase={data.themeConfig?.views?.showcase}
		carousels={data.dbCarousels}
	/>

	<!-- 2. Shop By Category -->
	<DynamicCategoryView
		activeCategory={data.themeConfig?.views?.category}
		categories={data.dbCategories}
	/>

	<!-- 3. Best Sale Products — above fold, renders immediately -->
	<ProductSection
		title="Best Sale Products"
		subtitle="সেরা অফার ও সীমিত সময়ের হট ডিল"
		icon="flame"
		iconColor="text-rose-600"
		badgeText="HOT DEALS"
		badgeBg="bg-rose-50 text-rose-600 border border-rose-200"
		products={bestSaleItems}
		seeAllLink="/catalog/all-product?filter=best-sale"
	/>

	<!-- Below-fold: lazy-loaded when scrolled into view -->
	<LazySection>
		<PromotionalBannerStrip banners={data.dbBanners} />
	</LazySection>

	<LazySection>
		<ProductSection
			title="New Arrivals"
			subtitle="সদ্য যুক্ত হওয়া ট্রেন্ডিং পণ্য"
			icon="sparkles"
			iconColor="text-violet-600"
			badgeText="JUST IN"
			badgeBg="bg-violet-50 text-violet-600 border border-violet-200"
			products={newArrivalItems}
			seeAllLink="/catalog/all-product?filter=new-arrival"
		/>
	</LazySection>

	<LazySection>
		<ProductSection
			title="Popular Products"
			subtitle="গ্রাহকদের সবচেয়ে পছন্দের পণ্য"
			icon="star"
			iconColor="text-amber-500"
			badgeText="TRENDING"
			badgeBg="bg-amber-50 text-amber-700 border border-amber-200"
			products={popularItems}
			seeAllLink="/catalog/all-product?filter=popular"
		/>
	</LazySection>
</StoreLayout>
