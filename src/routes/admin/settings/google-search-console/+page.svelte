<script lang="ts">
	import { Button } from '#lib/components/ui/button';
	import {
		ArrowLeft,
		Save,
		Check,
		Loader2,
		ExternalLink,
		Globe,
		Search,
		ShieldCheck,
		FileCode,
		Copy,
		CheckCheck
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { data }: { data: any } = $props();

	let verificationToken = $state(data?.googleConsole?.verificationToken ?? '');
	let isSaving = $state(false);
	let copiedSitemap = $state(false);

	$effect(() => {
		if (data?.googleConsole) {
			verificationToken = data.googleConsole.verificationToken ?? '';
		}
	});

	function copyToClipboard(text: string) {
		if (typeof navigator !== 'undefined') {
			navigator.clipboard.writeText(text);
			copiedSitemap = true;
			toast.success('সাইটম্যাপ ইউআরএল কপি করা হয়েছে!');
			setTimeout(() => {
				copiedSitemap = false;
			}, 2500);
		}
	}
</script>

<svelte:head>
	<title>Google Search Console & SEO Settings | Haq Plus Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-7 max-w-5xl mx-auto font-['Anek_Bangla',sans-serif]">
	<!-- Top Sub-Header Bar -->
	<div class="flex items-center justify-between gap-4 pb-2">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb] shadow-2xs">
				<Search class="w-5 h-5 stroke-[2.2]" />
			</div>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
					Google Search Console & SEO
				</h1>
				<p class="text-xs text-slate-500">
					গুগল সার্চ ইঞ্জিন ইনডেক্সিং, সাইটম্যাপ ও মেটা ডোমেন ভেরিফিকেশন সেটিংস
				</p>
			</div>
		</div>

		<div>
			<a
				href="/admin/settings"
				class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all"
			>
				<ArrowLeft class="w-4 h-4 text-slate-500" />
				<span>সেটিংস তালিকায় ফিরুন</span>
			</a>
		</div>
	</div>

	<!-- Main Form containing Configuration Cards -->
	<form
		method="POST"
		action="?/saveSettings"
		use:enhance={() => {
			isSaving = true;
			return async ({ result, update }) => {
				isSaving = false;
				if (result.type === 'success') {
					toast.success('SEO ও ভেরিফিকেশন সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
				} else {
					toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
				}
				await update();
			};
		}}
		class="space-y-6 max-w-3xl"
	>
		<!-- CARD 1: Google Search Console Verification Card -->
		<div class="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-5">
			<!-- Header with blue checkmark badge -->
			<div class="flex items-start gap-3.5">
				<div class="w-10 h-10 rounded-2xl bg-[#1877f2]/10 border border-[#1877f2]/20 flex items-center justify-center text-[#1877f2] shrink-0 shadow-2xs">
					<Check class="w-5 h-5 stroke-[2.5]" />
				</div>
				<div>
					<h3 class="text-sm sm:text-base font-bold text-slate-900">
						Google Search Console ভেরিফিকেশন
					</h3>
					<p class="text-xs text-slate-500 mt-0.5">
						গুগল সার্চ কনসোল থেকে প্রাপ্ত HTML Tag মেটা কোড বা ভেরিফিকেশন টোকেনটি এখানে দিন
					</p>
				</div>
			</div>

			<!-- Floating Label Outlined Input Box -->
			<div class="space-y-1.5">
				<label class="block text-xs font-bold text-slate-700">
					গুগল সাইট ভেরিফিকেশন টোকেন (Google Site Verification Token)
				</label>
				<div class="relative rounded-2xl border border-slate-300 hover:border-slate-400 focus-within:border-[#5845eb] focus-within:ring-2 focus-within:ring-[#5845eb]/10 bg-white transition-all">
					<input
						type="text"
						name="verificationToken"
						bind:value={verificationToken}
						placeholder="যেমন: abc123xyz456... অথবা পুরো <meta name='google-site-verification' content='...' />"
						class="w-full px-4 py-3 text-xs font-mono font-medium text-slate-900 bg-transparent rounded-2xl focus:outline-none"
					/>
				</div>
				<p class="text-[11px] text-slate-400 pl-1">
					💡 আপনি সরাসরি সম্পূর্ণ HTML meta tag পেস্ট করলেও সিস্টেম স্বয়ংক্রিয়ভাবে ভেতরের টোকেন আলাদা করে নেবে।
				</p>
			</div>

			<!-- Meta / Facebook Domain Verification Notice & Link -->
			<div class="pt-3 border-t border-slate-100">
				<div class="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between gap-3">
					<div class="space-y-0.5">
						<div class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
							<span>Meta / Facebook Domain Verification</span>
						</div>
						<p class="text-[11px] text-slate-500">
							ফেসবুক বিজনেস ম্যানেজারের ডোমেন ভেরিফিকেশন করার জন্য নির্ধারিত আলাদা পেজ রয়েছে।
						</p>
					</div>
					<a
						href="/admin/settings/facebook-domain-verification"
						class="shrink-0 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-indigo-200 text-[#5845eb] text-xs font-bold transition-all shadow-2xs hover:shadow-xs inline-flex items-center gap-1.5"
					>
						<span>সেটিংস পেজে যান</span>
						<ExternalLink class="w-3.5 h-3.5" />
					</a>
				</div>
			</div>

			<!-- Save Button -->
			<div class="pt-2">
				<Button
					type="submit"
					disabled={isSaving}
					class="w-full bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold h-11 px-5 rounded-2xl shadow-xs text-xs gap-2 cursor-pointer transition-all inline-flex items-center justify-center"
				>
					{#if isSaving}
						<Loader2 class="w-4 h-4 animate-spin" />
						<span>সংরক্ষণ হচ্ছে...</span>
					{:else}
						<Save class="w-4 h-4" />
						<span>সেটিংস সেভ করুন</span>
					{/if}
				</Button>
			</div>
		</div>

		<!-- CARD 2: Live Sitemap & Robots Status -->
		<div class="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
			<div class="flex items-center gap-2.5">
				<div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
					<FileCode class="w-4 h-4 stroke-[2]" />
				</div>
				<div>
					<h3 class="text-sm font-bold text-slate-900">
						লাইভ XML সাইটম্যাপ ও রোবটস ডট টিএক্সটি
					</h3>
					<p class="text-[11px] text-slate-500">
						গুগল সার্চ কনসোলে সাইটম্যাপ সাবমিট করার জন্য নিচের লিংকটি ব্যবহার করুন
					</p>
				</div>
			</div>

			<!-- Sitemap URL Box -->
			<div class="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div class="space-y-0.5">
					<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
						XML Sitemap URL
					</span>
					<div class="text-xs font-mono font-bold text-slate-800 break-all">
						/sitemap.xml
					</div>
				</div>

				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/sitemap.xml`)}
						class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
					>
						{#if copiedSitemap}
							<CheckCheck class="w-3.5 h-3.5 text-emerald-600" />
							<span class="text-emerald-600">কপি হয়েছে</span>
						{:else}
							<Copy class="w-3.5 h-3.5" />
							<span>লিংক কপি করুন</span>
						{/if}
					</button>

					<a
						href="/sitemap.xml"
						target="_blank"
						class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
					>
						<span>সাইটম্যাপ দেখুন</span>
						<ExternalLink class="w-3.5 h-3.5" />
					</a>
				</div>
			</div>

			<!-- Robots.txt Box -->
			<div class="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
				<div>
					<span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Robots.txt</span>
					<div class="text-xs font-mono font-bold text-slate-800">/robots.txt</div>
				</div>
				<a
					href="/robots.txt"
					target="_blank"
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
				>
					<span>রোবটস ফাইল দেখুন</span>
					<ExternalLink class="w-3.5 h-3.5" />
				</a>
			</div>
		</div>

		<!-- CARD 3: Step-by-Step Google Setup Guide -->
		<div class="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
			<div class="flex items-center gap-2.5">
				<div class="w-8 h-8 rounded-xl bg-blue-50 text-[#1877f2] flex items-center justify-center">
					<ShieldCheck class="w-4 h-4 stroke-[2]" />
				</div>
				<div>
					<h3 class="text-sm font-bold text-slate-900">
						গুগল সার্চ কনসোল সেটআপের সহজ ৩টি ধাপ
					</h3>
					<p class="text-[11px] text-slate-500">
						কীভাবে আপনার ওয়েবসাইট গুগলে ভেরিফাই ও ইনডেক্স করবেন
					</p>
				</div>
			</div>

			<!-- Step 1 -->
			<div class="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-1.5 transition-colors hover:bg-slate-50">
				<div class="text-xs font-bold text-[#1877f2] flex items-center gap-2">
					<span class="w-5 h-5 rounded-full bg-[#1877f2] text-white inline-flex items-center justify-center text-[11px]">১</span>
					<span>গুগল সার্চ কনসোলে ওয়েবসাইট যোগ করুন</span>
				</div>
				<p class="text-xs text-slate-600 pl-7 leading-relaxed">
					গুগল সার্চ কনসোলে আপনার জিমেইল দিয়ে লগইন করে <strong>"URL prefix"</strong> অপশনে আপনার ডোমেন দিন (যেমন: <code class="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">https://seedbd.shop</code>)।
				</p>
				<div class="pl-7 pt-1">
					<a
						href="https://search.google.com/search-console"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 text-xs font-bold text-[#1877f2] hover:underline"
					>
						<span>Google Search Console খুলুন</span>
						<ExternalLink class="w-3.5 h-3.5" />
					</a>
				</div>
			</div>

			<!-- Step 2 -->
			<div class="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-1.5 transition-colors hover:bg-slate-50">
				<div class="text-xs font-bold text-[#1877f2] flex items-center gap-2">
					<span class="w-5 h-5 rounded-full bg-[#1877f2] text-white inline-flex items-center justify-center text-[11px]">২</span>
					<span>HTML Tag ভেরিফিকেশন কোড পেস্ট করুন</span>
				</div>
				<p class="text-xs text-slate-600 pl-7 leading-relaxed">
					ভেরিফিকেশন অপশন থেকে <strong>"HTML tag"</strong> সিলেক্ট করুন। সেখানে পাওয়া মেটা কোডটি কপি করে উপরের বক্সে পেস্ট করে <strong>"সেটিংস সেভ করুন"</strong> বাটনে চাপ দিন। এরপর সার্চ কনসোলে গিয়ে <strong>"Verify"</strong> বাটনে ক্লিক করুন।
				</p>
			</div>

			<!-- Step 3 -->
			<div class="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-1.5 transition-colors hover:bg-slate-50">
				<div class="text-xs font-bold text-[#1877f2] flex items-center gap-2">
					<span class="w-5 h-5 rounded-full bg-[#1877f2] text-white inline-flex items-center justify-center text-[11px]">৩</span>
					<span>সাইটম্যাপ (Sitemaps) সাবমিট করুন</span>
				</div>
				<p class="text-xs text-slate-600 pl-7 leading-relaxed">
					ভেরিফিকেশন সম্পন্ন হলে সার্চ কনসোলের বাম পাশের মেনু থেকে <strong>"Sitemaps"</strong> অপশনে যান। ইনপুট বক্সে শুধু <code class="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-emerald-700 text-[11px]">sitemap.xml</code> লিখে সাবমিট করুন। গুগল স্বয়ংক্রিয়ভাবে আপনার সব ল্যান্ডিং পেজ ও প্রোডাক্ট পেজ ইনডেক্স করা শুরু করবে।
				</p>
			</div>
		</div>
	</form>
</div>
