<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Badge, Input } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import { confirmModal } from '#lib/stores/confirm.svelte';
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
		OrderSourceBadge,
		OrderProductsCell,
		OrderLocationCell
	} from '../_components/orders';

	let { data }: { data: any } = $props();


	let orderSearchQuery = $state('');
	let selectedSourceFilter = $state('all');
	let webStatusFilter = $state('pending');
	let confirmingIds = $state<Record<string, boolean>>({});

	const WEB_ORDER_STATUS_TABS = [
		{ id: 'pending', label: 'পেন্ডিং', icon: Clock },
		{ id: 'incomplete', label: 'ইনকমপ্লিট', icon: AlertTriangle },
		{ id: 'no_response', label: 'নো রেসপন্স', icon: PhoneMissed },
		{ id: 'good_no_response', label: 'গুড বাট নো রেসপন্স', icon: ThumbsUp },
		{ id: 'busy', label: 'বিজি', icon: Phone },
		{ id: 'hold', label: 'হোল্ড', icon: PauseCircle },
		{ id: 'confirmed', label: 'কনফার্মড', icon: CheckCircle2 },
		{ id: 'cancelled', label: 'বাতিল', icon: XCircle },
		{ id: 'all', label: 'সব', icon: Clock }
	];

	let webOrders = $derived(
		(data.orders || []).filter((o: any) =>
			!o.isTrashed &&
			['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold', 'confirmed', 'cancelled'].includes(o.status)
		)
	);

	let filteredWebOrders = $derived(
		webOrders.filter((order: any) => {
			const hasSearch = orderSearchQuery.trim() !== '';

			const matchesStatus =
				hasSearch || webStatusFilter === 'all'
					? true
					: webStatusFilter === 'good_no_response'
						? order.status === 'good_no_response' || order.status === 'no_response_3'
						: order.status === webStatusFilter;

			const matchesSearch =
				!hasSearch
					? true
					: (order.orderNumber || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.id || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.customerName || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.customerPhone || '').includes(orderSearchQuery.trim()) ||
						(order.customerEmail || '').includes(orderSearchQuery.trim());

			const matchesSource =
				selectedSourceFilter === 'all'
					? true
					: (order.source || 'website').toLowerCase().includes(selectedSourceFilter.toLowerCase());

			return matchesStatus && matchesSearch && matchesSource;
		})
	);

	let statusCounts = $derived.by(() => {
		const map: Record<string, number> = { all: webOrders.length };
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

	function parseItems(itemsJson: any) {
		if (Array.isArray(itemsJson)) return itemsJson;
		try { return JSON.parse(itemsJson || '[]'); }
		catch { return []; }
	}

	function copyPhoneNumber(phone: string) {
		if (!phone) return;
		navigator.clipboard?.writeText(phone);
		toast.success(`নম্বর (${phone}) কপি করা হয়েছে!`);
	}

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

	<!-- Header -->
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

	<!-- Scrollable Status Filter Tabs -->
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

				<select
					bind:value={selectedSourceFilter}
					class="h-9 px-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:border-slate-300 focus:outline-none focus:border-[#5845eb] cursor-pointer shrink-0 transition-colors shadow-2xs"
					title="সোর্স অনুযায়ী ফিল্টার করুন"
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
						<th class="py-3.5 px-4 min-w-[150px]">লোকেশন</th>
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
								কোনো অর্ডার খুঁজে পাওয়া যায়নি
							</td>
						</tr>
					{:else}
						{#each filteredWebOrders as order}
							{@const items = parseItems(order.items)}
							{@const phone = order.customerPhone || order.customerEmail || ''}
							{@const cleanDigits = (phone || '').replace(/\D/g, '')}
							<tr class="hover:bg-slate-50/70 transition-colors">

								<!-- Order ID + Relative Time -->
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
										{formatTimeAgo(order.createdAt)}
									</span>
								</td>

								<!-- Customer Info -->
								<td class="py-4 px-4 min-w-[170px] max-w-[200px]">
									<div class="font-bold text-slate-900 text-sm truncate">{order.customerName}</div>
									<div class="flex items-center gap-1.5 mt-1">
										<a
											href="tel:{phone}"
											class="text-[#5845eb] hover:text-indigo-800 hover:underline font-mono font-bold text-xs shrink-0"
											title="সরাসরি ডায়াল করুন: {phone}"
										>
											{phone}
										</a>
										<a
											href="tel:{phone}"
											class="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 flex items-center justify-center transition-colors shadow-2xs shrink-0"
											title="কাস্টমারকে সরাসরি কল দিন"
										>
											<PhoneCall class="w-3 h-3" />
										</a>
										{#if cleanDigits}
											<a
												href="https://wa.me/{cleanDigits.startsWith('88') ? cleanDigits : '88' + cleanDigits}?text={encodeURIComponent(`আসসালামু আলাইকুম ${order.customerName || ''}, আপনার অর্ডারের (${order.orderNumber || ''}) ডেলিভারি সংক্রান্ত বিষয়ে যোগাযোগ করছি।`)}"
												target="_blank"
												rel="noopener noreferrer"
												class="w-6 h-6 rounded-md bg-green-50 text-green-600 hover:bg-green-600 hover:text-white border border-green-200 flex items-center justify-center transition-colors shadow-2xs shrink-0"
												title="WhatsApp-এ মেসেজ পাঠান"
											>
												<MessageSquare class="w-3 h-3" />
											</a>
										{/if}
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

								<!-- Location -->
								<td class="py-4 px-4 min-w-[150px] max-w-[220px]">
									<OrderLocationCell
										shippingAddress={order.shippingAddress}
										deliveryArea={order.deliveryArea}
										orderNumber={order.orderNumber}
										customerName={order.customerName}
										customerPhone={order.customerPhone}
										city={order.city}
										district={order.district}
									/>
								</td>

								<!-- Product -->
								<td class="py-4 px-4 min-w-[190px]">
									<OrderProductsCell
										{items}
										orderNumber={order.orderNumber}
										orderId={order.id}
									/>
								</td>

								<!-- Total -->
								<td class="py-4 px-4 font-bold font-mono text-sm text-slate-900">
									৳{(order.total || 0).toLocaleString('en-US')}
								</td>

								<!-- Status Dropdown -->
								<td class="py-4 px-4">
									<OrderStatusDropdown orderId={order.id} status={order.status} mode="web" />
								</td>

								<!-- Source -->
								<td class="py-4 px-4">
									<OrderSourceBadge source={order.source} />
								</td>

								<!-- Actions -->
								<td class="py-4 px-4 text-right">
									<div class="flex items-center justify-end gap-1.5">
										<!-- Quick Confirm -->
										{#if order.status === 'confirmed'}
											<Badge variant="success" class="text-xs font-bold gap-1 py-1 px-2.5">
												<CheckCircle2 class="w-3.5 h-3.5" />
												<span>কনফার্মড</span>
											</Badge>
										{:else}
											<form
												action="?/quickConfirmOrder"
												method="POST"
												use:enhance={() => {
													confirmingIds[order.id] = true;
													return async ({ result, update }) => {
														await update();
														confirmingIds[order.id] = false;
														if (result.type === 'success') {
															toast.success(`অর্ডার #${order.orderNumber || order.id.slice(0, 8)} কনফার্ম হয়েছে!`, {
																description: 'অর্ডারটি এখন "কনফার্মড" ট্যাবে আছে।',
																action: { label: 'কনফার্মড দেখুন', onClick: () => (webStatusFilter = 'confirmed') }
															});
														} else if (result.type === 'failure') {
															toast.error((result.data as any)?.message || 'কনফার্মেশন ব্যর্থ হয়েছে!');
														}
													};
												}}
												class="inline"
											>
												<input type="hidden" name="orderId" value={order.id} />
												<Button
													type="submit"
													size="sm"
													disabled={confirmingIds[order.id]}
													class="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 text-xs font-bold gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
													title="অর্ডার কনফার্ম করুন"
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

										<!-- Edit / Details -->
										<Button
											variant="outline"
											size="icon"
											href="/admin/orders/{order.id}"
											class="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-slate-200"
											title="সম্পাদনা করুন (বিস্তারিত পেজ)"
										>
											<FileEdit class="w-3.5 h-3.5" />
										</Button>

										<!-- Cancel with confirm -->
										<button
											type="button"
											onclick={async () => {
												const ok = await confirmModal({
													title: 'অর্ডার বাতিল করুন',
													message: `"${order.customerName}" (${order.orderNumber ? '#' + order.orderNumber : ''})-এর অর্ডারটি বাতিল করতে চান?`,
													confirmText: 'হ্যাঁ, বাতিল করুন',
													variant: 'destructive',
													icon: 'trash'
												});
												if (!ok) return;
												const fd = new FormData();
												fd.append('orderId', order.id);
												const res = await fetch('?/quickCancelOrder', {
													method: 'POST',
													headers: { 'x-sveltekit-action': 'true' },
													body: fd
												});
												if (res.ok) {
													toast.success('অর্ডারটি সফলভাবে বাতিল করা হয়েছে!');
													// Reload data
													window.location.reload();
												} else {
													toast.error('বাতিল করা ব্যর্থ হয়েছে!');
												}
											}}
											class="h-8 w-8 rounded-md flex items-center justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
											title="বাতিল করুন"
										>
											<Trash2 class="w-3.5 h-3.5" />
										</button>
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
