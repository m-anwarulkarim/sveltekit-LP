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
		Heart,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';
	import LandingCountdown from '../components/LandingCountdown.svelte';
	import LandingOrderForm from '../components/LandingOrderForm.svelte';
	import LandingNavbar from '../components/LandingNavbar.svelte';

	interface Props {
		landingPage: any;
	}

	let { landingPage }: Props = $props();

	const navItems = [
		{ label: 'হোম', targetId: 'animated-hero' },
		{ label: 'পণ্য বিবরণ', targetId: 'animated-product' },
		{ label: 'অর্ডার ফর্ম', targetId: 'order-form-section' },
		{ label: 'গ্রাহক রিভিউ', targetId: 'animated-reviews' }
	];

	let product = $derived(landingPage?.product || {});
	let config = $derived(landingPage?.config || {});

	// Images: prioritize custom galleryImages from landing page config, then product images
	let images: string[] = $derived.by(() => {
		if (config?.galleryImages && Array.isArray(config.galleryImages) && config.galleryImages.length > 0) {
			return config.galleryImages;
		}
		if (product?.parsedImages && Array.isArray(product.parsedImages) && product.parsedImages.length > 0) {
			return product.parsedImages;
		}
		if (product?.image) {
			return [product.image];
		}
		return ['/images/placeholder.svg'];
	});

	let activeImageIndex = $state(0);
	let activeImage = $derived(images[activeImageIndex] || images[0] || '/images/placeholder.svg');

	function nextImage() {
		if (images.length <= 1) return;
		activeImageIndex = (activeImageIndex + 1) % images.length;
	}

	function prevImage() {
		if (images.length <= 1) return;
		activeImageIndex = (activeImageIndex - 1 + images.length) % images.length;
	}

	// Touch swipe support for mobile
	let touchStartX = 0;
	let touchEndX = 0;

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].screenX;
		const diff = touchEndX - touchStartX;
		if (Math.abs(diff) > 40) {
			if (diff < 0) {
				nextImage();
			} else {
				prevImage();
			}
		}
	}

	// Pricing
	let basePrice = $derived(config?.customPrice || product?.price || 1450);
	let baseOriginalPrice = $derived(config?.customOriginalPrice || product?.originalPrice || basePrice * 1.6);

	// Package support (same pattern as Style 2)
	let packages = $derived.by(() => {
		const raw = config?.packages;
		if (Array.isArray(raw) && raw.length > 0) {
			return raw.map((p: any, i: number) => {
				const isFreeDelivery = Boolean(p.freeDelivery);
				return {
					id: p.id || `pack_${i + 1}`,
					qty: p.qty || (i + 1),
					title: p.title || `${i + 1}টি প্যাকেট`,
					subtitle: p.subtitle || '',
					freeGift: p.freeGift || '',
					price: Number(p.price) || (basePrice * (i + 1)),
					originalPrice: Number(p.originalPrice) || (baseOriginalPrice * (i + 1)),
					deliveryFee: isFreeDelivery ? 0 : (Number(p.deliveryFee) || 60),
					freeDelivery: isFreeDelivery,
					tag: p.tag || (i === 1 ? '🔥 সেরা অফার' : i === 2 ? '🚀 সর্বোচ্চ সাশ্রয়ী' : ''),
					popular: Boolean(p.popular) || i === 1
				};
			});
		}
		return [];
	});

	let hasPackages = $derived(packages.length > 0);
	let selectedPackageIndex = $state(packages.length >= 2 ? 1 : 0);
	let currentPackage = $derived(hasPackages ? (packages[selectedPackageIndex] || packages[0]) : null);

	let price = $derived(currentPackage ? currentPackage.price : basePrice);
	let originalPrice = $derived(currentPackage ? currentPackage.originalPrice : baseOriginalPrice);
	let savings = $derived(originalPrice > price ? originalPrice - price : 0);

	function formatTaka(amount: number) {
		return `৳${amount.toLocaleString('en-BD')}`;
	}

	const defaultReviews = [
		{ name: 'তানভীর আহমেদ', location: 'ধানমন্ডি', text: 'যেমন ছবিতে দেখেছি হুবহু তেমনই পেয়েছি। ডেলিভারি মাত্র ২৪ ঘণ্টার মধ্যে পেয়ে গেছি। অসংখ্য ধন্যবাদ!', rating: 5, badge: '' },
		{ name: 'ফারহানা ইয়াসমিন', location: 'চট্টগ্রাম', text: 'কোয়ালিটি প্রিমিয়াম। ডেলিভারি ম্যানের সামনে চেক করে টাকা দিয়েছি, কোনো ধরণের ঝামেলা হয়নি।', rating: 5, badge: '' },
		{ name: 'শফিকুল ইসলাম', location: 'সিলেট', text: 'প্রাইস অনুযায়ী এর চেয়ে সেরা জিনিস আর হতে পারে না। আমি বন্ধুদেরও রিকমেন্ড করেছি।', rating: 5, badge: '' }
	];
	let reviews = $derived(
		config?.reviews && Array.isArray(config.reviews) && config.reviews.length > 0
			? config.reviews
			: defaultReviews
	);

	function scrollToOrderForm() {
		const el = document.getElementById('order-form');
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
		if (isVisible) {
			const form = el.querySelector('form');
			if (form) form.requestSubmit();
		} else {
			el.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<svelte:head>
	<title>{landingPage?.title || 'স্পেশাল অফার ল্যান্ডিং পেজ'}</title>
	<meta name="description" content={config?.subheadline || landingPage?.title} />
</svelte:head>

<div class="min-h-screen bg-[#fafaf9] text-slate-900 font-['Anek_Bangla',sans-serif] selection:bg-emerald-500/20 selection:text-emerald-900 pb-24 md:pb-16 antialiased">
	<!-- 1. Responsive Landing Page Navbar & Announcement Bar -->
	<LandingNavbar
		title={landingPage?.title?.split('-')[0]?.trim() || product?.name || config?.headline || 'Store'}
		badgeText="১০০% প্রিমিয়াম ও অরিজিনাল পণ্য"
		announcementText="বিশেষ অফার চলছে • পণ্য হাতে পেয়ে চেক করে সম্পূর্ণ মূল্য পরিশোধ করুন"
		contactPhone={config?.contactPhone}
		accentColor="#059669"
		{navItems}
		onOrderClick={scrollToOrderForm}
	/>

	<main class="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-12 sm:space-y-16">
		<!-- 2. Hero Section: Catchy Headline & Live Urgency -->
		<section id="animated-hero" class="text-center space-y-4 scroll-mt-16">
			<!-- Floating Tag Badge -->
			<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs sm:text-sm font-bold shadow-2xs animate-pulse">
				<Flame class="w-4 h-4 text-rose-500" />
				<span>{config?.offerBadge || landingPage?.tag || 'সীমিত সময়ের ধামাকা অফার'}</span>
			</div>

			<!-- Main Headline -->
			<h1 class="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-snug sm:leading-tight max-w-4xl mx-auto">
				{config?.headline || landingPage?.title}
			</h1>

			<!-- Subheadline (supports HTML like product description) -->
			{#if config?.subheadline}
				<div class="lp-rich-text text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
					{@html config.subheadline}
				</div>
			{/if}

			<!-- Countdown Timer -->
			<div class="pt-2">
				<LandingCountdown initialMinutes={config?.countdownMinutes || 35} badgeText="অফারের সময় বাকি" />
			</div>
		</section>

		<!-- 3. Product Presentation & Pricing Grid -->
		<section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-xl">
			<!-- Left: Product Image Slider & Gallery (7 Cols) -->
			<div class="lg:col-span-7 space-y-4">
				<div
					class="relative aspect-square rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden group select-none"
					ontouchstart={handleTouchStart}
					ontouchend={handleTouchEnd}
				>
					<img
						src={activeImage}
						alt={product?.name || landingPage?.title}
						class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
					/>

					<!-- Discount Savings Badge -->
					{#if savings > 0}
						<div class="absolute top-3.5 left-3.5 bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md uppercase tracking-wider z-10">
							{formatTaka(savings)} ছাড়
						</div>
					{/if}

					<!-- Slider Counter Badge (when multiple images) -->
					{#if images.length > 1}
						<div class="absolute top-3.5 right-3.5 bg-slate-900/80 backdrop-blur-md text-white text-xs font-mono font-bold px-2.5 py-1 rounded-xl shadow-md z-10 flex items-center gap-1">
							<span>{activeImageIndex + 1}</span>
							<span class="text-slate-400">/</span>
							<span>{images.length}</span>
						</div>
					{/if}

					<!-- In Stock Status Badge -->
					<div class="absolute bottom-3.5 right-3.5 bg-white/95 backdrop-blur-xs text-emerald-700 text-xs font-bold px-3 py-1 rounded-xl shadow-sm border border-emerald-100 flex items-center gap-1.5 z-10">
						<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
						<span>ইন-স্টক এভেইলেবল</span>
					</div>

					<!-- Slider Navigation Arrows (shown when multiple images) -->
					{#if images.length > 1}
						<!-- Previous Arrow -->
						<button
							type="button"
							onclick={prevImage}
							class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-lg border border-slate-200/60 flex items-center justify-center transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 z-20 cursor-pointer"
							aria-label="আগের ছবি"
						>
							<ChevronLeft class="w-5 h-5 -ml-0.5" />
						</button>

						<!-- Next Arrow -->
						<button
							type="button"
							onclick={nextImage}
							class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-lg border border-slate-200/60 flex items-center justify-center transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 z-20 cursor-pointer"
							aria-label="পরের ছবি"
						>
							<ChevronRight class="w-5 h-5 -mr-0.5" />
						</button>

						<!-- Slider Dots (Overlay at bottom center) -->
						<div class="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full z-10">
							{#each images as _, dotIdx}
								<button
									type="button"
									onclick={() => (activeImageIndex = dotIdx)}
									class="transition-all rounded-full cursor-pointer {activeImageIndex === dotIdx
										? 'w-5 h-2 bg-white'
										: 'w-2 h-2 bg-white/50 hover:bg-white/80'}"
									aria-label={`স্লাইড ${dotIdx + 1}`}
								></button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Thumbnail Selector Strip if multiple images -->
				{#if images.length > 1}
					<div class="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar pt-1">
						{#each images as img, idx}
							<button
								type="button"
								onclick={() => (activeImageIndex = idx)}
								class="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 overflow-hidden transition-all shrink-0 cursor-pointer {activeImageIndex === idx
									? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-md scale-102'
									: 'border-slate-200/90 opacity-60 hover:opacity-100 hover:border-slate-400'}"
							>
								<img src={img} alt={`Thumb ${idx + 1}`} class="w-full h-full object-cover" loading="lazy" />
								{#if activeImageIndex === idx}
									<div class="absolute inset-0 bg-emerald-600/10 pointer-events-none"></div>
								{/if}
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

				<!-- Price / Package Selection -->
				{#if hasPackages}
					<!-- Package Selection Cards -->
					<div class="space-y-2.5">
						<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
							<Sparkles class="w-3.5 h-3.5 text-emerald-600" />
							<span>আপনার প্যাকেজ বেছে নিন:</span>
						</h3>
						{#each packages as pkg, idx}
							<button
								type="button"
								onclick={() => (selectedPackageIndex = idx)}
								class="w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative {selectedPackageIndex === idx
									? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500/30 shadow-md'
									: 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'}"
							>
								{#if pkg.tag}
									<span class="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-600 text-white shadow-sm">
										{pkg.tag}
									</span>
								{/if}
								<div class="flex items-center justify-between gap-2">
									<div class="flex items-center gap-2.5">
										<div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 {selectedPackageIndex === idx ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'}">
											{#if selectedPackageIndex === idx}
												<CheckCircle2 class="w-3.5 h-3.5 text-white" />
											{/if}
										</div>
										<div>
											<span class="text-sm font-bold text-slate-900">{pkg.title}</span>
											{#if pkg.subtitle}
												<span class="text-[11px] text-slate-500 block">{pkg.subtitle}</span>
											{/if}
											{#if pkg.freeGift}
												<span class="text-[10px] font-bold text-emerald-700 block mt-0.5">🎁 {pkg.freeGift}</span>
											{/if}
										</div>
									</div>
									<div class="text-right shrink-0">
										<span class="text-base font-black text-emerald-800 font-mono">{formatTaka(pkg.price)}</span>
										{#if pkg.originalPrice > pkg.price}
											<span class="text-[11px] text-slate-400 line-through font-mono block">{formatTaka(pkg.originalPrice)}</span>
										{/if}
										{#if pkg.freeDelivery}
											<span class="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">ফ্রি ডেলিভারি</span>
										{/if}
									</div>
								</div>
							</button>
						{/each}
					</div>

					{#if savings > 0}
						<div class="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/80 text-center">
							🎉 আপনি বাঁচাচ্ছেন মোট {formatTaka(savings)} টাকা!
						</div>
					{/if}
				{:else}
					<!-- Simple Price Block (no packages) -->
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
				{/if}

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

			<div class="grid grid-cols-2 gap-3 sm:gap-4">
				<div class="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-center space-y-2 sm:space-y-3">
					<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
						<Award class="w-5 h-5 sm:w-6 sm:h-6" />
					</div>
					<h3 class="font-bold text-sm sm:text-base text-slate-900">১০০% অরিজিনাল কোয়ালিটি</h3>
					<p class="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
						সরাসরি ফ্যাক্টরি গ্রেড উপাদান দিয়ে তৈরি, দীর্ঘস্থায়ী ব্যবহারের নিশ্চয়তা।
					</p>
				</div>

				<div class="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-center space-y-2 sm:space-y-3">
					<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
						<Truck class="w-5 h-5 sm:w-6 sm:h-6" />
					</div>
					<h3 class="font-bold text-sm sm:text-base text-slate-900">দ্রুততম হোম ডেলিভারি</h3>
					<p class="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
						ঢাকার ভেতরে ২৪ ঘণ্টা এবং সারাদেশে সর্বোচ্চ ৪৮ ঘণ্টার মধ্যে ডেলিভারি।
					</p>
				</div>

				<div class="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-center space-y-2 sm:space-y-3">
					<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
						<RotateCcw class="w-5 h-5 sm:w-6 sm:h-6" />
					</div>
					<h3 class="font-bold text-sm sm:text-base text-slate-900">নিরাপদ রিপ্লেসমেন্ট</h3>
					<p class="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
						পণ্য হাতে পেয়ে কোনো ডিফেক্ট থাকলে সহজেই সাথে সাথে রিটার্ন বা পরিবর্তন সম্ভব।
					</p>
				</div>

				<div class="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-center space-y-2 sm:space-y-3">
					<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
						<Headphones class="w-5 h-5 sm:w-6 sm:h-6" />
					</div>
					<h3 class="font-bold text-sm sm:text-base text-slate-900">২৪/৭ কাস্টমার সাপোর্ট</h3>
					<p class="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
						যেকোনো সমস্যায় আমাদের সাপোর্ট টিম সবসময় আপনার পাশে আছে।
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

			<LandingOrderForm {product} {config} {landingPage} {packages} {selectedPackageIndex} onPackageChange={(idx) => (selectedPackageIndex = idx)} />
		</section>

		<!-- 6. Real Customer Testimonials -->
		<section id="animated-reviews" class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs space-y-6">
			<div class="text-center space-y-1">
				<h3 class="text-lg sm:text-2xl font-bold text-slate-900">সন্তুষ্ট গ্রাহকদের মতামত</h3>
				<p class="text-xs text-slate-500">আমাদের শত শত গ্রাহক এই পণ্যটি ব্যবহার করে সন্তুষ্ট</p>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				{#each reviews as review}
					<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
						<div class="flex text-amber-400">
							{#each Array(review.rating || 5) as _}
								<Star class="w-3.5 h-3.5 fill-amber-400" />
							{/each}
						</div>
						<p class="text-xs text-slate-700 leading-relaxed">
							"{review.text}"
						</p>
						<div class="flex items-center justify-between pt-1">
							<div class="text-[11px] font-bold text-slate-900">
								— {review.name}{review.location ? ", " + review.location : ""}
							</div>
							{#if review.badge}
								<span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
									{review.badge}
								</span>
							{/if}
						</div>
					</div>
				{/each}
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

<style>
	:global(.lp-rich-text) {
		word-break: break-word;
	}
	:global(.lp-rich-text p) {
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}
	:global(.lp-rich-text ul),
	:global(.lp-rich-text ol) {
		padding-left: 1.5em;
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}
	:global(.lp-rich-text ul) {
		list-style-type: disc;
	}
	:global(.lp-rich-text ol) {
		list-style-type: decimal;
	}
	:global(.lp-rich-text li) {
		margin-top: 0.25em;
		margin-bottom: 0.25em;
	}
	:global(.lp-rich-text strong),
	:global(.lp-rich-text b) {
		font-weight: 700;
		color: #1e293b;
	}
	:global(.lp-rich-text em),
	:global(.lp-rich-text i) {
		font-style: italic;
	}
	:global(.lp-rich-text a) {
		color: #059669;
		text-decoration: underline;
	}
	:global(.lp-rich-text a:hover) {
		color: #047857;
	}
	:global(.lp-rich-text h1),
	:global(.lp-rich-text h2),
	:global(.lp-rich-text h3),
	:global(.lp-rich-text h4) {
		font-weight: 800;
		color: #0f172a;
		margin-top: 0.75em;
		margin-bottom: 0.25em;
	}
	:global(.lp-rich-text h1) { font-size: 1.5em; }
	:global(.lp-rich-text h2) { font-size: 1.25em; }
	:global(.lp-rich-text h3) { font-size: 1.1em; }
	:global(.lp-rich-text br) {
		content: '';
		display: block;
		margin-top: 0.5em;
	}
	:global(.lp-rich-text img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.75rem;
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}
	:global(.lp-rich-text table) {
		width: 100%;
		border-collapse: collapse;
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}
	:global(.lp-rich-text th),
	:global(.lp-rich-text td) {
		border: 1px solid #e2e8f0;
		padding: 0.5em 0.75em;
		text-align: left;
		font-size: 0.875em;
	}
	:global(.lp-rich-text th) {
		background-color: #f8fafc;
		font-weight: 700;
	}
</style>

