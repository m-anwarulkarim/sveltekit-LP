<script lang="ts">
	import { ChevronDown, HelpCircle } from 'lucide-svelte';

	interface FAQItem {
		q: string;
		a: string;
	}

	const faqs: FAQItem[] = [
		{
			q: 'How does the 30-Day Risk-Free In-Studio Trial work?',
			a: 'Order any AURA headphone or hardware product. Take 30 days to test it in your studio, home, or daily commute. If you are not completely stunned by the planar acoustics, simply print our prepaid return label for a 100% full refund.'
		},
		{
			q: 'Can I connect with both wireless and professional studio DACs?',
			a: 'Yes! AURA Spectrum X includes a 2.4GHz low-latency USB-C transmitter, Bluetooth 5.4 with LDAC/aptX Lossless, plus a dedicated 4.4mm balanced and 3.5mm oxygen-free copper cable for high-end DAC amplifiers.'
		},
		{
			q: 'What is the battery life with Neural ANC turned on?',
			a: 'Spectrum X delivers up to 55 hours of continuous playback with active noise neutralization enabled, and up to 80 hours with ANC off. A 10-minute fast charge over USB-C provides 6 hours of listening time.'
		},
		{
			q: 'How does Better Auth protect my customer account?',
			a: 'Your account is secured with modern Web Crypto cryptographic standards, HTTP-only cookie tokens, and strict session isolation backed by Cloudflare D1 edge database.'
		},
		{
			q: 'Do you ship internationally and what is the shipping time?',
			a: 'Yes, we provide Free Global Express Air Shipping to North America, Europe, Asia, and Australia. Most orders arrive within 2-4 business days with full door-to-door tracking.'
		}
	];

	let openIndex = $state<number | null>(0);

	function toggle(index: number) {
		openIndex = openIndex === index ? null : index;
	}
</script>

<section id="faq" class="py-24 relative">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		
		<div class="text-center mb-16">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-4">
				<HelpCircle class="w-3.5 h-3.5" />
				Common Inquiries
			</div>
			<h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
				Frequently Asked Questions
			</h2>
		</div>

		<div class="space-y-4">
			{#each faqs as faq, i}
				<div class="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all duration-300">
					<button
						onclick={() => toggle(i)}
						class="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
						aria-expanded={openIndex === i}
					>
						<span class="text-sm sm:text-base font-bold text-white font-heading">{faq.q}</span>
						<ChevronDown class="w-5 h-5 text-cyan-400 shrink-0 transition-transform duration-300 {openIndex === i ? 'rotate-180' : ''}" />
					</button>

					{#if openIndex === i}
						<div class="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4 animate-in fade-in">
							{faq.a}
						</div>
					{/if}
				</div>
			{/each}
		</div>

	</div>
</section>
