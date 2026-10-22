<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Badge, Input } from '#lib/components/ui';
	import {
		Search,
		Printer,
		Truck,
		CheckCircle2,
		XCircle,
		Clock,
		ClipboardCheck,
		ShieldCheck,
		PackageCheck,
		AlertCircle,
		RotateCcw,
		HelpCircle,
		Trash2
	} from 'lucide-svelte';

	let { data }: { data: any } = $props();

	let orderSearchQuery = $state('');
	let orderListStatusFilter = $state('all');
	let selectedOrderIds = $state<string[]>([]);
	let isBooking = $state(false);
	let bookingMessage = $state<string | null>(null);

	const ORDER_LIST_STATUS_TABS = [
		{ id: 'all', label: 'সব', icon: Clock },
		{ id: 'confirmed', label: 'কনফার্মড', icon: CheckCircle2 },
		{ id: 'printed', label: 'প্রিন্টেড', icon: Printer },
		{ id: 'entry_done', label: 'এন্ট্রি ডান', icon: ClipboardCheck },
		{ id: 'shipped', label: 'শিপড', icon: Truck },
		{ id: 'delivered', label: 'ডেলিভারড', icon: ShieldCheck },
		{ id: 'partial_delivered', label: 'পার্শিয়াল', icon: PackageCheck },
		{ id: 'pending_return', label: 'পেন্ডিং রিটার্ন', icon: AlertCircle },
		{ id: 'returned', label: 'রিটার্ন', icon: RotateCcw },
		{ id: 'cancelled', label: 'বাতিল', icon: XCircle },
		{ id: 'missing', label: 'মিসিং', icon: HelpCircle }
	];

	let orderListOrders = $derived(
		(data.orders || []).filter((o: any) =>
			['confirmed', 'printed', 'entry_done', 'shipped', 'delivered', 'partial_delivered', 'pending_return', 'returned', 'missing'].includes(o.status)
		)
	);

	let filteredOrders = $derived(
		orderListOrders.filter((order: any) => {
			const matchesStatus =
				orderListStatusFilter === 'all' ? true : order.status === orderListStatusFilter;

			const matchesSearch =
				orderSearchQuery === ''
					? true
					: (order.id || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.customerName || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.customerEmail || '').includes(orderSearchQuery);

			return matchesStatus && matchesSearch;
		})
	);

	function toggleSelectAll() {
		if (selectedOrderIds.length === filteredOrders.length) {
			selectedOrderIds = [];
		} else {
			selectedOrderIds = filteredOrders.map((o: any) => o.id);
		}
	}

	function toggleOrderSelect(id: string) {
		if (selectedOrderIds.includes(id)) {
			selectedOrderIds = selectedOrderIds.filter((item) => item !== id);
		} else {
			selectedOrderIds = [...selectedOrderIds, id];
		}
	}

	function handleBulkCourierBooking() {
		if (selectedOrderIds.length === 0) return;
		isBooking = true;
		bookingMessage = `${selectedOrderIds.length} টি অর্ডার Steadfast API-তে বুকিং হচ্ছে...`;
		setTimeout(() => {
			isBooking = false;
			bookingMessage = `${selectedOrderIds.length} টি অর্ডার সফলভাবে Steadfast কুরিয়ারে বুক করা হয়েছে!`;
			selectedOrderIds = [];
			setTimeout(() => (bookingMessage = null), 4000);
		}, 1200);
	}

	function parseItems(itemsJson: any) {
		if (Array.isArray(itemsJson)) return itemsJson;
		try {
			return JSON.parse(itemsJson || '[]');
		} catch {
			return [];
		}
	}
</script>

<div class="space-y-6">

	<!-- Header with Actions -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
		<div>
			<div class="flex items-center gap-3">
				<h1 class="text-2xl font-black text-slate-900 tracking-tight">Order List</h1>
				<Badge variant="purple" class="px-2.5 py-0.5 text-xs">
					{orderListOrders.length} টি অর্ডার
				</Badge>
			</div>
			<p class="text-xs text-slate-500 mt-1">
				কনফার্মড অর্ডার তালিকা, বাল্ক কুরিয়ার এন্ট্রি ও ইনভয়েস প্রিন্ট
			</p>
		</div>

		<!-- Action Buttons -->
		<div class="flex items-center gap-2">
			{#if selectedOrderIds.length > 0}
				<Button
					onclick={handleBulkCourierBooking}
					loading={isBooking}
					class="gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
				>
					<Truck class="w-4 h-4" />
					<span>বুক কুরিয়ার ({selectedOrderIds.length})</span>
				</Button>
			{/if}

			<Button
				variant="outline"
				class="gap-1.5"
				onclick={() => window.print()}
			>
				<Printer class="w-4 h-4" />
				<span>ইনভয়েস প্রিন্ট</span>
			</Button>
		</div>
	</div>

	<!-- Booking Success Message Alert -->
	{#if bookingMessage}
		<div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
			<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
			<span>{bookingMessage}</span>
		</div>
	{/if}

	<!-- Status Tabs -->
	<Card class="p-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
		{#each ORDER_LIST_STATUS_TABS as tab}
			<button
				type="button"
				onclick={() => (orderListStatusFilter = tab.id)}
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer {orderListStatusFilter === tab.id
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
			>
				<tab.icon class="w-3.5 h-3.5" />
				<span>{tab.label}</span>
				{#if tab.id !== 'all'}
					{@const count = orderListOrders.filter((o: any) => o.status === tab.id).length}
					{#if count > 0}
						<span class="text-[10px] px-1.5 py-0.2 rounded-full {orderListStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}">
							{count}
						</span>
					{/if}
				{/if}
			</button>
		{/each}
	</Card>

	<!-- Table Card -->
	<Card class="overflow-hidden">
		<!-- Search Filter Bar -->
		<div class="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
			<div class="relative w-full max-w-sm">
				<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
				<Input
					type="text"
					bind:value={orderSearchQuery}
					placeholder="অর্ডার আইডি, কাস্টমার বা ফোন..."
					class="pl-10"
				/>
			</div>
			<span class="text-xs text-slate-500 font-medium whitespace-nowrap">
				মোট <span class="font-bold text-slate-900">{filteredOrders.length}</span> টি কনফার্মড অর্ডার
			</span>
		</div>

		<!-- Table -->
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs text-slate-700">
				<thead class="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
					<tr>
						<th class="py-3.5 px-4 w-10">
							<input
								type="checkbox"
								checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
								onchange={toggleSelectAll}
								class="rounded text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
							/>
						</th>
						<th class="py-3.5 px-4">অর্ডার আইডি</th>
						<th class="py-3.5 px-4">কাস্টমার তথ্য</th>
						<th class="py-3.5 px-4">পণ্য ও পরিমাণ</th>
						<th class="py-3.5 px-4">মোট বিল</th>
						<th class="py-3.5 px-4">কুরিয়ার ট্র্যাকিং</th>
						<th class="py-3.5 px-4">স্ট্যাটাস</th>
						<th class="py-3.5 px-4 text-right">অ্যাকশন</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#if filteredOrders.length === 0}
						<tr>
							<td colspan="8" class="py-12 text-center text-slate-400">
								কোনো অর্ডার খুঁজে পাওয়া যায়নি
							</td>
						</tr>
					{:else}
						{#each filteredOrders as order}
							{@const isSelected = selectedOrderIds.includes(order.id)}
							{@const items = parseItems(order.items)}
							<tr class="hover:bg-slate-50/70 transition-colors {isSelected ? 'bg-indigo-50/30' : ''}">
								
								<!-- Checkbox -->
								<td class="py-4 px-4">
									<input
										type="checkbox"
										checked={isSelected}
										onchange={() => toggleOrderSelect(order.id)}
										class="rounded text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
									/>
								</td>

								<!-- Order ID -->
								<td class="py-4 px-4 font-mono font-bold text-slate-900">
									<span class="text-[#5845eb]">#{order.id}</span>
									<span class="text-[10px] text-slate-400 font-sans block mt-0.5">
										{order.createdAt ? new Date(order.createdAt).toLocaleDateString('bn-BD') : 'আজ'}
									</span>
								</td>

								<!-- Customer Info -->
								<td class="py-4 px-4 max-w-[200px]">
									<div class="font-bold text-slate-900 text-sm truncate">{order.customerName}</div>
									<div class="text-slate-500 font-mono mt-0.5">{order.customerEmail}</div>
									<div class="text-[11px] text-slate-400 truncate mt-0.5">{order.shippingAddress}</div>
								</td>

								<!-- Products -->
								<td class="py-4 px-4">
									{#each items as item}
										<div class="font-semibold text-slate-800 truncate max-w-[180px]">
											{item.name || 'AURA Spectrum X'}
										</div>
										<span class="text-[10px] text-slate-400">পরিমাণ: {item.quantity || 1} টি</span>
									{/each}
								</td>

								<!-- Total -->
								<td class="py-4 px-4 font-bold font-mono text-sm text-slate-900">
									৳{(order.total || 0).toLocaleString('en-US')}
								</td>

								<!-- Courier Status -->
								<td class="py-4 px-4">
									<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
										<Truck class="w-3.5 h-3.5 text-indigo-600" />
										<span>Steadfast</span>
									</div>
								</td>

								<!-- Status Dropdown -->
								<td class="py-4 px-4">
									<form action="?/updateOrderStatus" method="POST" use:enhance class="inline-block">
										<input type="hidden" name="orderId" value={order.id} />
										<select
											name="status"
											value={order.status}
											onchange={(e: Event) => (e.target as HTMLSelectElement).form?.requestSubmit()}
											class="text-xs font-bold rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-800 focus:outline-none focus:border-[#5845eb] shadow-2xs cursor-pointer"
										>
											<option value="confirmed">কনফার্মড</option>
											<option value="printed">প্রিন্টেড</option>
											<option value="entry_done">এন্ট্রি ডান</option>
											<option value="shipped">শিপড</option>
											<option value="delivered">ডেলিভারড</option>
											<option value="partial_delivered">পার্শিয়াল</option>
											<option value="pending_return">পেন্ডিং রিটার্ন</option>
											<option value="returned">রিটার্ন</option>
											<option value="missing">মিসিং</option>
											<option value="cancelled">বাতিল</option>
										</select>
									</form>
								</td>

								<!-- Actions -->
								<td class="py-4 px-4 text-right">
									<form action="?/deleteOrder" method="POST" use:enhance class="inline">
										<input type="hidden" name="orderId" value={order.id} />
										<Button
											type="submit"
											variant="ghost"
											size="icon"
											class="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
											title="ট্র্যাশে পাঠান"
										>
											<Trash2 class="w-3.5 h-3.5" />
										</Button>
									</form>
								</td>

							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</Card>

</div>
