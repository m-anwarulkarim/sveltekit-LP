<script lang="ts">
	import { Sparkles, Globe, Link2, Bold, Italic, Underline, List, ListOrdered, Image as ImageIcon, Smile } from 'lucide-svelte';

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

	function insertText(prefix: string, suffix: string = '') {
		description = (description || '') + `${prefix}${suffix}`;
	}

	const commonEmojis = ['🌸', '✨', '🌿', '📦', '💡', '✅', '🔥', '⭐', '❤️'];
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

	<!-- Description with Rich Text Editor simulation -->
	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<label for="product-description-input" class="block text-xs font-bold text-slate-700">Description</label>
			<!-- Quick Emojis Bar -->
			<div class="hidden sm:flex items-center gap-1">
				{#each commonEmojis as emoji}
					<button
						type="button"
						onclick={() => insertText(` ${emoji} `)}
						class="text-xs hover:scale-125 transition-transform p-1 cursor-pointer"
						title="Insert {emoji}"
					>
						{emoji}
					</button>
				{/each}
			</div>
		</div>

		<!-- Toolbar -->
		<div class="border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:border-[#5845eb] focus-within:ring-3 focus-within:ring-[#5845eb]/10 transition-all">
			<div class="flex flex-wrap items-center gap-1 p-2 bg-slate-50/80 border-b border-slate-200/80 text-slate-600 text-xs">
				<button
					type="button"
					onclick={() => insertText('**', '**')}
					class="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-900 transition-colors cursor-pointer"
					title="Bold"
				>
					<Bold class="w-3.5 h-3.5" />
				</button>
				<button
					type="button"
					onclick={() => insertText('*', '*')}
					class="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-900 transition-colors cursor-pointer"
					title="Italic"
				>
					<Italic class="w-3.5 h-3.5" />
				</button>
				<button
					type="button"
					onclick={() => insertText('<u>', '</u>')}
					class="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-900 transition-colors cursor-pointer"
					title="Underline"
				>
					<Underline class="w-3.5 h-3.5" />
				</button>

				<span class="w-[1px] h-4 bg-slate-200 mx-1"></span>

				<button
					type="button"
					onclick={() => insertText('\n• ')}
					class="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-900 transition-colors cursor-pointer"
					title="Bullet List"
				>
					<List class="w-3.5 h-3.5" />
				</button>
				<button
					type="button"
					onclick={() => insertText('\n1. ')}
					class="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-900 transition-colors cursor-pointer"
					title="Numbered List"
				>
					<ListOrdered class="w-3.5 h-3.5" />
				</button>

				<span class="w-[1px] h-4 bg-slate-200 mx-1"></span>

				<button
					type="button"
					onclick={() => {
						const url = prompt('Enter link URL:');
						if (url) insertText(`[link](${url})`);
					}}
					class="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-900 transition-colors cursor-pointer"
					title="Add Link"
				>
					<Link2 class="w-3.5 h-3.5" />
				</button>

				<button
					type="button"
					onclick={() => {
						const url = prompt('Enter Image URL:');
						if (url) insertText(`\n![image](${url})\n`);
					}}
					class="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-900 transition-colors cursor-pointer"
					title="Insert Image"
				>
					<ImageIcon class="w-3.5 h-3.5" />
				</button>
			</div>

			<textarea
				id="product-description-input"
				bind:value={description}
				rows="7"
				placeholder="🌸 আলমারি সুগন্ধি স্যাশে - ৪৮ পিস&#10;🌿 আপনার কাপড় ও আলমারিতে রাখুন মন মাতানো সুগন্ধ!&#10;📦 প্যাকেজ: ৪৮টি স্যাশে&#10;💡 বৈশিষ্ট্য: পোকা প্রতিরোধক ও লং লাস্টিং..."
				class="w-full p-4 border-none text-slate-800 placeholder:text-slate-400 focus:outline-hidden text-sm leading-relaxed resize-y font-['Hind_Siliguri',sans-serif]"
			></textarea>
		</div>
	</div>
</div>

