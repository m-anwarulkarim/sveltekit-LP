<script lang="ts">
	import { StoreLayout } from '#lib';
	import { Card, CardContent, Badge } from '#lib/components/ui';
	import { HelpCircle, ChevronDown } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let openIndex = $state<number | null>(0);

	const faqs = [
		{
			q: 'বীজের অঙ্কুরোদগমের হার কেমন?',
			a: 'আমাদের প্রতিটি ব্যাচের বীজ সরাসরি জার্মিনেশন টেস্ট করা হয় এবং গড় অঙ্কুরোদগমের হার ৯৫%-এর বেশি।'
		},
		{
			q: 'ডেলিভারি পেতে কতদিন সময় লাগবে?',
			a: 'ঢাকার ভেতরে ২৪-৪৮ ঘণ্টা এবং ঢাকার বাইরে ৪৮-৭২ ঘণ্টার মধ্যে নির্ভরযোগ্য কুরিয়ারে পণ্য পৌঁছে দেওয়া হয়।'
		},
		{
			q: 'ক্যাশ অন ডেলিভারি (COD) কি প্রযোজ্য?',
			a: 'হ্যাঁ, সারা বাংলাদেশেই হোম ডেলিভারি পেয়ে পণ্য দেখে মূল্য পরিশোধ (Cash on Delivery) করতে পারবেন।'
		},
		{
			q: 'বীজ নষ্ট বা মেয়াদোত্তীর্ণ হলে কী করব?',
			a: 'আমরা ৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি দিয়ে থাকি। ক্ষতিগ্রস্ত প্যাকেট পেলে আমাদের হটলাইনে জানালে সাথে সাথে নতুন প্যাকেট পাঠানো হয়।'
		},
		{
			q: 'কোন মৌসুমে কোন বীজ বুনতে হয় তা কীভাবে জানব?',
			a: 'প্রতিটি প্যাকেটের গায়ে এবং আমাদের ব্লগে কোন মাসে কোন বীজ রোপণ করতে হবে তার বিস্তারিত চার্ট দেওয়া রয়েছে।'
		}
	];
</script>

<svelte:head>
	<title>সাধারণ জিজ্ঞাসা (FAQs) | AURA</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-8 font-['Hind_Siliguri',sans-serif]">
		
		<div class="text-center space-y-2">
			<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200">
				Help & Support
			</Badge>
			<h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
				সাধারণ জিজ্ঞাসা ও উত্তর (FAQs)
			</h1>
			<p class="text-xs sm:text-sm text-slate-500">গ্রাহকদের সর্বাধিক জিজ্ঞাসিত প্রশ্নসমূহের উত্তর</p>
		</div>

		<div class="space-y-3">
			{#each faqs as item, i}
				<Card class="border-slate-200/90 shadow-2xs overflow-hidden">
					<button
						type="button"
						onclick={() => (openIndex = openIndex === i ? null : i)}
						class="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
					>
						<span class="text-sm sm:text-base font-bold text-slate-900">
							{item.q}
						</span>
						<ChevronDown class="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 {openIndex === i ? 'rotate-180 text-[#5845eb]' : ''}" />
					</button>
					{#if openIndex === i}
						<div class="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
							{item.a}
						</div>
					{/if}
				</Card>
			{/each}
		</div>

	</div>
</StoreLayout>
