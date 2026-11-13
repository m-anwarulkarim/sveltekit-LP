<script lang="ts">
	import { goto } from '$app/navigation';
	import { submitAction } from '#lib/client/submit-action';
	import { trackMetaEvent } from '#lib/client/meta-pixel';
	import { trackGtmAddToCart, trackGtmBeginCheckout } from '#lib/client/gtm';
	import { sanitizeRichText } from '#lib/utils/sanitize-html';
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
	let contactPhone = $derived(config?.contactPhone || '');

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
				deliveryFee: p.freeDelivery ? 0 : (Number(p.deliveryFee) || 45),
				freeDelivery: Boolean(p.freeDelivery),
				tag: p.tag || (i === 1 ? '🔥 সেরা অফার' : i === 2 ? '🚀 সর্বোচ্চ সাশ্রয়ী' : ''),
				popular: Boolean(p.popular) || i === 1
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
	let selectedPackageIndex = $state(packages.length >= 2 ? 1 : 0);

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

	let hasTrackedAddToCart = false;
	function triggerAddToCart() {
		if (hasTrackedAddToCart || isPreview || typeof window === 'undefined') return;
		hasTrackedAddToCart = true;
		const matchId = String(product?.id || landingPage?.id || 'lp-prod');
		const title = product?.name || config?.headline || landingPage?.title || 'Landing Product';
		const amt = Number(subtotal || unitPrice || 0);

		trackMetaEvent('AddToCart', {
			content_name: title,
			content_ids: [matchId],
			content_type: 'product',
			value: amt,
			currency: 'BDT'
		});

		trackGtmAddToCart({
			item: {
				item_id: matchId,
				item_name: title,
				price: Number(unitPrice || 0),
				quantity: Number(currentPackage?.qty || 1)
			},
			currency: 'BDT'
		});
	}

	let hasTrackedCheckout = false;
	function triggerInitiateCheckout() {
		if (hasTrackedCheckout || isPreview || typeof window === 'undefined') return;
		hasTrackedCheckout = true;
		triggerAddToCart();

		const matchId = String(product?.id || landingPage?.id || 'lp-prod');
		const title = product?.name || config?.headline || landingPage?.title || 'Landing Product';
		const amt = Number(subtotal || unitPrice || 0);

		trackMetaEvent('InitiateCheckout', {
			content_name: title,
			content_ids: [matchId],
			content_type: 'product',
			value: amt,
			currency: 'BDT',
			num_items: Number(currentPackage?.qty || 1)
		});

		trackGtmBeginCheckout({
			total: amt,
			currency: 'BDT',
			items: [
				{
					item_id: matchId,
					item_name: title,
					price: Number(unitPrice || 0),
					quantity: Number(currentPackage?.qty || 1)
				}
			]
		});
	}

	function scrollToCheckout() {
		triggerAddToCart();
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
				try {
					await goto(`/thank-you?order_id=${result.data.orderId}`);
				} catch {
					window.location.href = `/thank-you?order_id=${result.data.orderId}`;
				}
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
		title={landingPage?.title?.split('-')[0]?.trim() || product?.name || headline || 'Store'}
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
			<!-- Tag & Rating Badge with Animated Highlights -->
			<div class="flex flex-wrap items-center gap-2">
				<Badge variant="outline" class="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
					<Sparkles class="w-3.5 h-3.5 text-emerald-600 animate-spin" style="animation-duration: 9s;" />
					<span>{landingPage?.tag || 'বিশেষ সিজনাল অফার'}</span>
				</Badge>

				<span class="text-xs font-bold text-amber-700 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80 shadow-2xs">
					<Star class="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
					<span>৪.৯/৫ (৩,৫০০+ সন্তুষ্ট ক্রেতা)</span>
				</span>

				<span class="relative inline-flex items-center gap-1 text-xs font-black text-white bg-gradient-to-r from-rose-500 via-red-600 to-rose-600 px-3 py-1 rounded-full shadow-md shadow-rose-500/30 offer-badge-pop">
					<Flame class="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
					<span>{config?.offerBadge || '-২০% স্পেশাল অফার'}</span>
				</span>
			</div>

			<!-- Headline -->
			<h1 class="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
				{headline}
			</h1>

			<!-- Subtitle (supports HTML / Rich Text) -->
			{#if subheadline}
				<div class="lp-rich-text text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
					{@html sanitizeRichText(subheadline)}
				</div>
			{/if}

			<!-- Bullet Features (Dynamic from config or sensible defaults) -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs sm:text-sm font-semibold text-slate-700">
				{#each displayBullets as bullet}
					<div class="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
						<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
						<span>{@html sanitizeRichText(bullet)}</span>
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
			<div id="direct-packages" class="space-y-3.5 scroll-mt-20">
				<div class="flex items-center justify-between gap-2 flex-wrap">
					<h3 class="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
						<span>প্যাকেজ নির্বাচন করুন</span>
					</h3>
					{#if packages.some((p) => p.freeDelivery)}
						<span class="relative inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
							<span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
							<span>২ বা ৩ প্যাকেট নিলে ফ্রি ডেলিভারি!</span>
						</span>
					{/if}
				</div>

				<div class="grid gap-1.5 sm:gap-3 {packages.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : packages.length === 2 ? 'grid-cols-2 max-w-xl mx-auto' : 'grid-cols-3'}">
					{#each packages as pkg, idx}
						{@const isSelected = selectedPackageIndex === idx}
						<button
							type="button"
							onclick={() => (selectedPackageIndex = idx)}
							class="text-left rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border-2 transition-all relative cursor-pointer flex flex-col justify-between {isSelected ? 'border-emerald-600 bg-gradient-to-b from-emerald-50/80 via-emerald-50/30 to-white ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-600/15 package-card-selected' : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm shadow-2xs'}"
						>
							<!-- Top badge with animated shine -->
							{#if pkg.tag}
								<span class="absolute -top-2.5 sm:-top-3 right-1 sm:right-3 px-2 sm:px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase text-white shadow-md whitespace-nowrap cta-shimmer-btn offer-badge-pop {pkg.popular ? 'bg-gradient-to-r from-emerald-600 to-teal-700 shadow-emerald-500/30' : 'bg-gradient-to-r from-indigo-600 to-violet-700 shadow-indigo-500/30'}">
									{pkg.tag}
								</span>
							{/if}

							<div class="space-y-0.5 sm:space-y-1">
								<div class="flex items-start justify-between gap-1">
									<span class="text-[11px] sm:text-sm font-black leading-tight {isSelected ? 'text-emerald-950 font-black' : 'text-slate-900'}">{pkg.title}</span>
									<div class="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 transition-all {isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs scale-105' : 'border-slate-300 bg-white'}">
										{#if isSelected}
											<Check class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 stroke-[3]" />
										{/if}
									</div>
								</div>
								{#if pkg.subtitle}
									<p class="text-[8.5px] sm:text-[11px] text-slate-500 font-medium leading-tight line-clamp-1 sm:line-clamp-none">{pkg.subtitle}</p>
								{/if}
							</div>

							<div class="mt-2.5 sm:mt-4 pt-1.5 sm:pt-3 border-t border-slate-200/80 flex flex-col gap-1">
								<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
									<span class="text-xs sm:text-lg font-black text-slate-900 leading-none {isSelected ? 'text-emerald-700' : ''}">{formatTaka(pkg.price)}</span>
									{#if pkg.originalPrice && pkg.originalPrice > pkg.price}
										<span class="text-[9px] sm:text-xs text-slate-400 line-through">{formatTaka(pkg.originalPrice)}</span>
									{/if}
								</div>

								{#if pkg.freeDelivery}
									<span class="text-[7.5px] sm:text-[10px] font-black text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded text-center self-start whitespace-nowrap shadow-2xs">
										ফ্রি ডেলিভারি
									</span>
								{:else}
									<span class="text-[7.5px] sm:text-[10px] font-bold text-slate-500 self-start whitespace-nowrap">
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
				<div class="text-xs text-slate-600 leading-relaxed pl-9">
					{@html sanitizeRichText(config?.trustBox1Desc || 'কোনো অগ্রিম টাকা দিতে হবে না। অর্ডার প্লেস করার পর আমাদের প্রতিনিধি ফোনে কথা বলে কনফার্ম করবেন এবং পণ্য হাতে পেয়ে দেখে টাকা পরিশোধ করবেন।')}
				</div>
			</Card>

			<!-- Trust Box 2 -->
			<Card class="rounded-2xl border-amber-200/90 bg-linear-to-br from-amber-50/70 to-white p-4 space-y-1.5 shadow-2xs">
				<div class="flex items-center gap-2 text-amber-900 font-bold text-sm">
					<div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
						<Award class="w-4 h-4" />
					</div>
					<span>{config?.trustBox2Title || '🤝 আমাদের প্রতিশ্রুতি'}</span>
				</div>
				<div class="text-xs text-slate-600 leading-relaxed pl-9">
					{@html sanitizeRichText(config?.trustBox2Desc || 'আমরা সর্বোচ্চ কোয়ালিটি এবং সন্তুষ্টি নিশ্চিত করি। কোনো সমস্যা প্রমাণিত হলে সম্পূর্ণ পরিবর্তন অথবা মানিব্যাক গ্যারান্টি।')}
				</div>
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

				<CardContent class="p-4 sm:p-7 space-y-5">
					<form onsubmit={handleDirectOrder} class="space-y-5">

						<!-- Selected Package Summary Pill inside form -->
						<div class="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5">
							<div class="flex items-center justify-between gap-2 border-b border-emerald-100/80 pb-2">
								<span class="text-[11px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
									<CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
									<span>নির্বাচিত অফার</span>
								</span>
								{#if packages.length > 1}
									<button
										type="button"
										onclick={() => {
											const el = document.getElementById('direct-packages');
											if (el) el.scrollIntoView({ behavior: 'smooth' });
										}}
										class="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer flex items-center gap-1 shrink-0"
									>
										<span>প্যাকেজ পরিবর্তন</span>
										<ArrowRight class="w-3 h-3" />
									</button>
								{/if}
							</div>

							<div class="flex items-center gap-3 min-w-0">
								<img
									src={activeImage}
									alt="Selected Product"
									class="w-12 h-12 rounded-xl object-cover border border-emerald-200 shrink-0 bg-white"
								/>
								<div class="min-w-0 flex-1">
									<h4 class="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
										{currentPackage ? currentPackage.title : (product?.name || headline)}
										{#if currentPackage?.subtitle}
											<span class="text-[11px] text-slate-500 font-normal"> — {currentPackage.subtitle}</span>
										{/if}
									</h4>
									<div class="flex items-center gap-2 mt-1 flex-wrap">
										<span class="text-sm sm:text-base font-black text-emerald-700 font-mono">
											{formatTaka(unitPrice)}
										</span>
										{#if currentPackage?.freeDelivery}
											<span class="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
												ডেলিভারি ফ্রি
											</span>
										{:else}
											<span class="text-[10px] font-medium text-slate-500">
												(+৳{currentPackage?.deliveryFee || 45} ডেলিভারি)
											</span>
										{/if}
									</div>
								</div>
							</div>
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
									onfocus={triggerInitiateCheckout}
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
									onfocus={triggerInitiateCheckout}
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
								<div class="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2 shadow-2xs">
									<div class="flex items-center gap-1.5">
										<Sparkles class="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
										<span>অভিনন্দন! এই অফারে আপনার মোট সাশ্রয়:</span>
									</div>
									<span class="font-black text-emerald-700 text-sm font-mono whitespace-nowrap bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-200">
										{formatTaka(savings)}
									</span>
								</div>
							{/if}
						</div>

						<!-- Big Pulsing Shiny Green Submit Button -->
						<Button
							type="submit"
							disabled={isSubmitting}
							class="w-full py-6 text-base sm:text-lg font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl shadow-xl shadow-emerald-600/35 gap-2.5 cursor-pointer transition-all active:scale-98 cta-shimmer-btn glow-btn"
						>
							{#if isSubmitting}
								<Loader2 class="w-5 h-5 animate-spin" />
								<span>অর্ডার প্রসেস হচ্ছে...</span>
							{:else}
								<ShoppingCart class="w-5 h-5" />
								<span>অর্ডার কনফার্ম করুন — {formatTaka(grandTotal)}</span>
								<ArrowRight class="w-5 h-5 stroke-[2.5] animate-pulse" />
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
	<div class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-2.5 px-4 shadow-2xl flex items-center justify-between gap-3 font-sans">
		<div class="min-w-0">
			<span class="text-[11px] text-slate-500 font-bold block leading-tight truncate">{currentPackage?.title || (product?.name || headline)}</span>
			<div class="flex items-baseline gap-1.5">
				<span class="text-base font-black text-emerald-700 leading-tight font-mono">{formatTaka(grandTotal)}</span>
				{#if currentPackage?.freeDelivery}
					<span class="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300">
						ফ্রি শিপিং
					</span>
				{/if}
			</div>
		</div>

		<Button
			size="sm"
			class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/35 gap-1.5 cursor-pointer active:scale-95 cta-shimmer-btn glow-btn shrink-0"
			onclick={scrollToCheckout}
		>
			<ShoppingCart class="w-4 h-4" />
			<span>অর্ডার করুন</span>
		</Button>
	</div>

</div>

<style>
	:global(.lp-rich-text) {
		word-break: break-word;
	}
	:global(.lp-rich-text p) {
		margin-bottom: 0.5em;
	}
	:global(.lp-rich-text p:last-child) {
		margin-bottom: 0;
	}
	:global(.lp-rich-text ul),
	:global(.lp-rich-text ol) {
		margin-top: 0.5em;
		margin-bottom: 0.5em;
		padding-left: 1.5em;
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
		color: #0f172a;
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

	/* Luxury Shimmer Sweep Animation */
	@keyframes cta-shimmer {
		0% {
			transform: translateX(-150%) skewX(-20deg);
		}
		35%, 100% {
			transform: translateX(250%) skewX(-20deg);
		}
	}

	.cta-shimmer-btn {
		position: relative;
		overflow: hidden;
	}

	.cta-shimmer-btn::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 50%;
		height: 100%;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0) 0%,
			rgba(255, 255, 255, 0.45) 50%,
			rgba(255, 255, 255, 0) 100%
		);
		transform: translateX(-150%) skewX(-20deg);
		animation: cta-shimmer 2.8s ease-in-out infinite;
		pointer-events: none;
	}

	/* Pulsing Glow Effect for Primary Action */
	@keyframes glow-pulse {
		0%, 100% {
			box-shadow: 0 10px 25px -4px rgba(5, 150, 105, 0.4), 0 4px 12px -2px rgba(5, 150, 105, 0.25);
		}
		50% {
			box-shadow: 0 14px 35px 0 rgba(5, 150, 105, 0.65), 0 0 24px 2px rgba(16, 185, 129, 0.4);
		}
	}

	.glow-btn {
		animation: glow-pulse 2.2s infinite;
	}

	/* Badge Pop Animation */
	@keyframes badge-pop {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.06);
		}
	}

	.offer-badge-pop {
		animation: badge-pop 2.4s ease-in-out infinite;
	}

	/* Elevated Selected Package State */
	.package-card-selected {
		box-shadow: 0 0 0 2px #059669, 0 10px 25px -5px rgba(5, 150, 105, 0.25);
		transform: translateY(-2px);
	}
</style>
