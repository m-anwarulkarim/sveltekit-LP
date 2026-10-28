<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Check,
		ArrowLeft,
		Headphones,
		Save,
		Eye,
		AlertCircle,
		Sparkles,
		CheckCircle2
	} from 'lucide-svelte';
	import type { AdminProduct } from '../../../_data';
	import GeneralInfoCard from './GeneralInfoCard.svelte';
	import PricingStockCard from './PricingStockCard.svelte';
	import LowStockUrgencyCard from './LowStockUrgencyCard.svelte';
	import ProcessingChargesCard from './ProcessingChargesCard.svelte';
	import SpecificationsCard from './SpecificationsCard.svelte';
	import VariantsCard from './VariantsCard.svelte';
	import SeoPolicyCard from './SeoPolicyCard.svelte';
	import MediaAssetsCard from './MediaAssetsCard.svelte';
	import CategoryStatusCard from './CategoryStatusCard.svelte';

	interface Props {
		initialProduct?: Partial<AdminProduct> | null;
		isEditMode?: boolean;
		existingGallery?: any[];
		taxonomyTree?: any[];
		onSave?: (product: AdminProduct) => void;
	}

	let {
		initialProduct = null,
		isEditMode = false,
		existingGallery = [],
		taxonomyTree = [],
		onSave
	}: Props = $props();

	// Form State
	let name = $state(initialProduct?.name || '');
	let slug = $state(initialProduct?.slug || '');
	let autoSlug = $state(!initialProduct?.slug);
	let isPreOrder = $state(initialProduct?.isPreOrder || false);
	let landingPageLink = $state(initialProduct?.landingPageLink || '');
	let description = $state(initialProduct?.description || '');

	// Price & Stock
	let regularPrice = $state(initialProduct?.originalPrice || 0);
	let salesPrice = $state(initialProduct?.price || 0);
	let costPrice = $state(initialProduct?.costPrice || 0);
	let stockValue = $state(initialProduct?.stockValue || 0);
	let lowStockQty = $state(initialProduct?.lowStockQty || 50);
	let openingStock = $state(initialProduct?.openingStock || 50000);
	let sku = $state(initialProduct?.sku || '');
	let isWholesale = $state(initialProduct?.isWholesale || false);

	// Low Stock / Urgency
	let urgencyMessage = $state(initialProduct?.urgencyMessage || '');

	// Processing Charges
	let enableProcessing = $state(initialProduct?.enableProcessing || false);
	let processingOptions = $state(
		initialProduct?.processingOptions || ['Ready to Cook', 'Semi Cooked', 'Asto / Whole']
	);

	// Specifications
	let brand = $state(initialProduct?.brand || '');
	let model = $state(initialProduct?.model || '');
	let specifications = $state(initialProduct?.specifications || []);

	// Multi-Variants
	let variants = $state(initialProduct?.variants || []);

	// SEO
	let seoTitle = $state(initialProduct?.seoTitle || '');
	let seoDescription = $state(initialProduct?.seoDescription || '');
	let seoKeywords = $state(initialProduct?.seoKeywords || '');
	let returnPolicy = $state(initialProduct?.returnPolicy || '');

	// Media Assets
	let image = $state(initialProduct?.image || '/images/products/soundcore.svg');
	let images = $state(initialProduct?.images || [
		initialProduct?.image || '/images/products/soundcore.svg',
		'/images/products/trimmer.svg',
		'/images/products/kirkland.svg'
	]);

	// Category & Status
	let category = $state(initialProduct?.category || 'Audio');
	let subCategory = $state(initialProduct?.subCategory || 'Earphones');
	let childCategory = $state(initialProduct?.childCategory || '');
	let status = $state<'published' | 'draft'>(initialProduct?.status || 'published');
	let badge = $state<string | null>(initialProduct?.badge || 'Bestseller');
	let sizeChartImage = $state(initialProduct?.sizeChartImage || '');

	// UI Feedback States
	let isSaving = $state(false);
	let toastMessage = $state<string | null>(null);
	let validationError = $state<string | null>(null);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			toastMessage = null;
		}, 3500);
	}

	async function handleSubmit() {
		validationError = null;

		if (!name.trim()) {
			validationError = 'প্রোডাক্টের নাম (Product Name) অবশ্যই প্রদান করতে হবে।';
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}

		if (!salesPrice || salesPrice <= 0) {
			validationError = 'প্রোডাক্টের বিক্রয় মূল্য (Sales Price) অবশ্যই দিতে হবে।';
			window.scrollTo({ top: 300, behavior: 'smooth' });
			return;
		}

		isSaving = true;

		const productData: AdminProduct = {
			id: initialProduct?.id || `prod-${Date.now()}`,
			name: name.trim(),
			slug: slug || name.toLowerCase().replace(/[\s\W-]+/g, '-'),
			tagline: initialProduct?.tagline || name.trim(),
			price: Number(salesPrice),
			originalPrice: Number(regularPrice) || Number(salesPrice),
			costPrice: Number(costPrice),
			stockValue: Number(stockValue),
			lowStockQty: Number(lowStockQty),
			openingStock: Number(openingStock),
			stock: variants.length > 0 ? variants.reduce((sum, v) => sum + (v.stock || 0), 0) : Number(openingStock),
			sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
			rating: initialProduct?.rating || 48,
			reviewsCount: initialProduct?.reviewsCount || 1,
			image: image || images[0] || '/images/products/soundcore.svg',
			images,
			category,
			subCategory,
			childCategory,
			brand,
			model,
			badge,
			inStock: Number(openingStock) > 0,
			description,
			status,
			priority: initialProduct?.priority || '1',
			isPreOrder,
			isWholesale,
			landingPageLink,
			urgencyMessage,
			enableProcessing,
			processingOptions,
			specifications,
			variants,
			seoTitle,
			seoDescription,
			seoKeywords,
			returnPolicy,
			sizeChartImage
		};

		try {
			const actionUrl = isEditMode ? '?/updateProduct' : '?/createProduct';
			const fd = new FormData();
			fd.append('productData', JSON.stringify(productData));

			const res = await fetch(actionUrl, {
				method: 'POST',
				body: fd
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData?.message || 'প্রোডাক্ট সেভ করতে সমস্যা হয়েছে');
			}

			if (onSave) {
				onSave(productData);
			}
			showToast(isEditMode ? 'প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!' : 'নতুন প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে!');

			setTimeout(() => {
				goto('/admin/products');
			}, 1000);
		} catch (err: any) {
			console.error('Save product error:', err);
			showToast(err?.message || 'প্রোডাক্ট সেভ করতে সমস্যা হয়েছে');
		} finally {
			isSaving = false;
		}
	}
</script>

<!-- Toast Notification -->
{#if toastMessage}
	<div class="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4 duration-300">
		<CheckCircle2 class="w-5 h-5 text-emerald-400" />
		<span class="text-sm font-semibold">{toastMessage}</span>
	</div>
{/if}

<div class="space-y-6 max-w-7xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- 1. Top Header & Action Bar matching Screenshot 1 -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
		<div class="flex items-center gap-3">
			<a
				href="/admin/products"
				class="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
				title="Back to Products"
			>
				<ArrowLeft class="w-5 h-5" />
			</a>
			<div>
				<h1 class="text-2xl font-black text-slate-900 tracking-tight">
					{isEditMode ? 'Update Product' : 'New Product'}
				</h1>
				<p class="text-xs text-slate-500 font-medium">
					{isEditMode ? 'প্রোডাক্টের বিবরণ ও তথ্য হালনাগাদ করুন' : 'আপনার স্টোরে নতুন প্রোডাক্ট যুক্ত করুন'}
				</p>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex items-center gap-2.5">
			<!-- Support Button matching screenshot -->
			<button
				type="button"
				class="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5845eb] text-white text-xs font-bold hover:bg-[#4834d4] transition-colors cursor-pointer shadow-xs"
			>
				<Headphones class="w-4 h-4" />
				<span>Support</span>
			</button>

			<!-- Quick Status Toggle -->
			<div class="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
				<button
					type="button"
					onclick={() => (status = 'published')}
					class="px-3 py-1.5 rounded-lg transition-all cursor-pointer {status === 'published' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'}"
				>
					Publish
				</button>
				<button
					type="button"
					onclick={() => (status = 'draft')}
					class="px-3 py-1.5 rounded-lg transition-all cursor-pointer {status === 'draft' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}"
				>
					Draft
				</button>
			</div>

			<!-- Main Action Button matching Screenshot 1 (Purple Pill) -->
			<button
				type="button"
				onclick={handleSubmit}
				disabled={isSaving}
				class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5845eb] hover:bg-[#4834d4] text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
			>
				{#if isSaving}
					<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
					<span>Saving...</span>
				{:else}
					<Check class="w-4 h-4" />
					<span>{isEditMode ? 'Update Product' : 'Save Product'}</span>
				{/if}
			</button>
		</div>
	</div>

	<!-- 2. Product Listing Instructions Banner matching Screenshot 1 -->
	<div class="p-4 bg-blue-50/60 rounded-2xl border border-blue-100/90 flex items-start gap-3 text-slate-700">
		<div class="p-1 rounded-full bg-blue-100 text-blue-600 shrink-0 mt-0.5">
			<Sparkles class="w-4 h-4" />
		</div>
		<div class="text-xs">
			<h3 class="font-bold text-slate-900">Product Listing Instructions</h3>
			<p class="text-slate-600 font-medium">
				Only <span class="text-rose-500 font-bold">*</span> marked field is required. Other fields you can add as needed.
			</p>
		</div>
	</div>

	<!-- Validation Error Alert if any -->
	{#if validationError}
		<div class="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-3 text-xs text-rose-700 font-bold animate-in fade-in">
			<AlertCircle class="w-4 h-4 text-rose-500 shrink-0" />
			<span>{validationError}</span>
		</div>
	{/if}

	<!-- 3. Main Form Grid (2 Columns) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left Column (68% - 8 cols) -->
		<div class="lg:col-span-8 space-y-6">
			<!-- 1. General Information -->
			<GeneralInfoCard
				bind:name
				bind:slug
				bind:autoSlug
				bind:isPreOrder
				bind:landingPageLink
				bind:description
			/>

			<!-- 2. Price And Stock -->
			<PricingStockCard
				bind:regularPrice
				bind:salesPrice
				bind:costPrice
				bind:stockValue
				bind:lowStockQty
				bind:openingStock
				bind:sku
				bind:isWholesale
			/>

			<!-- 3. Low Stock / Urgency Message -->
			<LowStockUrgencyCard bind:urgencyMessage />

			<!-- 4. Processing Charges -->
			<ProcessingChargesCard
				bind:enableProcessing
				bind:processingOptions
			/>

			<!-- 5. Product Specification & Others Spec -->
			<SpecificationsCard
				bind:brand
				bind:model
				bind:specifications
			/>

			<!-- 6. Multi-Variant Management -->
			<VariantsCard
				bind:variants
				defaultPrice={salesPrice}
			/>

			<!-- 7. SEO & Return Policy -->
			<SeoPolicyCard
				bind:seoTitle
				bind:seoDescription
				bind:seoKeywords
				bind:returnPolicy
				productName={name}
				productSlug={slug}
			/>
		</div>

		<!-- Right Column (32% - 4 cols, Sticky) -->
		<div class="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
			<!-- 1. Media Assets Gallery (Upload, Link & Gallery Picker) -->
			<MediaAssetsCard
				bind:image
				bind:images
				{existingGallery}
			/>

			<!-- 2. Category, Status & Badges -->
			<CategoryStatusCard
				bind:category
				bind:subCategory
				bind:childCategory
				bind:status
				bind:badge
				bind:sizeChartImage
				{taxonomyTree}
			/>

			<!-- Bottom Save Card on Mobile -->
			<div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
				<a
					href="/admin/products"
					class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
				>
					Cancel
				</a>
				<button
					type="button"
					onclick={handleSubmit}
					disabled={isSaving}
					class="flex-1 py-2.5 rounded-xl bg-[#5845eb] text-white text-xs font-bold hover:bg-[#4834d4] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
				>
					<Save class="w-4 h-4" />
					<span>{isEditMode ? 'Update' : 'Save Product'}</span>
				</button>
			</div>
		</div>
	</div>
</div>

