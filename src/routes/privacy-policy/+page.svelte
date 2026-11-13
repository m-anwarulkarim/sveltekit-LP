<script lang="ts">
	import { page } from '$app/state';
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import { Card, CardContent, Badge, Button } from '#lib/components/ui';
	import {
		ShieldCheck,
		Lock,
		EyeOff,
		CreditCard,
		Truck,
		Cookie,
		UserCheck,
		FileText,
		Phone,
		Mail,
		MapPin,
		Clock,
		ArrowRight,
		CheckCircle2,
		ShieldAlert
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const siteName = $derived(
		data?.websiteInfo?.websiteName ||
		page.data?.websiteInfo?.websiteName ||
		page.data?.storeConfig?.storeName ||
		'Store'
	);
	const hotline = $derived(
		data?.storeConfig?.hotlinePhone ||
		page.data?.storeConfig?.hotlinePhone ||
		data?.websiteInfo?.phoneHotline ||
		'01602867954'
	);
	const supportEmail = $derived(
		data?.websiteInfo?.supportEmail ||
		page.data?.websiteInfo?.supportEmail ||
		'support@example.com'
	);
	const officeAddress = $derived(
		data?.websiteInfo?.officeAddress ||
		page.data?.websiteInfo?.officeAddress ||
		'ঢাকা, বাংলাদেশ'
	);
</script>

<svelte:head>
	<title>গোপনীয়তা নীতি (Privacy Policy) | {siteName}</title>
	<meta
		name="description"
		content="{siteName}-এর গোপনীয়তা নীতি। আমরা কীভাবে আপনার ব্যক্তিগত তথ্য ও পেমেন্ট নিরাপত্তা রক্ষা করি তা বিস্তারিত জানুন।"
	/>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-10 font-['Anek_Bangla',sans-serif]">
		<!-- Header -->
		<div class="text-center space-y-3">
			<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200 px-3 py-1 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 shadow-2xs">
				<ShieldCheck class="w-3.5 h-3.5 text-[#5845eb]" />
				Privacy & Data Protection
			</Badge>
			<h1 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
				গোপনীয়তা নীতি (Privacy Policy)
			</h1>
			<p class="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
				<span class="font-bold text-slate-800">{siteName}</span>-এ আপনার প্রতিটি তথ্যের সর্বোচ্চ সুরক্ষা ও বিশ্বস্ততা বজায় রাখা আমাদের অগ্রাধিকার।
			</p>
			<div class="inline-flex items-center gap-2 text-[11px] sm:text-xs font-medium text-slate-400 bg-slate-100/80 px-3 py-1 rounded-full">
				<Clock class="w-3 h-3" />
				সর্বশেষ সংস্করণ: নভেম্বর ২০২৬
			</div>
		</div>

		<!-- Trust Highlights Grid -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
			<div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center space-y-2 hover:border-indigo-200 hover:shadow-xs transition-all">
				<div class="w-10 h-10 rounded-xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0">
					<Lock class="w-5 h-5" />
				</div>
				<h4 class="text-xs sm:text-sm font-bold text-slate-900">SSL এনক্রিপশন</h4>
				<p class="text-[11px] text-slate-500 leading-tight">২৫৬-বিট সুরক্ষিত ও এনক্রিপ্টেড সংযোগ</p>
			</div>

			<div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center space-y-2 hover:border-indigo-200 hover:shadow-xs transition-all">
				<div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
					<CreditCard class="w-5 h-5" />
				</div>
				<h4 class="text-xs sm:text-sm font-bold text-slate-900">নিরাপদ পেমেন্ট</h4>
				<p class="text-[11px] text-slate-500 leading-tight">কোনো কার্ড/বিকাশ পিন সংরক্ষণ করা হয় না</p>
			</div>

			<div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center space-y-2 hover:border-indigo-200 hover:shadow-xs transition-all">
				<div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
					<EyeOff class="w-5 h-5" />
				</div>
				<h4 class="text-xs sm:text-sm font-bold text-slate-900">ডেটা বিক্রিমুক্ত</h4>
				<p class="text-[11px] text-slate-500 leading-tight">কোনো থার্ড-পার্টির কাছে তথ্য বিক্রি সম্পূর্ণ নিষিদ্ধ</p>
			</div>

			<div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center space-y-2 hover:border-indigo-200 hover:shadow-xs transition-all">
				<div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
					<Truck class="w-5 h-5" />
				</div>
				<h4 class="text-xs sm:text-sm font-bold text-slate-900">বিশ্বস্ত কুরিয়ার</h4>
				<p class="text-[11px] text-slate-500 leading-tight">শুধুমাত্র ডেলিভারির জন্য প্রয়োজনীয় তথ্য শেয়ার</p>
			</div>
		</div>

		<!-- Main Content Card -->
		<Card class="border-slate-200/90 shadow-2xs overflow-hidden">
			<CardContent class="p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
				
				<!-- Section 1 -->
				<section class="space-y-3 pb-6 border-b border-slate-100">
					<div class="flex items-center gap-2.5 text-slate-900">
						<div class="w-7 h-7 rounded-lg bg-indigo-50 text-[#5845eb] flex items-center justify-center font-black text-xs shrink-0">
							১
						</div>
						<h2 class="text-base sm:text-lg font-bold">ভূমিকা ও পলিসির আওতা (Introduction & Scope)</h2>
					</div>
					<p class="text-slate-600">
						<strong>{siteName}</strong> ("আমরা", "আমাদের") গ্রাহক ও ভিজিটরদের ব্যক্তিগত তথ্যের সুরক্ষা এবং গোপনীয়তাকে সর্বোচ্চ অগ্রাধিকার প্রদান করে। আপনি যখন আমাদের ওয়েবসাইটে ভিজিট করেন, পণ্য ব্রাউজ করেন বা অর্ডার প্রদান করেন, তখন আমরা আপনার তথ্য কীভাবে সংগ্রহ, ব্যবহার, সংরক্ষণ এবং সুরক্ষিত রাখি—তা এই নীতিমালায় স্পষ্টভাবে ব্যাখ্যা করা হয়েছে।
					</p>
					<p class="text-slate-600">
						আমাদের সেবা গ্রহণের মাধ্যমে আপনি এই গোপনীয়তা নীতিমালার সকল শর্তাবলীতে সম্মতি প্রদান করছেন।
					</p>
				</section>

				<!-- Section 2 -->
				<section class="space-y-3 pb-6 border-b border-slate-100">
					<div class="flex items-center gap-2.5 text-slate-900">
						<div class="w-7 h-7 rounded-lg bg-indigo-50 text-[#5845eb] flex items-center justify-center font-black text-xs shrink-0">
							২
						</div>
						<h2 class="text-base sm:text-lg font-bold">আমরা যেসব তথ্য সংগ্রহ করি (Information We Collect)</h2>
					</div>
					<p class="text-slate-600">
						অর্ডার কার্যকরভাবে প্রসেস করা ও সর্বোত্তম গ্রাহকসেবা নিশ্চিত করার লক্ষ্যে আমরা নিম্নোক্ত তথ্যসমূহ সংগ্রহ করি:
					</p>
					<ul class="space-y-2.5 pl-2 sm:pl-4 text-slate-600">
						<li class="flex items-start gap-2.5">
							<CheckCircle2 class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
							<span><strong>ব্যক্তিগত যোগাযোগের তথ্য:</strong> আপনার নাম, সক্রিয় মোবাইল নম্বর, অল্টারনেট ফোন নম্বর, ডেলিভারি ঠিকানা (জেলা, থানা ও বাড়ি/রোড নং) এবং ইমেইল অ্যাড্রেস।</span>
						</li>
						<li class="flex items-start gap-2.5">
							<CheckCircle2 class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
							<span><strong>অর্ডারের বিবরণ:</strong> নির্বাচিত পণ্য, পরিমাণ, মূল্য, ডেলিভারি মেথড এবং পেমেন্ট সংক্রান্ত রেফারেন্স (যেমন: বিকাশ/নগদ ট্রানজেকশন আইডি)।</span>
						</li>
						<li class="flex items-start gap-2.5">
							<CheckCircle2 class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
							<span><strong>ব্রাউজিং ও ডিভাইস তথ্য:</strong> ওয়েবসাইট ব্যবহারের সময় আইপি অ্যাড্রেস (IP Address), ব্রাউজারের ধরন, ডিভাইসের মডেল ও ভিজিটের সময়—যা সাইটের স্পিড ও নিরাপত্তা রক্ষায় স্বয়ংক্রিয়ভাবে সংগৃহীত হয়।</span>
						</li>
					</ul>
				</section>

				<!-- Section 3 -->
				<section class="space-y-3 pb-6 border-b border-slate-100">
					<div class="flex items-center gap-2.5 text-slate-900">
						<div class="w-7 h-7 rounded-lg bg-indigo-50 text-[#5845eb] flex items-center justify-center font-black text-xs shrink-0">
							৩
						</div>
						<h2 class="text-base sm:text-lg font-bold">তথ্যের ব্যবহার ও উদ্দেশ্য (How We Use Your Information)</h2>
					</div>
					<p class="text-slate-600">
						আপনার সংগৃহীত তথ্য কেবল সুনির্দিষ্ট এবং বৈধ উদ্দেশ্যে ব্যবহৃত হয়:
					</p>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
							<h4 class="font-bold text-slate-800 text-xs sm:text-sm">১. দ্রুত ডেলিভারি নিশ্চিতকরণ</h4>
							<p class="text-[11px] sm:text-xs text-slate-500">আপনার পার্সেলটি ঠিক সময়ে আপনার ঠিকানায় পৌঁছে দিতে কুরিয়ার টিমের সাথে সমন্বয়।</p>
						</div>
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
							<h4 class="font-bold text-slate-800 text-xs sm:text-sm">২. অর্ডার আপডেট ও ট্র্যাকিং</h4>
							<p class="text-[11px] sm:text-xs text-slate-500">অর্ডার কনফার্মেশন, প্যাকিং আপডেট ও কুরিয়ার ট্র্যাকিং কোড এসএমএস বা ফোনে জানানো।</p>
						</div>
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
							<h4 class="font-bold text-slate-800 text-xs sm:text-sm">৩. কাস্টমার সাপোর্ট ও রিপ্লেসমেন্ট</h4>
							<p class="text-[11px] sm:text-xs text-slate-500">যেকোনো প্রশ্ন, রিটার্ন বা এক্সচেঞ্জের ক্ষেত্রে সার্বক্ষণিক সহায়তা প্রদান করা।</p>
						</div>
						<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
							<h4 class="font-bold text-slate-800 text-xs sm:text-sm">৪. নিরাপত্তা ও জালিয়াতি প্রতিরোধ</h4>
							<p class="text-[11px] sm:text-xs text-slate-500">ভুয়া অর্ডার বা স্প্যাম কার্যক্রম শনাক্ত করে প্ল্যাটফর্মকে সুরক্ষিত রাখা।</p>
						</div>
					</div>
				</section>

				<!-- Section 4 -->
				<section class="space-y-3 pb-6 border-b border-slate-100">
					<div class="flex items-center gap-2.5 text-slate-900">
						<div class="w-7 h-7 rounded-lg bg-indigo-50 text-[#5845eb] flex items-center justify-center font-black text-xs shrink-0">
							৪
						</div>
						<h2 class="text-base sm:text-lg font-bold">ডিজিটাল পেমেন্ট নিরাপত্তা (Payment Security & Policy)</h2>
					</div>
					<div class="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
						<div class="flex items-center gap-2 text-[#5845eb] font-bold text-xs sm:text-sm">
							<Lock class="w-4 h-4 shrink-0" />
							<span>আমরা কোনো কার্ড বা মোবাইল ব্যাংকিং পিন/OTP সংরক্ষণ করি না</span>
						</div>
						<p class="text-slate-600 text-xs sm:text-sm">
							আমাদের ওয়েবসাইটে ক্যাশ অন ডেলিভারি (COD) ছাড়াও বিকাশ, নগদ বা ব্যাংক কার্ডের মাধ্যমে প্রিপেমেন্টের সুবিধা রয়েছে। সমস্ত ডিজিটাল লেনদেন বাংলাদেশ ব্যাংক অনুমোদিত লাইসেন্সপ্রাপ্ত ও সুরক্ষিত গেটওয়ের (যেমন SSLCommerz বা সরাসরি মার্চেন্ট এপিআই) মাধ্যমে পরিচালিত হয়।
						</p>
						<p class="text-slate-600 text-xs sm:text-sm font-medium">
							আপনার ব্যাংকিং পিন, কার্ডের সিভিভি (CVV) কোড বা ওটিপি কখনোই আমাদের সার্ভারে আসে না বা সংরক্ষিত হয় না।
						</p>
					</div>
				</section>

				<!-- Section 5 -->
				<section class="space-y-3 pb-6 border-b border-slate-100">
					<div class="flex items-center gap-2.5 text-slate-900">
						<div class="w-7 h-7 rounded-lg bg-indigo-50 text-[#5845eb] flex items-center justify-center font-black text-xs shrink-0">
							৫
						</div>
						<h2 class="text-base sm:text-lg font-bold">তৃতীয় পক্ষের সাথে তথ্য আদান-প্রদান (Third-Party Disclosure)</h2>
					</div>
					<p class="text-slate-600">
						আপনার তথ্যের গোপনীয়তা রক্ষা করা আমাদের অঙ্গীকার। আমরা কখনোই গ্রাহকদের ব্যক্তিগত তথ্য কোনো বাণিজ্যিক প্রতিষ্ঠান, বিজ্ঞাপনদাতা বা এজেন্সির কাছে বিক্রি, ভাড়া বা হস্তান্তর করি না।
					</p>
					<p class="text-slate-600">
						শুধুমাত্র পার্সেল হস্তান্তরের প্রয়োজনে অনুমোদিত লজিস্টিক পার্টনার (যেমন: <strong>Steadfast Courier, Pathao, RedX</strong>) এর সাথে গ্রাহকের নাম, ফোন নম্বর ও ডেলিভারি ঠিকানা আদান-প্রদান করা হয়। এছাড়া রাষ্ট্রীয় আইন প্রয়োগকারী সংস্থার আনুষ্ঠানিক ও আইনগত বাধ্যবাধকতা ছাড়া অন্য কারো সাথে কোনো তথ্য প্রকাশ করা হয় না।
					</p>
				</section>

				<!-- Section 6 -->
				<section class="space-y-3 pb-6 border-b border-slate-100">
					<div class="flex items-center gap-2.5 text-slate-900">
						<div class="w-7 h-7 rounded-lg bg-indigo-50 text-[#5845eb] flex items-center justify-center font-black text-xs shrink-0">
							৬
						</div>
						<h2 class="text-base sm:text-lg font-bold">কুকি ও ট্র্যাকিং পলিসি (Cookies & Tracking)</h2>
					</div>
					<p class="text-slate-600">
						আমাদের ওয়েবসাইট ব্যবহারকারীদের সুবিধার্থে এবং কার্ট সেশন সুরক্ষিত রাখতে স্ট্যান্ডার্ড ব্রাউজার কুকিজ (Browser Cookies) ব্যবহার করে। এছাড়া আমাদের সাইটের ট্রাফিকের মান যাচাই করতে Meta Pixel ও Google Analytics-এর মতো স্ট্যান্ডার্ড টুল ব্যবহার করা হয়।
					</p>
					<p class="text-slate-600">
						আপনি আপনার ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকিজ নিষ্ক্রিয় করতে পারেন, তবে এতে ওয়েবসাইটের কিছু কার্যকারিতা (যেমন কার্টে পণ্য রাখা) সীমিত হতে পারে।
					</p>
				</section>

				<!-- Section 7 -->
				<section class="space-y-3 pb-6 border-b border-slate-100">
					<div class="flex items-center gap-2.5 text-slate-900">
						<div class="w-7 h-7 rounded-lg bg-indigo-50 text-[#5845eb] flex items-center justify-center font-black text-xs shrink-0">
							৭
						</div>
						<h2 class="text-base sm:text-lg font-bold">গ্রাহকের অধিকার ও ডেটা নিয়ন্ত্রণ (Your Rights)</h2>
					</div>
					<p class="text-slate-600">
						একজন সম্মানিত গ্রাহক হিসেবে আপনার তথ্যের ওপর পূর্ণ নিয়ন্ত্রণ রয়েছে:
					</p>
					<ul class="space-y-2 pl-2 sm:pl-4 text-slate-600">
						<li class="flex items-start gap-2">
							<span class="text-[#5845eb] font-bold">•</span>
							<span>যেকোনো সময় আপনার প্রোফাইল বা শিপিং ঠিকানা আপডেট বা সংশোধন করতে পারেন।</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-[#5845eb] font-bold">•</span>
							<span>আমাদের ডেটাবেস থেকে আপনার অ্যাকাউন্ট বা যোগাযোগের তথ্য স্থায়ীভাবে মুছে ফেলার (Data Deletion) অনুরোধ জানাতে পারেন।</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-[#5845eb] font-bold">•</span>
							<span>যেকোনো প্রমোশনাল এসএমএস বা আপডেট বন্ধ করার জন্য আমাদের কাস্টমার কেয়ারে যোগাযোগ করতে পারেন।</span>
						</li>
					</ul>
				</section>

				<!-- Section 8 -->
				<section class="space-y-3">
					<div class="flex items-center gap-2.5 text-slate-900">
						<div class="w-7 h-7 rounded-lg bg-indigo-50 text-[#5845eb] flex items-center justify-center font-black text-xs shrink-0">
							৮
						</div>
						<h2 class="text-base sm:text-lg font-bold">পলিসির পরিবর্তন ও আপডেট (Policy Updates)</h2>
					</div>
					<p class="text-slate-600">
						{siteName} যেকোনো সময় আইনগত বা ব্যবসায়িক প্রয়োজনে এই গোপনীয়তা নীতিমালার পরিবর্তন বা পরিমার্জন করার অধিকার সংরক্ষণ করে। যেকোনো পরিবর্তন ওয়েবসাইটে প্রকাশিত হওয়া মাত্র কার্যকর বলে বিবেচিত হবে।
					</p>
				</section>

			</CardContent>
		</Card>

		<!-- Contact & Support Box -->
		<div class="rounded-3xl bg-linear-to-br from-indigo-50 via-slate-50 to-indigo-50/30 border border-indigo-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
			<div class="space-y-1.5 text-center sm:text-left">
				<Badge variant="outline" class="bg-white text-[#5845eb] border-indigo-200 text-xs font-semibold">
					সরাসরি সহায়তা
				</Badge>
				<h3 class="text-lg sm:text-xl font-bold text-slate-900">গোপনীয়তা নিয়ে কোনো প্রশ্ন আছে?</h3>
				<p class="text-xs sm:text-sm text-slate-600">
					আপনার তথ্যের সুরক্ষা সম্পর্কিত যেকোনো বিষয় জানতে বা তথ্য মুছে ফেলার জন্য আমাদের সাথে যোগাযোগ করুন।
				</p>
			</div>
			<div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
				<a
					href="tel:{hotline}"
					class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#5845eb] text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-[#4836d4] transition-colors"
				>
					<Phone class="w-4 h-4" />
					<span>কল করুন ({hotline})</span>
				</a>
				<a
					href="/contact"
					class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:border-slate-300 transition-colors"
				>
					<span>যোগাযোগ পেজ</span>
					<ArrowRight class="w-4 h-4" />
				</a>
			</div>
		</div>

	</div>
</StoreLayout>
