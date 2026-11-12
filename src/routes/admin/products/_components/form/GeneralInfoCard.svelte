<script lang="ts">
	import RichTextEditor from './RichTextEditor.svelte';
	import { slugify } from '#lib/utils/slug';
	import { Input } from '#lib/components/ui';

	interface Props {
		name: string;
		slug: string;
		autoSlug: boolean;
		isPreOrder: boolean;
		enableBundle: boolean;
		bundleUnitLabel: string;
		description: string;
	}

	let {
		name = $bindable(''),
		slug = $bindable(''),
		autoSlug = $bindable(true),
		isPreOrder = $bindable(false),
		enableBundle = $bindable(false),
		bundleUnitLabel = $bindable(''),
		description = $bindable('')
	}: Props = $props();

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

	<!-- Package / Bundle Offer (per product) -->
	<div class="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
		<label class="flex items-start gap-3 cursor-pointer select-none">
			<input
				type="checkbox"
				bind:checked={enableBundle}
				class="w-4 h-4 mt-0.5 rounded text-[#5845eb] focus:ring-[#5845eb] border-slate-300"
			/>
			<span>
				<span class="block text-sm font-bold text-slate-800">প্যাকেজ অফার চালু করুন (Package Offer)</span>
				<span class="block text-[11px] text-slate-500 mt-0.5">চালু করলে প্রোডাক্ট পেজে ১ / ২ / ৩ ইউনিটের প্যাকেজ নির্বাচনের অপশন দেখাবে (২ ইউনিটে ১০%, ৩ ইউনিটে ১৫% ছাড়)। বন্ধ রাখলে কোনো প্যাকেজ দেখাবে না।</span>
			</span>
		</label>
		{#if enableBundle}
			<div class="flex flex-wrap items-center gap-3 pl-7">
				<label for="bundle-unit-input" class="text-xs font-bold text-slate-700">ইউনিটের নাম:</label>
				<Input
					id="bundle-unit-input"
					bind:value={bundleUnitLabel}
					maxlength={20}
					placeholder="প্যাকেট"
					class="w-40 h-9 text-sm"
				/>
				<span class="text-[11px] text-slate-500">
					প্রিভিউ: ১ {bundleUnitLabel || 'প্যাকেট'} • ২ {bundleUnitLabel || 'প্যাকেট'} • ৩ {bundleUnitLabel || 'প্যাকেট'}
				</span>
			</div>
		{/if}
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
				autocomplete="off"
				class="w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition-all {autoSlug ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-white text-slate-800 border-slate-300 focus:border-[#5845eb] focus:ring-2 focus:ring-[#5845eb]/10'}"
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

