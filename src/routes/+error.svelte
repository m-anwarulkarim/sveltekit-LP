<script lang="ts">
	import { page } from '$app/state';
	import { StoreLayout } from '#lib';
	import { Button, Badge, Card, CardContent } from '#lib/components/ui';
	import {
		Compass,
		Home,
		Search,
		RotateCcw,
		HelpCircle,
		Flame,
		PackageCheck,
		ArrowLeft,
		AlertTriangle,
		ShieldAlert,
		PhoneCall,
		MessageSquare
	} from 'lucide-svelte';

	let { data }: { data?: any } = $props();

	let status = $derived(page.status ?? 404);
	let message = $derived(page.error?.message || (status === 404 ? 'Page Not Found' : 'Something went wrong on our servers.'));
	let is404 = $derived(status === 404);
	let isAdminPath = $derived(page.url.pathname.startsWith('/admin'));

	function handleReload() {
		if (typeof window !== 'undefined') {
			window.location.reload();
		}
	}

	function handleGoBack() {
		if (typeof window !== 'undefined') {
			window.history.back();
		}
	}
</script>

<svelte:head>
	<title>{status} - {is404 ? 'পেজটি খুঁজে পাওয়া যায়নি | Page Not Found' : 'সিস্টেম এরর | System Error'} | AURA</title>
</svelte:head>

{#if isAdminPath}
	<!-- Admin Fallback Error Canvas (if layout didn't catch) -->
	<div class="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4 font-['Hind_Siliguri',sans-serif]">
		<Card class="max-w-xl w-full border-slate-200 shadow-xl bg-white rounded-2xl overflow-hidden">
			<div class="h-2 bg-gradient-to-r from-red-500 via-amber-500 to-[#5845eb]"></div>
			<CardContent class="p-8 text-center space-y-6">
				<div class="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto shadow-inner">
					<ShieldAlert class="w-8 h-8" />
				</div>

				<div class="space-y-2">
					<Badge variant="outline" class="bg-red-50 text-red-600 border-red-200 font-mono px-3 py-1 text-xs">
						ADMIN ERROR {status}
					</Badge>
					<h1 class="text-2xl font-bold text-slate-900 tracking-tight">
						{is404 ? 'অ্যাডমিন মডিউলটি খুঁজে পাওয়া যায়নি' : 'ড্যাশবোর্ড সিস্টেমে সাময়িক সমস্যা'}
					</h1>
					<p class="text-slate-500 text-sm max-w-md mx-auto">
						{message}
					</p>
				</div>

				<div class="flex flex-wrap items-center justify-center gap-3 pt-2">
					<Button
						variant="outline"
						onclick={handleGoBack}
						class="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
					>
						<ArrowLeft class="w-4 h-4 mr-2" />
						পেছনে যান
					</Button>
					<Button
						href="/admin"
						class="rounded-xl bg-[#5845eb] hover:bg-[#4836d4] text-white font-medium shadow-md shadow-indigo-100"
					>
						<Home class="w-4 h-4 mr-2" />
						Admin Overview
					</Button>
					<Button
						variant="secondary"
						onclick={handleReload}
						class="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
					>
						<RotateCcw class="w-4 h-4 mr-2" />
						রিলোড করুন
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>
{:else}
	<!-- Storefront Premium Customer Error Page -->
	<StoreLayout user={data?.user}>
		<div class="min-h-[70vh] flex items-center justify-center px-4 py-12 md:py-20 font-['Hind_Siliguri',sans-serif]">
			<div class="max-w-2xl w-full text-center space-y-8">
				
				<!-- Decorative Glowing Icon Stack -->
				<div class="relative inline-flex items-center justify-center">
					<div class="absolute -inset-4 bg-gradient-to-r {is404 ? 'from-indigo-500/20 via-purple-500/20 to-pink-500/20' : 'from-rose-500/20 via-amber-500/20 to-orange-500/20'} rounded-full blur-2xl opacity-75"></div>
					
					<div class="relative w-28 h-28 md:w-32 md:h-32 rounded-3xl {is404 ? 'bg-gradient-to-br from-indigo-50 to-purple-100 text-[#5845eb] border-indigo-100 shadow-indigo-200/50' : 'bg-gradient-to-br from-rose-50 to-amber-100 text-rose-600 border-rose-100 shadow-rose-200/50'} border-2 shadow-xl flex items-center justify-center">
						{#if is404}
							<Compass class="w-14 h-14 md:w-16 md:h-16 stroke-[1.6] animate-[pulse_4s_ease-in-out_infinite]" />
						{:else}
							<AlertTriangle class="w-14 h-14 md:w-16 md:h-16 stroke-[1.6] animate-bounce" />
						{/if}
					</div>

					<!-- Floating Status Badge -->
					<div class="absolute -bottom-2 -right-2 px-3 py-1 rounded-full {is404 ? 'bg-[#5845eb] text-white shadow-indigo-500/30' : 'bg-rose-600 text-white shadow-rose-500/30'} text-xs font-bold font-mono shadow-md border-2 border-white">
						HTTP {status}
					</div>
				</div>

				<!-- Main Headings -->
				<div class="space-y-3">
					<Badge variant="outline" class="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full {is404 ? 'bg-indigo-50 text-[#5845eb] border-indigo-200' : 'bg-rose-50 text-rose-600 border-rose-200'}">
						{is404 ? 'Page Not Found' : 'Server Issue'}
					</Badge>

					<h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
						{#if is404}
							দুঃখিত, পেজটি খুঁজে পাওয়া যায়নি!
						{:else}
							সার্ভারে সাময়িক সমস্যা হচ্ছে!
						{/if}
					</h1>

					<p class="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
						{#if is404}
							আপনি যে পেজ বা লিংকটি খুঁজছেন তা স্থানান্তরিত করা হয়েছে, নাম পরিবর্তন করা হয়েছে অথবা লিংকটিতে কোনো ভুল থাকতে পারে।
						{:else}
							আমাদের সার্ভারে একটি অপ্রত্যাশিত সমস্যা হয়েছে। কারিগরি টিম দ্রুত এটি ঠিক করার কাজ করছে।
						{/if}
					</p>

					{#if !is404 && message}
						<div class="mt-2 text-xs font-mono text-slate-500 bg-slate-100 rounded-lg py-1.5 px-3 max-w-md mx-auto truncate border border-slate-200">
							Details: {message}
						</div>
					{/if}
				</div>

				<!-- Action Buttons -->
				<div class="flex flex-wrap items-center justify-center gap-3 pt-2">
					<Button
						variant="outline"
						onclick={handleGoBack}
						class="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 h-11 px-5 font-semibold text-sm transition-all"
					>
						<ArrowLeft class="w-4 h-4 mr-2" />
						পেছনে যান
					</Button>

					<Button
						href="/"
						class="rounded-xl bg-[#5845eb] hover:bg-[#4836d4] text-white h-11 px-6 font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
					>
						<Home class="w-4 h-4 mr-2" />
						হোমপেজে ফিরে যান
					</Button>

					{#if !is404}
						<Button
							variant="secondary"
							onclick={handleReload}
							class="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 h-11 px-5 font-semibold text-sm transition-all"
						>
							<RotateCcw class="w-4 h-4 mr-2" />
							রিলোড দিন
						</Button>
					{/if}
				</div>

				<!-- Helpful Discovery Section (Quick Links) -->
				<div class="pt-8 border-t border-slate-200/80 max-w-xl mx-auto space-y-4">
					<p class="text-xs font-bold text-slate-500 uppercase tracking-wider">
						প্রয়োজনীয় লিংকসমূহ / Helpful Destinations
					</p>

					<div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
						<a
							href="/combos"
							class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-xs font-semibold text-slate-700 hover:text-[#5845eb] transition-all shadow-xs group"
						>
							<Flame class="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
							কম্বো অফার
						</a>

						<a
							href="/track-order"
							class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-xs font-semibold text-slate-700 hover:text-[#5845eb] transition-all shadow-xs group"
						>
							<PackageCheck class="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
							অর্ডার ট্র্যাক
						</a>

						<a
							href="/contact"
							class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-xs font-semibold text-slate-700 hover:text-[#5845eb] transition-all shadow-xs group"
						>
							<MessageSquare class="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
							যোগাযোগ
						</a>

						<a
							href="/faq"
							class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-xs font-semibold text-slate-700 hover:text-[#5845eb] transition-all shadow-xs group"
						>
							<HelpCircle class="w-3.5 h-3.5 text-purple-500 group-hover:scale-110 transition-transform" />
							প্রশ্নোত্তর (FAQ)
						</a>
					</div>
				</div>

			</div>
		</div>
	</StoreLayout>
{/if}
