<script lang="ts">
	import { Dialog, Button } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import { MapPin, Copy, Check, ExternalLink, Phone, User, Navigation } from 'lucide-svelte';

	interface Props {
		shippingAddress?: string | null;
		deliveryArea?: string | null;
		orderNumber?: string | null;
		customerName?: string | null;
		customerPhone?: string | null;
		city?: string | null;
		district?: string | null;
		class?: string;
	}

	let {
		shippingAddress,
		deliveryArea,
		orderNumber,
		customerName,
		customerPhone,
		city,
		district,
		class: className = ''
	}: Props = $props();

	let isModalOpen = $state(false);
	let isCopied = $state(false);

	let cleanAddress = $derived((shippingAddress || '').trim());
	let hasAddress = $derived(cleanAddress.length > 0);

	let areaLabel = $derived.by(() => {
		if (deliveryArea === 'inside_dhaka') return 'ঢাকা সিটি';
		if (deliveryArea === 'outside_dhaka') return 'ঢাকার বাইরে';
		if (deliveryArea === 'sub_dhaka') return 'উপশহর';
		return null;
	});

	let areaBadgeClass = $derived.by(() => {
		if (deliveryArea === 'inside_dhaka') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
		if (deliveryArea === 'outside_dhaka') return 'text-amber-700 bg-amber-50 border-amber-200';
		if (deliveryArea === 'sub_dhaka') return 'text-indigo-700 bg-indigo-50 border-indigo-200';
		return 'text-slate-700 bg-slate-50 border-slate-200';
	});

	let fullAreaDescription = $derived.by(() => {
		if (deliveryArea === 'inside_dhaka') return 'ঢাকা সিটি কর্পোরেশন এলাকা (Inside Dhaka)';
		if (deliveryArea === 'outside_dhaka') return 'ঢাকার বাইরে / জেলা-উপজেলা পর্যায় (Outside Dhaka)';
		if (deliveryArea === 'sub_dhaka') return 'ঢাকা উপশহর (সাভার, কেরানীগঞ্জ, গাজীপুর, নারায়ণগঞ্জ)';
		return 'সাধারণ ডেলিভারি এরিয়া';
	});

	let mapsUrl = $derived.by(() => {
		if (!hasAddress) return null;
		const query = [cleanAddress, city, district, 'Bangladesh'].filter(Boolean).join(', ');
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
	});

	async function handleCopyAddress() {
		if (!hasAddress) return;
		try {
			await navigator.clipboard.writeText(cleanAddress);
			isCopied = true;
			toast.success('ডেলিভারি ঠিকানা কপি করা হয়েছে!');
			setTimeout(() => {
				isCopied = false;
			}, 2000);
		} catch (_) {
			toast.error('ঠিকানা কপি করতে সমস্যা হয়েছে');
		}
	}
</script>

<!-- Table Cell Trigger Button -->
<button
	type="button"
	onclick={() => (isModalOpen = true)}
	class="flex items-start gap-1.5 text-left group/loc cursor-pointer hover:bg-slate-50/80 -mx-1 px-1 py-1 rounded-xl transition-all w-full focus:outline-none focus:ring-1 focus:ring-[#5845eb]/30 {className}"
	title="সম্পূর্ণ ঠিকানা ও লোকেশন দেখতে ক্লিক করুন"
>
	<div class="mt-0.5 shrink-0">
		<MapPin class="w-3.5 h-3.5 text-rose-500 group-hover/loc:scale-110 transition-transform" />
	</div>

	<div class="min-w-0 flex-1">
		{#if areaLabel}
			<span
				class="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded border mb-0.5 leading-tight {areaBadgeClass}"
			>
				{areaLabel}
			</span>
		{/if}

		{#if hasAddress}
			<p
				class="text-xs text-slate-700 font-medium line-clamp-2 leading-snug group-hover/loc:text-[#5845eb] transition-colors break-words"
			>
				{cleanAddress}
			</p>
		{:else}
			<p class="text-xs text-slate-400 italic">
				ঠিকানা দেওয়া হয়নি
			</p>
		{/if}
	</div>
</button>

<!-- Full Location & Address Popup Dialog -->
<Dialog
	bind:open={isModalOpen}
	title="ডেলিভারি লোকেশন ও পূর্ণাঙ্গ ঠিকানা"
	description={orderNumber ? `অর্ডার নম্বর: #${orderNumber}` : undefined}
	class="max-w-lg p-5 sm:p-6"
>
	<div class="space-y-4 py-1">
		<!-- Area & Delivery Badge Banner -->
		<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
					<Navigation class="w-4 h-4" />
				</div>
				<div>
					<div class="text-xs font-bold text-slate-900">
						{areaLabel || 'ডেলিভারি জোন'}
					</div>
					<div class="text-[11px] text-slate-500 font-medium">
						{fullAreaDescription}
					</div>
				</div>
			</div>

			{#if areaLabel}
				<span class="text-xs font-black px-2.5 py-1 rounded-lg border {areaBadgeClass}">
					{areaLabel}
				</span>
			{/if}
		</div>

		<!-- Complete Address Box -->
		<div class="space-y-1.5">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
					<MapPin class="w-3.5 h-3.5 text-rose-500" />
					<span>সম্পূর্ণ গ্রাহক ঠিকানা</span>
				</span>
				{#if hasAddress}
					<span class="text-[11px] text-slate-400 font-medium">
						ক্লিক করে টেক্সট সিলেক্ট করুন
					</span>
				{/if}
			</div>

			<div class="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-semibold text-slate-800 leading-relaxed select-all break-words shadow-2xs">
				{#if hasAddress}
					{cleanAddress}
				{:else}
					<span class="text-slate-400 italic font-normal">
						এই অর্ডারে কোনো ডেলিভারি ঠিকানা সংযুক্ত করা হয়নি।
					</span>
				{/if}
			</div>
		</div>

		<!-- Customer Contact Info (Optional context) -->
		{#if customerName || customerPhone}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
				{#if customerName}
					<div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/50 border border-slate-100 text-xs text-slate-700">
						<User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<div class="truncate">
							<span class="text-slate-400 text-[10px] block leading-tight">গ্রাহকের নাম:</span>
							<strong class="text-slate-900 font-semibold">{customerName}</strong>
						</div>
					</div>
				{/if}

				{#if customerPhone}
					<div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 border border-slate-100 text-xs">
						<div class="flex items-center gap-2 truncate">
							<Phone class="w-3.5 h-3.5 text-slate-400 shrink-0" />
							<div class="truncate">
								<span class="text-slate-400 text-[10px] block leading-tight">মোবাইল নম্বর:</span>
								<a
									href="tel:{customerPhone}"
									class="font-mono font-bold text-slate-900 hover:text-[#5845eb] transition-colors"
								>
									{customerPhone}
								</a>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Action Buttons Strip -->
		<div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
			<!-- Google Maps Link -->
			{#if mapsUrl}
				<a
					href={mapsUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-[#5845eb] bg-slate-100 hover:bg-indigo-50 border border-slate-200 transition-colors"
				>
					<ExternalLink class="w-3.5 h-3.5" />
					<span>গুগল ম্যাপে দেখুন</span>
				</a>
			{:else}
				<div></div>
			{/if}

			<div class="flex items-center gap-2">
				<!-- Copy Button -->
				{#if hasAddress}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={handleCopyAddress}
						class="text-xs font-bold rounded-xl gap-1.5 cursor-pointer {isCopied ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-700'}"
					>
						{#if isCopied}
							<Check class="w-3.5 h-3.5 text-emerald-600" />
							<span>কপি হয়েছে</span>
						{:else}
							<Copy class="w-3.5 h-3.5 text-slate-500" />
							<span>ঠিকানা কপি করুন</span>
						{/if}
					</Button>
				{/if}

				<!-- Close Button -->
				<Button
					type="button"
					variant="default"
					size="sm"
					onclick={() => (isModalOpen = false)}
					class="text-xs font-bold rounded-xl px-4 cursor-pointer bg-[#5845eb] hover:bg-[#4836d4] text-white shadow-xs"
				>
					বন্ধ করুন
				</Button>
			</div>
		</div>
	</div>
</Dialog>

