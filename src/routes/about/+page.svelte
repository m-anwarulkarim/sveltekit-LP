<script lang="ts">
	import { StoreLayout } from '#lib';
	import { Card, CardContent, Badge } from '#lib/components/ui';
	import { Sparkles, ShieldCheck, Award, HeartHandshake, Leaf, Users } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>About Us | AURA</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-12 font-['Hind_Siliguri',sans-serif]">
		
		<!-- Hero Section -->
		<div class="text-center space-y-3 max-w-3xl mx-auto">
			<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200">
				About AURA
			</Badge>
			<h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
				Next-Gen E-Commerce & Curated Lifestyle Platform
			</h1>
			<p class="text-sm sm:text-base text-slate-600 leading-relaxed">
				AURA is a modern, technology-driven shopping destination dedicated to delivering authentic products, unmatched customer care, and seamless digital commerce experiences.
			</p>
		</div>

		<!-- 3 Core Values Grid -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- Value 1 -->
			<Card class="border-slate-200/90 shadow-2xs hover:shadow-sm transition-shadow">
				<CardContent class="p-6 space-y-3">
					<div class="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center border border-indigo-100">
						<Award class="w-6 h-6" />
					</div>
					<h3 class="text-base font-extrabold text-slate-900">শতভাগ অঙ্কুরোদগম নিশ্চয়তা</h3>
					<p class="text-xs text-slate-600 leading-relaxed">
						আমাদের প্রতিটি ব্যাচের বীজ ল্যাব টেস্ট ও মাঠ পরীক্ষার পর সংগ্রহ করা হয়, যাতে আপনারা পান ৯৫%+ অঙ্কুরোদগমের নিশ্চয়তা।
					</p>
				</CardContent>
			</Card>

			<!-- Value 2 -->
			<Card class="border-slate-200/90 shadow-2xs hover:shadow-sm transition-shadow">
				<CardContent class="p-6 space-y-3">
					<div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
						<Leaf class="w-6 h-6" />
					</div>
					<h3 class="text-base font-extrabold text-slate-900">অর্গানিক ও স্বাস্থ্যকর</h3>
					<p class="text-xs text-slate-600 leading-relaxed">
						কীটনাশকমুক্ত পুষ্টিকর শাক-সবজি উৎপাদনের উপযোগী দেশি ও আন্তর্জাতিক খ্যাতিসম্পন্ন সিড ব্রিডারদের প্রিমিয়াম বীজ।
					</p>
				</CardContent>
			</Card>

			<!-- Value 3 -->
			<Card class="border-slate-200/90 shadow-2xs hover:shadow-sm transition-shadow">
				<CardContent class="p-6 space-y-3">
					<div class="w-12 h-12 rounded-2xl bg-purple-50 text-[#7c3aed] flex items-center justify-center border border-purple-100">
						<HeartHandshake class="w-6 h-6" />
					</div>
					<h3 class="text-base font-extrabold text-slate-900">কৃষি পরামর্শ ও সার্বক্ষণিক সাপোর্ট</h3>
					<p class="text-xs text-slate-600 leading-relaxed">
						শুধু বীজ বিক্রি নয়, বীজ বোনা থেকে ফসল তোলা পর্যন্ত যেকোনো কৃষি পরামর্শে আমাদের অভিজ্ঞ টিম সর্বদা আপনার পাশে রয়েছে।
					</p>
				</CardContent>
			</Card>
		</div>

		<!-- Story / Mission Card -->
		<Card class="border-slate-200/90 shadow-xs bg-gradient-to-br from-white to-indigo-50/30 overflow-hidden">
			<CardContent class="p-8 sm:p-10 space-y-4">
				<div class="flex items-center gap-2 text-xs font-bold text-[#5845eb]">
					<ShieldCheck class="w-4 h-4" />
					<span>আমাদের লক্ষ্য ও প্রতিশ্রুতি</span>
				</div>
				<h2 class="text-2xl font-black text-slate-900">প্রতিটি ছাদ ও ব্যালকনিতে গড়ে উঠুক সবুজ প্রাণের ছোঁয়া</h2>
				<p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
					বাংলাদেশে পুষ্টিকর ও বিষমুক্ত খাদ্য উৎপাদনের জন্য ছাদবাগান এবং হোম গার্ডেনিং দ্রুত জনপ্রিয় হচ্ছে। আমাদের লক্ষ্য হলো দেশের প্রত্যন্ত অঞ্চল থেকে শুরু করে শহরের প্রতিটি ঘরে সহজে ও দ্রুততম সময়ে খাঁটি বীজ, কম্পোস্ট সার ও আধুনিক গার্ডেনিং টুলস পৌঁছে দেওয়া। গ্রাহকের সন্তুষ্টিই আমাদের এগিয়ে যাওয়ার মূল অনুপ্রেরণা।
				</p>
			</CardContent>
		</Card>

	</div>
</StoreLayout>
