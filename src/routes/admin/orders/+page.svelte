<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Badge, Input, Dialog } from '#lib/components/ui';
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
		FileEdit
	} from 'lucide-svelte';

	let { data }: { data: any } = $props();

	let orderSearchQuery = $state('');
	let webStatusFilter = $state('all');
	let activeOrderForEdit = $state<any | null>(null);
	let isEditDialogOpen = $state(false);

	const WEB_ORDER_STATUS_TABS = [
		{ id: 'all', label: 'সব', icon: Clock },
		{ id: 'pending', label: 'পেন্ডিং', icon: Clock },
		{ id: 'incomplete', label: 'ইনকমপ্লিট', icon: AlertTriangle },
		{ id: 'no_response', label: 'নো রেসপন্স', icon: PhoneMissed },
		{ id: 'good_no_response', label: 'গুড বাট নো রেসপন্স', icon: ThumbsUp },
		{ id: 'busy', label: 'বিজি', icon: Phone },
		{ id: 'hold', label: 'হোল্ড', icon: PauseCircle },
		{ id: 'recall', label: 'রি', icon: RotateCcw },
		{ id: 'confirmed', label: 'কনফার্মড', icon: CheckCircle2 },
		{ id: 'cancelled', label: 'বাতিল', icon: XCircle }
	];

	let webOrders = $derived(
		(data.orders || []).filter((o: any) =>
			['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold', 'recall'].includes(o.status)
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
					: (order.id || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.customerName || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
						(order.customerEmail || '').includes(orderSearchQuery);

			return matchesStatus && matchesSearch;
		})
	);

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

	<!-- Status Filter Tabs -->
	<Card class="p-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
		{#each WEB_ORDER_STATUS_TABS as tab}
			<button
				type="button"
				onclick={() => (webStatusFilter = tab.id)}
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer {webStatusFilter === tab.id
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
			>
				<tab.icon class="w-3.5 h-3.5" />
				<span>{tab.label}</span>
				{#if tab.id !== 'all'}
					{@const count = webOrders.filter((o: any) => tab.id === 'good_no_response' ? (o.status === 'good_no_response' || o.status === 'no_response_3') : o.status === tab.id).length}
					{#if count > 0}
						<span class="text-[10px] px-1.5 py-0.2 rounded-full {webStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}">
							{count}
						</span>
					{/if}
				{/if}
			</button>
		{/each}
	</Card>

	<!-- Search & Table Card -->
	<Card class="overflow-hidden">
		<!-- Search Filter Bar -->
		<div class="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
			<div class="relative w-full max-w-sm">
				<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
				<Input
					type="text"
					bind:value={orderSearchQuery}
					placeholder="অর্ডার আইডি, নাম বা ফোন নম্বর খুঁজুন..."
					class="pl-10"
				/>
			</div>
			<span class="text-xs text-slate-500 font-medium whitespace-nowrap">
				মোট <span class="font-bold text-slate-900">{filteredWebOrders.length}</span> টি অর্ডার পাওয়া গেছে
			</span>
		</div>

		<!-- Table -->
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs text-slate-700">
				<thead class="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
					<tr>
						<th class="py-3.5 px-4">অর্ডার আইডি</th>
						<th class="py-3.5 px-4">কাস্টমার তথ্য</th>
						<th class="py-3.5 px-4">পণ্য ও পরিমাণ</th>
						<th class="py-3.5 px-4">মোট বিল</th>
						<th class="py-3.5 px-4">বর্তমান স্ট্যাটাস</th>
						<th class="py-3.5 px-4 text-right">অ্যাকশন</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#if filteredWebOrders.length === 0}
						<tr>
							<td colspan="6" class="py-12 text-center text-slate-400">
								কোনো অর্ডার খুঁজে পাওয়া যায়নি
							</td>
						</tr>
					{:else}
						{#each filteredWebOrders as order}
							{@const items = parseItems(order.items)}
							<tr class="hover:bg-slate-50/70 transition-colors">
								
								<!-- 1. Order ID -->
								<td class="py-4 px-4 font-mono font-bold text-slate-900">
									<div class="flex items-center gap-1.5">
										<span class="text-[#5845eb]">#{order.id}</span>
									</div>
									<span class="text-[10px] text-slate-400 font-sans block mt-0.5">
										{order.createdAt ? new Date(order.createdAt).toLocaleDateString('bn-BD') : 'আজ'}
									</span>
								</td>

								<!-- 2. Customer Info -->
								<td class="py-4 px-4 max-w-[200px]">
									<div class="font-bold text-slate-900 text-sm truncate">{order.customerName}</div>
									<div class="text-slate-500 font-mono mt-0.5">{order.customerEmail}</div>
									<div class="text-[11px] text-slate-400 truncate mt-0.5">{order.shippingAddress}</div>
								</td>

								<!-- 3. Product Info -->
								<td class="py-4 px-4">
									{#each items as item}
										<div class="font-semibold text-slate-800 truncate max-w-[180px]">
											{item.name || 'AURA Spectrum X'}
										</div>
										<span class="text-[10px] text-slate-400">পরিমাণ: {item.quantity || 1} টি</span>
									{/each}
								</td>

								<!-- 4. Total -->
								<td class="py-4 px-4 font-bold font-mono text-sm text-slate-900">
									৳{(order.total || 0).toLocaleString('en-US')}
								</td>

								<!-- 5. Status Badge -->
								<td class="py-4 px-4">
									<form action="?/updateOrderStatus" method="POST" use:enhance class="inline-block">
										<input type="hidden" name="orderId" value={order.id} />
										<select
											name="status"
											value={order.status}
											onchange={(e) => (e.target as HTMLSelectElement).form?.requestSubmit()}
											class="text-xs font-bold rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-800 focus:outline-none focus:border-[#5845eb] shadow-2xs cursor-pointer"
										>
											<option value="pending">পেন্ডিং</option>
											<option value="incomplete">ইনকমপ্লিট</option>
											<option value="no_response">নো রেসপন্স</option>
											<option value="good_no_response">গুড বাট নো রেসপন্স</option>
											<option value="busy">বিজি</option>
											<option value="hold">হোল্ড</option>
											<option value="recall">রি</option>
											<option value="confirmed">কনফার্মড</option>
											<option value="cancelled">বাতিল</option>
										</select>
									</form>
								</td>

								<!-- 6. Actions -->
								<td class="py-4 px-4 text-right">
									<div class="flex items-center justify-end gap-1.5">
										<!-- Quick Confirm Button -->
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

										<!-- Call Button -->
										<Button
											variant="outline"
											size="icon"
											href="tel:{order.customerEmail}"
											class="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
											title="কল করুন"
										>
											<PhoneCall class="w-3.5 h-3.5" />
										</Button>

										<!-- Quick Edit Dialog Trigger -->
										<Button
											variant="outline"
											size="icon"
											onclick={() => openEditModal(order)}
											class="h-8 w-8"
											title="সম্পাদনা করুন"
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
