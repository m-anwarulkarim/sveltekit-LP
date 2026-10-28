<script lang="ts">
	import { StoreLayout } from '#lib';
	import { Card, CardContent, Badge } from '#lib/components/ui';
	import { FileText, ShieldCheck } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>শর্তাবলী (Terms & Conditions) | AURA</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-8 font-['Anek_Bangla',sans-serif]">
		
		<div class="text-center space-y-2">
			<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200">
				Legal & Policies
			</Badge>
			<h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
				ব্যবহারের শর্তাবলী (Terms & Conditions)
			</h1>
			<p class="text-xs sm:text-sm text-slate-500">সর্বশেষ আপডেট: অক্টোবর ২০২৬</p>
		</div>

		<Card class="border-slate-200/90 shadow-2xs">
			<CardContent class="p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
				<section class="space-y-2">
					<h3 class="text-base font-bold text-slate-900">১. সাধারণ নির্দেশিকা</h3>
					<p>
						AURA ওয়েবসাইট ব্যবহার করে পণ্য অর্ডার করার মাধ্যমে আপনি আমাদের নীতি ও শর্তাবলীতে সম্মত হচ্ছেন। প্ল্যাটফর্মের সমস্ত কনটেন্ট, ছবি ও তথ্য আমাদের নিজস্ব স্বত্বাধিকারভুক্ত।
					</p>
				</section>

				<section class="space-y-2">
					<h3 class="text-base font-bold text-slate-900">২. অর্ডার ও পেমেন্ট</h3>
					<p>
						অর্ডার প্লেস করার পর আমাদের প্রতিনিধি আপনার দেয়া মোবাইল নম্বরে কল করে অর্ডার কনফার্ম করবেন। ক্যাশ অন ডেলিভারি (COD) ছাড়াও বিকাশ, নগদ বা কার্ডের মাধ্যমে সম্পূর্ণ নিরাপদ ডিজিটাল পেমেন্ট সুবিধা রয়েছে।
					</p>
				</section>

				<section class="space-y-2">
					<h3 class="text-base font-bold text-slate-900">৩. ডেলিভারি ও প্যাকেজিং</h3>
					<p>
						অর্ডার কনফার্মেশনের পর ঢাকার ভেতরে ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ৪৮-৭২ ঘণ্টার মধ্যে নির্ভরযোগ্য কুরিয়ারের মাধ্যমে পণ্য গ্রাহকের ঠিকানায় পৌঁছে দেওয়া হয়।
					</p>
				</section>

				<section class="space-y-2">
					<h3 class="text-base font-bold text-slate-900">৪. বীজের গুণমান ও অঙ্কুরোদগম</h3>
					<p>
						আমাদের সব বীজ প্যাকেটজাত ও সিল করা অবস্থায় সরবরাহ করা হয়। আবহাওয়া, মাটি ও চাষ পদ্ধতির ভিন্নতার কারণে অঙ্কুরোদগমে তারতম্য হতে পারে; তবে প্যাকেটে উল্লিখিত নির্দেশিকা মেনে চললে সর্বোত্তম ফলাফল পাওয়া যায়।
					</p>
				</section>
			</CardContent>
		</Card>

	</div>
</StoreLayout>
