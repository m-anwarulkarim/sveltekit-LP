<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Badge, Input, confirmSubmit } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import {
		Search,
		PhoneCall,
		Phone,
		MessageCircle,
		CheckCircle2,
		AlertCircle,
		Clock,
		ArrowUpRight,
		User,
		MapPin,
		Trash2,
		FileEdit,
		Sparkles,
		X,
		ShoppingBag
	} from 'lucide-svelte';

	let { data }: { data: any } = $props();

	// Search & Filter State
	let searchQuery = $state('');
	let recoveryStatusFilter = $state('all');

	// Helper to extract items safely
	function parseOrderItems(itemsJson: any) {
		if (Array.isArray(itemsJson)) return itemsJson;
		try {
			return JSON.parse(itemsJson || '[]');
		} catch {
			return [];
		}
	}

	// Filter all incomplete orders
	let allIncompleteOrders = $derived(
		(data.orders || [])
			.filter((o: any) => !o.isTrashed && o.status === 'incomplete')
			.map((order: any) => {
				const items = parseOrderItems(order.items);
				const firstItem = items[0] || {};
				return {
					...order,
					parsedItems: items,
					dropOffStage: firstItem.dropOffStage || order.dropOffStage || 'Step 2: ফর্ম অসম্পূর্ণ',
					recoveryStatus: firstItem.recoveryStatus || order.recoveryStatus || 'uncontacted',
					notes: firstItem.notes || order.notes || '',
					timeAgo: firstItem.timeAgo || order.timeAgo || 'কিছুক্ষণ আগে',
					source: firstItem.source || 'Direct Funnel'
				};
			})
	);

	// Summary KPI calculations
	let totalIncompleteCount = $derived(allIncompleteOrders.length);
	
	let totalPotentialRevenue = $derived(
		allIncompleteOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0)
	);

	let convertedCount = $derived(
		allIncompleteOrders.filter((o: any) => o.recoveryStatus === 'converted').length
	);

	let recoveryRatePercent = $derived(
		totalIncompleteCount > 0 ? ((convertedCount / totalIncompleteCount) * 100).toFixed(1) : '0.0'
	);

	let uncontactedCount = $derived(
		allIncompleteOrders.filter((o: any) => o.recoveryStatus === 'uncontacted').length
	);

	// Filter Tabs definition
	const RECOVERY_TABS = [
		{ id: 'all', label: 'সব', badgeCount: () => totalIncompleteCount },
		{ id: 'uncontacted', label: 'আন-কন্টাক্টেড', badgeCount: () => uncontactedCount, isAlert: true },
		{
			id: 'called',
			label: 'কল করা হয়েছে',
			badgeCount: () => allIncompleteOrders.filter((o: any) => o.recoveryStatus === 'called').length
		},
		{
			id: 'whatsapp_sent',
			label: 'হোয়াটসঅ্যাপ পাঠানো',
			badgeCount: () => allIncompleteOrders.filter((o: any) => o.recoveryStatus === 'whatsapp_sent').length
		},
		{
			id: 'followup',
			label: 'ফলো-আপ',
			badgeCount: () => allIncompleteOrders.filter((o: any) => o.recoveryStatus === 'followup').length
		},
		{
			id: 'converted',
			label: 'কনভার্টেড',
			badgeCount: () => convertedCount
		}
	];

	// Filtered list based on tab and search
	let filteredOrders = $derived(
		allIncompleteOrders.filter((order: any) => {
			const matchesFilter =
				recoveryStatusFilter === 'all' ? true : order.recoveryStatus === recoveryStatusFilter;

			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				q === ''
					? true
					: (order.orderNumber || '').toLowerCase().includes(q) ||
						(order.id || '').toLowerCase().includes(q) ||
						(order.customerName || '').toLowerCase().includes(q) ||
						(order.customerPhone || '').includes(q) ||
						(order.customerEmail || '').includes(q) ||
						(order.notes || '').toLowerCase().includes(q);

			return matchesFilter && matchesSearch;
		})
	);

	// Direct 1-Click WhatsApp Trigger (Zero Popups)
	function sendWhatsAppDirect(order: any) {
		const rawPhone = order.customerEmail || order.customerPhone || '';
		const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
		if (!cleanPhone) {
			toast.error('গ্রাহকের কোনো মোবাইল নম্বর পাওয়া যায়নি!');
			return;
		}
		const formattedPhone = cleanPhone.startsWith('88')
			? cleanPhone
			: cleanPhone.startsWith('01')
				? `88${cleanPhone}`
				: cleanPhone;

		const customerName = order.customerName || 'সম্মানিত গ্রাহক';
		const productName = order.parsedItems[0]?.name || 'আমাদের পণ্য';
		const text = `আসসালামু আলাইকুম ${customerName} ভাই/ম্যাম, আপনি আমাদের Aura Store-এ "${productName}"-এর অর্ডারটি শুরু করেছিলেন কিন্তু সম্পন্ন করেননি। কোনো সহযোগিতা বা তথ্যের প্রয়োজন হলে আমাদের জানাতে পারেন। ধন্যবাদ!`;

		const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
		window.open(url, '_blank');
		toast.success('হোয়াটসঅ্যাপ ওপেন করা হয়েছে!');
	}

	// Status badge helper
	function getRecoveryStatusBadge(status: string) {
		switch (status) {
			case 'uncontacted':
				return { label: 'আন-কন্টাক্টেড', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
			case 'called':
				return { label: 'কল করা হয়েছে', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
			case 'whatsapp_sent':
				return { label: 'হোয়াটসঅ্যাপ সেন্ট', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
			case 'followup':
				return { label: 'ফলো-আপে আছে', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
			case 'converted':
				return { label: 'সফলভাবে কনভার্ট', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' };
			case 'lost':
				return { label: 'আগ্রহী নয় / বাতিল', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
			default:
				return { label: 'পেন্ডিং', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
		}
	}
</script>

<div class="space-y-6">

	<!-- Header with Action -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
		<div>
			<div class="flex items-center gap-3">
				<h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
					<span>Incomplete Orders</span>
					<span class="text-base font-normal text-slate-500">(ইনকমপ্লিট অর্ডার)</span>
				</h1>
				<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
					{totalIncompleteCount} টি ড্রপ-অফ লিড
				</span>
			</div>
			<p class="text-xs text-slate-500 mt-1">
				ল্যান্ডিং পেজে ফর্ম পূরণ শুরু করে ড্রপ-অফ করা লিডসমূহ — সরাসরি পূর্ণ পেজে বিস্তারিত দেখুন, কল দিন বা হোয়াটসঅ্যাপ পাঠিয়ে সেলস রিকভার করুন
			</p>
		</div>

		<div class="flex items-center gap-2.5">
			<Button href="/admin/orders" variant="outline" size="sm" class="gap-1.5 text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50">
				<ShoppingBag class="w-3.5 h-3.5 text-indigo-600" />
				<span>Web Orders এ যান</span>
			</Button>

			<Button href="/admin/orders/new" size="sm" class="gap-1.5 shadow-sm text-xs font-bold">
				<PhoneCall class="w-3.5 h-3.5" />
				<span>নতুন অর্ডার তৈরি</span>
			</Button>
		</div>
	</div>

	<!-- 4 Top KPI Analytics Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- 1. Total Abandoned -->
		<Card class="p-4 border-amber-100 bg-linear-to-br from-amber-50/60 to-white hover:shadow-md transition-shadow">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold uppercase tracking-wider text-amber-900">মোট ড্রপ-অফ</span>
				<div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
					<AlertCircle class="w-4 h-4" />
				</div>
			</div>
			<div class="mt-2 flex items-baseline gap-2">
				<span class="text-2xl font-black text-slate-900">{totalIncompleteCount}</span>
				<span class="text-xs text-amber-700 font-semibold">টি লিড</span>
			</div>
			<p class="text-[11px] text-slate-500 mt-1">ফর্ম সাবমিট না করে পেজ ত্যাগ করেছেন</p>
		</Card>

		<!-- 2. Potential Revenue -->
		<Card class="p-4 border-indigo-100 bg-linear-to-br from-indigo-50/50 to-white hover:shadow-md transition-shadow">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold uppercase tracking-wider text-indigo-900">সম্ভাব্য ভ্যালু</span>
				<div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
					<Sparkles class="w-4 h-4" />
				</div>
			</div>
			<div class="mt-2 flex items-baseline gap-1">
				<span class="text-2xl font-black text-slate-900">৳{totalPotentialRevenue.toLocaleString()}</span>
			</div>
			<p class="text-[11px] text-slate-500 mt-1">পুনরুদ্ধারযোগ্য মোট বিক্রয়মূল্য</p>
		</Card>

		<!-- 3. Recovery Rate -->
		<Card class="p-4 border-emerald-100 bg-linear-to-br from-emerald-50/50 to-white hover:shadow-md transition-shadow">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold uppercase tracking-wider text-emerald-900">রিকভারি রেট</span>
				<div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
					<CheckCircle2 class="w-4 h-4" />
				</div>
			</div>
			<div class="mt-2 flex items-baseline gap-2">
				<span class="text-2xl font-black text-emerald-700">{recoveryRatePercent}%</span>
				<span class="text-xs text-slate-500 font-medium">({convertedCount}/{totalIncompleteCount} কনভার্ট)</span>
			</div>
			<p class="text-[11px] text-slate-500 mt-1">যোগাযোগের মাধ্যমে সফল অর্ডার তৈরি</p>
		</Card>

		<!-- 4. Immediate Contact Needed -->
		<Card class="p-4 border-rose-100 bg-linear-to-br from-rose-50/60 to-white hover:shadow-md transition-shadow relative overflow-hidden">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold uppercase tracking-wider text-rose-900">অবিলম্বে কল প্রয়োজন</span>
				<div class="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center animate-pulse">
					<PhoneCall class="w-4 h-4" />
				</div>
			</div>
			<div class="mt-2 flex items-baseline gap-2">
				<span class="text-2xl font-black text-rose-600">{uncontactedCount}</span>
				<span class="text-xs text-rose-700 font-semibold">টি নতুন লিড</span>
			</div>
			<p class="text-[11px] text-rose-600/80 mt-1 font-medium">এখনই যোগাযোগ করলে কনভার্সন সম্ভাবনা সর্বোচ্চ</p>
		</Card>
	</div>

	<!-- Filter Tabs with Counts -->
	<div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
		{#each RECOVERY_TABS as tab}
			<button
				type="button"
				onclick={() => (recoveryStatusFilter = tab.id)}
				class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer {recoveryStatusFilter === tab.id
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
			>
				<span>{tab.label}</span>
				<span
					class="px-1.5 py-0.5 rounded-full text-[10px] font-black {recoveryStatusFilter === tab.id
						? 'bg-white/20 text-white'
						: tab.isAlert && tab.badgeCount() > 0
							? 'bg-rose-100 text-rose-700'
							: 'bg-slate-200/80 text-slate-700'}"
				>
					{tab.badgeCount()}
				</span>
			</button>
		{/each}
	</div>

	<!-- Search & Table Card -->
	<Card class="border-slate-200/80 shadow-xs overflow-hidden">
		<!-- Search and stats bar -->
		<div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
			<div class="relative w-full sm:w-96">
				<Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
				<Input
					bind:value={searchQuery}
					placeholder="অর্ডার আইডি, নাম, ফোন নম্বর বা নোট দিয়ে খুঁজুন..."
					class="pl-9 bg-white text-xs"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = '')}
						class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
						aria-label="Clear search"
					>
						<X class="w-3.5 h-3.5" />
					</button>
				{/if}
			</div>

			<div class="text-xs text-slate-500 font-medium">
				মোট <span class="font-bold text-slate-800">{filteredOrders.length}</span> টি ইনকমপ্লিট অর্ডার দৃশ্যমান
			</div>
		</div>

		<!-- Table View -->
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse text-xs">
				<thead>
					<tr class="border-b border-slate-200 bg-slate-100/70 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
						<th class="py-3 px-4">ড্রপ টাইম ও আইডি</th>
						<th class="py-3 px-4">কাস্টমার তথ্য</th>
						<th class="py-3 px-4">ড্রপ-অফ পর্যায়</th>
						<th class="py-3 px-4">আগ্রহী পণ্য ও সম্ভাব্য বিল</th>
						<th class="py-3 px-4">রিকভারি স্ট্যাটাস</th>
						<th class="py-3 px-4">নোট / মন্তব্য</th>
						<th class="py-3 px-4 text-right">তাত্ক্ষণিক রিকভারি অ্যাকশন</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#if filteredOrders.length === 0}
						<tr>
							<td colspan="7" class="py-12 text-center text-slate-400">
								<div class="flex flex-col items-center justify-center gap-2">
									<AlertCircle class="w-8 h-8 text-slate-300" />
									<p class="font-semibold text-sm text-slate-600">কোনো ইনকমপ্লিট অর্ডার পাওয়া যায়নি</p>
									<p class="text-xs text-slate-400">অন্য কোনো ফিল্টার বা সার্চ কি-ওয়ার্ড চেষ্টা করুন</p>
								</div>
							</td>
						</tr>
					{:else}
						{#each filteredOrders as order (order.id)}
							{@const statusInfo = getRecoveryStatusBadge(order.recoveryStatus)}
							<tr class="hover:bg-slate-50/80 transition-colors group">
								<!-- 1. Drop Time & ID -->
								<td class="py-3.5 px-4 whitespace-nowrap">
									<a
										href="/admin/orders/{order.id}"
										class="font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 group/id"
										title="সম্পূর্ণ ডেডিকেটেড অর্ডার পেজে যান"
									>
										<span>#{order.orderNumber || order.id.slice(0, 8)}</span>
										<ArrowUpRight class="w-3.5 h-3.5 opacity-60 group-hover/id:opacity-100 transition-opacity" />
									</a>
									<div class="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
										<Clock class="w-3 h-3 text-slate-400" />
										<span>{order.timeAgo}</span>
									</div>
									<div class="text-[10px] text-slate-400 font-medium mt-0.5">
										উৎস: {order.source}
									</div>
								</td>

								<!-- 2. Customer Info -->
								<td class="py-3.5 px-4 min-w-[190px]">
									<a
										href="/admin/orders/{order.id}"
										class="font-bold text-slate-900 hover:text-indigo-600 hover:underline flex items-center gap-1.5"
										title="গ্রাহকের সম্পূর্ণ অর্ডার বিবরণী খুলুন"
									>
										<User class="w-3.5 h-3.5 text-slate-400" />
										<span>{order.customerName || 'নাম লিখেননি'}</span>
									</a>
									<div class="mt-1 flex items-center gap-2 font-mono text-slate-700 font-medium">
										<span>{order.customerEmail || order.customerPhone}</span>
										<a
											href="tel:{order.customerEmail || order.customerPhone}"
											class="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
											title="সরাসরি কল দিন"
										>
											<Phone class="w-3 h-3" />
										</a>
									</div>
									{#if order.shippingAddress}
										<div class="flex items-start gap-1 text-[11px] text-slate-500 mt-1 line-clamp-1 max-w-[200px]" title={order.shippingAddress}>
											<MapPin class="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
											<span>{order.shippingAddress}</span>
										</div>
									{:else}
										<span class="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
											ঠিকানা পূরণ করেননি
										</span>
									{/if}
								</td>

								<!-- 3. Drop-off Stage -->
								<td class="py-3.5 px-4 whitespace-nowrap">
									<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80">
										<AlertCircle class="w-3 h-3 text-amber-600" />
										<span>{order.dropOffStage}</span>
									</span>
								</td>

								<!-- 4. Abandoned Products & Total -->
								<td class="py-3.5 px-4 min-w-[180px]">
									{#each order.parsedItems as item}
										<div class="font-bold text-slate-800 line-clamp-1" title={item.name}>
											{item.name}
										</div>
										<div class="text-[11px] text-slate-500">
											পরিমাণ: {item.quantity || 1} টি
										</div>
									{/each}
									<div class="text-xs font-black text-slate-900 mt-1">
										সম্ভাব্য বিল: ৳{(order.total || 0).toLocaleString()}
									</div>
								</td>

								<!-- 5. Recovery Status -->
								<td class="py-3.5 px-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border {statusInfo.bg}">
										{statusInfo.label}
									</span>
								</td>

								<!-- 6. Follow-up Notes -->
								<td class="py-3.5 px-4 max-w-[180px]">
									{#if order.notes}
										<a
											href="/admin/orders/{order.id}"
											class="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-900 transition-colors block"
											title={order.notes}
										>
											{order.notes}
										</a>
									{:else}
										<a
											href="/admin/orders/{order.id}"
											class="text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
											title="সম্পূর্ণ পেজে গিয়ে নোট লিখুন"
										>
											+ নোট লিখুন
										</a>
									{/if}
								</td>

								<!-- 7. High-Impact Action Buttons -->
								<td class="py-3.5 px-4 text-right whitespace-nowrap">
									<div class="flex items-center justify-end gap-1.5">
										<!-- 1-Click Direct WhatsApp Trigger (No Modal) -->
										<button
											type="button"
											onclick={() => sendWhatsAppDirect(order)}
											class="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer text-xs"
											title="১-ক্লিকে সরাসরি হোয়াটসঅ্যাপে বার্তা পাঠান (কোনো পপআপ ছাড়া)"
										>
											<MessageCircle class="w-3.5 h-3.5" />
											<span class="hidden xl:inline">WhatsApp</span>
										</button>

										<!-- Direct Call -->
										<a
											href="tel:{order.customerEmail || order.customerPhone}"
											class="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
											title="সরাসরি ফোন করুন"
										>
											<PhoneCall class="w-4 h-4" />
										</a>

										<!-- Convert to Confirmed Order -->
										<form method="POST" action="?/convertOrder" use:enhance>
											<input type="hidden" name="orderId" value={order.id} />
											<button
												type="submit"
												class="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer text-xs"
												title="সরাসরি কনফার্মড লাইভ অর্ডারে রূপান্তর করুন"
											>
												<CheckCircle2 class="w-3.5 h-3.5" />
												<span class="hidden sm:inline">কনফার্ম</span>
											</button>
										</form>

										<!-- Full Order Page Navigation (Replaced Popup Modal) -->
										<a
											href="/admin/orders/{order.id}"
											class="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
											title="সম্পূর্ণ ডেডিকেটেড অর্ডার পেজে বিস্তারিত দেখুন ও এডিট করুন"
										>
											<FileEdit class="w-4 h-4" />
										</a>

										<!-- Discard / Trash -->
										<form
											method="POST"
											action="?/deleteOrder"
											use:enhance={() => {
												return async ({ result, update }) => {
													if (result.type === 'success') {
														toast.success('ইনকমপ্লিট অর্ডারটি ট্র্যাশে সরানো হয়েছে!');
													}
													await update();
												};
											}}
											use:confirmSubmit={{
												title: 'অর্ডার ট্র্যাশে পাঠান',
												message: 'আপনি কি এই ইনকমপ্লিট অর্ডারটি ট্র্যাশে পাঠাতে চান?',
												confirmText: 'হ্যাঁ, ট্র্যাশে পাঠান',
												variant: 'destructive',
												icon: 'trash'
											}}
										>
											<input type="hidden" name="orderId" value={order.id} />
											<button
												type="submit"
												class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
												title="ড্রপ-অফ বাতিল বা ট্র্যাশে পাঠান"
											>
												<Trash2 class="w-4 h-4" />
											</button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</Card>

</div>
