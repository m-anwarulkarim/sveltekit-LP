<script lang="ts">
	import TagsPage from '../tags/+page.svelte';
	let { data } = $props();
</script>

<TagsPage {data} />
