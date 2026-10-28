<script lang="ts">
	import {
		Phone,
		Mail,
		MapPin,
		Clock,
		Flame,
		ChevronRight
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
</script>

<footer class="w-full bg-white font-['Anek_Bangla',sans-serif] border-t border-slate-200/90 text-slate-700 {className}">
	<!-- 1. Main Footer 4-Column Grid -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
			<!-- Column 1: Brand Info & Contact Details -->
			<div class="lg:col-span-4 space-y-4">
				<a href="/" class="flex items-center gap-3 group">
					<div
						class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#5845eb] via-[#7c3aed] to-[#9333ea] p-[1.5px] shadow-sm shadow-indigo-600/20 group-hover:scale-105 transition-transform shrink-0"
					>
						<div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
							<Flame class="w-6 h-6 text-[#5845eb]" />
						</div>
					</div>
					<div class="flex flex-col">
						<div class="flex items-center gap-1.5 leading-tight">
							<span class="font-black text-xl text-slate-900 font-['Outfit'] tracking-tight">
								{footer.brandName}
							</span>
							<span
								class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-[#5845eb] border border-indigo-200"
							>
								ORIGINAL
							</span>
						</div>
						<span class="text-[11px] text-slate-500 font-medium -mt-0.5">
							{footer.brandTagline}
						</span>
					</div>
				</a>

				<p class="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-sm">
					{footer.aboutText}
				</p>

				<!-- Contact Details -->
				<div class="space-y-3 pt-2 text-xs sm:text-[13px] text-slate-700 font-medium">
					<div class="flex items-start gap-3">
						<div
							class="w-8 h-8 rounded-xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0 border border-indigo-100"
						>
							<Phone class="w-4 h-4" />
						</div>
						<div class="flex flex-col">
							<a
								href="tel:{footer.phoneHotline}"
								class="font-bold text-slate-900 hover:text-[#5845eb] transition-colors"
							>
								{footer.phoneHotline}
							</a>
							<span class="text-[11px] text-slate-500 flex items-center gap-1">
								<Clock class="w-3 h-3 text-slate-400" />
								{footer.workingHours}
							</span>
						</div>
					</div>

					<div class="flex items-center gap-3">
						<div
							class="w-8 h-8 rounded-xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0 border border-indigo-100"
						>
							<Mail class="w-4 h-4" />
						</div>
						<a
							href="mailto:{footer.supportEmail}"
							class="hover:text-[#5845eb] transition-colors text-slate-600"
						>
							{footer.supportEmail}
						</a>
					</div>

					<div class="flex items-start gap-3">
						<div
							class="w-8 h-8 rounded-xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0 border border-indigo-100"
						>
							<MapPin class="w-4 h-4" />
						</div>
						<span class="leading-snug text-slate-600">
							{footer.officeAddress}
						</span>
					</div>
				</div>
			</div>

			<!-- Column 2: Customer Service -->
			<div class="lg:col-span-3 space-y-4">
				<div>
					<h3 class="text-base font-extrabold text-slate-900 tracking-tight">Customer Service</h3>
					<div class="w-10 h-1 bg-gradient-to-r from-[#5845eb] to-[#9333ea] rounded-full mt-1.5"></div>
				</div>
				<ul class="space-y-2.5 text-xs sm:text-[13px]">
					{#each footer.customerServiceLinks as link}
						<li>
							<a
								href={link.href}
								class="text-slate-600 hover:text-[#5845eb] hover:translate-x-1 inline-flex items-center gap-1 transition-all"
							>
								<ChevronRight class="w-3.5 h-3.5 text-slate-400" />
								<span>{link.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Column 3: Useful Links -->
			<div class="lg:col-span-2 space-y-4">
				<div>
					<h3 class="text-base font-extrabold text-slate-900 tracking-tight">Quick Links</h3>
					<div class="w-10 h-1 bg-gradient-to-r from-[#5845eb] to-[#9333ea] rounded-full mt-1.5"></div>
				</div>
				<ul class="space-y-2.5 text-xs sm:text-[13px]">
					{#each footer.usefulLinks as link}
						<li>
							<a
								href={link.href}
								class="text-slate-600 hover:text-[#5845eb] hover:translate-x-1 inline-flex items-center gap-1 transition-all"
							>
								<ChevronRight class="w-3.5 h-3.5 text-slate-400" />
								<span>{link.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Column 4: Social & Newsletter -->
			<div class="lg:col-span-3 space-y-4">
				<div>
					<h3 class="text-base font-extrabold text-slate-900 tracking-tight">Stay Connected</h3>
					<div class="w-10 h-1 bg-gradient-to-r from-[#5845eb] to-[#9333ea] rounded-full mt-1.5"></div>
				</div>
				<p class="text-xs text-slate-500 leading-relaxed">
					Follow us on social channels to receive the latest sales alerts and discount vouchers.
				</p>

				<!-- Social Buttons -->
				<div class="flex items-center gap-2.5 pt-1">
					<a
						href={footer.facebookUrl}
						target="_blank"
						rel="noreferrer"
						aria-label="Facebook"
						class="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 shadow-xs transition-transform"
					>
						<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
							<path
								d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
							/>
						</svg>
					</a>
					<a
						href={footer.twitterUrl}
						target="_blank"
						rel="noreferrer"
						aria-label="X / Twitter"
						class="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:scale-110 shadow-xs transition-transform"
					>
						<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
							<path
								d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
							/>
						</svg>
					</a>
					<a
						href={footer.youtubeUrl}
						target="_blank"
						rel="noreferrer"
						aria-label="YouTube"
						class="w-9 h-9 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 shadow-xs transition-transform"
					>
						<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
							<path
								d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
							/>
						</svg>
					</a>
					<a
						href={footer.instagramUrl}
						target="_blank"
						rel="noreferrer"
						aria-label="Instagram"
						class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center hover:scale-110 shadow-xs transition-transform"
					>
						<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
							<path
								d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
							/>
						</svg>
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- 2. Middle Strip: We Accept & Delivery Partners -->
	<div class="bg-slate-50/90 border-t border-b border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8">
		<div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
			<!-- Payment Badges -->
			<div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
				<span class="text-xs font-bold text-slate-900 tracking-tight shrink-0">
					We Accept:
				</span>
				<div class="flex flex-wrap items-center gap-2">
					<span class="h-7 px-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-[#E2136E] shadow-2xs">
						bKash
					</span>
					<span class="h-7 px-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-[#F7941D] shadow-2xs">
						নগদ
					</span>
					<span class="h-7 px-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-[#8C3494] shadow-2xs">
						রকেট
					</span>
					<span class="h-7 px-3 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black italic text-[#1A1F71] shadow-2xs">
						VISA
					</span>
					<span class="h-7 px-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
						<div class="flex items-center -space-x-1.5">
							<span class="w-3.5 h-3.5 rounded-full bg-[#EB001B] inline-block"></span>
							<span class="w-3.5 h-3.5 rounded-full bg-[#F79E1B]/90 inline-block"></span>
						</div>
					</span>
				</div>
			</div>

			<!-- Delivery Partners -->
			<div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
				<span class="text-xs font-bold text-slate-900 tracking-tight shrink-0">
					Delivery Partners:
				</span>
				<div class="flex flex-wrap items-center gap-2">
					<span class="h-7 px-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 text-xs font-black text-[#E83431] shadow-2xs">
						<span class="w-2 h-2 rounded-full bg-[#E83431]"></span>
						pathao
					</span>
					<span class="h-7 px-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 text-xs font-bold text-[#F1592A] shadow-2xs">
						Steadfast
					</span>
					<span class="h-7 px-2.5 rounded-lg bg-white border border-slate-200 flex items-center text-xs font-black text-[#D12026] shadow-2xs">
						REDX
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- 3. Bottom Gradient Bar -->
	<div class="bg-gradient-to-r from-[#4936d6] via-[#5845eb] to-[#7c3aed] text-white py-3.5 px-4 sm:px-6 lg:px-8">
		<div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium">
			<div>
				{footer.copyrightText}
			</div>
			<div class="text-[11px] text-indigo-100 flex items-center gap-1">
				<span>Designed for</span>
				<strong class="text-white font-bold">{footer.brandName} Storefront</strong>
			</div>
		</div>
	</div>
</footer>

