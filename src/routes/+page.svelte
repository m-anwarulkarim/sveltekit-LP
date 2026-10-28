<script lang="ts">
	import {
		StoreLayout,
		Hero,
		ShopByCategory,
		ProductSection,
		getBestSaleProducts,
		getNewArrivals,
		getPopularProducts,
		type Product
	} from '#lib';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// 100% Real Database Products from Cloudflare D1
	const allProducts = $derived.by<Product[]>(() => {
		return data?.dbProducts || [];
	});

	// Derived filtered lists for each section (auto updates when products change)
	const bestSaleItems = $derived(getBestSaleProducts(allProducts));
	const newArrivalItems = $derived(getNewArrivals(allProducts));
	const popularItems = $derived(getPopularProducts(allProducts));
</script>

<svelte:head>
	<title>AURA | Premium Lifestyle & Essentials Store</title>
	<meta
		name="description"
		content="AURA - Next-generation lifestyle, skincare and creator essentials store in Bangladesh."
	/>
</svelte:head>

<StoreLayout user={data.user}>
	<!-- 1. Hero Slider Banner Section (Image 2 Cartup Match) -->
	<Hero />

	<!-- 2. Shop By Category Horizontal Carousel Section -->
	<ShopByCategory />

	<!-- 3. Best Sale Products (🔥 সেরা অফার ও হট ডিল) -->
	<ProductSection
		title="Best Sale Products"
		subtitle="সেরা অফার ও সীমিত সময়ের হট ডিল"
		icon="flame"
		iconColor="text-rose-600"
		badgeText="HOT DEALS"
		badgeBg="bg-rose-50 text-rose-600 border border-rose-200"
		products={bestSaleItems}
		seeAllLink="/catalog/all-product?filter=best-sale"
	/>

	<!-- 4. New Arrivals (✨ সদ্য যোগ হওয়া নতুন কালেকশন) -->
	<ProductSection
		title="New Arrivals"
		subtitle="সদ্য যুক্ত হওয়া ট্রেন্ডিং পণ্য"
		icon="sparkles"
		iconColor="text-violet-600"
		badgeText="JUST IN"
		badgeBg="bg-violet-50 text-violet-600 border border-violet-200"
		products={newArrivalItems}
		seeAllLink="/catalog/all-product?filter=new-arrival"
	/>

	<!-- 5. Popular Products (⭐ কাস্টমার ফেভারিট ও টপ-রেটেড প্রডাক্ট) -->
	<ProductSection
		title="Popular Products"
		subtitle="গ্রাহকদের সবচেয়ে পছন্দের পণ্য"
		icon="star"
		iconColor="text-amber-500"
		badgeText="TRENDING"
		badgeBg="bg-amber-50 text-amber-700 border border-amber-200"
		products={popularItems}
		seeAllLink="/catalog/all-product?filter=popular"
	/>
</StoreLayout>
