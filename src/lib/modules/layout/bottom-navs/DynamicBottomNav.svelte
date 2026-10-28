<script lang="ts">
	import BottomNav1 from './BottomNav1.svelte';
	import BottomNav2 from './BottomNav2.svelte';

	interface Props {
		activeBottomNav?: string;
		user?: { name?: string; email?: string } | null;
		onOpenAuth?: () => void;
		isStandalonePreview?: boolean;
	}

	let {
		activeBottomNav = 'bottom_nav_1',
		user = null,
		onOpenAuth = () => {},
		isStandalonePreview = false
	}: Props = $props();

	let normalized = $derived((activeBottomNav || 'bottom_nav_1').toLowerCase().trim());
</script>

{#if normalized === 'bottom_nav_2'}
	<BottomNav2 {user} {onOpenAuth} {isStandalonePreview} />
{:else}
	<!-- Bottom Nav 1 is Default -->
	<BottomNav1 {user} {onOpenAuth} {isStandalonePreview} />
{/if}
