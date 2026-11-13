<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { sanitizeRichText } from '#lib/utils/sanitize-html';
	import type { PageData } from './$types';
	import {
		Database,
		Download,
		Upload,
		FileSpreadsheet,
		FileCode,
		RefreshCw,
		CheckCircle2,
		AlertCircle,
		Sparkles,
		Eye,
		ShoppingBag,
		Tag,
		Layers,
		ShoppingCart,
		Users,
		FileText,
		ShieldCheck,
		X,
		Loader2,
		Code,
		Table as TableIcon,
		Search,
		AlertTriangle
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();

	// Modal States
	let isImportModalOpen = $state(false);
	let importEntity = $state<'products' | 'categories' | 'coupons' | 'orders' | 'customers' | 'full_backup'>('products');
	let importEntityLabel = $state('পণ্য তালিকা');
	let updateExisting = $state(true);

	// File Handling State
	let selectedFile = $state<File | null>(null);
	let isAnalyzing = $state(false);
	let isImporting = $state(false);
	let isDragging = $state(false);
	let previewData = $state<{
		success?: boolean;
		error?: string;
		total?: number;
		columns?: string[];
		previewRows?: any[];
		hasHtmlDescription?: boolean;
	} | null>(null);
	let fileInputRef: HTMLInputElement | null = null;

	// Database Seeding State
	let isSeeding = $state(false);

	// Live Sales Summary Modal State
	interface SalesSummaryItem {
		name: string;
		quantity: number;
		revenue: number;
		ordersCount: number;
	}
	let isSalesModalOpen = $state(false);
	let isLoadingSales = $state(false);
	let salesItems = $state<SalesSummaryItem[]>([]);
	let salesSearch = $state('');

	let filteredSalesItems = $derived(
		salesItems.filter((item) =>
			item.name.toLowerCase().includes(salesSearch.trim().toLowerCase())
		)
	);

	let totalSoldPieces = $derived(
		salesItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0)
	);

	let totalRevenue = $derived(
		salesItems.reduce((acc, item) => acc + (Number(item.revenue) || 0), 0)
	);

	function openImportModal(entity: typeof importEntity, label: string) {
		importEntity = entity;
		importEntityLabel = label;
		selectedFile = null;
		previewData = null;
		isImportModalOpen = true;
	}

	function closeImportModal() {
		if (isImporting) return;
		isImportModalOpen = false;
		selectedFile = null;
		previewData = null;
		isDragging = false;
	}

	async function handleFileSelected(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return;
		const file = target.files[0];
		await processFile(file);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
		const file = e.dataTransfer.files[0];
		processFile(file);
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
	}

	async function processFile(file: File) {
		// Client-side file size and format guard
		if (file.size > 15 * 1024 * 1024) {
			toast.error('ফাইলের সাইজ ১৫ মেগাবাইটের বেশি হতে পারবে না।');
			return;
		}

		const ext = file.name.split('.').pop()?.toLowerCase();
		if (ext !== 'json' && ext !== 'csv') {
			toast.error('শুধুমাত্র .JSON বা .CSV ফরম্যাটের ফাইল নির্বাচন করুন।');
			return;
		}

		selectedFile = file;
		if (importEntity === 'full_backup') {
			// Full backup doesn't need field preview
			return;
		}

		isAnalyzing = true;
		previewData = null;

		try {
			const fd = new FormData();
			fd.append('file', file);
			const res = await fetch('/api/admin/data-transfer/preview', {
				method: 'POST',
				body: fd
			});

			const json = (await res.json()) as {
				success: boolean;
				error?: string;
				total?: number;
				columns?: string[];
				previewRows?: any[];
				hasHtmlDescription?: boolean;
			};
			if (json.success) {
				previewData = json;
			} else {
				toast.error(json.error || 'ফাইল প্রিভিউ লোড করা যায়নি');
			}
		} catch (err: any) {
			toast.error('ফাইল বিশ্লেষণে ত্রুটি: ' + err?.message);
		} finally {
			isAnalyzing = false;
		}
	}

	async function submitImport() {
		if (!selectedFile) {
			toast.error('অনুগ্রহ করে একটি JSON বা CSV ফাইল সিলেক্ট করুন।');
			return;
		}

		isImporting = true;
		const toastId = toast.loading(`${importEntityLabel} ইমপোর্ট করা হচ্ছে...`);

		try {
			const fd = new FormData();
			fd.append('file', selectedFile);
			fd.append('entity', importEntity);
			fd.append('updateExisting', String(updateExisting));

			const res = await fetch('/api/admin/data-transfer/import', {
				method: 'POST',
				body: fd
			});

			const result = (await res.json()) as {
				success: boolean;
				message?: string;
				errors?: string[];
				total?: number;
				inserted?: number;
				updated?: number;
			};
			if (result.success) {
				toast.success(result.message || 'ইমপোর্ট সফল হয়েছে!', { id: toastId });
				closeImportModal();
				// Seamlessly revalidate server load without page flash
				await invalidateAll();
			} else {
				toast.error(result.message || 'ইমপোর্ট ব্যর্থ হয়েছে।', { id: toastId });
				if (Array.isArray(result.errors) && result.errors.length > 0) {
					console.warn('Import errors:', result.errors);
				}
			}
		} catch (err: any) {
			toast.error('ইমপোর্ট ব্যর্থ: ' + err?.message, { id: toastId });
		} finally {
			isImporting = false;
		}
	}

	async function viewLiveSales() {
		isSalesModalOpen = true;
		isLoadingSales = true;
		salesSearch = '';
		try {
			const res = await fetch('/api/admin/data-transfer/export?entity=sales_summary&format=json');
			const json = await res.json();
			if (Array.isArray(json)) {
				salesItems = json;
			}
		} catch (err: any) {
			toast.error('বিক্রয় রিপোর্ট লোড করা যায়নি');
		} finally {
			isLoadingSales = false;
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			if (isImportModalOpen && !isImporting) closeImportModal();
			if (isSalesModalOpen) isSalesModalOpen = false;
		}
	}}
/>

<svelte:head>
	<title>ইমপোর্ট / এক্সপোর্ট ও ডাটা ব্যাকআপ | Admin</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-7 pb-16">
	<!-- Top Premium Command Bar -->
	<div class="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
		<div class="space-y-1">
			<div class="flex items-center gap-2.5">
				<div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5845eb] to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
					<Database class="w-5 h-5" />
				</div>
				<div>
					<div class="flex flex-wrap items-center gap-2">
						<h1 class="text-lg font-black text-slate-900 tracking-tight">
							ডাটা ব্যাকআপ ও ইমপোর্ট / এক্সপোর্ট
						</h1>
						{#if data.isD1Connected}
							<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
								<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
								D1 ডাটাবেস সক্রিয়
							</span>
						{:else}
							<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
								<AlertTriangle class="w-3.5 h-3.5 text-amber-600" />
								লোকাল / মেমরি মোড
							</span>
						{/if}
					</div>
					<p class="text-xs text-slate-500 font-medium">
						ক্লাউডফ্লেয়ার D1 ডাটাবেস থেকে ১-ক্লিকে ফুল ব্যাকআপ, রিস্টোর, এবং রিচ HTML পণ্য ডাটা আদান-প্রদান
					</p>
				</div>
			</div>
		</div>

		<div class="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
			<!-- Full Backup Download Button -->
			<a
				href="/api/admin/data-transfer/export?entity=full_backup"
				download
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
			>
				<Download class="w-4 h-4" />
				<span>সম্পূর্ণ ব্যাকআপ ডাউনলোড</span>
			</a>

			<!-- Full Restore Button -->
			<button
				type="button"
				onclick={() => openImportModal('full_backup', 'সম্পূর্ণ ব্যাকআপ রিস্টোর')}
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
			>
				<Upload class="w-4 h-4 text-[#5845eb]" />
				<span>সম্পূর্ণ রিস্টোর</span>
			</button>
		</div>
	</div>

	<!-- Live Metrics Strip -->
	<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
		<div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
			<span class="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">পণ্য তালিকা</span>
			<span class="text-2xl font-black font-mono text-slate-900 mt-1 block">{data.entityCounts?.products ?? 0}</span>
			<span class="text-[10px] text-emerald-600 font-bold mt-0.5 inline-flex items-center gap-1">
				<CheckCircle2 class="w-3 h-3" /> সক্রিয় লাইভ
			</span>
		</div>

		<div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
			<span class="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">ক্যাটাগরি</span>
			<span class="text-2xl font-black font-mono text-indigo-600 mt-1 block">{data.entityCounts?.categories ?? 0}</span>
			<span class="text-[10px] text-slate-400 mt-0.5 block">ক্যাটালগ ট্রি</span>
		</div>

		<div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
			<span class="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">কুপন ও অফার</span>
			<span class="text-2xl font-black font-mono text-purple-600 mt-1 block">{data.entityCounts?.coupons ?? 0}</span>
			<span class="text-[10px] text-slate-400 mt-0.5 block">ডিসকাউন্ট রুলস</span>
		</div>

		<div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
			<span class="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">মোট অর্ডার</span>
			<span class="text-2xl font-black font-mono text-slate-900 mt-1 block">{data.entityCounts?.orders ?? 0}</span>
			<span class="text-[10px] text-slate-400 mt-0.5 block">লাইফটাইম সেলস</span>
		</div>

		<div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
			<span class="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">গ্রাহক তালিকা</span>
			<span class="text-2xl font-black font-mono text-cyan-600 mt-1 block">{data.entityCounts?.customers ?? 0}</span>
			<span class="text-[10px] text-slate-400 mt-0.5 block">প্রোফাইল রেকর্ড</span>
		</div>

		<div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
			<span class="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">রিভিউ ও মতামত</span>
			<span class="text-2xl font-black font-mono text-amber-600 mt-1 block">{data.entityCounts?.reviews ?? 0}</span>
			<span class="text-[10px] text-slate-400 mt-0.5 block">যাচাইকৃত ফিডব্যাক</span>
		</div>
	</div>

	<!-- SECTION 1: পণ্য ও কুপন -->
	<div class="space-y-3.5">
		<div class="flex items-center justify-between">
			<h2 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
				<ShoppingBag class="w-4 h-4 text-[#5845eb]" />
				<span>পণ্য ও কুপন ম্যানেজমেন্ট</span>
			</h2>
			<span class="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
				<Sparkles class="w-3.5 h-3.5 text-emerald-600" />
				HTML ডেসক্রিপশন ও ইনলাইন সিএসএস স্টাইল সংরক্ষিত হবে
			</span>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- 1. পণ্য তালিকা কার্ড -->
			<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
				<div class="flex items-start justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-[#5845eb] flex items-center justify-center shrink-0">
							<ShoppingBag class="w-5 h-5" />
						</div>
						<div>
							<h3 class="text-sm font-black text-slate-900">পণ্য তালিকা</h3>
							<p class="text-[11px] font-mono text-slate-400">products.json / products.csv</p>
						</div>
					</div>
					<span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
						{data.entityCounts?.products ?? 0} আইটেম
					</span>
				</div>

				<p class="text-xs text-slate-500 leading-relaxed">
					সমস্ত পণ্যের নাম, দাম, ছবি, এবং <strong class="text-slate-800">এইচটিএমএল (HTML) সহ কালারফুল ডেসক্রিপশন</strong> এক্সপোর্ট ও ইমপোর্ট করুন।
				</p>

				<div class="flex items-center gap-2 pt-2 border-t border-slate-100">
					<!-- Export Dropdown -->
					<div class="flex-1 flex gap-1.5">
						<a
							href="/api/admin/data-transfer/export?entity=products&format=json"
							download
							class="flex-1 text-center py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1"
							title="JSON এক্সপোর্ট"
						>
							<FileCode class="w-3.5 h-3.5 text-indigo-600" />
							<span>JSON</span>
						</a>
						<a
							href="/api/admin/data-transfer/export?entity=products&format=csv"
							download
							class="flex-1 text-center py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1"
							title="CSV এক্সপোর্ট"
						>
							<FileSpreadsheet class="w-3.5 h-3.5 text-emerald-600" />
							<span>CSV</span>
						</a>
					</div>

					<button
						type="button"
						onclick={() => openImportModal('products', 'পণ্য তালিকা')}
						class="flex-1 text-center py-2 px-3 rounded-xl bg-[#5845eb] hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-indigo-500/20"
					>
						<Upload class="w-3.5 h-3.5" />
						<span>ইমপোর্ট</span>
					</button>
				</div>
			</div>

			<!-- 2. কুপন তালিকা কার্ড -->
			<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
				<div class="flex items-start justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
							<Tag class="w-5 h-5" />
						</div>
						<div>
							<h3 class="text-sm font-black text-slate-900">কুপন তালিকা</h3>
							<p class="text-[11px] font-mono text-slate-400">coupons.json</p>
						</div>
					</div>
					<span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
						{data.entityCounts?.coupons ?? 0} কুপন
					</span>
				</div>

				<p class="text-xs text-slate-500 leading-relaxed">
					ডিসকাউন্ট পার্সেন্টেজ, ফিক্সড ছাড়, মেয়াদ এবং ব্যবহারের লিমিট সংক্রান্ত কুপন ডাটা এক্সপোর্ট বা অন্য স্টোরে ট্রান্সফার করুন।
				</p>

				<div class="flex items-center gap-2 pt-2 border-t border-slate-100">
					<a
						href="/api/admin/data-transfer/export?entity=coupons&format=json"
						download
						class="flex-1 text-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
					>
						<Download class="w-3.5 h-3.5 text-purple-600" />
						<span>এক্সপোর্ট</span>
					</a>

					<button
						type="button"
						onclick={() => openImportModal('coupons', 'কুপন তালিকা')}
						class="flex-1 text-center py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-purple-600/20"
					>
						<Upload class="w-3.5 h-3.5" />
						<span>ইমপোর্ট</span>
					</button>
				</div>
			</div>

			<!-- 3. ক্যাটাগরি কার্ড -->
			<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
				<div class="flex items-start justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
							<Layers class="w-5 h-5" />
						</div>
						<div>
							<h3 class="text-sm font-black text-slate-900">ক্যাটাগরি তালিকা</h3>
							<p class="text-[11px] font-mono text-slate-400">categories.json</p>
						</div>
					</div>
					<span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
						{data.entityCounts?.categories ?? 0} ক্যাটাগরি
					</span>
				</div>

				<p class="text-xs text-slate-500 leading-relaxed">
					সমস্ত ক্যাটাগরি ও সাব-ক্যাটাগরি ট্রি ব্যাকআপ করুন। নতুন স্টোর সেটআপের সময় এক ক্লিকে সম্পূর্ণ ক্যাটাগরি লোড করতে পারবেন।
				</p>

				<div class="flex items-center gap-2 pt-2 border-t border-slate-100">
					<a
						href="/api/admin/data-transfer/export?entity=categories&format=json"
						download
						class="flex-1 text-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
					>
						<Download class="w-3.5 h-3.5 text-cyan-600" />
						<span>এক্সপোর্ট</span>
					</a>

					<button
						type="button"
						onclick={() => openImportModal('categories', 'ক্যাটাগরি তালিকা')}
						class="flex-1 text-center py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-cyan-600/20"
					>
						<Upload class="w-3.5 h-3.5" />
						<span>ইমপোর্ট</span>
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- SECTION 2: অর্ডার ম্যানেজমেন্ট ও বিক্রয় রিপোর্ট -->
	<div class="space-y-3.5">
		<h2 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
			<ShoppingCart class="w-4 h-4 text-emerald-600" />
			<span>অর্ডার ম্যানেজমেন্ট ও বিক্রয় অ্যানালিটিক্স</span>
		</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- সকল অর্ডার -->
			<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
				<div class="flex items-start justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
							<ShoppingCart class="w-5 h-5" />
						</div>
						<div>
							<h3 class="text-sm font-black text-slate-900">সকল অর্ডার রেকর্ড</h3>
							<p class="text-[11px] font-mono text-slate-400">orders.json / orders.csv</p>
						</div>
					</div>
					<span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
						{data.entityCounts?.orders ?? 0} অর্ডার
					</span>
				</div>

				<p class="text-xs text-slate-500 leading-relaxed">
					গ্রাহকের নাম, মোবাইল নম্বর, ঠিকানা, অর্ডারকৃত আইটেম, কুরিয়ার ট্র্যাকিং ও পেমেন্ট স্ট্যাটাস সহ ফুল অর্ডার রেকর্ড।
				</p>

				<div class="flex items-center gap-2 pt-2 border-t border-slate-100">
					<a
						href="/api/admin/data-transfer/export?entity=orders&format=json"
						download
						class="flex-1 text-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
					>
						<FileCode class="w-3.5 h-3.5 text-indigo-600" />
						<span>JSON ডাউনলোড</span>
					</a>

					<a
						href="/api/admin/data-transfer/export?entity=orders&format=csv"
						download
						class="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs shadow-emerald-600/20"
					>
						<FileSpreadsheet class="w-3.5 h-3.5" />
						<span>Excel / CSV</span>
					</a>
				</div>
			</div>

			<!-- পণ্য বিক্রয় রিপোর্ট (মোট পিস) -->
			<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
				<div class="flex items-start justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
							<FileSpreadsheet class="w-5 h-5" />
						</div>
						<div>
							<h3 class="text-sm font-black text-slate-900">পণ্য বিক্রয় রিপোর্ট (মোট পিস)</h3>
							<p class="text-[11px] font-mono text-slate-400">sales_summary.csv</p>
						</div>
					</div>
					<span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
						অ্যানালিটিক্স সামারি
					</span>
				</div>

				<p class="text-xs text-slate-500 leading-relaxed">
					কোন পণ্য সর্বমোট কত পিস বিক্রি হয়েছে এবং মোট কত টাকার সেল জেনারেট করেছে তা এক নজরে দেখুন বা CSV ডাউনলোড করুন।
				</p>

				<div class="flex items-center gap-2 pt-2 border-t border-slate-100">
					<button
						type="button"
						onclick={viewLiveSales}
						class="flex-1 text-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
					>
						<Eye class="w-3.5 h-3.5 text-slate-600" />
						<span>লাইভ দেখুন</span>
					</button>

					<a
						href="/api/admin/data-transfer/export?entity=sales_summary&format=csv"
						download
						class="flex-1 text-center py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs shadow-amber-600/20"
					>
						<Download class="w-3.5 h-3.5" />
						<span>CSV ডাউনলোড</span>
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- SECTION 3: গ্রাহক তথ্য ও সিস্টেম রিসেট -->
	<div class="space-y-3.5">
		<h2 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
			<Users class="w-4 h-4 text-cyan-600" />
			<span>গ্রাহক তথ্য ও ডাটাবেজ সিস্টেম কনসোল</span>
		</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- গ্রাহক তথ্য কার্ড -->
			<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
				<div class="flex items-start justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
							<Users class="w-5 h-5" />
						</div>
						<div>
							<h3 class="text-sm font-black text-slate-900">কাস্টমার তালিকা ও প্রোফাইল</h3>
							<p class="text-[11px] font-mono text-slate-400">customers.json / customers.csv</p>
						</div>
					</div>
					<span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
						{data.entityCounts?.customers ?? 0} গ্রাহক
					</span>
				</div>

				<p class="text-xs text-slate-500 leading-relaxed">
					গ্রাহকদের মোবাইল নম্বর, লাইফটাইম মোট শপিং, অর্ডার সংখ্যা এবং ঠিকানা এক্সপোর্ট করে এসএমএস মার্কেটিং ও কাস্টমার রিলেশনশিপে ব্যবহার করুন।
				</p>

				<div class="flex items-center gap-2 pt-2 border-t border-slate-100">
					<a
						href="/api/admin/data-transfer/export?entity=customers&format=json"
						download
						class="flex-1 text-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
					>
						<FileCode class="w-3.5 h-3.5 text-cyan-600" />
						<span>JSON</span>
					</a>

					<a
						href="/api/admin/data-transfer/export?entity=customers&format=csv"
						download
						class="flex-1 text-center py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs shadow-cyan-600/20"
					>
						<FileSpreadsheet class="w-3.5 h-3.5" />
						<span>Excel / CSV</span>
					</a>
				</div>
			</div>

			<!-- ডাটাবেজ সিডিং ও রিস্টার্ট কার্ড (Protected) -->
			<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
				<div class="flex items-start justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
							<RefreshCw class="w-5 h-5" />
						</div>
						<div>
							<h3 class="text-sm font-black text-slate-900">স্যাম্পল ডাটাবেজ সিড</h3>
							<p class="text-[11px] font-mono text-slate-400">Cloudflare D1 Reset</p>
						</div>
					</div>
					<span class="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md">
						শুধুমাত্র Owner
					</span>
				</div>

				<p class="text-xs text-slate-500 leading-relaxed">
					স্টোরে টেস্ট ডাটা ইনস্টল করতে বা ডিফল্ট বীজ পণ্যগুলো পুনরায় সাজাতে এই অ্যাকশন ব্যবহার করুন।
				</p>

				<div class="flex items-center justify-between pt-2 border-t border-slate-100">
					{#if data.userRole !== 'Owner'}
						<p class="text-[11px] text-amber-600 font-medium">
							*শুধুমাত্র স্টোর ওনার (Owner) অ্যাকাউন্ট থেকে রিসেট অনুমোদিত।
						</p>
					{:else}
						<p class="text-[11px] text-slate-400">
							টেস্ট ডাটা রি-পপুলেট করতে ব্যবহার করুন
						</p>
					{/if}

					<form
						method="POST"
						action="?/seedDatabase"
						use:enhance={() => {
							isSeeding = true;
							const toastId = toast.loading('D1 ডাটাবেজ স্যাম্পল প্রোডাক্ট দিয়ে রিসেট করা হচ্ছে...');
							return async ({ result, update }) => {
								isSeeding = false;
								if (result.type === 'success') {
									toast.success((result.data as any)?.message || 'ডাটাবেজ সফলভাবে সিড করা হয়েছে!', { id: toastId });
									await update();
								} else if (result.type === 'failure') {
									toast.error((result.data as any)?.message || 'ডাটাবেজ সিড ব্যর্থ হয়েছে!', { id: toastId });
								} else {
									await update();
								}
							};
						}}
					>
						<button
							type="submit"
							disabled={isSeeding || data.userRole !== 'Owner'}
							onclick={(e) => {
								if (!confirm('সতর্কতা: এটি বর্তমান সমস্ত প্রোডাক্ট মুছে স্যাম্পল প্রোডাক্ট দিয়ে রিসেট করবে! আপনি কি নিশ্চিত?')) {
									e.preventDefault();
								}
							}}
							title={data.userRole !== 'Owner' ? 'শুধুমাত্র Owner পারমিশন রয়েছে' : 'স্যাম্পল প্রোডাক্ট রিসেট'}
							class="py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{#if isSeeding}
								<Loader2 class="w-3.5 h-3.5 animate-spin" />
								<span>রিসেট হচ্ছে...</span>
							{:else}
								<RefreshCw class="w-3.5 h-3.5" />
								<span>D1 ডাটাবেজ সিড করুন</span>
							{/if}
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- ==================================================== -->
<!-- INTERACTIVE IMPORT & LIVE HTML PREVIEW MODAL -->
<!-- ==================================================== -->
{#if isImportModalOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		role="dialog"
		aria-modal="true"
		onclick={(e) => {
			if (e.target === e.currentTarget && !isImporting) closeImportModal();
		}}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
	>
		<div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
			<!-- Modal Header -->
			<div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-[#5845eb] flex items-center justify-center font-bold">
						<Upload class="w-4 h-4" />
					</div>
					<div>
						<h3 class="text-sm font-black text-slate-900">{importEntityLabel} ইমপোর্ট করুন</h3>
						<p class="text-[11px] text-slate-400">JSON বা CSV ফাইল ড্রপ করুন</p>
					</div>
				</div>

				<button
					type="button"
					onclick={closeImportModal}
					disabled={isImporting}
					class="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
					aria-label="মডাল বন্ধ করুন"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Modal Body -->
			<div class="p-6 overflow-y-auto space-y-5">
				<!-- Drag & Drop Zone -->
				<div
					role="button"
					tabindex="0"
					ondragover={(e) => {
						e.preventDefault();
						isDragging = true;
					}}
					ondragenter={() => (isDragging = true)}
					ondragleave={() => (isDragging = false)}
					ondrop={handleDrop}
					onclick={() => fileInputRef?.click()}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							fileInputRef?.click();
						}
					}}
					class="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 {isDragging
						? 'border-[#5845eb] bg-indigo-100/70 scale-[1.01]'
						: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60'}"
				>
					<input
						type="file"
						accept=".json,.csv"
						bind:this={fileInputRef}
						onchange={handleFileSelected}
						class="hidden"
					/>

					<div class="w-12 h-12 mx-auto rounded-2xl bg-indigo-100 text-[#5845eb] flex items-center justify-center shadow-xs">
						{#if isAnalyzing}
							<Loader2 class="w-6 h-6 animate-spin text-[#5845eb]" />
						{:else}
							<Upload class="w-6 h-6" />
						{/if}
					</div>

					<div>
						{#if selectedFile}
							<div class="flex items-center justify-center gap-2">
								<span class="text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs">
									{selectedFile.name}
								</span>
								<span class="text-[11px] text-slate-500 font-mono">
									({formatFileSize(selectedFile.size)})
								</span>
							</div>
							<p class="text-[11px] text-[#5845eb] font-semibold mt-1">
								ফাইল পরিবর্তন করতে পুনরায় ক্লিক করুন বা ড্রপ করুন
							</p>
						{:else}
							<p class="text-xs font-bold text-slate-800">
								ফাইল এখানে ড্রপ করুন অথবা ব্রাউজ করতে ক্লিক করুন
							</p>
							<p class="text-[11px] text-slate-400 mt-0.5">
								সমর্থিত ফরম্যাট: .JSON, .CSV (UTF-8, সর্বোচ্চ ১৫ MB)
							</p>
						{/if}
					</div>
				</div>

				<!-- Live Preview Container -->
				{#if previewData}
					<div class="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
						<div class="flex items-center justify-between">
							<span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
								<CheckCircle2 class="w-4 h-4 text-emerald-600" />
								<span>শনাক্তকৃত রেকর্ড: <strong>{previewData.total ?? 0}</strong> টি</span>
							</span>

							{#if previewData.hasHtmlDescription}
								<span class="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
									<Code class="w-3 h-3 text-emerald-700" /> HTML ডেসক্রিপশন ডিটেক্টেড
								</span>
							{/if}
						</div>

						<!-- HTML Description Live Render Preview (If Available) -->
						{#if previewData.previewRows?.[0]?.description}
							<div class="space-y-1.5 pt-2 border-t border-slate-200/80">
								<span class="text-[11px] font-bold text-slate-600 block flex items-center gap-1">
									<Eye class="w-3 h-3 text-indigo-600" /> প্রথম পণ্যের ডেসক্রিপশন প্রিভিউ (Live HTML Style):
								</span>
								<div class="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 max-h-36 overflow-y-auto font-sans leading-relaxed shadow-2xs">
									{@html sanitizeRichText(previewData.previewRows[0].description)}
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Options -->
				<label class="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
					<input
						type="checkbox"
						bind:checked={updateExisting}
						class="rounded text-[#5845eb] focus:ring-[#5845eb]"
					/>
					<span>আগে থেকে থাকা একই SKU বা Slug এর পণ্যের তথ্য আপডেট করুন</span>
				</label>
			</div>

			<!-- Modal Footer -->
			<div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
				<button
					type="button"
					onclick={closeImportModal}
					disabled={isImporting}
					class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
				>
					বাতিল
				</button>

				<button
					type="button"
					onclick={submitImport}
					disabled={!selectedFile || isImporting || isAnalyzing}
					class="px-5 py-2 rounded-xl text-xs font-bold bg-[#5845eb] hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
				>
					{#if isImporting}
						<Loader2 class="w-4 h-4 animate-spin" />
						<span>ইমপোর্ট প্রসেসিং...</span>
					{:else}
						<CheckCircle2 class="w-4 h-4" />
						<span>ইমপোর্ট সম্পন্ন করুন</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- ==================================================== -->
<!-- LIVE SALES SUMMARY REPORT MODAL -->
<!-- ==================================================== -->
{#if isSalesModalOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		role="dialog"
		aria-modal="true"
		onclick={(e) => {
			if (e.target === e.currentTarget) isSalesModalOpen = false;
		}}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
	>
		<div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden">
			<!-- Modal Header -->
			<div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
						<FileSpreadsheet class="w-4 h-4" />
					</div>
					<div>
						<h3 class="text-sm font-black text-slate-900">পণ্য বিক্রয় রিপোর্ট (মোট পিস)</h3>
						<p class="text-[11px] text-slate-400">সর্বোচ্চ বিক্রিত পণ্যের লাইভ হিসেব ও মোট রেভিনিউ</p>
					</div>
				</div>

				<button
					type="button"
					onclick={() => (isSalesModalOpen = false)}
					class="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
					aria-label="মডাল বন্ধ করুন"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Modal Body -->
			<div class="p-6 overflow-y-auto space-y-4">
				{#if isLoadingSales}
					<div class="py-14 text-center text-slate-400 space-y-2">
						<Loader2 class="w-6 h-6 animate-spin mx-auto text-amber-500" />
						<p class="text-xs font-bold text-slate-600">বিক্রয় রিপোর্ট হিসাব করা হচ্ছে...</p>
					</div>
				{:else if salesItems.length === 0}
					<div class="py-14 text-center text-slate-400 space-y-1.5 bg-slate-50 rounded-2xl border border-slate-100">
						<FileSpreadsheet class="w-9 h-9 mx-auto text-slate-300" />
						<p class="text-xs font-bold text-slate-700">কোনো সফল বিক্রয় রেকর্ড পাওয়া যায়নি</p>
						<p class="text-[11px] text-slate-400">স্টোরে অর্ডার তৈরি হলে স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে।</p>
					</div>
				{:else}
					<!-- KPI Quick Summary Cards -->
					<div class="grid grid-cols-3 gap-3">
						<div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
							<span class="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">পণ্য ধরন</span>
							<span class="text-base font-black font-mono text-slate-900">{salesItems.length} টি</span>
						</div>
						<div class="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center">
							<span class="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">মোট বিক্রয়</span>
							<span class="text-base font-black font-mono text-emerald-700">{totalSoldPieces.toLocaleString('en-US')} পিস</span>
						</div>
						<div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-center">
							<span class="text-[10px] text-amber-700 font-bold block uppercase tracking-wider">সর্বমোট রেভিনিউ</span>
							<span class="text-base font-black font-mono text-amber-800">৳{totalRevenue.toLocaleString('en-US')}</span>
						</div>
					</div>

					<!-- Search Filter -->
					<div class="relative">
						<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						<input
							type="text"
							bind:value={salesSearch}
							placeholder="পণ্যের নাম দিয়ে সার্চ করুন..."
							class="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-hidden transition-all"
						/>
						{#if salesSearch}
							<button
								type="button"
								onclick={() => (salesSearch = '')}
								class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
								title="সার্চ ক্লিয়ার করুন"
							>
								<X class="w-3.5 h-3.5" />
							</button>
						{/if}
					</div>

					{#if filteredSalesItems.length === 0}
						<div class="py-8 text-center text-slate-400 space-y-2 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
							<p class="text-xs font-bold text-slate-600">"{salesSearch}" এর সাথে মিল রয়েছে এমন কোনো পণ্য নেই</p>
							<button
								type="button"
								onclick={() => (salesSearch = '')}
								class="text-xs text-[#5845eb] font-bold hover:underline cursor-pointer"
							>
								সব পণ্য প্রদর্শন করুন
							</button>
						</div>
					{:else}
						<!-- Sales Data Table -->
						<div class="overflow-x-auto rounded-xl border border-slate-200 max-h-72 overflow-y-auto">
							<table class="w-full text-xs text-left">
								<thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
									<tr>
										<th class="py-3 px-3.5">পণ্যের নাম</th>
										<th class="py-3 px-3.5 text-center">মোট বিক্রয় (পিস)</th>
										<th class="py-3 px-3.5 text-right">মোট রেভিনিউ</th>
										<th class="py-3 px-3.5 text-center">অর্ডার সংখ্যা</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-100">
									{#each filteredSalesItems as item}
										<tr class="hover:bg-slate-50/70 transition-colors">
											<td class="py-2.5 px-3.5 font-bold text-slate-900">{item.name}</td>
											<td class="py-2.5 px-3.5 text-center font-mono font-bold text-emerald-600">{item.quantity} পিস</td>
											<td class="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900">৳{Number(item.revenue).toLocaleString('en-US')}</td>
											<td class="py-2.5 px-3.5 text-center font-mono text-slate-500">{item.ordersCount}</td>
										</tr>
									{/each}
								</tbody>
								<tfoot class="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-800 sticky bottom-0">
									<tr>
										<td class="py-2.5 px-3.5">মোট (ফিল্টারকৃত)</td>
										<td class="py-2.5 px-3.5 text-center font-mono text-emerald-700">
											{filteredSalesItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)} পিস
										</td>
										<td class="py-2.5 px-3.5 text-right font-mono text-slate-900">
											৳{filteredSalesItems.reduce((acc, i) => acc + (Number(i.revenue) || 0), 0).toLocaleString('en-US')}
										</td>
										<td class="py-2.5 px-3.5 text-center font-mono text-slate-500">
											{filteredSalesItems.reduce((acc, i) => acc + (Number(i.ordersCount) || 0), 0)}
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
					{/if}
				{/if}
			</div>

			<!-- Modal Footer -->
			<div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
				<span class="text-xs text-slate-500">
					প্রদর্শিত হচ্ছে: <strong>{filteredSalesItems.length}</strong> / {salesItems.length} পণ্য
				</span>
				<a
					href="/api/admin/data-transfer/export?entity=sales_summary&format=csv"
					download
					class="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
				>
					<Download class="w-3.5 h-3.5" />
					<span>CSV ডাউনলোড</span>
				</a>
			</div>
		</div>
	</div>
{/if}
