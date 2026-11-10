<script lang="ts">
	import { Package, Search, X, ShoppingBag, ArrowRight } from 'lucide-svelte';
	import { Input, Button } from '#lib/components/ui';
	import OrderCard from './OrderCard.svelte';
	import OrderInvoiceModal from './OrderInvoiceModal.svelte';

	interface Props {
		orders: any[];
	}

	let { orders = [] }: Props = $props();

	let selectedStatusFilter = $state<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
	let searchQuery = $state('');

	// Active order for invoice modal
	let selectedInvoiceOrder = $state<any>(null);
	let isInvoiceModalOpen = $state(false);

	function openInvoice(ord: any) {
		selectedInvoiceOrder = ord;
		isInvoiceModalOpen = true;
	}

	// Filter Tabs (Daraz Style)
	const STATUS_TABS = [
		{ id: 'all', label: 'সকল অর্ডার', count: orders.length },
		{
			id: 'pending',
			label: 'পেন্ডিং',
			count: orders.filter((o) => {
				const s = String(o.status || '').toLowerCase();
				return s === 'pending' || s === 'hold';
			}).length
		},
		{
			id: 'processing',
			label: 'প্রসেসিং',
			count: orders.filter((o) => {
				const s = String(o.status || '').toLowerCase();
				return s === 'processing' || s === 'confirmed' || s === 'printed';
			}).length
		},
		{
			id: 'shipped',
			label: 'অন দ্য ওয়ে',
			count: orders.filter((o) => {
				const s = String(o.status || '').toLowerCase();
				return s === 'shipped' || o.courierStatus === 'in_transit';
			}).length
		},
		{
			id: 'delivered',
			label: 'ডেলিভার্ড',
			count: orders.filter((o) => {
				const s = String(o.status || '').toLowerCase();
				return s === 'delivered' || s === 'partial_delivered';
			}).length
		},
		{
			id: 'cancelled',
			label: 'বাতিল / রিটার্ন',
			count: orders.filter((o) => {
				const s = String(o.status || '').toLowerCase();
				return s === 'cancelled' || s === 'returned' || s === 'pending_return';
			}).length
		}
	];

	// Filtered orders derivation
	let filteredOrders = $derived.by(() => {
		let list = orders;

		// Status filter
		if (selectedStatusFilter !== 'all') {
			list = list.filter((o) => {
				const s = String(o.status || '').toLowerCase();
				if (selectedStatusFilter === 'pending') return s === 'pending' || s === 'hold';
				if (selectedStatusFilter === 'processing') return s === 'processing' || s === 'confirmed' || s === 'printed';
				if (selectedStatusFilter === 'shipped') return s === 'shipped' || o.courierStatus === 'in_transit';
				if (selectedStatusFilter === 'delivered') return s === 'delivered' || s === 'partial_delivered';
				if (selectedStatusFilter === 'cancelled') return s === 'cancelled' || s === 'returned' || s === 'pending_return';
				return true;
			});
		}

		// Search query filter
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter((o) => {
				const matchOrder = (o.orderNumber || o.id || '').toLowerCase().includes(q);
				const matchTracking = (o.trackingCode || '').toLowerCase().includes(q);
				const matchSummary = (o.itemsSummary || '').toLowerCase().includes(q);
				const matchAddress = (o.shippingAddress || '').toLowerCase().includes(q);
				return matchOrder || matchTracking || matchSummary || matchAddress;
			});
		}

		return list;
	});
</script>

<div class="space-y-5 font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Filter & Search Toolbar (Daraz Style) -->
	<div class="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
		<!-- Search Bar -->
		<div class="relative">
			<Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
			<input
				type="text"
				placeholder="অর্ডার নম্বর (#ORD-...), ট্র্যাকিং আইডি বা পণ্যের নাম দিয়ে খুঁজুন..."
				bind:value={searchQuery}
				class="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5845eb]/20 transition-all"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => (searchQuery = '')}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
					aria-label="Clear Search"
				>
					<X class="w-3.5 h-3.5" />
				</button>
			{/if}
		</div>

		<!-- Status Pills Navigation -->
		<div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
			{#each STATUS_TABS as tab}
				{@const isSelected = selectedStatusFilter === tab.id}
				<button
					type="button"
					onclick={() => (selectedStatusFilter = tab.id as any)}
					class="px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 {isSelected
						? 'bg-[#5845eb] text-white shadow-xs shadow-indigo-500/20'
						: 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700'}"
				>
					<span>{tab.label}</span>
					{#if tab.count > 0}
						<span
							class="px-1.5 py-0.2 rounded-full text-[10px] font-mono {isSelected
								? 'bg-white/25 text-white'
								: 'bg-slate-200 text-slate-700'}"
						>
							{tab.count}
						</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Orders List -->
	{#if filteredOrders.length > 0}
		<div class="space-y-4">
			{#each filteredOrders as order (order.id)}
				<OrderCard {order} onViewInvoice={openInvoice} />
			{/each}
		</div>
	{:else}
		<!-- Empty State -->
		<div class="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 shadow-2xs">
			<div class="w-16 h-16 rounded-3xl bg-indigo-50 text-[#5845eb] flex items-center justify-center mx-auto shadow-2xs">
				<ShoppingBag class="w-8 h-8 stroke-[1.8]" />
			</div>
			<div class="space-y-1">
				<h3 class="text-base font-bold text-slate-800">কোনো অর্ডার পাওয়া যায়নি</h3>
				<p class="text-xs text-slate-500 max-w-sm mx-auto">
					{#if searchQuery || selectedStatusFilter !== 'all'}
						আপনার ফিল্টার বা সার্চ কোয়েরিতে কোনো অর্ডার ম্যাচ করেনি। ফিল্টার ক্লিয়ার করে দেখুন।
					{:else}
						আপনি এখনো আমাদের স্টোর থেকে কোনো কেনাকাটা করেননি। আপনার পছন্দের পণ্যটি আজই অর্ডার করুন!
					{/if}
				</p>
			</div>

			<div class="pt-2">
				{#if searchQuery || selectedStatusFilter !== 'all'}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => { selectedStatusFilter = 'all'; searchQuery = ''; }}
						class="text-xs font-bold rounded-xl"
					>
						সব ফিল্টার রিসেট করুন
					</Button>
				{:else}
					<Button
						href="/"
						size="sm"
						class="text-xs font-bold gap-1.5 rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white shadow-xs"
					>
						<span>শপিং শুরু করুন</span>
						<ArrowRight class="w-3.5 h-3.5" />
					</Button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Invoice Modal -->
<OrderInvoiceModal
	bind:isOpen={isInvoiceModalOpen}
	order={selectedInvoiceOrder}
	onClose={() => (isInvoiceModalOpen = false)}
/>

