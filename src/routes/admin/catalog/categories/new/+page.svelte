<script lang="ts">
	import { ArrowLeft, Save, Loader2, Sparkles } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import CatalogImageUploader from '../../_components/CatalogImageUploader.svelte';

	let isSubmitting = $state(false);
	let name = $state('');
	let priority = $state<number>(0);
	let status = $state<'publish' | 'draft'>('publish');
	let image = $state('');
</script>

<svelte:head>
	<title>নতুন ক্যাটাগরি তৈরি | seedbd Admin</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 font-['Anek_Bangla',sans-serif]">
	<!-- Page Header -->
	<div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
		<div class="flex items-center gap-3">
			<a
				href="/admin/catalog/categories"
				class="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
				title="তালিকায় ফিরে যান"
			>
				<ArrowLeft class="w-5 h-5" />
			</a>
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-slate-800">নতুন ক্যাটাগরি যুক্ত করুন</h1>
				<p class="text-xs sm:text-sm text-slate-500">আপনার শপের প্রধান ক্যাটালগ ক্যাটাগরি তৈরি করুন</p>
			</div>
		</div>

		<a
			href="/admin/catalog/categories"
			class="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
		>
			বাতিল
		</a>
	</div>

	<!-- Category Creation Form -->
	<form
		method="POST"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result, update }) => {
				isSubmitting = false;
				if (result.type === 'failure') {
					toast.error((result.data as any)?.message || 'ক্যাটাগরি তৈরি করতে সমস্যা হয়েছে');
				} else {
					toast.success('ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে!');
				}
				await update();
			};
		}}
		class="space-y-6"
	>
		<!-- 1. General Information Card -->
		<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
			<h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
				<Sparkles class="w-4 h-4 text-indigo-600" />
				<span>সাধারণ তথ্য (General Information)</span>
			</h2>

			<div class="space-y-4">
				<div>
					<label for="cat-name" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
						ক্যাটাগরির নাম <span class="text-rose-500">*</span>
					</label>
					<input
						id="cat-name"
						type="text"
						name="name"
						bind:value={name}
						placeholder="যেমন: Electronics & Audio"
						required
						class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
					/>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="cat-priority" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							অগ্রাধিকার ক্রম (Priority)
						</label>
						<input
							id="cat-priority"
							type="number"
							name="priority"
							bind:value={priority}
							min="0"
							class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
						/>
						<p class="text-[11px] text-slate-400 mt-1">হোমপেজে আগে দেখানোর জন্য কম সংখ্যা (যেমন: 1, 2) দিন।</p>
					</div>

					<div>
						<label for="cat-status" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
							স্ট্যাটাস (Status)
						</label>
						<select
							id="cat-status"
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
		<CatalogImageUploader bind:image name="image" label="ক্যাটাগরি ছবি ও আইকন" folder="categories" />

		<!-- Submit Button -->
		<div class="flex items-center justify-end gap-3 pt-2">
			<a
				href="/admin/catalog/categories"
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
					<span>সংরক্ষণ হচ্ছে...</span>
				{:else}
					<Save class="w-4 h-4" />
					<span>ক্যাটাগরি সেভ করুন</span>
				{/if}
			</button>
		</div>
	</form>
</div>

