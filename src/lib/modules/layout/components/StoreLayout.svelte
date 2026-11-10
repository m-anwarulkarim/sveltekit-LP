<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import DynamicHeader from '../headers/DynamicHeader.svelte';
	import DynamicFooter from '../footers/DynamicFooter.svelte';
	import DynamicBottomNav from '../bottom-navs/DynamicBottomNav.svelte';
	import { cart } from '#lib/modules/cart/cart.svelte';

	interface Props {
		user?: { name?: string; email?: string; image?: string | null } | null;
		activeHeader?: string;
		activeFooter?: string;
		activeBottomNav?: string;
		children?: Snippet;
	}

	let { user = null, activeHeader, activeFooter, activeBottomNav, children }: Props = $props();

	let currentHeader = $derived(activeHeader || page.data?.themeConfig?.views?.header || 'header_1');
	let currentFooter = $derived(activeFooter || page.data?.themeConfig?.views?.footer || 'footer_1');
	let currentBottomNav = $derived(activeBottomNav || page.data?.themeConfig?.views?.bottomNav || 'bottom_nav_1');

	let footerData = $derived.by(() => {
		const wi = page.data?.websiteInfo;
		const sc = page.data?.storeConfig;
		if (!wi && !sc) return {};
		return {
			brandName: wi?.websiteName || undefined,
			brandTagline: wi?.shortDescription || undefined,
			phoneHotline: sc?.hotlinePhone || wi?.whatsappNumber || undefined,
			supportEmail: wi?.emails?.[0] || undefined,
			officeAddress: wi?.addresses?.[0] || undefined,
			copyrightText: wi?.websiteName ? `© ${new Date().getFullYear()} ${wi.websiteName}. All rights reserved.` : undefined
		};
	});

	let CartDrawer: any = $state(null);
	$effect(() => {
		if (cart.isOpen && !CartDrawer) {
			import('#lib/modules/cart/components/CartDrawer.svelte').then(m => {
				CartDrawer = m.default;
			});
		}
	});
</script>

<div class="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-['Anek_Bangla',sans-serif] selection:bg-[#5845eb]/20 selection:text-[#5845eb]">
	<!-- Store Navigation Header -->
	<DynamicHeader
		activeHeader={currentHeader}
		{user}
	/>

	<!-- Main Body Page Content -->
	<main class="flex-1 pb-20 md:pb-12">
		{#if children}
			{@render children()}
		{/if}
	</main>

	<!-- Dynamic Store Footer (Rendered based on Admin Customization) -->
	<DynamicFooter activeFooter={currentFooter} data={footerData} />

	<!-- Mobile Bottom Navigation (Rendered based on Admin Customization) -->
	<DynamicBottomNav
		activeBottomNav={currentBottomNav}
		{user}
	/>

	<!-- Slide-in Cart Drawer (lazy-loaded on first open) -->
	{#if CartDrawer}
		<svelte:component this={CartDrawer} />
	{/if}
</div>
