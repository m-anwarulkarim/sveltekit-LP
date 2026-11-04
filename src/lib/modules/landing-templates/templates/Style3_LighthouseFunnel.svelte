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
		HelpCircle,
		Plus,
		Minus,
		Gift,
		ChevronDown,
		Lock,
		CheckCircle
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import LandingNavbar from '../components/LandingNavbar.svelte';

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
					freeGift: p.freeGift || (i === 0 ? '+ 10 পিস বেল্ট ফ্রি!' : i === 1 ? '+ 20 পিস বেল্ট ফ্রি!' : '+ 40 পিস বেল্ট ফ্রি!'),
					subtitle: p.subtitle || (i === 0 ? 'ছোট পরিবারের জন্য আদর্শ ও সাশ্রয়ী' : i === 1 ? 'সবচেয়ে বেশি বিক্রিত ও সর্বোচ্চ সাশ্রয়ী' : 'পুরো পরিবারের নিশ্চিন্ত সমাধান'),
					price,
					originalPrice,
					saveAmount,
					deliveryFee: p.freeDelivery ? 0 : (Number(p.deliveryFee) || 0),
					freeDelivery: Boolean(p.freeDelivery || i > 0),
					tag: p.tag || (i === 1 ? '🔥 সবচেয়ে জনপ্রিয়' : i === 2 ? '🚀 মেগা সেভার কম্বো' : ''),
					popular: i === 1 || p.popular
				};
			});
		}
		// When no packages are provided (0 packages):
		return [];
	});

	// Selected package index (defaults to 0, or index 1 if 3 packages exist and pack 2 is popular)
	let selectedPackageIndex = $state(0);
	$effect(() => {
		if (packages.length >= 2) {
			selectedPackageIndex = 1; // Default to most popular pack 2
		} else {
			selectedPackageIndex = 0;
		}
	});

	let currentPackage = $derived(
		packages.length > 0 ? (packages[selectedPackageIndex] || packages[0]) : null
	);

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

	function formatTaka(amount: number) {
		return `৳${amount.toLocaleString('en-BD')}`;
	}

	function scrollToCheckout() {
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
	<title>{headline} | The Color Lighthouse Special Offer</title>
	<meta name="description" content={subheadline || headline} />
</svelte:head>

<!-- Style 3: Lighthouse Funnel Container -->
<div class="min-h-screen bg-white text-slate-800 antialiased selection:bg-[#e8007c] selection:text-white pb-24 md:pb-12 font-sans">

	<!-- 1 & 2. Responsive Landing Page Navbar & Announcement Bar -->
	<LandingNavbar
		title={landingPage?.title?.split('-')[0]?.trim() || product?.name || headline || 'স্পেশাল অফার'}
		badgeText="১০০% অরিজিনাল ও এক্সক্লুসিভ কোয়ালিটি"
		announcementText={config?.offerBadge ? `${config.offerBadge} • ফ্রি ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা!` : `${headline} স্পেশাল অফার! ফ্রি ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা!`}
		contactPhone={contactPhone}
		accentColor="#e8007c"
		{navItems}
		onOrderClick={scrollToPackages}
	/>

	<!-- 3. SECTION 1: HERO SPOTLIGHT -->
	<section id="lh-hero" class="relative pt-8 pb-12 md:pt-14 md:pb-16 overflow-hidden bg-gradient-to-b from-[#e8007c]/5 via-white to-slate-50 border-b border-slate-200/80 scroll-mt-16">
		<div class="max-w-5xl mx-auto px-4 space-y-6">

			<div class="text-center max-w-3xl mx-auto space-y-3">
				<!-- Pill Tag -->
				<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8007c]/10 text-[#e8007c] border border-[#e8007c]/20 text-xs font-black shadow-2xs">
					<Sparkles class="w-3.5 h-3.5 text-[#e8007c]" />
					<span>{landingPage?.tag || 'স্পেশাল ধামাকা অফার'}</span>
				</div>

				<!-- Main Headline -->
				<h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-snug">
					{headline}
				</h1>

				<!-- Subheadline -->
				<p class="text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto">
					{subheadline}
				</p>

				<!-- 3 Quick Hero Feature Pills -->
				<div class="flex flex-wrap items-center justify-center gap-2 pt-2">
					{#if config?.bulletPoints && Array.isArray(config.bulletPoints) && config.bulletPoints.length > 0}
						{#each config.bulletPoints.slice(0, 3) as point}
							<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
								<ShieldCheck class="w-4 h-4 text-[#e8007c]" />
								<span>{point}</span>
							</span>
						{/each}
					{:else}
						<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
							<ShieldCheck class="w-4 h-4 text-[#e8007c]" />
							<span>১০০% অরিজিনাল কোয়ালিটি</span>
						</span>
						<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
							<Truck class="w-4 h-4 text-indigo-600" />
							<span>সরাসরি ক্যাশ অন ডেলিভারি</span>
						</span>
						<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
							<Gift class="w-4 h-4 text-emerald-600" />
							<span>পণ্য দেখে মূল্য পরিশোধ</span>
						</span>
					{/if}
				</div>

				<!-- Hero CTA Button -->
				<div class="pt-3">
					<button
						type="button"
						onclick={scrollToPackages}
						class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#e8007c] hover:bg-[#c70068] text-white font-black text-sm sm:text-base shadow-lg shadow-[#e8007c]/30 hover:shadow-xl hover:shadow-[#e8007c]/40 transition-all cursor-pointer transform hover:-translate-y-0.5"
					>
						<span>অর্ডার করুন এখনই</span>
						<span class="px-2 py-0.5 rounded-lg bg-white/20 text-white text-xs font-bold">
							{formatTaka(unitPrice)} স্পেশাল অফার
						</span>
						<ArrowRight class="w-4 h-4" />
					</button>
				</div>
			</div>

			<!-- Hero Media Showcase -->
			<div class="max-w-2xl mx-auto pt-4">
				<Card class="rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xl overflow-hidden relative">
					<!-- Main Showcase Image -->
					<div class="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
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
								class="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-slate-800 shadow-md flex items-center justify-center hover:bg-white transition-all cursor-pointer"
							>
								<ChevronLeft class="w-5 h-5" />
							</button>

							<button
								type="button"
								aria-label="Next image"
								onclick={nextImage}
								class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-slate-800 shadow-md flex items-center justify-center hover:bg-white transition-all cursor-pointer"
							>
								<ChevronRight class="w-5 h-5" />
							</button>
						{/if}

						<!-- Floating Social Proof Badge -->
						<div class="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md flex items-center gap-1.5 text-xs font-black text-slate-800">
							<Star class="w-4 h-4 fill-amber-400 text-amber-400" />
							<span>৪.৯/৫ রেটিং (৩,২০০+ সন্তুষ্ট গ্রাহক)</span>
						</div>
					</div>

					<!-- Thumbnail Strip -->
					{#if images.length > 1}
						<div class="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
							{#each images as img, idx}
								<button
									type="button"
									onclick={() => (activeImageIndex = idx)}
									class="w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer {idx === activeImageIndex ? 'border-[#e8007c] ring-2 ring-[#e8007c]/30' : 'border-slate-200 opacity-60 hover:opacity-100'}"
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

	<!-- 4. SECTION 2: STEP 1 - DYNAMIC PACKAGES (Conditional 0, 1, 2, or 3) -->
	{#if packages.length > 0}
		<section id="lighthouse-packages-step" class="py-12 md:py-16 bg-white border-b border-slate-200/80 scroll-mt-20">
			<div class="max-w-5xl mx-auto px-4 space-y-8">

				<!-- Section Header -->
				<div class="text-center space-y-2">
					<Badge variant="outline" class="bg-[#e8007c]/10 text-[#e8007c] border-[#e8007c]/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
						স্টেপ ১: আপনার প্যাকেজ নির্বাচন করুন
					</Badge>
					<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
						The Color Lighthouse স্পেশাল প্যাকেজসমূহ
					</h2>
					<p class="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
						যেকোনো প্যাকেজে ক্লিক করে নিচে সরাসরি অর্ডার কনফার্ম করুন।
					</p>
				</div>

				<!-- Packages Grid (Responsive: 1, 2, or 3 cards) -->
				<div
					class="grid gap-4 {packages.length === 1
						? 'max-w-md mx-auto grid-cols-1'
						: packages.length === 2
							? 'max-w-3xl mx-auto grid-cols-1 md:grid-cols-2'
							: 'max-w-5xl mx-auto grid-cols-1 md:grid-cols-3'}"
				>
					{#each packages as pkg, idx}
						<div
							role="button"
							tabindex="0"
							onclick={() => (selectedPackageIndex = idx)}
							onkeydown={(e) => e.key === 'Enter' && (selectedPackageIndex = idx)}
							class="text-left rounded-3xl p-5 border-2 transition-all relative cursor-pointer flex flex-col justify-between bg-white {selectedPackageIndex === idx
								? 'border-[#e8007c] shadow-xl ring-4 ring-[#e8007c]/10 transform -translate-y-1'
								: 'border-slate-200 hover:border-slate-300 shadow-xs'}"
						>
							<!-- Top Badge -->
							{#if pkg.tag}
								<span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-md whitespace-nowrap {pkg.popular ? 'bg-[#e8007c]' : 'bg-indigo-600'}">
									{pkg.tag}
								</span>
							{/if}

							<div class="space-y-3">
								<!-- Title & Gift -->
								<div class="flex items-start justify-between gap-2">
									<div>
										<h3 class="text-base sm:text-lg font-black text-slate-900 leading-tight">
											{pkg.title}
										</h3>
										{#if pkg.freeGift}
											<div class="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/80 mt-1">
												<Gift class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
												<span>{pkg.freeGift}</span>
											</div>
										{/if}
									</div>

									<!-- Radio Check Circle -->
									<div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors {selectedPackageIndex === idx ? 'bg-[#e8007c] border-[#e8007c] text-white' : 'border-slate-300 bg-white'}">
										{#if selectedPackageIndex === idx}
											<Check class="w-3.5 h-3.5 stroke-[3]" />
										{/if}
									</div>
								</div>

								<!-- Subtitle -->
								<p class="text-xs text-slate-500 font-medium leading-relaxed">
									{pkg.subtitle}
								</p>

								<!-- Price Section -->
								<div class="pt-2 border-t border-slate-100 flex items-baseline justify-between gap-2">
									<div>
										<span class="text-[11px] text-slate-400 block line-through">
											রেগুলার মূল্য {formatTaka(pkg.originalPrice)}
										</span>
										<span class="text-xl sm:text-2xl font-black text-[#e8007c] leading-none">
											{formatTaka(pkg.price)}
										</span>
									</div>

									{#if pkg.saveAmount > 0}
										<span class="px-2 py-1 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 text-xs font-black">
											সেভ {formatTaka(pkg.saveAmount)}
										</span>
									{/if}
								</div>
							</div>

							<!-- Select CTA button on card -->
							<div class="pt-4 mt-2">
								<button
									type="button"
									class="w-full py-2.5 rounded-xl font-black text-xs transition-all {selectedPackageIndex === idx
										? 'bg-[#e8007c] text-white shadow-sm shadow-[#e8007c]/30'
										: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
								>
									{selectedPackageIndex === idx ? '✓ নির্বাচিত হয়েছে' : 'সিলেক্ট করুন'}
								</button>
							</div>
						</div>
					{/each}
				</div>

			</div>
		</section>
	{/if}

	<!-- 5. SECTION 3: STEP 2 - 2-COLUMN SPLIT DIRECT CHECKOUT FORM -->
	<section id="lighthouse-checkout-step" class="py-12 md:py-16 bg-slate-50 border-b border-slate-200/80 scroll-mt-20">
		<div class="max-w-5xl mx-auto px-4 space-y-6">

			<!-- Step Header -->
			<div class="text-center space-y-2 max-w-xl mx-auto">
				<Badge variant="outline" class="bg-[#e8007c]/10 text-[#e8007c] border-[#e8007c]/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
					স্টেপ ২: ক্যাশ অন ডেলিভারি তথ্য
				</Badge>
				<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
					অর্ডারটি কনফার্ম করতে নিচের ফর্মটি পূরণ করুন
				</h2>
				<p class="text-xs sm:text-sm text-emerald-800 font-bold bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-200 inline-block">
					✨ কোনো অগ্রিম পেমেন্ট নেই — পণ্য হাতে পেয়ে চেক করে টাকা দিন।
				</p>
			</div>

			<!-- 2-Column Split Layout -->
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">

				<!-- Left Column: Order Form Inputs (7 Cols) -->
				<div class="lg:col-span-7">
					<Card class="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-md space-y-5">
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
									placeholder="যেমন: মোঃ আরিফুল ইসলাম"
									bind:value={customerName}
									class="h-11 rounded-xl bg-slate-50/80 border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-[#e8007c] focus:ring-1 focus:ring-[#e8007c]"
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
									placeholder="017xxxxxxxx"
									bind:value={customerPhone}
									class="h-11 rounded-xl bg-slate-50/80 border-slate-200 text-xs sm:text-sm font-mono focus:bg-white focus:border-[#e8007c] focus:ring-1 focus:ring-[#e8007c]"
								/>
							</div>

							<!-- Delivery Area Radio Selector -->
							<div class="space-y-1.5">
								<span class="block text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
									<Truck class="w-4 h-4 text-[#e8007c]" />
									<span>ডেলিভারি এরিয়া বেছে নিন <span class="text-rose-500">*</span></span>
								</span>
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
									<label
										class="flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer {deliveryArea === 'inside_dhaka'
											? 'border-[#e8007c] bg-[#e8007c]/5 ring-1 ring-[#e8007c]'
											: 'border-slate-200 bg-slate-50 hover:border-slate-300'}"
									>
										<div class="flex items-center gap-2">
											<input
												type="radio"
												name="deliveryArea"
												value="inside_dhaka"
												checked={deliveryArea === 'inside_dhaka'}
												onchange={() => (deliveryArea = 'inside_dhaka')}
												class="w-4 h-4 text-[#e8007c] focus:ring-[#e8007c]"
											/>
											<span class="text-xs font-bold text-slate-800">ঢাকার ভেতরে</span>
										</div>
										<span class="text-xs font-black text-slate-700">চার্জ: ৳{insideDhakaFee}</span>
									</label>

									<label
										class="flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer {deliveryArea === 'outside_dhaka'
											? 'border-[#e8007c] bg-[#e8007c]/5 ring-1 ring-[#e8007c]'
											: 'border-slate-200 bg-slate-50 hover:border-slate-300'}"
									>
										<div class="flex items-center gap-2">
											<input
												type="radio"
												name="deliveryArea"
												value="outside_dhaka"
												checked={deliveryArea === 'outside_dhaka'}
												onchange={() => (deliveryArea = 'outside_dhaka')}
												class="w-4 h-4 text-[#e8007c] focus:ring-[#e8007c]"
											/>
											<span class="text-xs font-bold text-slate-800">ঢাকার বাইরে</span>
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
									class="rounded-xl bg-slate-50/80 border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-[#e8007c] focus:ring-1 focus:ring-[#e8007c]"
								/>
							</div>

							<!-- Optional Order Note -->
							<div>
								<label for="lh-order-note" class="block text-xs font-semibold text-slate-500 mb-1">
									বিশেষ নোট বা নির্দেশিকা (ঐচ্ছিক)
								</label>
								<Input
									id="lh-order-note"
									type="text"
									placeholder="যেমন: শুক্রবার ডেলিভারি দিলে ভালো হয়"
									bind:value={orderNote}
									class="h-9 rounded-xl bg-slate-50/60 border-slate-200 text-xs"
								/>
							</div>

							<!-- Submit Button on Desktop/Mobile Inside Form -->
							<div class="pt-2">
								<button
									type="submit"
									disabled={isSubmitting}
									class="w-full py-3.5 rounded-2xl bg-[#e8007c] hover:bg-[#c70068] text-white font-black text-base shadow-lg shadow-[#e8007c]/30 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
								>
									{#if isSubmitting}
										<Loader2 class="w-5 h-5 animate-spin" />
										<span>অর্ডার প্রসেসিং হচ্ছে...</span>
									{:else}
										<Lock class="w-4 h-4" />
										<span>অর্ডার কনফার্ম করুন — {formatTaka(grandTotal)}</span>
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
							<span class="text-[10px] font-black uppercase text-[#e8007c] bg-[#e8007c]/10 px-2 py-0.5 rounded-full">
								ক্যাশ অন ডেলিভারি
							</span>
						</div>

						<!-- Selected Item / Package Info -->
						<div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
							<div class="flex items-start justify-between gap-2">
								<div>
									<h4 class="text-xs sm:text-sm font-black text-slate-900 leading-tight">
										{currentPackage ? currentPackage.title : (product?.name || headline)}
									</h4>
									{#if currentPackage?.freeGift}
										<p class="text-[11px] font-black text-emerald-700 mt-0.5 flex items-center gap-1">
											<Gift class="w-3 h-3 text-emerald-600 shrink-0" />
											<span>{currentPackage?.freeGift}</span>
										</p>
									{/if}
								</div>
								<span class="text-sm font-black text-slate-900">
									{formatTaka(unitPrice)}
								</span>
							</div>

							<!-- Quantity Changer -->
							<div class="flex items-center justify-between pt-2 border-t border-slate-200/70">
								<span class="text-xs font-bold text-slate-600">প্যাকেজ সংখ্যা (Qty):</span>
								<div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
									<button
										type="button"
										onclick={() => quantity > 1 && quantity--}
										class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
									>
										<Minus class="w-3 h-3" />
									</button>
									<span class="w-6 text-center font-black text-xs text-slate-800">{quantity}</span>
									<button
										type="button"
										onclick={() => quantity++}
										class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
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
								<div class="flex justify-between text-rose-600 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200/60">
									<span>আপনার সাশ্রয়</span>
									<span>- {formatTaka(totalSavings)}</span>
								</div>
							{/if}

							<Separator class="bg-slate-100" />

							<div class="flex justify-between items-baseline pt-1">
								<span class="text-sm font-black text-slate-900">সর্বমোট প্রদেয় টাকা:</span>
								<span class="text-xl font-black text-[#e8007c]">{formatTaka(grandTotal)}</span>
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

	<!-- 6. SECTION 4: VISUAL BENEFIT HIGHLIGHTS (Before/After & Core Capabilities) -->
	<section id="lighthouse-benefits-step" class="py-12 md:py-16 bg-white border-b border-slate-200/80 scroll-mt-16">
		<div class="max-w-5xl mx-auto px-4 space-y-8">
			<div class="text-center space-y-2 max-w-xl mx-auto">
				<Badge variant="outline" class="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
					আসল কার্যকারিতা
				</Badge>
				<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
					{headline} এর স্পষ্ট উপকারিতা
				</h2>
				<p class="text-xs sm:text-sm text-slate-500 font-medium">
					{subheadline || 'প্রিমিয়াম কোয়ালিটি উপাদান ও নির্ভরযোগ্য মান যা ব্যবহারের সাথে সাথেই স্পষ্ট পরিবর্তন অনুভব করাবে।'}
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
				<!-- Benefit Card 1 -->
				<Card class="rounded-3xl border border-slate-200 bg-linear-to-br from-emerald-50/40 via-white to-white p-6 shadow-xs space-y-3">
					<div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg shadow-2xs">
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
				<Card class="rounded-3xl border border-slate-200 bg-linear-to-br from-[#e8007c]/5 via-white to-white p-6 shadow-xs space-y-3">
					<div class="w-10 h-10 rounded-2xl bg-[#e8007c]/10 text-[#e8007c] flex items-center justify-center font-black text-lg shadow-2xs">
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

	<!-- 7. SECTION 5: 4-FEATURE GRID -->
	<section class="py-12 md:py-16 bg-slate-50 border-b border-slate-200/80">
		<div class="max-w-5xl mx-auto px-4 space-y-8">
			<div class="text-center space-y-2 max-w-xl mx-auto">
				<Badge variant="outline" class="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
					কেন এটি অনন্য?
				</Badge>
				<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
					দৈনন্দিন জীবনের প্রতিটি মুহূর্তে আপনার ও পরিবারের সুরক্ষা
				</h2>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
					<div class="w-9 h-9 rounded-xl bg-purple-50 text-[#5845eb] flex items-center justify-center font-black text-base">
						🧬
					</div>
					<h4 class="text-sm font-black text-slate-900">৫-স্তর মাইক্রো ফিল্ট্রেশন</h4>
					<p class="text-xs text-slate-500 leading-relaxed">
						উন্নত পলিপ্রোপিলিন (PP) কটন দিয়ে তৈরি, যা পানির সূক্ষ্ম থেকে সূক্ষ্ম ময়লা ও আয়রন নিমেষেই আটকে দেয়।
					</p>
				</div>

				<div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
					<div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-base">
						⚡
					</div>
					<h4 class="text-sm font-black text-slate-900">১ মিনিটে সহজ ইনস্টলেশন</h4>
					<p class="text-xs text-slate-500 leading-relaxed">
						কোনো প্লাগ বা পাইপ ফিটিংস লাগবে না। ফ্রি দেওয়া বেল্ট দিয়ে ঘরে বসেই যে কেউ ১ মিনিটে ট্যাপে সেট করতে পারবেন।
					</p>
				</div>

				<div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
					<div class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-base">
						💆
					</div>
					<h4 class="text-sm font-black text-slate-900">ত্বক ও চুলের সুরক্ষা</h4>
					<p class="text-xs text-slate-500 leading-relaxed">
						আয়রনমুক্ত পানিতে মুখ ধুলে ত্বক পরিষ্কার থাকে এবং গোসলে চুল পড়ার সমস্যা উল্লেখযোগ্য হারে হ্রাস পায়।
					</p>
				</div>

				<div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
					<div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-base">
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

	<!-- 8. SECTION 6: CUSTOMER REVIEWS -->
	<section id="lighthouse-reviews-step" class="py-12 md:py-16 bg-white border-b border-slate-200/80 scroll-mt-16">
		<div class="max-w-5xl mx-auto px-4 space-y-8">
			<div class="text-center space-y-2 max-w-xl mx-auto">
				<Badge variant="outline" class="bg-amber-50 text-amber-700 border-amber-200 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
					সন্তুষ্ট গ্রাহকদের মতামত
				</Badge>
				<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
					{headline} কাস্টমার রিভিউ
				</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card class="rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 bg-slate-50/50">
					<div class="flex items-center gap-1 text-amber-400">
						<Star class="w-4 h-4 fill-amber-400" />
						<Star class="w-4 h-4 fill-amber-400" />
						<Star class="w-4 h-4 fill-amber-400" />
						<Star class="w-4 h-4 fill-amber-400" />
						<Star class="w-4 h-4 fill-amber-400" />
					</div>
					<p class="text-xs text-slate-700 leading-relaxed italic">
						"১০০ পিস কম্বো প্যাকটি নিয়েছি। আমাদের ট্যাপের পানিতে প্রচুর আয়রন আর জং আসত। এই ফিল্টার লাগানোর পর পানি একদম কাঁচের মতো পরিষ্কার। সার্ভিস খুবই ভালো!"
					</p>
					<div class="pt-2 border-t border-slate-200/60 flex items-center justify-between">
						<div>
							<div class="text-xs font-black text-slate-900">মীর তানভীর আহমেদ</div>
							<div class="text-[10px] text-slate-400">মিরপুর, ঢাকা</div>
						</div>
						<span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
							১০০ পিস কম্বো
						</span>
					</div>
				</Card>

				<Card class="rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 bg-slate-50/50">
					<div class="flex items-center gap-1 text-amber-400">
						<Star class="w-4 h-4 fill-amber-400" />
						<Star class="w-4 h-4 fill-amber-400" />
						<Star class="w-4 h-4 fill-amber-400" />
						<Star class="w-4 h-4 fill-amber-400" />
						<Star class="w-4 h-4 fill-amber-400" />
					</div>
					<p class="text-xs text-slate-700 leading-relaxed italic">
						"বাচ্চাদের জন্য পানির বিশুদ্ধতা নিয়ে খুব টেনশনে থাকতাম। মাত্র এক মিনিটে কিচেন ও বেসিনের ট্যাপে লাগিয়ে নিয়েছি। ডেলিভারি মাত্র ২ দিনে পেয়েছি।"
					</p>
					<div class="pt-2 border-t border-slate-200/60 flex items-center justify-between">
						<div>
							<div class="text-xs font-black text-slate-900">নুসরাত জাহান</div>
							<div class="text-[10px] text-slate-400">উত্তরা, ঢাকা</div>
						</div>
						<span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
							৫০ পিস প্যাক
						</span>
					</div>
				</Card>

				<Card class="rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 bg-slate-50/50">
					<div class="flex items-center gap-1 text-amber-400">
						<Star class="w-4 h-4 fill-amber-400" />
						<Star class="w-4 h-4 fill-amber-400" />
						<Star class="w-4 h-4 fill-amber-400" />
						<Star class="w-4 h-4 fill-amber-400" />
						<Star class="w-4 h-4 fill-amber-400" />
					</div>
					<p class="text-xs text-slate-700 leading-relaxed italic">
						"২০০ পিসের মেগা সেভার প্যাকটি অর্ডার করেছিলাম। পুরো পরিবারের এক বছরের নিশ্চিন্ত সমাধান হয়ে গেল। কোনো অগ্রিম টাকা দিতে হয়নি।"
					</p>
					<div class="pt-2 border-t border-slate-200/60 flex items-center justify-between">
						<div>
							<div class="text-xs font-black text-slate-900">আব্দুল কাইয়ুম</div>
							<div class="text-[10px] text-slate-400">আগ্রাবাদ, চট্টগ্রাম</div>
						</div>
						<span class="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
							২০০ পিস মেগা সেভার
						</span>
					</div>
				</Card>
			</div>
		</div>
	</section>

	<!-- 9. SECTION 7: INTERACTIVE ACCORDION FAQ -->
	<section id="lighthouse-faqs-step" class="py-12 md:py-16 bg-slate-50 scroll-mt-16">
		<div class="max-w-3xl mx-auto px-4 space-y-6">
			<div class="text-center space-y-2">
				<Badge variant="outline" class="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
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
							<div class="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100 bg-slate-50/40">
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

	<!-- 10. Floating Sticky Order Bar for Mobile Devices -->
	<div class="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 px-4 flex items-center justify-between gap-3 shadow-2xl md:hidden">
		<div class="flex flex-col min-w-0">
			<span class="text-xs text-slate-400 font-semibold leading-tight">সর্বমোট মূল্য</span>
			<span class="text-base font-black text-[#e8007c] leading-tight">
				{formatTaka(grandTotal)}
			</span>
		</div>

		<Button
			class="bg-[#e8007c] hover:bg-[#c70068] text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#e8007c]/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
			onclick={scrollToCheckout}
		>
			<ShoppingCart class="w-3.5 h-3.5" />
			<span>অর্ডার করুন</span>
		</Button>
	</div>

</div>

