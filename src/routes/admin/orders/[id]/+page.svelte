<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, Button, Badge } from '#lib/components/ui';
	import { CheckCircle2, Check, Printer } from 'lucide-svelte';
	import {
		OrderDetailsHeader,
		CustomerQuickBar,
		OrderedItemsTable,
		ProductUpsellSelector,
		OrderFinancialFooter,
		OrderCourierCard,
		CourierFraudCard,
		CustomerProfileCard,
		OrderCallNotes,
		OrderVisitorMetaCard
	} from '../../_components/orders/index.ts';

	let { data }: { data: any } = $props();

	// Reactive Order State
	let orderId = $state(data?.order?.id || '');
	let status = $state(data?.order?.status || 'pending');
	let customerName = $state(data?.order?.customerName || '');
	let customerPhone = $state(data?.order?.customerPhone || data?.order?.customerEmail || '');
	let altPhone = $state(data?.order?.alternatePhone || data?.order?.altPhone || '');
	let shippingAddress = $state(data?.order?.shippingAddress || '');
	let courierProvider = $state(data?.order?.courierProvider || '');
	let trackingCode = $state(data?.order?.trackingCode || '');
	let consignmentId = $state(data?.order?.consignmentId || '');
	let courierStatus = $state(data?.order?.courierStatus || '');
	let isCourierModalOpen = $state(false);
	let items = $state<any[]>(
		Array.isArray(data?.items) && data.items.length > 0
			? data.items
			: Array.isArray(data?.order?.items)
				? data.order.items
				: typeof data?.order?.items === 'string'
					? (() => {
							try {
								return JSON.parse(data.order.items);
							} catch {
								return [];
							}
						})()
					: []
	);
	let createdAt = $state(data?.order?.createdAt);

	// Financials
	let discount = $state(Number(data?.order?.discountAmount) || Number(data?.order?.discount) || 0);
	let deliveryFee = $state(Number(data?.order?.deliveryCharge) || Number(data?.order?.deliveryFee) || 60);
	let advancePaid = $state(Number(data?.order?.advancePayment) || Number(data?.order?.advancePaid) || 0);

	// Synchronize when data changes
	$effect(() => {
		if (data?.order) {
			orderId = data.order.id;
			status = data.order.status || 'pending';
			customerName = data.order.customerName || '';
			customerPhone = data.order.customerPhone || data.order.customerEmail || '';
			altPhone = data.order.alternatePhone || data.order.altPhone || '';
			shippingAddress = data.order.shippingAddress || '';
			if (Array.isArray(data.items) && data.items.length > 0) {
				items = data.items;
			} else if (Array.isArray(data.order.items)) {
				items = data.order.items;
			}
			discount = Number(data.order.discountAmount) || Number(data.order.discount) || 0;
			deliveryFee = Number(data.order.deliveryCharge) || Number(data.order.deliveryFee) || 60;
			advancePaid = Number(data.order.advancePayment) || Number(data.order.advancePaid) || 0;
			courierProvider = data.order.courierProvider || '';
			trackingCode = data.order.trackingCode || '';
			consignmentId = data.order.consignmentId || '';
			courierStatus = data.order.courierStatus || '';
			createdAt = data.order.createdAt;
		}
	});

	// Intelligence & Notes
	let callNotes = $state<any[]>(data.initialNotes || []);
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

	// Subtotal & Total
	let subtotal = $derived.by(() => {
		if (!Array.isArray(items)) return 0;
		return items.reduce((acc: number, it: any) => acc + (Number(it.price) * Number(it.quantity) || 0), 0);
	});

	let totalPayable = $derived.by(() => {
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
		isSaving = true;
		if (saveFormEl) {
			saveFormEl.requestSubmit();
		} else {
			setTimeout(() => {
				isSaving = false;
				showToast('অর্ডার তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
			}, 600);
		}
	}

	function handleStatusChange(newStatus: string) {
		status = newStatus;
		handleSave();
	}

	function handleConfirm() {
		status = 'confirmed';
		handleSave();
		showToast('অর্ডার কনফার্ম করা হয়েছে এবং কনফার্মড লিস্টে সরানো হয়েছে!');
	}

	function handleCancel() {
		status = 'cancelled';
		handleSave();
		showToast('অর্ডার বাতিল করা হয়েছে!');
	}

	function handlePrint() {
		window.print();
	}

	function handleSendToCourier() {
		isCourierModalOpen = true;
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
			showToast(`কাস্টমার (${customerPhone}) এবং আইপি ব্লক করা হয়েছে!`);
		} else {
			showToast(`কাস্টমার ব্লক প্রত্যাহার করা হয়েছে!`);
		}
	}
</script>

<svelte:head>
	<title>Order #{data.order?.orderNumber || orderId.slice(0, 8)} - বিস্তারিত ও সম্পাদনা | AURA Pro</title>
</svelte:head>

<div class="space-y-4 pb-12 print:p-0 print:space-y-2">
	
	<!-- 1. Header with Actions -->
	<div class="print:hidden">
		<OrderDetailsHeader
			{orderId}
			orderNumber={data.order?.orderNumber}
			bind:status
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
						catalogProducts={data.availableProducts || data.products || []}
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
					onSave={handleSave}
					onConfirm={handleConfirm}
					onPrint={handlePrint}
				/>
			</div>
		</div>

		<!-- Right Section: Intelligence & Customer History (4 cols - Intact) -->
		<div class="lg:col-span-4 space-y-4 flex flex-col">
			<!-- Active Courier Consignment & Live Booking -->
			<OrderCourierCard
				orderId={orderId}
				orderNumber={data.order?.orderNumber}
				customerName={customerName}
				customerPhone={customerPhone}
				shippingAddress={shippingAddress}
				codAmount={totalPayable}
				bind:courierProvider
				bind:trackingCode
				bind:consignmentId
				bind:courierStatus
				bind:isModalOpen={isCourierModalOpen}
				availableCouriers={data.courierMethods}
				defaultCourier={data.defaultCourier}
				onBookingSuccess={(res) => {
					status = 'shipped';
					handleAddNote(`পার্সেল ${res.courierName}-এ বুকিং সম্পন্ন। ট্র্যাকিং আইডি: ${res.trackingCode}`);
				}}
			/>

			<!-- Courier & Fraud Check -->
			<CourierFraudCard
				phone={customerPhone}
				stats={data.courierStats}
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
				pastOrders={data.pastOrders}
				currentOrderId={orderId}
			/>

			<!-- Visitor & Device Info -->
			<OrderVisitorMetaCard
				bind:isBanned
				onToggleBan={handleToggleBan}
			/>
		</div>

	</div>

</div>

<!-- Hidden Action Form for Server Persistence via SvelteKit Form Actions -->
<form
	bind:this={saveFormEl}
	action="?/saveOrder"
	method="POST"
	use:enhance={() => {
		isSaving = true;
		return async ({ result, update }) => {
			await update();
			isSaving = false;
			if (result.type === 'success') {
				showToast('অর্ডার তথ্য সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!');
			}
		};
	}}
	class="hidden"
>
	<input type="hidden" name="orderId" value={orderId} />
	<input type="hidden" name="customerName" value={customerName} />
	<input type="hidden" name="customerPhone" value={customerPhone} />
	<input type="hidden" name="altPhone" value={altPhone} />
	<input type="hidden" name="shippingAddress" value={shippingAddress} />
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
			<p class="text-xs text-gray-600">e-Commerce Delivery Invoice & Delivery Challan</p>
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
			<p class="font-bold text-sm mt-1">{customerName}</p>
			<p class="font-mono mt-0.5">মোবাইল: {customerPhone}</p>
			{#if altPhone}
				<p class="font-mono">বিকল্প: {altPhone}</p>
			{/if}
			<p class="mt-1 text-gray-700">{shippingAddress}</p>
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

