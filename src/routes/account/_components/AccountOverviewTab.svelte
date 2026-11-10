<script lang="ts">
	import {
		User,
		MapPin,
		Package,
		Clock,
		CheckCircle2,
		ArrowRight,
		Edit3,
		ShieldCheck,
		Phone,
		Mail,
		ShoppingBag,
		Truck
	} from 'lucide-svelte';
	import { Button } from '#lib/components/ui';
	import OrderCard from './OrderCard.svelte';
	import OrderInvoiceModal from './OrderInvoiceModal.svelte';

	interface Props {
		user: any;
		customer: any;
		orders: any[];
		onNavigateTab: (tab: string) => void;
	}

	let { user, customer, orders = [], onNavigateTab }: Props = $props();

	// Quick Stats Calculation
	const totalOrders = $derived(orders.length);
	const inProgressCount = $derived(
		orders.filter((o) => {
			const s = String(o.status || '').toLowerCase();
			return s === 'pending' || s === 'processing' || s === 'confirmed' || s === 'shipped' || o.courierStatus === 'in_transit';
		}).length
	);
	const deliveredCount = $derived(
		orders.filter((o) => {
			const s = String(o.status || '').toLowerCase();
			return s === 'delivered' || s === 'partial_delivered';
		}).length
	);

	// Latest 2 orders
	const recentOrders = $derived(orders.slice(0, 2));

	// Invoice Modal State
	let selectedInvoiceOrder = $state<any>(null);
	let isInvoiceModalOpen = $state(false);

	function openInvoice(ord: any) {
		selectedInvoiceOrder = ord;
		isInvoiceModalOpen = true;
	}

	// Default Address computation
	const defaultAddress = $derived.by(() => {
		if (customer?.address) {
			return {
				name: customer.name || user?.name || 'সম্মানিত গ্রাহক',
				phone: customer.phone || 'ফোন নম্বর নেই',
				address: customer.address,
				city: customer.city || 'ঢাকা',
				district: customer.district || 'ঢাকা',
				tag: 'হোম ডেলিভারি'
			};
		}
		if (orders.length > 0 && orders[0].shippingAddress) {
			const o = orders[0];
			return {
				name: o.customerName || user?.name || 'সম্মানিত গ্রাহক',
				phone: o.customerPhone || 'ফোন নম্বর নেই',
				address: o.shippingAddress,
				city: o.deliveryArea === 'inside_dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে',
				district: o.deliveryArea === 'inside_dhaka' ? 'ঢাকা' : 'অন্যান্য',
				tag: 'সর্বশেষ ডেলিভারি ঠিকানা'
			};
		}
		return null;
	});
</script>

<div class="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Welcome Banner (Daraz Style) -->
	<div class="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<!-- Background watermark -->
		<div class="absolute -right-6 -bottom-8 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

		<div class="space-y-1 relative z-10">
			<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-white/15 text-indigo-100 backdrop-blur-xs mb-1">
				<ShieldCheck class="w-3.5 h-3.5 text-emerald-300" />
				<span>নিরাপদ ও ভেরিফাইড গ্রাহক একাউন্ট</span>
			</div>
			<h2 class="text-xl sm:text-2xl font-black tracking-tight text-white">
				স্বাগতম, {user.name || 'গ্রাহক'}!
			</h2>
			<p class="text-xs text-indigo-100/90 max-w-md font-medium leading-relaxed">
				আপনার প্রোফাইল, অর্ডার হিস্টোরি, ডেলিভারি ট্র্যাকিং ও অ্যাড্রেস খাতা এক জায়গায় সহজে ম্যানেজ করুন।
			</p>
		</div>

		<div class="flex items-center gap-2 relative z-10">
			<Button
				type="button"
				size="sm"
				onclick={() => onNavigateTab('orders')}
				class="text-xs font-bold gap-1.5 rounded-2xl bg-white text-[#5845eb] hover:bg-slate-50 cursor-pointer shadow-sm"
			>
				<Package class="w-3.5 h-3.5" />
				<span>আমার অর্ডারসমূহ</span>
			</Button>
		</div>
	</div>

	<!-- 3 Daraz-Style Core Account Snapshot Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<!-- Card 1: Personal Profile -->
		<div class="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between pb-3 border-b border-slate-100">
					<span class="text-xs font-bold text-slate-500 flex items-center gap-2">
						<User class="w-4 h-4 text-[#5845eb]" />
						<span>ব্যক্তিগত প্রোফাইল</span>
					</span>
					<button
						type="button"
						onclick={() => onNavigateTab('profile')}
						class="text-[11px] font-bold text-[#5845eb] hover:underline flex items-center gap-1 cursor-pointer"
					>
						<Edit3 class="w-3 h-3" />
						<span>এডিট</span>
					</button>
				</div>

				<div class="mt-4 space-y-2.5 text-xs">
					<div>
						<span class="text-[10px] text-slate-400 block font-semibold">গ্রাহকের পূর্ণ নাম</span>
						<span class="font-bold text-slate-900 text-sm">{user.name || 'গ্রাহক'}</span>
					</div>

					<div>
						<span class="text-[10px] text-slate-400 block font-semibold">ইমেইল ঠিকানা</span>
						<span class="text-slate-700 font-mono flex items-center gap-1.5 truncate">
							<Mail class="w-3 h-3 text-slate-400 shrink-0" />
							<span class="truncate">{user.email || '—'}</span>
						</span>
					</div>

					<div>
						<span class="text-[10px] text-slate-400 block font-semibold">মোবাইল ফোন নম্বর</span>
						<span class="text-slate-700 font-mono flex items-center gap-1.5">
							<Phone class="w-3 h-3 text-slate-400 shrink-0" />
							<span>{customer?.phone || 'যোগ করা হয়নি'}</span>
						</span>
					</div>
				</div>
			</div>

			<div class="mt-4 pt-3 border-t border-slate-100">
				<button
					type="button"
					onclick={() => onNavigateTab('profile')}
					class="w-full text-center py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
				>
					পাসওয়ার্ড পরিবর্তন করুন
				</button>
			</div>
		</div>

		<!-- Card 2: Address Book -->
		<div class="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between pb-3 border-b border-slate-100">
					<span class="text-xs font-bold text-slate-500 flex items-center gap-2">
						<MapPin class="w-4 h-4 text-[#5845eb]" />
						<span>ঠিকানা খাতা (Address Book)</span>
					</span>
					<button
						type="button"
						onclick={() => onNavigateTab('address')}
						class="text-[11px] font-bold text-[#5845eb] hover:underline flex items-center gap-1 cursor-pointer"
					>
						<Edit3 class="w-3 h-3" />
						<span>ম্যানেজ</span>
					</button>
				</div>

				<div class="mt-4 text-xs space-y-2">
					{#if defaultAddress}
						<div class="flex items-center gap-1.5 mb-1.5">
							<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-[#5845eb] border border-indigo-100">
								{defaultAddress.tag}
							</span>
							<span class="font-bold text-slate-900">{defaultAddress.name}</span>
						</div>

						<p class="text-slate-600 line-clamp-3 leading-relaxed">
							{defaultAddress.address}
						</p>

						<div class="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5 font-mono">
							<Phone class="w-3 h-3 text-slate-400" />
							<span>{defaultAddress.phone}</span>
						</div>
					{:else}
						<div class="py-6 text-center text-slate-400 space-y-1">
							<p>কোনো ডেলিভারি ঠিকানা সেভ করা নেই</p>
							<p class="text-[10px]">অর্ডারের দ্রুত ডেলিভারির জন্য ঠিকানা যোগ করুন</p>
						</div>
					{/if}
				</div>
			</div>

			<div class="mt-4 pt-3 border-t border-slate-100">
				<button
					type="button"
					onclick={() => onNavigateTab('address')}
					class="w-full text-center py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
				>
					{defaultAddress ? 'ঠিকানা পরিবর্তন করুন' : '+ নতুন ঠিকানা যোগ করুন'}
				</button>
			</div>
		</div>

		<!-- Card 3: Orders Breakdown -->
		<div class="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between pb-3 border-b border-slate-100">
					<span class="text-xs font-bold text-slate-500 flex items-center gap-2">
						<Package class="w-4 h-4 text-[#5845eb]" />
						<span>অর্ডার ওভারভিউ</span>
					</span>
					<button
						type="button"
						onclick={() => onNavigateTab('orders')}
						class="text-[11px] font-bold text-[#5845eb] hover:underline flex items-center gap-1 cursor-pointer"
					>
						<span>সকল</span>
						<ArrowRight class="w-3 h-3" />
					</button>
				</div>

				<div class="mt-4 space-y-2.5">
					<!-- Total -->
					<div class="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
						<span class="text-slate-600 font-semibold flex items-center gap-2">
							<Package class="w-4 h-4 text-slate-500" />
							<span>মোট অর্ডার</span>
						</span>
						<span class="font-black text-slate-900 text-sm font-mono">{totalOrders}টি</span>
					</div>

					<!-- In progress -->
					<div class="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-xs">
						<span class="text-amber-800 font-semibold flex items-center gap-2">
							<Clock class="w-4 h-4 text-amber-600" />
							<span>পেন্ডিং ও পথে আছে</span>
						</span>
						<span class="font-black text-amber-900 text-sm font-mono">{inProgressCount}টি</span>
					</div>

					<!-- Delivered -->
					<div class="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs">
						<span class="text-emerald-800 font-semibold flex items-center gap-2">
							<CheckCircle2 class="w-4 h-4 text-emerald-600" />
							<span>ডেলিভারি সম্পন্ন</span>
						</span>
						<span class="font-black text-emerald-900 text-sm font-mono">{deliveredCount}টি</span>
					</div>
				</div>
			</div>

			<div class="mt-4 pt-3 border-t border-slate-100">
				<button
					type="button"
					onclick={() => onNavigateTab('orders')}
					class="w-full text-center py-1.5 rounded-xl bg-[#5845eb]/10 hover:bg-[#5845eb]/20 text-[#5845eb] text-xs font-bold transition-colors cursor-pointer"
				>
					অর্ডারের ট্র্যাকিং দেখুন
				</button>
			</div>
		</div>
	</div>

	<!-- Recent Orders Strip (Daraz Style) -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-xl bg-indigo-50 text-[#5845eb] flex items-center justify-center">
					<Truck class="w-4 h-4 stroke-[2.3]" />
				</div>
				<div>
					<h3 class="text-sm sm:text-base font-bold text-slate-900">সাম্প্রতিক অর্ডারসমূহ</h3>
					<p class="text-[11px] text-slate-500">আপনার সর্বশেষ অর্ডার ও ডেলিভারি স্ট্যাটাস</p>
				</div>
			</div>

			{#if orders.length > 2}
				<button
					type="button"
					onclick={() => onNavigateTab('orders')}
					class="text-xs font-bold text-[#5845eb] hover:underline flex items-center gap-1 cursor-pointer"
				>
					<span>সবগুলো দেখুন ({orders.length})</span>
					<ArrowRight class="w-3.5 h-3.5" />
				</button>
			{/if}
		</div>

		{#if recentOrders.length > 0}
			<div class="space-y-4">
				{#each recentOrders as order (order.id)}
					<OrderCard {order} onViewInvoice={openInvoice} />
				{/each}
			</div>
		{:else}
			<div class="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-3 shadow-2xs">
				<div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
					<ShoppingBag class="w-6 h-6" />
				</div>
				<p class="text-xs text-slate-500">এখনো কোনো অর্ডার প্লেস করা হয়নি</p>
				<Button
					href="/"
					size="sm"
					class="text-xs font-bold rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white"
				>
					কেনাকাটা শুরু করুন
				</Button>
			</div>
		{/if}
	</div>
</div>

<!-- Invoice Modal -->
<OrderInvoiceModal
	bind:isOpen={isInvoiceModalOpen}
	order={selectedInvoiceOrder}
	onClose={() => (isInvoiceModalOpen = false)}
/>

