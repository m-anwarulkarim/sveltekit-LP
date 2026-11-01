<script lang="ts">
	import { ShoppingCart, PhoneCall, Menu, X, ArrowRight, ShieldCheck, Sparkles, Home, Package, CheckCircle2, Star, HelpCircle } from 'lucide-svelte';
	import { Button } from '#lib/components/ui';

	export interface NavItem {
		label: string;
		targetId: string;
		icon?: string;
	}

	interface Props {
		title: string;
		badgeText?: string;
		announcementText?: string;
		contactPhone?: string;
		accentColor?: string;
		navItems?: NavItem[];
		onOrderClick?: () => void;
	}

	let {
		title,
		badgeText = '১০০% অরিজিনাল ও এক্সক্লুসিভ কোয়ালিটি',
		announcementText,
		contactPhone,
		accentColor = '#e8007c',
		navItems = [
			{ label: 'হোম', targetId: 'lh-hero', icon: 'home' },
			{ label: 'প্যাকেজসমূহ', targetId: 'lighthouse-packages-step', icon: 'package' },
			{ label: 'উপকারিতা', targetId: 'lighthouse-benefits-step', icon: 'check' },
			{ label: 'রিভিউ', targetId: 'lighthouse-reviews-step', icon: 'star' },
			{ label: 'প্রশ্ন-উত্তর', targetId: 'lighthouse-faqs-step', icon: 'help' }
		],
		onOrderClick
	}: Props = $props();

	let isMobileMenuOpen = $state(false);

	function scrollToSection(targetId: string) {
		isMobileMenuOpen = false;
		const el = document.getElementById(targetId);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		} else if (onOrderClick) {
			onOrderClick();
		}
	}

	function handleOrderAction() {
		isMobileMenuOpen = false;
		if (onOrderClick) {
			onOrderClick();
		}
	}
</script>

<!-- Top Announcement Banner -->
{#if announcementText}
	<div
		class="text-white py-1.5 sm:py-2 px-3 text-[11px] sm:text-xs font-black tracking-wide text-center flex items-center justify-center gap-1.5 shadow-xs select-none"
		style="background-color: {accentColor};"
	>
		<span class="inline-block animate-pulse">🎉</span>
		<span class="truncate max-w-[90vw] sm:max-w-none">{announcementText}</span>
	</div>
{/if}

<!-- Sticky Navigation Header -->
<header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs font-sans">
	<div class="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">

		<!-- Left: Brand / Landing Product Title -->
		<div class="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 max-w-[55%] sm:max-w-xs md:max-w-sm lg:max-w-md">
			<div
				class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-white flex items-center justify-center font-black shadow-xs shrink-0 select-none text-sm"
				style="background-color: {accentColor};"
			>
				✨
			</div>
			<div class="min-w-0 flex-1">
				<h2
					class="text-xs sm:text-sm md:text-base font-black text-slate-900 tracking-tight leading-tight truncate"
					title={title}
				>
					{title}
				</h2>
				<p
					class="text-[10px] sm:text-[11px] font-bold hidden sm:flex items-center gap-1 truncate mt-0.5"
					style="color: {accentColor};"
				>
					<span>{badgeText}</span>
				</p>
			</div>
		</div>

		<!-- Center: Desktop Navigation Links (hidden on mobile) -->
		{#if navItems && navItems.length > 0}
			<nav class="hidden lg:flex items-center gap-4 xl:gap-6 text-xs font-bold text-slate-600">
				{#each navItems as item}
					<button
						type="button"
						onclick={() => scrollToSection(item.targetId)}
						class="hover:text-slate-900 transition-colors py-1 px-1 cursor-pointer hover:underline decoration-2 underline-offset-4"
						style="--accent: {accentColor};"
					>
						{item.label}
					</button>
				{/each}
			</nav>
		{/if}

		<!-- Right: Quick Actions (Call, Order CTA, Hamburger) -->
		<div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
			{#if contactPhone}
				<!-- Desktop Call Pill -->
				<a
					href="tel:{contactPhone}"
					class="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all shadow-2xs"
				>
					<PhoneCall class="w-3.5 h-3.5" style="color: {accentColor};" />
					<span>{contactPhone}</span>
				</a>

				<!-- Mobile Call Icon Button -->
				<a
					href="tel:{contactPhone}"
					aria-label="Call {contactPhone}"
					class="inline-flex md:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
				>
					<PhoneCall class="w-3.5 h-3.5" style="color: {accentColor};" />
				</a>
			{/if}

			<!-- Quick Order Button -->
			<button
				type="button"
				class="inline-flex items-center gap-1.5 text-white font-black text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-md cursor-pointer transition-all active:scale-95 whitespace-nowrap"
				style="background-color: {accentColor};"
				onclick={handleOrderAction}
			>
				<ShoppingCart class="w-3.5 h-3.5" />
				<span>অর্ডার করুন</span>
			</button>

			<!-- Mobile Menu Hamburger Button -->
			{#if navItems && navItems.length > 0}
				<button
					type="button"
					aria-label="Toggle Navigation Menu"
					class="lg:hidden p-1.5 sm:p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
					onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
				>
					{#if isMobileMenuOpen}
						<X class="w-4 h-4 text-slate-900" />
					{:else}
						<Menu class="w-4 h-4 text-slate-900" />
					{/if}
				</button>
			{/if}
		</div>

	</div>

	<!-- Mobile Dropdown Navigation Drawer -->
	{#if isMobileMenuOpen && navItems && navItems.length > 0}
		<div class="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 py-3 space-y-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
			<div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1">
				নেভিগেশন মেনু
			</div>

			<div class="grid grid-cols-1 gap-1">
				{#each navItems as item}
					<button
						type="button"
						onclick={() => scrollToSection(item.targetId)}
						class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
					>
						<span>{item.label}</span>
						<ArrowRight class="w-3.5 h-3.5 text-slate-400" />
					</button>
				{/each}
			</div>

			{#if contactPhone}
				<div class="pt-2 border-t border-slate-100">
					<a
						href="tel:{contactPhone}"
						class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold hover:bg-slate-100 transition-colors"
					>
						<PhoneCall class="w-3.5 h-3.5" style="color: {accentColor};" />
						<span>সরাসরি কল করুন: {contactPhone}</span>
					</a>
				</div>
			{/if}

			<div class="pt-1">
				<button
					type="button"
					onclick={handleOrderAction}
					class="w-full py-2.5 px-4 rounded-xl text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
					style="background-color: {accentColor};"
				>
					<ShoppingCart class="w-4 h-4" />
					<span>অর্ডার ফর্ম এ যান</span>
				</button>
			</div>
		</div>
	{/if}
</header>

