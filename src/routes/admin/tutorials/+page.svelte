<script lang="ts">
	import { Button, Input, Card, Badge, Dialog } from '#lib/components/ui';
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
		CheckCircle2
	} from 'lucide-svelte';

	let searchQuery = $state('');
	let activeTag = $state<string | null>(null);

	// Video Player Modal State
	let activeVideo = $state<any | null>(null);
	let isPlayerModalOpen = $state(false);

	// Toast Feedback
	let toastMessage = $state<string | null>(null);
	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => (toastMessage = null), 2500);
	}

	// 8 Tutorial Videos (Exact Match with Reference Screenshot)
	const tutorials = [
		{
			id: 'tut-1',
			title: 'Saleecom Admin Panel শুরু করার সহজ গাইড (Mobile)',
			youtubeId: '7wtfhZwyrcc',
			thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&h=360&fit=crop',
			duration: '০৫:৪০ মিনিট',
			tags: ['Saleecom Admin Panel', 'Overview', 'Guide']
		},
		{
			id: 'tut-2',
			title: 'Saleecom Admin Panel শুরু করার সহজ গাইড',
			youtubeId: 'kJQP7kiw5Fk',
			thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&h=360&fit=crop',
			duration: '০৮:১৫ মিনিট',
			tags: ['Saleecom Admin Panel', 'overview', 'guide']
		},
		{
			id: 'tut-3',
			title: 'How To Setup New Facebook Pixel And Connect With Website For Facebook Campaign',
			youtubeId: 'ysz5S6PUM-U',
			thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=640&h=360&fit=crop',
			duration: '১২:৩০ মিনিট',
			tags: ['new facebook pixel', 'facebook pixel full setup', 'connect pixel with add account']
		},
		{
			id: 'tut-4',
			title: "Introducing Saleecom's Official Support System | Dedicated To Serving Our Valued Customers",
			youtubeId: '3JZ_D3ELwOQ',
			thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=640&h=360&fit=crop',
			duration: '০৪:২০ মিনিট',
			tags: ['support system', 'official support', 'issue ticket', 'feedback', 'complain']
		},
		{
			id: 'tut-5',
			title: 'Delivery Option Manage As Your Business Need | Saleecom',
			youtubeId: 'fJ9rUzIMcZQ',
			thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=640&h=360&fit=crop',
			duration: '০৬:১০ মিনিট',
			tags: ['delivery manage', 'Inside city']
		},
		{
			id: 'tut-6',
			title: 'Advance Payment System | Saleecom',
			youtubeId: '9bZkp7q19f0',
			thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=640&h=360&fit=crop',
			duration: '০৭:৪৫ মিনিট',
			tags: ['advance payment', 'order advance', 'custom order advance']
		},
		{
			id: 'tut-7',
			title: 'Fraud Checker | Courier History | Saleecom',
			youtubeId: '2Vv-BfVoq4g',
			thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=640&h=360&fit=crop',
			duration: '০৯:১৫ মিনিট',
			tags: ['fraud order', 'courier info', 'order history']
		},
		{
			id: 'tut-8',
			title: 'Order Language Manage | Saleecom',
			youtubeId: 'L_LUpnjgPso',
			thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&h=360&fit=crop',
			duration: '০৩:৫০ মিনিট',
			tags: ['order language', 'english', 'bangla', 'language change']
		}
	];

	// Filtered Videos
	let filteredTutorials = $derived(
		tutorials.filter((tut) => {
			const query = searchQuery.toLowerCase().trim();
			const matchesSearch =
				query === '' ||
				tut.title.toLowerCase().includes(query) ||
				tut.tags.some((t) => t.toLowerCase().includes(query));

			const matchesTag = activeTag === null || tut.tags.includes(activeTag);

			return matchesSearch && matchesTag;
		})
	);

	function openVideo(tut: any) {
		activeVideo = tut;
		isPlayerModalOpen = true;
	}

	function shareVideo(tut: any) {
		const url = `https://www.youtube.com/watch?v=${tut.youtubeId}`;
		navigator.clipboard.writeText(url);
		showToast('ইউটিউব ভিডিও লিঙ্ক কপি করা হয়েছে!');
	}
</script>

<svelte:head>
	<title>ভিডিও টিউটোরিয়াল | Tutorials</title>
</svelte:head>

<!-- Toast Alert -->
{#if toastMessage}
	<div class="fixed bottom-24 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs font-bold">
		<CheckCircle2 class="w-4 h-4 text-emerald-400" />
		<span>{toastMessage}</span>
	</div>
{/if}

<div class="space-y-6 max-w-7xl mx-auto font-['Hind_Siliguri',sans-serif]">
	
	<!-- Top Sub-Header Row: Title on Left, Search Bar on Right (Exact Match) -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
		
		<!-- Left: Heading -->
		<div>
			<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Tutorial</h2>
			<p class="text-xs text-slate-500 mt-0.5">সহজ ভিডিও নির্দেশনার মাধ্যমে আপনার অনলাইন শপ পরিচালনা শিখুন</p>
		</div>

		<!-- Right: Search Box with Purple Button (Exact Match) -->
		<div class="w-full sm:w-80 flex items-center gap-2">
			<div class="relative flex-1">
				<input
					type="text"
					placeholder="Search"
					bind:value={searchQuery}
					class="w-full bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] focus:bg-white shadow-2xs transition-all"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = '')}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
					>
						<X class="w-3.5 h-3.5" />
					</button>
				{/if}
			</div>

			<button
				type="button"
				class="w-10 h-10 rounded-2xl bg-[#e0e7ff] text-[#5845eb] hover:bg-[#c7d2fe] flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
				title="সার্চ করুন"
			>
				<Search class="w-4 h-4 stroke-[2.5]" />
			</button>
		</div>

	</div>

	<!-- Active Filter Tag Notice -->
	{#if activeTag}
		<div class="flex items-center gap-2 text-xs">
			<span class="text-slate-500">ফিল্টার:</span>
			<span class="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-full flex items-center gap-1.5 border border-indigo-200">
				<span>{activeTag}</span>
				<button type="button" onclick={() => (activeTag = null)} class="hover:text-indigo-900">
					<X class="w-3.5 h-3.5" />
				</button>
			</span>
		</div>
	{/if}

	<!-- Video Cards Grid (4 Columns on Desktop, 2 on Tablet, 1 on Mobile) -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
		{#each filteredTutorials as tut (tut.id)}
			<div class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group">
				
				<!-- Top Part: Thumbnail & Content -->
				<div class="space-y-3.5">
					
					<!-- 16:9 Video Thumbnail with Play Overlay -->
					<div
						onclick={() => openVideo(tut)}
						class="aspect-video relative overflow-hidden bg-slate-950 cursor-pointer"
					>
						<img
							src={tut.thumbnail}
							alt={tut.title}
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
						/>
						
						<!-- Dark Vignette Overlay -->
						<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

						<!-- Centered Play Button -->
						<div class="absolute inset-0 flex items-center justify-center">
							<div class="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-115 group-hover:bg-red-600 transition-all">
								<Play class="w-5 h-5 fill-white ml-0.5" />
							</div>
						</div>

						<!-- Video Duration Badge -->
						<div class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] font-bold">
							{tut.duration}
						</div>
					</div>

					<!-- Video Title -->
					<div class="px-4">
						<h3
							onclick={() => openVideo(tut)}
							class="font-black text-slate-900 text-sm leading-snug line-clamp-2 hover:text-[#5845eb] transition-colors cursor-pointer"
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
								onclick={() => (activeTag = activeTag === tag ? null : tag)}
								class="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer {activeTag === tag
									? 'bg-[#5845eb] text-white'
									: 'bg-slate-100/90 hover:bg-slate-200 text-slate-600'}"
							>
								{tag}
							</button>
						{/each}
					</div>
				</div>

			</div>
		{/each}
	</div>

</div>

<!-- Interactive YouTube Video Player Modal -->
<Dialog bind:open={isPlayerModalOpen} title={activeVideo ? activeVideo.title : 'টিউটোরিয়াল ভিডিও'}>
	{#if activeVideo}
		<div class="space-y-4 py-1">
			
			<!-- Responsive 16:9 YouTube Embed Player -->
			<div class="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-800">
				<iframe
					class="w-full h-full"
					src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
					title={activeVideo.title}
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowfullscreen
				></iframe>
			</div>

			<!-- Video Info & Tags -->
			<div class="space-y-2">
				<div class="flex items-center justify-between gap-3 flex-wrap">
					<h3 class="font-bold text-slate-900 text-sm">{activeVideo.title}</h3>
					<span class="text-xs font-mono text-slate-500 font-semibold">{activeVideo.duration}</span>
				</div>

				<div class="flex items-center gap-1.5 flex-wrap pt-1">
					{#each activeVideo.tags as tag}
						<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
							#{tag}
						</span>
					{/each}
				</div>
			</div>

			<!-- Footer Action Buttons -->
			<div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
				<Button
					type="button"
					variant="outline"
					onclick={() => shareVideo(activeVideo)}
					class="flex items-center gap-1.5 text-xs font-bold"
				>
					<Share2 class="w-3.5 h-3.5" />
					<span>লিঙ্ক শেয়ার করুন</span>
				</Button>

				<Button
					type="button"
					variant="outline"
					onclick={() => (isPlayerModalOpen = false)}
				>
					বন্ধ করুন
				</Button>
			</div>

		</div>
	{/if}
</Dialog>
