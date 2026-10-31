<script lang="ts">
	import { onMount } from 'svelte';
	import { X, ArrowRight, Sparkles, Tag } from 'lucide-svelte';

	interface PopupData {
		id: string;
		title: string;
		imageUrl?: string | null;
		targetUrl?: string | null;
		triggerType?: string | null;
		delaySeconds?: number | null;
		status?: string | null;
	}

	let { popup }: { popup?: PopupData | null } = $props();

	let isOpen = $state(false);
	let isClosing = $state(false);

	function closePopup() {
		isClosing = true;
		setTimeout(() => {
			isOpen = false;
			isClosing = false;
		}, 200);

		if (popup?.id && typeof window !== 'undefined') {
			try {
				sessionStorage.setItem(`aura_popup_seen_${popup.id}`, 'true');
			} catch (e) {
				// Ignore storage errors in private browsing
			}
		}
	}

	onMount(() => {
		if (!popup || !popup.id) return;
		if (popup.status !== 'active' && popup.status !== 'PUBLISH') return;

		// Check if already seen in current session
		try {
			if (sessionStorage.getItem(`aura_popup_seen_${popup.id}`) === 'true') {
				return;
			}
		} catch (e) {
			// ignore
		}

		const trigger = popup.triggerType || 'delay_seconds';

		if (trigger === 'on_load') {
			const timer = setTimeout(() => {
				isOpen = true;
			}, 1000);
			return () => clearTimeout(timer);
		} else if (trigger === 'delay_seconds') {
			const delay = Math.max(1, popup.delaySeconds || 5) * 1000;
			const timer = setTimeout(() => {
				isOpen = true;
			}, delay);
			return () => clearTimeout(timer);
		} else if (trigger === 'exit_intent') {
			let triggered = false;
			const handleMouseLeave = (e: MouseEvent) => {
				if (e.clientY <= 0 && !triggered) {
					triggered = true;
					isOpen = true;
					document.removeEventListener('mouseleave', handleMouseLeave);
				}
			};

			// Wait 3s before attaching exit intent to avoid accidental triggers
			const waitTimer = setTimeout(() => {
				document.addEventListener('mouseleave', handleMouseLeave);
			}, 3000);

			return () => {
				clearTimeout(waitTimer);
				document.removeEventListener('mouseleave', handleMouseLeave);
			};
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			closePopup();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen && popup}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 {isClosing
			? 'opacity-0'
			: 'opacity-100'}"
		role="dialog"
		aria-modal="true"
		aria-labelledby="promo-popup-title"
	>
		<!-- Backdrop click to dismiss -->
		<button
			type="button"
			class="absolute inset-0 w-full h-full cursor-default"
			onclick={closePopup}
			aria-label="Close modal backdrop"
		></button>

		<!-- Popup Card -->
		<div
			class="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm sm:max-w-md w-full overflow-hidden z-10 transition-all duration-200 transform font-['Anek_Bangla',sans-serif] {isClosing
				? 'scale-95 opacity-0'
				: 'scale-100 opacity-100 animate-in zoom-in-95'}"
		>
			<!-- Close Button (Top Right) -->
			<button
				type="button"
				onclick={closePopup}
				class="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
				aria-label="Close offer modal"
			>
				<X class="w-4 h-4" />
			</button>

			<!-- Banner Media Area -->
			{#if popup.imageUrl}
				<div class="relative w-full h-44 sm:h-52 bg-gradient-to-tr from-slate-900 to-indigo-950 overflow-hidden">
					<img
						src={popup.imageUrl}
						alt={popup.title}
						class="w-full h-full object-cover"
						loading="lazy"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
					<div class="absolute bottom-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 text-white text-[11px] font-bold shadow-xs backdrop-blur-xs">
						<Sparkles class="w-3.5 h-3.5" />
						<span>সীমিত সময়ের অফার</span>
					</div>
				</div>
			{/if}

			<!-- Popup Content Area -->
			<div class="p-5 sm:p-6 text-center space-y-4">
				<div class="space-y-1.5">
					<h3
						id="promo-popup-title"
						class="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug"
					>
						{popup.title}
					</h3>
					<p class="text-xs text-slate-500">
						সেরা পণ্যগুলো আকর্ষণীয় ডিসকাউন্টে সংগ্রহ করতে এখনই অফারটিতে যোগ দিন!
					</p>
				</div>

				<!-- CTA Buttons -->
				<div class="pt-1 flex flex-col gap-2">
					<a
						href={popup.targetUrl || '/catalog/all-product'}
						onclick={closePopup}
						class="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
					>
						<span>অফারটি উপভোগ করুন</span>
						<ArrowRight class="w-4 h-4" />
					</a>

					<button
						type="button"
						onclick={closePopup}
						class="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors py-1 cursor-pointer"
					>
						ধন্যবাদ, আমি পরে দেখবো
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

