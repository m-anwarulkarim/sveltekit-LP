<script lang="ts">
	import { Button, Card, Input, Textarea, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('TikTok Pixel Settings Saved!');

	let tiktokPixelId = $state('C9J829XLS8');
	let tiktokAccessToken = $state('');
	let enableTikTokEventsAPI = $state(true);
	let testEventCode = $state('');

	function triggerSave(msg = 'TikTok Pixel Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>TikTok Pixel | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-2xl mx-auto">
	{#if isSaved}
		<div class="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
			<CheckCircle2 class="w-4 h-4" />
			<span>{saveMessage}</span>
		</div>
	{/if}

	<div class="flex items-center justify-between gap-4 pb-2">
		<a href="/admin/settings">
			<Button variant="outline" size="sm" class="gap-2">
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</Button>
		</a>

		<Button
			type="button"
			onclick={() => triggerSave('TikTok Pixel Settings Saved!')}
			class="gap-1.5 bg-black hover:bg-slate-800 text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Changes</span>
		</Button>
	</div>

	<Card class="p-6 sm:p-8 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl">
		<div class="flex items-start gap-4 pb-4 border-b border-slate-100">
			<div class="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white shrink-0 shadow-sm">
				<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
					<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.17 1.17 2.12 2.34 2.34.8.18 1.66.07 2.37-.34.79-.44 1.34-1.23 1.47-2.12.07-.48.06-.97.06-1.46V.02z" />
				</svg>
			</div>
			<div>
				<h3 class="font-bold text-slate-900 text-base">TikTok Pixel & Events API</h3>
				<p class="text-xs text-slate-500 mt-0.5">
					Track conversions and optimize TikTok ads performance
				</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="space-y-1.5">
				<label for="tiktok-id" class="text-xs font-bold text-slate-700 block">TikTok Pixel ID</label>
				<Input
					id="tiktok-id"
					type="text"
					bind:value={tiktokPixelId}
					placeholder="e.g. C9J829XLS8"
					class="font-mono text-xs"
				/>
				<span class="text-[11px] text-slate-400 block">TikTok Ads Manager &gt; Assets &gt; Events থেকে কপি করুন</span>
			</div>

			<div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
				<div>
					<span class="text-xs text-slate-800 font-bold block">TikTok Events API (Server-Side)</span>
					<span class="text-[11px] text-slate-500">Enable server-to-server event tracking</span>
				</div>
				<Switch bind:checked={enableTikTokEventsAPI} />
			</div>

			{#if enableTikTokEventsAPI}
				<div class="space-y-1.5">
					<label for="tiktok-token" class="text-xs font-bold text-slate-700 block">Events API Access Token</label>
					<Textarea
						id="tiktok-token"
						rows={3}
						bind:value={tiktokAccessToken}
						placeholder="Paste your TikTok Events API access token..."
						class="font-mono text-xs leading-relaxed"
					/>
				</div>
			{/if}

			<div class="space-y-1.5">
				<label for="test-code" class="text-xs font-bold text-slate-700 block">Test Event Code (Optional)</label>
				<Input
					id="test-code"
					type="text"
					bind:value={testEventCode}
					placeholder="TESTXXXX"
					class="font-mono text-xs"
				/>
			</div>

			<Button
				type="button"
				onclick={() => triggerSave('TikTok Pixel Settings Saved!')}
				class="w-full bg-black hover:bg-slate-800 text-white font-bold"
			>
				Save TikTok Settings
			</Button>
		</div>
	</Card>
</div>
