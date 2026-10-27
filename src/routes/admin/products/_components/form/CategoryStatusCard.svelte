<script lang="ts">
	import { FolderTree, Tag, Eye, EyeOff, Sparkles, HelpCircle } from 'lucide-svelte';

	interface Props {
		category: string;
		subCategory?: string;
		childCategory?: string;
		status: 'published' | 'draft';
		badge?: string | null;
		sizeChartImage?: string;
	}

	let {
		category = $bindable('Audio'),
		subCategory = $bindable('Earphones'),
		childCategory = $bindable('Wireless'),
		status = $bindable('published'),
		badge = $bindable(null),
		sizeChartImage = $bindable('')
	}: Props = $props();

	const categories = ['Audio', 'Lifestyle', 'Accessories', 'Fragrance & Home', 'Gadgets', 'Fashion'];
	const subCategories: Record<string, string[]> = {
		Audio: ['Headphones', 'Earphones', 'Speakers', 'Amplifiers'],
		Lifestyle: ['Comfort', 'Decor', 'Stationery'],
		'Fragrance & Home': ['Camphor Balls', 'Diffusers', 'Scented Candles'],
		Gadgets: ['Chargers', 'Cables', 'Mounts'],
		Fashion: ['Shirts', 'Pants', 'Shoes'],
		Accessories: ['Cases', 'Straps', 'Cleaning Kits']
	};

	const availableBadges = ['Bestseller', 'New Arrival', 'Hot Deal', 'Trending', 'Special Offer', 'Top Rated'];
</script>

<div class="space-y-4">
	<!-- 1. Status & Visibility Card -->
	<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
		<h2 class="text-sm font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-3">
			<span>Publish Status</span>
			<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase {status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}">
				<span class="w-1.5 h-1.5 rounded-full {status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
				<span>{status}</span>
			</span>
		</h2>

		<!-- Status Toggle Buttons -->
		<div class="grid grid-cols-2 gap-2">
			<button
				type="button"
				onclick={() => (status = 'published')}
				class="py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer {status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}"
			>
				<Eye class="w-3.5 h-3.5" />
				<span>Publish</span>
			</button>

			<button
				type="button"
				onclick={() => (status = 'draft')}
				class="py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer {status === 'draft' ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}"
			>
				<EyeOff class="w-3.5 h-3.5" />
				<span>Draft</span>
			</button>
		</div>
	</div>

	<!-- 2. Categorization Hierarchy Card -->
	<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
		<h2 class="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
			<FolderTree class="w-4 h-4 text-[#5845eb]" />
			<span>Category Hierarchy</span>
		</h2>

		<!-- Category -->
		<div class="space-y-1.5">
			<label for="category-hierarchy-input" class="block text-xs font-bold text-slate-700">Category *</label>
			<select
				id="category-hierarchy-input"
				bind:value={category}
				class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-hidden focus:border-[#5845eb]"
			>
				{#each categories as cat}
					<option value={cat}>{cat}</option>
				{/each}
			</select>
		</div>

		<!-- Sub-Category -->
		<div class="space-y-1.5">
			<label for="sub-category-input" class="block text-xs font-bold text-slate-700">Sub-Category</label>
			<select
				id="sub-category-input"
				bind:value={subCategory}
				class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-hidden focus:border-[#5845eb]"
			>
				<option value="">None / Select Sub-Category</option>
				{#each (subCategories[category] || []) as sub}
					<option value={sub}>{sub}</option>
				{/each}
			</select>
		</div>

		<!-- Child Category -->
		<div class="space-y-1.5">
			<label for="child-category-input" class="block text-xs font-bold text-slate-700">Child-Category</label>
			<input
				id="child-category-input"
				type="text"
				bind:value={childCategory}
				placeholder="Optional (e.g. Wireless, Gaming)"
				class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb]"
			/>
		</div>
	</div>

	<!-- 3. Promotional Badge Card -->
	<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
		<h2 class="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
			<Sparkles class="w-4 h-4 text-amber-500" />
			<span>Promotional Badge</span>
		</h2>

		<div class="flex flex-wrap gap-1.5">
			<button
				type="button"
				onclick={() => (badge = null)}
				class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer {!badge ? 'bg-[#5845eb] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
			>
				None
			</button>

			{#each availableBadges as b}
				<button
					type="button"
					onclick={() => (badge = b)}
					class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer {badge === b ? 'bg-amber-500 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
				>
					{b}
				</button>
			{/each}
		</div>
	</div>

	<!-- 4. Size Chart Card (from Screenshot 1 bottom) -->
	<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
		<div class="flex items-center justify-between border-b border-slate-100 pb-3">
			<h2 class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
				<span>Size Chart</span>
				<span title="পোশাক বা ফুটওয়্যারের ক্ষেত্রে সাইজ চার্ট আপলোড করতে পারেন">
					<HelpCircle class="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
				</span>
			</h2>
			{#if sizeChartImage}
				<button
					type="button"
					onclick={() => (sizeChartImage = '')}
					class="text-xs text-rose-500 hover:underline cursor-pointer"
				>
					Remove
				</button>
			{/if}
		</div>

		{#if sizeChartImage}
			<div class="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
				<img src={sizeChartImage} alt="Size chart" class="w-full h-full object-cover" />
			</div>
		{:else}
			<button
				type="button"
				onclick={() => {
					const url = prompt('Enter Size Chart image URL:', '/images/products/size-chart.png');
					if (url) sizeChartImage = url;
				}}
				class="w-full py-3 rounded-xl border border-dashed border-slate-300 hover:border-[#5845eb] text-slate-500 hover:text-[#5845eb] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
			>
				<span>+ Upload Size Chart</span>
			</button>
		{/if}
	</div>
</div>

