<script lang="ts">
	import { Badge } from '#lib/components/ui';
	import { Check, Sparkles } from 'lucide-svelte';

	const specs = [
		{ name: 'Transducer Architecture', aura: '50mm Gold Planar Magnetic', competitor: '40mm Dynamic Cellulose' },
		{ name: 'Frequency Range', aura: '5 Hz – 48,000 Hz', competitor: '20 Hz – 20,000 Hz' },
		{ name: 'Total Harmonic Distortion', aura: '< 0.02% (Ultra-Clean)', competitor: '< 0.5% (Noticeable compression)' },
		{ name: 'Active Noise Neutralization', aura: 'Neural DSP -48dB Adaptive', competitor: 'Standard Feedback -32dB' },
		{ name: 'Wireless Codec & Latency', aura: '96kHz/24-bit Lossless (12ms)', competitor: 'Standard AAC / SBC (180ms)' },
		{ name: 'Battery Endurance', aura: '55 Hours (ANC Active)', competitor: '30 Hours' },
		{ name: 'Ear Cushion Material', aura: 'Magnetic Memory Gel & Alcantara', competitor: 'Bonded PU Leather' },
		{ name: 'Wired Connectivity', aura: 'Balanced 4.4mm + 3.5mm + USB-C', competitor: '3.5mm Single-Ended Only' }
	];
</script>

<section id="specifications" class="py-24 relative bg-[#090a10]">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		
		<div class="text-center max-w-3xl mx-auto mb-16">
			<Badge variant="outline" class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
				<Sparkles class="w-3.5 h-3.5" />
				Unfiltered Telemetry
			</Badge>
			<h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading mb-4">
				Engineered Without <br />
				<span class="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
					Acoustic Compromise
				</span>
			</h2>
			<p class="text-slate-400 text-sm sm:text-base">
				See how AURA Spectrum X compares to standard mainstream commercial headphones.
			</p>
		</div>

		<!-- Comparison Table -->
		<div class="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs sm:text-sm">
					<thead>
						<tr class="border-b border-white/10 bg-white/5">
							<th class="p-5 sm:p-6 text-slate-300 font-bold uppercase tracking-wider text-xs">Technical Parameter</th>
							<th class="p-5 sm:p-6 bg-violet-600/20 text-cyan-300 font-extrabold text-sm sm:text-base font-heading">
								AURA Spectrum X
							</th>
							<th class="p-5 sm:p-6 text-slate-400 font-medium text-xs">Typical $400 Competitor</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						{#each specs as spec}
							<tr class="hover:bg-white/5 transition-colors">
								<td class="p-5 sm:p-6 font-medium text-slate-300">{spec.name}</td>
								<td class="p-5 sm:p-6 bg-violet-600/10 font-bold text-white flex items-center gap-2">
									<Check class="w-4 h-4 text-cyan-400 shrink-0" />
									<span>{spec.aura}</span>
								</td>
								<td class="p-5 sm:p-6 text-slate-400">{spec.competitor}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

	</div>
</section>