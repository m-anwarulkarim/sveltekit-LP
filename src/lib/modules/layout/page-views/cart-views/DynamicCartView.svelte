<script lang="ts">
	import CartView1 from './CartView1.svelte';
	import CartView2 from './CartView2.svelte';

	interface Props {
		activeCartView?: string;
		isStandalonePreview?: boolean;
	}

	let {
		activeCartView = 'cart_view_1',
		isStandalonePreview = false
	}: Props = $props();

	let normalized = $derived((activeCartView || 'cart_view_1').toLowerCase().trim());
</script>

{#if normalized === 'cart_view_2'}
	<CartView2 {isStandalonePreview} />
{:else}
	<!-- Cart View 1 is Default Drawer -->
	<CartView1 {isStandalonePreview} />
{/if}

