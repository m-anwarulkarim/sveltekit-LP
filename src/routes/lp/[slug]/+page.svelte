<script lang="ts">
	import type { PageData } from './$types';
	import DynamicLandingEngine from '#lib/modules/landing-templates/DynamicLandingEngine.svelte';
	import { jsonLdScript } from '#lib/utils/html-safe';

	let { data }: { data: PageData } = $props();

	let seo = $derived(data.seoMeta);
</script>

<svelte:head>
	{#if seo}
		<title>{seo.title}</title>
		<meta name="description" content={seo.description} />
		<link rel="canonical" href={seo.canonicalUrl} />

		<!-- OpenGraph / Facebook Sharing -->
		<meta property="og:type" content="product" />
		<meta property="og:title" content={seo.title} />
		<meta property="og:description" content={seo.description} />
		<meta property="og:url" content={seo.canonicalUrl} />
		<meta property="og:image" content={seo.ogImage} />
		<meta property="og:site_name" content="seedbd" />

		<!-- Twitter Card -->
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content={seo.title} />
		<meta name="twitter:description" content={seo.description} />
		<meta name="twitter:image" content={seo.ogImage} />
	{/if}

	{#if data.landingJsonLd}
		<!-- Google Rich Snippet Structured Data (JSON-LD) -->
		{@html jsonLdScript(data.landingJsonLd)}
	{/if}
</svelte:head>

<DynamicLandingEngine landingPage={data.landingPage} />


