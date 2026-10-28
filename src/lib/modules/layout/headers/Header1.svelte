<script lang="ts">
	import Navbar from '../components/Navbar.svelte';

	interface Props {
		user?: { name?: string; email?: string; image?: string | null } | null;
		onOpenAuth?: () => void;
	}

	let { user = null, onOpenAuth = () => {} }: Props = $props();
</script>

<Navbar {user} {onOpenAuth} />

