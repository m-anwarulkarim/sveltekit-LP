<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Card, Button, Badge } from '#lib/components/ui';
	import { CheckCircle2 } from 'lucide-svelte';
	import {
		OrderDetailsHeader,
		CustomerQuickBar,
		OrderedItemsTable,
		ProductUpsellSelector,
		OrderFinancialFooter,
		CourierFraudCard,
		SmartPosFraudCard,
		CustomerProfileCard,
		OrderCallNotes,
		OrderVisitorMetaCard
	} from '../../_components/orders/index.ts';

	let { data }: { data: any } = $props();

	let orderId = $state('AUR-' + Math.floor(10000 + Math.random() * 90000));
	let status = $state('pending');
	let customerName = $state('');
	let customerPhone = $state('');
	let altPhone = $state('');
	let shippingAddress = $state('');
	let items = $state<any[]>([]);
	let createdAt = $state(new Date());

	let discount = $state(0);
	let deliveryFee = $state(60);
	let advancePaid = $state(0);

	let callNotes = $state<any[]>([]);
	let isSaving = $state(false);
	let isBanned = $state(false);

	// Customer history search — match on customerPhone field (falls back to customerEmail)
	let matchedPastOrders = $derived.by(() => {
		if (!customerPhone || customerPhone.trim().length < 6) return [];
		const q = customerPhone.trim();
		return (data.orders || [])
			.filter((o: any) => (o.customerPhone || o.customerEmail || '').includes(q))
			.map((o: any) => ({
				id: o.id,
				orderNumber: o.orderNumber || o.order_number || (o.id ? o.id.slice(0, 8) : ''),
				status: o.status,
				total: o.total,
				date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('bn-BD') : 'আজ'
			}));
	});

	let courierStats = $derived.by(() => {
		if (!customerPhone || customerPhone.trim().length < 6) return null;
		const pastCount = matchedPastOrders.length;
		if (pastCount === 0) {
			return {
				total: 0,
				delivered: 0,
				cancelled: 0,
				successRate: 100,
				courierName: 'নতুন কাস্টমার (রেকর্ড নেই)',
				badgeLabel: 'নতুন কাস্টমার',
				isConfigured: false
			};
		}
		const delivered = matchedPastOrders.filter((o: any) =>
			['delivered', 'confirmed', 'processing'].includes(o.status)
		).length;
		const cancelled = matchedPastOrders.filter((o: any) => o.status === 'cancelled').length;
		const rate = Math.round((delivered / pastCount) * 100);
		return { total: pastCount, delivered, cancelled, successRate: rate, courierName: 'Steadfast & Pathao' };
	});

	let subtotal = $derived(
		items.reduce((acc: number, it: any) => acc + (Number(it.price) * Number(it.quantity) || 0), 0)
	);
	let totalPayable = $derived.by(() => {
		if (items.length === 0) return 0;
		const disc = Math.max(0, Number(discount) || 0);
		const del = Math.max(0, Number(deliveryFee) || 0);
		const adv = Math.max(0, Number(advancePaid) || 0);
		return Math.max(0, subtotal - disc + del - adv);
	});

	function handleUpdateQuantity(index: number, newQty: number) {
		if (newQty <= 0) { handleRemoveItem(index); return; }
		items[index].quantity = newQty;
	}

	function handleRemoveItem(index: number) {
		const removed = items[index];
		items = items.filter((_, i: number) => i !== index);
		toast.info(`"${removed.name}" আইটেমটি সরানো হয়েছে`);
	}

	function handleAddProduct(product: any) {
		const existingIndex = items.findIndex((it: any) => it.id === product.id);
		if (existingIndex > -1) {
			items[existingIndex].quantity += 1;
			toast.success(`"${product.name}" এর পরিমাণ বৃদ্ধি করা হয়েছে (+১)`);
		} else {
			items = [
				...items,
				{
					id: product.id,
					name: product.name,
					price: product.price,
					quantity: 1,
					image: product.image,
					variant: product.category !== '-' ? product.category : ''
				}
			];
			toast.success(`"${product.name}" অর্ডারে যুক্ত হয়েছে!`);
		}
	}

	let saveFormEl: HTMLFormElement | null = $state(null);

	function handleSave() {
		if (!customerName.trim()) { toast.error('দয়া করে কাস্টমারের নাম লিখুন!'); return; }
		if (!customerPhone.trim()) { toast.error('দয়া করে কাস্টমারের ফোন নম্বর লিখুন!'); return; }
		if (!shippingAddress.trim()) { toast.error('দয়া করে কাস্টমারের ডেলিভারি ঠিকানা লিখুন!'); return; }
		if (items.length === 0) { toast.error('অর্ডারে কমপক্ষে একটি পণ্য যোগ করুন!'); return; }
		isSaving = true;
		saveFormEl?.requestSubmit();
	}

	function handleStatusChange(newStatus: string) { status = newStatus; }

	function handleConfirm() { status = 'confirmed'; handleSave(); }

	function handleCancel() { goto('/admin/orders/list'); }

	function handlePrint() {
		if (items.length === 0) { toast.error('প্রিন্টের আগে অর্ডারে পণ্য যোগ করুন!'); return; }
		window.print();
	}

	function handleSendToCourier() {
		toast.info('অর্ডার তৈরি হওয়ার পর কুরিয়ার এন্ট্রি দেওয়া যাবে।');
	}

	function handleAddNote(noteText: string, _callStatus?: string) {
		const newNote = {
			id: 'note-' + Date.now(),
			note: noteText,
			author: 'Admin Staff',
			time: 'এইমাত্র'
		};
		callNotes = [newNote, ...callNotes];
		toast.success('নোট যোগ করা হয়েছে!');
	}

	function handleToggleBan() {
		isBanned = !isBanned;
		if (isBanned) {
			toast.info('অর্ডার সেভ হলে কাস্টমারের অর্ডার পেজ থেকে স্থায়ীভাবে ব্লক করুন।');
		} else {
			toast.info('ব্লক চিহ্ন সরানো হয়েছে।');
		}
	}
</script>

<svelte:head>
	<title>নতুন অর্ডার তৈরি (New Order) | Admin</title>
</svelte:head>

<div class="space-y-4 pb-12 print:p-0 print:space-y-2">

	<!-- 1. Header with Actions -->
	<div class="print:hidden">
		<OrderDetailsHeader
			{orderId}
			bind:status
			isNewOrder={true}
			title="নতুন অর্ডার তৈরি"
			{createdAt}
			{isSaving}
			onStatusChange={handleStatusChange}
			onConfirm={handleConfirm}
			onCancel={handleCancel}
			onSave={handleSave}
			onPrint={handlePrint}
			onSendToCourier={handleSendToCourier}
		/>
	</div>

	<!-- 2. Customer Quick Edit Bar -->
	<div class="print:hidden">
		<CustomerQuickBar
			{orderId}
			bind:customerName
			bind:customerPhone
			bind:altPhone
			bind:shippingAddress
			onShowToast={(msg) => toast.info(msg)}
		/>
	</div>

	<!-- 3. Master Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start print:hidden">

		<!-- Left: Products & Financials -->
		<div class="lg:col-span-8 space-y-4 flex flex-col lg:sticky lg:top-24 self-start">
			<div class="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
				<div>
					<OrderedItemsTable
						bind:items
						onUpdateQuantity={handleUpdateQuantity}
						onRemoveItem={handleRemoveItem}
					/>
				</div>
				<div>
					<ProductUpsellSelector
						catalogProducts={data.products}
						orderedItems={items}
						onAddProduct={handleAddProduct}
					/>
				</div>
			</div>

			<div>
				<OrderFinancialFooter
					{subtotal}
					bind:discount
					bind:deliveryFee
					bind:advancePaid
					{isSaving}
					saveLabel="অর্ডার তৈরি করুন"
					confirmLabel="অর্ডার তৈরি ও কনফার্ম"
					onSave={handleSave}
					onConfirm={handleConfirm}
					onPrint={handlePrint}
				/>
			</div>
		</div>

		<!-- Right: Intelligence -->
		<div class="lg:col-span-4 space-y-4 flex flex-col">
			<CourierFraudCard
				phone={customerPhone}
				stats={courierStats}
				storeName={data.websiteInfo?.websiteName || 'Store'}
				onRefresh={() => toast.success('কুরিয়ার ফ্রড ডেটা রিলোড হয়েছে!')}
			/>
			<SmartPosFraudCard phone={customerPhone} />
			<OrderCallNotes
				bind:notes={callNotes}
				onAddNote={handleAddNote}
			/>
			<CustomerProfileCard
				{customerName}
				{customerPhone}
				{shippingAddress}
				pastOrders={matchedPastOrders}
				currentOrderId={orderId}
			/>
			<OrderVisitorMetaCard
				meta={{
					source: 'ম্যানুয়াল এন্ট্রি / ফোন কল',
					fingerprint: 'manual_entry_agent',
					ip: '127.0.0.1 (Admin)',
					device: 'ডেস্কটপ (অ্যাডমিন ড্যাশবোর্ড)',
					totalVisits: 1,
					activeTime: 'অর্ডার তৈরির কাজ চলছে',
					avgLoad: '1.2s',
					firstVisit: 'আজ'
				}}
				{isBanned}
				onToggleBan={handleToggleBan}
			/>
		</div>

	</div>

</div>

<!-- Hidden Action Form -->
<form
	bind:this={saveFormEl}
	action="?/createManualOrder"
	method="POST"
	use:enhance={() => {
		return async ({ result }) => {
			isSaving = false;
			if (result.type === 'success') {
				toast.success('নতুন অর্ডার সফলভাবে তৈরি হয়েছে!');
				setTimeout(() => goto('/admin/orders/list'), 1200);
			} else {
				const msg = (result as any).data?.message || 'অর্ডার তৈরিতে সমস্যা হয়েছে।';
				toast.error(msg);
			}
		};
	}}
	class="hidden"
>
	<input type="hidden" name="orderId" value={orderId} />
	<input type="hidden" name="customerName" value={customerName} />
	<input type="hidden" name="customerPhone" value={customerPhone} />
	<input type="hidden" name="customerEmail" value={customerPhone} />
	<input type="hidden" name="altPhone" value={altPhone} />
	<input type="hidden" name="shippingAddress" value={shippingAddress} />
	<input type="hidden" name="productName" value={items[0]?.name || ''} />
	<input type="hidden" name="items" value={JSON.stringify(items)} />
	<input type="hidden" name="callNotes" value={JSON.stringify(callNotes.map(n => ({ note: n.note, author: n.author })))} />
	<input type="hidden" name="discount" value={discount} />
	<input type="hidden" name="deliveryFee" value={deliveryFee} />
	<input type="hidden" name="advancePaid" value={advancePaid} />
	<input type="hidden" name="total" value={totalPayable} />
	<input type="hidden" name="status" value={status} />
</form>

<!-- Printable Invoice / Challan -->
<div class="hidden print:block p-8 bg-white text-black font-sans max-w-2xl mx-auto border border-black/20 rounded">
	<div class="flex justify-between items-start border-b border-black pb-4">
		<div>
			<h1 class="text-2xl font-black tracking-tight">Haq Plus</h1>
			<p class="text-xs text-gray-600">New Order Memo & Delivery Challan</p>
		</div>
		<div class="text-right">
			<div class="text-lg font-black font-mono">#{orderId}</div>
			<div class="text-xs text-gray-500">তারিখ: {new Date().toLocaleDateString('bn-BD')}</div>
			<div class="text-xs font-bold uppercase mt-1">স্ট্যাটাস: {status}</div>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-4 py-4 border-b border-gray-300 text-xs">
		<div>
			<h3 class="font-bold text-gray-800 uppercase text-[10px]">কাস্টমার বিবরণ:</h3>
			<p class="font-bold text-sm mt-1">{customerName || 'গ্রাহকের নাম'}</p>
			<p class="font-mono mt-0.5">মোবাইল: {customerPhone || '01XXXXXXXXX'}</p>
			{#if altPhone}
				<p class="font-mono">বিকল্প: {altPhone}</p>
			{/if}
			<p class="mt-1 text-gray-700">{shippingAddress || 'ঠিকানা'}</p>
		</div>
		<div class="text-right">
			<h3 class="font-bold text-gray-800 uppercase text-[10px]">ডেলিভারি পার্টনার:</h3>
			<p class="font-bold text-sm mt-1">Steadfast Courier Ltd.</p>
			<p class="text-gray-600">ক্যাশ অন ডেলিভারি (COD)</p>
		</div>
	</div>

	<div class="py-4 border-b border-gray-300">
		<table class="w-full text-xs text-left">
			<thead>
				<tr class="border-b border-gray-400 font-bold uppercase text-[10px]">
					<th class="py-1">বিবরণ</th>
					<th class="py-1 text-center">পরিমাণ</th>
					<th class="py-1 text-right">মূল্য</th>
					<th class="py-1 text-right">মোট</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200">
				{#each items as item}
					<tr>
						<td class="py-2 font-medium">{item.name}</td>
						<td class="py-2 text-center font-mono">{item.quantity}</td>
						<td class="py-2 text-right font-mono">৳{item.price}</td>
						<td class="py-2 text-right font-mono font-bold">৳{item.price * item.quantity}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="py-3 flex justify-end text-xs">
		<div class="w-48 space-y-1 font-mono">
			<div class="flex justify-between"><span>সাবটোটাল:</span><span>৳{subtotal}</span></div>
			{#if discount > 0}
				<div class="flex justify-between text-gray-600"><span>ডিসকাউন্ট:</span><span>- ৳{discount}</span></div>
			{/if}
			<div class="flex justify-between"><span>ডেলিভারি চার্জ:</span><span>+ ৳{deliveryFee}</span></div>
			{#if advancePaid > 0}
				<div class="flex justify-between text-gray-600"><span>অগ্রিম গৃহীত:</span><span>- ৳{advancePaid}</span></div>
			{/if}
			<div class="flex justify-between font-bold text-sm border-t border-black pt-1">
				<span>কাস্টমার থেকে প্রদেয়:</span>
				<span>৳{totalPayable}</span>
			</div>
		</div>
	</div>

	<div class="pt-8 flex justify-between text-[11px] text-gray-500">
		<div class="border-t border-gray-400 pt-1 w-32 text-center">কাস্টমার স্বাক্ষর</div>
		<div class="border-t border-gray-400 pt-1 w-32 text-center">অনুমোদনকারী স্বাক্ষর</div>
	</div>
</div>
