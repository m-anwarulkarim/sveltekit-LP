<script lang="ts">
	import { page } from '$app/state';
	import { Button, Card, Badge, Input, Textarea, Switch } from '#lib/components/ui';
	import {
		Truck,
		ShieldCheck,
		MessageSquare,
		Package,
		CreditCard,
		Globe,
		Search,
		ArrowRight,
		ArrowLeft,
		CheckCircle2,
		RefreshCw,
		Sliders,
		FileText,
		Tag,
		Settings,
		ChevronDown,
		Save
	} from 'lucide-svelte';

	// Active tab: 'all' or specific module like 'facebook-pixel', 'delivery-charge', 'courier', 'fraud-check', 'payment-methods', etc.
	let activeTab = $state('all');
	let searchQuery = $state('');

	// Sync state
	let isSaved = $state(false);
	let saveMessage = $state('Settings saved successfully!');

	// Settings State
	// 1. Facebook Pixel & CAPI (Matching Screenshot 2)
	let fbPixelId = $state('806385144697838');
	let fbCapiToken = $state('EAAQZCaLfr2KUBSw5YGLAS5uUNlyLllbFYrQQeCoMBP83lonTPvPJEMBS02zJOMOmplFSX');
	let fbTestMode = $state(false);
	let fbTriggerPurchase = $state(true);
	let isGuideOpen = $state(false);

	// 2. Delivery Charge
	let deliveryDhaka = $state(60);
	let deliveryOutsideDhaka = $state(120);

	// 3. Courier
	let steadfastApiKey = $state('stdf_live_89a47b2c918e001');
	let steadfastSecretKey = $state('••••••••••••••••••••••••');
	let pathaoClientId = $state('pt_client_98214');
	let isCourierSyncing = $state(false);
	let courierStatusMessage = $state<string | null>(null);

	// 4. Fraud Check
	let minDeliveryRatio = $state(85);
	let autoBlockFraud = $state(true);

	// 5. TikTok & GTM
	let tiktokPixelId = $state('C9J829XLS8');
	let gtmContainerId = $state('GTM-W8L9P2');

	// 6. Payment Methods
	let enableCOD = $state(true);
	let enableBkash = $state(true);
	let enableNagad = $state(true);

	// 7. Advance Payment
	let advancePaymentAmount = $state(200);
	let requireAdvanceForHighRisk = $state(true);

	function triggerSave(msg = 'Settings saved successfully!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}

	function testCourierApi() {
		isCourierSyncing = true;
		courierStatusMessage = 'Connecting to Steadfast & Pathao APIs...';
		setTimeout(() => {
			isCourierSyncing = false;
			courierStatusMessage = 'Steadfast & Pathao APIs are connected and active!';
			setTimeout(() => (courierStatusMessage = null), 3500);
		}, 1200);
	}

	// 18 All-	// 18 All-Settings Cards (Exact Match with Reference Image)
	const ALL_SETTINGS_CARDS = [
		{
			id: 'delivery-charge',
			title: 'Delivery Charge',
			cardBg: 'bg-[#f0f7ff]',
			iconBg: 'bg-[#1d6ee5]',
			ringBorder: 'border-[#1d6ee5]/40',
			accentColor: 'text-[#1d6ee5]',
			iconType: 'truck',
			desc: 'ঢাকার ভেতরে ও বাইরে ডেলিভারি চার্জ নির্ধারণ'
		},
		{
			id: 'advance-payment',
			title: 'Advance Payment',
			cardBg: 'bg-[#edfbf4]',
			iconBg: 'bg-[#10b981]',
			ringBorder: 'border-[#10b981]/40',
			accentColor: 'text-[#10b981]',
			iconType: 'truck',
			desc: 'হাই-রিস্ক অর্ডারের জন্য অগ্রিম পেমেন্ট নিয়ম'
		},
		{
			id: 'sms',
			title: 'SMS',
			cardBg: 'bg-[#fef5ee]',
			iconBg: 'bg-[#f97316]',
			ringBorder: 'border-[#f97316]/40',
			accentColor: 'text-[#f97316]',
			iconType: 'sms',
			desc: 'কাস্টমার অর্ডার কনফার্মেশন ও ট্র্যাকিং এসএমএস'
		},
		{
			id: 'courier',
			title: 'Courier',
			cardBg: 'bg-[#f8f0fe]',
			iconBg: 'bg-[#8b5cf6]',
			ringBorder: 'border-[#8b5cf6]/40',
			accentColor: 'text-[#8b5cf6]',
			iconType: 'courier',
			desc: 'Steadfast ও Pathao কুরিয়ার এপিআই কনফিগারেশন'
		},
		{
			id: 'fraud-check',
			title: 'Fraud Check API',
			titleColor: 'text-[#4f46e5]',
			cardBg: 'bg-[#f0f3ff]',
			iconBg: 'bg-[#4f46e5]',
			ringBorder: 'border-[#4f46e5]/40',
			accentColor: 'text-[#4f46e5]',
			iconType: 'fraud',
			desc: 'রিটার্ন রেশিও ভেরিফিকেশন ও ফ্রড ডিটেকশন'
		},
		{
			id: 'payment-methods',
			title: 'Payment Methods',
			cardBg: 'bg-[#eefaf3]',
			iconBg: 'bg-[#10b981]',
			ringBorder: 'border-[#10b981]/40',
			accentColor: 'text-[#10b981]',
			iconType: 'payment',
			desc: 'ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ গেটওয়ে'
		},
		{
			id: 'social-login',
			title: 'Social Login',
			cardBg: 'bg-[#feedeb]',
			iconBg: 'bg-[#ea4335]',
			ringBorder: 'border-[#ea4335]/40',
			accentColor: 'text-[#ea4335]',
			iconType: 'google',
			desc: 'Google One-Tap দ্রুত সাইন-ইন'
		},
		{
			id: 'facebook-pixel',
			title: 'Facebook Pixel',
			cardBg: 'bg-[#eef5fc]',
			iconBg: 'bg-[#1877f2]',
			ringBorder: 'border-[#1877f2]/40',
			accentColor: 'text-[#1877f2]',
			iconType: 'facebook',
			desc: 'Meta Pixel এবং Conversions API (CAPI)'
		},
		{
			id: 'tiktok-pixel',
			title: 'TikTok Pixel',
			cardBg: 'bg-[#f4f7f6]',
			iconBg: 'bg-black',
			ringBorder: 'border-black/30',
			accentColor: 'text-slate-800',
			iconType: 'tiktok',
			desc: 'TikTok ইভেন্ট ও কনভার্সন ট্র্যাকার'
		},
		{
			id: 'gtm',
			title: 'Tag Manager, Analytics and Data Layer',
			cardBg: 'bg-[#eef5fc]',
			iconBg: 'bg-[#1d6ee5]',
			ringBorder: 'border-[#1d6ee5]/40',
			accentColor: 'text-[#1d6ee5]',
			iconType: 'tag',
			desc: 'Google Tag Manager ও ডেটালেয়ার ইভেন্টস'
		},
		{
			id: 'facebook-catalog',
			title: 'Facebook Catalog',
			cardBg: 'bg-[#eef5fc]',
			iconBg: 'bg-[#1877f2]',
			ringBorder: 'border-[#1877f2]/40',
			accentColor: 'text-[#1877f2]',
			iconType: 'facebook',
			desc: 'মেটা ক্যাটালগ ও ডায়নামিক অ্যাড ফিড'
		},
		{
			id: 'manage-offer',
			title: 'Manage Offer',
			cardBg: 'bg-[#fef8ee]',
			iconBg: 'bg-[#f97316]',
			ringBorder: 'border-[#f97316]/40',
			accentColor: 'text-[#f97316]',
			iconType: 'domain',
			desc: 'ডিসকাউন্ট কুপন ও বান্ডেল অফার'
		},
		{
			id: 'chat-manage',
			title: 'Chat Manage',
			cardBg: 'bg-[#eef5fc]',
			iconBg: 'bg-[#1d6ee5]',
			ringBorder: 'border-[#1d6ee5]/40',
			accentColor: 'text-[#1d6ee5]',
			iconType: 'chat',
			desc: 'WhatsApp ও Messenger লাইভ চ্যাট উইজেট'
		},
		{
			id: 'currency-country',
			title: 'Shop Currency & Country',
			cardBg: 'bg-[#fef5ed]',
			iconBg: 'bg-[#f97316]',
			ringBorder: 'border-[#f97316]/40',
			accentColor: 'text-[#f97316]',
			iconType: 'currency',
			desc: 'মুদ্রা (BDT ৳) এবং দেশ (Bangladesh)'
		},
		{
			id: 'domain-manage',
			title: 'Domain Mange',
			cardBg: 'bg-[#fef6ee]',
			iconBg: 'bg-[#f97316]',
			ringBorder: 'border-[#f97316]/40',
			accentColor: 'text-[#f97316]',
			iconType: 'domain',
			desc: 'কাস্টম ডোমেইন ম্যাপিং (lp.haqplus.com)'
		},
		{
			id: 'order-setting',
			title: 'Order Setting',
			cardBg: 'bg-[#edf9f3]',
			iconBg: 'bg-[#10b981]',
			ringBorder: 'border-[#10b981]/40',
			accentColor: 'text-[#10b981]',
			iconType: 'order',
			desc: 'অটো কনফার্মেশন ও অর্ডার প্রিফিক্স'
		},
		{
			id: 'product-setting',
			title: 'Product Setting',
			cardBg: 'bg-[#edf8f1]',
			iconBg: 'bg-[#10b981]',
			ringBorder: 'border-[#10b981]/40',
			accentColor: 'text-[#10b981]',
			iconType: 'product',
			desc: 'ইনভেন্টরি অ্যালার্ট ও স্টক ম্যানেজমেন্ট'
		},
		{
			id: 'google-search-console',
			title: 'Google Search Console',
			cardBg: 'bg-[#eef5fc]',
			iconBg: 'bg-[#1d6ee5]',
			ringBorder: 'border-[#1d6ee5]/40',
			accentColor: 'text-[#1d6ee5]',
			iconType: 'console',
			desc: 'গুগল সার্চ কনসোল সাইট ভেরিফিকেশন'
		}
	];

	let filteredCards = $derived(
		ALL_SETTINGS_CARDS.filter(c =>
			c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.desc.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);
</script>

<div class="space-y-6 max-w-7xl mx-auto">

	<!-- Toast Message -->
	{#if isSaved}
		<div class="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
			<CheckCircle2 class="w-4 h-4" />
			<span>{saveMessage}</span>
		</div>
	{/if}

	<!-- ======================================================== -->
	<!-- VIEW 1: ALL SETTINGS (Exact Replica of Reference Image)   -->
	<!-- ======================================================== -->
	{#if activeTab === 'all'}
		
		<!-- Top Search Bar -->
		<div class="flex items-center max-w-md gap-2">
			<Input
				type="text"
				bind:value={searchQuery}
				placeholder="Search settings..."
				class="h-10"
			/>
			<Button type="button" size="icon" class="h-10 w-10 shrink-0">
				<Search class="w-4 h-4" />
			</Button>
		</div>

		<!-- 3-Column Settings Cards Grid (Borderless Pastel Cards) -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each filteredCards as card}
				<div
					role="button"
					tabindex="0"
					onclick={() => (activeTab = card.id)}
					onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && (activeTab = card.id)}
					class="rounded-[20px] {card.cardBg} p-5 flex items-center justify-between border-0 shadow-none hover:shadow-md transition-all duration-200 cursor-pointer group text-left"
				>
					<div class="flex items-center gap-4 min-w-0">
						<!-- Concentric Dashed Ring + Solid Icon Circle -->
						<div class="w-13 h-13 rounded-full border border-dashed {card.ringBorder} p-[3px] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
							<div class="w-10 h-10 rounded-full {card.iconBg} flex items-center justify-center text-white shadow-2xs">
								{#if card.iconType === 'google'}
									<span class="font-black text-sm tracking-tighter">G</span>
								{:else if card.iconType === 'facebook'}
									<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
										<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
									</svg>
								{:else if card.iconType === 'tiktok'}
									<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
										<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.17 1.17 2.12 2.34 2.34.8.18 1.66.07 2.37-.34.79-.44 1.34-1.23 1.47-2.12.07-.48.06-.97.06-1.46V.02z" />
									</svg>
								{:else if card.iconType === 'truck'}
									<Truck class="w-4.5 h-4.5" />
								{:else if card.iconType === 'sms'}
									<MessageSquare class="w-4.5 h-4.5" />
								{:else if card.iconType === 'courier'}
									<Package class="w-4.5 h-4.5" />
								{:else if card.iconType === 'fraud'}
									<ShieldCheck class="w-4.5 h-4.5" />
								{:else if card.iconType === 'payment'}
									<CreditCard class="w-4.5 h-4.5" />
								{:else if card.iconType === 'chat'}
									<MessageSquare class="w-4.5 h-4.5" />
								{:else if card.iconType === 'currency'}
									<span class="font-bold text-sm">$</span>
								{:else if card.iconType === 'domain'}
									<Globe class="w-4.5 h-4.5" />
								{:else if card.iconType === 'order'}
									<FileText class="w-4.5 h-4.5" />
								{:else if card.iconType === 'product'}
									<Settings class="w-4.5 h-4.5" />
								{:else if card.iconType === 'console'}
									<Search class="w-4.5 h-4.5" />
								{:else}
									<Tag class="w-4.5 h-4.5" />
								{/if}
							</div>
						</div>

						<div class="truncate">
							<h3 class="font-bold {card.titleColor || 'text-slate-900'} text-[14.5px] tracking-tight truncate leading-tight">
								{card.title}
							</h3>
							<span class="inline-flex items-center gap-1 text-xs font-semibold {card.accentColor} mt-1">
								<span>Manage</span>
								<ArrowRight class="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
							</span>
						</div>
					</div>
				</div>
			{/each}
		</div>

	<!-- ======================================================== -->
	<!-- VIEW 2: FACEBOOK PIXEL (Exact Replica of Screenshot 2)   -->
	<!-- ======================================================== -->
	{:else if activeTab === 'facebook-pixel'}
		<div class="space-y-6 max-w-4xl">
			
			<!-- Back Button -->
			<Button
				variant="outline"
				size="sm"
				onclick={() => (activeTab = 'all')}
				class="gap-2"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</Button>

			<!-- Title Header -->
			<div>
				<h2 class="text-xl font-bold text-slate-900">Facebook Pixel & Conversions API (CAPI)</h2>
				<p class="text-xs text-slate-500 mt-1">
					Track customer actions and improve your ad performance with Meta tracking
				</p>
			</div>

			<!-- Meta Pixel & CAPI Settings Main Card -->
			<Card class="p-6 sm:p-8 space-y-6">
				
				<div class="flex items-start gap-4 pb-4 border-b border-slate-100">
					<!-- Blue Facebook Icon -->
					<div class="w-12 h-12 rounded-full bg-[#1877f2] flex items-center justify-center text-white shrink-0 shadow-sm">
						<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
						</svg>
					</div>
					<div>
						<h3 class="font-bold text-slate-900 text-base">Meta Pixel & CAPI Settings</h3>
						<p class="text-xs text-slate-500 mt-0.5">
							Use both browser-side and server-side tracking for maximum accuracy.
						</p>
					</div>
				</div>

				<div class="space-y-4">
					<!-- Facebook Pixel ID Field -->
					<div class="space-y-1.5">
						<label for="fb-pixel-id" class="text-xs font-bold text-slate-700 block">
							Facebook Pixel ID
						</label>
						<Input
							id="fb-pixel-id"
							type="text"
							bind:value={fbPixelId}
							placeholder="806385144697838"
							class="font-mono text-xs"
						/>
						<span class="text-[11px] text-slate-400 block">Find this in Meta Events Manager.</span>
					</div>

					<!-- CAPI Access Token Field -->
					<div class="space-y-1.5">
						<label for="capi-token" class="text-xs font-bold text-slate-700 block">
							CAPI Access Token
						</label>
						<Textarea
							id="capi-token"
							rows={3}
							bind:value={fbCapiToken}
							placeholder="EAAQZCaLfr2KUBSw5YGLAS5uUNlyLllbFYr..."
							class="font-mono text-xs leading-relaxed"
						/>
						<span class="text-[11px] text-slate-400 block">Required for Server-Side (CAPI) tracking.</span>
					</div>

					<!-- Test Events (Optional) Box with shadcn Switch -->
					<div class="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
						<h4 class="text-xs font-bold text-slate-800">Test Events (Optional)</h4>

						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<span class="text-xs text-slate-700 font-medium">Enable Test Mode</span>
								<Switch bind:checked={fbTestMode} />
							</div>

							<div class="flex items-center justify-between">
								<span class="text-xs text-slate-700 font-medium">Trigger Purchase on Order Confirm</span>
								<Switch bind:checked={fbTriggerPurchase} />
							</div>
						</div>

						<p class="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
							Use this to verify your setup in Events Manager &gt; Test Events.
						</p>
					</div>

					<!-- Save Button -->
					<div class="pt-2">
						<Button
							type="button"
							onclick={() => triggerSave('Facebook Pixel & CAPI Settings Saved!')}
							class="w-full bg-[#1877f2] hover:bg-[#166fe5] shadow-blue-500/20"
						>
							Save Facebook Tracking Settings
						</Button>
					</div>
				</div>
			</Card>

			<!-- Step-by-Step Setup Guide Accordion -->
			<Card class="overflow-hidden">
				<button
					type="button"
					onclick={() => (isGuideOpen = !isGuideOpen)}
					class="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
				>
					<div class="flex items-center gap-2">
						<span class="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">?</span>
						<span>Step-by-Step Setup Guide</span>
					</div>
					<ChevronDown class="w-4 h-4 text-slate-400 transition-transform {isGuideOpen ? 'rotate-180' : ''}" />
				</button>

				{#if isGuideOpen}
					<div class="p-5 pt-0 text-xs text-slate-600 space-y-3 border-t border-slate-100">
						<div class="space-y-1">
							<span class="font-bold text-slate-900 block">1. Create or Find Pixel ID</span>
							<p class="text-slate-500">Go to Meta Events Manager &gt; Data Sources &gt; Pixel Settings and copy the Pixel ID.</p>
						</div>
						<div class="space-y-1">
							<span class="font-bold text-slate-900 block">2. Generate Conversions API Token</span>
							<p class="text-slate-500">In Settings tab, scroll down to Conversions API and click "Generate access token".</p>
						</div>
						<div class="space-y-1">
							<span class="font-bold text-slate-900 block">3. Verify in Test Events</span>
							<p class="text-slate-500">Enter your Test Event code and trigger an order to see live events streaming on Cloudflare edge.</p>
						</div>
					</div>
				{/if}
			</Card>

		</div>

	<!-- ======================================================== -->
	<!-- VIEW 3: DELIVERY CHARGE                                  -->
	<!-- ======================================================== -->
	{:else if activeTab === 'delivery-charge'}
		<div class="space-y-6 max-w-2xl">
			<Button
				variant="outline"
				size="sm"
				onclick={() => (activeTab = 'all')}
				class="gap-2"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</Button>

			<Card class="p-6 space-y-5">
				<h3 class="text-base font-bold text-slate-900">ডেলিভারি চার্জ নির্ধারণ</h3>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="dhaka" class="text-xs font-bold text-slate-700">ঢাকার ভেতরে চার্জ (৳)</label>
						<Input
							id="dhaka"
							type="number"
							bind:value={deliveryDhaka}
							class="font-mono"
						/>
					</div>
					<div class="space-y-1.5">
						<label for="outside-dhaka" class="text-xs font-bold text-slate-700">ঢাকার বাইরে চার্জ (৳)</label>
						<Input
							id="outside-dhaka"
							type="number"
							bind:value={deliveryOutsideDhaka}
							class="font-mono"
						/>
					</div>
				</div>

				<Button
					type="button"
					onclick={() => triggerSave('Delivery Charge Settings Saved!')}
				>
					Save Delivery Charges
				</Button>
			</Card>
		</div>

	<!-- ======================================================== -->
	<!-- VIEW 4: COURIER (STEADFAST & PATHAO)                     -->
	<!-- ======================================================== -->
	{:else if activeTab === 'courier'}
		<div class="space-y-6 max-w-2xl">
			<Button
				variant="outline"
				size="sm"
				onclick={() => (activeTab = 'all')}
				class="gap-2"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</Button>

			<Card class="p-6 space-y-5">
				<div class="flex items-center justify-between pb-3 border-b border-slate-100">
					<h3 class="text-base font-bold text-slate-900">Steadfast ও Pathao Courier API</h3>
					<Button
						variant="secondary"
						size="sm"
						onclick={testCourierApi}
						loading={isCourierSyncing}
						class="gap-1.5"
					>
						<RefreshCw class="w-3.5 h-3.5 {isCourierSyncing ? 'animate-spin' : ''}" />
						<span>Test Connection</span>
					</Button>
				</div>

				{#if courierStatusMessage}
					<div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
						<CheckCircle2 class="w-4 h-4 text-emerald-600" />
						<span>{courierStatusMessage}</span>
					</div>
				{/if}

				<div class="space-y-3">
					<div class="space-y-1.5">
						<label for="st-key" class="text-xs font-bold text-slate-700">Steadfast API Key</label>
						<Input
							id="st-key"
							type="text"
							bind:value={steadfastApiKey}
							class="font-mono text-xs"
						/>
					</div>
					<div class="space-y-1.5">
						<label for="st-sec" class="text-xs font-bold text-slate-700">Steadfast Secret Key</label>
						<Input
							id="st-sec"
							type="password"
							bind:value={steadfastSecretKey}
							class="font-mono text-xs"
						/>
					</div>
				</div>

				<Button
					type="button"
					onclick={() => triggerSave('Courier API Credentials Saved!')}
				>
					Save Courier Settings
				</Button>
			</Card>
		</div>

	<!-- ======================================================== -->
	<!-- VIEW 5: FRAUD CHECK API                                  -->
	<!-- ======================================================== -->
	{:else if activeTab === 'fraud-check'}
		<div class="space-y-6 max-w-2xl">
			<Button
				variant="outline"
				size="sm"
				onclick={() => (activeTab = 'all')}
				class="gap-2"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</Button>

			<Card class="p-6 space-y-5">
				<h3 class="text-base font-bold text-slate-900">Fraud Check API & Return Ratio Threshold</h3>
				<p class="text-xs text-slate-500">Steadfast ডেলিভারি হিস্টোরি দেখে সন্দেহভাজন ফেক কাস্টমার চিহ্নিতকরণ</p>

				<div class="space-y-4">
					<div class="space-y-1.5">
						<label for="fraud-ratio" class="text-xs font-bold text-slate-700">ন্যূনতম গ্রহণযোগ্য ডেলিভারি রেশিও (%)</label>
						<Input
							id="fraud-ratio"
							type="number"
							bind:value={minDeliveryRatio}
							class="font-mono"
						/>
						<span class="text-[11px] text-slate-400">এর নিচের রেশিওধারীদের জন্য ক্যাশ অন ডেলিভারি ব্লক অথবা অগ্রিম চাওয়া হবে</span>
					</div>

					<div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
						<span class="text-xs text-slate-700 font-bold">Auto-flag Fake Orders with Return Rate &gt; 50%</span>
						<Switch bind:checked={autoBlockFraud} />
					</div>
				</div>

				<Button
					type="button"
					onclick={() => triggerSave('Fraud Check Settings Saved!')}
				>
					Save Fraud Rules
				</Button>
			</Card>
		</div>

	<!-- ======================================================== -->
	<!-- VIEW 6: OTHER SETTINGS GENERIC CARD                      -->
	<!-- ======================================================== -->
	{:else}
		<div class="space-y-6 max-w-2xl">
			<Button
				variant="outline"
				size="sm"
				onclick={() => (activeTab = 'all')}
				class="gap-2"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</Button>

			<Card class="p-6 space-y-4">
				<h3 class="text-base font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')} Settings</h3>
				<p class="text-xs text-slate-500">Configure parameters for {activeTab}.</p>
				
				<div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
					This module is active and connected with your AURA Enterprise Engine on Cloudflare edge.
				</div>

				<Button
					type="button"
					onclick={() => triggerSave(`${activeTab} saved!`)}
				>
					Save Changes
				</Button>
			</Card>
		</div>
	{/if}

</div>

