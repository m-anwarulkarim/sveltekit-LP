<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { adminSearch } from '#lib/components/ui';
	import {
		Search,
		X,
		Loader2,
		ShoppingBag,
		Package,
		Users,
		Sliders,
		ArrowRight,
		FileText,
		Layers,
		FolderTree,
		FolderGit2,
		Tag,
		Award,
		Image,
		MessageSquare,
		Palette,
		Target,
		Ticket,
		Truck,
		FileSpreadsheet,
		Settings,
		ShieldAlert,
		Images,
		UserCheck,
		Bell,
		User,
		LayoutDashboard,
		PlusCircle,
		ListOrdered,
		AlertTriangle,
		Clock,
		Trash2,
		CornerDownLeft
	} from 'lucide-svelte';

	interface Props {
		open?: boolean;
		initialQuery?: string;
	}

	let { open = $bindable(false), initialQuery = '' }: Props = $props();

	let searchQuery = $state('');
	let isLoading = $state(false);
	let activeFilter = $state<'all' | 'orders' | 'products' | 'customers' | 'navigation'>('all');
	let searchInputEl = $state<HTMLInputElement | null>(null);

	let searchResults = $state<{
		orders: any[];
		products: any[];
		customers: any[];
		navigation: any[];
	}>({
		orders: [],
		products: [],
		customers: [],
		navigation: []
	});

	let debounceTimer: any = null;

	// Synchronize when opened with an initial query
	$effect(() => {
		if (adminSearch.isOpen !== open) {
			open = adminSearch.isOpen;
		}
	});

	$effect(() => {
		if (adminSearch.initialQuery && !searchQuery) {
			searchQuery = adminSearch.initialQuery;
		}
	});

	$effect(() => {
		if (open) {
			if (initialQuery && !searchQuery) {
				searchQuery = initialQuery;
			}
			tick().then(() => {
				searchInputEl?.focus();
				searchInputEl?.select();
			});
			fetchSearch(searchQuery);
		} else {
			searchQuery = '';
			activeFilter = 'all';
		}
	});

	function handleQueryInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		searchQuery = val;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			fetchSearch(val);
		}, 200);
	}

	async function fetchSearch(term: string) {
		isLoading = true;
		try {
			const res = await fetch(`/api/admin/search?q=${encodeURIComponent(term.trim())}`);
			if (res.ok) {
				const data = await res.json();
				searchResults = {
					orders: data.orders || [],
					products: data.products || [],
					customers: data.customers || [],
					navigation: data.navigation || []
				};
			}
		} catch (err) {
			console.error('Failed to fetch search results:', err);
		} finally {
			isLoading = false;
		}
	}

	function handleClose() {
		open = false;
		adminSearch.close();
	}

	function navigateTo(url: string) {
		open = false;
		adminSearch.close();
		goto(url);
	}

	// Filtered lists
	const visibleOrders = $derived(
		activeFilter === 'all' || activeFilter === 'orders' ? searchResults.orders : []
	);
	const visibleProducts = $derived(
		activeFilter === 'all' || activeFilter === 'products' ? searchResults.products : []
	);
	const visibleCustomers = $derived(
		activeFilter === 'all' || activeFilter === 'customers' ? searchResults.customers : []
	);
	const visibleNav = $derived(
		activeFilter === 'all' || activeFilter === 'navigation' ? searchResults.navigation : []
	);

	const totalResultsCount = $derived(
		visibleOrders.length + visibleProducts.length + visibleCustomers.length + visibleNav.length
	);

	// Keydown listener for ESC and global Ctrl+K
	function handleGlobalKeyDown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
			e.preventDefault();
			if (open || adminSearch.isOpen) {
				handleClose();
			} else {
				adminSearch.open();
			}
		} else if (e.key === 'Escape' && (open || adminSearch.isOpen)) {
			e.preventDefault();
			handleClose();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleGlobalKeyDown);
		return () => {
			window.removeEventListener('keydown', handleGlobalKeyDown);
			clearTimeout(debounceTimer);
		};
	});

	function getStatusBadgeClass(status: string) {
		const s = (status || '').toLowerCase();
		if (s === 'confirmed' || s === 'completed' || s === 'delivered')
			return 'bg-emerald-50 text-emerald-700 border-emerald-200';
		if (s === 'processing' || s === 'shipped')
			return 'bg-blue-50 text-blue-700 border-blue-200';
		if (s === 'cancelled' || s === 'trashed')
			return 'bg-rose-50 text-rose-700 border-rose-200';
		return 'bg-amber-50 text-amber-700 border-amber-200';
	}
</script>

{#if open}
	<!-- Backdrop with smooth fade -->
	<div
		class="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-10 sm:pt-16 md:pt-20 px-3 sm:px-4 font-['Anek_Bangla',sans-serif] animate-in fade-in duration-150"
		onclick={(e) => {
			if (e.target === e.currentTarget) handleClose();
		}}
		role="presentation"
	>
		<!-- Command Palette Dialog Container -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-150"
			role="dialog"
			aria-modal="true"
			aria-labelledby="global-search-title"
			tabindex="-1"
		>
			<!-- Top Search Input Header -->
			<div class="p-3.5 sm:p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
				<div class="w-8 h-8 rounded-xl bg-[#5845eb]/10 flex items-center justify-center shrink-0">
					{#if isLoading}
						<Loader2 class="w-4 h-4 text-[#5845eb] animate-spin" />
					{:else}
						<Search class="w-4 h-4 text-[#5845eb]" />
					{/if}
				</div>

				<input
					bind:this={searchInputEl}
					type="text"
					value={searchQuery}
					oninput={handleQueryInput}
					placeholder="অর্ডার নম্বর, কাস্টমার, প্রোডাক্ট বা পেজের নাম খুঁজুন..."
					class="flex-1 bg-transparent text-sm sm:text-base font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
				/>

				{#if searchQuery}
					<button
						type="button"
						onclick={() => {
							searchQuery = '';
							fetchSearch('');
							searchInputEl?.focus();
						}}
						class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
						title="মুছুন"
						aria-label="Clear search"
					>
						<X class="w-4 h-4" />
					</button>
				{/if}

				<button
					type="button"
					onclick={handleClose}
					class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-mono font-medium transition-colors cursor-pointer"
					title="বন্ধ করুন"
				>
					ESC
				</button>
			</div>

			<!-- Filter Chips Toolbar -->
			<div class="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-semibold">
				<button
					type="button"
					onclick={() => (activeFilter = 'all')}
					class="px-2.5 py-1 rounded-xl transition-all cursor-pointer {activeFilter === 'all'
						? 'bg-[#5845eb] text-white shadow-xs'
						: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}"
				>
					সকল ({searchResults.orders.length + searchResults.products.length + searchResults.customers.length + searchResults.navigation.length})
				</button>

				{#if searchResults.orders.length > 0}
					<button
						type="button"
						onclick={() => (activeFilter = 'orders')}
						class="px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 {activeFilter === 'orders'
							? 'bg-[#5845eb] text-white shadow-xs'
							: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}"
					>
						<ShoppingBag class="w-3.5 h-3.5" />
						<span>অর্ডার ({searchResults.orders.length})</span>
					</button>
				{/if}

				{#if searchResults.products.length > 0}
					<button
						type="button"
						onclick={() => (activeFilter = 'products')}
						class="px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 {activeFilter === 'products'
							? 'bg-[#5845eb] text-white shadow-xs'
							: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}"
					>
						<Package class="w-3.5 h-3.5" />
						<span>প্রোডাক্ট ({searchResults.products.length})</span>
					</button>
				{/if}

				{#if searchResults.customers.length > 0}
					<button
						type="button"
						onclick={() => (activeFilter = 'customers')}
						class="px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 {activeFilter === 'customers'
							? 'bg-[#5845eb] text-white shadow-xs'
							: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}"
					>
						<Users class="w-3.5 h-3.5" />
						<span>কাস্টমার ({searchResults.customers.length})</span>
					</button>
				{/if}

				<button
					type="button"
					onclick={() => (activeFilter = 'navigation')}
					class="px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 {activeFilter === 'navigation'
						? 'bg-[#5845eb] text-white shadow-xs'
						: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}"
				>
					<Sliders class="w-3.5 h-3.5" />
					<span>পেজ শর্টকাট ({searchResults.navigation.length})</span>
				</button>
			</div>

			<!-- Scrollable Search Results List -->
			<div class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 no-scrollbar">
				<!-- No Results State -->
				{#if !isLoading && totalResultsCount === 0 && searchQuery}
					<div class="py-12 text-center space-y-2">
						<div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
							<Search class="w-6 h-6" />
						</div>
						<p class="text-sm font-bold text-slate-700">কোনো ফলাফল পাওয়া যায়নি</p>
						<p class="text-xs text-slate-400">
							"{searchQuery}" এর জন্য কোনো অর্ডার, প্রোডাক্ট বা কাস্টমার রেকর্ড পাওয়া যায়নি।
						</p>
					</div>
				{/if}

				<!-- SECTION 1: ORDERS -->
				{#if visibleOrders.length > 0}
					<div class="space-y-1.5">
						<div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
							<ShoppingBag class="w-3.5 h-3.5 text-blue-600" />
							<span>অর্ডার তালিকা ({visibleOrders.length})</span>
						</div>
						<div class="space-y-1">
							{#each visibleOrders as order}
								<button
									type="button"
									onclick={() => navigateTo(`/admin/orders/${order.id}`)}
									class="w-full text-left p-2.5 sm:p-3 rounded-2xl hover:bg-blue-50/70 border border-transparent hover:border-blue-200 transition-all flex items-center justify-between gap-3 group cursor-pointer"
								>
									<div class="flex items-center gap-3 min-w-0">
										<div class="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0 font-mono font-bold text-xs">
											#{order.orderNumber ? order.orderNumber.replace(/^#|^ORD-/, '') : order.id.slice(0, 4)}
										</div>
										<div class="min-w-0">
											<div class="flex items-center gap-2">
												<span class="text-sm font-bold text-slate-800 group-hover:text-blue-700 truncate">
													{order.customerName}
												</span>
												<span class="text-xs text-slate-400 font-mono">
													#{order.orderNumber || order.id}
												</span>
											</div>
											<div class="text-xs text-slate-500 font-mono">
												{order.customerPhone}
											</div>
										</div>
									</div>

									<div class="flex items-center gap-2 shrink-0">
										<span class="font-bold text-xs sm:text-sm text-slate-800">
											৳{(order.total ?? order.totalAmount ?? 0).toLocaleString('en-US')}
										</span>
										<span class="px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize {getStatusBadgeClass(order.status)}">
											{order.status || 'Web'}
										</span>
										<ArrowRight class="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<!-- SECTION 2: PRODUCTS -->
				{#if visibleProducts.length > 0}
					<div class="space-y-1.5">
						<div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
							<Package class="w-3.5 h-3.5 text-emerald-600" />
							<span>প্রোডাক্টসমূহ ({visibleProducts.length})</span>
						</div>
						<div class="space-y-1">
							{#each visibleProducts as prod}
								<button
									type="button"
									onclick={() => navigateTo(`/admin/products/edit/${prod.id}`)}
									class="w-full text-left p-2.5 sm:p-3 rounded-2xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-all flex items-center justify-between gap-3 group cursor-pointer"
								>
									<div class="flex items-center gap-3 min-w-0">
										<div class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
											{#if prod.image}
												<img src={prod.image} alt={prod.name} class="w-full h-full object-cover" />
											{:else}
												<Package class="w-5 h-5 text-slate-400" />
											{/if}
										</div>
										<div class="min-w-0">
											<div class="text-sm font-bold text-slate-800 group-hover:text-emerald-700 truncate">
												{prod.name}
											</div>
											<div class="text-xs text-slate-400 flex items-center gap-2">
												<span>ক্যাটাগরি: {prod.category || 'General'}</span>
												<span>•</span>
												<span class="{prod.stock > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}">
													স্টক: {prod.stock || 0}
												</span>
											</div>
										</div>
									</div>

									<div class="flex items-center gap-2 shrink-0">
										<span class="font-bold text-xs sm:text-sm text-slate-800">
											৳{(prod.price || 0).toLocaleString('en-US')}
										</span>
										<ArrowRight class="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<!-- SECTION 3: CUSTOMERS -->
				{#if visibleCustomers.length > 0}
					<div class="space-y-1.5">
						<div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
							<Users class="w-3.5 h-3.5 text-purple-600" />
							<span>কাস্টমার ({visibleCustomers.length})</span>
						</div>
						<div class="space-y-1">
							{#each visibleCustomers as cust}
								<button
									type="button"
									onclick={() => navigateTo(`/admin/customer`)}
									class="w-full text-left p-2.5 sm:p-3 rounded-2xl hover:bg-purple-50/70 border border-transparent hover:border-purple-200 transition-all flex items-center justify-between gap-3 group cursor-pointer"
								>
									<div class="flex items-center gap-3 min-w-0">
										<div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-sm">
											{cust.name ? cust.name[0].toUpperCase() : 'C'}
										</div>
										<div class="min-w-0">
											<div class="text-sm font-bold text-slate-800 group-hover:text-purple-700 truncate">
												{cust.name}
											</div>
											<div class="text-xs text-slate-400 font-mono">
												{cust.phone} {cust.city ? `• ${cust.city}` : ''}
											</div>
										</div>
									</div>

									<div class="flex items-center gap-2 shrink-0">
										<span class="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-200 font-semibold">
											{cust.totalOrders || 0} টি অর্ডার
										</span>
										<ArrowRight class="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<!-- SECTION 4: NAVIGATION QUICK SHORTCUTS -->
				{#if visibleNav.length > 0}
					<div class="space-y-1.5">
						<div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
							<Sliders class="w-3.5 h-3.5 text-[#5845eb]" />
							<span>{searchQuery ? 'অ্যাডমিন পেজ শর্টকাট' : 'জনপ্রিয় পেজসমূহ'} ({visibleNav.length})</span>
						</div>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
							{#each visibleNav as nav}
								<button
									type="button"
									onclick={() => navigateTo(nav.path)}
									class="text-left p-2.5 rounded-2xl bg-slate-50 hover:bg-[#5845eb]/10 border border-slate-100 hover:border-[#5845eb]/30 transition-all flex items-center justify-between gap-2 group cursor-pointer"
								>
									<div class="flex items-center gap-2.5 min-w-0">
										<div class="w-7 h-7 rounded-lg bg-white border border-slate-200/90 text-slate-600 group-hover:text-[#5845eb] group-hover:border-[#5845eb]/30 flex items-center justify-center shrink-0 shadow-2xs">
											<ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
										</div>
										<div class="min-w-0">
											<div class="text-xs font-bold text-slate-800 group-hover:text-[#5845eb] truncate">
												{nav.title}
											</div>
											<div class="text-[10px] text-slate-400 truncate">
												{nav.group}
											</div>
										</div>
									</div>
									<CornerDownLeft class="w-3.5 h-3.5 text-slate-300 group-hover:text-[#5845eb] shrink-0" />
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Bottom Keyboard Hints Footer -->
			<div class="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
				<div class="flex items-center gap-3">
					<span class="flex items-center gap-1">
						<kbd class="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs">Ctrl</kbd>
						<span>+</span>
						<kbd class="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs">K</kbd>
						<span class="text-slate-400">খুলতে</span>
					</span>
					<span class="hidden sm:inline-flex items-center gap-1">
						<kbd class="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs">ESC</kbd>
						<span class="text-slate-400">বন্ধ করতে</span>
					</span>
				</div>

				<div class="text-slate-400 flex items-center gap-1">
					<span>AURA Search Engine</span>
				</div>
			</div>
		</div>
	</div>
{/if}
