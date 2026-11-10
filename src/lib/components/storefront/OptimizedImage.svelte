<script lang="ts">
	// Storefront-wide <img> wrapper: explicit width/height stops layout shift,
	// lazy + async decoding keeps images off the critical path by default.
	interface Props {
		src: string;
		alt: string;
		width?: number;
		height?: number;
		loading?: 'lazy' | 'eager';
		fetchpriority?: 'high' | 'low' | 'auto';
		sizes?: string;
		srcset?: string;
		class?: string;
	}

	let {
		src,
		alt,
		width,
		height,
		loading = 'lazy',
		fetchpriority = 'auto',
		sizes,
		srcset,
		class: className = ''
	}: Props = $props();
</script>

<img
	{src}
	{alt}
	{width}
	{height}
	{loading}
	{fetchpriority}
	{sizes}
	{srcset}
	decoding="async"
	class={className}
/>
