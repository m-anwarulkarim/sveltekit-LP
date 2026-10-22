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
		Copy
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Local UI state
	let activeTab = $state<'orders' | 'products' | 'reviews' | 'subscribers'>('orders');
	let orderSearchQuery = $state('');
	let orderStatusFilter = $state<string>('all');
	let isCopied = $state<string | null>(null);

	// Derived filtered orders
	let filteredOrders = $derived(
		data.orders.filter(order => {
			const matchesSearch =
				order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
				order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
				order.customerEmail.toLowerCase().includes(orderSearchQuery.toLowerCase());
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
</script>

<svelte:head>
	<title>AURA Operations Hub | E-Commerce Control Deck</title>
</svelte:head>

<div class="min-h-screen bg-[#07080d] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden font-sans">
	<!-- Ambient Background Glows -->
	<div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[180px] pointer-events-none -z-10"></div>
	<div class="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none -z-10"></div>

	<!-- Top Navigation Bar -->
	<header class="border-b border-white/10 bg-[#0d0f18]/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 py-3.5">
		<div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<a href="/" class="flex items-center gap-2.5 group">
					<div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-violet-600/25 group-hover:shadow-cyan-400/25 transition-all">
						<div class="w-full h-full bg-[#08090f] rounded-[10px] flex items-center justify-center">
							<Sparkles class="w-4 h-4 text-cyan-400" />
						</div>
					</div>
					<div>
						<div class="flex items-center gap-2">
							<span class="text-sm font-black tracking-tight text-white font-heading">AURA</span>
							<span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-violet-500/20 text-violet-300 border border-violet-500/30">
								Operations Hub
							</span>
						</div>
						<div class="text-[10px] text-slate-400">Enterprise Cloudflare D1 Deck</div>
					</div>
				</a>
			</div>

			<!-- Quick Actions & Status -->
			<div class="flex items-center gap-3">
				<!-- Live D1 Badge -->
				<div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
					<span class="relative flex h-2 w-2">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
					</span>
					<span class="text-[11px] font-medium text-slate-300">
						{data.isD1Connected ? 'Cloudflare D1 Live' : 'Local Preview'}
					</span>
				</div>

				<!-- Seed D1 Button -->
				<form action="?/seedDatabase" method="POST" use:enhance>
					<button
						type="submit"
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all"
						title="Sync products and mock orders into Cloudflare D1"
					>
						<Database class="w-3.5 h-3.5" />
						<span class="hidden sm:inline">Sync Demo Data</span>
					</button>
				</form>

				<a
					href="/"
					target="_blank"
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
				>
					<span class="hidden sm:inline">View Store</span>
					<ExternalLink class="w-3.5 h-3.5" />
				</a>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
		
		<!-- Telemetry Metric Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<!-- Total Revenue -->
			<div class="glass-card rounded-2xl p-5 border border-white/10 bg-[#0d101d]/60 relative overflow-hidden group">
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

			<!-- Active Orders -->
			<div class="glass-card rounded-2xl p-5 border border-white/10 bg-[#0d101d]/60 relative overflow-hidden group">
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

			<!-- Hardware Inventory -->
			<div class="glass-card rounded-2xl p-5 border border-white/10 bg-[#0d101d]/60 relative overflow-hidden group">
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

			<!-- Newsletter Leads -->
			<div class="glass-card rounded-2xl p-5 border border-white/10 bg-[#0d101d]/60 relative overflow-hidden group">
				<div class="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
				<div class="flex items-center justify-between text-slate-400 mb-2">
					<span class="text-xs font-semibold uppercase tracking-wider">Subscribers</span>
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

		<!-- Main Operational Navigation Tabs -->
		<div class="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
			<button
				onclick={() => activeTab = 'orders'}
				class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all {activeTab === 'orders' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'}"
			>
				<Package class="w-4 h-4" />
				<span>Customer Orders ({data.orders.length})</span>
			</button>

			<button
				onclick={() => activeTab = 'products'}
				class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all {activeTab === 'products' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'}"
			>
				<ShoppingBag class="w-4 h-4" />
				<span>Catalog & Stock ({data.products.length})</span>
			</button>

			<button
				onclick={() => activeTab = 'reviews'}
				class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all {activeTab === 'reviews' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'}"
			>
				<MessageSquare class="w-4 h-4" />
				<span>Verified Reviews ({data.reviews.length})</span>
			</button>

			<button
				onclick={() => activeTab = 'subscribers'}
				class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all {activeTab === 'subscribers' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'}"
			>
				<Mail class="w-4 h-4" />
				<span>Newsletter Leads ({data.newsletter.length})</span>
			</button>
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
				<div class="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
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
					<div class="glass-card rounded-2xl p-5 border border-white/10 space-y-4 flex flex-col justify-between">
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
								<span class="text-xs font-semibold text-slate-300">Catalog Availability:</span>
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
				<div class="glass-panel rounded-2xl border border-white/10 divide-y divide-white/10">
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
								<div class="text-[11px] text-slate-500">
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
			<div class="glass-panel rounded-2xl border border-white/10 p-6 space-y-4">
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

	</main>
</div>
