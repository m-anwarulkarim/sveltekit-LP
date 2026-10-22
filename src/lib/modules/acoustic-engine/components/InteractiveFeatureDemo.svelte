<script lang="ts">
	import { Cpu, Radio, Waves, Compass, Activity, Sliders } from 'lucide-svelte';

	let activeTechTab = $state<'planar' | 'anc' | 'spatial' | 'latency'>('planar');

	// Interactive EQ State
	let bass = $state(6);
	let mid = $state(2);
	let treble = $state(8);
	let spatial = $state(10);

	const techFeatures = {
		planar: {
			title: '50mm Gold-Sputtered Planar Drivers',
			badge: 'Acoustic Precision',
			description: 'Unlike traditional cone drivers that suffer from modal breakup and distortion at high volumes, our planar magnetic diaphragm moves uniformly across its entire surface. Experience pristine transient response and ultra-deep sub-bass down to 5Hz.',
			specs: [
				{ label: 'Frequency Response', val: '5Hz - 48,000Hz' },
				{ label: 'Total Harmonic Distortion', val: '< 0.02% @ 1kHz' },
				{ label: 'Diaphragm Thickness', val: '2.5 Microns' }
			]
		},
		anc: {
			title: 'Neural Matrix ANC 2.0 (-48dB)',
			badge: 'Active Silence',
			description: 'Powered by a dedicated dual-core neural DSP processor sampling outside noise 192,000 times per second. It neutralizes engine rumbles, keyboard clatter, and crowded office background chatter without altering the tonal balance of your music.',
			specs: [
				{ label: 'Attenuation Depth', val: '-48dB Max' },
				{ label: 'DSP Microphones', val: '8 Studio-Calibrated' },
				{ label: 'Latency to Inversion', val: '0.008 milliseconds' }
			]
		},
		spatial: {
			title: '360° Dynamic Binaural Head Tracking',
			badge: 'True Immersive Dimension',
			description: 'A 6-axis IMU sensor tracks minute head movements at 1000Hz, recalibrating the acoustic soundstage so that sounds remain precisely anchored in virtual space around you—just like sitting in front of multi-million dollar studio reference monitors.',
			specs: [
				{ label: 'Tracking Rate', val: '1,000Hz Ultra-Sync' },
				{ label: 'Spatial Channels', val: 'Up to 9.1.4 Atmos' },
				{ label: 'HRTF Modeling', val: 'Custom Ear Profile' }
			]
		},
		latency: {
			title: 'AURA-Link™ Lossless 2.4GHz Wireless',
			badge: 'Zero Compression, Zero Lag',
			description: 'Custom RF hardware delivers uncompressed 96kHz / 24-bit Hi-Res audio with sub-12ms latency via our magnetic USB-C transmitter. Seamlessly switch between PC, Mac, iPad, PlayStation, and mobile without bluetooth audio compression.',
			specs: [
				{ label: 'Transmission Latency', val: '12ms True Realtime' },
				{ label: 'Audio Quality', val: '96kHz / 24-Bit Lossless' },
				{ label: 'Wireless Range', val: '25 Meters (82ft)' }
			]
		}
	};
</script>

<section id="sound-engine" class="py-24 relative overflow-hidden bg-[#0c0e17]/60 border-y border-white/5">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		
		<!-- Section Header -->
		<div class="text-center max-w-3xl mx-auto mb-16">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-4">
				<Activity class="w-3.5 h-3.5" />
				Deep Engineering
			</div>
			<h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-heading mb-4">
				The Science of <br />
				<span class="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
					Pure Acoustic Fidelity
				</span>
			</h2>
			<p class="text-slate-400 text-sm sm:text-base leading-relaxed">
				Every micro-component inside AURA hardware is precision-milled from aerospace alloys and tuned by Grammy-winning mastering engineers.
			</p>
		</div>

		<!-- Interactive Feature Tabs & Spec Engine -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
			
			<!-- Left Nav Tabs -->
			<div class="lg:col-span-5 flex flex-col gap-3">
				<button
					onclick={() => activeTechTab = 'planar'}
					class="p-5 rounded-2xl text-left border transition-all duration-300 flex items-start gap-4 {activeTechTab === 'planar' ? 'bg-violet-600/15 border-violet-500/50 shadow-lg shadow-violet-600/10' : 'bg-white/5 border-white/10 hover:border-white/20'}"
				>
					<div class="p-3 rounded-xl bg-violet-500/20 text-violet-400 mt-0.5">
						<Waves class="w-5 h-5" />
					</div>
					<div>
						<div class="text-sm font-bold text-white font-heading">Planar Magnetic Transducers</div>
						<div class="text-xs text-slate-400 mt-1">Uniform 50mm gold-sputtered diaphragm with 5Hz-48kHz extension.</div>
					</div>
				</button>

				<button
					onclick={() => activeTechTab = 'anc'}
					class="p-5 rounded-2xl text-left border transition-all duration-300 flex items-start gap-4 {activeTechTab === 'anc' ? 'bg-cyan-600/15 border-cyan-500/50 shadow-lg shadow-cyan-600/10' : 'bg-white/5 border-white/10 hover:border-white/20'}"
				>
					<div class="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5">
						<Cpu class="w-5 h-5" />
					</div>
					<div>
						<div class="text-sm font-bold text-white font-heading">Neural ANC 2.0 (-48dB)</div>
						<div class="text-xs text-slate-400 mt-1">Dual-core neural DSP eliminating environmental distraction in real-time.</div>
					</div>
				</button>

				<button
					onclick={() => activeTechTab = 'spatial'}
					class="p-5 rounded-2xl text-left border transition-all duration-300 flex items-start gap-4 {activeTechTab === 'spatial' ? 'bg-indigo-600/15 border-indigo-500/50 shadow-lg shadow-indigo-600/10' : 'bg-white/5 border-white/10 hover:border-white/20'}"
				>
					<div class="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 mt-0.5">
						<Compass class="w-5 h-5" />
					</div>
					<div>
						<div class="text-sm font-bold text-white font-heading">360° Binaural Head Tracking</div>
						<div class="text-xs text-slate-400 mt-1">1000Hz IMU spatial audio recreating studio reference monitors.</div>
					</div>
				</button>

				<button
					onclick={() => activeTechTab = 'latency'}
					class="p-5 rounded-2xl text-left border transition-all duration-300 flex items-start gap-4 {activeTechTab === 'latency' ? 'bg-amber-600/15 border-amber-500/50 shadow-lg shadow-amber-600/10' : 'bg-white/5 border-white/10 hover:border-white/20'}"
				>
					<div class="p-3 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
						<Radio class="w-5 h-5" />
					</div>
					<div>
						<div class="text-sm font-bold text-white font-heading">AURA-Link™ 12ms Wireless</div>
						<div class="text-xs text-slate-400 mt-1">Uncompressed 96kHz/24-bit RF dongle for zero-latency playback.</div>
					</div>
				</button>
			</div>

			<!-- Right Details Panel -->
			<div class="lg:col-span-7 glass-panel rounded-3xl p-8 border border-white/10 relative overflow-hidden shadow-2xl">
				<div class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 text-cyan-300 mb-4">
					{techFeatures[activeTechTab].badge}
				</div>

				<h3 class="text-2xl sm:text-3xl font-extrabold text-white font-heading mb-4">
					{techFeatures[activeTechTab].title}
				</h3>

				<p class="text-slate-300 text-sm leading-relaxed mb-8">
					{techFeatures[activeTechTab].description}
				</p>

				<!-- Telemetry Specs Grid -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
					{#each techFeatures[activeTechTab].specs as spec}
						<div class="p-4 rounded-xl bg-black/40 border border-white/5">
							<div class="text-[11px] uppercase tracking-wider text-slate-400 mb-1">{spec.label}</div>
							<div class="text-lg font-bold text-white font-heading text-cyan-400">{spec.val}</div>
						</div>
					{/each}
				</div>
			</div>

		</div>

		<!-- Interactive DSP Tuning Lab Box -->
		<div class="glass-card rounded-3xl p-8 border border-white/10">
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div class="flex items-center gap-3">
					<div class="p-2.5 rounded-xl bg-violet-600/20 text-violet-400">
						<Sliders class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-lg font-bold text-white font-heading">Interactive Studio DSP Tuner</h3>
						<p class="text-xs text-slate-400">Experiment with AURA's onboard parametric equalization curves in real-time.</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<button
						onclick={() => { bass = 0; mid = 0; treble = 0; spatial = 0; }}
						class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors"
					>
						Flat Studio
					</button>
					<button
						onclick={() => { bass = 8; mid = 3; treble = 7; spatial = 10; }}
						class="px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-xs text-violet-300 transition-colors"
					>
						AURA Signature
					</button>
				</div>
			</div>

			<!-- Dynamic Sliders -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<div class="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
					<div class="flex items-center justify-between text-xs">
						<span class="font-medium text-slate-300">Sub-Bass (20-80Hz)</span>
						<span class="font-bold text-cyan-400">+{bass}dB</span>
					</div>
					<input
						type="range"
						min="-6"
						max="12"
						bind:value={bass}
						class="w-full accent-cyan-400 cursor-pointer"
					/>
				</div>

				<div class="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
					<div class="flex items-center justify-between text-xs">
						<span class="font-medium text-slate-300">Vocal Presence (1-4kHz)</span>
						<span class="font-bold text-indigo-400">+{mid}dB</span>
					</div>
					<input
						type="range"
						min="-6"
						max="12"
						bind:value={mid}
						class="w-full accent-indigo-400 cursor-pointer"
					/>
				</div>

				<div class="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
					<div class="flex items-center justify-between text-xs">
						<span class="font-medium text-slate-300">Air & Sparkle (10-20kHz)</span>
						<span class="font-bold text-violet-400">+{treble}dB</span>
					</div>
					<input
						type="range"
						min="-6"
						max="12"
						bind:value={treble}
						class="w-full accent-violet-400 cursor-pointer"
					/>
				</div>

				<div class="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
					<div class="flex items-center justify-between text-xs">
						<span class="font-medium text-slate-300">Spatial Expansion Stage</span>
						<span class="font-bold text-amber-400">{spatial * 10}%</span>
					</div>
					<input
						type="range"
						min="0"
						max="10"
						bind:value={spatial}
						class="w-full accent-amber-400 cursor-pointer"
					/>
				</div>
			</div>
		</div>

	</div>
</section>
