<script lang="ts">
	import { Button, Card, Input, Textarea, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Facebook Pixel & CAPI Settings Saved!');

	let fbPixelId = $state('806385144697838');
	let fbCapiToken = $state('EAAQZCaLfr2KUBSw5YGLAS5uUNlyLllbFYrQQeCoMBP83lonTPvPJEMBS02zJOMOmplFSX');
	let fbTestMode = $state(false);
	let fbTriggerPurchase = $state(true);
	let isGuideOpen = $state(false);

	function triggerSave(msg = 'Facebook Pixel & CAPI Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Facebook Pixel & CAPI | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-4xl mx-auto">
	{#if isSaved}
		<div class="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
			<CheckCircle2 class="w-4 h-4" />
			<span>{saveMessage}</span>
		</div>
	{/if}

	<!-- Back Button -->
	<a href="/admin/settings">
		<Button variant="outline" size="sm" class="gap-2">
			<ArrowLeft class="w-4 h-4" />
			<span>Back to Settings</span>
		</Button>
	</a>

	<!-- Title Header -->
	<div>
		<h2 class="text-xl font-bold text-slate-900">Facebook Pixel & Conversions API (CAPI)</h2>
		<p class="text-xs text-slate-500 mt-1">
			Track customer actions and improve your ad performance with Meta tracking
		</p>
	</div>

	<!-- Meta Pixel & CAPI Settings Main Card -->
	<Card class="p-6 sm:p-8 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl">
		<div class="flex items-start gap-4 pb-4 border-b border-slate-100">
			<!-- Blue Facebook Icon -->
			<div class="w-12 h-12 rounded-full bg-[#1877f2] flex items-center justify-center text-white shrink-0 shadow-sm">
				<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
				</svg>
			</div>
			<div>
				<h3 class="font-bold text-slate-900 text-base">Meta Pixel & CAPI Settings</h3>
				<p class="text-xs text-slate-500 mt-0.5">
					Use both browser-side and server-side tracking for maximum accuracy.
				</p>
			</div>
		</div>

		<div class="space-y-4">
			<!-- Facebook Pixel ID Field -->
			<div class="space-y-1.5">
				<label for="fb-pixel-id" class="text-xs font-bold text-slate-700 block">
					Facebook Pixel ID
				</label>
				<Input
					id="fb-pixel-id"
					type="text"
					bind:value={fbPixelId}
					placeholder="806385144697838"
					class="font-mono text-xs"
				/>
				<span class="text-[11px] text-slate-400 block">Find this in Meta Events Manager.</span>
			</div>

			<!-- CAPI Access Token Field -->
			<div class="space-y-1.5">
				<label for="capi-token" class="text-xs font-bold text-slate-700 block">
					CAPI Access Token
				</label>
				<Textarea
					id="capi-token"
					rows={3}
					bind:value={fbCapiToken}
					placeholder="EAAQZCaLfr2KUBSw5YGLAS5uUNlyLllbFYr..."
					class="font-mono text-xs leading-relaxed"
				/>
				<span class="text-[11px] text-slate-400 block">Required for Server-Side (CAPI) tracking.</span>
			</div>

			<!-- Test Events (Optional) Box with shadcn Switch -->
			<div class="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
				<h4 class="text-xs font-bold text-slate-800">Test Events (Optional)</h4>

				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-xs text-slate-700 font-medium">Enable Test Mode</span>
						<Switch bind:checked={fbTestMode} />
					</div>

					<div class="flex items-center justify-between">
						<span class="text-xs text-slate-700 font-medium">Trigger Purchase on Order Confirm</span>
						<Switch bind:checked={fbTriggerPurchase} />
					</div>
				</div>

				<p class="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
					Use this to verify your setup in Events Manager &gt; Test Events.
				</p>
			</div>

			<!-- Save Button -->
			<div class="pt-2">
				<Button
					type="button"
					onclick={() => triggerSave('Facebook Pixel & CAPI Settings Saved!')}
					class="w-full bg-[#1877f2] hover:bg-[#166fe5] shadow-blue-500/20 text-white font-bold"
				>
					Save Facebook Tracking Settings
				</Button>
			</div>
		</div>
	</Card>

	<!-- Step-by-Step Setup Guide Accordion -->
	<Card class="overflow-hidden bg-white border border-slate-200/90 shadow-2xs rounded-2xl">
		<button
			type="button"
			onclick={() => (isGuideOpen = !isGuideOpen)}
			class="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
		>
			<div class="flex items-center gap-2">
				<span class="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">?</span>
				<span>Step-by-Step Setup Guide</span>
			</div>
			<ChevronDown class="w-4 h-4 text-slate-400 transition-transform {isGuideOpen ? 'rotate-180' : ''}" />
		</button>

		{#if isGuideOpen}
			<div class="p-5 pt-0 text-xs text-slate-600 space-y-3 border-t border-slate-100">
				<div class="space-y-1">
					<span class="font-bold text-slate-900 block">1. Create or Find Pixel ID</span>
					<p class="text-slate-500">Go to Meta Events Manager &gt; Data Sources &gt; Pixel Settings and copy the Pixel ID.</p>
				</div>
				<div class="space-y-1">
					<span class="font-bold text-slate-900 block">2. Generate Conversions API Token</span>
					<p class="text-slate-500">In Settings tab, scroll down to Conversions API and click "Generate access token".</p>
				</div>
				<div class="space-y-1">
					<span class="font-bold text-slate-900 block">3. Verify in Test Events</span>
					<p class="text-slate-500">Enter your Test Event code and trigger an order to see live events streaming on Cloudflare edge.</p>
				</div>
			</div>
		{/if}
	</Card>
</div>
