<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Card, Button, Badge } from '#lib/components/ui';
	import { CheckCircle2, Check, Printer } from 'lucide-svelte';
	import {
		OrderDetailsHeader,
		CustomerQuickBar,
		OrderedItemsTable,
		ProductUpsellSelector,
		OrderFinancialFooter,
		CourierFraudCard,
		CustomerProfileCard,
		OrderCallNotes,
		OrderVisitorMetaCard
	} from '../../_components/orders/index.ts';

	let { data }: { data: any } = $props();

	// New order starts completely fresh with empty fields
	let generatedId = 'AUR-' + Math.floor(10000 + Math.random() * 90000);
	let orderId = $state(generatedId);
	let status = $state('pending');
	let customerName = $state('');
	let customerPhone = $state('');
	let altPhone = $state('');
	let shippingAddress = $state('');

	// Initially empty: staff chooses products using the live search upsell panel
	let items = $state<any[]>([]);

	let createdAt = $state(new Date());

	// Financials
	let discount = $state(0);
	let deliveryFee = $state(60);
	let advancePaid = $state(0);

	// Intelligence & Notes start clean
	let callNotes = $state<any[]>([]);
	let isBanned = $state(false);
	let isSaving = $state(false);

	// Toast Feedback
	let toastMessage = $state<string | null>(null);
	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3000);
	}

	// Dynamic Customer History Search from Parent Data (only when phone is typed)
	let matchedPastOrders = $derived.by(() => {
		if (!customerPhone || customerPhone.trim().length < 6) return [];
		return (data.orders || [])
			.filter((o: any) => (o.customerEmail || '').includes(customerPhone.trim()))
			.map((o: any) => ({
				id: o.id,
				status: o.status,
				total: o.total,
				date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('bn-BD') : 'আজ'
			}));
	});

	// Dynamic Courier Risk Check for New Order (null when no phone is typed)
	let courierStats = $derived.by(() => {
		if (!customerPhone || customerPhone.trim().length < 6) return null;
		const pastCount = matchedPastOrders.length;
		if (pastCount === 0) {
			return {
				total: 0,
				delivered: 0,
				cancelled: 0,
				successRate: 0,
				courierName: 'Steadfast & Pathao'
			};
		}
		const delivered = matchedPastOrders.filter((o: any) =>
			['delivered', 'confirmed', 'processing'].includes(o.status)
		).length;
		const cancelled = matchedPastOrders.filter((o: any) => o.status === 'cancelled').length;
		const rate = Math.round((delivered / pastCount) * 100);
		return {
			total: pastCount,
			delivered,
			cancelled,
			successRate: rate,
			courierName: 'Steadfast & Pathao'
		};
	});

	// Subtotal & Total (returns 0 if no items added yet)
	let subtotal = $derived.by(() => {
		return items.reduce((acc: number, it: any) => acc + (Number(it.price) * Number(it.quantity) || 0), 0);
	});

	let totalPayable = $derived.by(() => {
		if (items.length === 0) return 0;
		const gross = subtotal;
		const disc = Math.max(0, Number(discount) || 0);
		const del = Math.max(0, Number(deliveryFee) || 0);
		const adv = Math.max(0, Number(advancePaid) || 0);
		return Math.max(0, gross - disc + del - adv);
	});

	// Cart Actions
	function handleUpdateQuantity(index: number, newQty: number) {
		if (newQty <= 0) {
			handleRemoveItem(index);
			return;
		}
		items[index].quantity = newQty;
	}

	function handleRemoveItem(index: number) {
		const removed = items[index];
		items = items.filter((_, i: number) => i !== index);
		showToast(`"${removed.name}" আইটেমটি সরানো হয়েছে`);
	}

	function handleAddProduct(product: any) {
		const existingIndex = items.findIndex((it: any) => it.id === product.id);
		if (existingIndex > -1) {
			items[existingIndex].quantity += 1;
			showToast(`"${product.name}" এর পরিমাণ বৃদ্ধি করা হয়েছে (+১)`);
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
			showToast(`"${product.name}" অর্ডারে যুক্ত হয়েছে!`);
		}
	}

	// Status & Flow Actions
	let saveFormEl: HTMLFormElement | null = $state(null);

	function handleSave() {
		if (!customerName.trim()) {
			showToast('দয়া করে কাস্টমারের নাম লিখুন!');
			return;
		}
		if (!customerPhone.trim()) {
			showToast('দয়া করে কাস্টমারের ফোন নম্বর লিখুন!');
			return;
		}
		if (!shippingAddress.trim()) {
			showToast('দয়া করে কাস্টমারের ডেলিভারি ঠিকানা লিখুন!');
			return;
		}
		if (items.length === 0) {
			showToast('অর্ডারে কমপক্ষে একটি পণ্য যোগ করুন!');
			return;
		}

		isSaving = true;
		if (saveFormEl) {
			saveFormEl.requestSubmit();
		}
	}

	function handleStatusChange(newStatus: string) {
		status = newStatus;
	}

	function handleConfirm() {
		status = 'confirmed';
		handleSave();
	}

	function handleCancel() {
		goto('/admin/orders');
	}

	function handlePrint() {
		window.print();
	}

	function handleSendToCourier() {
		showToast('অর্ডার তৈরি হওয়ার পর স্বয়ংক্রিয়ভাবে কুরিয়ারে এন্ট্রি হবে!');
	}

	function handleAddNote(noteText: string) {
		const newNote = {
			id: 'note-' + Date.now(),
			note: noteText,
			author: 'Admin Staff',
			time: 'এইমাত্র'
		};
		callNotes = [newNote, ...callNotes];
		showToast('নোট যোগ করা হয়েছে!');
	}

	function handleToggleBan() {
		isBanned = !isBanned;
		if (isBanned) {
			showToast(`কাস্টমার (${customerPhone}) ব্লক তালিকায় যোগ করা হয়েছে!`);
		} else {
			showToast(`কাস্টমার ব্লক প্রত্যাহার করা হয়েছে!`);
		}
	}
</script>

<svelte:head>
	<title>নতুন অর্ডার তৈরি (New Order) | AURA Pro</title>
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
			onShowToast={showToast}
		/>
	</div>

	<!-- 3. Master Grid (Left 8 cols: Products & Financials | Right 4 cols: Customer Info) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start print:hidden">
		
		<!-- Left Section: Products & Financials (8 cols) -->
		<div class="lg:col-span-8 space-y-4 flex flex-col">
			<!-- Row 1: Ordered Items (Left) + Product Upsell (Middle) -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
				<!-- Scope 1: Ordered Items (Left side, scrollable if many items, zero white gap) -->
				<div>
					<OrderedItemsTable
						bind:items
						onUpdateQuantity={handleUpdateQuantity}
						onRemoveItem={handleRemoveItem}
					/>
				</div>

				<!-- Scope 2: Product Search / Upsell (Middle, scrollable catalog, zero white gap) -->
				<div>
					<ProductUpsellSelector
						catalogProducts={data.products}
						orderedItems={items}
						onAddProduct={handleAddProduct}
					/>
				</div>
			</div>

			<!-- Row 2: Financial Summary Footer Bar (Placed cleanly below products) -->
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

		<!-- Column 3: Intelligence & Customer History (4 cols) -->
		<div class="lg:col-span-4 space-y-4 flex flex-col">
			<!-- Courier & Fraud Check -->
			<CourierFraudCard
				phone={customerPhone}
				stats={courierStats}
				onRefresh={() => showToast('কুরিয়ার ফ্রড ডেটা সফলভাবে রিলোড হয়েছে!')}
			/>

			<!-- Call Notes & Timeline -->
			<OrderCallNotes
				bind:notes={callNotes}
				onAddNote={handleAddNote}
			/>

			<!-- Customer Lifetime Profile -->
			<CustomerProfileCard
				{customerName}
				{customerPhone}
				{shippingAddress}
				pastOrders={matchedPastOrders}
				currentOrderId={orderId}
			/>

			<!-- Visitor & Device Info -->
			<OrderVisitorMetaCard
				meta={{
					source: 'ম্যানুয়াল এন্ট্রি / ফোন কল',
					fingerprint: 'manual_entry_agent',
					ip: '127.0.0.1 (Admin)',
					device: 'ডেস্কটপ (অ্যাডমিন ড্যাশবোর্ড)',
					totalVisits: 1,
					activeTime: 'অর্ডার তৈরির কাজ চলছে',
					avgLoad: '1.2s',
					firstVisit: 'আজ'
				}}
				bind:isBanned
				onToggleBan={handleToggleBan}
			/>
		</div>

	</div>

</div>

<!-- Hidden Action Form for Server Persistence via SvelteKit Form Actions -->
<form
	bind:this={saveFormEl}
	action="?/createManualOrder"
	method="POST"
	use:enhance={() => {
		isSaving = true;
		return async ({ result }) => {
			isSaving = false;
			if (result.type === 'success') {
				showToast('নতুন অর্ডার সফলভাবে তৈরি হয়েছে!');
				setTimeout(() => {
					goto('/admin/orders');
				}, 1200);
			} else {
				showToast('অর্ডার তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে সব তথ্য দিন।');
			}
		};
	}}
	class="hidden"
>
	<input type="hidden" name="orderId" value={orderId} />
	<input type="hidden" name="customerName" value={customerName} />
	<input type="hidden" name="customerEmail" value={customerPhone} />
	<input type="hidden" name="altPhone" value={altPhone} />
	<input type="hidden" name="shippingAddress" value={shippingAddress} />
	<input type="hidden" name="productName" value={items[0]?.name || 'AURA Product'} />
	<input type="hidden" name="items" value={JSON.stringify(items)} />
	<input type="hidden" name="discount" value={discount} />
	<input type="hidden" name="deliveryFee" value={deliveryFee} />
	<input type="hidden" name="advancePaid" value={advancePaid} />
	<input type="hidden" name="total" value={totalPayable} />
	<input type="hidden" name="status" value={status} />
</form>

<!-- Toast Notification -->
{#if toastMessage}
	<div class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
		<CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
		<span>{toastMessage}</span>
	</div>
{/if}

<!-- Printable Invoice / Challan Template (Active on window.print) -->
<div class="hidden print:block p-8 bg-white text-black font-sans max-w-2xl mx-auto border border-black/20 rounded">
	<!-- Invoice Header -->
	<div class="flex justify-between items-start border-b border-black pb-4">
		<div>
			<h1 class="text-2xl font-black tracking-tight">AURA PRO</h1>
			<p class="text-xs text-gray-600">New Order Memo & Delivery Challan</p>
		</div>
		<div class="text-right">
			<div class="text-lg font-black font-mono">#{orderId}</div>
			<div class="text-xs text-gray-500">তারিখ: {new Date().toLocaleDateString('bn-BD')}</div>
			<div class="text-xs font-bold uppercase mt-1">স্ট্যাটাস: {status}</div>
		</div>
	</div>

	<!-- Customer & Courier Info -->
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

	<!-- Items Table -->
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

	<!-- Calculation Summary -->
	<div class="py-3 flex justify-end text-xs">
		<div class="w-48 space-y-1 font-mono">
			<div class="flex justify-between">
				<span>সাবটোটাল:</span>
				<span>৳{subtotal}</span>
			</div>
			{#if discount > 0}
				<div class="flex justify-between text-gray-600">
					<span>ডিসকাউন্ট:</span>
					<span>- ৳{discount}</span>
				</div>
			{/if}
			<div class="flex justify-between">
				<span>ডেলিভারি চার্জ:</span>
				<span>+ ৳{deliveryFee}</span>
			</div>
			{#if advancePaid > 0}
				<div class="flex justify-between text-gray-600">
					<span>অগ্রিম গৃহীত:</span>
					<span>- ৳{advancePaid}</span>
				</div>
			{/if}
			<div class="flex justify-between font-bold text-sm border-t border-black pt-1">
				<span>কাস্টমার থেকে প্রদেয়:</span>
				<span>৳{totalPayable}</span>
			</div>
		</div>
	</div>

	<!-- Signature -->
	<div class="pt-8 flex justify-between text-[11px] text-gray-500">
		<div class="border-t border-gray-400 pt-1 w-32 text-center">কাস্টমার স্বাক্ষর</div>
		<div class="border-t border-gray-400 pt-1 w-32 text-center">অনুমোদনকারী স্বাক্ষর</div>
	</div>
</div>
