<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { Toaster, GlobalConfirmDialog } from '#lib/components/ui';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { initMetaPixel, trackPageView } from '#lib/client/meta-pixel';

	let { data, children }: LayoutProps = $props();

	onMount(() => {
		initMetaPixel(data?.pixelConfig);
	});

	afterNavigate(() => {
		trackPageView(data?.pixelConfig);
	});
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={favicon} />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	{#if data?.websiteJsonLd}
		<!-- Google Structured Data: WebSite Schema -->
		{@html `<script type="application/ld+json">${JSON.stringify(data.websiteJsonLd)}</script>`}
	{/if}
	{#if data?.organizationJsonLd}
		<!-- Google Structured Data: Organization Schema -->
		{@html `<script type="application/ld+json">${JSON.stringify(data.organizationJsonLd)}</script>`}
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

<Toaster />
<GlobalConfirmDialog />
