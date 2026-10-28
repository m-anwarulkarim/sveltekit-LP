<script lang="ts">
	import { productsData } from '../products.data';
	import type { Product } from '../types';
	import ProductCard from './ProductCard.svelte';
	import QuickViewModal from './QuickViewModal.svelte';
	import { Button, Badge } from '#lib/components/ui';
	import { Sparkles } from 'lucide-svelte';

	let activeFilter = $state<string>('all');
	let quickViewProduct = $state<Product | null>(null);

	const filteredProducts = $derived(
		activeFilter === 'all'
			? productsData
			: productsData.filter((p) => p.category === activeFilter)
	);
</script>

<section id="products" class="py-24 relative">
	<div class="absolute top-1/2 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
	<div class="absolute bottom-10 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		
		<!-- Section Header -->
		<div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
			<div>
				<Badge variant="outline" class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
					<Sparkles class="w-3.5 h-3.5" />
					Acoustic Hardware & Software
				</Badge>
				<h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading">
					Curated Creator <br class="hidden sm:inline" />
					<span class="bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
						Sound Ecosystem
					</span>
				</h2>
			</div>

			<!-- Category Filter Tabs -->
			<div class="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
				{#each [
					{ id: 'all', label: 'All Gear' },
					{ id: 'headphones', label: 'Headphones' },
					{ id: 'in-ears', label: 'In-Ears' },
					{ id: 'studio', label: 'Studio Hardware' },
					{ id: 'digital', label: 'Digital VST' }
				] as tab}
					<Button
						variant="ghost"
						size="sm"
						onclick={() => activeFilter = tab.id}
						class="h-auto px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer {activeFilter === tab.id ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 hover:bg-violet-600 hover:text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}"
					>
						{tab.label}
					</Button>
				{/each}
			</div>
		</div>

		<!-- Products Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each filteredProducts as product (product.id)}
				<ProductCard
					{product}
					onQuickView={(p) => quickViewProduct = p}
				/>
			{/each}
		</div>

	</div>

	<!-- Quick View Modal -->
	<QuickViewModal
		product={quickViewProduct}
		onClose={() => quickViewProduct = null}
	/>
</section>