<script lang="ts">
	import { enhance } from '$app/forms';
	import { Check, Sparkles, Loader2, Laptop, Smartphone } from 'lucide-svelte';
	import type { ThemePreset } from './theme-presets.data';

	interface Props {
		preset: ThemePreset;
		isActive?: boolean;
		onApply?: (preset: ThemePreset) => void;
	}

	let { preset, isActive = false, onApply }: Props = $props();
	let isApplying = $state(false);
</script>

<div
	class="bg-white rounded-3xl border transition-all shadow-2xs overflow-hidden flex flex-col justify-between {isActive
		? 'border-[#5845eb] ring-2 ring-[#5845eb]/25 shadow-md'
		: 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'}"
>
	<!-- 1. Rich Mockup Illustration Canvas -->
	<div class="relative w-full aspect-[4/3] bg-gradient-to-br {preset.previewGradient} p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
		<!-- Watermark Brand -->
		<div class="flex items-center justify-between text-white/90 z-10">
			<span class="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
				<span class="w-2.5 h-2.5 rounded-full bg-white/80"></span>
				{preset.brand}
			</span>
			<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/25 text-white/90 backdrop-blur-xs">
				{preset.version}
			</span>
		</div>

		<!-- Center Laptop & Mobile Visual Mockup Schematics -->
		<div class="relative w-full flex-1 flex items-center justify-center my-2">
			<!-- Laptop Body Schematic -->
			<div class="w-[82%] aspect-[16/10] bg-white rounded-xl shadow-2xl border border-white/40 p-2 flex flex-col justify-between overflow-hidden z-10">
				<!-- Mockup Header -->
				<div class="w-full h-2 rounded bg-pink-500/80 mb-1.5"></div>
				<!-- Mockup Banner -->
				<div class="w-full flex-1 bg-gradient-to-r from-slate-100 to-slate-200 rounded-sm flex items-center justify-center p-1">
					<span class="text-[8px] font-black uppercase tracking-tight text-slate-700 text-center leading-tight">
						{preset.name} STORE
					</span>
				</div>
				<!-- Mockup Product Grid -->
				<div class="grid grid-cols-4 gap-1 mt-1.5">
					<div class="h-4 bg-slate-100 rounded-xs"></div>
					<div class="h-4 bg-slate-100 rounded-xs"></div>
					<div class="h-4 bg-slate-100 rounded-xs"></div>
					<div class="h-4 bg-slate-100 rounded-xs"></div>
				</div>
			</div>

			<!-- Mobile Phone Overlay Schematic on Left -->
			<div class="absolute -left-1 bottom-0 w-[28%] aspect-[9/18] bg-slate-950 rounded-xl shadow-2xl border-2 border-white p-1 flex flex-col justify-between z-20">
				<div class="w-6 h-1 rounded-full bg-slate-800 mx-auto"></div>
				<div class="w-full flex-1 bg-white rounded-md my-1 p-0.5 flex flex-col justify-between">
					<div class="w-full h-1 bg-pink-500 rounded-xs"></div>
					<div class="w-full h-4 bg-slate-100 rounded-xs"></div>
					<div class="grid grid-cols-2 gap-0.5">
						<div class="h-3 bg-slate-100 rounded-xs"></div>
						<div class="h-3 bg-slate-100 rounded-xs"></div>
					</div>
				</div>
				<div class="w-3 h-0.5 rounded-full bg-slate-800 mx-auto"></div>
			</div>
		</div>

		<!-- Bottom Shadow Blur -->
		<div class="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
	</div>

	<!-- 2. Preset Metadata & Component Tags -->
	<div class="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
		<div>
			<div class="flex items-center justify-between gap-2">
				<h3 class="text-base font-black text-slate-900 tracking-tight">{preset.name}</h3>
				<span class="text-[11px] font-bold text-slate-400 font-mono">{preset.version}</span>
			</div>
			<p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
				{preset.description}
			</p>

			<!-- Components Pills Bar -->
			<div class="flex items-center flex-wrap gap-1.5 pt-3">
				<span class="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
					{preset.components.productCardLabel}
				</span>
				<span class="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
					{preset.components.headerLabel}
				</span>
				<span class="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200/70">
					{preset.components.showcaseLabel}
				</span>
				<span class="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200/70">
					{preset.components.footerLabel}
				</span>
			</div>
		</div>

		<!-- 3. Action Button (Apply Design) -->
		<form
			method="POST"
			action="?/applyPreset"
			use:enhance={() => {
				isApplying = true;
				return async ({ update }) => {
					isApplying = false;
					await update();
					onApply?.(preset);
				};
			}}
			class="pt-2"
		>
			<input type="hidden" name="presetId" value={preset.id} />
			<input type="hidden" name="presetName" value={preset.name} />
			<input type="hidden" name="header" value={preset.components.header} />
			<input type="hidden" name="showcase" value={preset.components.showcase} />
			<input type="hidden" name="productCard" value={preset.components.productCard} />
			<input type="hidden" name="footer" value={preset.components.footer} />

			<button
				type="submit"
				disabled={isApplying}
				class="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 disabled:opacity-50 {isActive
					? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
					: 'bg-[#5845eb] hover:bg-[#4935d9] text-white shadow-indigo-600/20'}"
			>
				{#if isApplying}
					<Loader2 class="w-4 h-4 animate-spin" />
					<span>অ্যাপ্লাই হচ্ছে...</span>
				{:else if isActive}
					<Check class="w-4 h-4 stroke-[2.5]" />
					<span>বর্তমানে সক্রিয় ডিজাইন</span>
				{:else}
					<Sparkles class="w-4 h-4" />
					<span>Apply Design</span>
				{/if}
			</button>
		</form>
	</div>
</div>

