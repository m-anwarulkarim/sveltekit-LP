<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '#lib/components/ui/card';
	import { AlertCircle, Eye, EyeOff, Loader2, LogIn, ShieldCheck } from 'lucide-svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showPassword = $state(false);
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>অ্যাডমিন লগইন | Haq Plus</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10 font-['Anek_Bangla',sans-serif]">
	<Card class="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
		<CardHeader class="px-6 pt-8 pb-4 text-center sm:px-8">
			<div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-[#5845eb]">
				<ShieldCheck class="h-6 w-6" />
			</div>
			<CardTitle class="text-2xl font-black tracking-tight text-slate-900">অ্যাডমিন লগইন</CardTitle>
			<CardDescription class="mt-1 text-xs font-medium text-slate-500">
				ড্যাশবোর্ডে প্রবেশ করতে আপনার অ্যাকাউন্ট দিয়ে লগইন করুন
			</CardDescription>
		</CardHeader>

		<CardContent class="space-y-4 px-6 pt-2 pb-8 sm:px-8">
			{#if form?.message}
				<div role="alert" class="flex items-center gap-2.5 rounded-2xl border border-rose-200/80 bg-rose-50 p-3.5 text-xs text-rose-700">
					<AlertCircle class="h-4 w-4 shrink-0 text-rose-600" />
					<span>{form.message}</span>
				</div>
			{:else if !data.isConfigured}
				<div role="alert" class="flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
					<AlertCircle class="h-4 w-4 shrink-0" />
					<span>অ্যাডমিন লগইন এখনো কনফিগার করা হয়নি, তাই লগইন বন্ধ আছে।</span>
				</div>
			{/if}

			<form
				method="POST"
				action="?/login"
				class="space-y-4"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
					};
				}}
			>
				<input type="hidden" name="redirectTo" value={data.redirectTo} />

				<div class="space-y-1.5">
					<label for="admin-login" class="text-xs font-bold text-slate-700">ইউজারনেম বা ইমেইল</label>
					<Input
						id="admin-login"
						name="login"
						autocomplete="username"
						required
						class="h-12 rounded-xl text-sm"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="admin-password" class="text-xs font-bold text-slate-700">পাসওয়ার্ড</label>
					<div class="relative">
						<Input
							id="admin-password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							autocomplete="current-password"
							required
							class="h-12 rounded-xl pr-11 text-sm"
						/>
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
							class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700"
						>
							{#if showPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</button>
					</div>
				</div>

				<Button
					type="submit"
					disabled={isSubmitting}
					class="h-12 w-full cursor-pointer gap-2 rounded-xl bg-[#5845eb] text-sm font-bold text-white hover:bg-[#4936d6]"
				>
					{#if isSubmitting}
						<Loader2 class="h-4 w-4 animate-spin" />
						<span>লগইন হচ্ছে...</span>
					{:else}
						<LogIn class="h-4 w-4" />
						<span>লগইন করুন</span>
					{/if}
				</Button>
			</form>
		</CardContent>
	</Card>
</main>
