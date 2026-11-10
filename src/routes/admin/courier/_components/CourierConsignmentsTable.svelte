<script lang="ts">
	import type { CourierConsignmentItem } from '#lib/server/services/courier.service';
	import {
		ExternalLink,
		Copy,
		Check,
		Eye,
		Truck,
		Package,
		Phone,
		MapPin,
		Clock,
		AlertCircle,
		CheckCircle2,
		RotateCcw,
		Calendar
	} from 'lucide-svelte';
	import { Badge, Button } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';

	interface Props {
		consignments: CourierConsignmentItem[];
		selectedIds: string[];
		onToggleSelect: (id: string) => void;
		onSelectAll: () => void;
		onClearSelection: () => void;
	}

	let {
		consignments = [],
		selectedIds = $bindable([]),
		onToggleSelect,
		onSelectAll,
		onClearSelection
	}: Props = $props();

	let copiedCode = $state<string | null>(null);

	function copyToClipboard(text: string, label = 'ট্র্যাকিং কোড') {
		if (!text) return;
		navigator.clipboard.writeText(text);
		copiedCode = text;
		toast.success(`${label} কপি করা হয়েছে!`);
		setTimeout(() => {
			if (copiedCode === text) copiedCode = null;
		}, 2000);
	}

	function formatTaka(amount: number): string {
		return '৳ ' + Math.round(amount || 0).toLocaleString('en-IN');
	}

	function formatDate(d: Date | string | null | undefined): string {
		if (!d) return '—';
		const dateObj = typeof d === 'string' ? new Date(d) : d;
		return dateObj.toLocaleDateString('bn-BD', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	let isAllSelected = $derived(
		consignments.length > 0 && selectedIds.length === consignments.length
	);
</script>

<div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
	{#if consignments.length === 0}
		<div class="text-center py-16 px-4 space-y-3">
			<div class="w-14 h-14 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center mx-auto shadow-2xs">
				<Truck class="w-7 h-7 stroke-[2]" />
			</div>
			<div class="space-y-1">
				<h3 class="text-base font-bold text-slate-800">কোনো কুরিয়ার পার্সেল পাওয়া যায়নি</h3>
				<p class="text-xs text-slate-400 max-w-sm mx-auto">
					বর্তমান ফিল্টারে কোনো কুরিয়ার চালান নেই। ফিল্টার পরিবর্তন করুন অথবা অর্ডার লিস্ট থেকে কুরিয়ারে বুকিং করুন।
				</p>
			</div>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
						<th class="py-3.5 pl-4 pr-2 w-10 text-center">
							<input
								type="checkbox"
								checked={isAllSelected}
								onchange={() => (isAllSelected ? onClearSelection() : onSelectAll())}
								class="rounded text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
								title="সকল পার্সেল সিলেক্ট করুন"
							/>
						</th>
						<th class="py-3.5 px-3">অর্ডার ও তারিখ</th>
						<th class="py-3.5 px-3">গ্রাহক ও ডেলিভারি ঠিকানা</th>
						<th class="py-3.5 px-3">কুরিয়ার ও ট্র্যাকিং</th>
						<th class="py-3.5 px-3 text-right">COD টাকা</th>
						<th class="py-3.5 px-3 text-right">কুরিয়ার ফি</th>
						<th class="py-3.5 px-3 text-right">নিট প্রদেয়</th>
						<th class="py-3.5 px-3 text-center">কুরিয়ার স্ট্যাটাস</th>
						<th class="py-3.5 pr-4 pl-3 text-center">অ্যাকশন</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 text-xs text-slate-700">
					{#each consignments as item (item.id)}
						{@const isSelected = selectedIds.includes(item.id)}
						<tr class="hover:bg-slate-50/70 transition-colors {isSelected ? 'bg-indigo-50/30' : ''}">
							<!-- Checkbox -->
							<td class="py-3.5 pl-4 pr-2 text-center">
								<input
									type="checkbox"
									checked={isSelected}
									onchange={() => onToggleSelect(item.id)}
									class="rounded text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
								/>
							</td>

							<!-- Order Number & Date -->
							<td class="py-3.5 px-3 space-y-1">
								<div class="flex items-center gap-1.5 font-bold text-slate-900">
									<a
										href="/admin/orders/{item.id}"
										class="hover:text-[#5845eb] hover:underline font-mono text-[13px]"
									>
										#{item.orderNumber}
									</a>
								</div>
								<div class="text-[11px] text-slate-400 flex items-center gap-1">
									<Clock class="w-3 h-3" />
									<span>{formatDate(item.shippedAt || item.createdAt)}</span>
								</div>
								<div class="text-[11px] text-slate-500 font-medium truncate max-w-[180px]" title={item.itemsSummary}>
									{item.itemsSummary}
								</div>
							</td>

							<!-- Customer & Address -->
							<td class="py-3.5 px-3 space-y-1 max-w-[220px]">
								<div class="font-bold text-slate-900 truncate">
									{item.customerName}
								</div>
								{#if item.customerPhone}
									<div class="flex items-center gap-1 text-[11px] font-mono text-slate-600">
										<Phone class="w-3 h-3 text-slate-400" />
										<span>{item.customerPhone}</span>
									</div>
								{/if}
								{#if item.shippingAddress}
									<div class="text-[11px] text-slate-500 flex items-start gap-1 line-clamp-2" title={item.shippingAddress}>
										<MapPin class="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
										<span>{item.shippingAddress}</span>
									</div>
								{/if}
							</td>

							<!-- Courier & Tracking -->
							<td class="py-3.5 px-3 space-y-1.5">
								<div class="flex items-center gap-1.5">
									<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
										{item.courierProvider}
									</span>
								</div>

								{#if item.trackingCode}
									<div class="flex items-center gap-1">
										<span class="font-mono text-xs font-semibold text-slate-800 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/80">
											{item.trackingCode}
										</span>
										<button
											type="button"
											onclick={() => copyToClipboard(item.trackingCode)}
											class="p-1 rounded hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
											title="ট্র্যাকিং কোড কপি করুন"
										>
											{#if copiedCode === item.trackingCode}
												<Check class="w-3.5 h-3.5 text-emerald-600" />
											{:else}
												<Copy class="w-3.5 h-3.5" />
											{/if}
										</button>
										{#if item.trackingUrl}
											<a
												href={item.trackingUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="p-1 rounded hover:bg-indigo-50 text-[#5845eb] transition-colors"
												title="কুরিয়ার লাইভ ট্র্যাকিং পেজ দেখুন"
											>
												<ExternalLink class="w-3.5 h-3.5" />
											</a>
										{/if}
									</div>
								{:else}
									<span class="text-[11px] text-slate-400 font-italic">ট্র্যাকিং কোড নেই</span>
								{/if}
							</td>

							<!-- COD Amount -->
							<td class="py-3.5 px-3 text-right font-black text-slate-900 text-xs">
								{formatTaka(item.codAmount)}
							</td>

							<!-- Courier Fee -->
							<td class="py-3.5 px-3 text-right font-semibold text-slate-500 text-xs">
								{formatTaka(item.courierCost)}
							</td>

							<!-- Net Payable -->
							<td class="py-3.5 px-3 text-right font-black text-xs {item.courierStatus === 'delivered' ? 'text-emerald-600' : 'text-slate-400'}">
								{formatTaka(item.netPayable)}
							</td>

							<!-- Courier Status Badge -->
							<td class="py-3.5 px-3 text-center">
								{#if item.courierStatus === 'delivered'}
									<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
										<CheckCircle2 class="w-3 h-3 stroke-[2.5]" />
										<span>ডেলিভার্ড</span>
									</span>
								{:else if item.courierStatus === 'returned'}
									<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
										<RotateCcw class="w-3 h-3 stroke-[2.5]" />
										<span>রিটার্ন</span>
									</span>
								{:else if item.courierStatus === 'hold'}
									<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
										<AlertCircle class="w-3 h-3 stroke-[2.5]" />
										<span>হোল্ড</span>
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
										<Truck class="w-3 h-3 stroke-[2.5]" />
										<span>ইন-ট্রানজিট</span>
									</span>
								{/if}
							</td>

							<!-- Actions -->
							<td class="py-3.5 pr-4 pl-3 text-center">
								<div class="flex items-center justify-center gap-1">
									<a
										href="/admin/orders/{item.id}"
										class="p-1.5 rounded-lg bg-slate-100 hover:bg-[#5845eb] text-slate-700 hover:text-white transition-all cursor-pointer"
										title="অর্ডারের বিস্তারিত দেখুন"
									>
										<Eye class="w-3.5 h-3.5" />
									</a>
									{#if item.trackingUrl}
										<a
											href={item.trackingUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white transition-all cursor-pointer"
											title="লাইভ ট্র্যাকিং দেখুন"
										>
											<ExternalLink class="w-3.5 h-3.5" />
										</a>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
