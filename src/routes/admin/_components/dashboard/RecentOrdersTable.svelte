<script lang="ts">
	import { ArrowRight } from 'lucide-svelte';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();

	let webOrders = $derived(
		(data?.orders || []).filter((o: any) =>
			['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold', 'recall'].includes(o.status)
		)
	);

	function formatTaka(amount: number) {
		return '৳' + (amount || 0).toLocaleString('en-US');
	}
</script>

<!-- Recent Web Orders Quick Preview -->
<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
	<div class="p-4 border-b border-slate-100 flex items-center justify-between">
		<div>
			<h3 class="text-sm font-bold text-slate-900">সাম্প্রতিক ওয়েব অর্ডারসমূহ</h3>
			<p class="text-xs text-slate-400">কনফার্মেশন ও কলের অপেক্ষায় থাকা অর্ডার</p>
		</div>

		<a
			href="/admin/orders?view=web"
			class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#5845eb] text-xs font-bold transition-colors"
		>
			<span>সব অর্ডার দেখুন</span>
			<ArrowRight class="w-3.5 h-3.5" />
		</a>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full text-left text-xs">
			<thead>
				<tr class="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
					<th class="py-3 px-4">অর্ডার আইডি</th>
					<th class="py-3 px-4">গ্রাহক</th>
					<th class="py-3 px-4">ঠিকানা</th>
					<th class="py-3 px-4">মোবাইল নম্বর</th>
					<th class="py-3 px-4">মূল্য</th>
					<th class="py-3 px-4">স্ট্যাটাস</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#each webOrders.slice(0, 5) as order}
					<tr class="hover:bg-slate-50/50">
						<td class="py-3.5 px-4 font-mono font-bold text-[#047857]">#{order.id}</td>
						<td class="py-3.5 px-4 font-bold text-slate-900">{order.customerName}</td>
						<td class="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">{order.shippingAddress}</td>
						<td class="py-3.5 px-4 font-mono">{order.customerEmail}</td>
						<td class="py-3.5 px-4 font-bold text-slate-900">{formatTaka(order.total)}</td>
						<td class="py-3.5 px-4">
							<span class="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
								{order.status}
							</span>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="6" class="py-8 text-center text-slate-400 font-medium text-xs">
							কোনো সাম্প্রতিক ওয়েব অর্ডার পাওয়া যায়নি।
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
