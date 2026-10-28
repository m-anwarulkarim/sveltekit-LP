<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface TabItem {
		id: string;
		label: string;
		icon?: any;
	}

	interface Props {
		tabs: TabItem[];
		activeTab: string;
		counts: Record<string, number>;
		onSelectTab: (tabId: string) => void;
		class?: string;
	}

	let {
		tabs = [],
		activeTab,
		counts = {},
		onSelectTab,
		class: className = ''
	}: Props = $props();

	let containerRef: HTMLDivElement | null = $state(null);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);

	// Drag to scroll states
	let isDragging = $state(false);
	let startX = $state(0);
	let scrollStartLeft = $state(0);
	let hasDragged = $state(false);

	function updateScrollState() {
		if (!containerRef) return;
		const { scrollLeft, scrollWidth, clientWidth } = containerRef;
		canScrollLeft = scrollLeft > 8;
		canScrollRight = scrollLeft < scrollWidth - clientWidth - 8;
	}

	// Auto-scroll active tab into view
	$effect(() => {
		if (containerRef && activeTab) {
			const activeBtn = containerRef.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
			if (activeBtn) {
				activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
			}
			updateScrollState();
		}
	});

	// Setup wheel and resize listeners
	$effect(() => {
		const el = containerRef;
		if (!el) return;

		// Convert vertical mouse wheel into horizontal scroll
		const handleWheel = (e: WheelEvent) => {
			if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
				e.preventDefault();
				el.scrollLeft += e.deltaY * 1.2;
				updateScrollState();
			}
		};

		el.addEventListener('wheel', handleWheel, { passive: false });
		const resizeObserver = new ResizeObserver(() => updateScrollState());
		resizeObserver.observe(el);

		// Initial check
		setTimeout(updateScrollState, 50);

		return () => {
			el.removeEventListener('wheel', handleWheel);
			resizeObserver.disconnect();
		};
	});

	function scrollByAmount(amount: number) {
		if (!containerRef) return;
		containerRef.scrollBy({ left: amount, behavior: 'smooth' });
		setTimeout(updateScrollState, 250);
	}

	// Mouse drag handlers
	function handleMouseDown(e: MouseEvent) {
		if (!containerRef) return;
		// Only primary button
		if (e.button !== 0) return;
		isDragging = true;
		hasDragged = false;
		startX = e.pageX - containerRef.offsetLeft;
		scrollStartLeft = containerRef.scrollLeft;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || !containerRef) return;
		const x = e.pageX - containerRef.offsetLeft;
		const walk = (x - startX) * 1.5;
		if (Math.abs(walk) > 4) {
			hasDragged = true;
		}
		containerRef.scrollLeft = scrollStartLeft - walk;
		updateScrollState();
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function handleTabClick(tabId: string) {
		if (!hasDragged) {
			onSelectTab(tabId);
		}
		hasDragged = false;
	}
</script>

<!-- Outer Wrapper with Scroll Controls -->
<div class="relative group/tabs bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-1.5 {className}">
	
	<!-- Left Scroll Arrow Button -->
	{#if canScrollLeft}
		<div class="absolute left-1 top-1/2 -translate-y-1/2 z-20 flex items-center pr-4 bg-gradient-to-r from-white via-white/95 to-transparent h-[calc(100%-8px)] rounded-l-xl pl-1">
			<button
				type="button"
				onclick={() => scrollByAmount(-220)}
				class="w-7 h-7 rounded-lg bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:text-[#5845eb] hover:border-indigo-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
				title="বামে স্ক্রোল করুন"
				aria-label="Scroll left"
			>
				<ChevronLeft class="w-4 h-4" />
			</button>
		</div>
	{/if}

	<!-- Right Scroll Arrow Button -->
	{#if canScrollRight}
		<div class="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex items-center pl-4 bg-gradient-to-l from-white via-white/95 to-transparent h-[calc(100%-8px)] rounded-r-xl pr-1">
			<button
				type="button"
				onclick={() => scrollByAmount(220)}
				class="w-7 h-7 rounded-lg bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:text-[#5845eb] hover:border-indigo-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
				title="ডানে স্ক্রোল করুন"
				aria-label="Scroll right"
			>
				<ChevronRight class="w-4 h-4" />
			</button>
		</div>
	{/if}

	<!-- Horizontal Scrollable Container -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		bind:this={containerRef}
		onscroll={updateScrollState}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleMouseUp}
		role="tablist"
		class="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-0.5 px-0.5 custom-tabs-scrollbar select-none {isDragging ? 'cursor-grabbing' : 'cursor-default'}"
	>
		{#each tabs as tab}
			{@const count = counts[tab.id] ?? 0}
			{@const isActive = activeTab === tab.id}
			<button
				type="button"
				data-tab-id={tab.id}
				role="tab"
				aria-selected={isActive}
				onclick={() => handleTabClick(tab.id)}
				class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer {isActive
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'}"
			>
				{#if tab.icon}
					<tab.icon class="w-3.5 h-3.5 shrink-0" />
				{/if}
				<span>{tab.label}</span>
				<span
					class="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center transition-all {isActive
						? 'bg-white/25 text-white'
						: count > 0
							? 'bg-indigo-50 text-[#5845eb] border border-indigo-200/70'
							: 'bg-slate-100 text-slate-400 font-medium'}"
				>
					{count}
				</span>
			</button>
		{/each}
	</div>
</div>

<style>
	/* Subtle slim scrollbar for smooth visual dragging */
	.custom-tabs-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: rgba(203, 213, 225, 0.6) transparent;
	}
	.custom-tabs-scrollbar::-webkit-scrollbar {
		height: 4px;
	}
	.custom-tabs-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-tabs-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(203, 213, 225, 0.6);
		border-radius: 9999px;
	}
	.custom-tabs-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(148, 163, 184, 0.8);
	}
</style>

