<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, Separator } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import {
		ArrowLeft,
		Sparkles,
		Flame,
		Package,
		ExternalLink,
		Link2,
		Copy,
		Clock,
		CheckCircle2,
		ShoppingBag,
		Layers,
		Check,
		Info,
		Save,
		Eye,
		Zap,
		Image as ImageIcon,
		UploadCloud,
		Trash2,
		Star,
		Plus,
		RotateCcw
	} from 'lucide-svelte';

	interface Props {
		landingPage?: any;
		products: any[];
		isEditMode?: boolean;
	}

	let { landingPage = null, products = [], isEditMode = false }: Props = $props();

	// Form State
	let title = $state(landingPage?.title || '');
	let slug = $state(landingPage?.slug || '');
	let productId = $state(landingPage?.productId || '');
	let tag = $state(landingPage?.tag || 'স্পেশাল অফার 🔥');
	let template = $state(landingPage?.template || 'style_1_animated');
	let status = $state<'Published' | 'Draft'>(landingPage?.status || 'Published');

	// Content config
	let headline = $state(landingPage?.config?.headline || landingPage?.title || '');
	let subheadline = $state(
		landingPage?.config?.subheadline || 'সীমিত সময়ের জন্য বিশেষ ছাড়ে আজই অর্ডার করুন! পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা।'
	);
	let offerBadge = $state(landingPage?.config?.offerBadge || 'সীমিত সময়ের মেগা অফার ⚡');
	let countdownMinutes = $state(landingPage?.config?.countdownMinutes ?? 35);
	let customPrice = $state<string>(landingPage?.config?.customPrice ? String(landingPage.config.customPrice) : '');
	let customOriginalPrice = $state<string>(
		landingPage?.config?.customOriginalPrice ? String(landingPage.config.customOriginalPrice) : ''
	);

	let bulletPointsText = $state(
		landingPage?.config?.bulletPoints
			? landingPage.config.bulletPoints.join('\n')
			: '১০০% প্রিমিয়াম ও অরিজিনাল কোয়ালিটি নিশ্চিত\nপণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধের সুবিধা\nপছন্দ না হলে সাথে সাথে রিটার্ন সুবিধা\nসারা বাংলাদেশে দ্রুততম হোম ডেলিভারি'
	);

	// Gallery Images for Landing Page Slider
	let initialImages: string[] = [];
	if (landingPage?.config?.galleryImages && Array.isArray(landingPage.config.galleryImages)) {
		initialImages = landingPage.config.galleryImages;
	} else if (landingPage?.product?.parsedImages?.length > 0) {
		initialImages = landingPage.product.parsedImages;
	} else if (landingPage?.product?.image) {
		initialImages = [landingPage.product.image];
	}

	let galleryImages = $state<string[]>(initialImages);
	let newImageUrl = $state('');
	let isUploadingImage = $state(false);

	let isSubmitting = $state(false);

	// Selected product reference
	let selectedProduct = $derived(products.find((p: any) => p.id === productId) || null);

	// Calculated discount percentage
	let discountPercent = $derived.by(() => {
		const curr = Number(customPrice) || selectedProduct?.price || 0;
		const orig = Number(customOriginalPrice) || selectedProduct?.originalPrice || 0;
		if (orig > curr && curr > 0) {
			return Math.round(((orig - curr) / orig) * 100);
		}
		return 0;
	});

	function addImageUrl() {
		const trimmed = newImageUrl.trim();
		if (!trimmed) return;
		if (galleryImages.includes(trimmed)) {
			toast.info('এই ছবির লিঙ্কটি আগেই যুক্ত করা আছে।');
			return;
		}
		galleryImages = [...galleryImages, trimmed];
		newImageUrl = '';
		toast.success('ছবি সফলভাবে যুক্ত হয়েছে!');
	}

	function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (!files || files.length === 0) return;

		isUploadingImage = true;
		let loadedCount = 0;
		const newUrls: string[] = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const reader = new FileReader();
			reader.onload = (event) => {
				const result = event.target?.result as string;
				if (result && !galleryImages.includes(result)) {
					newUrls.push(result);
				}
				loadedCount++;
				if (loadedCount === files.length) {
					galleryImages = [...galleryImages, ...newUrls];
					isUploadingImage = false;
					toast.success(`${newUrls.length} টি ছবি সফলভাবে যোগ হয়েছে!`);
					target.value = '';
				}
			};
			reader.readAsDataURL(file);
		}
	}

	function removeImage(index: number) {
		galleryImages = galleryImages.filter((_, i) => i !== index);
		toast.success('ছবি মুছে ফেলা হয়েছে');
	}

	function makeCoverImage(index: number) {
		if (index === 0) return;
		const selected = galleryImages[index];
		const remaining = galleryImages.filter((_, i) => i !== index);
		galleryImages = [selected, ...remaining];
		toast.success('প্রধান কভার ছবি হিসেবে সেট করা হয়েছে!');
	}

	function loadProductImages() {
		if (!selectedProduct) return;
		let prodImages: string[] = [];
		if (selectedProduct.images) {
			try {
				prodImages = typeof selectedProduct.images === 'string' ? JSON.parse(selectedProduct.images) : selectedProduct.images;
			} catch {
				prodImages = [selectedProduct.image];
			}
		} else if (selectedProduct.image) {
			prodImages = [selectedProduct.image];
		}

		if (prodImages.length > 0) {
			const combined = Array.from(new Set([...galleryImages, ...prodImages]));
			galleryImages = combined;
			toast.success(`প্রোডাক্ট থেকে ${prodImages.length}টি ছবি গ্যালারিতে সিঙ্ক হয়েছে!`);
		}
	}

	// Auto-fill from Product
	function handleProductSelect(id: string) {
		productId = id;
		const prod = products.find((p: any) => p.id === id);
		if (prod) {
			if (!title || !isEditMode) title = `${prod.name} - বিশেষ অফার`;
			if (!headline || !isEditMode) headline = prod.name;
			if (!subheadline || !isEditMode) {
				subheadline = prod.description || 'সীমিত সময়ের জন্য আকর্ষণীয় বিশেষ ছাড়ে আজই আপনার পছন্দের পণ্যটি সংগ্রহ করুন!';
			}
			if (!slug || !isEditMode) {
				slug = (prod.slug || prod.name)
					.toLowerCase()
					.replace(/[^a-z0-9]/g, '-')
					.replace(/-+/g, '-')
					.replace(/^-|-$/g, '');
			}
			if (!customPrice) customPrice = String(prod.price || '');
			if (!customOriginalPrice) customOriginalPrice = String(prod.originalPrice || Math.round(prod.price * 1.5));

			// Auto-populate images if empty
			if (galleryImages.length === 0) {
				let prodImages: string[] = [];
				if (prod.images) {
					try {
						prodImages = typeof prod.images === 'string' ? JSON.parse(prod.images) : prod.images;
					} catch {
						prodImages = [prod.image];
					}
				} else if (prod.image) {
					prodImages = [prod.image];
				}
				if (prodImages.length > 0) {
					galleryImages = prodImages;
				}
			}

			toast.info(`'${prod.name}' পণ্যের তথ্য ও ছবি অটো-ফিল করা হয়েছে!`);
		}
	}

	function copySlugUrl() {
		if (typeof window === 'undefined') return;
		const full = `${window.location.origin}/lp/${slug || 'your-slug'}`;
		navigator.clipboard.writeText(full);
		toast.success('লিংক কপি করা হয়েছে!');
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) {
			toast.error('ল্যান্ডিং পেজের শিরোনাম লিখুন');
			return;
		}

		if (!slug.trim()) {
			slug = title
				.toLowerCase()
				.replace(/[^a-z0-9]/g, '-')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '');
		}

		isSubmitting = true;

		try {
			const formData = new FormData();
			formData.append('title', title.trim());
			formData.append('slug', slug.trim());
			formData.append('productId', productId || '');
			formData.append('tag', tag.trim());
			formData.append('template', template);
			formData.append('status', status);
			formData.append('headline', headline.trim() || title.trim());
			formData.append('subheadline', subheadline.trim());
			formData.append('offerBadge', offerBadge.trim());
			formData.append('countdownMinutes', String(countdownMinutes || 35));
			if (customPrice) formData.append('customPrice', customPrice);
			if (customOriginalPrice) formData.append('customOriginalPrice', customOriginalPrice);
			formData.append('bulletPoints', bulletPointsText.trim());
			formData.append('galleryImages', JSON.stringify(galleryImages));

			if (isEditMode && landingPage?.id) {
				formData.append('id', landingPage.id);
			}

			const actionEndpoint = isEditMode ? '?/update' : '?/create';
			const res = await fetch(actionEndpoint, {
				method: 'POST',
				headers: { 'x-sveltekit-action': 'true' },
				body: formData
			});

			if (res.ok) {
				toast.success(isEditMode ? 'ল্যান্ডিং পেজ সফলভাবে আপডেট করা হয়েছে!' : 'নতুন ল্যান্ডিং পেজ সফলভাবে তৈরি হয়েছে!');
				goto('/admin/landing-pages');
			} else {
				toast.error('সংরক্ষণ করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
			}
		} catch (err: any) {
			console.error('Error saving landing page:', err);
			toast.error(err.message || 'ব্যর্থ হয়েছে');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-6 max-w-7xl mx-auto pb-16 font-['Anek_Bangla',sans-serif]">
	<!-- 1. Top Header Bar with Breadcrumb and Actions -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
		<div class="flex items-center gap-3">
			<Button
				variant="ghost"
				href="/admin/landing-pages"
				class="w-10 h-10 p-0 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center shrink-0 cursor-pointer"
				title="তালিকায় ফিরে যান"
			>
				<ArrowLeft class="w-5 h-5" />
			</Button>

			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
						{isEditMode ? 'ল্যান্ডিং পেজ সম্পাদনা করুন' : 'নতুন অ্যানিমেটেড ল্যান্ডিং পেজ তৈরি করুন'}
					</h1>
					<Badge variant="outline" class="hidden sm:inline-flex bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
						{template === 'style_1_animated' ? 'Style 1: Modern Animated' : template}
					</Badge>
				</div>
				<p class="text-xs text-slate-500 mt-0.5">
					হাই-কনভার্টিং ল্যান্ডিং পেজ কনফিগার করুন এবং সরাসরি অর্ডার জেনারেট করুন।
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2.5 self-end sm:self-auto">
			<Button
				variant="outline"
				href="/admin/landing-pages"
				class="rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 border-slate-200"
			>
				বাতিল করুন
			</Button>

			{#if isEditMode && landingPage?.slug}
				<Button
					variant="outline"
					href="/lp/{landingPage.slug}"
					target="_blank"
					class="rounded-2xl text-xs font-bold text-[#5845eb] border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 inline-flex items-center gap-1.5"
				>
					<Eye class="w-3.5 h-3.5" />
					<span>লাইভ দেখুন</span>
				</Button>
			{/if}

			<Button
				type="submit"
				disabled={isSubmitting}
				class="rounded-2xl text-xs font-bold bg-[#5845eb] hover:bg-[#4936d6] text-white shadow-md shadow-indigo-500/25 inline-flex items-center gap-2 px-5 py-2.5"
			>
				{#if isSubmitting}
					<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
					<span>সংরক্ষণ হচ্ছে...</span>
				{:else}
					<Save class="w-4 h-4" />
					<span>{isEditMode ? 'পরিবর্তন সংরক্ষণ করুন' : 'পাবলিশ করুন (সেভ)'}</span>
				{/if}
			</Button>
		</div>
	</div>

	<!-- 2. Main 2-Column Grid (8 / 4 Layout) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		
		<!-- LEFT COLUMN: Primary Details & Copywriting (lg:col-span-8) -->
		<div class="lg:col-span-8 space-y-6">

			<!-- CARD 1: প্রোডাক্ট নির্বাচন ও মূল তথ্য -->
			<Card class="rounded-3xl border-slate-200/90 shadow-xs overflow-hidden bg-white">
				<CardHeader class="p-5 sm:p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2.5">
							<div class="w-8 h-8 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0">
								<Package class="w-4.5 h-4.5" />
							</div>
							<div>
								<CardTitle class="text-sm sm:text-base font-bold text-slate-900">
									প্রোডাক্ট নির্বাচন ও প্রাথমিক তথ্য
								</CardTitle>
								<p class="text-[11px] text-slate-500">
									যেকোনো প্রোডাক্টের সাথে লিংক করুন অথবা ম্যানুয়ালি পেজ তৈরি করুন
								</p>
							</div>
						</div>
						<span class="text-[11px] font-semibold text-rose-500">* আবশ্যক ফিল্ড</span>
					</div>
				</CardHeader>

				<CardContent class="p-5 sm:p-6 space-y-5">
					<!-- সংযুক্ত প্রোডাক্ট ড্রপডাউন -->
					<div>
						<label for="lp-product" class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
							<span>সংযুক্ত প্রোডাক্ট নির্বাচন করুন</span>
							{#if selectedProduct}
								<span class="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
									<CheckCircle2 class="w-3.5 h-3.5" />
									<span>প্রোডাক্ট লিংকড</span>
								</span>
							{/if}
						</label>
						
						<select
							id="lp-product"
							value={productId}
							onchange={(e) => handleProductSelect((e.target as HTMLSelectElement).value)}
							class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#5845eb] transition-all cursor-pointer"
						>
							<option value="">-- কোনো প্রোডাক্ট ছাড়াই কাস্টম পেজ বানান --</option>
							{#each products as prod}
								<option value={prod.id}>
									{prod.name} (মূল্য: ৳{prod.price} | স্টক: {prod.stockQuantity ?? 'স্টকে আছে'})
								</option>
							{/each}
						</select>

						<!-- Selected Product Snapshot Box -->
						{#if selectedProduct}
							<div class="mt-3 p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex items-center gap-3.5">
								<div class="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
									{#if selectedProduct.image}
										<img src={selectedProduct.image} alt={selectedProduct.name} class="w-full h-full object-cover" />
									{:else}
										<Package class="w-6 h-6 text-slate-400" />
									{/if}
								</div>
								<div class="flex-1 min-w-0 text-xs">
									<h4 class="font-bold text-slate-900 truncate">{selectedProduct.name}</h4>
									<div class="flex items-center gap-2 mt-0.5 text-slate-500 text-[11px]">
										<span>রেগুলার দাম: ৳{selectedProduct.price}</span>
										<span>•</span>
										<span class="text-emerald-700 font-semibold">স্টক: {selectedProduct.stockQuantity ?? 10} টি</span>
									</div>
								</div>
								<button
									type="button"
									onclick={() => (productId = '')}
									class="text-[11px] text-rose-500 hover:text-rose-700 font-bold px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
								>
									আনলিংক করুন
								</button>
							</div>
						{/if}
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<!-- ল্যান্ডিং পেজের অভ্যন্তরীণ নাম -->
						<div>
							<label for="lp-title" class="block text-xs font-bold text-slate-700 mb-1.5">
								ল্যান্ডিং পেজের শিরোনাম (Internal Title) <span class="text-rose-500">*</span>
							</label>
							<Input
								id="lp-title"
								type="text"
								required
								bind:value={title}
								placeholder="যেমন: AURA Pro Wireless Earbuds - মেগা অফার"
								class="rounded-2xl border-slate-200 text-xs sm:text-sm py-2.5 bg-slate-50/50 focus:bg-white"
							/>
						</div>

						<!-- অফার ব্যাজ ট্যাগ -->
						<div>
							<label for="lp-tag" class="block text-xs font-bold text-slate-700 mb-1.5">
								অফার ব্যাজ ট্যাগ (Card Tag)
							</label>
							<Input
								id="lp-tag"
								type="text"
								bind:value={tag}
								placeholder="যেমন: স্পেশাল অফার 🔥"
								class="rounded-2xl border-slate-200 text-xs sm:text-sm py-2.5 bg-slate-50/50 focus:bg-white"
							/>
						</div>
					</div>

					<!-- URL Slug Input with Live Link Preview -->
					<div>
						<label for="lp-slug" class="block text-xs font-bold text-slate-700 mb-1.5">
							ইউআরএল স্ল্যাগ (URL Slug) <span class="text-rose-500">*</span>
						</label>
						<div class="relative flex items-center">
							<span class="absolute left-3.5 text-xs font-mono text-slate-400 select-none">
								/lp/
							</span>
							<Input
								id="lp-slug"
								type="text"
								required
								bind:value={slug}
								placeholder="earbuds-mega-deal"
								class="rounded-2xl border-slate-200 text-xs sm:text-sm font-mono pl-11 pr-24 py-2.5 bg-slate-50/50 focus:bg-white"
							/>
							<button
								type="button"
								onclick={copySlugUrl}
								class="absolute right-2 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
								title="লিংক কপি করুন"
							>
								<Copy class="w-3 h-3" />
								<span>কপি লিংক</span>
							</button>
						</div>
						<p class="text-[11px] text-slate-400 mt-1 font-mono">
							লাইভ লিংক: <span class="text-indigo-600 font-semibold">https://haqplus.com/lp/{slug || 'your-slug'}</span>
						</p>
					</div>
				</CardContent>
			</Card>

			<!-- CARD: প্রোডাক্ট ইমেজ গ্যালারি ও স্লাইডার -->
			<Card class="rounded-3xl border-slate-200/90 shadow-xs overflow-hidden bg-white">
				<CardHeader class="p-5 sm:p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
						<div class="flex items-center gap-2.5">
							<div class="w-8 h-8 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
								<ImageIcon class="w-4.5 h-4.5" />
							</div>
							<div>
								<CardTitle class="text-sm sm:text-base font-bold text-slate-900">
									প্রোডাক্ট ইমেজ গ্যালারি ও স্লাইডার
								</CardTitle>
								<p class="text-[11px] text-slate-500">
									একাধিক ছবি আপলোড করুন; ল্যান্ডিং পেজে স্বয়ংক্রিয়ভাবে স্লাইডার ও গ্যালারি প্রদর্শিত হবে
								</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<Badge variant="outline" class="bg-violet-50 text-violet-700 border-violet-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
								{galleryImages.length} টি ছবি যুক্ত আছে
							</Badge>
							{#if selectedProduct}
								<button
									type="button"
									onclick={loadProductImages}
									class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
									title="লিংক করা প্রোডাক্ট থেকে ছবি রি-সিঙ্ক করুন"
								>
									<RotateCcw class="w-3 h-3" />
									<span>প্রোডাক্ট ছবি সিঙ্ক</span>
								</button>
							{/if}
						</div>
					</div>
				</CardHeader>

				<CardContent class="p-5 sm:p-6 space-y-5">
					<!-- Upload & URL Input Row -->
					<div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
						<!-- URL Input -->
						<div class="sm:col-span-8 flex gap-2">
							<Input
								type="url"
								bind:value={newImageUrl}
								placeholder="ছবির সরাসরি ওয়েব লিংক (URL) দিন..."
								class="rounded-2xl border-slate-200 text-xs sm:text-sm py-2 bg-slate-50/50 focus:bg-white flex-1"
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										addImageUrl();
									}
								}}
							/>
							<Button
								type="button"
								variant="outline"
								onclick={addImageUrl}
								class="rounded-2xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 shrink-0 px-3 cursor-pointer"
							>
								<Plus class="w-3.5 h-3.5 mr-1" />
								<span>যোগ করুন</span>
							</Button>
						</div>

						<!-- Device Upload Button -->
						<div class="sm:col-span-4">
							<label class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold cursor-pointer transition-all shadow-xs">
								<UploadCloud class="w-4 h-4" />
								<span>{isUploadingImage ? 'লোড হচ্ছে...' : 'ডিভাইস থেকে আপলোড'}</span>
								<input
									type="file"
									accept="image/*"
									multiple
									onchange={handleFileUpload}
									class="hidden"
									disabled={isUploadingImage}
								/>
							</label>
						</div>
					</div>

					<!-- Image Grid -->
					{#if galleryImages.length > 0}
						<div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5 pt-1">
							{#each galleryImages as img, idx}
								<div class="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square shadow-2xs hover:shadow-md transition-all">
									<img
										src={img}
										alt={`Product ${idx + 1}`}
										class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									/>

									<!-- Cover Badge -->
									<div class="absolute top-1.5 left-1.5">
										{#if idx === 0}
											<span class="inline-flex items-center gap-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-sm">
												<Star class="w-2.5 h-2.5 fill-current" />
												<span>কভার ছবি</span>
											</span>
										{:else}
											<span class="bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg">
												#{idx + 1}
											</span>
										{/if}
									</div>

									<!-- Action Buttons Overlay -->
									<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
										{#if idx !== 0}
											<button
												type="button"
												onclick={() => makeCoverImage(idx)}
												class="w-7 h-7 rounded-xl bg-white/90 hover:bg-amber-500 hover:text-white text-slate-800 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
												title="১ম কভার ছবি হিসেবে সেট করুন"
											>
												<Star class="w-3.5 h-3.5" />
											</button>
										{/if}
										<button
											type="button"
											onclick={() => removeImage(idx)}
											class="w-7 h-7 rounded-xl bg-white/90 hover:bg-rose-600 hover:text-white text-rose-600 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
											title="মুছে ফেলুন"
										>
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<!-- Empty State Dropzone -->
						<div class="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50/50 space-y-2">
							<div class="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
								<ImageIcon class="w-6 h-6" />
							</div>
							<p class="text-xs font-bold text-slate-700">এখনো কোনো ছবি যোগ করা হয়নি</p>
							<p class="text-[11px] text-slate-400 max-w-sm mx-auto">
								সরাসরি উপরের ফাইল আপলোড ব্যবহার করুন অথবা ওয়েব লিংক যোগ করুন। একাধিক ছবি যোগ করলে ল্যান্ডিং পেজে স্বয়ংক্রিয় স্লাইডার তৈরি হবে।
							</p>
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- CARD 2: হিরো হেডলাইন ও কপিরাইটিং কনটেন্ট -->
			<Card class="rounded-3xl border-slate-200/90 shadow-xs overflow-hidden bg-white">
				<CardHeader class="p-5 sm:p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
					<div class="flex items-center gap-2.5">
						<div class="w-8 h-8 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
							<Sparkles class="w-4.5 h-4.5" />
						</div>
						<div>
							<CardTitle class="text-sm sm:text-base font-bold text-slate-900">
								আকর্ষণীয় হেডলাইন ও অফার বিবরণ (Hero Copywriting)
							</CardTitle>
							<p class="text-[11px] text-slate-500">
								ল্যান্ডিং পেজের হিরো সেকশনে কাস্টমারকে আকৃষ্ট করতে আকর্ষণীয় টেক্সট লিখুন
							</p>
						</div>
					</div>
				</CardHeader>

				<CardContent class="p-5 sm:p-6 space-y-4">
					<!-- আকর্ষণীয় হেডলাইন -->
					<div>
						<label for="lp-headline" class="block text-xs font-bold text-slate-700 mb-1.5">
							আকর্ষণীয় হিরো হেডলাইন (Headline) <span class="text-rose-500">*</span>
						</label>
						<Input
							id="lp-headline"
							type="text"
							required
							bind:value={headline}
							placeholder="যেমন: আল্ট্রা ক্রিস্টাল সাউন্ড ও অ্যাক্টিভ নয়েজ ক্যান্সেলেশন হেডফোন"
							class="rounded-2xl border-slate-200 text-xs sm:text-sm py-2.5 font-bold text-slate-900 bg-slate-50/50 focus:bg-white"
						/>
					</div>

					<!-- সাব-হেডলাইন / অফার বিবরণ -->
					<div>
						<label for="lp-subheadline" class="block text-xs font-bold text-slate-700 mb-1.5">
							সাব-হেডলাইন / অফার বিবরণ (Sub-headline & Description)
						</label>
						<textarea
							id="lp-subheadline"
							rows="3"
							bind:value={subheadline}
							placeholder="পণ্যটির বিশেষত্ব ও কেন আজই অর্ডার করা উচিত তার ২-৩ লাইনের আকর্ষণীয় বিবরণ..."
							class="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#5845eb] transition-all"
						></textarea>
					</div>

					<!-- অফার ব্যানার ব্যাজ -->
					<div>
						<label for="lp-offerbadge" class="block text-xs font-bold text-slate-700 mb-1.5">
							হিরো সেকশন অফার ব্যাজ (Urgency Hero Badge)
						</label>
						<Input
							id="lp-offerbadge"
							type="text"
							bind:value={offerBadge}
							placeholder="যেমন: সীমিত সময়ের জন্য ৫০% ছাড় ⚡"
							class="rounded-2xl border-slate-200 text-xs sm:text-sm py-2.5 bg-slate-50/50 focus:bg-white"
						/>
					</div>

					<!-- পণ্যটির বিশেষ বৈশিষ্ট্যসমূহ (বুলেট পয়েন্ট) -->
					<div>
						<label for="lp-bulletpoints" class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
							<span>পণ্যটির বিশেষ বৈশিষ্ট্যসমূহ (প্রতি লাইনে ১টি পয়েন্ট)</span>
							<span class="text-[11px] text-slate-400 font-normal">Enter চেপে নতুন পয়েন্ট লিখুন</span>
						</label>
						<textarea
							id="lp-bulletpoints"
							rows="4"
							bind:value={bulletPointsText}
							placeholder="১০০% প্রিমিয়াম ও অরিজিনাল কোয়ালিটি&#10;পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধের সুবিধা&#10;পছন্দ না হলে সাথে সাথে রিটার্ন সুবিধা&#10;সারাদেশে দ্রুততম হোম ডেলিভারি"
							class="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#5845eb] transition-all font-sans leading-relaxed"
						></textarea>
					</div>
				</CardContent>
			</Card>

			<!-- CARD 3: প্রাইসিং ও টাইমার -->
			<Card class="rounded-3xl border-slate-200/90 shadow-xs overflow-hidden bg-white">
				<CardHeader class="p-5 sm:p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
					<div class="flex items-center gap-2.5">
						<div class="w-8 h-8 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
							<Flame class="w-4.5 h-4.5" />
						</div>
						<div>
							<CardTitle class="text-sm sm:text-base font-bold text-slate-900">
								অফার প্রাইসিং ও আর্জেন্সি টাইমার
							</CardTitle>
							<p class="text-[11px] text-slate-500">
								বিশেষ ডিসকাউন্ট এবং লাইভ কাউন্টডাউন টাইমার দিয়ে সেলস বাড়ান
							</p>
						</div>
					</div>
				</CardHeader>

				<CardContent class="p-5 sm:p-6">
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<!-- অফার প্রাইস -->
						<div>
							<label for="lp-customprice" class="block text-xs font-bold text-slate-700 mb-1.5">
								অফার প্রাইস (৳) <span class="text-rose-500">*</span>
							</label>
							<div class="relative">
								<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
								<Input
									id="lp-customprice"
									type="number"
									bind:value={customPrice}
									placeholder="যেমন: ১৪৫০"
									class="rounded-2xl border-slate-200 text-xs sm:text-sm pl-8 py-2.5 font-bold text-emerald-600 bg-slate-50/50 focus:bg-white"
								/>
							</div>
						</div>

						<!-- রেগুলার প্রাইস -->
						<div>
							<label for="lp-regprice" class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
								<span>রেগুলার প্রাইস (৳)</span>
								{#if discountPercent > 0}
									<span class="text-[10px] bg-rose-100 text-rose-700 font-black px-1.5 py-0.2 rounded">
										{discountPercent}% OFF
									</span>
								{/if}
							</label>
							<div class="relative">
								<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
								<Input
									id="lp-regprice"
									type="number"
									bind:value={customOriginalPrice}
									placeholder="যেমন: ২৮০০"
									class="rounded-2xl border-slate-200 text-xs sm:text-sm pl-8 py-2.5 text-slate-500 bg-slate-50/50 focus:bg-white"
								/>
							</div>
						</div>

						<!-- টাইমার (মিনিট) -->
						<div>
							<label for="lp-timer" class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
								<Clock class="w-3.5 h-3.5 text-amber-500" />
								<span>কাউন্টডাউন টাইমার (মিনিট)</span>
							</label>
							<Input
								id="lp-timer"
								type="number"
								min="5"
								max="1440"
								bind:value={countdownMinutes}
								placeholder="35"
								class="rounded-2xl border-slate-200 text-xs sm:text-sm py-2.5 font-mono bg-slate-50/50 focus:bg-white"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

		</div>

		<!-- RIGHT COLUMN: Template Settings, Status & Live Preview (lg:col-span-4) -->
		<div class="lg:col-span-4 space-y-6">

			<!-- CARD 4: টেমপ্লেট নির্বাচন ও আর্কিটেকচার -->
			<Card class="rounded-3xl border-slate-200/90 shadow-xs overflow-hidden bg-white">
				<CardHeader class="p-5 pb-3 border-b border-slate-100 bg-slate-50/50">
					<div class="flex items-center gap-2">
						<Layers class="w-4 h-4 text-[#5845eb]" />
						<CardTitle class="text-sm font-bold text-slate-900">
							ল্যান্ডিং টেমপ্লেট ইঞ্জিন
						</CardTitle>
					</div>
				</CardHeader>

				<CardContent class="p-5 space-y-4">
					<!-- Style 1: Modern Animated (Active) -->
					<div class="p-4 rounded-2xl border-2 border-[#5845eb] bg-indigo-50/30 space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-xs font-black text-slate-900 flex items-center gap-1.5">
								<Sparkles class="w-3.5 h-3.5 text-[#5845eb]" />
								<span>Style 1: Modern Animated</span>
							</span>
							<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#5845eb] text-white">
								সক্রিয়
							</span>
						</div>
						<p class="text-[11px] text-slate-600 leading-relaxed">
							অ্যানিমেটেড পালসিং আর্জেন্সি ব্যাজ, লাইভ টিকিং টাইমার, ইমেজ গ্যালারি, কাস্টমার রিভিউ এবং স্টিকি মোবাইল অর্ডার বার অন্তর্ভুক্ত।
						</p>
					</div>

					<!-- Future Styles (Folder ready) -->
					<div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1 opacity-75">
						<div class="flex items-center justify-between">
							<span class="text-xs font-bold text-slate-700">Style 2: Minimalist Clean</span>
							<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200 text-slate-600">
								শীঘ্রই আসছে
							</span>
						</div>
						<p class="text-[10.5px] text-slate-500">
							নতুন টেমপ্লেট যোগ করতে `src/lib/modules/landing-templates/templates/` এ ফাইল যোগ করুন।
						</p>
					</div>

					<Separator class="bg-slate-100" />

					<!-- Status Selector -->
					<div>
						<label for="lp-status" class="block text-xs font-bold text-slate-700 mb-1.5">
							পাবলিশ স্ট্যাটাস
						</label>
						<select
							id="lp-status"
							bind:value={status}
							class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:bg-white focus:outline-none focus:border-[#5845eb] transition-all cursor-pointer"
						>
							<option value="Published">Published (লাইভ থাকবে)</option>
							<option value="Draft">Draft (খসড়া হিসেবে থাকবে)</option>
						</select>
					</div>
				</CardContent>
			</Card>

			<!-- CARD 5: লাইভ প্রিভিউ কার্ড (Preview Mockup) -->
			<Card class="rounded-3xl border-slate-200/90 shadow-xs overflow-hidden bg-white">
				<CardHeader class="p-5 pb-3 border-b border-slate-100 bg-slate-50/50">
					<div class="flex items-center gap-2">
						<Eye class="w-4 h-4 text-emerald-600" />
						<CardTitle class="text-sm font-bold text-slate-900">
							লাইভ কার্ড প্রিভিউ
						</CardTitle>
					</div>
				</CardHeader>

				<CardContent class="p-5 space-y-3.5">
					<div class="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs space-y-2.5">
						<div class="flex items-center justify-between">
							<span class="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full">
								{tag || 'স্পেশাল অফার'}
							</span>
							<span class="text-[10px] font-bold text-amber-600 flex items-center gap-1">
								<Clock class="w-3 h-3" />
								<span>{countdownMinutes} মি. বাকি</span>
							</span>
						</div>

						<h4 class="text-xs font-bold text-slate-900 line-clamp-2">
							{headline || title || 'আপনার আকর্ষনীয় প্রোডাক্টের হেডলাইন'}
						</h4>

						<div class="flex items-baseline gap-2 pt-1 border-t border-slate-100">
							<span class="text-base font-black text-[#5845eb]">
								৳{customPrice || selectedProduct?.price || '৯৯৯'}
							</span>
							{#if customOriginalPrice || selectedProduct?.originalPrice}
								<span class="text-xs text-slate-400 line-through">
									৳{customOriginalPrice || selectedProduct?.originalPrice}
								</span>
							{/if}
						</div>
					</div>

					<div class="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60 flex items-start gap-2 text-[11px] text-amber-900">
						<Info class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
						<span>
							পেজটি সেভ করার পর আপনি সরাসরি <strong>/lp/{slug || 'your-slug'}</strong> লিংকে ভিজিট করে দেখতে পারবেন।
						</span>
					</div>
				</CardContent>
			</Card>

		</div>

	</div>
</form>

