<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Badge, Input, confirmSubmit } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import {
		Search,
		Sparkles,
		PhoneCall,
		CheckCircle2,
		Clock,
		DollarSign,
		ArrowRight,
		Trash2
	} from 'lucide-svelte';

	let { data }: { data: any } = $props();

	let searchQuery = $state('');
	let statusFilter = $state('all');
	let confirmingIds = $state<Record<string, boolean>>({});
	let deletingIds = $state<Record<string, boolean>>({});

	function parseOrderItems(itemsJson: any): any[] {
		if (Array.isArray(itemsJson)) return itemsJson;
		try {
			return JSON.parse(itemsJson || '[]');
		} catch {
			return [];
		}
	}

	// Pre-orders: high value (>= 2500 BDT) or explicitly marked
	let preOrders = $derived(
		(data.orders || []).filter((o: any) =>
			(o.total || 0) >= 2500 || o.status === 'pre_order' || o.source === 'Pre-Order'
		)
	);

	// "Pending" = anything not yet processing/confirmed/delivered
	let pendingPreOrders = $derived(
		preOrders.filter(
			(o: any) =>
				o.status !== 'processing' && o.status !== 'confirmed' && o.status !== 'delivered'
		).length
	);

	let filteredOrders = $derived(
		preOrders.filter((order: any) => {
			const matchesStatus =
				statusFilter === 'all'
					? true
					: statusFilter === 'processing'
						? order.status === 'processing' || order.status === 'confirmed'
						: statusFilter === 'pending'
							? order.status !== 'processing' &&
								order.status !== 'confirmed' &&
								order.status !== 'delivered'
							: true;

			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				q === ''
					? true
					: (order.orderNumber || '').toLowerCase().includes(q) ||
						(order.id || '').toLowerCase().includes(q) ||
						(order.customerName || '').toLowerCase().includes(q) ||
						(order.customerPhone || '').includes(q) ||
						(order.customerEmail || '').includes(q);

			return matchesStatus && matchesSearch;
		})
	);

	// Metrics
	let totalValue = $derived(
		preOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
	);

	function formatTimeAgo(dateInput: any): string {
		if (!dateInput) return '';
		try {
			const d = new Date(dateInput);
			const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
			if (diffMins < 1) return 'এইমাত্র';
			if (diffMins < 60) return `${diffMins} মিনিট আগে`;
			const diffHours = Math.floor(diffMins / 60);
			if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
			const diffDays = Math.floor(diffHours / 24);
			if (diffDays < 7) return `${diffDays} দিন আগে`;
			return d.toLocaleDateString('bn-BD');
		} catch { return ''; }
	}
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
				উচ্চ মূল্যের অর্ডার ও স্পেশাল অগ্রিম বুকিং রিকুয়েস্ট
			</p>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" href="/admin/orders/new" class="gap-1.5 shadow-2xs">
				<Sparkles class="w-4 h-4 text-amber-500" />
				<span>ম্যানুয়াল প্রি-অর্ডার এন্ট্রি</span>
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
					placeholder="নাম, ফোন বা প্রি-অর্ডার আইডি দিয়ে সার্চ..."
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
					সব ({preOrders.length})
				</button>
				<button
					type="button"
					onclick={() => statusFilter = 'pending'}
					class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all {statusFilter === 'pending'
						? 'bg-amber-600 text-white shadow-sm'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'}"
				>
					অপেক্ষমাণ ({pendingPreOrders})
				</button>
				<button
					type="button"
					onclick={() => statusFilter = 'processing'}
					class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all {statusFilter === 'processing'
						? 'bg-emerald-600 text-white shadow-sm'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'}"
				>
					প্রসেসিং / কনফার্মড
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
				<h3 class="text-base font-bold text-slate-800">
					{preOrders.length === 0 ? 'কোনো প্রি-অর্ডার নেই' : 'ফিল্টারে কিছু পাওয়া যায়নি'}
				</h3>
				<p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
					{preOrders.length === 0
						? 'নতুন উচ্চমূল্যের বুকিং এলে এখানে স্বয়ংক্রিয়ভাবে দেখাবে।'
						: 'অন্য ফিল্টার বা সার্চ কি-ওয়ার্ড চেষ্টা করুন।'}
				</p>
				{#if preOrders.length === 0}
					<div class="mt-4">
						<Button size="sm" href="/admin/orders/new" class="gap-1.5">
							<span>ম্যানুয়াল অর্ডার তৈরি করুন</span>
							<ArrowRight class="w-4 h-4" />
						</Button>
					</div>
				{/if}
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
							{@const phone = order.customerPhone || order.customerEmail || ''}
							{@const parsedItems = parseOrderItems(order.items)}
							<tr class="hover:bg-slate-50/60 transition-colors">
								<td class="py-3.5 px-4 font-mono font-bold text-slate-900">
									<a
										href="/admin/orders/{order.id}"
										class="text-indigo-600 hover:underline font-mono font-bold"
									>
										#{order.orderNumber || order.id.slice(0, 8)}
									</a>
									<div class="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
										{formatTimeAgo(order.createdAt)}
									</div>
								</td>

								<td class="py-3.5 px-4">
									<a
										href="/admin/orders/{order.id}"
										class="font-bold text-slate-900 hover:text-indigo-600 hover:underline"
									>
										{order.customerName || 'নাম নেই'}
									</a>
									<div class="text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
										<span>{phone}</span>
										{#if phone}
											<a
												href="tel:{phone}"
												class="text-indigo-600 hover:text-indigo-800 p-0.5 rounded"
												title="কল দিন"
											>
												<PhoneCall class="w-3 h-3" />
											</a>
										{/if}
									</div>
									{#if order.shippingAddress}
										<div class="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
											{order.shippingAddress}
										</div>
									{/if}
								</td>

								<td class="py-3.5 px-4">
									{#if parsedItems.length > 0}
										{@const first = parsedItems[0]}
										<div class="font-medium text-slate-800 line-clamp-1" title={first.name}>
											{first.name || 'পণ্য'}
										</div>
										<div class="text-[11px] text-slate-400 flex items-center gap-1.5">
											<span>Qty: {first.quantity || 1}</span>
											{#if parsedItems.length > 1}
												<span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">+{parsedItems.length - 1} আরো</span>
											{/if}
										</div>
									{:else}
										<span class="text-slate-400 text-xs">পণ্য তথ্য নেই</span>
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
									{:else if order.status === 'processing'}
										<Badge variant="blue" class="text-[10px] px-2 py-0.5">
											প্রসেসিং
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
										{#if order.status !== 'processing' && order.status !== 'confirmed' && order.status !== 'delivered'}
											<form
												method="POST"
												action="?/quickConfirmOrder"
												use:enhance={() => {
													confirmingIds[order.id] = true;
													return async ({ result, update }) => {
														await update();
														confirmingIds[order.id] = false;
														if (result.type === 'success') {
															toast.success('প্রি-অর্ডার সফলভাবে কনফার্ম করা হয়েছে!');
														} else if (result.type === 'failure') {
															toast.error((result.data as any)?.message || 'কনফার্ম করতে সমস্যা হয়েছে!');
														}
													};
												}}
											>
												<input type="hidden" name="orderId" value={order.id} />
												<Button
													type="submit"
													size="sm"
													variant="success"
													disabled={confirmingIds[order.id]}
													class="h-8 px-2.5 text-xs gap-1 shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
													title="প্রি-অর্ডার কনফার্ম করুন"
												>
													{#if confirmingIds[order.id]}
														<span class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block"></span>
													{:else}
														<CheckCircle2 class="w-3.5 h-3.5" />
													{/if}
													<span>{confirmingIds[order.id] ? 'হচ্ছে...' : 'কনফার্ম'}</span>
												</Button>
											</form>
										{/if}

										<!-- Move to Trash -->
										<form
											method="POST"
											action="?/deleteOrder"
											use:enhance={() => {
												deletingIds[order.id] = true;
												return async ({ result, update }) => {
													if (result.type === 'success') {
														toast.success('প্রি-অর্ডারটি ট্র্যাশে সরানো হয়েছে!');
													} else if (result.type === 'failure') {
														toast.error((result.data as any)?.message || 'ডিলিট করতে সমস্যা হয়েছে!');
													}
													deletingIds[order.id] = false;
													await update();
												};
											}}
											use:confirmSubmit={() => ({
												title: 'প্রি-অর্ডার ট্র্যাশে পাঠান',
												message: 'আপনি কি এই প্রি-অর্ডারটি ট্র্যাশে পাঠাতে চান?',
												confirmText: 'হ্যাঁ, ট্র্যাশে পাঠান',
												variant: 'destructive',
												icon: 'trash'
											})}
										>
											<input type="hidden" name="orderId" value={order.id} />
											<Button
												type="submit"
												size="sm"
												variant="ghost"
												disabled={deletingIds[order.id]}
												class="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed"
												title="ট্র্যাশে মুভ করুন"
											>
												{#if deletingIds[order.id]}
													<span class="w-4 h-4 border-2 border-slate-300 border-t-rose-500 rounded-full animate-spin inline-block"></span>
												{:else}
													<Trash2 class="w-4 h-4" />
												{/if}
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
