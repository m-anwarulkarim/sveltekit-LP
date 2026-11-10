<script lang="ts">
	import {
		UploadCloud,
		Image as ImageIcon,
		Trash2,
		Sparkles,
		Link2,
		FolderOpen,
		Check,
		Search,
		Loader2,
		X
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { uploadOptimizedImage } from '#lib/utils/image-optimizer';

	interface Props {
		image?: string;
		name?: string;
		label?: string;
		folder?: string;
	}

	let {
		image = $bindable(''),
		name = 'image',
		label = 'ক্যাটাগরি ছবি ও আইকন',
		folder = 'categories'
	}: Props = $props();

	type Mode = 'upload' | 'gallery' | 'url';
	let activeMode = $state<Mode>('upload');

	let isDragging = $state(false);
	let isUploading = $state(false);
	let fileInputRef: HTMLInputElement | null = $state(null);

	// Gallery State
	let isGalleryOpen = $state(false);
	let galleryItems = $state<any[]>([]);
	let gallerySearch = $state('');
	let isLoadingGallery = $state(false);

	// Sample presets
	const presetImages = [
		'/images/banners/banner-home.svg',
		'/images/banners/banner-citizens.svg',
		'/images/banners/banner-combo.svg',
		'/images/products/soundcore.svg',
		'/images/products/trimmer.svg',
		'/images/products/kirkland.svg',
		'/images/products/ordinary.svg',
		'/images/products/cosrx.svg',
		'/images/products/bioderma.svg',
		'/images/products/anua-toner.svg',
		'/images/products/boj-sunscreen.svg',
		'/images/products/cerave.svg'
	];

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			processFile(target.files[0]);
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
			processFile(e.dataTransfer.files[0]);
		}
	}

	async function processFile(file: File) {
		if (!file.type.startsWith('image/')) {
			toast.error('শুধুমাত্র ইমেজ ফাইল (PNG, JPG, WebP, SVG) গ্রহণযোগ্য');
			return;
		}

		if (file.size > 15 * 1024 * 1024) {
			toast.error('ফাইলের সাইজ ১৫ MB এর কম হতে হবে');
			return;
		}

		isUploading = true;

		// 1. Instant local preview
		const reader = new FileReader();
		reader.onload = (event) => {
			if (!image) {
				image = event.target?.result as string;
			}
		};
		reader.readAsDataURL(file);

		// 2. Upload directly to Cloudflare R2 via upload API
		try {
			const uploaded = await uploadOptimizedImage(file, folder, { maxDimension: 800 });
			image = uploaded.url;
			toast.success('ছবি সফলভাবে আপলোড হয়েছে!');
		} catch (err: any) {
			console.error('R2 upload failed:', err);
			toast.error(err?.message || 'ছবি আপলোড ব্যর্থ হয়েছে');
		} finally {
			isUploading = false;
		}
	}

	async function loadGallery() {
		isLoadingGallery = true;
		try {
			const res = await fetch('/api/admin/media?limit=60');
			const data: any = await res.json();
			if (data.success && Array.isArray(data.items)) {
				galleryItems = data.items;
			}
		} catch (e) {
			console.error('Failed to load gallery:', e);
		} finally {
			isLoadingGallery = false;
		}
	}

	function openGalleryModal() {
		isGalleryOpen = true;
		loadGallery();
	}

	const filteredGallery = $derived.by(() => {
		const combined = [...galleryItems];
		presetImages.forEach((p) => {
			if (!combined.some((item) => (item.url || item) === p)) {
				combined.push({
					id: `preset-${p}`,
					name: p.split('/').pop()?.replace('.svg', '') || 'Preset',
					url: p
				});
			}
		});

		if (!gallerySearch.trim()) return combined;
		const q = gallerySearch.toLowerCase().trim();
		return combined.filter(
			(img) => (img.name && img.name.toLowerCase().includes(q)) || (img.url && img.url.toLowerCase().includes(q))
		);
	});

	function selectGalleryImage(url: string) {
		image = url;
		isGalleryOpen = false;
		toast.success('ছবি নির্বাচন করা হয়েছে!');
	}

	function removeImage() {
		image = '';
		if (fileInputRef) {
			fileInputRef.value = '';
		}
	}
</script>

<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
	<!-- Hidden input to naturally deliver value in standard form submissions -->
	<input type="hidden" {name} value={image} />

	<!-- Hidden native file input -->
	<input
		type="file"
		accept="image/*"
		bind:this={fileInputRef}
		onchange={handleFileSelect}
		class="hidden"
	/>

	<!-- Card Title & Mode Switcher -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
		<h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
			<ImageIcon class="w-4 h-4 text-indigo-600" />
			<span>{label}</span>
		</h2>

		<!-- Mode Tabs -->
		<div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
			<button
				type="button"
				onclick={() => (activeMode = 'upload')}
				class="px-3 py-1.5 rounded-lg transition-all cursor-pointer {activeMode === 'upload'
					? 'bg-white text-indigo-700 shadow-2xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				ফাইল আপলোড
			</button>
			<button
				type="button"
				onclick={openGalleryModal}
				class="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 {activeMode === 'gallery'
					? 'bg-white text-indigo-700 shadow-2xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<FolderOpen class="w-3.5 h-3.5" />
				<span>গ্যালারি</span>
			</button>
			<button
				type="button"
				onclick={() => (activeMode = 'url')}
				class="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 {activeMode === 'url'
					? 'bg-white text-indigo-700 shadow-2xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<Link2 class="w-3.5 h-3.5" />
				<span>লিংক/URL</span>
			</button>
		</div>
	</div>

	<!-- Image Selected Preview Display -->
	{#if image}
		<div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-4">
				<div class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border border-slate-200 p-2 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
					<img src={image} alt="Selected preview" class="w-full h-full object-contain" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
							<Check class="w-3 h-3" />
							<span>ছবি যুক্ত আছে</span>
						</span>
					</div>
					<p class="text-xs text-slate-500 mt-1 max-w-sm sm:max-w-md truncate font-mono">
						{image.startsWith('data:') ? 'Local Uploaded Image (Base64)' : image}
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2 w-full sm:w-auto">
				<button
					type="button"
					onclick={() => fileInputRef?.click()}
					class="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
				>
					পরিবর্তন করুন
				</button>
				<button
					type="button"
					onclick={removeImage}
					class="px-3 py-2 text-xs font-semibold bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
					title="ছবি মুছে ফেলুন"
				>
					<Trash2 class="w-3.5 h-3.5" />
					<span>মুছুন</span>
				</button>
			</div>
		</div>

	<!-- No Image: Dropzone / Input Area -->
	{:else}
		{#if activeMode === 'upload'}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				ondragover={(e) => { e.preventDefault(); isDragging = true; }}
				ondragleave={() => (isDragging = false)}
				ondrop={handleDrop}
				onclick={() => fileInputRef?.click()}
				class="border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 {isDragging
					? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
					: 'border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50'}"
			>
				<div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
					{#if isUploading}
						<Loader2 class="w-6 h-6 animate-spin text-indigo-600" />
					{:else}
						<UploadCloud class="w-6 h-6" />
					{/if}
				</div>

				<div>
					<p class="text-sm font-bold text-slate-700">
						{isUploading ? 'ছবি আপলোড হচ্ছে...' : 'ছবি ড্রপ করুন অথবা ব্রাউজ করতে এখানে ক্লিক করুন'}
					</p>
					<p class="text-xs text-slate-400 mt-1">
						PNG, JPG, WebP অথবা SVG (সর্বোচ্চ সাইজ: ৫ MB)
					</p>
				</div>
			</div>

		{:else if activeMode === 'url'}
			<div class="space-y-3">
				<div>
					<label for="direct-url-input" class="block text-xs font-semibold text-slate-700 mb-1.5">
						ছবির সরাসরি ওয়েব URL দিন:
					</label>
					<div class="flex items-center gap-2">
						<input
							id="direct-url-input"
							type="text"
							bind:value={image}
							placeholder="https://example.com/category-image.png"
							class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
						/>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<!-- Media Gallery Selector Modal -->
{#if isGalleryOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
		<div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
			<!-- Modal Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
				<div class="flex items-center gap-2">
					<FolderOpen class="w-5 h-5 text-indigo-600" />
					<div>
						<h3 class="font-bold text-slate-900 text-sm">মিডিয়া গ্যালারি থেকে ছবি বেছে নিন</h3>
						<p class="text-[11px] text-slate-500">আপনার বিদ্যমান ক্যাটালগ ও প্রডাক্ট ছবিগুলোর তালিকা</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (isGalleryOpen = false)}
					class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer"
					aria-label="Close"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Search Bar -->
			<div class="p-4 border-b border-slate-100 bg-white">
				<div class="relative">
					<input
						type="text"
						bind:value={gallerySearch}
						placeholder="ছবি খুঁজুন..."
						class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500"
					/>
					<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
				</div>
			</div>

			<!-- Grid of Images -->
			<div class="p-4 overflow-y-auto flex-1">
				{#if isLoadingGallery}
					<div class="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
						<Loader2 class="w-6 h-6 animate-spin text-indigo-600" />
						<span class="text-xs">গ্যালারি লোড হচ্ছে...</span>
					</div>
				{:else if filteredGallery.length === 0}
					<div class="py-12 text-center text-xs text-slate-400">
						কোনো ছবি পাওয়া যায়নি
					</div>
				{:else}
					<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
						{#each filteredGallery as item}
							<button
								type="button"
								onclick={() => selectGalleryImage(item.url || item)}
								class="group flex flex-col items-center p-2 rounded-xl border border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 transition-all cursor-pointer relative overflow-hidden"
							>
								<div class="w-full aspect-square rounded-lg bg-slate-50 flex items-center justify-center p-2 overflow-hidden mb-1.5">
									<img
										src={item.url || item}
										alt={item.name || 'Image'}
										class="w-full h-full object-contain group-hover:scale-105 transition-transform"
										loading="lazy"
									/>
								</div>
								<span class="text-[10px] text-slate-600 truncate w-full text-center font-medium">
									{item.name || 'Preset'}
								</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Modal Footer -->
			<div class="flex items-center justify-end px-6 py-3 bg-slate-50 border-t border-slate-100">
				<button
					type="button"
					onclick={() => (isGalleryOpen = false)}
					class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl cursor-pointer"
				>
					বন্ধ করুন
				</button>
			</div>
		</div>
	</div>
{/if}

