<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import ThemeSectionContainer from '../_components/ThemeSectionContainer.svelte';
	import ThemeOptionCard from '../_components/ThemeOptionCard.svelte';
	import ThemeComponentPreviewModal from '../_components/ThemeComponentPreviewModal.svelte';
	import DynamicHeader from '#lib/modules/layout/headers/DynamicHeader.svelte';
	import DynamicFooter from '#lib/modules/layout/footers/DynamicFooter.svelte';
	import DynamicShowcase from '#lib/modules/layout/showcases/DynamicShowcase.svelte';
	import DynamicCategoryView from '#lib/modules/layout/category-views/DynamicCategoryView.svelte';
	import DynamicProductCard from '#lib/modules/layout/product-cards/DynamicProductCard.svelte';
	import DynamicBottomNav from '#lib/modules/layout/bottom-navs/DynamicBottomNav.svelte';
	import { productsData } from '#lib/modules/products/products.data';
	import { CATEGORIES_DATA } from '#lib/modules/products/categories.data';
	import { Flame, Sparkles, Tag, ArrowRight, Clock, Eye } from 'lucide-svelte';

	let { data, form }: { data: any; form: any } = $props();

	// Reactive theme views config from layout load
	let views = $derived(
		data?.themeConfig?.views || {
			header: 'header_1',
			showcase: 'showcase_2',
			category: 'category_1',
			productSections: ['tag'],
			productCard: 'product_card_3',
			bottomNav: 'bottom_nav_1',
			footer: 'footer_1'
		}
	);

	// Local mutable states for reactive selections
	let selectedHeader = $state(views.header);
	let selectedShowcase = $state(views.showcase);
	let selectedCategory = $state(views.category);
	let selectedProductSections = $state<string[]>([...views.productSections]);
	let selectedProductCard = $state(views.productCard);
	let selectedBottomNav = $state(views.bottomNav);
	let selectedFooter = $state(views.footer);

	// Universal Reusable Component Preview Modal State
	type PreviewType = 'header' | 'footer' | 'showcase' | 'category' | 'product_section' | 'product_card' | 'bottom_nav';
	let isPreviewOpen = $state(false);
	let previewType = $state<PreviewType>('header');
	let previewId = $state('header_1');
	let previewTitle = $state('Header 1');

	function openPreview(type: PreviewType, id: string, title: string) {
		previewType = type;
		previewId = id;
		previewTitle = title;
		isPreviewOpen = true;
	}

	$effect(() => {
		if (views) {
			selectedHeader = views.header;
			selectedShowcase = views.showcase;
			selectedCategory = views.category;
			selectedProductSections = [...views.productSections];
			selectedProductCard = views.productCard;
			selectedBottomNav = views.bottomNav;
			selectedFooter = views.footer;
		}
	});

	let isSubmitting = $state(false);

	$effect(() => {
		if (form?.message) {
			if (form.success) {
				toast.success(form.message);
			} else {
				toast.error(form.message);
			}
		}
	});

	function toggleProductSection(id: string) {
		if (selectedProductSections.includes(id)) {
			// Prevent deselecting if it's the only one selected
			if (selectedProductSections.length > 1) {
				selectedProductSections = selectedProductSections.filter((item) => item !== id);
			} else {
				toast.warning('কমপক্ষে একটি প্রোডাক্ট সেকশন নির্বাচিত থাকতে হবে!');
			}
		} else {
			selectedProductSections = [...selectedProductSections, id];
		}
	}

	// 4 Sample products for realistic card previews
	const sampleProducts = productsData.slice(0, 4);
</script>

<svelte:head>
	<title>Theme Views - Modular Layout Sections - AURA Admin</title>
</svelte:head>

<form
	method="POST"
	action="?/updateThemeViews"
	data-theme-form
	use:enhance={() => {
		isSubmitting = true;
		return async ({ update }) => {
			isSubmitting = false;
			await update();
		};
	}}
	class="space-y-6 sm:space-y-8 animate-in fade-in duration-150 font-['Anek_Bangla',sans-serif]"
>
	<!-- Hidden form fields synced with reactive state -->
	<input type="hidden" name="header" value={selectedHeader} />
	<input type="hidden" name="showcase" value={selectedShowcase} />
	<input type="hidden" name="category" value={selectedCategory} />
	<input type="hidden" name="productSections" value={JSON.stringify(selectedProductSections)} />
	<input type="hidden" name="productCard" value={selectedProductCard} />
	<input type="hidden" name="bottomNav" value={selectedBottomNav} />
	<input type="hidden" name="footer" value={selectedFooter} />

	<!-- 1. Header Section -->
	<ThemeSectionContainer
		title="Header Section"
		selectionMode="SINGLE SELECT"
		sectionTag="HEADERVIEWS"
	>
		<ThemeOptionCard
			id="header_1"
			title="Header 1"
			isDefault={true}
			schematicType="header"
			selected={selectedHeader === 'header_1'}
			onSelect={() => (selectedHeader = 'header_1')}
			onPreview={() => openPreview('header', 'header_1', 'Header 1 (Classic Corporate Mega)')}
		/>
		<ThemeOptionCard
			id="header_2"
			title="Header 2"
			schematicType="header"
			selected={selectedHeader === 'header_2'}
			onSelect={() => (selectedHeader = 'header_2')}
			onPreview={() => openPreview('header', 'header_2', 'Header 2 (Modern Minimalist Clean)')}
		/>
		<ThemeOptionCard
			id="header_3"
			title="Header 3"
			schematicType="header"
			selected={selectedHeader === 'header_3'}
			onSelect={() => (selectedHeader = 'header_3')}
			onPreview={() => openPreview('header', 'header_3', 'Header 3 (Marketplace Search)')}
		/>
		<ThemeOptionCard
			id="header_4"
			title="Header 4"
			schematicType="header"
			selected={selectedHeader === 'header_4'}
			onSelect={() => (selectedHeader = 'header_4')}
			onPreview={() => openPreview('header', 'header_4', 'Header 4 (Premium Boutique)')}
		/>
		<ThemeOptionCard
			id="header_5"
			title="Header 5"
			schematicType="header"
			selected={selectedHeader === 'header_5'}
			onSelect={() => (selectedHeader = 'header_5')}
			onPreview={() => openPreview('header', 'header_5', 'Header 5 (Tech & Gadget Mega)')}
		/>
		<ThemeOptionCard
			id="header_7"
			title="Header 7"
			schematicType="header"
			selected={selectedHeader === 'header_7'}
			onSelect={() => (selectedHeader = 'header_7')}
			onPreview={() => openPreview('header', 'header_7', 'Header 7 (Quick-Commerce Express)')}
		/>
	</ThemeSectionContainer>

	<!-- 2. Showcase Section -->
	<ThemeSectionContainer
		title="Showcase Section"
		selectionMode="SINGLE SELECT"
		sectionTag="SHOWCASEVIEWS"
	>
		<ThemeOptionCard
			id="showcase_2"
			title="Showcase 2"
			isDefault={true}
			schematicType="showcase"
			selected={selectedShowcase === 'showcase_2'}
			onSelect={() => (selectedShowcase = 'showcase_2')}
			onPreview={() => openPreview('showcase', 'showcase_2', 'Showcase 2 (Hero Carousel Slider)')}
		/>
		<ThemeOptionCard
			id="showcase_3"
			title="Showcase 3"
			schematicType="showcase"
			selected={selectedShowcase === 'showcase_3'}
			onSelect={() => (selectedShowcase = 'showcase_3')}
			onPreview={() => openPreview('showcase', 'showcase_3', 'Showcase 3 (Split Promo Grid)')}
		/>
		<ThemeOptionCard
			id="showcase_4"
			title="Showcase 4"
			schematicType="showcase"
			selected={selectedShowcase === 'showcase_4'}
			onSelect={() => (selectedShowcase = 'showcase_4')}
			onPreview={() => openPreview('showcase', 'showcase_4', 'Showcase 4 (Cinematic Hero)')}
		/>
	</ThemeSectionContainer>

	<!-- 3. Category Section -->
	<ThemeSectionContainer
		title="Category Section"
		selectionMode="SINGLE SELECT"
		sectionTag="CATEGORYVIEWS"
	>
		<ThemeOptionCard
			id="category_1"
			title="Category 1"
			isDefault={true}
			schematicType="category"
			selected={selectedCategory === 'category_1'}
			onSelect={() => (selectedCategory = 'category_1')}
			onPreview={() => openPreview('category', 'category_1', 'Category 1 (Interactive Carousel Grid)')}
		/>
		<ThemeOptionCard
			id="category_2"
			title="Category 2"
			schematicType="category"
			selected={selectedCategory === 'category_2'}
			onSelect={() => (selectedCategory = 'category_2')}
			onPreview={() => openPreview('category', 'category_2', 'Category 2 (Visual Accent Cards)')}
		/>
		<ThemeOptionCard
			id="category_3"
			title="Category 3"
			schematicType="category"
			selected={selectedCategory === 'category_3'}
			onSelect={() => (selectedCategory = 'category_3')}
			onPreview={() => openPreview('category', 'category_3', 'Category 3 (Horizontal Story Circles)')}
		/>
		<ThemeOptionCard
			id="none"
			title="None"
			badgeText="NO CATEGORY"
			badgeVariant="gray"
			schematicType="none"
			selected={selectedCategory === 'none'}
			onSelect={() => (selectedCategory = 'none')}
			onPreview={() => openPreview('category', 'none', 'None (ক্যাটাগরি সেকশন গোপন থাকবে)')}
		/>
		<ThemeOptionCard
			id="category_4"
			title="Category 4"
			schematicType="category"
			selected={selectedCategory === 'category_4'}
			onSelect={() => (selectedCategory = 'category_4')}
			onPreview={() => openPreview('category', 'category_4', 'Category 4 (Modern Minimalist Pills)')}
		/>
		<ThemeOptionCard
			id="category_5"
			title="Category 5"
			schematicType="category"
			selected={selectedCategory === 'category_5'}
			onSelect={() => (selectedCategory = 'category_5')}
			onPreview={() => openPreview('category', 'category_5', 'Category 5 (Compact Icon Strip)')}
		/>
		<ThemeOptionCard
			id="category_6"
			title="Category 6"
			schematicType="category"
			selected={selectedCategory === 'category_6'}
			onSelect={() => (selectedCategory = 'category_6')}
			onPreview={() => openPreview('category', 'category_6', 'Category 6 (Bento Grid Categories)')}
		/>
		<ThemeOptionCard
			id="category_7"
			title="Category 7"
			schematicType="category"
			selected={selectedCategory === 'category_7'}
			onSelect={() => (selectedCategory = 'category_7')}
			onPreview={() => openPreview('category', 'category_7', 'Category 7 (Sidebar Category Explorer)')}
		/>
	</ThemeSectionContainer>

	<!-- 4. Product Section (Multiple Select) -->
	<ThemeSectionContainer
		title="Product Section"
		selectionMode="MULTIPLE SELECT"
		sectionTag="PRODUCTVIEWS"
	>
		<ThemeOptionCard
			id="tag"
			title="Tag"
			isMultiSelect={true}
			isDefault={true}
			schematicType="product_card"
			selected={selectedProductSections.includes('tag')}
			onSelect={() => toggleProductSection('tag')}
			onPreview={() => openPreview('product_section', 'tag', 'Tag (ক্যাটাগরি ট্যাব প্রোডাক্ট সেকশন)')}
		/>
		<ThemeOptionCard
			id="flash_deals"
			title="Flash Deals"
			isMultiSelect={true}
			schematicType="product_card"
			selected={selectedProductSections.includes('flash_deals')}
			onSelect={() => toggleProductSection('flash_deals')}
			onPreview={() => openPreview('product_section', 'flash_deals', 'Flash Deals (কাউন্টডাউন সহ স্পেশাল ডিল)')}
		/>
		<ThemeOptionCard
			id="trending"
			title="Trending Products"
			isMultiSelect={true}
			schematicType="product_card"
			selected={selectedProductSections.includes('trending')}
			onSelect={() => toggleProductSection('trending')}
			onPreview={() => openPreview('product_section', 'trending', 'Trending Products (হট ট্রেন্ডিং প্রোডাক্টস)')}
		/>
	</ThemeSectionContainer>

	<!-- 5. Product Card Section -->
	<ThemeSectionContainer
		title="Product Card"
		selectionMode="SINGLE SELECT"
		sectionTag="PRODUCTCARDVIEWS"
	>
		<ThemeOptionCard
			id="product_card_1"
			title="Product Card 1"
			schematicType="product_card"
			selected={selectedProductCard === 'product_card_1'}
			onSelect={() => (selectedProductCard = 'product_card_1')}
			onPreview={() => openPreview('product_card', 'product_card_1', 'Product Card 1 (Classic Clean)')}
		/>
		<ThemeOptionCard
			id="product_card_2"
			title="Product Card 2"
			schematicType="product_card"
			selected={selectedProductCard === 'product_card_2'}
			onSelect={() => (selectedProductCard = 'product_card_2')}
			onPreview={() => openPreview('product_card', 'product_card_2', 'Product Card 2 (Minimal Borderless)')}
		/>
		<ThemeOptionCard
			id="product_card_3"
			title="Product Card 3"
			isDefault={true}
			schematicType="product_card"
			selected={selectedProductCard === 'product_card_3'}
			onSelect={() => (selectedProductCard = 'product_card_3')}
			onPreview={() => openPreview('product_card', 'product_card_3', 'Product Card 3 (High Conversion Standard)')}
		/>
		<ThemeOptionCard
			id="product_card_4"
			title="Product Card 4"
			schematicType="product_card"
			selected={selectedProductCard === 'product_card_4'}
			onSelect={() => (selectedProductCard = 'product_card_4')}
			onPreview={() => openPreview('product_card', 'product_card_4', 'Product Card 4 (Compact Horizontal)')}
		/>
		<ThemeOptionCard
			id="product_card_5"
			title="Product Card 5"
			schematicType="product_card"
			selected={selectedProductCard === 'product_card_5'}
			onSelect={() => (selectedProductCard = 'product_card_5')}
			onPreview={() => openPreview('product_card', 'product_card_5', 'Product Card 5 (Badge Accent)')}
		/>
		<ThemeOptionCard
			id="product_card_6"
			title="Product Card 6"
			schematicType="product_card"
			selected={selectedProductCard === 'product_card_6'}
			onSelect={() => (selectedProductCard = 'product_card_6')}
			onPreview={() => openPreview('product_card', 'product_card_6', 'Product Card 6 (Action Overlay)')}
		/>
	</ThemeSectionContainer>

	<!-- 6. Bottom Nav Section -->
	<ThemeSectionContainer
		title="Bottom Nav"
		selectionMode="SINGLE SELECT"
		sectionTag="BOTTOMNAVVIEWS"
	>
		<ThemeOptionCard
			id="bottom_nav_1"
			title="Bottom Nav 1"
			isDefault={true}
			schematicType="bottom_nav"
			selected={selectedBottomNav === 'bottom_nav_1'}
			onSelect={() => (selectedBottomNav = 'bottom_nav_1')}
			onPreview={() => openPreview('bottom_nav', 'bottom_nav_1', 'Bottom Nav 1 (Classic Fixed Bar)')}
		/>
		<ThemeOptionCard
			id="bottom_nav_2"
			title="Bottom Nav 2"
			schematicType="bottom_nav"
			selected={selectedBottomNav === 'bottom_nav_2'}
			onSelect={() => (selectedBottomNav = 'bottom_nav_2')}
			onPreview={() => openPreview('bottom_nav', 'bottom_nav_2', 'Bottom Nav 2 (Floating Pill Island)')}
		/>
		<ThemeOptionCard
			id="bottom_nav_3"
			title="Bottom Nav 3"
			schematicType="bottom_nav"
			selected={selectedBottomNav === 'bottom_nav_3'}
			onSelect={() => (selectedBottomNav = 'bottom_nav_3')}
			onPreview={() => openPreview('bottom_nav', 'bottom_nav_3', 'Bottom Nav 3 (Elevated Center Cart)')}
		/>
		<ThemeOptionCard
			id="bottom_nav_4"
			title="Bottom Nav 4"
			schematicType="bottom_nav"
			selected={selectedBottomNav === 'bottom_nav_4'}
			onSelect={() => (selectedBottomNav = 'bottom_nav_4')}
			onPreview={() => openPreview('bottom_nav', 'bottom_nav_4', 'Bottom Nav 4 (Minimal Icon Strip)')}
		/>
		<ThemeOptionCard
			id="bottom_nav_5"
			title="Bottom Nav 5"
			schematicType="bottom_nav"
			selected={selectedBottomNav === 'bottom_nav_5'}
			onSelect={() => (selectedBottomNav = 'bottom_nav_5')}
			onPreview={() => openPreview('bottom_nav', 'bottom_nav_5', 'Bottom Nav 5 (Quick Cart & Action Bar)')}
		/>
	</ThemeSectionContainer>

	<!-- 7. Footer Section -->
	<ThemeSectionContainer
		title="Footer Section"
		selectionMode="SINGLE SELECT"
		sectionTag="FOOTERVIEWS"
	>
		<ThemeOptionCard
			id="footer_1"
			title="Footer 1"
			isDefault={true}
			schematicType="footer"
			selected={selectedFooter === 'footer_1'}
			onSelect={() => (selectedFooter = 'footer_1')}
			onPreview={() => openPreview('footer', 'footer_1', 'Footer 1 (Classic Corporate Mega)')}
		/>
		<ThemeOptionCard
			id="footer_2"
			title="Footer 2"
			schematicType="footer"
			selected={selectedFooter === 'footer_2'}
			onSelect={() => (selectedFooter = 'footer_2')}
			onPreview={() => openPreview('footer', 'footer_2', 'Footer 2 (Modern Dark)')}
		/>
		<ThemeOptionCard
			id="footer_3"
			title="Footer 3"
			schematicType="footer"
			selected={selectedFooter === 'footer_3'}
			onSelect={() => (selectedFooter = 'footer_3')}
			onPreview={() => openPreview('footer', 'footer_3', 'Footer 3 (Trust Grid E-Commerce)')}
		/>
		<ThemeOptionCard
			id="footer_4"
			title="Footer 4"
			schematicType="footer"
			selected={selectedFooter === 'footer_4'}
			onSelect={() => (selectedFooter = 'footer_4')}
			onPreview={() => openPreview('footer', 'footer_4', 'Footer 4 (Centered Boutique)')}
		/>
		<ThemeOptionCard
			id="footer_5"
			title="Footer 5"
			schematicType="footer"
			selected={selectedFooter === 'footer_5'}
			onSelect={() => (selectedFooter = 'footer_5')}
			onPreview={() => openPreview('footer', 'footer_5', 'Footer 5 (App Download Hero)')}
		/>
		<ThemeOptionCard
			id="footer_7"
			title="Footer 7"
			schematicType="footer"
			selected={selectedFooter === 'footer_7'}
			onSelect={() => (selectedFooter = 'footer_7')}
			onPreview={() => openPreview('footer', 'footer_7', 'Footer 7 (Compact Quick Strip)')}
		/>
	</ThemeSectionContainer>
</form>

<!-- Single Reusable Universal Component Preview Modal -->
<ThemeComponentPreviewModal
	isOpen={isPreviewOpen}
	title={previewTitle}
	isActive={
		previewType === 'header'
			? selectedHeader === previewId
			: previewType === 'footer'
				? selectedFooter === previewId
				: previewType === 'showcase'
					? selectedShowcase === previewId
					: previewType === 'category'
						? selectedCategory === previewId
						: previewType === 'product_section'
							? selectedProductSections.includes(previewId)
							: previewType === 'product_card'
								? selectedProductCard === previewId
								: selectedBottomNav === previewId
	}
	activateLabel={
		previewType === 'header'
			? 'এই হেডারটি অ্যাক্টিভ করুন'
			: previewType === 'footer'
				? 'এই ফুটারটি অ্যাক্টিভ করুন'
				: previewType === 'showcase'
					? 'এই শোকেসটি অ্যাক্টিভ করুন'
					: previewType === 'category'
						? 'এই ক্যাটাগরি লেআউট সক্রিয় করুন'
						: previewType === 'product_section'
							? 'এই প্রোডাক্ট সেকশন যুক্ত করুন'
							: previewType === 'product_card'
								? 'এই প্রোডাক্ট কার্ড স্টাইল সক্রিয় করুন'
								: 'এই বটম ন্যাভ সক্রিয় করুন'
	}
	defaultViewport={previewType === 'bottom_nav' ? 'mobile' : 'desktop'}
	onClose={() => (isPreviewOpen = false)}
	onActivate={() => {
		if (previewType === 'header') {
			selectedHeader = previewId;
			toast.success(`"${previewTitle}" হেডার নির্বাচন করা হয়েছে! পরিবর্তন নিশ্চিত করতে উপরের "Save Settings" বাটনে চাপুন।`);
		} else if (previewType === 'footer') {
			selectedFooter = previewId;
			toast.success(`"${previewTitle}" ফুটার নির্বাচন করা হয়েছে! পরিবর্তন নিশ্চিত করতে উপরের "Save Settings" বাটনে চাপুন।`);
		} else if (previewType === 'showcase') {
			selectedShowcase = previewId;
			toast.success(`"${previewTitle}" শোকেস নির্বাচন করা হয়েছে!`);
		} else if (previewType === 'category') {
			selectedCategory = previewId;
			toast.success(`"${previewTitle}" ক্যাটাগরি ভিউ নির্বাচন করা হয়েছে!`);
		} else if (previewType === 'product_section') {
			if (!selectedProductSections.includes(previewId)) {
				selectedProductSections = [...selectedProductSections, previewId];
				toast.success(`"${previewTitle}" সেকশনটি অন্তর্ভুক্ত করা হয়েছে!`);
			}
		} else if (previewType === 'product_card') {
			selectedProductCard = previewId;
			toast.success(`"${previewTitle}" কার্ড স্টাইল নির্বাচন করা হয়েছে!`);
		} else if (previewType === 'bottom_nav') {
			selectedBottomNav = previewId;
			toast.success(`"${previewTitle}" বটম ন্যাভিগেশন নির্বাচন করা হয়েছে!`);
		}
	}}
>
	{#if previewType === 'header'}
		<!-- 1. Live Header Render -->
		<DynamicHeader activeHeader={previewId} />
		<!-- Simulated Body Content Below Header -->
		<div class="p-8 bg-slate-50 border-t border-slate-200/60 text-center min-h-[260px] flex flex-col items-center justify-center">
			<span class="text-xs font-bold text-slate-400 uppercase tracking-widest">--- স্টোরফ্রন্ট কন্টেন্ট বডি ---</span>
		</div>
	{:else if previewType === 'footer'}
		<!-- 2. Simulated Body Content Above Footer -->
		<div class="p-6 bg-slate-50 border-b border-slate-200/60 text-center">
			<span class="text-xs font-bold text-slate-400 uppercase tracking-widest">--- স্টোরফ্রন্ট কন্টেন্ট বডি ---</span>
		</div>
		<!-- Live Footer Render -->
		<DynamicFooter activeFooter={previewId} />
	{:else if previewType === 'showcase'}
		<!-- 3. Live Showcase Render -->
		<DynamicShowcase activeShowcase={previewId} carousels={data?.themeConfig?.carousels || []} />
	{:else if previewType === 'category'}
		<!-- 4. Live Category View Render -->
		{#if previewId === 'none'}
			<div class="p-12 text-center bg-slate-50 border border-slate-200/80 rounded-2xl m-4">
				<div class="w-12 h-12 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center mb-3">
					<Tag class="w-6 h-6" />
				</div>
				<h4 class="text-sm font-bold text-slate-800">ক্যাটাগরি সেকশন নিষ্ক্রিয় (None)</h4>
				<p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
					হোমপেজে কোনো ক্যাটাগরি গ্রিড প্রদর্শিত হবে না। ব্যানার শোকেসের নিচেই সরাসরি প্রোডাক্ট সেকশন শুরু হবে।
				</p>
			</div>
		{:else}
			<DynamicCategoryView activeCategory={previewId} categories={CATEGORIES_DATA} />
		{/if}
	{:else if previewType === 'product_section'}
		<!-- 5. Live Product Section Preview -->
		<div class="p-4 sm:p-8 bg-slate-50/60">
			{#if previewId === 'flash_deals'}
				<div class="bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl p-5 sm:p-6 text-white mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
							<Flame class="w-5 h-5 text-amber-300" />
						</div>
						<div>
							<h3 class="text-lg sm:text-xl font-black">ফ্ল্যাশ ডিলস (সীমিত সময়)</h3>
							<p class="text-xs text-rose-100">আজকের বিশেষ ডিসকাউন্ট প্রোডাক্টগুলো লুফে নিন</p>
						</div>
					</div>
					<div class="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-2xl text-xs font-mono font-bold self-start sm:self-auto">
						<Clock class="w-4 h-4 text-amber-300" />
						<span>০৫ ঘণ্টা : ৪২ মিনিট : ১৮ সেকেন্ড</span>
					</div>
				</div>
			{:else if previewId === 'trending'}
				<div class="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
					<div class="flex items-center gap-2.5">
						<div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
							<Sparkles class="w-5 h-5" />
						</div>
						<div>
							<h3 class="text-lg sm:text-xl font-black text-slate-900">ট্রেন্ডিং ও সর্বাধিক বিক্রিত পণ্য</h3>
							<p class="text-xs text-slate-500">গ্রাহকদের সবচেয়ে পছন্দের সেরা আইটেমসমূহ</p>
						</div>
					</div>
					<span class="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
						সব দেখুন <ArrowRight class="w-3.5 h-3.5" />
					</span>
				</div>
			{:else}
				<div class="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
					<div class="flex items-center gap-2">
						<span class="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">সকল পণ্য</span>
						<span class="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">ইলেকট্রনিক্স</span>
						<span class="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">বিউটি</span>
					</div>
				</div>
			{/if}

			<!-- Grid of 4 Sample Cards -->
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
				{#each sampleProducts as prod}
					<DynamicProductCard product={prod} activeCard={selectedProductCard} />
				{/each}
			</div>
		</div>
	{:else if previewType === 'product_card'}
		<!-- 6. Live Product Card Grid Preview -->
		<div class="p-5 sm:p-8 bg-slate-50/70">
			<div class="mb-5 flex items-center justify-between">
				<div>
					<h4 class="text-sm sm:text-base font-black text-slate-900">
						"{previewTitle}" প্রিভিউ
					</h4>
					<p class="text-xs text-slate-500">
						হোমপেজ ও ক্যাটালগ গ্রিডে কার্ডটি যেভাবে প্রদর্শিত হবে:
					</p>
				</div>
				<span class="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
					৪টি ডেমো প্রোডাক্ট গ্রিড
				</span>
			</div>
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
				{#each sampleProducts as prod}
					<DynamicProductCard product={prod} activeCard={previewId} />
				{/each}
			</div>
		</div>
	{:else if previewType === 'bottom_nav'}
		<!-- 7. Live Bottom Nav Mobile Frame Mockup Preview -->
		<div class="relative w-full min-h-[380px] bg-slate-50 flex flex-col justify-between p-4">
			<!-- Simulated Mobile Screen Header -->
			<div class="bg-white rounded-2xl p-3 shadow-2xs border border-slate-200/80 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="w-6 h-6 rounded-lg bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
						A
					</div>
					<span class="text-xs font-bold text-slate-800">AURA Store</span>
				</div>
				<span class="text-[10px] font-bold text-slate-400">Mobile View</span>
			</div>

			<!-- Simulated Mobile Screen Content -->
			<div class="py-6 space-y-3">
				<div class="h-24 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 p-4 flex flex-col justify-center">
					<span class="text-xs font-bold text-slate-700">স্টোরফ্রন্ট মোবাইল প্রিভিউ</span>
					<span class="text-[10px] text-slate-500">নিচে নির্বাচিত বটম ন্যাভিগেশন বারটি দেখুন</span>
				</div>
				<div class="grid grid-cols-2 gap-2">
					<div class="h-20 rounded-xl bg-slate-200/60"></div>
					<div class="h-20 rounded-xl bg-slate-200/60"></div>
				</div>
			</div>

			<!-- Docked Bottom Nav Component -->
			<div class="pt-2">
				<DynamicBottomNav activeBottomNav={previewId} isStandalonePreview={true} />
			</div>
		</div>
	{/if}
</ThemeComponentPreviewModal>
