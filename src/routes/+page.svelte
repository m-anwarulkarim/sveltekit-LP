<script lang="ts">
	import { StoreLayout, Hero } from '#lib';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>AURA | Store - Next-Generation Shopping</title>
	<meta
		name="description"
		content="AURA - Next-generation lifestyle and creator essentials store."
	/>
</svelte:head>

<StoreLayout user={data.user}>
	<!-- 1. Hero Auto-Slider Banner & Quick Feature Badges -->
	<Hero />
</StoreLayout>
