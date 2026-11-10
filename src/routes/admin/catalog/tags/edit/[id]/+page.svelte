<script lang="ts">
	import { ArrowLeft, Save, Loader2, Tag } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isSubmitting = $state(false);
	let name = $state(data.tag?.name || '');
	let priority = $state(data.tag?.priority || '-');
	let homeShow = $state<'Yes' | 'No'>(data.tag?.homeShow === 'Yes' ? 'Yes' : 'No');
	let status = $state<'publish' | 'draft'>(data.tag?.isActive ? 'publish' : 'draft');
</script>

<svelte:head>
	<title>ট্যাগ সম্পাদনা | Haq Plus Admin</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 font-['Anek_Bangla',sans-serif]">
	<!-- Page Header -->
	<div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
		<div class="flex items-center gap-3">
			<a
				href="/admin/catalog/tags"
				class="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
				title="তালিকায় ফিরে যান"
			>
				<ArrowLeft class="w-5 h-5" />
			</a>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-xl sm:text-2xl font-bold text-slate-800">ট্যাগ সম্পাদনা</h1>
					<span class="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
						ID: {data.tag?.id}
					</span>
				</div>
				<p class="text-xs sm:text-sm text-slate-500">ট্যাগের নাম, অগ্রাধিকার বা হোমপেজ ডিসপ্লে পরিবর্তন করুন</p>
			</div>
		</div>

		<a
			href="/admin/catalog/tags"
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
					toast.error((result.data as any)?.message || 'ট্যাগ আপডেট করতে সমস্যা হয়েছে');
				} else {
					toast.success('ট্যাগ সফলভাবে আপডেট করা হয়েছে!');
				}
				await update();
			};
		}}
		class="space-y-6"
	>
		<!-- 1. General Info Card -->
		<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
			<h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
				<Tag class="w-4 h-4 text-indigo-600" />
				<span>ট্যাগ তথ্য (Tag Details)</span>
			</h2>

			<div class="space-y-4">
				<div>
					<label for="tag-edit-name" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
						ট্যাগের নাম <span class="text-rose-500">*</span>
					</label>
					<input
						id="tag-edit-name"
						type="text"
						name="name"
						bind:value={name}
						required
						class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
					/>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div>
						<label for="tag-edit-priority" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							অগ্রাধিকার (Priority)
						</label>
						<input
							id="tag-edit-priority"
							type="text"
							name="priority"
							bind:value={priority}
							placeholder="যেমন: 1, 11, -"
							class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
						/>
					</div>

					<div>
						<label for="tag-edit-homeshow" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							হোমপেজে শো করবে?
						</label>
						<select
							id="tag-edit-homeshow"
							name="homeShow"
							bind:value={homeShow}
							class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
						>
							<option value="Yes">Yes (হ্যাঁ)</option>
							<option value="No">No (না)</option>
						</select>
					</div>

					<div>
						<label for="tag-edit-status" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							স্ট্যাটাস (Status)
						</label>
						<select
							id="tag-edit-status"
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

		<!-- Submit Button -->
		<div class="flex items-center justify-end gap-3 pt-2">
			<a
				href="/admin/catalog/tags"
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

