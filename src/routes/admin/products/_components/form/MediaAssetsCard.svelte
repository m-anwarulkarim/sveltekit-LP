<script lang="ts">
	import {
		UploadCloud,
		Image as ImageIcon,
		Trash2,
		Star,
		Plus,
		CheckCircle2,
		Eye,
		Sparkles,
		Link2
	} from 'lucide-svelte';
	import { Button, Badge } from '#lib/components/ui';
	import ImageUploadModal from './ImageUploadModal.svelte';

	interface Props {
		image: string;
		images: string[];
		existingGallery?: any[];
	}

	let {
		image = $bindable(''),
		images = $bindable([]),
		existingGallery = []
	}: Props = $props();

	let isPickerModalOpen = $state(false);
	let previewLightboxUrl = $state<string | null>(null);

	function handleAddImages(newUrls: string[]) {
		if (newUrls.length === 0) return;

		// If no primary image set yet, set the first new one as primary
		if (!image && newUrls[0]) {
			image = newUrls[0];
		}

		// Avoid duplicates
		const uniqueNew = newUrls.filter((url) => !images.includes(url));
		images = [...images, ...uniqueNew];

		// If images was empty, ensure primary image is also set
		if (!image && images.length > 0) {
			image = images[0];
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

<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-4">
	<!-- Card Header -->
	<div class="flex items-center justify-between border-b border-slate-100 pb-3">
		<div class="flex items-center gap-2">
			<ImageIcon class="w-5 h-5 text-[#5845eb]" />
			<h2 class="text-base font-bold text-slate-800">মিডিয়া ও ছবি (Media Assets)</h2>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="blue" class="text-xs font-bold px-2.5 py-0.5 rounded-full">
				{images.length}টি ছবি
			</Badge>
			<Button
				type="button"
				variant="blue"
				size="sm"
				onclick={() => (isPickerModalOpen = true)}
				class="text-xs font-bold gap-1.5 rounded-xl cursor-pointer shadow-xs"
			>
				<Plus class="w-3.5 h-3.5 stroke-[2.5]" />
				<span>ছবি যোগ করুন</span>
			</Button>
		</div>
	</div>

	<!-- Photos Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
		{#each images as img, idx}
			{@const isMain = img === image}
			<div
				class="relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-slate-50 flex items-center justify-center shadow-xs {isMain ? 'border-[#5845eb] ring-2 ring-[#5845eb]/20' : 'border-slate-200 hover:border-slate-300'}"
			>
				<img
					src={img}
					alt="Product media asset"
					class="w-full h-full object-contain p-2 bg-white transition-transform duration-300 group-hover:scale-105"
				/>

				<!-- Gradient Overlay on hover -->
				<div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
					
					<!-- Top Actions: Preview & Delete -->
					<div class="flex items-center justify-between">
						{#if isMain}
							<span class="px-2 py-0.5 rounded-md bg-[#5845eb] text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
								<Star class="w-2.5 h-2.5 fill-white" />
								Main
							</span>
						{:else}
							<button
								type="button"
								onclick={() => setPrimaryImage(img)}
								class="px-2 py-1 rounded-md bg-white/90 hover:bg-white text-slate-900 text-[10px] font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1"
							>
								<Star class="w-2.5 h-2.5 text-amber-500" />
								Set Main
							</button>
						{/if}

						<div class="flex items-center gap-1">
							<button
								type="button"
								onclick={() => (previewLightboxUrl = img)}
								class="p-1.5 rounded-lg bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
								title="বড় করে দেখুন"
							>
								<Eye class="w-3.5 h-3.5" />
							</button>
							<button
								type="button"
								onclick={() => removeImage(idx)}
								class="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors cursor-pointer"
								title="ছবি মুছুন"
							>
								<Trash2 class="w-3.5 h-3.5" />
							</button>
						</div>
					</div>

					<!-- Bottom Note -->
					<div class="text-[10px] text-slate-200 truncate font-mono">
						{img.split('/').pop() || 'photo'}
					</div>
				</div>

				<!-- Always visible Main badge on card corner -->
				{#if isMain}
					<div class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#5845eb] text-white text-[10px] font-bold shadow-sm flex items-center gap-1 group-hover:hidden">
						<Star class="w-2.5 h-2.5 fill-white" />
						Main
					</div>
				{/if}
			</div>
		{/each}

		<!-- Add Image Trigger Button Card -->
		<button
			type="button"
			onclick={() => (isPickerModalOpen = true)}
			class="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#5845eb] hover:bg-indigo-50/40 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-[#5845eb] transition-all cursor-pointer group p-3 text-center"
		>
			<div class="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-indigo-100/70 text-slate-600 group-hover:text-[#5845eb] flex items-center justify-center transition-colors shadow-2xs">
				<UploadCloud class="w-5 h-5 stroke-[2.2]" />
			</div>
			<div>
				<div class="text-xs font-bold">ছবি আপলোড / নির্বাচন</div>
				<div class="text-[10px] text-slate-400 group-hover:text-indigo-500 mt-0.5">ফাইল, লিংক বা গ্যালারি</div>
			</div>
		</button>
	</div>

	<!-- Size Dimension Recommendation Note -->
	<div class="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/90 text-xs text-emerald-900 flex items-center gap-2">
		<Sparkles class="w-4 h-4 text-emerald-600 shrink-0" />
		<p class="text-[11px] font-medium leading-relaxed">
			<strong>সুপারিশ:</strong> প্রথম মূল ছবিটি ডেস্কটপের জন্য (800×800 বা 700×700) এবং দ্বিতীয় ছবিটি মোবাইলের জন্য অপ্টিমাইজড রাখুন।
		</p>
	</div>
</div>

<!-- Modal for Image Selection & Upload -->
<ImageUploadModal
	bind:isOpen={isPickerModalOpen}
	onClose={() => (isPickerModalOpen = false)}
	onSelectImages={handleAddImages}
	{existingGallery}
/>

<!-- Lightbox Modal for previewing single image full size -->
{#if previewLightboxUrl}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
		onclick={() => (previewLightboxUrl = null)}
		onkeydown={(e) => e.key === 'Escape' && (previewLightboxUrl = null)}
		role="dialog"
		tabindex="0"
	>
		<div class="relative max-w-3xl max-h-[90vh]">
			<img src={previewLightboxUrl} alt="Enlarged preview" class="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
			<button
				type="button"
				onclick={() => (previewLightboxUrl = null)}
				class="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg hover:bg-slate-100 cursor-pointer"
				aria-label="Close"
			>
				<Trash2 class="w-4 h-4 rotate-45" />
			</button>
		</div>
	</div>
{/if}
