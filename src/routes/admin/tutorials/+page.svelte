<script lang="ts">
	import { Button, Input, Card, Badge } from '#lib/components/ui';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import {
		Play,
		Search,
		X,
		ExternalLink,
		Video,
		Sparkles,
		Clock,
		Tag,
		Share2,
		Plus,
		Trash2,
		Headphones,
		CheckCircle2,
		Loader2,
		ChevronLeft,
		ChevronRight,
		Film
	} from 'lucide-svelte';
	import type { TutorialItem } from '#lib/server/services/tutorial.service';

	let { data }: { data: any } = $props();

	// Reactive list of tutorials from server
	let tutorials = $state<TutorialItem[]>(data?.tutorials || []);

	$effect(() => {
		if (data?.tutorials) {
			tutorials = data.tutorials;
		}
	});

	// Active Video for the Inline Cinema Player (Default to the first video)
	let activeVideo = $state<TutorialItem>(
		(data?.tutorials && data.tutorials[0]) || {
			id: 'tut-haqplus-landing-page',
			title: 'এক ক্লিকেই তৈরি করুন আনলিমিটেড ল্যান্ডিং পেজ ! Haq Plus IT',
			youtubeId: 'KJNk1obp8PE',
			thumbnail: 'https://img.youtube.com/vi/KJNk1obp8PE/hqdefault.jpg',
			duration: '০৫:৪০ মিনিট',
			category: 'Landing Page',
			tags: ['Haq Plus IT', 'Landing Page', 'Unlimited Pages', 'Tutorial'],
			description: 'প্রতিটি নতুন প্রোডাক্টের জন্য আলাদা করে ডেভেলপার খোঁজার দিন শেষ! এবার Haq Plus IT-এর স্মার্ট ড্যাশবোর্ড থেকেই মাত্র ১ ক্লিকে তৈরি করুন যত খুশি ল্যান্ডিং পেজ।'
		}
	);

	// Filtering state
	let searchQuery = $state('');
	let selectedCategory = $state<string>('All');
	let activeTag = $state<string | null>(null);

	// Inline "Add Video" panel toggle (No pop-up!)
	let isAddFormOpen = $state(false);
	let isSubmitting = $state(false);
	let newYoutubeUrl = $state('');
	let newTitle = $state('');
	let newCategory = $state('Landing Page');
	let newDuration = $state('০৫:০০ মিনিট');
	let newTags = $state('');

	const CATEGORIES = [
		{ id: 'All', label: 'সবগুলো (All)' },
		{ id: 'Landing Page', label: 'ল্যান্ডিং পেজ (Landing Page)' },
		{ id: 'Getting Started', label: 'শুরু করার গাইড (Getting Started)' },
		{ id: 'Marketing & Pixel', label: 'মার্কেটিং ও পিক্সেল (Marketing & Pixel)' },
		{ id: 'Orders & Courier', label: 'অর্ডার ও কুরিয়ার (Orders & Courier)' },
		{ id: 'Design & Customization', label: 'ডিজাইন ও সেটিংস (Design)' }
	];

	// Filtered Videos computation
	let filteredTutorials = $derived(
		tutorials.filter((tut) => {
			const query = searchQuery.toLowerCase().trim();
			const matchesSearch =
				query === '' ||
				tut.title.toLowerCase().includes(query) ||
				(tut.category && tut.category.toLowerCase().includes(query)) ||
				(tut.tags && tut.tags.some((t) => t.toLowerCase().includes(query)));

			const matchesCategory =
				selectedCategory === 'All' || tut.category === selectedCategory;

			const matchesTag = activeTag === null || (tut.tags && tut.tags.includes(activeTag));

			return matchesSearch && matchesCategory && matchesTag;
		})
	);

	// Play video in top Cinema Player (Scroll to top smoothly)
	function selectVideo(tut: TutorialItem) {
		activeVideo = tut;
		const playerEl = document.getElementById('cinema-player');
		if (playerEl) {
			const yOffset = -90;
			const y = playerEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
			window.scrollTo({ top: y, behavior: 'smooth' });
		}
	}

	// Copy Video URL to Clipboard with Toast Feedback
	function shareVideo(tut: TutorialItem) {
		const url = `https://www.youtube.com/watch?v=${tut.youtubeId}`;
		navigator.clipboard.writeText(url);
		toast.success('ইউটিউব ভিডিও লিংক কপি করা হয়েছে!');
	}

	// Navigate to Next/Previous Video in the List
	function playNextVideo() {
		const currentIndex = tutorials.findIndex((t) => t.id === activeVideo.id);
		if (currentIndex !== -1 && currentIndex < tutorials.length - 1) {
			selectVideo(tutorials[currentIndex + 1]);
		} else if (tutorials.length > 0) {
			selectVideo(tutorials[0]);
		}
	}

	function playPrevVideo() {
		const currentIndex = tutorials.findIndex((t) => t.id === activeVideo.id);
		if (currentIndex > 0) {
			selectVideo(tutorials[currentIndex - 1]);
		} else if (tutorials.length > 0) {
			selectVideo(tutorials[tutorials.length - 1]);
		}
	}
</script>

<svelte:head>
	<title>ভিডিও টিউটোরিয়াল ও গাইড | seedbd Tutorials</title>
</svelte:head>

<div class="space-y-7 max-w-7xl mx-auto font-['Anek_Bangla',sans-serif]">
	
	<!-- Top Sub-Header Bar (Matching Admin Standard) -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1 border-b border-slate-100">
		<div>
			<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
				<div class="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
					<Film class="w-5 h-5" />
				</div>
				<span>ভিডিও টিউটোরিয়াল ও ট্রেনিং হাব</span>
			</h1>
			<p class="text-xs text-slate-500 mt-0.5">
				সহজ ভিডিও নির্দেশনার মাধ্যমে প্ল্যাটফর্মের প্রতিটি ফিচার পরিচালনা শিখুন
			</p>
		</div>

		<!-- Action Buttons: + Add Video & Support Button -->
		<div class="flex items-center gap-2.5 flex-wrap">
			<Button
				type="button"
				onclick={() => (isAddFormOpen = !isAddFormOpen)}
				class="bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs gap-1.5 cursor-pointer"
			>
				{#if isAddFormOpen}
					<X class="w-4 h-4" />
					<span>ফর্ম বন্ধ করুন</span>
				{:else}
					<Plus class="w-4 h-4" />
					<span>নতুন ভিডিও যুক্ত করুন</span>
				{/if}
			</Button>

			<a
				href="https://wa.me/880156007230"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
			>
				<Headphones class="w-3.5 h-3.5 text-[#5845eb]" />
				<span>সাপোর্ট হেল্পলাইন</span>
			</a>
		</div>
	</div>

	<!-- Collapsible Inline "Add Video" Form (No Pop-ups!) -->
	{#if isAddFormOpen}
		<div class="bg-indigo-50/50 border border-indigo-200/80 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-5 animate-in fade-in slide-in-from-top-3 duration-200">
			<div class="flex items-center justify-between pb-2 border-b border-indigo-100">
				<div class="flex items-center gap-2">
					<div class="w-7 h-7 rounded-lg bg-[#5845eb] text-white flex items-center justify-center font-bold text-xs">
						+
					</div>
					<div>
						<h3 class="text-sm font-bold text-slate-900">নতুন ভিডিও টিউটোরিয়াল যোগ করুন</h3>
						<p class="text-[11px] text-slate-500">ইউটিউব ভিডিও লিংক ও শিরোনাম দিয়ে তালিকায় যুক্ত করুন</p>
					</div>
				</div>

				<button
					type="button"
					onclick={() => (isAddFormOpen = false)}
					class="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white flex items-center justify-center"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ result, update }) => {
						isSubmitting = false;
						if (result.type === 'success') {
							toast.success('নতুন ভিডিও টিউটোরিয়াল সফলভাবে যুক্ত হয়েছে!');
							isAddFormOpen = false;
							newTitle = '';
							newYoutubeUrl = '';
							newTags = '';
						} else {
							toast.error('ভিডিও যোগ করতে সমস্যা হয়েছে।');
						}
						await update();
					};
				}}
				class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
			>
				<!-- YouTube URL / Video ID -->
				<div class="space-y-1.5 sm:col-span-2 lg:col-span-1">
					<label for="vid-url" class="text-xs font-bold text-slate-800 block">
						YouTube ভিডিও লিংক বা ID <span class="text-rose-500">*</span>
					</label>
					<Input
						id="vid-url"
						name="youtubeUrlOrId"
						type="text"
						required
						bind:value={newYoutubeUrl}
						placeholder="https://www.youtube.com/watch?v=..."
						class="text-xs font-mono bg-white"
					/>
				</div>

				<!-- Video Title -->
				<div class="space-y-1.5 sm:col-span-2">
					<label for="vid-title" class="text-xs font-bold text-slate-800 block">
						ভিডিওর শিরোনাম (Title) <span class="text-rose-500">*</span>
					</label>
					<Input
						id="vid-title"
						name="title"
						type="text"
						required
						bind:value={newTitle}
						placeholder="যেমন: Facebook Pixel সেটআপ গাইড"
						class="text-xs bg-white font-medium"
					/>
				</div>

				<!-- Category -->
				<div class="space-y-1.5">
					<label for="vid-cat" class="text-xs font-bold text-slate-800 block">
						ক্যাটাগরি
					</label>
					<select
						id="vid-cat"
						name="category"
						bind:value={newCategory}
						class="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:border-[#5845eb]"
					>
						<option value="Getting Started">Getting Started</option>
						<option value="Marketing & Pixel">Marketing & Pixel</option>
						<option value="Orders & Courier">Orders & Courier</option>
						<option value="Design & Customization">Design & Customization</option>
					</select>
				</div>

				<!-- Duration -->
				<div class="space-y-1.5">
					<label for="vid-dur" class="text-xs font-bold text-slate-800 block">
						ভিডিওর সময়কাল (Duration)
					</label>
					<Input
						id="vid-dur"
						name="duration"
						type="text"
						bind:value={newDuration}
						placeholder="০৫:৩০ মিনিট"
						class="text-xs bg-white"
					/>
				</div>

				<!-- Tags -->
				<div class="space-y-1.5 sm:col-span-2 lg:col-span-1">
					<label for="vid-tags" class="text-xs font-bold text-slate-800 block">
						ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)
					</label>
					<Input
						id="vid-tags"
						name="tags"
						type="text"
						bind:value={newTags}
						placeholder="Pixel, CAPI, Meta, Marketing"
						class="text-xs bg-white"
					/>
				</div>

				<!-- Submit Button -->
				<div class="sm:col-span-2 lg:col-span-3 pt-2 flex items-center justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						onclick={() => (isAddFormOpen = false)}
						class="text-xs font-bold"
					>
						বাতিল
					</Button>

					<Button
						type="submit"
						disabled={isSubmitting}
						class="bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold px-6 shadow-xs"
					>
						{#if isSubmitting}
							<Loader2 class="w-4 h-4 animate-spin mr-1.5" />
							<span>সংরক্ষণ হচ্ছে...</span>
						{:else}
							<span>সংরক্ষণ করুন</span>
						{/if}
					</Button>
				</div>
			</form>
		</div>
	{/if}

	<!-- 1. FEATURED INLINE CINEMA PLAYER (পপ-আপ মুক্ত প্লেয়ার - Zero Modals) -->
	<section id="cinema-player" class="scroll-mt-24">
		<Card class="bg-white rounded-3xl border-slate-200/90 shadow-xs overflow-hidden">
			<div class="grid grid-cols-1 lg:grid-cols-12 items-stretch">
				
				<!-- Left 7-8 cols: 16:9 Cinema Embed Frame -->
				<div class="lg:col-span-8 bg-black relative aspect-video flex items-center justify-center">
					<iframe
						class="w-full h-full"
						src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=0&rel=0`}
						title={activeVideo.title}
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen
					></iframe>
				</div>

				<!-- Right 4-5 cols: Video Metadata & Quick Play Controls -->
				<div class="lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-slate-50/50 border-t lg:border-t-0 lg:border-l border-slate-100">
					
					<div class="space-y-3.5">
						<!-- Category & Status Badge Row -->
						<div class="flex items-center justify-between gap-2 flex-wrap">
							<span class="px-3 py-1 rounded-full text-[11px] font-bold bg-[#5845eb]/10 text-[#5845eb] border border-[#5845eb]/20">
								{activeVideo.category || 'General Guide'}
							</span>

							<div class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 font-mono">
								<Clock class="w-3.5 h-3.5 text-slate-400" />
								<span>{activeVideo.duration}</span>
							</div>
						</div>

						<!-- Video Title -->
						<h2 class="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight">
							{activeVideo.title}
						</h2>

						<!-- Description / Guidance Note -->
						<p class="text-xs text-slate-600 leading-relaxed">
							{activeVideo.description || 'এই ভিডিও নির্দেশনায় সম্পূর্ণ প্রক্রিয়াটি বিস্তারিতভাবে ধাপে ধাপে দেখানো হয়েছে। যেকোনো সমস্যায় আমাদের টেকনিক্যাল সাপোর্ট সেন্টারে যোগাযোগ করুন।'}
						</p>

						<!-- Tags Cloud -->
						{#if activeVideo.tags && activeVideo.tags.length > 0}
							<div class="flex items-center gap-1.5 flex-wrap pt-1">
								{#each activeVideo.tags as tag}
									<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-600 border border-slate-200 shadow-2xs">
										#{tag}
									</span>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Bottom Action Buttons: Prev/Next, Share, External Link, Delete -->
					<div class="space-y-3 pt-3 border-t border-slate-200/80">
						<!-- Quick Play Next / Prev -->
						<div class="flex items-center justify-between gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onclick={playPrevVideo}
								class="gap-1 text-xs font-bold text-slate-700 h-9 flex-1"
							>
								<ChevronLeft class="w-3.5 h-3.5" />
								<span>পূর্ববর্তী</span>
							</Button>

							<Button
								type="button"
								variant="outline"
								size="sm"
								onclick={playNextVideo}
								class="gap-1 text-xs font-bold text-slate-700 h-9 flex-1"
							>
								<span>পরবর্তী</span>
								<ChevronRight class="w-3.5 h-3.5" />
							</Button>
						</div>

						<!-- External & Share Actions -->
						<div class="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onclick={() => shareVideo(activeVideo)}
								class="gap-1.5 text-xs font-bold text-slate-700 h-9 flex-1"
							>
								<Share2 class="w-3.5 h-3.5 text-[#5845eb]" />
								<span>লিংক কপি</span>
							</Button>

							<a
								href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 h-9 px-4 rounded-xl flex-1 shadow-2xs transition-colors"
							>
								<Play class="w-3.5 h-3.5 fill-white" />
								<span>YouTube</span>
							</a>

							<!-- Delete Video if custom added -->
							{#if activeVideo.id.startsWith('tut-') && activeVideo.id !== 'tut-1' && activeVideo.id !== 'tut-2' && activeVideo.id !== 'tut-3' && activeVideo.id !== 'tut-4' && activeVideo.id !== 'tut-5' && activeVideo.id !== 'tut-6' && activeVideo.id !== 'tut-7' && activeVideo.id !== 'tut-8'}
								<form
									method="POST"
									action="?/delete"
									use:enhance={() => {
										return async ({ result, update }) => {
											if (result.type === 'success') {
												toast.success('ভিডিওটি মুছে ফেলা হয়েছে।');
												if (tutorials.length > 0) activeVideo = tutorials[0];
											}
											await update();
										};
									}}
								>
									<input type="hidden" name="id" value={activeVideo.id} />
									<Button
										type="submit"
										variant="outline"
										size="icon"
										class="h-9 w-9 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
										title="টিউটোরিয়াল মুছুন"
									>
										<Trash2 class="w-3.5 h-3.5" />
									</Button>
								</form>
							{/if}
						</div>
					</div>

				</div>

			</div>
		</Card>
	</section>

	<!-- 2. SEARCH & CATEGORY FILTERS ROW -->
	<div class="space-y-3.5">
		<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
			
			<!-- Category Chips Stack -->
			<div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
				{#each CATEGORIES as cat}
					<button
						type="button"
						onclick={() => { selectedCategory = cat.id; activeTag = null; }}
						class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs {selectedCategory === cat.id
							? 'bg-[#5845eb] text-white shadow-sm'
							: 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'}"
					>
						{cat.label}
					</button>
				{/each}
			</div>

			<!-- Search Bar -->
			<div class="w-full sm:w-72 relative">
				<input
					type="text"
					placeholder="টিউটোরিয়াল খুঁজুন..."
					bind:value={searchQuery}
					class="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] shadow-2xs transition-all"
				/>
				<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = '')}
						class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
					>
						<X class="w-3.5 h-3.5" />
					</button>
				{/if}
			</div>

		</div>

		<!-- Active Filter Tag Notice -->
		{#if activeTag}
			<div class="flex items-center gap-2 text-xs">
				<span class="text-slate-500 font-bold">ফিল্টার ট্যাগ:</span>
				<span class="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-full flex items-center gap-1.5 border border-indigo-200">
					<span>#{activeTag}</span>
					<button type="button" onclick={() => (activeTag = null)} class="hover:text-indigo-900 cursor-pointer">
						<X class="w-3.5 h-3.5" />
					</button>
				</span>
			</div>
		{/if}
	</div>

	<!-- 3. ALL VIDEO CARDS GRID (Responsive 4 Cols) -->
	<div class="space-y-3">
		<div class="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
			<span>সর্বমোট {filteredTutorials.length} টি ভিডিও টিউটোরিয়াল</span>
			<span class="text-[11px] font-normal text-slate-400">ভিডিওতে ক্লিক করলে উপরে প্লে হবে</span>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
			{#each filteredTutorials as tut (tut.id)}
				{@const isCurrent = activeVideo.id === tut.id}
				<div
					onclick={() => selectVideo(tut)}
					class="bg-white rounded-3xl border transition-all flex flex-col justify-between group cursor-pointer overflow-hidden shadow-2xs hover:shadow-md {isCurrent
						? 'border-[#5845eb] ring-2 ring-[#5845eb]/20'
						: 'border-slate-200/80 hover:border-slate-300'}"
				>
					<!-- Top Part: Thumbnail & Content -->
					<div class="space-y-3">
						
						<!-- 16:9 Video Thumbnail with Play Overlay -->
						<div class="aspect-video relative overflow-hidden bg-slate-950">
							<img
								src={tut.thumbnail}
								alt={tut.title}
								loading="lazy"
								class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
							/>
							
							<!-- Dark Vignette Overlay -->
							<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

							<!-- Category Tag in Top Left -->
							<div class="absolute top-2.5 left-2.5">
								<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white border border-white/10">
									{tut.category}
								</span>
							</div>

							<!-- Centered Play Button or Now Playing Badge -->
							<div class="absolute inset-0 flex items-center justify-center">
								{#if isCurrent}
									<div class="px-3 py-1.5 rounded-full bg-[#5845eb] text-white flex items-center gap-1.5 text-[11px] font-bold shadow-lg animate-pulse">
										<Play class="w-3.5 h-3.5 fill-white" />
										<span>Now Playing</span>
									</div>
								{:else}
									<div class="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all">
										<Play class="w-4 h-4 fill-white ml-0.5" />
									</div>
								{/if}
							</div>

							<!-- Video Duration Badge -->
							<div class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] font-bold">
								{tut.duration}
							</div>
						</div>

						<!-- Video Title -->
						<div class="px-4">
							<h3
								class="font-black text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-[#5845eb] transition-colors"
								title={tut.title}
							>
								{tut.title}
							</h3>
						</div>

					</div>

					<!-- Bottom Part: Tag Pills Stack -->
					<div class="p-4 pt-2">
						<div class="flex items-center gap-1.5 flex-wrap">
							{#each tut.tags as tag}
								<button
									type="button"
									onclick={(e) => {
										e.stopPropagation();
										activeTag = activeTag === tag ? null : tag;
									}}
									class="px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer {activeTag === tag
										? 'bg-[#5845eb] text-white'
										: 'bg-slate-100 hover:bg-slate-200 text-slate-600'}"
								>
									#{tag}
								</button>
							{/each}
						</div>
					</div>

				</div>
			{/each}
		</div>
	</div>

</div>
