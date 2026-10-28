<script lang="ts">
	import { Sparkles, Truck, ArrowRight, Heart } from 'lucide-svelte';

	interface Props {
		isStandalonePreview?: boolean;
	}

	let { isStandalonePreview = false }: Props = $props();
</script>

<!-- Order Success 2: Visual Celebration Card with Confetti & Tracking -->
<div class="w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white p-4 sm:p-8 font-['Anek_Bangla',sans-serif]">
	<div class="max-w-xl mx-auto rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-10 text-center space-y-6 shadow-2xl">
		<div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-pink-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-pink-500/30 animate-bounce">
			<Sparkles class="w-8 h-8" />
		</div>

		<div class="space-y-1.5">
			<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-purple-200 border border-white/20">
				ধন্যবাদ আপনাকে!
			</span>
			<h3 class="text-xl sm:text-2xl font-black">অর্ডারটি দ্রুত প্রসেস করা হচ্ছে</h3>
			<p class="text-xs text-slate-300 max-w-xs mx-auto">
				অর্ডারের সর্বশেষ আপডেট আপনার মোবাইলে SMS এর মাধ্যমে পাঠিয়ে দেওয়া হবে।
			</p>
		</div>

		<div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-around text-xs">
			<div>
				<span class="text-slate-400 block text-[10px]">অর্ডার আইডি</span>
				<span class="font-mono font-bold">#ORD-98241</span>
			</div>
			<div class="h-6 w-px bg-white/20"></div>
			<div>
				<span class="text-slate-400 block text-[10px]">সম্ভাব্য ডেলিভারি</span>
				<span class="font-bold text-emerald-400">২৪-৪৮ ঘণ্টা</span>
			</div>
		</div>

		<button type="button" class="w-full py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg">
			<Truck class="w-4 h-4 text-purple-600" />
			<span>লাইভ ডেলিভারি ট্র্যাকিং দেখুন</span>
		</button>
	</div>
</div>

