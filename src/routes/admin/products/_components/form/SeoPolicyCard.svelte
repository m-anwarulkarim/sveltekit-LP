<script lang="ts">
	import { Search, Globe, RotateCcw } from 'lucide-svelte';

	interface Props {
		seoTitle: string;
		seoDescription: string;
		seoKeywords: string;
		returnPolicy: string;
		productName: string;
		productSlug: string;
	}

	let {
		seoTitle = $bindable(''),
		seoDescription = $bindable(''),
		seoKeywords = $bindable(''),
		returnPolicy = $bindable(''),
		productName = '',
		productSlug = ''
	}: Props = $props();

	// Default fallback values
	let displayTitle = $derived(seoTitle || productName || 'Product Title');
	let displayDesc = $derived(
		seoDescription ||
			'Discover high quality authentic products with fast nationwide home delivery and easy replacement guarantee.'
	);
</script>

<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-6">
	<!-- 1. SEO Information -->
	<div class="space-y-4">
		<div class="border-b border-slate-100 pb-3">
			<h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
				<Search class="w-4 h-4 text-[#5845eb]" />
				<span>Seo Information</span>
			</h2>
		</div>

		<!-- SEO Title -->
		<div class="space-y-1.5">
			<div class="flex items-center justify-between text-xs">
				<label for="seo-title-input" class="font-bold text-slate-700">Seo Title</label>
				<span class="text-slate-400 font-mono text-[11px]">{seoTitle.length} / 70</span>
			</div>
			<input
				id="seo-title-input"
				type="text"
				bind:value={seoTitle}
				placeholder={productName || 'Enter SEO title'}
				maxlength="70"
				class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-medium transition-all"
			/>
		</div>

		<!-- SEO Description -->
		<div class="space-y-1.5">
			<div class="flex items-center justify-between text-xs">
				<label for="seo-desc-input" class="font-bold text-slate-700">Seo Description</label>
				<span class="text-slate-400 font-mono text-[11px]">{seoDescription.length} / 160</span>
			</div>
			<textarea
				id="seo-desc-input"
				bind:value={seoDescription}
				rows="3"
				placeholder="Enter SEO description for Google and social media preview..."
				maxlength="160"
				class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-medium transition-all resize-none"
			></textarea>
		</div>

		<!-- Keyword -->
		<div class="space-y-1.5">
			<label for="seo-keyword-input" class="block text-xs font-bold text-slate-700">Keyword</label>
			<textarea
				id="seo-keyword-input"
				bind:value={seoKeywords}
				rows="2"
				placeholder="e.g., organic honey, raw honey, pure honey, camphor balls, fragrance"
				class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-medium transition-all resize-none"
			></textarea>
		</div>

		<!-- Google Search Preview Simulator -->
		<div class="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-1 text-xs">
			<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Engine Result Preview</span>
			<div class="font-medium text-emerald-700 truncate text-[11px]">
				https://yourstore.com/product/{productSlug || 'sample-product'}
			</div>
			<div class="text-[#1a0dab] font-bold text-sm truncate hover:underline cursor-pointer">
				{displayTitle}
			</div>
			<div class="text-slate-600 line-clamp-2 text-xs leading-relaxed">
				{displayDesc}
			</div>
		</div>
	</div>

	<!-- 2. Returns & Exchange Information -->
	<div class="space-y-3 pt-3 border-t border-slate-100">
		<div class="flex items-center gap-2">
			<RotateCcw class="w-4 h-4 text-slate-600" />
			<h3 class="text-sm font-bold text-slate-800">Returns & Exchange Information</h3>
		</div>
		<textarea
			bind:value={returnPolicy}
			rows="3"
			placeholder="Enter return and exchange Information... (যেমন: ডেলিভারি ম্যানের সামনে প্রোডাক্ট চেক করে নিবেন। সমস্যা থাকলে ৭ দিনের মধ্যে ফ্রি এক্সচেঞ্জ প্রযোজ্য।)"
			class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-medium transition-all resize-none"
		></textarea>
	</div>
</div>

