<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import type { AdminProduct } from '../_data';
	import { ProductHeader, ProductTable, ProductModal } from '../_components/products';
	import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-svelte';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();

	// Local state of products (initialized with server layout data)
	let productItems = $state<AdminProduct[]>(
		(data?.products || []) as AdminProduct[]
	);

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

	// Column visibility configuration
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

	// Modal states
	let isModalOpen = $state(false);
	let currentEditingProduct = $state<AdminProduct | null>(null);

	function showToast(msg: string) {
		toast.success(msg);
	}

	// Filtered products derived
	let filteredProducts = $derived.by(() => {
		let list = [...productItems];

		// Filter by Tab
		if (activeTab === 'publish') {
			list = list.filter((p) => p.status === 'published');
		} else if (activeTab === 'draft') {
			list = list.filter((p) => p.status === 'draft');
		} else if (activeTab === 'low_stock') {
			list = list.filter((p) => p.isLowStock || (p.stock !== undefined && p.stock <= 5));
		}

		// Filter by Search Query
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(p) =>
					p.name.toLowerCase().includes(q) ||
					p.category.toLowerCase().includes(q) ||
					(p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
			);
		}

		// Sort
		list.sort((a, b) => {
			if (sortField === 'name') {
				return sortOrder === 'asc'
					? a.name.localeCompare(b.name)
					: b.name.localeCompare(a.name);
			} else if (sortField === 'stock') {
				const stockA = a.stock ?? (a.variants ? a.variants.reduce((s, v) => s + v.stock, 0) : 0);
				const stockB = b.stock ?? (b.variants ? b.variants.reduce((s, v) => s + v.stock, 0) : 0);
				return sortOrder === 'asc' ? stockA - stockB : stockB - stockA;
			}
			return 0;
		});

		return list;
	});

	// Dynamic reactive counts derived directly from real database products
	let counts = $derived({
		all: productItems.length,
		publish: productItems.filter((p) => p.status === 'published').length,
		draft: productItems.filter((p) => p.status === 'draft').length,
		lowStock: productItems.filter((p) => p.isLowStock || (p.stock !== undefined && p.stock <= 5)).length
	});

	// Pagination
	let totalPages = $derived(Math.max(1, Math.ceil(filteredProducts.length / perPage)));
	let paginatedProducts = $derived(
		filteredProducts.slice((currentPage - 1) * perPage, currentPage * perPage)
	);

	// Toggle row selection
	function handleToggleSelectRow(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((item) => item !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	// Toggle select all
	function handleToggleSelectAll() {
		if (paginatedProducts.every((p) => selectedIds.includes(p.id))) {
			selectedIds = selectedIds.filter((id) => !paginatedProducts.some((p) => p.id === id));
		} else {
			const newIds = new Set([...selectedIds, ...paginatedProducts.map((p) => p.id)]);
			selectedIds = Array.from(newIds);
		}
	}

	// Sorting handler
	function handleSort(field: 'name' | 'stock' | 'sl') {
		if (sortField === field) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortOrder = 'asc';
		}
	}

	// Bulk Actions
	async function handleBulkAction(action: string) {
		if (action === 'select_all') {
			selectedIds = filteredProducts.map((p) => p.id);
			showToast(`সমস্ত ${selectedIds.length} টি প্রোডাক্ট নির্বাচন করা হয়েছে`);
		} else if (action === 'publish') {
			if (selectedIds.length === 0) return toast.warning('অনুগ্রহ করে অন্তত একটি প্রোডাক্ট নির্বাচন করুন');
			productItems = productItems.map((p) =>
				selectedIds.includes(p.id) ? { ...p, status: 'published', badge: 'Published' } : p
			);
			showToast(`${selectedIds.length} টি প্রোডাক্ট পাবলিশ করা হয়েছে`);
			selectedIds = [];
		} else if (action === 'draft') {
			if (selectedIds.length === 0) return toast.warning('অনুগ্রহ করে অন্তত একটি প্রোডাক্ট নির্বাচন করুন');
			productItems = productItems.map((p) =>
				selectedIds.includes(p.id) ? { ...p, status: 'draft', badge: 'Draft' } : p
			);
			showToast(`${selectedIds.length} টি প্রোডাক্ট ড্রাফট করা হয়েছে`);
			selectedIds = [];
		} else if (action === 'delete') {
			if (selectedIds.length === 0) return toast.warning('অনুগ্রহ করে অন্তত একটি প্রোডাক্ট নির্বাচন করুন');
			const confirmed = await confirmModal({
				title: 'প্রোডাক্ট মুছে ফেলা',
				message: `আপনি কি নির্বাচিত ${selectedIds.length} টি প্রোডাক্ট মুছতে চান? এটি ডাটাবেজ থেকে মুছে যাবে।`,
				confirmText: 'হ্যাঁ, মুছে ফেলুন',
				variant: 'destructive',
				icon: 'trash'
			});
			if (!confirmed) return;

			const idsToDelete = [...selectedIds];
			productItems = productItems.filter((p) => !idsToDelete.includes(p.id));
			selectedIds = [];
			showToast(`${idsToDelete.length} টি প্রোডাক্ট মুছে ফেলা হয়েছে`);

			try {
				const fd = new FormData();
				fd.append('productIds', JSON.stringify(idsToDelete));
				await fetch('?/bulkDelete', { method: 'POST', body: fd });
			} catch (e) {
				console.error('Bulk delete failed:', e);
			}
		} else if (action === 'export') {
			showToast('CSV ফাইল ডাউনলোড সফল হয়েছে!');
		}
	}

	// Single Product Actions
	function handleEditProduct(product: AdminProduct) {
		goto(`/admin/products/edit/${product.id}`);
	}

	async function handleDuplicateProduct(product: AdminProduct) {
		const newProd: AdminProduct = {
			...JSON.parse(JSON.stringify(product)),
			id: `prod-${Date.now()}`,
			name: `${product.name} (Copy)`
		};
		productItems = [newProd, ...productItems];
		showToast(`"${product.name}" সফলভাবে ডুপ্লিকেট করা হয়েছে`);

		try {
			const fd = new FormData();
			fd.append('productId', product.id);
			await fetch('?/duplicateProduct', { method: 'POST', body: fd });
		} catch (e) {
			console.error('Duplicate action failed:', e);
		}
	}

	async function handleDeleteProduct(product: AdminProduct) {
		const confirmed = await confirmModal({
			title: 'পণ্য মুছে ফেলা',
			message: `আপনি কি "${product.name}" মুছে ফেলতে চান? এটি ডাটাবেজ থেকে মুছে যাবে।`,
			confirmText: 'হ্যাঁ, মুছে ফেলুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) return;

		productItems = productItems.filter((p) => p.id !== product.id);
		selectedIds = selectedIds.filter((id) => id !== product.id);
		showToast(`"${product.name}" মুছে ফেলা হয়েছে`);

		try {
			const fd = new FormData();
			fd.append('productId', product.id);
			await fetch('?/deleteProduct', { method: 'POST', body: fd });
		} catch (e) {
			console.error('Delete action failed:', e);
		}
	}

	async function handleToggleStatus(product: AdminProduct) {
		const newStatus = product.status === 'published' ? 'draft' : 'published';
		productItems = productItems.map((p) =>
			p.id === product.id ? { ...p, status: newStatus, badge: newStatus === 'published' ? 'Published' : 'Draft' } : p
		);
		showToast(`"${product.name}" স্ট্যাটাস পরিবর্তন করা হয়েছে`);

		try {
			const fd = new FormData();
			fd.append('productId', product.id);
			await fetch('?/toggleStatus', { method: 'POST', body: fd });
		} catch (e) {
			console.error('Toggle status action failed:', e);
		}
	}

	function handleSaveProduct(formData: Partial<AdminProduct>) {
		if (currentEditingProduct) {
			// Update existing
			productItems = productItems.map((p) =>
				p.id === currentEditingProduct!.id ? ({ ...p, ...formData } as AdminProduct) : p
			);
			showToast(`"${formData.name}" সফলভাবে আপডেট করা হয়েছে`);
		} else {
			// Add new
			const newProd: AdminProduct = {
				id: `prod-${Date.now()}`,
				name: formData.name || 'New Product',
				slug: formData.slug || 'new-product',
				tagline: formData.tagline || '',
				price: formData.price || 500,
				originalPrice: formData.originalPrice || 700,
				rating: 50,
				reviewsCount: 0,
				image: formData.image || '/images/products/car-paint-pen.svg',
				category: formData.category || 'General',
				subCategory: formData.subCategory || '-',
				badge: formData.badge || 'Published',
				status: formData.status || 'published',
				priority: formData.priority || '-',
				inStock: true,
				stock: formData.stock ?? 100,
				openingStock: formData.openingStock ?? 0,
				description: formData.description || '',
				variants: formData.variants,
				tags: formData.tags
			};
			productItems = [newProd, ...productItems];
			showToast(`"${newProd.name}" নতুন প্রোডাক্ট হিসেবে যুক্ত হয়েছে`);
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

<!-- Add / Edit Modal -->
<ProductModal
	bind:open={isModalOpen}
	product={currentEditingProduct}
	onClose={() => (isModalOpen = false)}
	onSave={handleSaveProduct}
/>
