<script lang="ts">
	import { Button, Input } from '#lib/components/ui';
	import {
		Truck,
		Package,
		Search,
		ArrowRight,
		FileText,
		Tag,
		Settings
	} from 'lucide-svelte';

	let searchQuery = $state('');

	// 10 Active Settings Cards (Each has its own dedicated page)
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

<svelte:head>
	<title>Settings Hub | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto">
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
			<a
				href="/admin/settings/{card.id}"
				class="rounded-[20px] {card.cardBg} p-5 flex items-center justify-between border-0 shadow-none hover:shadow-md transition-all duration-200 cursor-pointer group text-left block no-underline"
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
