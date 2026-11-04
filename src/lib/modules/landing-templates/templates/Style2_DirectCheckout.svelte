<script lang="ts">
	import { submitAction } from '#lib/client/submit-action';
	import { Button, Badge, Card, CardHeader, CardTitle, CardContent, Input, Textarea, Separator } from '#lib/components/ui';
	import {
		ShieldCheck,
		Truck,
		Star,
		CheckCircle2,
		Award,
		PhoneCall,
		MapPin,
		User,
		Phone,
		FileText,
		Check,
		Sparkles,
		Flame,
		ArrowRight,
		Loader2,
		ShoppingCart,
		ChevronLeft,
		ChevronRight,
		HelpCircle
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import LandingNavbar from '../components/LandingNavbar.svelte';

	interface Props {
		landingPage: any;
	}

	let { landingPage }: Props = $props();

	const navItems = [
		{ label: 'হোম', targetId: 'direct-hero' },
		{ label: 'প্যাকেজ ও অফার', targetId: 'direct-packages' },
		{ label: 'গ্যালারি', targetId: 'direct-gallery' },
		{ label: 'অর্ডার ফর্ম', targetId: 'direct-checkout-form' }
	];

	let product = $derived(landingPage?.product || {});
	let config = $derived(landingPage?.config || {});

	// Image Gallery
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

	// Touch swipe support for mobile gallery
	let touchStartX = 0;
	let touchEndX = 0;

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].screenX;
		const diff = touchEndX - touchStartX;
		if (Math.abs(diff) > 40) {
			if (diff < 0) nextImage();
			else prevImage();
		}
	}

	// Pricing logic
	let basePrice = $derived(config?.customPrice || product?.price || 200);
	let originalBasePrice = $derived(config?.customOriginalPrice || product?.originalPrice || Math.round(basePrice * 1.25));

	// Dynamic Headline & Subheadline
	let headline = $derived(config?.headline || landingPage?.title || product?.name || 'বিশেষ অফার');
	let subheadline = $derived(config?.subheadline || product?.description || '');
	let contactPhone = $derived(config?.contactPhone || '01712345678');

	// Dynamic 4 Bullet Points
	let displayBullets = $derived.by(() => {
		if (config?.bulletPoints && Array.isArray(config.bulletPoints) && config.bulletPoints.length > 0) {
			return config.bulletPoints.filter(Boolean);
		}
		return [
			'১০০% প্রিমিয়াম ও অরিজিনাল কোয়ালিটি নিশ্চিত',
			'ক্যাশ অন ডেলিভারি — পণ্য দেখে মূল্য পরিশোধের সুবিধা',
			'পছন্দ না হলে সাথে সাথে রিটার্ন বা পরিবর্তন সুবিধা',
			'সারাদেশে দ্রুততম নিরাপদ হোম ডেলিভারি'
		];
	});

	// Dynamic Multi-Package Bundles (Supports 0, 1, 2, or 3 packages)
	let rawPackages = $derived(config?.packages);

	let packages = $derived.by(() => {
		if (Array.isArray(rawPackages) && rawPackages.length > 0) {
			return rawPackages.map((p: any, i: number) => ({
				id: p.id || `pack_${i + 1}`,
				qty: p.qty || (i + 1),
				title: p.title || `${i + 1}টি প্যাকেট`,
				subtitle: p.subtitle || '',
				price: Number(p.price) || (basePrice * (i + 1)),
				originalPrice: Number(p.originalPrice) || (originalBasePrice * (i + 1)),
				deliveryFee: p.freeDelivery ? 0 : (Number(p.deliveryFee) || (i === 0 ? 45 : 0)),
				freeDelivery: Boolean(p.freeDelivery || i > 0),
				tag: p.tag || (i === 1 ? '🔥 সেরা অফার' : i === 2 ? '🚀 সর্বোচ্চ সাশ্রয়ী' : ''),
				popular: i === 1 || p.popular
			}));
		}
		// If rawPackages is explicitly defined and empty:
		if (Array.isArray(rawPackages) && rawPackages.length === 0) {
			return [];
		}
		// If config.packages is undefined (legacy fallback without packages):
		return [];
	});

	// Selected package index
	let selectedPackageIndex = $state(0);
	$effect(() => {
		if (packages.length >= 2) {
			selectedPackageIndex = 1;
		} else {
			selectedPackageIndex = 0;
		}
	});

	let currentPackage = $derived(
		packages.length > 0 ? (packages[selectedPackageIndex] || packages[0]) : null
	);

	// Live calculations
	let unitPrice = $derived(currentPackage ? currentPackage.price : basePrice);
	let originalUnitPrice = $derived(currentPackage ? currentPackage.originalPrice : originalBasePrice);
	let subtotal = $derived(unitPrice);
	let deliveryCharge = $derived(currentPackage ? currentPackage.deliveryFee : (basePrice > 0 ? 45 : 0));
	let grandTotal = $derived(subtotal + deliveryCharge);
	let savings = $derived(Math.max(0, originalUnitPrice - unitPrice));
	let isPreview = $derived(landingPage?.isPreview || false);

	// Form fields
	let customerName = $state('');
	let customerPhone = $state('');
	let altPhone = $state('');
	let shippingAddress = $state('');
	let orderNote = $state('');

	let showAltPhone = $state(false);
	let showNote = $state(false);
	let isSubmitting = $state(false);

	function formatTaka(amount: number) {
		return `৳${amount.toLocaleString('en-BD')}`;
	}

	function scrollToCheckout() {
		const el = document.getElementById('direct-checkout-form');
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		}
	}

	async function handleDirectOrder(e: SubmitEvent) {
		e.preventDefault();

		if (isPreview) {
			toast.info('এটি প্রিভিউ মোড — কোনো আসল অর্ডার প্লেস করা হয়নি।');
			return;
		}

		const cleanPhone = customerPhone.trim().replace(/\D/g, '');
		if (!customerName.trim()) {
			toast.error('অনুগ্রহ করে আপনার নাম লিখুন');
			return;
		}
		if (cleanPhone.length < 11) {
			toast.error('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)');
			return;
		}
		if (!shippingAddress.trim()) {
			toast.error('আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন');
			return;
		}

		isSubmitting = true;

		try {
			const fd = new FormData();
			fd.append('customerName', customerName.trim());
			fd.append('customerPhone', customerPhone.trim());
			fd.append('shippingAddress', shippingAddress.trim());
			fd.append('deliveryArea', currentPackage?.freeDelivery ? 'inside_dhaka' : 'outside_dhaka');
			fd.append('paymentMethod', 'cod');
			fd.append('quantity', String(currentPackage?.qty || 1));
			fd.append('productId', product?.id || '');
			const packageLabel = currentPackage ? currentPackage.title : 'একক অফার';
			fd.append('productName', `${product?.name || config?.headline || 'Landing Product'} (${packageLabel})`);
			if (currentPackage) fd.append('packageIndex', String(selectedPackageIndex));

			const notes: string[] = [];
			notes.push(`প্যাকেজ: ${packageLabel} (মূল্য: ${formatTaka(unitPrice)})`);
			if (orderNote.trim()) notes.push(`গ্রাহকের নোট: ${orderNote.trim()}`);
			if (altPhone.trim()) notes.push(`বিকল্প নম্বর: ${altPhone.trim()}`);
			fd.append('orderNote', notes.join(' | '));

			const result = await submitAction('?/placeOrder', fd);

			if (result.ok) {
				toast.success('আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!');
				window.location.href = `/thank-you?order_id=${result.data.orderId}`;
			} else {
				toast.error(result.message);
			}
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>{headline} | বিশেষ অফার</title>
	<meta name="description" content={subheadline || headline} />
</svelte:head>

<!-- Outer Container -->
<div class="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white pb-24 md:pb-12">

	<!-- 1. Responsive Landing Page Navbar & Announcement Bar -->
	<LandingNavbar
		title={landingPage?.title?.split('-')[0]?.trim() || product?.name || headline || 'Aura Store'}
		badgeText="শতভাগ খাঁটি ও অরিজিনাল পণ্য"
		announcementText={config?.offerBadge ? `${config.offerBadge} • ফ্রি ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা!` : `${headline} স্পেশাল অফার চলছে!`}
		contactPhone={config?.contactPhone}
		accentColor="#059669"
		{navItems}
		onOrderClick={scrollToCheckout}
	/>

	<!-- Main Body Wrapper -->
	<main id="direct-hero" class="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6 scroll-mt-16">

		<!-- 2. Product Hero Title & Bullet Highlights -->
		<div class="space-y-3">
			<!-- Tag & Rating Badge -->
			<div class="flex flex-wrap items-center gap-2">
				<Badge variant="outline" class="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
					<Sparkles class="w-3 h-3 text-emerald-600" />
					<span>{landingPage?.tag || 'বিশেষ সিজনাল অফার'}</span>
				</Badge>
				<span class="text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/60">
					<Star class="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
					<span>৪.৯/৫ (৩,৫০০+ সন্তুষ্ট চাষী)</span>
				</span>
				<span class="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200/60">
					-২০% অফার চলছে
				</span>
			</div>

			<!-- Headline -->
			<h1 class="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
				{headline}
			</h1>

			<!-- Subtitle -->
			{#if subheadline}
				<p class="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
					{subheadline}
				</p>
			{/if}

			<!-- Bullet Features (Dynamic from config or sensible defaults) -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs sm:text-sm font-semibold text-slate-700">
				{#each displayBullets as bullet}
					<div class="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
						<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
						<span>{bullet}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- 3. Responsive Gallery Showcase -->
		<Card class="rounded-3xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm overflow-hidden">
			<!-- Main Photo -->
			<div
				class="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center select-none"
				role="region"
				aria-label="Product Image Showcase"
				ontouchstart={handleTouchStart}
				ontouchend={handleTouchEnd}
			>
				<img
					src={activeImage}
					alt={landingPage?.title || 'Product Image'}
					class="w-full h-full object-cover transition-all duration-300 hover:scale-102"
				/>

				{#if images.length > 1}
					<button
						type="button"
						aria-label="Previous Image"
						onclick={prevImage}
						class="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-slate-800 shadow-md flex items-center justify-center hover:bg-white transition-all cursor-pointer"
					>
						<ChevronLeft class="w-5 h-5" />
					</button>

					<button
						type="button"
						aria-label="Next Image"
						onclick={nextImage}
						class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-slate-800 shadow-md flex items-center justify-center hover:bg-white transition-all cursor-pointer"
					>
						<ChevronRight class="w-5 h-5" />
					</button>

					<!-- Indicator Dots -->
					<div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
						{#each images as _, idx}
							<button
								type="button"
								aria-label="Go to slide {idx + 1}"
								class="w-2 h-2 rounded-full transition-all cursor-pointer {idx === activeImageIndex ? 'bg-white w-4' : 'bg-white/50'}"
								onclick={() => (activeImageIndex = idx)}
							></button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Thumbnail Bar -->
			{#if images.length > 1}
				<div class="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
					{#each images as img, idx}
						<button
							type="button"
							onclick={() => (activeImageIndex = idx)}
							class="w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer {idx === activeImageIndex ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 opacity-60 hover:opacity-100'}"
						>
							<img src={img} alt="Thumbnail {idx + 1}" class="w-full h-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
		</Card>

		<!-- 4. SIGNATURE: Multi-Package Selection (Sarder Seed Style) -->
		{#if packages.length > 0}
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<h3 class="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
						<span>প্যাকেজ নির্বাচন করুন</span>
						{#if packages.some((p) => p.freeDelivery)}
							<span class="text-xs font-normal text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
								(২ বা ৩ প্যাকেট নিলে ডেলিভারি ফ্রি)
							</span>
						{/if}
					</h3>
				</div>

				<div class="grid gap-2 sm:gap-3 {packages.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : packages.length === 2 ? 'grid-cols-2 max-w-xl mx-auto' : 'grid-cols-1 sm:grid-cols-3'}">
					{#each packages as pkg, idx}
						<button
							type="button"
							onclick={() => (selectedPackageIndex = idx)}
							class="text-left rounded-2xl p-2.5 sm:p-4 border-2 transition-all relative cursor-pointer flex flex-col justify-between {selectedPackageIndex === idx ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'}"
						>
							<!-- Top badge -->
							{#if pkg.tag}
								<span class="absolute -top-2.5 sm:-top-3 right-2 sm:right-3 px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[10px] font-black uppercase text-white shadow-xs whitespace-nowrap {pkg.popular ? 'bg-emerald-600' : 'bg-indigo-600'}">
									{pkg.tag}
								</span>
							{/if}

							<div class="space-y-0.5 sm:space-y-1">
								<div class="flex items-center justify-between gap-1">
									<span class="text-xs sm:text-sm font-black text-slate-900 leading-tight">{pkg.title}</span>
									<div class="w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors {selectedPackageIndex === idx ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'}">
										{#if selectedPackageIndex === idx}
											<Check class="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
										{/if}
									</div>
								</div>
								{#if pkg.subtitle}
									<p class="text-[9.5px] sm:text-[11px] text-slate-500 font-medium leading-tight truncate">{pkg.subtitle}</p>
								{/if}
							</div>

							<div class="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
								<div>
									<span class="text-sm sm:text-lg font-black text-slate-900 leading-none">{formatTaka(pkg.price)}</span>
									<span class="text-[10px] sm:text-xs text-slate-400 line-through ml-0.5 sm:ml-1">{formatTaka(pkg.originalPrice)}</span>
								</div>

								{#if pkg.freeDelivery}
									<span class="text-[8.5px] sm:text-[10px] font-extrabold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-md text-center self-start sm:self-auto">
										ফ্রি ডেলিভারি
									</span>
								{:else}
									<span class="text-[8.5px] sm:text-[10px] font-bold text-slate-500 self-start sm:self-auto">
										+৳{pkg.deliveryFee} ডেলিভারি
									</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- 5. Trust & Assurance Cards (Dynamic) -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<!-- Trust Box 1 -->
			<Card class="rounded-2xl border-emerald-200/90 bg-linear-to-br from-emerald-50/70 to-white p-4 space-y-1.5 shadow-2xs">
				<div class="flex items-center gap-2 text-emerald-900 font-bold text-sm">
					<div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
						<ShieldCheck class="w-4 h-4" />
					</div>
					<span>{config?.trustBox1Title || 'নিশ্চিন্তে অর্ডার করুন'}</span>
				</div>
				<p class="text-xs text-slate-600 leading-relaxed pl-9">
					{config?.trustBox1Desc || 'কোনো অগ্রিম টাকা দিতে হবে না। অর্ডার প্লেস করার পর আমাদের প্রতিনিধি ফোনে কথা বলে কনফার্ম করবেন এবং পণ্য হাতে পেয়ে দেখে টাকা পরিশোধ করবেন।'}
				</p>
			</Card>

			<!-- Trust Box 2 -->
			<Card class="rounded-2xl border-amber-200/90 bg-linear-to-br from-amber-50/70 to-white p-4 space-y-1.5 shadow-2xs">
				<div class="flex items-center gap-2 text-amber-900 font-bold text-sm">
					<div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
						<Award class="w-4 h-4" />
					</div>
					<span>{config?.trustBox2Title || '🤝 আমাদের প্রতিশ্রুতি'}</span>
				</div>
				<p class="text-xs text-slate-600 leading-relaxed pl-9">
					{config?.trustBox2Desc || 'আমরা সর্বোচ্চ কোয়ালিটি এবং সন্তুষ্টি নিশ্চিত করি। কোনো সমস্যা প্রমাণিত হলে সম্পূর্ণ পরিবর্তন অথবা মানিব্যাক গ্যারান্টি।'}
				</p>
			</Card>
		</div>

		<!-- 6. Streamlined 3-Step Direct Checkout Form -->
		<div id="direct-checkout-form" class="scroll-mt-20">
			<Card class="rounded-3xl border-2 border-emerald-500 shadow-xl overflow-hidden bg-white">
				<!-- Form Header -->
				<CardHeader class="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 sm:p-6">
					<div class="flex items-center justify-between gap-3">
						<div>
							<CardTitle class="text-lg sm:text-xl font-bold flex items-center gap-2">
								<ShoppingCart class="w-5 h-5 text-emerald-300" />
								<span>ডেলিভারি ঠিকানা দিন ও অর্ডার কনফার্ম করুন</span>
							</CardTitle>
							<p class="text-xs text-emerald-100 mt-1">
								ক্যাশ অন ডেলিভারি — সম্পূর্ণ নিশ্চিন্তে ঘরে বসে পণ্য বুঝে নিন
							</p>
						</div>
						<Badge variant="outline" class="hidden sm:inline-flex bg-emerald-700/80 text-emerald-100 border-emerald-500 text-[10px] font-bold px-2.5 py-1 rounded-full">
							ক্যাশ অন ডেলিভারি
						</Badge>
					</div>
				</CardHeader>

				<CardContent class="p-5 sm:p-7 space-y-5">
					<form onsubmit={handleDirectOrder} class="space-y-5">

						<!-- Selected Package Summary Pill inside form -->
						<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
							<div class="flex items-center gap-3">
								<img
									src={activeImage}
									alt="Selected Product"
									class="w-12 h-12 rounded-xl object-cover border border-slate-200"
								/>
								<div>
									<h4 class="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
										{currentPackage ? (currentPackage.title + (currentPackage.subtitle ? ' — ' + currentPackage.subtitle : '')) : (product?.name || headline)}
									</h4>
									<p class="text-xs font-black text-emerald-700 mt-0.5">
										{formatTaka(unitPrice)}
										{#if currentPackage?.freeDelivery}
											<span class="text-[10px] text-emerald-600 font-bold ml-1">(ডেলিভারি ফ্রি)</span>
										{/if}
									</p>
								</div>
							</div>

							<Button
								type="button"
								variant="ghost"
								size="sm"
								class="text-xs text-slate-600 hover:text-emerald-700 font-bold underline cursor-pointer"
								onclick={() => {
									const el = document.getElementById('direct-checkout-form');
									if (el) el.scrollIntoView({ behavior: 'smooth' });
								}}
							>
								প্যাকেজ পরিবর্তন
							</Button>
						</div>

						<!-- Step 1: Customer Name -->
						<div class="space-y-1.5">
							<label for="order-name" class="block text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
								<span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">১</span>
								<span>আপনার নাম লিখুন <span class="text-rose-500">*</span></span>
							</label>
							<div class="relative">
								<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
									<User class="w-4 h-4" />
								</div>
								<Input
									id="order-name"
									type="text"
									bind:value={customerName}
									placeholder="যেমন: মো: আরিফুল ইসলাম"
									required
									class="pl-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-emerald-600 focus:ring-emerald-500"
								/>
							</div>
						</div>

						<!-- Step 2: Customer Phone (+88 BD format) -->
						<div class="space-y-1.5">
							<label for="order-phone" class="block text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
								<span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">২</span>
								<span>মোবাইল নম্বর <span class="text-rose-500">*</span></span>
							</label>
							<div class="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-white">
								<span class="bg-slate-100 px-3.5 flex items-center text-xs sm:text-sm font-bold text-slate-600 border-r border-slate-200 select-none">
									+88
								</span>
								<input
									id="order-phone"
									type="tel"
									bind:value={customerPhone}
									placeholder="01XXXXXXXXX"
									required
									class="w-full px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
								/>
							</div>

							<!-- Collapsible Alternate Phone -->
							<div class="pt-1">
								{#if !showAltPhone}
									<button
										type="button"
										onclick={() => (showAltPhone = true)}
										class="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
									>
										<span>+ বিকল্প মোবাইল নম্বর যোগ করুন (ঐচ্ছিক)</span>
									</button>
								{:else}
									<div class="space-y-1 pt-1">
										<Input
											type="tel"
											bind:value={altPhone}
											placeholder="বিকল্প নম্বর (যেমন: 018XXXXXXXX)"
											class="h-9 text-xs rounded-xl border-slate-200"
										/>
									</div>
								{/if}
							</div>
						</div>

						<!-- Step 3: Delivery Address -->
						<div class="space-y-1.5">
							<label for="order-address" class="block text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
								<span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">৩</span>
								<span>সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন <span class="text-rose-500">*</span></span>
							</label>
							<div class="relative">
								<Textarea
									id="order-address"
									bind:value={shippingAddress}
									placeholder="জেলা, থানা/উপজেলা, গ্রাম বা রোড ও বাড়ি নম্বর..."
									rows={3}
									required
									class="text-xs sm:text-sm rounded-xl border-slate-200 focus:border-emerald-600 focus:ring-emerald-500 resize-none"
								/>
							</div>

							<!-- Collapsible Order Note -->
							<div class="pt-1">
								{#if !showNote}
									<button
										type="button"
										onclick={() => (showNote = true)}
										class="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
									>
										<span>+ ডেলিভারির জন্য কোনো বিশেষ নির্দেশনা থাকলে লিখুন (ঐচ্ছিক)</span>
									</button>
								{:else}
									<div class="space-y-1 pt-1">
										<Input
											type="text"
											bind:value={orderNote}
											placeholder="যেমন: বিকেলে ডেলিভারি দিলে ভালো হয় / কল দিয়ে আসবেন"
											class="h-9 text-xs rounded-xl border-slate-200"
										/>
									</div>
								{/if}
							</div>
						</div>

						<!-- Order Bill Summary -->
						<div class="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2 text-xs sm:text-sm">
							<div class="flex justify-between text-slate-600">
								<span>নির্বাচিত পণ্য ({currentPackage?.title || 'একক পণ্য'})</span>
								<span class="font-bold text-slate-800">{formatTaka(subtotal)}</span>
							</div>
							<div class="flex justify-between text-slate-600">
								<span>ডেলিভারি চার্জ</span>
								{#if currentPackage?.freeDelivery}
									<span class="font-black text-emerald-700">৳০ (সম্পূর্ণ ফ্রি)</span>
								{:else}
									<span class="font-bold text-slate-800">৳{deliveryCharge}</span>
								{/if}
							</div>
							<Separator class="bg-emerald-200/60" />
							<div class="flex justify-between text-base font-black text-slate-900 pt-0.5">
								<span>সর্বমোট প্রদেয় বিল</span>
								<span class="text-lg text-emerald-700">{formatTaka(grandTotal)}</span>
							</div>
							{#if savings > 0}
								<p class="text-[11px] text-emerald-700 font-bold text-right">
									🎉 এই অর্ডারে আপনি মোট {formatTaka(savings)} সাশ্রয় করছেন!
								</p>
							{/if}
						</div>

						<!-- Big Pulsing Green Submit Button -->
						<Button
							type="submit"
							disabled={isSubmitting}
							class="w-full py-6 text-base sm:text-lg font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-600/30 gap-2 cursor-pointer transition-all active:scale-98"
						>
							{#if isSubmitting}
								<Loader2 class="w-5 h-5 animate-spin" />
								<span>অর্ডার প্রসেস হচ্ছে...</span>
							{:else}
								<span>অর্ডার কনফার্ম করুন — {formatTaka(grandTotal)}</span>
								<ArrowRight class="w-5 h-5" />
							{/if}
						</Button>

						<p class="text-center text-[11px] text-slate-500 font-medium">
							🔒 কোনো অগ্রিম টাকা নেওয়া হয় না। পণ্য দেখে চেক করে মূল্য পরিশোধ করুন।
						</p>
					</form>
				</CardContent>
			</Card>
		</div>

		<!-- 7. Footer / Brand Note -->
		<footer class="pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
			<p class="font-bold text-slate-700">
				{headline} — গ্রাহকের সন্তুষ্টিই আমাদের প্রথম লক্ষ্য
			</p>
			{#if contactPhone}
				<p>যেকোনো প্রয়োজনে সরাসরি কল করুন: <a href="tel:{contactPhone}" class="font-bold text-emerald-700 underline">{contactPhone}</a></p>
			{/if}
			<p class="text-[11px] text-slate-400">
				© {new Date().getFullYear()} সর্বস্বত্ব সংরক্ষিত।
			</p>
		</footer>

	</main>

	<!-- 8. Sticky Bottom Action Bar on Mobile -->
	<div class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl flex items-center justify-between gap-3">
		<div>
			<span class="text-[11px] text-slate-500 font-bold block leading-tight">{currentPackage?.title || (product?.name || headline)}</span>
			<span class="text-base font-black text-emerald-700 leading-tight">{formatTaka(grandTotal)}</span>
			{#if currentPackage?.freeDelivery}
				<span class="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 ml-1">
					ফ্রি শিপিং
				</span>
			{/if}
		</div>

		<Button
			size="sm"
			class="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/30 gap-1.5 cursor-pointer"
			onclick={scrollToCheckout}
		>
			<ShoppingCart class="w-4 h-4" />
			<span>অর্ডার করুন</span>
		</Button>
	</div>

</div>
