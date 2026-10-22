<script lang="ts">
	import { Search, Sparkles, Filter, CheckCircle2, Tag, Calendar, Layers, ShieldCheck, ArrowUpRight } from 'lucide-svelte';

	interface ReleaseItem {
		version: string;
		date: string;
		title: string;
		platforms: string[]; // 'Admin Panel', 'Website', 'API'
		types: string[]; // 'New Feature', 'Issue Solve', 'Enhancement', 'Internal Upgradation'
		changes: string[];
	}

	const releases: ReleaseItem[] = [
		{
			version: '1.0.31',
			date: 'Jun 10, 2026',
			title: 'New Theme Design Option Added',
			platforms: ['Admin Panel'],
			types: ['Issue Solve', 'New Feature', 'Enhancement', 'Internal Upgradation'],
			changes: [
				'New Theme Design Option Added',
				'Internal Bug Fix',
				'Design Upgration'
			]
		},
		{
			version: '1.0.21',
			date: 'Jun 3, 2026',
			title: 'Version Update, Tablet Support, Facebook Catalog & Payment Improvements',
			platforms: ['Admin Panel'],
			types: ['Issue Solve', 'Enhancement'],
			changes: [
				'Version Update Issue',
				'Fixed tablet navbar visibility issue.',
				'Fixed product scroll pagination issue.',
				'Added Facebook Catalog integration option in Add Product.',
				'Improved Advance Payment status management.',
				'General bug fixes and performance improvements.'
			]
		},
		{
			version: '1.0.18',
			date: 'May 24, 2026',
			title: 'High-Converting Checkout Flow & Courier Telemetry Sync',
			platforms: ['Admin Panel', 'Website'],
			types: ['New Feature', 'Enhancement'],
			changes: [
				'Steadfast and Pathao live status courier sync polling.',
				'Instant address validation and duplicate phone number alerts.',
				'Direct one-click order print dispatch sheet generation.',
				'Faster page load speed optimization for mobile visitors.'
			]
		},
		{
			version: '1.0.12',
			date: 'May 14, 2026',
			title: 'Cloudflare D1 Database Resiliency & Automated Backup Logs',
			platforms: ['Admin Panel', 'API'],
			types: ['Internal Upgradation', 'Issue Solve'],
			changes: [
				'Optimized SQLite / Cloudflare D1 query connection pooling.',
				'Automated daily customer database exports in CSV format.',
				'Fixed webhook signature verification under high load.',
				'Enhanced security against bot spam submissions.'
			]
		},
		{
			version: '1.0.0',
			date: 'Apr 20, 2026',
			title: 'AURA Enterprise Commerce & Multi-Landing Page Launch',
			platforms: ['Admin Panel', 'Website', 'API'],
			types: ['New Feature'],
			changes: [
				'Official release of AURA Enterprise Multi-Landing Page Engine.',
				'Real-time analytics dashboard with revenue, orders, and conversion tracking.',
				'Dynamic Facebook Pixel, TikTok Pixel & Google Tag Manager integration.',
				'Full Bengali & English dual-language administrative experience.'
			]
		}
	];

	// Filter states
	let selectedPlatform = $state('All');
	let selectedType = $state('All');
	let searchQuery = $state('');

	const platformOptions = ['All', 'Admin Panel', 'Website', 'API'];
	const typeOptions = ['All', 'New Feature', 'Issue Solve', 'Enhancement', 'Internal Upgradation'];

	let filteredReleases = $derived(
		releases.filter((release) => {
			// Platform filter
			if (selectedPlatform !== 'All' && !release.platforms.includes(selectedPlatform)) {
				return false;
			}

			// Type filter
			if (selectedType !== 'All' && !release.types.includes(selectedType)) {
				return false;
			}

			// Search query
			if (searchQuery.trim() !== '') {
				const q = searchQuery.toLowerCase().trim();
				const matchVersion = release.version.toLowerCase().includes(q);
				const matchTitle = release.title.toLowerCase().includes(q);
				const matchChanges = release.changes.some((c) => c.toLowerCase().includes(q));
				return matchVersion || matchTitle || matchChanges;
			}

			return true;
		})
	);

	function getTypeBadgeClass(type: string) {
		switch (type) {
			case 'Issue Solve':
				return 'bg-red-50 text-red-600 border border-red-200/80';
			case 'New Feature':
				return 'bg-emerald-50 text-emerald-600 border border-emerald-200/80';
			case 'Enhancement':
				return 'bg-sky-50 text-sky-600 border border-sky-200/80';
			case 'Internal Upgradation':
				return 'bg-slate-100 text-slate-600 border border-slate-200';
			default:
				return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
		}
	}

	function getPlatformBadgeClass(platform: string) {
		switch (platform) {
			case 'Admin Panel':
				return 'bg-purple-50 text-purple-700 border border-purple-200/80';
			case 'Website':
				return 'bg-teal-50 text-teal-700 border border-teal-200/80';
			case 'API':
				return 'bg-amber-50 text-amber-700 border border-amber-200/80';
			default:
				return 'bg-slate-100 text-slate-700 border border-slate-200';
		}
	}
</script>

<svelte:head>
	<title>New Release | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-6xl mx-auto pb-16">
	<!-- Top Bar / Search Row -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
				<span>New Release</span>
				<span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#5845eb] border border-indigo-200 font-bold">
					v1.0.47 Latest
				</span>
			</h2>
			<p class="text-xs text-slate-500 mt-0.5">সবগুলো আপডেট, নতুন ফিচার ও বাগ ফিক্সের অফিসিয়াল চেঞ্জলগ</p>
		</div>

		<!-- Search Input (Exact match with screenshot) -->
		<div class="relative w-full sm:w-96">
			<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
			<input
				type="text"
				placeholder="Search release notes by version, title, description..."
				bind:value={searchQuery}
				class="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] focus:ring-2 focus:ring-[#5845eb]/10 transition-all shadow-2xs"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => (searchQuery = '')}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
				>
					✕
				</button>
			{/if}
		</div>
	</div>

	<!-- Filters Row (Platform & Type Capsule Toggles) -->
	<div class="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
		<!-- Platform Filters -->
		<div class="flex flex-col sm:flex-row sm:items-center gap-2">
			<span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">PLATFORM</span>
			<div class="inline-flex flex-wrap items-center bg-slate-100/80 p-1 rounded-xl gap-1">
				{#each platformOptions as platform}
					<button
						type="button"
						onclick={() => (selectedPlatform = platform)}
						class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer {selectedPlatform === platform
							? 'bg-white text-slate-900 shadow-xs'
							: 'text-slate-600 hover:text-slate-900'}"
					>
						{platform}
					</button>
				{/each}
			</div>
		</div>

		<!-- Type Filters -->
		<div class="flex flex-col sm:flex-row sm:items-center gap-2">
			<span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">TYPE</span>
			<div class="inline-flex flex-wrap items-center bg-slate-100/80 p-1 rounded-xl gap-1">
				{#each typeOptions as type}
					<button
						type="button"
						onclick={() => (selectedType = type)}
						class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer {selectedType === type
							? 'bg-white text-slate-900 shadow-xs'
							: 'text-slate-600 hover:text-slate-900'}"
					>
						{type}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Release Timeline Container -->
	<div class="relative pl-6 md:pl-8 space-y-10">
		<!-- Vertical continuous purple timeline line -->
		<div class="absolute left-2.5 md:left-3.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#5845eb] via-indigo-300 to-slate-200"></div>

		{#if filteredReleases.length === 0}
			<div class="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
				<div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
					<Search class="w-6 h-6" />
				</div>
				<h3 class="text-base font-bold text-slate-800">কোন রিলিজ নোট পাওয়া যায়নি</h3>
				<p class="text-xs text-slate-500 mt-1">আপনার ফিল্টার বা সার্চ কিওয়ার্ড পরিবর্তন করে আবার চেষ্টা করুন।</p>
				<button
					type="button"
					onclick={() => {
						selectedPlatform = 'All';
						selectedType = 'All';
						searchQuery = '';
					}}
					class="mt-4 px-4 py-2 rounded-xl bg-[#5845eb] text-white text-xs font-bold shadow-xs hover:bg-[#4936d6] transition-all cursor-pointer"
				>
					সব ফিল্টার রিসেট করুন
				</button>
			</div>
		{:else}
			{#each filteredReleases as release, index}
				<div class="relative group">
					<!-- Timeline Node Dot -->
					<div
						class="absolute -left-[27px] md:-left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-[#5845eb] bg-white flex items-center justify-center shadow-xs group-hover:scale-125 transition-transform"
					>
						<div class="w-1.5 h-1.5 rounded-full bg-[#5845eb]"></div>
					</div>

					<!-- Version Title & Date Header -->
					<div class="flex items-center gap-2 mb-3">
						<span class="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
							Version {release.version}
						</span>
						<span class="text-xs font-medium text-slate-400">
							{release.date}
						</span>
						{#if index === 0}
							<span class="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
								Current Active
							</span>
						{/if}
					</div>

					<!-- Release Note Card -->
					<div
						class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition-all space-y-4"
					>
						<!-- Card Heading -->
						<h3 class="text-base font-bold text-slate-900 tracking-tight">
							{release.title}
						</h3>

						<!-- Metadata Tags Row (TYPE & PLATFORM) -->
						<div class="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs pt-0.5 border-b border-slate-100 pb-3">
							<!-- Types -->
							<div class="flex flex-wrap items-center gap-1.5">
								<span class="text-[11px] font-bold text-slate-400 uppercase tracking-wide">TYPE:</span>
								{#each release.types as type}
									<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider {getTypeBadgeClass(type)}">
										{type}
									</span>
								{/each}
							</div>

							<!-- Platforms -->
							<div class="flex flex-wrap items-center gap-1.5">
								<span class="text-[11px] font-bold text-slate-400 uppercase tracking-wide">PLATFORM:</span>
								{#each release.platforms as platform}
									<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider {getPlatformBadgeClass(platform)}">
										{platform}
									</span>
								{/each}
							</div>
						</div>

						<!-- Bullet Points List -->
						<ul class="space-y-2 text-sm text-slate-700">
							{#each release.changes as change}
								<li class="flex items-start gap-2.5">
									<span class="text-slate-400 font-bold select-none">-</span>
									<span class="leading-relaxed">{change}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
