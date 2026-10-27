<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, Globe, ShieldCheck } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Domain Settings Saved!');

	let primaryDomain = $state('thecolorlighthouse.com');
	let defaultSubdomain = $state('thecolorlight.saleecom.com');
	let forceHttps = $state(true);
	let redirectWww = $state(true);
	let sslStatus = $state('Active (Cloudflare Universal SSL)');

	function triggerSave(msg = 'Domain Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Domain Manage | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-2xl mx-auto p-4 sm:p-6">
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
			onclick={() => triggerSave()}
			class="gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Domain</span>
		</Button>
	</div>

	<Card class="p-6 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center gap-3 pb-3 border-b border-slate-100">
			<div class="w-10 h-10 rounded-full bg-[#f97316] flex items-center justify-center text-white">
				<Globe class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">Domain Manage</h3>
				<p class="text-xs text-slate-500">কাস্টম ডোমেন কানেকশন, SSL সিকিউরিটি ও রিডাইরেক্ট কনফিগারেশন</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-700">কাস্টম ডোমেন (Custom Domain)</label>
				<Input type="text" bind:value={primaryDomain} placeholder="yourbrand.com" class="font-mono text-sm font-bold" />
			</div>

			<div class="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-2">
				<h4 class="font-bold">DNS কনফিগারেশন নির্দেশিকা:</h4>
				<p>আপনার ডোমেন প্রোভাইডারে (Namecheap / GoDaddy) নিচের DNS রেকর্ড যুক্ত করুন:</p>
				<div class="p-2.5 bg-white/80 rounded-xl font-mono text-[11px] space-y-1 border border-amber-200">
					<div><strong>Type:</strong> CNAME &nbsp;|&nbsp; <strong>Host:</strong> @ &nbsp;|&nbsp; <strong>Value:</strong> cname.saleecom.com</div>
					<div><strong>Type:</strong> CNAME &nbsp;|&nbsp; <strong>Host:</strong> www &nbsp;|&nbsp; <strong>Value:</strong> cname.saleecom.com</div>
				</div>
			</div>

			<div class="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<ShieldCheck class="w-5 h-5 text-emerald-600" />
					<div>
						<h4 class="text-xs font-bold text-emerald-900">SSL Certificate</h4>
						<p class="text-[11px] text-emerald-700">{sslStatus}</p>
					</div>
				</div>
				<span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
					Active
				</span>
			</div>

			<div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
				<div>
					<h4 class="text-xs font-bold text-slate-900">Force HTTPS</h4>
					<p class="text-[11px] text-slate-500">সকল ভিজিটরকে নিরাপদ এনক্রিপ্টেড লিংকে রিডাইরেক্ট করবে</p>
				</div>
				<Switch bind:checked={forceHttps} />
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold"
		>
			ডোমেন সেটিংস সংরক্ষণ
		</Button>
	</Card>
</div>
