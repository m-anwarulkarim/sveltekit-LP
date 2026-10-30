<script lang="ts">
	import { Button, Card, Input, Textarea, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Search, Check, ExternalLink } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Google Search Console Settings Saved!');

	let verificationMetaTag = $state('');
	let sitemapUrl = '/sitemap.xml';
	let enableAutoSitemap = $state(false);

	function triggerSave(msg = 'Google Search Console Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Google Search Console | AURA Enterprise</title>
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
			onclick={() => triggerSave('Google Search Console Settings Saved!')}
			class="gap-1.5 bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Verification</span>
		</Button>
	</div>

	<Card class="p-6 sm:p-8 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-2xl">
		<div class="flex items-start gap-4 pb-4 border-b border-slate-100">
			<div class="w-12 h-12 rounded-full bg-[#1d6ee5] flex items-center justify-center text-white shrink-0 shadow-sm">
				<Search class="w-6 h-6" />
			</div>
			<div>
				<h3 class="font-bold text-slate-900 text-base">Google Search Console Verification</h3>
				<p class="text-xs text-slate-500 mt-0.5">
					সাইট ওনারশিপ ভেরিফিকেশন এবং XML সাইটম্যাপ ইনডেক্সিং
				</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="space-y-1.5">
				<label for="meta-tag" class="text-xs font-bold text-slate-700 block">HTML Meta Tag Verification Code</label>
				<Input
					id="meta-tag"
					type="text"
					bind:value={verificationMetaTag}
					placeholder="google-site-verification=..."
					class="font-mono text-xs"
				/>
				<span class="text-[11px] text-slate-400 block">Google Search Console &gt; Settings &gt; Ownership verification থেকে পাওয়া মেটা ট্যাগ কোডটি দিন</span>
			</div>

			<div class="space-y-1.5">
				<label for="sitemap" class="text-xs font-bold text-slate-700 block">XML Sitemap URL</label>
				<div class="flex items-center gap-2">
					<Input
						id="sitemap"
						type="text"
						readonly
						value={sitemapUrl}
						class="font-mono text-xs bg-slate-50"
					/>
					<a href={sitemapUrl} target="_blank" rel="noopener noreferrer">
						<Button type="button" variant="outline" size="icon" class="h-10 w-10 shrink-0">
							<ExternalLink class="w-4 h-4" />
						</Button>
					</a>
				</div>
				<span class="text-[11px] text-slate-400 block">Google Search Console-এর Sitemaps সেকশনে সাবমিট করুন</span>
			</div>

			<div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
				<div>
					<span class="text-xs text-slate-800 font-bold block">Auto-generate dynamic XML Sitemap</span>
					<span class="text-[11px] text-slate-500">নতুন প্রোডাক্ট বা পেইজ অ্যাড হলে অটো সাইটম্যাপ আপডেট হবে</span>
				</div>
				<Switch bind:checked={enableAutoSitemap} />
			</div>

			<Button
				type="button"
				onclick={() => triggerSave('Google Search Console Settings Saved!')}
				class="w-full bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
			>
				Save Verification Settings
			</Button>
		</div>
	</Card>
</div>
