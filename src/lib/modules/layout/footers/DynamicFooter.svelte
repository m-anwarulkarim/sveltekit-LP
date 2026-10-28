<script lang="ts">
	import Footer1 from './Footer1.svelte';
	import Footer2 from './Footer2.svelte';
	import Footer3 from './Footer3.svelte';
	import type { FooterStoreData } from './data';

	interface Props {
		activeFooter?: string;
		data?: Partial<FooterStoreData>;
		class?: string;
	}

	let { activeFooter = 'footer_1', data = {}, class: className = '' }: Props = $props();

	// Normalized footer key
	let normalizedFooter = $derived((activeFooter || 'footer_1').toLowerCase().trim());
</script>

{#if normalizedFooter === 'footer_2'}
	<Footer2 {data} class={className} />
{:else if normalizedFooter === 'footer_3'}
	<Footer3 {data} class={className} />
{:else}
	<!-- Footer 1 is default, and fallback for others -->
	<Footer1 {data} class={className} />
{/if}

