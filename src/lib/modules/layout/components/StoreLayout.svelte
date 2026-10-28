<script lang="ts">
	import type { Snippet } from 'svelte';
	import Navbar from './Navbar.svelte';
	import Footer from './Footer.svelte';
	import CartDrawer from '#lib/modules/cart/components/CartDrawer.svelte';
	import AuthModal from '#lib/modules/auth/components/AuthModal.svelte';

	interface Props {
		user?: { name?: string; email?: string; image?: string | null } | null;
		children?: Snippet;
	}

	let { user = null, children }: Props = $props();

	let isAuthModalOpen = $state(false);
</script>

<div class="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-['Anek_Bangla',sans-serif] selection:bg-[#5845eb]/20 selection:text-[#5845eb]">
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
	<CartDrawer />

	<!-- Authentication Modal -->
	<AuthModal
		isOpen={isAuthModalOpen}
		onClose={() => (isAuthModalOpen = false)}
	/>
</div>
