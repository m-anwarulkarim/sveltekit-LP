<script lang="ts">
	import { page } from '$app/state';
	import { network } from '#lib/stores/network.svelte';
	import { Button } from '#lib/components/ui';
	import { WifiOff, PhoneCall, RotateCw, X, ShieldCheck, MessageCircle } from 'lucide-svelte';

	let isRetrying = $state(false);

	const hotline = $derived(
		page.data?.storeConfig?.hotlinePhone ||
		page.data?.websiteInfo?.hotlinePhone ||
		'0156007230'
	);

	const whatsapp = $derived(
		page.data?.websiteInfo?.whatsappNumber || ''
	);

	async function handleRetryAndSubmit() {
		if (isRetrying) return;
		isRetrying = true;
		try {
			const connected = await network.checkConnection();
			if (connected) {
				const retryFn = network.offlineActionData?.retryAction;
				network.closeOfflineOrderModal();
				if (typeof retryFn === 'function') {
					await retryFn();
				}
			}
		} finally {
			isRetrying = false;
		}
	}

	function handleClose() {
		network.closeOfflineOrderModal();
	}
</script>

{#if network.isOfflineOrderModalOpen}
	<div
		class="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 font-['Anek_Bangla',sans-serif] animate-in fade-in duration-200"
		role="dialog"
		aria-modal="true"
	>
		<!-- Dialog Box -->
		<div
			class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 text-center overflow-hidden animate-in zoom-in-95 duration-200"
		>
			<!-- Top Close Button -->
			<button
				type="button"
				onclick={handleClose}
				class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
				aria-label="Close"
			>
				<X class="w-4 h-4" />
			</button>

			<!-- Top Visual Icon with Amber Pulse -->
			<div class="relative mx-auto w-16 h-16 mb-4 flex items-center justify-center">
				<span class="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-20 animate-ping"></span>
				<div class="relative w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-inner">
					<WifiOff class="w-8 h-8" />
				</div>
			</div>

			<!-- Title & Message -->
			<h3 class="text-xl font-bold text-slate-900 mb-1.5">
				ইন্টারনেট সংযোগ পাওয়া যাচ্ছে না
			</h3>
			<p class="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
				আপনার ইন্টারনেট সাময়িকভাবে বিচ্ছিন্ন রয়েছে। নেট না থাকা অবস্থায় অনলাইনে অর্ডার সাবমিট করা সম্ভব নয়।
			</p>

			<!-- Reassuring Security Note -->
			<div class="bg-emerald-50/80 border border-emerald-200/70 rounded-2xl p-3 sm:p-3.5 mb-5 text-left flex items-start gap-2.5">
				<ShieldCheck class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
				<div class="text-xs text-emerald-950 leading-relaxed">
					<p class="font-bold text-emerald-900 mb-0.5">আপনার তথ্য নিরাপদ আছে!</p>
					<p class="text-emerald-800/90 text-[11px] sm:text-xs">
						আপনার টাইপ করা নাম, মোবাইল ও ঠিকানা অক্ষত রয়েছে। ইন্টারনেট ফিরলেই ১-ক্লিকে অর্ডার সম্পন্ন হবে।
					</p>
					{#if network.offlineActionData?.customerPhone}
						<p class="text-[11px] font-mono font-medium text-emerald-950 mt-1">
							নম্বর: {network.offlineActionData.customerPhone}
						</p>
					{/if}
				</div>
			</div>

			<!-- Call-to-Order Actions -->
			<div class="space-y-2.5">
				<!-- Hotline Direct Phone Call Button -->
				<a
					href="tel:{hotline.replace(/\s+/g, '')}"
					class="w-full inline-flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
				>
					<PhoneCall class="w-4 h-4 animate-bounce" />
					<span>সরাসরি ফোনে অর্ডার করুন ({hotline})</span>
				</a>

				{#if whatsapp}
					<!-- WhatsApp Backup -->
					<a
						href="https://wa.me/{whatsapp.replace(/\D/g, '')}?text={encodeURIComponent('হ্যালো, আমার নেটওয়ার্কে সমস্যা হওয়ায় ওয়েবসাইট থেকে সরাসরি মেসেজে অর্ডার দিতে চাই।')}"
						target="_blank"
						rel="noopener noreferrer"
						class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm border border-emerald-200 transition-colors"
					>
						<MessageCircle class="w-4 h-4 text-emerald-600" />
						<span>হোয়াটসঅ্যাপে অর্ডার পাঠান</span>
					</a>
				{/if}

				<!-- Reconnect & Submit Retry Button -->
				<Button
					type="button"
					variant="outline"
					onclick={handleRetryAndSubmit}
					disabled={isRetrying || network.isReconnecting}
					class="w-full py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
				>
					<RotateCw class="w-3.5 h-3.5 mr-2 {isRetrying || network.isReconnecting ? 'animate-spin text-emerald-600' : ''}" />
					{isRetrying || network.isReconnecting ? 'সংযোগ পরীক্ষা হচ্ছে...' : 'কানেকশন চেক করে আবার সাবমিট করুন'}
				</Button>
			</div>
		</div>
	</div>
{/if}
