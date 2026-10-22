<script lang="ts">
	import { Sparkles, Mail, CheckCircle, ShieldCheck } from 'lucide-svelte';

	let newsletterEmail = $state('');
	let isSubscribed = $state(false);

	function handleSubscribe(e: Event) {
		e.preventDefault();
		if (!newsletterEmail) return;
		isSubscribed = true;
	}
</script>

<footer class="pt-20 pb-12 border-t border-white/10 bg-[#07080d] relative overflow-hidden text-xs text-slate-400">
	<div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		
		<!-- Newsletter Box -->
		<div class="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 mb-16 relative overflow-hidden shadow-2xl">
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
				<div class="lg:col-span-7">
					<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-3">
						<Sparkles class="w-3.5 h-3.5" />
						AURA VIP Acoustic Club
					</div>
					<h3 class="text-2xl sm:text-3xl font-extrabold text-white font-heading mb-2">
						Unlock 10% Off Your First Acoustic Order
					</h3>
					<p class="text-slate-300 text-xs sm:text-sm max-w-xl">
						Receive secret firmware updates, spatial impulse response downloads, and priority access to limited hardware drops.
					</p>
				</div>

				<div class="lg:col-span-5">
					{#if isSubscribed}
						<div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
							<CheckCircle class="w-5 h-5 shrink-0" />
							<div>
								<div class="font-bold text-white text-xs">VIP Welcome Activated!</div>
								<div class="text-[11px] text-emerald-300">Use promo code <strong class="text-white font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded">AURA20</strong> at checkout for your discount.</div>
							</div>
						</div>
					{:else}
						<form onsubmit={handleSubscribe} class="flex gap-2">
							<div class="relative flex-1">
								<Mail class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
								<input
									type="email"
									required
									bind:value={newsletterEmail}
									placeholder="Enter your creator email..."
									class="w-full pl-10 pr-3.5 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
								/>
							</div>
							<button
								type="submit"
								class="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs shrink-0 shadow-lg transition-transform hover:scale-105"
							>
								Join VIP
							</button>
						</form>
					{/if}
				</div>
			</div>
		</div>

		<!-- Links Grid -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
			<div>
				<div class="flex items-center gap-2 mb-4">
					<div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center p-[1px]">
						<div class="w-full h-full bg-[#090a0f] rounded-[7px] flex items-center justify-center">
							<Sparkles class="w-3.5 h-3.5 text-cyan-400" />
						</div>
					</div>
					<span class="text-base font-extrabold text-white tracking-wider font-heading">AURA</span>
				</div>
				<p class="text-xs text-slate-400 leading-relaxed mb-4">
					Next-generation spatial transducers, neural noise cancellation, and tactile creator audio hardware.
				</p>
				<div class="flex items-center gap-2 text-[11px] text-emerald-400">
					<ShieldCheck class="w-3.5 h-3.5" />
					<span>Cloudflare Edge & D1 Protected</span>
				</div>
			</div>

			<div>
				<div class="text-xs font-bold text-white uppercase tracking-wider mb-4 font-heading">Hardware</div>
				<ul class="space-y-2.5 text-slate-400">
					<li><a href="#products" class="hover:text-cyan-400 transition-colors">AURA Spectrum X</a></li>
					<li><a href="#products" class="hover:text-cyan-400 transition-colors">ZENITH Pulse ANC</a></li>
					<li><a href="#products" class="hover:text-cyan-400 transition-colors">NEO-TONE Master Deck</a></li>
					<li><a href="#specifications" class="hover:text-cyan-400 transition-colors">Full Technical Specs</a></li>
				</ul>
			</div>

			<div>
				<div class="text-xs font-bold text-white uppercase tracking-wider mb-4 font-heading">Software & DSP</div>
				<ul class="space-y-2.5 text-slate-400">
					<li><a href="#products" class="hover:text-cyan-400 transition-colors">Atmos Suite VST3</a></li>
					<li><a href="#sound-engine" class="hover:text-cyan-400 transition-colors">Spatial Sound Engine</a></li>
					<li><a href="#sound-engine" class="hover:text-cyan-400 transition-colors">Studio Equalizer Presets</a></li>
					<li><a href="/account" class="hover:text-cyan-400 transition-colors">Creator Portal</a></li>
				</ul>
			</div>

			<div>
				<div class="text-xs font-bold text-white uppercase tracking-wider mb-4 font-heading">Customer Care</div>
				<ul class="space-y-2.5 text-slate-400">
					<li><a href="#faq" class="hover:text-cyan-400 transition-colors">30-Day Risk-Free Trial</a></li>
					<li><a href="#faq" class="hover:text-cyan-400 transition-colors">2-Year Replacement Warranty</a></li>
					<li><a href="#faq" class="hover:text-cyan-400 transition-colors">Global Express Tracking</a></li>
					<li><a href="#faq" class="hover:text-cyan-400 transition-colors">Acoustic Support Desk</a></li>
				</ul>
			</div>
		</div>

		<!-- Bottom Bar -->
		<div class="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
			<div>
				© 2026 AURA Acoustics Inc. Powered by SvelteKit, Tailwind CSS v4, Drizzle ORM, and Cloudflare D1.
			</div>
			<div class="flex items-center gap-6">
				<a href="#faq" class="hover:text-white transition-colors">Privacy Policy</a>
				<a href="#faq" class="hover:text-white transition-colors">Terms of Sale</a>
				<a href="#faq" class="hover:text-white transition-colors">Security</a>
			</div>
		</div>

	</div>
</footer>
