<script lang="ts">
	import {
		Calendar,
		CalendarClock,
		Clock,
		X,
		ChevronDown,
		Check,
		RotateCcw,
		Sparkles
	} from 'lucide-svelte';
	import { Button } from '#lib/components/ui';

	interface Props {
		activeRange: string;
		activeFrom: string | null;
		activeTo: string | null;
		onSelectRange: (range: string, from?: string, to?: string) => void;
	}

	let {
		activeRange = 'today',
		activeFrom = null,
		activeTo = null,
		onSelectRange
	}: Props = $props();

	function toDateTimeLocalString(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	}

	function getDefaultFrom(): string {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		return toDateTimeLocalString(d);
	}

	function getDefaultTo(): string {
		return toDateTimeLocalString(new Date());
	}

	let isCustomModalOpen = $state(false);
	let customFrom = $state(activeFrom || getDefaultFrom());
	let customTo = $state(activeTo || getDefaultTo());
	let validationError = $state<string | null>(null);

	// Sync when activeFrom/activeTo props change
	$effect(() => {
		if (activeFrom) customFrom = activeFrom;
		if (activeTo) customTo = activeTo;
	});

	const PRESETS = [
		{ id: 'today', label: 'আজকে' },
		{ id: 'yesterday', label: 'গতকাল' },
		{ id: '7days', label: 'গত ৭ দিন' },
		{ id: '30days', label: 'গত ৩০ দিন' },
		{ id: 'thisMonth', label: 'এই মাস' }
	];

	function handlePresetClick(rangeId: string) {
		isCustomModalOpen = false;
		validationError = null;
		onSelectRange(rangeId);
	}

	function handleOpenCustom() {
		isCustomModalOpen = !isCustomModalOpen;
		validationError = null;
	}

	function applyQuickShortcut(type: 'today_start' | '24h' | '3days' | '7days' | 'this_month') {
		const now = new Date();
		customTo = toDateTimeLocalString(now);

		if (type === 'today_start') {
			const d = new Date();
			d.setHours(0, 0, 0, 0);
			customFrom = toDateTimeLocalString(d);
		} else if (type === '24h') {
			const d = new Date(now.getTime() - 24 * 60 * 60 * 1000);
			customFrom = toDateTimeLocalString(d);
		} else if (type === '3days') {
			const d = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
			customFrom = toDateTimeLocalString(d);
		} else if (type === '7days') {
			const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			customFrom = toDateTimeLocalString(d);
		} else if (type === 'this_month') {
			const d = new Date();
			d.setDate(1);
			d.setHours(0, 0, 0, 0);
			customFrom = toDateTimeLocalString(d);
		}
		validationError = null;
	}

	function handleApplyCustom() {
		if (!customFrom || !customTo) {
			validationError = 'শুরু এবং শেষের সময় উভয়ই নির্বাচন করুন।';
			return;
		}

		const fromTs = new Date(customFrom).getTime();
		const toTs = new Date(customTo).getTime();

		if (isNaN(fromTs) || isNaN(toTs)) {
			validationError = 'অনুগ্রহ করে সঠিক তারিখ ও সময় দিন।';
			return;
		}

		if (fromTs > toTs) {
			validationError = 'শুরুর সময় শেষের সময়ের চেয়ে বেশি হতে পারবে না।';
			return;
		}

		validationError = null;
		isCustomModalOpen = false;
		onSelectRange('custom', customFrom, customTo);
	}

	function formatDisplayDateTime(str: string | null): string {
		if (!str) return '';
		try {
			const d = new Date(str);
			if (isNaN(d.getTime())) return str;
			return d.toLocaleString('bn-BD', {
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return str;
		}
	}
</script>

<div class="relative flex flex-col sm:flex-row items-start sm:items-center gap-2">
	<!-- 1. Presets + Custom Button Bar -->
	<div
		class="inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/90 shadow-2xs max-w-full overflow-x-auto no-scrollbar"
	>
		{#each PRESETS as preset}
			<button
				type="button"
				onclick={() => handlePresetClick(preset.id)}
				class="rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap {activeRange ===
				preset.id
					? 'bg-white text-[#5845eb] shadow-xs'
					: 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'}"
			>
				{preset.label}
			</button>
		{/each}

		<div class="h-4 w-px bg-slate-300 mx-0.5"></div>

		<!-- Custom Time Trigger Button -->
		<button
			type="button"
			onclick={handleOpenCustom}
			class="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap {activeRange ===
			'custom'
				? 'bg-[#5845eb] text-white shadow-xs shadow-[#5845eb]/30'
				: isCustomModalOpen
					? 'bg-white text-[#5845eb] shadow-xs'
					: 'text-slate-700 hover:text-[#5845eb] hover:bg-slate-200/60'}"
		>
			<CalendarClock class="w-3.5 h-3.5 {activeRange === 'custom' ? 'text-white' : 'text-[#5845eb]'}" />
			<span>কাস্টম সময়</span>
			<ChevronDown class="w-3 h-3 transition-transform {isCustomModalOpen ? 'rotate-180' : ''}" />
		</button>
	</div>

	<!-- 2. Active Custom Range Badge (if custom is active) -->
	{#if activeRange === 'custom' && activeFrom && activeTo}
		<div
			class="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50/90 border border-violet-200 rounded-xl text-xs font-semibold text-violet-800 animate-in fade-in zoom-in-95 duration-150"
		>
			<Clock class="w-3.5 h-3.5 text-[#5845eb]" />
			<span>
				{formatDisplayDateTime(activeFrom)} — {formatDisplayDateTime(activeTo)}
			</span>
			<button
				type="button"
				onclick={() => handlePresetClick('today')}
				title="কাস্টম ফিল্টার রিসেট করুন"
				class="p-0.5 hover:bg-violet-200 rounded-md text-violet-600 transition-colors cursor-pointer"
			>
				<X class="w-3 h-3" />
			</button>
		</div>
	{/if}

	<!-- 3. Floating Custom Time Picker Popover Card -->
	{#if isCustomModalOpen}
		<!-- Backdrop for mobile / outside click -->
		<button
			type="button"
			class="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] cursor-default"
			onclick={() => (isCustomModalOpen = false)}
			aria-label="Close dialog"
		></button>

		<div
			class="absolute right-0 top-full mt-2 z-50 w-[340px] sm:w-[380px] bg-white rounded-3xl border border-slate-200/95 shadow-2xl p-4 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in slide-in-from-top-2 duration-150"
		>
			<!-- Card Header -->
			<div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-3.5">
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-xl bg-violet-50 text-[#5845eb] flex items-center justify-center">
						<CalendarClock class="w-4 h-4 stroke-[2.2]" />
					</div>
					<div>
						<h3 class="text-sm font-bold text-slate-900">কাস্টম সময় ও তারিখ</h3>
						<p class="text-[11px] text-slate-500 font-['Anek_Bangla',sans-serif]">নির্দিষ্ট সময়ের ভিজিটর ডেটা ফিল্টার করুন</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (isCustomModalOpen = false)}
					class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Quick Shortcuts -->
			<div class="mb-4">
				<span class="text-[11px] font-bold text-slate-500 block mb-1.5 font-['Anek_Bangla',sans-serif]">
					কুইক শর্টকাট:
				</span>
				<div class="flex flex-wrap gap-1.5">
					<button
						type="button"
						onclick={() => applyQuickShortcut('today_start')}
						class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-violet-50 hover:text-[#5845eb] text-slate-700 text-[11px] font-bold transition-all cursor-pointer font-['Anek_Bangla',sans-serif]"
					>
						আজ সকাল থেকে
					</button>
					<button
						type="button"
						onclick={() => applyQuickShortcut('24h')}
						class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-violet-50 hover:text-[#5845eb] text-slate-700 text-[11px] font-bold transition-all cursor-pointer font-['Anek_Bangla',sans-serif]"
					>
						গত ২৪ ঘণ্টা
					</button>
					<button
						type="button"
						onclick={() => applyQuickShortcut('3days')}
						class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-violet-50 hover:text-[#5845eb] text-slate-700 text-[11px] font-bold transition-all cursor-pointer font-['Anek_Bangla',sans-serif]"
					>
						গত ৩ দিন
					</button>
					<button
						type="button"
						onclick={() => applyQuickShortcut('7days')}
						class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-violet-50 hover:text-[#5845eb] text-slate-700 text-[11px] font-bold transition-all cursor-pointer font-['Anek_Bangla',sans-serif]"
					>
						গত ৭ দিন
					</button>
					<button
						type="button"
						onclick={() => applyQuickShortcut('this_month')}
						class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-violet-50 hover:text-[#5845eb] text-slate-700 text-[11px] font-bold transition-all cursor-pointer font-['Anek_Bangla',sans-serif]"
					>
						চলতি মাস
					</button>
				</div>
			</div>

			<!-- Form Inputs -->
			<div class="space-y-3 mb-4">
				<!-- From Input -->
				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1 font-['Anek_Bangla',sans-serif]">
						শুরুর তারিখ ও সময় (From):
					</label>
					<div class="relative">
						<input
							type="datetime-local"
							bind:value={customFrom}
							class="w-full h-10 px-3 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5845eb] focus:bg-white focus:ring-2 focus:ring-[#5845eb]/10 transition-all cursor-pointer"
						/>
					</div>
				</div>

				<!-- To Input -->
				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1 font-['Anek_Bangla',sans-serif]">
						শেষের তারিখ ও সময় (To):
					</label>
					<div class="relative">
						<input
							type="datetime-local"
							bind:value={customTo}
							class="w-full h-10 px-3 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5845eb] focus:bg-white focus:ring-2 focus:ring-[#5845eb]/10 transition-all cursor-pointer"
						/>
					</div>
				</div>
			</div>

			<!-- Validation Error -->
			{#if validationError}
				<div
					class="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold font-['Anek_Bangla',sans-serif]"
				>
					{validationError}
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 font-['Anek_Bangla',sans-serif]">
				<Button
					variant="ghost"
					size="sm"
					onclick={() => handlePresetClick('today')}
					class="rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-9 px-3 gap-1"
				>
					<RotateCcw class="w-3.5 h-3.5" />
					<span>আজকে রিসেট</span>
				</Button>

				<Button
					size="sm"
					onclick={handleApplyCustom}
					class="rounded-xl bg-[#5845eb] hover:bg-[#4834d4] text-white text-xs font-bold h-9 px-4 shadow-sm shadow-[#5845eb]/30 gap-1.5"
				>
					<Check class="w-3.5 h-3.5 stroke-[2.5]" />
					<span>ফিল্টার প্রয়োগ করুন</span>
				</Button>
			</div>
		</div>
	{/if}
</div>
