<script lang="ts">
	import { StoreLayout } from '#lib';
	import { Button, Input, Card, CardContent, Badge } from '#lib/components/ui';
	import { Search, Package, Truck, CheckCircle2, Clock, Phone, AlertCircle } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let trackedOrder = $state<any | null>(null);
	let hasSearched = $state(false);

	function handleTrack(e: SubmitEvent) {
		e.preventDefault();
		if (!searchQuery.trim()) return;
		hasSearched = true;

		// Mock order result for interactive demo
		trackedOrder = {
			id: searchQuery.trim().startsWith('#') ? searchQuery.trim() : `#${searchQuery.trim()}`,
			date: '২৬ অক্টোবর, ২০২৬',
			status: 'shipped',
			statusBangla: 'কুরিয়ারে পাঠানো হয়েছে',
			customer: 'মোঃ রহিম',
			phone: '01712-345678',
			address: 'মিরপুর-১০, ঢাকা',
			courier: 'Steadfast Courier',
			trackingCode: 'STEAD-9823412',
			total: 850,
			items: [
				{ name: 'হাইব্রিড কাঁচা মরিচ বীজ (১ প্যাকেট)', price: 180 },
				{ name: 'উন্নত জাতের লাল শাক বীজ (৩ প্যাকেট)', price: 270 },
				{ name: 'ভার্মিকম্পোস্ট সার (২ কেজি)', price: 400 }
			]
		};
	}
</script>

<svelte:head>
	<title>অর্ডার ট্র্যাক করুন (Track Order) | AURA</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-8 font-['Anek_Bangla',sans-serif]">
		
		<!-- Page Header -->
		<div class="text-center space-y-2">
			<Badge variant="outline" class="bg-indigo-50 text-[#5845eb] border-indigo-200">
				Live Order Tracking
			</Badge>
			<h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
				আপনার অর্ডার ট্র্যাক করুন (Track Your Order)
			</h1>
			<p class="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
				অর্ডার করার সময় প্রাপ্ত অর্ডার আইডি (যেমন: #1024) অথবা মোবাইল নম্বর দিয়ে আপনার অর্ডারের বর্তমান অবস্থা জানুন।
			</p>
		</div>

		<!-- Tracking Form Box -->
		<Card class="border-slate-200/90 shadow-xs max-w-2xl mx-auto">
			<CardContent class="p-6 sm:p-8">
				<form onsubmit={handleTrack} class="space-y-4">
					<div class="space-y-1.5">
						<label for="track-input" class="text-xs font-bold text-slate-700">
							অর্ডার নম্বর বা ফোন নম্বর দিন
						</label>
						<div class="relative">
							<Input
								id="track-input"
								bind:value={searchQuery}
								placeholder="যেমন: #1042 অথবা 01712345678"
								class="rounded-xl h-12 text-sm pl-4 pr-12"
								required
							/>
							<div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
								<Package class="w-5 h-5" />
							</div>
						</div>
					</div>

					<Button
						type="submit"
						class="w-full bg-[#5845eb] hover:bg-[#4936d6] text-white rounded-xl h-12 text-sm font-bold shadow-sm shadow-indigo-600/30 gap-2 cursor-pointer"
					>
						<Search class="w-4 h-4" />
						<span>অর্ডার স্ট্যাটাস খুঁজুন</span>
					</Button>
				</form>
			</CardContent>
		</Card>

		<!-- Order Result Card -->
		{#if trackedOrder}
			<Card class="border-slate-200/90 shadow-sm animate-in fade-in slide-in-from-top-3 duration-200">
				<CardContent class="p-6 sm:p-8 space-y-6">
					<!-- Top Order Info -->
					<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
						<div>
							<div class="flex items-center gap-2">
								<span class="text-lg font-black text-slate-900">{trackedOrder.id}</span>
								<Badge class="bg-indigo-50 text-[#5845eb] border border-indigo-200 font-bold">
									{trackedOrder.statusBangla}
								</Badge>
							</div>
							<span class="text-xs text-slate-400">অর্ডারের তারিখ: {trackedOrder.date}</span>
						</div>
						<div class="text-left sm:text-right">
							<span class="text-xs text-slate-500 font-medium">কুরিয়ার ট্র্যাকিং:</span>
							<div class="text-xs font-mono font-bold text-slate-800">{trackedOrder.courier} ({trackedOrder.trackingCode})</div>
						</div>
					</div>

					<!-- Status Progress Steps -->
					<div class="grid grid-cols-4 gap-2 pt-2 text-center text-[11px] font-bold">
						<div class="flex flex-col items-center gap-1.5 text-emerald-600">
							<div class="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600">
								<CheckCircle2 class="w-4 h-4" />
							</div>
							<span>অর্ডার প্লেসড</span>
						</div>
						<div class="flex flex-col items-center gap-1.5 text-emerald-600">
							<div class="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600">
								<CheckCircle2 class="w-4 h-4" />
							</div>
							<span>কনফার্মড</span>
						</div>
						<div class="flex flex-col items-center gap-1.5 text-[#5845eb]">
							<div class="w-8 h-8 rounded-full bg-indigo-100 border-2 border-[#5845eb] flex items-center justify-center text-[#5845eb] animate-pulse">
								<Truck class="w-4 h-4" />
							</div>
							<span>কুরিয়ারে পথে</span>
						</div>
						<div class="flex flex-col items-center gap-1.5 text-slate-400">
							<div class="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-slate-400">
								<Clock class="w-4 h-4" />
							</div>
							<span>ডেলিভার্ড</span>
						</div>
					</div>

					<!-- Order Items Summary -->
					<div class="pt-4 border-t border-slate-100 space-y-2">
						<h4 class="text-xs font-bold text-slate-800">অর্ডারের পণ্যসমূহ:</h4>
						<div class="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs">
							{#each trackedOrder.items as item}
								<div class="flex items-center justify-between text-slate-700">
									<span>• {item.name}</span>
									<span class="font-bold">৳{item.price}</span>
								</div>
							{/each}
							<div class="pt-2 border-t border-slate-200/60 flex items-center justify-between font-black text-slate-900 text-sm">
								<span>সর্বমোট:</span>
								<span class="text-[#5845eb]">৳{trackedOrder.total}</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		{/if}

	</div>
</StoreLayout>
