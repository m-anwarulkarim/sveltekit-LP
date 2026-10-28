<script lang="ts">
	import { Sparkles, Globe, Link2 } from 'lucide-svelte';
	import RichTextEditor from './RichTextEditor.svelte';

	interface Props {
		name: string;
		slug: string;
		autoSlug: boolean;
		isPreOrder: boolean;
		landingPageLink: string;
		description: string;
	}

	let {
		name = $bindable(''),
		slug = $bindable(''),
		autoSlug = $bindable(true),
		isPreOrder = $bindable(false),
		landingPageLink = $bindable(''),
		description = $bindable('')
	}: Props = $props();

	function slugify(text: string) {
		return text
			.toString()
			.toLowerCase()
			.trim()
			.replace(/[\s\W-]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	$effect(() => {
		if (autoSlug && name) {
			const generated = slugify(name);
			if (generated) {
				slug = generated;
			}
		}
	});
</script>

<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-5">
	<!-- Card Header with Auto Slug & Pre-Order toggles -->
	<div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
		<h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
			<span>General Information</span>
		</h2>

		<div class="flex items-center gap-5 text-sm">
			<!-- Auto Slug Checkbox -->
			<label class="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer select-none">
				<input
					type="checkbox"
					bind:checked={autoSlug}
					class="w-4 h-4 rounded text-[#5845eb] focus:ring-[#5845eb] border-slate-300 transition-colors"
				/>
				<span>Auto Slug</span>
			</label>

			<!-- Is Pre-Order Checkbox -->
			<label class="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer select-none">
				<input
					type="checkbox"
					bind:checked={isPreOrder}
					class="w-4 h-4 rounded text-[#5845eb] focus:ring-[#5845eb] border-slate-300 transition-colors"
				/>
				<span>Is Pre-Order</span>
			</label>
		</div>
	</div>

	<!-- Product Name -->
	<div class="space-y-1.5">
		<label for="product-name-input" class="block text-xs font-bold text-slate-700">
			Product Name <span class="text-rose-500">*</span>
		</label>
		<input
			id="product-name-input"
			type="text"
			bind:value={name}
			placeholder="যেমন: 🌸 Floral Camphor Balls – আলমারি সুগন্ধি ও পোকা প্রতিরোধক বল ৯৬টি"
			class="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-medium transition-all"
			required
		/>
	</div>

	<!-- Slug preview / manual edit -->
	<div class="space-y-1.5">
		<div class="flex items-center justify-between">
			<label for="product-slug-input" class="block text-xs font-bold text-slate-700">Product Slug</label>
			<span class="text-[11px] text-slate-400 font-mono">store.com/product/{slug || '...'}</span>
		</div>
		<div class="relative">
			<input
				id="product-slug-input"
				type="text"
				bind:value={slug}
				disabled={autoSlug}
				placeholder="product-unique-slug"
				class="w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition-all {autoSlug ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-white text-slate-800 border-slate-300 focus:border-[#5845eb] focus:ring-2 focus:ring-[#5845eb]/10'}"
			/>
		</div>
	</div>

	<!-- Landing page link override -->
	<div class="space-y-1.5">
		<label for="landing-page-input" class="block text-xs font-bold text-slate-700">
			Landing Page Link <span class="text-slate-400 font-normal">(Optional Override)</span>
		</label>
		<div class="relative">
			<Globe class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
			<input
				id="landing-page-input"
				type="url"
				bind:value={landingPageLink}
				placeholder="https://lp.yourstore.com/offer-page"
				class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm transition-all"
			/>
		</div>
	</div>

	<!-- Product Description with Rich Text WYSIWYG Editor -->
	<div class="space-y-2">
		<label class="block text-xs font-bold text-slate-700">
			প্রোডাক্ট ডেসক্রিপশন (Product Description & Styling)
		</label>
		<RichTextEditor
			bind:value={description}
			placeholder="পণ্য সম্পর্কে আকর্ষণীয় বর্ণনা লিখুন... বোল্ড, রঙিন লেখা, হেডিং ও বিভিন্ন স্টাইল ব্যবহার করতে পারেন।"
		/>
	</div>
</div>

