<script lang="ts">
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Card, CardHeader, CardDescription, CardContent, CardFooter } from '#lib/components/ui/card';
	import { User, Mail, Lock, UserPlus, LogIn, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-svelte';
	import { authClient } from '#lib/auth-client';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let showPassword = $state(false);
	let isSubmitting = $state(false);
	let isGoogleLoading = $state(false);

	async function signInWithGoogle() {
		isGoogleLoading = true;
		try {
			await authClient.signIn.social({ provider: 'google', callbackURL: '/account' });
		} catch {
			isGoogleLoading = false;
		}
	}
</script>

<svelte:head>
	<title>অ্যাকাউন্ট তৈরি করুন | নতুন একাউন্ট</title>
	<meta name="description" content="একটি নতুন একাউন্ট তৈরি করে কেনাকাটা ও অর্ডার ট্র্যাকিং করুন।" />
</svelte:head>

<StoreLayout>
	<div class="py-10 sm:py-16 px-4 flex items-center justify-center font-['Anek_Bangla',sans-serif]">
		<div class="w-full max-w-md">
			<!-- Back to store button -->
			<div class="mb-4">
				<a
					href="/"
					class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#5845eb] transition-colors"
				>
					<ArrowLeft class="w-3.5 h-3.5" />
					<span>হোমপেজে ফিরে যান</span>
				</a>
			</div>

			<Card class="border border-slate-200/90 shadow-sm rounded-3xl overflow-hidden bg-white">
				<!-- Header Section -->
				<CardHeader class="text-center pt-8 pb-4 px-6 sm:px-8">
					<div class="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb] mb-3 shadow-2xs">
						<UserPlus class="w-6 h-6" />
					</div>
					<h1 class="text-2xl font-black text-slate-900 tracking-tight">অ্যাকাউন্ট তৈরি করুন</h1>
					<CardDescription class="text-xs text-slate-500 mt-1 font-medium">
						সহজেই অর্ডার ট্র্যাক করতে এবং এক্সক্লুসিভ অফার পেতে যুক্ত হন
					</CardDescription>
				</CardHeader>

				<CardContent class="px-6 sm:px-8 pt-2 pb-6 space-y-4">
					{#if form?.message}
						<div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
							<AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
							<span>{form.message}</span>
						</div>
					{/if}

					<form
						action="?/signUpEmail"
						method="POST"
						class="space-y-4"
						onsubmit={() => (isSubmitting = true)}
					>
						<!-- Name Input -->
						<div class="space-y-1.5">
							<label for="reg-name" class="block text-xs font-bold text-slate-700">
								আপনার পুরো নাম <span class="text-rose-500">*</span>
							</label>
							<div class="relative">
								<User class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
								<Input
									id="reg-name"
									name="name"
									type="text"
									required
									placeholder="যেমন: মোঃ সাব্বির আহমেদ"
									class="pl-10 h-11 text-xs rounded-xl border-slate-200 focus-visible:ring-indigo-500"
								/>
							</div>
						</div>

						<!-- Email Input -->
						<div class="space-y-1.5">
							<label for="reg-email" class="block text-xs font-bold text-slate-700">
								ইমেইল অ্যাড্রেস <span class="text-rose-500">*</span>
							</label>
							<div class="relative">
								<Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
								<Input
									id="reg-email"
									name="email"
									type="email"
									required
									placeholder="example@mail.com"
									class="pl-10 h-11 text-xs rounded-xl border-slate-200 focus-visible:ring-indigo-500"
								/>
							</div>
						</div>

						<!-- Password Input -->
						<div class="space-y-1.5">
							<label for="reg-password" class="block text-xs font-bold text-slate-700">
								একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন <span class="text-rose-500">*</span>
							</label>
							<div class="relative">
								<Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
								<Input
									id="reg-password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									required
									minlength={6}
									placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
									class="pl-10 pr-10 h-11 text-xs rounded-xl border-slate-200 focus-visible:ring-indigo-500"
								/>
								<button
									type="button"
									onclick={() => (showPassword = !showPassword)}
									class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{#if showPassword}
										<EyeOff class="w-4 h-4" />
									{:else}
										<Eye class="w-4 h-4" />
									{/if}
								</button>
							</div>
						</div>

						<!-- Submit Button -->
						<Button
							type="submit"
							disabled={isSubmitting}
							class="w-full h-11 rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer mt-2"
						>
							{#if isSubmitting}
								<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
								<span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
							{:else}
								<UserPlus class="w-4 h-4" />
								<span>রেজিস্টার করুন</span>
							{/if}
						</Button>
					</form>

					<!-- Divider -->
					<div class="relative my-2">
						<div class="absolute inset-0 flex items-center">
							<span class="w-full border-t border-slate-200"></span>
						</div>
						<div class="relative flex justify-center text-[10px] uppercase tracking-wider">
							<span class="bg-white px-3 text-slate-400 font-bold">অথবা</span>
						</div>
					</div>

					<!-- Google Sign Up -->
					<Button
						type="button"
						variant="outline"
						disabled={isGoogleLoading}
						onclick={signInWithGoogle}
						class="w-full h-11 rounded-xl border-slate-200 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer"
					>
						{#if isGoogleLoading}
							<div class="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
							<span>Google-এ যাচ্ছে...</span>
						{:else}
							<svg class="w-4 h-4" viewBox="0 0 24 24">
								<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
								<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
								<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
								<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
							</svg>
							<span>Google দিয়ে রেজিস্টার করুন</span>
						{/if}
					</Button>
				</CardContent>

				<CardFooter class="flex flex-col gap-4 bg-slate-50/70 border-t border-slate-100 px-6 sm:px-8 py-5">
					<div class="text-center text-xs text-slate-600">
						ইতিমধ্যে একাউন্ট আছে?
						<a
							href="/auth/login"
							class="text-[#5845eb] font-bold hover:underline inline-flex items-center gap-1 ml-1"
						>
							<LogIn class="w-3.5 h-3.5" />
							<span>এখানে লগইন করুন</span>
						</a>
					</div>

					<div class="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
						<ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
						<span>আপনার গোপনীয়তা ও তথ্য শতভাগ সুরক্ষিত</span>
					</div>
				</CardFooter>
			</Card>
		</div>
	</div>
</StoreLayout>
