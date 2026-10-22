<script lang="ts">
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { Play, Pause, ShieldCheck, Truck, RefreshCw, Sliders, Sparkles, CheckCircle2 } from 'lucide-svelte';

	let selectedVariant = $state('obsidian');
	let isDemoPlaying = $state(false);
	let activeSoundMode = $state<'anc' | 'spatial' | 'planar'>('spatial');

	const variants = [
		{ id: 'obsidian', name: 'Obsidian Void', colorClass: 'bg-zinc-900 border-violet-500' },
		{ id: 'silver', name: 'Celestial Silver', colorClass: 'bg-slate-300 border-cyan-400' },
		{ id: 'sunset', name: 'Cyber Sunset', colorClass: 'bg-gradient-to-r from-amber-500 to-rose-500 border-amber-400' }
	];

	function toggleAudioDemo() {
		isDemoPlaying = !isDemoPlaying;
	}

	function handleHeroAddToCart() {
		cart.addItem({
			id: 'aura-spectrum-x',
			name: `AURA Spectrum X (${variants.find(v => v.id === selectedVariant)?.name})`,
			price: 34900,
			originalPrice: 42900,
			image: '/images/headphones.jpg',
			category: 'Spatial Audio'
		});
	}
</script>

<section class="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
	<!-- Ambient Background Glows -->
	<div class="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none -z-10"></div>
	<div class="absolute top-48 right-10 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none -z-10"></div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
			
			<!-- Left Column: Copy & Actions -->
			<div class="lg:col-span-7 flex flex-col gap-6 text-left">
				<!-- Top Badge -->
				<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 w-fit backdrop-blur-md">
					<span class="flex h-2 w-2 relative">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
					</span>
					<span class="text-xs font-semibold uppercase tracking-wider text-cyan-300">
						Next-Gen Spatial Transducers • 2026 Edition
					</span>
				</div>

				<!-- Main H1 SEO Heading -->
				<h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-heading">
					Hyper-Dimensional <br />
					<span class="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
						Spatial Acoustics
					</span>
				</h1>

				<p class="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
					Engineered with 50mm Planar Magnetic drivers, AI-driven Neural Noise Cancellation, and 96kHz/24-bit zero-loss wireless transmission. Hear sound with anatomical precision.
				</p>

				<!-- Color Variant Switcher -->
				<div class="flex items-center gap-4 py-1">
					<span class="text-xs font-semibold tracking-wider uppercase text-slate-400">Finish:</span>
					<div class="flex items-center gap-2">
						{#each variants as variant}
							<button
								onclick={() => selectedVariant = variant.id}
								class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 {selectedVariant === variant.id ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-sm shadow-cyan-500/20' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}"
							>
								<span class="w-3 h-3 rounded-full {variant.colorClass} border"></span>
								<span>{variant.name}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Pricing & Call to Actions -->
				<div class="flex flex-wrap items-center gap-4 pt-2">
					<button
						onclick={handleHeroAddToCart}
						id="hero-order-btn"
						class="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-base shadow-xl shadow-violet-600/30 hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
					>
						<span>Order Spectrum X — $349</span>
						<span class="text-xs line-through text-slate-300 font-normal">$429</span>
					</button>

					<a
						href="#specifications"
						class="flex items-center gap-2 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-medium text-sm transition-all hover:border-violet-400/40"
					>
						<Sliders class="w-4 h-4 text-violet-400" />
						<span>Explore Full Specs</span>
					</a>
				</div>

				<!-- Trust & Guarantees Bar -->
				<div class="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs text-slate-400">
					<div class="flex items-center gap-2">
						<Truck class="w-4 h-4 text-cyan-400 shrink-0" />
						<span>Free Express Shipping</span>
					</div>
					<div class="flex items-center gap-2">
						<RefreshCw class="w-4 h-4 text-violet-400 shrink-0" />
						<span>30-Day Risk-Free Trial</span>
					</div>
					<div class="flex items-center gap-2">
						<ShieldCheck class="w-4 h-4 text-emerald-400 shrink-0" />
						<span>2-Year Full Warranty</span>
					</div>
				</div>
			</div>

			<!-- Right Column: Interactive Product Showcase Card -->
			<div class="lg:col-span-5 relative">
				<div class="relative rounded-3xl p-6 glass-panel border border-white/10 shadow-2xl group overflow-hidden">
					
					<!-- Glow Backdrop -->
					<div class="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/30 rounded-full blur-3xl group-hover:bg-cyan-500/30 transition-colors duration-700"></div>

					<!-- Image Display -->
					<div class="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-white/5 to-transparent border border-white/10 flex items-center justify-center p-4">
						<img
							src="/images/headphones.jpg"
							alt="AURA Spectrum X Spatial Headphones in Obsidian Finish"
							class="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
						/>
						
						<!-- Spec Badges -->
						<div class="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-[#090a0f]/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5">
							<Sparkles class="w-3.5 h-3.5" />
							<span>50mm Planar Gold</span>
						</div>

						<div class="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-[#090a0f]/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
							<CheckCircle2 class="w-3.5 h-3.5" />
							<span>In Stock • Ships Today</span>
						</div>
					</div>

					<!-- Interactive Acoustic Engine Simulator Widget -->
					<div class="mt-5 p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<button
									onclick={toggleAudioDemo}
									id="hero-play-demo-btn"
									class="w-9 h-9 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition-transform active:scale-90 shadow-md shadow-cyan-500/30"
									aria-label={isDemoPlaying ? "Pause Audio Preview" : "Play Audio Preview"}
								>
									{#if isDemoPlaying}
										<Pause class="w-4 h-4 fill-black" />
									{:else}
										<Play class="w-4 h-4 fill-black ml-0.5" />
									{/if}
								</button>
								<div>
									<div class="text-xs font-semibold text-white">Spatial Acoustic Simulator</div>
									<div class="text-[10px] text-slate-400">
										{isDemoPlaying ? 'Transmitting 96kHz Lossless...' : 'Tap to test sound stage'}
									</div>
								</div>
							</div>

							<!-- Sound Waves Animation -->
							<div class="flex items-end gap-1 h-5">
								{#each [0.4, 0.9, 0.6, 1.0, 0.7, 0.3, 0.8] as height}
									<span
										class="w-1 bg-gradient-to-t from-violet-500 to-cyan-400 rounded-full transition-all duration-300"
										style="height: {isDemoPlaying ? Math.round(height * 20) : 4}px;"
									></span>
								{/each}
							</div>
						</div>

						<!-- Sound Mode Selectors -->
						<div class="grid grid-cols-3 gap-2 pt-1">
							<button
								onclick={() => activeSoundMode = 'spatial'}
								class="py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all {activeSoundMode === 'spatial' ? 'bg-violet-600/40 text-violet-200 border border-violet-400/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
							>
								360° Spatial
							</button>
							<button
								onclick={() => activeSoundMode = 'anc'}
								class="py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all {activeSoundMode === 'anc' ? 'bg-cyan-600/40 text-cyan-200 border border-cyan-400/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
							>
								AI ANC -48dB
							</button>
							<button
								onclick={() => activeSoundMode = 'planar'}
								class="py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all {activeSoundMode === 'planar' ? 'bg-amber-600/40 text-amber-200 border border-amber-400/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
							>
								Pure Studio
							</button>
						</div>
					</div>

				</div>
			</div>

		</div>
	</div>
</section>
