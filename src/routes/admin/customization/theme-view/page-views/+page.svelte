<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import ThemeSectionContainer from '../_components/ThemeSectionContainer.svelte';
	import ThemeOptionCard from '../_components/ThemeOptionCard.svelte';
	import ThemeComponentPreviewModal from '../_components/ThemeComponentPreviewModal.svelte';
	import {
		DynamicCheckout,
		DynamicProductDetails,
		DynamicCartView,
		DynamicOrderSuccess
	} from '#lib/modules/layout/page-views';

	let { data, form }: { data: any; form: any } = $props();

	// Reactive pageViews config from layout load
	let pageViews = $derived(
		data?.themeConfig?.pageViews || {
			checkout: 'checkout_2',
			productDetails: 'product_details_1',
			cartView: 'cart_view_1',
			orderSuccess: 'order_success_1'
		}
	);

	let selectedCheckout = $state(pageViews.checkout || 'checkout_2');
	let selectedProductDetails = $state(pageViews.productDetails || 'product_details_1');
	let selectedCartView = $state(pageViews.cartView || 'cart_view_1');
	let selectedOrderSuccess = $state(pageViews.orderSuccess || 'order_success_1');

	$effect(() => {
		if (pageViews) {
			selectedCheckout = pageViews.checkout || 'checkout_2';
			selectedProductDetails = pageViews.productDetails || 'product_details_1';
			selectedCartView = pageViews.cartView || 'cart_view_1';
			selectedOrderSuccess = pageViews.orderSuccess || 'order_success_1';
		}
	});

	// Universal Reusable Component Preview Modal State
	type PagePreviewType = 'checkout' | 'product_details' | 'cart_view' | 'order_success';
	let isPreviewOpen = $state(false);
	let previewType = $state<PagePreviewType>('checkout');
	let previewId = $state('checkout_2');
	let previewTitle = $state('Checkout 2');

	function openPreview(type: PagePreviewType, id: string, title: string) {
		previewType = type;
		previewId = id;
		previewTitle = title;
		isPreviewOpen = true;
	}

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
</script>

<svelte:head>
	<title>Page Views - Checkout & Page Layouts - AURA Admin</title>
</svelte:head>

<form
	method="POST"
	action="?/updatePageViews"
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
	<!-- Hidden form fields -->
	<input type="hidden" name="checkout" value={selectedCheckout} />
	<input type="hidden" name="productDetails" value={selectedProductDetails} />
	<input type="hidden" name="cartView" value={selectedCartView} />
	<input type="hidden" name="orderSuccess" value={selectedOrderSuccess} />

	<!-- 1. Checkout Page View Section -->
	<ThemeSectionContainer
		title="Checkout Page View"
		selectionMode="SINGLE SELECT"
		sectionTag="CHECKOUT"
	>
		<ThemeOptionCard
			id="checkout_1"
			title="Checkout 1"
			badgeText="LOGIN REQUIRED"
			badgeVariant="red"
			schematicType="checkout"
			selected={selectedCheckout === 'checkout_1'}
			onSelect={() => (selectedCheckout = 'checkout_1')}
			onPreview={() => openPreview('checkout', 'checkout_1', 'Checkout 1 (মেম্বার-ফার্স্ট সিকিউর চেকআউট)')}
		/>

		<ThemeOptionCard
			id="checkout_2"
			title="Checkout 2"
			isDefault={true}
			schematicType="checkout"
			selected={selectedCheckout === 'checkout_2'}
			onSelect={() => (selectedCheckout = 'checkout_2')}
			onPreview={() => openPreview('checkout', 'checkout_2', 'Checkout 2 (এক্সপ্রেস ওয়ান-পেজ ডাইরেক্ট চেকআউট)')}
		/>
	</ThemeSectionContainer>

	<!-- 2. Product Details Page View Section -->
	<ThemeSectionContainer
		title="Product Details View"
		selectionMode="SINGLE SELECT"
		sectionTag="PRODUCTDETAILS"
	>
		<ThemeOptionCard
			id="product_details_1"
			title="Product Details 1"
			isDefault={true}
			schematicType="product_card"
			selected={selectedProductDetails === 'product_details_1'}
			onSelect={() => (selectedProductDetails = 'product_details_1')}
			onPreview={() => openPreview('product_details', 'product_details_1', 'Product Details 1 (ক্লাসিক স্প্লিট বাই-বক্স)')}
		/>

		<ThemeOptionCard
			id="product_details_2"
			title="Product Details 2"
			badgeText="BOUTIQUE LUXURY"
			badgeVariant="blue"
			schematicType="product_card"
			selected={selectedProductDetails === 'product_details_2'}
			onSelect={() => (selectedProductDetails = 'product_details_2')}
			onPreview={() => openPreview('product_details', 'product_details_2', 'Product Details 2 (বুটিখ ইমারসিভ লাক্সারি)')}
		/>
	</ThemeSectionContainer>

	<!-- 3. Cart View Section -->
	<ThemeSectionContainer
		title="Cart View"
		selectionMode="SINGLE SELECT"
		sectionTag="CARTVIEWS"
	>
		<ThemeOptionCard
			id="cart_view_1"
			title="Cart View 1"
			isDefault={true}
			schematicType="product_card"
			selected={selectedCartView === 'cart_view_1'}
			onSelect={() => (selectedCartView = 'cart_view_1')}
			onPreview={() => openPreview('cart_view', 'cart_view_1', 'Cart View 1 (স্লাইড-আউট কুইক ড্রয়ার)')}
		/>

		<ThemeOptionCard
			id="cart_view_2"
			title="Cart View 2"
			badgeText="FULL PAGE"
			badgeVariant="gold"
			schematicType="product_card"
			selected={selectedCartView === 'cart_view_2'}
			onSelect={() => (selectedCartView = 'cart_view_2')}
			onPreview={() => openPreview('cart_view', 'cart_view_2', 'Cart View 2 (ফুল পেজ ডেডিকেটেড কার্ট টেবিল)')}
		/>
	</ThemeSectionContainer>

	<!-- 4. Order Confirmation / Thank You Section -->
	<ThemeSectionContainer
		title="Order Success View"
		selectionMode="SINGLE SELECT"
		sectionTag="ORDERSUCCESS"
	>
		<ThemeOptionCard
			id="order_success_1"
			title="Order Success 1"
			isDefault={true}
			schematicType="checkout"
			selected={selectedOrderSuccess === 'order_success_1'}
			onSelect={() => (selectedOrderSuccess = 'order_success_1')}
			onPreview={() => openPreview('order_success', 'order_success_1', 'Order Success 1 (ক্লিন প্রিন্টেবল ইনভয়েস)')}
		/>

		<ThemeOptionCard
			id="order_success_2"
			title="Order Success 2"
			badgeText="CELEBRATION"
			badgeVariant="blue"
			schematicType="checkout"
			selected={selectedOrderSuccess === 'order_success_2'}
			onSelect={() => (selectedOrderSuccess = 'order_success_2')}
			onPreview={() => openPreview('order_success', 'order_success_2', 'Order Success 2 (ভিজ্যুয়াল সেলিব্রেশন ও লাইভ ট্র্যাকিং)')}
		/>
	</ThemeSectionContainer>
</form>

<!-- Single Reusable Universal Component Preview Modal -->
<ThemeComponentPreviewModal
	isOpen={isPreviewOpen}
	title={previewTitle}
	isActive={
		previewType === 'checkout'
			? selectedCheckout === previewId
			: previewType === 'product_details'
				? selectedProductDetails === previewId
				: previewType === 'cart_view'
					? selectedCartView === previewId
					: selectedOrderSuccess === previewId
	}
	activateLabel="এই পেজ ভিউটি সক্রিয় করুন"
	defaultViewport="desktop"
	onClose={() => (isPreviewOpen = false)}
	onActivate={() => {
		if (previewType === 'checkout') {
			selectedCheckout = previewId;
			toast.success(`"${previewTitle}" চেকআউট স্টাইল নির্বাচন করা হয়েছে! পরিবর্তন সংরক্ষণ করতে "Save Settings" চাপুন।`);
		} else if (previewType === 'product_details') {
			selectedProductDetails = previewId;
			toast.success(`"${previewTitle}" প্রোডাক্ট ডিটেইলস স্টাইল নির্বাচন করা হয়েছে!`);
		} else if (previewType === 'cart_view') {
			selectedCartView = previewId;
			toast.success(`"${previewTitle}" কার্ট ভিউ স্টাইল নির্বাচন করা হয়েছে!`);
		} else if (previewType === 'order_success') {
			selectedOrderSuccess = previewId;
			toast.success(`"${previewTitle}" অর্ডার সাকসেস স্টাইল নির্বাচন করা হয়েছে!`);
		}
	}}
>
	{#if previewType === 'checkout'}
		<DynamicCheckout activeCheckout={previewId} isStandalonePreview={true} />
	{:else if previewType === 'product_details'}
		<DynamicProductDetails activeProductDetails={previewId} isStandalonePreview={true} />
	{:else if previewType === 'cart_view'}
		<DynamicCartView activeCartView={previewId} isStandalonePreview={true} />
	{:else if previewType === 'order_success'}
		<DynamicOrderSuccess activeOrderSuccess={previewId} isStandalonePreview={true} />
	{/if}
</ThemeComponentPreviewModal>
