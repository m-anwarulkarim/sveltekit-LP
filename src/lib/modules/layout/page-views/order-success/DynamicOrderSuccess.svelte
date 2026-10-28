<script lang="ts">
	import OrderSuccess1 from './OrderSuccess1.svelte';
	import OrderSuccess2 from './OrderSuccess2.svelte';

	interface Props {
		activeOrderSuccess?: string;
		isStandalonePreview?: boolean;
	}

	let {
		activeOrderSuccess = 'order_success_1',
		isStandalonePreview = false
	}: Props = $props();

	let normalized = $derived((activeOrderSuccess || 'order_success_1').toLowerCase().trim());
</script>

{#if normalized === 'order_success_2'}
	<OrderSuccess2 {isStandalonePreview} />
{:else}
	<!-- Order Success 1 is Default Clean Invoice -->
	<OrderSuccess1 {isStandalonePreview} />
{/if}

