<script lang="ts">
	import { StoreLayout } from '#lib';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>AURA | Store</title>
	<meta
		name="description"
		content="AURA - Next-generation lifestyle and creator essentials store."
	/>
</svelte:head>

<StoreLayout user={data.user}>
	<!-- Content will be added here as instructed by the user -->
</StoreLayout>
