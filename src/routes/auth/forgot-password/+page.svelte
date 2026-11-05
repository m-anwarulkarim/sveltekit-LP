<script lang="ts">
	import StoreLayout from '#lib/modules/layout/components/StoreLayout.svelte';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Card, CardHeader, CardDescription, CardContent } from '#lib/components/ui/card';
	import { Mail, KeyRound, ArrowLeft, AlertCircle, CheckCircle2, PhoneCall, HelpCircle } from 'lucide-svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>পাসওয়ার্ড রিসেট | আপনার একাউন্ট</title>
	<meta name="description" content="আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার লিংক পান।" />
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
				<!-- Header Section -->
				<CardHeader class="text-center pt-8 pb-4 px-6 sm:px-8">
					<div class="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb] mb-3 shadow-2xs">
						<KeyRound class="w-6 h-6" />
					</div>
					<h1 class="text-2xl font-black text-slate-900 tracking-tight">পাসওয়ার্ড ভুলে গেছেন?</h1>
					<CardDescription class="text-xs text-slate-500 mt-1 font-medium">
						আপনার অ্যাকাউন্টের ইমেইল ঠিকানাটি লিখুন, আমরা পাসওয়ার্ড রিসেটের লিংক পাঠাবো
					</CardDescription>
				</CardHeader>

				<CardContent class="px-6 sm:px-8 pt-2 pb-6 space-y-4">
					{#if form?.message}
						<div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
							<AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
							<span>{form.message}</span>
						</div>
					{/if}

					{#if form?.success}
						<!-- Success State -->
						<div class="space-y-4 animate-in fade-in zoom-in-95 duration-200">
							<div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-center space-y-2">
								<div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
									<CheckCircle2 class="w-6 h-6" />
								</div>
								<h2 class="text-base font-bold text-emerald-900">ইমেইল চেক করুন!</h2>
								<p class="text-xs text-emerald-700 leading-relaxed">
									যদি <strong>{form.email}</strong> দিয়ে কোনো অ্যাকাউন্ট থেকে থাকে, তবে আমরা পাসওয়ার্ড রিসেটের নির্দেশনাসহ একটি লিংক পাঠিয়েছি।
								</p>
							</div>

							<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-1.5">
								<div class="flex items-center gap-1.5 font-bold text-slate-700">
									<HelpCircle class="w-3.5 h-3.5 text-indigo-500" />
									<span>ইমেইল পাচ্ছেন না?</span>
								</div>
								<p class="text-[11px] text-slate-500 leading-relaxed">
									• অনুগ্রহ করে আপনার Spam অথবা Junk ফোল্ডার চেক করুন।<br />
									• লিংকটির মেয়াদ ১ ঘণ্টা পর্যন্ত বহাল থাকবে।
								</p>
								{#if data.storeConfig?.hotlinePhone}
									<div class="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
										<span class="text-slate-500">সহায়তার জন্য কল করুন:</span>
										<a
											href="tel:{data.storeConfig.hotlinePhone}"
											class="font-bold text-[#5845eb] inline-flex items-center gap-1 hover:underline"
										>
											<PhoneCall class="w-3 h-3" />
											{data.storeConfig.hotlinePhone}
										</a>
									</div>
								{/if}
							</div>

							<div class="pt-2 flex flex-col gap-2">
								<Button
									href="/auth/login"
									class="w-full h-11 rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold shadow-sm shadow-indigo-600/30 cursor-pointer"
								>
									লগইন পেজে যান
								</Button>
								<Button
									variant="outline"
									onclick={() => window.location.reload()}
									class="w-full h-10 rounded-xl text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer"
								>
									অন্য ইমেইল দিয়ে চেষ্টা করুন
								</Button>
							</div>
						</div>
					{:else}
						<!-- Request Form -->
						<form
							action="?/requestReset"
							method="POST"
							class="space-y-4"
							onsubmit={() => (isSubmitting = true)}
						>
							<div class="space-y-1.5">
								<label for="reset-email" class="block text-xs font-bold text-slate-700">
									আপনার নিবন্ধিত ইমেইল <span class="text-rose-500">*</span>
								</label>
								<div class="relative">
									<Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
									<Input
										id="reset-email"
										name="email"
										type="email"
										required
										placeholder="example@mail.com"
										class="pl-10 h-11 text-xs rounded-xl border-slate-200 focus-visible:ring-indigo-500"
									/>
								</div>
							</div>

							{#if !data.isEmailEnabled && data.storeConfig?.hotlinePhone}
								<div class="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
									<HelpCircle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
									<div>
										স্বয়ংক্রিয় ইমেইল সেবা সাময়িক বন্ধ থাকলে সরাসরি আমাদের কল করতে পারেন:
										<a href="tel:{data.storeConfig.hotlinePhone}" class="font-bold underline ml-1">
											{data.storeConfig.hotlinePhone}
										</a>
									</div>
								</div>
							{/if}

							<Button
								type="submit"
								disabled={isSubmitting}
								class="w-full h-11 rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer mt-2"
							>
								{#if isSubmitting}
									<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									<span>পাঠানো হচ্ছে...</span>
								{:else}
									<Mail class="w-4 h-4" />
									<span>রিসেট লিংক পাঠান</span>
								{/if}
							</Button>
						</form>

						<div class="pt-2 text-center text-xs text-slate-500">
							মনে পড়েছে?
							<a href="/auth/login" class="font-bold text-[#5845eb] hover:underline ml-1">
								লগইন করুন
							</a>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>
	</div>
</StoreLayout>
