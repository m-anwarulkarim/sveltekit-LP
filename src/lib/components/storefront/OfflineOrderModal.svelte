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

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if network.isOfflineOrderModalOpen}
	<!-- Backdrop with Safe Click to Dismiss & Viewport Scroll Protection -->
	<div
		class="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto overscroll-contain font-['Anek_Bangla',sans-serif] animate-in fade-in duration-200"
		role="dialog"
		aria-modal="true"
		onclick={(e) => {
			if (e.target === e.currentTarget) handleClose();
		}}
	>
		<!-- Dialog Box: Responsive max-height with internal scroll for short screens/landscape -->
		<div
			class="relative w-full max-w-md max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
		>
			<!-- Top Close Button -->
			<button
				type="button"
				onclick={handleClose}
				class="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer z-20 shadow-xs"
				aria-label="Close dialog"
			>
				<X class="w-4 h-4" />
			</button>

			<!-- Inner Scrollable Content -->
			<div class="overflow-y-auto overscroll-contain p-4 sm:p-6 md:p-7 text-center">
				<!-- Top Visual Icon with Amber Pulse -->
				<div class="relative mx-auto w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4 flex items-center justify-center shrink-0">
					<span class="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-20 animate-ping"></span>
					<div class="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-inner">
						<WifiOff class="w-7 h-7 sm:w-8 sm:h-8" />
					</div>
				</div>

				<!-- Title & Subtitle -->
				<h3 class="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 leading-snug">
					ইন্টারনেট সংযোগ পাওয়া যাচ্ছে না
				</h3>
				<p class="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed max-w-sm mx-auto">
					আপনার ইন্টারনেট সাময়িকভাবে বিচ্ছিন্ন রয়েছে। নেট না থাকা অবস্থায় অনলাইনে অর্ডার সাবমিট করা সম্ভব নয়।
				</p>

				<!-- Reassuring Security Note -->
				<div class="bg-emerald-50/90 border border-emerald-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 mb-4 sm:mb-5 text-left flex items-start gap-2.5">
					<ShieldCheck class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
					<div class="text-xs text-emerald-950 leading-relaxed flex-1 min-w-0">
						<p class="font-bold text-emerald-900 mb-0.5">আপনার তথ্য সুরক্ষিত রয়েছে!</p>
						<p class="text-emerald-800/90 text-[11px] sm:text-xs">
							আপনার টাইপ করা নাম, মোবাইল ও ঠিকানা অক্ষত রয়েছে। ইন্টারনেট ফিরলেই ১-ক্লিকে অর্ডার সম্পন্ন হবে।
						</p>
						{#if network.offlineActionData?.customerPhone || network.offlineActionData?.total}
							<div class="mt-2 pt-2 border-t border-emerald-200/60 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-emerald-900">
								{#if network.offlineActionData?.customerPhone}
									<span><strong>মোবাইল:</strong> <span class="font-mono">{network.offlineActionData.customerPhone}</span></span>
								{/if}
								{#if network.offlineActionData?.total}
									<span><strong>মোট বিল:</strong> ৳{network.offlineActionData.total}</span>
								{/if}
							</div>
						{/if}
					</div>
				</div>

				<!-- Responsive Call-to-Order Actions -->
				<div class="space-y-2 sm:space-y-2.5">
					<!-- Hotline Direct Phone Call Button -->
					<a
						href="tel:{hotline.replace(/\s+/g, '')}"
						class="w-full inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.99] text-white font-bold text-xs sm:text-sm md:text-base shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
					>
						<PhoneCall class="w-4 h-4 shrink-0 animate-bounce" />
						<span class="flex flex-wrap items-center justify-center gap-1.5 text-center">
							<span>সরাসরি ফোনে অর্ডার:</span>
							<span class="font-mono tracking-wider underline underline-offset-2">{hotline}</span>
						</span>
					</a>

					{#if whatsapp}
						<!-- WhatsApp Backup -->
						<a
							href="https://wa.me/{whatsapp.replace(/\D/g, '')}?text={encodeURIComponent('হ্যালো, আমার ইন্টারনেট সাময়িকভাবে বিচ্ছিন্ন থাকায় সরাসরি মেসেজে অর্ডার দিতে চাই।')}"
							target="_blank"
							rel="noopener noreferrer"
							class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-[0.99] text-emerald-800 font-bold text-xs sm:text-sm border border-emerald-200 transition-colors cursor-pointer"
						>
							<MessageCircle class="w-4 h-4 text-emerald-600 shrink-0" />
							<span>হোয়াটসঅ্যাপে অর্ডার পাঠান</span>
						</a>
					{/if}

					<!-- Reconnect & Submit Retry Button -->
					<Button
						type="button"
						variant="outline"
						onclick={handleRetryAndSubmit}
						disabled={isRetrying || network.isReconnecting}
						class="w-full py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border-slate-200 hover:bg-slate-50 active:scale-[0.99] text-slate-700 cursor-pointer"
					>
						<RotateCw class="w-3.5 h-3.5 mr-2 shrink-0 {isRetrying || network.isReconnecting ? 'animate-spin text-emerald-600' : ''}" />
						<span class="truncate">
							{isRetrying || network.isReconnecting ? 'সংযোগ পরীক্ষা হচ্ছে...' : 'কানেকশন চেক করে আবার সাবমিট করুন'}
						</span>
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
