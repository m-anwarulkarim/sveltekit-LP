<script lang="ts">
	import { MapPin, Plus, Check, Phone, User, Home, Building2, Trash2, Edit2, ShieldCheck } from 'lucide-svelte';
	import { Button, Input } from '#lib/components/ui';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	interface Props {
		customer: any;
		user: any;
		orders: any[];
	}

	let { customer, user, orders = [] }: Props = $props();

	let isAddingNew = $state(false);
	let isSaving = $state(false);

	// Form fields
	let recipientName = $state(customer?.name || user?.name || '');
	let phone = $state(customer?.phone || '');
	let address = $state(customer?.address || '');
	let city = $state(customer?.city || 'ঢাকা');
	let district = $state(customer?.district || 'ঢাকা');
	let deliveryArea = $state<'inside_dhaka' | 'outside_dhaka'>(
		customer?.city?.includes('ঢাকা') ? 'inside_dhaka' : 'outside_dhaka'
	);
	let addressLabel = $state<'home' | 'office'>('home');

	// Extract unique past shipping addresses from past orders for quick selection
	let pastOrderAddresses = $derived.by(() => {
		const list: any[] = [];
		const seen = new Set<string>();

		if (customer?.address) {
			seen.add(customer.address.trim().toLowerCase());
		}

		for (const o of orders) {
			if (o.shippingAddress && o.shippingAddress.trim().length > 5) {
				const norm = o.shippingAddress.trim().toLowerCase();
				if (!seen.has(norm)) {
					seen.add(norm);
					list.push({
						name: o.customerName || user?.name,
						phone: o.customerPhone || customer?.phone,
						address: o.shippingAddress,
						area: o.deliveryArea || 'inside_dhaka'
					});
				}
			}
		}
		return list;
	});

	function handleAreaChange(area: 'inside_dhaka' | 'outside_dhaka') {
		deliveryArea = area;
		if (area === 'inside_dhaka') {
			city = 'ঢাকা';
			district = 'ঢাকা';
		} else if (city === 'ঢাকা') {
			city = 'চট্টগ্রাম';
			district = 'চট্টগ্রাম';
		}
	}
</script>

<div class="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Address Book Header -->
	<div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="space-y-1">
			<div class="flex items-center gap-2">
				<div class="w-9 h-9 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center">
					<MapPin class="w-4.5 h-4.5 stroke-[2.2]" />
				</div>
				<div>
					<h2 class="text-base sm:text-lg font-black text-slate-900 tracking-tight">
						ঠিকানা খাতা (Address Book)
					</h2>
					<p class="text-xs text-slate-500 font-medium">
						দারাজ স্টাইলে আপনার ডেলিভারি ঠিকানা সেভ ও সহজে ম্যানেজ করুন
					</p>
				</div>
			</div>
		</div>

		{#if !isAddingNew}
			<Button
				type="button"
				size="sm"
				onclick={() => (isAddingNew = true)}
				class="text-xs font-bold gap-1.5 rounded-2xl bg-[#5845eb] hover:bg-[#4936d6] text-white shadow-xs cursor-pointer"
			>
				<Plus class="w-3.5 h-3.5" />
				<span>{customer?.address ? 'ঠিকানা পরিবর্তন করুন' : 'নতুন ঠিকানা যোগ করুন'}</span>
			</Button>
		{/if}
	</div>

	<!-- Add / Edit Address Form Form (Daraz Style) -->
	{#if isAddingNew}
		<div class="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#5845eb]/30 shadow-md animate-in fade-in duration-200 space-y-5">
			<div class="flex items-center justify-between pb-3 border-b border-slate-100">
				<h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
					<Home class="w-4 h-4 text-[#5845eb]" />
					<span>ডেলিভারি ঠিকানা ফর্ম</span>
				</h3>
				<button
					type="button"
					onclick={() => (isAddingNew = false)}
					class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
				>
					বাতিল করুন
				</button>
			</div>

			<form
				action="?/saveAddress"
				method="POST"
				use:enhance={() => {
					isSaving = true;
					return async ({ result, update }) => {
						isSaving = false;
						if (result.type === 'success') {
							toast.success('ডেলিভারি ঠিকানা সফলভাবে সংরক্ষিত হয়েছে!');
							isAddingNew = false;
							update();
						} else if (result.type === 'failure') {
							toast.error((result.data as any)?.message || 'ঠিকানা সেভ করতে সমস্যা হয়েছে');
						}
					};
				}}
				class="space-y-4 text-xs"
			>
				<!-- Row 1: Name and Phone -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="addr-name" class="font-bold text-slate-700 block">
							প্রাপকের নাম (Recipient Name) <span class="text-rose-500">*</span>
						</label>
						<Input
							id="addr-name"
							name="name"
							type="text"
							required
							bind:value={recipientName}
							placeholder="উদাঃ মোঃ আনিসুর রহমান"
							class="rounded-xl h-10 text-xs"
						/>
					</div>

					<div class="space-y-1.5">
						<label for="addr-phone" class="font-bold text-slate-700 block">
							মোবাইল ফোন নম্বর <span class="text-rose-500">*</span>
						</label>
						<Input
							id="addr-phone"
							name="phone"
							type="tel"
							required
							bind:value={phone}
							placeholder="উদাঃ 017XXXXXXXX"
							class="rounded-xl h-10 text-xs font-mono"
						/>
					</div>
				</div>

				<!-- Row 2: Delivery Area Selector -->
				<div class="space-y-1.5">
					<span class="font-bold text-slate-700 block">ডেলিভারি জোন</span>
					<div class="grid grid-cols-2 gap-3">
						<button
							type="button"
							onclick={() => handleAreaChange('inside_dhaka')}
							class="p-3 rounded-2xl border text-left transition-all cursor-pointer {deliveryArea === 'inside_dhaka'
								? 'border-[#5845eb] bg-indigo-50/50 text-[#5845eb] font-bold shadow-2xs'
								: 'border-slate-200 hover:bg-slate-50 text-slate-700'}"
						>
							<div class="flex items-center justify-between">
								<span>ঢাকা সিটির ভেতরে</span>
								{#if deliveryArea === 'inside_dhaka'}
									<Check class="w-4 h-4 text-[#5845eb]" />
								{/if}
							</div>
							<div class="text-[10px] text-slate-400 font-normal mt-0.5">হোম ডেলিভারি চার্জ: ৳৬০</div>
						</button>

						<button
							type="button"
							onclick={() => handleAreaChange('outside_dhaka')}
							class="p-3 rounded-2xl border text-left transition-all cursor-pointer {deliveryArea === 'outside_dhaka'
								? 'border-[#5845eb] bg-indigo-50/50 text-[#5845eb] font-bold shadow-2xs'
								: 'border-slate-200 hover:bg-slate-50 text-slate-700'}"
						>
							<div class="flex items-center justify-between">
								<span>ঢাকা সিটির বাইরে</span>
								{#if deliveryArea === 'outside_dhaka'}
									<Check class="w-4 h-4 text-[#5845eb]" />
								{/if}
							</div>
							<div class="text-[10px] text-slate-400 font-normal mt-0.5">কুরিয়ার ডেলিভারি চার্জ: ৳১২০</div>
						</button>
					</div>
					<input type="hidden" name="deliveryArea" value={deliveryArea} />
				</div>

				<!-- Row 3: City and District -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="addr-city" class="font-bold text-slate-700 block">থানা / উপজেলা / সিটি</label>
						<Input
							id="addr-city"
							name="city"
							type="text"
							bind:value={city}
							placeholder="উদাঃ মিরপুর, ধানমন্ডি বা সাভার"
							class="rounded-xl h-10 text-xs"
						/>
					</div>

					<div class="space-y-1.5">
						<label for="addr-dist" class="font-bold text-slate-700 block">জেলা (District)</label>
						<Input
							id="addr-dist"
							name="district"
							type="text"
							bind:value={district}
							placeholder="উদাঃ ঢাকা, গাজীপুর, বা চট্টগ্রাম"
							class="rounded-xl h-10 text-xs"
						/>
					</div>
				</div>

				<!-- Row 4: Detailed Street Address -->
				<div class="space-y-1.5">
					<label for="addr-full" class="font-bold text-slate-700 block">
						সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকার বিবরণ) <span class="text-rose-500">*</span>
					</label>
					<textarea
						id="addr-full"
						name="address"
						required
						rows="3"
						bind:value={address}
						placeholder="বাড়ি নং, রোড নং, ফ্ল্যাট বা পরিচিত ল্যান্ডমার্ক উল্লেখ করুন..."
						class="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5845eb]/20"
					></textarea>
				</div>

				<!-- Row 5: Address Tag Label -->
				<div class="space-y-1.5">
					<span class="font-bold text-slate-700 block">ঠিকানার লেবেল</span>
					<div class="flex items-center gap-3">
						<button
							type="button"
							onclick={() => (addressLabel = 'home')}
							class="px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer {addressLabel === 'home'
								? 'bg-slate-900 text-white border-slate-900 shadow-xs'
								: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}"
						>
							<Home class="w-3.5 h-3.5" />
							<span>বাড়ি (Home)</span>
						</button>

						<button
							type="button"
							onclick={() => (addressLabel = 'office')}
							class="px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer {addressLabel === 'office'
								? 'bg-slate-900 text-white border-slate-900 shadow-xs'
								: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}"
						>
							<Building2 class="w-3.5 h-3.5" />
							<span>অফিস (Office)</span>
						</button>
					</div>
					<input type="hidden" name="addressLabel" value={addressLabel} />
				</div>

				<!-- Form Actions -->
				<div class="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (isAddingNew = false)}
						class="rounded-xl text-xs font-bold"
					>
						বাতিল
					</Button>

					<Button
						type="submit"
						size="sm"
						disabled={isSaving}
						class="rounded-xl text-xs font-bold bg-[#5845eb] hover:bg-[#4936d6] text-white shadow-xs"
					>
						{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'ঠিকানা সেভ করুন'}
					</Button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Default Saved Address Card (Daraz Layout) -->
	<div class="space-y-3">
		<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">
			ডিফল্ট শিপিং ঠিকানা (Default Delivery Address)
		</h3>

		{#if customer?.address}
			<div class="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs relative overflow-hidden space-y-4">
				<div class="flex items-start justify-between gap-4">
					<div class="space-y-1">
						<div class="flex items-center gap-2">
							<span class="font-black text-slate-900 text-sm">{customer.name || user.name}</span>
							<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
								<ShieldCheck class="w-3 h-3" />
								<span>ডিফল্ট ঠিকানা</span>
							</span>
						</div>
						<div class="text-xs text-slate-600 font-mono flex items-center gap-1.5">
							<Phone class="w-3.5 h-3.5 text-slate-400" />
							<span>{customer.phone || 'ফোন নম্বর নেই'}</span>
						</div>
					</div>

					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => {
							recipientName = customer.name || user.name;
							phone = customer.phone || '';
							address = customer.address || '';
							city = customer.city || 'ঢাকা';
							district = customer.district || 'ঢাকা';
							isAddingNew = true;
						}}
						class="text-xs font-bold gap-1.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
					>
						<Edit2 class="w-3.5 h-3.5" />
						<span>এডিট</span>
					</Button>
				</div>

				<div class="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2">
					<MapPin class="w-4 h-4 text-[#5845eb] shrink-0 mt-0.5" />
					<div>
						<p class="font-medium">{customer.address}</p>
						<p class="text-[11px] text-slate-400 mt-1 font-mono">
							জেলা: {customer.district || 'ঢাকা'} | থানা/সিটি: {customer.city || 'ঢাকা'}
						</p>
					</div>
				</div>
			</div>
		{:else}
			<div class="bg-white rounded-3xl p-8 border border-slate-200/90 text-center space-y-3 shadow-2xs">
				<div class="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center mx-auto">
					<MapPin class="w-6 h-6" />
				</div>
				<p class="text-xs text-slate-600 font-bold">এখনো কোনো ডেলিভারি ঠিকানা সেভ করা নেই</p>
				<p class="text-[11px] text-slate-400 max-w-sm mx-auto">
					নতুন ঠিকানা সেভ করে রাখুন, যাতে ভবিষ্যতে অর্ডার করার সময় বারবার ঠিকানা টাইপ করতে না হয়।
				</p>
				<Button
					type="button"
					size="sm"
					onclick={() => (isAddingNew = true)}
					class="text-xs font-bold rounded-xl bg-[#5845eb] text-white shadow-xs"
				>
					+ ঠিকানা যুক্ত করুন
				</Button>
			</div>
		{/if}
	</div>

	<!-- Past Order Delivery Addresses -->
	{#if pastOrderAddresses.length > 0}
		<div class="space-y-3 pt-2">
			<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">
				পূর্ববর্তী অর্ডারে ব্যবহৃত ঠিকানা (Previous Order Addresses)
			</h3>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{#each pastOrderAddresses as pAddr}
					<div class="bg-white p-4 rounded-2xl border border-slate-200/80 text-xs space-y-2 flex flex-col justify-between">
						<div>
							<div class="font-bold text-slate-900">{pAddr.name}</div>
							<div class="text-[11px] text-slate-500 font-mono">{pAddr.phone}</div>
							<p class="text-slate-600 mt-1 line-clamp-2">{pAddr.address}</p>
						</div>

						<button
							type="button"
							onclick={() => {
								recipientName = pAddr.name;
								phone = pAddr.phone;
								address = pAddr.address;
								deliveryArea = pAddr.area === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka';
								isAddingNew = true;
							}}
							class="text-[11px] font-bold text-[#5845eb] hover:underline text-left cursor-pointer pt-2 border-t border-slate-100"
						>
							এই ঠিকানাটি ডিফল্ট হিসেবে সেট করুন →
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

