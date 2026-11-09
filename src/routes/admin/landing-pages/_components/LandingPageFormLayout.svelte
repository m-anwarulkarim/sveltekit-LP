<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, Separator } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import { submitAction } from '#lib/client/submit-action';
	import { slugify } from '#lib/utils/slug';
	import ThemeComponentPreviewModal from '../../customization/theme-view/_components/ThemeComponentPreviewModal.svelte';
	import Style1_ModernAnimated from '#lib/modules/landing-templates/templates/Style1_ModernAnimated.svelte';
	import Style2_DirectCheckout from '#lib/modules/landing-templates/templates/Style2_DirectCheckout.svelte';
	import Style3_LighthouseFunnel from '#lib/modules/landing-templates/templates/Style3_LighthouseFunnel.svelte';
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
		RotateCcw,
		ShieldCheck,
		Gift
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
	let template = $state(
		landingPage?.template ||
		(page?.url?.searchParams?.get('template') as string) ||
		'style_1_animated'
	);
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

	// Style 2: Dedicated 4 Bullets & 3 Packages
	let initialBullets = [
		'১০০% খাঁটি ও সর্বোচ্চ প্রিমিয়াম কোয়ালিটি নিশ্চিত',
		'সরাসরি ক্যাশ অন ডেলিভারি — পণ্য দেখে মূল্য পরিশোধ',
		'পণ্য পছন্দ না হলে তাৎক্ষণিক রিটার্ন বা পরিবর্তন সুবিধা',
		'সমগ্র বাংলাদেশে দ্রুততম হোম ডেলিভারি সুবিধা'
	];
	if (landingPage?.config?.bulletPoints && Array.isArray(landingPage.config.bulletPoints) && landingPage.config.bulletPoints.length > 0) {
		initialBullets = landingPage.config.bulletPoints.slice(0, 4);
		while (initialBullets.length < 4) initialBullets.push('');
	}
	let style2Bullets = $state<string[]>(initialBullets);

	let initialPackages: any[] = [];
	if (landingPage?.config?.packages && Array.isArray(landingPage.config.packages)) {
		initialPackages = landingPage.config.packages;
	} else if (
		landingPage?.template === 'style_2_direct' ||
		landingPage?.template === 'style_3_lighthouse' ||
		page?.url?.searchParams?.get('template') === 'style_2_direct' ||
		page?.url?.searchParams?.get('template') === 'style_3_lighthouse'
	) {
		initialPackages = [
			{
				id: 'pack_1',
				title: '১টি প্যাকেট',
				subtitle: 'স্ট্যান্ডার্ড প্যাকেজ',
				freeGift: '+ ১০ পিস ফ্রি!',
				price: 200,
				originalPrice: 250,
				deliveryFee: 45,
				freeDelivery: false,
				tag: '',
				popular: false
			},
			{
				id: 'pack_2',
				title: '২টি প্যাকেট',
				subtitle: 'জনপ্রিয় কম্বো (ফ্রি ডেলিভারি)',
				freeGift: '+ ২০ পিস ফ্রি!',
				price: 350,
				originalPrice: 500,
				deliveryFee: 0,
				freeDelivery: true,
				tag: '🔥 সেরা অফার',
				popular: true
			},
			{
				id: 'pack_3',
				title: '৩টি প্যাকেট',
				subtitle: 'মেগা সেভার প্যাক (ফ্রি ডেলিভারি)',
				freeGift: '+ ৪০ পিস ফ্রি!',
				price: 445,
				originalPrice: 750,
				deliveryFee: 0,
				freeDelivery: true,
				tag: '🚀 সর্বোচ্চ সাশ্রয়ী',
				popular: false
			}
		];
	}
	let style2Packages = $state<any[]>(initialPackages);

	function addPackage() {
		if (style2Packages.length >= 3) {
			toast.info('সর্বোচ্চ ৩টি প্যাকেজ যোগ করা যাবে');
			return;
		}
		const idx = style2Packages.length + 1;
		const base = Number(customPrice) || 200;
		const origBase = Math.round(base * 1.3);
		const newPack = {
			id: `pack_${Date.now()}_${idx}`,
			title: `${idx}টি প্যাকেট`,
			subtitle: idx === 1 ? 'স্ট্যান্ডার্ড প্যাকেজ' : idx === 2 ? 'জনপ্রিয় কম্বো' : 'মেগা সেভার কম্বো',
			freeGift: idx > 1 ? `+ ${idx * 10} পিস গিফট ফ্রি!` : '',
			price: Math.round(base * idx * (idx === 1 ? 1 : idx === 2 ? 0.9 : 0.85)),
			originalPrice: origBase * idx,
			deliveryFee: idx === 1 ? 45 : 0,
			freeDelivery: idx > 1,
			tag: idx === 2 ? '🔥 সেরা অফার' : idx === 3 ? '🚀 মেগা সেভার' : '',
			popular: idx === 2
		};
		style2Packages = [...style2Packages, newPack];
		toast.success(`প্যাকেজ ${idx} সফলভাবে যোগ করা হয়েছে!`);
	}

	function removePackage(idx: number) {
		style2Packages = style2Packages.filter((_, i) => i !== idx);
		toast.info('প্যাকেজটি মুছে ফেলা হয়েছে।');
	}

	function resetToDefaultPrice() {
		style2Packages = [];
		toast.info('সকল প্যাকেজ মুছে দেওয়া হয়েছে — এখন ডিফল্ট একক মূল্য প্রযোজ্য হবে।');
	}

	let trustBox1Title = $state(landingPage?.config?.trustBox1Title || 'নিশ্চিন্তে অর্ডার করুন');
	let trustBox1Desc = $state(
		landingPage?.config?.trustBox1Desc ||
			'কোনো অগ্রিম টাকা দিতে হবে না। অর্ডার প্লেস করার পর আমাদের প্রতিনিধি ফোনে কথা বলে কনফার্ম করবেন এবং পণ্য হাতে পেয়ে দেখে টাকা পরিশোধ করবেন।'
	);
	let trustBox2Title = $state(landingPage?.config?.trustBox2Title || '🤝 আমাদের প্রতিশ্রুতি');
	let trustBox2Desc = $state(
		landingPage?.config?.trustBox2Desc ||
			'আমরা সর্বোচ্চ কোয়ালিটি এবং সন্তুষ্টি নিশ্চিত করি। কোনো সমস্যা প্রমাণিত হলে সম্পূর্ণ পরিবর্তন অথবা মানিব্যাক গ্যারান্টি।'
	);
	let contactPhone = $state(landingPage?.config?.contactPhone || '');

	// Template Preview Modal State
	let isPreviewModalOpen = $state(false);
	let previewModalTemplate = $state<'style_1_animated' | 'style_2_direct' | 'style_3_lighthouse'>('style_3_lighthouse');

	let currentSelectedProduct = $derived(
		products.find((p: any) => p.id === productId) || products[0] || null
	);

	let previewLandingPage = $derived.by(() => {
		const prod = currentSelectedProduct || {
			id: 'sample-product',
			name: headline || 'প্রিমিয়াম অর্গানিক পণ্য',
			price: Number(customPrice) || 200,
			originalPrice: Number(customOriginalPrice) || 300,
			image: galleryImages[0] || 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
			parsedImages: galleryImages.length > 0 ? galleryImages : [
				'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
				'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=600&auto=format&fit=crop&q=80'
			]
		};

		const displayImgs = galleryImages.length > 0
			? galleryImages
			: (prod.parsedImages?.length ? prod.parsedImages : (prod.image ? [prod.image] : []));

		return {
			id: landingPage?.id || 'preview-lp',
			title: title || `${prod.name} - বিশেষ অফার`,
			slug: slug || 'preview-slug',
			productId: prod.id,
			template: previewModalTemplate,
			tag: tag || 'স্পেশাল অফার 🔥',
			status: 'Published',
			isPreview: true,
			product: prod,
			config: {
				headline: headline || prod.name,
				subheadline: subheadline || 'সীমিত সময়ের জন্য আকর্ষণীয় বিশেষ ছাড়ে আজই আপনার পছন্দের পণ্যটি সংগ্রহ করুন!',
				customPrice: Number(customPrice) || prod.price || 200,
				customOriginalPrice: Number(customOriginalPrice) || prod.originalPrice || 300,
				galleryImages: displayImgs,
				bulletPoints: style2Bullets.filter(Boolean).length > 0 ? style2Bullets : [
					'১০০% খাঁটি ও অরিজিনাল কোয়ালিটি নিশ্চিত',
					'নরম তুলতুলে সুস্বাদু শাঁস ও রোগবালাই প্রতিরোধ ক্ষমতা বেশি',
					'ছাদবাগান ও বাণিজ্যিকভাবে চাষের জন্য অত্যন্ত উপযোগী',
					'অঙ্কুরোদগম হার ৯০% এর বেশি পরীক্ষিত ও প্রমাণিত'
				],
				packages: style2Packages,
				trustBox1Title: trustBox1Title || 'নিশ্চিন্তে অর্ডার করুন',
				trustBox1Desc: trustBox1Desc || 'কোনো অগ্রিম টাকা দিতে হবে না। অর্ডার প্লেস করার পর আমাদের প্রতিনিধি ফোনে কথা বলে কনফার্ম করবেন এবং পণ্য হাতে পেয়ে দেখে টাকা পরিশোধ করবেন।',
				trustBox2Title: trustBox2Title || '🤝 আমাদের প্রতিশ্রুতি',
				trustBox2Desc: trustBox2Desc || 'আমরা সর্বোচ্চ কোয়ালিটি এবং সন্তুষ্টি নিশ্চিত করি। কোনো সমস্যা প্রমাণিত হলে সম্পূর্ণ পরিবর্তন অথবা মানিব্যাক গ্যারান্টি।',
				contactPhone: contactPhone || undefined
			}
		};
	});

	function openTemplatePreview(tpl: 'style_1_animated' | 'style_2_direct' | 'style_3_lighthouse') {
		previewModalTemplate = tpl;
		isPreviewModalOpen = true;
	}

	function activatePreviewedTemplate() {
		template = previewModalTemplate;
		isPreviewModalOpen = false;
		const name =
			previewModalTemplate === 'style_3_lighthouse'
				? 'Style 3: Lighthouse Funnel'
				: previewModalTemplate === 'style_2_direct'
					? 'Style 2: Sarder Seed Direct'
					: 'Style 1: Modern Animated';
		toast.success(`${name} সক্রিয় করা হয়েছে!`);
	}

	function autoCalculatePackages(base: number) {
		if (!base || base <= 0) return;
		const origBase = Math.round(base * 1.25);
		style2Packages = [
			{
				id: 'pack_1',
				title: style2Packages[0]?.title || '১টি প্যাকেট',
				subtitle: style2Packages[0]?.subtitle || 'স্ট্যান্ডার্ড প্যাকেজ',
				freeGift: style2Packages[0]?.freeGift || '',
				price: base,
				originalPrice: origBase,
				deliveryFee: 45,
				freeDelivery: false,
				tag: style2Packages[0]?.tag || '',
				popular: false
			},
			{
				id: 'pack_2',
				title: style2Packages[1]?.title || '২টি প্যাকেট',
				subtitle: style2Packages[1]?.subtitle || 'জনপ্রিয় কম্বো (ফ্রি ডেলিভারি)',
				freeGift: style2Packages[1]?.freeGift || '+ ২০ পিস গিফট ফ্রি!',
				price: Math.round(base * 1.75),
				originalPrice: origBase * 2,
				deliveryFee: 0,
				freeDelivery: true,
				tag: style2Packages[1]?.tag || '🔥 সেরা অফার',
				popular: true
			},
			{
				id: 'pack_3',
				title: style2Packages[2]?.title || '৩টি প্যাকেট',
				subtitle: style2Packages[2]?.subtitle || 'মেগা সেভার প্যাক (ফ্রি ডেলিভারি)',
				freeGift: style2Packages[2]?.freeGift || '+ ৪০ পিস গিফট ফ্রি!',
				price: Math.round(base * 2.225),
				originalPrice: origBase * 3,
				deliveryFee: 0,
				freeDelivery: true,
				tag: style2Packages[2]?.tag || '🚀 সর্বোচ্চ সাশ্রয়ী',
				popular: false
			}
		];
		toast.success('৩টি প্যাকেজের দাম ও অফার অটো-ক্যালকুলেট করা হয়েছে!');
	}

	// Gallery Images for Landing Page Slider
	function getInitialImages(): string[] {
		if (landingPage?.config?.galleryImages && Array.isArray(landingPage.config.galleryImages)) {
			return landingPage.config.galleryImages;
		}
		if (landingPage?.product?.parsedImages?.length > 0) {
			return landingPage.product.parsedImages;
		}
		if (landingPage?.product?.image) {
			return [landingPage.product.image];
		}
		return [];
	}

	let galleryImages = $state<string[]>(getInitialImages());
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

	async function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (!files || files.length === 0) return;

		isUploadingImage = true;
		const newUrls: string[] = [];
		const failed: string[] = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			try {
				const fd = new FormData();
				fd.append('file', file);
				fd.append('folder', 'landing-pages');
				const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd });
				const json = await res.json() as any;
				if (res.ok && json?.item?.url) {
					const url = json.item.url as string;
					if (!galleryImages.includes(url)) newUrls.push(url);
				} else {
					failed.push(file.name);
				}
			} catch {
				failed.push(file.name);
			}
		}

		if (newUrls.length > 0) {
			galleryImages = [...galleryImages, ...newUrls];
			toast.success(`${newUrls.length}তি ছবি সফলভাবে আপলোড হয়েছে!`);
		}
		if (failed.length > 0) {
			toast.error(`${failed.length}তি ছবি আপলোড হয়নি: ${failed.join(', ')}`);
		}
		isUploadingImage = false;
		target.value = '';
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

	function extractProductImages(prod: any): string[] {
		if (!prod) return [];
		let res: string[] = [];
		if (Array.isArray(prod.parsedImages) && prod.parsedImages.length > 0) {
			res = prod.parsedImages;
		} else if (Array.isArray(prod.galleryImages) && prod.galleryImages.length > 0) {
			res = prod.galleryImages;
		} else if (typeof prod.parsed_images === 'string') {
			try {
				res = JSON.parse(prod.parsed_images);
			} catch {}
		} else if (typeof prod.gallery_images === 'string') {
			try {
				res = JSON.parse(prod.gallery_images);
			} catch {}
		}
		if (prod.image && !res.includes(prod.image)) {
			res = [prod.image, ...res];
		}
		return res.filter(Boolean);
	}

	function loadProductImages() {
		if (!selectedProduct) return;
		const prodImages = extractProductImages(selectedProduct);
		if (prodImages.length > 0) {
			const combined = Array.from(new Set([...galleryImages, ...prodImages]));
			galleryImages = combined;
			toast.success(`প্রোডাক্ট থেকে ${prodImages.length}টি ছবি গ্যালারিতে সিঙ্ক হয়েছে!`);
		} else {
			toast.info('এই প্রোডাক্টে কোনো অতিরিক্ত ছবি পাওয়া যায়নি।');
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
				slug = slugify(prod.slug || prod.name) || `offer-${Date.now()}`;
			}
			// Only overwrite prices if user hasn't set custom values
			if (!customPrice || !isEditMode) {
				customPrice = String(prod.price || '');
			}
			if (!customOriginalPrice || !isEditMode) {
				customOriginalPrice = String(prod.originalPrice || Math.round((prod.price || 100) * 1.5));
			}

			// Auto-populate images (merge in edit mode, replace in create mode)
			const prodImages = extractProductImages(prod);
			if (prodImages.length > 0) {
				if (isEditMode) {
					const combined = Array.from(new Set([...galleryImages, ...prodImages]));
					galleryImages = combined;
				} else {
					galleryImages = [...prodImages];
				}
			}

			// Only auto-calculate packages if none exist yet
			if (!isEditMode || style2Packages.length === 0) {
				autoCalculatePackages(Number(prod.price) || 200);
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
			slug = slugify(title) || `offer-${Date.now()}`;
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
			
			const bulletsToSave =
				template === 'style_2_direct'
					? style2Bullets.filter((b) => b && b.trim()).join('\n')
					: bulletPointsText.trim();
			formData.append('bulletPoints', bulletsToSave);
			formData.append('galleryImages', JSON.stringify(galleryImages));

			// Style 2: Packages & Trust boxes
			formData.append('packages', JSON.stringify(style2Packages));
			formData.append('trustBox1Title', trustBox1Title.trim());
			formData.append('trustBox1Desc', trustBox1Desc.trim());
			formData.append('trustBox2Title', trustBox2Title.trim());
			formData.append('trustBox2Desc', trustBox2Desc.trim());
			formData.append('contactPhone', contactPhone.trim());

			if (isEditMode && landingPage?.id) {
				formData.append('id', landingPage.id);
			}

			const actionEndpoint = isEditMode ? '?/update' : '?/create';
			const result = await submitAction(actionEndpoint, formData, 'সংরক্ষণ করতে সমস্যা হয়েছে');
			if (!result.ok) {
				toast.error(result.message);
				isSubmitting = false;
				return;
			}
			toast.success(isEditMode ? 'আপডেট সফল!' : 'নতুন ল্যান্ডিং পেজ তৈরি হয়েছে!');
			await goto('/admin/landing-pages');
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
						{template === 'style_3_lighthouse' ? 'Style 3: Lighthouse Funnel' : template === 'style_2_direct' ? 'Style 2: Sarder Seed Direct' : 'Style 1: Modern Animated'}
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
								placeholder="যেমন: seedbd Pro Wireless Earbuds - মেগা অফার"
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
							লাইভ লিংক: <span class="text-indigo-600 font-semibold">{typeof window !== 'undefined' ? window.location.origin : ''}/lp/{slug || 'your-slug'}</span>
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

					<!-- পণ্যটির বিশেষ বৈশিষ্ট্যসমূহ -->
					{#if template === 'style_2_direct'}
						<div class="space-y-3 pt-2">
							<div class="flex items-center justify-between">
								<span class="block text-xs font-bold text-slate-800">
									৪টি মূল আকর্ষণ ও বৈশিষ্ট্য (সবুজ টিকমার্ক বুলেট পয়েন্ট)
								</span>
								<span class="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
									সর্দার সিড স্টাইল
								</span>
							</div>
							<p class="text-[11px] text-slate-500">
								ল্যান্ডিং পেজের শিরোনামের নিচে এই ৪টি পয়েন্ট বড় করে সবুজ টিকমার্কে প্রদর্শিত হবে:
							</p>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
								{#each style2Bullets as _, bIdx}
									<div class="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 focus-within:border-emerald-600 focus-within:bg-white transition-all">
										<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
										<input
											type="text"
											bind:value={style2Bullets[bIdx]}
											placeholder={`ফিচার ${bIdx + 1}...`}
											class="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
										/>
									</div>
								{/each}
							</div>
						</div>
					{:else}
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
					{/if}
				</CardContent>
			</Card>

			{#if template === 'style_2_direct' || template === 'style_3_lighthouse'}
				<!-- CARD 3: ডাইনামিক প্যাকেজ অফার ও বান্ডেল প্রাইসিং (০, ১, ২ বা ৩টি প্যাকেজ) -->
				<Card class="rounded-3xl border-emerald-500/80 shadow-xs overflow-hidden bg-white">
					<CardHeader class="p-5 sm:p-6 pb-4 border-b border-emerald-100 bg-emerald-50/40">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div class="flex items-center gap-2.5">
								<div class="w-8 h-8 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
									<Layers class="w-4.5 h-4.5" />
								</div>
								<div>
									<CardTitle class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
										<span>প্যাকেজ অফার ও বান্ডেল প্রাইসিং</span>
										<Badge variant="outline" class="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
											{style2Packages.length === 0 ? 'ডিফল্ট একক মূল্য' : `${style2Packages.length}টি প্যাকেজ সক্রিয়`}
										</Badge>
									</CardTitle>
									<p class="text-[11px] text-slate-500">
										{style2Packages.length === 0
											? 'কোনো প্যাকেজ না দিলে সাধারণ একক মূল্য দেখাবে। ১, ২ বা ৩টি প্যাকেজ তৈরি করতে পারেন।'
											: `বর্তমানে ${style2Packages.length}টি প্যাকেজ কনফিগার করা রয়েছে।`}
									</p>
								</div>
							</div>

							<div class="flex items-center gap-2 flex-wrap self-start sm:self-auto">
								{#if style2Packages.length < 3}
									<Button
										type="button"
										size="sm"
										class="text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs rounded-xl"
										onclick={addPackage}
									>
										<Plus class="w-3.5 h-3.5" />
										<span>+ প্যাকেজ যোগ করুন</span>
									</Button>
								{/if}

								<Button
									type="button"
									variant="outline"
									size="sm"
									class="text-xs font-bold gap-1 text-emerald-800 border-emerald-200 bg-white hover:bg-emerald-50 cursor-pointer shadow-2xs rounded-xl"
									onclick={() => autoCalculatePackages(Number(customPrice) || Number(selectedProduct?.price) || 200)}
								>
									<Sparkles class="w-3.5 h-3.5 text-emerald-600" />
									<span>⚡ ৩টি প্যাকেজ অটো-ক্যালকুলেট</span>
								</Button>

								{#if style2Packages.length > 0}
									<Button
										type="button"
										variant="ghost"
										size="sm"
										class="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer rounded-xl"
										onclick={resetToDefaultPrice}
										title="সব প্যাকেজ মুছে একক মূল্যে ফেরত যান"
									>
										<Trash2 class="w-3.5 h-3.5" />
										<span>সব মুছুন</span>
									</Button>
								{/if}
							</div>
						</div>
					</CardHeader>

					<CardContent class="p-5 sm:p-6 space-y-4">
						<!-- Base Price Anchor -->
						<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
							<div class="text-xs text-slate-700">
								<span class="font-bold">মূল পণ্যের একক বেইজ প্রাইস:</span>
								<span class="text-slate-500 ml-1">প্যাকেজ না থাকলে এই মূল্যটিই সরাসরি প্রদর্শিত হবে</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="relative w-32">
									<span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
									<Input
										type="number"
										bind:value={customPrice}
										placeholder="200"
										class="pl-7 h-9 text-xs font-bold text-emerald-700 rounded-xl bg-white"
										oninput={() => {
											if (customPrice && style2Packages.length === 3) autoCalculatePackages(Number(customPrice));
										}}
									/>
								</div>
							</div>
						</div>

						{#if style2Packages.length === 0}
							<!-- 0 Packages: Single Default Price Message Box -->
							<div class="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center space-y-2">
								<div class="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-black text-base">
									📦
								</div>
								<h4 class="text-xs sm:text-sm font-black text-slate-800">
									বর্তমানে কোনো আলাদা প্যাকেজ সক্রিয় নেই
								</h4>
								<p class="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
									ল্যান্ডিং পেজে একক মূল্যে (৳{customPrice || selectedProduct?.price || '...'}) সরাসরি ১টি পণ্য সিলেক্ট করা থাকবে। আপনি চাইলে ওপরের <strong>"+ প্যাকেজ যোগ করুন"</strong> বাটনে ক্লিক করে ১টি, ২টি বা ৩টি প্যাকেজ তৈরি করতে পারেন।
								</p>
							</div>
						{:else}
							<!-- Dynamic 1, 2, or 3 Package Cards -->
							<div class="grid grid-cols-1 {style2Packages.length === 2 ? 'md:grid-cols-2' : style2Packages.length === 3 ? 'md:grid-cols-3' : 'max-w-md'} gap-3.5">
								{#each style2Packages as pkg, idx}
									<div class="rounded-2xl p-4 border-2 transition-all space-y-3 relative {idx === 1 && style2Packages.length > 1 ? 'border-emerald-500/80 bg-emerald-50/30 shadow-2xs' : 'border-slate-200 bg-slate-50/60'}">
										<div class="flex items-center justify-between">
											<span class="text-xs font-black text-slate-900 flex items-center gap-1.5">
												<span>প্যাকেজ {['১', '২', '৩'][idx] || (idx + 1)}</span>
												{#if idx === 1 && style2Packages.length > 1}
													<span class="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">জনপ্রিয়</span>
												{/if}
											</span>
											<button
												type="button"
												onclick={() => removePackage(idx)}
												class="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
												title="এই প্যাকেজটি মুছুন"
											>
												<Trash2 class="w-3.5 h-3.5" />
											</button>
										</div>

										<div class="space-y-1">
											<label for="pkg-title-{idx}" class="text-[11px] font-bold text-slate-600 block">প্যাকেজ নাম</label>
											<Input id="pkg-title-{idx}" bind:value={pkg.title} placeholder={`${idx + 1}টি প্যাকেট`} class="h-8 text-xs rounded-xl bg-white" />
										</div>

										<div class="space-y-1">
											<label for="pkg-sub-{idx}" class="text-[11px] font-bold text-slate-600 block">সাবটাইটেল</label>
											<Input id="pkg-sub-{idx}" bind:value={pkg.subtitle} placeholder="জনপ্রিয় কম্বো" class="h-8 text-xs rounded-xl bg-white" />
										</div>

										<div class="space-y-1">
											<label for="pkg-gift-{idx}" class="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
												<Gift class="w-3 h-3" />
												<span>ফ্রি উপহার / গিফট ট্যাগ</span>
											</label>
											<Input id="pkg-gift-{idx}" bind:value={pkg.freeGift} placeholder="+ ১০ পিস বেল্ট ফ্রি!" class="h-8 text-xs rounded-xl bg-white border-emerald-200" />
										</div>

										<div class="space-y-1">
											<label for="pkg-tag-{idx}" class="text-[11px] font-bold text-slate-600 block">ব্যাজ লেবেল</label>
											<Input id="pkg-tag-{idx}" bind:value={pkg.tag} placeholder="🔥 সেরা অফার" class="h-8 text-xs rounded-xl bg-white" />
										</div>

										<div class="grid grid-cols-2 gap-2 pt-1">
											<div class="space-y-1">
												<label for="pkg-price-{idx}" class="text-[10px] font-bold text-slate-600 block">অফার মূল্য (৳)</label>
												<Input id="pkg-price-{idx}" type="number" bind:value={pkg.price} class="h-8 text-xs font-bold text-emerald-700 rounded-xl bg-white" />
											</div>
											<div class="space-y-1">
												<label for="pkg-orig-{idx}" class="text-[10px] font-bold text-slate-600 block">রেগুলার মূল্য (৳)</label>
												<Input id="pkg-orig-{idx}" type="number" bind:value={pkg.originalPrice} class="h-8 text-xs rounded-xl bg-white text-slate-400" />
											</div>
										</div>

										<div class="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
											<label class="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
												<input type="checkbox" bind:checked={pkg.freeDelivery} class="rounded text-emerald-600 focus:ring-emerald-500" />
												<span>ফ্রি ডেলিভারি</span>
											</label>

											{#if !pkg.freeDelivery}
												<div class="flex items-center gap-1">
													<span class="text-[10px] text-slate-500">চার্জ:</span>
													<Input type="number" bind:value={pkg.deliveryFee} class="w-16 h-7 text-[11px] rounded-lg bg-white" />
												</div>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</CardContent>
				</Card>

				<!-- CARD 4 FOR STYLE 2: ট্রাস্ট গ্যারান্টি ও হটলাইন -->
				<Card class="rounded-3xl border-slate-200/90 shadow-xs overflow-hidden bg-white">
					<CardHeader class="p-5 sm:p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
						<div class="flex items-center gap-2.5">
							<div class="w-8 h-8 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
								<ShieldCheck class="w-4.5 h-4.5" />
							</div>
							<div>
								<CardTitle class="text-sm sm:text-base font-bold text-slate-900">
									নিশ্চয়তা ও ট্রাস্ট বক্স সেটিংস
								</CardTitle>
								<p class="text-[11px] text-slate-500">
									গ্রাহকের ভরসা বাড়ানোর জন্য ২টি গ্যারান্টি বক্স ও হটলাইন নম্বর
								</p>
							</div>
						</div>
					</CardHeader>

					<CardContent class="p-5 sm:p-6 space-y-4">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div class="space-y-2 p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
								<label for="tb1-title" class="block text-xs font-bold text-emerald-950">ট্রাস্ট বক্স ১ শিরোনাম</label>
								<Input id="tb1-title" bind:value={trustBox1Title} class="h-9 text-xs rounded-xl bg-white" />
								<label for="tb1-desc" class="block text-xs font-bold text-emerald-950 pt-1">ট্রাস্ট বক্স ১ বিবরণ</label>
								<textarea id="tb1-desc" bind:value={trustBox1Desc} rows={3} class="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white resize-none"></textarea>
							</div>

							<div class="space-y-2 p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100">
								<label for="tb2-title" class="block text-xs font-bold text-amber-950">ট্রাস্ট বক্স ২ শিরোনাম</label>
								<Input id="tb2-title" bind:value={trustBox2Title} class="h-9 text-xs rounded-xl bg-white" />
								<label for="tb2-desc" class="block text-xs font-bold text-amber-950 pt-1">ট্রাস্ট বক্স ২ বিবরণ</label>
								<textarea id="tb2-desc" bind:value={trustBox2Desc} rows={3} class="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white resize-none"></textarea>
							</div>
						</div>

						<div class="pt-1">
							<label for="lp-helpline" class="block text-xs font-bold text-slate-700 mb-1.5">সরাসরি হটলাইন / ফোন নম্বর</label>
							<Input id="lp-helpline" bind:value={contactPhone} placeholder="01712345678" class="h-10 text-xs sm:text-sm rounded-xl max-w-sm" />
						</div>
					</CardContent>
				</Card>
			{:else}
				<!-- CARD 3: প্রাইসিং ও টাইমার (Style 1 Animated) -->
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
			{/if}

		</div>

		<!-- RIGHT COLUMN: Template Settings, Status & Live Preview (lg:col-span-4) -->
		<div class="lg:col-span-4 space-y-6 order-first lg:order-last">

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
					<!-- Style 1: Modern Animated -->
					<div
						role="button"
						tabindex="0"
						onclick={() => (template = 'style_1_animated')}
						onkeydown={(e) => e.key === 'Enter' && (template = 'style_1_animated')}
						class="w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 {template === 'style_1_animated' ? 'border-[#5845eb] bg-indigo-50/40 ring-2 ring-[#5845eb]/20 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'}"
					>
						<div class="flex items-center justify-between">
							<span class="text-xs font-black text-slate-900 flex items-center gap-1.5">
								<Sparkles class="w-3.5 h-3.5 {template === 'style_1_animated' ? 'text-[#5845eb]' : 'text-slate-400'}" />
								<span>Style 1: Modern Animated</span>
							</span>
							{#if template === 'style_1_animated'}
								<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#5845eb] text-white">
									সক্রিয়
								</span>
							{:else}
								<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
									নির্বাচন করুন
								</span>
							{/if}
						</div>
						<p class="text-[11px] text-slate-600 leading-relaxed">
							অ্যানিমেটেড আর্জেন্সি কাউন্টডাউন, ইমেজ ক্যারোসেল, কাস্টমার রিভিউ ও স্টিকি মোবাইল অর্ডার বার।
						</p>

						<!-- Feature Badges -->
						<div class="flex flex-wrap gap-1 pt-0.5">
							<span class="px-1.5 py-0.5 rounded-md bg-indigo-100/70 text-indigo-700 text-[9.5px] font-bold">⏰ কাউন্টডাউন</span>
							<span class="px-1.5 py-0.5 rounded-md bg-indigo-100/70 text-indigo-700 text-[9.5px] font-bold">📷 ফটো ক্যারোসেল</span>
							<span class="px-1.5 py-0.5 rounded-md bg-indigo-100/70 text-indigo-700 text-[9.5px] font-bold">⭐ রিভিউ গ্রিড</span>
							<span class="px-1.5 py-0.5 rounded-md bg-indigo-100/70 text-indigo-700 text-[9.5px] font-bold">🛍️ স্টিকি বার</span>
						</div>

						<!-- Action Footer with Preview Button -->
						<div class="pt-2 flex items-center justify-between border-t border-slate-100/80">
							<span class="text-[10px] font-medium text-slate-500">
								{template === 'style_1_animated' ? '✓ বর্তমানে সিলেক্টেড' : 'ক্লিক করে সিলেক্ট করুন'}
							</span>
							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									openTemplatePreview('style_1_animated');
								}}
								class="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-600 text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
							>
								<Eye class="w-3 h-3 text-indigo-600" />
								<span>প্রিভিউ দেখুন</span>
							</button>
						</div>
					</div>

					<!-- Style 2: Sarder Seed Direct Checkout -->
					<div
						role="button"
						tabindex="0"
						onclick={() => (template = 'style_2_direct')}
						onkeydown={(e) => e.key === 'Enter' && (template = 'style_2_direct')}
						class="w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 {template === 'style_2_direct' ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'}"
					>
						<div class="flex items-center justify-between">
							<span class="text-xs font-black text-slate-900 flex items-center gap-1.5">
								<CheckCircle2 class="w-3.5 h-3.5 {template === 'style_2_direct' ? 'text-emerald-600' : 'text-slate-400'}" />
								<span>Style 2: Sarder Seed Direct</span>
							</span>
							{#if template === 'style_2_direct'}
								<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-600 text-white">
									সক্রিয়
								</span>
							{:else}
								<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
									নির্বাচন করুন
								</span>
							{/if}
						</div>
						<p class="text-[11px] text-slate-600 leading-relaxed">
							sarderseed.com স্টাইলে ১, ২ ও ৩ প্যাকেট বান্ডেল নির্বাচন, ফ্রি ডেলিভারি অফার, ৩-স্টেপ চেকআউট এবং ট্রাস্ট গ্যারান্টি।
						</p>

						<!-- Feature Badges -->
						<div class="flex flex-wrap gap-1 pt-0.5">
							<span class="px-1.5 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 text-[9.5px] font-bold">✓ ৪টি চেকমার্ক বুলেট</span>
							<span class="px-1.5 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 text-[9.5px] font-bold">📦 ৩টি বান্ডেল অফার</span>
							<span class="px-1.5 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 text-[9.5px] font-bold">🚚 ফ্রি ডেলিভারি</span>
							<span class="px-1.5 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 text-[9.5px] font-bold">📋 ১-পেজ চেকআউট</span>
						</div>

						<!-- Action Footer with Preview Button -->
						<div class="pt-2 flex items-center justify-between border-t border-slate-100/80">
							<span class="text-[10px] font-medium text-slate-500">
								{template === 'style_2_direct' ? '✓ বর্তমানে সিলেক্টেড' : 'ক্লিক করে সিলেক্ট করুন'}
							</span>
							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									openTemplatePreview('style_2_direct');
								}}
								class="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-emerald-700 text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
							>
								<Eye class="w-3 h-3 text-emerald-600" />
								<span>প্রিভিউ দেখুন</span>
							</button>
						</div>
					</div>

					<!-- Style 3: The Color Lighthouse Funnel -->
					<div
						role="button"
						tabindex="0"
						onclick={() => (template = 'style_3_lighthouse')}
						onkeydown={(e) => e.key === 'Enter' && (template = 'style_3_lighthouse')}
						class="w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 {template === 'style_3_lighthouse' ? 'border-[#e8007c] bg-[#e8007c]/5 ring-2 ring-[#e8007c]/20 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'}"
					>
						<div class="flex items-center justify-between">
							<span class="text-xs font-black text-slate-900 flex items-center gap-1.5">
								<Sparkles class="w-3.5 h-3.5 {template === 'style_3_lighthouse' ? 'text-[#e8007c]' : 'text-slate-400'}" />
								<span>Style 3: Lighthouse Funnel</span>
							</span>
							{#if template === 'style_3_lighthouse'}
								<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#e8007c] text-white">
									সক্রিয়
								</span>
							{:else}
								<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
									নির্বাচন করুন
								</span>
							{/if}
						</div>
						<p class="text-[11px] text-slate-600 leading-relaxed">
							thecolorlighthouse.com স্টাইলে ম্যাজেন্টা থিম, স্প্লিট ২-কলাম চেকআউট, সেভিংস ডিসপ্লে, বেনিফিট শোকেস ও ইন্টারেক্টিভ FAQ।
						</p>

						<!-- Feature Badges -->
						<div class="flex flex-wrap gap-1 pt-0.5">
							<span class="px-1.5 py-0.5 rounded-md bg-[#e8007c]/10 text-[#e8007c] text-[9.5px] font-bold">🎁 ফ্রি গিফট ট্যাগ</span>
							<span class="px-1.5 py-0.5 rounded-md bg-[#e8007c]/10 text-[#e8007c] text-[9.5px] font-bold">💰 সেভ টাকা ক্যালকুলেশন</span>
							<span class="px-1.5 py-0.5 rounded-md bg-[#e8007c]/10 text-[#e8007c] text-[9.5px] font-bold">📋 স্প্লিট চেকআউট সামারি</span>
							<span class="px-1.5 py-0.5 rounded-md bg-[#e8007c]/10 text-[#e8007c] text-[9.5px] font-bold">❓ ইন্টারেক্টিভ FAQ</span>
						</div>

						<!-- Action Footer with Preview Button -->
						<div class="pt-2 flex items-center justify-between border-t border-slate-100/80">
							<span class="text-[10px] font-medium text-slate-500">
								{template === 'style_3_lighthouse' ? '✓ বর্তমানে সিলেক্টেড' : 'ক্লিক করে সিলেক্ট করুন'}
							</span>
							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									openTemplatePreview('style_3_lighthouse');
								}}
								class="px-2.5 py-1 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-[#e8007c] text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
							>
								<Eye class="w-3 h-3 text-[#e8007c]" />
								<span>প্রিভিউ দেখুন</span>
							</button>
						</div>
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
							{#if (template === 'style_2_direct' || template === 'style_3_lighthouse') && style2Packages.length > 0}
								<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
									{style2Packages.length}টি প্যাকেজ সক্রিয়
								</span>
							{:else}
								<span class="text-[10px] font-bold text-amber-600 flex items-center gap-1">
									<Clock class="w-3 h-3" />
									<span>{countdownMinutes} মি. বাকি</span>
								</span>
							{/if}
						</div>

						<h4 class="text-xs font-bold text-slate-900 line-clamp-2">
							{headline || title || 'আপনার আকর্ষনীয় প্রোডাক্টের হেডলাইন'}
						</h4>

						{#if (template === 'style_2_direct' || template === 'style_3_lighthouse') && style2Packages.length > 0}
							<div class="space-y-1.5 pt-1 border-t border-slate-100 text-[11px]">
								{#each style2Packages as pkg, idx}
									<div class="flex justify-between items-center {idx === 0 ? 'text-slate-600' : idx === 1 ? 'text-emerald-700 font-bold bg-emerald-50/70 p-1 rounded-lg' : 'text-indigo-700 font-bold bg-indigo-50/70 p-1 rounded-lg'}">
										<span>{pkg.title}{pkg.freeDelivery ? ' (ফ্রি শিপিং)' : ''}</span>
										<span class={idx === 0 ? 'font-bold text-slate-800' : ''}>৳{pkg.price?.toLocaleString('en-BD') ?? '—'}</span>
									</div>
								{/each}
							</div>
						{:else}
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
						{/if}
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

<!-- Full Interactive Template Preview Modal -->
<ThemeComponentPreviewModal
	isOpen={isPreviewModalOpen}
	title={previewModalTemplate === 'style_3_lighthouse'
		? 'Style 3: The Color Lighthouse Funnel'
		: previewModalTemplate === 'style_2_direct'
			? 'Style 2: Sarder Seed Direct Checkout'
			: 'Style 1: Modern Animated Landing'}
	subtitle={previewModalTemplate === 'style_3_lighthouse'
		? 'thecolorlighthouse.com স্টাইলে ম্যাজেন্টা থিম, স্প্লিট ২-কলাম চেকআউট, বেনিফিট শোকেস ও ইন্টারেক্টিভ FAQ'
		: previewModalTemplate === 'style_2_direct'
			? 'sarderseed.com স্টাইলে প্যাকেজ বান্ডেল, ৪টি বুলেট পয়েন্ট ও ১-পেজ সরাসরি চেকআউট প্রিভিউ'
			: 'আর্জেন্সি কাউন্টডাউন, ফটো ক্যারোসেল, কাস্টমার রিভিউ ও স্টিকি মোবাইল অর্ডার বার প্রিভিউ'}
	isActive={template === previewModalTemplate}
	activateLabel="এই টেমপ্লেটটি সক্রিয় করুন"
	defaultViewport="desktop"
	onClose={() => (isPreviewModalOpen = false)}
	onActivate={activatePreviewedTemplate}
>
	{#if previewModalTemplate === 'style_3_lighthouse'}
		<Style3_LighthouseFunnel landingPage={previewLandingPage} />
	{:else}
		{#if previewModalTemplate === 'style_2_direct'}
			<Style2_DirectCheckout landingPage={previewLandingPage} />
		{:else}
			<Style1_ModernAnimated landingPage={previewLandingPage} />
		{/if}
	{/if}
</ThemeComponentPreviewModal>

