<script lang="ts">
	import ChildCategoriesPage from '../child-categories/+page.svelte';
	let { data } = $props();
</script>

<ChildCategoriesPage {data} />
