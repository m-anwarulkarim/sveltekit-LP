<script lang="ts">
	import { Card, Input, Button } from '#lib/components/ui';
	import {
		CheckCircle2,
		Save,
		Printer,
		Calculator
	} from 'lucide-svelte';

	interface Props {
		subtotal: number;
		discount: number;
		deliveryFee: number;
		advancePaid: number;
		isSaving?: boolean;
		confirmLabel?: string;
		saveLabel?: string;
		onSave: () => void;
		onConfirm: () => void;
		onPrint: () => void;
	}

	let {
		subtotal = 0,
		discount = $bindable(0),
		deliveryFee = $bindable(60),
		advancePaid = $bindable(0),
		isSaving = false,
		confirmLabel = 'কনফার্ম অর্ডার',
		saveLabel = 'সেভ করুন',
		onSave,
		onConfirm,
		onPrint
	}: Props = $props();

	// Formula: Subtotal - Discount + Delivery - Advance
	let totalPayable = $derived.by(() => {
		const gross = Number(subtotal) || 0;
		const disc = Math.max(0, Number(discount) || 0);
		const del = Math.max(0, Number(deliveryFee) || 0);
		const adv = Math.max(0, Number(advancePaid) || 0);
		return Math.max(0, gross - disc + del - adv);
	});

	function setQuickDelivery(fee: number) {
		deliveryFee = fee;
	}
</script>

<Card class="p-4 sm:p-5 bg-white/95 shadow-sm border-slate-200/90 space-y-4">
	<!-- Top: Financial Calculation Blocks -->
	<div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 items-stretch">
		
		<!-- 1. Subtotal -->
		<div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-1">
			<span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
				সাবটোটাল
			</span>
			<div class="text-base sm:text-lg font-black font-mono text-slate-900 truncate">
				৳{Number(subtotal || 0).toLocaleString('en-US')}
			</div>
			<span class="text-[10px] text-slate-400 font-medium">পণ্যের সর্বমোট মূল্য</span>
		</div>

		<!-- 2. Discount -->
		<div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-1.5">
			<div class="flex items-center justify-between">
				<label for="fin-discount" class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
					ডিসকাউন্ট (৳)
				</label>
				{#if Number(discount) > 0}
					<span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
						-৳{discount}
					</span>
				{/if}
			</div>
			<Input
				id="fin-discount"
				type="number"
				min="0"
				bind:value={discount}
				placeholder="0"
				class="h-9 text-xs font-mono font-bold bg-white focus:border-[#5845eb] rounded-xl"
			/>
			<span class="text-[10px] text-slate-400 font-medium">নির্দিষ্ট ছাড়ের পরিমাণ</span>
		</div>

		<!-- 3. Delivery Fee (With completely self-contained quick chips) -->
		<div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-1.5">
			<label for="fin-delivery" class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
				ডেলিভারি চার্জ (৳)
			</label>
			<Input
				id="fin-delivery"
				type="number"
				min="0"
				bind:value={deliveryFee}
				class="h-9 text-xs font-mono font-bold bg-white focus:border-[#5845eb] rounded-xl"
			/>
			<!-- Quick Delivery Chips - Scoped securely inside this container -->
			<div class="flex items-center flex-wrap gap-1 pt-0.5">
				<button
					type="button"
					onclick={() => setQuickDelivery(60)}
					class="text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer {deliveryFee === 60 ? 'bg-indigo-50 border-indigo-300 text-[#5845eb]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}"
				>
					ঢাকা ৬০
				</button>
				<button
					type="button"
					onclick={() => setQuickDelivery(120)}
					class="text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer {deliveryFee === 120 ? 'bg-indigo-50 border-indigo-300 text-[#5845eb]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}"
				>
					বাইরে ১২০
				</button>
				<button
					type="button"
					onclick={() => setQuickDelivery(0)}
					class="text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer {deliveryFee === 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}"
				>
					ফ্রি ০
				</button>
			</div>
		</div>

		<!-- 4. Advance Paid -->
		<div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-1.5">
			<div class="flex items-center justify-between">
				<label for="fin-advance" class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
					অগ্রিম গৃহীত (৳)
				</label>
				{#if Number(advancePaid) > 0}
					<span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
						পেইড
					</span>
				{/if}
			</div>
			<Input
				id="fin-advance"
				type="number"
				min="0"
				bind:value={advancePaid}
				placeholder="0"
				class="h-9 text-xs font-mono font-bold bg-white focus:border-[#5845eb] rounded-xl"
			/>
			<span class="text-[10px] text-slate-400 font-medium">বিকাশ/নগদ অগ্রিম</span>
		</div>

		<!-- 5. Total Payable -->
		<div class="p-3 bg-emerald-50/80 rounded-2xl border-2 border-emerald-300 flex flex-col justify-between space-y-1 col-span-2 sm:col-span-2 md:col-span-1 shadow-2xs">
			<div class="flex items-center justify-between">
				<span class="text-[11px] font-black text-emerald-900 uppercase tracking-wider block">
					সর্বমোট প্রদেয়
				</span>
				{#if Number(discount) > 0}
					<span class="text-[9px] font-bold text-rose-700 bg-rose-100/90 px-1.5 py-0.2 rounded border border-rose-200">
						-৳{discount} ছাড়
					</span>
				{/if}
			</div>
			<div class="text-xl sm:text-2xl font-black font-mono text-emerald-700 truncate">
				৳{totalPayable.toLocaleString('en-US')}
			</div>
			<div class="text-[10px] text-emerald-800 font-mono font-bold truncate bg-emerald-100/60 px-1.5 py-0.5 rounded border border-emerald-200/60" title="সূত্র: সাবটোটাল - ডিসকাউন্ট + ডেলিভারি">
				{Number(subtotal || 0).toLocaleString()} - {Number(discount || 0).toLocaleString()} + {Number(deliveryFee || 0).toLocaleString()} = ৳{totalPayable.toLocaleString()}
			</div>
		</div>

	</div>

	<!-- Bottom Action Bar: Print Invoice, Save Changes, Confirm Order (Responsive & Safe) -->
	<div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
		<div class="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80">
			<Calculator class="w-4 h-4 text-[#5845eb] shrink-0" />
			<span>
				হিসাব সূত্র: সাবটোটাল (৳{Number(subtotal || 0).toLocaleString()}) - ছাড় (৳{Number(discount || 0).toLocaleString()}) + ডেলিভারি (৳{Number(deliveryFee || 0).toLocaleString()}) = <b>৳{totalPayable.toLocaleString()}</b>
			</span>
		</div>

		<div class="flex flex-wrap items-center justify-end gap-2">
			<!-- Print Invoice -->
			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={onPrint}
				class="h-9 gap-1.5 text-xs font-bold border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs"
			>
				<Printer class="w-3.5 h-3.5" />
				<span>চালান প্রিন্ট</span>
			</Button>

			<!-- Save Changes -->
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={isSaving}
				onclick={onSave}
				class="h-9 gap-1.5 text-xs font-bold border-indigo-200 text-[#5845eb] bg-indigo-50/60 hover:bg-indigo-100 shadow-2xs"
			>
				<Save class="w-3.5 h-3.5" />
				<span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : saveLabel}</span>
			</Button>

			<!-- Quick Confirm Button -->
			<Button
				type="button"
				size="sm"
				onclick={onConfirm}
				class="h-9 gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
			>
				<CheckCircle2 class="w-3.5 h-3.5" />
				<span>{confirmLabel}</span>
			</Button>
		</div>
	</div>
</Card>
