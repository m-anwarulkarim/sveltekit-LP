<script lang="ts">
	import { Button, Input, Dialog, Badge } from '#lib/components/ui';
	import { Search, X, Check, Upload, Image as ImageIcon } from 'lucide-svelte';
	import { getGalleryImages, addGalleryImage, type GalleryImage } from '../../_data/gallery.ts';

	interface Props {
		open?: boolean;
		onSelect: (url: string) => void;
		title?: string;
	}

	let {
		open = $bindable(false),
		onSelect,
		title = 'গ্যালারি থেকে ছবি বেছে নিন'
	}: Props = $props();

	let searchQuery = $state('');
	let selectedFolder = $state('all');
	let isQuickUploading = $state(false);

	let allImages = $derived(getGalleryImages());

	let filteredImages = $derived(
		allImages.filter((img) => {
			const matchesFolder = selectedFolder === 'all' ? true : img.folder === selectedFolder;
			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				q === '' ? true : img.name.toLowerCase().includes(q) || img.folder.toLowerCase().includes(q);
			return matchesFolder && matchesSearch;
		})
	);

	function handleChoose(url: string) {
		onSelect(url);
		open = false;
	}

	function handleFileDrop(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
			handleUploadFile(e.dataTransfer.files[0]);
		}
	}

	function handleFileInput(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			handleUploadFile(target.files[0]);
		}
	}

	function handleUploadFile(file: File) {
		const reader = new FileReader();
		reader.onload = (uploadEvent) => {
			const dataUrl = uploadEvent.target?.result as string;
			const newImg: GalleryImage = {
				id: 'custom-' + Date.now(),
				name: file.name.replace(/\.[^/.]+$/, ''),
				url: dataUrl,
				folder: 'products',
				size: `${(file.size / 1024).toFixed(0)} KB`,
				dimensions: '800 x 800',
				uploadedAt: 'মাত্র এখন'
			};
			addGalleryImage(newImg);
			handleChoose(dataUrl);
		};
		reader.readAsDataURL(file);
	}
</script>

{#if open}
	<Dialog bind:open>
		<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
			<div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
				
				<!-- Header -->
				<div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
					<div class="flex items-center gap-2.5">
						<div class="w-8 h-8 rounded-xl bg-indigo-100 text-[#5845eb] flex items-center justify-center">
							<ImageIcon class="w-4 h-4" />
						</div>
						<div>
							<h3 class="text-base font-black text-slate-900">{title}</h3>
							<p class="text-xs text-slate-500">যেকোনো ছবিতে ক্লিক করলেই তা প্রোডাক্ট বা পেজে যুক্ত হয়ে যাবে</p>
						</div>
					</div>
					<button
						type="button"
						onclick={() => (open = false)}
						class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
					>
						<X class="w-4 h-4" />
					</button>
				</div>

				<!-- Search, Folder Filter & Quick Upload -->
				<div class="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
					<div class="relative w-full sm:w-80">
						<Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
						<Input
							bind:value={searchQuery}
							placeholder="ছবি বা ফোল্ডার খুঁজুন..."
							class="pl-9 bg-slate-50 text-xs"
						/>
					</div>

					<div class="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
						{#each [
							{ id: 'all', label: 'সব' },
							{ id: 'products', label: 'প্রোডাক্ট' },
							{ id: 'categories', label: 'ক্যাটাগরি' },
							{ id: 'banners', label: 'ব্যানার' }
						] as tab}
							<button
								type="button"
								onclick={() => (selectedFolder = tab.id)}
								class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors {selectedFolder === tab.id
									? 'bg-[#5845eb] text-white shadow-2xs'
									: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
							>
								{tab.label}
							</button>
						{/each}

						<label class="cursor-pointer px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0">
							<Upload class="w-3.5 h-3.5" />
							<span>নতুন আপলোড</span>
							<input type="file" accept="image/*" class="hidden" onchange={handleFileInput} />
						</label>
					</div>
				</div>

				<!-- Images Grid -->
				<div class="p-6 overflow-y-auto flex-1 bg-slate-50/50">
					{#if filteredImages.length === 0}
						<div class="py-16 text-center text-slate-400">
							<ImageIcon class="w-10 h-10 mx-auto text-slate-300 mb-2" />
							<p class="font-bold text-sm text-slate-600">কোনো ছবি পাওয়া যায়নি</p>
							<p class="text-xs text-slate-400 mt-1">উপরে 'নতুন আপলোড' বাটন দিয়ে ছবি যোগ করুন</p>
						</div>
					{:else}
						<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
							{#each filteredImages as img (img.id)}
								<button
									type="button"
									onclick={() => handleChoose(img.url)}
									class="group relative aspect-square bg-white rounded-2xl border border-slate-200/80 hover:border-[#5845eb] hover:shadow-md transition-all p-2 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
								>
									<img
										src={img.url}
										alt={img.name}
										loading="lazy"
										class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
									/>
									<!-- Hover overlay -->
									<div class="absolute inset-0 bg-[#5845eb]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
										<Check class="w-6 h-6 mb-1" />
										<span class="text-xs font-bold leading-tight line-clamp-2">{img.name}</span>
										<span class="text-[10px] text-white/80 mt-1 uppercase font-semibold">{img.folder}</span>
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Footer -->
				<div class="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500 font-medium">
					<span>মোট {filteredImages.length} টি ছবি দৃশ্যমান</span>
					<Button variant="outline" size="sm" onclick={() => (open = false)}>
						বন্ধ করুন
					</Button>
				</div>

			</div>
		</div>
	</Dialog>
{/if}

