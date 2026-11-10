<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Checkbox, Badge } from '#lib/components/ui';
	import {
		ArrowLeft,
		CheckCircle2,
		Check,
		Receipt,
		Printer,
		FileText,
		ShieldCheck,
		QrCode,
		Sparkles,
		SlidersHorizontal,
		Loader2
	} from 'lucide-svelte';

	let { data, form } = $props();

	// Selected invoice template state loaded from D1 Database
	let selectedTemplate = $state(data?.invoiceConfig?.template || 'classicDesign');

	// Checkbox options matching screenshot 2 loaded from D1 Database
	let disablePrice = $state(Boolean(data?.invoiceConfig?.disablePrice));
	let enableCourier = $state(data?.invoiceConfig?.enableCourier !== false);
	let enableReturnPolicy = $state(data?.invoiceConfig?.enableReturnPolicy !== false);

	// Notification & loading state
	let isSaving = $state(false);
	let toast = $state<{ type: 'success' | 'info'; message: string } | null>(null);
	let toastTimer: any = null;

	function showToast(message: string, type: 'success' | 'info' = 'success') {
		if (toastTimer) clearTimeout(toastTimer);
		toast = { type, message };
		toastTimer = setTimeout(() => {
			toast = null;
		}, 3000);
	}

	// Direct async save function to guarantee immediate D1 persistence without DOM race conditions
	async function saveSettings(templateToSave?: string) {
		isSaving = true;
		const targetTemplate = templateToSave || selectedTemplate;

		const fd = new FormData();
		fd.set('template', targetTemplate);
		fd.set('disablePrice', disablePrice ? 'true' : 'false');
		fd.set('enableCourier', enableCourier ? 'true' : 'false');
		fd.set('enableReturnPolicy', enableReturnPolicy ? 'true' : 'false');

		try {
			const res = await fetch('?/save', {
				method: 'POST',
				body: fd,
				headers: {
					'x-sveltekit-action': 'true'
				}
			});

			const responseData: any = await res.json();
			isSaving = false;

			if (responseData.type === 'success' || res.ok) {
				selectedTemplate = targetTemplate;
				const templateObj = TEMPLATES.find((t) => t.id === targetTemplate);
				const templateName = templateObj ? templateObj.name : targetTemplate;
				showToast(`"${templateName}" ইনভয়েস ডিজাইন ডাটাবেসে সফলভাবে সংরক্ষিত হয়েছে!`);
			} else {
				showToast('ইনভয়েস সেটিংস সংরক্ষণে সমস্যা হয়েছে।', 'info');
			}
		} catch (err) {
			isSaving = false;
			console.error('Save failed:', err);
			showToast('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।', 'info');
		}
	}

	function activateTemplate(id: string) {
		selectedTemplate = id;
		saveSettings(id);
	}

	// Keep states synchronized when server data updates
	$effect(() => {
		if (data?.invoiceConfig) {
			selectedTemplate = data.invoiceConfig.template || 'classicDesign';
			disablePrice = Boolean(data.invoiceConfig.disablePrice);
			enableCourier = data.invoiceConfig.enableCourier !== false;
			enableReturnPolicy = data.invoiceConfig.enableReturnPolicy !== false;
		}
	});

	// 7 Invoice Templates from user screenshots
	const TEMPLATES = [
		{
			id: 'classicDesign',
			name: 'ক্লাসিক ডিজাইন (Classic Design)',
			desc: 'স্ট্যান্ডার্ড এ৪ ও ক্লিন পিওএস ইনভয়েস লেআউট',
			type: 'standard'
		},
		{
			id: 'modernDesign',
			name: 'মডার্ন ডিজাইন (Modern Design)',
			desc: 'বারকোড ও কুরিয়ার ট্র্যাকিং সমৃদ্ধ থার্মাল স্লিপ',
			type: 'thermal'
		},
		{
			id: 'minimalDesign',
			name: 'মিনিমাল ডিজাইন (Minimal Design)',
			desc: 'শিপিং লেবেল ও কিউআর কোড সম্বলিত স্টিকার ফরম্যাট',
			type: 'sticker'
		},
		{
			id: 'classicDetailed',
			name: 'ক্লাসিক ডিটেইল্ড (Classic Detailed)',
			desc: 'সম্পূর্ণ আইটেম বিবরণ ও ফুল-উইডথ হিসাবপত্র',
			type: 'detailed'
		},
		{
			id: 'minimalDetailed',
			name: 'মিনিমাল ডিটেইল্ড (Minimal Detailed)',
			desc: 'প্রোডাক্টের ছবি ও কলামভিত্তিক সংক্ষিপ্ত বিবরণী',
			type: 'detailed_photo'
		},
		{
			id: 'stickerPrint',
			name: 'স্টিকার প্রিন্ট (Sticker Print)',
			desc: '৪x৬ ইঞ্চি থার্মাল পার্সেল ডেলিভারি স্টিকার',
			type: 'parcel_sticker'
		},
		{
			id: 'premiumElegant',
			name: 'প্রিমিয়াম এলিগ্যান্ট (Premium Elegant)',
			desc: 'কর্পোরেট স্টাইলের মার্জিত ও প্রফেশনাল ইনভয়েস',
			type: 'premium'
		}
	];
</script>

<svelte:head>
	<title>Invoice Settings | Haq Plus Enterprise</title>
</svelte:head>

<div class="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
	<!-- Floating Toast Notification -->
	{#if toast}
		<div
			class="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 {toast.type ===
			'success'
				? 'bg-emerald-600 text-white'
				: 'bg-[#5845eb] text-white'}"
		>
			<CheckCircle2 class="w-5 h-5 shrink-0" />
			<span>{toast.message}</span>
		</div>
	{/if}

	<!-- Header Bar -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<a href="/admin/settings">
				<Button
					variant="outline"
					size="sm"
					class="gap-2 rounded-xl text-slate-700 hover:bg-slate-100 border-slate-200"
				>
					<ArrowLeft class="w-4 h-4" />
					<span>Back to Settings</span>
				</Button>
			</a>
			<Badge variant="outline" class="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs px-3 py-1 font-bold">
				<Printer class="w-3.5 h-3.5 mr-1" />
				৭টি ইনভয়েস টেমপ্লেট ডাটাবেসে কানেক্টেড
			</Badge>
		</div>

		<div>
			<h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
				<span>ইনভয়েস ডিজাইন ও টেমপ্লেট নির্বাচন</span>
			</h1>
			<p class="text-xs sm:text-sm text-slate-500 mt-1">
				আপনার প্রতিষ্ঠানের প্রয়োজন অনুযায়ী সেরা ইনভয়েস বা শিপিং স্টিকার লেআউট নির্বাচন করুন
			</p>
		</div>
	</div>

	<!-- Templates 3-Column Grid Matching Screenshots -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each TEMPLATES as t (t.id)}
			{@const isSelected = selectedTemplate === t.id}
			<Card
				class="p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 bg-white rounded-3xl border {isSelected
					? 'border-2 border-emerald-500 shadow-md ring-4 ring-emerald-500/10'
					: 'border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-sm'}"
			>
				<!-- Visual Miniature Mockup -->
				<div
					class="w-full aspect-[1/1.28] bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden shadow-inner text-slate-800 font-sans select-none"
				>
					<!-- TEMPLATE 1: CLASSIC DESIGN -->
					{#if t.type === 'standard'}
						<div class="space-y-2">
							<div class="flex justify-between items-start border-b pb-1.5 border-slate-200">
								<div>
									<div class="font-bold text-[9px] text-slate-900">Haq Plus</div>
									<div class="text-[7px] text-slate-400">Order: #0043</div>
								</div>
								<div class="text-right text-[7px] text-slate-500">
									<div>Date: 2026-01-14</div>
									<div>0156007230</div>
								</div>
							</div>

							<div class="text-[7.5px] bg-slate-50 p-1.5 rounded border border-slate-100">
								<span class="font-bold">Ship To:</span> কামরুল হাসান, মিরপুর-১০, ঢাকা।
							</div>

							<!-- Table -->
							<div class="space-y-1">
								<div class="grid grid-cols-4 font-bold text-[7px] text-slate-400 border-b pb-0.5 border-slate-100">
									<span class="col-span-2">Product</span>
									<span class="text-center">Qty</span>
									<span class="text-right">Total</span>
								</div>
								<div class="grid grid-cols-4 text-[7px] py-0.5 border-b border-dashed border-slate-100">
									<span class="col-span-2 font-medium truncate">Aura Pro Earbuds</span>
									<span class="text-center">1</span>
									<span class="text-right font-mono">৳ 1,790</span>
								</div>
							</div>
						</div>

						<div class="pt-1.5 border-t border-slate-200 space-y-1 text-[7px]">
							<div class="flex justify-between text-slate-500">
								<span>Subtotal:</span>
								<span class="font-mono">৳ 1,790</span>
							</div>
							<div class="flex justify-between text-slate-500">
								<span>Delivery Fee:</span>
								<span class="font-mono">৳ 60</span>
							</div>
							<div class="flex justify-between font-bold text-[8px] text-slate-900 pt-0.5 border-t border-slate-100">
								<span>Grand Total:</span>
								<span class="font-mono text-emerald-600">৳ 1,850</span>
							</div>
							<div class="text-[6.5px] text-center text-slate-400 pt-1">Thank you for your order!</div>
						</div>

					<!-- TEMPLATE 2: MODERN DESIGN (THERMAL 3-INCH) -->
					{:else}
						{#if t.type === 'thermal'}
							<div class="space-y-2">
								<!-- Top Barcode -->
								<div class="text-center border-b pb-1 border-slate-200">
									<div class="font-mono text-[9px] tracking-widest text-slate-800">||| | ||||| ||| ||||</div>
									<div class="font-bold text-[8px] tracking-widest">0043</div>
								</div>

								<!-- 2 Large Courier Metric Boxes -->
								<div class="grid grid-cols-2 gap-1.5">
									<div class="border border-slate-800 rounded p-1 text-center bg-slate-50">
										<div class="text-[6px] text-slate-500">HUB CODE</div>
										<div class="font-black text-[11px] text-slate-900">65B</div>
									</div>
									<div class="border border-slate-800 rounded p-1 text-center bg-slate-50">
										<div class="text-[6px] text-slate-500">COD AMOUNT</div>
										<div class="font-black text-[11px] text-slate-900">1840Tk</div>
									</div>
								</div>

								<!-- Receiver & QR -->
								<div class="flex items-center justify-between gap-1 border border-slate-200 p-1.5 rounded">
									<div class="text-[7px] space-y-0.5">
										<div class="font-bold">Receiver: ফাহিম হোসেন</div>
										<div class="text-slate-500 text-[6.5px]">01712-XXXXXX</div>
										<div class="text-slate-500 text-[6.5px]">ধানমন্ডি, ঢাকা</div>
									</div>
									<div class="w-8 h-8 border border-slate-300 rounded flex items-center justify-center shrink-0">
										<QrCode class="w-6 h-6 text-slate-800" />
									</div>
								</div>
							</div>

							<div class="text-[6.5px] text-center text-slate-400 border-t pt-1 border-slate-200">
								Shop Name: Haq Plus Store • Halal Delivery
							</div>

						<!-- TEMPLATE 3: MINIMAL DESIGN -->
						{:else if t.type === 'sticker'}
							<div class="space-y-2">
								<div class="flex items-start justify-between border-b pb-1.5 border-slate-200">
									<div class="text-[7px] space-y-0.5">
										<div class="font-black text-[8px] text-emerald-700">AURA LOGISTICS</div>
										<div class="text-slate-500">Shipped From: Mirpur, Dhaka</div>
										<div class="text-slate-500">0156007230</div>
									</div>
									<div class="w-9 h-9 border border-slate-300 rounded p-0.5 flex items-center justify-center">
										<QrCode class="w-7 h-7 text-slate-900" />
									</div>
								</div>

								<div class="space-y-1 p-2 rounded bg-slate-50 border border-slate-200/80 text-[7.5px]">
									<div><span class="font-bold text-slate-500">Shipped To:</span> <strong>হাসান চৌধুরী</strong></div>
									<div><span class="font-bold text-slate-500">Phone:</span> 01886-446845</div>
									<div><span class="font-bold text-slate-500">Address:</span> মারুকা, দাউদকান্দি, কুমিল্লা।</div>
								</div>
							</div>

							<div class="border-t pt-1.5 border-slate-200 flex justify-between items-center text-[7px]">
								<span class="font-bold text-slate-700">Parcel COD: ৳ 1,450</span>
								<span class="font-mono text-slate-400">TRK-88210</span>
							</div>

						<!-- TEMPLATE 4: CLASSIC DETAILED -->
						{:else if t.type === 'detailed'}
							<div class="space-y-1.5">
								<div class="flex justify-between items-center border-b pb-1 border-slate-200">
									<span class="font-black text-[8.5px]">INVOICE SLIP</span>
									<span class="font-mono text-[7px] text-slate-500">|||| | |||| 8801</span>
								</div>

								<div class="text-[6.5px] text-slate-600 space-y-0.5">
									<div>Customer: শফিউল আলম • 01912-345678</div>
									<div>Address: সিলেট সদর, সিলেট</div>
								</div>

								<!-- Multi-item table -->
								<div class="border border-slate-200 rounded text-[6.5px]">
									<div class="grid grid-cols-5 font-bold bg-slate-50 p-1 border-b">
										<span class="col-span-2">Item</span>
										<span class="text-center">Qty</span>
										<span class="text-center">Rate</span>
										<span class="text-right">Total</span>
									</div>
									<div class="grid grid-cols-5 p-1 border-b border-dashed border-slate-100">
										<span class="col-span-2 truncate">Wireless Headphone</span>
										<span class="text-center">1</span>
										<span class="text-center font-mono">1500</span>
										<span class="text-right font-mono">1500</span>
									</div>
									<div class="grid grid-cols-5 p-1">
										<span class="col-span-2 truncate">Fast Charger 33W</span>
										<span class="text-center">1</span>
										<span class="text-center font-mono">450</span>
										<span class="text-right font-mono">450</span>
									</div>
								</div>
							</div>

							<div class="flex justify-between items-end border-t pt-1 border-slate-200 text-[6.5px]">
								<div class="w-6 h-6 border rounded flex items-center justify-center">
									<QrCode class="w-5 h-5 text-slate-700" />
								</div>
								<div class="text-right space-y-0.5">
									<div class="text-slate-500">SubTotal: ৳ 1,950</div>
									<div class="font-bold text-[7.5px] text-slate-900">Total: ৳ 2,070</div>
								</div>
							</div>

						<!-- TEMPLATE 5: MINIMAL DETAILED WITH PRODUCT THUMBNAILS -->
						{:else if t.type === 'detailed_photo'}
							<div class="space-y-1.5">
								<div class="flex justify-between items-center border-b pb-1 border-slate-200">
									<div class="font-bold text-[8px] text-slate-900">Haq Plus</div>
									<div class="font-mono text-[7px] text-slate-400">||| ||||| |||</div>
								</div>

								<div class="text-[6.5px] text-slate-500">
									Inv: #INV-2026-90 • কাস্টমার: জাহিদুল ইসলাম
								</div>

								<!-- Items with mini icon -->
								<div class="space-y-1 text-[6.5px]">
									<div class="flex items-center gap-1.5 p-1 rounded bg-slate-50 border border-slate-100">
										<div class="w-4 h-4 bg-emerald-100 rounded flex items-center justify-center shrink-0 text-[6px]">🎧</div>
										<div class="truncate flex-1 font-medium">Pro Studio Headphone</div>
										<div class="font-mono text-[7px]">৳1,850</div>
									</div>
									<div class="flex items-center gap-1.5 p-1 rounded bg-slate-50 border border-slate-100">
										<div class="w-4 h-4 bg-indigo-100 rounded flex items-center justify-center shrink-0 text-[6px]">⌚</div>
										<div class="truncate flex-1 font-medium">Smart Watch Fit 2</div>
										<div class="font-mono text-[7px]">৳2,200</div>
									</div>
								</div>
							</div>

							<div class="border-t pt-1 border-slate-200 text-[6.5px] space-y-0.5">
								<div class="flex justify-between text-slate-500">
									<span>Delivered by Steadfast:</span>
									<span class="font-mono text-emerald-600">PAID</span>
								</div>
								<div class="flex justify-between font-bold text-[7.5px]">
									<span>Net Payable:</span>
									<span class="font-mono">৳ 4,050</span>
								</div>
							</div>

						<!-- TEMPLATE 6: STICKER PRINT (4X6 THERMAL) -->
						{:else if t.type === 'parcel_sticker'}
							<div class="space-y-1.5">
								<div class="flex justify-between items-start border-b pb-1 border-slate-200">
									<div>
										<div class="font-bold text-[8px] text-slate-900">Haq Plus</div>
										<div class="text-[6px] text-slate-500">Shipped From: Dhaka</div>
									</div>
									<div class="w-7 h-7 border rounded p-0.5 flex items-center justify-center">
										<QrCode class="w-5 h-5 text-slate-800" />
									</div>
								</div>

								<div class="p-1 rounded bg-amber-50/50 border border-amber-100 text-[6.5px] space-y-0.5">
									<div><strong>Shipped To:</strong> শফিক মৃধা</div>
									<div><strong>Phone:</strong> 01723-456789</div>
									<div><strong>Address:</strong> বরিশাল সদর, বরিশাল।</div>
								</div>

								<div class="border border-slate-200 rounded p-1 text-[6.5px] space-y-0.5 bg-slate-50">
									<div class="flex justify-between">
										<span>Winter Combo x 1</span>
										<span class="font-mono">৳ 3,200</span>
									</div>
									<div class="flex justify-between text-slate-500">
										<span>Delivery:</span>
										<span class="font-mono">৳ 100</span>
									</div>
								</div>
							</div>

							<div class="border-t pt-1 border-slate-200 flex justify-between items-center text-[7.5px]">
								<span class="font-bold">Grand Total:</span>
								<span class="font-bold font-mono text-emerald-600">৳ 3,300</span>
							</div>

						<!-- TEMPLATE 7: PREMIUM ELEGANT -->
						{:else}
							<div class="space-y-1.5">
								<div class="flex justify-between items-center border-b pb-1 border-slate-200">
									<div class="font-serif font-black text-[9px] tracking-wide text-slate-900">ELEGANT LUXE</div>
									<div class="font-mono text-[7px] text-slate-400">||| |||| ||||</div>
								</div>

								<div class="border-l-2 border-[#5845eb] pl-1.5 py-0.5 text-[6.5px] text-slate-600">
									<div class="font-bold text-slate-900">Customer: মেহজাবিন চৌধুরী</div>
									<div>গুলশান-২, ঢাকা • 01711-223344</div>
								</div>

								<div class="border border-slate-200 rounded text-[6.5px] p-1 bg-slate-50 space-y-0.5">
									<div class="flex justify-between font-semibold">
										<span>Premium Silk Saree</span>
										<span class="font-mono">৳ 6,500</span>
									</div>
									<div class="flex justify-between text-slate-400 text-[6px]">
										<span>SKU: LUX-882 • Qty: 1</span>
										<span>Vat: Included</span>
									</div>
								</div>
							</div>

							<div class="border-t pt-1 border-slate-200 flex justify-between items-center text-[6.5px]">
								<div class="text-[6px] text-slate-400">Authorized Signature: ______</div>
								<div class="font-bold font-mono text-[7.5px] text-slate-900">৳ 6,500</div>
							</div>
						{/if}
					{/if}
				</div>

				<!-- Card Footer / Action Button -->
				<div class="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
					<div class="text-center">
						<h3 class="text-sm font-bold text-slate-900">{t.name}</h3>
						<p class="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{t.desc}</p>
					</div>

					{#if isSelected}
						<Button
							type="button"
							class="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs rounded-xl gap-1.5 shadow-sm"
						>
							<CheckCircle2 class="w-4 h-4" />
							<span>সক্রিয় রয়েছে (Active)</span>
						</Button>
					{:else}
						<Button
							type="button"
							disabled={isSaving}
							onclick={() => activateTemplate(t.id)}
							class="w-full bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-[0.98]"
						>
							{#if isSaving}
								<Loader2 class="w-3.5 h-3.5 animate-spin mr-1" />
							{/if}
							<span>অ্যাক্টিভ করুন</span>
						</Button>
					{/if}
				</div>
			</Card>
		{/each}
	</div>

	<!-- Configuration & Checkbox Options Matching Screenshot 2 -->
	<Card class="p-6 sm:p-7 space-y-6 bg-white border border-slate-200/90 shadow-sm rounded-3xl mt-8">
		<div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
			<div class="w-10 h-10 rounded-2xl bg-[#5845eb]/10 flex items-center justify-center text-[#5845eb]">
				<SlidersHorizontal class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base sm:text-lg font-bold text-slate-900">ইনভয়েস ডিসপ্লে অপশন ও সেটিংস</h3>
				<p class="text-xs text-slate-500">প্রিন্ট কপি ও স্লিপে কোন কোন তথ্য দৃশ্যমান হবে তা নির্ধারণ করুন</p>
			</div>
		</div>

		<div class="space-y-5">
			<!-- Option 1: Disable Price on Invoice -->
			<div class="space-y-2">
				<label class="text-xs sm:text-sm font-bold text-slate-900 block">
					ইনভয়েসে পণ্যের দাম প্রদর্শন (Price Visibility)
				</label>
				<div class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 transition-colors">
					<div class="pt-0.5">
						<Checkbox id="disable-price" bind:checked={disablePrice} />
					</div>
					<label for="disable-price" class="text-xs sm:text-sm text-slate-700 cursor-pointer select-none leading-relaxed">
						<span class="font-bold text-slate-900 block">ইনভয়েসে পণ্যের মূল্য ও টাকার পরিমাণ গোপন রাখুন</span>
						<span class="text-[11px] sm:text-xs text-slate-500 block mt-0.5">
							ইনভয়েস বা ডেলিভারি স্লিপে পণ্যের একক মূল্য, সাব-টোটাল ও মোট টাকা প্রদর্শন করবেন না (ড্রপশিপিং বা গিফট অর্ডারের ক্ষেত্রে প্রযোজ্য)
						</span>
					</label>
				</div>
			</div>

			<!-- Option 2: Enable Courier Label / Barcode & QR -->
			<div class="space-y-2">
				<label class="text-xs sm:text-sm font-bold text-slate-900 block">
					কুরিয়ার বারকোড ও ট্র্যাকিং কিউআর কোড (Courier Tracking Label)
				</label>
				<div class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 transition-colors">
					<div class="pt-0.5">
						<Checkbox id="enable-courier" bind:checked={enableCourier} />
					</div>
					<label for="enable-courier" class="text-xs sm:text-sm text-slate-700 cursor-pointer select-none leading-relaxed">
						<span class="font-bold text-slate-900 block">ইনভয়েসে কুরিয়ার ট্র্যাকিং বারকোড ও কিউআর কোড যুক্ত করুন</span>
						<span class="text-[11px] sm:text-xs text-slate-500 block mt-0.5">
							ইনভয়েসের উপর স্বয়ংক্রিয়ভাবে কুরিয়ার ট্র্যাকিং বারকোড ও পার্সেল স্ক্যান কোড প্রিন্ট হবে, যাতে ডেলিভারি ম্যান সহজেই স্ক্যান করতে পারেন
						</span>
					</label>
				</div>
			</div>

			<!-- Option 3: Return Policy / Footer Note -->
			<div class="space-y-2">
				<label class="text-xs sm:text-sm font-bold text-slate-900 block">
					রিটার্ন পলিসি ও গ্রাহক নির্দেশনাবলী
				</label>
				<div class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 transition-colors">
					<div class="pt-0.5">
						<Checkbox id="enable-return-policy" bind:checked={enableReturnPolicy} />
					</div>
					<label for="enable-return-policy" class="text-xs sm:text-sm text-slate-700 cursor-pointer select-none leading-relaxed">
						<span class="font-bold text-slate-900 block">ইনভয়েসের নিচে ডেলিভারি চেক নোট ও হেল্পলাইন নাম্বার প্রিন্ট করুন</span>
						<span class="text-[11px] sm:text-xs text-slate-500 block mt-0.5">
							পণ্য রিসিভ করার সময় চেক করার অনুরোধ এবং রিটার্ন পলিসির সংক্ষিপ্ত বিবরণ প্রতিটি চালানের নিচে প্রিন্ট হবে
						</span>
					</label>
				</div>
			</div>
		</div>

		<!-- Save Changes Button Matching Screenshot 2 -->
		<div class="pt-4 border-t border-slate-100 flex items-center justify-start">
			<Button
				type="button"
				disabled={isSaving}
				onclick={() => saveSettings()}
				class="bg-[#5845eb] hover:bg-[#4734d6] text-white font-bold px-8 py-2.5 rounded-xl shadow-md shadow-[#5845eb]/20 flex items-center gap-2 text-xs sm:text-sm transition-all duration-200 active:scale-[0.98]"
			>
				{#if isSaving}
					<Loader2 class="w-4 h-4 animate-spin" />
					<span>সংরক্ষণ হচ্ছে...</span>
				{:else}
					<Check class="w-4 h-4 stroke-[3]" />
					<span>পরিবর্তন সংরক্ষণ করুন</span>
				{/if}
			</Button>
		</div>
	</Card>
</div>
