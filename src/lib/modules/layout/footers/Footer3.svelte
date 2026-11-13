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

			<!-- Developed by Haq Plus IT with WhatsApp Link -->
			<div class="flex items-center gap-2 text-[11px] text-slate-600 flex-wrap justify-center">
				<span>Developed by</span>
				<a
					href="https://wa.me/8801560007230?text=Hello%20Haq%20Plus%20IT%2C%20I%20want%20to%20build%20an%20e-commerce%20website."
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 hover:border-emerald-500/50 text-slate-800 font-bold transition-all hover:scale-105 active:scale-95 shadow-2xs"
					title="Chat with Haq Plus IT on WhatsApp"
				>
					<svg class="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
						<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
					</svg>
					<span>Haq Plus IT</span>
					<span class="text-slate-300 font-normal">|</span>
					<span class="text-emerald-600 font-semibold tracking-wide">01560007230</span>
				</a>
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

