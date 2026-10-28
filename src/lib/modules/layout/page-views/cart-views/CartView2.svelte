<script lang="ts">
	import { ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-svelte';

	interface Props {
		isStandalonePreview?: boolean;
	}

	let { isStandalonePreview = false }: Props = $props();
</script>

<!-- Cart View 2: Dedicated Full-Page /cart Table Layout -->
<div class="w-full bg-slate-50/70 p-4 sm:p-8 font-['Anek_Bangla',sans-serif]">
	<div class="max-w-4xl mx-auto space-y-4">
		<div class="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
			<div>
				<h4 class="text-xs sm:text-sm font-bold text-slate-900">ফুল-পেজ ডেডিকেটেড কার্ট টেবিল</h4>
				<p class="text-[11px] text-slate-500">প্রোডাক্টের বিবরণ, ডিসকাউন্ট কুপন ক্যালকুলেটর ও বিস্তারিত সামারি টেবিল</p>
			</div>
			<span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300 shrink-0">
				FULL PAGE
			</span>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
			<div class="md:col-span-8 space-y-3">
				<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">পণ্য তালিকা</h3>
				<div class="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-lg bg-slate-200"></div>
						<span class="font-bold text-slate-800">Kirkland 5% Minoxidil Extra Strength</span>
					</div>
					<span class="font-bold text-slate-900 font-mono">৳৭৯৯</span>
				</div>
			</div>
			<div class="md:col-span-4 p-4 bg-slate-50 rounded-2xl space-y-3">
				<h4 class="text-xs font-bold text-slate-900">কুপন ডিসকাউন্ট</h4>
				<div class="flex gap-1.5">
					<input type="text" placeholder="কুপন কোড" class="w-full p-2 rounded-lg bg-white border border-slate-200 text-xs" readonly />
					<button type="button" class="px-3 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs">প্রয়োগ</button>
				</div>
			</div>
		</div>
	</div>
</div>

