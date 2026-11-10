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
		Link2,
		X,
		Loader2,
		AlertTriangle
	} from 'lucide-svelte';
	import { Button, Badge } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
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

	// Deletion modal state
	let deleteTarget = $state<{ index: number; url: string } | null>(null);
	let deleteFromServer = $state(true);
	let isDeleting = $state(false);

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

	function promptDeleteImage(index: number, url: string) {
		deleteTarget = { index, url };
		deleteFromServer = true;
	}

	function closeDeleteDialog() {
		if (isDeleting) return;
		deleteTarget = null;
	}

	async function confirmDelete() {
		if (!deleteTarget) return;
		const { index, url } = deleteTarget;
		isDeleting = true;

		try {
			if (deleteFromServer && url) {
				const res = await fetch(`/api/admin/media?url=${encodeURIComponent(url)}`, {
					method: 'DELETE'
				});
				const data = await res.json().catch(() => ({}));
				if (!res.ok) {
					console.warn('Delete API returned warning:', data);
				}
			}

			// Remove from images array
			images = images.filter((_, i) => i !== index);

			// If removed image was main, set first remaining image as main
			if (image === url) {
				image = images[0] || '';
			}

			if (deleteFromServer) {
				toast.success('ছবিটি স্থায়ীভাবে মুছে ফেলা হয়েছে');
			} else {
				toast.info('পণ্য থেকে ছবিটি সরানো হয়েছে');
			}
		} catch (err) {
			console.error('Failed to delete media:', err);
			images = images.filter((_, i) => i !== index);
			if (image === url) {
				image = images[0] || '';
			}
			toast.info('পণ্য থেকে ছবিটি সরানো হয়েছে');
		} finally {
			isDeleting = false;
			deleteTarget = null;
		}
	}

	function setPrimaryImage(url: string) {
		image = url;
		toast.success('মূল ছবি (Main Image) হিসেবে সেট করা হয়েছে');
	}
</script>

<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
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
				<!-- Thumbnail Image (Click to enlarge) -->
				<button
					type="button"
					onclick={() => (previewLightboxUrl = img)}
					class="w-full h-full p-2 bg-white flex items-center justify-center cursor-pointer focus:outline-none"
					title="বড় করে দেখতে ক্লিক করুন"
				>
					<img
						src={img}
						alt="Product media asset"
						class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
					/>
				</button>

				<!-- 1. ALWAYS-VISIBLE PROMINENT DELETE BUTTON (Top-Right) -->
				<button
					type="button"
					onclick={(e) => {
						e.stopPropagation();
						promptDeleteImage(idx, img);
					}}
					class="absolute top-2 right-2 z-30 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-90 text-white shadow-lg ring-2 ring-white flex items-center justify-center transition-all cursor-pointer"
					title="ছবিটি মুছুন (Delete Image)"
					aria-label="ছবি মুছুন"
				>
					<Trash2 class="w-4 h-4 stroke-[2.2]" />
				</button>

				<!-- 2. MAIN BADGE / SET MAIN BUTTON (Top-Left) -->
				{#if isMain}
					<div class="absolute top-2 left-2 z-20 px-2 py-1 rounded-lg bg-[#5845eb] text-white text-[10px] font-black tracking-wide shadow-md flex items-center gap-1 ring-2 ring-white">
						<Star class="w-2.5 h-2.5 fill-white" />
						<span>★ MAIN</span>
					</div>
				{:else}
					<button
						type="button"
						onclick={(e) => {
							e.stopPropagation();
							setPrimaryImage(img);
						}}
						class="absolute top-2 left-2 z-20 px-2 py-1 rounded-lg bg-white/95 text-slate-700 hover:text-[#5845eb] hover:bg-white border border-slate-200 shadow-md flex items-center gap-1 text-[10px] font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 ring-1 ring-black/5"
						title="মূল ছবি হিসেবে নির্ধারণ করুন (Set Main)"
						aria-label="মূল ছবি করুন"
					>
						<Star class="w-3 h-3 text-amber-500" />
						<span>Set Main</span>
					</button>
				{/if}

				<!-- 3. HOVER OVERLAY WITH PREVIEW, FILENAME & QUICK DELETE -->
				<div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-transparent p-2 pt-5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between pointer-events-none">
					<span class="text-[10px] text-white/90 truncate font-mono max-w-[65%] px-0.5">
						{img.split('/').pop()?.split('?')[0] || 'photo'}
					</span>
					<div class="flex items-center gap-1.5 pointer-events-auto">
						<button
							type="button"
							onclick={(e) => {
								e.stopPropagation();
								previewLightboxUrl = img;
							}}
							class="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
							title="বড় করে দেখুন"
						>
							<Eye class="w-3.5 h-3.5" />
						</button>
						<button
							type="button"
							onclick={(e) => {
								e.stopPropagation();
								promptDeleteImage(idx, img);
							}}
							class="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors cursor-pointer"
							title="মুছে ফেলুন"
						>
							<Trash2 class="w-3.5 h-3.5" />
						</button>
					</div>
				</div>
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
			<img src={previewLightboxUrl} alt="Enlarged preview" class="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl bg-white/5" />
			<button
				type="button"
				onclick={() => (previewLightboxUrl = null)}
				class="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg hover:bg-slate-100 cursor-pointer"
				aria-label="Close"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	</div>
{/if}

<!-- Confirmation Dialog for Image Deletion -->
{#if deleteTarget}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-['Plus_Jakarta_Sans',sans-serif]"
		onclick={closeDeleteDialog}
		onkeydown={(e) => e.key === 'Escape' && closeDeleteDialog()}
		role="dialog"
		aria-modal="true"
		tabindex="0"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
					<Trash2 class="w-5 h-5 stroke-[2.2]" />
				</div>
				<div>
					<h3 class="text-sm font-bold text-slate-900">ছবিটি মুছে ফেলতে চান?</h3>
					<p class="text-xs text-slate-500 mt-0.5">এই পণ্যটি থেকে ছবিটি তাৎক্ষণিকভাবে অপসারিত হবে।</p>
				</div>
			</div>

			<!-- Image Preview Thumbnail -->
			<div class="w-full h-32 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden p-2">
				<img src={deleteTarget.url} alt="Delete preview" class="max-h-full max-w-full object-contain" />
			</div>

			<!-- Optional checkbox to purge from cloud storage -->
			<label class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
				<input
					type="checkbox"
					bind:checked={deleteFromServer}
					class="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
				/>
				<div class="text-xs">
					<span class="font-bold text-slate-800">সার্ভার ও গ্যালারি থেকেও স্থায়ীভাবে মুছুন</span>
					<p class="text-[11px] text-slate-500 mt-0.5 leading-snug">
						ক্লাউড স্টোরেজ (Cloudflare R2) এবং মিডিয়া ডাটাবেস থেকেও ফাইলটি চিরতরে মুছে যাবে।
					</p>
				</div>
			</label>

			<!-- Action buttons -->
			<div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onclick={closeDeleteDialog}
					disabled={isDeleting}
					class="text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
				>
					বাতিল
				</Button>
				<Button
					type="button"
					variant="destructive"
					size="sm"
					onclick={confirmDelete}
					disabled={isDeleting}
					class="gap-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
				>
					{#if isDeleting}
						<Loader2 class="w-3.5 h-3.5 animate-spin" />
						<span>মুছে ফেলা হচ্ছে...</span>
					{:else}
						<Trash2 class="w-3.5 h-3.5" />
						<span>হ্যাঁ, মুছে ফেলুন</span>
					{/if}
				</Button>
			</div>
		</div>
	</div>
{/if}
