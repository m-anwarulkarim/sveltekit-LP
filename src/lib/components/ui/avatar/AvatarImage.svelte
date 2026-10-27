<script lang="ts">
	import { cn } from '#lib/utils';
	import type { HTMLImgAttributes } from 'svelte/elements';

	interface Props extends HTMLImgAttributes {
		src?: string;
		alt?: string;
		class?: string;
	}

	let { src, alt = '', class: className, ...restProps }: Props = $props();
	let hasError = $state(false);
</script>

{#if src && !hasError}
	<img
		{src}
		{alt}
		onerror={() => (hasError = true)}
		class={cn('aspect-square h-full w-full object-cover', className)}
		{...restProps}
	/>
{/if}
