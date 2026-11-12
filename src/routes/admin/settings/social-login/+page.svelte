<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import {
		ArrowLeft,
		CheckCircle2,
		Copy,
		ExternalLink,
		Eye,
		EyeOff,
		HelpCircle,
		Info,
		KeyRound,
		Loader2,
		Save,
		ShieldCheck,
		Sparkles
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { SocialLoginConfig } from '#lib/server/services/settings.service';

	let { data, form }: { data: { settings: SocialLoginConfig; origin: string }; form?: any } = $props();

	let isSaving = $state(false);
	let showSecret = $state(false);

	let enableGoogleLogin = $state(data?.settings?.enableGoogleLogin ?? false);
	let googleClientId = $state(data?.settings?.googleClientId ?? '');
	let googleClientSecret = $state(data?.settings?.googleClientSecret ?? '');
	let enableOneTap = $state(data?.settings?.enableOneTap ?? false);

	$effect(() => {
		if (data?.settings) {
			enableGoogleLogin = data.settings.enableGoogleLogin ?? false;
			googleClientId = data.settings.googleClientId ?? '';
			googleClientSecret = data.settings.googleClientSecret ?? '';
			enableOneTap = data.settings.enableOneTap ?? false;
		}
	});

	// Live callback URL built from the admin's current origin, so staging / custom domains work
	// without being told to edit a hardcoded URL.
	const callbackUri = `${data.origin}/api/auth/callback/google`;
	const originForOrigins = data.origin;
	const localCallbackUri = 'http://localhost:5173/api/auth/callback/google';

	function copyToClipboard(text: string, label: string) {
		navigator.clipboard.writeText(text);
		toast.success(`${label} কপি করা হয়েছে!`);
	}
</script>

<svelte:head>
	<title>Google Social Login | Admin</title>
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

		<div class="flex items-center gap-2">
			{#if data.settings.enableGoogleLogin && data.settings.googleClientId?.trim() && data.settings.googleClientSecret?.trim()}
				<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
					<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
					<span>লাইভে সক্রিয়</span>
				</span>
			{:else if enableGoogleLogin && googleClientId.trim() && googleClientSecret.trim()}
				<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
					<span class="w-2 h-2 rounded-full bg-amber-500"></span>
					<span>সেভ করলে সক্রিয় হবে</span>
				</span>
			{:else}
				<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
					<span class="w-2 h-2 rounded-full bg-slate-400"></span>
					<span>নিষ্ক্রিয়</span>
				</span>
			{/if}
		</div>
	</div>

	<!-- Main Form -->
	<form
		method="POST"
		action="?/save"
		use:enhance={() => {
			isSaving = true;
			return async ({ result, update }) => {
				isSaving = false;
				if (result.type === 'success') {
					toast.success('Google সোশ্যাল লগইন সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
				} else {
					toast.error('সেটিংস সংরক্ষণ ব্যর্থ হয়েছে');
				}
				await update({ reset: false });
			};
		}}
		class="space-y-6"
	>
		<!-- Hidden payload -->
		<input
			type="hidden"
			name="settings"
			value={JSON.stringify({
				enableGoogleLogin,
				googleClientId,
				googleClientSecret,
				enableOneTap
			})}
		/>

		<!-- Google Authentication Card -->
		<Card class="p-6 md:p-8 bg-white border border-slate-200/90 shadow-2xs rounded-3xl space-y-6">
			<!-- Header -->
			<div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
				<div class="flex items-center gap-3.5">
					<!-- Official Google G Logo SVG -->
					<div class="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center p-2.5 shrink-0">
						<svg viewBox="0 0 24 24" class="w-full h-full">
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
							/>
						</svg>
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900 tracking-tight">
							Google Authentication & Social Login
						</h3>
						<p class="text-xs text-slate-500 mt-0.5">
							গ্রাহকরা কোনো পাসওয়ার্ড ছাড়াই সরাসরি তাদের Google একাউন্ট দিয়ে এক ক্লিকে সাইন ইন করতে পারবেন
						</p>
					</div>
				</div>

				<!-- Master Toggle -->
				<div class="flex items-center gap-2 shrink-0 pt-1">
					<Switch bind:checked={enableGoogleLogin} />
				</div>
			</div>

			<!-- Form Inputs -->
			{#if enableGoogleLogin}
				<div class="space-y-5 animate-in fade-in duration-150">
					<!-- Client ID -->
					<div class="space-y-1.5">
						<label for="google-client-id" class="text-xs font-bold text-slate-700 flex items-center justify-between">
							<span>Google Client ID</span>
							<span class="text-[11px] font-normal text-slate-400">OAuth 2.0 Client ID</span>
						</label>
						<Input
							id="google-client-id"
							type="text"
							placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
							bind:value={googleClientId}
							class="font-mono text-xs bg-slate-50/50 border-slate-200 rounded-xl py-2 px-3 focus:bg-white"
						/>
					</div>

					<!-- Client Secret -->
					<div class="space-y-1.5">
						<label for="google-client-secret" class="text-xs font-bold text-slate-700 flex items-center justify-between">
							<span>Google Client Secret</span>
							<span class="text-[11px] font-normal text-slate-400">Confidential Key</span>
						</label>
						<div class="relative">
							<Input
								id="google-client-secret"
								type={showSecret ? 'text' : 'password'}
								placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
								bind:value={googleClientSecret}
								class="font-mono text-xs bg-slate-50/50 border-slate-200 rounded-xl py-2 pl-3 pr-10 focus:bg-white"
							/>
							<button
								type="button"
								onclick={() => (showSecret = !showSecret)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
								title={showSecret ? 'লুকান' : 'দেখুন'}
							>
								{#if showSecret}
									<EyeOff class="w-4 h-4" />
								{:else}
									<Eye class="w-4 h-4" />
								{/if}
							</button>
						</div>
					</div>

					<!-- Google One-Tap Toggle Subcard -->
					<div class="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-4">
						<div class="flex items-center gap-3">
							<div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
								<Sparkles class="w-4 h-4" />
							</div>
							<div>
								<div class="text-xs font-bold text-slate-800">Google One-Tap Prompt সক্রিয় রাখুন</div>
								<div class="text-[11px] text-slate-600">
									ওয়েবসাইটে ভিজিটর আসলেই স্বয়ংক্রিয়ভাবে একটি দ্রুত সাইন ইন পপআপ দেখাবে
								</div>
							</div>
						</div>
						<Switch bind:checked={enableOneTap} />
					</div>
				</div>
			{:else}
				<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center py-6 text-slate-500 text-xs">
					Google সাইন-ইন বর্তমানে নিষ্ক্রিয় রয়েছে। সক্রিয় করতে উপরের সুইচটি চালু করুন।
				</div>
			{/if}

			<!-- Save Button Inside Card -->
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
					<span>সোশ্যাল লগইন সংরক্ষণ করুন</span>
				{/if}
			</Button>
		</Card>

		<!-- Setup Instructions & Authorized Redirect URIs Card -->
		<Card class="p-6 bg-slate-50 border border-slate-200/90 rounded-3xl space-y-4">
			<div class="flex items-center gap-2 text-slate-800 font-bold text-sm">
				<ShieldCheck class="w-4 h-4 text-emerald-600" />
				<span>Google Cloud Console সেটআপ নির্দেশিকা</span>
			</div>

			<p class="text-xs text-slate-600 leading-relaxed">
				Google Cloud Console-এর <strong>APIs & Services &gt; Credentials</strong> সেকশনে গিয়ে <strong>OAuth 2.0 Client ID</strong> তৈরি করার সময় নিচের ইউআরএলগুলো Authorized Redirect URIs-এ যুক্ত করুন:
			</p>

			<!-- URIs with Copy Buttons -->
			<div class="space-y-2">
				<!-- Production URI -->
				<div class="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs">
					<div class="truncate">
						<span class="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded mr-1.5">Production</span>
						<code class="font-mono text-[11px] text-slate-800">{callbackUri}</code>
					</div>
					<button
						type="button"
						onclick={() => copyToClipboard(callbackUri, 'Production Redirect URI')}
						class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 shrink-0 cursor-pointer"
						title="কপি করুন"
					>
						<Copy class="w-3.5 h-3.5" />
					</button>
				</div>

				<!-- Local URI -->
				<div class="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs">
					<div class="truncate">
						<span class="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-1.5 py-0.5 rounded mr-1.5">Local Dev</span>
						<code class="font-mono text-[11px] text-slate-800">{localCallbackUri}</code>
					</div>
					<button
						type="button"
						onclick={() => copyToClipboard(localCallbackUri, 'Local Redirect URI')}
						class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 shrink-0 cursor-pointer"
						title="কপি করুন"
					>
						<Copy class="w-3.5 h-3.5" />
					</button>
				</div>
			</div>

			<div class="pt-1 flex items-center justify-between text-xs text-slate-500">
				<span>Authorized JavaScript Origins: <strong class="font-mono text-slate-700">{originForOrigins}</strong></span>
				<a
					href="https://console.cloud.google.com/apis/credentials"
					target="_blank"
					rel="noreferrer"
					class="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
				>
					<span>Google Console</span>
					<ExternalLink class="w-3 h-3" />
				</a>
			</div>
		</Card>
	</form>
</div>
