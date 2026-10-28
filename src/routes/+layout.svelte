<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { Toaster, GlobalConfirmDialog } from '#lib/components/ui';

	let { data, children }: LayoutProps = $props();
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
</svelte:head>

{@render children()}

<Toaster />
<GlobalConfirmDialog />
