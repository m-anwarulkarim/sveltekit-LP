<script lang="ts">
	import Checkout1 from './Checkout1.svelte';
	import Checkout2 from './Checkout2.svelte';

	interface Props {
		activeCheckout?: string;
		user?: { name?: string; email?: string; phone?: string } | null;
		isStandalonePreview?: boolean;
	}

	let {
		activeCheckout = 'checkout_2',
		user = null,
		isStandalonePreview = false
	}: Props = $props();

	let normalized = $derived((activeCheckout || 'checkout_2').toLowerCase().trim());
</script>

{#if normalized === 'checkout_1'}
	<Checkout1 {user} {isStandalonePreview} />
{:else}
	<!-- Checkout 2 is Default Express Guest Checkout -->
	<Checkout2 {user} {isStandalonePreview} />
{/if}

