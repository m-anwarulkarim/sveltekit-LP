<script lang="ts">
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import type { PageData } from './$types';
	import { Badge } from '#lib/components/ui';
	import { Home, ChevronRight, Layers, ArrowRight, FolderTree } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const siteName = $derived(data.websiteInfo?.websiteName || 'Store');

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
				return {
					id: c.id,
					name: c.name,
					slug: c.slug,
					count: c.productsCount ?? 0,
					icon: c.icon || '📦',
					desc: c.description || `${c.name} ক্যাটাগরির পণ্যসমূহ`,
					color: colorPalette[index % colorPalette.length],
					image: c.image
				};
			});
		}
		return [];
	});
</script>

<svelte:head>
	<title>সকল ক্যাটাগরি | {siteName}</title>
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
					<p class="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">আপনার পছন্দের ক্যাটাগরি বেছে নিন এবং পণ্যসমূহ ব্রাউজ করুন</p>
				</div>
			</div>
		</div>

		<!-- Categories Grid -->
		{#if allCategories.length > 0}
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4.5">
				{#each allCategories as cat}
					<a
						href="/categories/{cat.slug}"
						class="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#2563eb]/50 transition-all duration-200 flex flex-col items-center text-center justify-between group cursor-pointer hover:-translate-y-1 relative"
					>
						<!-- Category Icon with Soft Background -->
						<div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr {cat.color} border border-slate-100 flex items-center justify-center text-3xl sm:text-4xl shadow-2xs group-hover:scale-110 transition-transform mb-2 sm:mb-3">
							{#if cat.image}
								<img src={cat.image} alt={cat.name} class="w-8 h-8 object-contain" />
							{:else if cat.icon && cat.icon.length <= 4}
								<span>{cat.icon}</span>
							{:else}
								<FolderTree class="w-7 h-7 text-slate-700" />
							{/if}
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
		{:else}
			<div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-12 text-center text-slate-500 shadow-xs">
				<FolderTree class="w-12 h-12 text-slate-300 mx-auto mb-3" />
				<h3 class="text-base font-bold text-slate-700">কোনো ক্যাটাগরি তৈরি করা হয়নি</h3>
				<p class="text-xs text-slate-400 mt-1">অ্যাডমিন প্যানেল থেকে নতুন ক্যাটাগরি যোগ করুন।</p>
			</div>
		{/if}

	</div>
</StoreLayout>
