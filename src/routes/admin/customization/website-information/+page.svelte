<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Button,
		Input,
		Textarea,
		Alert,
		AlertDescription
	} from '#lib/components/ui';
	import {
		Upload,
		Plus,
		Trash2,
		CheckCircle2,
		Save,
		Image as ImageIcon,
		X,
		RefreshCw
	} from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';
	import { toast } from 'svelte-sonner';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Initialize states from loaded data
	let websiteName = $state(data.websiteInfo?.websiteName || 'thecolorlighthouse');
	let shortDescription = $state(data.websiteInfo?.shortDescription || '');
	let whatsappNumber = $state(data.websiteInfo?.whatsappNumber || '');

	let addresses = $state<string[]>(
		data.websiteInfo?.addresses?.length ? [...data.websiteInfo.addresses] : ['Nawabpur Kaptan Bazar Complex Dhaka, Bangladesh']
	);

	let emails = $state<string[]>(
		data.websiteInfo?.emails?.length ? [...data.websiteInfo.emails] : ['support@thecolorlighthouse.com']
	);

	let logoUrl = $state(data.websiteInfo?.logoUrl || '/images/products/window-sticker.svg');
	let faviconUrl = $state(data.websiteInfo?.faviconUrl || '/images/products/window-sticker.svg');

	// File input references & preview states
	let logoFileInput: HTMLInputElement | undefined = $state();
	let faviconFileInput: HTMLInputElement | undefined = $state();
	let logoPreview = $state<string | null>(null);
	let faviconPreview = $state<string | null>(null);
	let isSaving = $state(false);

	// Sync when server data changes
	$effect(() => {
		if (data.websiteInfo) {
			websiteName = data.websiteInfo.websiteName || websiteName;
			shortDescription = data.websiteInfo.shortDescription || shortDescription;
			whatsappNumber = data.websiteInfo.whatsappNumber || whatsappNumber;
			if (data.websiteInfo.addresses?.length) {
				addresses = [...data.websiteInfo.addresses];
			}
			if (data.websiteInfo.emails?.length) {
				emails = [...data.websiteInfo.emails];
			}
			if (data.websiteInfo.logoUrl) {
				logoUrl = data.websiteInfo.logoUrl;
			}
			if (data.websiteInfo.faviconUrl) {
				faviconUrl = data.websiteInfo.faviconUrl;
			}
		}
	});

	// Toast feedback from action results
	$effect(() => {
		if (form?.message) {
			if (form.success) {
				toast.success(form.message);
			} else {
				toast.error(form.message);
			}
		}
	});

	function handleLogoChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			if (!file.type.startsWith('image/')) {
				toast.error('অনুগ্রহ করে শুধুমাত্র ইমেজ ফাইল সিলেক্ট করুন');
				return;
			}
			const reader = new FileReader();
			reader.onload = (ev) => {
				logoPreview = ev.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function clearLogo() {
		logoPreview = null;
		logoUrl = '';
		if (logoFileInput) logoFileInput.value = '';
	}

	function handleFaviconChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			if (!file.type.startsWith('image/') && !file.name.endsWith('.ico')) {
				toast.error('অনুগ্রহ করে বৈধ ইমেজ বা .ico ফাইল সিলেক্ট করুন');
				return;
			}
			const reader = new FileReader();
			reader.onload = (ev) => {
				faviconPreview = ev.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function clearFavicon() {
		faviconPreview = null;
		faviconUrl = '';
		if (faviconFileInput) faviconFileInput.value = '';
	}

	function addAddress() {
		addresses = [...addresses, ''];
	}

	function removeAddress(index: number) {
		if (addresses.length <= 1) {
			addresses = [''];
			return;
		}
		addresses = addresses.filter((_, i) => i !== index);
	}

	function addEmail() {
		emails = [...emails, ''];
	}

	function removeEmail(index: number) {
		if (emails.length <= 1) {
			emails = [''];
			return;
		}
		emails = emails.filter((_, i) => i !== index);
	}
</script>

<svelte:head>
	<title>Website Information - Customization - AURA Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-8 font-sans">
	<!-- Page Centered Heading -->
	<div class="text-center">
		<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-['Outfit']">
			Website Information
		</h2>
		<p class="text-xs sm:text-sm text-slate-500 mt-1">
			ওয়েবসাইটের নাম, লোগো, ফেভিকন, সাপোর্ট হোয়াটসঅ্যাপ ও যোগাযোগের তথ্য কাস্টমাইজ করুন
		</p>
	</div>

	<form
		method="POST"
		action="?/saveWebsiteInfo"
		enctype="multipart/form-data"
		use:enhance={() => {
			isSaving = true;
			return async ({ result, update }) => {
				isSaving = false;
				if (result.type === 'success' && (result.data as any)?.message) {
					toast.success((result.data as any).message);
				} else if (result.type === 'failure' && (result.data as any)?.message) {
					toast.error((result.data as any).message);
				}
				await update({ reset: false });
			};
		}}
		class="space-y-8"
	>
		<!-- Hidden URL inputs & JSON collections -->
		<input type="hidden" name="logoUrl" value={logoUrl} />
		<input type="hidden" name="faviconUrl" value={faviconUrl} />
		<input type="hidden" name="addresses" value={JSON.stringify(addresses.filter((a) => a && a.trim().length > 0))} />
		<input type="hidden" name="emails" value={JSON.stringify(emails.filter((e) => e && e.trim().length > 0))} />

		<!-- 1. Logo Section -->
		<div class="flex flex-col items-center justify-center space-y-3">
			<input
				type="file"
				name="logoFile"
				accept="image/*"
				bind:this={logoFileInput}
				onchange={handleLogoChange}
				class="hidden"
			/>

			<div class="relative group">
				<button
					type="button"
					onclick={() => logoFileInput?.click()}
					class="w-48 h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-3 flex flex-col items-center justify-center shadow-2xs hover:border-[#5845eb] transition-all cursor-pointer overflow-hidden group"
					title="লোগো আপলোড বা পরিবর্তন করতে ক্লিক করুন"
				>
					{#if logoPreview || logoUrl}
						<img
							src={logoPreview || logoUrl}
							alt="Website Logo Preview"
							class="max-w-full max-h-full object-contain"
						/>
					{:else}
						<div class="flex flex-col items-center justify-center text-center text-slate-400">
							<Upload class="w-6 h-6 mb-1 text-slate-400 group-hover:text-[#5845eb] transition-colors" />
							<span class="text-xs font-bold text-slate-600">লোগো আপলোড করুন</span>
							<span class="text-[10px] text-slate-400 mt-0.5">ক্লিক করুন</span>
						</div>
					{/if}
				</button>

				{#if logoPreview || logoUrl}
					<button
						type="button"
						onclick={clearLogo}
						class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
						title="লোগো মুছে ফেলুন"
					>
						<X class="w-3.5 h-3.5" />
					</button>
				{/if}
			</div>

			<!-- Logo dimension guideline -->
			<div class="w-full max-w-xl">
				<Alert class="bg-emerald-50/80 border-emerald-200 text-emerald-800 text-center py-2 px-4 rounded-xl">
					<AlertDescription class="text-[11px] sm:text-xs font-semibold text-emerald-800">
						The website logo should be horizontal, recommended: (256x56px) PNG/SVG/WEBP
					</AlertDescription>
				</Alert>
			</div>
		</div>

		<!-- 2. Favicon Section -->
		<div class="flex flex-col items-center justify-center space-y-3">
			<input
				type="file"
				name="faviconFile"
				accept="image/*,.ico,.png"
				bind:this={faviconFileInput}
				onchange={handleFaviconChange}
				class="hidden"
			/>

			<div class="relative group">
				<button
					type="button"
					onclick={() => faviconFileInput?.click()}
					class="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-3 flex flex-col items-center justify-center shadow-2xs hover:border-[#5845eb] transition-all cursor-pointer overflow-hidden group"
					title="ফেভিকন আইকন আপলোড বা পরিবর্তন করতে ক্লিক করুন"
				>
					{#if faviconPreview || faviconUrl}
						<img
							src={faviconPreview || faviconUrl}
							alt="Favicon Preview"
							class="w-10 h-10 object-contain rounded-lg"
						/>
					{:else}
						<div class="flex flex-col items-center justify-center text-center text-slate-400">
							<ImageIcon class="w-5 h-5 mb-1 text-slate-400 group-hover:text-[#5845eb] transition-colors" />
							<span class="text-[11px] font-bold text-slate-600">ফেভিকন</span>
						</div>
					{/if}
				</button>

				{#if faviconPreview || faviconUrl}
					<button
						type="button"
						onclick={clearFavicon}
						class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
						title="ফেভিকন মুছে ফেলুন"
					>
						<X class="w-3.5 h-3.5" />
					</button>
				{/if}
			</div>

			<!-- Favicon dimension guideline -->
			<div class="w-full max-w-xl">
				<Alert class="bg-emerald-50/80 border-emerald-200 text-emerald-800 text-center py-2 px-4 rounded-xl">
					<AlertDescription class="text-[11px] sm:text-xs font-semibold text-emerald-800">
						A small icon displayed in the browser tab, typically sized at 32x32 pixels.
					</AlertDescription>
				</Alert>
			</div>
		</div>

		<!-- 3. Form Input Fields using shadcn components -->
		<div class="space-y-5 max-w-2xl mx-auto">
			<!-- Website Name -->
			<div class="space-y-1.5">
				<label for="site-name" class="block text-xs font-bold text-slate-700">
					Website Name *
				</label>
				<Input
					id="site-name"
					name="websiteName"
					type="text"
					bind:value={websiteName}
					required
					placeholder="যেমন: AURA E-Commerce"
					class="rounded-xl h-11 text-sm font-semibold focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
				/>
			</div>

			<!-- Short Description -->
			<div class="space-y-1.5">
				<label for="site-desc" class="block text-xs font-bold text-slate-700">
					Short Description
				</label>
				<Input
					id="site-desc"
					name="shortDescription"
					type="text"
					bind:value={shortDescription}
					placeholder="ওয়েবসাইটের সংক্ষিপ্ত স্লোগান বা বিবরণ..."
					class="rounded-xl h-11 text-sm font-normal focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
				/>
			</div>

			<!-- Whatsapp Number -->
			<div class="space-y-1.5">
				<label for="whatsapp" class="block text-xs font-bold text-slate-700">
					Whatsapp Number (কাস্টমার সাপোর্টের জন্য)
				</label>
				<Input
					id="whatsapp"
					name="whatsappNumber"
					type="text"
					bind:value={whatsappNumber}
					placeholder="+8801XXXXXXXXX"
					class="rounded-xl h-11 text-sm font-mono font-semibold focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
				/>
			</div>

			<!-- Addresses Section using shadcn Button & Textarea -->
			<div class="space-y-3 pt-2">
				<div class="flex items-center justify-between">
					<span class="text-xs font-bold text-slate-700">দোকান / অফিসের ঠিকানা</span>
					<Button
						type="button"
						onclick={addAddress}
						size="sm"
						class="rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white px-3 py-1.5 text-xs font-bold gap-1 shadow-xs cursor-pointer"
					>
						<Plus class="w-3.5 h-3.5" />
						<span>নতুন ঠিকানা যোগ করুন</span>
					</Button>
				</div>

				{#each addresses as _, index}
					<div class="flex items-start gap-3">
						<div class="flex-1 space-y-1">
							<label for="address-{index}" class="block text-[11px] font-medium text-slate-500">
								ঠিকানা {index + 1} *
							</label>
							<Textarea
								id="address-{index}"
								bind:value={addresses[index]}
								rows={2}
								placeholder="হাউজ, রোড, এলাকা, শহর..."
								class="rounded-xl p-3 text-xs sm:text-sm font-medium focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
							/>
						</div>

						<button
							type="button"
							onclick={() => removeAddress(index)}
							class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors flex items-center justify-center shrink-0 mt-5 border border-rose-200 cursor-pointer"
							title="এই ঠিকানা মুছে ফেলুন"
						>
							<Trash2 class="w-4 h-4" />
						</button>
					</div>
				{/each}
			</div>

			<!-- Email Section using shadcn Button & Input -->
			<div class="space-y-3 pt-2">
				<div class="flex items-center justify-between">
					<span class="text-xs font-bold text-slate-700">অফিসিয়াল সাপোর্ট ইমেইল</span>
					<Button
						type="button"
						onclick={addEmail}
						size="sm"
						class="rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white px-3 py-1.5 text-xs font-bold gap-1 shadow-xs cursor-pointer"
					>
						<Plus class="w-3.5 h-3.5" />
						<span>নতুন ইমেইল যোগ করুন</span>
					</Button>
				</div>

				{#each emails as _, index}
					<div class="flex items-start gap-3">
						<div class="flex-1 space-y-1">
							<label for="email-{index}" class="block text-[11px] font-medium text-slate-500">
								ইমেইল {index + 1} *
							</label>
							<Input
								id="email-{index}"
								type="email"
								bind:value={emails[index]}
								placeholder="support@domain.com"
								class="rounded-xl h-11 text-xs sm:text-sm font-mono font-medium focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
							/>
						</div>

						<button
							type="button"
							onclick={() => removeEmail(index)}
							class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors flex items-center justify-center shrink-0 mt-5 border border-rose-200 cursor-pointer"
							title="এই ইমেইল মুছে ফেলুন"
						>
							<Trash2 class="w-4 h-4" />
						</button>
					</div>
				{/each}
			</div>

			<!-- Save Button using shadcn Button with loading spinner -->
			<div class="pt-6 text-center">
				<Button
					type="submit"
					size="lg"
					disabled={isSaving}
					class="rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white px-8 py-3 text-sm font-bold shadow-md shadow-indigo-500/25 gap-2 cursor-pointer disabled:opacity-60"
				>
					{#if isSaving}
						<RefreshCw class="w-4 h-4 animate-spin" />
						<span>সংরক্ষণ হচ্ছে...</span>
					{:else}
						<Save class="w-4 h-4" />
						<span>Save Information</span>
					{/if}
				</Button>
			</div>
		</div>
	</form>
</div>
