<script lang="ts">
	import CategoryView1 from './CategoryView1.svelte';
	import CategoryView2 from './CategoryView2.svelte';

	interface Props {
		activeCategory?: string;
		categories?: any[];
	}

	let { activeCategory = 'category_1', categories = [] }: Props = $props();

	let normalized = $derived((activeCategory || 'category_1').toLowerCase().trim());
</script>

{#if normalized === 'none'}
	<!-- Admin selected 'None': category section hidden -->
{:else if normalized === 'category_2'}
	<CategoryView2 {categories} />
{:else}
	<!-- Category View 1 is Default -->
	<CategoryView1 {categories} />
{/if}
