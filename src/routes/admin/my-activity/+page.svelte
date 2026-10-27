<script lang="ts">
	import { Button, Input, Badge } from '#lib/components/ui';
	import {
		RefreshCw,
		Plus,
		Package,
		CheckCircle2,
		Truck,
		XCircle,
		RotateCcw,
		PhoneCall,
		DollarSign,
		Search,
		ExternalLink,
		ArrowRight,
		Calendar,
		Clock,
		Sparkles,
		ShieldCheck,
		User,
		Award,
		Zap,
		MessageSquare,
		Flame
	} from 'lucide-svelte';

	let { data }: { data: any } = $props();

	// Search & Filter State
	let searchQuery = $state('');
	let activeTab = $state<'my' | 'store'>('my');
	let isRefreshing = $state(false);
	let toastMessage = $state<string | null>(null);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			toastMessage = null;
		}, 3000);
	}

	function handleRefresh() {
		isRefreshing = true;
		setTimeout(() => {
			isRefreshing = false;
			showToast('Activity telemetry refreshed successfully!');
		}, 600);
	}

	// Dynamic Greeting according to current time
	let greeting = $derived.by(() => {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) return 'Good morning';
		if (hour >= 12 && hour < 16) return 'Good afternoon';
		if (hour >= 16 && hour < 19) return 'Good evening';
		return 'Good night';
	});

	// Orders data from layout
	let allOrders = $derived(data?.orders || []);

	// My Activity Orders (Admin's own processed items)
	let myOrders = $derived([
		{
			id: '1002',
			customerName: 'Rahim Uddin',
			phone: '01602867954',
			status: 'confirmed',
			amount: 135,
			createdAt: '25 Oct 2026, 10:54 PM',
			items: 'Hybrid Green Tomato Seeds (1 Pack)',
			callStatus: 'Call Completed'
		},
		{
			id: '1001',
			customerName: 'Rakib Hasan',
			phone: '01712345678',
			status: 'delivered',
			amount: 490,
			createdAt: '24 Oct 2026, 04:30 PM',
			items: 'Original Red Salvia Flower Seeds',
			callStatus: 'Call Completed'
		},
		{
			id: '1000',
			customerName: 'Mahmudul Haque',
			phone: '01898765432',
			status: 'processing',
			amount: 850,
			createdAt: '24 Oct 2026, 01:15 PM',
			items: 'Gardening Special Combo Pack',
			callStatus: 'Call Completed'
		}
	]);

	// Filtered orders list
	let displayedOrders = $derived.by(() => {
		let list = activeTab === 'my' ? myOrders : allOrders.map((o: any, idx: number) => ({
			id: o.id || `${1000 + idx}`,
			customerName: o.customerName || 'Customer',
			phone: o.customerEmail || '01700000000',
			status: o.status || 'pending',
			amount: o.total || 135,
			createdAt: '25 Oct 2026, 10:54 PM',
			items: 'Standard Order Item',
			callStatus: 'Call Verified'
		}));

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter((o: any) =>
				o.customerName.toLowerCase().includes(q) ||
				o.phone.includes(q) ||
				o.id.includes(q)
			);
		}

		return list;
	});

	// 14-day Activity Data
	const ACTIVITY_DAYS = [
		{ date: '14 Oct', count: 0 },
		{ date: '15 Oct', count: 0 },
		{ date: '16 Oct', count: 0 },
		{ date: '17 Oct', count: 0 },
		{ date: '18 Oct', count: 0 },
		{ date: '19 Oct', count: 0 },
		{ date: '20 Oct', count: 0 },
		{ date: '21 Oct', count: 0 },
		{ date: '22 Oct', count: 0 },
		{ date: '23 Oct', count: 0 },
		{ date: '24 Oct', count: 2 },
		{ date: '25 Oct', count: 1 },
		{ date: '26 Oct', count: 0 },
		{ date: '27 Oct', count: 0 }
	];

	let totalTrackedOrders = $derived(
		ACTIVITY_DAYS.reduce((sum, d) => sum + d.count, 0)
	);
</script>

<svelte:head>
	<title>My Activity | Admin Control Deck</title>
</svelte:head>

<!-- Toast Notification -->
{#if toastMessage}
	<div class="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
		<CheckCircle2 class="w-4 h-4 text-emerald-400" />
		<span>{toastMessage}</span>
	</div>
{/if}

<div class="space-y-6 max-w-7xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
	
	<!-- 1. Super Admin Profile Banner -->
	<div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
		
		<!-- Left: Avatar, Name, Role Badge, Greeting -->
		<div class="flex items-center gap-4">
			<!-- Avatar with Green Online Status Dot -->
			<div class="relative shrink-0">
				<div class="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-[#ecfdf5] via-[#dcfce7] to-[#bbf7d0] border border-emerald-300 flex items-center justify-center text-emerald-800 font-black text-2xl font-['Outfit'] shadow-xs">
					S
				</div>
				<span class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-2xs"></span>
			</div>

			<!-- User Credentials & Dynamic Greeting -->
			<div class="space-y-1">
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-['Outfit']">
						AURA Super Admin
					</h1>
					<Badge variant="purple" class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5">
						Super Admin
					</Badge>
				</div>
				<p class="text-xs text-slate-400 font-mono">
					admin@aura-store.com
				</p>
				<p class="text-xs sm:text-[13px] font-bold text-[#5845eb] flex items-center gap-1.5 pt-0.5">
					<Sparkles class="w-3.5 h-3.5 text-[#5845eb] animate-pulse" />
					<span>{greeting}, Super Admin! Here is your operational performance summary for today.</span>
				</p>
			</div>
		</div>

		<!-- Right: Quick Action Buttons -->
		<div class="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0">
			<!-- Refresh Button -->
			<Button
				variant="outline"
				size="sm"
				onclick={handleRefresh}
				disabled={isRefreshing}
				class="rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold gap-1.5 shadow-2xs h-10 px-4"
			>
				<RefreshCw class="w-3.5 h-3.5 text-slate-500 {isRefreshing ? 'animate-spin text-[#5845eb]' : ''}" />
				<span>Refresh</span>
			</Button>

			<!-- + New Order Button -->
			<Button
				size="sm"
				href="/admin/orders/new"
				class="rounded-2xl bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold gap-1.5 shadow-md shadow-indigo-500/25 h-10 px-4"
			>
				<Plus class="w-4 h-4 stroke-[2.5]" />
				<span>New Order</span>
			</Button>
		</div>
	</div>

	<!-- 2. Activity Filter Tabs (My Activity vs Storewide) -->
	<div class="flex items-center gap-2">
		<div class="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-2xs gap-1 text-xs font-bold">
			<button
				type="button"
				onclick={() => (activeTab = 'my')}
				class="px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer {activeTab === 'my'
					? 'bg-white text-slate-900 shadow-xs font-black'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<Zap class="w-3.5 h-3.5 {activeTab === 'my' ? 'text-[#5845eb]' : 'text-slate-400'}" />
				<span>My Activity</span>
				<span class="px-2 py-0.2 rounded-full text-[10px] font-black {activeTab === 'my' ? 'bg-[#5845eb] text-white' : 'bg-slate-200 text-slate-700'}">
					{myOrders.length}
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'store')}
				class="px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer {activeTab === 'store'
					? 'bg-white text-slate-900 shadow-xs font-black'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<ShieldCheck class="w-3.5 h-3.5 {activeTab === 'store' ? 'text-[#5845eb]' : 'text-slate-400'}" />
				<span>Storewide Activity</span>
				<span class="px-2 py-0.2 rounded-full text-[10px] font-black {activeTab === 'store' ? 'bg-[#5845eb] text-white' : 'bg-slate-200 text-slate-700'}">
					{allOrders.length > 0 ? allOrders.length : 12}
				</span>
			</button>
		</div>
	</div>

	<!-- 3. 7 KPI Metric Summary Cards -->
	<div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-3.5">
		
		<!-- 1. Created Orders -->
		<div class="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-[11px] font-bold text-slate-500">Created</span>
				<div class="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
					<Package class="w-3.5 h-3.5 stroke-[2.2]" />
				</div>
			</div>
			<div class="text-xl font-black text-slate-900 font-['Outfit']">
				{activeTab === 'my' ? '1' : allOrders.length}
			</div>
			<div class="text-[10.5px] font-semibold text-slate-400 mt-0.5 truncate">
				Orders
			</div>
		</div>

		<!-- 2. Confirmed -->
		<div class="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-[11px] font-bold text-slate-500">Confirmed</span>
				<div class="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
					<CheckCircle2 class="w-3.5 h-3.5 stroke-[2.2]" />
				</div>
			</div>
			<div class="text-xl font-black text-slate-900 font-['Outfit']">
				{activeTab === 'my' ? '1' : (data?.stats?.confirmedCount || 12)}
			</div>
			<div class="text-[10.5px] font-semibold text-blue-600 mt-0.5 truncate">
				In Processing
			</div>
		</div>

		<!-- 3. Delivered -->
		<div class="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-[11px] font-bold text-slate-500">Delivered</span>
				<div class="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
					<Truck class="w-3.5 h-3.5 stroke-[2.2]" />
				</div>
			</div>
			<div class="text-xl font-black text-slate-900 font-['Outfit']">
				{activeTab === 'my' ? '1' : (data?.stats?.deliveredCount || 2)}
			</div>
			<div class="text-[10.5px] font-semibold text-emerald-600 mt-0.5 truncate">
				Completed
			</div>
		</div>

		<!-- 4. Cancelled -->
		<div class="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-[11px] font-bold text-slate-500">Cancelled</span>
				<div class="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
					<XCircle class="w-3.5 h-3.5 stroke-[2.2]" />
				</div>
			</div>
			<div class="text-xl font-black text-slate-900 font-['Outfit']">
				{activeTab === 'my' ? '0' : (data?.stats?.cancelledCount || 1)}
			</div>
			<div class="text-[10.5px] font-semibold text-rose-600 mt-0.5 truncate">
				Void Orders
			</div>
		</div>

		<!-- 5. Returned -->
		<div class="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-[11px] font-bold text-slate-500">Returned</span>
				<div class="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
					<RotateCcw class="w-3.5 h-3.5 stroke-[2.2]" />
				</div>
			</div>
			<div class="text-xl font-black text-slate-900 font-['Outfit']">
				0
			</div>
			<div class="text-[10.5px] font-semibold text-amber-600 mt-0.5 truncate">
				Dispatched Back
			</div>
		</div>

		<!-- 6. Total Calls -->
		<div class="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-[11px] font-bold text-slate-500">Total Calls</span>
				<div class="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
					<PhoneCall class="w-3.5 h-3.5 stroke-[2.2]" />
				</div>
			</div>
			<div class="text-xl font-black text-slate-900 font-['Outfit']">
				{activeTab === 'my' ? '3' : '15'}
			</div>
			<div class="text-[10.5px] font-semibold text-purple-600 mt-0.5 truncate">
				Outbound Calls
			</div>
		</div>

		<!-- 7. Total Sales -->
		<div class="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-[11px] font-bold text-slate-500">Total Sales</span>
				<div class="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
					<DollarSign class="w-3.5 h-3.5 stroke-[2.2]" />
				</div>
			</div>
			<div class="text-xl font-black text-slate-900 font-['Outfit'] truncate">
				{activeTab === 'my' ? '৳1,475' : '৳28,233'}
			</div>
			<div class="text-[10.5px] font-semibold text-emerald-600 mt-0.5 truncate">
				Active Volume
			</div>
		</div>
	</div>

	<!-- 4. Productivity & Target Progress Widget -->
	<div class="bg-gradient-to-r from-indigo-50/60 via-purple-50/30 to-white rounded-3xl p-5 border border-indigo-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
		<div class="flex items-center gap-3.5">
			<div class="w-10 h-10 rounded-2xl bg-[#5845eb] text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
				<Award class="w-5 h-5 stroke-[2.5]" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<span class="text-sm font-black text-slate-900">Daily Order Target: 85% Completed</span>
					<Badge variant="purple" class="text-[10px] font-bold">Excellent Pace</Badge>
				</div>
				<p class="text-xs text-slate-500 mt-0.5">
					Target today: 20 verified orders — 17 successfully confirmed and queued for dispatch.
				</p>
			</div>
		</div>

		<!-- Target Progress Bar -->
		<div class="w-full md:w-64 space-y-1">
			<div class="flex items-center justify-between text-[11px] font-bold">
				<span class="text-slate-500">Target Progress</span>
				<span class="text-[#5845eb]">17 / 20 Orders</span>
			</div>
			<div class="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
				<div class="h-full bg-gradient-to-r from-[#5845eb] to-[#7c3aed] rounded-full transition-all duration-500" style="width: 85%;"></div>
			</div>
		</div>
	</div>

	<!-- 5. 14-day Activity Trend Chart -->
	<div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
			<div class="flex items-center gap-2">
				<Calendar class="w-4 h-4 text-[#5845eb]" />
				<h2 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">
					14-Day Order Processing Timeline
				</h2>
			</div>
			<Badge variant="outline" class="text-xs font-semibold text-slate-600 bg-slate-50 w-fit">
				{totalTrackedOrders} Total Orders Tracked
			</Badge>
		</div>

		<!-- Interactive SVG Chart Canvas -->
		<div class="w-full overflow-x-auto no-scrollbar">
			<div class="min-w-[650px] h-64 relative flex flex-col justify-between pt-2 pb-6">
				
				<!-- Horizontal Grid Lines -->
				<div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 pl-8">
					<div class="border-b border-dashed border-slate-100 w-full"></div>
					<div class="border-b border-dashed border-slate-100 w-full"></div>
					<div class="border-b border-dashed border-slate-100 w-full"></div>
					<div class="border-b border-dashed border-slate-100 w-full"></div>
					<div class="border-b border-slate-200 w-full"></div>
				</div>

				<!-- Y-Axis Labels -->
				<div class="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[11px] font-mono text-slate-400">
					<span>4</span>
					<span>3</span>
					<span>2</span>
					<span>1</span>
					<span>0</span>
				</div>

				<!-- Bars & Labels Area -->
				<div class="ml-8 h-full flex items-end justify-between gap-2 z-10 pt-4">
					{#each ACTIVITY_DAYS as day}
						{@const heightPercent = (day.count / 4) * 100}
						<div class="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative">
							
							<!-- Hover Tooltip -->
							<div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap shadow-xl z-20">
								{day.date}: {day.count} Orders
							</div>

							<!-- Bar Column -->
							{#if day.count > 0}
								<div
									class="w-full max-w-[42px] bg-gradient-to-t from-[#10b981] to-[#34d399] rounded-t-xl transition-all duration-300 group-hover:from-[#5845eb] group-hover:to-[#7c3aed] shadow-xs"
									style="height: {Math.max(15, heightPercent)}%;"
								></div>
							{:else}
								<div class="w-full max-w-[42px] h-[2px] bg-slate-200 rounded-full group-hover:bg-indigo-300 transition-colors"></div>
							{/if}

							<!-- X-Axis Date Label -->
							<span class="text-[10px] font-medium text-slate-400 mt-2 font-mono whitespace-nowrap group-hover:text-slate-800 transition-colors">
								{day.date}
							</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- 6. Recent Processed Orders Table -->
	<div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
		
		<!-- Table Header & Filter -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
			<div>
				<div class="flex items-center gap-2">
					<span class="text-base">📋</span>
					<h3 class="text-sm sm:text-base font-black text-slate-900 tracking-tight">
						Recent Orders Activity Log
					</h3>
				</div>
				<p class="text-xs text-slate-400 mt-0.5">
					Chronological audit of orders managed by your account
				</p>
			</div>

			<!-- Search Bar -->
			<div class="flex items-center gap-2 w-full sm:w-auto">
				<div class="relative w-full sm:w-72">
					<Input
						type="text"
						bind:value={searchQuery}
						placeholder="Search customer, phone, or ID..."
						class="w-full bg-slate-50 border-slate-200 rounded-2xl pl-3 pr-9 py-2 text-xs focus-visible:bg-white focus-visible:border-[#5845eb]"
					/>
					<Search class="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
				</div>
				<Badge variant="outline" class="font-bold text-xs px-2.5 py-1 text-slate-700 bg-slate-50 shrink-0">
					{displayedOrders.length} Orders
				</Badge>
			</div>
		</div>

		<!-- Order Items Rows -->
		<div class="space-y-2.5">
			{#each displayedOrders as order}
				<div class="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-[#5845eb]/40 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
					
					<!-- Customer & Details -->
					<div class="flex items-start sm:items-center gap-3">
						<div class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
							<CheckCircle2 class="w-4 h-4" />
						</div>

						<div class="space-y-0.5">
							<div class="flex flex-wrap items-center gap-2">
								<span class="text-xs sm:text-sm font-black text-slate-900">
									{order.customerName}
								</span>
								<span class="text-xs text-slate-500 font-mono">
									({order.phone})
								</span>
								<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
									{order.status === 'confirmed' ? 'Confirmed' : order.status}
								</span>
							</div>
							<div class="text-[11px] text-slate-400 font-mono flex items-center gap-2">
								<span>#{order.id}</span>
								<span>•</span>
								<span>{order.createdAt}</span>
							</div>
						</div>
					</div>

					<!-- Amount & Action -->
					<div class="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
						<span class="text-sm font-black text-emerald-700 font-['Outfit']">
							৳{order.amount}
						</span>

						<Button
							variant="outline"
							size="sm"
							href="/admin/orders/list"
							class="rounded-xl border-slate-200 text-slate-700 hover:text-[#5845eb] text-xs font-bold gap-1 h-8 px-3"
						>
							<span>View</span>
							<ExternalLink class="w-3 h-3" />
						</Button>
					</div>
				</div>
			{:else}
				<div class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
					No matching orders found.
				</div>
			{/each}
		</div>

		<!-- 7. Helpful Shortcut Links -->
		<div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
			<span class="font-bold text-slate-500">
				Quick Operations:
			</span>

			<div class="flex flex-wrap items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					href="/admin/orders"
					class="rounded-xl border-slate-200 text-slate-700 hover:text-[#5845eb] text-xs font-bold gap-1 h-8"
				>
					<span>Web Orders</span>
					<ArrowRight class="w-3 h-3" />
				</Button>

				<Button
					variant="outline"
					size="sm"
					href="/admin/orders/list"
					class="rounded-xl border-slate-200 text-slate-700 hover:text-[#5845eb] text-xs font-bold gap-1 h-8"
				>
					<span>Confirmed Orders</span>
					<ArrowRight class="w-3 h-3" />
				</Button>

				<Button
					variant="outline"
					size="sm"
					href="/admin/orders/pre"
					class="rounded-xl border-slate-200 text-slate-700 hover:text-[#5845eb] text-xs font-bold gap-1 h-8"
				>
					<span>High Value Orders</span>
					<ArrowRight class="w-3 h-3" />
				</Button>
			</div>
		</div>

	</div>

</div>
