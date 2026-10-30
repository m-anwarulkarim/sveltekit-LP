<script lang="ts">
	import { onMount } from 'svelte';
	import { Timer, Flame } from 'lucide-svelte';

	interface Props {
		initialMinutes?: number;
		badgeText?: string;
	}

	let { initialMinutes = 35, badgeText = 'অফারের সময় বাকি' }: Props = $props();

	let totalSeconds = $state(initialMinutes * 60);

	let hours = $derived(Math.floor(totalSeconds / 3600));
	let minutes = $derived(Math.floor((totalSeconds % 3600) / 60));
	let seconds = $derived(totalSeconds % 60);

	function pad(num: number) {
		return num.toString().padStart(2, '0');
	}

	onMount(() => {
		const interval = setInterval(() => {
			if (totalSeconds > 0) {
				totalSeconds -= 1;
			} else {
				totalSeconds = initialMinutes * 60; // reset loop for persistent urgency
			}
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<div class="inline-flex flex-col sm:flex-row items-center gap-2.5 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border border-rose-200/80 px-4 py-2.5 rounded-2xl shadow-xs animate-in fade-in">
	<div class="flex items-center gap-1.5 text-rose-600 font-bold text-xs">
		<Flame class="w-4 h-4 animate-bounce text-rose-500" />
		<span>{badgeText}:</span>
	</div>

	<div class="flex items-center gap-1.5 font-mono font-black text-sm text-slate-800">
		{#if hours > 0}
			<div class="bg-slate-900 text-white px-2 py-0.5 rounded-lg shadow-2xs">
				{pad(hours)}
			</div>
			<span class="text-slate-400 font-bold">:</span>
		{/if}

		<div class="bg-slate-900 text-white px-2 py-0.5 rounded-lg shadow-2xs">
			{pad(minutes)}
		</div>
		<span class="text-slate-400 font-bold">:</span>

		<div class="bg-rose-600 text-white px-2 py-0.5 rounded-lg shadow-2xs animate-pulse">
			{pad(seconds)}
		</div>
	</div>
</div>

