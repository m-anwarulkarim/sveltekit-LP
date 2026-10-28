<script lang="ts">
	import Header1 from './Header1.svelte';
	import Header2 from './Header2.svelte';

	interface Props {
		activeHeader?: string;
		user?: { name?: string; email?: string; image?: string | null } | null;
		onOpenAuth?: () => void;
	}

	let {
		activeHeader = 'header_1',
		user = null,
		onOpenAuth = () => {}
	}: Props = $props();

	let normalizedHeader = $derived((activeHeader || 'header_1').toLowerCase().trim());
</script>

{#if normalizedHeader === 'header_2'}
	<Header2 {user} {onOpenAuth} />
{:else}
	<!-- Header 1 is default, and fallback for others -->
	<Header1 {user} {onOpenAuth} />
{/if}

