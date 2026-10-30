<script lang="ts">
	import type { PageData } from './$types';
	import DynamicLandingEngine from '#lib/modules/landing-templates/DynamicLandingEngine.svelte';

	let { data }: { data: PageData } = $props();
</script>

<DynamicLandingEngine landingPage={data.landingPage} />

