<script lang="ts">
	import { Star, ShieldCheck, Truck, RotateCcw, ShoppingBag, Zap } from 'lucide-svelte';

	interface Props {
		isStandalonePreview?: boolean;
	}

	let { isStandalonePreview = false }: Props = $props();
</script>

<!-- Product Details 1: Classic Split Gallery + Sticky Buy Box (Default) -->
<div class="w-full bg-slate-50/70 p-4 sm:p-8 font-['Anek_Bangla',sans-serif]">
	<div class="max-w-4xl mx-auto space-y-6">
		<div class="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
			<div>
				<h4 class="text-xs sm:text-sm font-bold text-slate-900">ক্লাসিক স্প্লিট প্রোডাক্ট ডিটেইলস লেআউট</h4>
				<p class="text-[11px] text-slate-500">বামে প্রোডাক্ট ইমেজ গ্যালারি এবং ডানে স্টিকি বাই-বক্স ও অ্যাকশন</p>
			</div>
			<span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
				DEFAULT
			</span>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
			<!-- Left: Gallery (6 cols) -->
			<div class="md:col-span-6 space-y-3">
				<div class="aspect-square rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 font-bold text-sm">
					প্রধান প্রোডাক্ট ইমেজ গ্যালারি
				</div>
				<div class="grid grid-cols-4 gap-2">
					<div class="aspect-square rounded-xl border-2 border-blue-600 bg-slate-50"></div>
					<div class="aspect-square rounded-xl border border-slate-200 bg-slate-50"></div>
					<div class="aspect-square rounded-xl border border-slate-200 bg-slate-50"></div>
					<div class="aspect-square rounded-xl border border-slate-200 bg-slate-50"></div>
				</div>
			</div>

			<!-- Right: Buy Box (6 cols) -->
			<div class="md:col-span-6 space-y-4">
				<div class="space-y-1">
					<span class="text-[11px] font-bold text-blue-600 uppercase tracking-wider">BEAUTY & HEALTH</span>
					<h2 class="text-lg sm:text-xl font-black text-slate-900">The Ordinary Niacinamide 10% + Zinc 1%</h2>
					<div class="flex items-center gap-1.5 text-xs text-amber-500">
						<Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
						<span class="font-bold text-slate-800">4.9</span>
						<span class="text-slate-400">(২১২টি রিভিউ)</span>
					</div>
				</div>

				<div class="flex items-baseline gap-2.5 py-2 border-y border-slate-100">
					<span class="text-2xl font-black text-slate-900 font-mono">৳১,০৯০</span>
					<span class="text-sm text-slate-400 line-through font-mono">৳১,৮৫০</span>
					<span class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
						৪১% ছাড়
					</span>
				</div>

				<div class="space-y-2 pt-2">
					<button type="button" class="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:bg-blue-700">
						<Zap class="w-4 h-4 fill-white" />
						<span>সরাসরি অর্ডার করুন (Buy Now)</span>
					</button>
					<button type="button" class="w-full py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-200">
						<ShoppingBag class="w-4 h-4" />
						<span>কার্টে যোগ করুন</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

