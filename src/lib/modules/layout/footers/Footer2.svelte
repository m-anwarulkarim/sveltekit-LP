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
		<div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-4 md:pb-0 text-xs text-slate-500">
			<div class="flex items-center gap-2">
				<ShieldCheck class="w-4 h-4 text-emerald-400" />
				<span>100% Secure Checkout with SSL Encryption</span>
			</div>

			<!-- Developed by Haq Plus IT with WhatsApp Link -->
			<div class="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap justify-center">
				<span>Developed by</span>
				<a
					href="https://wa.me/8801560007230?text=Hello%20Haq%20Plus%20IT%2C%20I%20want%20to%20build%20an%20e-commerce%20website."
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-200 font-bold hover:text-white transition-all hover:scale-105 active:scale-95 shadow-2xs"
					title="Chat with Haq Plus IT on WhatsApp"
				>
					<svg class="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
						<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
					</svg>
					<span>Haq Plus IT</span>
				</a>
			</div>

			<div>
				{footer.copyrightText}
			</div>
		</div>
		<!-- Spacer so fixed mobile bottom nav does not cover text -->
		<div class="h-20 md:hidden" aria-hidden="true"></div>
	</div>
</footer>

