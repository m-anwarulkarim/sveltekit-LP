<script lang="ts">
	import { Utensils, Gift, Plus, Trash2 } from 'lucide-svelte';

	interface Props {
		enableProcessing: boolean;
		processingOptions: string[];
	}

	let {
		enableProcessing = $bindable(false),
		processingOptions = $bindable(['Ready to Cook', 'Semi Cooked', 'Asto / Whole'])
	}: Props = $props();

	let newOptionText = $state('');

	function addOption() {
		if (newOptionText.trim()) {
			processingOptions = [...processingOptions, newOptionText.trim()];
			newOptionText = '';
		}
	}

	function removeOption(index: number) {
		processingOptions = processingOptions.filter((_, i) => i !== index);
	}
</script>

<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-4">
	<div class="border-b border-slate-100 pb-3">
		<h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
			<span>Processing Charges</span>
		</h2>
	</div>

	<!-- Checkbox Toggle -->
	<label class="flex items-start gap-3 text-slate-700 font-semibold text-sm cursor-pointer select-none">
		<input
			type="checkbox"
			bind:checked={enableProcessing}
			class="w-4 h-4 mt-0.5 rounded text-[#5845eb] focus:ring-[#5845eb] border-slate-300 transition-colors"
		/>
		<div class="flex flex-col">
			<span>Enable Processing Options (Ready to Cook/Semi Cooked/Asto)</span>
			<span class="text-xs text-slate-400 font-normal">
				খাবার, গিফট র‍্যাপিং বা কাস্টম প্রসেসিং অপশনের জন্য প্রযোজ্য
			</span>
		</div>
	</label>

	<!-- Configurable options if enabled -->
	{#if enableProcessing}
		<div class="pt-2 space-y-3 animate-in fade-in">
			<div class="flex flex-wrap gap-2">
				{#each processingOptions as opt, i}
					<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-[#5845eb]">
						<span>{opt}</span>
						<button
							type="button"
							onclick={() => removeOption(i)}
							class="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
							title="Remove"
						>
							<Trash2 class="w-3 h-3" />
						</button>
					</span>
				{/each}
			</div>

			<!-- Add new custom option -->
			<div class="flex gap-2 max-w-md">
				<input
					type="text"
					bind:value={newOptionText}
					placeholder="New option (e.g. Gift Wrap, Premium Pack)"
					class="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb]"
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							addOption();
						}
					}}
				/>
				<button
					type="button"
					onclick={addOption}
					class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
				>
					<Plus class="w-3.5 h-3.5" />
					<span>Add</span>
				</button>
			</div>
		</div>
	{/if}
</div>
