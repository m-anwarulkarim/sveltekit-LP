<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import { THEME_DESIGN_PRESETS, type ThemePreset } from '../_components/theme-presets.data';
	import ThemeDesignCard from '../_components/ThemeDesignCard.svelte';
	import {
		ExternalLink,
		X,
		Check,
		Sparkles,
		Loader2,
		Layers,
		Palette,
		Eye,
		Monitor
	} from 'lucide-svelte';

	let { data, form }: { data: any; form: any } = $props();

	let activePresetName = $derived(data?.themeConfig?.activePreset || 'AURA Modern');
	let selectedPreviewPreset = $state<ThemePreset | null>(null);
	let isModalApplying = $state(false);

	$effect(() => {
		if (form?.message) {
			if (form.success) {
				toast.success(form.message);
			} else {
				toast.error(form.message);
			}
		}
	});

	function handlePresetApplied(preset: ThemePreset) {
		toast.success(`"${preset.name}" থিম ডিজাইন সফলভাবে সক্রিয় করা হয়েছে!`);
	}
</script>

<svelte:head>
	<title>Theme Designs - Ready-Made Storefront Themes - AURA Admin</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto">
	<!-- Top Subheader & Storefront Quick View Link -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
		<div>
			<h2 class="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
				<Layers class="w-5 h-5 text-[#5845eb]" />
				<span>রেডিমেড থিম ডিজাইন প্রিসেট</span>
			</h2>
			<p class="text-xs text-slate-500 mt-0.5">
				পছন্দের যেকোনো থিম নির্বাচন করে ১-ক্লিকে স্টোরফ্রন্টের লেআউট ও ব্র্যান্ড কালার অ্যাপ্লাই করুন
			</p>
		</div>

		<a
			href="/"
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
		>
			<Monitor class="w-3.5 h-3.5" />
			<span>লাইভ সাইট দেখুন</span>
			<ExternalLink class="w-3 h-3 text-slate-400" />
		</a>
	</div>

	<!-- 2-Column Storefront Theme Presets Grid (Exact 2 Presets as requested) -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		{#each THEME_DESIGN_PRESETS as preset (preset.id)}
			<ThemeDesignCard
				{preset}
				isActive={activePresetName.toLowerCase() === preset.name.toLowerCase()}
				onApply={handlePresetApplied}
				onPreview={(p) => (selectedPreviewPreset = p)}
			/>
		{/each}
	</div>

	<!-- Interactive Theme Live Preview Modal -->
	{#if selectedPreviewPreset}
		<div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
			<div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
				<!-- Modal Header -->
				<div class="p-5 border-b border-slate-200 flex items-center justify-between shrink-0">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-2xl bg-gradient-to-tr {selectedPreviewPreset.previewGradient} flex items-center justify-center text-white shadow-sm">
							<Palette class="w-5 h-5" />
						</div>
						<div>
							<div class="flex items-center gap-2">
								<h3 class="text-base font-black text-slate-900">{selectedPreviewPreset.name}</h3>
								<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 font-mono">
									{selectedPreviewPreset.version}
								</span>
							</div>
							<p class="text-xs text-slate-500 mt-0.5">{selectedPreviewPreset.brand} • {selectedPreviewPreset.badge}</p>
						</div>
					</div>
					<button
						onclick={() => (selectedPreviewPreset = null)}
						class="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
					>
						<X class="w-5 h-5" />
					</button>
				</div>

				<!-- Modal Body Content -->
				<div class="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
					<!-- Description -->
					<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
						{selectedPreviewPreset.description}
					</div>

					<!-- Visual Mockup Canvas -->
					<div class="relative w-full aspect-[16/9] rounded-2xl bg-gradient-to-br {selectedPreviewPreset.previewGradient} p-4 flex flex-col justify-between overflow-hidden shadow-inner">
						<div class="flex items-center justify-between text-white text-[11px] font-bold">
							<span>{selectedPreviewPreset.name} Preview</span>
							<span>{selectedPreviewPreset.colors.primaryLabel}</span>
						</div>

						<div class="w-[85%] mx-auto aspect-[16/9] bg-white rounded-xl shadow-2xl p-2.5 flex flex-col justify-between border border-white/60">
							<div class="w-full h-3 rounded bg-indigo-600/90 flex items-center justify-between px-1.5">
								<div class="w-10 h-1 bg-white/80 rounded-full"></div>
								<div class="w-3 h-1 bg-white/80 rounded-full"></div>
							</div>
							<div class="w-full flex-1 bg-slate-100 rounded my-1 flex items-center justify-center text-slate-700 font-black text-[10px]">
								{selectedPreviewPreset.components.showcaseLabel}
							</div>
							<div class="grid grid-cols-4 gap-1">
								<div class="h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[7px] font-bold text-slate-500">Card 1</div>
								<div class="h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[7px] font-bold text-slate-500">Card 2</div>
								<div class="h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[7px] font-bold text-slate-500">Card 3</div>
								<div class="h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[7px] font-bold text-slate-500">Card 4</div>
							</div>
						</div>
					</div>

					<!-- Color Palette Swatch -->
					<div class="space-y-2">
						<h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider">রং প্যালেট ও স্টাইল</h4>
						<div class="grid grid-cols-3 gap-2.5">
							<div class="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5">
								<span class="w-5 h-5 rounded-lg shadow-xs shrink-0" style="background-color: {selectedPreviewPreset.colors.primary}"></span>
								<div>
									<div class="font-bold text-slate-800 text-[11px]">Primary</div>
									<div class="text-[10px] text-slate-400 font-mono">{selectedPreviewPreset.colors.primary}</div>
								</div>
							</div>
							<div class="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5">
								<span class="w-5 h-5 rounded-lg shadow-xs shrink-0" style="background-color: {selectedPreviewPreset.colors.secondary}"></span>
								<div>
									<div class="font-bold text-slate-800 text-[11px]">Secondary</div>
									<div class="text-[10px] text-slate-400 font-mono">{selectedPreviewPreset.colors.secondary}</div>
								</div>
							</div>
							<div class="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5">
								<span class="w-5 h-5 rounded-lg shadow-xs shrink-0" style="background-color: {selectedPreviewPreset.colors.tertiary}"></span>
								<div>
									<div class="font-bold text-slate-800 text-[11px]">Accent</div>
									<div class="text-[10px] text-slate-400 font-mono">{selectedPreviewPreset.colors.tertiary}</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Components Included -->
					<div class="space-y-2">
						<h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider">অন্তর্ভুক্ত কম্পোনেন্টস</h4>
						<div class="grid grid-cols-2 gap-2 text-slate-700">
							<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
								<span class="font-semibold">হেডার বার:</span>
								<span class="font-bold text-indigo-600">{selectedPreviewPreset.components.headerLabel}</span>
							</div>
							<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
								<span class="font-semibold">হিরো শোকেস:</span>
								<span class="font-bold text-indigo-600">{selectedPreviewPreset.components.showcaseLabel}</span>
							</div>
							<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
								<span class="font-semibold">প্রোডাক্ট কার্ড:</span>
								<span class="font-bold text-indigo-600">{selectedPreviewPreset.components.productCardLabel}</span>
							</div>
							<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
								<span class="font-semibold">ফুটার লেআউট:</span>
								<span class="font-bold text-indigo-600">{selectedPreviewPreset.components.footerLabel}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Modal Action Footer -->
				<div class="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
					<button
						type="button"
						onclick={() => (selectedPreviewPreset = null)}
						class="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
					>
						বন্ধ করুন
					</button>

					<form
						method="POST"
						action="?/applyPreset"
						use:enhance={() => {
							isModalApplying = true;
							return async ({ update }) => {
								isModalApplying = false;
								await update();
								if (selectedPreviewPreset) handlePresetApplied(selectedPreviewPreset);
								selectedPreviewPreset = null;
							};
						}}
					>
						<input type="hidden" name="presetId" value={selectedPreviewPreset.id} />
						<input type="hidden" name="presetName" value={selectedPreviewPreset.name} />
						<input type="hidden" name="header" value={selectedPreviewPreset.components.header} />
						<input type="hidden" name="showcase" value={selectedPreviewPreset.components.showcase} />
						<input type="hidden" name="productCard" value={selectedPreviewPreset.components.productCard} />
						<input type="hidden" name="footer" value={selectedPreviewPreset.components.footer} />
						<input type="hidden" name="colors" value={JSON.stringify(selectedPreviewPreset.colors)} />

						<button
							type="submit"
							disabled={isModalApplying || activePresetName.toLowerCase() === selectedPreviewPreset.name.toLowerCase()}
							class="px-5 py-2.5 rounded-xl bg-[#5845eb] hover:bg-[#4935d9] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/25 cursor-pointer disabled:opacity-50"
						>
							{#if isModalApplying}
								<Loader2 class="w-4 h-4 animate-spin" />
								<span>অ্যাপ্লাই হচ্ছে...</span>
							{:else if activePresetName.toLowerCase() === selectedPreviewPreset.name.toLowerCase()}
								<Check class="w-4 h-4 stroke-[2.5]" />
								<span>বর্তমানে সক্রিয় আছে</span>
							{:else}
								<Sparkles class="w-4 h-4" />
								<span>এই থিমটি সক্রিয় করুন</span>
							{/if}
						</button>
					</form>
				</div>
			</div>
		</div>
	{/if}
</div>
