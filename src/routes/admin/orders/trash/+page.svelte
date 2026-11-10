<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Badge, Input, confirmSubmit } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import {
		Search,
		Trash2,
		RotateCcw,
		AlertTriangle,
		ArrowRight,
		X
	} from 'lucide-svelte';
	import OrderProductsCell from '../../_components/orders/OrderProductsCell.svelte';

	let { data }: { data: any } = $props();

	let searchQuery = $state('');
	let isEmptyingTrash = $state(false);
	let restoringIds = $state<Record<string, boolean>>({});
	let deletingIds = $state<Record<string, boolean>>({});

	function parseOrderItems(itemsJson: any): any[] {
		if (Array.isArray(itemsJson)) return itemsJson;
		try {
			return JSON.parse(itemsJson || '[]');
		} catch {
			return [];
		}
	}

	let trashedOrders = $derived(data.orders || []);

	let filteredOrders = $derived(
		trashedOrders.filter((order: any) => {
			if (searchQuery === '') return true;
			const q = searchQuery.toLowerCase().trim();
			return (
				(order.orderNumber || '').toLowerCase().includes(q) ||
				(order.id || '').toLowerCase().includes(q) ||
				(order.customerName || '').toLowerCase().includes(q) ||
				(order.customerPhone || '').includes(q) ||
				(order.customerEmail || '').includes(q)
			);
		})
	);

	let totalTrashedAmount = $derived(
		trashedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
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

	<!-- Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2.5">
				<h1 class="text-2xl font-black text-slate-900 tracking-tight">Trash</h1>
				<Badge variant="destructive" class="px-2.5 py-0.5 text-xs font-bold">
					{trashedOrders.length} টি
				</Badge>
			</div>
			<p class="text-xs text-slate-500 mt-1">
				ট্র্যাশে পাঠানো অর্ডারসমূহ — যেকোনো সময় রিস্টোর বা স্থায়ীভাবে মুছে ফেলতে পারেন।
			</p>
		</div>

		{#if trashedOrders.length > 0}
			<form
				method="POST"
				action="?/emptyTrash"
				use:enhance={() => {
					isEmptyingTrash = true;
					return async ({ result, update }) => {
						await update();
						isEmptyingTrash = false;
						if (result.type === 'success') {
							toast.success('ট্র্যাশ সম্পূর্ণ খালি করা হয়েছে!');
						} else if (result.type === 'failure') {
							toast.error((result.data as any)?.message || 'ট্র্যাশ খালি করতে সমস্যা হয়েছে!');
						}
					};
				}}
				use:confirmSubmit={() => ({
					title: 'ট্র্যাশ খালি নিশ্চিতকরণ',
					message: 'আপনি কি নিশ্চিত যে সমস্ত ট্র্যাশ অর্ডার স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না!',
					confirmText: 'হ্যাঁ, সম্পূর্ণ খালি করুন',
					variant: 'destructive',
					icon: 'trash'
				})}
			>
				<Button
					type="submit"
					variant="destructive"
					size="sm"
					disabled={isEmptyingTrash}
					class="gap-1.5 shadow-2xs text-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
				>
					{#if isEmptyingTrash}
						<span class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block"></span>
						<span>মুছছে...</span>
					{:else}
						<Trash2 class="w-4 h-4" />
						<span>ট্র্যাশ খালি করুন</span>
					{/if}
				</Button>
			</form>
		{/if}
	</div>

	<!-- Stats Summary Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
		<Card class="p-4 bg-white border-slate-200/90 shadow-2xs flex items-center justify-between">
			<div>
				<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট ট্র্যাশ অর্ডার</div>
				<div class="text-2xl font-black text-rose-600 mt-0.5">{trashedOrders.length} টি</div>
			</div>
			<div class="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
				<Trash2 class="w-5 h-5" />
			</div>
		</Card>

		<Card class="p-4 bg-white border-slate-200/90 shadow-2xs flex items-center justify-between">
			<div>
				<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ট্র্যাশ অর্ডারের মোট মূল্য</div>
				<div class="text-2xl font-black text-slate-700 mt-0.5">৳ {totalTrashedAmount.toLocaleString('en-US')}</div>
			</div>
			<div class="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
				<AlertTriangle class="w-5 h-5" />
			</div>
		</Card>
	</div>

	<!-- Search Bar -->
	<Card class="p-3 bg-white border-slate-200/90 shadow-2xs">
		<div class="relative max-w-md">
			<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
			<Input
				type="text"
				placeholder="অর্ডার আইডি, কাস্টমার নাম বা ফোন দিয়ে খুঁজুন..."
				bind:value={searchQuery}
				class="pl-10 h-10 text-xs bg-slate-50/50 border-slate-200/80 focus:bg-white"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => (searchQuery = '')}
					class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
					aria-label="Clear search"
				>
					<X class="w-3.5 h-3.5" />
				</button>
			{/if}
		</div>
	</Card>

	<!-- Orders Table Card -->
	<Card class="bg-white border-slate-200/90 shadow-2xs overflow-hidden">
		{#if filteredOrders.length === 0}
			<div class="text-center py-16 px-4">
				<div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400">
					<Trash2 class="w-7 h-7" />
				</div>
				<h3 class="text-base font-bold text-slate-800">
					{trashedOrders.length === 0 ? 'ট্র্যাশ সম্পূর্ণ খালি' : 'কিছু পাওয়া যায়নি'}
				</h3>
				<p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
					{trashedOrders.length === 0
						? 'কোনো অর্ডার ট্র্যাশে নেই। আপনার অর্ডার তালিকা সম্পূর্ণ ক্লিন!'
						: 'অন্য কি-ওয়ার্ড দিয়ে সার্চ করুন।'}
				</p>
				{#if trashedOrders.length === 0}
					<div class="mt-4">
						<Button size="sm" variant="outline" href="/admin/orders" class="gap-1.5">
							<span>Web Orders এ ফিরে যান</span>
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
							<th class="py-3 px-4">প্রোডাক্ট</th>
							<th class="py-3 px-4 text-right">টাকা</th>
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
										class="text-rose-600 hover:text-rose-800 hover:underline font-mono font-bold"
										title="অর্ডার বিস্তারিত দেখুন"
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
									{#if phone}
										<div class="text-slate-500 font-mono mt-0.5">{phone}</div>
									{/if}
									{#if order.shippingAddress}
										<div class="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
											{order.shippingAddress}
										</div>
									{/if}
								</td>

								<td class="py-3.5 px-4 min-w-[190px]">
									<OrderProductsCell
										items={parsedItems}
										orderNumber={order.orderNumber}
										orderId={order.id}
									/>
								</td>

								<td class="py-3.5 px-4 text-right font-black text-slate-900 font-mono text-sm">
									৳ {(order.total || 0).toLocaleString('en-US')}
								</td>

								<td class="py-3.5 px-4 text-center">
									{#if order.isTrashed}
										<Badge variant="destructive" class="text-[10px] px-2 py-0.5">
											ট্র্যাশ
										</Badge>
									{:else if order.status === 'cancelled'}
										<Badge variant="outline" class="text-[10px] px-2 py-0.5 border-rose-200 text-rose-600 bg-rose-50">
											বাতিল
										</Badge>
									{:else if order.status === 'refunded'}
										<Badge variant="outline" class="text-[10px] px-2 py-0.5 border-amber-200 text-amber-600 bg-amber-50">
											রিফান্ড
										</Badge>
									{:else}
										<Badge variant="destructive" class="text-[10px] px-2 py-0.5">
											ট্র্যাশ
										</Badge>
									{/if}
								</td>

								<td class="py-3.5 px-4 text-right">
									<div class="flex items-center justify-end gap-2">

										<!-- Restore Action -->
										<form
											method="POST"
											action="?/restoreOrder"
											use:enhance={() => {
												restoringIds[order.id] = true;
												return async ({ result, update }) => {
													await update();
													restoringIds[order.id] = false;
													if (result.type === 'success') {
														toast.success('অর্ডারটি সফলভাবে রিস্টোর করা হয়েছে!');
													} else if (result.type === 'failure') {
														toast.error((result.data as any)?.message || 'রিস্টোর করতে সমস্যা হয়েছে!');
													}
												};
											}}
										>
											<input type="hidden" name="orderId" value={order.id} />
											<Button
												type="submit"
												size="sm"
												variant="outline"
												disabled={restoringIds[order.id]}
												class="h-8 px-2.5 text-xs gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed"
												title="পুনরায় অর্ডারে ফিরিয়ে নিন"
											>
												{#if restoringIds[order.id]}
													<span class="w-3.5 h-3.5 border-2 border-indigo-300 border-t-indigo-700 rounded-full animate-spin inline-block"></span>
												{:else}
													<RotateCcw class="w-3.5 h-3.5" />
												{/if}
												<span>{restoringIds[order.id] ? 'হচ্ছে...' : 'রিস্টোর'}</span>
											</Button>
										</form>

										<!-- Permanent Delete Action -->
										<form
											method="POST"
											action="?/permanentDeleteOrder"
											use:enhance={() => {
												deletingIds[order.id] = true;
												return async ({ result, update }) => {
													if (result.type === 'success') {
														toast.success('অর্ডারটি স্থায়ীভাবে মুছে ফেলা হয়েছে!');
													} else if (result.type === 'failure') {
														toast.error((result.data as any)?.message || 'মুছতে সমস্যা হয়েছে!');
													}
													deletingIds[order.id] = false;
													await update();
												};
											}}
											use:confirmSubmit={() => ({
												title: 'স্থায়ীভাবে মুছুন',
												message: 'অর্ডারটি কি স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না!',
												confirmText: 'হ্যাঁ, স্থায়ীভাবে মুছুন',
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
												class="h-8 px-2 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
												title="স্থায়ীভাবে মুছুন"
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
