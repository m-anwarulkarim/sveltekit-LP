<script lang="ts">
	import { Button, Badge, Separator } from '#lib/components/ui';
	import {
		Phone,
		Mail,
		MapPin,
		ChevronRight,
		Clock,
		Flame,
		Sparkles
	} from 'lucide-svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<footer class="w-full bg-white font-['Anek_Bangla',sans-serif] border-t border-slate-200/90 text-slate-700 {className}">
	
	<!-- 1. Main Footer 4-Column Grid (Exact match to screenshot) -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
			
			<!-- Column 1: Brand Info & Contact Details (lg:col-span-4) -->
			<div class="lg:col-span-4 space-y-4">
				<!-- Brand Header -->
				<a href="/" class="flex items-center gap-3 group">
					<div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#5845eb] via-[#7c3aed] to-[#9333ea] p-[1.5px] shadow-sm shadow-indigo-600/20 group-hover:scale-105 transition-transform shrink-0">
						<div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
							<Flame class="w-6 h-6 text-[#5845eb]" />
						</div>
					</div>
					<div class="flex flex-col">
						<div class="flex items-center gap-1.5 leading-tight">
							<span class="font-black text-xl text-slate-900 font-['Outfit'] tracking-tight">
								AURA
							</span>
							<Badge variant="purple" class="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-[#5845eb] border border-indigo-200">
								ORIGINAL
							</Badge>
						</div>
						<span class="text-[11px] text-slate-500 font-medium -mt-0.5">
							Premium Online Store & E-Commerce
						</span>
					</div>
				</a>

				<!-- Description -->
				<p class="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-sm">
					AURA is a next-generation e-commerce platform offering premium lifestyle, audio, home essentials, and innovative products delivered safely to your door.
				</p>

				<!-- Contact Details -->
				<div class="space-y-3 pt-2 text-xs sm:text-[13px] text-slate-700 font-medium">
					<!-- Phone -->
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0 border border-indigo-100">
							<Phone class="w-4 h-4" />
						</div>
						<div class="flex flex-col">
							<a href="tel:01602867954" class="font-bold text-slate-900 hover:text-[#5845eb] transition-colors">
								01602867954
							</a>
							<span class="text-[11px] text-slate-500 flex items-center gap-1">
								<Clock class="w-3 h-3 text-slate-400" />
								9:00 AM – 11:00 PM (প্রতিদিন)
							</span>
						</div>
					</div>

					<!-- Email -->
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0 border border-indigo-100">
							<Mail class="w-4 h-4" />
						</div>
						<a href="mailto:support@seedshop.com.bd" class="hover:text-[#5845eb] transition-colors">
							support@seedshop.com.bd
						</a>
					</div>

					<!-- Address -->
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0 border border-indigo-100">
							<MapPin class="w-4 h-4" />
						</div>
						<span class="leading-snug text-slate-600">
							হাউজ-২৩, রোড-১২, ধানমন্ডি, ঢাকা-১২০৯, বাংলাদেশ
						</span>
					</div>
				</div>
			</div>

			<!-- Column 2: Customer Service (lg:col-span-3) -->
			<div class="lg:col-span-3 space-y-4">
				<div>
					<h3 class="text-base font-extrabold text-slate-900 tracking-tight">
						Customer Service
					</h3>
					<div class="w-10 h-0.5 bg-[#5845eb] rounded-full mt-1.5"></div>
				</div>

				<ul class="space-y-2.5 text-xs sm:text-sm font-medium">
					<li>
						<a href="/contact" class="flex items-center gap-2 text-slate-600 hover:text-[#5845eb] transition-colors group">
							<ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] group-hover:translate-x-0.5 transition-all" />
							<span>Contact Us</span>
						</a>
					</li>
					<li>
						<a href="/track-order" class="flex items-center gap-2 text-slate-600 hover:text-[#5845eb] transition-colors group">
							<ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] group-hover:translate-x-0.5 transition-all" />
							<span>Track Order</span>
						</a>
					</li>
					<li>
						<a href="/return-policy" class="flex items-center gap-2 text-slate-600 hover:text-[#5845eb] transition-colors group">
							<ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] group-hover:translate-x-0.5 transition-all" />
							<span>Return & Exchange</span>
						</a>
					</li>
					<li>
						<a href="/shipping" class="flex items-center gap-2 text-slate-600 hover:text-[#5845eb] transition-colors group">
							<ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] group-hover:translate-x-0.5 transition-all" />
							<span>Shipping Information</span>
						</a>
					</li>
					<li>
						<a href="/terms" class="flex items-center gap-2 text-slate-600 hover:text-[#5845eb] transition-colors group">
							<ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] group-hover:translate-x-0.5 transition-all" />
							<span>Terms & Conditions</span>
						</a>
					</li>
					<li>
						<a href="/privacy" class="flex items-center gap-2 text-slate-600 hover:text-[#5845eb] transition-colors group">
							<ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] group-hover:translate-x-0.5 transition-all" />
							<span>Privacy Policy</span>
						</a>
					</li>
				</ul>
			</div>

			<!-- Column 3: Useful Links (lg:col-span-2) -->
			<div class="lg:col-span-2 space-y-4">
				<div>
					<h3 class="text-base font-extrabold text-slate-900 tracking-tight">
						Useful Links
					</h3>
					<div class="w-10 h-0.5 bg-[#5845eb] rounded-full mt-1.5"></div>
				</div>

				<ul class="space-y-2.5 text-xs sm:text-sm font-medium">
					<li>
						<a href="#products" class="flex items-center gap-2 text-slate-600 hover:text-[#5845eb] transition-colors group">
							<ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] group-hover:translate-x-0.5 transition-all" />
							<span>All Products</span>
						</a>
					</li>
					<li>
						<a href="/combos" class="flex items-center gap-2 text-slate-600 hover:text-[#5845eb] transition-colors group">
							<ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] group-hover:translate-x-0.5 transition-all" />
							<span>Combos Products</span>
						</a>
					</li>
					<li>
						<a href="/account" class="flex items-center gap-2 text-slate-600 hover:text-[#5845eb] transition-colors group">
							<ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] group-hover:translate-x-0.5 transition-all" />
							<span>My Account</span>
						</a>
					</li>
					<li>
						<a href="/about" class="flex items-center gap-2 text-slate-600 hover:text-[#5845eb] transition-colors group">
							<ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] group-hover:translate-x-0.5 transition-all" />
							<span>About Us</span>
						</a>
					</li>
					<li>
						<a href="/blogs" class="flex items-center gap-2 text-slate-600 hover:text-[#5845eb] transition-colors group">
							<ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] group-hover:translate-x-0.5 transition-all" />
							<span>Blogs</span>
						</a>
					</li>
					<li>
						<a href="/faq" class="flex items-center gap-2 text-slate-600 hover:text-[#5845eb] transition-colors group">
							<ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5845eb] group-hover:translate-x-0.5 transition-all" />
							<span>FAQs</span>
						</a>
					</li>
				</ul>
			</div>

			<!-- Column 4: Follow Us & Download App (lg:col-span-3) -->
			<div class="lg:col-span-3 space-y-5">
				<div>
					<h3 class="text-base font-extrabold text-slate-900 tracking-tight">
						Follow Us
					</h3>
					<p class="text-xs text-slate-500 font-medium mt-0.5">Stay connected with us</p>

					<!-- Social Icons with shadcn Button -->
					<div class="flex items-center gap-2.5 mt-3">
						<!-- Facebook -->
						<Button
							variant="ghost"
							size="icon"
							href="https://facebook.com"
							target="_blank"
							rel="noreferrer"
							class="w-9 h-9 rounded-full bg-[#1877F2] text-white hover:bg-[#1877F2]/90 hover:text-white shadow-xs hover:scale-110 transition-transform p-0"
							aria-label="Facebook"
						>
							<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
								<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
							</svg>
						</Button>

						<!-- X / Twitter -->
						<Button
							variant="ghost"
							size="icon"
							href="https://x.com"
							target="_blank"
							rel="noreferrer"
							class="w-9 h-9 rounded-full bg-slate-900 text-white hover:bg-slate-800 hover:text-white shadow-xs hover:scale-110 transition-transform p-0"
							aria-label="X"
						>
							<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
							</svg>
						</Button>

						<!-- YouTube -->
						<Button
							variant="ghost"
							size="icon"
							href="https://youtube.com"
							target="_blank"
							rel="noreferrer"
							class="w-9 h-9 rounded-full bg-[#FF0000] text-white hover:bg-[#FF0000]/90 hover:text-white shadow-xs hover:scale-110 transition-transform p-0"
							aria-label="YouTube"
						>
							<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
								<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
							</svg>
						</Button>

						<!-- Instagram -->
						<Button
							variant="ghost"
							size="icon"
							href="https://instagram.com"
							target="_blank"
							rel="noreferrer"
							class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:opacity-90 hover:text-white shadow-xs hover:scale-110 transition-transform p-0"
							aria-label="Instagram"
						>
							<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
								<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
							</svg>
						</Button>
					</div>
				</div>
			</div>

		</div>
	</div>

	<!-- 2. Middle Strip: We Accept & Our Delivery Partners (Exact match to screenshot) -->
	<div class="bg-slate-50/90 border-t border-b border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8">
		<div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
			
			<!-- Left: We Accept -->
			<div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
				<span class="text-xs font-bold text-slate-900 tracking-tight shrink-0">
					We Accept
				</span>
				
				<div class="flex flex-wrap items-center gap-2">
					<!-- bKash -->
					<Badge variant="outline" class="h-8 px-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs font-normal">
						<span class="text-xs font-black text-[#E2136E]">bKash</span>
					</Badge>

					<!-- Nagad -->
					<Badge variant="outline" class="h-8 px-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs font-normal">
						<span class="text-xs font-black text-[#F7941D]">নগদ</span>
					</Badge>

					<!-- Rocket -->
					<Badge variant="outline" class="h-8 px-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs font-normal">
						<span class="text-xs font-black text-[#8C3494]">রকেট</span>
					</Badge>

					<!-- VISA -->
					<Badge variant="outline" class="h-8 px-3 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs font-normal">
						<span class="text-xs font-black italic tracking-wider text-[#1A1F71]">VISA</span>
					</Badge>

					<!-- Mastercard -->
					<Badge variant="outline" class="h-8 px-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs font-normal">
						<div class="flex items-center -space-x-1.5">
							<span class="w-3.5 h-3.5 rounded-full bg-[#EB001B] inline-block"></span>
							<span class="w-3.5 h-3.5 rounded-full bg-[#F79E1B]/90 inline-block"></span>
						</div>
					</Badge>

					<!-- AMEX -->
					<Badge variant="outline" class="h-8 px-2.5 rounded-lg bg-[#006FCF] border-[#006FCF] text-white flex items-center justify-center shadow-2xs font-normal">
						<span class="text-[10px] font-black tracking-widest uppercase">AMEX</span>
					</Badge>
				</div>
			</div>

			<!-- Right: Our Delivery Partners -->
			<div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
				<span class="text-xs font-bold text-slate-900 tracking-tight shrink-0">
					Our Delivery Partners
				</span>

				<div class="flex flex-wrap items-center gap-2">
					<!-- Pathao -->
					<Badge variant="outline" class="h-8 px-3 rounded-lg bg-white border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs font-normal">
						<span class="w-2.5 h-2.5 rounded-full bg-[#E83431]"></span>
						<span class="text-xs font-black text-[#E83431] font-mono tracking-tight">pathao</span>
					</Badge>

					<!-- Steadfast -->
					<Badge variant="outline" class="h-8 px-3 rounded-lg bg-white border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs font-normal">
						<span class="text-xs font-bold text-[#F1592A] font-['Outfit']">Steadfast</span>
					</Badge>

					<!-- REDX -->
					<Badge variant="outline" class="h-8 px-3 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs font-normal">
						<span class="text-xs font-black tracking-wider text-[#D12026] font-mono">REDX</span>
					</Badge>

					<!-- iEX / Courier -->
					<Badge variant="outline" class="h-8 px-3 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs font-normal">
						<span class="text-xs font-black tracking-wider text-[#1F2937] font-mono">iEX</span>
					</Badge>
				</div>
			</div>

		</div>
	</div>

	<!-- 3. Bottom Bar: Brand Theme Indigo/Purple Gradient (Matches user request for color match) -->
	<div class="bg-gradient-to-r from-[#4936d6] via-[#5845eb] to-[#7c3aed] text-white py-3.5 px-4 sm:px-6 lg:px-8">
		<div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium">
			<div>
				© 2026 AURA Inc. All rights reserved.
			</div>
			<div class="text-[11px] text-indigo-100 flex items-center gap-1">
				<span>Design by</span>
				<strong class="text-white font-bold">Borbila</strong>
			</div>
		</div>
	</div>

</footer>