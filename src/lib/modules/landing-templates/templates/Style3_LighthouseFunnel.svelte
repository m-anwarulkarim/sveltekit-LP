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
		HelpCircle,
		Plus,
		Minus,
		Gift,
		ChevronDown,
		Lock,
		CheckCircle,
		Zap,
		Tag,
		Clock,
		Percent
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import LandingNavbar from '../components/LandingNavbar.svelte';
	import LandingCountdown from '../components/LandingCountdown.svelte';

	interface Props {
		landingPage: any;
	}

	let { landingPage }: Props = $props();

	const navItems = [
		{ label: 'হোম', targetId: 'lh-hero' },
		{ label: 'প্যাকেজসমূহ', targetId: 'lighthouse-packages-step' },
		{ label: 'অর্ডার ফর্ম', targetId: 'lighthouse-checkout-step' },
		{ label: 'উপকারিতা', targetId: 'lighthouse-benefits-step' },
		{ label: 'রিভিউ', targetId: 'lighthouse-reviews-step' },
		{ label: 'প্রশ্ন-উত্তর', targetId: 'lighthouse-faqs-step' }
	];

	let product = $derived(landingPage?.product || {});
	let config = $derived(landingPage?.config || {});
	let isPreview = $derived(landingPage?.isPreview || false);

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
		activeImageIndex = (activeImageIndex + 1) % images.length;
	}

	function prevImage() {
		activeImageIndex = (activeImageIndex - 1 + images.length) % images.length;
	}

	// Mobile Touch Swipe Handling
	let touchStartX = 0;
	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}
	function handleTouchEnd(e: TouchEvent) {
		const touchEndX = e.changedTouches[0].clientX;
		const diff = touchStartX - touchEndX;
		if (Math.abs(diff) > 40) {
			if (diff > 0) nextImage();
			else prevImage();
		}
	}

	// Dynamic Pricing & Headline
	let basePrice = $derived(Number(config?.customPrice) || Number(product?.price) || 350);
	let originalBasePrice = $derived(Number(config?.customOriginalPrice) || Number(product?.originalPrice) || 1090);
	let headline = $derived(config?.headline || product?.name || 'আপনার দৈনন্দিন জীবনের প্রতিটি মুহূর্তে সুরক্ষা');
	let subheadline = $derived(config?.subheadline || product?.description || 'প্রিমিয়াম কোয়ালিটি পণ্য দিয়ে আপনার ও পরিবারের জন্য নিশ্চিত করুন ১০০% স্বাস্থ্যসম্মত সমাধান।');
	let contactPhone = $derived(config?.contactPhone || '');

	// DYNAMIC PACKAGES (Supports 0, 1, 2, or 3 packages)
	let rawPackages = $derived(config?.packages || []);

	let packages = $derived.by(() => {
		if (Array.isArray(rawPackages) && rawPackages.length > 0) {
			return rawPackages.map((p: any, i: number) => {
				const price = Number(p.price) || (basePrice * (i + 1));
				const originalPrice = Number(p.originalPrice) || Math.round(price * 1.5);
				const saveAmount = p.saveAmount !== undefined ? Number(p.saveAmount) : Math.max(0, originalPrice - price);
				return {
					id: p.id || `pack_${i + 1}`,
					title: p.title || `${i + 1} পিস কম্বো প্যাক`,
					freeGift: p.freeGift || (i === 0 ? '+ ১০ পিস ফিল্টার বেল্ট ফ্রি!' : i === 1 ? '+ ২০ পিস ফিল্টার বেল্ট ফ্রি!' : '+ ৪০ পিস ফিল্টার বেল্ট ফ্রি!'),
					subtitle: p.subtitle || (i === 0 ? 'ছোট পরিবারের জন্য আদর্শ ও সাশ্রয়ী' : i === 1 ? 'সবচেয়ে বেশি বিক্রিত ও সর্বোচ্চ সাশ্রয়ী' : 'পুরো পরিবারের নিশ্চিন্ত সমাধান'),
					price,
					originalPrice,
					saveAmount,
					deliveryFee: p.freeDelivery ? 0 : (Number(p.deliveryFee) || 0),
					freeDelivery: Boolean(p.freeDelivery),
					tag: p.tag || (i === 1 ? '🔥 সবচেয়ে জনপ্রিয়' : i === 2 ? '🚀 মেগা সেভার কম্বো' : '🌿 স্টার্টার কম্বো'),
					popular: Boolean(p.popular) || i === 1
				};
			});
		}
		// When no packages are provided (0 packages):
		return [];
	});

	let selectedPackageIndex = $state(packages.length >= 2 ? 1 : 0);

	let currentPackage = $derived(
		packages.length > 0 ? (packages[selectedPackageIndex] || packages[0]) : null
	);

	// Function to select package with active feedback and tracking
	function selectPackage(idx: number) {
		selectedPackageIndex = idx;
		triggerAddToCart();
	}

	// Dynamic Package Styling Theme & Animations per Index
	function getPackageTheme(idx: number, isPopular: boolean) {
		if (isPopular || idx === 1) {
			return {
				themeKey: 'popular',
				borderSelected: 'border-[#e8007c] ring-4 ring-[#e8007c]/25 shadow-2xl shadow-[#e8007c]/30 scale-[1.02] md:scale-[1.03] -translate-y-2',
				borderUnselected: 'border-slate-200 hover:border-[#e8007c]/60 hover:shadow-xl hover:-translate-y-1',
				accentColor: '#e8007c',
				badgeBg: 'bg-gradient-to-r from-[#e8007c] via-rose-500 to-[#e8007c] text-white',
				badgeText: '🔥 সবচেয়ে জনপ্রিয় (Best Seller)',
				badgeGlow: 'shadow-[0_0_18px_rgba(232,0,124,0.45)]',
				bgHeader: 'bg-gradient-to-br from-[#e8007c]/12 via-rose-500/6 to-transparent',
				radioSelected: 'bg-[#e8007c] border-[#e8007c] text-white ring-2 ring-[#e8007c]/40',
				btnSelected: 'bg-gradient-to-r from-[#e8007c] via-rose-500 to-[#e8007c] text-white shadow-lg shadow-[#e8007c]/35',
				cornerRibbon: 'বেস্ট ভ্যালু',
				cardBg: 'bg-white'
			};
		}
		if (idx === 2) {
			return {
				themeKey: 'mega',
				borderSelected: 'border-indigo-600 ring-4 ring-indigo-500/25 shadow-2xl shadow-indigo-600/30 scale-[1.02] md:scale-[1.03] -translate-y-2',
				borderUnselected: 'border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1',
				accentColor: '#4f46e5',
				badgeBg: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white',
				badgeText: '🚀 মেগা সেভার প্যাক (সর্বোচ্চ সাশ্রয়)',
				badgeGlow: 'shadow-[0_0_18px_rgba(79,70,229,0.45)]',
				bgHeader: 'bg-gradient-to-br from-indigo-500/12 via-purple-500/6 to-transparent',
				radioSelected: 'bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-500/40',
				btnSelected: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/35',
				cornerRibbon: 'সর্বোচ্চ ছাড়',
				cardBg: 'bg-white'
			};
		}
		// Starter / Standard (idx === 0 or default)
		return {
			themeKey: 'starter',
			borderSelected: 'border-emerald-600 ring-4 ring-emerald-500/25 shadow-2xl shadow-emerald-600/25 scale-[1.02] md:scale-[1.03] -translate-y-2',
			borderUnselected: 'border-slate-200 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1',
			accentColor: '#059669',
			badgeBg: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
			badgeText: '🌿 স্টার্টার কম্বো (জনপ্রিয় পছন্দ)',
			badgeGlow: 'shadow-[0_0_18px_rgba(5,150,105,0.35)]',
			bgHeader: 'bg-gradient-to-br from-emerald-500/12 via-teal-500/6 to-transparent',
			radioSelected: 'bg-emerald-600 border-emerald-600 text-white ring-2 ring-emerald-500/40',
			btnSelected: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white shadow-lg shadow-emerald-600/30',
			cornerRibbon: 'স্মার্ট সেভার',
			cardBg: 'bg-white'
		};
	}

	// Maximum Savings Calculation for Offer Headline
	let maxSaveAmount = $derived.by(() => {
		if (packages.length > 0) {
			return Math.max(...packages.map((p) => p.saveAmount || 0));
		}
		return Math.max(0, originalBasePrice - basePrice);
	});

	// Quantity selector in checkout
	let quantity = $state(1);

	// Delivery Area Selector (Default inside Dhaka 70, outside 120)
	let deliveryArea = $state<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
	let insideDhakaFee = 70;
	let outsideDhakaFee = 120;

	// Live calculations
	let unitPrice = $derived(currentPackage ? currentPackage.price : basePrice);
	let originalUnitPrice = $derived(currentPackage ? currentPackage.originalPrice : originalBasePrice);
	let subtotal = $derived(unitPrice * quantity);

	let deliveryCharge = $derived.by(() => {
		if (currentPackage?.freeDelivery) return 0;
		return deliveryArea === 'inside_dhaka' ? insideDhakaFee : outsideDhakaFee;
	});

	let grandTotal = $derived(subtotal + deliveryCharge);
	let totalSavings = $derived(
		Math.max(0, (originalUnitPrice * quantity) - subtotal)
	);

	// Form fields
	let customerName = $state('');
	let customerPhone = $state('');
	let shippingAddress = $state('');
	let orderNote = $state('');
	let isSubmitting = $state(false);

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
				quantity: Number(quantity || 1)
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
			num_items: Number(quantity || 1)
		});

		trackGtmBeginCheckout({
			total: amt,
			currency: 'BDT',
			items: [
				{
					item_id: matchId,
					item_name: title,
					price: Number(unitPrice || 0),
					quantity: Number(quantity || 1)
				}
			]
		});
	}

	const defaultReviews = [
		{ name: 'মীর তানভীর আহমেদ', location: 'মিরপুর, ঢাকা', text: '১০০ পিস কম্বো প্যাকটি নিয়েছি। আমাদের ট্যাপের পানিতে প্রচুর আয়রন আর জং আসত। এই ফিল্টার লাগানোর পর পানি একদম কাঁচের মতো পরিষ্কার। সার্ভিস খুবই ভালো!', rating: 5, badge: '১০০ পিস কম্বো' },
		{ name: 'নুসরাত জাহান', location: 'উত্তরা, ঢাকা', text: 'বাচ্চাদের জন্য পানির বিশুদ্ধতা নিয়ে খুব টেনশনে থাকতাম। মাত্র এক মিনিটে কিচেন ও বেসিনের ট্যাপে লাগিয়ে নিয়েছি। ডেলিভারি মাত্র ২ দিনে পেয়েছি।', rating: 5, badge: '৫০ পিস প্যাক' },
		{ name: 'আব্দুল কাইয়ুম', location: 'আগ্রাবাদ, চট্টগ্রাম', text: '২০০ পিসের মেগা সেভার প্যাকটি অর্ডার করেছিলাম। পুরো পরিবারের এক বছরের নিশ্চিন্ত সমাধান হয়ে গেল। কোনো অগ্রিম টাকা দিতে হয়নি।', rating: 5, badge: '২০০ পিস মেগা সেভার' }
	];
	let reviews = $derived(
		config?.reviews && Array.isArray(config.reviews) && config.reviews.length > 0
			? config.reviews
			: defaultReviews
	);

	function formatTaka(amount: number) {
		return `৳${amount.toLocaleString('en-BD')}`;
	}

	function scrollToCheckout() {
		triggerAddToCart();
		const el = document.getElementById('lighthouse-checkout-step');
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function scrollToPackages() {
		const el = document.getElementById('lighthouse-packages-step');
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		} else {
			scrollToCheckout();
		}
	}

	// Interactive FAQ Toggle State
	let openFaqIndices = $state<number[]>([0]); // First FAQ open by default
	function toggleFaq(idx: number) {
		if (openFaqIndices.includes(idx)) {
			openFaqIndices = openFaqIndices.filter((i) => i !== idx);
		} else {
			openFaqIndices = [...openFaqIndices, idx];
		}
	}

	const defaultFaqs = [
		{
			q: 'এই ফিল্টারটি কি যেকোনো সাধারণ পানির ট্যাপে লাগানো যাবে?',
			a: 'হ্যাঁ, আপনার বাথরুম, কিচেন সিঙ্ক বা বেসিনের যেকোনো সাধারণ গোলাকার ট্যাপে এটি খুব সহজেই কোনো টুলস বা মিস্ত্রি ছাড়া মাত্র ১ মিনিটে ফ্রি বেল্ট দিয়ে টাইট করে লাগানো যায়।'
		},
		{
			q: 'একটি ফিল্টার কতদিন ব্যবহার করা যায়?',
			a: 'পানির ময়লা ও আয়রনের পরিমাণের ওপর নির্ভর করে একেকটি ফিল্টার সাধারণত ৩ থেকে ৪ সপ্তাহ অনায়াসেই ব্যবহার করা যায়। ফিল্টারের রঙ ঘোলা বা বাদামি হয়ে গেলে সহজেই নতুন ফিল্টার পরিবর্তন করে নিতে পারবেন।'
		},
		{
			q: 'আমি কি আগে প্রোডাক্ট চেক করে তারপর টাকা দিতে পারব?',
			a: 'জি, শতভাগ ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। ডেলিভারিম্যান আপনার ঠিকানায় পৌঁছালে প্যাকেট খুলে পণ্য দেখে ও নিশ্চিত হয়ে মূল্য পরিশোধ করবেন। কোনো অগ্রিম ফি দিতে হয় না।'
		},
		{
			q: 'অর্ডার করার কতদিনের মধ্যে ডেলিভারি পাব?',
			a: 'ঢাকার ভেতরে সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২ থেকে ৩ দিনের মধ্যে সম্পূর্ণ সুরক্ষিতভাবে হোম ডেলিভারি পৌঁছে দেওয়া হয়।'
		}
	];

	async function handleOrderSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (isPreview) {
			toast.info('এটি প্রিভিউ মোড — কোনো আসল অর্ডার প্লেস করা হয়নি।');
			return;
		}

		const cleanPhone = customerPhone.trim().replace(/\D/g, '');
		if (!customerName.trim()) {
			toast.error('অনুগ্রহ করে আপনার পুরো নাম লিখুন');
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
			fd.append('deliveryArea', deliveryArea);
			fd.append('paymentMethod', 'cod');
			fd.append('quantity', String(quantity));
			fd.append('productId', product?.id || '');
			const packageTitle = currentPackage ? currentPackage.title : 'একক অফার';
			fd.append('productName', `${product?.name || headline} (${packageTitle})`);
			if (currentPackage) fd.append('packageIndex', String(selectedPackageIndex));

			const notes: string[] = [];
			notes.push(`প্যাকেজ: ${packageTitle}`);
			if (currentPackage?.freeGift) notes.push(`উপহার: ${currentPackage.freeGift}`);
			notes.push(`ডেলিভারি এরিয়া: ${deliveryArea === 'inside_dhaka' ? 'ঢাকার ভেতরে (৳৭০)' : 'ঢাকার বাইরে (৳১২০)'}`);
			if (orderNote.trim()) notes.push(`গ্রাহকের নোট: ${orderNote.trim()}`);
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
	<title>{headline} | স্পেশাল ধামাকা অফার</title>
	<meta name="description" content={subheadline || headline} />
</svelte:head>

<!-- Style 3: Lighthouse Funnel Container -->
<div class="min-h-screen bg-slate-50/50 text-slate-800 antialiased selection:bg-[#e8007c] selection:text-white pb-28 md:pb-14 font-sans">

	<!-- 1. Responsive Landing Page Navbar & Announcement Bar -->
	<LandingNavbar
		title={landingPage?.title?.split('-')[0]?.trim() || product?.name || headline || 'স্পেশাল অফার'}
		badgeText="১০০% অরিজিনাল ও এক্সক্লুসিভ কোয়ালিটি"
		announcementText={config?.offerBadge ? `${config.offerBadge} • ফ্রি ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা!` : `${headline} স্পেশাল অফার! ফ্রি ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা!`}
		contactPhone={contactPhone}
		accentColor="#e8007c"
		{navItems}
		onOrderClick={scrollToPackages}
	/>

	<!-- 2. SECTION 1: HERO SPOTLIGHT WITH EYE-CATCHING OFFER FOCUS -->
	<section id="lh-hero" class="relative pt-6 pb-12 md:pt-12 md:pb-16 overflow-hidden bg-gradient-to-b from-[#e8007c]/8 via-white to-slate-50 border-b border-slate-200/80 scroll-mt-16">
		<div class="max-w-5xl mx-auto px-4 space-y-6">

			<div class="text-center max-w-3xl mx-auto space-y-3.5">
				<!-- Animated Pill Tag -->
				<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#e8007c]/15 via-rose-500/10 to-[#e8007c]/15 text-[#e8007c] border border-[#e8007c]/30 text-xs font-black shadow-xs animate-pulse-subtle">
					<Sparkles class="w-3.5 h-3.5 text-[#e8007c] animate-spin-slow" />
					<span>{landingPage?.tag || '🔥 আজকের স্পেশাল ধামাকা অফার'}</span>
					<span class="inline-block w-1.5 h-1.5 rounded-full bg-[#e8007c] animate-ping"></span>
				</div>

				<!-- Main Headline -->
				<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-black text-slate-900 tracking-tight leading-snug md:leading-tight">
					{headline}
				</h1>

				<!-- Subheadline (supports HTML / Rich Text) -->
				{#if subheadline}
					<div class="lp-rich-text text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto">
						{@html sanitizeRichText(subheadline)}
					</div>
				{/if}

				<!-- Quick Hero Feature Pills -->
				<div class="flex flex-wrap items-center justify-center gap-2 pt-1">
					{#if config?.bulletPoints && Array.isArray(config.bulletPoints) && config.bulletPoints.length > 0}
						{#each config.bulletPoints.slice(0, 3) as point}
							<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 shadow-2xs hover:border-[#e8007c]/40 transition-colors">
								<ShieldCheck class="w-4 h-4 text-[#e8007c] shrink-0" />
								<span>{point}</span>
							</span>
						{/each}
					{:else}
						<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 shadow-2xs">
							<ShieldCheck class="w-4 h-4 text-[#e8007c] shrink-0" />
							<span>১০০% অরিজিনাল কোয়ালিটি</span>
						</span>
						<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 shadow-2xs">
							<Truck class="w-4 h-4 text-indigo-600 shrink-0" />
							<span>সরাসরি ক্যাশ অন ডেলিভারি</span>
						</span>
						<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 shadow-2xs">
							<Gift class="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
							<span>পণ্য দেখে মূল্য পরিশোধ</span>
						</span>
					{/if}
				</div>

				<!-- HERO ANIMATED OFFER SPOTLIGHT BOX -->
				<div class="pt-2 max-w-2xl mx-auto">
					<div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-[#e8007c]/10 border-2 border-rose-300/80 p-4 sm:p-5 shadow-lg space-y-3">
						<!-- Ambient Shimmer Wave -->
						<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none -translate-x-full animate-shimmer-sweep"></div>

						<div class="flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
							<!-- Left Offer Details -->
							<div class="flex items-center gap-3 text-left">
								<div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-[#e8007c] text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30">
									<Flame class="w-6 h-6 animate-bounce" />
								</div>
								<div>
									<div class="flex items-center gap-2">
										<span class="text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
											ফ্ল্যাশ সেল ডিসকাউন্ট
										</span>
										{#if maxSaveAmount > 0}
											<span class="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 animate-pulse">
												সাশ্রয় {formatTaka(maxSaveAmount)}
											</span>
										{/if}
									</div>
									<p class="text-sm sm:text-base font-black text-slate-900 mt-0.5">
										আজকের স্পেশাল অফার মূল্য: <span class="text-[#e8007c] text-lg sm:text-xl">{formatTaka(unitPrice)}</span>
										{#if originalUnitPrice > unitPrice}
											<span class="text-xs text-slate-400 line-through ml-1">{formatTaka(originalUnitPrice)}</span>
										{/if}
									</p>
								</div>
							</div>

							<!-- Live Urgent Countdown Timer -->
							<div class="shrink-0">
								<LandingCountdown initialMinutes={45} badgeText="অফারের সময় বাকি" />
							</div>
						</div>

						<!-- Quick Hero Action Button -->
						<div class="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
							<button
								type="button"
								onclick={scrollToPackages}
								class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#e8007c] via-rose-500 to-[#e8007c] hover:opacity-95 text-white font-black text-sm sm:text-base shadow-xl shadow-[#e8007c]/35 transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-98 relative overflow-hidden"
							>
								<!-- Button Shimmer Shine -->
								<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
								<ShoppingCart class="w-4 h-4 animate-bounce" />
								<span>অফারসহ প্যাকেজ দেখুন ও অর্ডার করুন</span>
								<ArrowRight class="w-4 h-4 animate-slide-right" />
							</button>
						</div>
					</div>
				</div>

			</div>

			<!-- Hero Media Showcase with Swipe -->
			<div class="max-w-2xl mx-auto pt-2">
				<Card class="rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xl overflow-hidden relative">
					<!-- Main Showcase Image with Touch Events -->
					<div
						class="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center select-none"
						ontouchstart={handleTouchStart}
						ontouchend={handleTouchEnd}
					>
						<img
							src={activeImage}
							alt={headline}
							class="w-full h-full object-cover transition-all duration-300 hover:scale-102"
						/>

						{#if images.length > 1}
							<button
								type="button"
								aria-label="Previous image"
								onclick={prevImage}
								class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 text-slate-800 shadow-md flex items-center justify-center hover:bg-white active:scale-90 transition-all cursor-pointer z-10"
							>
								<ChevronLeft class="w-5 h-5 -ml-0.5" />
							</button>

							<button
								type="button"
								aria-label="Next image"
								onclick={nextImage}
								class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 text-slate-800 shadow-md flex items-center justify-center hover:bg-white active:scale-90 transition-all cursor-pointer z-10"
							>
								<ChevronRight class="w-5 h-5 -mr-0.5" />
							</button>
						{/if}

						<!-- Floating Social Proof Badge -->
						<div class="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md flex items-center gap-1.5 text-xs font-black text-slate-800 z-10 animate-bounce-subtle">
							<Star class="w-4 h-4 fill-amber-400 text-amber-400" />
							<span>৪.৯/৫ রেটিং (৩,২০০+ সন্তুষ্ট পরিবার)</span>
						</div>

						<!-- Floating Discount Badge On Image -->
						{#if totalSavings > 0}
							<div class="absolute top-3 left-3 bg-rose-600 text-white px-2.5 py-1 rounded-xl text-xs font-black shadow-lg flex items-center gap-1 z-10 animate-pulse">
								<Percent class="w-3.5 h-3.5" />
								<span>{formatTaka(totalSavings)} ছাড়</span>
							</div>
						{/if}
					</div>

					<!-- Thumbnail Strip -->
					{#if images.length > 1}
						<div class="flex items-center gap-2.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
							{#each images as img, idx}
								<button
									type="button"
									onclick={() => (activeImageIndex = idx)}
									class="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer {idx === activeImageIndex ? 'border-[#e8007c] ring-2 ring-[#e8007c]/30 shadow-md scale-102' : 'border-slate-200 opacity-60 hover:opacity-100'}"
								>
									<img src={img} alt="Thumb {idx + 1}" class="w-full h-full object-cover" />
								</button>
							{/each}
						</div>
					{/if}
				</Card>
			</div>

		</div>
	</section>

	<!-- 3. SECTION 2: STEP 1 - DYNAMIC PACKAGES WITH DISTINCTIVE FOCUS & ANIMATIONS -->
	{#if packages.length > 0}
		<section id="lighthouse-packages-step" class="py-12 md:py-16 bg-white border-b border-slate-200/80 scroll-mt-20">
			<div class="max-w-5xl mx-auto px-4 space-y-8">

				<!-- Section Header with Focus -->
				<div class="text-center space-y-2.5 max-w-2xl mx-auto">
					<Badge variant="outline" class="bg-[#e8007c]/10 text-[#e8007c] border-[#e8007c]/30 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
						<Tag class="w-3.5 h-3.5 text-[#e8007c]" />
						<span>স্টেপ ১: আপনার পছন্দের প্যাকেজ বেছে নিন</span>
					</Badge>
					<h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
						ধামাকা স্পেশাল প্যাকেজসমূহ
					</h2>
					<p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
						প্রতিটি প্যাকেজের সাথে রয়েছে নিশ্চিত উপহার ও বিশেষ ছাড়। পছন্দের প্যাকেজে ক্লিক করলেই তা স্বয়ংক্রিয়ভাবে অ্যাক্টিভ হবে।
					</p>
				</div>

				<!-- Packages Grid (Responsive: 1, 2, or 3 cards with distinct visual styling) -->
				<div
					class="grid gap-5 sm:gap-6 {packages.length === 1
						? 'max-w-md mx-auto grid-cols-1'
						: packages.length === 2
							? 'max-w-3xl mx-auto grid-cols-1 md:grid-cols-2'
							: 'max-w-5xl mx-auto grid-cols-1 md:grid-cols-3'}"
				>
					{#each packages as pkg, idx}
						{@const theme = getPackageTheme(idx, pkg.popular)}
						{@const isSelected = selectedPackageIndex === idx}

						<div
							role="button"
							tabindex="0"
							onclick={() => selectPackage(idx)}
							onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectPackage(idx)}
							class="text-left rounded-3xl p-5 sm:p-6 border-2 transition-all duration-300 relative cursor-pointer flex flex-col justify-between overflow-hidden group select-none {isSelected
								? `${theme.borderSelected} ${theme.cardBg} animate-card-pop`
								: `${theme.borderUnselected} bg-white shadow-xs`}"
						>
							<!-- Top Ambient Gradient Header -->
							<div class="absolute inset-x-0 top-0 h-28 pointer-events-none {theme.bgHeader}"></div>

							<!-- Distinct Top Badge for Each Package -->
							{#if pkg.tag || theme.badgeText}
								<div class="absolute -top-0.5 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center">
									<span class="px-3.5 py-1 rounded-b-2xl text-[11px] font-black uppercase shadow-md whitespace-nowrap {theme.badgeBg} {theme.badgeGlow} flex items-center gap-1.5 animate-bounce-subtle">
										{#if idx === 1}
											<Flame class="w-3.5 h-3.5 animate-bounce" />
										{:else if idx === 2}
											<Sparkles class="w-3.5 h-3.5" />
										{:else}
											<Zap class="w-3.5 h-3.5" />
										{/if}
										<span>{pkg.tag || theme.badgeText}</span>
									</span>
								</div>
							{/if}

							<!-- Corner Best Value Ribbon / Chip -->
							<div class="absolute top-3 right-3 z-10">
								{#if isSelected}
									<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black shadow-xs animate-in zoom-in-95">
										<CheckCircle2 class="w-3 h-3 text-emerald-600" />
										<span>সক্রিয় প্যাকেজ</span>
									</span>
								{:else if theme.cornerRibbon}
									<span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
										{theme.cornerRibbon}
									</span>
								{/if}
							</div>

							<!-- Card Content -->
							<div class="space-y-4 pt-3 relative z-10">
								<!-- Package Title & Radio Check Circle -->
								<div class="flex items-start justify-between gap-3 pr-8">
									<div>
										<h3 class="text-lg sm:text-xl font-black text-slate-900 leading-tight">
											{pkg.title}
										</h3>
										<p class="text-xs text-slate-500 font-medium leading-relaxed mt-1">
											{pkg.subtitle}
										</p>
									</div>

									<!-- Radio Check Circle with Pulsing Ring on Selection -->
									<div class="relative flex items-center justify-center shrink-0">
										{#if isSelected}
											<span class="absolute inline-flex h-7 w-7 rounded-full bg-[#e8007c] opacity-30 animate-ping"></span>
										{/if}
										<div class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 {isSelected ? theme.radioSelected : 'border-slate-300 bg-white group-hover:border-slate-400'}">
											{#if isSelected}
												<Check class="w-3.5 h-3.5 stroke-[3]" />
											{/if}
										</div>
									</div>
								</div>

								<!-- FREE GIFT HIGHLIGHT WITH ANIMATED BOUNCE -->
								{#if pkg.freeGift}
									<div class="p-2.5 rounded-2xl border transition-colors {isSelected ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 shadow-xs' : 'bg-slate-50 border-slate-200/80 text-slate-700'}">
										<div class="flex items-center gap-2">
											<div class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
												<Gift class="w-4 h-4 text-emerald-600 {isSelected ? 'animate-bounce' : ''}" />
											</div>
											<div class="text-xs font-black leading-tight">
												<span class="text-emerald-700 block text-[10px] uppercase tracking-wider">উপহার অফার:</span>
												<span>{pkg.freeGift}</span>
											</div>
										</div>
									</div>
								{/if}

								<!-- Price Section with Savings Highlight -->
								<div class="pt-3 border-t border-slate-100 flex items-baseline justify-between gap-2">
									<div>
										{#if pkg.originalPrice > pkg.price}
											<span class="text-xs text-slate-400 block line-through font-semibold">
												রেগুলার মূল্য {formatTaka(pkg.originalPrice)}
											</span>
										{/if}
										<div class="flex items-baseline gap-1 mt-0.5">
											<span class="text-2xl sm:text-3xl font-black text-slate-900 leading-none" style="color: {theme.accentColor}">
												{formatTaka(pkg.price)}
											</span>
										</div>
									</div>

									{#if pkg.saveAmount > 0}
										<div class="flex flex-col items-end">
											<span class="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-black shadow-2xs animate-pulse">
												সাশ্রয় {formatTaka(pkg.saveAmount)}
											</span>
											{#if pkg.freeDelivery}
												<span class="text-[10px] font-bold text-emerald-700 mt-1">
													+ ফ্রি ডেলিভারি
												</span>
											{/if}
										</div>
									{/if}
								</div>
							</div>

							<!-- Action CTA Button on Card -->
							<div class="pt-4 mt-3 relative z-10">
								<button
									type="button"
									class="w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 {isSelected
										? `${theme.btnSelected} animate-shimmer-btn`
										: 'bg-slate-100 text-slate-700 hover:bg-slate-200 group-hover:bg-slate-200'}"
								>
									{#if isSelected}
										<CheckCircle2 class="w-4 h-4" />
										<span>✓ এই প্যাকেজটি সিলেক্ট করা আছে</span>
									{:else}
										<span>এই প্যাকেজটি নির্বাচন করুন</span>
										<ArrowRight class="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
									{/if}
								</button>
							</div>
						</div>
					{/each}
				</div>

			</div>
		</section>
	{/if}

	<!-- 4. SECTION 3: STEP 2 - 2-COLUMN SPLIT DIRECT CHECKOUT FORM -->
	<section id="lighthouse-checkout-step" class="py-12 md:py-16 bg-slate-50 border-b border-slate-200/80 scroll-mt-20">
		<div class="max-w-5xl mx-auto px-4 space-y-6">

			<!-- Step Header -->
			<div class="text-center space-y-2.5 max-w-xl mx-auto">
				<Badge variant="outline" class="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
					<Lock class="w-3.5 h-3.5 text-indigo-600" />
					<span>স্টেপ ২: ক্যাশ অন ডেলিভারি তথ্য</span>
				</Badge>
				<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
					অর্ডার কনফার্ম করতে তথ্য দিন
				</h2>
				<p class="text-xs sm:text-sm text-emerald-800 font-bold bg-emerald-50 py-1.5 px-4 rounded-full border border-emerald-200 inline-block shadow-2xs">
					✨ কোনো অগ্রিম টাকা লাগবে না — ডেলিভারিম্যান থেকে পণ্য দেখে পছন্দ হলে টাকা দিন।
				</p>
			</div>

			<!-- 2-Column Split Layout -->
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">

				<!-- Left Column: Order Form Inputs (7 Cols) -->
				<div class="lg:col-span-7">
					<Card class="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-lg space-y-5">
						<form onsubmit={handleOrderSubmit} class="space-y-4">

							<!-- Customer Name -->
							<div>
								<label for="lh-customer-name" class="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
									<User class="w-4 h-4 text-[#e8007c]" />
									<span>আপনার পুরো নাম <span class="text-rose-500">*</span></span>
								</label>
								<Input
									id="lh-customer-name"
									type="text"
									required
									onfocus={triggerInitiateCheckout}
									placeholder="যেমন: মোঃ আরিফুল ইসলাম"
									bind:value={customerName}
									class="h-11 sm:h-12 rounded-xl bg-slate-50/80 border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-[#e8007c] focus:ring-2 focus:ring-[#e8007c]/20 transition-all"
								/>
							</div>

							<!-- Customer Phone -->
							<div>
								<label for="lh-customer-phone" class="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
									<Phone class="w-4 h-4 text-[#e8007c]" />
									<span>সচল মোবাইল নম্বর (১১ ডিজিট) <span class="text-rose-500">*</span></span>
								</label>
								<Input
									id="lh-customer-phone"
									type="tel"
									required
									onfocus={triggerInitiateCheckout}
									placeholder="017xxxxxxxx"
									bind:value={customerPhone}
									class="h-11 sm:h-12 rounded-xl bg-slate-50/80 border-slate-200 text-xs sm:text-sm font-mono focus:bg-white focus:border-[#e8007c] focus:ring-2 focus:ring-[#e8007c]/20 transition-all"
								/>
							</div>

							<!-- Delivery Area Radio Selector -->
							<div class="space-y-1.5">
								<span class="block text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
									<Truck class="w-4 h-4 text-[#e8007c]" />
									<span>ডেলিভারি এরিয়া বেছে নিন <span class="text-rose-500">*</span></span>
								</span>
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
									<label
										class="flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer {deliveryArea === 'inside_dhaka'
											? 'border-[#e8007c] bg-[#e8007c]/5 ring-2 ring-[#e8007c]/20 shadow-xs'
											: 'border-slate-200 bg-slate-50 hover:border-slate-300'}"
									>
										<div class="flex items-center gap-2.5">
											<input
												type="radio"
												name="deliveryArea"
												value="inside_dhaka"
												checked={deliveryArea === 'inside_dhaka'}
												onchange={() => (deliveryArea = 'inside_dhaka')}
												class="w-4 h-4 text-[#e8007c] focus:ring-[#e8007c]"
											/>
											<span class="text-xs sm:text-sm font-bold text-slate-800">ঢাকার ভেতরে</span>
										</div>
										<span class="text-xs font-black text-slate-700">চার্জ: ৳{insideDhakaFee}</span>
									</label>

									<label
										class="flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer {deliveryArea === 'outside_dhaka'
											? 'border-[#e8007c] bg-[#e8007c]/5 ring-2 ring-[#e8007c]/20 shadow-xs'
											: 'border-slate-200 bg-slate-50 hover:border-slate-300'}"
									>
										<div class="flex items-center gap-2.5">
											<input
												type="radio"
												name="deliveryArea"
												value="outside_dhaka"
												checked={deliveryArea === 'outside_dhaka'}
												onchange={() => (deliveryArea = 'outside_dhaka')}
												class="w-4 h-4 text-[#e8007c] focus:ring-[#e8007c]"
											/>
											<span class="text-xs sm:text-sm font-bold text-slate-800">ঢাকার বাইরে</span>
										</div>
										<span class="text-xs font-black text-slate-700">চার্জ: ৳{outsideDhakaFee}</span>
									</label>
								</div>
							</div>

							<!-- Full Delivery Address -->
							<div>
								<label for="lh-customer-address" class="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
									<MapPin class="w-4 h-4 text-[#e8007c]" />
									<span>সম্পূর্ণ ডেলিভারি ঠিকানা <span class="text-rose-500">*</span></span>
								</label>
								<Textarea
									id="lh-customer-address"
									rows={2}
									required
									placeholder="বাসা নং, রোড নং, এলাকা, থানা ও জেলা পরিষ্কারভাবে লিখুন..."
									bind:value={shippingAddress}
									class="rounded-xl bg-slate-50/80 border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-[#e8007c] focus:ring-2 focus:ring-[#e8007c]/20 transition-all"
								/>
							</div>

							<!-- Optional Order Note -->
							<div>
								<label for="lh-order-note" class="block text-xs font-semibold text-slate-500 mb-1">
									বিশেষ নির্দেশিকা বা ডেলিভারি নোট (ঐচ্ছিক)
								</label>
								<Input
									id="lh-order-note"
									type="text"
									placeholder="যেমন: শুক্রবার ডেলিভারি দিলে ভালো হয়"
									bind:value={orderNote}
									class="h-10 rounded-xl bg-slate-50/60 border-slate-200 text-xs"
								/>
							</div>

							<!-- Submit Button on Desktop/Mobile Inside Form -->
							<div class="pt-2">
								<button
									type="submit"
									disabled={isSubmitting}
									class="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e8007c] via-rose-500 to-[#e8007c] hover:opacity-95 text-white font-black text-base shadow-xl shadow-[#e8007c]/35 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 relative overflow-hidden"
								>
									{#if isSubmitting}
										<Loader2 class="w-5 h-5 animate-spin" />
										<span>অর্ডার প্রসেসিং হচ্ছে...</span>
									{:else}
										<Lock class="w-4 h-4" />
										<span>অর্ডার কনফার্ম করুন — {formatTaka(grandTotal)}</span>
										<ArrowRight class="w-4 h-4 animate-slide-right" />
									{/if}
								</button>
							</div>

						</form>
					</Card>
				</div>

				<!-- Right Column: Live Sticky Order Summary (5 Cols) -->
				<div class="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
					<Card class="rounded-3xl border-2 border-[#e8007c]/40 bg-white p-5 shadow-lg space-y-4">
						<div class="flex items-center justify-between pb-3 border-b border-slate-100">
							<h3 class="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
								<ShoppingCart class="w-4 h-4 text-[#e8007c]" />
								<span>অর্ডার সামারি</span>
							</h3>
							<span class="text-[10px] font-black uppercase text-[#e8007c] bg-[#e8007c]/10 px-2.5 py-1 rounded-full border border-[#e8007c]/20">
								ক্যাশ অন ডেলিভারি
							</span>
						</div>

						<!-- Selected Item / Package Info -->
						<div class="bg-gradient-to-br from-slate-50 to-slate-100/60 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
							<div class="flex items-start justify-between gap-2">
								<div>
									<h4 class="text-xs sm:text-sm font-black text-slate-900 leading-tight">
										{currentPackage ? currentPackage.title : (product?.name || headline)}
									</h4>
									{#if currentPackage?.freeGift}
										<p class="text-[11px] font-black text-emerald-800 mt-1 flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 inline-flex">
											<Gift class="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-bounce" />
											<span>{currentPackage?.freeGift}</span>
										</p>
									{/if}
								</div>
								<span class="text-sm sm:text-base font-black text-slate-900">
									{formatTaka(unitPrice)}
								</span>
							</div>

							<!-- Quantity Changer -->
							<div class="flex items-center justify-between pt-2.5 border-t border-slate-200/70">
								<span class="text-xs font-bold text-slate-600">প্যাকেজ সংখ্যা (Qty):</span>
								<div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
									<button
										type="button"
										onclick={() => quantity > 1 && quantity--}
										class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90 transition-all"
										aria-label="Decrease quantity"
									>
										<Minus class="w-3 h-3" />
									</button>
									<span class="w-6 text-center font-black text-xs text-slate-800">{quantity}</span>
									<button
										type="button"
										onclick={() => quantity++}
										class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90 transition-all"
										aria-label="Increase quantity"
									>
										<Plus class="w-3 h-3" />
									</button>
								</div>
							</div>
						</div>

						<!-- Calculation Breakdown -->
						<div class="space-y-2 text-xs font-semibold text-slate-600">
							<div class="flex justify-between">
								<span>সাবটোটাল</span>
								<span class="font-bold text-slate-800">{formatTaka(subtotal)}</span>
							</div>

							<div class="flex justify-between items-center">
								<span>ডেলিভারি চার্জ ({deliveryArea === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'})</span>
								{#if deliveryCharge === 0}
									<span class="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
										ফ্রি ডেলিভারি
									</span>
								{:else}
									<span class="font-bold text-slate-800">{formatTaka(deliveryCharge)}</span>
								{/if}
							</div>

							{#if totalSavings > 0}
								<div class="flex justify-between text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200/80 animate-pulse">
									<span class="flex items-center gap-1">
										<Sparkles class="w-3.5 h-3.5 text-rose-500" />
										<span>আপনার সাশ্রয়</span>
									</span>
									<span>- {formatTaka(totalSavings)}</span>
								</div>
							{/if}

							<Separator class="bg-slate-100" />

							<div class="flex justify-between items-baseline pt-1">
								<span class="text-sm font-black text-slate-900">সর্বমোট প্রদেয় টাকা:</span>
								<span class="text-xl sm:text-2xl font-black text-[#e8007c]">{formatTaka(grandTotal)}</span>
							</div>
						</div>

						<!-- Trust Seals -->
						<div class="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] font-bold text-slate-600">
							<div class="flex items-center gap-1.5 text-emerald-700">
								<CheckCircle class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
								<span>পণ্য হাতে পেয়ে দেখে টাকা পরিশোধের নিশ্চয়তা</span>
							</div>
							<div class="flex items-center gap-1.5 text-indigo-700">
								<ShieldCheck class="w-3.5 h-3.5 text-indigo-600 shrink-0" />
								<span>১০০% অথেনটিক কোয়ালিটি গ্যারান্টি</span>
							</div>
						</div>
					</Card>
				</div>

			</div>

		</div>
	</section>

	<!-- 5. SECTION 4: VISUAL BENEFIT HIGHLIGHTS -->
	<section id="lighthouse-benefits-step" class="py-12 md:py-16 bg-white border-b border-slate-200/80 scroll-mt-16">
		<div class="max-w-5xl mx-auto px-4 space-y-8">
			<div class="text-center space-y-2 max-w-xl mx-auto">
				<Badge variant="outline" class="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
					আসল কার্যকারিতা
				</Badge>
				<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
					{headline} এর স্পষ্ট উপকারিতা
				</h2>
				<div class="lp-rich-text text-xs sm:text-sm text-slate-500 font-medium">
					{@html sanitizeRichText(subheadline || 'প্রিমিয়াম কোয়ালিটি উপাদান ও নির্ভরযোগ্য মান যা ব্যবহারের সাথে সাথেই স্পষ্ট পরিবর্তন অনুভব করাবে।')}
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
				<!-- Benefit Card 1 -->
				<Card class="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50/40 via-white to-white p-6 shadow-xs space-y-3 hover:shadow-md transition-shadow">
					<div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl shadow-2xs">
						🚿
					</div>
					<h3 class="text-base sm:text-lg font-black text-slate-900">
						উচ্চ পানি প্রবাহ বজায় রেখে নিখুঁত ফিল্ট্রেশন
					</h3>
					<p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
						সাধারণ ফিল্টারের মতো পানির স্পিড কমে না। স্বাভাবিক প্রেশার বজায় রেখে মাইক্রন লেভেলে সব শেওলা, বালুকণা ও ধূলিকণা সম্পূর্ণ আটকে দেয়।
					</p>
				</Card>

				<!-- Benefit Card 2 -->
				<Card class="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#e8007c]/5 via-white to-white p-6 shadow-xs space-y-3 hover:shadow-md transition-shadow">
					<div class="w-12 h-12 rounded-2xl bg-[#e8007c]/10 text-[#e8007c] flex items-center justify-center font-black text-xl shadow-2xs">
						🛡️
					</div>
					<h3 class="text-base sm:text-lg font-black text-slate-900">
						ঘন লেয়ার PP কটন ফাইবার প্রযুক্তি
					</h3>
					<p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
						পানির জং ও রাসায়নিক তলানি সম্পূর্ণভাবে ফিল্টারের কটন ফ্যাব্রিকে আটকে যায়, ফলে ফিল্টারের ভেতর ক্ষতিকারক তলানি খালি চোখেই দেখা যায়।
					</p>
				</Card>
			</div>
		</div>
	</section>

	<!-- 6. SECTION 5: 4-FEATURE GRID -->
	<section class="py-12 md:py-16 bg-slate-50 border-b border-slate-200/80">
		<div class="max-w-5xl mx-auto px-4 space-y-8">
			<div class="text-center space-y-2 max-w-xl mx-auto">
				<Badge variant="outline" class="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
					কেন এটি অনন্য?
				</Badge>
				<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
					দৈনন্দিন জীবনের প্রতিটি মুহূর্তে আপনার ও পরিবারের সুরক্ষা
				</h2>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5 hover:-translate-y-1 transition-transform">
					<div class="w-10 h-10 rounded-xl bg-purple-50 text-[#5845eb] flex items-center justify-center font-black text-lg">
						🧬
					</div>
					<h4 class="text-sm font-black text-slate-900">৫-স্তর মাইক্রো ফিল্ট্রেশন</h4>
					<p class="text-xs text-slate-500 leading-relaxed">
						উন্নত পলিপ্রোপিলিন (PP) কটন দিয়ে তৈরি, যা পানির সূক্ষ্ম থেকে সূক্ষ্ম ময়লা ও আয়রন নিমেষেই আটকে দেয়।
					</p>
				</div>

				<div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5 hover:-translate-y-1 transition-transform">
					<div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
						⚡
					</div>
					<h4 class="text-sm font-black text-slate-900">১ মিনিটে সহজ ইনস্টলেশন</h4>
					<p class="text-xs text-slate-500 leading-relaxed">
						কোনো প্লাগ বা পাইপ ফিটিংস লাগবে না। ফ্রি দেওয়া বেল্ট দিয়ে ঘরে বসেই যে কেউ ১ মিনিটে ট্যাপে সেট করতে পারবেন।
					</p>
				</div>

				<div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5 hover:-translate-y-1 transition-transform">
					<div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-lg">
						💆
					</div>
					<h4 class="text-sm font-black text-slate-900">ত্বক ও চুলের সুরক্ষা</h4>
					<p class="text-xs text-slate-500 leading-relaxed">
						আয়রনমুক্ত পানিতে মুখ ধুলে ত্বক পরিষ্কার থাকে এবং গোসলে চুল পড়ার সমস্যা উল্লেখযোগ্য হারে হ্রাস পায়।
					</p>
				</div>

				<div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5 hover:-translate-y-1 transition-transform">
					<div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg">
						💎
					</div>
					<h4 class="text-sm font-black text-slate-900">সাশ্রয়ী ও দীর্ঘস্থায়ী</h4>
					<p class="text-xs text-slate-500 leading-relaxed">
						প্রতিটি প্যাকেজে দেওয়া অতিরিক্ত ফ্রি বেল্ট ও পর্যাপ্ত ফিল্টার দিয়ে মাসের পর মাস নিশ্চিন্তে চলতে পারবেন।
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- 7. SECTION 6: CUSTOMER REVIEWS -->
	<section id="lighthouse-reviews-step" class="py-12 md:py-16 bg-white border-b border-slate-200/80 scroll-mt-16">
		<div class="max-w-5xl mx-auto px-4 space-y-8">
			<div class="text-center space-y-2 max-w-xl mx-auto">
				<Badge variant="outline" class="bg-amber-50 text-amber-700 border-amber-200 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
					সন্তুষ্ট গ্রাহকদের মতামত
				</Badge>
				<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
					{headline} কাস্টমার রিভিউ
				</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				{#each reviews as review}
					<Card class="rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 bg-slate-50/50 hover:shadow-md transition-shadow">
						<div class="flex items-center gap-1 text-amber-400">
							{#each Array(review.rating || 5) as _}
								<Star class="w-4 h-4 fill-amber-400" />
							{/each}
						</div>
						<p class="text-xs text-slate-700 leading-relaxed italic">
							"{review.text}"
						</p>
						<div class="pt-2 border-t border-slate-200/60 flex items-center justify-between">
							<div>
								<div class="text-xs font-black text-slate-900">{review.name}</div>
								{#if review.location}
									<div class="text-[10px] text-slate-400">{review.location}</div>
								{/if}
							</div>
							{#if review.badge}
								<span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
									{review.badge}
								</span>
							{/if}
						</div>
					</Card>
				{/each}
			</div>
		</div>
	</section>

	<!-- 8. SECTION 7: INTERACTIVE ACCORDION FAQ -->
	<section id="lighthouse-faqs-step" class="py-12 md:py-16 bg-slate-50 scroll-mt-16">
		<div class="max-w-3xl mx-auto px-4 space-y-6">
			<div class="text-center space-y-2">
				<Badge variant="outline" class="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
					সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
				</Badge>
				<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
					পণ্য ও ডেলিভারি সম্পর্কে সাধারণ প্রশ্নের উত্তর
				</h2>
			</div>

			<div class="space-y-3 pt-2">
				{#each defaultFaqs as faq, idx}
					<div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
						<button
							type="button"
							onclick={() => toggleFaq(idx)}
							class="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-slate-900 hover:text-[#e8007c] transition-colors cursor-pointer"
						>
							<span class="flex items-center gap-2">
								<HelpCircle class="w-4 h-4 text-[#e8007c] shrink-0" />
								<span>{faq.q}</span>
							</span>
							<ChevronDown class="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 {openFaqIndices.includes(idx) ? 'rotate-180 text-[#e8007c]' : ''}" />
						</button>

						{#if openFaqIndices.includes(idx)}
							<div class="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100 bg-slate-50/40 animate-in fade-in duration-150">
								{faq.a}
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Direct Contact Hotline Box -->
			{#if contactPhone}
			<div class="text-center pt-4">
				<p class="text-xs text-slate-500 font-medium">
					আরো কোনো তথ্য বা সহায়তার জন্য সরাসরি কল করুন আমাদের হটলাইনে:
				</p>
				<a
					href="tel:{contactPhone}"
					class="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-black text-[#e8007c] shadow-2xs hover:bg-slate-50 transition-colors"
				>
					<PhoneCall class="w-4 h-4 text-[#e8007c]" />
					<span>{contactPhone}</span>
				</a>
			</div>
			{/if}
		</div>
	</section>

	<!-- 9. Floating Sticky Order Bar for Mobile Devices -->
	<div class="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-between gap-3 shadow-2xl md:hidden">
		<div class="flex flex-col min-w-0">
			<span class="text-[11px] text-slate-500 font-bold leading-tight truncate">
				{currentPackage ? currentPackage.title : 'স্পেশাল অফার'}
			</span>
			<div class="flex items-baseline gap-1.5 leading-tight">
				<span class="text-base font-black text-[#e8007c]">
					{formatTaka(grandTotal)}
				</span>
				{#if totalSavings > 0}
					<span class="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded">
						সেভ {formatTaka(totalSavings)}
					</span>
				{/if}
			</div>
		</div>

		<Button
			class="bg-gradient-to-r from-[#e8007c] to-rose-600 hover:from-[#c70068] hover:to-rose-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#e8007c]/30 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
			onclick={scrollToCheckout}
		>
			<ShoppingCart class="w-3.5 h-3.5" />
			<span>অর্ডার করুন</span>
		</Button>
	</div>

</div>

<style>
	/* Animation Keyframes */
	@keyframes shimmerSweep {
		0% {
			transform: translateX(-100%);
		}
		50%, 100% {
			transform: translateX(200%);
		}
	}

	@keyframes pulseSubtle {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.94;
			transform: scale(1.015);
		}
	}

	@keyframes bounceSubtle {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-3px);
		}
	}

	@keyframes cardPop {
		0% {
			transform: scale(0.98) translateY(0);
		}
		60% {
			transform: scale(1.03) translateY(-10px);
		}
		100% {
			transform: scale(1.02) translateY(-8px);
		}
	}

	@keyframes slideRight {
		0%, 100% {
			transform: translateX(0);
		}
		50% {
			transform: translateX(4px);
		}
	}

	@keyframes spinSlow {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-shimmer-sweep {
		animation: shimmerSweep 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}

	.animate-pulse-subtle {
		animation: pulseSubtle 3s ease-in-out infinite;
	}

	.animate-bounce-subtle {
		animation: bounceSubtle 2.5s ease-in-out infinite;
	}

	.animate-card-pop {
		animation: cardPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.animate-slide-right {
		animation: slideRight 1.5s ease-in-out infinite;
	}

	.animate-spin-slow {
		animation: spinSlow 8s linear infinite;
	}

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
		color: #e8007c;
		text-decoration: underline;
	}
	:global(.lp-rich-text a:hover) {
		color: #c70068;
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
