<script lang="ts">
	import { StoreLayout } from '#lib';
	import { Card, CardContent, Badge, Button } from '#lib/components/ui';
	import { BookOpen, Calendar, ArrowRight, Clock } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const blogs = [
		{
			id: 1,
			title: 'টবে লাল শাক ও পালং শাক চাষের সহজ ৫টি নিয়ম',
			category: 'ছাদবাগান গাইড',
			date: '২৪ অক্টোবর, ২০২৬',
			readTime: '৪ মিনিট',
			excerpt: 'ছাদ বা বারান্দার টবে মাত্র ২৫-৩০ দিনেই কীভাবে কীটনাশক ছাড়া তাজা লাল শাক উৎপাদন করবেন তার বিস্তারিত নির্দেশনা।'
		},
		{
			id: 2,
			title: 'হাইব্রিড মরিচের পাতা কোঁকড়ানো রোগ প্রতিকার ও পরিচর্যা',
			category: 'রোগবালাই দমন',
			date: '২০ অক্টোবর, ২০২৬',
			readTime: '৫ মিনিট',
			excerpt: 'মরিচ গাছের সাধারণ সমস্যাগুলোর মধ্যে পাতা কোঁকড়ানো অন্যতম। জানুন কীভাবে ঘরোয়া ও অর্গানিক উপায়ে রোগ দমন করবেন।'
		},
		{
			id: 3,
			title: 'ভার্মিকম্পোস্ট বা কেঁচো সারের জাদুকরী উপকারিতা',
			category: 'জৈব সার',
			date: '১৫ অক্টোবর, ২০২৬',
			readTime: '৩ মিনিট',
			excerpt: 'গাছের দ্রুত বৃদ্ধি ও মাটির উর্বরতা বাড়াতে রাসায়নিক সারের বিকল্প হিসেবে ভার্মিকম্পোস্টের গুরুত্ব অপরিসীম।'
		}
	];
</script>

<svelte:head>
	<title>লাইফস্টাইল ও শপিং ব্লগ (Blogs) | AURA</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-10 font-['Hind_Siliguri',sans-serif]">
		
		<div class="text-center space-y-2 max-w-2xl mx-auto">
			<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200">
				Gardening Knowledge Hub
			</Badge>
			<h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
				কৃষি ও ছাদবাগান সহায়িকা ব্লগ (Blogs)
			</h1>
			<p class="text-xs sm:text-sm text-slate-500">
				অভিজ্ঞ কৃষিবিদদের পরামর্শ ও সঠিক চাষপদ্ধতির টিপস নিয়ে আমাদের নিয়মিত ব্লগ আর্টিকেল।
			</p>
		</div>

		<!-- Blogs Grid -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			{#each blogs as blog}
				<Card class="border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
					<CardContent class="p-6 space-y-4">
						<div class="flex items-center justify-between text-[11px] text-slate-500">
							<Badge class="bg-indigo-50 text-[#5845eb] border border-indigo-200 font-bold text-[10px]">
								{blog.category}
							</Badge>
							<span class="flex items-center gap-1 font-medium">
								<Clock class="w-3 h-3" />
								{blog.readTime}
							</span>
						</div>

						<h3 class="text-base font-extrabold text-slate-900 leading-snug hover:text-[#5845eb] transition-colors cursor-pointer">
							{blog.title}
						</h3>

						<p class="text-xs text-slate-600 leading-relaxed">
							{blog.excerpt}
						</p>

						<div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#5845eb]">
							<span class="text-slate-400 font-normal">{blog.date}</span>
							<button type="button" class="flex items-center gap-1 hover:underline cursor-pointer">
								<span>বিস্তারিত পড়ুন</span>
								<ArrowRight class="w-3.5 h-3.5" />
							</button>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>

	</div>
</StoreLayout>
