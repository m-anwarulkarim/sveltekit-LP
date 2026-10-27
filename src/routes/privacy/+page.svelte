<script lang="ts">
	import { StoreLayout } from '#lib';
	import { Card, CardContent, Badge } from '#lib/components/ui';
	import { Shield, Lock } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>গোপনীয়তা নীতি (Privacy Policy) | AURA</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-8 font-['Hind_Siliguri',sans-serif]">
		
		<div class="text-center space-y-2">
			<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200">
				Privacy & Data Protection
			</Badge>
			<h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
				গোপনীয়তা নীতি (Privacy Policy)
			</h1>
			<p class="text-xs sm:text-sm text-slate-500">আপনার তথ্যের সর্বোচ্চ নিরাপত্তা বজায় রাখা আমাদের দায়িত্ব</p>
		</div>

		<Card class="border-slate-200/90 shadow-2xs">
			<CardContent class="p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
				<section class="space-y-2">
					<h3 class="text-base font-bold text-slate-900">১. সংগৃহীত তথ্য</h3>
					<p>
						অর্ডার প্রসেসিং ও ডেলিভারির সুবিধার্থে গ্রাহকের নাম, মোবাইল নম্বর, ইমেইল ও সম্পূর্ণ ঠিকানা সংগ্রহ করা হয়। আপনার সম্মতি ছাড়া এই তথ্য কোনো তৃতীয় পক্ষের সাথে ভাগ করা হয় না।
					</p>
				</section>

				<section class="space-y-2">
					<h3 class="text-base font-bold text-slate-900">২. ডিজিটাল পেমেন্ট নিরাপত্তা</h3>
					<p>
						আমরা কোনো কার্ড বা মোবাইল ব্যাংকিং পিন বা ওটিপি সংরক্ষণ করি না। সমস্ত লেনদেন বাংলাদেশ ব্যাংক অনুমোদিত এসএসএল কমার্জ বা সরাসরি বিকাশ/নগদ গেটওয়ের মাধ্যমে সুরক্ষিতভাবে সম্পন্ন হয়।
					</p>
				</section>

				<section class="space-y-2">
					<h3 class="text-base font-bold text-slate-900">৩. তথ্যের নিয়ন্ত্রণ ও আপডেট</h3>
					<p>
						গ্রাহক যেকোনো সময় তার অ্যাকাউন্ট থেকে তথ্য আপডেট করতে পারবেন অথবা ডাটাবেস থেকে তথ্য অপসারণের জন্য আমাদের কাস্টমার সাপোর্টে যোগাযোগ করতে পারেন।
					</p>
				</section>
			</CardContent>
		</Card>

	</div>
</StoreLayout>
