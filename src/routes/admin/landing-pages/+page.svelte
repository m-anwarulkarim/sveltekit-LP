<script lang="ts">
	import { Button, Input, Card, Badge, Dialog } from '#lib/components/ui';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';
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
		Plus,
		Trash2,
		Eye,
		Flame,
		Tag,
		Clock,
		ShoppingBag,
		Loader2,
		ArrowRight,
		Edit
	} from 'lucide-svelte';

	interface Props {
		data: {
			landingPages: any[];
			products: any[];
		};
	}

	let { data }: Props = $props();

	let searchQuery = $state('');
	let isRefreshing = $state(false);

	// QR Code Modal State
	let activeQrLanding = $state<any | null>(null);
	let isQrModalOpen = $state(false);

	// Filtered Landing Pages
	let filteredPages = $derived(
		(data?.landingPages || []).filter((lp: any) => {
			if (!searchQuery.trim()) return true;
			const query = searchQuery.toLowerCase();
			return (
				lp.title?.toLowerCase().includes(query) ||
				lp.sku?.toLowerCase().includes(query) ||
				lp.slug?.toLowerCase().includes(query) ||
				lp.tag?.toLowerCase().includes(query)
			);
		})
	);

	function copyToClipboard(urlPath: string) {
		const fullUrl = `${window.location.origin}${urlPath}`;
		navigator.clipboard.writeText(fullUrl);
		toast.success('ল্যান্ডিং পেজ লিঙ্ক কপি করা হয়েছে!');
	}

	function handleRefresh() {
		isRefreshing = true;
		window.location.reload();
	}

	function openQrModal(lp: any) {
		activeQrLanding = lp;
		isQrModalOpen = true;
	}

	async function handleDelete(lp: any) {
		const confirmed = await confirmModal({
			title: 'ল্যান্ডিং পেজ ডিলিট নিশ্চিতকরণ',
			message: `আপনি কি "${lp.title}" ল্যান্ডিং পেজটি মুছে ফেলতে চান?`,
			confirmText: 'হ্যাঁ, ডিলিট করুন',
			variant: 'destructive',
			icon: 'alert'
		});

		if (confirmed) {
			try {
				const fd = new FormData();
				fd.append('id', lp.id);
				const res = await fetch('?/delete', {
					method: 'POST',
					body: fd
				});
				if (res.ok) {
					toast.success('ল্যান্ডিং পেজ সফলভাবে মুছে ফেলা হয়েছে');
					window.location.reload();
				} else {
					toast.error('ডিলিট করতে ব্যর্থ হয়েছে');
				}
			} catch {
				toast.error('নেটওয়ার্ক ত্রুটি');
			}
		}
	}
</script>

<svelte:head>
	<title>ল্যান্ডিং পেজসমূহ | Landing Pages Manager</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto font-['Anek_Bangla',sans-serif] pb-12">
	
	<!-- 1. TOP HEADER BANNER -->
	<div class="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-start gap-4">
			<div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
				<Globe class="w-6 h-6" />
			</div>

			<div class="space-y-1">
				<div class="flex items-center gap-3 flex-wrap">
					<h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">ল্যান্ডিং পেজসমূহ</h2>
					<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
						{data?.landingPages?.length || 0} টি পেজ প্রস্তুত
					</span>
				</div>
				<p class="text-xs text-slate-500 leading-relaxed">
					প্রোডাক্টভিত্তিক কাস্টম হাই-কনভার্সন অ্যানিমেটেড ল্যান্ডিং পেজ তৈরি, লাইভ লিঙ্ক ও সেলস ট্র্যাক করুন।
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2.5 self-start sm:self-center">
			<!-- Refresh Button -->
			<button
				type="button"
				onclick={handleRefresh}
				class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
				title="রিফ্রেশ করুন"
			>
				<RefreshCw class="w-3.5 h-3.5 {isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'}" />
				<span>রিফ্রেশ</span>
			</button>

			<!-- Create Landing Page Button (Primary Action - Link to Dedicated Page) -->
			<Button
				href="/admin/landing-pages/new"
				class="bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-2"
			>
				<Plus class="w-4 h-4 stroke-[2.5]" />
				<span>নতুন ল্যান্ডিং পেজ তৈরি করুন</span>
			</Button>
		</div>
	</div>

	<!-- 2. SEARCH INPUT & QUICK STATS -->
	<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
		<div class="relative w-full sm:max-w-md">
			<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
			<input
				type="text"
				placeholder="ল্যান্ডিং পেজের নাম, স্লাগ বা SKU দিয়ে খুঁজুন..."
				bind:value={searchQuery}
				class="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all"
			/>
		</div>

		<div class="flex items-center gap-2 text-xs font-bold text-slate-500">
			<span>টেমপ্লেট স্টাইল:</span>
			<span class="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
				Style 1: Modern Animated High-Conversion
			</span>
		</div>
	</div>

	<!-- 3. LANDING PAGE CARDS GRID -->
	{#if filteredPages.length === 0}
		<div class="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
			<Globe class="w-12 h-12 text-slate-300 mx-auto" />
			<h3 class="text-base font-bold text-slate-800">কোনো ল্যান্ডিং পেজ পাওয়া যায়নি</h3>
			<p class="text-xs text-slate-500 max-w-sm mx-auto">
				নতুন ল্যান্ডিং পেজ তৈরি করতে উপরের "নতুন ল্যান্ডিং পেজ তৈরি করুন" বাটনে ক্লিক করুন।
			</p>
			<Button
				type="button"
				onclick={() => (isCreateModalOpen = true)}
				class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs mt-2"
			>
				<Plus class="w-4 h-4 mr-1.5" />
				<span>প্রথম ল্যান্ডিং পেজ তৈরি করুন</span>
			</Button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
			{#each filteredPages as lp (lp.id)}
				<div class="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between gap-5 hover:shadow-md transition-all">
					
					<!-- Top Content Section -->
					<div class="space-y-4">
						<!-- Tag & SKU Badge Header Row -->
						<div class="flex items-center justify-between gap-2">
							<span class="px-3 py-1 rounded-full text-[11px] font-bold border bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1">
								<Flame class="w-3 h-3 text-rose-500" />
								<span>{lp.tag || 'স্পেশাল পেজ'}</span>
							</span>

							<span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-white shadow-2xs">
								SKU: {lp.sku || 'LP-READY'}
							</span>
						</div>

						<!-- Title & Description -->
						<div class="space-y-1.5 pt-1">
							<h3 class="font-black text-slate-900 text-base sm:text-lg leading-snug line-clamp-2">
								{lp.title}
							</h3>
							<p class="text-xs text-slate-500 leading-relaxed line-clamp-2">
								{lp.config?.subheadline || lp.metaDescription || 'হাই-কনভার্সন অ্যানিমেটেড ল্যান্ডিং পেজ'}
							</p>
						</div>

						<!-- Connected Product Box -->
						<div class="border border-slate-100 bg-slate-50/70 rounded-2xl p-3.5 flex items-center gap-3">
							{#if lp.product?.parsedImages?.[0] || lp.product?.image}
								<img
									src={lp.product?.parsedImages?.[0] || lp.product?.image}
									alt="Thumb"
									class="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
								/>
							{:else}
								<div class="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 shrink-0 shadow-2xs">
									<Package class="w-5 h-5 text-slate-600" />
								</div>
							{/if}
							<div class="min-w-0">
								<div class="text-xs font-bold text-slate-800 truncate">
									{lp.product?.name || lp.config?.headline || lp.title}
								</div>
								<div class="text-xs font-black text-emerald-600 mt-0.5">
									৳{(lp.config?.customPrice || lp.product?.price || 1200).toLocaleString('en-BD')}
								</div>
							</div>
						</div>

						<!-- Stats & Live URL Section -->
						<div class="space-y-2 pt-1">
							<div class="flex items-center justify-between text-xs text-slate-500 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
								<span class="flex items-center gap-1">
									<Eye class="w-3.5 h-3.5 text-slate-400" />
									<span>ভিউ: <strong>{lp.views || 0}</strong></span>
								</span>
								<span class="px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 font-bold text-[10px]">
									Style 1: Animated
								</span>
							</div>

							<div>
								<span class="text-[11px] font-semibold text-slate-400 block mb-1">লাইভ ল্যান্ডিং লিঙ্ক</span>
								<div class="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-mono text-slate-700 truncate shadow-inner">
									<Link2 class="w-3.5 h-3.5 text-slate-400 shrink-0" />
									<span class="truncate">/lp/{lp.slug}</span>
								</div>
							</div>
						</div>

					</div>

					<!-- Bottom Action Buttons: Edit, Visit, Copy, QR, Delete -->
					<div class="grid grid-cols-5 gap-1.5 pt-3 border-t border-slate-100">
						<!-- 1. এডিট বাটন (Dedicated Edit Page) -->
						<a
							href={`/admin/landing-pages/${lp.id}/edit`}
							class="py-2 px-1 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-xs font-bold text-[#5845eb] flex items-center justify-center gap-1 shadow-2xs transition-all"
							title="সম্পাদনা করুন"
						>
							<Edit class="w-3.5 h-3.5" />
							<span>এডিট</span>
						</a>

						<!-- 2. প্রিভিউ ভিজিট -->
						<a
							href={`/lp/${lp.slug}`}
							target="_blank"
							class="py-2 px-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center justify-center gap-1 shadow-2xs transition-all"
							title="লাইভ প্রিভিউ দেখুন"
						>
							<ExternalLink class="w-3.5 h-3.5 text-emerald-600" />
							<span>ভিজিট</span>
						</a>

						<!-- 3. কপি লিঙ্ক -->
						<button
							type="button"
							onclick={() => copyToClipboard(`/lp/${lp.slug}`)}
							class="py-2 px-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center justify-center gap-1 shadow-2xs cursor-pointer transition-all"
							title="লিঙ্ক কপি করুন"
						>
							<Copy class="w-3.5 h-3.5 text-slate-500" />
							<span>কপি</span>
						</button>

						<!-- 4. QR কোড -->
						<button
							type="button"
							onclick={() => openQrModal(lp)}
							class="py-2 px-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center justify-center gap-1 shadow-2xs cursor-pointer transition-all"
							title="QR কোড দেখুন"
						>
							<QrCode class="w-3.5 h-3.5 text-slate-500" />
							<span>QR</span>
						</button>

						<!-- 5. ডিলিট বাটন -->
						<button
							type="button"
							onclick={() => handleDelete(lp)}
							class="py-2 px-1 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 flex items-center justify-center gap-1 text-xs font-bold shadow-2xs cursor-pointer transition-all"
							title="মুছে ফেলুন"
						>
							<Trash2 class="w-3.5 h-3.5" />
						</button>
					</div>

				</div>
			{/each}
		</div>
	{/if}

</div>

<!-- QR Code Modal Dialog -->
<Dialog bind:open={isQrModalOpen} title="ল্যান্ডিং পেজ QR কোড">
	{#if activeQrLanding}
		<div class="space-y-4 py-2 text-center font-['Anek_Bangla',sans-serif]">
			<div class="space-y-1">
				<h4 class="font-bold text-slate-900 text-sm">{activeQrLanding.title}</h4>
				<p class="text-xs text-slate-500 font-mono">/lp/{activeQrLanding.slug}</p>
			</div>

			<!-- QR Code Box -->
			<div class="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center shadow-inner">
				<img
					src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
						typeof window !== 'undefined'
							? `${window.location.origin}/lp/${activeQrLanding.slug}`
							: `/lp/${activeQrLanding.slug}`
					)}`}
					alt="QR Code"
					class="w-full h-full object-contain"
				/>
			</div>

			<p class="text-xs text-slate-500">
				স্মার্টফোন ক্যামেরা দিয়ে স্ক্যান করে সরাসরি ল্যান্ডিং পেজে প্রবেশ করুন।
			</p>

			<div class="flex items-center justify-center gap-2 pt-2">
				<Button type="button" variant="outline" onclick={() => (isQrModalOpen = false)}>
					বন্ধ করুন
				</Button>
				<Button
					type="button"
					onclick={() => copyToClipboard(`/lp/${activeQrLanding.slug}`)}
					class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
				>
					লিঙ্ক কপি করুন
				</Button>
			</div>
		</div>
	{/if}
</Dialog>
