<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
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
