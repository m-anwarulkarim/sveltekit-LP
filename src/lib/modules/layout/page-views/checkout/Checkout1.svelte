<script lang="ts">
	import { UserCheck, Lock, AlertCircle, LogIn, ShieldCheck, CheckCircle2 } from 'lucide-svelte';

	interface Props {
		user?: { name?: string; email?: string; phone?: string } | null;
		isStandalonePreview?: boolean;
	}

	let { user = null, isStandalonePreview = false }: Props = $props();

	// In preview mode, allow toggling simulated user state to test both guest & logged in view
	let previewAsGuest = $state(true);
</script>

<!-- Checkout 1: Member-First / Login Required Checkout -->
<div class="w-full bg-slate-50/70 p-4 sm:p-8 font-['Anek_Bangla',sans-serif]">
	<div class="max-w-4xl mx-auto space-y-6">
		<!-- Top Notice Banner -->
		<div class="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
			<div class="flex items-center gap-2.5">
				<div class="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
					<Lock class="w-4 h-4" />
				</div>
				<div>
					<h4 class="text-xs sm:text-sm font-bold text-slate-900">মেম্বার-ফার্স্ট সিকিউর চেকআউট</h4>
					<p class="text-[11px] text-slate-500">ভুয়া অর্ডার রোধ করতে গ্রাহকের অ্যাকাউন্টে লগইন থাকা বাধ্যতামূলক</p>
				</div>
			</div>
			<div class="flex items-center gap-2 self-start sm:self-auto">
				<span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
					LOGIN REQUIRED
				</span>
				{#if isStandalonePreview}
					<button
						type="button"
						onclick={() => (previewAsGuest = !previewAsGuest)}
						class="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-100"
					>
						{previewAsGuest ? 'লগইন ভিউ দেখুন' : 'গেস্ট ভিউ দেখুন'}
					</button>
				{/if}
			</div>
		</div>

		{#if (user == null && previewAsGuest)}
			<!-- Guest State: Login Gate Required Banner -->
			<div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm text-center max-w-lg mx-auto space-y-4">
				<div class="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200/60 text-rose-600 mx-auto flex items-center justify-center shadow-xs">
					<Lock class="w-8 h-8" />
				</div>
				<div>
					<h3 class="text-base sm:text-lg font-black text-slate-900">অর্ডার সম্পন্ন করতে লগইন করুন</h3>
					<p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
						নিরাপদ শপিং ও অর্ডার ট্র্যাকিং সুবিধার জন্য আপনার মোবাইল নম্বর বা ইমেইল দিয়ে লগইন করা আবশ্যক।
					</p>
				</div>

				<div class="pt-2 space-y-2.5">
					<button
						type="button"
						class="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
					>
						<LogIn class="w-4 h-4" />
						<span>লগইন / নতুন অ্যাকাউন্ট তৈরি করুন</span>
					</button>
					<span class="block text-[11px] text-slate-400">
						মাত্র ৩০ সেকেন্ডে ওটিপি (OTP) দিয়ে এক ক্লিকে লগইন করা যায়
					</span>
				</div>
			</div>
		{:else}
			<!-- Logged-in Member State: Verified Profile & Fast Checkout -->
			<div class="grid grid-cols-1 md:grid-cols-12 gap-6">
				<div class="md:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
					<div class="p-3 bg-emerald-50/80 border border-emerald-200/70 rounded-xl flex items-center gap-2.5">
						<div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
							<UserCheck class="w-4 h-4" />
						</div>
						<div class="min-w-0">
							<span class="text-xs font-bold text-emerald-900 block truncate">
								লগইনকৃত মেম্বার: {user?.name || 'আনোয়ারুল করিম'} ({user?.phone || '01700000000'})
							</span>
							<span class="text-[10px] text-emerald-700">সংরক্ষিত প্রোফাইল থেকে ঠিকানা নেওয়া হয়েছে</span>
						</div>
					</div>

					<div class="space-y-3 text-xs">
						<div>
							<label class="block font-bold text-slate-700 mb-1">ডেলিভারি ঠিকানা</label>
							<textarea class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 resize-none" rows="2" readonly>বাড়ি #১২, রোড #৪, ধানমন্ডি, ঢাকা</textarea>
						</div>
					</div>
				</div>

				<div class="md:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
					<h3 class="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex justify-between">
						<span>অর্ডার সামারি</span>
						<span class="text-xs font-mono text-blue-600 font-bold">৳৭৯৯</span>
					</h3>
					<button type="button" class="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md">
						<CheckCircle2 class="w-4 h-4" />
						<span>মেম্বার ওয়ান-ক্লিক অর্ডার কনফার্ম</span>
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

