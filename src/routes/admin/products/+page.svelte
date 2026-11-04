<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import type { AdminProduct } from '../_data';
	import { ProductHeader, ProductTable, ProductModal } from '../_components/products';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';
	import { submitAction } from '#lib/client/submit-action';
	import { toCsv, downloadCsv } from '#lib/utils/csv';

	let { data }: { data: PageData } = $props();

	// Local state of products (synced from server data)
	let productItems = $state<AdminProduct[]>((data?.products || []) as AdminProduct[]);

	$effect(() => {
		if (data?.products) {
			productItems = data.products as AdminProduct[];
		}
	});

	// Filter & search states
	let searchQuery = $state('');
	let activeTab = $state<'all' | 'publish' | 'draft' | 'low_stock'>('all');
	let perPage = $state(10);
	let currentPage = $state(1);

	// Column visibility
	let columns = $state({
		sl: true,
		image: true,
		name: true,
		category: true,
		stock: true,
		openingStock: true,
		tags: true,
		actions: true
	});

	// Selection state
	let selectedIds = $state<string[]>([]);

	// Sorting state
	let sortField = $state<'name' | 'stock' | 'sl'>('name');
	let sortOrder = $state<'asc' | 'desc'>('asc');

	// Modal state (legacy quick-edit, redirects to full edit)
	let isModalOpen = $state(false);
	let currentEditingProduct = $state<AdminProduct | null>(null);

	// Filtered products
	let filteredProducts = $derived.by(() => {
		let list = [...productItems];

		if (activeTab === 'publish') {
			list = list.filter((p) => p.status === 'published');
		} else if (activeTab === 'draft') {
			list = list.filter((p) => p.status === 'draft');
		} else if (activeTab === 'low_stock') {
			list = list.filter((p) => p.isLowStock === true);
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(p) =>
					(p.name ?? '').toLowerCase().includes(q) ||
					(p.category ?? '').toLowerCase().includes(q) ||
					(p.tags && p.tags.some((t) => (t ?? '').toLowerCase().includes(q)))
			);
		}

		list.sort((a, b) => {
			if (sortField === 'name') {
				return sortOrder === 'asc'
					? (a.name ?? '').localeCompare(b.name ?? '')
					: (b.name ?? '').localeCompare(a.name ?? '');
			} else if (sortField === 'stock') {
				const sA = a.stock ?? (a.variants ? a.variants.reduce((s, v) => s + (v.stock ?? 0), 0) : 0);
				const sB = b.stock ?? (b.variants ? b.variants.reduce((s, v) => s + (v.stock ?? 0), 0) : 0);
				return sortOrder === 'asc' ? sA - sB : sB - sA;
			}
			return 0;
		});

		return list;
	});

	// Tab counts
	let counts = $derived({
		all: productItems.length,
		publish: productItems.filter((p) => p.status === 'published').length,
		draft: productItems.filter((p) => p.status === 'draft').length,
		lowStock: productItems.filter((p) => p.isLowStock === true).length
	});

	// Pagination
	let totalPages = $derived(Math.max(1, Math.ceil(filteredProducts.length / perPage)));
	let paginatedProducts = $derived(
		filteredProducts.slice((currentPage - 1) * perPage, currentPage * perPage)
	);

	function handleToggleSelectRow(id: string) {
		selectedIds = selectedIds.includes(id)
			? selectedIds.filter((item) => item !== id)
			: [...selectedIds, id];
	}

	function handleToggleSelectAll() {
		if (paginatedProducts.every((p) => selectedIds.includes(p.id))) {
			selectedIds = selectedIds.filter((id) => !paginatedProducts.some((p) => p.id === id));
		} else {
			selectedIds = Array.from(new Set([...selectedIds, ...paginatedProducts.map((p) => p.id)]));
		}
	}

	function handleSort(field: 'name' | 'stock' | 'sl') {
		if (sortField === field) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortOrder = 'asc';
		}
	}

	// Bulk Actions — all server-confirmed
	async function handleBulkAction(action: string) {
		if (action === 'select_all') {
			selectedIds = filteredProducts.map((p) => p.id);
			toast.info(`${selectedIds.length}টি প্রোডাক্ট নির্বাচন করা হয়েছে`);
			return;
		}

		if (action === 'export') {
			const csvColumns = [
				{ header: 'নাম', value: (p: AdminProduct) => p.name },
				{ header: 'স্লাগ', value: (p: AdminProduct) => p.slug ?? '' },
				{ header: 'ক্যাটাগরি', value: (p: AdminProduct) => p.category ?? '' },
				{ header: 'মূল্য', value: (p: AdminProduct) => p.price },
				{ header: 'নিয়মিত মূল্য', value: (p: AdminProduct) => p.originalPrice ?? '' },
				{ header: 'স্টক', value: (p: AdminProduct) => p.stock ?? '' },
				{ header: 'স্ট্যাটাস', value: (p: AdminProduct) => p.status }
			];
			const csv = toCsv(filteredProducts, csvColumns);
			downloadCsv(`products-${new Date().toISOString().slice(0, 10)}.csv`, csv);
			toast.success('CSV ডাউনলোড শুরু হয়েছে');
			return;
		}

		if (selectedIds.length === 0) {
			toast.warning('অনুগ্রহ করে অন্তত একটি প্রোডাক্ট নির্বাচন করুন');
			return;
		}

		if (action === 'publish' || action === 'draft') {
			const status = action === 'publish' ? 'published' : 'draft';
			const fd = new FormData();
			fd.append('productIds', JSON.stringify(selectedIds));
			fd.append('status', status);
			const res = await submitAction('?/bulkSetStatus', fd, 'স্ট্যাটাস বদলাতে সমস্যা হয়েছে');
			if (!res.ok) { toast.error(res.message); return; }
			const label = status === 'published' ? 'পাবলিশ' : 'ড্রাফট';
			const confirmedIds = new Set(selectedIds);
			productItems = productItems.map((p) => confirmedIds.has(p.id) ? { ...p, status } : p);
			selectedIds = [];
			toast.success(`${res.data?.updated ?? confirmedIds.size}টি প্রোডাক্ট ${label} করা হয়েছে`);
			return;
		}

		if (action === 'delete') {
			const confirmed = await confirmModal({
				title: 'প্রোডাক্ট মুছে ফেলা',
				message: `${selectedIds.length}টি প্রোডাক্ট মুছতে চান? ভ্যারিয়েন্ট ও রিভিউ-সহ মুছে যাবে। ল্যান্ডিং পেজে ব্যবহৃত প্রোডাক্ট রাখা হবে।`,
				confirmText: 'হ্যাঁ, মুছে ফেলুন',
				variant: 'destructive',
				icon: 'trash'
			});
			if (!confirmed) return;

			const idsToDelete = [...selectedIds];
			const fd = new FormData();
			fd.append('productIds', JSON.stringify(idsToDelete));
			const res = await submitAction('?/bulkDelete', fd, 'ডিলিট করতে সমস্যা হয়েছে');
			if (!res.ok) { toast.error(res.message); return; }
			const deletedSet = new Set(idsToDelete);
			productItems = productItems.filter((p) => !deletedSet.has(p.id));
			selectedIds = [];
			toast.success(res.data?.message ?? `${idsToDelete.length}টি প্রোডাক্ট ডিলিট করা হয়েছে`);
		}
	}

	function handleEditProduct(product: AdminProduct) {
		goto(`/admin/products/edit/${product.id}`);
	}

	async function handleDuplicateProduct(product: AdminProduct) {
		const fd = new FormData();
		fd.append('productId', product.id);
		const res = await submitAction('?/duplicateProduct', fd, 'ডুপ্লিকেট করা যায়নি');
		if (!res.ok) { toast.error(res.message); return; }
		toast.success(`"${product.name}" ডুপ্লিকেট করা হয়েছে`);
		await invalidateAll();
	}

	async function handleDeleteProduct(product: AdminProduct) {
		const confirmed = await confirmModal({
			title: 'পণ্য মুছে ফেলা',
			message: `"${product.name}" মুছে ফেলতে চান? ভ্যারিয়েন্ট ও রিভিউ-সহ ডাটাবেজ থেকে মুছে যাবে।`,
			confirmText: 'হ্যাঁ, মুছে ফেলুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) return;

		const fd = new FormData();
		fd.append('productId', product.id);
		const res = await submitAction('?/deleteProduct', fd, 'ডিলিট করতে সমস্যা হয়েছে');
		if (!res.ok) { toast.error(res.message); return; }
		productItems = productItems.filter((p) => p.id !== product.id);
		selectedIds = selectedIds.filter((id) => id !== product.id);
		toast.success(`"${product.name}" মুছে ফেলা হয়েছে`);
	}

	async function handleToggleStatus(product: AdminProduct) {
		const fd = new FormData();
		fd.append('productId', product.id);
		const res = await submitAction('?/toggleStatus', fd, 'স্ট্যাটাস বদলানো যায়নি');
		if (!res.ok) { toast.error(res.message); return; }
		const nextStatus = res.data?.nextStatus as 'published' | 'draft' | undefined;
		if (nextStatus) {
			productItems = productItems.map((p) =>
				p.id === product.id ? { ...p, status: nextStatus } : p
			);
		}
		toast.success(`"${product.name}" স্ট্যাটাস পরিবর্তন করা হয়েছে`);
	}

	function handleSaveProduct(_formData: Partial<AdminProduct>) {
		isModalOpen = false;
		if (currentEditingProduct) {
			goto(`/admin/products/edit/${currentEditingProduct.id}`);
		}
	}
</script>

<svelte:head>
	<title>Product - AURA Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
	<!-- 1. Header with Controls & Filter Tabs -->
	<ProductHeader
		bind:searchQuery
		bind:activeTab
		bind:perPage
		bind:columns
		{counts}
		selectedCount={selectedIds.length}
		onAddProduct={() => {
			goto('/admin/products/new');
		}}
		onBulkAction={handleBulkAction}
	/>

	<!-- 2. Product Table -->
	<ProductTable
		products={paginatedProducts}
		{columns}
		bind:selectedIds
		{sortField}
		{sortOrder}
		onToggleSelectAll={handleToggleSelectAll}
		onToggleSelectRow={handleToggleSelectRow}
		onSort={handleSort}
		onEdit={handleEditProduct}
		onDuplicate={handleDuplicateProduct}
		onDelete={handleDeleteProduct}
		onToggleStatus={handleToggleStatus}
	/>

	<!-- 3. Bottom Pagination -->
	<div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium px-2">
		<div>
			মোট <span class="font-bold text-slate-800">{filteredProducts.length}</span> টি প্রোডাক্টের মধ্যে
			<span class="font-bold text-slate-800">
				{filteredProducts.length === 0 ? 0 : (currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, filteredProducts.length)}
			</span>
			দেখানো হচ্ছে
		</div>

		<div class="flex items-center gap-1.5 flex-wrap justify-center">
			<button
				type="button"
				disabled={currentPage === 1}
				onclick={() => (currentPage = Math.max(1, currentPage - 1))}
				class="w-8 h-8 rounded-xl border border-slate-200/90 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-colors"
				aria-label="Previous page"
			>
				<ChevronLeft class="w-4 h-4" />
			</button>

			<div class="flex items-center gap-1 flex-wrap justify-center">
				{#each Array(totalPages) as _, i}
					<button
						type="button"
						onclick={() => (currentPage = i + 1)}
						class="w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer {currentPage === i + 1
							? 'bg-[#5845eb] text-white shadow-sm'
							: 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-2xs'}"
					>
						{i + 1}
					</button>
				{/each}
			</div>

			<button
				type="button"
				disabled={currentPage === totalPages}
				onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
				class="w-8 h-8 rounded-xl border border-slate-200/90 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-colors"
				aria-label="Next page"
			>
				<ChevronRight class="w-4 h-4" />
			</button>
		</div>
	</div>
</div>

<!-- Quick-edit Modal (navigates to full edit page on save) -->
<ProductModal
	bind:open={isModalOpen}
	product={currentEditingProduct}
	onClose={() => (isModalOpen = false)}
	onSave={handleSaveProduct}
/>
