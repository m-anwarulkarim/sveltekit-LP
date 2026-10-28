<script lang="ts">
	import ShopByCategory from '../components/ShopByCategory.svelte';

	interface Props {
		categories?: any[];
	}

	let { categories = [] }: Props = $props();
</script>

<ShopByCategory {categories} />

