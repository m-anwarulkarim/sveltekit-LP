<script lang="ts">
	import {
		Truck,
		Headphones,
		RotateCcw,
		ShieldCheck,
		Phone,
		Mail,
		MapPin,
		Flame,
		Send
	} from 'lucide-svelte';
	import { DEFAULT_FOOTER_DATA, type FooterStoreData } from './data';

	interface Props {
		data?: Partial<FooterStoreData>;
		class?: string;
	}

	let { data = {}, class: className = '' }: Props = $props();

	const footer = $derived({
		...DEFAULT_FOOTER_DATA,
		...data
	});

	let newsletterEmail = $state('');
	let subscribed = $state(false);

	function handleSubscribe(e: Event) {
		e.preventDefault();
		if (newsletterEmail.trim()) {
			subscribed = true;
			setTimeout(() => {
				newsletterEmail = '';
				subscribed = false;
			}, 3000);
		}
	}
</script>

<footer class="w-full bg-[#f8fafc] font-['Anek_Bangla',sans-serif] text-slate-700 border-t border-slate-200/90 {className}">
	<!-- 1. Top Feature Guarantee Grid (Trust Badges) -->
	<div class="border-b border-slate-200/80 bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<!-- Guarantee 1: Delivery -->
				<div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/90 shadow-2xs">
					<div class="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
						<Truck class="w-6 h-6" />
					</div>
					<div>
						<h4 class="text-sm font-bold text-slate-900">দ্রুত এক্সপ্রেস ডেলিভারি</h4>
						<p class="text-[11px] text-slate-500 mt-0.5">সারা দেশে দ্রুত ও নিরাপদ হোম ডেলিভারি</p>
					</div>
				</div>

				<!-- Guarantee 2: Support -->
				<div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/90 shadow-2xs">
					<div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
						<Headphones class="w-6 h-6" />
					</div>
					<div>
						<h4 class="text-sm font-bold text-slate-900">২৪/৭ কাস্টমার সাপোর্ট</h4>
						<p class="text-[11px] text-slate-500 mt-0.5">যেকোনো সময় যেকোনো সমস্যায় পাশে পাবেন</p>
					</div>
				</div>

				<!-- Guarantee 3: Return -->
				<div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/90 shadow-2xs">
					<div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
						<RotateCcw class="w-6 h-6" />
					</div>
					<div>
						<h4 class="text-sm font-bold text-slate-900">৭ দিনের ইজি রিটার্ন</h4>
						<p class="text-[11px] text-slate-500 mt-0.5">পণ্য পছন্দ না হলে সহজ রিটার্ন ও রিফান্ড</p>
					</div>
				</div>

				<!-- Guarantee 4: Genuine -->
				<div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/90 shadow-2xs">
					<div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
						<ShieldCheck class="w-6 h-6" />
					</div>
					<div>
						<h4 class="text-sm font-bold text-slate-900">১০০% অথেনটিক পণ্য</h4>
						<p class="text-[11px] text-slate-500 mt-0.5">অরিজিনাল ও ভেরিফাইড গ্যারান্টি</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 2. Main Structured Grid -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
			<!-- Col 1: Brand & Contact -->
			<div class="lg:col-span-4 space-y-4">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-xl bg-[#2563eb] text-white flex items-center justify-center">
						<Flame class="w-5 h-5" />
					</div>
					<span class="text-xl font-black text-slate-900 tracking-tight font-['Outfit']">
						{footer.brandName}
					</span>
				</div>
				<p class="text-xs text-slate-600 leading-relaxed max-w-sm">
					{footer.aboutText}
				</p>
				<div class="space-y-2.5 text-xs text-slate-700 font-medium pt-1">
					<div class="flex items-center gap-2">
						<Phone class="w-4 h-4 text-[#2563eb]" />
						<a href="tel:{footer.phoneHotline}" class="hover:text-[#2563eb] font-bold">
							{footer.phoneHotline}
						</a>
						<span class="text-[11px] text-slate-400">({footer.workingHours})</span>
					</div>
					<div class="flex items-center gap-2">
						<Mail class="w-4 h-4 text-[#2563eb]" />
						<a href="mailto:{footer.supportEmail}" class="hover:text-[#2563eb]">
							{footer.supportEmail}
						</a>
					</div>
					<div class="flex items-start gap-2">
						<MapPin class="w-4 h-4 text-[#2563eb] shrink-0 mt-0.5" />
						<span class="text-slate-600">{footer.officeAddress}</span>
					</div>
				</div>
			</div>

			<!-- Col 2: Customer Care -->
			<div class="lg:col-span-3 space-y-3">
				<h4 class="text-sm font-bold text-slate-900">কাস্টমার কেয়ার</h4>
				<ul class="space-y-2 text-xs">
					{#each footer.customerServiceLinks as link}
						<li>
							<a href={link.href} class="text-slate-600 hover:text-[#2563eb] transition-colors">
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Col 3: Useful Links -->
			<div class="lg:col-span-2 space-y-3">
				<h4 class="text-sm font-bold text-slate-900">দ্রুত লিংক</h4>
				<ul class="space-y-2 text-xs">
					{#each footer.usefulLinks as link}
						<li>
							<a href={link.href} class="text-slate-600 hover:text-[#2563eb] transition-colors">
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Col 4: Newsletter & Deals -->
			<div class="lg:col-span-3 space-y-3">
				<h4 class="text-sm font-bold text-slate-900">নিউজলেটার সাবস্ক্রিপশন</h4>
				<p class="text-xs text-slate-500 leading-relaxed">
					সেরা ডিল এবং নতুন অফারের আপডেট সরাসরি আপনার ইমেইলে পেতে সাবস্ক্রাইব করুন।
				</p>
				<form onsubmit={handleSubscribe} class="flex items-center gap-1.5 pt-1">
					<input
						type="email"
						bind:value={newsletterEmail}
						placeholder="আপনার ইমেইল অ্যাড্রেস..."
						required
						class="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:border-[#2563eb] transition-colors"
					/>
					<button
						type="submit"
						class="px-3.5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer shadow-sm transition-all"
					>
						<Send class="w-3.5 h-3.5" />
					</button>
				</form>
				{#if subscribed}
					<p class="text-[11px] text-emerald-600 font-bold">ধন্যবাদ! আপনি সফলভাবে সাবস্ক্রাইব করেছেন।</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- 3. Bottom White Strip with Payment & Copyright -->
	<div class="border-t border-slate-200/80 bg-white py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
		<div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
			<div>
				{footer.copyrightText}
			</div>

			<!-- Payment Badges -->
			<div class="flex items-center flex-wrap gap-2 text-[11px]">
				<span class="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 font-bold text-[#E2136E]">bKash</span>
				<span class="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 font-bold text-[#F7941D]">নগদ</span>
				<span class="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 font-bold italic text-[#1A1F71]">VISA</span>
				<span class="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 font-bold text-slate-700">Mastercard</span>
			</div>
		</div>
	</div>
</footer>

