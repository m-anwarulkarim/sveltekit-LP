<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Badge, Input, Dialog } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import {
		Search,
		PlusCircle,
		PhoneCall,
		CheckCircle2,
		XCircle,
		Clock,
		AlertTriangle,
		PhoneMissed,
		ThumbsUp,
		Phone,
		PauseCircle,
		RotateCcw,
		Trash2,
		FileEdit,
		ShoppingBag,
		Copy,
		MessageSquare,
		MapPin
	} from 'lucide-svelte';
	import {
		OrderStatusDropdown,
		ScrollableStatusTabs,
		OrderSourceBadge
	} from '../_components/orders';

	let { data }: { data: any } = $props();

	let orderSearchQuery = $state('');
	let selectedSourceFilter = $state('all');
	let webStatusFilter = $state('pending');
	let activeOrderForEdit = $state<any | null>(null);
	let isEditDialogOpen = $state(false);

	const WEB_ORDER_STATUS_TABS = [
		{ id: 'pending', label: 'পেন্ডিং', icon: Clock },
		{ id: 'incomplete', label: 'ইনকমপ্লিট', icon: AlertTriangle },
		{ id: 'no_response', label: 'নো রেসপন্স', icon: PhoneMissed },
		{ id: 'good_no_response', label: 'গুড বাট নো রেসপন্স', icon: ThumbsUp },
		{ id: 'busy', label: 'বিজি', icon: Phone },
		{ id: 'hold', label: 'হোল্ড', icon: PauseCircle },
		{ id: 'recall', label: 'রি-কল', icon: RotateCcw },
		{ id: 'confirmed', label: 'কনফার্মড', icon: CheckCircle2 },
		{ id: 'cancelled', label: 'বাতিল', icon: XCircle },
		{ id: 'all', label: 'সব', icon: Clock }
	];

	let webOrders = $derived(
		(data.orders || []).filter((o: any) =>
			!o.isTrashed &&
			['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold', 'recall', 'confirmed', 'cancelled'].includes(o.status)
		)
	);

	let filteredWebOrders = $derived(
		webOrders.filter((order: any) => {
			const matchesStatus =
				webStatusFilter === 'all'
					? true
					: webStatusFilter === 'good_no_response'
						? order.status === 'good_no_response' || order.status === 'no_response_3'
						: order.status === webStatusFilter;

			const matchesSearch =
				orderSearchQuery === ''
					? true
					: (order.orderNumber || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.id || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.customerName || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.customerPhone || '').includes(orderSearchQuery) ||
						(order.customerEmail || '').includes(orderSearchQuery);

			const matchesSource =
				selectedSourceFilter === 'all'
					? true
					: (order.source || 'website').toLowerCase().includes(selectedSourceFilter.toLowerCase());

			return matchesStatus && matchesSearch && matchesSource;
		})
	);

	let statusCounts = $derived.by(() => {
		const map: Record<string, number> = {
			all: webOrders.length
		};
		WEB_ORDER_STATUS_TABS.forEach((tab) => {
			if (tab.id === 'all') return;
			if (tab.id === 'good_no_response') {
				map[tab.id] = webOrders.filter((o: any) => o.status === 'good_no_response' || o.status === 'no_response_3').length;
			} else {
				map[tab.id] = webOrders.filter((o: any) => o.status === tab.id).length;
			}
		});
		return map;
	});

	function openEditModal(order: any) {
		activeOrderForEdit = { ...order };
		isEditDialogOpen = true;
	}

	function parseItems(itemsJson: any) {
		if (Array.isArray(itemsJson)) return itemsJson;
		try {
			return JSON.parse(itemsJson || '[]');
		} catch {
			return [];
		}
	}

	function copyPhoneNumber(phone: string) {
		if (!phone) return;
		navigator.clipboard?.writeText(phone);
		toast.success(`নম্বর (${phone}) কপি করা হয়েছে!`);
	}
</script>

<div class="space-y-6">

	<!-- Header with Action -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
		<div>
			<div class="flex items-center gap-3">
				<h1 class="text-2xl font-black text-slate-900 tracking-tight">Web Orders</h1>
				<Badge variant="purple" class="px-2.5 py-0.5 text-xs">
					{webOrders.length} টি নতুন অর্ডার
				</Badge>
			</div>
			<p class="text-xs text-slate-500 mt-1">
				ল্যান্ডিং পেজ থেকে আসা লাইভ কাস্টমার অর্ডারসমূহ কনফার্ম বা কল শিডিউল করুন
			</p>
		</div>

		<div class="flex items-center gap-2">
			<Button href="/admin/orders/new" class="gap-1.5 shadow-md shadow-indigo-600/20">
				<PlusCircle class="w-4 h-4" />
				<span>নতুন অর্ডার তৈরি</span>
			</Button>
		</div>
	</div>

	<!-- Scrollable Status Filter Tabs with Wheel & Button Navigation -->
	<ScrollableStatusTabs
		tabs={WEB_ORDER_STATUS_TABS}
		activeTab={webStatusFilter}
		counts={statusCounts}
		onSelectTab={(newTab) => (webStatusFilter = newTab)}
	/>

	<!-- Search & Table Card -->
	<Card class="overflow-hidden">
		<!-- Search Filter Bar -->
		<div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
			<div class="flex items-center gap-2.5 flex-1 max-w-lg">
				<div class="relative w-full">
					<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
					<Input
						type="text"
						bind:value={orderSearchQuery}
						placeholder="অর্ডার আইডি, নাম বা ফোন নম্বর খুঁজুন..."
						class="pl-10 h-9 text-xs"
					/>
				</div>

				<!-- Source Filter Selector -->
				<select
					bind:value={selectedSourceFilter}
					class="h-9 px-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:border-slate-300 focus:outline-none focus:border-[#5845eb] cursor-pointer shrink-0 transition-colors shadow-2xs"
					title="সোর্স অনুযায়ী ফিল্টার করুন"
				>
					<option value="all">সব সোর্স</option>
					<option value="facebook">Facebook</option>
					<option value="website">ওয়েবসাইট (Website)</option>
					<option value="google">Google Search</option>
					<option value="whatsapp">WhatsApp</option>
					<option value="manual">Phone / Manual</option>
				</select>
			</div>

			<span class="text-xs text-slate-500 font-medium whitespace-nowrap">
				মোট <span class="font-bold text-slate-900">{filteredWebOrders.length}</span> টি অর্ডার পাওয়া গেছে
			</span>
		</div>

		<!-- Table -->
		<div class="overflow-x-auto min-h-[240px]">
			<table class="w-full text-left text-xs text-slate-700">
				<thead class="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
					<tr>
						<th class="py-3.5 px-4">অর্ডার আইডি</th>
						<th class="py-3.5 px-4">কাস্টমার তথ্য</th>
						<th class="py-3.5 px-4">লোকেশন</th>
						<th class="py-3.5 px-4">পণ্য ও পরিমাণ</th>
						<th class="py-3.5 px-4">মোট বিল</th>
						<th class="py-3.5 px-4">বর্তমান স্ট্যাটাস</th>
						<th class="py-3.5 px-4">সোর্স</th>
						<th class="py-3.5 px-4 text-right">অ্যাকশন</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#if filteredWebOrders.length === 0}
						<tr>
							<td colspan="8" class="py-12 text-center text-slate-400">
								কোনো অর্ডার খুঁজে পাওয়া যায়নি
							</td>
						</tr>
					{:else}
						{#each filteredWebOrders as order}
							{@const items = parseItems(order.items)}
							{@const phone = order.customerPhone || order.customerEmail || ''}
							{@const cleanDigits = (phone || '').replace(/\D/g, '')}
							<tr class="hover:bg-slate-50/70 transition-colors">
								
								<!-- 1. Order ID (Clean Sequential Display: e.g. #1001) -->
								<td class="py-4 px-4 font-mono font-bold text-slate-900">
									<div class="flex items-center gap-1.5">
										<a
											href="/admin/orders/{order.orderNumber || order.id}"
											class="text-[#5845eb] hover:underline hover:text-indigo-800 transition-colors font-mono font-black text-sm"
											title="বিস্তারিত দেখুন ও সম্পাদনা করুন"
										>
											{order.orderNumber ? (order.orderNumber.startsWith('#') ? order.orderNumber : '#' + order.orderNumber) : '#' + order.id.slice(0, 8)}
										</a>
									</div>
									<span class="text-[10px] text-slate-400 font-sans block mt-0.5">
										{order.createdAt ? new Date(order.createdAt).toLocaleDateString('bn-BD') : 'আজ'}
									</span>
								</td>

								<!-- 2. Customer Info with 1-Click Call, WhatsApp & Copy Actions -->
								<td class="py-4 px-4 min-w-[170px] max-w-[200px]">
									<div class="font-bold text-slate-900 text-sm truncate">{order.customerName}</div>
									
									<div class="flex items-center gap-1.5 mt-1">
										<!-- Clickable Phone Number (Direct Dial) -->
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
											onclick={() => copyPhoneNumber(phone)}
											class="w-6 h-6 rounded-md bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-800 border border-slate-200 flex items-center justify-center transition-colors shadow-2xs cursor-pointer shrink-0"
											title="নম্বর কপি করুন"
										>
											<Copy class="w-3 h-3" />
										</button>
									</div>
								</td>

								<!-- 3. Delivery Location Column -->
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

								<!-- 3. Product Info with Small Thumbnail Image -->
								<td class="py-4 px-4">
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

												<!-- Title & Quantity -->
												<div class="min-w-0">
													<div class="font-bold text-slate-900 text-xs truncate max-w-[170px]" title={item.name}>
														{item.name || 'পণ্য আইটেম'}
													</div>
													<div class="text-[10px] text-slate-400 font-medium">
														পরিমাণ: <span class="font-bold font-mono text-slate-700">{item.quantity || 1}</span> টি
													</div>
												</div>
											</div>
										{/each}
									</div>
								</td>

								<!-- 4. Total -->
								<td class="py-4 px-4 font-bold font-mono text-sm text-slate-900">
									৳{(order.total || 0).toLocaleString('en-US')}
								</td>

								<!-- 5. Status Badge -->
								<td class="py-4 px-4">
									<OrderStatusDropdown orderId={order.id} status={order.status} mode="web" />
								</td>

								<!-- 6. Source Badge (Facebook, Google, Website, etc.) -->
								<td class="py-4 px-4">
									<OrderSourceBadge source={order.source} />
								</td>

								<!-- 7. Actions -->
								<td class="py-4 px-4 text-right">
									<div class="flex items-center justify-end gap-1.5">
										<!-- Quick Confirm Button -->
										{#if order.status === 'confirmed'}
											<Badge variant="success" class="text-xs font-bold gap-1 py-1 px-2.5">
												<CheckCircle2 class="w-3.5 h-3.5" />
												<span>কনফার্মড</span>
											</Badge>
										{:else}
											<form action="?/quickConfirmOrder" method="POST" use:enhance class="inline">
												<input type="hidden" name="orderId" value={order.id} />
												<Button
													type="submit"
													size="sm"
													class="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 text-xs font-bold gap-1"
													title="অর্ডার কনফার্ম করুন"
												>
													<CheckCircle2 class="w-3.5 h-3.5" />
													<span>কনফার্ম</span>
												</Button>
											</form>
										{/if}

										<!-- Go to Dedicated Order Details & Edit Page -->
										<Button
											variant="outline"
											size="icon"
											href="/admin/orders/{order.id}"
											class="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-slate-200"
											title="সম্পাদনা করুন (বিস্তারিত পেজ)"
										>
											<FileEdit class="w-3.5 h-3.5" />
										</Button>

										<!-- Trash/Cancel Button -->
										<form action="?/quickCancelOrder" method="POST" use:enhance class="inline">
											<input type="hidden" name="orderId" value={order.id} />
											<Button
												type="submit"
												variant="ghost"
												size="icon"
												class="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
												title="বাতিল করুন"
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

<!-- Edit Order Dialog (using shadcn Dialog) -->
<Dialog
	bind:open={isEditDialogOpen}
	title="অর্ডার তথ্য সম্পাদনা (#{activeOrderForEdit?.id})"
	description="কাস্টমারের নাম, ফোন নম্বর বা ডেলিভারি ঠিকানা পরিবর্তন করুন"
>
	{#if activeOrderForEdit}
		<form
			action="?/updateOrderStatus"
			method="POST"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					isEditDialogOpen = false;
				};
			}}
			class="space-y-4"
		>
			<input type="hidden" name="orderId" value={activeOrderForEdit.id} />

			<div class="space-y-1.5">
				<label for="edit-name" class="text-xs font-bold text-slate-700">কাস্টমার নাম</label>
				<Input id="edit-name" bind:value={activeOrderForEdit.customerName} />
			</div>

			<div class="space-y-1.5">
				<label for="edit-phone" class="text-xs font-bold text-slate-700">ফোন নম্বর</label>
				<Input id="edit-phone" bind:value={activeOrderForEdit.customerEmail} />
			</div>

			<div class="space-y-1.5">
				<label for="edit-address" class="text-xs font-bold text-slate-700">ডেলিভারি ঠিকানা</label>
				<Input id="edit-address" bind:value={activeOrderForEdit.shippingAddress} />
			</div>

			<div class="space-y-1.5">
				<label for="edit-status" class="text-xs font-bold text-slate-700">অর্ডার স্ট্যাটাস</label>
				<select
					id="edit-status"
					name="status"
					bind:value={activeOrderForEdit.status}
					class="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 focus:outline-none focus:border-[#5845eb]"
				>
					<option value="pending">পেন্ডিং</option>
					<option value="incomplete">ইনকমপ্লিট</option>
					<option value="no_response">নো রেসপন্স</option>
					<option value="good_no_response">গুড বাট নো রেসপন্স</option>
					<option value="busy">বিজি</option>
					<option value="hold">হোল্ড</option>
					<option value="recall">রি</option>
					<option value="processing">প্রসেসিং</option>
					<option value="confirmed">কনফার্মড</option>
					<option value="cancelled">বাতিল</option>
				</select>
			</div>

			<div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
				<Button type="button" variant="outline" onclick={() => (isEditDialogOpen = false)}>
					বাতিল
				</Button>
				<Button type="submit">
					পরিবর্তন সংরক্ষণ করুন
				</Button>
			</div>
		</form>
	{/if}
</Dialog>
