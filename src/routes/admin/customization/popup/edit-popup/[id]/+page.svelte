<script lang="ts">
	import {
		ChevronLeft,
		Trash2,
		Camera,
		X,
		Check,
		Headphones,
		Loader2,
		Clock,
		Sparkles,
		MousePointerClick,
		AppWindow,
		ExternalLink,
		UploadCloud
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { uploadOptimizedImage } from '#lib/utils/image-optimizer';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Badge } from '#lib/components/ui/badge';
	import { Card, CardContent } from '#lib/components/ui/card';

	let { data }: { data?: any } = $props();

	const isNew = $derived(data?.popup?.id === 'new');
	let item = $derived(data?.popup || {});

	// Form field states
	let title = $state(data?.popup?.title || '');
	let targetUrl = $state(data?.popup?.targetUrl || '/catalog/all-product');
	let triggerType = $state<'delay_seconds' | 'on_load' | 'exit_intent'>(
		data?.popup?.triggerType || 'delay_seconds'
	);
	let delaySeconds = $state(data?.popup?.delaySeconds || 4);
	let status = $state(
		data?.popup?.status === 'active' || data?.popup?.status === 'PUBLISH' ? 'active' : 'inactive'
	);
	let currentImage = $state(data?.popup?.imageUrl || '/images/banners/banner-combo.svg');
	let isSaving = $state(false);

	let fileInputRef: HTMLInputElement | null = $state(null);

	function triggerUpload() {
		fileInputRef?.click();
	}

	async function handleFileSelected(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		target.value = '';

		try {
			const uploaded = await uploadOptimizedImage(file, 'popups', { maxDimension: 1200 });
			currentImage = uploaded.url;
			toast.success('ইমেজ আপলোড হয়েছে');
		} catch (err: any) {
			toast.error(err?.message || 'ছবি আপলোড ব্যর্থ হয়েছে');
		}
	}

	function removeImage() {
		currentImage = '';
		toast.info('ইমেজ সরানো হয়েছে');
	}
</script>

<svelte:head>
	<title>{isNew ? 'নতুন পপআপ তৈরি' : 'পপআপ আপডেট করুন'} - Customization - Haq Plus Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-['Anek_Bangla',sans-serif]">
	<!-- Top Sub-Header Bar -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<a
				href="/admin/customization/popup"
				class="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
				aria-label="Back to popups list"
			>
				<ChevronLeft class="w-5 h-5" />
			</a>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
					{isNew ? 'নতুন পপআপ তৈরি করুন' : 'পপআপ সেটিংস আপডেট করুন'}
				</h1>
				<p class="text-xs text-slate-500 mt-0.5">গ্রাহকদের জন্য আকর্ষণীয় অফার ও ডিসকাউন্ট পপআপ কনফিগার করুন</p>
			</div>
		</div>

		<div class="flex items-center gap-2 self-end sm:self-auto">
			<a
				href="https://wa.me/880156007230"
				target="_blank"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
			>
				<Headphones class="w-3.5 h-3.5 text-indigo-600" />
				<span>সাপোর্ট</span>
			</a>
		</div>
	</div>

	<!-- Form Form -->
	<form
		method="POST"
		action="?/updatePopup"
		use:enhance={() => {
			isSaving = true;
			return async ({ result, update }) => {
				isSaving = false;
				if (result.type === 'success') {
					toast.success(isNew ? 'নতুন পপআপ সফলভাবে তৈরি হয়েছে' : 'পপআপ সফলভাবে আপডেট হয়েছে');
				} else if (result.type === 'redirect') {
					toast.success('পপআপ সফলভাবে সংরক্ষিত হয়েছে');
				} else {
					toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
				}
				await update();
			};
		}}
		class="space-y-6"
	>
		<input type="hidden" name="imageUrl" value={currentImage} />
		<input type="hidden" name="triggerType" value={triggerType} />
		<input type="hidden" name="status" value={status} />

		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
			<!-- Left Column: Main Form Fields -->
			<div class="lg:col-span-8 space-y-6">
				<!-- Basic Info Card -->
				<Card class="rounded-3xl border-slate-200/90 shadow-xs overflow-hidden">
					<CardContent class="p-6 space-y-5">
						<div class="flex items-center gap-2 pb-3 border-b border-slate-100">
							<AppWindow class="w-4 h-4 text-indigo-600" />
							<h3 class="text-sm font-bold text-slate-900">মূল তথ্য ও টার্গেট</h3>
						</div>

						<!-- Popup Title -->
						<div class="space-y-1.5">
							<label for="popup-title" class="block text-xs font-bold text-slate-700">
								পপআপের নাম / হেডলাইন <span class="text-rose-500">*</span>
							</label>
							<Input
								id="popup-title"
								name="title"
								type="text"
								bind:value={title}
								required
								placeholder="যেমন: স্পেশাল উইকএন্ড সেল! ১০% ছাড় উপভোগ করুন"
								class="h-10 text-xs font-medium rounded-xl border-slate-200"
							/>
						</div>

						<!-- Target URL -->
						<div class="space-y-1.5">
							<label for="popup-url" class="block text-xs font-bold text-slate-700">
								টার্গেট রিডাইরেক্ট URL
							</label>
							<Input
								id="popup-url"
								name="targetUrl"
								type="text"
								bind:value={targetUrl}
								placeholder="/catalog/all-product"
								class="h-10 text-xs font-mono rounded-xl border-slate-200"
							/>
							<p class="text-[11px] text-slate-400">পপআপের বাটনে ক্লিক করলে গ্রাহক এই লিংকে যাবে</p>
						</div>

						<!-- Status Switch -->
						<div class="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">পাবলিশ স্ট্যাটাস</div>
								<div class="text-[11px] text-slate-500">
									{status === 'active' ? 'পপআপটি ওয়েবসাইটে সক্রিয়ভাবে দেখানো হবে' : 'পপআপটি আপাতত বন্ধ থাকবে'}
								</div>
							</div>
							<div class="flex items-center gap-2">
								<button
									type="button"
									onclick={() => (status = status === 'active' ? 'inactive' : 'active')}
									class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer {status === 'active' ? 'bg-indigo-600' : 'bg-slate-300'}"
								>
									<span
										class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {status === 'active' ? 'translate-x-6' : 'translate-x-1'}"
									></span>
								</button>
								<Badge variant={status === 'active' ? 'default' : 'secondary'} class="text-[10px] font-bold uppercase">
									{status === 'active' ? 'Active' : 'Draft'}
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Trigger Mechanism Card -->
				<Card class="rounded-3xl border-slate-200/90 shadow-xs overflow-hidden">
					<CardContent class="p-6 space-y-5">
						<div class="flex items-center gap-2 pb-3 border-b border-slate-100">
							<Clock class="w-4 h-4 text-indigo-600" />
							<h3 class="text-sm font-bold text-slate-900">ট্রিগার মেকানিজম (কখন পপআপ প্রদর্শিত হবে)</h3>
						</div>

						<!-- Trigger Selector Cards -->
						<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<button
								type="button"
								onclick={() => (triggerType = 'delay_seconds')}
								class="p-4 rounded-2xl border text-left transition-all cursor-pointer {triggerType === 'delay_seconds'
									? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
									: 'border-slate-200 hover:bg-slate-50'}"
							>
								<div class="flex items-center gap-2">
									<div class="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
										<Clock class="w-4 h-4" />
									</div>
									<span class="font-bold text-slate-900 text-xs">Time Delay</span>
								</div>
								<p class="text-[11px] text-slate-500 mt-2">নির্দিষ্ট সেকেন্ড পর পপআপ ভেসে উঠবে</p>
							</button>

							<button
								type="button"
								onclick={() => (triggerType = 'on_load')}
								class="p-4 rounded-2xl border text-left transition-all cursor-pointer {triggerType === 'on_load'
									? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
									: 'border-slate-200 hover:bg-slate-50'}"
							>
								<div class="flex items-center gap-2">
									<div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
										<Sparkles class="w-4 h-4" />
									</div>
									<span class="font-bold text-slate-900 text-xs">On Load</span>
								</div>
								<p class="text-[11px] text-slate-500 mt-2">পেজ লোড হওয়ার সাথে সাথেই দেখাবে</p>
							</button>

							<button
								type="button"
								onclick={() => (triggerType = 'exit_intent')}
								class="p-4 rounded-2xl border text-left transition-all cursor-pointer {triggerType === 'exit_intent'
									? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
									: 'border-slate-200 hover:bg-slate-50'}"
							>
								<div class="flex items-center gap-2">
									<div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
										<MousePointerClick class="w-4 h-4" />
									</div>
									<span class="font-bold text-slate-900 text-xs">Exit Intent</span>
								</div>
								<p class="text-[11px] text-slate-500 mt-2">ভিজিটর পেজ ছেড়ে বের হতে চাইলে</p>
							</button>
						</div>

						<!-- Delay Seconds Setting -->
						{#if triggerType === 'delay_seconds'}
							<div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
								<div>
									<div class="text-xs font-bold text-slate-800">কতো সেকেন্ড পর প্রদর্শিত হবে?</div>
									<div class="text-[11px] text-slate-500">ভিজিটর সাইটে প্রবেশের নির্দিষ্ট সময় পর দেখাবে</div>
								</div>
								<div class="flex items-center gap-2">
									<Input
										name="delaySeconds"
										type="number"
										min="1"
										max="60"
										bind:value={delaySeconds}
										class="w-20 h-9 text-center font-bold text-indigo-600 bg-white rounded-xl"
									/>
									<span class="text-xs font-bold text-slate-600">সেকেন্ড</span>
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>

				<!-- Image Upload Card -->
				<Card class="rounded-3xl border-slate-200/90 shadow-xs overflow-hidden">
					<CardContent class="p-6 space-y-4">
						<div class="flex items-center gap-2 pb-3 border-b border-slate-100">
							<Camera class="w-4 h-4 text-indigo-600" />
							<h3 class="text-sm font-bold text-slate-900">পপআপ ব্যানার ইমেজ</h3>
						</div>

						<input
							type="file"
							accept="image/*"
							bind:this={fileInputRef}
							onchange={handleFileSelected}
							class="hidden"
						/>

						<div class="space-y-3">
							<div class="flex gap-2">
								<Input
									type="text"
									bind:value={currentImage}
									placeholder="/images/banners/banner-combo.svg"
									class="h-10 text-xs font-mono rounded-xl border-slate-200 flex-1"
								/>
								<Button
									type="button"
									variant="outline"
									onclick={triggerUpload}
									class="h-10 rounded-xl px-4 gap-2 border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold"
								>
									<UploadCloud class="w-4 h-4 text-indigo-600" />
									<span>ইমেজ আপলোড</span>
								</Button>
							</div>

							<!-- Image Preview Box -->
							{#if currentImage}
								<div class="relative w-full h-44 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 group">
									<img src={currentImage} alt="Popup Preview" class="w-full h-full object-cover" />
									<button
										type="button"
										onclick={removeImage}
										class="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
										title="ইমেজ মুছুন"
									>
										<X class="w-4 h-4" />
									</button>
								</div>
							{/if}
						</div>
					</CardContent>
				</Card>
			</div>

			<!-- Right Column: Live Popup Preview & Quick Info -->
			<div class="lg:col-span-4 space-y-6">
				<!-- Live Preview -->
				<Card class="rounded-3xl border-slate-200/90 shadow-xs overflow-hidden">
					<CardContent class="p-5 space-y-4">
						<div class="flex items-center justify-between pb-3 border-b border-slate-100">
							<h4 class="text-xs font-bold text-slate-800">লাইভ ভিজিটর প্রিভিউ</h4>
							<Badge variant="outline" class="text-[10px] font-semibold text-indigo-600 border-indigo-200 bg-indigo-50">
								Live
							</Badge>
						</div>

						<div class="p-3 bg-slate-100 rounded-2xl border border-slate-200/70 flex items-center justify-center">
							<!-- Miniature Storefront Popup Window -->
							<div class="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden max-w-[260px] w-full text-center">
								<div class="relative h-28 bg-slate-200 overflow-hidden">
									{#if currentImage}
										<img src={currentImage} alt="Preview" class="w-full h-full object-cover" />
									{:else}
										<div class="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
											ইমেজ দেওয়া হয়নি
										</div>
									{/if}
									<div class="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-900/60 text-white flex items-center justify-center text-[9px]">
										✕
									</div>
								</div>
								<div class="p-3 space-y-2">
									<h5 class="font-black text-slate-900 text-xs line-clamp-2 leading-tight">
										{title || 'পপআপ অফার শিরোনাম'}
									</h5>
									<p class="text-[10px] text-slate-400 line-clamp-1">সীমিত সময়ের বিশেষ ছাড় উপভোগ করুন</p>
									<div class="h-7 bg-indigo-600 text-white rounded-xl text-[10px] font-bold flex items-center justify-center shadow-xs">
										অফারটি গ্রহণ করুন →
									</div>
								</div>
							</div>
						</div>

						<p class="text-[11px] text-slate-400 text-center">
							ওয়েবসাইটে ভিজিটর ঠিক এই মাপে ও ডিজাইনে অফারটি দেখতে পাবেন।
						</p>
					</CardContent>
				</Card>

				<!-- Summary Card -->
				<Card class="rounded-3xl border-slate-200/90 shadow-xs overflow-hidden bg-slate-50/50">
					<CardContent class="p-5 space-y-3 text-xs">
						<h4 class="font-bold text-slate-800">সংক্ষিপ্ত সেটিংস বিবরণ</h4>
						<div class="space-y-2 text-slate-600">
							<div class="flex justify-between">
								<span>ট্রিগার:</span>
								<strong class="text-slate-900">
									{triggerType === 'delay_seconds'
										? `${delaySeconds} সেকেন্ড ডিলে`
										: triggerType === 'exit_intent'
										? 'Exit Intent'
										: 'On Load'}
								</strong>
							</div>
							<div class="flex justify-between">
								<span>স্ট্যাটাস:</span>
								<strong class={status === 'active' ? 'text-emerald-600' : 'text-slate-500'}>
									{status === 'active' ? 'সক্রিয় (Active)' : 'বন্ধ (Draft)'}
								</strong>
							</div>
							<div class="flex justify-between">
								<span>টার্গেট:</span>
								<span class="font-mono text-[11px] text-indigo-600 truncate max-w-[140px]">{targetUrl}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>

		<!-- Bottom Action Bar (Fixed Sticky on Mobile) -->
		<div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
			<a
				href="/admin/customization/popup"
				class="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
			>
				বাতিল
			</a>
			<Button
				type="submit"
				disabled={isSaving}
				class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-6 text-xs font-bold shadow-sm"
			>
				{#if isSaving}
					<Loader2 class="w-4 h-4 animate-spin mr-2" />
					<span>সংরক্ষণ হচ্ছে...</span>
				{:else}
					<span>{isNew ? 'পপআপ তৈরি করুন' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
				{/if}
			</Button>
		</div>
	</form>
</div>

