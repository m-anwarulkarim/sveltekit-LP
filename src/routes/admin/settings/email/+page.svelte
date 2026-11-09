<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import {
		ArrowLeft,
		CheckCircle2,
		Eye,
		EyeOff,
		Loader2,
		Mail,
		Save,
		Send,
		Settings
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data, form }: { data: any; form?: any } = $props();

	let isSaving = $state(false);
	let isTesting = $state(false);
	let showApiKey = $state(false);

	let enabled = $state(data?.settings?.enabled ?? false);
	let provider = $state(data?.settings?.provider ?? 'resend');
	let fromName = $state(data?.settings?.fromName ?? '');
	let fromEmail = $state(data?.settings?.fromEmail ?? '');
	let resendApiKey = $state(data?.settings?.resendApiKey ?? '');

	$effect(() => {
		if (data?.settings) {
			enabled = data.settings.enabled ?? false;
			provider = data.settings.provider ?? 'resend';
			fromName = data.settings.fromName ?? '';
			fromEmail = data.settings.fromEmail ?? '';
			resendApiKey = data.settings.resendApiKey ?? '';
		}
	});

	$effect(() => {
		if (form?.success && !form?.testSent) toast.success('ইমেইল সেটিংস সংরক্ষিত হয়েছে!');
		if (form?.success && form?.testSent) toast.success('টেস্ট ইমেইল পাঠানো হয়েছে!');
		if (form?.error) toast.error(form?.message || 'কোনো সমস্যা হয়েছে।');
	});
</script>

<svelte:head>
	<title>Email Settings | seedbd Admin</title>
</svelte:head>

<div class="space-y-6 max-w-3xl mx-auto p-4 sm:p-6 pb-20 font-['Anek_Bangla',sans-serif]">
	<!-- Top Bar -->
	<div class="flex items-center justify-between gap-4 pb-1">
		<a href="/admin/settings">
			<Button variant="outline" size="sm" class="gap-2 text-xs font-bold text-slate-700 rounded-xl">
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</Button>
		</a>

		{#if enabled && fromEmail && resendApiKey && resendApiKey !== ''}
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
				<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
				<span>সক্রিয়</span>
			</span>
		{:else}
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
				<span class="w-2 h-2 rounded-full bg-slate-400"></span>
				<span>নিষ্ক্রিয়</span>
			</span>
		{/if}
	</div>

	<!-- Save Form -->
	<form
		method="POST"
		action="?/save"
		use:enhance={() => {
			isSaving = true;
			return async ({ result, update }) => {
				isSaving = false;
				await update({ reset: false });
			};
		}}
		class="space-y-5"
	>
		<input
			type="hidden"
			name="settings"
			value={JSON.stringify({ enabled, provider, fromName, fromEmail, resendApiKey })}
		/>

		<Card class="p-6 md:p-8 bg-white border border-slate-200/90 shadow-2xs rounded-3xl space-y-6">
			<!-- Header -->
			<div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
				<div class="flex items-center gap-3.5">
					<div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-2xs flex items-center justify-center shrink-0">
						<Mail class="w-6 h-6 text-indigo-600" />
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900 tracking-tight">Email Notifications</h3>
						<p class="text-xs text-slate-500 mt-0.5">
							সাইন-আপ ভেরিফিকেশন, পাসওয়ার্ড রিসেট এবং অর্ডার নোটিফিকেশন ইমেইল
						</p>
					</div>
				</div>
				<div class="flex items-center gap-2 shrink-0 pt-1">
					<Switch bind:checked={enabled} />
				</div>
			</div>

			{#if enabled}
				<div class="space-y-5 animate-in fade-in duration-150">
					<!-- Provider (currently only Resend, more later) -->
					<div class="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 flex items-center gap-3">
						<div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
							<Settings class="w-4 h-4" />
						</div>
						<div>
							<div class="text-xs font-bold text-slate-800">Provider: Resend</div>
							<div class="text-[11px] text-slate-500">Cloudflare Workers-এ কাজ করে। পরে অন্য provider যোগ করা যাবে।</div>
						</div>
					</div>

					<!-- Resend API Key -->
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700 flex items-center justify-between">
							<span>Resend API Key</span>
							<a
								href="https://resend.com/api-keys"
								target="_blank"
								rel="noreferrer"
								class="text-[11px] font-normal text-indigo-600 hover:underline"
							>resend.com/api-keys</a>
						</label>
						<div class="relative">
							<Input
								type={showApiKey ? 'text' : 'password'}
								placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
								bind:value={resendApiKey}
								class="font-mono text-xs bg-slate-50/50 border-slate-200 rounded-xl py-2 pl-3 pr-10 focus:bg-white"
							/>
							<button
								type="button"
								onclick={() => (showApiKey = !showApiKey)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
							>
								{#if showApiKey}
									<EyeOff class="w-4 h-4" />
								{:else}
									<Eye class="w-4 h-4" />
								{/if}
							</button>
						</div>
					</div>

					<!-- From Name -->
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700">Sender Name</label>
						<Input
							type="text"
							placeholder="seedbd Store"
							bind:value={fromName}
							class="text-xs bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
						/>
					</div>

					<!-- From Email -->
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700 flex items-center justify-between">
							<span>From Email</span>
							<span class="text-[11px] font-normal text-slate-400">Resend-এ verify করা domain হতে হবে</span>
						</label>
						<Input
							type="email"
							placeholder="noreply@yourstore.com"
							bind:value={fromEmail}
							class="font-mono text-xs bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white"
						/>
					</div>
				</div>
			{:else}
				<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center py-6 text-slate-500 text-xs">
					Email সেন্ডিং বর্তমানে নিষ্ক্রিয়। সক্রিয় করতে উপরের সুইচটি চালু করুন।
				</div>
			{/if}

			<Button
				type="submit"
				disabled={isSaving}
				class="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
			>
				{#if isSaving}
					<Loader2 class="w-4 h-4 animate-spin" />
					<span>সংরক্ষণ হচ্ছে...</span>
				{:else}
					<Save class="w-4 h-4" />
					<span>সেটিংস সংরক্ষণ করুন</span>
				{/if}
			</Button>
		</Card>
	</form>

	<!-- Test Email Form -->
	{#if enabled}
		<form
			method="POST"
			action="?/test"
			use:enhance={() => {
				isTesting = true;
				return async ({ result, update }) => {
					isTesting = false;
					await update({ reset: false });
				};
			}}
		>
			<Card class="p-5 bg-slate-50 border border-slate-200/90 rounded-3xl">
				<div class="flex items-center justify-between gap-4">
					<div>
						<div class="text-sm font-bold text-slate-800">টেস্ট ইমেইল পাঠান</div>
						<div class="text-xs text-slate-500 mt-0.5">
							From Email ঠিকানায় একটি পরীক্ষামূলক ইমেইল যাবে
						</div>
					</div>
					<Button
						type="submit"
						variant="outline"
						disabled={isTesting}
						class="shrink-0 gap-2 text-xs font-bold border-slate-300 rounded-xl cursor-pointer"
					>
						{#if isTesting}
							<Loader2 class="w-4 h-4 animate-spin" />
							<span>পাঠানো হচ্ছে...</span>
						{:else}
							<Send class="w-4 h-4" />
							<span>Test করুন</span>
						{/if}
					</Button>
				</div>
			</Card>
		</form>
	{/if}

	<!-- Setup Guide -->
	<Card class="p-6 bg-slate-50 border border-slate-200/90 rounded-3xl space-y-3">
		<div class="flex items-center gap-2 text-slate-800 font-bold text-sm">
			<CheckCircle2 class="w-4 h-4 text-emerald-600" />
			<span>Resend সেটআপ গাইড</span>
		</div>
		<ol class="space-y-2 text-xs text-slate-600 list-none">
			{#each [
				'resend.com-এ সাইন আপ করুন (Google দিয়ে এক ক্লিকে)',
				'Dashboard → API Keys → Create API Key',
				'API Key কপি করে উপরের ফিল্ডে পেস্ট করুন',
				'(Optional) Domain যোগ করুন: Resend → Domains → Add Domain → DNS records DNS-এ দিন',
				'From Email-এ আপনার verified domain-এর address দিন (যেমন: noreply@yourstore.com)',
				'Save করুন, তারপর Test পাঠান'
			] as step, i}
				<li class="flex items-start gap-2.5">
					<span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
					<span>{step}</span>
				</li>
			{/each}
		</ol>
	</Card>
</div>
