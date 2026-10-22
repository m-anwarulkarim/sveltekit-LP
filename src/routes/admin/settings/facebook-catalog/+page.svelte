<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Copy, Check } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Facebook Catalog Settings Saved!');
	let isCopied = $state(false);

	let feedUrl = 'https://aura.com.bd/api/feed/facebook-catalog.xml';
	let syncInterval = $state('hourly');
	let includeOutOfStock = $state(false);

	function triggerSave(msg = 'Facebook Catalog Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}

	function copyFeedUrl() {
		navigator.clipboard.writeText(feedUrl);
		isCopied = true;
		setTimeout(() => (isCopied = false), 2000);
	}
</script>

<svelte:head>
	<title>Facebook Catalog | AURA Enterprise</title>
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
			onclick={() => triggerSave('Facebook Catalog Settings Saved!')}
			class="gap-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Settings</span>
		</Button>
	</div>

	<Card class="p-6 sm:p-8 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl">
		<div class="flex items-start gap-4 pb-4 border-b border-slate-100">
			<div class="w-12 h-12 rounded-full bg-[#1877f2] flex items-center justify-center text-white shrink-0 shadow-sm">
				<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
				</svg>
			</div>
			<div>
				<h3 class="font-bold text-slate-900 text-base">Meta Facebook Product Catalog Feed</h3>
				<p class="text-xs text-slate-500 mt-0.5">
					ডায়নামিক প্রোডাক্ট অ্যাড ও শপ ফিডের জন্য অটোমেটিক XML ডাটাফিড URL
				</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="space-y-1.5">
				<label for="feed-url" class="text-xs font-bold text-slate-700 block">XML Product Feed URL</label>
				<div class="flex items-center gap-2">
					<Input
						id="feed-url"
						type="text"
						readonly
						value={feedUrl}
						class="font-mono text-xs bg-slate-50"
					/>
					<Button type="button" variant="outline" onclick={copyFeedUrl} class="shrink-0 gap-1.5">
						{#if isCopied}
							<Check class="w-3.5 h-3.5 text-emerald-600" />
							<span class="text-emerald-600">Copied</span>
						{:else}
							<Copy class="w-3.5 h-3.5" />
							<span>Copy</span>
						{/if}
					</Button>
				</div>
				<span class="text-[11px] text-slate-400 block">এই URL-টি Meta Commerce Manager &gt; Catalog &gt; Data Sources-এ শিডিউল ফিড হিসেবে পেস্ট করুন</span>
			</div>

			<div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
				<div>
					<span class="text-xs text-slate-800 font-bold block">Include Out-of-Stock Products</span>
					<span class="text-[11px] text-slate-500">স্টক শেষ হওয়া পণ্য ক্যাটালগ ফিডে রাখা হবে কিনা</span>
				</div>
				<Switch bind:checked={includeOutOfStock} />
			</div>

			<Button
				type="button"
				onclick={() => triggerSave('Facebook Catalog Settings Saved!')}
				class="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold"
			>
				Save Catalog Settings
			</Button>
		</div>
	</Card>
</div>
