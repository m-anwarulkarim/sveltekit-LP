<script lang="ts">
	import { Star, Sparkles, Heart, ShoppingBag, ShieldCheck } from 'lucide-svelte';

	interface Props {
		isStandalonePreview?: boolean;
	}

	let { isStandalonePreview = false }: Props = $props();
</script>

<!-- Product Details 2: Boutique Immersive Visual Showcase -->
<div class="w-full bg-slate-900 text-white p-4 sm:p-8 font-['Anek_Bangla',sans-serif]">
	<div class="max-w-4xl mx-auto space-y-6">
		<div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between gap-4">
			<div>
				<h4 class="text-xs sm:text-sm font-bold text-white">বুটিখ ইমারসিভ প্রোডাক্ট এক্সপেরিয়েন্স</h4>
				<p class="text-[11px] text-slate-400">ডার্ক লাক্সারি ব্যাকগ্রাউন্ড, পূর্ণ স্ক্রিন ভিজ্যুয়াল গ্যালারি ও ফ্ল্যাশ অ্যাকশন বার</p>
			</div>
			<span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
				BOUTIQUE LUXURY
			</span>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-800/60 rounded-3xl p-6 border border-slate-700/70 backdrop-blur-md">
			<div class="md:col-span-7 aspect-4/3 rounded-2xl bg-slate-950/80 border border-slate-700 flex items-center justify-center text-slate-500 font-bold text-sm">
				সিনেমেটিক ওয়াইড প্রোডাক্ট ডিসপ্লে
			</div>

			<div class="md:col-span-5 flex flex-col justify-between space-y-4">
				<div class="space-y-2">
					<span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
						PREMIUM SELECTION
					</span>
					<h2 class="text-lg sm:text-xl font-black text-white">AURA Studio Pro ANC Headphone</h2>
					<span class="text-2xl font-black text-white font-mono block">৳৪,৫০০</span>
				</div>

				<div class="space-y-2">
					<button type="button" class="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-500/25">
						এক্সক্লুসিভ অর্ডার করুন
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

