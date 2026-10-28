<script lang="ts">
	import { ShieldCheck, Truck, CreditCard, Lock, ArrowRight, CheckCircle2 } from 'lucide-svelte';

	interface Props {
		user?: { name?: string; email?: string; phone?: string } | null;
		isStandalonePreview?: boolean;
	}

	let { user = null, isStandalonePreview = false }: Props = $props();
</script>

<!-- Checkout 2: Express Direct One-Page Guest Checkout (Default) -->
<div class="w-full bg-slate-50/70 p-4 sm:p-8 font-['Anek_Bangla',sans-serif]">
	<div class="max-w-4xl mx-auto space-y-6">
		<!-- Top Banner -->
		<div class="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
			<div class="flex items-center gap-2.5">
				<div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
					<Truck class="w-4 h-4" />
				</div>
				<div>
					<h4 class="text-xs sm:text-sm font-bold text-slate-900">এক্সপ্রেস ওয়ান-পেজ চেকআউট</h4>
					<p class="text-[11px] text-slate-500">লগইন ছাড়াই সরাসরি যেকোনো গ্রাহক দ্রুত অর্ডার সম্পন্ন করতে পারেন</p>
				</div>
			</div>
			<span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
				DEFAULT
			</span>
		</div>

		<!-- 2-Column Responsive Layout -->
		<div class="grid grid-cols-1 md:grid-cols-12 gap-6">
			<!-- Left: Form Fields (7 cols) -->
			<div class="md:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
				<h3 class="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
					<span class="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">১</span>
					ডেলিভারি তথ্য প্রদান করুন
				</h3>

				<div class="space-y-3 text-xs">
					<div>
						<label class="block font-bold text-slate-700 mb-1">আপনার নাম *</label>
						<input type="text" placeholder="উদাঃ আনোয়ারুল করিম" class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-800" readonly />
					</div>
					<div>
						<label class="block font-bold text-slate-700 mb-1">মোবাইল নম্বর *</label>
						<input type="text" placeholder="০১৭xxxxxxxx" class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-800" readonly />
					</div>
					<div>
						<label class="block font-bold text-slate-700 mb-1">পূর্ণ ঠিকানা *</label>
						<textarea placeholder="বাসা/হোল্ডিং, রোড, থানা, জেলা..." rows="2" class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-800 resize-none" readonly></textarea>
					</div>

					<!-- Delivery Area Pills -->
					<div>
						<label class="block font-bold text-slate-700 mb-1.5">ডেলিভারি এলাকা</label>
						<div class="grid grid-cols-2 gap-2">
							<div class="p-2.5 rounded-xl border border-blue-500 bg-blue-50/40 text-blue-900 font-bold flex items-center justify-between text-xs cursor-pointer">
								<span>ঢাকার ভিতরে (৳৬০)</span>
								<CheckCircle2 class="w-3.5 h-3.5 text-blue-600" />
							</div>
							<div class="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-xs">
								<span>ঢাকার বাইরে (৳১২০)</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right: Order Summary (5 cols) -->
			<div class="md:col-span-5 space-y-4">
				<div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
					<h3 class="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
						<span>অর্ডার সামারি</span>
						<span class="text-xs font-normal text-slate-500">১টি আইটেম</span>
					</h3>

					<div class="flex items-center gap-3 py-2 border-b border-slate-100">
						<div class="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-xs text-slate-400 font-bold">
							IMG
						</div>
						<div class="min-w-0 flex-1">
							<h5 class="text-xs font-bold text-slate-800 truncate">Kirkland 5% Minoxidil Extra Strength</h5>
							<span class="text-[11px] text-slate-500">১ × ৳৭৯৯</span>
						</div>
						<span class="text-xs font-bold text-slate-900 font-mono">৳৭৯৯</span>
					</div>

					<div class="space-y-1.5 text-xs text-slate-600">
						<div class="flex justify-between">
							<span>সাবটোটাল</span>
							<span class="font-bold text-slate-900 font-mono">৳৭৯৯</span>
						</div>
						<div class="flex justify-between">
							<span>ডেলিভারি চার্জ</span>
							<span class="font-bold text-emerald-600 font-mono">ফ্রি</span>
						</div>
						<div class="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
							<span>সর্বমোট</span>
							<span class="font-mono text-blue-600 text-base">৳৭৯৯</span>
						</div>
					</div>

					<button type="button" class="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition-colors">
						<Lock class="w-3.5 h-3.5" />
						<span>অর্ডার কনফার্ম করুন</span>
					</button>
				</div>

				<div class="flex items-center justify-center gap-3 text-[11px] text-slate-400">
					<span class="flex items-center gap-1"><ShieldCheck class="w-3.5 h-3.5 text-emerald-500" /> ১০০% সুরক্ষিত</span>
					<span>•</span>
					<span class="flex items-center gap-1"><CreditCard class="w-3.5 h-3.5 text-blue-500" /> ক্যাশ অন ডেলিভারি</span>
				</div>
			</div>
		</div>
	</div>
</div>

