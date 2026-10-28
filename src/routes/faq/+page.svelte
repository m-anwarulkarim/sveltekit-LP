<script lang="ts">
	import { StoreLayout } from '#lib';
	import { Card, CardContent, Badge, Accordion, AccordionItem } from '#lib/components/ui';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const faqs = [
		{
			id: 'faq-1',
			q: 'বীজের অঙ্কুরোদগমের হার কেমন?',
			a: 'আমাদের প্রতিটি ব্যাচের বীজ সরাসরি জার্মিনেশন টেস্ট করা হয় এবং গড় অঙ্কুরোদগমের হার ৯৫%-এর বেশি।'
		},
		{
			id: 'faq-2',
			q: 'ডেলিভারি পেতে কতদিন সময় লাগবে?',
			a: 'ঢাকার ভেতরে ২৪-৪৮ ঘণ্টা এবং ঢাকার বাইরে ৪৮-৭২ ঘণ্টার মধ্যে নির্ভরযোগ্য কুরিয়ারে পণ্য পৌঁছে দেওয়া হয়।'
		},
		{
			id: 'faq-3',
			q: 'ক্যাশ অন ডেলিভারি (COD) কি প্রযোজ্য?',
			a: 'হ্যাঁ, সারা বাংলাদেশেই হোম ডেলিভারি পেয়ে পণ্য দেখে মূল্য পরিশোধ (Cash on Delivery) করতে পারবেন।'
		},
		{
			id: 'faq-4',
			q: 'বীজ নষ্ট বা মেয়াদোত্তীর্ণ হলে কী করব?',
			a: 'আমরা ৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি দিয়ে থাকি। ক্ষতিগ্রস্ত প্যাকেট পেলে আমাদের হটলাইনে জানালে সাথে সাথে নতুন প্যাকেট পাঠানো হয়।'
		},
		{
			id: 'faq-5',
			q: 'কোন মৌসুমে কোন বীজ বুনতে হয় তা কীভাবে জানব?',
			a: 'প্রতিটি প্যাকেটের গায়ে এবং আমাদের ব্লগে কোন মাসে কোন বীজ রোপণ করতে হবে তার বিস্তারিত চার্ট দেওয়া রয়েছে।'
		}
	];
</script>

<svelte:head>
	<title>সাধারণ জিজ্ঞাসা (FAQs) | AURA</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-8 font-['Anek_Bangla',sans-serif]">
		
		<div class="text-center space-y-2">
			<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200">
				Help & Support
			</Badge>
			<h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
				সাধারণ জিজ্ঞাসা ও উত্তর (FAQs)
			</h1>
			<p class="text-xs sm:text-sm text-slate-500">গ্রাহকদের সর্বাধিক জিজ্ঞাসিত প্রশ্নসমূহের উত্তর</p>
		</div>

		<!-- Accordion with shadcn UI Accordion & AccordionItem -->
		<Card class="border-slate-200/90 shadow-2xs overflow-hidden p-3 sm:p-6 bg-white">
			<CardContent class="p-0">
				<Accordion type="single" value="faq-1" class="divide-y divide-slate-100 border-none">
					{#each faqs as item}
						<AccordionItem
							value={item.id}
							title={item.q}
							class="py-1 px-3 border-none"
						>
							<p class="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 pb-2">
								{item.a}
							</p>
						</AccordionItem>
					{/each}
				</Accordion>
			</CardContent>
		</Card>

	</div>
</StoreLayout>
