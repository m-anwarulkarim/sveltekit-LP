<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Button, Badge } from '#lib/components/ui';
	import {
		Search,
		X,
		RotateCw,
		Flame,
		Clock,
		ArrowRight,
		Sparkles,
		ShoppingBag
	} from 'lucide-svelte';

	interface Props {
		placeholder?: string;
		class?: string;
		onSearch?: (query: string) => void;
	}

	let {
		placeholder = 'পছন্দের পণ্য বা ক্যাটাগরি খুঁজুন...',
		class: className = '',
		onSearch
	}: Props = $props();

	// State
	let searchQuery = $state('');
	let isOpen = $state(false);
	let isRefreshing = $state(false);
	let activeSetIndex = $state(0);
	let searchContainerEl = $state<HTMLDivElement | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);

	// Dynamic Tag Sets from real database categories
	const dynamicTagSets = $derived.by(() => {
		const cats = page.data?.categories;
		if (Array.isArray(cats) && cats.length > 0) {
			const tagList = cats.map((c: any, i: number) => ({
				text: c.name,
				trending: i < 4
			}));
			// Split into chunks of 6-8 tags
			const sets: { text: string; trending: boolean }[][] = [];
			for (let i = 0; i < tagList.length; i += 6) {
				sets.push(tagList.slice(i, i + 6));
			}
			return sets.length > 0 ? sets : [tagList];
		}
		return [
			[
				{ text: 'সকল পণ্য', trending: true },
				{ text: 'হট ডিলস', trending: true },
				{ text: 'নতুন কালেকশন', trending: false }
			]
		];
	});

	// Recent searches saved in localStorage
	let recentSearches = $state<string[]>([]);

	onMount(() => {
		try {
			const saved = localStorage.getItem('recent_searches');
			if (saved) {
				recentSearches = JSON.parse(saved).slice(0, 5);
			}
		} catch (e) {
			// ignore storage errors
		}

		// Click outside listener
		function handleClickOutside(event: MouseEvent) {
			if (searchContainerEl && !searchContainerEl.contains(event.target as Node)) {
				isOpen = false;
			}
		}

		// Escape key listener
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape' && isOpen) {
				isOpen = false;
				inputEl?.blur();
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	function saveSearch(query: string) {
		const clean = query.trim();
		if (!clean) return;
		try {
			const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
			recentSearches = updated;
			localStorage.setItem('recent_searches', JSON.stringify(updated));
		} catch (e) {
			// ignore storage errors
		}
	}

	function clearRecentSearches() {
		recentSearches = [];
		try {
			localStorage.removeItem('recent_searches');
		} catch (e) {}
	}

	function removeRecentSearch(item: string, event: MouseEvent) {
		event.stopPropagation();
		recentSearches = recentSearches.filter((s) => s !== item);
		try {
			localStorage.setItem('recent_searches', JSON.stringify(recentSearches));
		} catch (e) {}
	}

	function executeSearch(query: string) {
		const target = query.trim();
		if (!target) return;
		searchQuery = target;
		saveSearch(target);
		isOpen = false;

		if (onSearch) {
			onSearch(target);
		} else {
			// Default fallback: scroll to products section smoothly
			const el = document.getElementById('products');
			if (el) {
				el.scrollIntoView({ behavior: 'smooth' });
			}
		}
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		executeSearch(searchQuery);
	}

	function handleRefreshSuggestions() {
		isRefreshing = true;
		setTimeout(() => {
			activeSetIndex = (activeSetIndex + 1) % dynamicTagSets.length;
			isRefreshing = false;
		}, 300);
	}

	function clearInput() {
		searchQuery = '';
		inputEl?.focus();
	}

	// Filtered tags based on user input
	let currentPopularTags = $derived(dynamicTagSets[activeSetIndex % dynamicTagSets.length] || []);
	
	let filteredTags = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return currentPopularTags;
		// If user typed something, search through all sets
		const all = dynamicTagSets.flat();
		const matches = all.filter((item) => item.text.toLowerCase().includes(q));
		// Remove duplicates
		const seen = new Set<string>();
		return matches.filter((item) => {
			if (seen.has(item.text)) return false;
			seen.add(item.text);
			return true;
		});
	});
</script>

<div bind:this={searchContainerEl} class="relative w-full {className}">
	<!-- Main Search Input Bar (Matching user screenshot) -->
	<form onsubmit={handleSubmit} class="relative w-full flex items-center">
		<input
			bind:this={inputEl}
			type="text"
			bind:value={searchQuery}
			onfocus={() => (isOpen = true)}
			onclick={() => (isOpen = true)}
			placeholder={placeholder}
			class="w-full bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl pl-4 sm:pl-5 pr-20 py-2.5 h-11 sm:h-12 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100/60 transition-all shadow-xs"
			autocomplete="off"
			spellcheck="false"
		/>

		<!-- Right Side Action Group inside input -->
		<div class="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
			<!-- Clear Button (shows when there is text) -->
			{#if searchQuery.trim().length > 0}
				<Button
					variant="ghost"
					size="icon"
					type="button"
					onclick={clearInput}
					class="h-7 w-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer p-0"
					aria-label="Clear search input"
				>
					<X class="w-3.5 h-3.5 stroke-[2.5]" />
				</Button>
			{/if}

			<!-- Magnifying Glass Search Button with shadcn Button -->
			<Button
				variant="ghost"
				size="icon"
				type="submit"
				class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-pink-50 hover:bg-pink-100/90 text-pink-500 hover:text-pink-600 border border-pink-100/80 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 group"
				aria-label="Search"
			>
				<Search class="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" />
			</Button>
		</div>
	</form>

	<!-- Dropdown Popover Card (Matches Screenshot) -->
	{#if isOpen}
		<div
			class="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
		>
			<!-- If user has typed something, show direct query suggestion -->
			{#if searchQuery.trim().length > 0}
				<div class="mb-3.5 pb-3 border-b border-slate-100 flex items-center justify-between">
					<Button
						variant="ghost"
						type="button"
						onclick={() => executeSearch(searchQuery)}
						class="h-auto p-0 hover:bg-transparent flex items-center gap-2 text-xs font-semibold text-[#5845eb] hover:text-[#4936d6] text-left cursor-pointer group"
					>
						<Search class="w-3.5 h-3.5 text-pink-500" />
						<span>খুঁজুন: <strong class="text-slate-900 underline underline-offset-2">"{searchQuery}"</strong></span>
						<ArrowRight class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
					</Button>
					<span class="text-[10px] text-slate-400 font-medium hidden sm:inline">↵ Enter চাপুন</span>
				</div>
			{/if}

			<!-- Recent Searches Section (If any exist) -->
			{#if recentSearches.length > 0 && !searchQuery.trim()}
				<div class="mb-4 pb-3 border-b border-slate-100">
					<div class="flex items-center justify-between mb-2">
						<div class="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
							<Clock class="w-3.5 h-3.5 text-slate-400" />
							<span>সাম্প্রতিক অনুসন্ধান</span>
						</div>
						<Button
							variant="ghost"
							type="button"
							onclick={clearRecentSearches}
							class="h-auto p-0 hover:bg-transparent text-[11px] text-slate-400 hover:text-rose-500 transition-colors font-medium cursor-pointer"
						>
							মুছে ফেলুন
						</Button>
					</div>

					<div class="flex flex-wrap gap-1.5">
						{#each recentSearches as item}
							<div
								class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs text-slate-700 transition-colors group"
							>
								<button
									type="button"
									onclick={() => executeSearch(item)}
									class="cursor-pointer font-medium hover:text-[#5845eb] transition-colors"
								>
									{item}
								</button>
								<button
									type="button"
									onclick={(e) => removeRecentSearch(item, e)}
									class="text-slate-400 hover:text-rose-500 transition-colors p-0.5 rounded-full cursor-pointer"
									aria-label="Remove recent search"
								>
									<X class="w-3 h-3" />
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Popular Right Now Header (Exact match to screenshot) -->
			<div class="flex items-center justify-between mb-3">
				<span class="text-xs font-semibold text-slate-500 tracking-tight">
					Popular Right Now
				</span>

				<!-- Refresh Button (Spinning reload icon) with shadcn Button -->
				<Button
					variant="ghost"
					size="icon"
					type="button"
					onclick={handleRefreshSuggestions}
					class="h-7 w-7 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
					title="নতুন সাজেশন দেখুন"
					aria-label="Refresh popular searches"
				>
					<RotateCw
						class="w-3.5 h-3.5 {isRefreshing ? 'animate-spin text-pink-500' : ''} transition-transform"
					/>
				</Button>
			</div>

			<!-- Popular Tag Chips with shadcn Button -->
			<div class="flex flex-wrap gap-2">
				{#each filteredTags as tag}
					<Button
						variant="outline"
						size="sm"
						type="button"
						onclick={() => executeSearch(tag.text)}
						class="h-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs text-slate-700 font-medium transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
					>
						{#if tag.trending}
							<span class="text-sm leading-none">🔥</span>
						{/if}
						<span>{tag.text}</span>
					</Button>
				{:else}
					<div class="w-full py-2 text-center text-xs text-slate-400">
						কোনো সাজেশন পাওয়া যায়নি।
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>