<script lang="ts">
	import type { PageData } from './$types';
	import DynamicLandingEngine from '#lib/modules/landing-templates/DynamicLandingEngine.svelte';
	import { jsonLdScript } from '#lib/utils/html-safe';
	import { trackMetaEvent } from '#lib/client/meta-pixel';
	import { trackGtmViewItem } from '#lib/client/gtm';

	let { data }: { data: PageData } = $props();

	let seo = $derived(data.seoMeta);
	let landingPage = $derived(data.landingPage);
	let product = $derived(landingPage?.product);
	let siteName = $derived(data?.websiteInfo?.websiteName || 'Store');

	// Fire Standard Meta Pixel ViewContent & GA4 E-Commerce view_item events on landing pages
	$effect(() => {
		if (landingPage && typeof window !== 'undefined') {
			const matchId = String(product?.id || landingPage.id);
			const price = Number(landingPage.config?.customPrice || product?.price || 0);
			const title = landingPage.title || landingPage.config?.headline || product?.name || 'Landing Page Product';

			trackMetaEvent('ViewContent', {
				content_name: title,
				content_ids: [matchId],
				content_type: 'product',
				value: price,
				currency: 'BDT'
			});

			trackGtmViewItem({
				item: {
					item_id: matchId,
					item_name: title,
					item_brand: product?.brand || siteName,
					item_category: product?.category || landingPage.category || 'General',
					price: price,
					quantity: 1
				},
				currency: 'BDT'
			});
		}
	});
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
		<meta property="og:site_name" content={data?.websiteInfo?.websiteName || 'Store'} />

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

{#if data.landingPage?.status !== 'Published'}
	<div class="sticky top-0 z-50 bg-amber-400 text-slate-950 px-4 py-2.5 text-center text-xs sm:text-sm font-bold shadow-md flex flex-wrap items-center justify-center gap-3 font-['Anek_Bangla',sans-serif]">
		<span>
			⚠️ এই ল্যান্ডিং পেজটি বর্তমানে <strong>{data.landingPage?.status || 'Draft'}</strong> মোডে আছে — পাবলিশ না করা পর্যন্ত অর্ডার গ্রহণ করবে না।
		</span>
		<a
			href={`/admin/landing-pages/${data.landingPage?.id}/edit`}
			class="inline-flex items-center px-3 py-1 rounded-lg bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
		>
			এডিট করে Published করুন
		</a>
	</div>
{/if}

<DynamicLandingEngine landingPage={data.landingPage} />


