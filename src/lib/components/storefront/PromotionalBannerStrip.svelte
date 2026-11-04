<script lang="ts">
	interface Banner {
		id: string;
		title: string;
		image: string;
		targetUrl: string;
		urlType?: string;
		placement?: string;
		sortOrder?: number;
		status?: string;
	}

	let { banners = [] }: { banners?: Banner[] } = $props();

	let activeBanners = $derived(banners.slice(0, 3));
</script>

{#if activeBanners.length > 0}
	<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6 sm:my-10" aria-label="Promotional Offers">
		<div
			class="grid gap-4 sm:gap-6 {activeBanners.length === 1
				? 'grid-cols-1'
				: activeBanners.length === 2
				? 'grid-cols-1 sm:grid-cols-2'
				: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}"
		>
			{#each activeBanners as banner (banner.id)}
				<a
					href={banner.targetUrl || '/catalog/all-product'}
					target={banner.urlType === 'External' ? '_blank' : '_self'}
					rel={banner.urlType === 'External' ? 'noopener noreferrer' : ''}
					class="group relative block overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-slate-100 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
				>
					<div class="relative w-full aspect-[21/9] sm:aspect-[16/7] overflow-hidden">
						<img
							src={banner.image || '/images/banners/banner-home.svg'}
							alt={banner.title || 'Promotional Banner'}
							class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
							loading="lazy"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					</div>
				</a>
			{/each}
		</div>
	</section>
{/if}

