<script lang="ts">
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Card, CardHeader, CardDescription, CardContent } from '#lib/components/ui/card';
	import { Lock, Eye, EyeOff, ShieldCheck, ShieldAlert, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>নতুন পাসওয়ার্ড তৈরি করুন | আপনার একাউন্ট</title>
	<meta name="description" content="আপনার অ্যাকাউন্টের জন্য একটি নতুন ও শক্তিশালী পাসওয়ার্ড সেট করুন।" />
</svelte:head>

<StoreLayout>
	<div class="py-10 sm:py-16 px-4 flex items-center justify-center font-['Anek_Bangla',sans-serif]">
		<div class="w-full max-w-md">
			<!-- Back navigation -->
			<div class="mb-4">
				<a
					href="/auth/login"
					class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#5845eb] transition-colors"
				>
					<ArrowLeft class="w-3.5 h-3.5" />
					<span>লগইন পেজে ফিরে যান</span>
				</a>
			</div>

			<Card class="border border-slate-200/90 shadow-sm rounded-3xl overflow-hidden bg-white">
				{#if !data.validToken}
					<!-- Invalid / Expired Token Screen -->
					<CardHeader class="text-center pt-8 pb-4 px-6 sm:px-8">
						<div class="mx-auto w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-3 shadow-2xs">
							<ShieldAlert class="w-6 h-6" />
						</div>
						<h1 class="text-2xl font-black text-slate-900 tracking-tight">লিংকটি অকার্যকর বা মেয়াদোত্তীর্ণ</h1>
						<CardDescription class="text-xs text-slate-500 mt-1 font-medium">
							নিরাপত্তার কারণে পাসওয়ার্ড রিসেট লিংকটি নির্দিষ্ট সময়ের পর বাতিল হয়ে যায়
						</CardDescription>
					</CardHeader>

					<CardContent class="px-6 sm:px-8 pt-2 pb-8 space-y-4">
						<div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs leading-relaxed">
							অনুগ্রহ করে নতুন একটি পাসওয়ার্ড রিসেট লিংকের জন্য অনুরোধ করুন।
						</div>

						<div class="pt-2 flex flex-col gap-2">
							<Button
								href="/auth/forgot-password"
								class="w-full h-11 rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold shadow-sm shadow-indigo-600/30 cursor-pointer"
							>
								নতুন রিসেট লিংকের অনুরোধ করুন
							</Button>
							<Button
								variant="outline"
								href="/auth/login"
								class="w-full h-10 rounded-xl text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer"
							>
								লগইন পেজে ফিরে যান
							</Button>
						</div>
					</CardContent>
				{:else}
					<!-- Valid Token: Reset Form -->
					<CardHeader class="text-center pt-8 pb-4 px-6 sm:px-8">
						<div class="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb] mb-3 shadow-2xs">
							<ShieldCheck class="w-6 h-6" />
						</div>
						<h1 class="text-2xl font-black text-slate-900 tracking-tight">নতুন পাসওয়ার্ড সেট করুন</h1>
						<CardDescription class="text-xs text-slate-500 mt-1 font-medium">
							আপনার অ্যাকাউন্টের জন্য একটি শক্তিশালী নতুন পাসওয়ার্ড লিখুন
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
							action="?/resetPassword"
							method="POST"
							class="space-y-4"
							onsubmit={() => (isSubmitting = true)}
						>
							<input type="hidden" name="token" value={data.token} />

							<!-- New Password -->
							<div class="space-y-1.5">
								<label for="new-password" class="block text-xs font-bold text-slate-700">
									নতুন পাসওয়ার্ড <span class="text-rose-500">*</span>
								</label>
								<div class="relative">
									<Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
									<Input
										id="new-password"
										name="password"
										type={showPassword ? 'text' : 'password'}
										required
										minlength={6}
										placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
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
								<p class="text-[10px] text-slate-400">কমপক্ষে ৬টি অক্ষর হতে হবে</p>
							</div>

							<!-- Confirm Password -->
							<div class="space-y-1.5">
								<label for="confirm-password" class="block text-xs font-bold text-slate-700">
									নতুন পাসওয়ার্ড নিশ্চিত করুন <span class="text-rose-500">*</span>
								</label>
								<div class="relative">
									<Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
									<Input
										id="confirm-password"
										name="confirmPassword"
										type={showConfirmPassword ? 'text' : 'password'}
										required
										minlength={6}
										placeholder="পুনরায় একই পাসওয়ার্ড লিখুন"
										class="pl-10 pr-10 h-11 text-xs rounded-xl border-slate-200 focus-visible:ring-indigo-500"
									/>
									<button
										type="button"
										onclick={() => (showConfirmPassword = !showConfirmPassword)}
										class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
										aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
									>
										{#if showConfirmPassword}
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
									<span>পরিবর্তন করা হচ্ছে...</span>
								{:else}
									<ShieldCheck class="w-4 h-4" />
									<span>পাসওয়ার্ড পরিবর্তন করুন</span>
								{/if}
							</Button>
						</form>
					</CardContent>
				{/if}
			</Card>
		</div>
	</div>
</StoreLayout>
