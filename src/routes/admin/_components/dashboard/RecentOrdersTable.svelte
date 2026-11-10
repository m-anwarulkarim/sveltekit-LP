<script lang="ts">
	import { ArrowRight, Phone, Copy, Check, ExternalLink } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { OrderLocationCell } from '../orders';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();

	let webOrders = $derived(
		(data?.orders || []).filter((o: any) =>
			!o.isTrashed &&
			['pending', 'incomplete', 'no_response', 'no_response_3', 'good_no_response', 'busy', 'hold'].includes(o.status)
		)
	);

	function formatTaka(amount: number) {
		return '৳' + (amount || 0).toLocaleString('en-US');
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
			return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
		} catch {
			return '';
		}
	}

	let copiedPhone = $state<string | null>(null);
	function copyPhoneNumber(phone: string) {
		if (!phone) return;
		navigator.clipboard?.writeText(phone);
		copiedPhone = phone;
		toast.success(`নম্বর (${phone}) কপি করা হয়েছে!`);
		setTimeout(() => {
			if (copiedPhone === phone) copiedPhone = null;
		}, 2000);
	}

	const STATUS_MAP: Record<string, { label: string; badge: string; dot: string }> = {
		pending: { label: 'পেন্ডিং', badge: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
		incomplete: { label: 'ইনকমপ্লিট', badge: 'bg-orange-50 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
		no_response: { label: 'নো রেসপন্স', badge: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
		good_no_response: { label: 'গুড বাট নো রেসপন্স', badge: 'bg-cyan-50 text-cyan-800 border-cyan-200', dot: 'bg-cyan-500' },
		busy: { label: 'বিজি', badge: 'bg-yellow-50 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
		hold: { label: 'হোল্ড', badge: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
		confirmed: { label: 'কনফার্মড', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
		processing: { label: 'প্রসেসিং', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
		printed: { label: 'প্রিন্টেড', badge: 'bg-violet-50 text-violet-800 border-violet-200', dot: 'bg-violet-500' },
		entry_done: { label: 'এন্ট্রি ডান', badge: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-500' },
		shipped: { label: 'শিপড', badge: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-600' },
		delivered: { label: 'ডেলিভারড', badge: 'bg-green-50 text-green-800 border-green-200', dot: 'bg-green-600' },
		cancelled: { label: 'বাতিল', badge: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' },
		returned: { label: 'রিটার্ন', badge: 'bg-red-50 text-red-800 border-red-200', dot: 'bg-red-600' }
	};
</script>

<!-- Recent Web Orders Quick Preview -->
<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
	<div class="p-4 border-b border-slate-100 flex items-center justify-between">
		<div>
			<h3 class="text-sm font-bold text-slate-900">সাম্প্রতিক ওয়েব অর্ডারসমূহ</h3>
			<p class="text-xs text-slate-400">কনফার্মেশন ও কলের অপেক্ষায় থাকা নতুন অর্ডার</p>
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
					<th class="py-3 px-4 min-w-[160px]">ঠিকানা</th>
					<th class="py-3 px-4">মোবাইল নম্বর</th>
					<th class="py-3 px-4">মূল্য</th>
					<th class="py-3 px-4">স্ট্যাটাস</th>
					<th class="py-3 px-4 text-right">অ্যাকশন</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#each webOrders.slice(0, 6) as order}
					{@const phone = order.customerPhone || ''}
					{@const displayOrderNum = order.orderNumber ? (order.orderNumber.startsWith('#') ? order.orderNumber : '#' + order.orderNumber) : '#' + (order.id ? order.id.slice(0, 8) : '—')}
					{@const statusMeta = STATUS_MAP[order.status] || { label: order.status, badge: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' }}
					<tr class="hover:bg-slate-50/70 transition-colors">
						<!-- Order ID (Real Order Number from Order Page) -->
						<td class="py-3.5 px-4 font-mono font-bold">
							<a
								href="/admin/orders/{order.orderNumber || order.id}"
								class="text-[#5845eb] hover:underline font-mono font-black text-xs inline-flex items-center gap-1 group"
								title="অর্ডারের বিস্তারিত দেখুন ও সম্পাদনা করুন"
							>
								<span>{displayOrderNum}</span>
								<ExternalLink class="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
							</a>
							{#if order.createdAt}
								<span class="text-[10px] text-slate-400 font-sans block mt-0.5">
									{formatTimeAgo(order.createdAt)}
								</span>
							{/if}
						</td>

						<!-- Customer Name -->
						<td class="py-3.5 px-4 font-bold text-slate-900">
							{order.customerName || 'নামবিহীন গ্রাহক'}
						</td>

						<!-- Location with Popup Dialog -->
						<td class="py-3.5 px-4">
							<OrderLocationCell
								shippingAddress={order.shippingAddress}
								deliveryArea={order.deliveryArea}
								orderNumber={displayOrderNum}
								customerName={order.customerName}
								customerPhone={order.customerPhone}
							/>
						</td>

						<!-- Mobile Number with 1-Click Call & Copy -->
						<td class="py-3.5 px-4 font-mono">
							{#if phone}
								<div class="flex items-center gap-1.5">
									<a
										href="tel:{phone}"
										class="text-[#5845eb] hover:text-indigo-800 hover:underline font-mono font-bold text-xs inline-flex items-center gap-1"
										title="সরাসরি কল করুন: {phone}"
									>
										<Phone class="w-3 h-3 opacity-70" />
										<span>{phone}</span>
									</a>
									<button
										type="button"
										onclick={() => copyPhoneNumber(phone)}
										class="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
										title="নম্বর কপি করুন"
									>
										{#if copiedPhone === phone}
											<Check class="w-3.5 h-3.5 text-emerald-600" />
										{:else}
											<Copy class="w-3.5 h-3.5" />
										{/if}
									</button>
								</div>
							{:else}
								<span class="text-slate-400">—</span>
							{/if}
						</td>

						<!-- Total Amount -->
						<td class="py-3.5 px-4 font-bold text-slate-900 font-mono">
							{formatTaka(order.total)}
						</td>

						<!-- Bengali Status Badge -->
						<td class="py-3.5 px-4">
							<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border {statusMeta.badge}">
								<span class="w-1.5 h-1.5 rounded-full {statusMeta.dot}"></span>
								<span>{statusMeta.label}</span>
							</span>
						</td>

						<!-- Action -->
						<td class="py-3.5 px-4 text-right">
							<a
								href="/admin/orders/{order.orderNumber || order.id}"
								class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-[#5845eb] text-[11px] font-bold transition-colors"
								title="বিস্তারিত দেখুন"
							>
								<span>দেখুন</span>
								<ArrowRight class="w-3 h-3" />
							</a>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="7" class="py-10 text-center text-slate-400 font-medium text-xs">
							কোনো সাম্প্রতিক ওয়েব অর্ডার পাওয়া যায়নি।
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
