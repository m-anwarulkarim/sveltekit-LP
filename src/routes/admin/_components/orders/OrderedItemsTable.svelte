<script lang="ts">
	import { Card, Badge, Button } from '#lib/components/ui';
	import {
		ShoppingBag,
		Plus,
		Minus,
		Trash2,
		PackageOpen,
		Tag
	} from 'lucide-svelte';

	export interface OrderItem {
		id: string;
		name: string;
		price: number;
		quantity: number;
		image?: string;
		variant?: string;
	}

	interface Props {
		items: OrderItem[];
		onUpdateQuantity: (index: number, newQty: number) => void;
		onRemoveItem: (index: number) => void;
	}

	let {
		items = $bindable(),
		onUpdateQuantity,
		onRemoveItem
	}: Props = $props();

	let totalPieces = $derived(
		items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0)
	);
</script>

<Card class="p-4 bg-white/90 shadow-xs border-slate-200/90 flex flex-col h-full">
	<!-- Header -->
	<div class="flex items-center justify-between pb-3 border-b border-slate-100">
		<div class="flex items-center gap-2">
			<ShoppingBag class="w-4 h-4 text-[#5845eb]" />
			<h2 class="text-sm font-black text-slate-900 tracking-tight">অর্ডারকৃত পণ্যসমূহ</h2>
		</div>
		<Badge variant="purple" class="px-2 py-0.5 text-[11px] font-bold font-mono">
			{items.length} items · {totalPieces} pcs
		</Badge>
	</div>

	<!-- Items List -->
	<div class="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[460px] py-1">
		{#if items.length === 0}
			<div class="py-12 text-center text-slate-400 space-y-2">
				<PackageOpen class="w-8 h-8 mx-auto text-slate-300 stroke-1" />
				<p class="text-xs font-semibold">এই অর্ডারে কোনো আইটেম নেই</p>
				<p class="text-[11px] text-slate-400">ডানপাশের সার্চ প্যানেল থেকে পণ্য যুক্ত করুন</p>
			</div>
		{:else}
			{#each items as item, index}
				<div class="py-3 flex items-center justify-between gap-3 group">
					
					<!-- Product Image & Details -->
					<div class="flex items-center gap-3 min-w-0">
						<div class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
							{#if item.image}
								<img
									src={item.image}
									alt={item.name}
									class="w-full h-full object-cover"
									onerror={(e) => {
										// fallback if image fails
										(e.target as HTMLElement).style.display = 'none';
									}}
								/>
							{:else}
								<ShoppingBag class="w-5 h-5 text-slate-400" />
							{/if}
						</div>

						<div class="min-w-0">
							<h3 class="text-xs font-bold text-slate-900 truncate leading-snug">
								{item.name}
							</h3>
							<div class="flex items-center gap-2 mt-0.5">
								<span class="text-xs font-mono font-bold text-[#5845eb]">
									৳{item.price.toLocaleString('en-US')}
								</span>
								{#if item.variant}
									<span class="inline-flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
										<Tag class="w-2.5 h-2.5" />
										<span>{item.variant}</span>
									</span>
								{/if}
							</div>
						</div>
					</div>

					<!-- Stepper & Subtotal -->
					<div class="flex items-center gap-3 shrink-0">
						<!-- Quantity Stepper -->
						<div class="flex items-center bg-slate-100/90 rounded-lg p-0.5 border border-slate-200/80">
							<button
								type="button"
								onclick={() => onUpdateQuantity(index, item.quantity - 1)}
								class="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
								title="কমান"
							>
								<Minus class="w-3 h-3" />
							</button>

							<span class="w-7 text-center font-mono font-bold text-xs text-slate-900">
								{item.quantity}
							</span>

							<button
								type="button"
								onclick={() => onUpdateQuantity(index, item.quantity + 1)}
								class="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
								title="বাড়ান"
							>
								<Plus class="w-3 h-3" />
							</button>
						</div>

						<!-- Line Item Total -->
						<div class="text-right min-w-[65px]">
							<span class="text-xs font-mono font-bold text-slate-900">
								৳{(item.price * item.quantity).toLocaleString('en-US')}
							</span>
						</div>

						<!-- Remove Item Action -->
						<button
							type="button"
							onclick={() => onRemoveItem(index)}
							class="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
							title="আইটেমটি রিমুভ করুন"
						>
							<Trash2 class="w-3.5 h-3.5" />
						</button>
					</div>

				</div>
			{/each}
		{/if}
	</div>
</Card>

