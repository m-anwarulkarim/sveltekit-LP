<script lang="ts">
	import { StoreLayout } from '#lib';
	import { Card, CardContent, Badge } from '#lib/components/ui';
	import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>ডেলিভারি তথ্য (Shipping Information) | AURA</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-8 font-['Anek_Bangla',sans-serif]">
		
		<div class="text-center space-y-2">
			<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200">
				Fast & Reliable Delivery
			</Badge>
			<h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
				ডেলিভারি ও শিপিং তথ্য (Shipping Information)
			</h1>
			<p class="text-xs sm:text-sm text-slate-500">সারা বাংলাদেশে দ্রুত ও সুরক্ষিত হোম ডেলিভারি</p>
		</div>

		<!-- Delivery Cards Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card class="border-slate-200/90 shadow-2xs">
				<CardContent class="p-6 space-y-3">
					<div class="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center border border-indigo-100">
						<Truck class="w-5 h-5" />
					</div>
					<h3 class="text-base font-extrabold text-slate-900">ঢাকার ভেতরে ডেলিভারি</h3>
					<div class="text-xs text-slate-600 space-y-1">
						<p>• সময়: <strong>২৪ থেকে ৪৮ ঘণ্টার মধ্যে</strong></p>
						<p>• চার্জ: <strong>৳৬০ মাত্র</strong></p>
						<p>• ৳৬০০+ অর্ডারে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</p>
					</div>
				</CardContent>
			</Card>

			<Card class="border-slate-200/90 shadow-2xs">
				<CardContent class="p-6 space-y-3">
					<div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
						<MapPin class="w-5 h-5" />
					</div>
					<h3 class="text-base font-extrabold text-slate-900">ঢাকার বাইরে (সারা দেশ)</h3>
					<div class="text-xs text-slate-600 space-y-1">
						<p>• সময়: <strong>৪৮ থেকে ৭২ ঘণ্টার মধ্যে</strong></p>
						<p>• চার্জ: <strong>৳১০০ থেকে ৳১২০</strong></p>
						<p>• পাঠাও, স্টিডফাস্ট ও রেডেক্স হোম ডেলিভারি সাপোর্ট।</p>
					</div>
				</CardContent>
			</Card>
		</div>

	</div>
</StoreLayout>
