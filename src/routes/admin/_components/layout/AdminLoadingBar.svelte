<script lang="ts">
	import { navigating } from '$app/state';
	import { adminLoading } from '#lib/stores/admin-loading.svelte';

	let progress = $state(0);
	let visible = $state(false);
	let timerId: ReturnType<typeof setTimeout> | null = null;
	let intervalId: ReturnType<typeof setInterval> | null = null;

	let isLoading = $derived(!!navigating.to || adminLoading.active);

	function startLoading() {
		clearTimers();
		progress = 15;
		visible = true;

		intervalId = setInterval(() => {
			if (progress < 90) {
				progress += (90 - progress) * 0.08;
			}
		}, 100);
	}

	function finishLoading() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		progress = 100;

		timerId = setTimeout(() => {
			visible = false;
			timerId = setTimeout(() => {
				progress = 0;
			}, 300);
		}, 200);
	}

	function clearTimers() {
		if (timerId) { clearTimeout(timerId); timerId = null; }
		if (intervalId) { clearInterval(intervalId); intervalId = null; }
	}

	$effect(() => {
		if (isLoading) {
			startLoading();
		} else {
			if (visible) finishLoading();
		}
	});
</script>

{#if visible || progress > 0}
	<div
		class="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
		class:opacity-0={!visible}
		style="transition: opacity 0.3s ease;"
	>
		<div
			class="h-full bg-gradient-to-r from-[#5845eb] via-[#7c6bf0] to-[#5845eb] shadow-[0_0_8px_rgba(88,69,235,0.5)]"
			style="width: {progress}%; transition: width 0.2s ease;"
		></div>
	</div>
{/if}
