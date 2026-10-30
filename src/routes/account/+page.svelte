<script lang="ts">
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import { Button } from '#lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '#lib/components/ui/card';
	import { Badge } from '#lib/components/ui/badge';
	import {
		User,
		Package,
		LogOut,
		Clock,
		CheckCircle2,
		PhoneCall,
		ArrowRight,
		ShoppingBag,
		ShieldCheck,
		MapPin,
		Truck
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function getStatusBadge(status: string) {
		switch (status?.toLowerCase()) {
			case 'delivered':
				return { label: 'ডেলিভার্ড', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
			case 'processing':
			case 'confirmed':
				return { label: 'প্রসেসিং', class: 'bg-blue-50 text-blue-700 border-blue-200' };
			case 'cancelled':
				return { label: 'বাতিল', class: 'bg-rose-50 text-rose-700 border-rose-200' };
			case 'returned':
				return { label: 'রিটার্ন', class: 'bg-slate-100 text-slate-700 border-slate-200' };
			default:
				return { label: 'পেন্ডিং', class: 'bg-amber-50 text-amber-700 border-amber-200' };
		}
	}

	const orderCount = $derived(data.orders?.length || 0);
	const deliveredCount = $derived(data.orders?.filter((o: any) => o.status === 'delivered')?.length || 0);
	const pendingCount = $derived(data.orders?.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled')?.length || 0);
</script>

<svelte:head>
	<title>আমার অ্যাকাউন্ট | ড্যাশবোর্ড</title>
	<meta name="description" content="আপনার গ্রাহক প্রোফাইল এবং সাম্প্রতিক অর্ডারসমূহ।" />
</svelte:head>

<StoreLayout user={data.user}>
	<div class="py-8 sm:py-12 px-4 max-w-5xl mx-auto font-['Anek_Bangla',sans-serif] space-y-6">
		
		<!-- 1. Customer Welcome Header Card -->
		<div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
			<div class="flex items-center gap-4">
				<div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5845eb] to-[#7c3aed] p-0.5 shadow-md shadow-indigo-600/20 shrink-0">
					<div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-black text-2xl text-[#5845eb]">
						{data.user?.name ? data.user.name.charAt(0).toUpperCase() : 'U'}
					</div>
				</div>
				<div>
					<div class="flex flex-wrap items-center gap-2">
						<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
							{data.user?.name || 'সম্মানিত গ্রাহক'}
						</h1>
						<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-[#5845eb]">
							ভেরিফাইড কাস্টমার
						</span>
					</div>
					<div class="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
						<span>{data.user?.email}</span>
						<span>•</span>
						<span class="text-emerald-600 inline-flex items-center gap-1">
							<ShieldCheck class="w-3.5 h-3.5" />
							সুরক্ষিত একাউন্ট
						</span>
					</div>
				</div>
			</div>

			<!-- Sign Out Action -->
			<form action="/auth/login?/signOut" method="POST" class="shrink-0 w-full sm:w-auto">
				<Button
					type="submit"
					variant="outline"
					class="w-full sm:w-auto rounded-xl border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all cursor-pointer"
				>
					<LogOut class="w-3.5 h-3.5" />
					<span>লগআউট করুন</span>
				</Button>
			</form>
		</div>

		<!-- 2. Metrics / Stat Highlights -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
				<div class="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb] shrink-0">
					<Package class="w-6 h-6" />
				</div>
				<div>
					<div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">মোট অর্ডার</div>
					<div class="text-2xl font-black text-slate-900 mt-0.5">{orderCount} টি</div>
				</div>
			</div>

			<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
				<div class="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
					<Clock class="w-6 h-6" />
				</div>
				<div>
					<div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">পেন্ডিং / প্রসেসিং</div>
					<div class="text-2xl font-black text-slate-900 mt-0.5">{pendingCount} টি</div>
				</div>
			</div>

			<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
				<div class="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
					<CheckCircle2 class="w-6 h-6" />
				</div>
				<div>
					<div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ডেলিভারি সম্পন্ন</div>
					<div class="text-2xl font-black text-slate-900 mt-0.5">{deliveredCount} টি</div>
				</div>
			</div>
		</div>

		<!-- 3. Orders Section -->
		<Card class="border border-slate-200/90 shadow-xs rounded-3xl overflow-hidden bg-white">
			<CardHeader class="border-b border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<CardTitle class="text-lg font-black text-slate-900 flex items-center gap-2">
						<Package class="w-5 h-5 text-[#5845eb]" />
						<span>সাম্প্রতিক অর্ডারসমূহ</span>
					</CardTitle>
					<p class="text-xs text-slate-500 mt-0.5">আপনার সকল ডেলিভারি এবং ট্র্যাকিং তথ্য এখানে দেখুন</p>
				</div>
				
				<a
					href="/"
					class="inline-flex items-center gap-1.5 text-xs font-bold text-[#5845eb] hover:underline"
				>
					<span>নতুন কেনাকাটা করুন</span>
					<ArrowRight class="w-3.5 h-3.5" />
				</a>
			</CardHeader>

			<CardContent class="p-0">
				{#if data.orders && data.orders.length > 0}
					<div class="divide-y divide-slate-100">
						{#each data.orders as order}
							{@const statusInfo = getStatusBadge(order.status)}
							<div class="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								<div class="space-y-1.5">
									<div class="flex items-center gap-2.5">
										<span class="font-mono font-bold text-sm text-slate-900">
											{order.orderNumber || `#ORD-${order.id?.slice(0, 8)}`}
										</span>
										<span class="px-2 py-0.5 rounded-full text-[10px] font-bold border {statusInfo.class}">
											{statusInfo.label}
										</span>
									</div>
									<div class="text-xs text-slate-500 flex flex-wrap items-center gap-3">
										<span>তারিখ: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : 'আজ'}</span>
										{#if order.shippingAddress}
											<span>•</span>
											<span class="truncate max-w-xs">{order.shippingAddress}</span>
										{/if}
									</div>
								</div>

								<div class="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
									<div class="text-right">
										<div class="text-sm font-black text-slate-900">৳{order.total || 0}</div>
										<div class="text-[10px] text-slate-400 capitalize">{order.paymentMethod || 'ক্যাশ অন ডেলিভারি'}</div>
									</div>

									{#if order.trackingCode}
										<div class="text-xs bg-indigo-50 text-[#5845eb] px-3 py-1.5 rounded-xl font-mono font-bold border border-indigo-100 flex items-center gap-1">
											<Truck class="w-3.5 h-3.5" />
											<span>{order.trackingCode}</span>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<!-- Empty State -->
					<div class="text-center py-12 px-4">
						<div class="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
							<ShoppingBag class="w-8 h-8" />
						</div>
						<h3 class="text-base font-bold text-slate-800">এখনো কোনো অর্ডার নেই</h3>
						<p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
							আপনি এখনো কোনো কেনাকাটা করেননি। পছন্দের পণ্য বেছে নিতে আমাদের স্টোর ভিজিট করুন।
						</p>
						<div class="mt-6">
							<Button
								href="/"
								class="rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold px-6 h-10 shadow-sm shadow-indigo-600/30"
							>
								শপিং শুরু করুন
							</Button>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- 4. Need Help / Customer Support Info -->
		<div class="bg-gradient-to-r from-indigo-50/60 to-purple-50/60 border border-indigo-100/80 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div class="space-y-1">
				<h4 class="text-sm font-black text-slate-900">অর্ডার সংক্রান্ত কোনো জিজ্ঞাসা বা সহায়তা দরকার?</h4>
				<p class="text-xs text-slate-600">আমাদের কাস্টমার কেয়ার টিম সবসময় আপনার সহায়তায় প্রস্তুত।</p>
			</div>
			<div class="flex items-center gap-3">
				<a
					href="tel:01860229546"
					class="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:text-[#5845eb] text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors"
				>
					<PhoneCall class="w-3.5 h-3.5 text-[#5845eb]" />
					<span>01860-229546</span>
				</a>
			</div>
		</div>

	</div>
</StoreLayout>
