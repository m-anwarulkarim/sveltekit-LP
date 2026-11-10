<script lang="ts">
	import {
		Button,
		Badge,
		Card,
		CardContent,
		Table,
		TableHeader,
		TableRow,
		TableHead,
		TableBody,
		TableCell
	} from '#lib/components/ui';
	import {
		Users,
		Globe,
		Activity,
		Eye,
		TrendingUp,
		Smartphone,
		Monitor,
		Tablet,
		MapPin,
		ShieldAlert,
		ShieldCheck,
		ExternalLink,
		Clock,
		Sparkles,
		Share2,
		CheckCircle2,
		ArrowUpRight,
		SlidersHorizontal
	} from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import VisitorTimeFilter from './_components/VisitorTimeFilter.svelte';

	let { data }: { data: any } = $props();

	let summary = $derived(data.trafficSummary || {
		activeNow: 0,
		todaySessions: 0,
		todayPageviews: 0,
		conversionRate: 0,
		topSource: 'Direct',
		sourcesBreakdown: [],
		deviceBreakdown: [],
		topPages: [],
		topCities: [],
		adminVisitsCount: 0,
		recentVisitors: []
	});

	let activeRange = $derived(data.activeRange || 'today');
	let activeFrom = $derived(data.activeFrom || null);
	let activeTo = $derived(data.activeTo || null);
	let blockingIp = $state<string | null>(null);
	let streamFilter = $state<'all' | 'bd' | 'facebook' | 'admin'>('all');

	const BD_CITIES = new Set([
		'dhaka', 'chattogram', 'chittagong', 'sylhet', 'khulna', 'rajshahi',
		'rangpur', 'barishal', 'mymensingh', 'cumilla', 'comilla', 'manikganj',
		'mānikganj', 'gazipur', 'narayanganj', 'ramganj', 'rāmganj', 'bogra',
		'jessore', 'cox\'s bazar', 'tangail', 'feni', 'noakhali', 'kushtia',
		'faridpur', 'dinajpur', 'pabna', 'sirajganj', 'brahmanbaria', 'narsingdi'
	]);

	function isBdCity(cityName: string): boolean {
		const lower = (cityName || '').toLowerCase().trim();
		for (const c of BD_CITIES) {
			if (lower.includes(c)) return true;
		}
		return false;
	}

	let bdVisitorsCount = $derived(
		(summary.recentVisitors || []).filter((v: any) => isBdCity(v.city)).length
	);

	let fbVisitorsCount = $derived(
		(summary.recentVisitors || []).filter((v: any) => (v.trafficSource || '').toLowerCase().includes('facebook')).length
	);

	let adminVisitorsCount = $derived(
		(summary.recentVisitors || []).filter((v: any) => v.isAdmin).length
	);

	let filteredRecentVisitors = $derived.by(() => {
		const list = summary.recentVisitors || [];
		if (streamFilter === 'bd') {
			return list.filter((v: any) => isBdCity(v.city));
		}
		if (streamFilter === 'facebook') {
			return list.filter((v: any) => (v.trafficSource || '').toLowerCase().includes('facebook'));
		}
		if (streamFilter === 'admin') {
			return list.filter((v: any) => v.isAdmin);
		}
		return list;
	});

	function handleRangeChange(range: string, from?: string, to?: string) {
		let url = `/admin/visitors?range=${encodeURIComponent(range)}`;
		if (range === 'custom' && from && to) {
			url += `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
		}
		goto(url, { keepFocus: true, noScroll: true });
	}

	function formatTimeAgo(timestamp: number): string {
		const diff = Math.floor((Date.now() - timestamp) / 1000);
		if (diff < 60) return `${diff} সেকেন্ড আগে`;
		if (diff < 3600) return `${Math.floor(diff / 60)} মিনিট আগে`;
		return new Date(timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
	}

	function getSourceBadgeClass(source: string): string {
		const s = (source || '').toLowerCase();
		if (s.includes('meta ad review')) return 'bg-purple-50 text-purple-700 border-purple-200';
		if (s.includes('facebook')) return 'bg-blue-50 text-blue-700 border-blue-200';
		if (s.includes('google')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
		if (s.includes('tiktok')) return 'bg-pink-50 text-pink-700 border-pink-200';
		if (s.includes('whatsapp')) return 'bg-teal-50 text-teal-700 border-teal-200';
		if (s.includes('youtube')) return 'bg-rose-50 text-rose-700 border-rose-200';
		return 'bg-slate-50 text-slate-700 border-slate-200';
	}

	function getSourceDotClass(source: string): string {
		const s = (source || '').toLowerCase();
		if (s.includes('meta ad review')) return 'bg-purple-600';
		if (s.includes('facebook')) return 'bg-blue-600 animate-pulse';
		if (s.includes('google')) return 'bg-emerald-600';
		if (s.includes('tiktok')) return 'bg-pink-600';
		if (s.includes('whatsapp')) return 'bg-teal-600';
		if (s.includes('youtube')) return 'bg-rose-600';
		return 'bg-slate-400';
	}
</script>

<svelte:head>
	<title>Visitor Analytics & Real-Time Traffic | Haq Plus Admin</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto pb-16 font-['Anek_Bangla',sans-serif]">
	<!-- TOP COMMAND HEADER -->
	<div class="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div class="flex items-center gap-3.5">
			<div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb] shadow-2xs shrink-0">
				<Globe class="w-6 h-6 stroke-[2]" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
						ভিজিটর ও ট্রাফিক অ্যানালিটিক্স
					</h1>
					<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
						<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
						লাইভ সক্রিয়
					</span>
				</div>
				<p class="text-xs sm:text-sm text-slate-500 mt-0.5">
					স্টোরফ্রন্টের রিয়েল-টাইম অনলাইন ভিজিটর, ট্রাফিক সোর্স, ডিভাইসবাইজ ব্রেকডাউন ও ফানেল মনিটর করুন
				</p>
			</div>
		</div>

		<!-- Action Controls -->
		<div class="flex flex-wrap items-center gap-2">
			<VisitorTimeFilter
				{activeRange}
				{activeFrom}
				{activeTo}
				onSelectRange={handleRangeChange}
			/>
		</div>
	</div>

	<!-- 4 VIBRANT KPI METRIC CARDS -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
		<!-- Card 1: Live Active Now -->
		<div class="bg-gradient-to-br from-[#ecfdf5] via-[#ffffff] to-[#d1fae5]/60 p-4 sm:p-5 rounded-3xl border border-[#a7f3d0] shadow-xs hover:shadow-md transition-all group">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-emerald-800">লাইভ অনলাইন ভিজিটর</span>
				<div class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shadow-emerald-500/25">
					<Activity class="w-4 h-4 stroke-[2.5]" />
				</div>
			</div>
			<div class="text-2xl sm:text-3xl font-black text-emerald-950 font-['Outfit'] tracking-tight flex items-baseline gap-2">
				<span>{summary.activeNow}</span>
				<span class="text-xs font-bold text-emerald-700 font-['Anek_Bangla']">জন একটিভ</span>
			</div>
			<div class="mt-2 text-[11px] font-medium text-emerald-700 flex items-center gap-1.5">
				<span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
				<span>সর্বশেষ ৫ মিনিটে সক্রিয়</span>
			</div>
		</div>

		<!-- Card 2: Total Sessions -->
		<div class="bg-gradient-to-br from-[#eff6ff] via-[#ffffff] to-[#dbeafe]/60 p-4 sm:p-5 rounded-3xl border border-[#bfdbfe] shadow-xs hover:shadow-md transition-all group">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-blue-800">ইউনিক ভিজিটর সেশন</span>
				<div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shadow-blue-500/25">
					<Users class="w-4 h-4 stroke-[2.5]" />
				</div>
			</div>
			<div class="text-2xl sm:text-3xl font-black text-blue-950 font-['Outfit'] tracking-tight flex items-baseline gap-2">
				<span>{summary.todaySessions}</span>
				<span class="text-xs font-bold text-blue-700 font-['Anek_Bangla']">টি সেশন</span>
			</div>
			<div class="mt-2 text-[11px] font-medium text-blue-700 flex items-center gap-2">
				<span>নির্বাচিত সময়ের মোট স্বতন্ত্র ভিজিট</span>
				{#if summary.adminVisitsCount > 0}
					<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
						<ShieldCheck class="w-3 h-3" />
						{summary.adminVisitsCount} অ্যাডমিন
					</span>
				{/if}
			</div>
		</div>

		<!-- Card 3: Total Pageviews -->
		<div class="bg-gradient-to-br from-[#fdf4ff] via-[#ffffff] to-[#fae8ff]/60 p-4 sm:p-5 rounded-3xl border border-[#f5d0fe] shadow-xs hover:shadow-md transition-all group">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-purple-800">মোট পেজভিউ</span>
				<div class="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shadow-purple-500/25">
					<Eye class="w-4 h-4 stroke-[2.5]" />
				</div>
			</div>
			<div class="text-2xl sm:text-3xl font-black text-purple-950 font-['Outfit'] tracking-tight flex items-baseline gap-2">
				<span>{summary.todayPageviews}</span>
				<span class="text-xs font-bold text-purple-700 font-['Anek_Bangla']">বার ভিউ</span>
			</div>
			<div class="mt-2 text-[11px] font-medium text-purple-700">
				স্টোরের পেজ ও ল্যান্ডিং ব্রাউজিং
			</div>
		</div>

		<!-- Card 4: Conversion Rate -->
		<div class="bg-gradient-to-br from-[#fffbeb] via-[#ffffff] to-[#fef3c7]/60 p-4 sm:p-5 rounded-3xl border border-[#fde68a] shadow-xs hover:shadow-md transition-all group">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-amber-800">ভিজিটর কনভার্সন রেট</span>
				<div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shadow-amber-500/25">
					<TrendingUp class="w-4 h-4 stroke-[2.5]" />
				</div>
			</div>
			<div class="text-2xl sm:text-3xl font-black text-amber-950 font-['Outfit'] tracking-tight flex items-baseline gap-2">
				<span>{summary.conversionRate}%</span>
				<span class="text-xs font-bold text-amber-700 font-['Anek_Bangla']">অর্ডার সাকসেস</span>
			</div>
			<div class="mt-2 text-[11px] font-medium text-amber-700">
				ভিজিটর থেকে অর্ডারে রূপান্তর
			</div>
		</div>
	</div>

	<!-- DUAL ANALYTICS: TRAFFIC SOURCES + DEVICE BREAKDOWN -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
		<!-- 1. Traffic Sources Breakdown -->
		<Card class="rounded-3xl border-slate-200/90 shadow-2xs overflow-hidden bg-white">
			<div class="p-5 border-b border-slate-100 flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-indigo-50 text-[#5845eb] flex items-center justify-center">
						<Share2 class="w-4 h-4 stroke-[2]" />
					</div>
					<div>
						<h3 class="text-sm sm:text-base font-bold text-slate-900">ট্রাফিক সোর্স ও রেফারার</h3>
						<p class="text-[11px] text-slate-500">ভিজিটররা কোথা থেকে আপনার স্টোরে প্রবেশ করছে</p>
					</div>
				</div>
				<Badge variant="outline" class="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
					শীর্ষ সোর্স: {summary.topSource}
				</Badge>
			</div>

			<CardContent class="p-5 space-y-3.5">
				{#if summary.sourcesBreakdown.length === 0}
					<div class="text-center py-8 text-slate-400 text-xs">
						এখনো কোনো ট্রাফিক সোর্স রেকর্ড হয়নি।
					</div>
				{:else}
					{#each summary.sourcesBreakdown as src}
						<div class="space-y-1.5">
							<div class="flex items-center justify-between text-xs">
								<div class="flex items-center gap-2">
									<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs whitespace-nowrap {getSourceBadgeClass(src.source)}">
										<span class="w-1.5 h-1.5 rounded-full shrink-0 {getSourceDotClass(src.source)}"></span>
										<span>{src.source}</span>
									</span>
								</div>
								<div class="flex items-center gap-3">
									<span class="font-bold text-slate-800">{src.count} ভিজিটর</span>
									<span class="font-bold text-indigo-600 font-['Outfit'] w-10 text-right">{src.percentage}%</span>
								</div>
							</div>
							<!-- Progress bar -->
							<div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
								<div
									class="h-full rounded-full bg-gradient-to-r from-[#5845eb] to-[#7c3aed] transition-all duration-500"
									style="width: {src.percentage}%"
								></div>
							</div>
						</div>
					{/each}
				{/if}
			</CardContent>
		</Card>

		<!-- 2. Device & Platform Breakdown -->
		<Card class="rounded-3xl border-slate-200/90 shadow-2xs overflow-hidden bg-white">
			<div class="p-5 border-b border-slate-100 flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
						<Smartphone class="w-4 h-4 stroke-[2]" />
					</div>
					<div>
						<h3 class="text-sm sm:text-base font-bold text-slate-900">ডিভাইস ও ব্রাউজার অ্যানালিটিক্স</h3>
						<p class="text-[11px] text-slate-500">মোবাইল বনাম ডেস্কটপ ব্যবহারকারীর অনুপাত</p>
					</div>
				</div>
			</div>

			<CardContent class="p-5 space-y-4">
				{#if summary.deviceBreakdown.length === 0}
					<div class="text-center py-8 text-slate-400 text-xs">
						এখনো কোনো ডিভাইস তথ্য রেকর্ড হয়নি।
					</div>
				{:else}
					<div class="grid grid-cols-3 gap-3">
						{#each summary.deviceBreakdown as dev}
							<div class="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 text-center">
								<div class="w-8 h-8 mx-auto mb-2 rounded-xl bg-white shadow-2xs flex items-center justify-center text-slate-700">
									{#if dev.device === 'mobile'}
										<Smartphone class="w-4 h-4 text-emerald-600" />
									{:else if dev.device === 'tablet'}
										<Tablet class="w-4 h-4 text-blue-600" />
									{:else}
										<Monitor class="w-4 h-4 text-purple-600" />
									{/if}
								</div>
								<div class="text-xs font-bold text-slate-700 capitalize">
									{dev.device === 'mobile' ? 'মোবাইল' : dev.device === 'tablet' ? 'ট্যাবলেট' : 'ডেস্কটপ'}
								</div>
								<div class="text-lg font-black text-slate-900 font-['Outfit'] mt-0.5">
									{dev.percentage}%
								</div>
								<div class="text-[10px] text-slate-500">
									{dev.count} ভিজিটর
								</div>
							</div>
						{/each}
					</div>

					<div class="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 flex items-center gap-2">
						<Sparkles class="w-4 h-4 text-indigo-600 shrink-0" />
						<span>টিপস: বাংলাদেশে শতকরা ৯০%-এর বেশি ই-কমার্স ট্রাফিক মোবাইল ডিভাইসের মাধ্যমে আসে।</span>
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>

	<!-- SECOND DUAL SECTION: TOP VISITED PAGES + GEOGRAPHIC CITIES -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
		<!-- 1. Top Visited Pages -->
		<Card class="rounded-3xl border-slate-200/90 shadow-2xs overflow-hidden bg-white">
			<div class="p-5 border-b border-slate-100 flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
						<Eye class="w-4 h-4 stroke-[2]" />
					</div>
					<div>
						<h3 class="text-sm sm:text-base font-bold text-slate-900">জনপ্রিয় পেজ ও ল্যান্ডিং পেজ</h3>
						<p class="text-[11px] text-slate-500">কোন পেজে সবচেয়ে বেশি ট্রাফিক ভিজিট করেছে</p>
					</div>
				</div>
			</div>

			<CardContent class="p-0">
				{#if summary.topPages.length === 0}
					<div class="text-center py-8 text-slate-400 text-xs">
						এখনো কোনো পেজভিউ রেকর্ড হয়নি।
					</div>
				{:else}
					<div class="divide-y divide-slate-100">
						{#each summary.topPages as page}
							<div class="p-3.5 px-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
								<div class="min-w-0 pr-3">
									<div class="text-xs font-bold text-slate-900 truncate">
										{page.title}
									</div>
									<div class="text-[11px] font-mono text-slate-400 truncate">
										{page.path}
									</div>
								</div>
								<div class="flex items-center gap-2 shrink-0">
									<Badge variant="outline" class="font-bold text-slate-700 bg-slate-50">
										{page.views} ভিউ
									</Badge>
									<a
										href={page.path}
										target="_blank"
										class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
										title="পেজটি নতুন ট্যাবে দেখুন"
									>
										<ArrowUpRight class="w-4 h-4" />
									</a>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- 2. Geographic Cities Breakdown -->
		<Card class="rounded-3xl border-slate-200/90 shadow-2xs overflow-hidden bg-white">
			<div class="p-5 border-b border-slate-100 flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
						<MapPin class="w-4 h-4 stroke-[2]" />
					</div>
					<div>
						<h3 class="text-sm sm:text-base font-bold text-slate-900">ভৌগোলিক অঞ্চল (বাংলাদেশ)</h3>
						<p class="text-[11px] text-slate-500">কোন কোন জেলা ও শহর থেকে ভিজিটর আসছে</p>
					</div>
				</div>
			</div>

			<CardContent class="p-5 space-y-3.5">
				{#if summary.topCities.length === 0}
					<div class="text-center py-8 text-slate-400 text-xs">
						এখনো কোনো অঞ্চলভিত্তিক ডেটা রেকর্ড হয়নি।
					</div>
				{:else}
					{#each summary.topCities as city}
						<div class="space-y-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-slate-800 flex items-center gap-1.5">
									<MapPin class="w-3.5 h-3.5 text-emerald-600" />
									{city.city}
								</span>
								<span class="font-bold text-emerald-700 font-['Outfit']">{city.count} জন</span>
							</div>
							<div class="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
								<div
									class="h-full rounded-full bg-emerald-500"
									style="width: {Math.min(100, (city.count / (summary.todaySessions || 1)) * 100)}%"
								></div>
							</div>
						</div>
					{/each}
				{/if}
			</CardContent>
		</Card>
	</div>

	<!-- REAL-TIME LIVE ACTIVITY STREAM TABLE -->
	<Card class="rounded-3xl border-slate-200/90 shadow-2xs overflow-hidden bg-white">
		<div class="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div class="flex items-center gap-2.5">
				<div class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
					<Clock class="w-4 h-4 stroke-[2]" />
				</div>
				<div>
					<h3 class="text-sm sm:text-base font-bold text-slate-900">সাম্প্রতিক ভিজিটর লাইভ স্ট্রিম</h3>
					<p class="text-[11px] text-slate-500">সর্বশেষ ভিজিটদের বিস্তারিত তথ্য ও রিয়েল-টাইম পাথ</p>
				</div>
			</div>

			<!-- Quick Stream Filters -->
			<div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto max-w-full">
				<button
					type="button"
					onclick={() => (streamFilter = 'all')}
					class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 {streamFilter === 'all'
						? 'bg-white text-slate-900 shadow-2xs'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					সব ভিজিটর ({summary.recentVisitors.length})
				</button>

				<button
					type="button"
					onclick={() => (streamFilter = 'bd')}
					class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 {streamFilter === 'bd'
						? 'bg-emerald-600 text-white shadow-2xs'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					<span>🇧🇩 বাংলাদেশ কাস্টমার ({bdVisitorsCount})</span>
				</button>

				<button
					type="button"
					onclick={() => (streamFilter = 'facebook')}
					class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 {streamFilter === 'facebook'
						? 'bg-blue-600 text-white shadow-2xs'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					<span>Facebook Ads ({fbVisitorsCount})</span>
				</button>

				<button
					type="button"
					onclick={() => (streamFilter = 'admin')}
					class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 {streamFilter === 'admin'
						? 'bg-amber-600 text-white shadow-2xs'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					<ShieldCheck class="w-3.5 h-3.5" />
					<span>অ্যাডমিন ({adminVisitorsCount})</span>
				</button>
			</div>
		</div>

		<CardContent class="p-0">
			<div class="overflow-x-auto w-full">
				<Table class="w-full min-w-[760px]">
					<TableHeader class="bg-slate-50/90 border-b border-slate-200">
						<TableRow>
							<TableHead class="w-[120px] text-xs font-bold text-slate-700 py-3.5 px-4 whitespace-nowrap">সময়</TableHead>
							<TableHead class="min-w-[200px] text-xs font-bold text-slate-700 py-3.5 px-4">পেজ পাথ ও বিবরণ</TableHead>
							<TableHead class="w-[160px] text-xs font-bold text-slate-700 py-3.5 px-4 whitespace-nowrap">ট্রাফিক সোর্স</TableHead>
							<TableHead class="w-[110px] text-xs font-bold text-slate-700 py-3.5 px-4 whitespace-nowrap">ডিভাইস</TableHead>
							<TableHead class="w-[140px] text-xs font-bold text-slate-700 py-3.5 px-4 whitespace-nowrap">শহর/লোকেশন</TableHead>
							<TableHead class="w-[90px] text-xs font-bold text-slate-700 py-3.5 px-4 text-right whitespace-nowrap">অ্যাকশন</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody class="divide-y divide-slate-100">
						{#if filteredRecentVisitors.length === 0}
							<TableRow>
								<TableCell colspan={6} class="text-center py-10 text-xs text-slate-400">
									{#if streamFilter === 'bd'}
										এখনো কোনো বাংলাদেশী ভিজিটর ফিল্টারে মেলেনি।
									{:else if streamFilter === 'facebook'}
										এখনো কোনো Facebook Ads ভিজিটর ফিল্টারে মেলেনি।
									{:else if streamFilter === 'admin'}
										এখনো কোনো অ্যাডমিন ভিজিট রেকর্ড হয়নি।
									{:else}
										এখনো কোনো সাম্প্রতিক ভিজিটর অ্যাক্টিভিটি নেই।
									{/if}
								</TableCell>
							</TableRow>
						{:else}
							{#each filteredRecentVisitors as v}
								<TableRow class="hover:bg-slate-50/80 transition-colors">
									<TableCell class="w-[120px] text-xs font-mono text-slate-500 whitespace-nowrap py-3.5 px-4">
										{formatTimeAgo(v.createdAt)}
									</TableCell>
									<TableCell class="min-w-[200px] py-3.5 px-4">
										<div class="text-xs font-bold text-slate-900 truncate max-w-[260px] flex items-center gap-1.5" title={v.pageTitle}>
											<span class="truncate">{v.pageTitle}</span>
											{#if v.isAdmin}
												<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold shrink-0">
													<ShieldCheck class="w-3 h-3" />
													অ্যাডমিন
												</span>
											{/if}
										</div>
										<div class="text-[11px] font-mono text-slate-400 truncate max-w-[260px]" title={v.path}>{v.path}</div>
									</TableCell>
									<TableCell class="w-[160px] whitespace-nowrap py-3.5 px-4">
										<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold whitespace-nowrap shrink-0 {getSourceBadgeClass(v.trafficSource)}">
											<span class="w-1.5 h-1.5 rounded-full shrink-0 {getSourceDotClass(v.trafficSource)}"></span>
											<span>{v.trafficSource}</span>
										</span>
									</TableCell>
									<TableCell class="w-[110px] text-xs text-slate-600 capitalize whitespace-nowrap py-3.5 px-4">
										<div class="inline-flex items-center gap-1.5">
											{#if v.deviceType === 'mobile'}
												<Smartphone class="w-3.5 h-3.5 text-slate-400 shrink-0" />
												<span>Mobile</span>
											{:else if v.deviceType === 'desktop'}
												<Monitor class="w-3.5 h-3.5 text-slate-400 shrink-0" />
												<span>Desktop</span>
											{:else}
												<Tablet class="w-3.5 h-3.5 text-slate-400 shrink-0" />
												<span>Tablet</span>
											{/if}
										</div>
									</TableCell>
									<TableCell class="w-[140px] text-xs text-slate-600 whitespace-nowrap py-3.5 px-4">
										<span class="inline-flex items-center gap-1.5">
											<MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
											<span class="truncate max-w-[110px]" title={v.city}>{v.city}</span>
										</span>
									</TableCell>
									<TableCell class="w-[90px] text-right whitespace-nowrap py-3.5 px-4">
										<form method="POST" action="?/blockIp" class="inline-block">
											<input type="hidden" name="ipAddress" value={v.ipAddress} />
											<Button
												type="submit"
												variant="ghost"
												size="sm"
												class="rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold h-8 px-2.5 cursor-pointer"
												title="সন্দেহজনক ভিজিটর আইপি ব্লক করুন"
											>
												<ShieldAlert class="w-3.5 h-3.5 mr-1" />
												ব্লক
											</Button>
										</form>
									</TableCell>
								</TableRow>
							{/each}
						{/if}
					</TableBody>
				</Table>
			</div>
		</CardContent>
	</Card>
</div>
