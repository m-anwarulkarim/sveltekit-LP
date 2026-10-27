<script lang="ts">
	import { Card, Badge } from '#lib/components/ui';
	import {
		User,
		ShoppingBag,
		CreditCard,
		CheckCircle2,
		Clock,
		ExternalLink
	} from 'lucide-svelte';

	interface PastOrder {
		id: string;
		status: string;
		total: number;
		date: string;
	}

	interface Props {
		customerName: string;
		customerPhone: string;
		shippingAddress: string;
		pastOrders?: PastOrder[];
		currentOrderId: string;
	}

	let {
		customerName,
		customerPhone,
		shippingAddress,
		pastOrders = [],
		currentOrderId
	}: Props = $props();

	let isRegularCustomer = $derived(pastOrders.length > 1);

	let totalSpent = $derived(
		pastOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0)
	);

	let confirmedCount = $derived(
		pastOrders.filter((o) =>
			['confirmed', 'shipped', 'delivered', 'processing'].includes(o.status)
		).length
	);

	function getInitials(name: string) {
		if (!name) return 'C';
		const parts = name.trim().split(/\s+/);
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}
</script>

<Card class="p-4 bg-white/90 shadow-xs border-slate-200/90 space-y-3">
	<!-- Header -->
	<div class="flex items-center justify-between pb-2 border-b border-slate-100">
		<div class="flex items-center gap-2">
			<User class="w-4 h-4 text-slate-700" />
			<h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">
				কাস্টমার প্রোফাইল
			</h3>
		</div>
		<Badge
			variant={isRegularCustomer ? 'purple' : 'outline'}
			class="text-[10px] px-2 py-0.2"
		>
			{isRegularCustomer ? 'নিয়মিত গ্রাহক' : 'নতুন গ্রাহক'}
		</Badge>
	</div>

	<!-- Profile Snippet -->
	<div class="flex items-center gap-3">
		<div class="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-200 text-[#5845eb] flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
			{getInitials(customerName)}
		</div>
		<div class="min-w-0">
			<h4 class="text-sm font-black text-slate-900 truncate">
				{customerName || 'বেনামী কাস্টমার'}
			</h4>
			<p class="text-xs font-mono text-slate-500 font-medium">
				{customerPhone}
			</p>
		</div>
	</div>

	<!-- Customer Metric Stats -->
	<div class="grid grid-cols-3 gap-2 text-center">
		<div class="bg-slate-50 p-2 rounded-xl border border-slate-100">
			<span class="text-[10px] font-bold text-slate-500 block">মোট অর্ডার</span>
			<span class="text-sm font-black font-mono text-slate-900">{pastOrders.length || 1}</span>
		</div>
		<div class="bg-slate-50 p-2 rounded-xl border border-slate-100">
			<span class="text-[10px] font-bold text-slate-500 block">মোট শপিং</span>
			<span class="text-xs sm:text-sm font-black font-mono text-emerald-600">
				৳{totalSpent.toLocaleString('en-US')}
			</span>
		</div>
		<div class="bg-slate-50 p-2 rounded-xl border border-slate-100">
			<span class="text-[10px] font-bold text-slate-500 block">কনফার্মড</span>
			<span class="text-sm font-black font-mono text-indigo-600">{confirmedCount}</span>
		</div>
	</div>

	<!-- Address Snippet -->
	<div class="text-[11px] text-slate-500 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 truncate">
		<span class="font-bold text-slate-700">ঠিকানা: </span>{shippingAddress}
	</div>

	<!-- Recent Orders List -->
	{#if pastOrders.length > 0}
		<div class="space-y-1.5 pt-1">
			<span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
				পূর্ববর্তী অর্ডারসমূহ ({pastOrders.length})
			</span>
			<div class="space-y-1 max-h-36 overflow-y-auto pr-1">
				{#each pastOrders as order}
					<a
						href="/admin/orders/{order.id}"
						class="flex items-center justify-between p-2 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 {order.id === currentOrderId ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50/60'}"
					>
						<div class="flex items-center gap-2">
							<span class="font-mono text-slate-900 font-bold">#{order.id}</span>
							<span class="text-[10px] text-slate-400">{order.date}</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="font-mono font-bold text-slate-700">৳{order.total}</span>
							<span class="text-[10px] px-1.5 py-0.2 rounded font-bold {order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
								{order.status}
							</span>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</Card>

