<script lang="ts">
	import { Flame, AlertTriangle } from 'lucide-svelte';

	interface Props {
		urgencyMessage: string;
	}

	let { urgencyMessage = $bindable('') }: Props = $props();
</script>

<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-4">
	<div class="border-b border-slate-100 pb-3">
		<h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
			<span>Low Stock / Urgency Message</span>
		</h2>
	</div>

	<div class="space-y-1.5">
		<label for="urgency-message-input" class="block text-xs font-bold text-slate-700">
			Message <span class="text-slate-400 font-normal">(e.g. Only 2 items left in stock)</span>
		</label>
		<input
			id="urgency-message-input"
			type="text"
			bind:value={urgencyMessage}
			placeholder="Enter message (e.g. মাত্র ৫ টি অবশিষ্ট আছে, দ্রুত অর্ডার করুন!)"
			class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-medium transition-all"
		/>
	</div>

	<!-- Live Customer View Preview -->
	{#if urgencyMessage}
		<div class="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2.5 text-xs text-amber-800 animate-in fade-in">
			<span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
			<span class="font-bold flex items-center gap-1.5">
				<Flame class="w-3.5 h-3.5 text-rose-500" />
				<span>Customer Preview:</span>
			</span>
			<span class="font-semibold text-rose-700 bg-white/80 px-2 py-0.5 rounded border border-rose-200">
				{urgencyMessage}
			</span>
		</div>
	{/if}
</div>

