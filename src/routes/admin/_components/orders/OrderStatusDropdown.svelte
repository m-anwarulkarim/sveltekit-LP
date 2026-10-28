<script lang="ts">
	import { enhance } from '$app/forms';
	import { ChevronDown, Check, Loader2 } from 'lucide-svelte';

	interface Props {
		orderId: string;
		status: string;
		mode?: 'web' | 'list' | 'all';
		align?: 'left' | 'right';
		onStatusUpdated?: (newStatus: string) => void;
	}

	let {
		orderId,
		status,
		mode = 'web',
		align = 'left',
		onStatusUpdated
	}: Props = $props();

	let isOpen = $state(false);
	let isUpdating = $state(false);
	let currentStatus = $state(status);
	let selectedTargetStatus = $state(status);
	let triggerBtn: HTMLButtonElement | null = $state(null);
	let menuCoords = $state<{
		top?: number;
		bottom?: number;
		left?: number;
		right?: number;
		maxHeight: number;
	}>({ maxHeight: 300 });

	$effect(() => {
		currentStatus = status;
		selectedTargetStatus = status;
	});

	function updateDropdownPosition() {
		if (!triggerBtn) return;
		const rect = triggerBtn.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const viewportWidth = window.innerWidth;

		const spaceBelow = viewportHeight - rect.bottom;
		const spaceAbove = rect.top;
		const estimatedMenuHeight = 280;

		const openUp = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;

		let coords: typeof menuCoords = { maxHeight: 300 };

		if (openUp) {
			coords.bottom = Math.round(viewportHeight - rect.top + 6);
			coords.maxHeight = Math.max(160, Math.min(340, spaceAbove - 20));
		} else {
			coords.top = Math.round(rect.bottom + 6);
			coords.maxHeight = Math.max(160, Math.min(340, spaceBelow - 20));
		}

		if (align === 'right') {
			const rightSpace = viewportWidth - rect.right;
			coords.right = Math.max(12, Math.round(rightSpace));
		} else {
			const leftPos = Math.round(rect.left);
			if (leftPos + 220 > viewportWidth) {
				coords.right = 12;
			} else {
				coords.left = Math.max(12, leftPos);
			}
		}

		menuCoords = coords;
	}

	function toggleDropdown() {
		if (!isOpen) {
			updateDropdownPosition();
			isOpen = true;
		} else {
			isOpen = false;
		}
	}

	// Update position on scroll/resize and close on Escape
	$effect(() => {
		if (isOpen) {
			const handleReposition = () => {
				updateDropdownPosition();
			};
			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					isOpen = false;
				}
			};

			window.addEventListener('scroll', handleReposition, true);
			window.addEventListener('resize', handleReposition);
			window.addEventListener('keydown', handleKeyDown);

			return () => {
				window.removeEventListener('scroll', handleReposition, true);
				window.removeEventListener('resize', handleReposition);
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	});

	// Comprehensive Status Catalog with Premium Palettes
	const STATUS_CATALOG: Record<
		string,
		{ label: string; dot: string; badge: string; group: 'web' | 'list' | 'both' }
	> = {
		pending: {
			label: 'পেন্ডিং',
			dot: 'bg-amber-500 shadow-amber-500/50',
			badge: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/80',
			group: 'web'
		},
		incomplete: {
			label: 'ইনকমপ্লিট',
			dot: 'bg-orange-500 shadow-orange-500/50',
			badge: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100/80',
			group: 'web'
		},
		no_response: {
			label: 'নো রেসপন্স',
			dot: 'bg-slate-400 shadow-slate-400/50',
			badge: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/70',
			group: 'web'
		},
		good_no_response: {
			label: 'গুড বাট নো রেসপন্স',
			dot: 'bg-cyan-500 shadow-cyan-500/50',
			badge: 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100/80',
			group: 'web'
		},
		busy: {
			label: 'বিজি',
			dot: 'bg-yellow-500 shadow-yellow-500/50',
			badge: 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80',
			group: 'web'
		},
		hold: {
			label: 'হোল্ড',
			dot: 'bg-blue-500 shadow-blue-500/50',
			badge: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100/80',
			group: 'web'
		},
		recall: {
			label: 'রি-কল',
			dot: 'bg-purple-500 shadow-purple-500/50',
			badge: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100/80',
			group: 'web'
		},
		confirmed: {
			label: 'কনফার্মড',
			dot: 'bg-emerald-500 shadow-emerald-500/50',
			badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80',
			group: 'both'
		},
		processing: {
			label: 'প্রসেসিং',
			dot: 'bg-indigo-500 shadow-indigo-500/50',
			badge: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100/80',
			group: 'both'
		},
		printed: {
			label: 'প্রিন্টেড',
			dot: 'bg-violet-500 shadow-violet-500/50',
			badge: 'bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100/80',
			group: 'list'
		},
		entry_done: {
			label: 'এন্ট্রি ডান',
			dot: 'bg-sky-500 shadow-sky-500/50',
			badge: 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100/80',
			group: 'list'
		},
		shipped: {
			label: 'শিপড',
			dot: 'bg-blue-600 shadow-blue-600/50',
			badge: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100/80',
			group: 'list'
		},
		delivered: {
			label: 'ডেলিভারড',
			dot: 'bg-teal-500 shadow-teal-500/50',
			badge: 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100/80',
			group: 'list'
		},
		partial_delivered: {
			label: 'পার্শিয়াল',
			dot: 'bg-amber-600 shadow-amber-600/50',
			badge: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/80',
			group: 'list'
		},
		pending_return: {
			label: 'পেন্ডিং রিটার্ন',
			dot: 'bg-rose-500 shadow-rose-500/50',
			badge: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100/80',
			group: 'list'
		},
		returned: {
			label: 'রিটার্ন',
			dot: 'bg-red-500 shadow-red-500/50',
			badge: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100/80',
			group: 'list'
		},
		cancelled: {
			label: 'বাতিল',
			dot: 'bg-rose-500 shadow-rose-500/50',
			badge: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100/80',
			group: 'both'
		},
		missing: {
			label: 'মিসিং',
			dot: 'bg-zinc-500 shadow-zinc-500/50',
			badge: 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200/80',
			group: 'list'
		}
	};

	let availableOptions = $derived.by(() => {
		const allEntries = Object.entries(STATUS_CATALOG).map(([id, info]) => ({
			id,
			...info
		}));

		if (mode === 'web') {
			return allEntries.filter((opt) => opt.group === 'web' || opt.group === 'both');
		} else if (mode === 'list') {
			return allEntries.filter((opt) => opt.group === 'list' || opt.group === 'both');
		}
		return allEntries;
	});

	let activeConfig = $derived(
		STATUS_CATALOG[currentStatus] || {
			label: currentStatus || 'স্ট্যাটাস',
			dot: 'bg-slate-400',
			badge: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
			group: 'both'
		}
	);

	let formElement: HTMLFormElement | null = $state(null);

	function handleSelectOption(newStatusKey: string) {
		if (newStatusKey === currentStatus) {
			isOpen = false;
			return;
		}
		selectedTargetStatus = newStatusKey;
		currentStatus = newStatusKey;
		isOpen = false;

		// Trigger form submission
		setTimeout(() => {
			if (formElement) {
				formElement.requestSubmit();
			}
		}, 10);
	}
</script>

<div class="relative inline-block text-left font-['Anek_Bangla',sans-serif]">
	<!-- Hidden Form Action for Server Synchronization -->
	<form
		bind:this={formElement}
		action="?/updateOrderStatus"
		method="POST"
		use:enhance={() => {
			isUpdating = true;
			return async ({ result, update }) => {
				isUpdating = false;
				if (result.type === 'success') {
					onStatusUpdated?.(selectedTargetStatus);
				}
				await update({ reset: false });
			};
		}}
		class="hidden"
	>
		<input type="hidden" name="orderId" value={orderId} />
		<input type="hidden" name="status" value={selectedTargetStatus} />
	</form>

	<!-- Premium Trigger Button -->
	<button
		type="button"
		bind:this={triggerBtn}
		onclick={toggleDropdown}
		disabled={isUpdating}
		class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 select-none cursor-pointer {activeConfig.badge}"
		aria-haspopup="true"
		aria-expanded={isOpen}
	>
		<!-- Status Color Dot -->
		{#if isUpdating}
			<Loader2 class="w-3 h-3 animate-spin text-slate-500" />
		{:else}
			<span class="relative flex h-2 w-2">
				{#if ['pending', 'processing', 'confirmed'].includes(currentStatus)}
					<span
						class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 {activeConfig.dot}"
					></span>
				{/if}
				<span class="relative inline-flex rounded-full h-2 w-2 {activeConfig.dot}"></span>
			</span>
		{/if}

		<!-- Status Label -->
		<span class="tracking-tight leading-none">{activeConfig.label}</span>

		<!-- Chevron Down Indicator -->
		<ChevronDown
			class="w-3 h-3 opacity-60 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
		/>
	</button>

	<!-- Backdrop to close dropdown on outside click -->
	{#if isOpen}
		<button
			type="button"
			class="fixed inset-0 z-[9990] bg-transparent cursor-default"
			onclick={() => (isOpen = false)}
			tabindex="-1"
			aria-label="Close menu"
		></button>

		<!-- Floating Dropdown Menu Card (Fixed Positioned: Immune to Table/Card Overflow Clipping) -->
		<div
			style="
				{menuCoords.top !== undefined ? `top: ${menuCoords.top}px;` : ''}
				{menuCoords.bottom !== undefined ? `bottom: ${menuCoords.bottom}px;` : ''}
				{menuCoords.left !== undefined ? `left: ${menuCoords.left}px;` : ''}
				{menuCoords.right !== undefined ? `right: ${menuCoords.right}px;` : ''}
				max-height: {menuCoords.maxHeight}px;
			"
			class="fixed z-[9999] min-w-[210px] rounded-2xl bg-white p-2 shadow-2xl border border-slate-200/95 ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 flex flex-col font-sans"
			role="menu"
		>
			<div class="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 shrink-0 flex items-center justify-between">
				<span>স্ট্যাটাস পরিবর্তন করুন</span>
				<span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">D1 Live</span>
			</div>

			<div class="flex-1 min-h-0 overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin">
				{#each availableOptions as opt}
					{@const isSelected = opt.id === currentStatus}
					<button
						type="button"
						onclick={() => handleSelectOption(opt.id)}
						class="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer {isSelected
							? 'bg-indigo-50/90 text-indigo-900 font-bold'
							: 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}"
						role="menuitem"
					>
						<div class="flex items-center gap-2.5 truncate">
							<span class="h-2 w-2 rounded-full shrink-0 {opt.dot}"></span>
							<span class="truncate">{opt.label}</span>
						</div>

						{#if isSelected}
							<Check class="w-3.5 h-3.5 text-[#5845eb] shrink-0 ml-1" />
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
