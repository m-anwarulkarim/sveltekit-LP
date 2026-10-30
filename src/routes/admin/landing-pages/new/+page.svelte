<script lang="ts">
	import LandingPageFormLayout from '../_components/LandingPageFormLayout.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>নতুন ল্যান্ডিং পেজ তৈরি করুন | AURA Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8">
	<LandingPageFormLayout
		isEditMode={false}
		products={data.products || []}
	/>
</div>

