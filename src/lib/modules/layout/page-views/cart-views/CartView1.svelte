<script lang="ts">
	import { ShoppingBag, ArrowRight, Truck, Trash2, Plus, Minus } from 'lucide-svelte';

	interface Props {
		isStandalonePreview?: boolean;
	}

	let { isStandalonePreview = false }: Props = $props();
</script>

<!-- Cart View 1: Slide-Out Drawer with Free Delivery Meter (Default) -->
<div class="w-full bg-slate-50/70 p-4 sm:p-8 font-['Anek_Bangla',sans-serif]">
	<div class="max-w-md mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
		<!-- Header -->
		<div class="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<ShoppingBag class="w-4 h-4 text-blue-600" />
				<h4 class="text-xs sm:text-sm font-bold text-slate-900">শপিং কার্ট (১টি আইটেম)</h4>
			</div>
			<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
				DEFAULT DRAWER
			</span>
		</div>

		<!-- Free Delivery Meter -->
		<div class="p-4 bg-blue-50/60 border-b border-blue-100 space-y-1.5">
			<div class="flex items-center justify-between text-xs text-blue-900 font-bold">
				<span class="flex items-center gap-1"><Truck class="w-3.5 h-3.5 text-blue-600" /> আপনি ফ্রি ডেলিভারি পেয়েছেন!</span>
				<span class="font-mono">৳৬০০+</span>
			</div>
			<div class="w-full h-1.5 rounded-full bg-blue-200 overflow-hidden">
				<div class="w-full h-full bg-blue-600 rounded-full"></div>
			</div>
		</div>

		<!-- Item Row -->
		<div class="p-4 space-y-4">
			<div class="flex items-center gap-3">
				<div class="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold shrink-0">
					IMG
				</div>
				<div class="min-w-0 flex-1">
					<h5 class="text-xs font-bold text-slate-900 truncate">Kirkland 5% Minoxidil Extra Strength</h5>
					<span class="text-xs font-bold text-blue-600 font-mono">৳৭৯৯</span>
				</div>
			</div>

			<div class="pt-3 border-t border-slate-100 space-y-2">
				<div class="flex justify-between text-xs font-black text-slate-900">
					<span>সর্বমোট মূল্য</span>
					<span class="font-mono text-base text-blue-600">৳৭৯৯</span>
				</div>
				<button type="button" class="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm">
					<span>চেকআউট করুন</span>
					<ArrowRight class="w-3.5 h-3.5" />
				</button>
			</div>
		</div>
	</div>
</div>

