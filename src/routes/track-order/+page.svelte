<script lang="ts">
	import { page } from '$app/state';
	const siteName = $derived(page.data?.websiteInfo?.websiteName || 'Store');
	import { enhance } from '$app/forms';
	import { StoreLayout } from '#lib';
	import { Button, Input, Card, CardContent, Badge } from '#lib/components/ui';
	import { Search, Package, Truck, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isLoading = $state(false);

	const trackedOrder = $derived(form?.trackedOrder);

	const STEP_INDEX: Record<string, number> = {
		pending: 0,
		hold: 0,
		busy: 0,
		no_response: 0,
		confirmed: 1,
		processing: 1,
		printed: 1,
		entry_done: 1,
		shipped: 2,
		delivered: 3
	};

	const steps = [
		{ label: 'অর্ডার প্লেসড', icon: CheckCircle2 },
		{ label: 'কনফার্মড', icon: CheckCircle2 },
		{ label: 'কুরিয়ারে পথে', icon: Truck },
		{ label: 'ডেলিভার্ড', icon: Clock }
	];

	const currentStep = $derived(trackedOrder ? (STEP_INDEX[trackedOrder.status] ?? 0) : 0);
	const isStopped = $derived(
		trackedOrder?.status === 'cancelled' || trackedOrder?.status === 'returned'
	);
</script>

<svelte:head>
	<title>অর্ডার ট্র্যাক করুন (Track Order) | {siteName}</title>
</svelte:head>

<StoreLayout user={data.user}>
	<div class="mx-auto max-w-4xl space-y-8 px-4 py-10 font-['Anek_Bangla',sans-serif] sm:px-6 lg:py-16">
		<div class="space-y-2 text-center">
			<Badge variant="outline" class="border-indigo-200 bg-indigo-50 text-[#5845eb]">
				Live Order Tracking
			</Badge>
			<h1 class="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
				আপনার অর্ডার ট্র্যাক করুন (Track Your Order)
			</h1>
			<p class="mx-auto max-w-lg text-xs text-slate-500 sm:text-sm">
				অর্ডার নম্বর এবং অর্ডার করার সময় দেওয়া মোবাইল নম্বর দিয়ে আপনার অর্ডারের বর্তমান অবস্থা জানুন।
			</p>
		</div>

		<Card class="mx-auto max-w-2xl border-slate-200/90 shadow-xs">
			<CardContent class="p-6 sm:p-8">
				<form
					method="POST"
					action="?/track"
					class="space-y-4"
					use:enhance={() => {
						isLoading = true;
						return async ({ update }) => {
							await update({ reset: false });
							isLoading = false;
						};
					}}
				>
					<div class="grid gap-4 sm:grid-cols-2">
						<div class="space-y-1.5">
							<label for="track-order-number" class="text-xs font-bold text-slate-700">অর্ডার নম্বর</label>
							<div class="relative">
								<Input
									id="track-order-number"
									name="orderNumber"
									value={data.orderNumber}
									placeholder="যেমন: 1042"
									class="h-12 rounded-xl pr-11 pl-4 text-sm"
									required
								/>
								<Package class="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
							</div>
						</div>
						<div class="space-y-1.5">
							<label for="track-phone" class="text-xs font-bold text-slate-700">মোবাইল নম্বর</label>
							<Input
								id="track-phone"
								name="phone"
								type="tel"
								inputmode="tel"
								autocomplete="tel"
								placeholder="যেমন: 01712345678"
								class="h-12 rounded-xl pl-4 text-sm"
								required
							/>
						</div>
					</div>

					<Button
						type="submit"
						disabled={isLoading}
						class="h-12 w-full cursor-pointer gap-2 rounded-xl bg-[#5845eb] text-sm font-bold text-white shadow-sm shadow-indigo-600/30 hover:bg-[#4936d6]"
					>
						<Search class="h-4 w-4" />
						<span>{isLoading ? 'অর্ডার খোঁজা হচ্ছে...' : 'অর্ডার স্ট্যাটাস খুঁজুন'}</span>
					</Button>
				</form>
			</CardContent>
		</Card>

		{#if form?.message}
			<div role="alert" class="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-xs text-rose-700">
				<AlertCircle class="mt-0.5 h-5 w-5 shrink-0" />
				<span>{form.message}</span>
			</div>
		{/if}

		{#if form?.notFound}
			<div role="status" class="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
				<AlertCircle class="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
				<div class="space-y-1 text-xs">
					<span class="block text-sm font-bold">কোনো অর্ডার খুঁজে পাওয়া যায়নি</span>
					<p class="text-amber-700">
						অর্ডার নম্বর এবং মোবাইল নম্বর মিলছে না। অনুগ্রহ করে তথ্য যাচাই করে আবার চেষ্টা করুন।
					</p>
				</div>
			</div>
		{/if}

		{#if trackedOrder}
			<Card class="border-slate-200/90 shadow-sm">
				<CardContent class="space-y-6 p-6 sm:p-8">
					<div class="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
						<div>
							<div class="flex items-center gap-2">
								<span class="text-lg font-black text-slate-900">{trackedOrder.id}</span>
								<Badge class="border border-indigo-200 bg-indigo-50 font-bold text-[#5845eb]">
									{trackedOrder.statusBangla}
								</Badge>
							</div>
							<span class="text-xs text-slate-400">অর্ডারের তারিখ: {trackedOrder.date}</span>
						</div>
						<div class="text-left sm:text-right">
							<span class="text-xs font-medium text-slate-500">কুরিয়ার ট্র্যাকিং:</span>
							<div class="font-mono text-xs font-bold text-slate-800">
								{#if trackedOrder.trackingCode}
									{trackedOrder.courier || 'কুরিয়ার'} ({trackedOrder.trackingCode})
								{:else}
									এখনো কুরিয়ারে দেওয়া হয়নি
								{/if}
							</div>
						</div>
					</div>

					{#if isStopped}
						<div class="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
							<XCircle class="h-4 w-4 shrink-0" />
							<span>{trackedOrder.statusBangla}</span>
						</div>
					{:else}
						<ol class="grid grid-cols-4 gap-2 pt-2 text-center text-[11px] font-bold">
							{#each steps as step, index}
								{@const done = index <= currentStep}
								<li
									aria-current={index === currentStep ? 'step' : undefined}
									class="flex flex-col items-center gap-1.5 {done ? 'text-emerald-600' : 'text-slate-400'}"
								>
									<div class="flex h-8 w-8 items-center justify-center rounded-full border-2 {done ? 'border-emerald-500 bg-emerald-100' : 'border-slate-300 bg-slate-100'}">
										<step.icon class="h-4 w-4" />
									</div>
									<span>{step.label}</span>
								</li>
							{/each}
						</ol>
					{/if}

					<div class="space-y-2 border-t border-slate-100 pt-4">
						<h2 class="text-xs font-bold text-slate-800">অর্ডারের পণ্যসমূহ:</h2>
						<div class="space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs">
							{#each trackedOrder.items as item}
								<div class="flex items-center justify-between text-slate-700">
									<span>• {item.name} × {item.quantity}</span>
									<span class="font-bold">৳{item.price}</span>
								</div>
							{/each}
							<div class="flex items-center justify-between border-t border-slate-200/60 pt-2 text-sm font-black text-slate-900">
								<span>সর্বমোট:</span>
								<span class="text-[#5845eb]">৳{trackedOrder.total}</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>
</StoreLayout>
