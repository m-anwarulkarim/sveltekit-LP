<script lang="ts">
	import Showcase2 from './Showcase2.svelte';
	import Showcase3 from './Showcase3.svelte';

	interface Props {
		activeShowcase?: string;
		carousels?: any[];
	}

	let { activeShowcase = 'showcase_2', carousels = [] }: Props = $props();

	let normalized = $derived((activeShowcase || 'showcase_2').toLowerCase().trim());
</script>

{#if normalized === 'showcase_3'}
	<Showcase3 {carousels} />
{:else}
	<!-- Showcase 2 is Default Carousel Hero -->
	<Showcase2 {carousels} />
{/if}
