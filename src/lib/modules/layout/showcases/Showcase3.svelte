<script lang="ts">
	import { ArrowRight } from 'lucide-svelte';

	interface Props {
		carousels?: any[];
	}

	let { carousels = [] }: Props = $props();

	// Use first 2 carousels if available, otherwise use placeholders
	let mainBanner = $derived(
		carousels[0] ?? {
			id: 'placeholder-1',
			name: 'নতুন কালেকশন',
			description: 'সেরা মানের পণ্য সংগ্রহ করুন',
			image: '/images/banners/banner-home.svg',
			targetUrl: '/catalog/all-category'
		}
	);

	let sideBanner = $derived(
		carousels[1] ?? {
			id: 'placeholder-2',
			name: 'বিশেষ ছাড়',
			description: 'সীমিত সময়ের অফার',
			image: '/images/banners/banner-home.svg',
			targetUrl: '/catalog/all-category'
		}
	);

	function isPhoto(image?: string): boolean {
		return Boolean(image) && !/\.svg($|\?)/i.test(image as string);
	}
</script>

<!-- Showcase 2: Split Promo Grid — real carousel data -->
<section class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5 font-['Anek_Bangla',sans-serif]">
	<div class="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">

		<!-- Main Banner (2/3 width) -->
		<a
			href={mainBanner.targetUrl || '/'}
			class="md:col-span-2 relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm bg-slate-800 group block aspect-[2/1] md:aspect-auto md:min-h-[280px]"
		>
			{#if isPhoto(mainBanner.image)}
				<img
					src={mainBanner.image}
					alt={mainBanner.name}
					class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
					loading="eager"
				/>
			{:else}
				<!-- Fallback gradient when no real image -->
				<div class="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900">
					<div class="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-indigo-600/30 blur-3xl pointer-events-none"></div>
					<div class="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
				</div>
				<div class="absolute inset-0 flex flex-col justify-center px-8 sm:px-10 z-10">
					<h2 class="text-2xl sm:text-3xl font-black text-white leading-tight">{mainBanner.name}</h2>
					{#if mainBanner.description}
						<p class="mt-2 text-sm text-white/70 line-clamp-2">{mainBanner.description}</p>
					{/if}
					<span class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 text-xs font-bold w-fit">
						দেখুন <ArrowRight class="w-3.5 h-3.5" />
					</span>
				</div>
			{/if}

			<!-- Hover overlay for photo banners -->
			{#if isPhoto(mainBanner.image)}
				<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
				<div class="absolute bottom-4 left-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-slate-900 text-xs font-bold">
						দেখুন <ArrowRight class="w-3 h-3" />
					</span>
				</div>
			{/if}
		</a>

		<!-- Side Banner (1/3 width) -->
		<a
			href={sideBanner.targetUrl || '/'}
			class="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm bg-slate-700 group block aspect-[2/1] md:aspect-auto md:min-h-[280px]"
		>
			{#if isPhoto(sideBanner.image)}
				<img
					src={sideBanner.image}
					alt={sideBanner.name}
					class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
					loading="lazy"
				/>
			{:else}
				<div class="absolute inset-0 bg-gradient-to-br from-rose-700 via-pink-800 to-slate-900">
					<div class="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
				</div>
				<div class="absolute inset-0 flex flex-col justify-center px-6 z-10">
					<h3 class="text-xl font-black text-white leading-tight">{sideBanner.name}</h3>
					{#if sideBanner.description}
						<p class="mt-2 text-xs text-white/70 line-clamp-3">{sideBanner.description}</p>
					{/if}
					<span class="mt-4 inline-flex items-center gap-1.5 text-white/80 text-xs font-bold hover:text-white">
						দেখুন <ArrowRight class="w-3.5 h-3.5" />
					</span>
				</div>
			{/if}

			{#if isPhoto(sideBanner.image)}
				<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
				<div class="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-slate-900 text-xs font-bold">
						দেখুন <ArrowRight class="w-3 h-3" />
					</span>
				</div>
			{/if}
		</a>

	</div>
</section>
