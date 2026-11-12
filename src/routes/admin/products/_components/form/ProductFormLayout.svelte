<script lang="ts">
	import { goto } from '$app/navigation';
	import { Check, ArrowLeft, Save, AlertCircle, Sparkles } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { submitAction } from '#lib/client/submit-action';
	import { confirmModal } from '#lib/stores/confirm.svelte';
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
		brands?: string[];
	}

	let {
		initialProduct = null,
		isEditMode = false,
		existingGallery = [],
		taxonomyTree = [],
		brands = []
	}: Props = $props();

	// The first category in the store is a visible starting point, never a hidden demo value.
	const firstCategory = taxonomyTree?.[0]?.name ?? '';

	// Form State
	let name = $state(initialProduct?.name || '');
	let slug = $state(initialProduct?.slug || '');
	let autoSlug = $state(!initialProduct?.slug);
	let isPreOrder = $state(initialProduct?.isPreOrder || false);
	let enableBundle = $state(initialProduct?.enableBundle || false);
	let bundleUnitLabel = $state(initialProduct?.bundleUnitLabel || '');
	let description = $state(initialProduct?.description || '');

	// Price & Stock
	let regularPrice = $state(initialProduct?.originalPrice || 0);
	let salesPrice = $state(initialProduct?.price || 0);
	let costPrice = $state(initialProduct?.costPrice || 0);
	let stockValue = $state(0);
	let lowStockQty = $state(initialProduct?.lowStockQty ?? 5);
	let openingStock = $state(initialProduct?.openingStock ?? 0);
	// Stock on hand now. Only sent to the server when the admin really changed it.
	const initialStock = initialProduct?.stock ?? 0;
	let currentStock = $state(initialStock);
	let sku = $state(initialProduct?.sku || '');
	let isWholesale = $state(initialProduct?.isWholesale || false);

	// Low Stock / Urgency
	let urgencyMessage = $state(initialProduct?.urgencyMessage || '');

	// Processing Charges
	let enableProcessing = $state(initialProduct?.enableProcessing || false);
	let processingOptions = $state<string[]>(initialProduct?.processingOptions || []);

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
	let image = $state(initialProduct?.image || '');
	let images = $state<string[]>(initialProduct?.images || (initialProduct?.image ? [initialProduct.image] : []));

	// Category & Status
	let category = $state(initialProduct?.category || firstCategory);
	let subCategory = $state(initialProduct?.subCategory || '');
	let childCategory = $state(initialProduct?.childCategory || '');
	let status = $state<'published' | 'draft'>(initialProduct?.status || 'published');
	let badge = $state<string | null>(initialProduct?.badge ?? null);
	let sizeChartImage = $state(initialProduct?.sizeChartImage || '');

	// UI Feedback States
	let isSaving = $state(false);
	let validationError = $state<string | null>(null);

	const hasVariants = $derived(variants.length > 0);
	const variantStockTotal = $derived(variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0));

	// With variants the product's stock is their sum, so the field follows it.
	$effect(() => {
		if (hasVariants) currentStock = variantStockTotal;
	});

	function fail(message: string, scrollTo = 0) {
		validationError = message;
		window.scrollTo({ top: scrollTo, behavior: 'smooth' });
	}

	async function handleSubmit() {
		validationError = null;

		if (!name.trim()) return fail('প্রোডাক্টের নাম (Product Name) অবশ্যই প্রদান করতে হবে।');
		if (!salesPrice || salesPrice <= 0) {
			return fail('প্রোডাক্টের বিক্রয় মূল্য (Sales Price) অবশ্যই দিতে হবে।', 300);
		}
		if (Number(regularPrice) > 0 && Number(regularPrice) < Number(salesPrice)) {
			return fail('রেগুলার মূল্য বিক্রয় মূল্যের কম হতে পারে না।', 300);
		}
		if (!image && images.length === 0) {
			return fail('কমপক্ষে একটি প্রোডাক্ট ছবি যোগ করুন।');
		}

		// A product with no stock cannot be ordered, so confirm before saving that by accident.
		const stockWillBeZero = isEditMode
			? hasVariants
				? variantStockTotal === 0
				: Number(currentStock) !== initialStock && Number(currentStock) === 0
			: !hasVariants && Number(openingStock) === 0;
		if (stockWillBeZero && !isPreOrder) {
			const confirmed = await confirmModal({
				title: 'স্টক ০',
				message: 'স্টক ০ থাকলে প্রোডাক্টটি স্টকআউট দেখাবে এবং অর্ডার নেওয়া যাবে না। তবুও সেভ করবেন?',
				confirmText: 'হ্যাঁ, সেভ করুন',
				variant: 'warning',
				icon: 'alert'
			});
			if (!confirmed) return;
		}

		isSaving = true;

		const productData = {
			name: name.trim(),
			slug: slug.trim(),
			tagline: initialProduct?.tagline || name.trim(),
			price: Number(salesPrice),
			originalPrice: Number(regularPrice) || Number(salesPrice),
			costPrice: Number(costPrice) || 0,
			lowStockQty: Number(lowStockQty) || 0,
			openingStock: Number(openingStock) || 0,
			// Create: the server starts stock at the opening stock. Edit: only a real change is sent.
			...(isEditMode && (hasVariants || Number(currentStock) !== initialStock)
				? { stock: Number(currentStock) || 0 }
				: {}),
			sku: sku.trim(),
			image: image || images[0],
			images,
			category,
			subCategory,
			childCategory,
			brand,
			model,
			badge,
			description,
			status,
			isPreOrder,
			enableBundle,
			bundleUnitLabel: bundleUnitLabel.trim(),
			isWholesale,
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

		const fd = new FormData();
		fd.append('productData', JSON.stringify(productData));

		const result = await submitAction(
			isEditMode ? '?/updateProduct' : '?/createProduct',
			fd,
			'প্রোডাক্ট সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
		);
		isSaving = false;

		if (!result.ok) {
			validationError = result.message;
			toast.error(result.message);
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}

		toast.success(
			isEditMode ? 'প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!' : 'নতুন প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে!'
		);
		await goto('/admin/products', { invalidateAll: true });
	}
</script>

<div class="space-y-6 max-w-7xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- 1. Top Header & Action Bar -->
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

	<!-- 2. Product Listing Instructions Banner -->
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
		<div role="alert" class="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-3 text-xs text-rose-700 font-bold animate-in fade-in">
			<AlertCircle class="w-4 h-4 text-rose-500 shrink-0" />
			<span>{validationError}</span>
		</div>
	{/if}

	<!-- 3. Main Form Grid (2 Columns) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left Column -->
		<div class="lg:col-span-8 space-y-6">
			<GeneralInfoCard
				bind:name
				bind:slug
				bind:autoSlug
				bind:isPreOrder
				bind:enableBundle
				bind:bundleUnitLabel
				bind:description
			/>

			<PricingStockCard
				bind:regularPrice
				bind:salesPrice
				bind:costPrice
				bind:stockValue
				bind:lowStockQty
				bind:openingStock
				bind:currentStock
				showCurrentStock={isEditMode}
				stockLocked={hasVariants}
				bind:sku
				bind:isWholesale
			/>

			<LowStockUrgencyCard bind:urgencyMessage />

			<ProcessingChargesCard
				bind:enableProcessing
				bind:processingOptions
			/>

			<SpecificationsCard
				bind:brand
				bind:model
				bind:specifications
				{brands}
			/>

			<VariantsCard
				bind:variants
				defaultPrice={salesPrice}
			/>

			<SeoPolicyCard
				bind:seoTitle
				bind:seoDescription
				bind:seoKeywords
				bind:returnPolicy
				productName={name}
				productSlug={slug}
			/>
		</div>

		<!-- Right Column (Sticky) -->
		<div class="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
			<MediaAssetsCard
				bind:image
				bind:images
				{existingGallery}
			/>

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
					class="flex-1 py-2.5 rounded-xl bg-[#5845eb] text-white text-xs font-bold hover:bg-[#4834d4] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
				>
					<Save class="w-4 h-4" />
					<span>{isEditMode ? 'Update' : 'Save Product'}</span>
				</button>
			</div>
		</div>
	</div>
</div>
