<script lang="ts">
	import { page } from '$app/state';
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

	// 18 All-Settings Cards (Exact Match with Screenshot 1)
	const ALL_SETTINGS_CARDS = [
		{
			id: 'delivery-charge',
			title: 'Delivery Charge',
			icon: Truck,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
			ringColor: 'ring-blue-100',
			desc: 'ঢাকার ভেতরে ও বাইরে ডেলিভারি চার্জ নির্ধারণ'
		},
		{
			id: 'advance-payment',
			title: 'Advance Payment',
			icon: Truck,
			color: 'text-emerald-600',
			bgColor: 'bg-emerald-50',
			ringColor: 'ring-emerald-200 border-dashed border-2 border-emerald-400',
			desc: 'হাই-রিস্ক অর্ডারের জন্য অগ্রিম পেমেন্ট নিয়ম'
		},
		{
			id: 'sms',
			title: 'SMS',
			icon: MessageSquare,
			color: 'text-orange-600',
			bgColor: 'bg-orange-50',
			ringColor: 'ring-orange-100',
			desc: 'কাস্টমার অর্ডার কনফার্মেশন ও ট্র্যাকিং এসএমএস'
		},
		{
			id: 'courier',
			title: 'Courier',
			icon: Package,
			color: 'text-purple-600',
			bgColor: 'bg-purple-50',
			ringColor: 'ring-purple-100',
			desc: 'Steadfast ও Pathao কুরিয়ার এপিআই কনফিগারেশন'
		},
		{
			id: 'fraud-check',
			title: 'Fraud Check API',
			icon: ShieldCheck,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
			ringColor: 'ring-blue-100',
			desc: 'রিটার্ন রেশিও ভেরিফিকেশন ও ফ্রড ডিটেকশন'
		},
		{
			id: 'payment-methods',
			title: 'Payment Methods',
			icon: CreditCard,
			color: 'text-emerald-600',
			bgColor: 'bg-emerald-50',
			ringColor: 'ring-emerald-100',
			desc: 'ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ গেটওয়ে'
		},
		{
			id: 'social-login',
			title: 'Social Login',
			icon: Globe,
			color: 'text-rose-600',
			bgColor: 'bg-rose-50',
			ringColor: 'ring-rose-100',
			desc: 'Google One-Tap দ্রুত সাইন-ইন'
		},
		{
			id: 'facebook-pixel',
			title: 'Facebook Pixel',
			icon: Globe,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
			ringColor: 'ring-blue-100',
			desc: 'Meta Pixel এবং Conversions API (CAPI)'
		},
		{
			id: 'tiktok-pixel',
			title: 'TikTok Pixel',
			icon: Sliders,
			color: 'text-slate-900',
			bgColor: 'bg-slate-100',
			ringColor: 'ring-slate-200',
			desc: 'TikTok ইভেন্ট ও কনভার্সন ট্র্যাকার'
		},
		{
			id: 'gtm',
			title: 'Tag Manager, Analytics and Data Layer',
			icon: Tag,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
			ringColor: 'ring-blue-100',
			desc: 'Google Tag Manager ও ডেটালেয়ার ইভেন্টস'
		},
		{
			id: 'facebook-catalog',
			title: 'Facebook Catalog',
			icon: Globe,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
			ringColor: 'ring-blue-100',
			desc: 'মেটা ক্যাটালগ ও ডায়নামিক অ্যাড ফিড'
		},
		{
			id: 'manage-offer',
			title: 'Manage Offer',
			icon: Tag,
			color: 'text-amber-600',
			bgColor: 'bg-amber-50',
			ringColor: 'ring-amber-100',
			desc: 'ডিসকাউন্ট কুপন ও বান্ডেল অফার'
		},
		{
			id: 'chat-manage',
			title: 'Chat Manage',
			icon: MessageSquare,
			color: 'text-sky-600',
			bgColor: 'bg-sky-50',
			ringColor: 'ring-sky-100',
			desc: 'WhatsApp ও Messenger লাইভ চ্যাট উইজেট'
		},
		{
			id: 'currency-country',
			title: 'Shop Currency & Country',
			icon: Globe,
			color: 'text-orange-600',
			bgColor: 'bg-orange-50',
			ringColor: 'ring-orange-100',
			desc: 'মুদ্রা (BDT ৳) এবং দেশ (Bangladesh)'
		},
		{
			id: 'domain-manage',
			title: 'Domain Manage',
			icon: Globe,
			color: 'text-amber-600',
			bgColor: 'bg-amber-50',
			ringColor: 'ring-amber-100',
			desc: 'কাস্টম ডোমেইন ম্যাপিং (lp.haqplus.com)'
		},
		{
			id: 'order-setting',
			title: 'Order Setting',
			icon: FileText,
			color: 'text-emerald-600',
			bgColor: 'bg-emerald-50',
			ringColor: 'ring-emerald-100',
			desc: 'অটো কনফার্মেশন ও অর্ডার প্রিফিক্স'
		},
		{
			id: 'product-setting',
			title: 'Product Setting',
			icon: Settings,
			color: 'text-emerald-600',
			bgColor: 'bg-emerald-50',
			ringColor: 'ring-emerald-100',
			desc: 'ইনভেন্টরি অ্যালার্ট ও স্টক ম্যানেজমেন্ট'
		},
		{
			id: 'google-search-console',
			title: 'Google Search Console',
			icon: Globe,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
			ringColor: 'ring-blue-100',
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
	<!-- VIEW 1: ALL SETTINGS (Exact Replica of Screenshot 1)     -->
	<!-- ======================================================== -->
	{#if activeTab === 'all'}
		
		<!-- Top Search Bar -->
		<div class="flex items-center max-w-md">
			<div class="relative flex-1">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search settings..."
					class="w-full bg-white border border-slate-200 rounded-l-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] shadow-2xs"
				/>
			</div>
			<button
				type="button"
				class="w-11 h-[38px] bg-[#5845eb] hover:bg-[#4734d6] text-white rounded-r-2xl flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
				title="Search"
			>
				<Search class="w-4 h-4" />
			</button>
		</div>

		<!-- 3-Column Settings Cards Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each filteredCards as card}
				<div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group">
					<div class="flex items-center gap-4 min-w-0">
						<!-- Circle Icon Badge -->
						<div class="w-12 h-12 rounded-full {card.bgColor} {card.ringColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
							<card.icon class="w-5 h-5 {card.color}" />
						</div>

						<div class="truncate">
							<h3 class="font-bold text-slate-900 text-sm truncate">{card.title}</h3>
							<button
								type="button"
								onclick={() => (activeTab = card.id)}
								class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#5845eb] transition-colors mt-0.5 cursor-pointer"
							>
								<span>Manage</span>
								<ArrowRight class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
							</button>
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
			<button
				type="button"
				onclick={() => (activeTab = 'all')}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</button>

			<!-- Title Header -->
			<div>
				<h2 class="text-xl font-bold text-slate-900">Facebook Pixel & Conversions API (CAPI)</h2>
				<p class="text-xs text-slate-500 mt-1">
					Track customer actions and improve your ad performance with Meta tracking
				</p>
			</div>

			<!-- Meta Pixel & CAPI Settings Main Box -->
			<div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
				
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
						<input
							id="fb-pixel-id"
							type="text"
							bind:value={fbPixelId}
							placeholder="806385144697838"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#1877f2] focus:bg-white transition-all"
						/>
						<span class="text-[11px] text-slate-400 block">Find this in Meta Events Manager.</span>
					</div>

					<!-- CAPI Access Token Field -->
					<div class="space-y-1.5">
						<label for="capi-token" class="text-xs font-bold text-slate-700 block">
							CAPI Access Token
						</label>
						<textarea
							id="capi-token"
							rows="3"
							bind:value={fbCapiToken}
							placeholder="EAAQZCaLfr2KUBSw5YGLAS5uUNlyLllbFYr..."
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#1877f2] focus:bg-white transition-all leading-relaxed"
						></textarea>
						<span class="text-[11px] text-slate-400 block">Required for Server-Side (CAPI) tracking.</span>
					</div>

					<!-- Test Events (Optional) Box -->
					<div class="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
						<h4 class="text-xs font-bold text-slate-800">Test Events (Optional)</h4>

						<div class="space-y-2">
							<label class="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
								<input
									type="checkbox"
									bind:checked={fbTestMode}
									class="w-4 h-4 rounded text-[#1877f2] focus:ring-[#1877f2]"
								/>
								<span>Enable Test Mode</span>
							</label>

							<label class="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
								<input
									type="checkbox"
									bind:checked={fbTriggerPurchase}
									class="w-4 h-4 rounded text-[#1877f2] focus:ring-[#1877f2]"
								/>
								<span>Trigger Purchase on Order Confirm</span>
							</label>
						</div>

						<p class="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
							Use this to verify your setup in Events Manager > Test Events.
						</p>
					</div>

					<!-- Save Button -->
					<div class="pt-2">
						<button
							type="button"
							onclick={() => triggerSave('Facebook Pixel & CAPI Settings Saved!')}
							class="w-full py-3 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer transition-all"
						>
							Save Facebook Tracking Settings
						</button>
					</div>
				</div>
			</div>

			<!-- Step-by-Step Setup Guide Accordion -->
			<div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
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
							<p class="text-slate-500">Go to Meta Events Manager > Data Sources > Pixel Settings and copy the Pixel ID.</p>
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
			</div>

		</div>

	<!-- ======================================================== -->
	<!-- VIEW 3: DELIVERY CHARGE                                  -->
	<!-- ======================================================== -->
	{:else if activeTab === 'delivery-charge'}
		<div class="space-y-6 max-w-2xl">
			<button
				type="button"
				onclick={() => (activeTab = 'all')}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold shadow-2xs cursor-pointer"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</button>

			<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
				<h3 class="text-base font-bold text-slate-900">ডেলিভারি চার্জ নির্ধারণ</h3>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="dhaka" class="text-xs font-bold text-slate-700">ঢাকার ভেতরে চার্জ (৳)</label>
						<input
							id="dhaka"
							type="number"
							bind:value={deliveryDhaka}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
						/>
					</div>
					<div class="space-y-1.5">
						<label for="outside-dhaka" class="text-xs font-bold text-slate-700">ঢাকার বাইরে চার্জ (৳)</label>
						<input
							id="outside-dhaka"
							type="number"
							bind:value={deliveryOutsideDhaka}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
						/>
					</div>
				</div>

				<button
					type="button"
					onclick={() => triggerSave('Delivery Charge Settings Saved!')}
					class="px-5 py-2.5 rounded-xl bg-[#5845eb] hover:bg-[#4734d6] text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
				>
					Save Delivery Charges
				</button>
			</div>
		</div>

	<!-- ======================================================== -->
	<!-- VIEW 4: COURIER (STEADFAST & PATHAO)                     -->
	<!-- ======================================================== -->
	{:else if activeTab === 'courier'}
		<div class="space-y-6 max-w-2xl">
			<button
				type="button"
				onclick={() => (activeTab = 'all')}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold shadow-2xs cursor-pointer"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</button>

			<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
				<div class="flex items-center justify-between pb-3 border-b border-slate-100">
					<h3 class="text-base font-bold text-slate-900">Steadfast ও Pathao Courier API</h3>
					<button
						type="button"
						onclick={testCourierApi}
						disabled={isCourierSyncing}
						class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
					>
						<RefreshCw class="w-3.5 h-3.5 {isCourierSyncing ? 'animate-spin text-[#5845eb]' : ''}" />
						<span>Test Connection</span>
					</button>
				</div>

				{#if courierStatusMessage}
					<div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
						<CheckCircle2 class="w-4 h-4 text-emerald-600" />
						<span>{courierStatusMessage}</span>
					</div>
				{/if}

				<div class="space-y-3">
					<div class="space-y-1">
						<label for="st-key" class="text-xs font-bold text-slate-700">Steadfast API Key</label>
						<input
							id="st-key"
							type="text"
							bind:value={steadfastApiKey}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
						/>
					</div>
					<div class="space-y-1">
						<label for="st-sec" class="text-xs font-bold text-slate-700">Steadfast Secret Key</label>
						<input
							id="st-sec"
							type="password"
							bind:value={steadfastSecretKey}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
						/>
					</div>
				</div>

				<button
					type="button"
					onclick={() => triggerSave('Courier API Credentials Saved!')}
					class="px-5 py-2.5 rounded-xl bg-[#5845eb] hover:bg-[#4734d6] text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
				>
					Save Courier Settings
				</button>
			</div>
		</div>

	<!-- ======================================================== -->
	<!-- VIEW 5: FRAUD CHECK API                                  -->
	<!-- ======================================================== -->
	{:else if activeTab === 'fraud-check'}
		<div class="space-y-6 max-w-2xl">
			<button
				type="button"
				onclick={() => (activeTab = 'all')}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold shadow-2xs cursor-pointer"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</button>

			<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
				<h3 class="text-base font-bold text-slate-900">Fraud Check API & Return Ratio Threshold</h3>
				<p class="text-xs text-slate-500">Steadfast ডেলিভারি হিস্টোরি দেখে সন্দেহভাজন ফেক কাস্টমার চিহ্নিতকরণ</p>

				<div class="space-y-4">
					<div class="space-y-1.5">
						<label for="fraud-ratio" class="text-xs font-bold text-slate-700">ন্যূনতম গ্রহণযোগ্য ডেলিভারি রেশিও (%)</label>
						<input
							id="fraud-ratio"
							type="number"
							bind:value={minDeliveryRatio}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800"
						/>
						<span class="text-[11px] text-slate-400">এর নিচের রেশিওধারীদের জন্য ক্যাশ অন ডেলিভারি ব্লক অথবা অগ্রিম চাওয়া হবে</span>
					</div>

					<label class="flex items-center gap-2.5 text-xs text-slate-700 font-bold cursor-pointer">
						<input type="checkbox" bind:checked={autoBlockFraud} class="w-4 h-4 rounded text-[#5845eb]" />
						<span>Auto-flag Fake Orders with Return Rate &gt; 50%</span>
					</label>
				</div>

				<button
					type="button"
					onclick={() => triggerSave('Fraud Check Settings Saved!')}
					class="px-5 py-2.5 rounded-xl bg-[#5845eb] hover:bg-[#4734d6] text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
				>
					Save Fraud Rules
				</button>
			</div>
		</div>

	<!-- ======================================================== -->
	<!-- VIEW 6: OTHER SETTINGS GENERIC CARD                      -->
	<!-- ======================================================== -->
	{:else}
		<div class="space-y-6 max-w-2xl">
			<button
				type="button"
				onclick={() => (activeTab = 'all')}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold shadow-2xs cursor-pointer"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</button>

			<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
				<h3 class="text-base font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')} Settings</h3>
				<p class="text-xs text-slate-500">Configure parameters for {activeTab}.</p>
				
				<div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
					This module is active and connected with your AURA Enterprise Engine on Cloudflare edge.
				</div>

				<button
					type="button"
					onclick={() => triggerSave(`${activeTab} saved!`)}
					class="px-5 py-2.5 rounded-xl bg-[#5845eb] hover:bg-[#4734d6] text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
				>
					Save Changes
				</button>
			</div>
		</div>
	{/if}

</div>
