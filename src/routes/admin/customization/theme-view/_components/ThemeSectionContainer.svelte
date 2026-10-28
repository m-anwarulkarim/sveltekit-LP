<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		selectionMode?: 'SINGLE SELECT' | 'MULTIPLE SELECT';
		sectionTag?: string;
		children: Snippet;
	}

	let {
		title,
		selectionMode = 'SINGLE SELECT',
		sectionTag,
		children
	}: Props = $props();
</script>

<div class="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 lg:p-7 space-y-4 sm:space-y-5 shadow-2xs">
	<!-- Section Header with Badges -->
	<div class="flex items-center flex-wrap gap-2 sm:gap-2.5 pb-1">
		<h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
			{title}
		</h3>

		<!-- Mode Badge (Single or Multiple) -->
		<span
			class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border {selectionMode ===
			'MULTIPLE SELECT'
				? 'bg-purple-50 text-purple-700 border-purple-200/80'
				: 'bg-blue-50 text-blue-700 border-blue-200/80'}"
		>
			{selectionMode}
		</span>

		<!-- Section Identifier Tag -->
		{#if sectionTag}
			<span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/70 font-mono">
				{sectionTag}
			</span>
		{/if}
	</div>

	<!-- 3-Column Responsive Grid Container -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
		{@render children()}
	</div>
</div>

