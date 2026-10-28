<script lang="ts">
	import { ProductFormLayout } from '../_components/form';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>New Product | AURA Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8">
	<ProductFormLayout
		isEditMode={false}
		existingGallery={data.galleryImages || []}
		taxonomyTree={data.taxonomyTree || []}
	/>
</div>

