<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Card,
		Button,
		Badge,
		Input,
		Dialog
	} from '#lib/components/ui';
	import {
		Truck,
		ExternalLink,
		PackageCheck,
		RotateCw,
		CheckCircle2,
		AlertCircle,
		Send,
		ShieldCheck
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { getCourierTrackingUrl, type CourierProviderId } from '#lib/utils/courier';

	interface Props {
		orderId: string;
		orderNumber?: string;
		customerName: string;
		customerPhone: string;
		shippingAddress: string;
		codAmount: number;
		courierProvider?: string;
		trackingCode?: string;
		consignmentId?: string;
		courierStatus?: string;
		availableCouriers?: any[];
		defaultCourier?: string;
		isModalOpen?: boolean;
		onBookingSuccess?: (result: {
			trackingCode: string;
			consignmentId?: string;
			trackingUrl?: string;
			courierName: string;
		}) => void;
	}

	let {
		orderId,
		orderNumber,
		customerName,
		customerPhone,
		shippingAddress,
		codAmount,
		courierProvider = $bindable(),
		trackingCode = $bindable(),
		consignmentId = $bindable(),
		courierStatus = $bindable(),
		availableCouriers = [],
		defaultCourier = 'steadfast',
		isModalOpen = $bindable(false),
		onBookingSuccess
	}: Props = $props();

	// Modal state
	let selectedProvider = $state<CourierProviderId>((defaultCourier as CourierProviderId) || 'steadfast');
	let isBooking = $state(false);
	let specialNote = $state('');

	// Sync when default changes
	$effect(() => {
		if (defaultCourier && !selectedProvider) {
			selectedProvider = defaultCourier as CourierProviderId;
		}
	});

	const COURIER_META: Record<string, { name: string; color: string; border: string; bg: string }> = {
		steadfast: { name: 'Steadfast Courier', color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
		pathao: { name: 'Pathao Courier', color: 'text-rose-700', border: 'border-rose-200', bg: 'bg-rose-50' },
		redx: { name: 'REDX', color: 'text-red-700', border: 'border-red-200', bg: 'bg-red-50' },
		paperfly: { name: 'Paperfly', color: 'text-sky-700', border: 'border-sky-200', bg: 'bg-sky-50' },
		carrybee: { name: 'CarryBee', color: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50' }
	};

	let trackingUrl = $derived.by(() => {
		if (!trackingCode) return '';
		return getCourierTrackingUrl(courierProvider || 'steadfast', trackingCode, consignmentId);
	});

	function openBookingModal() {
		isModalOpen = true;
	}
</script>

<Card class="p-4 bg-white/95 shadow-xs border-slate-200/90 space-y-3.5">
	<!-- Card Header -->
	<div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
		<div class="flex items-center gap-2">
			<div class="p-1.5 rounded-lg bg-blue-50 text-blue-600">
				<Truck class="w-4 h-4" />
			</div>
			<div>
				<h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">
					কুরিয়ার পার্সেল স্ট্যাটাস
				</h3>
				<p class="text-[10px] text-slate-500 font-medium">লাইভ বুকিং ও ট্র্যাকিং ইন্টিগ্রেশন</p>
			</div>
		</div>

		{#if trackingCode}
			<Badge variant="outline" class="text-[10px] font-bold text-emerald-700 bg-emerald-50 border-emerald-200 gap-1 py-0.5">
				<PackageCheck class="w-3 h-3 text-emerald-600" />
				<span>বুকিং সম্পন্ন</span>
			</Badge>
		{:else}
			<Badge variant="outline" class="text-[10px] font-bold text-amber-700 bg-amber-50 border-amber-200 gap-1 py-0.5">
				<AlertCircle class="w-3 h-3 text-amber-600" />
				<span>আনবুকড</span>
			</Badge>
		{/if}
	</div>

	<!-- Card Body -->
	{#if trackingCode}
		<!-- Booked State -->
		<div class="space-y-3">
			<div class="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-[11px] font-semibold text-slate-500">কুরিয়ার প্রোভাইডার</span>
					<span class="text-xs font-black text-slate-900">{courierProvider || 'Steadfast Courier'}</span>
				</div>
				<div class="flex items-center justify-between pt-1 border-t border-slate-200/60">
					<span class="text-[11px] font-semibold text-slate-500">ট্র্যাকিং কোড</span>
					<span class="text-xs font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
						{trackingCode}
					</span>
				</div>
				{#if consignmentId && consignmentId !== trackingCode}
					<div class="flex items-center justify-between pt-1 border-t border-slate-200/60">
						<span class="text-[11px] font-semibold text-slate-500">কনসাইনমেন্ট আইডি</span>
						<span class="text-xs font-mono font-bold text-slate-700">{consignmentId}</span>
					</div>
				{/if}
				<div class="flex items-center justify-between pt-1 border-t border-slate-200/60">
					<span class="text-[11px] font-semibold text-slate-500">পার্সেল অবস্থা</span>
					<span class="text-xs font-bold text-emerald-600 flex items-center gap-1">
						<CheckCircle2 class="w-3.5 h-3.5" />
						<span>ইন ট্রানজিট (In Transit)</span>
					</span>
				</div>
			</div>

			<!-- Actions -->
			<div class="grid grid-cols-2 gap-2 pt-1">
				{#if trackingUrl}
					<Button
						variant="outline"
						size="sm"
						href={trackingUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="h-8 gap-1.5 text-xs font-bold text-[#5845eb] border-indigo-200 hover:bg-indigo-50"
					>
						<ExternalLink class="w-3.5 h-3.5" />
						<span>লাইভ ট্র্যাক</span>
					</Button>
				{/if}
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={openBookingModal}
					class="h-8 gap-1.5 text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-100 {trackingUrl ? '' : 'col-span-2'}"
				>
					<RotateCw class="w-3 h-3" />
					<span>রি-বুক / পরিবর্তন</span>
				</Button>

				<form
					action="?/resetCourierBooking"
					method="POST"
					use:enhance={() => {
						return async ({ result, update }) => {
							await update();
							if (result.type === 'success') {
								trackingCode = '';
								consignmentId = '';
								courierProvider = '';
								courierStatus = '';
								toast.success('কুরিয়ার বুকিং রিসেট করা হয়েছে!');
							}
						};
					}}
					class="col-span-2 pt-1 border-t border-slate-100 text-center"
				>
					<input type="hidden" name="orderId" value={orderId} />
					<button
						type="submit"
						class="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
					>
						✕ বুকিং বাতিল ও রিসেট করুন
					</button>
				</form>
			</div>
		</div>
	{:else}
		<!-- Unbooked State -->
		<div class="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-2.5 text-center">
			<p class="text-xs text-slate-600 font-medium">
				অর্ডারের পার্সেলটি এখনও কোনো কুরিয়ারে বুক করা হয়নি।
			</p>
			<Button
				type="button"
				size="sm"
				onclick={openBookingModal}
				class="w-full h-8 gap-1.5 text-xs font-bold bg-[#5845eb] hover:bg-[#4836d4] text-white shadow-xs"
			>
				<Send class="w-3.5 h-3.5" />
				<span>কুরিয়ারে পার্সেল বুক করুন</span>
			</Button>
		</div>
	{/if}
</Card>

<!-- Modal: Courier Booking Dialog (100% shadcn) -->
<Dialog
	bind:open={isModalOpen}
	title="কুরিয়ার গেটওয়েতে পার্সেল বুকিং"
	description="অর্ডার #{orderNumber || orderId.slice(0, 8)} সরাসরি কুরিয়ার API-তে এন্ট্রি করা হবে।"
>
	<form
		action="?/bookToCourier"
		method="POST"
		use:enhance={() => {
			isBooking = true;
			return async ({ result, update }) => {
				await update();
				isBooking = false;
				if (result.type === 'success' && result.data) {
					isModalOpen = false;
					const res = result.data as any;
					trackingCode = res.trackingCode;
					consignmentId = res.consignmentId || res.trackingCode;
					courierProvider = res.courierName || selectedProvider;
					courierStatus = 'in_transit';
					toast.success(res.message || 'কুরিয়ার বুকিং সফল হয়েছে!');
					onBookingSuccess?.({
						trackingCode: res.trackingCode,
						consignmentId: res.consignmentId,
						trackingUrl: res.trackingUrl,
						courierName: res.courierName || selectedProvider
					});
				} else if (result.type === 'failure') {
					toast.error((result.data as any)?.message || 'কুরিয়ার বুকিং ব্যর্থ হয়েছে!');
				}
			};
		}}
		class="space-y-4 pt-2"
	>
		<input type="hidden" name="orderId" value={orderId} />
		<input type="hidden" name="provider" value={selectedProvider} />

		<!-- 1. Select Courier Gateway -->
		<div class="space-y-2">
			<label class="text-xs font-bold text-slate-700 block">
				কুরিয়ার সার্ভিস নির্বাচন করুন
			</label>
			<div class="grid grid-cols-2 gap-2">
				{#each (availableCouriers.length > 0 ? availableCouriers : [{ id: 'steadfast', name: 'Steadfast Courier' }, { id: 'pathao', name: 'Pathao Courier' }, { id: 'redx', name: 'REDX' }, { id: 'paperfly', name: 'Paperfly' }, { id: 'carrybee', name: 'CarryBee' }]) as courier}
					{@const isSelected = selectedProvider === courier.id}
					<button
						type="button"
						onclick={() => (selectedProvider = courier.id)}
						class="flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer {isSelected ? 'border-[#5845eb] bg-indigo-50/60 ring-2 ring-[#5845eb]/20' : 'border-slate-200 bg-white hover:bg-slate-50'}"
					>
						<div class="truncate">
							<span class="text-xs font-bold text-slate-900 block truncate">{courier.name}</span>
							{#if courier.isDefault || courier.id === defaultCourier}
								<span class="text-[10px] font-semibold text-indigo-600 block">ডিফল্ট</span>
							{/if}
						</div>
						{#if isSelected}
							<CheckCircle2 class="w-4 h-4 text-[#5845eb] shrink-0" />
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<!-- 2. Consignment Summary -->
		<div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
			<div class="flex justify-between">
				<span class="text-slate-500 font-medium">প্রাপকের নাম:</span>
				<span class="font-bold text-slate-800">{customerName}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-slate-500 font-medium">ফোন নম্বর:</span>
				<span class="font-bold text-slate-800 font-mono">{customerPhone}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-slate-500 font-medium">ক্যাশ অন ডেলিভারি (COD):</span>
				<span class="font-black text-[#5845eb] font-mono">৳{codAmount}</span>
			</div>
			<div class="pt-1 border-t border-slate-200/60">
				<span class="text-slate-500 font-medium block">ডেলিভারি ঠিকানা:</span>
				<span class="font-medium text-slate-700 block text-[11px] leading-snug mt-0.5">{shippingAddress}</span>
			</div>
		</div>

		<!-- 3. Special Instruction -->
		<div class="space-y-1.5">
			<label class="text-xs font-bold text-slate-700 block">
				রাইডার নোট / স্পেশাল ইনস্ট্রাকশন (ঐচ্ছিক)
			</label>
			<Input
				bind:value={specialNote}
				name="note"
				placeholder="উদাঃ সাবধানে ডেলিভারি করুন। কাঁচের পণ্য রয়েছে।"
				class="h-9 text-xs"
			/>
		</div>

		<div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={() => (isModalOpen = false)}
				disabled={isBooking}
				class="text-xs h-9"
			>
				বাতিল
			</Button>
			<Button
				type="submit"
				size="sm"
				disabled={isBooking}
				class="text-xs h-9 gap-1.5 bg-[#5845eb] hover:bg-[#4836d4] text-white shadow-xs"
			>
				{#if isBooking}
					<RotateCw class="w-3.5 h-3.5 animate-spin" />
					<span>API-তে বুকিং হচ্ছে...</span>
				{:else}
					<Send class="w-3.5 h-3.5" />
					<span>পার্সেল কনফার্ম করুন</span>
				{/if}
			</Button>
		</div>
	</form>
</Dialog>
