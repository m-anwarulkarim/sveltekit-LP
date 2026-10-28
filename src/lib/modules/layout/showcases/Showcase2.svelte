<script lang="ts">
	import Hero from '../components/Hero.svelte';

	interface Props {
		carousels?: any[];
	}

	let { carousels = [] }: Props = $props();
</script>

<Hero {carousels} />

