<script lang="ts">
	import {
		Phone,
		Mail,
		MapPin,
		Sparkles,
		ShieldCheck,
		ArrowUpRight
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

<footer class="w-full bg-slate-950 font-['Anek_Bangla',sans-serif] text-slate-300 border-t border-slate-800 {className}">
	<!-- 1. Top Sleek Brand & Quick Navigation Strip -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
		<div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-10 border-b border-slate-800/80">
			<!-- Brand and Tagline -->
			<div class="space-y-2">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
						<Sparkles class="w-5 h-5" />
					</div>
					<div>
						<span class="text-xl font-black text-white tracking-wider font-['Outfit']">
							{footer.brandName}
						</span>
						<span class="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
							PRO STORE
						</span>
					</div>
				</div>
				<p class="text-xs text-slate-400 max-w-md leading-relaxed">
					{footer.aboutText}
				</p>
			</div>

			<!-- Direct Contact Badges -->
			<div class="flex flex-wrap items-center gap-3">
				<a
					href="tel:{footer.phoneHotline}"
					class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white flex items-center gap-2 transition-colors shadow-2xs"
				>
					<Phone class="w-3.5 h-3.5 text-purple-400" />
					<span>{footer.phoneHotline}</span>
				</a>
				<a
					href="mailto:{footer.supportEmail}"
					class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white flex items-center gap-2 transition-colors shadow-2xs"
				>
					<Mail class="w-3.5 h-3.5 text-purple-400" />
					<span>{footer.supportEmail}</span>
				</a>
			</div>
		</div>

		<!-- 2. Minimal Navigation Links Grid -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-b border-slate-800/80">
			<!-- Col 1: Categories -->
			<div class="space-y-3">
				<h4 class="text-xs font-black uppercase tracking-wider text-white">Categories</h4>
				<ul class="space-y-2 text-xs">
					{#each footer.categoryLinks as link}
						<li>
							<a href={link.href} class="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
								<span>{link.label}</span>
								<ArrowUpRight class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Col 2: Customer Help -->
			<div class="space-y-3">
				<h4 class="text-xs font-black uppercase tracking-wider text-white">Customer Help</h4>
				<ul class="space-y-2 text-xs">
					{#each footer.customerServiceLinks.slice(0, 5) as link}
						<li>
							<a href={link.href} class="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
								<span>{link.label}</span>
								<ArrowUpRight class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Col 3: Quick Navigation -->
			<div class="space-y-3">
				<h4 class="text-xs font-black uppercase tracking-wider text-white">Company & Store</h4>
				<ul class="space-y-2 text-xs">
					{#each footer.usefulLinks.slice(0, 5) as link}
						<li>
							<a href={link.href} class="text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
								<span>{link.label}</span>
								<ArrowUpRight class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Col 4: Follow & Social -->
			<div class="space-y-3">
				<h4 class="text-xs font-black uppercase tracking-wider text-white">Social Community</h4>
				<p class="text-xs text-slate-400 leading-relaxed">
					Join thousands of creators and shoppers on our verified channels.
				</p>
				<div class="flex items-center gap-2 pt-1">
					<a
						href={footer.facebookUrl}
						target="_blank"
						rel="noreferrer"
						aria-label="Facebook"
						class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-blue-600 transition-all flex items-center justify-center text-xs font-bold"
					>
						f
					</a>
					<a
						href={footer.twitterUrl}
						target="_blank"
						rel="noreferrer"
						aria-label="X / Twitter"
						class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center text-xs font-bold"
					>
						X
					</a>
					<a
						href={footer.youtubeUrl}
						target="_blank"
						rel="noreferrer"
						aria-label="YouTube"
						class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-red-600 transition-all flex items-center justify-center text-xs font-bold"
					>
						▶
					</a>
					<a
						href={footer.instagramUrl}
						target="_blank"
						rel="noreferrer"
						aria-label="Instagram"
						class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-pink-600 transition-all flex items-center justify-center text-xs font-bold"
					>
						📷
					</a>
				</div>
			</div>
		</div>

		<!-- 3. Bottom Bar: Dark Compact Strip with Payment Chips -->
		<div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-slate-500">
			<div class="flex items-center gap-2">
				<ShieldCheck class="w-4 h-4 text-emerald-400" />
				<span>100% Secure Checkout with SSL Encryption</span>
			</div>

			<div class="flex items-center flex-wrap gap-2 text-[11px]">
				<span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold">bKash</span>
				<span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold">Nagad</span>
				<span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold">VISA</span>
				<span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold">Mastercard</span>
			</div>

			<div>
				{footer.copyrightText}
			</div>
		</div>
	</div>
</footer>

