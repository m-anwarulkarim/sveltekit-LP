<script lang="ts">
	import { ArrowLeft, Save, Loader2, Sparkles } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import CatalogImageUploader from '../../../_components/CatalogImageUploader.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isSubmitting = $state(false);
	let name = $state(data.category?.name || '');
	let categoryId = $state(data.category?.parentId || data.parentCategories?.[0]?.id || '');
	let priority = $state<number>(data.category?.sortOrder ?? 0);
	let status = $state<'publish' | 'draft'>(data.category?.isActive ? 'publish' : 'draft');
	let image = $state(data.category?.image || '');
</script>

<svelte:head>
	<title>সাব-ক্যাটাগরি সম্পাদনা | seedbd Admin</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 font-['Anek_Bangla',sans-serif]">
	<!-- Page Header -->
	<div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
		<div class="flex items-center gap-3">
			<a
				href="/admin/catalog/sub-categories"
				class="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
				title="তালিকায় ফিরে যান"
			>
				<ArrowLeft class="w-5 h-5" />
			</a>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-xl sm:text-2xl font-bold text-slate-800">সাব-ক্যাটাগরি সম্পাদনা</h1>
					<span class="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
						ID: {data.category?.id}
					</span>
				</div>
				<p class="text-xs sm:text-sm text-slate-500">সাব-ক্যাটাগরির তথ্য বা প্যারেন্ট ক্যাটাগরি পরিবর্তন করুন</p>
			</div>
		</div>

		<a
			href="/admin/catalog/sub-categories"
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
					toast.error((result.data as any)?.message || 'সাব-ক্যাটাগরি আপডেট করতে সমস্যা হয়েছে');
				} else {
					toast.success('সাব-ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!');
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
				<span>সাধারণ তথ্য ও প্যারেন্ট ক্যাটাগরি</span>
			</h2>

			<div class="space-y-4">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="sub-edit-name" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							সাব-ক্যাটাগরির নাম <span class="text-rose-500">*</span>
						</label>
						<input
							id="sub-edit-name"
							type="text"
							name="name"
							bind:value={name}
							required
							class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
						/>
					</div>

					<div>
						<label for="sub-edit-category" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							মূল ক্যাটাগরি (Parent Category) <span class="text-rose-500">*</span>
						</label>
						<select
							id="sub-edit-category"
							name="categoryId"
							bind:value={categoryId}
							required
							class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
						>
							{#each data.parentCategories as parent}
								<option value={parent.id}>{parent.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="sub-edit-priority" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							অগ্রাধিকার ক্রম (Priority)
						</label>
						<input
							id="sub-edit-priority"
							type="number"
							name="priority"
							bind:value={priority}
							min="0"
							class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
						/>
					</div>

					<div>
						<label for="sub-edit-status" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							স্ট্যাটাস (Status)
						</label>
						<select
							id="sub-edit-status"
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

		<!-- 2. Media / Image Uploader (Direct R2 Upload, Drag & Drop, Gallery) -->
		<CatalogImageUploader bind:image name="image" label="সাব-ক্যাটাগরি ছবি ও আইকন" folder="sub-categories" />

		<!-- Submit Button -->
		<div class="flex items-center justify-end gap-3 pt-2">
			<a
				href="/admin/catalog/sub-categories"
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

