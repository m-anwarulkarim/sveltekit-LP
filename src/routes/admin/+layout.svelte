<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { playNotificationSound } from '#lib/utils/notificationSound';
	import {
		AdminSidebar,
		AdminNavbar,
		AdminMobileBottomNav,
		AdminSearchModal
	} from './_components/layout';
	import {
		TutorialModal,
		PackageProModal
	} from './_components/modals';
	import { Toaster, GlobalConfirmDialog } from '#lib/components/ui';

	let { data, children }: { data: any; children: Snippet } = $props();

	let isSidebarCollapsed = $state(false);
	let isMobileSidebarOpen = $state(false);
	let isTutorialModalOpen = $state(false);
	let isPackageModalOpen = $state(false);

	let unreadCount = $state<number>(data?.unreadNotificationsCount ?? 0);
	let lastSeenNotifId = $state<string | null>(null);

	$effect(() => {
		if (data?.unreadNotificationsCount !== undefined) {
			unreadCount = data.unreadNotificationsCount;
		}
	});

	onMount(() => {
		let isFirstCheck = true;

		async function checkLiveNotifications() {
			try {
				const res = await fetch('/api/admin/notifications/poll');
				if (res.ok) {
					const result = await res.json();
					if (result.success) {
						const freshUnread = result.unreadCount ?? 0;
						const latest = result.latest;

						if (isFirstCheck) {
							// Record initial latest ID without ringing sound
							if (latest) lastSeenNotifId = latest.id;
							isFirstCheck = false;
							unreadCount = freshUnread;
							return;
						}

						// If a fresh unread notification arrived
						if (latest && !latest.isRead && latest.id !== lastSeenNotifId) {
							lastSeenNotifId = latest.id;
							unreadCount = freshUnread;

							// 1. Play dual-tone notification chime
							playNotificationSound();

							// 2. Instant Toast notification
							toast.info(`🔔 ${latest.title}`, {
								description: latest.description,
								duration: 8000,
								action: {
									label: 'অর্ডার দেখুন',
									onClick: () => goto(latest.link || '/admin/orders')
								}
							});
						} else {
							unreadCount = freshUnread;
						}
					}
				}
			} catch {
				// background polling error ignored
			}
		}

		// Initial check
		checkLiveNotifications();

		// Check every 12 seconds
		const pollInterval = setInterval(checkLiveNotifications, 12000);

		return () => clearInterval(pollInterval);
	});
</script>

<svelte:head>
	<title>AURA Enterprise Control Deck | অ্যাডমিন ড্যাশবোর্ড</title>
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@100..800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<!-- Fullscreen Warm Ivory Executive Frame with Pure White SaaS Sidebar -->
<div class="admin-theme min-h-screen bg-[#faf7f2] text-slate-800 flex flex-col md:flex-row font-['Anek_Bangla',sans-serif] selection:bg-[#5845eb]/20 selection:text-[#5845eb] antialiased">
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
			{unreadCount}
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
		{unreadCount}
		onToggleMenu={() => (isMobileSidebarOpen = !isMobileSidebarOpen)}
	/>

	<!-- 4. Top Navbar Interactive Modals -->
	<TutorialModal bind:open={isTutorialModalOpen} />
	<PackageProModal bind:open={isPackageModalOpen} />
	<AdminSearchModal />

	<!-- Global Toast Notifications & Modern Confirmation Dialog -->
	<Toaster />
	<GlobalConfirmDialog />
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
