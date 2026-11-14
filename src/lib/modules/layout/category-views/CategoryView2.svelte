<script lang="ts">
	import { ArrowRight, FolderTree } from 'lucide-svelte';

	interface Props {
		categories?: any[];
	}

	let { categories = [] }: Props = $props();

	const colorGradients = [
		{ bg: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-200/60', text: 'text-amber-800' },
		{ bg: 'from-blue-500/10 to-indigo-500/10', border: 'border-blue-200/60', text: 'text-blue-800' },
		{ bg: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-200/60', text: 'text-purple-800' },
		{ bg: 'from-rose-500/10 to-red-500/10', border: 'border-rose-200/60', text: 'text-rose-800' },
		{ bg: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-200/60', text: 'text-emerald-800' },
		{ bg: 'from-violet-500/10 to-indigo-500/10', border: 'border-violet-200/60', text: 'text-violet-800' }
	];

	const displayCategories = $derived.by(() => {
		if (!categories || categories.length === 0) return [];
		return categories.slice(0, 8).map((cat, idx) => {
			const color = colorGradients[idx % colorGradients.length];
			return {
				name: cat.name,
				slug: cat.slug || cat.id,
				count: cat.productsCount ? `${cat.productsCount}+ পণ্য` : 'কালেকশন দেখুন',
				icon: cat.icon || '📦',
				image: cat.image,
				...color
			};
		});
	});
</script>

{#if displayCategories.length > 0}
	<!-- Category View 2: Visual Accent Category Cards -->
	<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-['Anek_Bangla',sans-serif]">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">জনপ্রিয় ক্যাটাগরি</h2>
				<p class="text-xs sm:text-sm text-slate-500 mt-0.5">আপনার পছন্দের কালেকশন ব্রাউজ করুন</p>
			</div>
			<a href="/catalog/all-category" class="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
				<span>সবগুলো দেখুন</span>
				<ArrowRight class="w-4 h-4" />
			</a>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
			{#each displayCategories as cat}
				<a
					href="/categories/{cat.slug}"
					class="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br {cat.bg} border {cat.border} hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[120px] sm:min-h-[140px]"
				>
					<div class="w-10 h-10 rounded-xl bg-white/90 shadow-2xs flex items-center justify-center {cat.text} group-hover:scale-110 transition-transform text-xl">
						{#if cat.image}
							<img src={cat.image} alt={cat.name} class="w-6 h-6 object-contain" />
						{:else if cat.icon && cat.icon.length <= 4}
							<span>{cat.icon}</span>
						{:else}
							<FolderTree class="w-5 h-5" />
						{/if}
					</div>
					<div>
						<h3 class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
							{cat.name}
						</h3>
						<span class="text-[11px] text-slate-500 font-medium">{cat.count}</span>
					</div>
				</a>
			{/each}
		</div>
	</section>
{/if}
