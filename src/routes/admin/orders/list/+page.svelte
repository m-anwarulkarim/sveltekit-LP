<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Badge, Input, confirmSubmit } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
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
		Trash2,
		FileEdit,
		Copy,
		ExternalLink,
		ShoppingBag,
		PhoneCall,
		MessageSquare,
		MapPin
	} from 'lucide-svelte';
	import OrderStatusDropdown from '../../_components/orders/OrderStatusDropdown.svelte';
	import ScrollableStatusTabs from '../../_components/orders/ScrollableStatusTabs.svelte';
	import OrderSourceBadge from '../../_components/orders/OrderSourceBadge.svelte';

	let { data, form }: { data: any; form: any } = $props();

	let orderSearchQuery = $state('');
	// Default active tab is 'confirmed' (First tab as requested)
	let orderListStatusFilter = $state('confirmed');
	let selectedOrderIds = $state<string[]>([]);
	let isBooking = $state(false);
	let selectedBulkStatus = $state('processing');

	// Display form action message via Sonner toast if returned
	$effect(() => {
		if (form?.message) {
			if (form.success) {
				toast.success(form.message);
			} else {
				toast.error(form.message);
			}
		}
	});

	function showToast(msg: string) {
		toast.success(msg);
	}

	// 1. Tab sequence: confirmed -> processing -> ... -> all (last)
	const ORDER_LIST_STATUS_TABS = [
		{ id: 'confirmed', label: 'কনফার্মড', icon: CheckCircle2 },
		{ id: 'processing', label: 'প্রসেসিং', icon: CheckCircle2 },
		{ id: 'printed', label: 'প্রিন্টেড', icon: Printer },
		{ id: 'entry_done', label: 'এন্ট্রি ডান', icon: ClipboardCheck },
		{ id: 'shipped', label: 'শিপড', icon: Truck },
		{ id: 'delivered', label: 'ডেলিভারড', icon: ShieldCheck },
		{ id: 'partial_delivered', label: 'পার্শিয়াল', icon: PackageCheck },
		{ id: 'pending_return', label: 'পেন্ডিং রিটার্ন', icon: AlertCircle },
		{ id: 'returned', label: 'রিটার্ন', icon: RotateCcw },
		{ id: 'cancelled', label: 'বাতিল', icon: XCircle },
		{ id: 'missing', label: 'মিসিং', icon: HelpCircle },
		{ id: 'all', label: 'সব', icon: Clock }
	];

	// Real confirmed pipeline orders (excluding soft-deleted / trashed orders)
	let orderListOrders = $derived(
		(data.orders || []).filter((o: any) =>
			!o.isTrashed &&
			[
				'confirmed',
				'processing',
				'printed',
				'entry_done',
				'shipped',
				'delivered',
				'partial_delivered',
				'pending_return',
				'returned',
				'cancelled',
				'missing'
			].includes(o.status)
		)
	);

	let filteredOrders = $derived(
		orderListOrders.filter((order: any) => {
			const matchesStatus =
				orderListStatusFilter === 'all' ? true : order.status === orderListStatusFilter;

			const matchesSearch =
				orderSearchQuery === ''
					? true
					: (order.orderNumber || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.id || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.customerName || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.customerPhone || '').includes(orderSearchQuery) ||
						(order.customerEmail || '').includes(orderSearchQuery) ||
						(order.trackingCode || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.shippingAddress || '').toLowerCase().includes(orderSearchQuery.toLowerCase());

			return matchesStatus && matchesSearch;
		})
	);

	let statusCounts = $derived.by(() => {
		const map: Record<string, number> = {
			all: orderListOrders.length
		};
		ORDER_LIST_STATUS_TABS.forEach((tab) => {
			if (tab.id === 'all') return;
			map[tab.id] = orderListOrders.filter((o: any) => o.status === tab.id).length;
		});
		return map;
	});

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

	function parseItems(itemsJson: any) {
		if (Array.isArray(itemsJson)) return itemsJson;
		try {
			return JSON.parse(itemsJson || '[]');
		} catch {
			return [];
		}
	}

	function copyToClipboard(text: string) {
		if (typeof navigator !== 'undefined') {
			navigator.clipboard.writeText(text);
			showToast(`কপি করা হয়েছে: ${text}`);
		}
	}

	function handlePrint() {
		if (typeof window !== 'undefined') {
			window.print();
		}
	}

	let printableOrders = $derived(
		selectedOrderIds.length > 0
			? orderListOrders.filter((o: any) => selectedOrderIds.includes(o.id))
			: filteredOrders
	);
</script>

<svelte:head>
	<title>Order List | AURA Control Deck</title>
</svelte:head>

<div class="space-y-6">

	<!-- Screen View (Hidden when printing) -->
	<div class="print:hidden space-y-6">

		<!-- Header with Actions -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
			<div>
				<div class="flex items-center gap-3">
					<h1 class="text-2xl font-black text-slate-900 tracking-tight">Order List</h1>
					<Badge variant="purple" class="px-2.5 py-0.5 text-xs font-bold">
						{orderListOrders.length} টি কনফার্মড অর্ডার
					</Badge>
				</div>
				<p class="text-xs text-slate-500 mt-1">
					কনফার্মড অর্ডার তালিকা, বাল্ক কুরিয়ার এন্ট্রি ও ইনভয়েস প্রিন্ট
				</p>
			</div>

			<!-- Action Buttons -->
			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					class="gap-1.5 shadow-2xs font-bold text-xs"
					onclick={handlePrint}
				>
					<Printer class="w-4 h-4" />
					<span>ইনভয়েস প্রিন্ট {selectedOrderIds.length > 0 ? `(${selectedOrderIds.length})` : ''}</span>
				</Button>
			</div>
		</div>

		<!-- Scrollable Status Tabs with Wheel & Button Navigation -->
		<ScrollableStatusTabs
			tabs={ORDER_LIST_STATUS_TABS}
			activeTab={orderListStatusFilter}
			counts={statusCounts}
			onSelectTab={(newTab) => (orderListStatusFilter = newTab)}
		/>

		<!-- Bulk Selection Toolbar (Appears when items are checked) -->
		{#if selectedOrderIds.length > 0}
			<div class="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
				<div class="flex items-center gap-2 text-indigo-950 font-bold">
					<CheckCircle2 class="w-4 h-4 text-indigo-600" />
					<span>{selectedOrderIds.length} টি অর্ডার নির্বাচন করা হয়েছে</span>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<!-- Bulk Courier Book -->
					<form action="?/bulkBookCourier" method="POST" use:enhance class="inline">
						<input type="hidden" name="orderIds" value={JSON.stringify(selectedOrderIds)} />
						<input type="hidden" name="provider" value="Steadfast" />
						<Button
							type="submit"
							size="sm"
							class="gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 text-xs font-bold"
						>
							<Truck class="w-3.5 h-3.5" />
							<span>Steadfast কুরিয়ার বুক ({selectedOrderIds.length})</span>
						</Button>
					</form>

					<!-- Bulk Status Update -->
					<form action="?/bulkUpdateStatus" method="POST" use:enhance class="flex items-center gap-1.5">
						<input type="hidden" name="orderIds" value={JSON.stringify(selectedOrderIds)} />
						<select
							name="status"
							bind:value={selectedBulkStatus}
							class="text-xs font-bold rounded-xl border border-indigo-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#5845eb]"
						>
							<option value="confirmed">কনফার্মড</option>
							<option value="processing">প্রসেসিং</option>
							<option value="printed">প্রিন্টেড</option>
							<option value="entry_done">এন্ট্রি ডান</option>
							<option value="shipped">শিপড</option>
							<option value="delivered">ডেলিভারড</option>
							<option value="cancelled">বাতিল</option>
						</select>
						<Button type="submit" size="sm" variant="outline" class="text-xs font-bold">
							স্ট্যাটাস পরিবর্তন
						</Button>
					</form>

					<!-- Bulk Delete to Trash -->
					<form
						action="?/bulkDeleteOrders"
						method="POST"
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') {
									toast.success(`${selectedOrderIds.length} টি অর্ডার ট্র্যাশে সরানো হয়েছে!`);
									selectedOrderIds = [];
								}
								await update();
							};
						}}
						use:confirmSubmit={() => ({
							title: 'নির্বাচিত অর্ডার ট্র্যাশে পাঠান',
							message: `আপনি কি নির্বাচিত ${selectedOrderIds.length} টি অর্ডার ট্র্যাশে পাঠাতে চান?`,
							confirmText: 'হ্যাঁ, ট্র্যাশে পাঠান',
							variant: 'destructive',
							icon: 'trash'
						})}
						class="inline"
					>
						<input type="hidden" name="orderIds" value={JSON.stringify(selectedOrderIds)} />
						<Button type="submit" size="sm" variant="ghost" class="text-rose-600 hover:bg-rose-100 text-xs font-bold gap-1 cursor-pointer">
							<Trash2 class="w-3.5 h-3.5" />
							<span>ট্র্যাশে পাঠান</span>
						</Button>
					</form>

					<Button
						variant="ghost"
						size="sm"
						onclick={() => (selectedOrderIds = [])}
						class="text-xs text-slate-500 font-bold"
					>
						বাতিল
					</Button>
				</div>
			</div>
		{/if}

		<!-- Table Card -->
		<Card class="overflow-hidden border-slate-200/90 shadow-xs">
			<!-- Search Filter Bar -->
			<div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
				<div class="relative w-full max-w-sm">
					<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
					<Input
						type="text"
						bind:value={orderSearchQuery}
						placeholder="অর্ডার আইডি, কাস্টমার, ফোন বা ট্র্যাকিং..."
						class="pl-10 text-xs rounded-xl"
					/>
				</div>
				<span class="text-xs text-slate-500 font-medium whitespace-nowrap">
					মোট <span class="font-bold text-slate-900">{filteredOrders.length}</span> টি অর্ডার প্রদর্শিত
				</span>
			</div>

			<!-- Orders Table -->
			<div class="overflow-x-auto min-h-[240px]">
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
							<th class="py-3.5 px-4">অর্ডার নং</th>
							<th class="py-3.5 px-4">কাস্টমার তথ্য</th>
							<th class="py-3.5 px-4">লোকেশন</th>
							<th class="py-3.5 px-4">পণ্য ও পরিমাণ</th>
							<th class="py-3.5 px-4">মোট বিল</th>
							<th class="py-3.5 px-4">কুরিয়ার ট্র্যাকিং</th>
							<th class="py-3.5 px-4">স্ট্যাটাস</th>
							<th class="py-3.5 px-4">সোর্স</th>
							<th class="py-3.5 px-4 text-right">অ্যাকশন</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#if filteredOrders.length === 0}
							<tr>
								<td colspan="10" class="py-12 text-center text-slate-400">
									কোনো অর্ডার খুঁজে পাওয়া যায়নি
								</td>
							</tr>
						{:else}
							{#each filteredOrders as order}
								{@const isSelected = selectedOrderIds.includes(order.id)}
								{@const items = parseItems(order.items)}
								{@const phone = order.customerPhone || order.customerEmail || ''}
								{@const cleanDigits = (phone || '').replace(/\D/g, '')}
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

									<!-- Order Number & Link -->
									<td class="py-4 px-4 font-mono font-bold text-slate-900">
										<a
											href="/admin/orders/{order.orderNumber || order.id}"
											class="text-[#5845eb] hover:underline hover:text-indigo-800 transition-colors flex items-center gap-1"
											title="বিস্তারিত দেখুন ও সম্পাদনা করুন"
										>
											<span>{order.orderNumber ? (order.orderNumber.startsWith('#') ? order.orderNumber : '#' + order.orderNumber) : '#' + order.id.slice(0, 8)}</span>
											<ExternalLink class="w-3 h-3 opacity-60" />
										</a>
										<span class="text-[10px] text-slate-400 font-sans block mt-0.5">
											{order.createdAt ? new Date(order.createdAt).toLocaleDateString('bn-BD') : 'আজ'}
										</span>
									</td>

									<!-- Customer Info with 1-Click Call, WhatsApp & Copy Actions -->
									<td class="py-4 px-4 min-w-[170px] max-w-[200px]">
										<div class="font-bold text-slate-900 text-sm truncate">{order.customerName}</div>
										
										<div class="flex items-center gap-1.5 mt-1">
											<!-- Direct Dial Link -->
											<a
												href="tel:{phone}"
												class="text-[#5845eb] hover:text-indigo-800 hover:underline font-mono font-bold text-xs shrink-0"
												title="সরাসরি ডায়াল করুন: {phone}"
											>
												{phone}
											</a>

											<!-- 1-Click Call Button -->
											<a
												href="tel:{phone}"
												class="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 flex items-center justify-center transition-colors shadow-2xs shrink-0"
												title="কাস্টমারকে সরাসরি কল দিন"
											>
												<PhoneCall class="w-3 h-3" />
											</a>

											<!-- WhatsApp Quick Message Button -->
											{#if cleanDigits}
												<a
													href="https://wa.me/{cleanDigits.startsWith('88') ? cleanDigits : '88' + cleanDigits}?text={encodeURIComponent(`আসসালামু আলাইকুম ${order.customerName || ''}, আপনার অর্ডারের (${order.orderNumber || ''}) ডেলিভারি সংক্রান্ত বিষয়ে যোগাযোগ করছি।`)}"
													target="_blank"
													rel="noopener noreferrer"
													class="w-6 h-6 rounded-md bg-green-50 text-green-600 hover:bg-green-600 hover:text-white border border-green-200 flex items-center justify-center transition-colors shadow-2xs shrink-0"
													title="WhatsApp-এ মেসেজ পাঠান"
												>
													<MessageSquare class="w-3 h-3" />
												</a>
											{/if}

											<!-- Copy Phone Button -->
											<button
												type="button"
												onclick={() => copyToClipboard(phone)}
												class="w-6 h-6 rounded-md bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-800 border border-slate-200 flex items-center justify-center transition-colors shadow-2xs cursor-pointer shrink-0"
												title="নম্বর কপি করুন"
											>
												<Copy class="w-3 h-3" />
											</button>
										</div>
									</td>

									<!-- Location Column -->
									<td class="py-4 px-4 max-w-[190px]">
										<div class="flex items-start gap-1.5">
											<MapPin class="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
											<div class="min-w-0">
												{#if order.deliveryArea === 'inside_dhaka'}
													<span class="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mb-0.5">
														ঢাকা সিটি
													</span>
												{:else if order.deliveryArea === 'outside_dhaka'}
													<span class="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 mb-0.5">
														ঢাকার বাইরে
													</span>
												{:else if order.deliveryArea === 'sub_dhaka'}
													<span class="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 mb-0.5">
														উপশহর
													</span>
												{/if}
												<p class="text-xs text-slate-700 font-medium line-clamp-2 leading-snug" title={order.shippingAddress}>
													{order.shippingAddress || 'ঠিকানা দেওয়া হয়নি'}
												</p>
											</div>
										</div>
									</td>

									<!-- Products with Small Thumbnail Image -->
									<td class="py-4 px-4">
										{#if items.length === 0}
											<span class="text-slate-400 text-xs">আইটেম নেই</span>
										{:else}
											<div class="space-y-1.5">
												{#each items as item}
													<div class="flex items-center gap-2.5">
														<!-- Small Product Thumbnail -->
														<div class="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/90 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
															{#if item.image}
																<img
																	src={item.image}
																	alt={item.name}
																	class="w-full h-full object-cover"
																	onerror={(e) => {
																		(e.target as HTMLElement).style.display = 'none';
																	}}
																/>
															{:else}
																<ShoppingBag class="w-4 h-4 text-slate-400" />
															{/if}
														</div>

														<div class="min-w-0">
															<div class="font-bold text-slate-900 text-xs truncate max-w-[170px]" title={item.name}>
																{item.name || 'পণ্য আইটেম'}
															</div>
															<span class="text-[10px] text-slate-400 font-mono font-medium">
																{item.quantity || 1} টি × ৳{item.price || 0}
															</span>
														</div>
													</div>
												{/each}
											</div>
										{/if}
									</td>

									<!-- Total -->
									<td class="py-4 px-4 font-bold font-mono text-sm text-slate-900">
										৳{(order.total || 0).toLocaleString('en-BD')}
									</td>

									<!-- Courier Tracking / 1-Click Booking -->
									<td class="py-4 px-4">
										{#if order.trackingCode}
											<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
												<Truck class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
												<span class="font-mono">{order.courierProvider || 'Steadfast'}: {order.trackingCode}</span>
												<button
													type="button"
													onclick={() => copyToClipboard(order.trackingCode)}
													class="text-emerald-700 hover:text-emerald-900 ml-0.5"
													title="ট্র্যাকিং কোড কপি করুন"
												>
													<Copy class="w-3 h-3" />
												</button>
											</div>
										{:else}
											<form action="?/bookCourier" method="POST" use:enhance class="inline-block">
												<input type="hidden" name="orderId" value={order.id} />
												<input type="hidden" name="provider" value="Steadfast" />
												<Button
													type="submit"
													size="sm"
													variant="outline"
													class="h-7 text-xs font-bold gap-1 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 border-indigo-200 shadow-2xs"
												>
													<Truck class="w-3.5 h-3.5" />
													<span>কুরিয়ার বুক করুন</span>
												</Button>
											</form>
										{/if}
									</td>

									<!-- Status Dropdown (Real D1 Update) -->
									<td class="py-4 px-4">
										<OrderStatusDropdown
											orderId={order.id}
											status={order.status}
											mode="list"
											onStatusUpdated={(newSt) => showToast(`স্ট্যাটাস পরিবর্তন করে '${newSt}' করা হয়েছে!`)}
										/>
									</td>

									<!-- Source Badge -->
									<td class="py-4 px-4">
										<OrderSourceBadge source={order.source} />
									</td>

									<!-- Actions -->
									<td class="py-4 px-4 text-right">
										<div class="flex items-center justify-end gap-1">
											<!-- View / Edit Details -->
											<Button
												variant="outline"
												size="icon"
												href="/admin/orders/{order.orderNumber || order.id}"
												class="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-slate-200"
												title="সম্পাদনা করুন (বিস্তারিত পেজ)"
											>
												<FileEdit class="w-3.5 h-3.5" />
											</Button>

											<!-- Trash / Delete -->
											<form
												action="?/deleteOrder"
												method="POST"
												use:enhance={() => {
													return async ({ result, update }) => {
														if (result.type === 'success') {
															toast.success('অর্ডারটি সফলভাবে ট্র্যাশে সরানো হয়েছে!');
														}
														await update();
													};
												}}
												use:confirmSubmit={{
													title: 'অর্ডার ট্র্যাশে পাঠান',
													message: 'আপনি কি এই অর্ডারটি ট্র্যাশে পাঠাতে চান?',
													confirmText: 'হ্যাঁ, ট্র্যাশে পাঠান',
													variant: 'destructive',
													icon: 'trash'
												}}
												class="inline"
											>
												<input type="hidden" name="orderId" value={order.id} />
												<Button
													type="submit"
													variant="ghost"
													size="icon"
													class="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
													title="ট্র্যাশে পাঠান"
												>
													<Trash2 class="w-3.5 h-3.5" />
												</Button>
											</form>
										</div>
									</td>

								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</Card>

	</div>

	<!-- Printable Invoices Container (Only visible during @media print) -->
	<div class="hidden print:block font-['Anek_Bangla',sans-serif] text-black">
		{#each printableOrders as order}
			{@const items = parseItems(order.items)}
			<div class="p-6 mb-8 border border-black rounded-lg break-after-page page-break max-w-2xl mx-auto">
				<!-- Header -->
				<div class="flex justify-between items-start border-b border-black pb-4 mb-4">
					<div>
						<h1 class="text-xl font-black">AURA Lifestyle</h1>
						<p class="text-xs text-gray-700">অনলাইন ই-কমার্স ও লাইফস্টাইল স্টোর</p>
						<p class="text-xs text-gray-700">হটলাইন: 01700-000000</p>
					</div>
					<div class="text-right">
						<h2 class="text-lg font-bold font-mono">ইনভয়েস</h2>
						<p class="text-xs font-mono font-bold">{order.orderNumber ? (order.orderNumber.startsWith('#') ? order.orderNumber : '#' + order.orderNumber) : '#' + order.id.slice(0, 8)}</p>
						<p class="text-xs text-gray-700">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('bn-BD') : ''}</p>
					</div>
				</div>

				<!-- Customer & Shipping -->
				<div class="grid grid-cols-2 gap-4 text-xs mb-4 pb-4 border-b border-gray-300">
					<div>
						<p class="font-bold text-gray-900">কাস্টমার তথ্য:</p>
						<p class="font-bold">{order.customerName}</p>
						<p class="font-mono">{order.customerPhone || order.customerEmail}</p>
					</div>
					<div>
						<p class="font-bold text-gray-900">ডেলিভারি ঠিকানা:</p>
						<p>{order.shippingAddress}</p>
						<p class="font-bold mt-1">পেমেন্ট মেথড: ক্যাশ অন ডেলিভারি (COD)</p>
					</div>
				</div>

				<!-- Products Table -->
				<table class="w-full text-xs mb-4 border border-black">
					<thead>
						<tr class="border-b border-black bg-gray-100">
							<th class="p-2 text-left">আইটেম</th>
							<th class="p-2 text-center w-16">পরিমাণ</th>
							<th class="p-2 text-right w-20">মূল্য</th>
							<th class="p-2 text-right w-20">মোট</th>
						</tr>
					</thead>
					<tbody>
						{#each items as item}
							<tr class="border-b border-gray-200">
								<td class="p-2">{item.name || 'পণ্য'}</td>
								<td class="p-2 text-center font-mono">{item.quantity || 1}</td>
								<td class="p-2 text-right font-mono">৳{item.price || 0}</td>
								<td class="p-2 text-right font-mono">৳{(item.price || 0) * (item.quantity || 1)}</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<!-- Financial Breakdown -->
				<div class="flex justify-end text-xs">
					<div class="w-48 space-y-1 text-right">
						<div class="flex justify-between">
							<span>মোট বিল:</span>
							<span class="font-bold font-mono">৳{(order.total || 0).toLocaleString('en-BD')}</span>
						</div>
						<div class="flex justify-between border-t border-black pt-1 font-bold text-sm">
							<span>পরিশোধযোগ্য:</span>
							<span class="font-mono">৳{(order.total || 0).toLocaleString('en-BD')}</span>
						</div>
					</div>
				</div>

				<div class="mt-8 text-center text-[10px] text-gray-500 border-t border-gray-200 pt-2">
					AURA-র সাথে থাকার জন্য ধন্যবাদ! যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন।
				</div>
			</div>
		{/each}
	</div>

</div>
