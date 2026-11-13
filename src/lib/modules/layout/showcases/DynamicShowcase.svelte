<script lang="ts">
	import Showcase2 from './Showcase2.svelte';
	import Showcase3 from './Showcase3.svelte';
	import Showcase5 from './Showcase5.svelte';

	interface Props {
		activeShowcase?: string;
		carousels?: any[];
	}

	let { activeShowcase = 'showcase_1', carousels = [] }: Props = $props();

	let normalized = $derived((activeShowcase || 'showcase_1').toLowerCase().trim());
</script>

{#if normalized === 'showcase_2'}
	<!-- Showcase 2: Split Grid (2 banners side by side) -->
	<Showcase3 {carousels} />
{:else if normalized === 'showcase_3'}
	<!-- Showcase 3: Full Image Only Hero -->
	<Showcase5 {carousels} />
{:else}
	<!-- Showcase 1 (default): Carousel Hero with text -->
	<Showcase2 {carousels} />
{/if}
