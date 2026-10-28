<script lang="ts">
	import CategoriesPage from './categories/+page.svelte';
	let { data } = $props();
</script>

<CategoriesPage {data} />
