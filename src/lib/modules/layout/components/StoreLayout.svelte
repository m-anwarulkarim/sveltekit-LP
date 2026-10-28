<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import DynamicHeader from '../headers/DynamicHeader.svelte';
	import DynamicFooter from '../footers/DynamicFooter.svelte';
	import DynamicBottomNav from '../bottom-navs/DynamicBottomNav.svelte';
	import CartDrawer from '#lib/modules/cart/components/CartDrawer.svelte';
	import AuthModal from '#lib/modules/auth/components/AuthModal.svelte';

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
	let isAuthModalOpen = $state(false);
</script>

<div class="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-['Anek_Bangla',sans-serif] selection:bg-[#5845eb]/20 selection:text-[#5845eb]">
	<!-- Store Navigation Header -->
	<DynamicHeader
		activeHeader={currentHeader}
		{user}
		onOpenAuth={() => (isAuthModalOpen = true)}
	/>

	<!-- Main Body Page Content -->
	<main class="flex-1 pb-20 md:pb-12">
		{#if children}
			{@render children()}
		{/if}
	</main>

	<!-- Dynamic Store Footer (Rendered based on Admin Customization) -->
	<DynamicFooter activeFooter={currentFooter} />

	<!-- Mobile Bottom Navigation (Rendered based on Admin Customization) -->
	<DynamicBottomNav
		activeBottomNav={currentBottomNav}
		{user}
		onOpenAuth={() => (isAuthModalOpen = true)}
	/>

	<!-- Slide-in Cart Drawer -->
	<CartDrawer />

	<!-- Authentication Modal -->
	<AuthModal
		isOpen={isAuthModalOpen}
		onClose={() => (isAuthModalOpen = false)}
	/>
</div>
