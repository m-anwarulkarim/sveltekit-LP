<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, UserCheck } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Social Login Settings Saved!');

	let enableGoogleLogin = $state(false);
	let googleClientId = $state('');
	let googleClientSecret = $state('');
	let enableFacebookLogin = $state(false);
	let facebookAppId = $state('');
	let facebookAppSecret = $state('');
	let enableOneTap = $state(false);

	function triggerSave(msg = 'Social Login Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Social Login Settings | AURA Enterprise</title>
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
			class="gap-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Settings</span>
		</Button>
	</div>

	<Card class="p-6 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center gap-3 pb-3 border-b border-slate-100">
			<div class="w-10 h-10 rounded-full bg-[#ef4444] flex items-center justify-center text-white">
				<UserCheck class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">Social Login ইন্টিগ্রেশন</h3>
				<p class="text-xs text-slate-500">Google ও Facebook এক ক্লিকে ওয়ান-ট্যাপ লগইন সেটআপ</p>
			</div>
		</div>

		<div class="space-y-4">
			<!-- Google Login -->
			<div class="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
				<div class="flex items-center justify-between">
					<div>
						<h4 class="text-xs font-bold text-rose-900">Google One-Tap Login</h4>
						<p class="text-[11px] text-rose-700">গুগল একাউন্ট দিয়ে তাৎক্ষণিক সাইন ইন</p>
					</div>
					<Switch bind:checked={enableGoogleLogin} />
				</div>
				{#if enableGoogleLogin}
					<div class="space-y-3 pt-2">
						<div>
							<label class="text-[11px] font-bold text-slate-600 block mb-1">Google Client ID</label>
							<Input type="text" bind:value={googleClientId} class="font-mono text-xs" />
						</div>
						<div>
							<label class="text-[11px] font-bold text-slate-600 block mb-1">Google Client Secret</label>
							<Input type="password" bind:value={googleClientSecret} class="font-mono text-xs" />
						</div>
					</div>
				{/if}
			</div>

			<!-- Facebook Login -->
			<div class="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
				<div class="flex items-center justify-between">
					<div>
						<h4 class="text-xs font-bold text-blue-900">Facebook Login</h4>
						<p class="text-[11px] text-blue-700">ফেসবুক আইডি দিয়ে লগইন</p>
					</div>
					<Switch bind:checked={enableFacebookLogin} />
				</div>
				{#if enableFacebookLogin}
					<div class="space-y-3 pt-2">
						<div>
							<label class="text-[11px] font-bold text-slate-600 block mb-1">Facebook App ID</label>
							<Input type="text" bind:value={facebookAppId} class="font-mono text-xs" />
						</div>
						<div>
							<label class="text-[11px] font-bold text-slate-600 block mb-1">Facebook App Secret</label>
							<Input type="password" bind:value={facebookAppSecret} class="font-mono text-xs" />
						</div>
					</div>
				{/if}
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold"
		>
			সোশ্যাল লগইন সংরক্ষণ
		</Button>
	</Card>
</div>
