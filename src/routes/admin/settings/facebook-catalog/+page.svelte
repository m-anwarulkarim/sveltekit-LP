<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import {
		ArrowLeft,
		CheckCircle2,
		Copy,
		Check,
		Download,
		ExternalLink,
		Layers,
		CheckSquare,
		RotateCw,
		HelpCircle,
		Sparkles,
		ShieldCheck
	} from 'lucide-svelte';
	import {
		Button,
		Input,
		Badge,
		Checkbox,
		Card,
		CardContent,
		Alert,
		AlertTitle,
		AlertDescription
	} from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import type { FacebookCatalogSettings } from '#lib/server/services/catalog.service';

	let { data } = $props();

	// Reactive settings state
	let isEnabled = $state(data?.settings?.isEnabled ?? true);
	let includeOutOfStock = $state(data?.settings?.includeOutOfStock ?? false);
	let catalogMatchKey = $state<'id' | 'sku'>(data?.settings?.catalogMatchKey || 'id');
	let currency = $state(data?.settings?.currency || 'BDT');

	// Synchronize when data changes
	$effect(() => {
		if (data?.settings) {
			isEnabled = data.settings.isEnabled ?? true;
			includeOutOfStock = data.settings.includeOutOfStock ?? false;
			catalogMatchKey = data.settings.catalogMatchKey || 'id';
			currency = data.settings.currency || 'BDT';
		}
	});

	// URL generation
	let siteOrigin = $derived(data?.origin || 'https://aura.com.bd');
	let csvFeedUrl = $derived(`${siteOrigin}/api/feed/facebook-catalog.csv`);
	let xmlFeedUrl = $derived(`${siteOrigin}/api/feed/facebook-catalog.xml`);

	// Active format toggle
	let selectedFormat = $state<'csv' | 'xml'>('csv');
	let activeFeedUrl = $derived(selectedFormat === 'csv' ? csvFeedUrl : xmlFeedUrl);

	// Feedback states
	let isSaving = $state(false);
	let isCopied = $state(false);

	// Handle Copy
	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(activeFeedUrl);
			isCopied = true;
			toast.success('ক্যাটালগ ফিড URL সফলভাবে কপি হয়েছে!');
			setTimeout(() => (isCopied = false), 2500);
		} catch (e) {
			toast.error('ক্লিপবোর্ডে কপি করা যায়নি');
		}
	}

	// Handle Save Action
	async function handleSave() {
		isSaving = true;

		const payload: FacebookCatalogSettings = {
			isEnabled,
			includeOutOfStock,
			catalogMatchKey,
			currency
		};

		const fd = new FormData();
		fd.append('settings', JSON.stringify(payload));

		try {
			const res = await fetch('?/saveSettings', {
				method: 'POST',
				body: fd
			});
			const result = (await res.json()) as any;

			await invalidateAll();
			toast.success('Facebook Catalog সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
		} catch (err: any) {
			console.error('Failed to save catalog settings:', err);
			toast.error('সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে');
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>FB Catalog | AURA Settings</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6 font-['Anek_Bangla',sans-serif] pb-16">

	<!-- Top Navigation Bar & Action -->
	<div class="flex items-center justify-between gap-4 flex-wrap">
		<Button
			variant="outline"
			size="sm"
			href="/admin/settings"
			class="inline-flex items-center gap-2 rounded-xl bg-white border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
		>
			<ArrowLeft class="w-4 h-4 text-slate-500" />
			<span>Back to Settings</span>
		</Button>

		<div class="flex items-center gap-2.5">
			<Button
				variant="outline"
				size="sm"
				href={activeFeedUrl}
				target="_blank"
				class="inline-flex items-center gap-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#1877f2] shadow-2xs"
			>
				<Download class="w-3.5 h-3.5" />
				<span>ফিড ডাউনলোড / প্রিভিউ</span>
			</Button>

			<Button
				type="button"
				variant="default"
				size="sm"
				loading={isSaving}
				onclick={handleSave}
				class="inline-flex items-center gap-2 rounded-xl bg-[#5845eb] hover:bg-[#4734d4] text-white text-xs font-bold shadow-sm shadow-indigo-500/20 active:scale-95"
			>
				<Check class="w-4 h-4 stroke-[3]" />
				<span>সেটিংস সেভ করুন</span>
			</Button>
		</div>
	</div>

	<!-- Main Title Header matching Screenshot -->
	<div>
		<h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">ফেসবুক ক্যাটালগ সেটিংস</h2>
		<p class="text-xs text-slate-500 mt-0.5">Meta Advantage+ Catalog Ads এবং Facebook & Instagram Shop এর জন্য ডাটাফিড কনফিগারেশন</p>
	</div>

	<!-- Main Catalog Activation Box (Pixel-matched to SaleEcom screenshot) -->
	<div class="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">

		<!-- Enable Block with Facebook Logo -->
		<div class="flex items-center justify-between gap-4 pb-5 border-b border-slate-100 flex-wrap">
			<div class="flex items-center gap-3.5">
				<!-- Blue Circular Facebook Logo -->
				<div class="w-12 h-12 rounded-full bg-[#1877f2] flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/25">
					<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
						<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
					</svg>
				</div>
				<div>
					<h3 class="text-base font-bold text-slate-900 leading-tight">Facebook Product Catalog Feed</h3>
					<p class="text-xs text-slate-500 mt-0.5">স্বয়ংক্রিয়ভাবে মেটা ক্যাটালগে আপনার ওয়েবসাইটের প্রোডাক্ট সিঙ্ক করুন</p>
				</div>
			</div>

			<!-- Status Badge -->
			<Badge variant={isEnabled ? 'success' : 'secondary'} class="text-xs font-bold px-3 py-1">
				{isEnabled ? 'Catalog Active' : 'Catalog Paused'}
			</Badge>
		</div>

		<!-- Master Enable Checkbox -->
		<div class="flex items-center gap-3 select-none">
			<label class="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
				<Checkbox bind:checked={isEnabled} id="catalog-enable" class="w-4 h-4 rounded text-[#5845eb] border-slate-300" />
				<span>ক্যাটালগ ডাটাফিড সক্রিয় করুন (Enable Catalog Feed)</span>
			</label>
		</div>

		<!-- Format Selector Tabs (CSV vs XML) -->
		<div class="flex items-center gap-2 pt-1">
			<span class="text-xs font-bold text-slate-600">ফিড ফরম্যাট:</span>
			<button
				type="button"
				onclick={() => (selectedFormat = 'csv')}
				class="px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer {selectedFormat === 'csv'
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'}"
			>
				CSV Format (.csv - Fastest)
			</button>
			<button
				type="button"
				onclick={() => (selectedFormat = 'xml')}
				class="px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer {selectedFormat === 'xml'
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'}"
			>
				XML / RSS Feed (.xml)
			</button>
		</div>

		<!-- Feed URL Input with Blue Copy Button (Matching Screenshot Layout) -->
		<div class="relative space-y-1.5">
			<label class="block text-xs font-bold text-slate-700">ক্যাটালগ ফিড URL (Data Feed URL)</label>
			
			<div class="relative flex items-center">
				<Input
					type="text"
					readonly
					value={activeFeedUrl}
					class="font-mono text-xs h-12 pr-28 rounded-2xl bg-slate-50 border-slate-200/90 text-slate-800 focus:bg-white select-all shadow-2xs"
				/>

				<!-- Bright Blue Copy Button inside input container matching Screenshot -->
				<button
					type="button"
					onclick={handleCopy}
					class="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-[#0052ff] hover:bg-[#0045d8] text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
					title="ক্লিপবোর্ডে কপি করুন"
				>
					{#if isCopied}
						<Check class="w-4 h-4 stroke-[3] text-white animate-in zoom-in" />
						<span class="text-xs font-bold">কপি হয়েছে!</span>
					{:else}
						<Copy class="w-4 h-4 stroke-[2]" />
						<span class="text-xs font-bold">কপি</span>
					{/if}
				</button>
			</div>
			
			<p class="text-[11px] text-slate-400">
				এই URL টি Meta Commerce Manager &gt; Catalog &gt; Data Sources &gt; Data Feed &gt; Scheduled Feed অপশনে পেস্ট করুন।
			</p>
		</div>

		<!-- Stock Filter & Catalog Matching Config -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
			<!-- Include Out of Stock Toggle -->
			<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
				<div>
					<span class="text-xs font-bold text-slate-900 block">আউট-অব-স্টক পণ্য অন্তর্ভুক্ত করুন</span>
					<span class="text-[11px] text-slate-500">স্টক শেষ হওয়া পণ্য ক্যাটালগ ফিডে থাকবে কিনা</span>
				</div>
				<Checkbox bind:checked={includeOutOfStock} id="stock-filter" class="w-4 h-4 rounded text-[#5845eb]" />
			</div>

			<!-- Catalog Match Key (Synchronized with Pixel) -->
			<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
				<div>
					<span class="text-xs font-bold text-slate-900 block">Catalog Matching Key</span>
					<span class="text-[11px] text-slate-500">পিক্সেল ইভেন্টের সাথে আইডি ম্যাচিং</span>
				</div>
				<select
					bind:value={catalogMatchKey}
					class="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#5845eb]"
				>
					<option value="id">Product ID (Database ID)</option>
					<option value="sku">Product SKU</option>
				</select>
			</div>
		</div>

		<!-- Live Diagnostics Summary Bar -->
		<div class="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60 flex items-center justify-between gap-4 flex-wrap text-xs">
			<div class="flex items-center gap-2">
				<Layers class="w-4 h-4 text-[#1877f2]" />
				<span class="font-bold text-blue-950">লাইভ ক্যাটালগ স্ট্যাটাস:</span>
			</div>
			<div class="flex items-center gap-4 text-blue-900 font-medium">
				<span>মোট সক্রিয় পণ্য: <strong class="font-bold font-mono text-slate-900">{data?.diagnostics?.totalPublished ?? 0}</strong> টি</span>
				<span>ইন-স্টক: <strong class="font-bold font-mono text-emerald-700">{data?.diagnostics?.inStockCount ?? 0}</strong> টি</span>
				{#if (data?.diagnostics?.outOfStockCount ?? 0) > 0}
					<span>স্টক আউট: <strong class="font-bold font-mono text-rose-600">{data?.diagnostics?.outOfStockCount}</strong> টি</span>
				{/if}
			</div>
		</div>

	</div>

	<!-- Setup Instruction & Guidance Alert -->
	<Alert variant="default" class="rounded-2xl border-slate-200 bg-white shadow-2xs">
		<HelpCircle class="w-5 h-5 text-indigo-600" />
		<AlertTitle class="font-bold text-slate-900">মেটা কমার্স ম্যানেজারে কীভাবে সেটআপ করবেন?</AlertTitle>
		<AlertDescription class="text-xs text-slate-600 leading-relaxed mt-1 space-y-1">
			<p>১. আপনার <a href="https://business.facebook.com/commerce" target="_blank" rel="noreferrer" class="text-[#1877f2] font-bold underline">Meta Commerce Manager</a> এ লগইন করুন।</p>
			<p>২. আপনার ক্যাটালগ নির্বাচন করে বাম পাশের <strong>Catalog &gt; Data Sources</strong> ট্যাবে যান।</p>
			<p>৩. <strong>Data Feed (Scheduled Feed)</strong> নির্বাচন করে উপরের <strong>কপি করা ফিড URL</strong> টি বসান এবং শিডিউল হিসেবে <strong>Hourly</strong> বা <strong>Daily</strong> সিলেক্ট করুন।</p>
			<p>৪. মেটা স্বয়ংক্রিয়ভাবে আপনার সাইট থেকে সব পণ্য, ছবি, দাম ও স্টক সিঙ্ক করে নেবে।</p>
		</AlertDescription>
	</Alert>

</div>
