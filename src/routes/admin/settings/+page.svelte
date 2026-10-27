<script lang="ts">
	import {
		Search,
		ArrowRight,
		Truck,
		Package,
		ShieldCheck,
		CreditCard,
		MessageSquare,
		Coins,
		Globe,
		FileText,
		Settings,
		BookOpen,
		Receipt,
		Award,
		PhoneCall,
		RefreshCw,
		MessageCircle,
		Tag,
		DollarSign,
		Wrench
	} from 'lucide-svelte';

	let searchQuery = $state('');

	// Complete 23 Settings Cards Matching Screenshot 1 & 2
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
			cardBg: 'bg-[#edf9f3]',
			iconBg: 'bg-[#10b981]',
			ringBorder: 'border-[#10b981]/40',
			accentColor: 'text-[#10b981]',
			iconType: 'advance',
			desc: 'অর্ডার কনফার্মেশনের জন্য অগ্রিম পেমেন্ট সেটিংস'
		},
		{
			id: 'sms',
			title: 'SMS',
			cardBg: 'bg-[#fef8ee]',
			iconBg: 'bg-[#f97316]',
			ringBorder: 'border-[#f97316]/40',
			accentColor: 'text-[#f97316]',
			iconType: 'sms',
			desc: 'অর্ডার কনফার্মেশন ও ওটিপি এসএমএস গেটওয়ে'
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
			id: 'fraud-check-api',
			title: 'Fraud Check API',
			cardBg: 'bg-[#f0f7ff]',
			iconBg: 'bg-[#1d6ee5]',
			ringBorder: 'border-[#1d6ee5]/40',
			accentColor: 'text-[#1d6ee5]',
			iconType: 'shield',
			desc: 'ভুয়া অর্ডার ও রিটার্ন ফ্রড ডিটেকশন এপিআই'
		},
		{
			id: 'payment-methods',
			title: 'Payment Methods',
			cardBg: 'bg-[#edf9f3]',
			iconBg: 'bg-[#10b981]',
			ringBorder: 'border-[#10b981]/40',
			accentColor: 'text-[#10b981]',
			iconType: 'payment',
			desc: 'বিকাশ, নগদ, রকেট ও অনলাইন পেমেন্ট গেটওয়ে'
		},
		{
			id: 'social-login',
			title: 'Social Login',
			cardBg: 'bg-[#fef2f2]',
			iconBg: 'bg-[#ef4444]',
			ringBorder: 'border-[#ef4444]/40',
			accentColor: 'text-[#ef4444]',
			iconType: 'google',
			desc: 'Google ও Facebook ওয়ান-ট্যাপ লগইন ইন্টিগ্রেশন'
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
			id: 'tag-manager',
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
			iconType: 'offer',
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
			desc: 'লাইভ চ্যাট উইজেট, WhatsApp ও Messenger'
		},
		{
			id: 'currency-country',
			title: 'Shop Currency & Country',
			cardBg: 'bg-[#fef8ee]',
			iconBg: 'bg-[#f97316]',
			ringBorder: 'border-[#f97316]/40',
			accentColor: 'text-[#f97316]',
			iconType: 'currency',
			desc: 'ডিফল্ট কারেন্সি BDT/USD ও টার্গেট দেশ'
		},
		{
			id: 'domain-manage',
			title: 'Domain Mange',
			cardBg: 'bg-[#fef8ee]',
			iconBg: 'bg-[#f97316]',
			ringBorder: 'border-[#f97316]/40',
			accentColor: 'text-[#f97316]',
			iconType: 'domain',
			desc: 'কাস্টম ডোমেন কানেকশন ও DNS রেকর্ডস'
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
		},
		{
			id: 'blog-settings',
			title: 'Blog Settings',
			cardBg: 'bg-[#eef5fc]',
			iconBg: 'bg-[#1d6ee5]',
			ringBorder: 'border-[#1d6ee5]/40',
			accentColor: 'text-[#1d6ee5]',
			iconType: 'blog',
			desc: 'ব্লগ পাবলিশিং, কমেন্ট মডারেশন ও এসইও'
		},
		{
			id: 'invoice-settings',
			title: 'Invoice Settings',
			cardBg: 'bg-[#eef5fc]',
			iconBg: 'bg-[#1d6ee5]',
			ringBorder: 'border-[#1d6ee5]/40',
			accentColor: 'text-[#1d6ee5]',
			iconType: 'invoice',
			desc: 'ইনভয়েস টেমপ্লেট, প্রিন্ট হেডার ও ট্যাক্স/ভ্যাট'
		},
		{
			id: 'reward-point',
			title: 'Reward Point',
			cardBg: 'bg-[#fef2f2]',
			iconBg: 'bg-[#ef4444]',
			ringBorder: 'border-[#ef4444]/40',
			accentColor: 'text-[#ef4444]',
			iconType: 'reward',
			desc: 'লয়্যালটি পয়েন্ট ও ক্যাশব্যাক রিডেম্পশন'
		},
		{
			id: 'epbx-auto-call',
			title: 'ePBX Auto Call',
			cardBg: 'bg-[#eef5fc]',
			iconBg: 'bg-[#1d6ee5]',
			ringBorder: 'border-[#1d6ee5]/40',
			accentColor: 'text-[#1d6ee5]',
			iconType: 'phone',
			desc: 'স্বয়ংক্রিয় আইভিআর কল কনফার্মেশন গেটওয়ে'
		},
		{
			id: 'bizmation-sync',
			title: 'Bizmation Sync',
			cardBg: 'bg-[#ecfeff]',
			iconBg: 'bg-[#06b6d4]',
			ringBorder: 'border-[#06b6d4]/40',
			accentColor: 'text-[#06b6d4]',
			iconType: 'sync',
			desc: 'Bizmation ইআরপি ও অ্যাকাউন্টস অটোমেশন সিঙ্ক'
		}
	];

	let filteredCards = $derived(
		ALL_SETTINGS_CARDS.filter(
			(c) =>
				c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.desc.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);
</script>

<svelte:head>
	<title>Settings - AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
	<!-- Top Search Input (Matches Reference Screenshot with Purple Search Button) -->
	<div class="max-w-md">
		<div class="flex items-center">
			<input
				type="text"
				placeholder="Search"
				bind:value={searchQuery}
				class="w-full bg-[#f4f2fe] border border-indigo-100 rounded-l-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] shadow-2xs font-medium"
			/>
			<button
				type="button"
				class="bg-[#e0dbfc] hover:bg-[#d0c9fb] text-[#5845eb] px-4 py-2.5 rounded-r-2xl border border-l-0 border-indigo-200 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
				aria-label="Search"
			>
				<Search class="w-4 h-4" />
			</button>
		</div>
	</div>

	<!-- 3-Column Settings Cards Grid (Borderless Pastel Cards) -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each filteredCards as card}
			<a
				href="/admin/settings/{card.id}"
				class="rounded-3xl {card.cardBg} p-5 flex items-center justify-between border-0 shadow-none hover:shadow-md transition-all duration-200 cursor-pointer group text-left block no-underline"
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
							{:else if card.iconType === 'google'}
								<span class="font-bold text-sm font-sans">G</span>
							{:else if card.iconType === 'truck'}
								<Truck class="w-4.5 h-4.5" />
							{:else if card.iconType === 'advance'}
								<Truck class="w-4.5 h-4.5" />
							{:else if card.iconType === 'sms'}
								<MessageSquare class="w-4.5 h-4.5" />
							{:else if card.iconType === 'courier'}
								<Package class="w-4.5 h-4.5" />
							{:else if card.iconType === 'shield'}
								<ShieldCheck class="w-4.5 h-4.5" />
							{:else if card.iconType === 'payment'}
								<CreditCard class="w-4.5 h-4.5" />
							{:else if card.iconType === 'tag'}
								<Tag class="w-4.5 h-4.5" />
							{:else if card.iconType === 'offer'}
								<Globe class="w-4.5 h-4.5" />
							{:else if card.iconType === 'chat'}
								<MessageCircle class="w-4.5 h-4.5" />
							{:else if card.iconType === 'currency'}
								<DollarSign class="w-4.5 h-4.5" />
							{:else if card.iconType === 'domain'}
								<Globe class="w-4.5 h-4.5" />
							{:else if card.iconType === 'order'}
								<FileText class="w-4.5 h-4.5" />
							{:else if card.iconType === 'product'}
								<Settings class="w-4.5 h-4.5" />
							{:else if card.iconType === 'console'}
								<Wrench class="w-4.5 h-4.5" />
							{:else if card.iconType === 'blog'}
								<BookOpen class="w-4.5 h-4.5" />
							{:else if card.iconType === 'invoice'}
								<Receipt class="w-4.5 h-4.5" />
							{:else if card.iconType === 'reward'}
								<Award class="w-4.5 h-4.5" />
							{:else if card.iconType === 'phone'}
								<PhoneCall class="w-4.5 h-4.5" />
							{:else if card.iconType === 'sync'}
								<RefreshCw class="w-4.5 h-4.5" />
							{:else}
								<Settings class="w-4.5 h-4.5" />
							{/if}
						</div>
					</div>

					<div class="truncate">
						<h3 class="font-bold text-slate-900 text-[14.5px] tracking-tight truncate leading-tight">
							{card.title}
						</h3>
						<span class="inline-flex items-center gap-1 text-xs font-semibold {card.accentColor} mt-1">
							<span>Manage</span>
							<ArrowRight class="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
						</span>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
