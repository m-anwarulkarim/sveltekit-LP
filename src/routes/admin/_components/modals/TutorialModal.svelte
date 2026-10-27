<script lang="ts">
	import { Dialog, Button } from '#lib/components/ui';
	import { Play } from 'lucide-svelte';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) }: Props = $props();
</script>

<Dialog bind:open title="AURA E-Commerce ভিডিও টিউটোরিয়াল">
	<div class="space-y-4 py-2">
		<div class="p-4 rounded-2xl bg-red-50 border border-red-200/80 flex items-center gap-3">
			<div class="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
				<Play class="w-5 h-5 fill-current" />
			</div>
			<div>
				<h4 class="font-bold text-slate-900 text-sm">সহজ গাইডলাইন ও ভিডিও নির্দেশনা</h4>
				<p class="text-xs text-slate-500">আপনার অনলাইন শপের যাবতীয় ফিচার ব্যবহারের সম্পূর্ণ গাইড</p>
			</div>
		</div>

		<div class="space-y-2.5 text-xs text-slate-700">
			<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">১</span>
					<span class="font-semibold text-slate-800">অর্ডার কনফার্ম ও কুরিয়ার বুকিং প্রক্রিয়া</span>
				</div>
				<span class="text-[11px] font-bold text-indigo-600">৩ মিনিট</span>
			</div>
			<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">২</span>
					<span class="font-semibold text-slate-800">Facebook Pixel ও CAPI টোকেন সেটআপ</span>
				</div>
				<span class="text-[11px] font-bold text-indigo-600">৫ মিনিট</span>
			</div>
			<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">৩</span>
					<span class="font-semibold text-slate-800">ল্যান্ডিং পেজ টেক্সট, প্রোডাক্ট ও ছবি কাস্টমাইজেশন</span>
				</div>
				<span class="text-[11px] font-bold text-indigo-600">৪ মিনিট</span>
			</div>
		</div>

		<div class="flex justify-end pt-2">
			<Button type="button" variant="outline" onclick={() => (open = false)}>
				বন্ধ করুন
			</Button>
		</div>
	</div>
</Dialog>
