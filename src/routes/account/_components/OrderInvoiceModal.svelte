<script lang="ts">
	import { Printer, X, ShoppingBag, CheckCircle2, MapPin, Phone, Calendar } from 'lucide-svelte';
	import { Button } from '#lib/components/ui';

	interface Props {
		isOpen: boolean;
		order: any;
		storeName?: string;
		onClose: () => void;
	}

	let {
		isOpen = $bindable(false),
		order,
		storeName = 'Seed BD | Haq Plus',
		onClose
	}: Props = $props();

	function handlePrint() {
		if (typeof window !== 'undefined') {
			window.print();
		}
	}

	function formatTaka(amount: number): string {
		return '৳ ' + Math.round(amount || 0).toLocaleString('en-IN');
	}

	let itemsList = $derived.by(() => {
		if (!order?.items) return [];
		try {
			const parsed = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	});
</script>

{#if isOpen && order}
	<div
		class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif]"
		role="dialog"
		aria-modal="true"
	>
		<div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
			<!-- Header Actions (Hidden on print) -->
			<div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 no-print">
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-xl bg-indigo-100 text-[#5845eb] flex items-center justify-center">
						<ShoppingBag class="w-4 h-4 stroke-[2.5]" />
					</div>
					<div>
						<h3 class="text-sm font-bold text-slate-900">অর্ডার ক্যাশ মেমো / ইনভয়েস</h3>
						<p class="text-[11px] text-slate-500 font-mono">#{order.orderNumber || order.id?.slice(0, 8)}</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<Button
						type="button"
						size="sm"
						onclick={handlePrint}
						class="text-xs font-bold gap-1.5 rounded-xl cursor-pointer shadow-xs bg-[#5845eb] hover:bg-[#4936d6] text-white"
					>
						<Printer class="w-3.5 h-3.5" />
						<span>প্রিন্ট করুন (Print Memo)</span>
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

			<!-- Printable Memo Body -->
			<div class="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 printable-memo">
				<!-- Brand Header -->
				<div class="flex items-start justify-between border-b-2 border-slate-900 pb-5">
					<div>
						<h1 class="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
							{storeName}
						</h1>
						<p class="text-xs text-slate-600 font-medium mt-0.5">
							অনলাইন শপ ক্যাশ মেমো ও কাস্টমার রসিদ
						</p>
						<p class="text-[11px] text-slate-500 font-mono mt-1">
							হটলাইন: 0156007230 | www.seedbd.shop
						</p>
					</div>
					<div class="text-right text-xs space-y-1">
						<div class="font-bold text-slate-900 font-mono">
							অর্ডার: #{order.orderNumber || order.id?.slice(0, 8)}
						</div>
						<div class="text-slate-600 text-[11px]">
							তারিখ: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : 'আজ'}
						</div>
						<div class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase {order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
							{order.paymentStatus === 'paid' ? 'পেমেন্ট সম্পন্ন (PAID)' : 'ক্যাশ অন ডেলিভারি (COD)'}
						</div>
					</div>
				</div>

				<!-- Customer & Shipping Information -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-xs">
					<div class="space-y-1">
						<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">গ্রাহকের তথ্য (Customer)</span>
						<div class="font-bold text-slate-900 text-sm">{order.customerName || 'গ্রাহক'}</div>
						<div class="text-slate-600 font-mono flex items-center gap-1.5">
							<Phone class="w-3 h-3 text-slate-400" />
							<span>{order.customerPhone || 'ফোন নম্বর নেই'}</span>
						</div>
					</div>
					<div class="space-y-1">
						<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ডেলিভারি ঠিকানা (Shipping)</span>
						<div class="text-slate-700 flex items-start gap-1.5 leading-relaxed">
							<MapPin class="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
							<span>{order.shippingAddress || 'ঠিকানা দেওয়া হয়নি'}</span>
						</div>
					</div>
				</div>

				<!-- Items Table -->
				<div class="border border-slate-200 rounded-2xl overflow-hidden">
					<table class="w-full text-left border-collapse text-xs">
						<thead>
							<tr class="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
								<th class="py-2.5 px-3 w-10 text-center">#</th>
								<th class="py-2.5 px-3">পণ্যের বিবরণ</th>
								<th class="py-2.5 px-3 text-center">পরিমাণ</th>
								<th class="py-2.5 px-3 text-right">একক মূল্য</th>
								<th class="py-2.5 px-3 text-right">মোট</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#if itemsList.length > 0}
								{#each itemsList as item, idx}
									<tr>
										<td class="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
										<td class="py-2.5 px-3 font-semibold text-slate-900">
											{item.name || 'পণ্য'}
											{#if item.variantName}
												<span class="text-[11px] text-slate-500 font-normal block font-sans">({item.variantName})</span>
											{/if}
										</td>
										<td class="py-2.5 px-3 text-center font-bold text-slate-700">{item.quantity || 1}</td>
										<td class="py-2.5 px-3 text-right font-mono text-slate-600">{formatTaka(item.price || 0)}</td>
										<td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
											{formatTaka((item.price || 0) * (item.quantity || 1))}
										</td>
									</tr>
								{/each}
							{:else}
								<tr>
									<td colspan="5" class="py-4 text-center text-slate-400">
										{order.itemsSummary || 'পণ্য অর্ডার'}
									</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>

				<!-- Financial Breakdown -->
				<div class="flex justify-end">
					<div class="w-full sm:w-64 space-y-1.5 text-xs">
						<div class="flex items-center justify-between text-slate-600">
							<span>সাব-টোটাল:</span>
							<span class="font-mono font-semibold">{formatTaka(order.subtotal || order.total - (order.deliveryCharge || 0))}</span>
						</div>
						<div class="flex items-center justify-between text-slate-600">
							<span>ডেলিভারি চার্জ:</span>
							<span class="font-mono font-semibold">{formatTaka(order.deliveryCharge || 0)}</span>
						</div>
						{#if order.discountAmount && order.discountAmount > 0}
							<div class="flex items-center justify-between text-emerald-600">
								<span>ডিসকাউন্ট:</span>
								<span class="font-mono font-semibold">- {formatTaka(order.discountAmount)}</span>
							</div>
						{/if}
						<div class="flex items-center justify-between text-slate-900 font-black text-sm border-t-2 border-slate-900 pt-2 mt-1">
							<span>সর্বমোট প্রদেয়:</span>
							<span class="font-mono text-base text-[#5845eb]">{formatTaka(order.total || 0)}</span>
						</div>
					</div>
				</div>

				<!-- Footer Sign & Note -->
				<div class="border-t border-dashed border-slate-200 pt-4 text-[11px] text-slate-500 flex items-center justify-between">
					<div>
						ধন্যবাদ আপনার কেনাকাটার জন্য! পণ্য সম্পর্কিত যে কোনো প্রয়োজনে আমাদের সাপোর্ট নাম্বারে যোগাযোগ করুন।
					</div>
					<div class="text-right font-mono text-[10px] text-slate-400">
						Computer Generated Receipt
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
		.printable-memo,
		.printable-memo * {
			visibility: visible;
		}
		.printable-memo {
			position: fixed;
			left: 0;
			top: 0;
			width: 100%;
			padding: 24px;
			margin: 0;
			background: white;
		}
		.no-print {
			display: none !important;
		}
	}
</style>
