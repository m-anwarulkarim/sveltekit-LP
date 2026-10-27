<script lang="ts">
	import type { Snippet } from 'svelte';
	import Navbar from './Navbar.svelte';
	import Footer from './Footer.svelte';
	import CartDrawer from '#lib/modules/cart/components/CartDrawer.svelte';
	import CheckoutModal from '#lib/modules/cart/components/CheckoutModal.svelte';
	import AuthModal from '#lib/modules/auth/components/AuthModal.svelte';

	interface Props {
		user?: { name?: string; email?: string; image?: string | null } | null;
		children?: Snippet;
	}

	let { user = null, children }: Props = $props();

	let isAuthModalOpen = $state(false);
	let isCheckoutModalOpen = $state(false);
</script>

<div class="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-['Hind_Siliguri',sans-serif] selection:bg-[#5845eb]/20 selection:text-[#5845eb]">
	<!-- Store Navigation Header -->
	<Navbar
		{user}
		onOpenAuth={() => (isAuthModalOpen = true)}
	/>

	<!-- Main Body Page Content -->
	<main class="flex-1 pb-20 md:pb-12">
		{#if children}
			{@render children()}
		{/if}
	</main>

	<!-- Store Footer -->
	<Footer />

	<!-- Slide-in Cart Drawer -->
	<CartDrawer
		onCheckout={() => (isCheckoutModalOpen = true)}
	/>

	<!-- Checkout Modal -->
	<CheckoutModal
		isOpen={isCheckoutModalOpen}
		onClose={() => (isCheckoutModalOpen = false)}
	/>

	<!-- Authentication Modal -->
	<AuthModal
		isOpen={isAuthModalOpen}
		onClose={() => (isAuthModalOpen = false)}
	/>
</div>
