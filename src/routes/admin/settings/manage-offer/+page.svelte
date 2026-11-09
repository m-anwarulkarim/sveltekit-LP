<script lang="ts">
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Badge } from '#lib/components/ui/badge';
	import { Card, CardContent } from '#lib/components/ui/card';
	import {
		ArrowLeft,
		Plus,
		Check,
		ChevronDown,
		ChevronUp,
		Trash2,
		Sparkles,
		Tag,
		Gift,
		CreditCard,
		Truck,
		Headphones,
		Loader2,
		X
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { confirmModal } from '#lib/stores/confirm.svelte';

	interface OfferItem {
		id: string;
		offerType: 'New Registration' | 'Online Payment' | 'Free Delivery (1st Order)';
		discount: string;
		status: 'active' | 'inactive';
		createdAt?: string;
	}

	let { data }: { data: any } = $props();

	let offers = $state<OfferItem[]>(data?.offers || []);

	$effect(() => {
		if (data?.offers) {
			offers = data.offers;
		}
	});

	// Active form state (matching the screenshot exactly)
	let selectedOfferType = $state<'New Registration' | 'Online Payment' | 'Free Delivery (1st Order)'>('New Registration');
	let discountValue = $state('10%');
	let isTypeDropdownOpen = $state(false);
	let isFormVisible = $state(true);
	let editingOfferId = $state<string | null>(null);
	let isSaving = $state(false);

	const offerTypes: ('New Registration' | 'Online Payment' | 'Free Delivery (1st Order)')[] = [
		'New Registration',
		'Online Payment',
		'Free Delivery (1st Order)'
	];

	function selectType(type: 'New Registration' | 'Online Payment' | 'Free Delivery (1st Order)') {
		selectedOfferType = type;
		isTypeDropdownOpen = false;
		if (type === 'Free Delivery (1st Order)') {
			discountValue = 'Free Delivery';
		} else if (discountValue === 'Free Delivery') {
			discountValue = '10%';
		}
	}

	function handleAddNewClick() {
		editingOfferId = null;
		selectedOfferType = 'New Registration';
		discountValue = '500';
		isFormVisible = true;
	}

	function handleEditOffer(offer: OfferItem) {
		editingOfferId = offer.id;
		selectedOfferType = offer.offerType;
		discountValue = offer.discount;
		isFormVisible = true;
	}

	async function handleDeleteOffer(offer: OfferItem) {
		const confirmed = await confirmModal({
			title: 'অফার মুছে ফেলা',
			message: `আপনি কি "${offer.offerType}" অফারটি মুছে ফেলতে চান?`,
			confirmText: 'মুছে ফেলুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) return;

		try {
			const formData = new FormData();
			formData.append('id', offer.id);

			const res = await fetch('?/deleteOffer', {
				method: 'POST',
				body: formData
			});
			const result: any = await res.json();
			if (result.type === 'success' || result.status === 200) {
				offers = offers.filter((o) => o.id !== offer.id);
				toast.success('অফার মুছে ফেলা হয়েছে');
			} else {
				toast.error('মুছে ফেলতে সমস্যা হয়েছে');
			}
		} catch (err) {
			toast.error('সার্ভারে সমস্যা হয়েছে');
		}
	}

	async function handleToggleStatus(offer: OfferItem) {
		try {
			const formData = new FormData();
			formData.append('id', offer.id);

			const res = await fetch('?/toggleStatus', {
				method: 'POST',
				body: formData
			});
			const result: any = await res.json();
			if (result.type === 'success' || result.status === 200) {
				offer.status = offer.status === 'active' ? 'inactive' : 'active';
				toast.success('অফার স্ট্যাটাস পরিবর্তন হয়েছে');
			}
		} catch (err) {
			toast.error('সার্ভারে সমস্যা হয়েছে');
		}
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('#offer-type-selector')) {
			isTypeDropdownOpen = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<svelte:head>
	<title>Offers - Settings - seedbd Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto font-['Anek_Bangla',sans-serif]">
	<!-- Top Sub-Header Bar (Title Left, Support Button Right) -->
	<div class="flex items-center justify-between gap-4 pb-2">
		<div class="flex items-center gap-3">
			<a
				href="/admin/settings"
				class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all"
			>
				<ArrowLeft class="w-4 h-4 text-slate-500" />
				<span>Back to Settings</span>
			</a>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Offers</h1>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<a
				href="https://wa.me/880156007230"
				target="_blank"
				class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
			>
				<Headphones class="w-3.5 h-3.5 text-[#5845eb]" />
				<span>header.support</span>
			</a>
		</div>
	</div>

	<!-- Dashed Box: + manageOffer.addNewOffer (Exact match to Screenshot 1 & 2) -->
	<div>
		<button
			type="button"
			onclick={handleAddNewClick}
			class="w-full sm:w-72 h-20 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#5845eb] bg-white hover:bg-indigo-50/30 flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer shadow-2xs"
		>
			<Plus class="w-5 h-5 text-slate-500 group-hover:text-[#5845eb] transition-colors" />
			<span class="text-xs font-bold text-slate-700 group-hover:text-[#5845eb] transition-colors">
				manageOffer.addNewOffer
			</span>
		</button>
	</div>

	<!-- Main Form & Configuration Area (Exact match to Screenshots 1 & 2 with Shadcn styling) -->
	{#if isFormVisible}
		<form
			method="POST"
			action="?/saveOffer"
			use:enhance={() => {
				isSaving = true;
				return async ({ result, update }) => {
					isSaving = false;
					if (result.type === 'success') {
						toast.success(editingOfferId ? 'অফার সফলভাবে আপডেট হয়েছে' : 'নতুন অফার সফলভাবে যোগ হয়েছে');
						await update();
					} else {
						toast.error('অফার সংরক্ষণ ব্যর্থ হয়েছে');
					}
				};
			}}
			class="max-w-xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-150"
		>
			{#if editingOfferId}
				<input type="hidden" name="id" value={editingOfferId} />
			{/if}
			<input type="hidden" name="offerType" value={selectedOfferType} />

			<!-- 1. Floating-Label Custom Select: manageOffer.offerType (Exact match to Screenshot 1) -->
			<div id="offer-type-selector" class="relative">
				<!-- Floating Label that breaks top border -->
				<div class="relative rounded-xl border {isTypeDropdownOpen ? 'border-[#5845eb] ring-2 ring-[#5845eb]/10' : 'border-slate-300 hover:border-slate-400'} bg-white transition-all">
					<span class="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-bold text-[#5845eb] z-10 select-none">
						manageOffer.offerType
					</span>

					<!-- Dropdown Trigger Button -->
					<button
						type="button"
						onclick={(e) => {
							e.stopPropagation();
							isTypeDropdownOpen = !isTypeDropdownOpen;
						}}
						class="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-900 flex items-center justify-between cursor-pointer focus:outline-none"
					>
						<span>{selectedOfferType}</span>
						{#if isTypeDropdownOpen}
							<ChevronUp class="w-4 h-4 text-[#5845eb]" />
						{:else}
							<ChevronDown class="w-4 h-4 text-slate-500" />
						{/if}
					</button>
				</div>

				<!-- Floating Dropdown Options Menu (Exact match to Screenshot 1 with Purple Checkmark) -->
				{#if isTypeDropdownOpen}
					<div class="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1 z-50 overflow-hidden text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
						{#each offerTypes as type}
							{@const isSelected = selectedOfferType === type}
							<button
								type="button"
								onclick={() => selectType(type)}
								class="w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer {isSelected
									? 'bg-slate-100/90 font-bold text-slate-900'
									: 'hover:bg-slate-50 text-slate-700'}"
							>
								<span>{type}</span>
								{#if isSelected}
									<Check class="w-4 h-4 text-[#5845eb]" />
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- 2. Floating-Label Input: manageOffer.discount (Exact match to Screenshot 2) -->
			<div class="relative">
				<div class="relative rounded-xl border border-slate-300 hover:border-slate-400 focus-within:border-[#5845eb] focus-within:ring-2 focus-within:ring-[#5845eb]/10 bg-white transition-all">
					<span class="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-bold text-[#5845eb] z-10 select-none">
						manageOffer.discount
					</span>
					<input
						type="text"
						name="discount"
						required
						bind:value={discountValue}
						placeholder="Ex: 500 or 10%"
						class="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-transparent rounded-xl focus:outline-none"
					/>
				</div>
			</div>

			<!-- 3. Save Button: ✓ common.saveChanges (Exact match to Screenshot 2) -->
			<div class="pt-1 flex items-center gap-3">
				<Button
					type="submit"
					disabled={isSaving}
					class="bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold h-10 px-5 rounded-xl shadow-xs text-xs gap-1.5 cursor-pointer transition-all"
				>
					{#if isSaving}
						<Loader2 class="w-4 h-4 animate-spin" />
						<span>সংরক্ষণ হচ্ছে...</span>
					{:else}
						<Check class="w-4 h-4 stroke-[2.5]" />
						<span>common.saveChanges</span>
					{/if}
				</Button>

				{#if editingOfferId}
					<Button
						type="button"
						variant="outline"
						onclick={() => {
							editingOfferId = null;
							selectedOfferType = 'New Registration';
							discountValue = '10%';
						}}
						class="rounded-xl h-10 text-xs font-bold"
					>
						বাতিল
					</Button>
				{/if}
			</div>
		</form>
	{/if}

	<!-- Configured Offers List (Clean Shadcn Card Table to view and manage existing offers) -->
	<div class="pt-6 border-t border-slate-200/80 space-y-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Tag class="w-4 h-4 text-[#5845eb]" />
				<h3 class="text-sm font-bold text-slate-900">সক্রিয় অফার তালিকা (Configured Offers)</h3>
			</div>
			<Badge variant="outline" class="text-xs font-semibold text-slate-600 bg-slate-50">
				মোট {offers.length}টি অফার
			</Badge>
		</div>

		{#if offers.length === 0}
			<Card class="rounded-2xl border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
				<p class="text-xs text-slate-500">বর্তমানে কোনো কাস্টম অফার সেট করা নেই। উপরের বক্সে ক্লিক করে নতুন অফার যোগ করুন।</p>
			</Card>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each offers as offer (offer.id)}
					<Card class="rounded-2xl border border-slate-200/90 shadow-2xs bg-white hover:border-[#5845eb]/40 transition-all overflow-hidden group">
						<CardContent class="p-4 space-y-3">
							<div class="flex items-start justify-between gap-2">
								<div class="flex items-center gap-2">
									<div class="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb]">
										{#if offer.offerType === 'Online Payment'}
											<CreditCard class="w-4 h-4" />
										{:else if offer.offerType === 'Free Delivery (1st Order)'}
											<Truck class="w-4 h-4" />
										{:else}
											<Gift class="w-4 h-4" />
										{/if}
									</div>
									<div>
										<h4 class="text-xs font-bold text-slate-900">{offer.offerType}</h4>
										<span class="text-[10px] text-slate-400">স্বয়ংক্রিয় অফার</span>
									</div>
								</div>

								<button
									type="button"
									onclick={() => handleToggleStatus(offer)}
									class="cursor-pointer"
									title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
								>
									<Badge
										variant={offer.status === 'active' ? 'default' : 'secondary'}
										class="text-[10px] font-bold uppercase {offer.status === 'active'
											? 'bg-emerald-600 hover:bg-emerald-700 text-white'
											: 'bg-slate-100 text-slate-500'}"
									>
										{offer.status}
									</Badge>
								</button>
							</div>

							<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-medium">
								<span class="text-slate-500">অফার ডিসকাউন্ট:</span>
								<strong class="text-slate-900 font-mono font-bold text-sm text-[#5845eb]">{offer.discount}</strong>
							</div>

							<div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onclick={() => handleEditOffer(offer)}
									class="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900"
								>
									এডিট
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onclick={() => handleDeleteOffer(offer)}
									class="h-8 px-2 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
								>
									<Trash2 class="w-3.5 h-3.5" />
								</Button>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}
	</div>
</div>
