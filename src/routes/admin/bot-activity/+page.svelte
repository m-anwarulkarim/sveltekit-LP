<script lang="ts">
	import {
		Button,
		Input,
		Card,
		CardContent,
		Badge,
		Switch,
		Table,
		TableHeader,
		TableRow,
		TableHead,
		TableBody,
		TableCell,
		Alert,
		AlertDescription
	} from '#lib/components/ui';
	import {
		Bot,
		Globe,
		Search,
		Cpu,
		Trash2,
		Download,
		ShieldAlert,
		ShieldCheck,
		AlertTriangle,
		RotateCw,
		CheckCircle2,
		ExternalLink,
		Filter,
		HardDrive,
		Zap,
		SlidersHorizontal
	} from 'lucide-svelte';

	// Filters
	let dateRange = $state<'24h' | '7d' | '30d' | 'all'>('7d');
	let searchQuery = $state('');
	let categoryFilter = $state<'all' | 'search' | 'headless' | 'ai' | 'blocked'>('all');
	let toastMessage = $state<string | null>(null);
	let isRefreshing = $state(false);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			toastMessage = null;
		}, 3000);
	}

	function handleRefresh() {
		isRefreshing = true;
		setTimeout(() => {
			isRefreshing = false;
			showToast('Bot traffic and telemetry data refreshed');
		}, 600);
	}

	function clearOldLogs() {
		showToast('Logs older than 30 days have been cleared successfully.');
	}

	function exportCsv() {
		showToast('Exporting bot activity logs to CSV format...');
	}

	// AI Firewall Toggles State
	let allowGptBot = $state(true);
	let allowClaudeBot = $state(true);
	let allowPerplexity = $state(false);
	let allowBytespider = $state(false);

	// Bot Traffic List Data
	let botsData = $state([
		{
			id: 'b-1',
			name: 'Headless Browser (webdriver)',
			userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/128.0.0.0 Safari/537.36',
			category: 'headless',
			categoryLabel: 'Other / Scraper',
			ip: '103.205.132.44',
			country: 'Bangladesh',
			countryCode: 'BD',
			visits: 21,
			uniquePages: 1,
			lastSeen: '12 mins ago',
			risk: 'high',
			status: 'Active',
			isBlocked: false
		},
		{
			id: 'b-2',
			name: 'Googlebot Desktop',
			userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
			category: 'search',
			categoryLabel: 'Search Engine',
			ip: '66.249.66.1',
			country: 'United States',
			countryCode: 'US',
			visits: 1,
			uniquePages: 1,
			lastSeen: '2 hours ago',
			risk: 'safe',
			status: 'Verified',
			isBlocked: false
		},
		{
			id: 'b-3',
			name: 'Bingbot Crawler',
			userAgent: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
			category: 'search',
			categoryLabel: 'Search Engine',
			ip: '157.55.39.22',
			country: 'United States',
			countryCode: 'US',
			visits: 0,
			uniquePages: 0,
			lastSeen: 'Yesterday',
			risk: 'safe',
			status: 'Idle',
			isBlocked: false
		},
		{
			id: 'b-4',
			name: 'GPTBot (OpenAI Web Scraper)',
			userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
			category: 'ai',
			categoryLabel: 'AI Crawler',
			ip: '20.171.206.14',
			country: 'United States',
			countryCode: 'US',
			visits: 0,
			uniquePages: 0,
			lastSeen: '3 days ago',
			risk: 'moderate',
			status: 'Allowed',
			isBlocked: false
		}
	]);

	function toggleBlockBot(botId: string) {
		botsData = botsData.map((b) => {
			if (b.id === botId) {
				const nextState = !b.isBlocked;
				showToast(
					nextState
						? `Blocked IP ${b.ip} and added to Firewall Blocklist!`
						: `Unblocked IP ${b.ip}. Traffic is now permitted.`
				);
				return { ...b, isBlocked: nextState, status: nextState ? 'Blocked' : 'Active' };
			}
			return b;
		});
	}

	// Most Crawled Pages Data
	const mostVisitedPages = [
		{ path: '/', title: 'Homepage / Showcase', visits: 12, uniqueBots: 2, status: '200 OK', lastCrawl: '12 mins ago' },
		{ path: '/products', title: 'Product Catalog', visits: 6, uniqueBots: 1, status: '200 OK', lastCrawl: '45 mins ago' },
		{ path: '/checkout', title: 'Checkout & Payment Form', visits: 3, uniqueBots: 1, status: '200 OK', lastCrawl: '1 hour ago', alert: true },
		{ path: '/robots.txt', title: 'Robots Directive File', visits: 1, uniqueBots: 1, status: '200 OK', lastCrawl: '2 hours ago' }
	];

	// Filtered Bot List
	let filteredBots = $derived.by(() => {
		let list = botsData;
		if (categoryFilter !== 'all') {
			if (categoryFilter === 'blocked') {
				list = list.filter((b) => b.isBlocked);
			} else {
				list = list.filter((b) => b.category === categoryFilter);
			}
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(b) =>
					b.name.toLowerCase().includes(q) ||
					b.ip.includes(q) ||
					b.categoryLabel.toLowerCase().includes(q)
			);
		}

		return list;
	});

	// Dynamic Total Hits
	let totalHits = $derived(botsData.reduce((acc, b) => acc + b.visits, 0));
	let uniqueBotsCount = $derived(botsData.filter((b) => b.visits > 0).length);
</script>

<svelte:head>
	<title>Bot Activity & Security Shield | Admin</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
	
	<!-- Toast Message -->
	{#if toastMessage}
		<div class="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
			<CheckCircle2 class="w-4 h-4 text-emerald-400" />
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- 1. Top Header Row (Matching Screenshot Breadcrumb + Controls) -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
		<div class="space-y-1">
			<div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
				<span>Admin Panel</span>
				<span>/</span>
				<span class="text-slate-700">Bot Activity</span>
			</div>

			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#5845eb] flex items-center justify-center shrink-0">
					<Bot class="w-5 h-5 stroke-[2.2]" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-['Outfit']">
							Bot Activity
						</h1>
						<Badge class="bg-indigo-50 text-[#5845eb] border border-indigo-200 font-bold text-xs px-2.5 py-0.5">
							{totalHits} Visits Detected
						</Badge>
					</div>
					<p class="text-xs text-slate-500 font-medium">
						Monitor search crawlers, AI scrapers, headless browsers, and protect checkout integrity.
					</p>
				</div>
			</div>
		</div>

		<!-- Top Right Action Controls -->
		<div class="flex flex-wrap items-center gap-2.5">
			<!-- Date Range Selector -->
			<div class="relative">
				<select
					bind:value={dateRange}
					class="bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#5845eb] cursor-pointer shadow-2xs"
				>
					<option value="24h">Last 24 Hours</option>
					<option value="7d">Last 7 Days</option>
					<option value="30d">Last 30 Days</option>
					<option value="all">All Time</option>
				</select>
			</div>

			<!-- Refresh Button -->
			<Button
				variant="outline"
				size="sm"
				onclick={handleRefresh}
				disabled={isRefreshing}
				class="rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold gap-1.5 shadow-2xs h-9 px-3.5"
			>
				<RotateCw class="w-3.5 h-3.5 {isRefreshing ? 'animate-spin text-[#5845eb]' : 'text-slate-400'}" />
				<span>Refresh</span>
			</Button>

			<!-- Export CSV -->
			<Button
				variant="outline"
				size="sm"
				onclick={exportCsv}
				class="rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold gap-1.5 shadow-2xs h-9 px-3.5"
			>
				<Download class="w-3.5 h-3.5 text-slate-400" />
				<span>Export</span>
			</Button>

			<!-- Clear Old Logs Button (Screenshot exact: পুরানো মুছুন) -->
			<Button
				variant="outline"
				size="sm"
				onclick={clearOldLogs}
				class="rounded-2xl border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-600 text-xs font-bold gap-1.5 shadow-2xs h-9 px-3.5"
			>
				<Trash2 class="w-3.5 h-3.5 text-rose-500" />
				<span>Clear Logs</span>
			</Button>
		</div>
	</div>

	<!-- 2. KPI Metrics Grid (Row 1 from Screenshot + Advanced Extensions) -->
	<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
		
		<!-- Card 1: Total Bot Hits -->
		<Card class="border-slate-200/90 shadow-2xs bg-gradient-to-br from-white to-indigo-50/20 hover:border-indigo-200 transition-all">
			<CardContent class="p-4 space-y-2">
				<div class="flex items-center justify-between text-slate-400">
					<span class="text-[11px] font-bold text-slate-500">Total Bot Visits</span>
					<div class="w-7 h-7 rounded-xl bg-indigo-50 text-[#5845eb] flex items-center justify-center">
						<Bot class="w-4 h-4" />
					</div>
				</div>
				<div class="flex items-baseline justify-between">
					<span class="text-2xl font-black text-slate-900 font-['Outfit']">{totalHits}</span>
					<span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">+5%</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 2: Unique Bots -->
		<Card class="border-slate-200/90 shadow-2xs bg-gradient-to-br from-white to-slate-50/50 hover:border-slate-300 transition-all">
			<CardContent class="p-4 space-y-2">
				<div class="flex items-center justify-between text-slate-400">
					<span class="text-[11px] font-bold text-slate-500">Unique Bots</span>
					<div class="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
						<Globe class="w-4 h-4" />
					</div>
				</div>
				<div class="flex items-baseline justify-between">
					<span class="text-2xl font-black text-slate-900 font-['Outfit']">{uniqueBotsCount}</span>
					<span class="text-[10px] font-bold text-slate-400">Distinct Agents</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 3: Search Engines (SEO) -->
		<Card class="border-slate-200/90 shadow-2xs bg-gradient-to-br from-white to-blue-50/30 hover:border-blue-200 transition-all">
			<CardContent class="p-4 space-y-2">
				<div class="flex items-center justify-between text-slate-400">
					<span class="text-[11px] font-bold text-slate-500">Search Engines</span>
					<div class="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
						<Search class="w-4 h-4" />
					</div>
				</div>
				<div class="flex items-baseline justify-between">
					<span class="text-2xl font-black text-blue-600 font-['Outfit']">1</span>
					<span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Healthy</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 4: AI Scrapers -->
		<Card class="border-slate-200/90 shadow-2xs bg-gradient-to-br from-white to-purple-50/30 hover:border-purple-200 transition-all">
			<CardContent class="p-4 space-y-2">
				<div class="flex items-center justify-between text-slate-400">
					<span class="text-[11px] font-bold text-slate-500">AI Crawlers</span>
					<div class="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
						<Cpu class="w-4 h-4" />
					</div>
				</div>
				<div class="flex items-baseline justify-between">
					<span class="text-2xl font-black text-slate-900 font-['Outfit']">0</span>
					<span class="text-[10px] font-bold text-slate-400">GPT / Claude</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 5: Suspicious Headless -->
		<Card class="border-slate-200/90 shadow-2xs bg-gradient-to-br from-white to-amber-50/30 hover:border-amber-200 transition-all">
			<CardContent class="p-4 space-y-2">
				<div class="flex items-center justify-between text-slate-400">
					<span class="text-[11px] font-bold text-slate-500">Headless Scrapers</span>
					<div class="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
						<AlertTriangle class="w-4 h-4" />
					</div>
				</div>
				<div class="flex items-baseline justify-between">
					<span class="text-2xl font-black text-amber-600 font-['Outfit']">21</span>
					<span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">High Hit</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 6: Bandwidth Consumed -->
		<Card class="border-slate-200/90 shadow-2xs bg-gradient-to-br from-white to-emerald-50/20 hover:border-emerald-200 transition-all">
			<CardContent class="p-4 space-y-2">
				<div class="flex items-center justify-between text-slate-400">
					<span class="text-[11px] font-bold text-slate-500">Bandwidth Used</span>
					<div class="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
						<HardDrive class="w-4 h-4" />
					</div>
				</div>
				<div class="flex items-baseline justify-between">
					<span class="text-2xl font-black text-slate-900 font-['Outfit']">3.4 MB</span>
					<span class="text-[10px] font-bold text-slate-400">Efficient</span>
				</div>
			</CardContent>
		</Card>

	</div>

	<!-- 3. Charts Row (Row 2 from Screenshot: Daily Visits Bar Chart & Bot Distribution Donut) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		
		<!-- Left: Daily Bot Visits Chart (lg:col-span-7) -->
		<Card class="lg:col-span-7 border-slate-200/90 shadow-2xs">
			<CardContent class="p-5 sm:p-6 space-y-4">
				<div class="flex items-center justify-between pb-3 border-b border-slate-100">
					<div class="flex items-center gap-2">
						<div class="w-2.5 h-2.5 rounded-full bg-[#5845eb]"></div>
						<h3 class="text-sm font-bold text-slate-900">Daily Bot Visits (দৈনিক বট ভিজিট)</h3>
					</div>
					<span class="text-xs text-slate-400 font-medium">October 2026</span>
				</div>

				<!-- SVG Bar Chart -->
				<div class="h-64 flex flex-col justify-between pt-4">
					<!-- Y-Axis and Bars Area -->
					<div class="relative flex-1 flex items-end justify-around px-4 border-b border-l border-slate-200">
						<!-- Grid Lines -->
						<div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
							<div class="border-b border-dashed border-slate-200 w-full flex justify-end pr-2 text-[10px] text-slate-400">24</div>
							<div class="border-b border-dashed border-slate-200 w-full flex justify-end pr-2 text-[10px] text-slate-400">18</div>
							<div class="border-b border-dashed border-slate-200 w-full flex justify-end pr-2 text-[10px] text-slate-400">12</div>
							<div class="border-b border-dashed border-slate-200 w-full flex justify-end pr-2 text-[10px] text-slate-400">6</div>
							<div class="w-full flex justify-end pr-2 text-[10px] text-slate-400">0</div>
						</div>

						<!-- Mock Bar Days -->
						<div class="relative z-10 flex flex-col items-center group w-12">
							<div class="w-8 h-2 bg-slate-200/60 rounded-t-lg transition-all"></div>
							<span class="text-[10px] text-slate-400 mt-2">19 Oct</span>
						</div>

						<div class="relative z-10 flex flex-col items-center group w-12">
							<div class="w-8 h-2 bg-slate-200/60 rounded-t-lg transition-all"></div>
							<span class="text-[10px] text-slate-400 mt-2">20 Oct</span>
						</div>

						<!-- Active Spike Bar (21 Oct - 22 visits matching screenshot) -->
						<div class="relative z-10 flex flex-col items-center group w-20">
							<!-- Tooltip (Screenshot exact) -->
							<div class="absolute -top-16 bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-xl text-center z-20 animate-in fade-in">
								<div class="text-[10.5px] font-bold text-slate-500">21 Oct</div>
								<div class="text-xs font-black text-[#5845eb]">Visits: 22</div>
							</div>

							<!-- Tall Blue Bar -->
							<div class="w-16 h-44 bg-gradient-to-t from-[#4936d6] to-[#5845eb] rounded-t-xl shadow-md shadow-indigo-500/30 transition-transform group-hover:scale-y-105 origin-bottom"></div>
							<span class="text-[11px] font-black text-slate-800 mt-2">21 Oct</span>
						</div>

						<div class="relative z-10 flex flex-col items-center group w-12">
							<div class="w-8 h-2 bg-slate-200/60 rounded-t-lg transition-all"></div>
							<span class="text-[10px] text-slate-400 mt-2">22 Oct</span>
						</div>

						<div class="relative z-10 flex flex-col items-center group w-12">
							<div class="w-8 h-2 bg-slate-200/60 rounded-t-lg transition-all"></div>
							<span class="text-[10px] text-slate-400 mt-2">23 Oct</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Right: Bot Type Distribution Donut (lg:col-span-5) -->
		<Card class="lg:col-span-5 border-slate-200/90 shadow-2xs">
			<CardContent class="p-5 sm:p-6 space-y-4">
				<div class="flex items-center justify-between pb-3 border-b border-slate-100">
					<div class="flex items-center gap-2">
						<div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
						<h3 class="text-sm font-bold text-slate-900">Bot Distribution (বটের ধরন)</h3>
					</div>
					<span class="text-xs text-slate-400 font-medium">Traffic Ratio</span>
				</div>

				<div class="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
					<!-- Donut Chart Circle (SVG) -->
					<div class="relative w-36 h-36 flex items-center justify-center">
						<svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
							<!-- Gray Segment (Other / Headless 95%) -->
							<circle
								cx="18"
								cy="18"
								r="15.915"
								fill="transparent"
								stroke="#64748b"
								stroke-width="4.5"
								stroke-dasharray="95 5"
								stroke-dashoffset="0"
							/>
							<!-- Blue Segment (Search Engine 5%) -->
							<circle
								cx="18"
								cy="18"
								r="15.915"
								fill="transparent"
								stroke="#3b82f6"
								stroke-width="4.5"
								stroke-dasharray="5 95"
								stroke-dashoffset="-95"
							/>
						</svg>

						<div class="absolute flex flex-col items-center justify-center text-center">
							<span class="text-xl font-black text-slate-900 font-['Outfit']">22</span>
							<span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Total</span>
						</div>
					</div>

					<!-- Legend -->
					<div class="space-y-3 text-xs">
						<div class="flex items-center gap-2.5">
							<div class="w-3.5 h-3.5 rounded-md bg-slate-500 shrink-0"></div>
							<div>
								<div class="font-bold text-slate-800">Other / Headless</div>
								<div class="text-[11px] text-slate-400">95% (21 visits)</div>
							</div>
						</div>

						<div class="flex items-center gap-2.5">
							<div class="w-3.5 h-3.5 rounded-md bg-blue-500 shrink-0"></div>
							<div>
								<div class="font-bold text-slate-800">Search Engine</div>
								<div class="text-[11px] text-slate-400">5% (1 visit)</div>
							</div>
						</div>

						<div class="flex items-center gap-2.5">
							<div class="w-3.5 h-3.5 rounded-md bg-purple-400 shrink-0"></div>
							<div>
								<div class="font-bold text-slate-800">AI Scrapers</div>
								<div class="text-[11px] text-slate-400">0% (0 visits)</div>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>

	</div>

	<!-- 4. AI & Crawler Policy Controls (Value-Added Feature from Plan) -->
	<Card class="border-slate-200/90 shadow-2xs bg-gradient-to-r from-white via-indigo-50/20 to-white">
		<CardContent class="p-5 sm:p-6 space-y-4">
			<div class="flex items-center justify-between pb-3 border-b border-slate-100">
				<div class="flex items-center gap-2">
					<SlidersHorizontal class="w-4 h-4 text-[#5845eb]" />
					<h3 class="text-sm font-bold text-slate-900">AI Crawler & Content Protection Policy</h3>
				</div>
				<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200 text-[10px]">
					Automated Edge Directives
				</Badge>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<!-- GPTBot -->
				<div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
					<div class="space-y-0.5">
						<span class="text-xs font-bold text-slate-800">OpenAI (GPTBot)</span>
						<p class="text-[10px] text-slate-400">Search ChatGPT indexing</p>
					</div>
					<Switch bind:checked={allowGptBot} />
				</div>

				<!-- ClaudeBot -->
				<div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
					<div class="space-y-0.5">
						<span class="text-xs font-bold text-slate-800">Anthropic (ClaudeBot)</span>
						<p class="text-[10px] text-slate-400">Knowledge crawling</p>
					</div>
					<Switch bind:checked={allowClaudeBot} />
				</div>

				<!-- Perplexity -->
				<div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
					<div class="space-y-0.5">
						<span class="text-xs font-bold text-slate-800">Perplexity AI</span>
						<p class="text-[10px] text-slate-400">Realtime citation bot</p>
					</div>
					<Switch bind:checked={allowPerplexity} />
				</div>

				<!-- ByteDance / TikTok -->
				<div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
					<div class="space-y-0.5">
						<span class="text-xs font-bold text-slate-800">Bytespider (TikTok)</span>
						<p class="text-[10px] text-slate-400">High bandwidth scraper</p>
					</div>
					<Switch bind:checked={allowBytespider} />
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- 5. Bot Intelligence Table (Row 3 from Screenshot: বট তালিকা) -->
	<Card class="border-slate-200/90 shadow-2xs overflow-hidden">
		<div class="p-5 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div>
				<h3 class="text-base font-extrabold text-slate-900 tracking-tight font-['Outfit']">
					Bot Intelligence & Detected Agents (বট তালিকা)
				</h3>
				<p class="text-xs text-slate-500 font-medium">
					Click "Block IP" to immediately ban abusive or unwanted scraping bots.
				</p>
			</div>

			<!-- Search & Filter Controls -->
			<div class="flex items-center gap-2.5">
				<div class="relative w-64">
					<Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search bot name or IP..."
						class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb]"
					/>
				</div>
			</div>
		</div>

		<!-- Table -->
		<div class="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow class="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
						<TableHead class="pl-6">Bot Name & Agent</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>IP & Location</TableHead>
						<TableHead class="text-center">Visits</TableHead>
						<TableHead class="text-center">Unique Pages</TableHead>
						<TableHead>Risk Status</TableHead>
						<TableHead class="text-right pr-6">Mitigation Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each filteredBots as bot}
						<TableRow class="hover:bg-slate-50/50 transition-colors text-xs font-medium">
							<!-- Bot Name -->
							<TableCell class="pl-6 py-4">
								<div class="flex items-center gap-2.5">
									<div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 {bot.risk === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}">
										<Bot class="w-4 h-4" />
									</div>
									<div class="space-y-0.5">
										<span class="font-bold text-slate-900">{bot.name}</span>
										<p class="text-[10px] text-slate-400 font-mono truncate max-w-xs">{bot.userAgent}</p>
									</div>
								</div>
							</TableCell>

							<!-- Category -->
							<TableCell>
								<Badge variant="outline" class="text-[11px] font-semibold bg-slate-50 text-slate-700 border-slate-200">
									{bot.categoryLabel}
								</Badge>
							</TableCell>

							<!-- IP Address -->
							<TableCell>
								<div class="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
									<span>{bot.ip}</span>
									<span class="text-[9px] font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
										{bot.countryCode}
									</span>
								</div>
							</TableCell>

							<!-- Visits -->
							<TableCell class="text-center font-black text-slate-900 font-['Outfit']">
								{bot.visits}
							</TableCell>

							<!-- Unique Pages -->
							<TableCell class="text-center font-bold text-slate-600">
								{bot.uniquePages}
							</TableCell>

							<!-- Risk Badge -->
							<TableCell>
								{#if bot.isBlocked}
									<Badge class="bg-rose-100 text-rose-800 border-rose-300 text-[10px] font-bold">
										Blocked
									</Badge>
								{:else if bot.risk === 'high'}
									<Badge class="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">
										Suspicious
									</Badge>
								{:else if bot.risk === 'safe'}
									<Badge class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
										Verified Good
									</Badge>
								{:else}
									<Badge class="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
										Neutral
									</Badge>
								{/if}
							</TableCell>

							<!-- 1-Click Action -->
							<TableCell class="text-right pr-6">
								{#if bot.risk === 'safe'}
									<span class="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
										<ShieldCheck class="w-3.5 h-3.5" />
										Protected
									</span>
								{:else}
									<Button
										size="sm"
										variant={bot.isBlocked ? 'outline' : 'destructive'}
										onclick={() => toggleBlockBot(bot.id)}
										class="h-8 rounded-xl text-xs font-bold gap-1 cursor-pointer {bot.isBlocked ? 'border-slate-300 text-slate-700' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'}"
									>
										{#if bot.isBlocked}
											<ShieldCheck class="w-3.5 h-3.5" />
											<span>Unblock</span>
										{:else}
											<ShieldAlert class="w-3.5 h-3.5" />
											<span>Block IP</span>
										{/if}
									</Button>
								{/if}
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	</Card>

	<!-- 6. Most Visited Pages by Bots (Row 4 from Screenshot: সবচেয়ে বেশি ভিজিট করা পেজ) -->
	<Card class="border-slate-200/90 shadow-2xs overflow-hidden">
		<div class="p-5 bg-white border-b border-slate-100">
			<h3 class="text-base font-extrabold text-slate-900 tracking-tight font-['Outfit']">
				Most Visited Pages by Bots (সবচেয়ে বেশি ভিজিট করা পেজ)
			</h3>
			<p class="text-xs text-slate-500 font-medium">
				High traffic targets crawled by web scrapers and search bots.
			</p>
		</div>

		<div class="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow class="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
						<TableHead class="pl-6">Endpoint / Page URL</TableHead>
						<TableHead>Target Description</TableHead>
						<TableHead class="text-center">Total Bot Hits</TableHead>
						<TableHead class="text-center">Unique Bots</TableHead>
						<TableHead>HTTP Status</TableHead>
						<TableHead class="text-right pr-6">Last Crawl Time</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each mostVisitedPages as pageItem}
						<TableRow class="hover:bg-slate-50/50 transition-colors text-xs font-medium">
							<!-- Page URL -->
							<TableCell class="pl-6 py-3 font-mono font-bold text-slate-900 flex items-center gap-2">
								<span>{pageItem.path}</span>
								{#if pageItem.alert}
									<span class="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md">
										Sensitive
									</span>
								{/if}
							</TableCell>

							<!-- Description -->
							<TableCell class="text-slate-600 font-medium">
								{pageItem.title}
							</TableCell>

							<!-- Hits -->
							<TableCell class="text-center font-black text-slate-900 font-['Outfit']">
								{pageItem.visits}
							</TableCell>

							<!-- Unique Bots -->
							<TableCell class="text-center font-bold text-slate-600">
								{pageItem.uniqueBots}
							</TableCell>

							<!-- HTTP Status -->
							<TableCell>
								<span class="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
									{pageItem.status}
								</span>
							</TableCell>

							<!-- Last Crawl -->
							<TableCell class="text-right pr-6 text-slate-400 font-medium">
								{pageItem.lastCrawl}
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	</Card>

</div>
