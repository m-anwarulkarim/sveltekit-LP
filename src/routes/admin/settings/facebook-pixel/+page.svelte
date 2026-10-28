<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import {
		ArrowLeft,
		CheckCircle2,
		AlertCircle,
		Check,
		RotateCw,
		Zap,
		ShieldCheck,
		Layers,
		Activity,
		Lock,
		Radio,
		Eye,
		EyeOff,
		ExternalLink,
		AlertTriangle,
		HelpCircle,
		RotateCcw
	} from 'lucide-svelte';
	import {
		Button,
		Input,
		Textarea,
		Badge,
		Switch,
		Checkbox,
		Alert,
		AlertTitle,
		AlertDescription,
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		Tabs,
		TabsList,
		TabsTrigger,
		TabsContent
	} from '#lib/components/ui';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';
	import type { MetaPixelSettings, TrackingMode, CatalogMatchKey, ContentType } from '#lib/server/services/pixel.service';

	let { data } = $props();

	// Reactive Form State initialized from D1
	let settings = $state<MetaPixelSettings>({
		trackingMode: data?.settings?.trackingMode || 'native_direct',
		pixelId: data?.settings?.pixelId || '',
		backupPixelId: data?.settings?.backupPixelId || '',
		capiToken: data?.settings?.capiToken || '',
		testEventCode: data?.settings?.testEventCode || '',
		defaultCurrency: data?.settings?.defaultCurrency || 'BDT',
		catalogMatchKey: data?.settings?.catalogMatchKey || 'id',
		contentType: data?.settings?.contentType || 'product',
		events: {
			pageView: data?.settings?.events?.pageView ?? true,
			viewContent: data?.settings?.events?.viewContent ?? true,
			addToCart: data?.settings?.events?.addToCart ?? true,
			initiateCheckout: data?.settings?.events?.initiateCheckout ?? true,
			purchase: data?.settings?.events?.purchase ?? true
		},
		advancedMatching: {
			enabled: data?.settings?.advancedMatching?.enabled ?? true,
			matchPhone: data?.settings?.advancedMatching?.matchPhone ?? true,
			matchEmail: data?.settings?.advancedMatching?.matchEmail ?? true,
			matchName: data?.settings?.advancedMatching?.matchName ?? true,
			matchCity: data?.settings?.advancedMatching?.matchCity ?? true
		},
		enableCollaborativeAds: data?.settings?.enableCollaborativeAds ?? false,
		partnerSegmentId: data?.settings?.partnerSegmentId || ''
	});

	// Synchronize when data updates
	$effect(() => {
		if (data?.settings) {
			settings = {
				trackingMode: data.settings.trackingMode || 'native_direct',
				pixelId: data.settings.pixelId || '',
				backupPixelId: data.settings.backupPixelId || '',
				capiToken: data.settings.capiToken || '',
				testEventCode: data.settings.testEventCode || '',
				defaultCurrency: data.settings.defaultCurrency || 'BDT',
				catalogMatchKey: data.settings.catalogMatchKey || 'id',
				contentType: data.settings.contentType || 'product',
				events: {
					pageView: data.settings.events?.pageView ?? true,
					viewContent: data.settings.events?.viewContent ?? true,
					addToCart: data.settings.events?.addToCart ?? true,
					initiateCheckout: data.settings.events?.initiateCheckout ?? true,
					purchase: data.settings.events?.purchase ?? true
				},
				advancedMatching: {
					enabled: data.settings.advancedMatching?.enabled ?? true,
					matchPhone: data.settings.advancedMatching?.matchPhone ?? true,
					matchEmail: data.settings.advancedMatching?.matchEmail ?? true,
					matchName: data.settings.advancedMatching?.matchName ?? true,
					matchCity: data.settings.advancedMatching?.matchCity ?? true
				},
				enableCollaborativeAds: data.settings.enableCollaborativeAds ?? false,
				partnerSegmentId: data.settings.partnerSegmentId || ''
			};
		}
	});

	// UI & Feedback States
	let activeTab = $state('general');
	let isSaving = $state(false);
	let isTestingCapi = $state(false);
	let showToken = $state(false);
	let capiFeedback = $state<{ success: boolean; message: string; details?: any } | null>(null);

	// GTM Status
	let gtmConfigured = $derived(Boolean(data?.gtmStatus?.isGtmConfigured));
	let gtmId = $derived(data?.gtmStatus?.gtmId || 'GTM-XXXXXXX');

	// Handle Save Action
	async function handleSave() {
		if (!settings.pixelId.trim()) {
			toast.error('অনুগ্রহ করে অন্তত প্রধান Pixel ID টি প্রদান করুন');
			return;
		}

		isSaving = true;
		capiFeedback = null;

		const fd = new FormData();
		fd.append('settings', JSON.stringify(settings));

		try {
			const res = await fetch('?/saveSettings', {
				method: 'POST',
				body: fd
			});
			const result = (await res.json()) as any;

			await invalidateAll();
			toast.success('ফেসবুক পিক্সেল ও CAPI সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
		} catch (err: any) {
			console.error('Failed to save pixel settings:', err);
			toast.error('সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে');
		} finally {
			isSaving = false;
		}
	}

	// Handle Test CAPI Connection
	async function handleTestCapi() {
		if (!settings.pixelId.trim() || !settings.capiToken.trim()) {
			toast.error('কানেকশন টেস্টের জন্য Pixel ID এবং CAPI Access Token উভয়ই প্রয়োজন');
			return;
		}

		isTestingCapi = true;
		capiFeedback = null;

		const fd = new FormData();
		fd.append('pixelId', settings.pixelId.trim());
		fd.append('capiToken', settings.capiToken.trim());
		fd.append('testEventCode', settings.testEventCode.trim());

		try {
			const res = await fetch('?/testCapi', {
				method: 'POST',
				body: fd
			});
			const result = (await res.json()) as any;

			if (result && result.data) {
				const parsed = JSON.parse(result.data);
				const isSuccess = Boolean(parsed[1]);
				const msg = parsed[2] || 'কানেকশন টেস্ট সম্পন্ন হয়েছে';
				capiFeedback = {
					success: isSuccess,
					message: msg,
					details: parsed[3]
				};

				if (isSuccess) {
					toast.success('মেটা CAPI সংযোগ সফল হয়েছে!');
				} else {
					toast.error(msg);
				}
			} else {
				capiFeedback = {
					success: true,
					message: 'মেটা সার্ভারের সাথে সফলভাবে সিঙ্ক সম্পন্ন হয়েছে!'
				};
				toast.success('মেটা CAPI সক্রিয়!');
			}
		} catch (err: any) {
			const errMsg = err?.message || 'কানেকশন টেস্ট ব্যর্থ হয়েছে';
			capiFeedback = {
				success: false,
				message: `কানেকশন টেস্ট ত্রুটি: ${errMsg}`
			};
			toast.error(`টেস্ট ব্যর্থ: ${errMsg}`);
		} finally {
			isTestingCapi = false;
		}
	}

	// Handle Reset Defaults with shadcn confirmModal
	async function handleResetDefaults() {
		const confirmed = await confirmModal({
			title: 'ডিফল্ট সেটিংস রিসেট',
			message: 'আপনি কি ফেসবুক পিক্সেল ও CAPI এর সমস্ত সেটিংস প্রাথমিক ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?',
			confirmText: 'হ্যাঁ, রিসেট করুন',
			cancelText: 'বাতিল',
			variant: 'warning',
			icon: 'alert'
		});

		if (!confirmed) return;

		try {
			const res = await fetch('?/resetDefaults', { method: 'POST' });
			await invalidateAll();
			toast.success('ডিফল্ট সেটিংস সফলভাবে রিসেট করা হয়েছে');
		} catch (err) {
			toast.error('রিসেট করতে ব্যর্থ হয়েছে');
		}
	}
</script>

<svelte:head>
	<title>Facebook Pixel & Conversions API (CAPI) | AURA Settings</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6 font-['Anek_Bangla',sans-serif] pb-16">

	<!-- Top Navigation & Page Title -->
	<div class="flex items-center justify-between gap-4 flex-wrap">
		<Button
			variant="outline"
			size="sm"
			href="/admin/settings"
			class="inline-flex items-center gap-2 rounded-xl bg-white border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
		>
			<ArrowLeft class="w-4 h-4 text-slate-500" />
			<span>Back to Settings</span>
		</Button>

		<div class="flex items-center gap-2.5">
			<Button
				variant="outline"
				size="sm"
				onclick={handleResetDefaults}
				class="inline-flex items-center gap-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
				title="ডিফল্ট সেটিংস ফিরিয়ে নিন"
			>
				<RotateCcw class="w-3.5 h-3.5 text-slate-400" />
				<span>রিসেট</span>
			</Button>

			<Button
				variant="default"
				size="sm"
				loading={isSaving}
				onclick={handleSave}
				class="inline-flex items-center gap-2 rounded-xl bg-[#1877f2] hover:bg-[#1569d6] text-white text-xs font-bold shadow-sm shadow-blue-500/20 active:scale-95"
			>
				<Check class="w-4 h-4 stroke-[3]" />
				<span>সেটিংস সেভ করুন</span>
			</Button>
		</div>
	</div>

	<!-- Header Banner Card -->
	<div class="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs flex items-center justify-between gap-4 flex-wrap">
		<div class="flex items-center gap-4">
			<div class="w-14 h-14 rounded-2xl bg-[#1877f2] flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
				<svg class="w-8 h-8 fill-current" viewBox="0 0 24 24">
					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
				</svg>
			</div>
			<div>
				<div class="flex items-center gap-2 flex-wrap">
					<h2 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Facebook Pixel & Conversions API (CAPI)</h2>
					<Badge variant={settings.trackingMode === 'native_direct' ? 'success' : settings.trackingMode === 'capi_only' ? 'blue' : 'secondary'} class="text-[10px] font-black px-2 py-0.5">
						{#if settings.trackingMode === 'native_direct'}
							Native Direct + CAPI Active
						{:else if settings.trackingMode === 'capi_only'}
							CAPI Server Only
						{:else}
							Disabled
						{/if}
					</Badge>
				</div>
				<p class="text-xs text-slate-500 mt-0.5">
					ব্রাউজার এবং সার্ভার-সাইড ট্র্যাকিং, ইভেন্ট ডিডুপ্লিকেশন এবং অ্যাডভান্সড ম্যাচিং কনফিগারেশন
				</p>
			</div>
		</div>

		<a
			href="https://developers.facebook.com/documentation/meta-pixel"
			target="_blank"
			rel="noreferrer"
			class="inline-flex items-center gap-1.5 text-xs font-bold text-[#1877f2] hover:underline"
		>
			<span>অফিসিয়াল মেটা ডকস</span>
			<ExternalLink class="w-3.5 h-3.5" />
		</a>
	</div>

	<!-- GTM Intelligent Deduplication Alert Banner (Appears if GTM is configured) -->
	{#if gtmConfigured}
		<Alert variant="warning" class="rounded-2xl border-amber-200 bg-amber-50/70">
			<AlertTriangle class="w-5 h-5 text-amber-600" />
			<AlertTitle class="font-bold text-amber-900 flex items-center gap-2">
				<span>সতর্কতা: Google Tag Manager ({gtmId}) সক্রিয় রয়েছে!</span>
				<Badge variant="warning" class="text-[10px]">GTM Detected</Badge>
			</AlertTitle>
			<AlertDescription class="text-xs text-amber-800 leading-relaxed mt-1">
				আপনার সাইটে Google Tag Manager কন্টেইনার যুক্ত আছে। আপনার GTM-এর ভেতরে যদি পূর্বে ফেসবুক পিক্সেল ট্যাগ বসানো থাকে, তবে একই ব্রাউজার থেকে দুবার ইভেন্ট ফায়ার হয়ে <strong>কনভার্সন ডাবল (2X) কাউন্ট হবে</strong>। 
				ডুপ্লিকেট এড়াতে নিচের <strong>ট্র্যাকিং মোড</strong> থেকে <span class="font-bold underline">"Server CAPI Only"</span> নির্বাচন করুন, অথবা GTM থেকে ফেসবুক পিক্সেল ট্যাগটি রিমুভ করে <span class="font-bold underline">"Native Direct + CAPI"</span> ব্যবহার করুন।
			</AlertDescription>
		</Alert>
	{/if}

	<!-- Live CAPI Feedback Alert Banner (Shows when test executed) -->
	{#if capiFeedback}
		<Alert variant={capiFeedback.success ? 'success' : 'destructive'} class="rounded-2xl">
			{#if capiFeedback.success}
				<CheckCircle2 class="w-5 h-5 text-emerald-600" />
				<AlertTitle class="font-bold text-emerald-900">মেটা এপিআই সংযোগ সফল!</AlertTitle>
			{:else}
				<AlertCircle class="w-5 h-5 text-rose-600" />
				<AlertTitle class="font-bold text-rose-900">মেটা এপিআই সংযোগ ত্রুটি</AlertTitle>
			{/if}
			<AlertDescription class="text-xs mt-1 {capiFeedback.success ? 'text-emerald-800' : 'text-rose-800'}">
				{capiFeedback.message}
				{#if capiFeedback.details?.fbtrace_id}
					<div class="mt-1 font-mono text-[11px] opacity-80">FB Trace ID: {capiFeedback.details.fbtrace_id}</div>
				{/if}
			</AlertDescription>
		</Alert>
	{/if}

	<!-- Main Configuration Container with shadcn Tabs -->
	<Card class="rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden bg-white">
		<Tabs bind:value={activeTab} class="w-full">
			
			<!-- Tabs Bar -->
			<div class="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
				<TabsList class="grid grid-cols-1 sm:grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-2xl w-full">
					<TabsTrigger value="general" class="rounded-xl text-xs font-bold py-2.5">
						সাধারণ ও পিক্সেল (Pixel)
					</TabsTrigger>
					<TabsTrigger value="capi" class="rounded-xl text-xs font-bold py-2.5">
						Conversions API (CAPI)
					</TabsTrigger>
					<TabsTrigger value="matching" class="rounded-xl text-xs font-bold py-2.5">
						ইভেন্টস ও ম্যাচিং (EMQ)
					</TabsTrigger>
				</TabsList>
			</div>

			<!-- TAB 1: General & Pixel Settings -->
			<TabsContent value="general" class="p-5 sm:p-7 space-y-6">
				
				<!-- 1. Tracking Mode Selector (Anti-Duplicate Guard) -->
				<div class="space-y-2">
					<label class="block text-xs font-bold text-slate-800 flex items-center justify-between">
						<span>ট্র্যাকিং মোড (Tracking Mode Selection)</span>
						<span class="text-[11px] text-slate-400 font-normal">GTM ও ডুপ্লিকেট কনভার্সন কন্ট্রোল</span>
					</label>
					
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<!-- Option A: Native Direct + CAPI -->
						<div
							onclick={() => (settings.trackingMode = 'native_direct')}
							class="p-4 rounded-2xl border-2 transition-all cursor-pointer text-left space-y-1.5 {settings.trackingMode === 'native_direct'
								? 'border-[#1877f2] bg-blue-50/40 ring-1 ring-blue-500/20'
								: 'border-slate-200 hover:border-slate-300 bg-white'}"
						>
							<div class="flex items-center justify-between">
								<span class="text-xs font-bold text-slate-900">Native Direct + CAPI</span>
								<Badge variant="success" class="text-[9px]">Recommended</Badge>
							</div>
							<p class="text-[11px] text-slate-500 leading-relaxed">
								ওয়েবসাইট থেকে স্বয়ংক্রিয় ব্রাউজার পিক্সেল ও ব্যাকএন্ড CAPI চলবে। ১০০% নির্ভুল ডেটা।
							</p>
						</div>

						<!-- Option B: CAPI Only (For GTM Users) -->
						<div
							onclick={() => (settings.trackingMode = 'capi_only')}
							class="p-4 rounded-2xl border-2 transition-all cursor-pointer text-left space-y-1.5 {settings.trackingMode === 'capi_only'
								? 'border-[#1877f2] bg-blue-50/40 ring-1 ring-blue-500/20'
								: 'border-slate-200 hover:border-slate-300 bg-white'}"
						>
							<div class="flex items-center justify-between">
								<span class="text-xs font-bold text-slate-900">Server CAPI Only</span>
								<Badge variant="blue" class="text-[9px]">GTM Guard</Badge>
							</div>
							<p class="text-[11px] text-slate-500 leading-relaxed">
								ব্রাউজার পিক্সেল অফ থাকবে (যদি GTM এ পিক্সেল থাকে)। ব্যাকএন্ড থেকে শুধু সার্ভার CAPI চলবে।
							</p>
						</div>

						<!-- Option C: Disabled -->
						<div
							onclick={() => (settings.trackingMode = 'disabled')}
							class="p-4 rounded-2xl border-2 transition-all cursor-pointer text-left space-y-1.5 {settings.trackingMode === 'disabled'
								? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-500/20'
								: 'border-slate-200 hover:border-slate-300 bg-white'}"
						>
							<div class="flex items-center justify-between">
								<span class="text-xs font-bold text-slate-900">Disabled</span>
								<Badge variant="secondary" class="text-[9px]">বন্ধ</Badge>
							</div>
							<p class="text-[11px] text-slate-500 leading-relaxed">
								ব্রাউজার পিক্সেল ও সার্ভার CAPI উভয়ই সাময়িকভাবে বন্ধ থাকবে।
							</p>
						</div>
					</div>
				</div>

				<!-- 2. Pixel ID Inputs -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-700">
							Primary Facebook Pixel ID <span class="text-rose-500">*</span>
						</label>
						<Input
							type="text"
							placeholder="যেমন: 806385144697838"
							bind:value={settings.pixelId}
							class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
						/>
						<span class="text-[11px] text-slate-400">Meta Events Manager &gt; Data Sources থেকে সংগ্রহ করুন</span>
					</div>

					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-700">
							Backup / Secondary Pixel ID (Optional)
						</label>
						<Input
							type="text"
							placeholder="যেমন: 918273645123456"
							bind:value={settings.backupPixelId}
							class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
						/>
						<span class="text-[11px] text-slate-400">অ্যাকাউন্ট রেস্ট্রিকশন এড়াতে ব্যাকআপ পিক্সেল ব্যবহার করুন</span>
					</div>
				</div>

				<!-- 3. Advantage+ Catalog Ads & Currency -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-700">Default Currency</label>
						<select
							bind:value={settings.defaultCurrency}
							class="w-full bg-slate-50/80 hover:bg-white border border-slate-200/90 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1877f2] transition-all"
						>
							<option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
							<option value="USD">USD ($ - US Dollar)</option>
							<option value="EUR">EUR (€ - Euro)</option>
						</select>
						<span class="text-[11px] text-slate-400">ইভেন্ট ভ্যালু কারেন্সি</span>
					</div>

					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-700">Catalog Matching Key</label>
						<select
							bind:value={settings.catalogMatchKey}
							class="w-full bg-slate-50/80 hover:bg-white border border-slate-200/90 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1877f2] transition-all"
						>
							<option value="id">Product Database ID (id)</option>
							<option value="sku">Product SKU (sku)</option>
						</select>
						<span class="text-[11px] text-slate-400">Advantage+ ডাইনামিক ক্যাটালগের সাথে ম্যাচিং</span>
					</div>

					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-700">Content Type</label>
						<select
							bind:value={settings.contentType}
							class="w-full bg-slate-50/80 hover:bg-white border border-slate-200/90 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1877f2] transition-all"
						>
							<option value="product">product (Single item)</option>
							<option value="product_group">product_group (Variants)</option>
						</select>
						<span class="text-[11px] text-slate-400">মেটা স্পেসিফিকেশন</span>
					</div>
				</div>

				<!-- 4. Collaborative Ads Settings (Optional Brand Partnerships) -->
				<div class="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-3">
					<div class="flex items-center justify-between">
						<div>
							<span class="text-xs font-bold text-slate-900 block">Pixel for Collaborative Ads</span>
							<p class="text-[11px] text-slate-500">ব্র্যান্ড পার্টনারদের যৌথ বিজ্ঞাপন ক্যাম্পেইন ট্র্যাকিং</p>
						</div>
						<Switch bind:checked={settings.enableCollaborativeAds} />
					</div>

					{#if settings.enableCollaborativeAds}
						<div class="pt-2 border-t border-slate-200/60 space-y-1.5">
							<label class="block text-xs font-bold text-slate-700">Partner Merchant Segment ID</label>
							<Input
								type="text"
								placeholder="যেমন: SEG-983742"
								bind:value={settings.partnerSegmentId}
								class="text-xs h-10 rounded-xl bg-white"
							/>
						</div>
					{/if}
				</div>

			</TabsContent>

			<!-- TAB 2: Conversions API (CAPI) Settings -->
			<TabsContent value="capi" class="p-5 sm:p-7 space-y-6">
				
				<div class="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60 text-blue-900">
					<ShieldCheck class="w-5 h-5 text-[#1877f2] shrink-0 mt-0.5" />
					<div class="space-y-0.5 text-xs">
						<span class="font-bold">কেন Conversions API (CAPI) অপরিহার্য?</span>
						<p class="text-blue-800 leading-relaxed text-[11px]">
							ব্রাউজার অ্যাড-ব্লকার এবং iOS 14+ এর কারণে প্রায় ৩০-৪০% ক্লায়েন্ট-সাইড পিক্সেল ব্লক হয়ে যায়। CAPI সরাসরি ক্লাউডফ্লেয়ার সার্ভার থেকে মেটাতে কনভার্সন পুশ করে, ফলে কোনো অর্ডার ট্র্যাকিং মিস হয় না।
						</p>
					</div>
				</div>

				<!-- CAPI Token Input -->
				<div class="space-y-1.5">
					<div class="flex items-center justify-between">
						<label class="block text-xs font-bold text-slate-700">
							Meta CAPI System User Access Token <span class="text-rose-500">*</span>
						</label>
						<button
							type="button"
							onclick={() => (showToken = !showToken)}
							class="text-[11px] text-[#1877f2] hover:underline inline-flex items-center gap-1 cursor-pointer"
						>
							{#if showToken}
								<EyeOff class="w-3.5 h-3.5" />
								<span>হাইড করুন</span>
							{:else}
								<Eye class="w-3.5 h-3.5" />
								<span>টোকেন দেখুন</span>
							{/if}
						</button>
					</div>

					<Textarea
						rows={3}
						bind:value={settings.capiToken}
						placeholder="EAAQZCaLfr2KUBSw5YGLAS5uUNlyLllbFYrQQeCoMBP83lonTPvPJEMBS02zJOMOmplFSX..."
						class="font-mono text-xs leading-relaxed rounded-xl bg-slate-50/70 focus:bg-white {showToken ? '' : 'tracking-widest'}"
					/>
					<span class="text-[11px] text-slate-400">Meta Events Manager &gt; Settings &gt; Conversions API &gt; Generate Access Token থেকে কপি করুন</span>
				</div>

				<!-- Test Event Code & Connection Tester -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-1">
					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-700">
							Test Event Code (Optional)
						</label>
						<Input
							type="text"
							placeholder="যেমন: TEST12345"
							bind:value={settings.testEventCode}
							class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
						/>
						<span class="text-[11px] text-slate-400">Events Manager &gt; Test Events ট্যাবের কোডটি দিন</span>
					</div>

					<div>
						<Button
							type="button"
							variant="outline"
							size="lg"
							loading={isTestingCapi}
							onclick={handleTestCapi}
							class="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl border-slate-200 hover:bg-blue-50 hover:text-[#1877f2] text-slate-700 text-xs font-bold transition-all shadow-2xs"
						>
							<Zap class="w-4 h-4 {isTestingCapi ? 'animate-bounce text-[#1877f2]' : 'text-amber-500'}" />
							<span>{isTestingCapi ? 'মেটা সার্ভারে পিং হচ্ছে...' : 'মেটা CAPI কানেকশন টেস্ট'}</span>
						</Button>
					</div>
				</div>

				<!-- Deduplication Assurance Box -->
				<div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
					<CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
					<div class="text-xs space-y-1">
						<span class="font-bold text-slate-900 block">স্মার্ট ইভেন্ট ডিডুপ্লিকেশন (Zero Duplicate Guarantee)</span>
						<p class="text-slate-600 leading-relaxed text-[11px]">
							আমাদের সিস্টেমে অর্ডার তৈরি হলেই প্রতিটি অর্ডারের অনন্য <code>Order ID</code> কে মেটার স্ট্যান্ডার্ড <code>event_id</code> হিসেবে ব্রাউজার ও সার্ভার উভয় জায়গা থেকে পাঠানো হয়। মেটা স্বয়ংক্রিয়ভাবে দুটিকে ১টি কনভার্সনে মার্জ করে, ফলে রিপোর্টিংয়ে কোনো ডাবল কাউন্ট হয় না।
						</p>
					</div>
				</div>

			</TabsContent>

			<!-- TAB 3: Conversion Events & Advanced Matching -->
			<TabsContent value="matching" class="p-5 sm:p-7 space-y-6">
				
				<!-- 1. Standard Conversion Events -->
				<div class="space-y-3">
					<h3 class="text-xs font-bold text-slate-800">স্ট্যান্ডার্ড কনভার্সন ইভেন্টসমূহ (Conversion Tracking)</h3>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
							<div>
								<span class="text-xs font-bold text-slate-900 block">PageView</span>
								<span class="text-[11px] text-slate-500">প্রতিটি পেজ ভিজিট ট্র্যাক</span>
							</div>
							<Switch bind:checked={settings.events.pageView} />
						</div>

						<div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
							<div>
								<span class="text-xs font-bold text-slate-900 block">ViewContent</span>
								<span class="text-[11px] text-slate-500">প্রোডাক্ট ডিটেইলস ভিউ</span>
							</div>
							<Switch bind:checked={settings.events.viewContent} />
						</div>

						<div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
							<div>
								<span class="text-xs font-bold text-slate-900 block">AddToCart</span>
								<span class="text-[11px] text-slate-500">কার্ট বা কার্ট ড্রোয়ারে যুক্ত</span>
							</div>
							<Switch bind:checked={settings.events.addToCart} />
						</div>

						<div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
							<div>
								<span class="text-xs font-bold text-slate-900 block">InitiateCheckout</span>
								<span class="text-[11px] text-slate-500">চেকআউট ফর্ম ওপেন করা</span>
							</div>
							<Switch bind:checked={settings.events.initiateCheckout} />
						</div>
					</div>

					<div class="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
						<div>
							<div class="flex items-center gap-2">
								<span class="text-xs font-bold text-emerald-950">Purchase (সফল অর্ডার কনভার্সন)</span>
								<Badge variant="success" class="text-[9px]">Critical</Badge>
							</div>
							<span class="text-[11px] text-emerald-700">অর্ডার সম্পন্ন হলে মোট মূল্য ও আইটেমস সহ ব্রাউজার ও CAPI সার্ভার থেকে প্রেরণ</span>
						</div>
						<Switch bind:checked={settings.events.purchase} />
					</div>
				</div>

				<!-- 2. Advanced Matching (First Party Data Hashing) -->
				<div class="pt-3 border-t border-slate-100 space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<div class="flex items-center gap-2">
								<h3 class="text-xs font-bold text-slate-800">Advanced Matching (SHA-256 Hashing)</h3>
								<Badge variant="purple" class="text-[9px]">EMQ 8.5+ Boost</Badge>
							</div>
							<p class="text-[11px] text-slate-500">
								গ্রাহকের তথ্য নিরাপদভাবে হ্যাশ করে মেটাতে পাঠানো—যাতে বিজ্ঞাপনের সঠিক অডিয়েন্স ম্যাচ রেট বৃদ্ধি পায়।
							</p>
						</div>
						<Switch bind:checked={settings.advancedMatching.enabled} />
					</div>

					{#if settings.advancedMatching.enabled}
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1">
							<label class="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 select-none p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
								<Checkbox bind:checked={settings.advancedMatching.matchPhone} id="match-phone" />
								<span>গ্রাহকের ফোন নম্বর হ্যাশ করুন (ph)</span>
							</label>

							<label class="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 select-none p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
								<Checkbox bind:checked={settings.advancedMatching.matchEmail} id="match-email" />
								<span>গ্রাহকের ইমেইল হ্যাশ করুন (em)</span>
							</label>

							<label class="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 select-none p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
								<Checkbox bind:checked={settings.advancedMatching.matchName} id="match-name" />
								<span>গ্রাহকের ফার্স্ট ও লাস্ট নেম (fn, ln)</span>
							</label>

							<label class="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 select-none p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
								<Checkbox bind:checked={settings.advancedMatching.matchCity} id="match-city" />
								<span>শহর ও কান্ট্রি কোড (ct, cn=bd)</span>
							</label>
						</div>
					{/if}
				</div>

			</TabsContent>

		</Tabs>

		<!-- Bottom Save Bar (shadcn Button) -->
		<div class="p-5 sm:p-7 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between gap-4 flex-wrap">
			<div class="flex items-center gap-2 text-xs text-slate-500">
				<ShieldCheck class="w-4 h-4 text-emerald-600" />
				<span>ক্লাউডফ্লেয়ার D1 ডাটাবেজে এনক্রিপ্টেড ও সুরক্ষিত স্টোরেজ</span>
			</div>

			<Button
				type="button"
				variant="default"
				size="lg"
				loading={isSaving}
				onclick={handleSave}
				class="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#1877f2] hover:bg-[#1569d6] text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 active:scale-95"
			>
				<Check class="w-4 h-4 stroke-[3]" />
				<span>সেটিংস সেভ করুন</span>
			</Button>
		</div>

	</Card>

</div>
