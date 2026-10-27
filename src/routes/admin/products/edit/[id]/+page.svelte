<script lang="ts">
	import { ProductFormLayout } from '../../_components/form';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.product?.name ? `Edit: ${data.product.name}` : 'Edit Product'} | AURA Admin</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8">
	{#if data.product}
		<ProductFormLayout initialProduct={data.product} isEditMode={true} />
	{:else}
		<div class="max-w-md mx-auto text-center py-16 space-y-4">
			<h2 class="text-xl font-bold text-slate-800">প্রোডাক্ট পাওয়া যায়নি</h2>
			<p class="text-sm text-slate-500">অনুরোধকৃত প্রোডাক্ট আইডিটি তালিকায় পাওয়া যায়নি বা মুছে ফেলা হয়েছে।</p>
			<a
				href="/admin/products"
				class="inline-block px-5 py-2.5 rounded-xl bg-[#5845eb] text-white text-xs font-bold shadow-sm"
			>
				প্রোডাক্ট তালিকায় ফিরে যান
			</a>
		</div>
	{/if}
</div>

