<script lang="ts">
	import {
		Navbar,
		Hero,
		FAQ,
		Footer,
		ProductShowcase,
		InteractiveFeatureDemo,
		Specifications,
		CustomerReviews,
		CartDrawer,
		CheckoutModal,
		AuthModal
	} from '#lib';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isAuthModalOpen = $state(false);
	let isCheckoutModalOpen = $state(false);
</script>

<svelte:head>
	<title>AURA Acoustics | Next-Gen Spatial Sound & Creator Hardware</title>
	<meta
		name="description"
		content="Experience ultra-high-fidelity spatial acoustics, 50mm Planar Magnetic transducers, neural noise cancellation, and zero-latency wireless audio gear."
	/>
	<meta property="og:title" content="AURA Acoustics | Next-Gen Spatial Sound" />
	<meta property="og:description" content="50mm Planar Magnetic drivers, Neural ANC 2.0 (-48dB), and 96kHz lossless wireless transmission." />
	<meta property="og:image" content="/images/headphones.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="min-h-screen bg-[#090a0f] text-[#f1f3f9] selection:bg-violet-500/30 selection:text-violet-200">
	<!-- Navigation -->
	<Navbar
		user={data.user}
		onOpenAuth={() => isAuthModalOpen = true}
	/>

	<!-- Main Page Flow -->
	<main>
		<!-- 1. Hero Showcase -->
		<Hero />

		<!-- 2. Product Catalog & Showcase -->
		<ProductShowcase />

		<!-- 3. Acoustic Science & Interactive DSP Demo -->
		<InteractiveFeatureDemo />

		<!-- 4. Uncompromising Specifications Comparison -->
		<Specifications />

		<!-- 5. Verified Creator Reviews -->
		<CustomerReviews />

		<!-- 6. Frequently Asked Questions -->
		<FAQ />
	</main>

	<!-- Footer -->
	<Footer />

	<!-- Modals and Drawers -->
	<CartDrawer
		onCheckout={() => isCheckoutModalOpen = true}
	/>

	<CheckoutModal
		isOpen={isCheckoutModalOpen}
		onClose={() => isCheckoutModalOpen = false}
	/>

	<AuthModal
		isOpen={isAuthModalOpen}
		onClose={() => isAuthModalOpen = false}
	/>
</div>
