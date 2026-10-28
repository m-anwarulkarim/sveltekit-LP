<script lang="ts">
	import { CheckCircle2, Printer, ArrowRight, Package } from 'lucide-svelte';

	interface Props {
		isStandalonePreview?: boolean;
	}

	let { isStandalonePreview = false }: Props = $props();
</script>

<!-- Order Success 1: Clean Printable Invoice Receipt (Default) -->
<div class="w-full bg-slate-50/70 p-4 sm:p-8 font-['Anek_Bangla',sans-serif]">
	<div class="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-8 space-y-6">
		<div class="text-center space-y-2 border-b border-slate-100 pb-6">
			<div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
				<CheckCircle2 class="w-8 h-8" />
			</div>
			<h3 class="text-lg sm:text-xl font-black text-slate-900">আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে!</h3>
			<p class="text-xs text-slate-500">অর্ডার নম্বর: <span class="font-mono font-bold text-slate-800">#ORD-98241</span></p>
		</div>

		<div class="space-y-3 text-xs">
			<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
				<div class="flex justify-between font-bold text-slate-700">
					<span>গ্রাহকের নাম:</span>
					<span>আনোয়ারুল করিম</span>
				</div>
				<div class="flex justify-between font-bold text-slate-700">
					<span>মোবাইল নম্বর:</span>
					<span>০১৭xxxxxxxx</span>
				</div>
				<div class="flex justify-between font-bold text-slate-700">
					<span>পেমেন্ট মেথড:</span>
					<span>ক্যাশ অন ডেলিভারি (COD)</span>
				</div>
			</div>
		</div>

		<div class="flex items-center justify-between gap-3 pt-2">
			<button type="button" class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
				<Printer class="w-3.5 h-3.5" />
				<span>ইনভয়েস প্রিন্ট করুন</span>
			</button>
			<button type="button" class="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md">
				<span>শপিং চালিয়ে যান</span>
			</button>
		</div>
	</div>
</div>

