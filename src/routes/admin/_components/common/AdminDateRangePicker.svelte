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
	import {
		toDateTimeLocalString,
		getDefaultFrom,
		getDefaultTo,
		formatDisplayDateTime
	} from './date-range-utils';

	interface Props {
		activeRange?: string;
		activeFrom?: string | null;
		activeTo?: string | null;
		onSelect: (range: string, from?: string, to?: string) => void;
		align?: 'left' | 'right';
		showPresets?: boolean;
		label?: string;
	}

	let {
		activeRange = 'today',
		activeFrom = null,
		activeTo = null,
		onSelect,
		align = 'right',
		showPresets = true,
		label = ''
	}: Props = $props();

	let isCustomModalOpen = $state(false);
	let customFrom = $state(activeFrom || getDefaultFrom());
	let customTo = $state(activeTo || getDefaultTo());
	let validationError = $state<string | null>(null);

	// Sync when activeFrom/activeTo props change
	$effect(() => {
		if (activeFrom) customFrom = activeFrom;
		if (activeTo) customTo = activeTo;
	});

	const DEFAULT_PRESETS = [
		{ id: 'today', label: 'আজকে' },
		{ id: 'yesterday', label: 'গতকাল' },
		{ id: '7days', label: 'গত ৭ দিন' },
		{ id: '30days', label: 'গত ৩০ দিন' },
		{ id: 'thisMonth', label: 'চলতি মাস' }
	];

	function handlePresetClick(rangeId: string) {
		isCustomModalOpen = false;
		validationError = null;
		onSelect(rangeId);
	}

	function handleOpenCustom() {
		isCustomModalOpen = !isCustomModalOpen;
		validationError = null;
	}

	function applyQuickShortcut(
		type: 'today_start' | 'yesterday' | '24h' | '3days' | '7days' | '30days' | 'this_month' | 'last_month'
	) {
		const now = new Date();

		if (type === 'today_start') {
			const d = new Date();
			d.setHours(0, 0, 0, 0);
			customFrom = toDateTimeLocalString(d);
			customTo = toDateTimeLocalString(now);
		} else if (type === 'yesterday') {
			const dStart = new Date();
			dStart.setDate(dStart.getDate() - 1);
			dStart.setHours(0, 0, 0, 0);
			const dEnd = new Date();
			dEnd.setDate(dEnd.getDate() - 1);
			dEnd.setHours(23, 59, 59, 999);
			customFrom = toDateTimeLocalString(dStart);
			customTo = toDateTimeLocalString(dEnd);
		} else if (type === '24h') {
			const d = new Date(now.getTime() - 24 * 60 * 60 * 1000);
			customFrom = toDateTimeLocalString(d);
			customTo = toDateTimeLocalString(now);
		} else if (type === '3days') {
			const d = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
			customFrom = toDateTimeLocalString(d);
			customTo = toDateTimeLocalString(now);
		} else if (type === '7days') {
			const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			customFrom = toDateTimeLocalString(d);
			customTo = toDateTimeLocalString(now);
		} else if (type === '30days') {
			const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			customFrom = toDateTimeLocalString(d);
			customTo = toDateTimeLocalString(now);
		} else if (type === 'this_month') {
			const d = new Date();
			d.setDate(1);
			d.setHours(0, 0, 0, 0);
			customFrom = toDateTimeLocalString(d);
			customTo = toDateTimeLocalString(now);
		} else if (type === 'last_month') {
			const dStart = new Date();
			dStart.setMonth(dStart.getMonth() - 1, 1);
			dStart.setHours(0, 0, 0, 0);
			const dEnd = new Date(dStart.getFullYear(), dStart.getMonth() + 1, 0, 23, 59, 59);
			customFrom = toDateTimeLocalString(dStart);
			customTo = toDateTimeLocalString(dEnd);
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
		onSelect('custom', customFrom, customTo);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isCustomModalOpen) {
			isCustomModalOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative flex flex-col sm:flex-row items-start sm:items-center gap-2">
	{#if label}
		<span class="text-xs font-bold text-slate-500 font-['Anek_Bangla',sans-serif]">{label}:</span>
	{/if}

	<!-- 1. Presets + Custom Button Bar -->
	<div
		class="inline-flex items-center gap-1 p-1 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs max-w-full overflow-x-auto no-scrollbar font-['Plus_Jakarta_Sans',sans-serif]"
	>
		{#if showPresets}
			{#each DEFAULT_PRESETS as preset}
				<button
					type="button"
					onclick={() => handlePresetClick(preset.id)}
					class="rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap {activeRange ===
					preset.id
						? 'bg-[#5845eb] text-white shadow-xs shadow-[#5845eb]/30'
						: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}"
				>
					{preset.label}
				</button>
			{/each}

			<div class="h-4 w-px bg-slate-200 mx-0.5"></div>
		{/if}

		<!-- Custom Time Trigger Button -->
		<button
			type="button"
			onclick={handleOpenCustom}
			class="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap {activeRange ===
			'custom'
				? 'bg-[#5845eb] text-white shadow-xs shadow-[#5845eb]/30'
				: isCustomModalOpen
					? 'bg-slate-100 text-[#5845eb]'
					: 'text-slate-700 hover:text-[#5845eb] hover:bg-slate-100/80'}"
		>
			<CalendarClock class="w-3.5 h-3.5 {activeRange === 'custom' ? 'text-white' : 'text-[#5845eb]'}" />
			<span>কাস্টম সময়</span>
			<ChevronDown class="w-3 h-3 transition-transform duration-200 {isCustomModalOpen ? 'rotate-180' : ''}" />
		</button>
	</div>

	<!-- 2. Active Custom Range Badge (if custom is active) -->
	{#if activeRange === 'custom' && activeFrom && activeTo}
		<div
			class="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50/95 border border-violet-200 rounded-xl text-xs font-semibold text-violet-800 animate-in fade-in zoom-in-95 duration-150 shadow-2xs"
		>
			<Clock class="w-3.5 h-3.5 text-[#5845eb]" />
			<span class="font-['Anek_Bangla',sans-serif]">
				{formatDisplayDateTime(activeFrom)} — {formatDisplayDateTime(activeTo)}
			</span>
			<button
				type="button"
				onclick={() => handlePresetClick('today')}
				title="ফিল্টার রিসেট করুন"
				class="p-0.5 hover:bg-violet-200/80 rounded-md text-violet-600 transition-colors cursor-pointer"
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
			class="fixed inset-0 z-40 bg-black/15 backdrop-blur-[1px] cursor-default"
			onclick={() => (isCustomModalOpen = false)}
			aria-label="Close dialog"
		></button>

		<div
			class="absolute {align === 'right' ? 'right-0' : 'left-0'} top-full mt-2.5 z-50 w-[340px] sm:w-[410px] max-w-[94vw] bg-white rounded-3xl border border-slate-200/95 shadow-2xl p-4 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/5"
		>
			<!-- Card Header -->
			<div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-3.5">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-[#5845eb] flex items-center justify-center shadow-2xs">
						<CalendarClock class="w-4.5 h-4.5 stroke-[2.2]" />
					</div>
					<div>
						<h3 class="text-sm font-black text-slate-900 tracking-tight">কাস্টম সময় ও তারিখ নির্বাচন</h3>
						<p class="text-[11px] text-slate-500 font-['Anek_Bangla',sans-serif]">নির্দিষ্ট সময়ের ডেটা ফিল্টার করুন</p>
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
					কুইক রেঞ্জ বেছে নিন:
				</span>
				<div class="flex flex-wrap gap-1.5">
					<button
						type="button"
						onclick={() => applyQuickShortcut('today_start')}
						class="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#5845eb] text-slate-700 text-[11px] font-bold transition-all border border-slate-200/80 cursor-pointer font-['Anek_Bangla',sans-serif]"
					>
						আজ সকাল থেকে
					</button>
					<button
						type="button"
						onclick={() => applyQuickShortcut('yesterday')}
						class="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#5845eb] text-slate-700 text-[11px] font-bold transition-all border border-slate-200/80 cursor-pointer font-['Anek_Bangla',sans-serif]"
					>
						গতকাল
					</button>
					<button
						type="button"
						onclick={() => applyQuickShortcut('24h')}
						class="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#5845eb] text-slate-700 text-[11px] font-bold transition-all border border-slate-200/80 cursor-pointer font-['Anek_Bangla',sans-serif]"
					>
						গত ২৪ ঘণ্টা
					</button>
					<button
						type="button"
						onclick={() => applyQuickShortcut('3days')}
						class="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#5845eb] text-slate-700 text-[11px] font-bold transition-all border border-slate-200/80 cursor-pointer font-['Anek_Bangla',sans-serif]"
					>
						গত ৩ দিন
					</button>
					<button
						type="button"
						onclick={() => applyQuickShortcut('7days')}
						class="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#5845eb] text-slate-700 text-[11px] font-bold transition-all border border-slate-200/80 cursor-pointer font-['Anek_Bangla',sans-serif]"
					>
						গত ৭ দিন
					</button>
					<button
						type="button"
						onclick={() => applyQuickShortcut('30days')}
						class="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#5845eb] text-slate-700 text-[11px] font-bold transition-all border border-slate-200/80 cursor-pointer font-['Anek_Bangla',sans-serif]"
					>
						গত ৩০ দিন
					</button>
					<button
						type="button"
						onclick={() => applyQuickShortcut('this_month')}
						class="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#5845eb] text-slate-700 text-[11px] font-bold transition-all border border-slate-200/80 cursor-pointer font-['Anek_Bangla',sans-serif]"
					>
						চলতি মাস
					</button>
					<button
						type="button"
						onclick={() => applyQuickShortcut('last_month')}
						class="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-[#5845eb] text-slate-700 text-[11px] font-bold transition-all border border-slate-200/80 cursor-pointer font-['Anek_Bangla',sans-serif]"
					>
						গত মাস
					</button>
				</div>
			</div>

			<!-- Form Inputs -->
			<div class="space-y-3 mb-4">
				<!-- From Input -->
				<div class="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80">
					<label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5 font-['Anek_Bangla',sans-serif]">
						<Calendar class="w-3.5 h-3.5 text-[#5845eb]" />
						<span>শুরুর তারিখ ও সময় (From):</span>
					</label>
					<input
						type="datetime-local"
						bind:value={customFrom}
						class="w-full h-10 px-3 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#5845eb] focus:ring-2 focus:ring-[#5845eb]/10 transition-all cursor-pointer shadow-2xs"
					/>
				</div>

				<!-- To Input -->
				<div class="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80">
					<label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5 font-['Anek_Bangla',sans-serif]">
						<Clock class="w-3.5 h-3.5 text-[#5845eb]" />
						<span>শেষের তারিখ ও সময় (To):</span>
					</label>
					<input
						type="datetime-local"
						bind:value={customTo}
						class="w-full h-10 px-3 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#5845eb] focus:ring-2 focus:ring-[#5845eb]/10 transition-all cursor-pointer shadow-2xs"
					/>
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
					class="rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-9 px-3 gap-1 cursor-pointer"
				>
					<RotateCcw class="w-3.5 h-3.5" />
					<span>আজকে রিসেট</span>
				</Button>

				<Button
					size="sm"
					onclick={handleApplyCustom}
					class="rounded-xl bg-[#5845eb] hover:bg-[#4834d4] text-white text-xs font-bold h-9 px-4 shadow-sm shadow-[#5845eb]/30 gap-1.5 cursor-pointer"
				>
					<Check class="w-3.5 h-3.5 stroke-[2.5]" />
					<span>ফিল্টার প্রয়োগ করুন</span>
				</Button>
			</div>
		</div>
	{/if}
</div>
