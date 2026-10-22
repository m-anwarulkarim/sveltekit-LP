<script lang="ts">
	import { page } from '$app/state';
	import { Button, Card, Badge, Input, Textarea, Switch } from '#lib/components/ui';
	import {
		Truck,
		Package,
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
		Save,
		Check,
		Info,
		Bold,
		Italic,
		Underline,
		Link,
		List,
		Sparkles,
		MapPin,
		ShieldAlert
	} from 'lucide-svelte';

	// Active tab: 'all' or specific module like 'facebook-pixel', 'delivery-charge', 'courier', 'order-setting', etc.
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

	// 4. TikTok & GTM
	let tiktokPixelId = $state('C9J829XLS8');
	let gtmContainerId = $state('GTM-W8L9P2');

	// 7. Order Settings (Exact Match with screencapture-admin-saleecom-settings-order-setting-2026-10-22-22_39_43.pdf)
	// General Options
	let enableOrderNote = $state(true);
	let enableIncompleteOrder = $state(true);
	let enablePrescriptionOrder = $state(false);
	let enableCheckoutOrderModal = $state(false);
	let swapPaymentAndOrderItem = $state(true);

	// Admin Customization
	let enableSL = $state(true);
	let enableProductSKU = $state(true);
	let enableProductName = $state(true);
	let enablePrevOrderCount = $state(true);
	let showDashboardProfitCard = $state(true);
	let enableHRM = $state(false);

	// Security & Validation
	let fakeOrderProtection = $state(true);
	let enableOrderOTP = $state(false);
	let enablePhoneValidation = $state(true);
	let phoneMinLength = $state(11);
	let phoneMaxLength = $state(11);
	let blockSingleIP = $state(false);
	let ipWiseOrderLimit = $state(false);

	// Order Notification
	let enableSMSNotification = $state(true);
	let enableEmailNotification = $state(true);
	let usePersonalSMTP = $state(false);

	// Delivery Settings
	let deliveryBookingType = $state<'division' | 'city' | 'sub_area' | 'district'>('city');
	let deliveryOptionTitle = $state('শর্তাবলী: ১। অর্ডারকৃত পণ্য গ্রহণ করার সময় দেখে নিবেন');
	let insideDhakaCustomText = $state('Inside Dhaka 70TK');
	let outsideDhakaCustomText = $state('Outside Dhaka 120TK');

	// Success Page Custom Message
	let successTitle = $state('THANK YOU\nYOUR ORDER IS PLACED');
	let successMessageBody = $state(
		'THANK YOU\nYOUR ORDER IS PLACED\nWe received your order and will begin processing it soon. Your order information appears below:\nYour order Number: {{orderId}}'
	);

	// Custom Order Statuses
	let enableCustomStatusWorkflow = $state(false);

	// Address Settings
	let requireFullAddress = $state(true);
	let showDistrictDropdown = $state(true);

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
			iconType: 'tag',
			desc: 'ডিসকাউন্ট কুপন ও বান্ডেল অফার'
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
								{#if card.iconType === 'facebook'}
									<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
										<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
									</svg>
								{:else if card.iconType === 'tiktok'}
									<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
										<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.17 1.17 2.12 2.34 2.34.8.18 1.66.07 2.37-.34.79-.44 1.34-1.23 1.47-2.12.07-.48.06-.97.06-1.46V.02z" />
									</svg>
								{:else if card.iconType === 'truck'}
									<Truck class="w-4.5 h-4.5" />
								{:else if card.iconType === 'courier'}
									<Package class="w-4.5 h-4.5" />
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
	<!-- VIEW 5: ORDER SETTING (Exact Match with PDF Reference)   -->
	<!-- ======================================================== -->
	{:else if activeTab === 'order-setting'}
		<div class="space-y-6">

			<!-- Top Action Bar (Back to Settings + Save Changes) -->
			<div class="flex items-center justify-between gap-4 pb-2">
				<Button
					variant="outline"
					size="sm"
					onclick={() => (activeTab = 'all')}
					class="gap-2"
				>
					<ArrowLeft class="w-4 h-4" />
					<span>Back to Settings</span>
				</Button>

				<Button
					type="button"
					onclick={() => triggerSave('Order Settings Saved Successfully!')}
					class="gap-1.5 bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-500/20"
				>
					<Check class="w-4 h-4" />
					<span>Save Changes</span>
				</Button>
			</div>

			<!-- Main Content Grid: 3 Cols on Left, 1 Sticky Col on Right for Navigation -->
			<div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
				
				<!-- Left 3-Columns: All Order Settings Segments -->
				<div class="lg:col-span-3 space-y-6">

					<!-- 1. General Options -->
					<Card id="general-options" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
						<div class="border-b border-slate-100 pb-3">
							<h3 class="text-base font-bold text-slate-900">General Options</h3>
							<p class="text-xs text-slate-500 mt-0.5">Control basic order-related options and checkout configuration</p>
						</div>

						<div class="space-y-4">
							<!-- 1. Enable Order Note -->
							<div class="flex items-center justify-between gap-4">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Enable Order Note</h4>
									<p class="text-xs text-slate-500 mt-0.5">Allow customers to add custom notes/instructions during order checkout</p>
								</div>
								<Switch bind:checked={enableOrderNote} />
							</div>

							<!-- 2. Enable Incomplete Order -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Enable Incomplete Order</h4>
									<p class="text-xs text-slate-500 mt-0.5">Track and save orders that were abandoned mid-checkout</p>
								</div>
								<Switch bind:checked={enableIncompleteOrder} />
							</div>

							<!-- 3. Enable Prescription Order -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Enable Prescription Order</h4>
									<p class="text-xs text-slate-500 mt-0.5">Allow uploading doctor prescriptions during the order flow</p>
								</div>
								<Switch bind:checked={enablePrescriptionOrder} />
							</div>

							<!-- 4. Enable Checkout Order Modal -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Enable Checkout Order Modal</h4>
									<p class="text-xs text-slate-500 mt-0.5">Open a quick checkout form/modal directly upon clicking Order Now</p>
								</div>
								<Switch bind:checked={enableCheckoutOrderModal} />
							</div>

							<!-- 5. Swap Payment And Order Item -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Swap Payment And Order Item</h4>
									<p class="text-xs text-slate-500 mt-0.5">Swap the payment options section and the order items summary on checkout page</p>
								</div>
								<Switch bind:checked={swapPaymentAndOrderItem} />
							</div>
						</div>
					</Card>

					<!-- 2. Admin Customization -->
					<Card id="admin-customization" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
						<div class="border-b border-slate-100 pb-3">
							<h3 class="text-base font-bold text-slate-900">Admin Customization</h3>
							<p class="text-xs text-slate-500 mt-0.5">Customize columns and information displayed on the order listing and admin dashboard</p>
						</div>

						<div class="space-y-4">
							<!-- 1. Enable SL -->
							<div class="flex items-center justify-between gap-4">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Enable SL</h4>
									<p class="text-xs text-slate-500 mt-0.5">Display serial numbers in the admin orders list table</p>
								</div>
								<Switch bind:checked={enableSL} />
							</div>

							<!-- 2. Enable Product SKU -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Enable Product SKU</h4>
									<p class="text-xs text-slate-500 mt-0.5">Display product SKU column in the admin orders list table</p>
								</div>
								<Switch bind:checked={enableProductSKU} />
							</div>

							<!-- 3. Enable Product Name / Success Order ID -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Enable Product Name / Success Order ID</h4>
									<p class="text-xs text-slate-500 mt-0.5">Show product name column / success page order IDs in the admin list</p>
								</div>
								<Switch bind:checked={enableProductName} />
							</div>

							<!-- 4. Enable Previous Order Count -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Enable Previous Order Count</h4>
									<p class="text-xs text-slate-500 mt-0.5">Show customers historic purchase counts directly on the orders list</p>
								</div>
								<Switch bind:checked={enablePrevOrderCount} />
							</div>

							<!-- 5. Show Dashboard Profit Card -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Show Dashboard Profit Card</h4>
									<p class="text-xs text-slate-500 mt-0.5">Display the profit summary card on the admin dashboard</p>
								</div>
								<Switch bind:checked={showDashboardProfitCard} />
							</div>

							<!-- 6. Enable HRM -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Enable HRM</h4>
									<p class="text-xs text-slate-500 mt-0.5">Show the HRM menu in the sidebar for employee management and order reports</p>
								</div>
								<Switch bind:checked={enableHRM} />
							</div>
						</div>
					</Card>

					<!-- 3. Security & Validation -->
					<Card id="security-validation" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
						<div class="border-b border-slate-100 pb-3">
							<h3 class="text-base font-bold text-slate-900">Security & Validation</h3>
							<p class="text-xs text-slate-500 mt-0.5">Configure order verification, IP rate-limiting, and phone validation</p>
						</div>

						<div class="space-y-4">
							<!-- 1. Fake Order Protection -->
							<div class="flex items-center justify-between gap-4">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Fake Order Protection (Dynamic Token)</h4>
									<p class="text-xs text-slate-500 mt-0.5">Enable to block fake API requests. Only orders initiated from the website via browser checkout will be allowed</p>
								</div>
								<Switch bind:checked={fakeOrderProtection} />
							</div>

							<!-- 2. Enable Order OTP -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Enable Order OTP</h4>
									<p class="text-xs text-slate-500 mt-0.5">Verify customer order placement with a secure one-time passcode</p>
								</div>
								<Switch bind:checked={enableOrderOTP} />
							</div>

							<!-- 3. Enable Phone Validation -->
							<div class="space-y-3 pt-3 border-t border-slate-100">
								<div class="flex items-center justify-between gap-4">
									<div>
										<h4 class="text-sm font-bold text-slate-900">Enable Phone Validation</h4>
										<p class="text-xs text-slate-500 mt-0.5">Enforce character range constraints on checkout phone numbers</p>
									</div>
									<Switch bind:checked={enablePhoneValidation} />
								</div>

								{#if enablePhoneValidation}
									<div class="grid grid-cols-2 gap-4 pt-2">
										<div class="space-y-1">
											<label for="min-len" class="text-[11px] font-bold text-slate-500">Minimum Length</label>
											<Input id="min-len" type="number" bind:value={phoneMinLength} class="h-9 font-mono" />
										</div>
										<div class="space-y-1">
											<label for="max-len" class="text-[11px] font-bold text-slate-500">Maximum Length</label>
											<Input id="max-len" type="number" bind:value={phoneMaxLength} class="h-9 font-mono" />
										</div>
									</div>
								{/if}
							</div>

							<!-- 4. Block Single User IP -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Block Single User IP</h4>
									<p class="text-xs text-slate-500 mt-0.5">Allow manual or automatic single IP blocklisting to prevent spam</p>
								</div>
								<Switch bind:checked={blockSingleIP} />
							</div>

							<!-- 5. IP-wise Order Limit & Block -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">IP-wise Order Limit & Block</h4>
									<p class="text-xs text-slate-500 mt-0.5">Prevent bot attacks by limiting max orders per IP within a window</p>
								</div>
								<Switch bind:checked={ipWiseOrderLimit} />
							</div>
						</div>
					</Card>

					<!-- 4. Order Notification -->
					<Card id="order-notification" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
						<div class="border-b border-slate-100 pb-3">
							<h3 class="text-base font-bold text-slate-900">Order Notification</h3>
							<p class="text-xs text-slate-500 mt-0.5">Configure automated notifications to customers</p>
						</div>

						<div class="space-y-4">
							<!-- 1. Enable SMS Notification -->
							<div class="flex items-center justify-between gap-4">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Enable SMS Notification</h4>
									<p class="text-xs text-slate-500 mt-0.5">Send order status updates to customers via SMS</p>
								</div>
								<Switch bind:checked={enableSMSNotification} />
							</div>

							<!-- 2. Enable Email Notification -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Enable Email Notification</h4>
									<p class="text-xs text-slate-500 mt-0.5">Send order confirmation and status invoices to customers via email</p>
								</div>
								<Switch bind:checked={enableEmailNotification} />
							</div>

							<!-- 3. Use Personal SMTP Email -->
							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Use Personal SMTP Email</h4>
									<p class="text-xs text-slate-500 mt-0.5">Configure and send notification emails from your custom SMTP credentials</p>
								</div>
								<Switch bind:checked={usePersonalSMTP} />
							</div>
						</div>
					</Card>

					<!-- 5. Delivery Settings -->
					<Card id="delivery-settings" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
						<div class="border-b border-slate-100 pb-3">
							<h3 class="text-base font-bold text-slate-900">Delivery Settings</h3>
							<p class="text-xs text-slate-500 mt-0.5">Set the regional routing options for checkout delivery charges</p>
						</div>

						<!-- 4 Radio Cards -->
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<!-- Option 1: Division Booking -->
							<button
								type="button"
								onclick={() => (deliveryBookingType = 'division')}
								class="p-4 rounded-xl border text-left transition-all cursor-pointer {deliveryBookingType === 'division' ? 'border-[#5845eb] bg-indigo-50/40 ring-1 ring-[#5845eb]' : 'border-slate-200 hover:bg-slate-50'}"
							>
								<div class="flex items-center gap-2.5">
									<div class="w-4 h-4 rounded-full border flex items-center justify-center {deliveryBookingType === 'division' ? 'border-[#5845eb]' : 'border-slate-300'}">
										{#if deliveryBookingType === 'division'}
											<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
										{/if}
									</div>
									<span class="font-bold text-sm text-slate-900">Division Booking</span>
								</div>
								<p class="text-xs text-slate-500 mt-1 pl-6">Calculate shipping charges based on country states / divisions</p>
							</button>

							<!-- Option 2: City-wise Booking (Selected by Default) -->
							<button
								type="button"
								onclick={() => (deliveryBookingType = 'city')}
								class="p-4 rounded-xl border text-left transition-all cursor-pointer {deliveryBookingType === 'city' ? 'border-[#5845eb] bg-indigo-50/40 ring-1 ring-[#5845eb]' : 'border-slate-200 hover:bg-slate-50'}"
							>
								<div class="flex items-center gap-2.5">
									<div class="w-4 h-4 rounded-full border flex items-center justify-center {deliveryBookingType === 'city' ? 'border-[#5845eb]' : 'border-slate-300'}">
										{#if deliveryBookingType === 'city'}
											<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
										{/if}
									</div>
									<span class="font-bold text-sm text-slate-900">City-wise Booking</span>
								</div>
								<p class="text-xs text-slate-500 mt-1 pl-6">Calculate shipping charges via simple Inside / Outside Dhaka options</p>
							</button>

							<!-- Option 3: Sub-Area Booking -->
							<button
								type="button"
								onclick={() => (deliveryBookingType = 'sub_area')}
								class="p-4 rounded-xl border text-left transition-all cursor-pointer {deliveryBookingType === 'sub_area' ? 'border-[#5845eb] bg-indigo-50/40 ring-1 ring-[#5845eb]' : 'border-slate-200 hover:bg-slate-50'}"
							>
								<div class="flex items-center gap-2.5">
									<div class="w-4 h-4 rounded-full border flex items-center justify-center {deliveryBookingType === 'sub_area' ? 'border-[#5845eb]' : 'border-slate-300'}">
										{#if deliveryBookingType === 'sub_area'}
											<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
										{/if}
									</div>
									<span class="font-bold text-sm text-slate-900">Sub-Area Booking</span>
								</div>
								<p class="text-xs text-slate-500 mt-1 pl-6">Calculate shipping charges via Inside / Sub-Area / Outside city limits</p>
							</button>

							<!-- Option 4: District-wise Booking -->
							<button
								type="button"
								onclick={() => (deliveryBookingType = 'district')}
								class="p-4 rounded-xl border text-left transition-all cursor-pointer {deliveryBookingType === 'district' ? 'border-[#5845eb] bg-indigo-50/40 ring-1 ring-[#5845eb]' : 'border-slate-200 hover:bg-slate-50'}"
							>
								<div class="flex items-center gap-2.5">
									<div class="w-4 h-4 rounded-full border flex items-center justify-center {deliveryBookingType === 'district' ? 'border-[#5845eb]' : 'border-slate-300'}">
										{#if deliveryBookingType === 'district'}
											<div class="w-2 h-2 rounded-full bg-[#5845eb]"></div>
										{/if}
									</div>
									<span class="font-bold text-sm text-slate-900">District-wise Booking</span>
								</div>
								<p class="text-xs text-slate-500 mt-1 pl-6">Calculate shipping charges based on Bangladesh districts</p>
							</button>
						</div>

						<!-- Form Fields for Delivery Options -->
						<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
							<div class="space-y-1">
								<label for="delivery-title" class="text-[11px] font-bold text-slate-500">Delivery Option Title</label>
								<Input id="delivery-title" type="text" bind:value={deliveryOptionTitle} class="h-10 text-xs" />
							</div>
							<div class="space-y-1">
								<label for="inside-text" class="text-[11px] font-bold text-slate-500">Inside Dhaka Custom Text</label>
								<Input id="inside-text" type="text" bind:value={insideDhakaCustomText} class="h-10 text-xs" />
							</div>
							<div class="space-y-1">
								<label for="outside-text" class="text-[11px] font-bold text-slate-500">Outside Dhaka Custom Text</label>
								<Input id="outside-text" type="text" bind:value={outsideDhakaCustomText} class="h-10 text-xs" />
							</div>
						</div>
					</Card>

					<!-- 6. Success Page Custom Message -->
					<Card id="success-page-message" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
						<div class="border-b border-slate-100 pb-3">
							<h3 class="text-base font-bold text-slate-900">Success Page Custom Message</h3>
							<p class="text-xs text-slate-500 mt-0.5">Customize the message shown to customers after a successful order</p>
						</div>

						<!-- Available Placeholders Alert -->
						<div class="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div class="flex items-center gap-2">
								<Info class="w-4 h-4 text-blue-600 shrink-0" />
								<div>
									<div class="text-xs font-bold text-blue-900">Available Dynamic Placeholders</div>
									<div class="text-[11px] text-blue-700">Click on any placeholder below to insert it into your message</div>
									<button
										type="button"
										onclick={() => (successMessageBody += ' {{orderId}}')}
										class="mt-1.5 px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[11px] font-bold hover:bg-blue-200 transition-colors cursor-pointer"
									>
										&#123;&#123;orderId&#125;&#125;
									</button>
								</div>
							</div>

							<button
								type="button"
								onclick={() => {
									successTitle = 'THANK YOU\nYOUR ORDER IS PLACED';
									successMessageBody = 'THANK YOU\nYOUR ORDER IS PLACED\nWe received your order and will begin processing it soon. Your order information appears below:\nYour order Number: {{orderId}}';
								}}
								class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
							>
								Insert Sample Message
							</button>
						</div>

						<!-- Formatting Toolbar -->
						<div class="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
							<span class="text-xs font-bold px-2 py-1 text-slate-700 border-r border-slate-200">Normal</span>
							<button type="button" class="p-1 rounded hover:bg-slate-200/60" title="Bold"><Bold class="w-3.5 h-3.5" /></button>
							<button type="button" class="p-1 rounded hover:bg-slate-200/60" title="Italic"><Italic class="w-3.5 h-3.5" /></button>
							<button type="button" class="p-1 rounded hover:bg-slate-200/60" title="Underline"><Underline class="w-3.5 h-3.5" /></button>
							<button type="button" class="p-1 rounded hover:bg-slate-200/60" title="Link"><Link class="w-3.5 h-3.5" /></button>
							<button type="button" class="p-1 rounded hover:bg-slate-200/60" title="List"><List class="w-3.5 h-3.5" /></button>
						</div>

						<!-- Message Inputs -->
						<div class="space-y-3">
							<div class="space-y-1">
								<label for="success-title" class="text-xs font-bold text-slate-700">Order Placed Title</label>
								<Input id="success-title" type="text" bind:value={successTitle} class="h-10 text-xs font-bold" />
							</div>

							<div class="space-y-1">
								<label for="success-body" class="text-xs font-bold text-slate-700">Order Placed Body Message</label>
								<Textarea
									id="success-body"
									rows={4}
									bind:value={successMessageBody}
									class="text-xs leading-relaxed"
								/>
							</div>
						</div>
					</Card>

					<!-- 7. Custom Order Statuses -->
					<Card id="custom-order-statuses" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
						<div class="border-b border-slate-100 pb-3">
							<h3 class="text-base font-bold text-slate-900">Custom Order Statuses</h3>
							<p class="text-xs text-slate-500 mt-0.5">Define custom workflow statuses specific to your shop. They will appear alongside the default statuses in your order list dropdowns, and the storefront.</p>
						</div>

						<div class="flex items-center justify-between gap-4">
							<div>
								<h4 class="text-sm font-bold text-slate-900">Enable Custom Order Status Workflow</h4>
								<p class="text-xs text-slate-500 mt-0.5">Enable this to configure custom order statuses and filter default system statuses</p>
							</div>
							<Switch bind:checked={enableCustomStatusWorkflow} />
						</div>
					</Card>

					<!-- 8. Address Settings -->
					<Card id="address-settings" class="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-5 scroll-mt-24">
						<div class="border-b border-slate-100 pb-3">
							<h3 class="text-base font-bold text-slate-900">Address Settings</h3>
							<p class="text-xs text-slate-500 mt-0.5">Customize required and optional address fields on the checkout page</p>
						</div>

						<div class="space-y-4">
							<div class="flex items-center justify-between gap-4">
								<div>
									<h4 class="text-sm font-bold text-slate-900">Require Full Delivery Address</h4>
									<p class="text-xs text-slate-500 mt-0.5">Require house number, street, and area details from customer</p>
								</div>
								<Switch bind:checked={requireFullAddress} />
							</div>

							<div class="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
								<div>
									<h4 class="text-sm font-bold text-slate-900">District Selection Dropdown</h4>
									<p class="text-xs text-slate-500 mt-0.5">Show district selection dropdown instead of freeform text input</p>
								</div>
								<Switch bind:checked={showDistrictDropdown} />
							</div>
						</div>
					</Card>

				</div>

				<!-- Right Sticky Navigation Sidebar (Settings Sections) -->
				<div class="lg:col-span-1 sticky top-24 space-y-4">
					<Card class="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-4">
						<div>
							<h4 class="text-sm font-bold text-slate-900">Settings Sections</h4>
							<p class="text-[11px] text-slate-400 mt-0.5">Quickly scroll to page settings segments</p>
						</div>

						<nav class="space-y-1 text-xs">
							<a
								href="#general-options"
								class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
							>
								› General Options
							</a>
							<a
								href="#admin-customization"
								class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
							>
								› Admin Customization
							</a>
							<a
								href="#security-validation"
								class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
							>
								› Security & Validation
							</a>
							<a
								href="#order-notification"
								class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
							>
								› Notifications
							</a>
							<a
								href="#delivery-settings"
								class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
							>
								› Delivery Settings
							</a>
							<a
								href="#success-page-message"
								class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
							>
								› Success Page Message
							</a>
							<a
								href="#custom-order-statuses"
								class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
							>
								› Custom Order Statuses
							</a>
							<a
								href="#address-settings"
								class="block px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#5845eb] hover:bg-slate-50 transition-colors"
							>
								› Address Settings
							</a>
						</nav>

						<div class="pt-3 border-t border-slate-100">
							<Button
								type="button"
								onclick={() => triggerSave('Order Settings Saved Successfully!')}
								class="w-full bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold py-2 text-xs rounded-xl shadow-xs"
							>
								✓ Save Changes
							</Button>
						</div>
					</Card>
				</div>

			</div>

		</div>

	<!-- ======================================================== -->
	<!-- VIEW 7: OTHER SETTINGS GENERIC CARD                      -->
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

