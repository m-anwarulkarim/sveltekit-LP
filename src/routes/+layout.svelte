<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { Toaster, GlobalConfirmDialog } from '#lib/components/ui';
	import PromotionalPopup from '#lib/components/storefront/PromotionalPopup.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { initMetaPixel, trackPageView } from '#lib/client/meta-pixel';
	import { initGtm, trackGtmPageView } from '#lib/client/gtm';
	import { captureAttribution } from '#lib/client/attribution';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { jsonLdScript, safeCssColor } from '#lib/utils/html-safe';

	let { data, children }: LayoutProps = $props();

	onMount(() => {
		initMetaPixel(data?.pixelConfig);
		initGtm(data?.gtmConfig);
		captureAttribution();
	});

	$effect(() => {
		if (data?.user) {
			cart.syncWithUser(data.user);
		}
		if (data?.storeConfig) {
			cart.setDeliveryConfig(data.storeConfig);
		}
	});

	afterNavigate(({ type }) => {
		// Only track on subsequent client transitions; initial load is handled by initMetaPixel / initGtm
		if (type !== 'enter') {
			trackPageView(data?.pixelConfig);
			trackGtmPageView();
		}
	});
</script>

<svelte:head>
	{#if data?.themeConfig?.appearance?.colors}
		{@html `<style>:root { --brand-primary: ${safeCssColor(data.themeConfig.appearance.colors.primary, '#e8007c')}; --brand-secondary: ${safeCssColor(data.themeConfig.appearance.colors.secondary, '#00c153')}; --brand-tertiary: ${safeCssColor(data.themeConfig.appearance.colors.tertiary, '#ff00ae')}; }</style>`}
	{/if}
	{#if !page.url.pathname.startsWith('/admin')}
		<link rel="canonical" href="{page.url.origin}{page.url.pathname}" />
		<meta property="og:url" content="{page.url.origin}{page.url.pathname}" />
		<meta property="og:site_name" content={data?.websiteInfo?.websiteName || 'seedbd'} />
	{/if}
	{#if data?.websiteInfo?.faviconUrl}
		<link rel="icon" href={data.websiteInfo.faviconUrl} />
	{:else}
		<link rel="icon" type="image/svg+xml" href={favicon} />
		<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
		<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	{/if}
	{#if data?.websiteJsonLd}
		<!-- Google Structured Data: WebSite Schema -->
		{@html jsonLdScript(data.websiteJsonLd)}
	{/if}
	{#if data?.organizationJsonLd}
		<!-- Google Structured Data: Organization Schema -->
		{@html jsonLdScript(data.organizationJsonLd)}
	{/if}
	{#if data?.googleConsole?.verificationToken}
		<!-- Google Search Console Verification -->
		<meta name="google-site-verification" content={data.googleConsole.verificationToken} />
	{/if}
	{#if data?.googleConsole?.facebookDomainToken}
		<!-- Meta (Facebook) Domain Verification -->
		<meta name="facebook-domain-verification" content={data.googleConsole.facebookDomainToken} />
	{/if}
	{#if data?.pixelConfig?.trackingMode === 'native_direct' && data?.pixelConfig?.pixelId}
		<!-- Meta Pixel Noscript Fallback -->
		<noscript>
			<img
				height="1"
				width="1"
				style="display:none"
				src="https://www.facebook.com/tr?id={data.pixelConfig.pixelId}&ev=PageView&noscript=1"
				alt=""
			/>
		</noscript>
	{/if}
</svelte:head>

{@render children()}

{#if data?.activePopup && !page.url.pathname.startsWith('/admin') && !page.url.pathname.startsWith('/lp/')}
	<PromotionalPopup popup={data.activePopup} />
{/if}

<Toaster />
<GlobalConfirmDialog />
