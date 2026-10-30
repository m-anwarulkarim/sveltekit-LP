<script lang="ts">
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '#lib/components/ui/card';
	import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let showPassword = $state(false);
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>লগইন করুন | আপনার একাউন্ট</title>
	<meta name="description" content="আপনার একাউন্টে লগইন করুন এবং অর্ডার ট্র্যাক করুন।" />
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
						<LogIn class="w-6 h-6" />
					</div>
					<CardTitle class="text-2xl font-black text-slate-900 tracking-tight">লগইন করুন</CardTitle>
					<CardDescription class="text-xs text-slate-500 mt-1 font-medium">
						আপনার অর্ডার ট্র্যাক করতে এবং দ্রুত কেনাকাটা করতে একাউন্টে প্রবেশ করুন
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
						action="?/signInEmail"
						method="POST"
						class="space-y-4"
						onsubmit={() => (isSubmitting = true)}
					>
						<!-- Email Input -->
						<div class="space-y-1.5">
							<label for="login-email" class="block text-xs font-bold text-slate-700">
								ইমেইল অ্যাড্রেস <span class="text-rose-500">*</span>
							</label>
							<div class="relative">
								<Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
								<Input
									id="login-email"
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
							<div class="flex items-center justify-between">
								<label for="login-password" class="block text-xs font-bold text-slate-700">
									পাসওয়ার্ড <span class="text-rose-500">*</span>
								</label>
							</div>
							<div class="relative">
								<Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
								<Input
									id="login-password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									required
									placeholder="••••••••"
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
								<span>যাচাই করা হচ্ছে...</span>
							{:else}
								<LogIn class="w-4 h-4" />
								<span>লগইন করুন</span>
							{/if}
						</Button>
					</form>
				</CardContent>

				<CardFooter class="flex flex-col gap-4 bg-slate-50/70 border-t border-slate-100 px-6 sm:px-8 py-5">
					<div class="text-center text-xs text-slate-600">
						নতুন গ্রাহক?
						<a
							href="/auth/register"
							class="text-[#5845eb] font-bold hover:underline inline-flex items-center gap-1 ml-1"
						>
							<UserPlus class="w-3.5 h-3.5" />
							<span>নতুন অ্যাকাউন্ট তৈরি করুন</span>
						</a>
					</div>

					<div class="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
						<ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
						<span>আপনার তথ্য ১০০% এনক্রিপ্টেড এবং নিরাপদ</span>
					</div>
				</CardFooter>
			</Card>
		</div>
	</div>
</StoreLayout>
