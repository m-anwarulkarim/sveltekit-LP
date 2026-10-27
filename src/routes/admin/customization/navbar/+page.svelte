<script lang="ts">
	import {
		Button,
		Input,
		Card,
		CardContent,
		Switch,
		Badge,
		Alert,
		AlertDescription
	} from '#lib/components/ui';
	import {
		Save,
		CheckCircle2,
		Sparkles,
		Flame,
		Plus,
		Trash2,
		Eye,
		Globe,
		Search,
		Smartphone,
		Sliders
	} from 'lucide-svelte';

	// Header Settings State
	let isAnnouncementEnabled = $state(true);
	let announcementText = $state('🚚 ৳৬০০+ অর্ডার করলেই ডেলিভারি সম্পূর্ণ ফ্রি!');
	let brandName = $state('AURA');
	let brandTagline = $state('Next-Gen E-Commerce');
	let brandBadge = $state('ORIGINAL');
	let searchPlaceholder = $state('বীজ বা পছন্দের পণ্য খুঁজুন... (যেমন: oil, noodles, মরিচ)');
	let isLanguageSwitcherEnabled = $state(true);
	let defaultLanguage = $state<'bn' | 'en'>('bn');

	// Category Chips in Navigation
	let navCategoryChips = $state<string[]>([
		'সব',
		'ফুল',
		'শাক - সবজি',
		'করলা-সিম-বরবটি',
		'কম্বো প্যাক',
		'ফলমূল',
		'গার্ডেনিং টুলস',
		'অর্গানিক সার'
	]);
	let newChipInput = $state('');

	// Trending Search Tags
	let popularTags = $state<string[]>([
		'ruchi sauce',
		'chopstick instant noodles',
		'radhuni mustard oil',
		'হাইব্রিড মরিচ বীজ',
		'লাল শাক বীজ',
		'ভার্মিকম্পোস্ট সার'
	]);
	let newTagInput = $state('');

	let toastMessage = $state<string | null>(null);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			toastMessage = null;
		}, 3000);
	}

	function addCategoryChip() {
		if (!newChipInput.trim()) return;
		if (!navCategoryChips.includes(newChipInput.trim())) {
			navCategoryChips = [...navCategoryChips, newChipInput.trim()];
		}
		newChipInput = '';
		showToast('নতুন ক্যাটাগরি চিপ যোগ করা হয়েছে');
	}

	function removeCategoryChip(index: number) {
		navCategoryChips = navCategoryChips.filter((_, i) => i !== index);
	}

	function addPopularTag() {
		if (!newTagInput.trim()) return;
		if (!popularTags.includes(newTagInput.trim())) {
			popularTags = [...popularTags, newTagInput.trim()];
		}
		newTagInput = '';
		showToast('পপুলার সার্চ ট্যাগ যোগ করা হয়েছে');
	}

	function removePopularTag(index: number) {
		popularTags = popularTags.filter((_, i) => i !== index);
	}

	function handleSave() {
		showToast('হেডার ও ন্যাভবার কাস্টমাইজেশন সফলভাবে সংরক্ষিত হয়েছে!');
	}
</script>

<svelte:head>
	<title>Navbar & Header Customization | Admin</title>
</svelte:head>

<div class="space-y-6 max-w-6xl mx-auto pb-16 font-['Hind_Siliguri',sans-serif]">
	
	<!-- Header Banner -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200">
					Storefront Navigation
				</Badge>
				<span class="text-xs text-slate-500 font-medium">Header & Search Controls</span>
			</div>
			<h1 class="text-2xl font-black text-slate-900 tracking-tight">
				ন্যাভবার ও হেডার কাস্টমাইজেশন (Navbar Customization)
			</h1>
			<p class="text-xs text-slate-500 mt-0.5">
				গ্রাহকদের জন্য ওপরের অ্যানাউন্সমেন্ট বার, ব্র্যান্ড লোগো, সার্চ সাজেশন ও ক্যাটাগরি মেনু নিয়ন্ত্রণ করুন।
			</p>
		</div>

		<Button
			onclick={handleSave}
			class="bg-[#5845eb] hover:bg-[#4936d6] text-white gap-2 shadow-sm shadow-indigo-600/30 rounded-xl px-5 h-11"
		>
			<Save class="w-4 h-4" />
			<span>পরিবর্তন সংরক্ষণ করুন</span>
		</Button>
	</div>

	<!-- Toast Message -->
	{#if toastMessage}
		<Alert class="bg-emerald-50 border-emerald-200 text-emerald-800 animate-in fade-in slide-in-from-top-2">
			<CheckCircle2 class="w-4 h-4 text-emerald-600" />
			<AlertDescription class="font-bold text-xs">
				{toastMessage}
			</AlertDescription>
		</Alert>
	{/if}

	<!-- Live Visual Preview of Header -->
	<Card class="border-slate-200/90 shadow-2xs overflow-hidden">
		<div class="p-4 bg-slate-50 border-b border-slate-200/90 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Eye class="w-4 h-4 text-[#5845eb]" />
				<span class="text-xs font-bold text-slate-800">লাইভ প্রিভিউ (Live Header Preview)</span>
			</div>
			<span class="text-[11px] text-slate-500 font-medium">ডেস্কটপ ভিউ</span>
		</div>
		<CardContent class="p-0">
			<!-- Mini Mock Header Preview -->
			<div class="bg-white border-b border-slate-100">
				<!-- Top Bar -->
				{#if isAnnouncementEnabled}
					<div class="bg-gradient-to-r from-[#4936d6] via-[#5845eb] to-[#7c3aed] text-white text-xs font-bold py-1.5 px-4 text-center">
						{announcementText}
					</div>
				{/if}

				<!-- Middle Bar -->
				<div class="px-6 py-3 flex items-center justify-between gap-4">
					<div class="flex items-center gap-2">
						<div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5845eb] to-[#9333ea] flex items-center justify-center text-white">
							<Flame class="w-4 h-4" />
						</div>
						<div class="flex flex-col">
							<div class="flex items-center gap-1">
								<span class="font-black text-sm text-slate-900">{brandName}</span>
								{#if brandBadge}
									<span class="text-[8px] font-black bg-indigo-50 text-[#5845eb] px-1 py-0.2 rounded border border-indigo-200">
										{brandBadge}
									</span>
								{/if}
							</div>
							<span class="text-[9.5px] text-slate-400 font-medium">{brandTagline}</span>
						</div>
					</div>

					<div class="flex-1 max-w-md mx-4">
						<div class="relative w-full">
							<div class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs text-slate-400 flex items-center justify-between">
								<span class="truncate">{searchPlaceholder}</span>
								<div class="w-6 h-6 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center">
									<Search class="w-3 h-3 stroke-[2.5]" />
								</div>
							</div>
						</div>
					</div>

					<div class="flex items-center gap-3">
						{#if isLanguageSwitcherEnabled}
							<div class="px-2.5 py-1 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1">
								<Globe class="w-3 h-3 text-[#5845eb]" />
								<span>{defaultLanguage.toUpperCase()}</span>
							</div>
						{/if}
						<div class="px-3 py-1 rounded-full bg-pink-50 text-pink-600 border border-pink-200 text-xs font-bold">
							কার্ট (০)
						</div>
					</div>
				</div>

				<!-- Category Chips Bar -->
				<div class="px-6 py-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
					{#each navCategoryChips.slice(0, 6) as chip}
						<span class="px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 font-medium whitespace-nowrap">
							{chip}
						</span>
					{/each}
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Settings Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		
		<!-- 1. Announcement Bar Settings -->
		<Card class="border-slate-200/90 shadow-2xs">
			<CardContent class="p-6 space-y-4">
				<div class="flex items-center justify-between pb-3 border-b border-slate-100">
					<div class="flex items-center gap-2">
						<Sparkles class="w-4 h-4 text-[#5845eb]" />
						<h3 class="text-base font-extrabold text-slate-900">অ্যানাউন্সমেন্ট বার (Announcement Bar)</h3>
					</div>
					<Switch bind:checked={isAnnouncementEnabled} />
				</div>

				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700" for="ann-text">
						অ্যানাউন্সমেন্ট টেক্সট / অফার মেসেজ
					</label>
					<Input
						id="ann-text"
						bind:value={announcementText}
						disabled={!isAnnouncementEnabled}
						placeholder="যেমন: 🚚 ৳৬০০+ অর্ডার করলেই ডেলিভারি সম্পূর্ণ ফ্রি!"
						class="rounded-xl h-10 text-xs"
					/>
				</div>
			</CardContent>
		</Card>

		<!-- 2. Brand Identity in Navbar -->
		<Card class="border-slate-200/90 shadow-2xs">
			<CardContent class="p-6 space-y-4">
				<div class="flex items-center gap-2 pb-3 border-b border-slate-100">
					<Flame class="w-4 h-4 text-[#5845eb]" />
					<h3 class="text-base font-extrabold text-slate-900">ব্র্যান্ড পরিচিতি (Brand Identity)</h3>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700" for="b-name">শপ নাম</label>
						<Input id="b-name" bind:value={brandName} class="rounded-xl h-10 text-xs" />
					</div>
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700" for="b-badge">ব্যাজ টেক্সট</label>
						<Input id="b-badge" bind:value={brandBadge} class="rounded-xl h-10 text-xs" />
					</div>
				</div>

				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700" for="b-tag">ট্যাগলাইন</label>
					<Input id="b-tag" bind:value={brandTagline} class="rounded-xl h-10 text-xs" />
				</div>
			</CardContent>
		</Card>

		<!-- 3. Search Bar & Trending Keywords -->
		<Card class="border-slate-200/90 shadow-2xs">
			<CardContent class="p-6 space-y-4">
				<div class="flex items-center gap-2 pb-3 border-b border-slate-100">
					<Search class="w-4 h-4 text-[#5845eb]" />
					<h3 class="text-base font-extrabold text-slate-900">সার্চবার ও ড্রপডাউন সাজেশন (Search Settings)</h3>
				</div>

				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700" for="s-place">সার্চ প্লেসহোল্ডার টেক্সট</label>
					<Input id="s-place" bind:value={searchPlaceholder} class="rounded-xl h-10 text-xs" />
				</div>

				<!-- Popular Tags -->
				<div class="space-y-2 pt-2">
					<label class="text-xs font-bold text-slate-700">পপুলার সার্চ সাজেশন কি-ওয়ার্ডস (Popular Right Now)</label>
					<div class="flex items-center gap-2">
						<Input
							bind:value={newTagInput}
							placeholder="নতুন কি-ওয়ার্ড (যেমন: radhuni sunflower oil)..."
							class="rounded-xl h-9 text-xs"
							onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addPopularTag())}
						/>
						<Button size="sm" onclick={addPopularTag} class="bg-[#5845eb] text-white rounded-xl h-9">
							<Plus class="w-3.5 h-3.5 mr-1" />
							যোগ করুন
						</Button>
					</div>

					<div class="flex flex-wrap gap-1.5 pt-2">
						{#each popularTags as tag, index}
							<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
								<span>{tag}</span>
								<button
									type="button"
									onclick={() => removePopularTag(index)}
									class="text-slate-400 hover:text-rose-500 cursor-pointer"
								>
									<Trash2 class="w-3 h-3" />
								</button>
							</div>
						{/each}
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- 4. Navigation Category Chips -->
		<Card class="border-slate-200/90 shadow-2xs">
			<CardContent class="p-6 space-y-4">
				<div class="flex items-center gap-2 pb-3 border-b border-slate-100">
					<Sliders class="w-4 h-4 text-[#5845eb]" />
					<h3 class="text-base font-extrabold text-slate-900">ন্যাভবার ক্যাটাগরি চিপস (Category Chips)</h3>
				</div>

				<div class="flex items-center gap-2">
					<Input
						bind:value={newChipInput}
						placeholder="নতুন ক্যাটাগরি নাম..."
						class="rounded-xl h-9 text-xs"
						onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategoryChip())}
					/>
					<Button size="sm" onclick={addCategoryChip} class="bg-[#5845eb] text-white rounded-xl h-9">
						<Plus class="w-3.5 h-3.5 mr-1" />
						যোগ
					</Button>
				</div>

				<div class="flex flex-wrap gap-2 pt-2">
					{#each navCategoryChips as chip, index}
						<div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-medium text-[#5845eb]">
							<span>{chip}</span>
							{#if chip !== 'সব'}
								<button
									type="button"
									onclick={() => removeCategoryChip(index)}
									class="text-indigo-400 hover:text-rose-500 cursor-pointer"
								>
									<Trash2 class="w-3 h-3" />
								</button>
							{/if}
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>

	</div>
</div>
