<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Input, Dialog, Badge } from '#lib/components/ui';
	import {
		Search,
		Folder,
		UploadCloud,
		Copy,
		Check,
		Trash2,
		Eye,
		X,
		ImageIcon,
		ExternalLink,
		Layers,
		CheckCircle2,
		Sparkles
	} from 'lucide-svelte';
	import type { GalleryImage } from '../_data/gallery.ts';

	let { data }: { data: any } = $props();

	// Search & Filter State
	let searchQuery = $state('');
	let selectedFolder = $state('all');

	// Copy notification state
	let copiedImageId = $state<string | null>(null);

	// Modals
	let isUploadModalOpen = $state(false);
	let activePreviewImage = $state<GalleryImage | null>(null);

	// Upload Form State
	let uploadName = $state('');
	let uploadFolder = $state<GalleryImage['folder']>('products');
	let uploadDataUrl = $state('');
	let uploadFileSize = $state('45 KB');
	let uploadDimensions = $state('800 x 800');
	let isDragging = $state(false);

	let galleryImages = $derived<GalleryImage[]>(data.galleryImages || []);

	// Folder options
	const FOLDERS = [
		{ id: 'all', label: 'All Folders' },
		{ id: 'products', label: 'Products' },
		{ id: 'categories', label: 'Categories' },
		{ id: 'banners', label: 'Banners & Carousels' },
		{ id: 'stickers', label: '3D Wall Stickers' },
		{ id: 'general', label: 'General & Others' }
	];

	// Filtered Images
	let filteredImages = $derived(
		galleryImages.filter((img) => {
			const matchesFolder = selectedFolder === 'all' ? true : img.folder === selectedFolder;
			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				q === ''
					? true
					: img.name.toLowerCase().includes(q) || img.folder.toLowerCase().includes(q);
			return matchesFolder && matchesSearch;
		})
	);

	// Copy image path with instant visual feedback
	async function copyImagePath(img: GalleryImage, e?: Event) {
		if (e) e.stopPropagation();
		try {
			await navigator.clipboard.writeText(img.url);
			copiedImageId = img.id;
			setTimeout(() => {
				copiedImageId = null;
			}, 2000);
		} catch {
			// fallback
		}
	}

	// Client-side file drop / pick handler for instant preview
	function handleFileSelected(file: File) {
		uploadName = file.name.replace(/\.[^/.]+$/, '');
		uploadFileSize = `${(file.size / 1024).toFixed(0)} KB`;

		const reader = new FileReader();
		reader.onload = (e) => {
			uploadDataUrl = e.target?.result as string;

			// detect dimensions
			const img = new Image();
			img.onload = () => {
				uploadDimensions = `${img.width} x ${img.height}`;
			};
			img.src = uploadDataUrl;
		};
		reader.readAsDataURL(file);
	}

	function onDropFile(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
			handleFileSelected(e.dataTransfer.files[0]);
		}
	}

	function onFileInputChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			handleFileSelected(target.files[0]);
		}
	}

	function resetUploadForm() {
		uploadName = '';
		uploadDataUrl = '';
		uploadFolder = 'products';
		uploadFileSize = '45 KB';
		uploadDimensions = '800 x 800';
	}
</script>

<svelte:head>
	<title>My Gallery | সেন্ট্রালাইজড মিডিয়া লাইব্রেরি</title>
</svelte:head>

<div class="space-y-6 pb-28">

	<!-- Header Area -->
	<div class="flex items-center justify-between pb-1">
		<div>
			<h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
				<span>My Gallery</span>
				<span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#5845eb] border border-indigo-200">
					{galleryImages.length} টি ছবি
				</span>
			</h1>
			<p class="text-xs text-slate-500 mt-1">
				পণ্য, ক্যাটাগরি ও ব্যানারের জন্য ছবি আপলোড ও যেকোনো সময় রিইউজ করুন
			</p>
		</div>

		<Button
			type="button"
			onclick={() => {
				resetUploadForm();
				isUploadModalOpen = true;
			}}
			class="hidden sm:flex items-center gap-2 bg-[#5845eb] text-white hover:bg-[#4836d4] shadow-md shadow-indigo-600/20 rounded-xl px-4 py-2 font-bold text-xs"
		>
			<UploadCloud class="w-4 h-4" />
			<span>নতুন ছবি আপলোড</span>
		</Button>
	</div>

	<!-- Top Search & Folder Filter Bar (Exact Match to Reference Screenshot) -->
	<div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
		<!-- Search Input with rounded styling -->
		<div class="relative w-full sm:flex-1 max-w-xl">
			<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search images, folders..."
				class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 border border-transparent focus:border-[#5845eb] focus:outline-none transition-all"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => (searchQuery = '')}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
					aria-label="Clear search"
				>
					<X class="w-3.5 h-3.5" />
				</button>
			{/if}
		</div>

		<!-- Folder Filter Dropdown (Matches Screenshot "All Folders" styling) -->
		<div class="w-full sm:w-auto flex items-center gap-2">
			<div class="relative w-full sm:w-56">
				<div class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5845eb] pointer-events-none">
					<Folder class="w-4 h-4 fill-indigo-100" />
				</div>
				<select
					bind:value={selectedFolder}
					class="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5845eb]/20 cursor-pointer appearance-none transition-all"
				>
					{#each FOLDERS as folder}
						<option value={folder.id}>{folder.label}</option>
					{/each}
				</select>
				<div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
					<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
					</svg>
				</div>
			</div>
		</div>
	</div>

	<!-- Images Grid (6 columns on desktop matching screenshot) -->
	{#if filteredImages.length === 0}
		<Card class="p-16 border-slate-200/80 text-center bg-white shadow-2xs">
			<div class="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center mb-3">
				<ImageIcon class="w-7 h-7" />
			</div>
			<h3 class="font-bold text-slate-800 text-base">কোনো ছবি পাওয়া যায়নি</h3>
			<p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
				বর্তমান সার্চ বা ফোল্ডারে কোনো ছবি নেই। নিচে থাকা 'Upload New' বাটনে ক্লিক করে নতুন ছবি আপলোড করতে পারেন।
			</p>
			<Button
				type="button"
				onclick={() => {
					resetUploadForm();
					isUploadModalOpen = true;
				}}
				class="mt-4 gap-1.5 text-xs font-bold bg-[#5845eb] text-white"
			>
				<UploadCloud class="w-3.5 h-3.5" />
				<span>এখনই আপলোড করুন</span>
			</Button>
		</Card>
	{:else}
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
			{#each filteredImages as img (img.id)}
				<div
					class="group relative aspect-square bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-indigo-300 transition-all duration-200 overflow-hidden flex items-center justify-center p-2.5 cursor-pointer"
					onclick={() => (activePreviewImage = img)}
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter') activePreviewImage = img;
					}}
				>
					<!-- Inner Image with smooth zoom -->
					<img
						src={img.url}
						alt={img.name}
						loading="lazy"
						class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
					/>

					<!-- Top Folder Pill (Visible always or subtle) -->
					<div class="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
						<span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs shadow-2xs">
							{img.folder}
						</span>
					</div>

					<!-- Hover Overlay with Actions (Preview, Copy URL, Delete) -->
					<div class="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-between p-2.5">
						
						<!-- Top Right: Delete Action -->
						<div class="flex justify-end">
							<form
								method="POST"
								action="?/deleteImage"
								use:enhance
								onclick={(e) => e.stopPropagation()}
							>
								<input type="hidden" name="id" value={img.id} />
								<button
									type="submit"
									class="p-1.5 rounded-lg bg-rose-500/90 text-white hover:bg-rose-600 transition-colors shadow-sm"
									title="ছবি ডিলিট করুন"
									onclick={(e) => {
										if (!confirm('আপনি কি নিশ্চিত এই ছবিটি গ্যালারি থেকে মুছে ফেলতে চান?')) {
											e.preventDefault();
										}
									}}
								>
									<Trash2 class="w-3.5 h-3.5" />
								</button>
							</form>
						</div>

						<!-- Center: Quick Title Preview -->
						<div class="text-center px-1">
							<p class="text-white font-bold text-xs line-clamp-2 leading-tight drop-shadow-sm">
								{img.name}
							</p>
						</div>

						<!-- Bottom Action Bar: Copy URL & View -->
						<div class="flex items-center justify-between gap-1.5 pt-1">
							<button
								type="button"
								onclick={(e) => copyImagePath(img, e)}
								class="flex-1 py-1.5 px-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm transition-transform active:scale-95"
								title="পাথ কপি করে যেকোনো জায়গায় ব্যবহার করুন"
							>
								{#if copiedImageId === img.id}
									<Check class="w-3.5 h-3.5 text-emerald-600" />
									<span class="text-emerald-700 font-bold">কপি হয়েছে!</span>
								{:else}
									<Copy class="w-3 h-3 text-slate-600" />
									<span>কপি লিংক</span>
								{/if}
							</button>

							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									activePreviewImage = img;
								}}
								class="p-1.5 rounded-xl bg-white/90 text-slate-700 hover:bg-white hover:text-[#5845eb] transition-colors shadow-sm"
								title="বড় করে প্রিভিউ দেখুন"
							>
								<Eye class="w-3.5 h-3.5" />
							</button>
						</div>

					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Floating "Upload New" Button (Exact Match to User Screenshot!) -->
	<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
		<button
			type="button"
			onclick={() => {
				resetUploadForm();
				isUploadModalOpen = true;
			}}
			class="px-7 py-3.5 rounded-full bg-[#5845eb] hover:bg-[#4836d4] text-white font-bold text-sm shadow-[0_12px_28px_-4px_rgba(88,69,235,0.48)] flex items-center gap-2.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-white/60"
		>
			<UploadCloud class="w-5 h-5 stroke-[2.2]" />
			<span>Upload New</span>
		</button>
	</div>

</div>

<!-- 1. Upload New Image Modal -->
{#if isUploadModalOpen}
	<Dialog bind:open={isUploadModalOpen}>
		<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
			<div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
				
				<!-- Modal Header -->
				<div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
					<div class="flex items-center gap-2.5">
						<div class="w-8 h-8 rounded-xl bg-[#5845eb] text-white flex items-center justify-center">
							<UploadCloud class="w-4 h-4" />
						</div>
						<div>
							<h3 class="text-base font-black text-slate-900">গ্যালারিতে নতুন ছবি আপলোড</h3>
							<p class="text-xs text-slate-500">প্রোডাক্ট, ক্যাটাগরি বা ব্যানারের জন্য ছবি যুক্ত করুন</p>
						</div>
					</div>
					<button
						type="button"
						onclick={() => (isUploadModalOpen = false)}
						class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
					>
						<X class="w-4 h-4" />
					</button>
				</div>

				<!-- Modal Form -->
				<form
					method="POST"
					action="?/uploadImage"
					use:enhance={() => {
						isUploadModalOpen = false;
					}}
					class="p-6 space-y-4"
				>
					<input type="hidden" name="url" value={uploadDataUrl} />
					<input type="hidden" name="size" value={uploadFileSize} />
					<input type="hidden" name="dimensions" value={uploadDimensions} />

					<!-- Drag & Drop Area -->
					<div
						class="border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer {isDragging
							? 'border-[#5845eb] bg-indigo-50/50 scale-[0.99]'
							: uploadDataUrl
								? 'border-emerald-300 bg-emerald-50/20'
								: 'border-slate-200 hover:border-indigo-300 bg-slate-50/50'}"
						ondragover={(e) => {
							e.preventDefault();
							isDragging = true;
						}}
						ondragleave={() => (isDragging = false)}
						ondrop={onDropFile}
						role="region"
						aria-label="File upload dropzone"
					>
						{#if uploadDataUrl}
							<div class="space-y-3">
								<div class="w-32 h-32 mx-auto rounded-xl bg-white border border-slate-200/80 p-2 shadow-2xs flex items-center justify-center overflow-hidden">
									<img
										src={uploadDataUrl}
										alt="Preview"
										class="w-full h-full object-contain"
									/>
								</div>
								<div class="text-xs text-slate-600">
									<span class="font-bold">{uploadFileSize}</span> • <span>{uploadDimensions}</span>
								</div>
								<label class="inline-block text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
									অন্য ছবি বেছে নিন
									<input
										type="file"
										accept="image/*"
										class="hidden"
										onchange={onFileInputChange}
									/>
								</label>
							</div>
						{:else}
							<div class="space-y-2">
								<div class="w-12 h-12 mx-auto rounded-2xl bg-indigo-100/80 text-[#5845eb] flex items-center justify-center">
									<UploadCloud class="w-6 h-6" />
								</div>
								<div>
									<label class="cursor-pointer font-bold text-sm text-[#5845eb] hover:underline">
										ছবি সিলেক্ট করুন
										<input
											type="file"
											accept="image/*"
											class="hidden"
											onchange={onFileInputChange}
											required
										/>
									</label>
									<span class="text-slate-500 text-xs"> অথবা ড্র্যাগ করে ছেড়ে দিন</span>
								</div>
								<p class="text-[11px] text-slate-400">PNG, JPG, SVG, WebP (সর্বোচ্চ 5MB)</p>
							</div>
						{/if}
					</div>

					<!-- Image Name Input -->
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">ছবির নাম / টাইটেল *</label>
						<Input
							type="text"
							name="name"
							bind:value={uploadName}
							placeholder="যেমন: AURA Spatial Earbuds Front View"
							required
							class="text-xs"
						/>
					</div>

					<!-- Folder Selection -->
					<div>
						<label class="block text-xs font-bold text-slate-700 mb-1">ফোল্ডার / ক্যাটাগরি *</label>
						<select
							name="folder"
							bind:value={uploadFolder}
							class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5845eb]"
						>
							<option value="products">Products (পণ্য)</option>
							<option value="categories">Categories (ক্যাটাগরি)</option>
							<option value="banners">Banners & Carousels (ব্যানার)</option>
							<option value="stickers">3D Wall Stickers (ওয়াল স্টিকার)</option>
							<option value="general">General & Others (সাধারণ)</option>
						</select>
					</div>

					<!-- Footer Actions -->
					<div class="pt-3 border-t border-slate-100 flex items-center justify-between">
						<Button
							type="button"
							variant="outline"
							onclick={() => (isUploadModalOpen = false)}
							class="text-xs"
						>
							বাতিল
						</Button>

						<Button
							type="submit"
							disabled={!uploadDataUrl}
							class="gap-1.5 text-xs font-bold bg-[#5845eb] text-white hover:bg-[#4836d4] disabled:opacity-50"
						>
							<Sparkles class="w-4 h-4" />
							<span>গ্যালারিতে যুক্ত করুন</span>
						</Button>
					</div>
				</form>

			</div>
		</div>
	</Dialog>
{/if}

<!-- 2. Image Full Preview & Details Modal -->
{#if activePreviewImage}
	<Dialog open={true}>
		<div class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
			<div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
				
				<!-- Header -->
				<div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
					<div class="flex items-center gap-2">
						<h3 class="text-base font-black text-slate-900 line-clamp-1">{activePreviewImage.name}</h3>
						<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
							{activePreviewImage.folder}
						</span>
					</div>
					<button
						type="button"
						onclick={() => (activePreviewImage = null)}
						class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
					>
						<X class="w-4 h-4" />
					</button>
				</div>

				<!-- Preview Container -->
				<div class="p-6 bg-slate-100/60 flex items-center justify-center max-h-[50vh]">
					<img
						src={activePreviewImage.url}
						alt={activePreviewImage.name}
						class="max-w-full max-h-[45vh] object-contain rounded-xl shadow-sm"
					/>
				</div>

				<!-- Details & Reuse Action Bar -->
				<div class="p-6 bg-white space-y-4">
					<div class="grid grid-cols-3 gap-3 text-center">
						<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
							<span class="text-[10px] text-slate-400 block font-bold uppercase">ডাইমেনশন</span>
							<span class="text-xs font-bold text-slate-800">{activePreviewImage.dimensions}</span>
						</div>
						<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
							<span class="text-[10px] text-slate-400 block font-bold uppercase">ফাইল সাইজ</span>
							<span class="text-xs font-bold text-slate-800">{activePreviewImage.size}</span>
						</div>
						<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
							<span class="text-[10px] text-slate-400 block font-bold uppercase">আপলোড সময়</span>
							<span class="text-xs font-bold text-slate-800">{activePreviewImage.uploadedAt}</span>
						</div>
					</div>

					<!-- URL Box with 1-click Copy -->
					<div>
						<label class="block text-[11px] font-bold text-slate-500 mb-1">ইমেজ রিইউজ পাথ (Image URL):</label>
						<div class="flex items-center gap-2">
							<input
								type="text"
								readonly
								value={activePreviewImage.url}
								class="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-700 select-all"
							/>
							<Button
								type="button"
								onclick={() => copyImagePath(activePreviewImage!)}
								class="gap-1.5 text-xs font-bold bg-[#5845eb] text-white hover:bg-[#4836d4]"
							>
								{#if copiedImageId === activePreviewImage.id}
									<Check class="w-3.5 h-3.5" />
									<span>কপি হয়েছে!</span>
								{:else}
									<Copy class="w-3.5 h-3.5" />
									<span>পাথ কপি করুন</span>
								{/if}
							</Button>
						</div>
					</div>

					<!-- Footer info -->
					<div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
						<a
							href={activePreviewImage.url}
							target="_blank"
							rel="noreferrer"
							class="text-[#5845eb] hover:underline flex items-center gap-1 font-bold"
						>
							<ExternalLink class="w-3.5 h-3.5" />
							<span>আসল ফাইল ওপেন করুন</span>
						</a>

						<Button
							type="button"
							variant="outline"
							onclick={() => (activePreviewImage = null)}
							class="text-xs"
						>
							বন্ধ করুন
						</Button>
					</div>
				</div>

			</div>
		</div>
	</Dialog>
{/if}

