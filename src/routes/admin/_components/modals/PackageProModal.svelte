<script lang="ts">
	import { Dialog, Button } from '#lib/components/ui';
	import { Crown, CheckCircle2 } from 'lucide-svelte';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) }: Props = $props();
</script>

<Dialog bind:open title="AURA প্রিমিয়াম প্যাকেজ বিবরণ">
	<div class="space-y-4 py-2">
		<div class="p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-amber-950 shadow-md flex items-center justify-between">
			<div class="flex items-center gap-3.5">
				<div class="w-12 h-12 rounded-xl bg-amber-600/30 border border-amber-300 flex items-center justify-center shadow-inner">
					<Crown class="w-6 h-6 fill-current text-amber-950" />
				</div>
				<div>
					<h3 class="font-black text-lg leading-tight">Enterprise Pro Package</h3>
					<p class="text-xs font-semibold text-amber-900">আনলিমিটেড অর্ডার, লাইভ এপিআই ও ক্লাউডফ্লেয়ার এজ হোস্টিং</p>
				</div>
			</div>
			<div class="text-right">
				<div class="text-[10px] font-bold uppercase tracking-wider text-amber-900">মেয়াদ বাকি</div>
				<div class="text-xl font-black text-rose-700">৫ দিন</div>
			</div>
		</div>

		<div class="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
			<div class="flex items-center gap-2">
				<CheckCircle2 class="w-4 h-4 text-emerald-600" />
				<span>Steadfast ও Pathao কুরিয়ার অটো বুকিং এপিআই সক্রিয়</span>
			</div>
			<div class="flex items-center gap-2">
				<CheckCircle2 class="w-4 h-4 text-emerald-600" />
				<span>Meta Facebook Pixel ও Conversions API (CAPI) ট্র্যাকিং</span>
			</div>
			<div class="flex items-center gap-2">
				<CheckCircle2 class="w-4 h-4 text-emerald-600" />
				<span>২৪/৭ প্রায়োরিটি ডেডিকেটেড ম্যানেজার সাপোর্ট</span>
			</div>
		</div>

		<div class="flex items-center justify-end gap-2 pt-2">
			<Button type="button" variant="outline" onclick={() => (open = false)}>
				পরে রিনিউ করব
			</Button>
			<Button
				type="button"
				onclick={() => {
					alert('রিনিউয়াল রিকোয়েস্ট পাঠানো হয়েছে। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।');
					open = false;
				}}
				class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold"
			>
				এখনই রিনিউ করুন (৳১,৪৯০ / মাস)
			</Button>
		</div>
	</div>
</Dialog>
