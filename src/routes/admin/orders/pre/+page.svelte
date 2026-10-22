<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Badge, Input, Dialog } from '#lib/components/ui';
	import {
		Search,
		Sparkles,
		PhoneCall,
		CheckCircle2,
		XCircle,
		Clock,
		AlertCircle,
		DollarSign,
		ShieldCheck,
		ArrowRight,
		FileEdit,
		Trash2
	} from 'lucide-svelte';

	let { data }: { data: any } = $props();

	let searchQuery = $state('');
	let statusFilter = $state('all');
	let activeOrderForDetails = $state<any | null>(null);
	let isDetailsOpen = $state(false);

	// Pre-orders are high value or advance booking orders (> 2500 BDT or marked pre_order)
	let preOrders = $derived(
		(data.orders || []).filter((o: any) =>
			(o.total || 0) >= 2500 || o.status === 'pre_order' || o.source === 'Pre-Order'
		)
	);

	let filteredOrders = $derived(
		preOrders.filter((order: any) => {
			const matchesStatus =
				statusFilter === 'all'
					? true
					: statusFilter === 'confirmed'
						? order.status === 'confirmed'
						: statusFilter === 'pending'
							? order.status === 'pending'
							: true;

			const matchesSearch =
				searchQuery === ''
					? true
					: (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
						(order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
						(order.customerEmail || '').includes(searchQuery);

			return matchesStatus && matchesSearch;
		})
	);

	// Metrics
	let totalValue = $derived(preOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0));
	let pendingPreOrders = $derived(preOrders.filter((o: any) => o.status !== 'confirmed' && o.status !== 'delivered').length);
</script>

<div class="space-y-6">

	<!-- Header & Metrics -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2.5">
				<h1 class="text-2xl font-black text-slate-900 tracking-tight">Pre-Orders</h1>
				<Badge variant="purple" class="px-2.5 py-0.5 text-xs font-bold">
					{preOrders.length}
				</Badge>
			</div>
			<p class="text-xs text-slate-500 mt-1">
				উচ্চ মূল্যের অর্ডার ও স্পেশাল অগ্রিম বুকিং রিকুয়েস্ট
			</p>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" href="/admin/orders/new" class="gap-1.5 shadow-2xs">
				<Sparkles class="w-4 h-4 text-amber-500" />
				<span>ম্যানুয়াল প্রি-অর্ডার এন্ট্রি</span>
			</Button>
		</div>
	</div>

	<!-- Top Stats Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
		<Card class="p-4 bg-white border-slate-200/90 shadow-2xs flex items-center justify-between">
			<div>
				<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট প্রি-অর্ডার</div>
				<div class="text-2xl font-black text-slate-900 mt-0.5">{preOrders.length} টি</div>
			</div>
			<div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
				<Sparkles class="w-5 h-5" />
			</div>
		</Card>

		<Card class="p-4 bg-white border-slate-200/90 shadow-2xs flex items-center justify-between">
			<div>
				<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">অপেক্ষমাণ প্রি-অর্ডার</div>
				<div class="text-2xl font-black text-amber-600 mt-0.5">{pendingPreOrders} টি</div>
			</div>
			<div class="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
				<Clock class="w-5 h-5" />
			</div>
		</Card>

		<Card class="p-4 bg-white border-slate-200/90 shadow-2xs flex items-center justify-between">
			<div>
				<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট বুকিং ভ্যালু</div>
				<div class="text-2xl font-black text-emerald-600 mt-0.5">৳ {totalValue.toLocaleString('en-US')}</div>
			</div>
			<div class="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
				<DollarSign class="w-5 h-5" />
			</div>
		</Card>
	</div>

	<!-- Filter & Search Toolbar -->
	<Card class="p-3 bg-white border-slate-200/90 shadow-2xs">
		<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
			<div class="relative flex-1 max-w-md">
				<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
				<Input
					type="text"
					placeholder="নাম, ফোন বা প্রি-অর্ডার আইডি দিয়ে সার্চ..."
					bind:value={searchQuery}
					class="pl-10 h-10 text-xs bg-slate-50/50 border-slate-200/80 focus:bg-white"
				/>
			</div>

			<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
				<button
					type="button"
					onclick={() => statusFilter = 'all'}
					class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all {statusFilter === 'all'
						? 'bg-indigo-600 text-white shadow-sm'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'}"
				>
					সব প্রি-অর্ডার ({preOrders.length})
				</button>
				<button
					type="button"
					onclick={() => statusFilter = 'pending'}
					class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all {statusFilter === 'pending'
						? 'bg-amber-600 text-white shadow-sm'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'}"
				>
					পেন্ডিং ({pendingPreOrders})
				</button>
				<button
					type="button"
					onclick={() => statusFilter = 'confirmed'}
					class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all {statusFilter === 'confirmed'
						? 'bg-emerald-600 text-white shadow-sm'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'}"
				>
					কনফার্মড
				</button>
			</div>
		</div>
	</Card>

	<!-- Orders Table Card -->
	<Card class="bg-white border-slate-200/90 shadow-2xs overflow-hidden">
		{#if filteredOrders.length === 0}
			<div class="text-center py-16 px-4">
				<div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
					<Sparkles class="w-7 h-7" />
				</div>
				<h3 class="text-base font-bold text-slate-800">কোন প্রি-অর্ডার পাওয়া যায়নি</h3>
				<p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
					বর্তমানে কোনো সক্রিয় প্রি-অর্ডার নেই। নতুন বুকিং এলে এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
				</p>
				<div class="mt-4">
					<Button size="sm" href="/admin/orders/new" class="gap-1.5">
						<span>ম্যানুয়াল অর্ডার তৈরি করুন</span>
						<ArrowRight class="w-4 h-4" />
					</Button>
				</div>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse text-xs">
					<thead>
						<tr class="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
							<th class="py-3 px-4">অর্ডার আইডি ও তারিখ</th>
							<th class="py-3 px-4">কাস্টমার তথ্য</th>
							<th class="py-3 px-4">প্রোডাক্ট ও পরিমাণ</th>
							<th class="py-3 px-4 text-right">মোট টাকা</th>
							<th class="py-3 px-4 text-center">স্ট্যাটাস</th>
							<th class="py-3 px-4 text-right">অ্যাকশন</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each filteredOrders as order (order.id)}
							<tr class="hover:bg-slate-50/60 transition-colors">
								<td class="py-3.5 px-4 font-mono font-bold text-slate-900">
									<div class="flex items-center gap-1.5">
										<span class="text-indigo-600">#{order.id}</span>
									</div>
									<div class="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
										{new Date(order.createdAt).toLocaleDateString('bn-BD')}
									</div>
								</td>

								<td class="py-3.5 px-4">
									<div class="font-bold text-slate-900">{order.customerName}</div>
									<div class="text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
										<span>{order.customerEmail}</span>
										<a
											href="tel:{order.customerEmail}"
											class="text-indigo-600 hover:text-indigo-800 p-0.5 rounded"
											title="কল দিন"
										>
											<PhoneCall class="w-3 h-3" />
										</a>
									</div>
									<div class="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
										{order.shippingAddress}
									</div>
								</td>

								<td class="py-3.5 px-4">
									{#if order.items}
										{#each JSON.parse(order.items || '[]') as item}
											<div class="font-medium text-slate-800">{item.name || 'AURA Spectrum X'}</div>
											<div class="text-[11px] text-slate-400">Qty: {item.quantity || 1}</div>
										{/each}
									{:else}
										<span class="text-slate-400">AURA Product</span>
									{/if}
								</td>

								<td class="py-3.5 px-4 text-right font-black text-slate-900 font-mono text-sm">
									৳ {(order.total || 0).toLocaleString('en-US')}
								</td>

								<td class="py-3.5 px-4 text-center">
									{#if order.status === 'confirmed'}
										<Badge variant="success" class="text-[10px] px-2 py-0.5">
											কনফার্মড
										</Badge>
									{:else if order.status === 'delivered'}
										<Badge variant="default" class="text-[10px] px-2 py-0.5 bg-emerald-600">
											ডেলিভারড
										</Badge>
									{:else}
										<Badge variant="warning" class="text-[10px] px-2 py-0.5">
											পেন্ডিং বুকিং
										</Badge>
									{/if}
								</td>

								<td class="py-3.5 px-4 text-right">
									<div class="flex items-center justify-end gap-1.5">
										<!-- Quick Confirm Form -->
										{#if order.status !== 'confirmed'}
											<form method="POST" action="?/quickConfirmOrder" use:enhance>
												<input type="hidden" name="orderId" value={order.id} />
												<Button
													type="submit"
													size="sm"
													variant="success"
													class="h-8 px-2.5 text-xs gap-1 shadow-2xs"
													title="প্রি-অর্ডার কনফার্ম করুন"
												>
													<CheckCircle2 class="w-3.5 h-3.5" />
													<span>কনফার্ম</span>
												</Button>
											</form>
										{/if}

										<!-- Move to Trash -->
										<form method="POST" action="?/deleteOrder" use:enhance>
											<input type="hidden" name="orderId" value={order.id} />
											<Button
												type="submit"
												size="sm"
												variant="ghost"
												class="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
												title="ট্র্যাশে মুভ করুন"
											>
												<Trash2 class="w-4 h-4" />
											</Button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</Card>

</div>
