<script lang="ts">
	import Style1_ModernAnimated from './templates/Style1_ModernAnimated.svelte';

	interface Props {
		landingPage: any;
	}

	let { landingPage }: Props = $props();

	// Template Registry (Easily add Style2, Style3, etc.)
	const templateMap: Record<string, any> = {
		style_1_animated: Style1_ModernAnimated,
		default: Style1_ModernAnimated
	};

	let SelectedTemplate = $derived(
		templateMap[landingPage?.template || 'default'] || Style1_ModernAnimated
	);
</script>

<svelte:component this={SelectedTemplate} {landingPage} />

