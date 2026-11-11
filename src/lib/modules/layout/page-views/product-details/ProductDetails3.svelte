<script lang="ts">
	import { Star, ShieldCheck, Truck, RotateCcw, Check, Zap, Phone, MapPin, User, ArrowRight } from 'lucide-svelte';

	interface Props {
		isStandalonePreview?: boolean;
	}

	let { isStandalonePreview = false }: Props = $props();
</script>

<!-- Product Details 3: Direct Inline Checkout (Poltisheba Style) -->
<div class="w-full bg-slate-50/70 p-4 sm:p-8 font-['Anek_Bangla',sans-serif]">
	<div class="max-w-4xl mx-auto space-y-6">
		
		<!-- Banner Description -->
		<div class="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 flex items-center justify-between gap-4">
			<div>
				<h4 class="text-xs sm:text-sm font-bold text-slate-900">ডিরেক্ট ইনলাইন চেকআউট (1-Step Checkout)</h4>
				<p class="text-[11px] text-slate-600">আলাদা চেকআউট পেজে না গিয়ে প্রোডাক্ট পেজের ভেতরেই সম্পূর্ণ অর্ডার ফর্ম (পল্ট্রি সেবা ও হাই-কনভার্টিং ল্যান্ডিং স্টাইল)</p>
			</div>
			<span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
				DIRECT CHECKOUT
			</span>
		</div>

		<!-- Schematic Mockup Grid -->
		<div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
			
			<!-- Left Column (6 cols): Product Gallery & Trust Badges -->
			<div class="md:col-span-6 space-y-4">
				<div class="aspect-square rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 font-bold text-sm">
					প্রধান প্রোডাক্ট ইমেজ গ্যালারি
				</div>
				<div class="grid grid-cols-4 gap-2">
					<div class="aspect-square rounded-xl border-2 border-emerald-600 bg-slate-50"></div>
					<div class="aspect-square rounded-xl border border-slate-200 bg-slate-50"></div>
					<div class="aspect-square rounded-xl border border-slate-200 bg-slate-50"></div>
					<div class="aspect-square rounded-xl border border-slate-200 bg-slate-50"></div>
				</div>

				<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
					<div class="flex items-center gap-2">
						<ShieldCheck class="w-4 h-4 text-emerald-600" />
						<span>১০০% আসল পণ্যের গ্যারান্টি</span>
					</div>
					<div class="flex items-center gap-2">
						<Truck class="w-4 h-4 text-blue-600" />
						<span>সারা দেশে ক্যাশ অন ডেলিভারি</span>
					</div>
					<div class="flex items-center gap-2">
						<RotateCcw class="w-4 h-4 text-amber-600" />
						<span>৭ দিনের সহজ রিটার্ন পলিসি</span>
					</div>
				</div>
			</div>

			<!-- Right Column (6 cols): Product Info + Inline Checkout Form -->
			<div class="md:col-span-6 space-y-4">
				<!-- Title & Price -->
				<div class="space-y-1">
					<span class="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">HEALTH & CARE</span>
					<h3 class="text-base sm:text-lg font-black text-slate-900 leading-tight">
						প্রিমিয়াম হারবাল হেয়ার অয়েল (২০০ মি.লি.)
					</h3>
					<div class="flex items-baseline gap-2 pt-1">
						<span class="text-xl font-black text-emerald-700 font-mono">৳৮৬০</span>
						<span class="text-xs text-slate-400 line-through font-mono">৳১,২০০</span>
						<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
							২৮% ছাড়
						</span>
					</div>
				</div>

				<!-- Embedded Order Form Card Mockup -->
				<div class="rounded-2xl border-2 border-emerald-500/80 p-4 bg-emerald-50/20 space-y-3">
					<div class="flex items-center gap-2 text-emerald-800 text-xs font-black">
						<Zap class="w-4 h-4 fill-emerald-600 text-emerald-600" />
						<span>অর্ডার করতে নিচের তথ্য দিন</span>
					</div>

					<div class="space-y-2">
						<div class="h-8 rounded-lg bg-white border border-slate-200 flex items-center px-2.5 text-xs text-slate-400">
							আপনার নাম...
						</div>
						<div class="h-8 rounded-lg bg-white border border-slate-200 flex items-center px-2.5 text-xs text-slate-400 font-mono">
							মোবাইল নম্বর...
						</div>
						<div class="h-8 rounded-lg bg-white border border-slate-200 flex items-center px-2.5 text-xs text-slate-400">
							সম্পূর্ণ ঠিকানা...
						</div>
					</div>

					<!-- Area Buttons -->
					<div class="grid grid-cols-2 gap-2 text-center text-xs">
						<div class="p-2 rounded-lg border border-emerald-600 bg-emerald-50 font-bold text-emerald-800 text-[11px]">
							ঢাকা সিটি (৳৬০)
						</div>
						<div class="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px]">
							ঢাকার বাইরে (৳১২০)
						</div>
					</div>

					<!-- Total Bill -->
					<div class="flex justify-between items-center text-xs pt-1 border-t border-slate-200 font-bold">
						<span class="text-slate-700">সর্বমোট প্রদেয় টাকা:</span>
						<span class="text-sm font-black text-emerald-700 font-mono">৳৯২০</span>
					</div>

					<!-- Primary CTA Button -->
					<div class="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md">
						<span>অর্ডার কনফার্ম করুন (৳৯২০)</span>
						<ArrowRight class="w-3.5 h-3.5" />
					</div>
				</div>

			</div>

		</div>

	</div>
</div>
