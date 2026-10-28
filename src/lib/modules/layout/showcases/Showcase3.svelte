<script lang="ts">
	import { ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-svelte';

	interface Props {
		carousels?: any[];
	}

	let { carousels = [] }: Props = $props();
</script>

<!-- Showcase 3: Split Promotional Grid Banners -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-['Anek_Bangla',sans-serif]">
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
		<!-- Main Feature Card (Spans 2 cols on desktop) -->
		<div class="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between min-h-[300px] shadow-xl group">
			<div class="relative z-10 space-y-3 max-w-md">
				<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-blue-200 border border-white/20">
					<Sparkles class="w-3.5 h-3.5 text-amber-300" />
					এক্সক্লুসিভ অফার
				</span>
				<h2 class="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
					সেরা প্রিমিয়াম কালেকশন ২০২৬
				</h2>
				<p class="text-xs sm:text-sm text-slate-300 line-clamp-2">
					অরিজিনাল ব্র্যান্ডের বিশ্বস্ত গ্যাজেট ও বুকস কালেকশনে পাচ্ছেন আকর্ষণীয় ক্যাশব্যাক ও ফ্রি ডেলিভারি।
				</p>
			</div>

			<div class="relative z-10 pt-4 flex items-center gap-3">
				<a
					href="/catalog/all-category"
					class="px-5 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-blue-50 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
				>
					<span>এখনই কিনুন</span>
					<ArrowRight class="w-4 h-4 text-blue-600" />
				</a>
			</div>

			<!-- Background Glow & Graphic Elements -->
			<div class="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-blue-600/30 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
			<div class="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
		</div>

		<!-- Side Feature Card 1 -->
		<div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 to-pink-700 p-6 sm:p-8 text-white flex flex-col justify-between min-h-[220px] shadow-xl group">
			<div class="space-y-2">
				<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white">
					<Tag class="w-3 h-3" />
					ফ্ল্যাশ ডিল
				</span>
				<h3 class="text-xl font-black leading-snug">
					৫০% পর্যন্ত বিশেষ ছাড়
				</h3>
				<p class="text-xs text-rose-100">
					সীমিত সময়ের স্পেশাল ডিসকাউন্ট উপভোগ করুন।
				</p>
			</div>

			<div class="pt-4">
				<a
					href="/catalog/all-category"
					class="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:underline underline-offset-4"
				>
					<span>কালেকশন দেখুন</span>
					<ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>
			<div class="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
		</div>
	</div>
</section>

