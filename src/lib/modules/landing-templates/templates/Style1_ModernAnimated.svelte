<script lang="ts">
	import { Button, Badge, Card } from '#lib/components/ui';
	import {
		ShieldCheck,
		Truck,
		Headphones,
		Star,
		CheckCircle2,
		Sparkles,
		Flame,
		ArrowRight,
		PhoneCall,
		RotateCcw,
		Award,
		Lock,
		Heart
	} from 'lucide-svelte';
	import LandingCountdown from '../components/LandingCountdown.svelte';
	import LandingOrderForm from '../components/LandingOrderForm.svelte';

	interface Props {
		landingPage: any;
	}

	let { landingPage }: Props = $props();

	let product = $derived(landingPage?.product || {});
	let config = $derived(landingPage?.config || {});

	// Images
	let images: string[] = $derived(
		product?.parsedImages?.length > 0
			? product.parsedImages
			: [product?.image || '/images/placeholder.svg']
	);
	let activeImageIndex = $state(0);
	let activeImage = $derived(images[activeImageIndex] || images[0]);

	// Pricing
	let price = $derived(config?.customPrice || product?.price || 1450);
	let originalPrice = $derived(config?.customOriginalPrice || product?.originalPrice || price * 1.6);
	let savings = $derived(originalPrice > price ? originalPrice - price : 0);

	function formatTaka(amount: number) {
		return `৳${amount.toLocaleString('en-BD')}`;
	}

	function scrollToOrderForm() {
		const el = document.getElementById('order-form');
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<svelte:head>
	<title>{landingPage?.title || 'স্পেশাল অফার ল্যান্ডিং পেজ'}</title>
	<meta name="description" content={config?.subheadline || landingPage?.title} />
</svelte:head>

<div class="min-h-screen bg-[#fafaf9] text-slate-900 font-['Anek_Bangla',sans-serif] selection:bg-emerald-500/20 selection:text-emerald-900 pb-24 md:pb-16 antialiased">
	<!-- 1. Top Urgent Banner -->
	<header class="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white text-xs py-2.5 px-4 text-center border-b border-emerald-900/50 shadow-xs">
		<div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
			<span class="inline-flex items-center gap-1.5 font-bold">
				<Sparkles class="w-3.5 h-3.5 text-amber-400 animate-spin" />
				<span>বিশেষ অফার চলছে • পণ্য হাতে পেয়ে চেক করে সম্পূর্ণ মূল্য পরিশোধ করুন</span>
			</span>
			<span class="hidden sm:inline text-emerald-400/80">•</span>
			<span class="text-emerald-300 font-medium">সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি</span>
		</div>
	</header>

	<main class="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-12 sm:space-y-16">
		<!-- 2. Hero Section: Catchy Headline & Live Urgency -->
		<section class="text-center space-y-4">
			<!-- Floating Tag Badge -->
			<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs sm:text-sm font-bold shadow-2xs animate-pulse">
				<Flame class="w-4 h-4 text-rose-500" />
				<span>{config?.offerBadge || landingPage?.tag || 'সীমিত সময়ের ধামাকা অফার'}</span>
			</div>

			<!-- Main Headline -->
			<h1 class="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-snug sm:leading-tight max-w-4xl mx-auto">
				{config?.headline || landingPage?.title}
			</h1>

			<!-- Subheadline -->
			{#if config?.subheadline}
				<p class="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
					{config.subheadline}
				</p>
			{/if}

			<!-- Countdown Timer -->
			<div class="pt-2">
				<LandingCountdown initialMinutes={config?.countdownMinutes || 35} badgeText="অফারের সময় বাকি" />
			</div>
		</section>

		<!-- 3. Product Presentation & Pricing Grid -->
		<section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-xl">
			<!-- Left: Product Image Gallery (7 Cols) -->
			<div class="lg:col-span-7 space-y-4">
				<div class="relative aspect-square rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden group">
					<img
						src={activeImage}
						alt={product?.name || landingPage?.title}
						class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
					/>

					{#if savings > 0}
						<div class="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md uppercase tracking-wider">
							{formatTaka(savings)} ছাড়
						</div>
					{/if}

					<div class="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-emerald-700 text-xs font-bold px-3 py-1 rounded-xl shadow-sm border border-emerald-100 flex items-center gap-1.5">
						<span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
						<span>ইন-স্টক এভেইলেবল</span>
					</div>
				</div>

				<!-- Thumbnail Selector if multiple images -->
				{#if images.length > 1}
					<div class="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
						{#each images as img, idx}
							<button
								type="button"
								onclick={() => (activeImageIndex = idx)}
								class="w-16 h-16 rounded-xl border-2 overflow-hidden transition-all shrink-0 cursor-pointer {activeImageIndex === idx
									? 'border-emerald-600 ring-2 ring-emerald-500/30'
									: 'border-slate-200 opacity-70 hover:opacity-100'}"
							>
								<img src={img} alt="Thumb" class="w-full h-full object-cover" />
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Right: Pricing, Highlights & Direct Action (5 Cols) -->
			<div class="lg:col-span-5 space-y-5">
				<!-- Star rating badge -->
				<div class="flex items-center gap-2">
					<div class="flex text-amber-400">
						{#each Array(5) as _}
							<Star class="w-4 h-4 fill-amber-400" />
						{/each}
					</div>
					<span class="text-xs font-bold text-slate-700">৪.৯ (১২০+ কাস্টমার রিভিউ)</span>
				</div>

				<!-- Price block -->
				<div class="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
					<div class="flex items-baseline gap-3">
						<span class="text-3xl sm:text-4xl font-black text-emerald-800 font-mono">
							{formatTaka(price)}
						</span>
						{#if originalPrice > price}
							<span class="text-base sm:text-lg text-slate-400 line-through font-mono">
								{formatTaka(originalPrice)}
							</span>
						{/if}
					</div>
					{#if savings > 0}
						<div class="text-xs font-bold text-emerald-700 mt-1">
							🎉 আপনি বাঁচাচ্ছেন মোট {formatTaka(savings)} টাকা!
						</div>
					{/if}
				</div>

				<!-- Highlights Bullet Points -->
				<div class="space-y-2.5 pt-1">
					<h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
						পণ্যটির মূল বৈশিষ্ট্যসমূহ:
					</h3>
					<ul class="space-y-2">
						{#each config?.bulletPoints || [
							'১০০% অরিজিনাল ও অথেন্টিক প্রিমিয়াম পণ্য',
							'পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধের সুযোগ',
							'পছন্দ না হলে সাথে সাথে রিটার্ন সুবিধা',
							'অর্ডারের ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ফাস্ট হোম ডেলিভারি'
						] as point}
							<li class="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
								<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
								<span>{point}</span>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Quick Scroll Action Button -->
				<Button
					type="button"
					onclick={scrollToOrderForm}
					class="w-full py-4 text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 group"
				>
					<span>অর্ডার করতে এখানে ক্লিক করুন</span>
					<ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
				</Button>

				<!-- Assurance Icons -->
				<div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-semibold">
					<div class="flex items-center gap-1.5">
						<Truck class="w-4 h-4 text-emerald-600 shrink-0" />
						<span>সারা দেশে হোম ডেলিভারি</span>
					</div>
					<div class="flex items-center gap-1.5">
						<ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0" />
						<span>ক্যাশ অন ডেলিভারি</span>
					</div>
				</div>
			</div>
		</section>

		<!-- 4. Features & Benefits Cards -->
		<section class="space-y-6">
			<div class="text-center max-w-xl mx-auto space-y-2">
				<h2 class="text-xl sm:text-3xl font-black text-slate-900">
					কেন আমাদের পণ্যটি আপনার জন্য সেরা পছন্দ?
				</h2>
				<p class="text-xs sm:text-sm text-slate-500">
					আমরা নিশ্চিত করি সেরা কোয়ালিটি ও গ্রাহক সন্তুষ্টি
				</p>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div class="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-center space-y-3">
					<div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
						<Award class="w-6 h-6" />
					</div>
					<h3 class="font-bold text-base text-slate-900">১০০% অরিজিনাল কোয়ালিটি</h3>
					<p class="text-xs text-slate-500 leading-relaxed">
						সরাসরি ফ্যাক্টরি গ্রেড উপাদান দিয়ে তৈরি, দীর্ঘস্থায়ী ব্যবহারের নিশ্চয়তা।
					</p>
				</div>

				<div class="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-center space-y-3">
					<div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
						<Truck class="w-6 h-6" />
					</div>
					<h3 class="font-bold text-base text-slate-900">দ্রুততম হোম ডেলিভারি</h3>
					<p class="text-xs text-slate-500 leading-relaxed">
						ঢাকার ভেতরে ২৪ ঘণ্টা এবং সারাদেশে সর্বোচ্চ ৪৮ ঘণ্টার মধ্যে ডেলিভারি।
					</p>
				</div>

				<div class="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-center space-y-3">
					<div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
						<RotateCcw class="w-6 h-6" />
					</div>
					<h3 class="font-bold text-base text-slate-900">নিরাপদ রিপ্লেসমেন্ট</h3>
					<p class="text-xs text-slate-500 leading-relaxed">
						পণ্য হাতে পেয়ে কোনো ডিফেক্ট থাকলে সহজেই সাথে সাথে রিটার্ন বা পরিবর্তন সম্ভব।
					</p>
				</div>
			</div>
		</section>

		<!-- 5. Direct In-Page Cash On Delivery Form (Main Conversion Goal) -->
		<section class="space-y-4">
			<div class="text-center max-w-xl mx-auto space-y-1">
				<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
					<Sparkles class="w-3.5 h-3.5" />
					<span>সহজ ১-ক্লিক অর্ডার ফর্ম</span>
				</div>
				<h2 class="text-xl sm:text-3xl font-black text-slate-900">
					দেরি না করে এখনই অর্ডার সম্পন্ন করুন
				</h2>
				<p class="text-xs text-slate-500">
					অর্ডার করতে নিচের ফর্মটি সঠিক তথ্য দিয়ে পূরণ করে কনফার্ম বাটনে ক্লিক করুন
				</p>
			</div>

			<LandingOrderForm {product} {config} />
		</section>

		<!-- 6. Real Customer Testimonials -->
		<section class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs space-y-6">
			<div class="text-center space-y-1">
				<h3 class="text-lg sm:text-2xl font-bold text-slate-900">সন্তুষ্ট গ্রাহকদের মতামত</h3>
				<p class="text-xs text-slate-500">আমাদের শত শত গ্রাহক এই পণ্যটি ব্যবহার করে সন্তুষ্ট</p>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
					<div class="flex text-amber-400">
						{#each Array(5) as _}
							<Star class="w-3.5 h-3.5 fill-amber-400" />
						{/each}
					</div>
					<p class="text-xs text-slate-700 leading-relaxed">
						"যেমন ছবিতে দেখেছি হুবহু তেমনই পেয়েছি। ডেলিভারি মাত্র ২৪ ঘণ্টার মধ্যে পেয়ে গেছি। অসংখ্য ধন্যবাদ!"
					</p>
					<div class="text-[11px] font-bold text-slate-900 pt-1">— তানভীর আহমেদ, ধানমন্ডি</div>
				</div>

				<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
					<div class="flex text-amber-400">
						{#each Array(5) as _}
							<Star class="w-3.5 h-3.5 fill-amber-400" />
						{/each}
					</div>
					<p class="text-xs text-slate-700 leading-relaxed">
						"কোয়ালিটি প্রিমিয়াম। ডেলিভারি ম্যানের সামনে চেক করে টাকা দিয়েছি, কোনো ধরণের ঝামেলা হয়নি।"
					</p>
					<div class="text-[11px] font-bold text-slate-900 pt-1">— ফারহানা ইয়াসমিন, চট্টগ্রাম</div>
				</div>

				<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
					<div class="flex text-amber-400">
						{#each Array(5) as _}
							<Star class="w-3.5 h-3.5 fill-amber-400" />
						{/each}
					</div>
					<p class="text-xs text-slate-700 leading-relaxed">
						"প্রাইস অনুযায়ী এর চেয়ে সেরা জিনিস আর হতে পারে না। আমি বন্ধুদেরও রিকমেন্ড করেছি।"
					</p>
					<div class="text-[11px] font-bold text-slate-900 pt-1">— শফিকুল ইসলাম, সিলেট</div>
				</div>
			</div>
		</section>
	</main>

	<!-- 7. Sticky Floating Order Bar for Mobile Devices -->
	<div class="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 px-4 flex items-center justify-between gap-3 shadow-2xl md:hidden">
		<div class="flex flex-col min-w-0">
			<span class="text-base font-black text-emerald-800 font-mono leading-tight">
				{formatTaka(price)}
			</span>
			<span class="text-[10px] text-slate-500 font-bold">ক্যাশ অন ডেলিভারি</span>
		</div>

		<Button
			type="button"
			onclick={scrollToOrderForm}
			class="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
		>
			<span>এখনই অর্ডার করুন</span>
			<ArrowRight class="w-4 h-4" />
		</Button>
	</div>
</div>

