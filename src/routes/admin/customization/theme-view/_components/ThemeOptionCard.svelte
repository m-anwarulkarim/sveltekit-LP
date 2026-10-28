<script lang="ts">
	import { Check, Eye } from 'lucide-svelte';

	interface Props {
		id: string;
		title: string;
		selected?: boolean;
		isMultiSelect?: boolean;
		isDefault?: boolean;
		badgeText?: string;
		badgeVariant?: 'gold' | 'red' | 'blue' | 'gray';
		thumbnailUrl?: string | null;
		schematicType?: 'header' | 'showcase' | 'category' | 'product_card' | 'bottom_nav' | 'footer' | 'checkout' | 'none';
		onSelect: () => void;
		onPreview?: () => void;
	}

	let {
		id,
		title,
		selected = false,
		isMultiSelect = false,
		isDefault = false,
		badgeText,
		badgeVariant = 'gray',
		thumbnailUrl,
		schematicType = 'header',
		onSelect,
		onPreview
	}: Props = $props();
</script>

<button
	type="button"
	onclick={onSelect}
	class="relative w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 sm:gap-4 select-none {selected
		? 'border-[#2563eb] ring-2 ring-[#2563eb]/25 bg-blue-50/25 shadow-xs'
		: 'border-slate-200/90 bg-white hover:bg-slate-50/80 hover:border-slate-300 shadow-2xs'}"
	role={isMultiSelect ? 'checkbox' : 'radio'}
	aria-checked={selected}
>
	<!-- 1. Selection Indicator (Radio or Checkbox) -->
	{#if isMultiSelect}
		<div
			class="w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors {selected
				? 'bg-[#2563eb] border-[#2563eb] text-white'
				: 'border-slate-300 bg-white'}"
		>
			{#if selected}
				<Check class="w-3 h-3 stroke-[3]" />
			{/if}
		</div>
	{:else}
		<div
			class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors {selected
				? 'border-[#2563eb] bg-white'
				: 'border-slate-300 bg-white'}"
		>
			{#if selected}
				<span class="w-2 h-2 rounded-full bg-[#2563eb]"></span>
			{/if}
		</div>
	{/if}

	<!-- 2. Schematic Thumbnail Box -->
	<div
		class="w-14 sm:w-16 h-12 sm:h-14 rounded-xl bg-slate-50/90 border border-slate-200/70 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs"
	>
		{#if thumbnailUrl}
			<img src={thumbnailUrl} alt={title} class="w-full h-full object-cover" />
		{:else if schematicType === 'header'}
			<!-- Header Schematic: Pink top bar & white body -->
			<div class="w-full h-full p-1.5 flex flex-col justify-between bg-white">
				<div class="w-full h-2 rounded-sm bg-pink-500/20 border-b border-pink-500"></div>
				<div class="space-y-1">
					<div class="w-3/4 h-1 rounded bg-slate-200"></div>
					<div class="w-1/2 h-1 rounded bg-slate-200"></div>
				</div>
			</div>
		{:else if schematicType === 'showcase'}
			<!-- Showcase Schematic: Vibrant banner graphic -->
			<div class="w-full h-full bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center p-1 text-white text-[7px] font-black uppercase text-center leading-tight">
				BANNER SHOWCASE
			</div>
		{:else if schematicType === 'category'}
			<!-- Category Schematic: 4 circular/card categories -->
			<div class="w-full h-full grid grid-cols-2 gap-1 p-1 bg-white">
				<div class="bg-indigo-50 border border-indigo-200 rounded"></div>
				<div class="bg-pink-50 border border-pink-200 rounded"></div>
				<div class="bg-amber-50 border border-amber-200 rounded"></div>
				<div class="bg-emerald-50 border border-emerald-200 rounded"></div>
			</div>
		{:else if schematicType === 'product_card'}
			<!-- Product Card Schematic -->
			<div class="w-full h-full p-1 bg-white flex flex-col justify-between">
				<div class="w-full h-6 bg-slate-100 rounded-sm"></div>
				<div class="w-full h-2 bg-pink-500 rounded-xs"></div>
			</div>
		{:else if schematicType === 'bottom_nav'}
			<!-- Bottom Nav Schematic -->
			<div class="w-full h-full p-1 bg-white flex flex-col justify-end">
				<div class="w-full h-3.5 rounded-sm bg-pink-50 border border-pink-200 flex items-center justify-around px-1">
					<span class="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
					<span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
					<span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
				</div>
			</div>
		{:else if schematicType === 'footer'}
			<!-- Footer Schematic -->
			<div class="w-full h-full flex flex-col justify-end">
				<div class="w-full h-7 bg-slate-900 text-[6px] text-slate-300 flex items-center justify-center p-1 font-mono">
					FOOTER
				</div>
			</div>
		{:else if schematicType === 'checkout'}
			<!-- Checkout Schematic -->
			<div class="w-full h-full p-1 bg-white flex flex-col justify-between">
				<div class="w-full h-2 rounded bg-slate-200"></div>
				<div class="w-3/4 h-1.5 rounded bg-slate-200"></div>
				<div class="w-full h-3 rounded bg-[#2563eb] text-[6px] text-white flex items-center justify-center font-bold">
					PAY
				</div>
			</div>
		{:else if schematicType === 'none'}
			<!-- None / Empty Category Schematic -->
			<div class="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-slate-100">
				<span class="text-[7px] font-black text-slate-400 leading-tight">NO CATEGORY</span>
			</div>
		{:else}
			<svg class="w-6 h-6 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
				<circle cx="9" cy="9" r="2" />
				<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
			</svg>
		{/if}
	</div>

	<!-- 3. Title & Badges -->
	<div class="min-w-0 flex-1">
		<h4 class="text-xs sm:text-[13px] font-bold text-slate-900 truncate tracking-tight">{title}</h4>

		{#if isDefault}
			<span
				class="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100/90 text-amber-800 border border-amber-300/80 shadow-2xs"
			>
				DEFAULT
			</span>
		{:else if badgeText}
			<span
				class="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-2xs border {badgeVariant ===
				'red'
					? 'bg-rose-50 text-rose-700 border-rose-200'
					: badgeVariant === 'gold'
						? 'bg-amber-100 text-amber-800 border-amber-300'
						: badgeVariant === 'blue'
							? 'bg-blue-50 text-blue-700 border-blue-200'
							: 'bg-slate-100 text-slate-600 border-slate-200'}"
			>
				{badgeText}
			</span>
		{/if}
	</div>

	<!-- 4. Quick Preview Action Button (Optional) -->
	{#if onPreview}
		<button
			type="button"
			onclick={(e) => {
				e.stopPropagation();
				onPreview();
			}}
			title="লাইভ প্রিভিউ দেখুন"
			class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#2563eb] border border-slate-200/80 hover:border-blue-200 text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
		>
			<Eye class="w-3.5 h-3.5 text-[#2563eb]" />
			<span class="hidden sm:inline">Preview</span>
		</button>
	{/if}
</button>


