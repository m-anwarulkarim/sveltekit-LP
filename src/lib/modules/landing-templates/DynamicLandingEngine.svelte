<script lang="ts">
	import Style1_ModernAnimated from './templates/Style1_ModernAnimated.svelte';
	import Style2_DirectCheckout from './templates/Style2_DirectCheckout.svelte';
	import Style3_LighthouseFunnel from './templates/Style3_LighthouseFunnel.svelte';

	interface Props {
		landingPage: any;
	}

	let { landingPage }: Props = $props();

	let currentTemplate = $derived(landingPage?.template || 'style_1_animated');
</script>

{#if currentTemplate === 'style_2_direct'}
	<Style2_DirectCheckout {landingPage} />
{:else if currentTemplate === 'style_3_lighthouse'}
	<Style3_LighthouseFunnel {landingPage} />
{:else}
	<Style1_ModernAnimated {landingPage} />
{/if}

