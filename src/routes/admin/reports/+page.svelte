<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/admin/reports/daily-business-summary', { replaceState: true });
	});
</script>

<div class="p-8 text-center text-slate-500 text-xs">
	রিপোর্ট সেন্টারে লোড হচ্ছে...
</div>
