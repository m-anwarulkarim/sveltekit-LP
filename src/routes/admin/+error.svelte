<script lang="ts">
	import { page } from '$app/state';
	import { Button, Badge, Card, CardContent } from '#lib/components/ui';
	import {
		ShieldAlert,
		AlertTriangle,
		RotateCcw,
		Home,
		ArrowLeft,
		Package,
		ShoppingCart,
		Users,
		SlidersHorizontal,
		Search
	} from 'lucide-svelte';

	let status = $derived(page.status ?? 404);
	let message = $derived(page.error?.message || (status === 404 ? 'The requested administrative resource or page does not exist.' : 'An unexpected exception occurred inside the Admin Deck.'));
	let is404 = $derived(status === 404);

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
	<title>{status} Error | Admin Control Deck | AURA</title>
</svelte:head>

<div class="max-w-3xl mx-auto py-8 md:py-16 px-4 font-['Hind_Siliguri',sans-serif]">
	<Card class="border-slate-200/90 shadow-xl bg-white rounded-2xl overflow-hidden">
		<!-- Top Indicator Gradient -->
		<div class="h-2 bg-gradient-to-r {is404 ? 'from-amber-400 via-indigo-500 to-purple-600' : 'from-rose-500 via-red-500 to-orange-500'}"></div>

		<CardContent class="p-6 sm:p-10 text-center space-y-6">
			<!-- Visual Icon -->
			<div class="relative inline-flex items-center justify-center">
				<div class="w-20 h-20 rounded-2xl {is404 ? 'bg-indigo-50 text-[#5845eb] border border-indigo-100' : 'bg-red-50 text-red-600 border border-red-100'} flex items-center justify-center shadow-inner">
					{#if is404}
						<ShieldAlert class="w-10 h-10 stroke-[1.7]" />
					{:else}
						<AlertTriangle class="w-10 h-10 stroke-[1.7]" />
					{/if}
				</div>

				<span class="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold {is404 ? 'bg-[#5845eb] text-white' : 'bg-red-600 text-white'} shadow-sm">
					{status}
				</span>
			</div>

			<!-- Title & Description -->
			<div class="space-y-2">
				<Badge variant="outline" class="px-3 py-1 text-xs font-mono {is404 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}">
					{is404 ? 'MODULE NOT FOUND' : 'ADMIN RUNTIME EXCEPTION'}
				</Badge>

				<h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
					{#if is404}
						অ্যাডমিন মডিউল বা পেজটি পাওয়া যায়নি
					{:else}
						অ্যাডমিন ড্যাশবোর্ডে সমস্যা দেখা দিয়েছে
					{/if}
				</h1>

				<p class="text-slate-500 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
					{#if is404}
						আপনি যে অ্যাডমিন রুট বা সেটিংস পেজে যাওয়ার চেষ্টা করছেন তা বিদ্যমান নেই অথবা সরানো হয়েছে।
					{:else}
						সার্ভার বা ডেটাবেস থেকে তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পেজটি রিলোড দিন।
					{/if}
				</p>

				{#if message}
					<div class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-mono text-slate-600 text-left max-w-lg mx-auto overflow-x-auto">
						<span class="font-bold text-slate-400">Error:</span> {message}
					</div>
				{/if}
			</div>

			<!-- Quick Actions -->
			<div class="flex flex-wrap items-center justify-center gap-3 pt-2">
				<Button
					variant="outline"
					onclick={handleGoBack}
					class="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-medium text-sm"
				>
					<ArrowLeft class="w-4 h-4 mr-2" />
					পেছনে যান
				</Button>

				<Button
					href="/admin"
					class="rounded-xl bg-[#5845eb] hover:bg-[#4836d4] text-white font-medium text-sm shadow-md shadow-indigo-100"
				>
					<Home class="w-4 h-4 mr-2" />
					Dashboard Overview
				</Button>

				<Button
					variant="secondary"
					onclick={handleReload}
					class="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm"
				>
					<RotateCcw class="w-4 h-4 mr-2" />
					রিলোড দিন
				</Button>
			</div>

			<!-- Jump to Main Admin Modules -->
			<div class="pt-6 border-t border-slate-100 max-w-lg mx-auto space-y-3">
				<p class="text-xs font-bold text-slate-400 uppercase tracking-wider">
					Quick Admin Navigation
				</p>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
					<a
						href="/admin/orders"
						class="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 text-xs font-semibold text-slate-700 hover:text-[#5845eb] transition-all"
					>
						<ShoppingCart class="w-3.5 h-3.5 text-[#5845eb]" />
						Orders
					</a>
					<a
						href="/admin/products"
						class="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 text-xs font-semibold text-slate-700 hover:text-[#5845eb] transition-all"
					>
						<Package class="w-3.5 h-3.5 text-emerald-600" />
						Products
					</a>
					<a
						href="/admin/customers"
						class="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 text-xs font-semibold text-slate-700 hover:text-[#5845eb] transition-all"
					>
						<Users class="w-3.5 h-3.5 text-blue-600" />
						Customers
					</a>
					<a
						href="/admin/settings"
						class="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 text-xs font-semibold text-slate-700 hover:text-[#5845eb] transition-all"
					>
						<SlidersHorizontal class="w-3.5 h-3.5 text-purple-600" />
						Settings
					</a>
				</div>
			</div>
		</CardContent>
	</Card>
</div>
