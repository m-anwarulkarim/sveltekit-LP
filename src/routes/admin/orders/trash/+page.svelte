<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Badge, Input } from '#lib/components/ui';
	import {
		Search,
		Trash2,
		RotateCcw,
		AlertTriangle,
		ArrowRight
	} from 'lucide-svelte';

	let { data }: { data: any } = $props();

	let searchQuery = $state('');

	let trashedOrders = $derived(
		(data.orders || []).filter((o: any) => o.status === 'cancelled')
	);

	let filteredOrders = $derived(
		trashedOrders.filter((order: any) => {
			if (searchQuery === '') return true;
			const q = searchQuery.toLowerCase();
			return (
				(order.id || '').toLowerCase().includes(q) ||
				(order.customerName || '').toLowerCase().includes(q) ||
				(order.customerEmail || '').includes(q)
			);
		})
	);

	let totalTrashedAmount = $derived(
		trashedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
	);
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
				বাতিলকৃত বা মুছে ফেলা অর্ডারসমূহ। যেকোনো সময় রিস্টোর বা স্থায়ীভাবে মুছে ফেলতে পারেন।
			</p>
		</div>

		{#if trashedOrders.length > 0}
			<div class="flex items-center gap-2">
				<form method="POST" action="?/emptyTrash" use:enhance>
					<Button
						type="submit"
						variant="destructive"
						size="sm"
						class="gap-1.5 shadow-2xs text-xs"
						onclick={(e: MouseEvent) => {
							if (!confirm('আপনি কি নিশ্চিত যে সমস্ত ট্র্যাশ অর্ডার স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না!')) {
								e.preventDefault();
							}
						}}
					>
						<Trash2 class="w-4 h-4" />
						<span>ট্র্যাশ খালি করুন</span>
					</Button>
				</form>
			</div>
		{/if}
	</div>

	<!-- Stats Summary Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
		<Card class="p-4 bg-white border-slate-200/90 shadow-2xs flex items-center justify-between">
			<div>
				<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট বাতিলকৃত অর্ডার</div>
				<div class="text-2xl font-black text-rose-600 mt-0.5">{trashedOrders.length} টি</div>
			</div>
			<div class="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
				<Trash2 class="w-5 h-5" />
			</div>
		</Card>

		<Card class="p-4 bg-white border-slate-200/90 shadow-2xs flex items-center justify-between">
			<div>
				<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">বাতিল অর্ডারের মোট মূল্য</div>
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
				placeholder="অর্ডার আইডি, কাস্টমার নাম বা ফোন দিয়ে খুঁজুন..."
				bind:value={searchQuery}
				class="pl-10 h-10 text-xs bg-slate-50/50 border-slate-200/80 focus:bg-white"
			/>
		</div>
	</Card>

	<!-- Orders Table Card -->
	<Card class="bg-white border-slate-200/90 shadow-2xs overflow-hidden">
		{#if filteredOrders.length === 0}
			<div class="text-center py-16 px-4">
				<div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400">
					<Trash2 class="w-7 h-7" />
				</div>
				<h3 class="text-base font-bold text-slate-800">ট্র্যাশ সম্পূর্ণ খালি</h3>
				<p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
					বর্তমানে কোনো বাতিল বা মোছা অর্ডার ট্র্যাশে নেই। আপনার অর্ডার প্রক্রিয়া সম্পূর্ণ ক্লিন!
				</p>
				<div class="mt-4">
					<Button size="sm" variant="outline" href="/admin/orders" class="gap-1.5">
						<span>Web Orders এ ফিরে যান</span>
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
							<th class="py-3 px-4">প্রোডাক্ট</th>
							<th class="py-3 px-4 text-right">টাকা</th>
							<th class="py-3 px-4 text-center">স্ট্যাটাস</th>
							<th class="py-3 px-4 text-right">অ্যাকশন</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each filteredOrders as order (order.id)}
							<tr class="hover:bg-slate-50/60 transition-colors">
								<td class="py-3.5 px-4 font-mono font-bold text-slate-900">
									<div class="text-rose-600">#{order.id}</div>
									<div class="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
										{new Date(order.createdAt).toLocaleDateString('bn-BD')}
									</div>
								</td>

								<td class="py-3.5 px-4">
									<div class="font-bold text-slate-900">{order.customerName}</div>
									<div class="text-slate-500 font-mono mt-0.5">{order.customerEmail}</div>
									<div class="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">{order.shippingAddress}</div>
								</td>

								<td class="py-3.5 px-4">
									{#if order.items}
										{#each JSON.parse(order.items || '[]') as item}
											<div class="font-medium text-slate-800">{item.name || 'AURA Product'}</div>
											<div class="text-[11px] text-slate-400">Qty: {item.quantity || 1}</div>
										{/each}
									{:else}
										<span class="text-slate-400">AURA Spectrum X</span>
									{/if}
								</td>

								<td class="py-3.5 px-4 text-right font-black text-slate-900 font-mono text-sm">
									৳ {(order.total || 0).toLocaleString('en-US')}
								</td>

								<td class="py-3.5 px-4 text-center">
									<Badge variant="destructive" class="text-[10px] px-2 py-0.5">
										বাতিল / ট্র্যাশ
									</Badge>
								</td>

								<td class="py-3.5 px-4 text-right">
									<div class="flex items-center justify-end gap-2">
										<!-- Restore Action -->
										<form method="POST" action="?/restoreOrder" use:enhance>
											<input type="hidden" name="orderId" value={order.id} />
											<Button
												type="submit"
												size="sm"
												variant="outline"
												class="h-8 px-2.5 text-xs gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
												title="পুনরায় অর্ডারে ফিরিয়ে নিন"
											>
												<RotateCcw class="w-3.5 h-3.5" />
												<span>রিস্টোর</span>
											</Button>
										</form>

										<!-- Permanent Delete Action -->
										<form method="POST" action="?/permanentDeleteOrder" use:enhance>
											<input type="hidden" name="orderId" value={order.id} />
											<Button
												type="submit"
												size="sm"
												variant="ghost"
												class="h-8 px-2 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50"
												title="স্থায়ীভাবে মুছুন"
												onclick={(e: MouseEvent) => {
													if (!confirm('অর্ডারটি কি স্থায়ীভাবে মুছে ফেলতে চান?')) {
														e.preventDefault();
													}
												}}
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
