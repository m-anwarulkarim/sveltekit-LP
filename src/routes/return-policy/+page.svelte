<script lang="ts">
	import { StoreLayout } from '#lib';
	import { Card, CardContent, Badge } from '#lib/components/ui';
	import { RotateCcw, CheckCircle2, Clock } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>রিটার্ন ও এক্সচেঞ্জ নীতি (Return & Exchange) | AURA</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-8 font-['Hind_Siliguri',sans-serif]">
		
		<div class="text-center space-y-2">
			<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200">
				Hassle-Free Return
			</Badge>
			<h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
				রিটার্ন ও এক্সচেঞ্জ নীতি (Return & Exchange Policy)
			</h1>
			<p class="text-xs sm:text-sm text-slate-500">গ্রাহক সন্তুষ্টিই আমাদের প্রথম অগ্রাধিকার</p>
		</div>

		<Card class="border-slate-200/90 shadow-2xs">
			<CardContent class="p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
				<section class="space-y-2">
					<h3 class="text-base font-bold text-slate-900">১. ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি</h3>
					<p>
						প্যাকেট ক্ষতিগ্রস্ত হলে, ভুল পণ্য সরবরাহ করা হলে অথবা বীজের মেয়াদোত্তীর্ণ প্যাকেজিং থাকলে ডেলিভারি পাওয়ার ৭ দিনের মধ্যে ছবি সহ আমাদের হোয়াটসঅ্যাপে জানালে বিনামূল্যে রিপ্লেসমেন্ট প্রদান করা হয়।
					</p>
				</section>

				<section class="space-y-2">
					<h3 class="text-base font-bold text-slate-900">২. রিটার্ন করার নিয়মাবলী</h3>
					<ul class="list-disc pl-5 space-y-1">
						<li>পণ্যটি তার আদি প্যাকেজিং সহ অক্ষত থাকতে হবে।</li>
						<li>ডেলিভারি ম্যানের সামনে পণ্য চেক করে নেওয়া উত্তম।</li>
						<li>যেকোনো সমস্যার ক্ষেত্রে আমাদের হটলাইন <strong>09678 123 456</strong> নম্বরে অবিলম্বে জানান।</li>
					</ul>
				</section>

				<section class="space-y-2">
					<h3 class="text-base font-bold text-slate-900">৩. রিফান্ড প্রক্রিয়া</h3>
					<p>
						অনলাইন পেমেন্টের ক্ষেত্রে রিটার্ন অনুমোদিত হলে ৩-৫ কার্যদিবসের মধ্যে যে মাধ্যম দিয়ে পেমেন্ট করা হয়েছিল (বিকাশ/নগদ/ব্যাংক কার্ড) সেখানেই সম্পূর্ণ টাকা ফেরত দেওয়া হয়।
					</p>
				</section>
			</CardContent>
		</Card>

	</div>
</StoreLayout>
