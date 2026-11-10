<script lang="ts">
	import { ArrowLeft, Save, Loader2, Sparkles } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import CatalogImageUploader from '../../../_components/CatalogImageUploader.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isSubmitting = $state(false);
	let name = $state(data.brand?.name || '');
	let logo = $state(data.brand?.logo || '');
	let website = $state(data.brand?.website || '');
	let priority = $state<number>(data.brand?.sortOrder ?? 0);
	let homeShow = $state<'Yes' | 'No'>(data.brand?.isFeatured ? 'Yes' : 'No');
	let status = $state<'publish' | 'draft'>(data.brand?.isActive ? 'publish' : 'draft');
</script>

<svelte:head>
	<title>ব্র্যান্ড সম্পাদনা | Haq Plus Admin</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 font-['Anek_Bangla',sans-serif]">
	<!-- Page Header -->
	<div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
		<div class="flex items-center gap-3">
			<a
				href="/admin/catalog/brands"
				class="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
				title="তালিকায় ফিরে যান"
			>
				<ArrowLeft class="w-5 h-5" />
			</a>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-xl sm:text-2xl font-bold text-slate-800">ব্র্যান্ড সম্পাদনা</h1>
					<span class="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
						ID: {data.brand?.id}
					</span>
				</div>
				<p class="text-xs sm:text-sm text-slate-500">ব্র্যান্ডের নাম, লোগো বা স্ট্যাটাস পরিবর্তন করুন</p>
			</div>
		</div>

		<a
			href="/admin/catalog/brands"
			class="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
		>
			বাতিল
		</a>
	</div>

	<!-- Form -->
	<form
		method="POST"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result, update }) => {
				isSubmitting = false;
				if (result.type === 'failure') {
					toast.error((result.data as any)?.message || 'ব্র্যান্ড আপডেট করতে সমস্যা হয়েছে');
				} else {
					toast.success('ব্র্যান্ড সফলভাবে আপডেট করা হয়েছে!');
				}
				await update();
			};
		}}
		class="space-y-6"
	>
		<!-- 1. General Info Card -->
		<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
			<h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
				<Sparkles class="w-4 h-4 text-indigo-600" />
				<span>সাধারণ তথ্য (General Information)</span>
			</h2>

			<div class="space-y-4">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="brand-edit-name" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							ব্র্যান্ডের নাম <span class="text-rose-500">*</span>
						</label>
						<input
							id="brand-edit-name"
							type="text"
							name="name"
							bind:value={name}
							required
							class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
						/>
					</div>

					<div>
						<label for="brand-edit-website" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							অফিশিয়াল ওয়েবসাইট (ঐচ্ছিক)
						</label>
						<input
							id="brand-edit-website"
							type="url"
							name="website"
							bind:value={website}
							placeholder="https://brand.com"
							class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div>
						<label for="brand-edit-priority" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							অগ্রাধিকার ক্রম (Priority)
						</label>
						<input
							id="brand-edit-priority"
							type="number"
							name="priority"
							bind:value={priority}
							min="0"
							class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
						/>
					</div>

					<div>
						<label for="brand-edit-homeshow" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							হোমপেজে দেখাবে? (Featured)
						</label>
						<select
							id="brand-edit-homeshow"
							name="homeShow"
							bind:value={homeShow}
							class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
						>
							<option value="Yes">হ্যাঁ (Yes)</option>
							<option value="No">না (No)</option>
						</select>
					</div>

					<div>
						<label for="brand-edit-status" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							স্ট্যাটাস (Status)
						</label>
						<select
							id="brand-edit-status"
							name="status"
							bind:value={status}
							class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
						>
							<option value="publish">সক্রিয় (Publish)</option>
							<option value="draft">ড্রাফট (Draft)</option>
						</select>
					</div>
				</div>
			</div>
		</div>

		<!-- 2. Logo / Image Uploader (Direct R2 Upload, Drag & Drop, Gallery) -->
		<CatalogImageUploader bind:image={logo} name="logo" label="ব্র্যান্ড লোগো (Brand Logo)" folder="brands" />

		<!-- Submit Button -->
		<div class="flex items-center justify-end gap-3 pt-2">
			<a
				href="/admin/catalog/brands"
				class="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
			>
				বাতিল
			</a>
			<button
				type="submit"
				disabled={isSubmitting}
				class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
			>
				{#if isSubmitting}
					<Loader2 class="w-4 h-4 animate-spin" />
					<span>আপডেট হচ্ছে...</span>
				{:else}
					<Save class="w-4 h-4" />
					<span>পরিবর্তন সংরক্ষণ করুন</span>
				{/if}
			</button>
		</div>
	</form>
</div>

