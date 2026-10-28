<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { THEME_DESIGN_PRESETS, type ThemePreset } from '../_components/theme-presets.data';
	import ThemeDesignCard from '../_components/ThemeDesignCard.svelte';

	let { data, form }: { data: any; form: any } = $props();

	let activePresetName = $derived(data?.themeConfig?.activePreset || 'Levoleather');

	$effect(() => {
		if (form?.message) {
			if (form.success) {
				toast.success(form.message);
			} else {
				toast.error(form.message);
			}
		}
	});

	function handlePresetApplied(preset: ThemePreset) {
		toast.success(`"${preset.name}" থিমটি সক্রিয় করা হয়েছে!`);
	}
</script>

<svelte:head>
	<title>Theme Designs - Ready-Made Storefront Themes - AURA Admin</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-150">
	<!-- 3-Column Storefront Theme Presets Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each THEME_DESIGN_PRESETS as preset (preset.id)}
			<ThemeDesignCard
				{preset}
				isActive={activePresetName.toLowerCase() === preset.name.toLowerCase()}
				onApply={handlePresetApplied}
			/>
		{/each}
	</div>
</div>

