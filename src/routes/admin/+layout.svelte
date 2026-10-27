<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		AdminSidebar,
		AdminNavbar,
		AdminMobileBottomNav
	} from './_components/layout';
	import {
		TutorialModal,
		PackageProModal
	} from './_components/modals';

	let { data, children }: { data: any; children: Snippet } = $props();

	let isSidebarCollapsed = $state(false);
	let isMobileSidebarOpen = $state(false);
	let isTutorialModalOpen = $state(false);
	let isPackageModalOpen = $state(false);
</script>

<svelte:head>
	<title>AURA Enterprise Control Deck | অ্যাডমিন ড্যাশবোর্ড</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<!-- Fullscreen Warm Ivory Executive Frame with Pure White SaaS Sidebar -->
<div class="admin-theme min-h-screen bg-[#faf7f2] text-slate-800 flex flex-col md:flex-row font-['Hind_Siliguri',sans-serif] selection:bg-[#5845eb]/20 selection:text-[#5845eb] antialiased">
	<!-- 1. Executive White SaaS Sidebar -->
	<AdminSidebar
		bind:collapsed={isSidebarCollapsed}
		bind:mobileOpen={isMobileSidebarOpen}
		{data}
	/>

	<!-- Mobile Backdrop -->
	{#if isMobileSidebarOpen}
		<button
			type="button"
			onclick={() => (isMobileSidebarOpen = false)}
			class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden cursor-default"
			aria-label="Close sidebar"
		></button>
	{/if}

	<!-- 2. Main Executive Workspace Canvas -->
	<div class="flex-1 flex flex-col min-w-0 min-h-screen">
		<!-- Top Command Bar -->
		<AdminNavbar
			onOpenTutorial={() => (isTutorialModalOpen = true)}
			onOpenPackage={() => (isPackageModalOpen = true)}
		/>

		<!-- Page View Slot (with bottom padding for mobile floating bar) -->
		<main class="flex-1 p-4 md:p-8 pb-24 md:pb-8">
			{@render children()}
		</main>
	</div>

	<!-- 3. Mobile Bottom Navigation Bar -->
	<AdminMobileBottomNav
		onToggleMenu={() => (isMobileSidebarOpen = !isMobileSidebarOpen)}
	/>

	<!-- 4. Top Navbar Interactive Modals -->
	<TutorialModal bind:open={isTutorialModalOpen} />
	<PackageProModal bind:open={isPackageModalOpen} />
</div>

<style>
	:global(.admin-theme) {
		color-scheme: light !important;
	}
	:global(.no-scrollbar) {
		-ms-overflow-style: none !important;
		scrollbar-width: none !important;
	}
	:global(.no-scrollbar::-webkit-scrollbar) {
		display: none !important;
		width: 0 !important;
		height: 0 !important;
		background: transparent !important;
	}
</style>
