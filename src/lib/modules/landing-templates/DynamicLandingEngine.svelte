<script lang="ts">
	import Style1_ModernAnimated from './templates/Style1_ModernAnimated.svelte';
	import Style2_DirectCheckout from './templates/Style2_DirectCheckout.svelte';
	import Style3_LighthouseFunnel from './templates/Style3_LighthouseFunnel.svelte';

	interface Props {
		landingPage: any;
	}

	let { landingPage }: Props = $props();

	// Template Registry (Easily switch between Style1, Style2, and Style3)
	const templateMap: Record<string, any> = {
		style_1_animated: Style1_ModernAnimated,
		style_2_direct: Style2_DirectCheckout,
		style_3_lighthouse: Style3_LighthouseFunnel,
		default: Style1_ModernAnimated
	};

	let SelectedTemplate = $derived(
		templateMap[landingPage?.template || 'default'] || Style1_ModernAnimated
	);
</script>

<svelte:component this={SelectedTemplate} {landingPage} />

