<script lang="ts">
	import { UploadCloud, Image as ImageIcon, Trash2, Star, Info, Plus } from 'lucide-svelte';

	interface Props {
		image: string;
		images: string[];
	}

	let {
		image = $bindable(''),
		images = $bindable([])
	}: Props = $props();

	// Fallback samples if images empty
	let samplePresets = [
		'/images/products/speaker-front.webp',
		'/images/products/speaker-angle.webp',
		'/images/products/speaker-top.webp',
		'/images/products/speaker-lifestyle.webp'
	];

	function handleAddCustomImage() {
		const url = prompt('Enter image URL (or sample image path):', samplePresets[images.length % samplePresets.length]);
		if (url) {
			if (!image) {
				image = url;
			}
			images = [...images, url];
		}
	}

	function removeImage(index: number) {
		const removed = images[index];
		images = images.filter((_, i) => i !== index);
		if (image === removed) {
			image = images[0] || '';
		}
	}

	function setPrimaryImage(url: string) {
		image = url;
	}
</script>

<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
	<div class="flex items-center justify-between border-b border-slate-100 pb-3">
		<h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
			<ImageIcon class="w-4 h-4 text-[#5845eb]" />
			<span>Media Assets</span>
		</h2>
		<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#5845eb]">
			{images.length} Photos
		</span>
	</div>

	<!-- Gallery Grid matching screenshots -->
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2.5">
		{#each images as img, idx}
			<div class="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shadow-2xs">
				<img src={img} alt="Product media" class="w-full h-full object-cover transition-transform group-hover:scale-105" />

				<!-- Primary Badge -->
				{#if img === image}
					<span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#5845eb] text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
						Main
					</span>
				{:else}
					<button
						type="button"
						onclick={() => setPrimaryImage(img)}
						class="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold hover:bg-black transition-all cursor-pointer"
					>
						Set Main
					</button>
				{/if}

				<!-- Delete button -->
				<button
					type="button"
					onclick={() => removeImage(idx)}
					class="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-500/90 text-white opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition-all cursor-pointer shadow-sm"
					title="Delete image"
				>
					<Trash2 class="w-3.5 h-3.5" />
				</button>
			</div>
		{/each}

		<!-- Add Image Dropzone Card (matching screenshot with dashed border) -->
		<button
			type="button"
			onclick={handleAddCustomImage}
			class="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-[#5845eb] hover:bg-indigo-50/30 flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-[#5845eb] transition-all cursor-pointer group"
		>
			<div class="p-2 rounded-xl bg-slate-100 group-hover:bg-indigo-100 transition-colors">
				<UploadCloud class="w-5 h-5 text-slate-600 group-hover:text-[#5845eb]" />
			</div>
			<span class="text-xs font-bold">Add Image</span>
		</button>
	</div>

	<!-- Size Dimension Helper Box matching Screenshot 1 -->
	<div class="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center">
		<p class="text-[11px] font-medium text-emerald-800 leading-snug">
			The 1st image for desktop (700px * 700px) and the 2nd image for mobile image (1200px * any)
		</p>
	</div>
</div>
