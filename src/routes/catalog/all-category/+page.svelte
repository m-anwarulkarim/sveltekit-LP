<script lang="ts">
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import type { PageData } from './$types';
	import { Badge } from '#lib/components/ui';
	import { Home, ChevronRight, Layers, ArrowRight } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const defaultFallbackCategories = [
		{ name: 'বই (Books)', slug: 'books', count: 120, icon: '📚', desc: 'সাহিত্য, উপন্যাস, ধর্মীয় ও সমকালীন বই', color: 'from-amber-50 to-orange-50' },
		{ name: 'Electronics', slug: 'electronics', count: 48, icon: '🎧', desc: 'অডিও গিয়ার, হেডফোন, স্পিকার ও স্মার্ট গ্যাজেট', color: 'from-blue-50 to-cyan-50' },
		{ name: 'Ebook', slug: 'ebook', count: 210, icon: '📱', desc: 'ডিজিটাল ই-বুক ও পিডিএফ সংগ্রহ', color: 'from-slate-50 to-indigo-50' },
		{ name: 'Beauty & Health', slug: 'beauty-health', count: 85, icon: '🧴', desc: 'স্কিনকেয়ার, সিরাম, ময়েশ্চারাইজার ও কসমেটিকস', color: 'from-pink-50 to-rose-50' },
		{ name: 'Audiobook', slug: 'audiobook', count: 64, icon: '🎙️', desc: 'অডিও বুক ও পডকাস্ট লিসনিং কালেকশন', color: 'from-teal-50 to-emerald-50' },
		{ name: 'ভর্তি পরীক্ষার প্রস্তুতি', slug: 'admission-prep', count: 95, icon: '🎓', desc: 'বিশ্ববিদ্যালয় ও মেডিকেল এডমিশন গাইড', color: 'from-indigo-50 to-blue-50' },
		{ name: 'Stationery', slug: 'stationery', count: 140, icon: '✏️', desc: 'স্কুল, কলেজ ও অফিস স্টেশনারি সরঞ্জাম', color: 'from-yellow-50 to-amber-50' },
		{ name: 'Science Kit', slug: 'science-kit', count: 32, icon: '🔬', desc: 'বাচ্চাদের শিক্ষণীয় সায়েন্স ও ইলেকট্রনিক্স কিট', color: 'from-orange-50 to-red-50' },
		{ name: 'Groceries', slug: 'groceries', count: 180, icon: '🛒', desc: 'নিত্যপ্রয়োজনীয় অর্গানিক খাদ্য ও গ্রোসারি', color: 'from-green-50 to-emerald-50' },
		{ name: 'Fashion & Style', slug: 'fashion', count: 75, icon: '👕', desc: 'প্রিমিয়াম টি-শার্ট, স্নিকার্স ও ফ্যাশন অ্যাকসেসরিজ', color: 'from-fuchsia-50 to-pink-50' },
		{ name: 'Smart Gadgets', slug: 'smart-gadgets', count: 52, icon: '⌚', desc: 'স্মার্টওয়াচ, চার্জার, কেবল ও ব্লুটুথ ডিভাইস', color: 'from-sky-50 to-blue-50' },
		{ name: 'Home & Living', slug: 'home-living', count: 40, icon: '🛋️', desc: 'হোম ডেকর, ফার্নিচার ও লাইফস্টাইল উপাদান', color: 'from-emerald-50 to-teal-50' }
	];

	const colorPalette = [
		'from-blue-50 to-cyan-50',
		'from-amber-50 to-orange-50',
		'from-emerald-50 to-teal-50',
		'from-purple-50 to-pink-50',
		'from-indigo-50 to-blue-50',
		'from-rose-50 to-pink-50'
	];

	let allCategories = $derived.by(() => {
		if (data?.categories && data.categories.length > 0) {
			return data.categories.map((c: any, index: number) => {
				const fallback = defaultFallbackCategories.find(
					(f) => f.slug === c.slug || f.name.toLowerCase().includes(c.name.toLowerCase())
				);
				return {
					id: c.id,
					name: c.name,
					slug: c.slug,
					count: c.productsCount ?? 0,
					icon: fallback?.icon || '📦',
					desc: c.description || fallback?.desc || `${c.name} ক্যাটাগরির প্রিমিয়াম কালেকশন`,
					color: fallback?.color || colorPalette[index % colorPalette.length],
					image: c.image
				};
			});
		}
		return defaultFallbackCategories;
	});
</script>

<svelte:head>
	<title>সকল ক্যাটাগরি | AURA Store</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 font-['Anek_Bangla',sans-serif] select-none">
		
		<!-- Breadcrumbs -->
		<nav class="flex items-center gap-1.5 text-xs text-slate-400 mb-3 sm:mb-4 overflow-x-auto no-scrollbar py-1">
			<a href="/" class="hover:text-slate-800 transition-colors flex items-center gap-1 shrink-0">
				<Home class="w-3.5 h-3.5" />
				<span>হোম</span>
			</a>
			<ChevronRight class="w-3.5 h-3.5 text-slate-300 shrink-0" />
			<span class="text-slate-900 font-bold">সকল ক্যাটাগরি</span>
		</nav>

		<!-- Title Header -->
		<div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 mb-4 sm:mb-6">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
					<Layers class="w-5 h-5" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-lg sm:text-2xl font-black text-slate-900 font-['Outfit']">সকল ক্যাটাগরি তালিকা</h1>
						<Badge variant="blue" class="text-xs font-black px-2 py-0.5 rounded-full">
							{allCategories.length} টি
						</Badge>
					</div>
					<p class="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">আপনার পছন্দের ক্যাটাগরি বেছে নিন এবং এক্সক্লুসিভ পণ্যসমূহ ব্রাউজ করুন</p>
				</div>
			</div>
		</div>

		<!-- Categories Grid: Exactly 2 cards per row on mobile, 3 on tablet, 4 on desktop -->
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4.5">
			{#each allCategories as cat}
				<a
					href="/categories/{cat.slug}"
					class="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#2563eb]/50 transition-all duration-200 flex flex-col items-center text-center justify-between group cursor-pointer hover:-translate-y-1 relative"
				>
					<!-- Category Icon with Soft Background -->
					<div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr {cat.color} border border-slate-100 flex items-center justify-center text-3xl sm:text-4xl shadow-2xs group-hover:scale-110 transition-transform mb-2 sm:mb-3">
						{cat.icon}
					</div>

					<!-- Category Name & Short Info -->
					<div class="w-full min-w-0 space-y-1 mb-2">
						<h3 class="font-bold text-slate-900 text-xs sm:text-sm md:text-[15px] group-hover:text-[#2563eb] transition-colors truncate" title={cat.name}>
							{cat.name}
						</h3>
						<p class="text-[10px] sm:text-xs text-slate-400 line-clamp-1 hidden sm:block">
							{cat.desc}
						</p>
					</div>

					<!-- Bottom Count Badge & Arrow Indicator -->
					<div class="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400 group-hover:text-[#2563eb] transition-colors mt-auto">
						<Badge variant="blue" class="text-[9.5px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-full">
							{cat.count}+ পণ্য
						</Badge>
						<ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
					</div>
				</a>
			{/each}
		</div>

	</div>
</StoreLayout>
