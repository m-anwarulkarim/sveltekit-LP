<script lang="ts">
	import {
		ChevronLeft,
		Trash2,
		Camera,
		X,
		Check,
		Headphones,
		Loader2,
		UploadCloud
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button, Input } from '#lib/components/ui';

	let { data }: { data?: any } = $props();

	const isNew = $derived(data?.carousel?.id === 'new');
	let item = $derived(data?.carousel || {});

	// Form field states
	let name = $state(data?.carousel?.name || 'banner');
	let status = $state(data?.carousel?.status || 'Publish');
	let description = $state(data?.carousel?.description || '');
	let urlType = $state(data?.carousel?.urlType || 'Internal');
	let targetUrl = $state(data?.carousel?.targetUrl || '/home');
	let serial = $state(String(data?.carousel?.sortOrder ?? 1));
	let currentImage = $state(data?.carousel?.image || '/images/banners/banner-home.svg');
	let mobileImage = $state(data?.carousel?.mobileImage || '');
	let isSaving = $state(false);

	let fileInputRef: HTMLInputElement | null = $state(null);
	let uploadTarget = $state<'desktop' | 'mobile'>('desktop');

	let totalImagesCount = $derived((currentImage ? 1 : 0) + (mobileImage ? 1 : 0));

	function triggerUpload(target: 'desktop' | 'mobile' = 'desktop') {
		uploadTarget = target;
		fileInputRef?.click();
	}

	function handleFileSelected(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		const objectUrl = URL.createObjectURL(file);
		if (uploadTarget === 'desktop' || !currentImage) {
			currentImage = objectUrl;
			toast.success('ডেস্কটপ ব্যানার ইমেজ নির্বাচন করা হয়েছে');
		} else {
			mobileImage = objectUrl;
			toast.success('মোবাইল ব্যানার ইমেজ নির্বাচন করা হয়েছে');
		}
	}

	function removeImage(type: 'desktop' | 'mobile') {
		if (type === 'desktop') {
			currentImage = '';
			toast.info('ডেস্কটপ ইমেজ সরানো হয়েছে');
		} else {
			mobileImage = '';
			toast.info('মোবাইল ইমেজ সরানো হয়েছে');
		}
	}
</script>

<svelte:head>
	<title>{isNew ? 'Add Carousel' : 'Edit Carousel'} - Customization - AURA Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-['Anek_Bangla',sans-serif]">
	<!-- Top Sub-Header Bar (Title Left, Support Button Right) -->
	<div class="flex items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<a
				href="/admin/customization/carousel"
				class="w-9 h-9 rounded-xl border border-slate-200/90 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
				title="ক্যারোসেল লিস্টে ফিরে যান"
				aria-label="Back to carousel list"
			>
				<ChevronLeft class="w-4 h-4" />
			</a>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
					{isNew ? 'Add Carousel' : 'Edit Carousel'}
				</h1>
			</div>
		</div>

		<a
			href="/admin/support"
			class="rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
		>
			<Headphones class="w-3.5 h-3.5" />
			<span>Support</span>
		</a>
	</div>

	<!-- Main Form Card (Matching Screenshot Exact Layout) -->
	<div class="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
		<form
			method="POST"
			action="?/updateCarousel"
			use:enhance={() => {
				isSaving = true;
				return async ({ result, update }) => {
					isSaving = false;
					if (result.type === 'redirect') {
						toast.success(isNew ? 'নতুন ক্যারোসেল যুক্ত হয়েছে!' : 'ক্যারোসেল সফলভাবে আপডেট হয়েছে!');
					}
					await update();
				};
			}}
			class="space-y-6"
		>
			<input type="hidden" name="image" value={currentImage} />
			<input type="hidden" name="mobileImage" value={mobileImage} />

			<!-- Media Assets Section -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-sm font-bold text-slate-900">Media Assets</span>
					<span class="text-xs text-slate-400 font-semibold">{totalImagesCount}/2 images</span>
				</div>

				<div class="flex items-center gap-4">
					<!-- Desktop Image Thumbnail Preview -->
					{#if currentImage}
						<div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-slate-200 bg-slate-50 p-1 overflow-visible shadow-2xs group">
							<img
								src={currentImage}
								alt="Carousel preview"
								class="w-full h-full object-cover rounded-xl"
							/>
							<button
								type="button"
								onclick={() => removeImage('desktop')}
								class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
								title="ডেস্কটপ ইমেজ মুছুন"
								aria-label="Remove desktop image"
							>
								<Trash2 class="w-3.5 h-3.5" />
							</button>
						</div>
					{/if}

					<!-- Mobile Image Thumbnail Preview -->
					{#if mobileImage}
						<div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-indigo-200 bg-indigo-50/20 p-1 overflow-visible shadow-2xs group">
							<img
								src={mobileImage}
								alt="Mobile preview"
								class="w-full h-full object-cover rounded-xl"
							/>
							<button
								type="button"
								onclick={() => removeImage('mobile')}
								class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
								title="মোবাইল ইমেজ মুছুন"
								aria-label="Remove mobile image"
							>
								<Trash2 class="w-3.5 h-3.5" />
							</button>
						</div>
					{/if}

					<!-- Dashed Upload Box with Camera Icon (Visible if < 2 images) -->
					{#if totalImagesCount < 2}
						<button
							type="button"
							onclick={() => triggerUpload(!currentImage ? 'desktop' : 'mobile')}
							class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#5845eb] hover:bg-indigo-50/20 flex flex-col items-center justify-center text-slate-400 hover:text-[#5845eb] transition-all cursor-pointer shadow-2xs group"
							title={!currentImage ? 'ডেস্কটপ ইমেজ আপলোড করুন' : 'মোবাইল অপ্টিমাইজড ইমেজ আপলোড করুন'}
							aria-label="Upload carousel image"
						>
							<Camera class="w-6 h-6 stroke-[1.8] group-hover:scale-110 transition-transform" />
						</button>
					{/if}

					<!-- Hidden File Input -->
					<input
						type="file"
						accept="image/*"
						bind:this={fileInputRef}
						onchange={handleFileSelected}
						class="hidden"
					/>
				</div>
			</div>

			<!-- Name & Select Status (2 columns) -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div>
					<label for="carousel-name" class="block text-xs font-bold text-slate-700 mb-1.5">Name</label>
					<Input
						id="carousel-name"
						type="text"
						name="name"
						bind:value={name}
						placeholder="banner"
						required
						class="rounded-xl border-slate-200 text-xs sm:text-sm py-2.5 bg-white focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
					/>
				</div>

				<div>
					<label for="carousel-status" class="block text-xs font-bold text-slate-700 mb-1.5">Select Status</label>
					<select
						id="carousel-status"
						name="status"
						bind:value={status}
						class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#5845eb] cursor-pointer shadow-2xs"
					>
						<option value="Publish">Publish</option>
						<option value="Draft">Draft</option>
					</select>
				</div>
			</div>

			<!-- Description Field -->
			<div>
				<label for="carousel-description" class="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
				<textarea
					id="carousel-description"
					name="description"
					bind:value={description}
					rows="3"
					placeholder="Enter description (optional)"
					class="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] shadow-2xs transition-all resize-y"
				></textarea>
			</div>

			<!-- URL Type & URL Path (2 columns) -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div>
					<label for="carousel-url-type" class="block text-xs font-bold text-slate-700 mb-1.5">URL Type</label>
					<select
						id="carousel-url-type"
						name="urlType"
						bind:value={urlType}
						class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#5845eb] cursor-pointer shadow-2xs"
					>
						<option value="Internal">Internal</option>
						<option value="External">External</option>
					</select>
				</div>

				<div>
					<label for="carousel-url" class="block text-xs font-bold text-slate-700 mb-1.5">URL</label>
					<Input
						id="carousel-url"
						type="text"
						name="targetUrl"
						bind:value={targetUrl}
						placeholder="/home"
						required
						class="rounded-xl border-slate-200 text-xs sm:text-sm py-2.5 bg-white font-mono focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
					/>
				</div>
			</div>

			<!-- Serial -->
			<div>
				<label for="carousel-serial" class="block text-xs font-bold text-slate-700 mb-1.5">Serial</label>
				<Input
					id="carousel-serial"
					type="number"
					name="serial"
					bind:value={serial}
					placeholder="1"
					class="rounded-xl border-slate-200 text-xs sm:text-sm py-2.5 bg-white font-mono focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
				/>
			</div>

			<!-- Bottom Actions (Discard Left, Update Carousel Right) -->
			<div class="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
				<a
					href="/admin/customization/carousel"
					class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
				>
					<X class="w-3.5 h-3.5 text-slate-400" />
					<span>Discard</span>
				</a>

				<Button
					type="submit"
					disabled={isSaving}
					class="bg-[#5845eb] hover:bg-[#4936d6] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
				>
					{#if isSaving}
						<Loader2 class="w-4 h-4 animate-spin" />
						<span>সংরক্ষণ হচ্ছে...</span>
					{:else}
						<Check class="w-4 h-4 stroke-[2.5]" />
						<span>{isNew ? 'Create Carousel' : 'Update Carousel'}</span>
					{/if}
				</Button>
			</div>
		</form>
	</div>
</div>

