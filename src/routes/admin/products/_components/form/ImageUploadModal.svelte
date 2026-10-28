<script lang="ts">
	import { Button, Input, Badge } from '#lib/components/ui';
	import {
		UploadCloud,
		Link2,
		Image as ImageIcon,
		Check,
		Search,
		X,
		FileImage,
		Sparkles,
		AlertCircle
	} from 'lucide-svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onSelectImages: (urls: string[]) => void;
		existingGallery?: any[];
	}

	let {
		isOpen = $bindable(false),
		onClose,
		onSelectImages,
		existingGallery = []
	}: Props = $props();

	type ActiveTab = 'upload' | 'link' | 'gallery';
	let activeTab = $state<ActiveTab>('upload');

	// Tab 1: Upload state
	let uploadedFiles = $state<{ name: string; size: string; preview: string; file: File }[]>([]);
	let isDragging = $state(false);
	let saveToGallery = $state(true);
	let isUploading = $state(false);

	// Tab 2: Link state
	let linkInput = $state('');
	let linkPreviewError = $state(false);
	let isLinkValid = $derived(linkInput.trim().length > 5 && !linkPreviewError);

	// Tab 3: Gallery state
	let gallerySearch = $state('');
	let galleryItems = $state<any[]>([]);
	let selectedGalleryUrls = $state<string[]>([]);
	let isLoadingGallery = $state(false);

	// Default fallback presets if gallery in DB is sparse
	const samplePresets = [
		'/images/products/soundcore.svg',
		'/images/products/trimmer.svg',
		'/images/products/kirkland.svg',
		'/images/products/ordinary.svg',
		'/images/products/cosrx.svg',
		'/images/products/bioderma.svg',
		'/images/products/neutrogena.svg',
		'/images/products/anua-toner.svg',
		'/images/products/boj-sunscreen.svg',
		'/images/products/cerave.svg',
		'/images/products/simple-wash.svg'
	];

	// Load gallery images when modal opens
	$effect(() => {
		if (isOpen) {
			if (existingGallery && existingGallery.length > 0) {
				galleryItems = [...existingGallery];
			} else {
				loadGalleryFromApi();
			}
		}
	});

	async function loadGalleryFromApi() {
		isLoadingGallery = true;
		try {
			const res = await fetch('/api/admin/media?limit=60');
			const data = await res.json();
			if (data.success && Array.isArray(data.items)) {
				galleryItems = data.items;
			}
		} catch (e) {
			console.error('Failed to load gallery items:', e);
		} finally {
			isLoadingGallery = false;
		}
	}

	// Filtered gallery items
	const displayGallery = $derived.by(() => {
		const combined = [...galleryItems];
		// ensure sample presets are accessible if db is low on photos
		samplePresets.forEach((preset) => {
			if (!combined.some((item) => (item.url || item) === preset)) {
				combined.push({
					id: `preset-${preset}`,
					name: preset.split('/').pop()?.replace('.svg', '').replace('-', ' ') || 'Preset Photo',
					url: preset,
					dimensions: '800 x 800',
					size: '45 KB'
				});
			}
		});

		if (!gallerySearch.trim()) return combined;
		const q = gallerySearch.toLowerCase().trim();
		return combined.filter(
			(img) => (img.name && img.name.toLowerCase().includes(q)) || (img.url && img.url.toLowerCase().includes(q))
		);
	});

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			processFiles(Array.from(target.files));
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files) {
			processFiles(Array.from(e.dataTransfer.files));
		}
	}

	function processFiles(files: File[]) {
		files.forEach((file) => {
			if (!file.type.startsWith('image/')) return;
			const reader = new FileReader();
			reader.onload = (event) => {
				const preview = event.target?.result as string;
				const formattedSize = file.size > 1024 * 1024
					? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
					: `${Math.round(file.size / 1024)} KB`;

				uploadedFiles = [
					...uploadedFiles,
					{
						name: file.name,
						size: formattedSize,
						preview,
						file
					}
				];
			};
			reader.readAsDataURL(file);
		});
	}

	function removeUploadedFile(index: number) {
		uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
	}

	function toggleGallerySelect(url: string) {
		if (selectedGalleryUrls.includes(url)) {
			selectedGalleryUrls = selectedGalleryUrls.filter((u) => u !== url);
		} else {
			selectedGalleryUrls = [...selectedGalleryUrls, url];
		}
	}

	async function handleConfirm() {
		if (activeTab === 'upload') {
			if (uploadedFiles.length === 0) return;
			isUploading = true;
			const finalUrls: string[] = [];

			for (const item of uploadedFiles) {
				finalUrls.push(item.preview);

				// If save to gallery is checked, persist to D1 MediaAssets
				if (saveToGallery) {
					try {
						await fetch('/api/admin/media', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								name: item.name,
								url: item.preview,
								folder: 'products',
								size: item.size
							})
						});
					} catch (err) {
						console.error('Failed to auto-save to gallery:', err);
					}
				}
			}

			isUploading = false;
			onSelectImages(finalUrls);
			resetAndClose();
		} else if (activeTab === 'link') {
			if (!linkInput.trim()) return;
			const url = linkInput.trim();
			onSelectImages([url]);

			// Optionally save web link to gallery too
			try {
				fetch('/api/admin/media', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name: url.split('/').pop()?.split('?')[0] || 'Web Link Photo',
						url,
						folder: 'products',
						size: 'Web URL'
					})
				});
			} catch {}

			resetAndClose();
		} else if (activeTab === 'gallery') {
			if (selectedGalleryUrls.length === 0) return;
			onSelectImages(selectedGalleryUrls);
			resetAndClose();
		}
	}

	function resetAndClose() {
		uploadedFiles = [];
		linkInput = '';
		linkPreviewError = false;
		selectedGalleryUrls = [];
		gallerySearch = '';
		onClose();
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]"
		role="dialog"
		aria-modal="true"
	>
		<div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
			
			<!-- Header -->
			<div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
				<div>
					<h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
						<ImageIcon class="w-5 h-5 text-[#5845eb]" />
						<span>প্রোডাক্ট ইমেজ সিলেক্টর (Media Selector)</span>
					</h3>
					<p class="text-xs text-slate-500 mt-0.5">
						কম্পিউটার থেকে আপলোড করুন, সরাসরি ওয়েব লিংক দিন বা গ্যালারি থেকে বেছে নিন।
					</p>
				</div>
				<button
					type="button"
					onclick={resetAndClose}
					class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
					aria-label="Close modal"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Tabs Navigation -->
			<div class="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 bg-white">
				<button
					type="button"
					onclick={() => (activeTab = 'upload')}
					class="pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer {activeTab === 'upload' ? 'border-[#5845eb] text-[#5845eb]' : 'border-transparent text-slate-500 hover:text-slate-800'}"
				>
					<UploadCloud class="w-4 h-4" />
					<span>ফাইল আপলোড (Upload)</span>
					{#if uploadedFiles.length > 0}
						<Badge variant="blue" class="text-[10px] py-0 px-1.5 font-bold">
							{uploadedFiles.length}
						</Badge>
					{/if}
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'link')}
					class="pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer {activeTab === 'link' ? 'border-[#5845eb] text-[#5845eb]' : 'border-transparent text-slate-500 hover:text-slate-800'}"
				>
					<Link2 class="w-4 h-4" />
					<span>ইমেজ লিংক (URL Link)</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'gallery')}
					class="pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer {activeTab === 'gallery' ? 'border-[#5845eb] text-[#5845eb]' : 'border-transparent text-slate-500 hover:text-slate-800'}"
				>
					<ImageIcon class="w-4 h-4" />
					<span>মিডিয়া গ্যালারি (Gallery)</span>
					{#if selectedGalleryUrls.length > 0}
						<Badge variant="purple" class="text-[10px] py-0 px-1.5 font-bold">
							{selectedGalleryUrls.length}
						</Badge>
					{/if}
				</button>
			</div>

			<!-- Tab Body Content -->
			<div class="p-6 overflow-y-auto flex-1 space-y-4">
				
				<!-- 1. TAB: FILE UPLOAD -->
				{#if activeTab === 'upload'}
					<div class="space-y-4">
						<!-- Dropzone -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							ondragover={(e) => { e.preventDefault(); isDragging = true; }}
							ondragleave={() => (isDragging = false)}
							ondrop={handleDrop}
							class="border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer {isDragging ? 'border-[#5845eb] bg-indigo-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'}"
						>
							<label for="image-file-input" class="cursor-pointer block">
								<div class="w-12 h-12 rounded-2xl bg-indigo-100/70 text-[#5845eb] flex items-center justify-center mx-auto mb-3">
									<UploadCloud class="w-6 h-6 stroke-[2.2]" />
								</div>
								<div class="text-sm font-bold text-slate-800">
									ছবি সিলেক্ট করতে ক্লিক করুন অথবা এখানে টেনে এনে ছাড়ুন
								</div>
								<p class="text-xs text-slate-400 mt-1">
									PNG, JPG, WEBP, SVG সর্বোচ্চ 5MB প্রতি ছবি
								</p>
								<input
									id="image-file-input"
									type="file"
									accept="image/*"
									multiple
									onchange={handleFileSelect}
									class="hidden"
								/>
							</label>
						</div>

						<!-- Selected Files Preview Grid -->
						{#if uploadedFiles.length > 0}
							<div class="space-y-2">
								<div class="flex items-center justify-between text-xs font-bold text-slate-700">
									<span>আপলোড প্রস্তুত ছবি ({uploadedFiles.length}টি):</span>
									<button
										type="button"
										onclick={() => (uploadedFiles = [])}
										class="text-rose-500 hover:text-rose-700 cursor-pointer"
									>
										সব মুছুন
									</button>
								</div>

								<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
									{#each uploadedFiles as fileItem, idx}
										<div class="relative group aspect-square rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
											<img src={fileItem.preview} alt={fileItem.name} class="w-full h-full object-cover" />
											<div class="absolute inset-x-0 bottom-0 bg-slate-900/70 text-white p-1 text-[9px] truncate">
												{fileItem.name} ({fileItem.size})
											</div>
											<button
												type="button"
												onclick={() => removeUploadedFile(idx)}
												class="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
												aria-label="Remove"
											>
												<X class="w-3 h-3" />
											</button>
										</div>
									{/each}
								</div>

								<!-- Auto-save to gallery checkbox -->
								<label class="flex items-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer select-none">
									<input
										type="checkbox"
										bind:checked={saveToGallery}
										class="rounded border-slate-300 text-[#5845eb] focus:ring-[#5845eb]"
									/>
									<span>এই ছবিগুলো ভবিষ্যতের জন্য স্থায়ী মিডিয়া গ্যালারিতেও সংরক্ষণ করুন</span>
								</label>
							</div>
						{/if}
					</div>

				<!-- 2. TAB: DIRECT URL LINK -->
				{:else if activeTab === 'link'}
					<div class="space-y-4">
						<div class="space-y-1.5">
							<label for="img-link-input" class="block text-xs font-bold text-slate-700">
								ইমেজ ওয়েব লিংক বা লোকাল পাথ পেস্ট করুন *
							</label>
							<div class="relative">
								<Link2 class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
								<Input
									id="img-link-input"
									type="url"
									bind:value={linkInput}
									placeholder="https://images.unsplash.com/... অথবা /images/products/soundcore.svg"
									class="pl-10 text-sm font-mono rounded-xl"
									oninput={() => (linkPreviewError = false)}
								/>
							</div>
							<p class="text-[11px] text-slate-400">
								যেকোনো পাবলিক সিডিএন লিংক, ইমেজ ইউআরএল অথবা সাইটের স্ট্যাটিক পাথ দিন।
							</p>
						</div>

						<!-- Live Image Preview for Link -->
						{#if linkInput.trim()}
							<div class="space-y-2 pt-2 border-t border-slate-100">
								<span class="text-xs font-bold text-slate-700">ইনস্ট্যান্ট প্রিভিউ:</span>
								<div class="w-full h-48 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative shadow-inner">
									{#if linkPreviewError}
										<div class="text-center p-4 space-y-1 text-rose-500">
											<AlertCircle class="w-6 h-6 mx-auto" />
											<div class="text-xs font-bold">ইমেজটি লোড করা যাচ্ছে না</div>
											<div class="text-[10px] text-slate-400">সঠিক ইমেজ URL বা সরাসরি ইমেজ লিংক পরীক্ষা করুন</div>
										</div>
									{:else}
										<img
											src={linkInput.trim()}
											alt="Link preview"
											onerror={() => (linkPreviewError = true)}
											class="max-h-full max-w-full object-contain p-2"
										/>
									{/if}
								</div>
							</div>
						{/if}
					</div>

				<!-- 3. TAB: MEDIA GALLERY PICKER -->
				{:else if activeTab === 'gallery'}
					<div class="space-y-3">
						<!-- Search bar -->
						<div class="relative">
							<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
							<Input
								type="text"
								bind:value={gallerySearch}
								placeholder="গ্যালারির ছবি খুঁজুন (যেমন: soundcore, kirkland)..."
								class="pl-9 text-xs rounded-xl"
							/>
						</div>

						<!-- Photos Grid -->
						<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-72 overflow-y-auto p-1">
							{#each displayGallery as imgItem (imgItem.id || imgItem.url || imgItem)}
								{@const imgUrl = imgItem.url || imgItem}
								{@const isSelected = selectedGalleryUrls.includes(imgUrl)}
								<button
									type="button"
									onclick={() => toggleGallerySelect(imgUrl)}
									class="relative aspect-square rounded-xl border-2 overflow-hidden transition-all group cursor-pointer text-left {isSelected ? 'border-[#5845eb] ring-2 ring-[#5845eb]/30 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}"
								>
									<img
										src={imgUrl}
										alt={imgItem.name || 'Gallery item'}
										class="w-full h-full object-cover p-1 bg-white"
									/>

									<!-- Checkmark badge if selected -->
									{#if isSelected}
										<div class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#5845eb] text-white flex items-center justify-center shadow-xs">
											<Check class="w-3.5 h-3.5 stroke-[3]" />
										</div>
									{/if}

									<div class="absolute inset-x-0 bottom-0 bg-slate-900/60 backdrop-blur-xs text-white text-[9px] px-1 py-0.5 truncate font-medium">
										{imgItem.name || 'Photo'}
									</div>
								</button>
							{/each}
						</div>
						<div class="text-[11px] text-slate-500 font-medium text-right">
							{selectedGalleryUrls.length}টি ছবি নির্বাচিত হয়েছে
						</div>
					</div>
				{/if}

			</div>

			<!-- Footer Action Buttons -->
			<div class="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
				<Button
					type="button"
					variant="ghost"
					onclick={resetAndClose}
					class="text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
				>
					বাতিল
				</Button>

				<Button
					type="button"
					variant="blue"
					onclick={handleConfirm}
					disabled={
						isUploading ||
						(activeTab === 'upload' && uploadedFiles.length === 0) ||
						(activeTab === 'link' && !linkInput.trim()) ||
						(activeTab === 'gallery' && selectedGalleryUrls.length === 0)
					}
					class="text-xs font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
				>
					{#if isUploading}
						<div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
						<span>সংরক্ষণ হচ্ছে...</span>
					{:else}
						<span>ছবি যুক্ত করুন</span>
					{/if}
				</Button>
			</div>

		</div>
	</div>
{/if}
