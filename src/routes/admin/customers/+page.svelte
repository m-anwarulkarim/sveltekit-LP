<script lang="ts">
	import { Users, PhoneCall, Award } from 'lucide-svelte';

	let { data }: { data: any } = $props();

	function formatTaka(amount: number) {
		return '৳' + (amount || 0).toLocaleString('en-US');
	}

	// Group orders by customer
	let customerStats = $derived(() => {
		const map = new Map<string, { name: string; phone: string; address: string; totalSpent: number; orderCount: number }>();
		for (const order of data.orders || []) {
			const phone = order.customerEmail || 'N/A';
			if (!map.has(phone)) {
				map.set(phone, {
					name: order.customerName,
					phone,
					address: order.shippingAddress,
					totalSpent: order.total || 0,
					orderCount: 1
				});
			} else {
				const existing = map.get(phone)!;
				existing.totalSpent += (order.total || 0);
				existing.orderCount += 1;
			}
		}
		return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
	});
</script>

<div class="space-y-6 max-w-7xl mx-auto">
	<!-- Header -->
	<div class="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
		<div>
			<h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
				<Users class="w-5 h-5 text-[#5845eb]" />
				<span>গ্রাহক ও ভিআইপি ক্লাব (Customer Database)</span>
			</h2>
			<p class="text-xs text-slate-500 mt-0.5">
				রিপিট বায়ার টেলিমেট্রি, মোট পারচেজ হিস্টোরি ও নিউজলেটার গ্রাহক তালিকা
			</p>
		</div>

		<div class="flex items-center gap-2">
			<span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#5845eb] border border-indigo-200">
				{customerStats().length} জন মোট কাস্টমার
			</span>
			<span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
				{(data.newsletter || []).length} জন ভিআইপি
			</span>
		</div>
	</div>

	<!-- Top Customers Table -->
	<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
		<div class="p-4 border-b border-slate-100 flex items-center justify-between">
			<h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
				<Award class="w-4 h-4 text-amber-500" />
				<span>শীর্ষ ক্রেতাদের তালিকা (Top Ordering Customers)</span>
			</h3>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead>
					<tr class="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
						<th class="py-3 px-4">গ্রাহকের নাম</th>
						<th class="py-3 px-4">মোবাইল নম্বর</th>
						<th class="py-3 px-4">ডেলিভারি ঠিকানা</th>
						<th class="py-3 px-4 text-center">অর্ডার সংখ্যা</th>
						<th class="py-3 px-4 text-right">মোট ক্রয়মূল্য</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#if customerStats().length === 0}
						<tr>
							<td colspan="5" class="py-12 text-center text-slate-400">কোনো কাস্টমার ডেটা পাওয়া যায়নি।</td>
						</tr>
					{/if}
					{#each customerStats() as cust}
						<tr class="hover:bg-slate-50/70 transition-colors">
							<td class="py-3.5 px-4 font-bold text-slate-900">{cust.name}</td>
							<td class="py-3.5 px-4">
								<div class="flex items-center gap-1.5 font-mono text-slate-800">
									<span>{cust.phone}</span>
									<a href="tel:{cust.phone}" class="text-emerald-600 hover:text-emerald-700 p-0.5">
										<PhoneCall class="w-3 h-3" />
									</a>
								</div>
							</td>
							<td class="py-3.5 px-4 text-slate-600 max-w-[220px] truncate">{cust.address}</td>
							<td class="py-3.5 px-4 text-center">
								<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
									{cust.orderCount} টি
								</span>
							</td>
							<td class="py-3.5 px-4 text-right font-bold text-slate-900 font-['Outfit']">
								{formatTaka(cust.totalSpent)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Newsletter Subscribers Card -->
	<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
		<div class="p-4 border-b border-slate-100">
			<h3 class="text-sm font-bold text-slate-900">নিবন্ধিত ভিআইপি নিউজলেটার সাবস্ক্রাইবার</h3>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead>
					<tr class="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
						<th class="py-3 px-4">ইমেইল / যোগাযোগ</th>
						<th class="py-3 px-4">স্ট্যাটাস</th>
						<th class="py-3 px-4 text-right">যোগদানের তারিখ</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.newsletter || [] as sub}
						<tr class="hover:bg-slate-50/50">
							<td class="py-3 px-4 font-mono font-bold text-slate-800">{sub.email}</td>
							<td class="py-3 px-4">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
									সক্রিয় ভিআইপি
								</span>
							</td>
							<td class="py-3 px-4 text-right text-slate-400">
								{new Date(sub.createdAt).toLocaleDateString('bn-BD')}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
