<script lang="ts">
	import { onMount } from 'svelte';
	import DynamicLandingEngine from '#lib/modules/landing-templates/DynamicLandingEngine.svelte';

	// Renders inside the builder's preview iframe, so Tailwind breakpoints
	// respond to the iframe's own viewport and the preview matches the real page.
	let landingPage = $state<any>(null);

	onMount(() => {
		try {
			const raw = sessionStorage.getItem('lp-preview-data');
			if (raw) landingPage = JSON.parse(raw);
		} catch {}

		const onMessage = (e: MessageEvent) => {
			if (e.origin !== location.origin) return;
			if (e.data?.type === 'lp-preview' && e.data.landingPage) {
				landingPage = e.data.landingPage;
			}
		};
		window.addEventListener('message', onMessage);
		window.parent?.postMessage({ type: 'lp-preview-ready' }, location.origin);
		return () => window.removeEventListener('message', onMessage);
	});
</script>

<svelte:head>
	<title>লাইভ প্রিভিউ</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if landingPage}
	<DynamicLandingEngine {landingPage} />
{:else}
	<div class="min-h-screen flex items-center justify-center bg-slate-50">
		<div class="flex items-center gap-3 text-slate-500 text-sm font-['Anek_Bangla',sans-serif]">
			<span class="w-5 h-5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></span>
			<span>প্রিভিউ লোড হচ্ছে...</span>
		</div>
	</div>
{/if}
