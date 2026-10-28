<script lang="ts">
	import SubCategoriesPage from '../sub-categories/+page.svelte';
	let { data } = $props();
</script>

<SubCategoriesPage {data} />
