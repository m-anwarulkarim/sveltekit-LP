<script lang="ts">
	import { Button } from '#lib/components/ui/button';
	import { ArrowLeft, Save, Headphones, Check, Loader2, ExternalLink, LayoutList } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { data }: { data: any } = $props();

	let verificationToken = $state(data?.googleConsole?.verificationToken ?? '');
	let isSaving = $state(false);

	$effect(() => {
		if (data?.googleConsole) {
			verificationToken = data.googleConsole.verificationToken ?? '';
		}
	});
</script>

<svelte:head>
	<title>Google Search Console - Settings - AURA Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-7 max-w-5xl mx-auto font-['Anek_Bangla',sans-serif]">
	<!-- Top Sub-Header Bar (Matching Screenshot) -->
	<div class="flex items-center justify-between gap-4 pb-2">
		<div>
			<h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Google Search Console</h1>
		</div>

		<div class="flex items-center gap-2">
			<a
				href="https://wa.me/8801860229546"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold shadow-xs transition-colors"
			>
				<Headphones class="w-3.5 h-3.5" />
				<span>header.support</span>
			</a>
		</div>
	</div>

	<!-- Back to Settings Button -->
	<div>
		<a
			href="/admin/settings"
			class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all"
		>
			<ArrowLeft class="w-4 h-4 text-slate-500" />
			<span>Back to Settings</span>
		</a>
	</div>

	<!-- Section Header: googleConsole.title & subtitle (Matching Screenshot) -->
	<div class="space-y-0.5">
		<h2 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
			googleConsole.title
		</h2>
		<p class="text-xs text-slate-500">
			googleConsole.subtitle
		</p>
	</div>

	<!-- Main Form containing Card 1 & Card 2 -->
	<form
		method="POST"
		action="?/saveSettings"
		use:enhance={() => {
			isSaving = true;
			return async ({ result, update }) => {
				isSaving = false;
				if (result.type === 'success') {
					toast.success('Google Search Console সেটিংস সফলভাবে সংরক্ষিত হয়েছে');
				} else {
					toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
				}
				await update();
			};
		}}
		class="space-y-6 max-w-2xl"
	>
		<!-- CARD 1: Verification Card (Matching Screenshot) -->
		<div class="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-5">
			<!-- Header with blue checkmark badge -->
			<div class="flex items-start gap-3.5">
				<div class="w-9 h-9 rounded-full bg-[#1877f2] flex items-center justify-center text-white shrink-0 shadow-xs">
					<Check class="w-5 h-5 stroke-[2.5]" />
				</div>
				<div>
					<h3 class="text-xs sm:text-sm font-bold text-slate-900">
						googleConsole.verificationTitle
					</h3>
					<p class="text-[11px] sm:text-xs text-slate-500 mt-0.5">
						googleConsole.verificationSubtitle
					</p>
				</div>
			</div>

			<!-- Floating Label Outlined Input Box -->
			<div class="space-y-1">
				<div class="relative rounded-xl border border-slate-300 hover:border-slate-400 focus-within:border-[#5845eb] focus-within:ring-2 focus-within:ring-[#5845eb]/10 bg-white transition-all">
					<span class="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-bold text-slate-500 select-none">
						googleConsole.tokenLabel
					</span>
					<input
						type="text"
						name="verificationToken"
						bind:value={verificationToken}
						class="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-transparent rounded-xl focus:outline-none"
					/>
				</div>
				<p class="text-[10px] text-slate-400 pl-1">
					googleConsole.tokenHint
				</p>
			</div>

			<!-- Full-Width Purple Save Button (Matching Screenshot) -->
			<div>
				<Button
					type="submit"
					disabled={isSaving}
					class="w-full bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold h-10 px-5 rounded-xl shadow-xs text-xs gap-2 cursor-pointer transition-all inline-flex items-center justify-center"
				>
					{#if isSaving}
						<Loader2 class="w-4 h-4 animate-spin" />
						<span>সংরক্ষণ হচ্ছে...</span>
					{:else}
						<Save class="w-4 h-4" />
						<span>googleConsole.saveSettings</span>
					{/if}
				</Button>
			</div>
		</div>

		<!-- CARD 2: Setup Guide Card (Matching Screenshot) -->
		<div class="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
			<!-- Header with blue icon -->
			<div class="flex items-center gap-2">
				<div class="w-5 h-5 rounded flex items-center justify-center text-[#1877f2]">
					<LayoutList class="w-4 h-4" />
				</div>
				<h3 class="text-xs font-bold text-slate-900">
					googleConsole.guideTitle
				</h3>
			</div>

			<!-- Step 1 -->
			<div class="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 space-y-1 transition-colors hover:bg-slate-50">
				<div class="text-xs font-bold text-[#1877f2]">
					googleConsole.guideStep1Title
				</div>
				<p class="text-xs text-slate-600">
					googleConsole.guideStep1Text
				</p>
				<div>
					<a
						href="https://search.google.com/search-console"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 text-xs font-bold text-[#1877f2] hover:underline pt-0.5"
					>
						<span>googleConsole.officialSetup</span>
						<ExternalLink class="w-3.5 h-3.5" />
					</a>
				</div>
			</div>

			<!-- Step 2 -->
			<div class="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 space-y-1 transition-colors hover:bg-slate-50">
				<div class="text-xs font-bold text-[#1877f2]">
					googleConsole.guideStep2Title
				</div>
				<p class="text-xs text-slate-600">
					googleConsole.guideStep2Text
				</p>
				<div>
					<a
						href="https://support.google.com/webmasters/answer/9008080"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 text-xs font-bold text-[#1877f2] hover:underline pt-0.5"
					>
						<span>googleConsole.learnVerification</span>
						<ExternalLink class="w-3.5 h-3.5" />
					</a>
				</div>
			</div>

			<!-- Step 3 -->
			<div class="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 space-y-1 transition-colors hover:bg-slate-50">
				<div class="text-xs font-bold text-[#1877f2]">
					googleConsole.guideStep3Title
				</div>
				<p class="text-xs text-slate-600">
					googleConsole.guideStep3Text
				</p>
				<div>
					<a
						href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 text-xs font-bold text-[#1877f2] hover:underline pt-0.5"
					>
						<span>googleConsole.seoStarterGuide</span>
						<ExternalLink class="w-3.5 h-3.5" />
					</a>
				</div>
			</div>
		</div>
	</form>
</div>
