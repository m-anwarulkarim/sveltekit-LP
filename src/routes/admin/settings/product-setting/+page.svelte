<script lang="ts">
	import { Button, Card, Badge, Switch } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import {
		ArrowLeft,
		Check,
		Layers,
		SlidersHorizontal,
		FileText,
		CreditCard,
		ShoppingCart,
		Globe,
		Flame,
		CalendarCheck,
		Warehouse,
		AlertTriangle
	} from 'lucide-svelte';

	let { data }: { data: any } = $props();

	// Page state
	let hasUnsavedChanges = $state(false);
	let isSaving = $state(false);
	let activeSection = $state('sec-product-type');

	function markDirty() {
		hasUnsavedChanges = true;
	}

	function scrollToSection(id: string) {
		activeSection = id;
		const el = document.getElementById(id);
		if (el) {
			const yOffset = -90;
			const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
			window.scrollTo({ top: y, behavior: 'smooth' });
		}
	}

	// 1. Product Type
	let productType = $state<'physical' | 'digital'>(data?.settings?.productType || 'physical');

	// 2. Product List & Sorting
	let enableSoldQtySort = $state(Boolean(data?.settings?.enableSoldQtySort));
	let enablePrioritySort = $state(Boolean(data?.settings?.enablePrioritySort));
	let enableMultipleCategory = $state(data?.settings?.enableMultipleCategory !== undefined ? Boolean(data?.settings?.enableMultipleCategory) : true);
	let enableTotalSold = $state(Boolean(data?.settings?.enableTotalSold));
	let enableDecimalPrice = $state(data?.settings?.enableDecimalPrice !== undefined ? Boolean(data?.settings?.enableDecimalPrice) : true);
	let enable3Variation = $state(data?.settings?.enable3Variation !== undefined ? Boolean(data?.settings?.enable3Variation) : true);
	let enableFaq = $state(Boolean(data?.settings?.enableFaq));
	let enableProductHighlights = $state(Boolean(data?.settings?.enableProductHighlights));
	let enableFeaturesBadge = $state(Boolean(data?.settings?.enableFeaturesBadge));
	let enableTrustBadges = $state(Boolean(data?.settings?.enableTrustBadges));

	// 3. Product Details Page
	let enableCondition = $state(data?.settings?.enableCondition !== undefined ? Boolean(data?.settings?.enableCondition) : true);
	let detailsViewBottom = $state(data?.settings?.detailsViewBottom !== undefined ? Boolean(data?.settings?.detailsViewBottom) : true);
	let modelInput = $state(Boolean(data?.settings?.modelInput));
	let keyFeatureOption = $state(Boolean(data?.settings?.keyFeatureOption));
	let callOrderBtn = $state(data?.settings?.callOrderBtn !== undefined ? Boolean(data?.settings?.callOrderBtn) : true);
	let whatsappOrderBtn = $state(Boolean(data?.settings?.whatsappOrderBtn));
	let testimonial = $state(data?.settings?.testimonial !== undefined ? Boolean(data?.settings?.testimonial) : true);
	let preOrder = $state(data?.settings?.preOrder !== undefined ? Boolean(data?.settings?.preOrder) : true);
	let resellMenu = $state(Boolean(data?.settings?.resellMenu));
	let portfolioMenu = $state(Boolean(data?.settings?.portfolioMenu));
	let under99Menu = $state(Boolean(data?.settings?.under99Menu));
	let userNotification = $state(data?.settings?.userNotification !== undefined ? Boolean(data?.settings?.userNotification) : true);

	// 4. Payment Setting
	let enableDeliveryCharge = $state(data?.settings?.enableDeliveryCharge !== undefined ? Boolean(data?.settings?.enableDeliveryCharge) : true);
	let enableAdvancePayment = $state(Boolean(data?.settings?.enableAdvancePayment));

	// 5. Checkout Setting
	let checkoutLayout = $state<'express' | 'multistep'>(data?.settings?.checkoutLayout === 'multistep' ? 'multistep' : 'express');
	let enableAdvancedSeo = $state(Boolean(data?.settings?.enableAdvancedSeo));

	// 6. Category & Product URL Setting
	let categoryUrlFormat = $state<'query' | 'path'>(data?.settings?.categoryUrlFormat === 'path' ? 'path' : 'query');

	// 7. Campaign
	let enableCampaign = $state(Boolean(data?.settings?.enableCampaign));

	// 8. Service Reservation
	let enableReservation = $state(Boolean(data?.settings?.enableReservation));

	// 9. Inventory & Stock
	let enableInventory = $state(Boolean(data?.settings?.enableInventory));
	let managePhysicalStock = $state(Boolean(data?.settings?.managePhysicalStock));

	// Save Action to Cloudflare D1 Backend
	async function handleSave() {
		isSaving = true;
		const payload = {
			productType,
			enableSoldQtySort,
			enablePrioritySort,
			enableMultipleCategory,
			enableTotalSold,
			enableDecimalPrice,
			enable3Variation,
			enableFaq,
			enableProductHighlights,
			enableFeaturesBadge,
			enableTrustBadges,
			enableCondition,
			detailsViewBottom,
			modelInput,
			keyFeatureOption,
			callOrderBtn,
			whatsappOrderBtn,
			testimonial,
			preOrder,
			resellMenu,
			portfolioMenu,
			under99Menu,
			userNotification,
			enableDeliveryCharge,
			enableAdvancePayment,
			checkoutLayout,
			enableAdvancedSeo,
			categoryUrlFormat,
			enableCampaign,
			enableReservation,
			enableInventory,
			managePhysicalStock
		};

		try {
			const formData = new FormData();
			formData.append('settings', JSON.stringify(payload));

			const res = await fetch('?/save', {
				method: 'POST',
				body: formData
			});

			if (res.ok) {
				hasUnsavedChanges = false;
				toast.success('প্রোডাক্ট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', {
					description: 'আপনার পরিবর্তনের সেটিংস এখন ক্লাউডফ্লেয়ার D1 ডাটাবেজে ও স্টোরফ্রন্টে কার্যকর।'
				});
			} else {
				toast.error('সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে!');
			}
		} catch (e) {
			console.error(e);
			toast.error('নেটওয়ার্ক সংযোগে সমস্যা হয়েছে!');
		} finally {
			isSaving = false;
		}
	}

	// Table of Contents navigation items
	const SECTIONS = [
		{ id: 'sec-product-type', label: 'Product Type', bn: 'পণ্যের ধরন', icon: Layers },
		{ id: 'sec-product-display', label: 'Product Display & Sort', bn: 'লিস্ট ও ফিল্টার', icon: SlidersHorizontal },
		{ id: 'sec-product-details', label: 'Product Details', bn: 'ডিটেইলস পেজ', icon: FileText },
		{ id: 'sec-payment', label: 'Payment', bn: 'পেমেন্ট পলিসি', icon: CreditCard },
		{ id: 'sec-checkout', label: 'Checkout & SEO', bn: 'চেকআউট ও এসইও', icon: ShoppingCart },
		{ id: 'sec-product-url', label: 'Product URL', bn: 'ইউআরএল স্ট্রাকচার', icon: Globe },
		{ id: 'sec-campaign', label: 'Campaign', bn: 'ক্যাম্পেইন', icon: Flame },
		{ id: 'sec-service-reservation', label: 'Service Reservation', bn: 'রিজার্ভেশন', icon: CalendarCheck },
		{ id: 'sec-inventory-stock', label: 'Inventory & Stock', bn: 'ইনভেন্টরি ও স্টক', icon: Warehouse }
	];
</script>

<svelte:head>
	<title>Product Settings | AURA Admin</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto pb-24">

	<!-- Sticky Top Header & Action Bar -->
	<div class="sticky top-0 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs flex items-center justify-between gap-4 transition-all">
		<div class="flex items-center gap-3">
			<Button
				href="/admin/settings"
				variant="outline"
				size="sm"
				class="gap-1.5 text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50"
			>
				<ArrowLeft class="w-3.5 h-3.5" />
				<span class="hidden sm:inline">Back to Settings</span>
				<span class="sm:hidden">Back</span>
			</Button>

			<div class="h-4 w-px bg-slate-200 hidden sm:block"></div>

			<div>
				<h1 class="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
					<span>Product Setting</span>
					<span class="text-xs font-normal text-slate-400 hidden md:inline">(প্রোডাক্ট সেটিংস)</span>
				</h1>
			</div>
		</div>

		<div class="flex items-center gap-3">
			{#if hasUnsavedChanges}
				<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/90 animate-pulse">
					Unsaved changes
				</span>
			{/if}

			<Button
				type="button"
				onclick={handleSave}
				disabled={isSaving}
				class="gap-1.5 text-xs font-bold bg-[#5845eb] hover:bg-[#4836d4] text-white shadow-sm shadow-[#5845eb]/20"
			>
				{#if isSaving}
					<span class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
					<span>সংরক্ষণ হচ্ছে...</span>
				{:else}
					<Check class="w-4 h-4" />
					<span>Save Changes</span>
				{/if}
			</Button>
		</div>
	</div>

	<!-- Main Layout: Left 8-9 cols for Content, Right 3-4 cols for Quick Scroll Navigation -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		
		<!-- Left: Settings Content Sections -->
		<div class="lg:col-span-8 xl:col-span-9 space-y-6">

			<!-- 1. Product Type Section -->
			<section id="sec-product-type" class="scroll-mt-24">
				<Card class="p-6 bg-white border-slate-200/80 shadow-2xs rounded-2xl">
					<div class="border-b border-slate-100 pb-4 mb-5">
						<h2 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">
							Product Type <span class="text-xs font-normal text-slate-400 font-mono">(productSetting.productType)</span>
						</h2>
						<p class="text-xs text-slate-500 mt-0.5">
							আপনার স্টোরে বিক্রিত পণ্যের ধরন নির্ধারণ করুন
						</p>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						<!-- Physical Product -->
						<button
							type="button"
							onclick={() => { productType = 'physical'; markDirty(); }}
							class="text-left p-4 rounded-xl border-2 transition-all cursor-pointer relative {productType === 'physical'
								? 'border-[#5845eb] bg-indigo-50/20 shadow-2xs'
								: 'border-slate-200 hover:border-slate-300 bg-white'}"
						>
							<div class="flex items-center gap-3">
								<div class="w-4 h-4 rounded-full border-2 flex items-center justify-center {productType === 'physical' ? 'border-[#5845eb]' : 'border-slate-300'}">
									{#if productType === 'physical'}
										<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
									{/if}
								</div>
								<div>
									<div class="text-xs font-bold text-slate-900">Physical Product</div>
									<div class="text-[11px] text-slate-500 mt-0.5">কুরিয়ারের মাধ্যমে ডেলিভারিযোগ্য পণ্য (বস্ত্র, গ্যাজেট ইত্যাদি)</div>
								</div>
							</div>
						</button>

						<!-- Digital Product -->
						<button
							type="button"
							onclick={() => { productType = 'digital'; markDirty(); }}
							class="text-left p-4 rounded-xl border-2 transition-all cursor-pointer relative {productType === 'digital'
								? 'border-[#5845eb] bg-indigo-50/20 shadow-2xs'
								: 'border-slate-200 hover:border-slate-300 bg-white'}"
						>
							<div class="flex items-center gap-3">
								<div class="w-4 h-4 rounded-full border-2 flex items-center justify-center {productType === 'digital' ? 'border-[#5845eb]' : 'border-slate-300'}">
									{#if productType === 'digital'}
										<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
									{/if}
								</div>
								<div>
									<div class="text-xs font-bold text-slate-900">Digital Product</div>
									<div class="text-[11px] text-slate-500 mt-0.5">ডাউনলোড বা অনলাইন অ্যাক্সেসযোগ্য পণ্য (ইবুক, কোর্স ইত্যাদি)</div>
								</div>
							</div>
						</button>
					</div>
				</Card>
			</section>

			<!-- 2. Product List & Sorting Section -->
			<section id="sec-product-display" class="scroll-mt-24">
				<Card class="p-6 bg-white border-slate-200/80 shadow-2xs rounded-2xl">
					<div class="border-b border-slate-100 pb-4 mb-5">
						<h2 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">
							Product List Sorting <span class="text-xs font-normal text-slate-400 font-mono">(productSetting.productListSorting)</span>
						</h2>
						<p class="text-xs text-slate-500 mt-0.5">
							ক্যাটালগে পণ্যের প্রদর্শন ক্রম, সর্টিং অপশন ও বিভিন্ন ডিসপ্লে ব্যাজ সক্রিয় করুন
						</p>
					</div>

					<div class="space-y-4 divide-y divide-slate-100">
						<!-- 1. Enable Sold Qty Sort -->
						<div class="pt-3.5 first:pt-0 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Enable Sold Qty Sort</div>
								<div class="text-[11px] text-slate-500">ক্যাটালগে সর্বাধিক বিক্রিত পণ্যের ভিত্তিতে ফিল্টার অপশন চালু করুন</div>
							</div>
							<Switch bind:checked={enableSoldQtySort} onchange={markDirty} />
						</div>

						<!-- 2. Enable Priority Sort -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Enable Priority Sort</div>
								<div class="text-[11px] text-slate-500">অ্যাডমিন থেকে নির্ধারিত প্রায়োরিটি অনুযায়ী পণ্য প্রদর্শন করুন</div>
							</div>
							<Switch bind:checked={enablePrioritySort} onchange={markDirty} />
						</div>

						<!-- 3. Enable Multiple Category -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Enable Multiple Category</div>
								<div class="text-[11px] text-slate-500">একটি পণ্যে একসাথে একাধিক ক্যাটাগরি নির্বাচনের সুবিধা চালু করুন</div>
							</div>
							<Switch bind:checked={enableMultipleCategory} onchange={markDirty} />
						</div>

						<!-- 4. Enable Total Sold -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Enable Total Sold</div>
								<div class="text-[11px] text-slate-500">প্রোডাক্ট কার্ডে সর্বমোট কতটি বিক্রি হয়েছে তার সংখ্যা প্রদর্শন করুন</div>
							</div>
							<Switch bind:checked={enableTotalSold} onchange={markDirty} />
						</div>

						<!-- 5. Enable Decimal Price -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Enable Decimal Price</div>
								<div class="text-[11px] text-slate-500">Show prices with two decimal places (e.g. 100.00) across all views.</div>
							</div>
							<Switch bind:checked={enableDecimalPrice} onchange={markDirty} />
						</div>

						<!-- 6. Enable 3 Variation -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Enable 3 Variation</div>
								<div class="text-[11px] text-slate-500">কালার, সাইজ ও ম্যাটেরিয়াল মিলিয়ে ৩ ধাপের ভ্যারিয়েশন সিস্টেম অন করুন</div>
							</div>
							<Switch bind:checked={enable3Variation} onchange={markDirty} />
						</div>

						<!-- 7. Enable FAQ -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Enable FAQ</div>
								<div class="text-[11px] text-slate-500">Show product FAQs on product details and enable FAQ fields when adding or editing product</div>
							</div>
							<Switch bind:checked={enableFaq} onchange={markDirty} />
						</div>

						<!-- 8. Enable Product Highlights -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Enable Product Highlights / Why It Works Section</div>
								<div class="text-[11px] text-slate-500">Show 'Why It Works' & Quick Slim Fit Check highlights on product details and enable fields in Add/Edit Product form</div>
							</div>
							<Switch bind:checked={enableProductHighlights} onchange={markDirty} />
						</div>

						<!-- 9. Product Features Badge -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Product Features Badge</div>
								<div class="text-[11px] text-slate-500">Show dynamic feature badges (icons & highlight points) below product price on product details page and enable fields in Add/Edit Product form</div>
							</div>
							<Switch bind:checked={enableFeaturesBadge} onchange={markDirty} />
						</div>

						<!-- 10. Showcase Trust Badges -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Showcase Trust Badges / Service Highlights</div>
								<div class="text-[11px] text-slate-500">Show trust badges bar with icons and text below showcase on the home page. Defaults to 5 standard badges (100% Genuine, Warranty, Exchange, Fastest Delivery, After Sales Service) if custom badges are not added</div>
							</div>
							<Switch bind:checked={enableTrustBadges} onchange={markDirty} />
						</div>
					</div>
				</Card>
			</section>

			<!-- 3. Product Details Page Section -->
			<section id="sec-product-details" class="scroll-mt-24">
				<Card class="p-6 bg-white border-slate-200/80 shadow-2xs rounded-2xl">
					<div class="border-b border-slate-100 pb-4 mb-5">
						<h2 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">
							Product Details Page <span class="text-xs font-normal text-slate-400 font-mono">(productSetting.productDetailsPage)</span>
						</h2>
						<p class="text-xs text-slate-500 mt-0.5">
							একক প্রোডাক্ট পেজের বোতাম, ভিউ লেআউট ও গ্রাহক মিথস্ক্রিয়া সেটিংস
						</p>
					</div>

					<div class="space-y-4 divide-y divide-slate-100">
						<!-- Enable Condition -->
						<div class="pt-3.5 first:pt-0 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Enable Condition</div>
								<div class="text-[11px] text-slate-500">পণ্যের অবস্থা (নতুন, ইনট্যাক্ট বা ফ্রেশ) ব্যাজ প্রদর্শন করুন</div>
							</div>
							<Switch bind:checked={enableCondition} onchange={markDirty} />
						</div>

						<!-- Details View Bottom -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Details View Bottom</div>
								<div class="text-[11px] text-slate-500">পণ্যের পূর্ণ বিবরণ ও স্পেসিফিকেশন ইমেজ সেকশনের নিচে ফুল-উইডথে দেখান</div>
							</div>
							<Switch bind:checked={detailsViewBottom} onchange={markDirty} />
						</div>

						<!-- Model Input -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Model Input</div>
								<div class="text-[11px] text-slate-500">অ্যাডমিন ফর্মে মডেল নম্বর / পার্ট নম্বর ইনপুটের ফিল্ড অন করুন</div>
							</div>
							<Switch bind:checked={modelInput} onchange={markDirty} />
						</div>

						<!-- Key Feature Option -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Key Feature Option</div>
								<div class="text-[11px] text-slate-500">বুলেট পয়েন্ট আকারে গুরুত্বপূর্ণ বৈশিষ্ট্য তালিকা প্রদর্শন করুন</div>
							</div>
							<Switch bind:checked={keyFeatureOption} onchange={markDirty} />
						</div>

						<!-- Call Order Button -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Call Order Button</div>
								<div class="text-[11px] text-slate-500">সরাসরি ফোন করে অর্ডার দেওয়ার জন্য "কল অর্ডার" বাটন যুক্ত করুন</div>
							</div>
							<Switch bind:checked={callOrderBtn} onchange={markDirty} />
						</div>

						<!-- WhatsApp Order Button -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">WhatsApp Order Button</div>
								<div class="text-[11px] text-slate-500">১-ক্লিকে সরাসরি হোয়াটসঅ্যাপে মেসেজ পাঠিয়ে অর্ডার নেওয়ার বাটন দেখান</div>
							</div>
							<Switch bind:checked={whatsappOrderBtn} onchange={markDirty} />
						</div>

						<!-- Testimonial -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Testimonial</div>
								<div class="text-[11px] text-slate-500">পণ্যের পাতায় গ্রাহকদের রিভিউ ও প্রশংসাপত্র সেকশন অন রাখুন</div>
							</div>
							<Switch bind:checked={testimonial} onchange={markDirty} />
						</div>

						<!-- Pre-Order -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Pre-Order</div>
								<div class="text-[11px] text-slate-500">স্টক শেষ থাকলেও অগ্রিম প্রি-অর্ডার নেওয়ার বাটন দেখান</div>
							</div>
							<Switch bind:checked={preOrder} onchange={markDirty} />
						</div>

						<!-- Resell Menu -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Resell Menu</div>
								<div class="text-[11px] text-slate-500">রিসেলারদের জন্য বিশেষ মেনু অপশন সক্রিয় করুন</div>
							</div>
							<Switch bind:checked={resellMenu} onchange={markDirty} />
						</div>

						<!-- Portfolio Menu -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Portfolio Menu</div>
								<div class="text-[11px] text-slate-500">পোর্টফোলিও বা কাজের স্যাম্পল গ্যালারি মেনু প্রদর্শন করুন</div>
							</div>
							<Switch bind:checked={portfolioMenu} onchange={markDirty} />
						</div>

						<!-- Under 99 Menu -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Under 99 Menu</div>
								<div class="text-[11px] text-slate-500">বাজেট ও কমদামী পণ্যের জন্য বিশেষ ফিল্টার মেনু যুক্ত করুন</div>
							</div>
							<Switch bind:checked={under99Menu} onchange={markDirty} />
						</div>

						<!-- User Notification -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">User Notification</div>
								<div class="text-[11px] text-slate-500">ভিজিটরদের সাম্প্রতিক লাইভ অর্ডার ও পপআপ সোশ্যাল প্রুফ অ্যালার্ট দেখান</div>
							</div>
							<Switch bind:checked={userNotification} onchange={markDirty} />
						</div>
					</div>
				</Card>
			</section>

			<!-- 4. Payment Setting Section -->
			<section id="sec-payment" class="scroll-mt-24">
				<Card class="p-6 bg-white border-slate-200/80 shadow-2xs rounded-2xl">
					<div class="border-b border-slate-100 pb-4 mb-5">
						<h2 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">
							Payment Setting <span class="text-xs font-normal text-slate-400 font-mono">(productSetting.paymentSetting)</span>
						</h2>
						<p class="text-xs text-slate-500 mt-0.5">
							ডেলিভারি চার্জ ও অগ্রিম পেমেন্ট পলিসি সেটিংস
						</p>
					</div>

					<div class="space-y-4 divide-y divide-slate-100">
						<!-- Enable Delivery Charge -->
						<div class="pt-3.5 first:pt-0 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Enable Delivery Charge</div>
								<div class="text-[11px] text-slate-500">চেকআউট পেজে নির্ধারিত ডেলিভারি ফি স্বয়ংক্রিয়ভাবে বিলে যোগ করুন</div>
							</div>
							<Switch bind:checked={enableDeliveryCharge} onchange={markDirty} />
						</div>

						<!-- Enable Advance Payment -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Enable Advance Payment</div>
								<div class="text-[11px] text-slate-500">ক্যাশ অন ডেলিভারিতে নির্দিষ্ট পরিমাণ অগ্রিম বা ডেলিভারি ফি আগে নেওয়ার বাধ্যবাধকতা অন করুন</div>
							</div>
							<Switch bind:checked={enableAdvancePayment} onchange={markDirty} />
						</div>
					</div>
				</Card>
			</section>

			<!-- 5. Checkout Setting Section -->
			<section id="sec-checkout" class="scroll-mt-24">
				<Card class="p-6 bg-white border-slate-200/80 shadow-2xs rounded-2xl space-y-5">
					<div class="border-b border-slate-100 pb-4">
						<h2 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">
							Checkout Setting <span class="text-xs font-normal text-slate-400 font-mono">(productSetting.checkoutSetting)</span>
						</h2>
						<p class="text-xs text-slate-500 mt-0.5">
							চেকআউট ফর্ম লেআউট নির্বাচন ও সার্চ ইঞ্জিন অপ্টিমাইজেশন
						</p>
					</div>

					<!-- Checkout Layout Cards -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						<button
							type="button"
							onclick={() => { checkoutLayout = 'express'; markDirty(); }}
							class="text-left p-4 rounded-xl border-2 transition-all cursor-pointer relative {checkoutLayout === 'express'
								? 'border-[#5845eb] bg-indigo-50/20 shadow-2xs'
								: 'border-slate-200 hover:border-slate-300 bg-white'}"
						>
							<div class="flex items-center gap-3">
								<div class="w-4 h-4 rounded-full border-2 flex items-center justify-center {checkoutLayout === 'express' ? 'border-[#5845eb]' : 'border-slate-300'}">
									{#if checkoutLayout === 'express'}
										<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
									{/if}
								</div>
								<div>
									<div class="text-xs font-bold text-slate-900">1-Page Express Checkout</div>
									<div class="text-[11px] text-slate-500 mt-0.5">একক পেজে দ্রুত নাম-ঠিকানা ও অর্ডার সম্পন্ন (সর্বোচ্চ কনভার্সন)</div>
								</div>
							</div>
						</button>

						<button
							type="button"
							onclick={() => { checkoutLayout = 'multistep'; markDirty(); }}
							class="text-left p-4 rounded-xl border-2 transition-all cursor-pointer relative {checkoutLayout === 'multistep'
								? 'border-[#5845eb] bg-indigo-50/20 shadow-2xs'
								: 'border-slate-200 hover:border-slate-300 bg-white'}"
						>
							<div class="flex items-center gap-3">
								<div class="w-4 h-4 rounded-full border-2 flex items-center justify-center {checkoutLayout === 'multistep' ? 'border-[#5845eb]' : 'border-slate-300'}">
									{#if checkoutLayout === 'multistep'}
										<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
									{/if}
								</div>
								<div>
									<div class="text-xs font-bold text-slate-900">Multi-Step Standard Checkout</div>
									<div class="text-[11px] text-slate-500 mt-0.5">কার্ট > কাস্টমার ডেটা > পেমেন্ট — ধাপে ধাপে সম্পন্ন</div>
								</div>
							</div>
						</button>
					</div>

					<!-- SEO Warning Alert Banner -->
					<div class="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 flex items-start gap-2.5">
						<AlertTriangle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
						<div class="text-xs leading-relaxed">
							<span class="font-bold">SEO Warning:</span> চেকআউট ও প্রোডাক্ট পেজের মেটা ট্যাগ বা ইউআরএল পরিবর্তন করলে গুগল সার্চ ইনডেক্সিং প্রভাবিত হতে পারে। সাবধানতার সাথে পরিবর্তন করুন।
						</div>
					</div>

					<!-- Advanced SEO Switch -->
					<div class="pt-2 flex items-center justify-between gap-4">
						<div class="space-y-0.5">
							<div class="text-xs font-bold text-slate-800">Enable Advanced SEO</div>
							<div class="text-[11px] text-slate-500">প্রোডাক্ট যোগ করার সময় কাস্টম এসইও মেটা টাইটেল, ডেসক্রিপশন ও স্কিমা মার্কআপ ফিল্ড অন করুন</div>
						</div>
						<Switch bind:checked={enableAdvancedSeo} onchange={markDirty} />
					</div>
				</Card>
			</section>

			<!-- 6. Category & Product URL Setting Section -->
			<section id="sec-product-url" class="scroll-mt-24">
				<Card class="p-6 bg-white border-slate-200/80 shadow-2xs rounded-2xl">
					<div class="border-b border-slate-100 pb-4 mb-5">
						<h2 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">
							Category & Product URL Setting <span class="text-xs font-normal text-slate-400 font-mono">(productSetting.categoryUrlSetting)</span>
						</h2>
						<p class="text-xs text-slate-500 mt-0.5">
							ব্রাউজার অ্যাড্রেস বারে ক্যাটাগরি ও পণ্যের লিঙ্ক স্ট্রাকচার নির্ধারণ করুন
						</p>
					</div>

					<div class="space-y-3">
						<!-- Query Parameter URL (Default in screenshot) -->
						<button
							type="button"
							onclick={() => { categoryUrlFormat = 'query'; markDirty(); }}
							class="w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer relative {categoryUrlFormat === 'query'
								? 'border-[#5845eb] bg-indigo-50/20 shadow-2xs'
								: 'border-slate-200 hover:border-slate-300 bg-white'}"
						>
							<div class="flex items-center gap-3">
								<div class="w-4 h-4 rounded-full border-2 flex items-center justify-center {categoryUrlFormat === 'query' ? 'border-[#5845eb]' : 'border-slate-300'}">
									{#if categoryUrlFormat === 'query'}
										<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
									{/if}
								</div>
								<div>
									<div class="text-xs font-mono font-bold text-slate-900">website.com/products?categories=test-category</div>
									<div class="text-[11px] text-slate-500 mt-0.5">স্ট্যান্ডার্ড ফিল্টারিং ও ডায়নামিক কুয়েরি পারমালিংক স্ট্রাকচার</div>
								</div>
							</div>
						</button>

						<!-- Direct Category URL -->
						<button
							type="button"
							onclick={() => { categoryUrlFormat = 'path'; markDirty(); }}
							class="w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer relative {categoryUrlFormat === 'path'
								? 'border-[#5845eb] bg-indigo-50/20 shadow-2xs'
								: 'border-slate-200 hover:border-slate-300 bg-white'}"
						>
							<div class="flex items-center gap-3">
								<div class="w-4 h-4 rounded-full border-2 flex items-center justify-center {categoryUrlFormat === 'path' ? 'border-[#5845eb]' : 'border-slate-300'}">
									{#if categoryUrlFormat === 'path'}
										<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
									{/if}
								</div>
								<div>
									<div class="text-xs font-mono font-bold text-slate-900">website.com/categories=test-category</div>
									<div class="text-[11px] text-slate-500 mt-0.5">সংক্ষিপ্ত ডিরেক্টরি পারমালিংক স্ট্রাকচার</div>
								</div>
							</div>
						</button>
					</div>
				</Card>
			</section>

			<!-- 7. Campaign Section -->
			<section id="sec-campaign" class="scroll-mt-24">
				<Card class="p-6 bg-white border-slate-200/80 shadow-2xs rounded-2xl">
					<div class="border-b border-slate-100 pb-4 mb-5">
						<h2 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">
							Campaign <span class="text-xs font-normal text-slate-400 font-mono">(productSetting.campaign)</span>
						</h2>
						<p class="text-xs text-slate-500 mt-0.5">
							ফ্ল্যাশ ডিল ও স্পেশাল সেলস ক্যাম্পেইন ম্যানেজমেন্ট
						</p>
					</div>

					<div class="flex items-center justify-between gap-4">
						<div class="space-y-0.5">
							<div class="text-xs font-bold text-slate-800">Enable Campaign</div>
							<div class="text-[11px] text-slate-500">হোমপেজে স্পেশাল অফার ব্যানার ও টাইমার সহ ক্যাম্পেইন মডিউল সক্রিয় করুন</div>
						</div>
						<Switch bind:checked={enableCampaign} onchange={markDirty} />
					</div>
				</Card>
			</section>

			<!-- 8. Service Reservation Section -->
			<section id="sec-service-reservation" class="scroll-mt-24">
				<Card class="p-6 bg-white border-slate-200/80 shadow-2xs rounded-2xl">
					<div class="border-b border-slate-100 pb-4 mb-5">
						<h2 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">
							Service Reservation <span class="text-xs font-normal text-slate-400 font-mono">(productSetting.reservation)</span>
						</h2>
						<p class="text-xs text-slate-500 mt-0.5">
							পণ্য ছাড়া সেবা বা অ্যাপয়েন্টমেন্ট বুকিং ব্যবস্থা
						</p>
					</div>

					<div class="flex items-center justify-between gap-4">
						<div class="space-y-0.5">
							<div class="text-xs font-bold text-slate-800">Enable Reservation</div>
							<div class="text-[11px] text-slate-500">গ্রাহকদের জন্য নির্দিষ্ট তারিখ ও সময়ের স্লট নির্ধারণ করে বুকিংয়ের অপশন অন করুন</div>
						</div>
						<Switch bind:checked={enableReservation} onchange={markDirty} />
					</div>
				</Card>
			</section>

			<!-- 9. Inventory & Stock Section -->
			<section id="sec-inventory-stock" class="scroll-mt-24">
				<Card class="p-6 bg-white border-slate-200/80 shadow-2xs rounded-2xl">
					<div class="border-b border-slate-100 pb-4 mb-5">
						<h2 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">
							Inventory & Stock <span class="text-xs font-normal text-slate-400 font-mono">(productSetting.inventoryStock)</span>
						</h2>
						<p class="text-xs text-slate-500 mt-0.5">
							কেন্দ্রীয় ইনভেন্টরি, গোডাউন স্টক ও লো-স্টক নোটিফিকেশন পলিসি
						</p>
					</div>

					<div class="space-y-4 divide-y divide-slate-100">
						<!-- Enable Inventory -->
						<div class="pt-3.5 first:pt-0 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Enable Inventory</div>
								<div class="text-[11px] text-slate-500">Enable central inventory tracking, stock valuation, and low stock alerts in the sidebar</div>
							</div>
							<Switch bind:checked={enableInventory} onchange={markDirty} />
						</div>

						<!-- Manage Physical Stock -->
						<div class="pt-3.5 flex items-center justify-between gap-4">
							<div class="space-y-0.5">
								<div class="text-xs font-bold text-slate-800">Manage Physical Stock</div>
								<div class="text-[11px] text-slate-500">একাধিক শাখা বা গুদাম ভিত্তিক বাস্তব স্টক গণনা ও ট্র্যাকিং সক্রিয় করুন</div>
							</div>
							<Switch bind:checked={managePhysicalStock} onchange={markDirty} />
						</div>
					</div>
				</Card>
			</section>

		</div>

		<!-- Right: Sticky Quick Navigation Table of Contents -->
		<div class="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-20">
			<Card class="p-4 bg-white border-slate-200/80 shadow-2xs rounded-2xl">
				<div class="pb-3 border-b border-slate-100 mb-3">
					<h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">
						Settings Sections
					</h3>
					<p class="text-[11px] text-slate-400 mt-0.5">
						Quickly scroll to page settings segments
					</p>
				</div>

				<nav class="space-y-1">
					{#each SECTIONS as sec}
						{@const Icon = sec.icon}
						<button
							type="button"
							onclick={() => scrollToSection(sec.id)}
							class="w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer {activeSection === sec.id
								? 'bg-[#5845eb] text-white shadow-2xs'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
						>
							<div class="flex items-center gap-2 truncate">
								<Icon class="w-3.5 h-3.5 shrink-0 {activeSection === sec.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}" />
								<span class="truncate">{sec.label}</span>
							</div>
							<span class="text-[10px] opacity-75 font-normal ml-1 shrink-0 {activeSection === sec.id ? 'text-white' : 'text-slate-400'}">
								›
							</span>
						</button>
					{/each}
				</nav>
			</Card>
		</div>

	</div>

</div>
