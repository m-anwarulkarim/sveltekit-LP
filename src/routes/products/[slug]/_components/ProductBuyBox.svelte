<script lang="ts">
	import type { Product } from '#lib/modules/products/types.ts';
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { Button, Badge, Separator } from '#lib/components/ui';
	import {
		Star,
		Plus,
		Minus,
		ShoppingBag,
		Zap,
		ShieldCheck,
		RotateCcw,
		Truck,
		CheckCircle2,
		Phone,
		MessageCircle
	} from 'lucide-svelte';

	interface Props {
		product: Product;
		onBuyNow: () => void;
		productSettings?: any;
		storeConfig?: any;
	}

	let { product, onBuyNow, productSettings, storeConfig }: Props = $props();

	// Quantity state
	let quantity = $state(1);
	let isAdded = $state(false);

	// Dynamic variant definitions with actual price multipliers and discounts
	const variantOptions = [
		{
			id: 'standard',
			name: 'Standard Edition',
			subtitle: '১টি একক প্যাক',
			multiplier: 1,
			discount: 0
		},
		{
			id: 'combo',
			name: 'Combo Value Pack (Save 10%)',
			subtitle: '২টি প্যাক • ১০% অতিরিক্ত ছাড়',
			multiplier: 2,
			discount: 0.10
		},
		{
			id: 'pro-duo',
			name: 'Pro Duo Bundle (Save 15%)',
			subtitle: 'সেরা ভ্যালু কম্বো • ১৫% ছাড়',
			multiplier: 2,
			discount: 0.15
		}
	];

	let selectedVariantId = $state('standard');
	const selectedVariant = $derived(
		variantOptions.find((v) => v.id === selectedVariantId) || variantOptions[0]
	);

	// Dynamic Price Calculation
	const activePrice = $derived.by(() => {
		const base = product.price * selectedVariant.multiplier;
		if (selectedVariant.discount > 0) {
			return Math.round(base * (1 - selectedVariant.discount));
		}
		return base;
	});

	const activeOriginalPrice = $derived.by(() => {
		return (product.originalPrice || product.price) * selectedVariant.multiplier;
	});

	const savingsAmount = $derived(
		activeOriginalPrice > activePrice ? activeOriginalPrice - activePrice : 0
	);

	const activeDiscountPercent = $derived.by(() => {
		if (activeOriginalPrice > activePrice) {
			return Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100);
		}
		return 0;
	});

	function increment() {
		quantity += 1;
	}

	function decrement() {
		if (quantity > 1) quantity -= 1;
	}

	function handleAddToCart() {
		for (let i = 0; i < quantity; i++) {
			cart.addItem({
				id: selectedVariant.id === 'standard' ? product.id : `${product.id}-${selectedVariant.id}`,
				name: selectedVariant.id === 'standard' ? product.name : `${product.name} [${selectedVariant.name}]`,
				price: activePrice,
				originalPrice: activeOriginalPrice,
				image: product.image,
				category: product.categoryLabel
			});
		}
		isAdded = true;
		cart.openCart();
		setTimeout(() => {
			isAdded = false;
		}, 1800);
	}

	function handleOrderNow() {
		cart.addItem({
			id: selectedVariant.id === 'standard' ? product.id : `${product.id}-${selectedVariant.id}`,
			name: selectedVariant.id === 'standard' ? product.name : `${product.name} [${selectedVariant.name}]`,
			price: activePrice,
			originalPrice: activeOriginalPrice,
			image: product.image,
			category: product.categoryLabel
		}, false);
		cart.closeCart();
		onBuyNow();
	}
</script>

<div class="space-y-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-7 font-['Anek_Bangla',sans-serif]">
	
	<!-- Top: Brand Badge & Stock Status using shadcn Badges -->
	<div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
		<div class="flex items-center gap-2">
			<Badge variant="blue" class="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider">
				{product.categoryLabel}
			</Badge>
			{#if product.badge}
				<Badge variant="destructive" class="px-2 py-0.5 text-[11px] font-bold">
					{product.badge}
				</Badge>
			{/if}
		</div>

		<!-- Stock availability status -->
		<Badge variant="outline" class="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-200 px-2.5 py-1 rounded-full">
			<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
			<span>ইন স্টক (মজুদ আছে)</span>
		</Badge>
	</div>

	<!-- Product Title & Tagline -->
	<div class="space-y-1">
		<h1 class="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug font-['Outfit',sans-serif] tracking-tight">
			{product.name}
		</h1>
		{#if product.tagline}
			<p class="text-xs sm:text-sm text-slate-500 font-medium">
				{product.tagline}
			</p>
		{/if}
	</div>

	<!-- Ratings & Review Count -->
	<div class="flex items-center gap-2 text-xs">
		<div class="flex text-amber-400 gap-0.5">
			{#each Array(5) as _}
				<Star class="w-4 h-4 fill-amber-400 text-amber-400" />
			{/each}
		</div>
		<span class="font-bold text-slate-800 text-sm">{product.rating}.0</span>
		<span class="text-slate-400 font-medium">({product.reviewsCount} জন কাস্টমার রিভিউ)</span>
		<span class="text-slate-300">•</span>
		<span class="text-emerald-600 font-semibold flex items-center gap-1">
			<CheckCircle2 class="w-3.5 h-3.5" />
			<span>১০০% ভেরিফাইড ক্রয়</span>
		</span>
	</div>

	<!-- Dynamic Pricing & Savings Box (Updates with selected variant) -->
	<div class="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-wrap items-baseline justify-between gap-3">
		<div class="space-y-1">
			<div class="flex items-baseline gap-2.5">
				<span class="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif]">
					৳{activePrice}
				</span>
				{#if activeOriginalPrice > activePrice}
					<span class="text-sm sm:text-base text-slate-400 line-through font-medium">
						৳{activeOriginalPrice}
					</span>
				{/if}
			</div>

			{#if savingsAmount > 0}
				<div class="flex items-center gap-2">
					<Badge variant="rose" class="text-xs font-bold px-2 py-0.5">
						সেভ ৳{savingsAmount} ({activeDiscountPercent}% OFF)
					</Badge>
				</div>
			{/if}
		</div>

		<!-- Delivery Indicator -->
		<div class="text-right">
			<Badge variant="outline" class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 border-emerald-300 px-2 py-0.5">
				<Truck class="w-3 h-3" />
				<span>হোম ডেলিভারি উপলব্ধ</span>
			</Badge>
			<div class="text-[10px] text-slate-400 font-medium mt-0.5">ঢাকা ও সারাদেশে ক্যাশ অন ডেলিভারি</div>
		</div>
	</div>

	<!-- Variant Selector using shadcn Button components -->
	<div class="space-y-2">
		<label class="text-xs font-bold text-slate-700 block">
			প্যাকেজ / ভ্যারিয়েন্ট নির্বাচন করুন:
		</label>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
			{#each variantOptions as variant}
				{@const isSelected = selectedVariantId === variant.id}
				<Button
					type="button"
					variant={isSelected ? 'blue' : 'outline'}
					onclick={() => (selectedVariantId = variant.id)}
					class="h-auto py-2.5 px-3 text-xs font-bold justify-start text-left rounded-xl transition-all flex flex-col items-start gap-0.5 {isSelected
						? 'shadow-xs ring-1 ring-blue-400'
						: 'hover:border-slate-300'}"
				>
					<span>{variant.name}</span>
					<span class="text-[10px] font-medium {isSelected ? 'text-blue-100' : 'text-slate-400'}">
						{variant.subtitle}
					</span>
				</Button>
			{/each}
		</div>
	</div>

	<!-- Quantity Selector -->
	<div class="flex items-center gap-4 pt-1">
		<span class="text-xs font-bold text-slate-700">পরিমাণ (Quantity):</span>
		<div class="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-2xs">
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onclick={decrement}
				class="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 disabled:opacity-40"
				disabled={quantity <= 1}
				aria-label="Decrease quantity"
			>
				<Minus class="w-3.5 h-3.5" />
			</Button>
			<span class="w-10 text-center font-black text-sm text-slate-900 font-['Outfit']">
				{quantity}
			</span>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onclick={increment}
				class="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
				aria-label="Increase quantity"
			>
				<Plus class="w-3.5 h-3.5" />
			</Button>
		</div>
	</div>

	<!-- Dual Action Buttons: Buy Now & Add to Cart using shadcn Button -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
		
		<!-- 1. Primary CTA: Order Now / Buy Now (Instant Checkout) -->
		<Button
			type="button"
			variant="default"
			onclick={handleOrderNow}
			class="w-full h-auto py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-sm sm:text-base shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 border-0 active:scale-98 tracking-wide uppercase cursor-pointer"
		>
			<Zap class="w-4 h-4 fill-slate-950 stroke-none" />
			<span>অর্ডার করুন</span>
		</Button>

		<!-- 2. Secondary CTA: Add to Cart (Drawer Slide-in) -->
		<Button
			type="button"
			variant="default"
			onclick={handleAddToCart}
			class="w-full h-auto py-3.5 px-4 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-black text-sm sm:text-base shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 border-0 active:scale-98 tracking-wide uppercase cursor-pointer"
		>
			{#if isAdded}
				<CheckCircle2 class="w-4 h-4 text-emerald-200" />
				<span>কার্টে যুক্ত হয়েছে!</span>
			{:else}
				<ShoppingBag class="w-4 h-4" />
				<span>কার্টে যোগ করুন</span>
			{/if}
		</Button>

	</div>

	<!-- Call & WhatsApp Order Buttons (Controlled by Product Settings) -->
	{#if productSettings?.callOrderBtn || productSettings?.whatsappOrderBtn}
		<div class="grid {productSettings?.callOrderBtn && productSettings?.whatsappOrderBtn ? 'grid-cols-2' : 'grid-cols-1'} gap-2.5 pt-1">
			{#if productSettings?.callOrderBtn}
				<a
					href="tel:{storeConfig?.hotlinePhone || '01860229546'}"
					class="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 transition-colors shadow-2xs"
				>
					<Phone class="w-3.5 h-3.5" />
					<span>কল দিয়ে অর্ডার করুন</span>
				</a>
			{/if}
			{#if productSettings?.whatsappOrderBtn}
				<a
					href="https://wa.me/88{String(storeConfig?.hotlinePhone || '01860229546').replace(/\D/g, '').slice(-11)}?text={encodeURIComponent(`আসসালামু আলাইকুম, আমি ${product.name} অর্ডার করতে চাই।`)}"
					target="_blank"
					class="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors shadow-2xs"
				>
					<MessageCircle class="w-3.5 h-3.5" />
					<span>WhatsApp-এ অর্ডার</span>
				</a>
			{/if}
		</div>
	{/if}

	<Separator class="my-2" />

	<!-- Trust & Assurance Badges -->
	<div class="grid grid-cols-2 gap-3 pt-1">
		<div class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
			<ShieldCheck class="w-5 h-5 text-emerald-600 shrink-0" />
			<div class="text-[11px] leading-tight">
				<span class="font-bold text-slate-800 block">১০০% আসল পণ্য</span>
				<span class="text-slate-400">সরাসরি ব্র্যান্ড থেকে সংগৃহীত</span>
			</div>
		</div>
		<div class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
			<RotateCcw class="w-5 h-5 text-blue-600 shrink-0" />
			<div class="text-[11px] leading-tight">
				<span class="font-bold text-slate-800 block">৭ দিনের রিটার্ন</span>
				<span class="text-slate-400">সহজ ও ঝামেলাহীন রিপ্লেসমেন্ট</span>
			</div>
		</div>
	</div>

</div>
