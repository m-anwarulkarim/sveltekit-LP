<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Card, Badge, Input, Textarea } from '#lib/components/ui';
	import {
		ArrowLeft,
		CheckCircle2,
		ShoppingBag,
		User,
		Phone,
		MapPin,
		Package,
		Truck
	} from 'lucide-svelte';

	let customerName = $state('');
	let customerPhone = $state('');
	let shippingAddress = $state('');
	let productName = $state('AURA Spectrum X');
	let quantity = $state(1);
	let unitPrice = $state(1290);
	let deliveryCharge = $state(60);
	let advancePaid = $state(0);
	let isSubmitting = $state(false);
	let successMessage = $state<string | null>(null);

	let subtotal = $derived(quantity * unitPrice);
	let total = $derived(subtotal + deliveryCharge - advancePaid);
</script>

<div class="space-y-6 max-w-4xl mx-auto">

	<!-- Header & Back Button -->
	<div class="flex items-center justify-between gap-4 pb-2">
		<div class="flex items-center gap-3">
			<Button variant="outline" size="sm" href="/admin/orders" class="gap-1.5">
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Orders</span>
			</Button>
			<div>
				<h1 class="text-2xl font-black text-slate-900 tracking-tight">New Order</h1>
				<p class="text-xs text-slate-500 mt-0.5">ফোন বা সোশ্যাল মিডিয়া থেকে আসা ম্যানুয়াল অর্ডার এন্ট্রি করুন</p>
			</div>
		</div>

		<Badge variant="purple" class="px-2.5 py-1 text-xs">
			Manual Entry
		</Badge>
	</div>

	<!-- Success Banner -->
	{#if successMessage}
		<div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between animate-in fade-in">
			<div class="flex items-center gap-2">
				<CheckCircle2 class="w-4 h-4 text-emerald-600" />
				<span>{successMessage}</span>
			</div>
			<Button size="sm" href="/admin/orders" class="bg-emerald-600 hover:bg-emerald-700">
				অর্ডার তালিকায় দেখুন
			</Button>
		</div>
	{/if}

	<!-- Form Formatted with shadcn Cards -->
	<form
		action="?/createManualOrder"
		method="POST"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result, update }) => {
				isSubmitting = false;
				if (result.type === 'success') {
					successMessage = 'অর্ডারটি সফলভাবে তৈরি এবং সংরক্ষিত হয়েছে!';
					customerName = '';
					customerPhone = '';
					shippingAddress = '';
					setTimeout(() => {
						goto('/admin/orders');
					}, 1500);
				} else {
					await update();
				}
			};
		}}
		class="grid grid-cols-1 md:grid-cols-3 gap-6"
	>
		<!-- Left 2 Cols: Customer & Product Details -->
		<div class="md:col-span-2 space-y-6">

			<!-- 1. Customer Information Card -->
			<Card class="p-6 space-y-4">
				<div class="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
					<User class="w-4 h-4 text-[#5845eb]" />
					<span>কাস্টমার তথ্য</span>
				</div>

				<div class="space-y-3">
					<div class="space-y-1.5">
						<label for="c-name" class="text-xs font-bold text-slate-700">কাস্টমারের পূর্ণ নাম *</label>
						<Input
							id="c-name"
							name="customerName"
							bind:value={customerName}
							placeholder="উদাঃ মোঃ সাকিব হাসান"
							required
						/>
					</div>

					<div class="space-y-1.5">
						<label for="c-phone" class="text-xs font-bold text-slate-700">মোবাইল নম্বর *</label>
						<Input
							id="c-phone"
							name="customerEmail"
							bind:value={customerPhone}
							placeholder="উদাঃ 01700000000"
							type="tel"
							required
						/>
					</div>

					<div class="space-y-1.5">
						<label for="c-address" class="text-xs font-bold text-slate-700">পূর্ণ ডেলিভারি ঠিকানা *</label>
						<Textarea
							id="c-address"
							name="shippingAddress"
							bind:value={shippingAddress}
							placeholder="উদাঃ বাসা ১২, রোড ৪, সেক্টর ৭, উত্তরা, ঢাকা"
							rows={3}
							required
						/>
					</div>
				</div>
			</Card>

			<!-- 2. Product Information Card -->
			<Card class="p-6 space-y-4">
				<div class="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
					<Package class="w-4 h-4 text-[#5845eb]" />
					<span>পণ্যের বিবরণ</span>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="sm:col-span-2 space-y-1.5">
						<label for="p-name" class="text-xs font-bold text-slate-700">পণ্যের নাম</label>
						<Input
							id="p-name"
							name="productName"
							bind:value={productName}
						/>
					</div>

					<div class="space-y-1.5">
						<label for="p-qty" class="text-xs font-bold text-slate-700">পরিমাণ</label>
						<Input
							id="p-qty"
							type="number"
							min="1"
							bind:value={quantity}
						/>
					</div>

					<div class="space-y-1.5">
						<label for="p-price" class="text-xs font-bold text-slate-700">একক মূল্য (৳)</label>
						<Input
							id="p-price"
							type="number"
							bind:value={unitPrice}
						/>
					</div>
				</div>
			</Card>

		</div>

		<!-- Right 1 Col: Order Summary & Confirmation -->
		<div class="space-y-6">

			<Card class="p-6 space-y-5">
				<div class="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
					<Truck class="w-4 h-4 text-[#5845eb]" />
					<span>বিল ও পেমেন্ট সামারি</span>
				</div>

				<!-- Delivery Charge Options -->
				<div class="space-y-2">
					<span class="text-xs font-bold text-slate-700 block">ডেলিভারি এলাকা</span>
					<div class="grid grid-cols-2 gap-2">
						<button
							type="button"
							onclick={() => (deliveryCharge = 60)}
							class="p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer {deliveryCharge === 60
								? 'bg-indigo-50 border-[#5845eb] text-[#5845eb]'
								: 'border-slate-200 text-slate-600 hover:bg-slate-50'}"
						>
							ঢাকার ভেতরে (৳৬০)
						</button>
						<button
							type="button"
							onclick={() => (deliveryCharge = 120)}
							class="p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer {deliveryCharge === 120
								? 'bg-indigo-50 border-[#5845eb] text-[#5845eb]'
								: 'border-slate-200 text-slate-600 hover:bg-slate-50'}"
						>
							ঢাকার বাইরে (৳১২০)
						</button>
					</div>
				</div>

				<!-- Advance Payment -->
				<div class="space-y-1.5">
					<label for="advance" class="text-xs font-bold text-slate-700">অগ্রিম প্রদান (৳)</label>
					<Input
						id="advance"
						type="number"
						min="0"
						bind:value={advancePaid}
					/>
				</div>

				<!-- Summary Breakdown -->
				<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
					<div class="flex items-center justify-between text-slate-600">
						<span>সাবটোটাল</span>
						<span class="font-mono font-bold">৳{subtotal}</span>
					</div>
					<div class="flex items-center justify-between text-slate-600">
						<span>ডেলিভারি চার্জ</span>
						<span class="font-mono font-bold">৳{deliveryCharge}</span>
					</div>
					{#if advancePaid > 0}
						<div class="flex items-center justify-between text-emerald-600 font-bold">
							<span>অগ্রিম পরিশোধ</span>
							<span class="font-mono">-৳{advancePaid}</span>
						</div>
					{/if}
					<div class="flex items-center justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
						<span>সর্বমোট বকেয়া</span>
						<span class="font-mono text-[#5845eb]">৳{total}</span>
					</div>
				</div>

				<input type="hidden" name="total" value={total} />
				<input type="hidden" name="status" value="pending" />

				<!-- Submit Button -->
				<Button
					type="submit"
					loading={isSubmitting}
					class="w-full h-11 text-sm shadow-md shadow-indigo-600/20"
				>
					<ShoppingBag class="w-4 h-4" />
					<span>ম্যানুয়াল অর্ডার কনফার্ম করুন</span>
				</Button>
			</Card>

		</div>
	</form>

</div>
