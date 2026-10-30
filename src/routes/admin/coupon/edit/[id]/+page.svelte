<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Tag,
		ArrowLeft,
		Calendar,
		Percent,
		DollarSign,
		UploadCloud,
		Edit3,
		Check,
		AlertCircle
	} from 'lucide-svelte';
	import { Button, Input, Card, Textarea } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const coupon = data.coupon;

	// Pre-filled form states
	let name = $state(coupon?.name || '');
	let code = $state(coupon?.code || '');
	let bannerImage = $state(coupon?.bannerImage || '');
	let discountType = $state<'percentage' | 'fixed'>((coupon?.discountType as any) || 'percentage');
	let discountValue = $state(String(coupon?.discountValue || 20));
	let minOrderAmount = $state(String(coupon?.minOrderAmount || 0));
	let description = $state(coupon?.description || '');
	let startDate = $state(coupon?.startDate || '');
	let endDate = $state(coupon?.endDate || '');
	let status = $state<'publish' | 'draft' | 'trash'>((coupon?.status as any) || 'publish');
	let isSubmitting = $state(false);

	$effect(() => {
		if (form?.message) {
			if (form.success) {
				toast.success(form.message);
			} else {
				toast.error(form.message);
			}
		}
	});

	function handleCodeInput(e: Event) {
		const target = e.target as HTMLInputElement;
		code = target.value.toUpperCase().replace(/\s+/g, '');
	}
</script>

<svelte:head>
	<title>কুপন সম্পাদনা করুন | {coupon?.name || 'AURA Admin'}</title>
</svelte:head>

<div class="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
	<!-- Top Navigation / Back -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Button
				href="/admin/coupon"
				variant="outline"
				size="icon"
				class="w-10 h-10 rounded-2xl border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs"
			>
				<ArrowLeft class="w-4 h-4" />
			</Button>
			<div>
				<h2 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
					<Edit3 class="w-6 h-6 text-[#635BFF]" />
					<span>কুপন সম্পাদনা করুন (Edit Coupon)</span>
				</h2>
				<p class="text-xs text-slate-500 mt-0.5">
					"{coupon?.name}" কুপনের অফার ও শর্তাবলী পরিবর্তন করুন
				</p>
			</div>
		</div>
	</div>

	<!-- Main Form Card -->
	<Card class="rounded-3xl border-slate-200/90 p-6 md:p-8 shadow-2xs bg-white">
		<form
			method="POST"
			action="?/update"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
			class="space-y-6"
		>
			<!-- 1. Banner Image Section -->
			<div class="space-y-2">
				<label for="edit-banner-url" class="block text-xs font-bold text-slate-700">
					কুপন ব্যানার বা ছবি (Banner Image) <span class="text-slate-400 font-normal">(ঐচ্ছিক)</span>
				</label>

				<div class="border-2 border-dashed border-slate-200/90 rounded-2xl p-6 text-center hover:border-indigo-300 transition-colors bg-slate-50/50 space-y-3">
					{#if bannerImage}
						<div class="relative w-36 h-24 mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm">
							<img src={bannerImage} alt="Coupon Preview" class="w-full h-full object-cover" />
							<button
								type="button"
								onclick={() => (bannerImage = '')}
								class="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 text-[10px] hover:bg-black"
							>
								✕
							</button>
						</div>
					{:else}
						<div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#635BFF] mx-auto">
							<UploadCloud class="w-6 h-6 stroke-[1.75]" />
						</div>
						<div class="space-y-1">
							<p class="text-xs font-bold text-slate-700">ব্যানার ইমেজের URL পেস্ট করুন</p>
							<p class="text-[11px] text-slate-400">পিএনজি বা জেপিজি ইমেজ লিঙ্ক</p>
						</div>
					{/if}

					<div class="max-w-md mx-auto">
						<Input
							id="edit-banner-url"
							name="bannerImage"
							type="url"
							placeholder="https://example.com/images/coupon-banner.png"
							bind:value={bannerImage}
							class="text-xs h-10 rounded-xl bg-white border-slate-200 text-center"
						/>
					</div>
				</div>
			</div>

			<!-- 2. Basic Info: Name & Code -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="edit-name" class="block text-xs font-bold text-slate-700 mb-1.5">
						কুপনের নাম (Coupon Name) *
					</label>
					<Input
						id="edit-name"
						name="name"
						type="text"
						required
						bind:value={name}
						class="text-xs h-10 rounded-xl bg-slate-50/60 border-slate-200 focus:bg-white"
					/>
				</div>

				<div>
					<label for="edit-code" class="block text-xs font-bold text-slate-700 mb-1.5">
						কুপন কোড (Coupon Code) *
					</label>
					<Input
						id="edit-code"
						name="code"
						type="text"
						required
						value={code}
						oninput={handleCodeInput}
						class="text-xs h-10 rounded-xl bg-slate-50/60 border-slate-200 focus:bg-white font-mono uppercase font-bold text-[#5845eb]"
					/>
				</div>
			</div>

			<!-- 3. Financials: Discount Type, Amount, Minimum Amount -->
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div>
					<label for="edit-discount-type" class="block text-xs font-bold text-slate-700 mb-1.5">
						ছাড়ের ধরন (Discount Type) *
					</label>
					<select
						id="edit-discount-type"
						name="discountType"
						bind:value={discountType}
						class="w-full h-10 px-3 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF] focus:outline-none focus:bg-white"
					>
						<option value="percentage">শতকরা ছাড় (% Percentage)</option>
						<option value="fixed">স্থায়ী ছাড় (৳ Fixed Amount)</option>
					</select>
				</div>

				<div>
					<label for="edit-discount-value" class="block text-xs font-bold text-slate-700 mb-1.5">
						ছাড়ের পরিমাণ {discountType === 'percentage' ? '(%)' : '(৳)'} *
					</label>
					<Input
						id="edit-discount-value"
						name="discountValue"
						type="number"
						required
						min="1"
						max={discountType === 'percentage' ? '100' : '999999'}
						bind:value={discountValue}
						class="text-xs h-10 rounded-xl bg-slate-50/60 border-slate-200 focus:bg-white font-mono font-bold"
					/>
				</div>

				<div>
					<label for="edit-min-order" class="block text-xs font-bold text-slate-700 mb-1.5">
						নূন্যতম অর্ডার মান (৳)
					</label>
					<Input
						id="edit-min-order"
						name="minOrderAmount"
						type="number"
						min="0"
						bind:value={minOrderAmount}
						class="text-xs h-10 rounded-xl bg-slate-50/60 border-slate-200 focus:bg-white font-mono font-bold"
					/>
				</div>
			</div>

			<!-- 4. Description / Notes -->
			<div>
				<label for="edit-description" class="block text-xs font-bold text-slate-700 mb-1.5">
					কুপনের বিবরণ বা নোট (Description / Notes) <span class="text-slate-400 font-normal">(ঐচ্ছিক)</span>
				</label>
				<Textarea
					id="edit-description"
					name="description"
					rows={3}
					bind:value={description}
					class="text-xs rounded-xl bg-slate-50/60 border-slate-200 focus:bg-white resize-none"
				/>
			</div>

			<!-- 5. Validity: Start Date & End Date -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label for="edit-start-date" class="block text-xs font-bold text-slate-700 mb-1.5">
						কার্যকর শুরু (Start Date)
					</label>
					<div class="relative">
						<Input
							id="edit-start-date"
							name="startDate"
							type="date"
							bind:value={startDate}
							class="text-xs h-10 rounded-xl bg-slate-50/60 border-slate-200 focus:bg-white pr-10"
						/>
						<Calendar class="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
					</div>
				</div>

				<div>
					<label for="edit-end-date" class="block text-xs font-bold text-slate-700 mb-1.5">
						মেয়াদ শেষ (End Date)
					</label>
					<div class="relative">
						<Input
							id="edit-end-date"
							name="endDate"
							type="date"
							bind:value={endDate}
							class="text-xs h-10 rounded-xl bg-slate-50/60 border-slate-200 focus:bg-white pr-10"
						/>
						<Calendar class="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
					</div>
				</div>
			</div>

			<!-- 6. Status Selector -->
			<div>
				<span class="block text-xs font-bold text-slate-700 mb-2">প্রকাশের অবস্থা (Status)</span>
				<div class="flex items-center gap-3">
					<label class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all {status === 'publish' ? 'border-[#635BFF] bg-indigo-50/40 text-slate-900 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'}">
						<input type="radio" name="status" value="publish" bind:group={status} class="accent-[#635BFF]" />
						<span class="text-xs">পাবলিশ করুন (Published)</span>
					</label>

					<label class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all {status === 'draft' ? 'border-[#635BFF] bg-indigo-50/40 text-slate-900 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'}">
						<input type="radio" name="status" value="draft" bind:group={status} class="accent-[#635BFF]" />
						<span class="text-xs">ড্রাফট রাখুন (Draft)</span>
					</label>

					<label class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all {status === 'trash' ? 'border-rose-400 bg-rose-50/40 text-rose-900 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'}">
						<input type="radio" name="status" value="trash" bind:group={status} class="accent-rose-600" />
						<span class="text-xs">ট্র্যাশে রাখুন (Trash)</span>
					</label>
				</div>
			</div>

			<!-- Actions: Save & Cancel -->
			<div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
				<Button
					href="/admin/coupon"
					variant="outline"
					class="text-xs font-bold h-10 px-5 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900"
				>
					বাতিল
				</Button>

				<Button
					type="submit"
					disabled={isSubmitting}
					class="bg-[#635BFF] hover:bg-[#5249e6] text-white font-bold h-10 px-6 rounded-xl shadow-xs text-xs cursor-pointer active:scale-95 transition-all"
				>
					{isSubmitting ? 'আপডেট হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন (Update Coupon)'}
				</Button>
			</div>
		</form>
	</Card>
</div>

