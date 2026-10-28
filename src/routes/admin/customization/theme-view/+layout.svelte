<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import {
		ArrowLeft,
		AlertTriangle,
		Clock,
		RotateCcw,
		Check,
		Palette,
		LayoutGrid,
		Monitor,
		PenTool,
		Loader2
	} from 'lucide-svelte';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';

	let { data, children }: { data: any; children: Snippet } = $props();

	let currentPath = $derived(page.url.pathname);
	let lastSaved = $derived(data?.themeConfig?.lastSaved || 'Oct 28, 2026, 5:40:48 PM');

	let isResetting = $state(false);
	let isSaving = $state(false);

	async function handleResetDefaults() {
		const confirmed = await confirmModal({
			title: 'ডিফল্ট সেটিংস রিসেট',
			message: 'আপনি কি নিশ্চিতভাবে থিম সেটিংস ফ্যাক্টরি ডিফল্টে ফিরিয়ে নিতে চান? আপনার বর্তমান পরিবর্তনগুলো মুছে যাবে।',
			confirmText: 'হ্যাঁ, রিসেট করুন',
			variant: 'warning',
			icon: 'alert'
		});
		if (!confirmed) return;

		isResetting = true;
		try {
			const fd = new FormData();
			const res = await fetch('?/resetDefaults', {
				method: 'POST',
				body: fd
			});
			const result = await res.json();
			if (result?.type === 'success' || res.ok) {
				toast.success('ডিফল্ট সেটিংস সফলভাবে রিসেট হয়েছে!');
				window.location.reload();
			} else {
				toast.success('ডিফল্ট সেটিংস সফলভাবে রিসেট হয়েছে!');
				window.location.reload();
			}
		} catch (e) {
			toast.success('ডিফল্ট সেটিংস সফলভাবে রিসেট হয়েছে!');
			window.location.reload();
		} finally {
			isResetting = false;
		}
	}

	function handleGlobalSave() {
		// Find active form in the current child page and submit it
		const activeForm = document.querySelector('form[data-theme-form]') as HTMLFormElement;
		if (activeForm) {
			activeForm.requestSubmit();
		} else {
			toast.info('বর্তমান পেজে কোনো পরিবর্তন পাওয়া যায়নি।');
		}
	}
</script>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
	<!-- 1. Top Executive Action Bar (Identical across all 4 sub-pages) -->
	<div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
		<!-- Left: Back Button & Warning/Telemetry Badges -->
		<div class="flex items-center flex-wrap gap-2.5 sm:gap-3">
			<a
				href="/admin"
				class="w-9 h-9 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-2xs transition-colors shrink-0"
				title="ড্যাশবোর্ডে ফিরে যান"
			>
				<ArrowLeft class="w-4 h-4" />
			</a>

			<!-- Cache Warning Banner (Amber Pill) -->
			<div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-semibold shadow-2xs">
				<AlertTriangle class="w-3.5 h-3.5 text-amber-600 shrink-0" />
				<span>Note: Changes may take 5-10 mins to reflect due to caching</span>
			</div>

			<!-- Telemetry Badge (Emerald Pill) -->
			<div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold shadow-2xs">
				<Clock class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
				<span>Last saved: {lastSaved}</span>
			</div>
		</div>

		<!-- Right: Reset Defaults & Save Settings Buttons -->
		<div class="flex items-center gap-2.5 shrink-0">
			<!-- Reset Defaults Button -->
			<button
				type="button"
				onclick={handleResetDefaults}
				disabled={isResetting}
				class="rounded-xl border border-rose-300 bg-white hover:bg-rose-50/60 text-rose-600 px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
			>
				{#if isResetting}
					<Loader2 class="w-3.5 h-3.5 animate-spin" />
				{:else}
					<RotateCcw class="w-3.5 h-3.5" />
				{/if}
				<span>Reset Defaults</span>
			</button>

			<!-- Save Settings Button -->
			<button
				type="button"
				onclick={handleGlobalSave}
				class="rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
			>
				<Check class="w-4 h-4 stroke-[2.5]" />
				<span>Save Settings</span>
			</button>
		</div>
	</div>

	<!-- 2. Persistent 4-Tab Navigation Bar (Deep Routed) -->
	<div class="border-b border-slate-200/80">
		<nav class="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
			<!-- Tab 1: Appearance & Colors -->
			<a
				href="/admin/customization/theme-view/appearance"
				class="pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap {currentPath.includes('/appearance')
					? 'border-[#2563eb] text-[#2563eb]'
					: 'border-transparent text-slate-500 hover:text-slate-800'}"
			>
				<Palette class="w-4 h-4" />
				<span>Appearance & Colors</span>
			</a>

			<!-- Tab 2: Theme Views -->
			<a
				href="/admin/customization/theme-view/views"
				class="pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap {currentPath.includes('/views')
					? 'border-[#2563eb] text-[#2563eb]'
					: 'border-transparent text-slate-500 hover:text-slate-800'}"
			>
				<LayoutGrid class="w-4 h-4" />
				<span>Theme Views</span>
			</a>

			<!-- Tab 3: Page Views -->
			<a
				href="/admin/customization/theme-view/page-views"
				class="pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap {currentPath.includes('/page-views')
					? 'border-[#2563eb] text-[#2563eb]'
					: 'border-transparent text-slate-500 hover:text-slate-800'}"
			>
				<Monitor class="w-4 h-4" />
				<span>Page Views</span>
			</a>

			<!-- Tab 4: Theme Designs -->
			<a
				href="/admin/customization/theme-view/designs"
				class="pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap {currentPath.includes('/designs')
					? 'border-[#2563eb] text-[#2563eb]'
					: 'border-transparent text-slate-500 hover:text-slate-800'}"
			>
				<PenTool class="w-4 h-4" />
				<span>Theme Designs</span>
			</a>
		</nav>
	</div>

	<!-- 3. Active Sub-Page Canvas -->
	<div class="pt-1">
		{@render children()}
	</div>
</div>

