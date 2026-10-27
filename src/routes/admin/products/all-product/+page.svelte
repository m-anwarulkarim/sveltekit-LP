<script lang="ts">
	import ProductsPage from '../+page.svelte';
	let { data } = $props();
</script>

<ProductsPage {data} />
