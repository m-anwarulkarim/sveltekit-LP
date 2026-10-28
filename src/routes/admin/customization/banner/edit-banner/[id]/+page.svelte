<script lang="ts">
	import {
		ChevronLeft,
		Trash2,
		Camera,
		X,
		Check,
		Headphones,
		Loader2
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button, Input } from '#lib/components/ui';

	let { data }: { data?: any } = $props();

	const isNew = $derived(data?.banner?.id === 'new');
	let item = $derived(data?.banner || {});

	// Form field states
	let title = $state(data?.banner?.title || 'bannar1');
	let urlType = $state(data?.banner?.urlType || 'Internal');
	let targetUrl = $state(data?.banner?.targetUrl || '/home');
	let placement = $state(data?.banner?.placement || 'Home Page Top Banner');
	let priority = $state(String(data?.banner?.sortOrder ?? 10));
	let displayOptions = $state(data?.banner?.displayOptions || 'Show on Home');
	let status = $state(data?.banner?.status || 'Draft');
	let currentImage = $state(data?.banner?.image || '/images/banners/banner-home.svg');
	let isSaving = $state(false);

	let fileInputRef: HTMLInputElement | null = $state(null);

	function triggerUpload() {
		fileInputRef?.click();
	}

	function handleFileSelected(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		const objectUrl = URL.createObjectURL(file);
		currentImage = objectUrl;
		toast.success('ইমেজ নির্বাচন করা হয়েছে');
	}

	function removeImage() {
		currentImage = '';
		toast.info('ইমেজ সরানো হয়েছে');
	}
</script>

<svelte:head>
	<title>{isNew ? 'Add Banner' : 'Update Banner'} - Customization - AURA Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-['Anek_Bangla',sans-serif]">
	<!-- Top Sub-Header Bar (Title Left, Support Button Right) -->
	<div class="flex items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<a
				href="/admin/customization/banner"
				class="inline-flex items-center gap-1.5 text-slate-800 hover:text-slate-950 font-bold text-lg sm:text-xl transition-colors"
			>
				<ChevronLeft class="w-5 h-5 text-slate-600" />
				<span class="font-['Outfit',sans-serif]">{isNew ? 'Add Banner' : 'Update Banner'}</span>
			</a>
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
			action="?/updateBanner"
			use:enhance={() => {
				isSaving = true;
				return async ({ result, update }) => {
					isSaving = false;
					if (result.type === 'redirect') {
						toast.success(isNew ? 'নতুন ব্যানার যুক্ত হয়েছে!' : 'ব্যানার সফলভাবে আপডেট হয়েছে!');
					}
					await update();
				};
			}}
			class="space-y-6"
		>
			<input type="hidden" name="image" value={currentImage} />

			<!-- Media Assets Section -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-sm font-bold text-slate-900">Media Assets</span>
					<span class="text-xs text-slate-400 font-semibold">{currentImage ? '1 images' : '0 images'}</span>
				</div>

				<div class="flex items-center gap-4">
					<!-- Uploaded Image Thumbnail Preview -->
					{#if currentImage}
						<div class="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border border-slate-200 bg-slate-50 p-1 overflow-visible shadow-2xs group">
							<img
								src={currentImage}
								alt="Banner preview"
								class="w-full h-full object-cover rounded-xl"
							/>
							<button
								type="button"
								onclick={removeImage}
								class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
								title="ইমেজ মুছুন"
								aria-label="Remove image"
							>
								<Trash2 class="w-3.5 h-3.5" />
							</button>
						</div>
					{/if}

					<!-- Dashed Upload Box with Camera Icon -->
					<button
						type="button"
						onclick={triggerUpload}
						class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#5845eb] hover:bg-indigo-50/20 flex flex-col items-center justify-center text-slate-400 hover:text-[#5845eb] transition-all cursor-pointer shadow-2xs group"
						title="নতুন ইমেজ আপলোড করুন"
						aria-label="Upload banner image"
					>
						<Camera class="w-7 h-7 stroke-[1.8] group-hover:scale-110 transition-transform" />
					</button>

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

			<!-- Banner Title -->
			<div>
				<label for="banner-title" class="block text-xs font-bold text-slate-700 mb-1.5">Banner Title</label>
				<Input
					id="banner-title"
					type="text"
					name="title"
					bind:value={title}
					placeholder="bannar1"
					required
					class="rounded-xl border-slate-200 text-xs sm:text-sm py-2.5 bg-white focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
				/>
			</div>

			<!-- URL Type & URL Path (2 columns) -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div>
					<label for="banner-url-type" class="block text-xs font-bold text-slate-700 mb-1.5">URL Type</label>
					<select
						id="banner-url-type"
						name="urlType"
						bind:value={urlType}
						class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#5845eb] cursor-pointer shadow-2xs"
					>
						<option value="Internal">Internal</option>
						<option value="External">External</option>
					</select>
				</div>

				<div>
					<label for="banner-url-path" class="block text-xs font-bold text-slate-700 mb-1.5">URL Path</label>
					<Input
						id="banner-url-path"
						type="text"
						name="targetUrl"
						bind:value={targetUrl}
						placeholder="/home"
						required
						class="rounded-xl border-slate-200 text-xs sm:text-sm py-2.5 bg-white font-mono focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
					/>
				</div>
			</div>

			<!-- Banner Type & Priority (2 columns) -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div>
					<label for="banner-placement" class="block text-xs font-bold text-slate-700 mb-1.5">Banner Type</label>
					<select
						id="banner-placement"
						name="placement"
						bind:value={placement}
						class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#5845eb] cursor-pointer shadow-2xs"
					>
						<option value="Home Page Top Banner">Home Page Top Banner</option>
						<option value="Category Middle Banner">Category Middle Banner</option>
						<option value="Footer Top Banner">Footer Top Banner</option>
					</select>
				</div>

				<div>
					<label for="banner-priority" class="block text-xs font-bold text-slate-700 mb-1.5">customization.priority</label>
					<Input
						id="banner-priority"
						type="number"
						name="priority"
						bind:value={priority}
						placeholder="10"
						class="rounded-xl border-slate-200 text-xs sm:text-sm py-2.5 bg-white font-mono focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
					/>
				</div>
			</div>

			<!-- Display Options & Select Status (2 columns) -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div>
					<label for="banner-display" class="block text-xs font-bold text-slate-700 mb-1.5">Display Options</label>
					<select
						id="banner-display"
						name="displayOptions"
						bind:value={displayOptions}
						class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#5845eb] cursor-pointer shadow-2xs"
					>
						<option value="Show on Home">Show on Home</option>
						<option value="Show on All Pages">Show on All Pages</option>
						<option value="Show on Category Pages">Show on Category Pages</option>
					</select>
				</div>

				<div>
					<label for="banner-status" class="block text-xs font-bold text-slate-700 mb-1.5">Select Status</label>
					<select
						id="banner-status"
						name="status"
						bind:value={status}
						class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#5845eb] cursor-pointer shadow-2xs"
					>
						<option value="Draft">Draft</option>
						<option value="Publish">Publish</option>
					</select>
				</div>
			</div>

			<!-- Bottom Actions (Discard Left, Update Banner Right) -->
			<div class="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
				<a
					href="/admin/customization/banner"
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
						<span>{isNew ? 'Create Banner' : 'Update Banner'}</span>
					{/if}
				</Button>
			</div>
		</form>
	</div>
</div>

