<script lang="ts">
	import { Card, Input, Button } from '#lib/components/ui';
	import {
		CheckCircle2,
		Save,
		Printer,
		Sparkles,
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

<Card class="p-4 bg-white/95 shadow-md border-slate-200/90">
	<div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
		
		<!-- Financial Input Fields (Subtotal, Discount, Delivery, Advance, Total) -->
		<div class="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center flex-1">
			
			<!-- 1. Subtotal -->
			<div class="space-y-1">
				<span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
					সাবটোটাল
				</span>
				<div class="text-sm sm:text-base font-black font-mono text-slate-900">
					৳{subtotal.toLocaleString('en-US')}
				</div>
			</div>

			<!-- 2. Discount -->
			<div class="space-y-1">
				<label for="fin-discount" class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
					ডিসকাউন্ট (৳)
				</label>
				<Input
					id="fin-discount"
					type="number"
					min="0"
					bind:value={discount}
					class="h-9 text-xs font-mono font-bold focus:border-[#5845eb]"
				/>
			</div>

			<!-- 3. Delivery Fee -->
			<div class="space-y-1">
				<div class="flex items-center justify-between">
					<label for="fin-delivery" class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
						ডেলিভারি (৳)
					</label>
				</div>
				<div class="space-y-1">
					<Input
						id="fin-delivery"
						type="number"
						min="0"
						bind:value={deliveryFee}
						class="h-9 text-xs font-mono font-bold focus:border-[#5845eb]"
					/>
					<!-- Quick Chips -->
					<div class="flex items-center gap-1">
						<button
							type="button"
							onclick={() => setQuickDelivery(60)}
							class="text-[9px] font-bold px-1.5 py-0.5 rounded border transition-colors cursor-pointer {deliveryFee === 60 ? 'bg-indigo-50 border-indigo-300 text-[#5845eb]' : 'bg-slate-50 border-slate-200 text-slate-600'}"
						>
							ঢাকা ৬০
						</button>
						<button
							type="button"
							onclick={() => setQuickDelivery(120)}
							class="text-[9px] font-bold px-1.5 py-0.5 rounded border transition-colors cursor-pointer {deliveryFee === 120 ? 'bg-indigo-50 border-indigo-300 text-[#5845eb]' : 'bg-slate-50 border-slate-200 text-slate-600'}"
						>
							বাইরে ১২০
						</button>
						<button
							type="button"
							onclick={() => setQuickDelivery(0)}
							class="text-[9px] font-bold px-1.5 py-0.5 rounded border transition-colors cursor-pointer {deliveryFee === 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'}"
						>
							ফ্রি ০
						</button>
					</div>
				</div>
			</div>

			<!-- 4. Advance Paid -->
			<div class="space-y-1">
				<label for="fin-advance" class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
					অগ্রিম গৃহীত (৳)
				</label>
				<Input
					id="fin-advance"
					type="number"
					min="0"
					bind:value={advancePaid}
					class="h-9 text-xs font-mono font-bold focus:border-[#5845eb]"
				/>
			</div>

			<!-- 5. Total Payable -->
			<div class="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
				<span class="text-[11px] font-black text-slate-600 uppercase tracking-wider block">
					সর্বমোট প্রদেয়
				</span>
				<div class="text-base sm:text-lg font-black font-mono text-emerald-600">
					৳{totalPayable.toLocaleString('en-US')}
				</div>
			</div>

		</div>

		<!-- Action Buttons -->
		<div class="flex items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 lg:border-l lg:border-slate-200/80 lg:pl-4">
			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={onPrint}
				class="h-10 text-xs font-bold border-slate-200"
				title="ইনভয়েস প্রিন্ট"
			>
				<Printer class="w-4 h-4" />
			</Button>

			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={onSave}
				disabled={isSaving}
				class="h-10 text-xs font-bold border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 gap-1.5 shadow-2xs"
			>
				<Save class="w-4 h-4" />
				<span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : saveLabel}</span>
			</Button>

			<Button
				type="button"
				size="sm"
				onclick={onConfirm}
				class="h-10 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 gap-1.5"
			>
				<CheckCircle2 class="w-4 h-4" />
				<span>{confirmLabel}</span>
			</Button>
		</div>

	</div>
</Card>

