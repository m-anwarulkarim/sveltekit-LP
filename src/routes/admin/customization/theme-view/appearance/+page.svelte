<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Palette, LayoutGrid, Search, Globe, Check, Loader2 } from 'lucide-svelte';
	import ColorSwatchInput from '../_components/ColorSwatchInput.svelte';

	let { data, form }: { data: any; form: any } = $props();

	// Initialize reactive states from server data
	let appearance = $derived(data?.themeConfig?.appearance || {
		colors: { primary: '#e8007c', secondary: '#00c153', tertiary: '#ff00ae' },
		dashboardStyle: 'professional',
		searchKeywords: 'lipstick, foundation, face serum, moisturizer',
		checkoutLanguage: 'bangla'
	});

	let primaryColor = $state(appearance.colors.primary);
	let secondaryColor = $state(appearance.colors.secondary);
	let tertiaryColor = $state(appearance.colors.tertiary);
	let dashboardStyle = $state(appearance.dashboardStyle);
	let searchKeywords = $state(appearance.searchKeywords);
	let checkoutLanguage = $state(appearance.checkoutLanguage);

	$effect(() => {
		if (appearance) {
			primaryColor = appearance.colors.primary;
			secondaryColor = appearance.colors.secondary;
			tertiaryColor = appearance.colors.tertiary;
			dashboardStyle = appearance.dashboardStyle;
			searchKeywords = appearance.searchKeywords;
			checkoutLanguage = appearance.checkoutLanguage;
		}
	});

	let isSubmitting = $state(false);

	$effect(() => {
		if (form?.message) {
			if (form.success) {
				toast.success(form.message);
			} else {
				toast.error(form.message);
			}
		}
	});
</script>

<svelte:head>
	<title>Appearance & Colors - Theme View Customization - AURA Admin</title>
</svelte:head>

<form
	method="POST"
	action="?/updateAppearance"
	data-theme-form
	use:enhance={() => {
		isSubmitting = true;
		return async ({ update }) => {
			isSubmitting = false;
			await update();
		};
	}}
	class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150"
>
	<!-- CARD 1: THEME BRAND COLORS (Top Left) -->
	<div class="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-2xs">
		<div class="flex items-center gap-2.5">
			<div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
				<Palette class="w-4 h-4" />
			</div>
			<div>
				<h3 class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight uppercase">
					THEME BRAND COLORS
				</h3>
				<p class="text-[11px] text-slate-500">
					Customize primary, secondary, and tertiary brand colors for your storefront.
				</p>
			</div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
			<ColorSwatchInput
				label="Primary Color"
				name="primary"
				bind:value={primaryColor}
			/>

			<ColorSwatchInput
				label="Secondary Color"
				name="secondary"
				bind:value={secondaryColor}
			/>

			<ColorSwatchInput
				label="Tertiary Color"
				name="tertiary"
				bind:value={tertiaryColor}
			/>
		</div>
	</div>

	<!-- CARD 2: DASHBOARD STYLE (Top Right) -->
	<div class="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-2xs">
		<div class="flex items-center gap-2.5">
			<div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
				<LayoutGrid class="w-4 h-4" />
			</div>
			<div>
				<h3 class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight uppercase">
					DASHBOARD STYLE
				</h3>
				<p class="text-[11px] text-slate-500">
					Choose the navigation menu style for your vendor dashboard.
				</p>
			</div>
		</div>

		<div class="space-y-3 pt-2">
			<!-- Option 1: Classic Dashboard -->
			<label
				class="flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer {dashboardStyle === 'classic'
					? 'border-[#2563eb] bg-blue-50/20 shadow-xs ring-1 ring-blue-500/20'
					: 'border-slate-200/90 bg-white hover:bg-slate-50'}"
			>
				<input
					type="radio"
					name="dashboardStyle"
					value="classic"
					bind:group={dashboardStyle}
					class="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
				/>
				<div>
					<h4 class="text-xs font-bold text-slate-900">Classic Dashboard</h4>
					<p class="text-[11px] text-slate-500">Traditional sidebar layout navigation</p>
				</div>
			</label>

			<!-- Option 2: Professional Dashboard (Selected) -->
			<label
				class="flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer {dashboardStyle === 'professional'
					? 'border-[#2563eb] bg-blue-50/25 shadow-xs ring-1 ring-blue-500/20'
					: 'border-slate-200/90 bg-white hover:bg-slate-50'}"
			>
				<input
					type="radio"
					name="dashboardStyle"
					value="professional"
					bind:group={dashboardStyle}
					class="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
				/>
				<div>
					<h4 class="text-xs font-bold text-slate-900">Professional Dashboard</h4>
					<p class="text-[11px] text-slate-500">Modernized, compact workspace navigation</p>
				</div>
			</label>
		</div>
	</div>

	<!-- CARD 3: SEARCH HINTS (Bottom Left) -->
	<div class="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-2xs">
		<div class="flex items-center gap-2.5">
			<div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
				<Search class="w-4 h-4" />
			</div>
			<div>
				<h3 class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight uppercase">
					SEARCH HINTS
				</h3>
				<p class="text-[11px] text-slate-500">
					Default keywords shown in the shop search input header.
				</p>
			</div>
		</div>

		<div class="pt-2">
			<label for="searchKeywords" class="block text-[11px] font-bold text-slate-600 mb-1.5">
				Keywords (comma separated)
			</label>
			<textarea
				id="searchKeywords"
				name="searchKeywords"
				bind:value={searchKeywords}
				rows="3"
				placeholder="e.g. lipstick, foundation, face serum, moisturizer"
				class="w-full bg-slate-50/70 border border-slate-200/90 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:border-[#2563eb] focus:bg-white shadow-2xs transition-all"
			></textarea>
		</div>
	</div>

	<!-- CARD 4: ORDER CHECKOUT LANGUAGE (Bottom Right) -->
	<div class="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-2xs">
		<div class="flex items-center gap-2.5">
			<div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
				<Globe class="w-4 h-4" />
			</div>
			<div>
				<h3 class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight uppercase">
					ORDER CHECKOUT LANGUAGE
				</h3>
				<p class="text-[11px] text-slate-500">
					Select customer checkout display language for this store.
				</p>
			</div>
		</div>

		<input type="hidden" name="checkoutLanguage" value={checkoutLanguage} />

		<div class="flex items-center flex-wrap gap-3 pt-2">
			<!-- English -->
			<button
				type="button"
				onclick={() => (checkoutLanguage = 'english')}
				class="px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer {checkoutLanguage === 'english'
					? 'border-[#2563eb] bg-blue-50 text-[#2563eb] ring-1 ring-blue-500/20 shadow-2xs'
					: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}"
			>
				<span class="w-2 h-2 rounded-full {checkoutLanguage === 'english' ? 'bg-[#2563eb]' : 'bg-slate-300'}"></span>
				<span>English Checkout</span>
			</button>

			<!-- Bangla (Selected) -->
			<button
				type="button"
				onclick={() => (checkoutLanguage = 'bangla')}
				class="px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer {checkoutLanguage === 'bangla'
					? 'border-[#2563eb] bg-blue-50 text-[#2563eb] ring-1 ring-blue-500/20 shadow-2xs'
					: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}"
			>
				<Check class="w-3.5 h-3.5 text-[#2563eb]" />
				<span>Bangla Checkout</span>
			</button>

			<!-- Italian -->
			<button
				type="button"
				onclick={() => (checkoutLanguage = 'italian')}
				class="px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer {checkoutLanguage === 'italian'
					? 'border-[#2563eb] bg-blue-50 text-[#2563eb] ring-1 ring-blue-500/20 shadow-2xs'
					: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}"
			>
				<span class="w-2 h-2 rounded-full {checkoutLanguage === 'italian' ? 'bg-[#2563eb]' : 'bg-slate-300'}"></span>
				<span>Italian Checkout</span>
			</button>
		</div>
	</div>
</form>

