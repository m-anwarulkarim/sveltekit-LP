<script lang="ts">
	import type { CourierConsignmentItem } from '#lib/server/services/courier.service';
	import { Printer, X, Truck, FileText, Check, Calendar } from 'lucide-svelte';
	import { Button } from '#lib/components/ui';

	interface Props {
		isOpen: boolean;
		consignments: CourierConsignmentItem[];
		storeName?: string;
		onClose: () => void;
	}

	let {
		isOpen = $bindable(false),
		consignments = [],
		storeName = 'AURA E-Commerce',
		onClose
	}: Props = $props();

	let printDate = $derived(
		new Date().toLocaleDateString('bn-BD', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	);

	let totalCod = $derived(
		consignments.reduce((sum, item) => sum + (Number(item.codAmount) || 0), 0)
	);

	function handlePrint() {
		window.print();
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif]"
		role="dialog"
		aria-modal="true"
	>
		<div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
			<!-- Modal Action Header (Hidden on print) -->
			<div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 no-print">
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-xl bg-indigo-100 text-[#5845eb] flex items-center justify-center">
						<Truck class="w-4 h-4 stroke-[2.5]" />
					</div>
					<div>
						<h3 class="text-sm font-bold text-slate-900">কুরিয়ার পিকআপ চালান / রাইডার ম্যানিফেস্ট</h3>
						<p class="text-[11px] text-slate-500">রাইডারের কাছে পার্সেল হস্তান্তরের প্রিন্টেবল রিসিট</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<Button
						type="button"
						variant="blue"
						size="sm"
						onclick={handlePrint}
						class="text-xs font-bold gap-1.5 rounded-xl cursor-pointer shadow-xs bg-[#5845eb] text-white"
					>
						<Printer class="w-3.5 h-3.5" />
						<span>প্রিন্ট করুন (Print Manifest)</span>
					</Button>
					<button
						type="button"
						onclick={onClose}
						class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
						aria-label="Close"
					>
						<X class="w-4 h-4" />
					</button>
				</div>
			</div>

			<!-- Printable Sheet Body -->
			<div class="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 printable-manifest">
				<!-- Manifest Brand & Dispatch Header -->
				<div class="flex items-start justify-between border-b-2 border-slate-900 pb-4">
					<div>
						<h1 class="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
							{storeName}
						</h1>
						<p class="text-xs text-slate-600 font-medium mt-0.5">
							কুরিয়ার পার্সেল হস্তান্তর চালান ও পিকআপ ম্যানিফেস্ট (Courier Handover Sheet)
						</p>
					</div>
					<div class="text-right text-xs space-y-1">
						<div class="font-bold text-slate-900">
							তারিখ: <span class="font-mono">{printDate}</span>
						</div>
						<div class="text-slate-500 text-[11px]">
							প্রিন্ট সময়: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
						</div>
					</div>
				</div>

				<!-- Summary Stats Strip -->
				<div class="grid grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
					<div>
						<div class="text-[11px] font-semibold text-slate-500">মোট পার্সেল সংখ্যা</div>
						<div class="text-lg font-black text-slate-900">{consignments.length} টি</div>
					</div>
					<div>
						<div class="text-[11px] font-semibold text-slate-500">মোট COD কালেকশন টাকা</div>
						<div class="text-lg font-black text-[#5845eb]">৳ {Math.round(totalCod).toLocaleString('en-IN')}</div>
					</div>
					<div>
						<div class="text-[11px] font-semibold text-slate-500">কুরিয়ার মেথড</div>
						<div class="text-lg font-black text-emerald-700">
							{consignments[0]?.courierProvider || 'Steadfast / Express'}
						</div>
					</div>
				</div>

				<!-- Consignments Table -->
				<table class="w-full text-left border-collapse border border-slate-300 text-xs">
					<thead>
						<tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-800 text-[11px]">
							<th class="p-2 border border-slate-300 text-center w-8">ক্রমিক</th>
							<th class="p-2 border border-slate-300">অর্ডার নম্বর</th>
							<th class="p-2 border border-slate-300">কাস্টমার নাম ও মোবাইল</th>
							<th class="p-2 border border-slate-300">ডেলিভারি ঠিকানা</th>
							<th class="p-2 border border-slate-300">পণ্য</th>
							<th class="p-2 border border-slate-300 text-right">COD টাকা</th>
							<th class="p-2 border border-slate-300">ট্র্যাকিং কোড</th>
							<th class="p-2 border border-slate-300 text-center w-24">রাইডার রিসিভড</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200 text-[11px]">
						{#each consignments as item, idx}
							<tr class="hover:bg-slate-50/50">
								<td class="p-2 border border-slate-300 text-center font-bold text-slate-600">
									{idx + 1}
								</td>
								<td class="p-2 border border-slate-300 font-mono font-bold text-slate-900">
									#{item.orderNumber}
								</td>
								<td class="p-2 border border-slate-300">
									<div class="font-bold text-slate-800">{item.customerName}</div>
									<div class="font-mono text-slate-600">{item.customerPhone}</div>
								</td>
								<td class="p-2 border border-slate-300 max-w-[200px] text-slate-700">
									{item.shippingAddress}
								</td>
								<td class="p-2 border border-slate-300 text-slate-600 truncate max-w-[120px]">
									{item.itemsSummary}
								</td>
								<td class="p-2 border border-slate-300 text-right font-black text-slate-900">
									৳ {Math.round(item.codAmount).toLocaleString('en-IN')}
								</td>
								<td class="p-2 border border-slate-300 font-mono text-[10px] text-slate-700">
									{item.trackingCode || '—'}
								</td>
								<td class="p-2 border border-slate-300 text-center">
									<div class="w-4 h-4 border border-slate-400 rounded mx-auto"></div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<!-- Signatures footer -->
				<div class="grid grid-cols-2 pt-16 mt-8 gap-8 border-t border-dashed border-slate-300">
					<div class="text-center">
						<div class="border-t border-slate-400 w-48 mx-auto pt-1 font-bold text-xs text-slate-700">
							প্রস্তুতকারক / মার্চেন্ট স্বাক্ষর
						</div>
					</div>
					<div class="text-center">
						<div class="border-t border-slate-400 w-48 mx-auto pt-1 font-bold text-xs text-slate-700">
							কুরিয়ার রাইডার স্বাক্ষর ও নাম
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@media print {
		:global(body *) {
			visibility: hidden;
		}
		.printable-manifest,
		.printable-manifest * {
			visibility: visible;
		}
		.printable-manifest {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			margin: 0;
			padding: 20px;
		}
		:global(.no-print) {
			display: none !important;
		}
	}
</style>

