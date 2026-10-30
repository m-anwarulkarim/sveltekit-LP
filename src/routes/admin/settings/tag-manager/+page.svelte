<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import {
		ArrowLeft,
		CheckCircle2,
		AlertCircle,
		Check,
		RotateCw,
		Tag,
		ShieldCheck,
		Layers,
		Activity,
		ExternalLink,
		Info,
		RotateCcw,
		Sparkles
	} from 'lucide-svelte';
	import {
		Button,
		Input,
		Badge,
		Switch,
		Alert,
		AlertTitle,
		AlertDescription,
		Card,
		CardContent,
		CardHeader,
		CardTitle
	} from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import type { GtmSettings } from '#lib/server/services/gtm.service';

	let { data } = $props();

	// Reactive Form State initialized from D1
	let settings = $state<GtmSettings>({
		isEnabled: data?.settings?.isEnabled ?? false,
		gtmId: data?.settings?.gtmId ?? '',
		ga4MeasurementId: data?.settings?.ga4MeasurementId ?? '',
		enableDataLayer: data?.settings?.enableDataLayer ?? true,
		events: {
			pageView: data?.settings?.events?.pageView ?? true,
			viewItem: data?.settings?.events?.viewItem ?? true,
			addToCart: data?.settings?.events?.addToCart ?? true,
			removeFromCart: data?.settings?.events?.removeFromCart ?? true,
			viewCart: data?.settings?.events?.viewCart ?? true,
			beginCheckout: data?.settings?.events?.beginCheckout ?? true,
			purchase: data?.settings?.events?.purchase ?? true
		}
	});

	let isSaving = $state(false);
	let isResetting = $state(false);

	const isConfigured = $derived(
		settings.isEnabled && settings.gtmId.trim().toUpperCase().startsWith('GTM-')
	);

	async function handleSave() {
		if (settings.isEnabled && !settings.gtmId.trim()) {
			toast.error('GTM সক্রিয় রাখতে হলে Container ID (GTM-XXXXXXX) প্রদান করুন');
			return;
		}

		if (settings.gtmId.trim() && !settings.gtmId.trim().toUpperCase().startsWith('GTM-')) {
			toast.error('Container ID অবশ্যই "GTM-" দিয়ে শুরু হতে হবে (যেমন: GTM-ABC1234)');
			return;
		}

		isSaving = true;

		const fd = new FormData();
		fd.append('settings', JSON.stringify($state.snapshot(settings)));

		try {
			const res = await fetch('?/saveSettings', {
				method: 'POST',
				body: fd
			});
			const result = (await res.json()) as any;

			if (result.type === 'success' || result.status === 200) {
				await invalidateAll();
				toast.success('Google Tag Manager সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
			} else {
				toast.error(result?.data?.message || 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে');
			}
		} catch (err: any) {
			console.error('Failed to save GTM settings:', err);
			toast.error('সেটিংস সংরক্ষণে অপ্রত্যাশিত সমস্যা হয়েছে');
		} finally {
			isSaving = false;
		}
	}

	async function handleReset() {
		if (!confirm('আপনি কি নিশ্চিত যে সমস্ত GTM সেটিংস ডিফল্টে রিসেট করতে চান?')) return;
		isResetting = true;
		try {
			const res = await fetch('?/resetDefaults', {
				method: 'POST'
			});
			const result = (await res.json()) as any;
			if (result.type === 'success' || result.status === 200) {
				await invalidateAll();
				settings = {
					isEnabled: false,
					gtmId: '',
					ga4MeasurementId: '',
					enableDataLayer: true,
					events: {
						pageView: true,
						viewItem: true,
						addToCart: true,
						removeFromCart: true,
						viewCart: true,
						beginCheckout: true,
						purchase: true
					}
				};
				toast.success('GTM সেটিংস ডিফল্টে রিসেট করা হয়েছে');
			}
		} catch (err) {
			toast.error('রিসেট করতে ব্যর্থ হয়েছে');
		} finally {
			isResetting = false;
		}
	}
</script>

<svelte:head>
	<title>Google Tag Manager & GA4 E-Commerce | AURA Admin</title>
</svelte:head>

<div class="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 pb-20">
	<!-- Top Navigation & Action Bar -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
		<div class="flex items-center gap-3">
			<a href="/admin/settings">
				<Button variant="outline" size="sm" class="gap-2 rounded-xl">
					<ArrowLeft class="w-4 h-4" />
					<span>সেটিংস মেন্যু</span>
				</Button>
			</a>
			<div>
				<h1 class="text-xl font-bold text-slate-900 flex items-center gap-2">
					<Tag class="w-5 h-5 text-[#1d6ee5]" />
					<span>Google Tag Manager & DataLayer</span>
				</h1>
				<p class="text-xs text-slate-500 mt-0.5">
					অফিসিয়াল GA4 E-Commerce DataLayer ট্র্যাকিং ও কন্টেইনার ইন্টিগ্রেশন
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2 self-end sm:self-auto">
			<Button
				variant="outline"
				size="sm"
				onclick={handleReset}
				disabled={isResetting || isSaving}
				class="gap-1.5 text-slate-600 hover:text-red-600 rounded-xl"
			>
				<RotateCcw class="w-4 h-4 {isResetting ? 'animate-spin' : ''}" />
				<span>রিসেট</span>
			</Button>

			<Button
				type="button"
				onclick={handleSave}
				disabled={isSaving}
				class="gap-2 bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold rounded-xl px-5 shadow-sm"
			>
				{#if isSaving}
					<RotateCw class="w-4 h-4 animate-spin" />
					<span>সংরক্ষণ হচ্ছে...</span>
				{:else}
					<Check class="w-4 h-4" />
					<span>সেভ করুন</span>
				{/if}
			</Button>
		</div>
	</div>

	<!-- Live Status Banner -->
	<div class="p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 {isConfigured ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-amber-50/80 border-amber-200 text-amber-900'}">
		<div class="flex items-start sm:items-center gap-3">
			<div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 {isConfigured ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}">
				{#if isConfigured}
					<Activity class="w-5 h-5 animate-pulse" />
				{:else}
					<AlertCircle class="w-5 h-5" />
				{/if}
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h3 class="font-bold text-sm">
						{isConfigured ? 'GTM ট্র্যাকিং লাইভ সক্রিয়' : 'GTM ট্র্যাকিং বর্তমানে বন্ধ বা আনকনফিগার্ড'}
					</h3>
					<Badge variant={isConfigured ? 'default' : 'secondary'} class={isConfigured ? 'bg-emerald-600' : 'bg-amber-600 text-white'}>
						{isConfigured ? 'LIVE ACTIVE' : 'DISABLED'}
					</Badge>
				</div>
				<p class="text-xs opacity-90 mt-0.5">
					{isConfigured
						? `কন্টেইনার ${settings.gtmId.toUpperCase()} এর মাধ্যমে স্টোরফ্রন্টে dataLayer ইভেন্ট পাঠানো হচ্ছে`
						: 'GTM Container ID দিয়ে মাস্টার সুইচ অন করলে স্টোরফ্রন্টে ট্র্যাকিং শুরু হবে'}
				</p>
			</div>
		</div>

		<div class="flex items-center gap-3 self-end sm:self-auto bg-white/70 px-4 py-2 rounded-xl border border-inherit">
			<span class="text-xs font-bold text-slate-700">মাস্টার সুইচ</span>
			<Switch bind:checked={settings.isEnabled} />
		</div>
	</div>

	<!-- Main Settings Form -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Left: Primary Configuration (2 Cols) -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Container IDs Card -->
			<Card class="bg-white border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden">
				<CardHeader class="pb-3 border-b border-slate-100">
					<CardTitle class="text-sm font-bold text-slate-800 flex items-center gap-2">
						<Tag class="w-4 h-4 text-[#1d6ee5]" />
						<span>GTM ও GA4 পরিচিতি (IDs)</span>
					</CardTitle>
				</CardHeader>
				<CardContent class="p-6 space-y-5">
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<label for="gtm-id" class="text-xs font-bold text-slate-700">
								Google Tag Manager Container ID <span class="text-red-500">*</span>
							</label>
							<a
								href="https://tagmanager.google.com"
								target="_blank"
								rel="noopener noreferrer"
								class="text-[11px] text-[#1d6ee5] hover:underline flex items-center gap-1 font-medium"
							>
								<span>GTM কনসোল</span>
								<ExternalLink class="w-3 h-3" />
							</a>
						</div>
						<Input
							id="gtm-id"
							type="text"
							bind:value={settings.gtmId}
							placeholder="GTM-XXXXXXX"
							class="font-mono text-xs uppercase"
						/>
						<p class="text-[11px] text-slate-500">
							আপনার Google Tag Manager অ্যাকাউন্টের কন্টেইনার আইডি প্রদান করুন (যেমন: GTM-T97B4LK)
						</p>
					</div>

					<div class="space-y-2">
						<label for="ga4-id" class="text-xs font-bold text-slate-700">
							Google Analytics 4 Measurement ID (ঐচ্ছিক)
						</label>
						<Input
							id="ga4-id"
							type="text"
							bind:value={settings.ga4MeasurementId}
							placeholder="G-XXXXXXXXXX"
							class="font-mono text-xs uppercase"
						/>
						<p class="text-[11px] text-slate-500">
							যদি GTM ট্যাগে সরাসরি ভ্যারিয়েবল হিসেবে ব্যবহার করতে চান তবে GA4 Measurement ID প্রদান করুন।
						</p>
					</div>

					<div class="pt-3 border-t border-slate-100">
						<div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
							<div class="space-y-0.5">
								<span class="text-xs font-bold text-slate-800 block">Initialize window.dataLayer</span>
								<p class="text-[11px] text-slate-500">
									ওয়েবসাইটে গ্লোবাল dataLayer অ্যারে তৈরি ও ব্রাউজার পুশ সক্রিয় রাখুন
								</p>
							</div>
							<Switch bind:checked={settings.enableDataLayer} />
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- E-Commerce DataLayer Events Card -->
			<Card class="bg-white border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden">
				<CardHeader class="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
					<div>
						<CardTitle class="text-sm font-bold text-slate-800 flex items-center gap-2">
							<Layers class="w-4 h-4 text-[#1d6ee5]" />
							<span>GA4 Enhanced E-Commerce Events</span>
						</CardTitle>
						<p class="text-[11px] text-slate-500 mt-0.5">
							গুগলের অফিসিয়াল স্ট্যান্ডার্ড মেনে প্রতিটি ইভেন্টের পূর্বে <code class="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px] text-blue-700">ecommerce: null</code> স্বয়ংক্রিয়ভাবে পুশ হয়
						</p>
					</div>
				</CardHeader>
				<CardContent class="p-6 space-y-3.5">
					<!-- PageView -->
					<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
						<div>
							<span class="text-xs font-bold text-slate-800 block font-mono">page_view</span>
							<p class="text-[11px] text-slate-500">প্রতিটি পেজ পরিবর্তনের সময় পেজ পাথ ও টাইটেল পুশ</p>
						</div>
						<Switch bind:checked={settings.events.pageView} />
					</div>

					<!-- View Item -->
					<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
						<div>
							<span class="text-xs font-bold text-slate-800 block font-mono">view_item</span>
							<p class="text-[11px] text-slate-500">পণ্য বিস্তারিত পেজে পণ্যের আইডি, মূল্য, নাম ও ক্যাটাগরি পুশ</p>
						</div>
						<Switch bind:checked={settings.events.viewItem} />
					</div>

					<!-- Add To Cart -->
					<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
						<div>
							<span class="text-xs font-bold text-slate-800 block font-mono">add_to_cart</span>
							<p class="text-[11px] text-slate-500">কার্ট বা ফ্লোটিং বাটনে পণ্য যুক্ত করার সময় ইভেন্ট পুশ</p>
						</div>
						<Switch bind:checked={settings.events.addToCart} />
					</div>

					<!-- Remove From Cart -->
					<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
						<div>
							<span class="text-xs font-bold text-slate-800 block font-mono">remove_from_cart</span>
							<p class="text-[11px] text-slate-500">কার্ট থেকে কোনো পণ্য ডিলিট করলে ইভেন্ট পাঠানো</p>
						</div>
						<Switch bind:checked={settings.events.removeFromCart} />
					</div>

					<!-- View Cart -->
					<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
						<div>
							<span class="text-xs font-bold text-slate-800 block font-mono">view_cart</span>
							<p class="text-[11px] text-slate-500">কার্ট ড্রয়ার ওপেন করলে কার্টের সমস্ত আইটেম ও সাবটোটাল পুশ</p>
						</div>
						<Switch bind:checked={settings.events.viewCart} />
					</div>

					<!-- Begin Checkout -->
					<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
						<div>
							<span class="text-xs font-bold text-slate-800 block font-mono">begin_checkout</span>
							<p class="text-[11px] text-slate-500">চেকআউট পেজ বা পপআপে প্রবেশের সময় কার্ট আইটেম ও মোট মূল্য পুশ</p>
						</div>
						<Switch bind:checked={settings.events.beginCheckout} />
					</div>

					<!-- Purchase -->
					<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
						<div>
							<span class="text-xs font-bold text-slate-800 block font-mono">purchase</span>
							<p class="text-[11px] text-slate-500">সফল অর্ডারের অর্ডার নাম্বার, মোট টাকা, ডেলিভারি চার্জ ও আইটেমস পুশ (একবারই ফায়ার হবে)</p>
						</div>
						<Switch bind:checked={settings.events.purchase} />
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Right: Guarantees & Architecture Guidelines (1 Col) -->
		<div class="space-y-6">
			<!-- GA4 Standard Compliance Card -->
			<Card class="bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-200/70 shadow-2xs rounded-3xl">
				<CardHeader class="pb-3 border-b border-blue-100">
					<CardTitle class="text-sm font-bold text-blue-900 flex items-center gap-2">
						<ShieldCheck class="w-4 h-4 text-[#1d6ee5]" />
						<span>১০০% প্রফেশনাল স্পেক</span>
					</CardTitle>
				</CardHeader>
				<CardContent class="p-5 space-y-3.5 text-xs text-blue-950/80 leading-relaxed">
					<div class="flex items-start gap-2.5">
						<Sparkles class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
						<div>
							<span class="font-bold text-slate-900 block">জিরো ডেটা পলিউশন গ্যারান্টি:</span>
							গুগলের নিয়ম অনুসারে যেকোনো ই-কমার্স ইভেন্টের আগে ডেটালেয়ার সম্পূর্ণ ফাঁকা করতে হয়। আমাদের ইঞ্জিনে স্বয়ংক্রিয়ভাবে <code class="bg-blue-100/80 px-1 py-0.5 rounded font-mono text-[10px]">dataLayer.push(&#123; ecommerce: null &#125;)</code> এক্সিকিউট হয়।
						</div>
					</div>

					<div class="flex items-start gap-2.5">
						<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
						<div>
							<span class="font-bold text-slate-900 block">ফেসবুক পিক্সেল সংঘর্ষমুক্ত:</span>
							ফেসবুক পিক্সেল সরাসরি <code class="bg-blue-100/80 px-1 py-0.5 rounded font-mono text-[10px]">fbq()</code> মেথডে কাজ করে, আর জিটিএম কাজ করে <code class="bg-blue-100/80 px-1 py-0.5 rounded font-mono text-[10px]">dataLayer</code> এ। একটির কারণে অন্যটিতে কোনো ডুপ্লিকেট বা কনফ্লিক্ট তৈরি হবে না।
						</div>
					</div>

					<div class="flex items-start gap-2.5">
						<Info class="w-4 h-4 text-[#1d6ee5] shrink-0 mt-0.5" />
						<div>
							<span class="font-bold text-slate-900 block">ইডেমপোটেন্ট পারচেজ ইভেন্ট:</span>
							থ্যাংক-ইউ পেজ রিফ্রেশ করলেও কাস্টমারের ব্রাউজারে ডাবল পারচেজ ইভেন্ট কাউন্ট রোধে ইউনিক <code class="bg-blue-100/80 px-1 py-0.5 rounded font-mono text-[10px]">transaction_id</code> গার্ড রয়েছে।
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Quick Setup Steps Card -->
			<Card class="bg-white border-slate-200/90 shadow-2xs rounded-3xl">
				<CardHeader class="pb-3 border-b border-slate-100">
					<CardTitle class="text-sm font-bold text-slate-800">
						কীভাবে সেটআপ করবেন?
					</CardTitle>
				</CardHeader>
				<CardContent class="p-5 space-y-3 text-xs text-slate-600">
					<ol class="list-decimal list-inside space-y-2 leading-relaxed">
						<li>
							<strong class="text-slate-800">GTM কনসোল</strong> থেকে আপনার কন্টেইনার আইডি (যেমন: <code class="font-mono text-blue-600">GTM-XXXXXXX</code>) কপি করুন।
						</li>
						<li>
							বামের বক্সে পেস্ট করে <strong>মাস্টার সুইচ অন</strong> করুন।
						</li>
						<li>
							উপরে থাকা <strong>"সেভ করুন"</strong> বাটনে ক্লিক করুন।
						</li>
						<li>
							GTM প্রিভিউ মোডে আপনার ওয়েবসাইটে গিয়ে ইভেন্ট ও ডেটালেয়ার প্যারামিটার পরীক্ষা করুন।
						</li>
					</ol>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
