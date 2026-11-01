<script lang="ts">
	import GscPage from '../google-search-console/+page.svelte';
	let { data } = $props();
</script>

<GscPage {data} />
