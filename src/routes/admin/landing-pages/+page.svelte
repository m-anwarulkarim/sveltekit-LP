<script lang="ts">
	import { Button, Input, Card, Badge, Dialog } from '#lib/components/ui';
	import {
		Globe,
		RefreshCw,
		Search,
		Package,
		Link2,
		Copy,
		ExternalLink,
		QrCode,
		CheckCircle2,
		Sparkles,
		X
	} from 'lucide-svelte';

	let searchQuery = $state('');
	let isRefreshing = $state(false);

	// Toast Feedback State
	let toastMessage = $state<string | null>(null);
	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => (toastMessage = null), 2500);
	}

	// QR Code Modal State
	let activeQrLanding = $state<any | null>(null);
	let isQrModalOpen = $state(false);

	// Landing Pages Data (Matching Reference Screenshot)
	let landingPages = $state([
		{
			id: 'lp-pudina',
			tag: 'জনপ্রিয় পেজ',
			tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
			sku: 'VAG-1534',
			skuColor: 'bg-emerald-700 text-white',
			title: 'হাইব্রিড পুদিনা পাতার বীজ ল্যান্ডিং পেজ',
			description: 'স্পেশাল প্যাকেজ অফার, কাউন্টডাউন টাইমার ও রিভিউ সহ প্রিমিয়াম পুদিনা ল্যান্ডিং পেজ',
			productName: 'প্রোডাক্ট লোড হচ্ছে...',
			price: '৳০',
			url: 'https://agroseed.bd/lp/pudina',
			livePath: '/',
			altPath: '/lp/pudina-pata'
		},
		{
			id: 'lp-cosmos',
			tag: 'ফুলের স্পেশাল',
			tagColor: 'bg-rose-50 text-rose-600 border-rose-200',
			sku: 'FUL-1502',
			skuColor: 'bg-emerald-700 text-white',
			title: 'চায়না ইম্পোর্টেড হাইব্রিড কসমস ফুলের বীজ ল্যান্ডিং পেজ',
			description: 'মিক্স কালার কসমস ফুলের জন্য কালারফুল রিচ ডিজাইন ল্যান্ডিং পেজ',
			productName: 'প্রোডাক্ট লোড হচ্ছে...',
			price: '৳০',
			url: 'https://agroseed.bd/lp/cosmos',
			livePath: '/',
			altPath: null
		},
		{
			id: 'lp-mint',
			tag: 'ফাস্ট অর্ডার',
			tagColor: 'bg-blue-50 text-blue-600 border-blue-200',
			sku: 'VAG-1534',
			skuColor: 'bg-emerald-700 text-white',
			title: 'মিন্ট লিফ বীজ সিঙ্গেল অর্ডার ল্যান্ডিং পেজ',
			description: 'সহজ ও দ্রুত অর্ডারের জন্য ক্লাসিক্যাল মিন্ট সিড ল্যান্ডিং পেজ',
			productName: 'প্রোডাক্ট লোড হচ্ছে...',
			price: '৳০',
			url: 'https://agroseed.bd/lp/mint-leaf-seeds',
			livePath: '/',
			altPath: '/mint-leaf-seeds'
		}
	]);

	// Filtered Landing Pages
	let filteredPages = $derived(
		landingPages.filter((lp) => {
			if (!searchQuery.trim()) return true;
			const query = searchQuery.toLowerCase();
			return (
				lp.title.toLowerCase().includes(query) ||
				lp.sku.toLowerCase().includes(query) ||
				lp.url.toLowerCase().includes(query) ||
				(lp.altPath && lp.altPath.toLowerCase().includes(query))
			);
		})
	);

	function copyToClipboard(url: string) {
		navigator.clipboard.writeText(url);
		showToast('ল্যান্ডিং পেজ লিঙ্ক কপি করা হয়েছে!');
	}

	function handleRefresh() {
		isRefreshing = true;
		setTimeout(() => {
			isRefreshing = false;
			showToast('ল্যান্ডিং পেজ ডেটা সফলভাবে রিফ্রেশ হয়েছে!');
		}, 600);
	}

	function openQrModal(lp: any) {
		activeQrLanding = lp;
		isQrModalOpen = true;
	}
</script>

<svelte:head>
	<title>ল্যান্ডিং পেজসমূহ | Landing Pages</title>
</svelte:head>

<!-- Toast Feedback -->
{#if toastMessage}
	<div class="fixed bottom-24 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs font-bold">
		<CheckCircle2 class="w-4 h-4 text-emerald-400" />
		<span>{toastMessage}</span>
	</div>
{/if}

<div class="space-y-6 max-w-7xl mx-auto font-['Hind_Siliguri',sans-serif]">
	
	<!-- ============================================== -->
	<!-- 1. TOP HEADER BANNER (Matching Screenshot)     -->
	<!-- ============================================== -->
	<div class="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		
		<div class="flex items-start gap-4">
			<!-- Green Globe Icon Container -->
			<div class="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
				<Globe class="w-5 h-5" />
			</div>

			<!-- Title & Badge -->
			<div class="space-y-1">
				<div class="flex items-center gap-3 flex-wrap">
					<h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">ল্যান্ডিং পেজসমূহ</h2>
					<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
						{landingPages.length} টি পেজ
					</span>
				</div>
				<p class="text-xs text-slate-500 leading-relaxed">
					ওয়েবসাইটের সকল স্পেশাল ল্যান্ডিং পেজের লিঙ্ক, প্রোডাক্ট তথ্য ও লাইভ প্রিভিউ এখান থেকে দেখুন এবং কপি করুন।
				</p>
			</div>
		</div>

		<!-- Refresh Button -->
		<button
			type="button"
			onclick={handleRefresh}
			class="px-4 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-95 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-2xs cursor-pointer self-start sm:self-center transition-all"
		>
			<RefreshCw class="w-3.5 h-3.5 {isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'}" />
			<span>রিফ্রেশ</span>
		</button>
	</div>

	<!-- ============================================== -->
	<!-- 2. SEARCH INPUT (Matching Screenshot)          -->
	<!-- ============================================== -->
	<div class="relative max-w-md">
		<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
		<input
			type="text"
			placeholder="ল্যান্ডিং পেজের নাম, পাথ বা SKU দিয়ে খুঁজুন..."
			bind:value={searchQuery}
			class="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all"
		/>
	</div>

	<!-- ============================================== -->
	<!-- 3. LANDING PAGE CARDS GRID (Exact Replica)     -->
	<!-- ============================================== -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
		{#each filteredPages as lp (lp.id)}
			<div class="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between gap-5 hover:shadow-md transition-shadow">
				
				<!-- Top Content Section -->
				<div class="space-y-4">
					
					<!-- Tag & SKU Badge Header Row -->
					<div class="flex items-center justify-between gap-2">
						<span class="px-3 py-1 rounded-full text-[11px] font-bold border {lp.tagColor}">
							{lp.tag}
						</span>

						<span class="px-3 py-1 rounded-full text-[11px] font-mono font-bold {lp.skuColor} shadow-2xs">
							SKU: {lp.sku}
						</span>
					</div>

					<!-- Title & Description -->
					<div class="space-y-1.5 pt-1">
						<h3 class="font-black text-slate-900 text-base sm:text-lg leading-snug">
							{lp.title}
						</h3>
						<p class="text-xs text-slate-500 leading-relaxed">
							{lp.description}
						</p>
					</div>

					<!-- Product Box (Box Icon + Name & Price) -->
					<div class="border border-slate-100 bg-slate-50/70 rounded-2xl p-3.5 flex items-center gap-3">
						<div class="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 shrink-0 shadow-2xs">
							<Package class="w-5 h-5 text-slate-600" />
						</div>
						<div class="min-w-0">
							<div class="text-xs font-bold text-slate-800 truncate">{lp.productName}</div>
							<div class="text-xs font-bold text-emerald-600 mt-0.5">{lp.price}</div>
						</div>
					</div>

					<!-- Landing Page URL Section -->
					<div class="space-y-1.5 pt-1">
						<span class="text-[11px] font-semibold text-slate-400 block">ল্যান্ডিং পেজ URL</span>
						<div class="bg-slate-50/80 border border-slate-200/80 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-mono text-slate-700 truncate shadow-inner">
							<Link2 class="w-3.5 h-3.5 text-slate-400 shrink-0" />
							<span class="truncate">{lp.url}</span>
						</div>
						{#if lp.altPath}
							<div class="text-[11px] text-slate-400 font-mono">
								বিকল্প পাথ: <span class="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{lp.altPath}</span>
							</div>
						{/if}
					</div>

				</div>

				<!-- Bottom 3 Action Buttons (Matching Screenshot) -->
				<div class="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
					
					<!-- 1. কপি লিঙ্ক -->
					<button
						type="button"
						onclick={() => copyToClipboard(lp.url)}
						class="py-2 px-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-95 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all"
						title="ক্লিপবোর্ডে কপি করুন"
					>
						<Copy class="w-3.5 h-3.5 text-slate-500" />
						<span>কপি লিঙ্ক</span>
					</button>

					<!-- 2. ভিজিট -->
					<a
						href={lp.livePath}
						target="_blank"
						class="py-2 px-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-95 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all"
						title="লাইভ প্রিভিউ দেখুন"
					>
						<ExternalLink class="w-3.5 h-3.5 text-slate-500" />
						<span>ভিজিট</span>
					</a>

					<!-- 3. QR কোড -->
					<button
						type="button"
						onclick={() => openQrModal(lp)}
						class="py-2 px-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-95 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all"
						title="QR কোড প্রদর্শন"
					>
						<QrCode class="w-3.5 h-3.5 text-slate-500" />
						<span>QR কোড</span>
					</button>

				</div>

			</div>
		{/each}
	</div>

</div>

<!-- QR Code Modal Dialog -->
<Dialog bind:open={isQrModalOpen} title="ল্যান্ডিং পেজ QR কোড">
	{#if activeQrLanding}
		<div class="space-y-4 py-2 text-center">
			
			<div class="space-y-1">
				<h4 class="font-bold text-slate-900 text-sm">{activeQrLanding.title}</h4>
				<p class="text-xs text-slate-500 font-mono">{activeQrLanding.url}</p>
			</div>

			<!-- QR Code Box -->
			<div class="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center shadow-inner">
				<img
					src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(activeQrLanding.url)}`}
					alt="QR Code"
					class="w-full h-full object-contain"
				/>
			</div>

			<p class="text-xs text-slate-500">
				ক্যামেরা দিয়ে স্ক্যান করে সরাসরি ল্যান্ডিং পেজে প্রবেশ করুন।
			</p>

			<div class="flex items-center justify-center gap-2 pt-2">
				<Button type="button" variant="outline" onclick={() => (isQrModalOpen = false)}>
					বন্ধ করুন
				</Button>
				<Button
					type="button"
					onclick={() => copyToClipboard(activeQrLanding.url)}
					class="bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold"
				>
					লিঙ্ক কপি করুন
				</Button>
			</div>

		</div>
	{/if}
</Dialog>
