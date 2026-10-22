<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		LayoutDashboard,
		Package,
		ShoppingBag,
		MessageSquare,
		Mail,
		DollarSign,
		TrendingUp,
		ShieldCheck,
		Search,
		CheckCircle2,
		Clock,
		Truck,
		AlertCircle,
		ArrowUpRight,
		ExternalLink,
		Sparkles,
		RotateCw,
		Plus,
		Database,
		Check,
		Copy,
		Menu,
		X,
		Layers,
		Activity,
		Server,
		SlidersHorizontal
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Navigation & UI state
	type TabType = 'orders' | 'products' | 'reviews' | 'subscribers' | 'database';
	let activeTab = $state<TabType>('orders');
	let isMobileSidebarOpen = $state(false);

	let orderSearchQuery = $state('');
	let orderStatusFilter = $state<string>('all');
	let isCopied = $state<string | null>(null);

	// Derived filtered orders
	let filteredOrders = $derived(
		data.orders.filter(order => {
			const query = orderSearchQuery.toLowerCase();
			const matchesSearch =
				order.id.toLowerCase().includes(query) ||
				order.customerName.toLowerCase().includes(query) ||
				order.customerEmail.toLowerCase().includes(query);
			const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
			return matchesSearch && matchesStatus;
		})
	);

	function formatCurrency(cents: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(cents / 100);
	}

	function parseItems(itemsJson: string) {
		try {
			return JSON.parse(itemsJson);
		} catch {
			return [];
		}
	}

	function copyToClipboard(text: string, id: string) {
		navigator.clipboard.writeText(text);
		isCopied = id;
		setTimeout(() => (isCopied = null), 2000);
	}

	const navItems = [
		{ id: 'orders' as TabType, label: 'Customer Orders', icon: Package, countKey: 'orders' },
		{ id: 'products' as TabType, label: 'Catalog & Stock', icon: ShoppingBag, countKey: 'products' },
		{ id: 'reviews' as TabType, label: 'Verified Reviews', icon: MessageSquare, countKey: 'reviews' },
		{ id: 'subscribers' as TabType, label: 'VIP Newsletter', icon: Mail, countKey: 'newsletter' },
		{ id: 'database' as TabType, label: 'Cloudflare D1 & Sync', icon: Database, countKey: null }
	];
</script>

<svelte:head>
	<title>AURA Admin Operations Hub | Cloudflare D1</title>
</svelte:head>

<!-- Fullscreen Admin Portal (No Public Elements) -->
<div class="min-h-screen bg-[#06070c] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col md:flex-row font-sans relative overflow-x-hidden">
	
	<!-- Ambient Background Glows -->
	<div class="fixed top-0 left-64 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[180px] pointer-events-none -z-10"></div>
	<div class="fixed bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[180px] pointer-events-none -z-10"></div>

	<!-- MOBILE TOP BAR (Only visible on small screens) -->
	<div class="md:hidden flex items-center justify-between px-4 py-3 bg-[#0a0c16] border-b border-white/10 sticky top-0 z-40">
		<div class="flex items-center gap-2.5">
			<div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1px]">
				<div class="w-full h-full bg-[#090b14] rounded-[7px] flex items-center justify-center">
					<Sparkles class="w-4 h-4 text-cyan-400" />
				</div>
			</div>
			<div class="flex flex-col">
				<span class="text-sm font-black text-white tracking-wide">AURA</span>
				<span class="text-[9px] uppercase tracking-wider text-violet-400 font-bold -mt-0.5">Admin Console</span>
			</div>
		</div>

		<button
			onclick={() => isMobileSidebarOpen = !isMobileSidebarOpen}
			class="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white"
			aria-label="Toggle navigation sidebar"
		>
			{#if isMobileSidebarOpen}
				<X class="w-5 h-5" />
			{:else}
				<Menu class="w-5 h-5" />
			{/if}
		</button>
	</div>

	<!-- LEFT SIDEBAR -->
	<aside
		class="fixed inset-y-0 left-0 z-50 w-64 md:w-72 bg-[#090b14]/95 md:bg-[#080910] border-r border-white/10 backdrop-blur-2xl flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 {isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
	>
		<!-- Sidebar Top: Brand & Database Badge -->
		<div>
			<div class="p-6 border-b border-white/10">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-violet-600/25">
							<div class="w-full h-full bg-[#08090f] rounded-[10px] flex items-center justify-center">
								<Sparkles class="w-4 h-4 text-cyan-400" />
							</div>
						</div>
						<div>
							<div class="flex items-center gap-2">
								<span class="text-sm font-black tracking-tight text-white font-heading">AURA</span>
								<span class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-violet-500/20 text-violet-300 border border-violet-500/30">
									Admin
								</span>
							</div>
							<div class="text-[10px] text-slate-400 font-medium">Operations Hub</div>
						</div>
					</div>

					<button
						onclick={() => isMobileSidebarOpen = false}
						class="md:hidden text-slate-400 hover:text-white p-1"
					>
						<X class="w-4 h-4" />
					</button>
				</div>

				<!-- Database Telemetry Status Pill -->
				<div class="mt-4 flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
					<div class="flex items-center gap-2">
						<span class="relative flex h-2 w-2">
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
							<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
						</span>
						<span class="text-[11px] font-semibold text-slate-300">
							{data.isD1Connected ? 'Cloudflare D1 Live' : 'Local Fallback'}
						</span>
					</div>
					<span class="text-[10px] font-mono text-cyan-400 uppercase">Edge</span>
				</div>
			</div>

			<!-- Sidebar Navigation Menu -->
			<nav class="p-4 space-y-1.5">
				<div class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
					Store Management
				</div>

				{#each navItems as item}
					{@const Icon = item.icon}
					{@const isActive = activeTab === item.id}
					{@const count = item.countKey ? data[item.countKey as keyof PageData]?.length : null}

					<button
						onclick={() => {
							activeTab = item.id;
							isMobileSidebarOpen = false;
						}}
						class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all {isActive
							? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
							: 'text-slate-400 hover:text-white hover:bg-white/5'}"
					>
						<div class="flex items-center gap-3">
							<Icon class="w-4 h-4 {isActive ? 'text-white' : 'text-slate-400'}" />
							<span>{item.label}</span>
						</div>

						{#if count !== null && count !== undefined}
							<span
								class="px-2 py-0.5 rounded-full text-[10px] font-bold {isActive
									? 'bg-white/20 text-white'
									: 'bg-white/5 text-slate-400'}"
							>
								{count}
							</span>
						{/if}
					</button>
				{/each}
			</nav>
		</div>

		<!-- Sidebar Bottom: System & Exit to Store -->
		<div class="p-4 border-t border-white/10 space-y-3">
			<form action="?/seedDatabase" method="POST" use:enhance>
				<button
					type="submit"
					class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all"
					title="Seed products and test orders to Cloudflare D1"
				>
					<Database class="w-3.5 h-3.5" />
					<span>Sync Demo Data</span>
				</button>
			</form>

			<a
				href="/"
				target="_blank"
				class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all"
			>
				<span>View Public Store</span>
				<ExternalLink class="w-3.5 h-3.5 text-slate-400" />
			</a>

			<div class="px-3 py-2 flex items-center justify-between text-[11px] text-slate-400">
				<span>AURA v2.4 Enterprise</span>
				<span class="font-mono text-cyan-400">D1: aura</span>
			</div>
		</div>
	</aside>

	<!-- MOBILE BACKDROP -->
	{#if isMobileSidebarOpen}
		<button
			type="button"
			onclick={() => isMobileSidebarOpen = false}
			class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
			aria-label="Close sidebar"
		></button>
	{/if}

	<!-- MAIN WORKSPACE CONTENT -->
	<div class="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
		
		<!-- Workspace Top Bar -->
		<header class="border-b border-white/10 bg-[#090b14]/60 backdrop-blur-xl px-6 py-4 sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
			<div>
				<h1 class="text-lg font-black text-white font-heading tracking-tight flex items-center gap-2">
					{#if activeTab === 'orders'}
						<Package class="w-5 h-5 text-cyan-400" /> Customer Orders & Fulfillment
					{:else if activeTab === 'products'}
						<ShoppingBag class="w-5 h-5 text-violet-400" /> Catalog & Hardware Stock
					{:else if activeTab === 'reviews'}
						<MessageSquare class="w-5 h-5 text-amber-400" /> Verified Reviews Moderation
					{:else if activeTab === 'subscribers'}
						<Mail class="w-5 h-5 text-emerald-400" /> VIP Sound Launch Subscribers
					{:else if activeTab === 'database'}
						<Database class="w-5 h-5 text-cyan-400" /> Cloudflare D1 Edge Engine
					{/if}
				</h1>
				<p class="text-xs text-slate-400">
					Standalone administrative control deck for Cloudflare D1 database.
				</p>
			</div>

			<div class="flex items-center gap-3">
				<div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium">
					<Server class="w-3.5 h-3.5 text-emerald-400" />
					<span class="text-slate-300">Edge Worker: <strong class="text-white">Active</strong></span>
				</div>
			</div>
		</header>

		<main class="p-6 md:p-8 space-y-8 flex-1">
			
			<!-- TOP METRIC CARDS (Gross Sales, Orders, Stock, Subscribers) -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<!-- Gross Sales -->
				<div class="rounded-2xl p-5 border border-white/10 bg-[#0d101d]/60 relative overflow-hidden group">
					<div class="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
					<div class="flex items-center justify-between text-slate-400 mb-2">
						<span class="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
						<div class="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
							<DollarSign class="w-4 h-4" />
						</div>
					</div>
					<div class="text-2xl font-black text-white font-heading tracking-tight">
						{formatCurrency(data.stats.totalRevenueCents)}
					</div>
					<div class="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-medium">
						<TrendingUp class="w-3.5 h-3.5" />
						<span>+24.8% vs last month</span>
					</div>
				</div>

				<!-- Orders -->
				<div class="rounded-2xl p-5 border border-white/10 bg-[#0d101d]/60 relative overflow-hidden group">
					<div class="absolute -right-6 -bottom-6 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all"></div>
					<div class="flex items-center justify-between text-slate-400 mb-2">
						<span class="text-xs font-semibold uppercase tracking-wider">Orders</span>
						<div class="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
							<Package class="w-4 h-4" />
						</div>
					</div>
					<div class="text-2xl font-black text-white font-heading tracking-tight">
						{data.stats.totalOrders}
					</div>
					<div class="mt-2 text-[11px] text-slate-400 font-medium">
						<span class="text-cyan-400 font-semibold">{data.stats.activeOrders} pending</span> fulfillment
					</div>
				</div>

				<!-- Stock SKUs -->
				<div class="rounded-2xl p-5 border border-white/10 bg-[#0d101d]/60 relative overflow-hidden group">
					<div class="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
					<div class="flex items-center justify-between text-slate-400 mb-2">
						<span class="text-xs font-semibold uppercase tracking-wider">Hardware SKUs</span>
						<div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
							<ShoppingBag class="w-4 h-4" />
						</div>
					</div>
					<div class="text-2xl font-black text-white font-heading tracking-tight">
						{data.products.length} Products
					</div>
					<div class="mt-2 text-[11px] text-emerald-400 font-medium">
						<span>{data.stats.inStockProducts} in stock • Global Express</span>
					</div>
				</div>

				<!-- VIP Subscribers -->
				<div class="rounded-2xl p-5 border border-white/10 bg-[#0d101d]/60 relative overflow-hidden group">
					<div class="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
					<div class="flex items-center justify-between text-slate-400 mb-2">
						<span class="text-xs font-semibold uppercase tracking-wider">VIP Audience</span>
						<div class="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
							<Mail class="w-4 h-4" />
						</div>
					</div>
					<div class="text-2xl font-black text-white font-heading tracking-tight">
						{data.stats.totalSubscribers}
					</div>
					<div class="mt-2 text-[11px] text-slate-400 font-medium">
						<span>Direct Creator VIP audience</span>
					</div>
				</div>
			</div>

			<!-- TAB 1: ORDERS MANAGEMENT -->
			{#if activeTab === 'orders'}
				<div class="space-y-4">
					<!-- Search and Filter Bar -->
					<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
						<div class="relative flex-1 max-w-md">
							<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
							<input
								type="text"
								bind:value={orderSearchQuery}
								placeholder="Search by Order ID, Customer Name, Email..."
								class="w-full bg-[#0d101d] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
							/>
						</div>

						<!-- Status Filter Pills -->
						<div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
							{#each ['all', 'paid', 'processing', 'dispatched', 'delivered', 'refunded'] as st}
								<button
									onclick={() => orderStatusFilter = st}
									class="px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all {orderStatusFilter === st ? 'bg-white/15 text-white border border-white/20' : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'}"
								>
									{st}
								</button>
							{/each}
						</div>
					</div>

					<!-- Orders Table Card -->
					<div class="rounded-2xl border border-white/10 overflow-hidden bg-[#0d101d]/60 shadow-2xl">
						<div class="overflow-x-auto">
							<table class="w-full text-left text-xs">
								<thead>
									<tr class="border-b border-white/10 bg-white/[0.02] text-slate-400">
										<th class="py-3.5 px-4 font-semibold">Order ID</th>
										<th class="py-3.5 px-4 font-semibold">Customer</th>
										<th class="py-3.5 px-4 font-semibold">Items</th>
										<th class="py-3.5 px-4 font-semibold">Shipping Destination</th>
										<th class="py-3.5 px-4 font-semibold">Amount</th>
										<th class="py-3.5 px-4 font-semibold">Fulfillment Status</th>
										<th class="py-3.5 px-4 font-semibold text-right">Actions</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-white/5">
									{#if filteredOrders.length === 0}
										<tr>
											<td colspan="7" class="py-12 text-center text-slate-500">
												No orders match your filter criteria.
											</td>
										</tr>
									{/if}

									{#each filteredOrders as order (order.id)}
										{@const parsedItems = parseItems(order.items)}
										<tr class="hover:bg-white/[0.02] transition-colors">
											<!-- Order ID -->
											<td class="py-4 px-4 font-mono font-bold text-cyan-400">
												<div class="flex items-center gap-1.5">
													<span>{order.id}</span>
													<button
														onclick={() => copyToClipboard(order.id, order.id)}
														class="text-slate-500 hover:text-slate-300"
														title="Copy ID"
													>
														{#if isCopied === order.id}
															<Check class="w-3 h-3 text-emerald-400" />
														{:else}
															<Copy class="w-3 h-3" />
														{/if}
													</button>
												</div>
											</td>

											<!-- Customer Info -->
											<td class="py-4 px-4">
												<div class="font-bold text-white">{order.customerName}</div>
												<div class="text-[11px] text-slate-400">{order.customerEmail}</div>
											</td>

											<!-- Items -->
											<td class="py-4 px-4 max-w-xs">
												<div class="space-y-1">
													{#each parsedItems as itm}
														<div class="flex items-center gap-1.5 text-[11px]">
															<span class="w-4 h-4 rounded-md bg-white/10 text-center leading-4 text-[10px] font-bold text-white">
																{itm.quantity}x
															</span>
															<span class="truncate text-slate-300">{itm.name}</span>
														</div>
													{/each}
												</div>
											</td>

											<!-- Address -->
											<td class="py-4 px-4 max-w-[200px] text-[11px] text-slate-400 truncate" title={order.shippingAddress}>
												{order.shippingAddress}
											</td>

											<!-- Total Amount -->
											<td class="py-4 px-4 font-bold text-white font-heading">
												{formatCurrency(order.total)}
											</td>

											<!-- Status Badge -->
											<td class="py-4 px-4">
												{#if order.status === 'delivered'}
													<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 w-max">
														<CheckCircle2 class="w-3 h-3" /> Delivered
													</span>
												{:else if order.status === 'dispatched'}
													<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center gap-1 w-max">
														<Truck class="w-3 h-3" /> In Transit
													</span>
												{:else if order.status === 'processing'}
													<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1 w-max">
														<Clock class="w-3 h-3" /> Packing
													</span>
												{:else if order.status === 'refunded'}
													<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-1 w-max">
														<AlertCircle class="w-3 h-3" /> Refunded
													</span>
												{:else}
													<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center gap-1 w-max">
														<DollarSign class="w-3 h-3" /> Paid
													</span>
												{/if}
											</td>

											<!-- Status Update Form Action -->
											<td class="py-4 px-4 text-right">
												<form action="?/updateOrderStatus" method="POST" use:enhance class="inline-flex items-center gap-2">
													<input type="hidden" name="orderId" value={order.id} />
													<select
														name="status"
														onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()}
														class="bg-[#121524] text-[11px] text-slate-300 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-400"
													>
														<option value="paid" selected={order.status === 'paid'}>Paid</option>
														<option value="processing" selected={order.status === 'processing'}>Processing</option>
														<option value="dispatched" selected={order.status === 'dispatched'}>Dispatched</option>
														<option value="delivered" selected={order.status === 'delivered'}>Delivered</option>
														<option value="refunded" selected={order.status === 'refunded'}>Refunded</option>
													</select>
												</form>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			{/if}

			<!-- TAB 2: PRODUCTS & STOCK INVENTORY -->
			{#if activeTab === 'products'}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.products as prod (prod.id)}
						<div class="rounded-2xl p-5 border border-white/10 bg-[#0d101d]/60 space-y-4 flex flex-col justify-between">
							<div>
								<div class="aspect-video w-full rounded-xl overflow-hidden bg-black/40 border border-white/10 relative mb-4">
									<img src={prod.image} alt={prod.name} class="w-full h-full object-cover" />
									{#if prod.badge}
										<span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-violet-600/90 text-white backdrop-blur-md">
											{prod.badge}
										</span>
									{/if}
								</div>

								<div class="flex items-center justify-between gap-2">
									<h3 class="text-base font-extrabold text-white font-heading">{prod.name}</h3>
									<span class="text-sm font-black text-cyan-400 font-heading">
										{formatCurrency(prod.price)}
									</span>
								</div>
								<p class="text-xs text-slate-400 mt-1 line-clamp-2">{prod.tagline}</p>
							</div>

							<!-- Stock Toggle Action -->
							<div class="pt-4 border-t border-white/10 flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="text-xs font-semibold text-slate-300">Stock Status:</span>
									{#if prod.inStock}
										<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
											In Stock
										</span>
									{:else}
										<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
											Backorder
										</span>
									{/if}
								</div>

								<form action="?/toggleProductStock" method="POST" use:enhance>
									<input type="hidden" name="productId" value={prod.id} />
									<input type="hidden" name="inStock" value={prod.inStock ? 'false' : 'true'} />
									<button
										type="submit"
										class="px-3 py-1 rounded-lg text-xs font-bold transition-all {prod.inStock ? 'bg-white/10 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'}"
									>
										{prod.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
									</button>
								</form>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- TAB 3: CUSTOMER REVIEWS MODERATION -->
			{#if activeTab === 'reviews'}
				<div class="space-y-4">
					<div class="rounded-2xl border border-white/10 bg-[#0d101d]/60 divide-y divide-white/10">
						{#if data.reviews.length === 0}
							<div class="p-12 text-center text-slate-500">
								No customer reviews submitted yet.
							</div>
						{/if}

						{#each data.reviews as rev (rev.id)}
							<div class="p-6 flex flex-col sm:flex-row items-start justify-between gap-4">
								<div class="space-y-1.5 flex-1">
									<div class="flex items-center gap-2">
										<div class="flex text-amber-400 text-xs">
											{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
										</div>
										<h4 class="text-sm font-bold text-white">{rev.title}</h4>
										{#if rev.verified}
											<span class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
												Verified Buyer
											</span>
										{/if}
									</div>
									<p class="text-xs text-slate-300 leading-relaxed">{rev.content}</p>
									<div class="text-[11px] text-slate-400">
										By <strong class="text-slate-300">{rev.author}</strong> ({rev.role})
									</div>
								</div>

								<!-- Delete Review Form Action -->
								<form action="?/deleteReview" method="POST" use:enhance>
									<input type="hidden" name="reviewId" value={rev.id} />
									<button
										type="submit"
										class="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
									>
										Delete
									</button>
								</form>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- TAB 4: NEWSLETTER LEADS -->
			{#if activeTab === 'subscribers'}
				<div class="rounded-2xl border border-white/10 bg-[#0d101d]/60 p-6 space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-base font-bold text-white font-heading">VIP Sound Launch Subscribers</h3>
							<p class="text-xs text-slate-400">Verified leads captured directly from landing page footer.</p>
						</div>
						<button
							onclick={() => {
								const csv = 'Email\n' + data.newsletter.map(n => n.email).join('\n');
								const blob = new Blob([csv], { type: 'text/csv' });
								const url = window.URL.createObjectURL(blob);
								const a = document.createElement('a');
								a.href = url;
								a.download = 'aura-newsletter-subscribers.csv';
								a.click();
							}}
							class="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
						>
							Export CSV
						</button>
					</div>

					<div class="overflow-x-auto">
						<table class="w-full text-left text-xs">
							<thead>
								<tr class="border-b border-white/10 text-slate-400">
									<th class="py-3 px-4">Subscriber Email</th>
									<th class="py-3 px-4 text-right">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-white/5">
								{#if data.newsletter.length === 0}
									<tr>
										<td colspan="2" class="py-8 text-center text-slate-500">
											No newsletter subscribers registered yet.
										</td>
									</tr>
								{/if}
								{#each data.newsletter as sub}
									<tr class="hover:bg-white/[0.02]">
										<td class="py-3.5 px-4 font-mono text-cyan-300">{sub.email}</td>
										<td class="py-3.5 px-4 text-right">
											<button
												onclick={() => copyToClipboard(sub.email, sub.email)}
												class="text-xs text-slate-400 hover:text-white"
											>
												{isCopied === sub.email ? 'Copied!' : 'Copy Email'}
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<!-- TAB 5: DATABASE & D1 ENGINE -->
			{#if activeTab === 'database'}
				<div class="rounded-2xl border border-white/10 bg-[#0d101d]/60 p-6 space-y-6">
					<div>
						<h3 class="text-base font-bold text-white font-heading">Cloudflare D1 Database Engine</h3>
						<p class="text-xs text-slate-400">Low-latency distributed SQLite storage running at Cloudflare Edge network.</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
							<div class="text-xs text-slate-400">Binding Identifier</div>
							<div class="font-mono text-sm text-cyan-400 font-bold">env.DB</div>
							<div class="text-[11px] text-slate-400">Connected through SvelteKit Cloudflare Adapter</div>
						</div>

						<div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
							<div class="text-xs text-slate-400">Database Name</div>
							<div class="font-mono text-sm text-violet-400 font-bold">aura</div>
							<div class="text-[11px] text-slate-400">Database ID: 85e821c2-73e0-4490-b87a-66babacf5720</div>
						</div>
					</div>

					<div class="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
						<div>
							<div class="text-xs font-bold text-white">Seed / Reseed Catalog Data</div>
							<div class="text-[11px] text-slate-400">Inject standard flagship headphones, earphones, and test orders into D1 tables.</div>
						</div>

						<form action="?/seedDatabase" method="POST" use:enhance>
							<button
								type="submit"
								class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg transition-all"
							>
								Run Database Sync
							</button>
						</form>
					</div>
				</div>
			{/if}

		</main>
	</div>
</div>
