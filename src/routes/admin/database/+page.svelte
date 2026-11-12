<script lang="ts">
	import { enhance } from '$app/forms';
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
		Table as TableIcon
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data }: { data: any } = $props();

	// Modal States
	let isImportModalOpen = $state(false);
	let importEntity = $state<'products' | 'categories' | 'coupons' | 'orders' | 'customers' | 'full_backup'>('products');
	let importEntityLabel = $state('পণ্য তালিকা');
	let updateExisting = $state(true);

	// File Handling State
	let selectedFile = $state<File | null>(null);
	let isAnalyzing = $state(false);
	let isImporting = $state(false);
	let previewData = $state<any>(null);
	let fileInputRef: HTMLInputElement | null = null;

	// Live Sales Summary Modal State
	let isSalesModalOpen = $state(false);
	let isLoadingSales = $state(false);
	let salesItems = $state<any[]>([]);

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
	}

	async function handleFileSelected(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return;
		const file = target.files[0];
		await processFile(file);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
		const file = e.dataTransfer.files[0];
		processFile(file);
	}

	async function processFile(file: File) {
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

			const json = await res.json();
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

			const result = await res.json();
			if (result.success) {
				toast.success(result.message || 'ইমপোর্ট সফল হয়েছে!', { id: toastId });
				closeImportModal();
				setTimeout(() => {
					window.location.reload();
				}, 1200);
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
					<h1 class="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
						ডাটা ব্যাকআপ ও ইমপোর্ট / এক্সপোর্ট
					</h1>
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

				<div class="flex items-center justify-end pt-2 border-t border-slate-100">
					<form method="POST" action="?/seedDatabase" use:enhance>
						<button
							type="submit"
							onclick={(e) => {
								if (!confirm('আপনি কি নিশ্চিত যে স্যাম্পল প্রোডাক্ট দিয়ে ডাটাবেজ রিসেট করতে চান?')) {
									e.preventDefault();
								}
							}}
							class="py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
						>
							<RefreshCw class="w-3.5 h-3.5" />
							<span>D1 ডাটাবেজ সিড করুন</span>
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
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
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
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Modal Body -->
			<div class="p-6 overflow-y-auto space-y-5">
				<!-- Drag & Drop Zone -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					ondragover={(e) => e.preventDefault()}
					ondrop={handleDrop}
					onclick={() => fileInputRef?.click()}
					class="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
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
						<p class="text-xs font-bold text-slate-800">
							{selectedFile ? selectedFile.name : 'ফাইল এখানে ড্রপ করুন অথবা ব্রাউজ করুন'}
						</p>
						<p class="text-[11px] text-slate-400 mt-0.5">
							সমর্থিত ফরম্যাট: .JSON, .CSV (UTF-8)
						</p>
					</div>
				</div>

				<!-- Live Preview Container -->
				{#if previewData}
					<div class="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
						<div class="flex items-center justify-between">
							<span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
								<CheckCircle2 class="w-4 h-4 text-emerald-600" />
								<span>শনাক্তকৃত রেকর্ড: <strong>{previewData.total}</strong> টি</span>
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
									{@html previewData.previewRows[0].description}
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
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
		<div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
			<div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
						<FileSpreadsheet class="w-4 h-4" />
					</div>
					<div>
						<h3 class="text-sm font-black text-slate-900">পণ্য বিক্রয় রিপোর্ট (মোট পিস)</h3>
						<p class="text-[11px] text-slate-400">সর্বোচ্চ বিক্রিত পণ্যের লাইভ হিসেব</p>
					</div>
				</div>

				<button
					type="button"
					onclick={() => (isSalesModalOpen = false)}
					class="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<div class="p-6 overflow-y-auto space-y-4">
				{#if isLoadingSales}
					<div class="py-12 text-center text-slate-400 space-y-2">
						<Loader2 class="w-6 h-6 animate-spin mx-auto text-amber-500" />
						<p class="text-xs font-bold">বিক্রয় রিপোর্ট হিসাব করা হচ্ছে...</p>
					</div>
				{:else if salesItems.length === 0}
					<div class="py-12 text-center text-slate-400 space-y-1 bg-slate-50 rounded-2xl border border-slate-100">
						<FileSpreadsheet class="w-8 h-8 mx-auto text-slate-300" />
						<p class="text-xs font-bold text-slate-600">কোনো সফল বিক্রয় রেকর্ড পাওয়া যায়নি</p>
					</div>
				{:else}
					<div class="overflow-x-auto rounded-xl border border-slate-200">
						<table class="w-full text-xs text-left">
							<thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
								<tr>
									<th class="py-3 px-3.5">পণ্যের নাম</th>
									<th class="py-3 px-3.5 text-center">মোট বিক্রয় (পিস)</th>
									<th class="py-3 px-3.5 text-right">মোট রেভিনিউ</th>
									<th class="py-3 px-3.5 text-center">অর্ডার সংখ্যা</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each salesItems as item}
									<tr class="hover:bg-slate-50/60">
										<td class="py-2.5 px-3.5 font-bold text-slate-900">{item.name}</td>
										<td class="py-2.5 px-3.5 text-center font-mono font-bold text-emerald-600">{item.quantity} পিস</td>
										<td class="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900">৳{Number(item.revenue).toLocaleString('en-US')}</td>
										<td class="py-2.5 px-3.5 text-center font-mono text-slate-500">{item.ordersCount}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>

			<div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
				<span class="text-xs text-slate-500">মোট বিক্রিত পণ্য ধরন: <strong>{salesItems.length}</strong></span>
				<a
					href="/api/admin/data-transfer/export?entity=sales_summary&format=csv"
					download
					class="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
				>
					<Download class="w-3.5 h-3.5" />
					<span>CSV ডাউনলোড</span>
				</a>
			</div>
		</div>
	</div>
{/if}
