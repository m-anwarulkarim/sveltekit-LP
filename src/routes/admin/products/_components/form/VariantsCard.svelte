<script lang="ts">
	import { Plus, Trash2, Layers, Check, Image as ImageIcon } from 'lucide-svelte';
	import type { ProductVariant } from '../../_data';

	interface Props {
		variants: ProductVariant[];
		defaultPrice: number;
	}

	let {
		variants = $bindable([]),
		defaultPrice = 0
	}: Props = $props();

	let hasVariations = $state(variants.length > 0);
	let option1Name = $state('Color');
	let option1Values = $state<string[]>(['Matte White', 'Jet Black']);
	let newOption1Value = $state('');

	let hasSecondOption = $state(false);
	let option2Name = $state('Size');
	let option2Values = $state<string[]>(['M', 'L']);
	let newOption2Value = $state('');

	function enableVariants() {
		hasVariations = true;
		regenerateVariants();
	}

	function enableSecondOption() {
		hasSecondOption = true;
		regenerateVariants();
	}

	function addOption1Value() {
		if (newOption1Value.trim() && !option1Values.includes(newOption1Value.trim())) {
			option1Values = [...option1Values, newOption1Value.trim()];
			newOption1Value = '';
			regenerateVariants();
		}
	}

	function removeOption1Value(val: string) {
		option1Values = option1Values.filter((v) => v !== val);
		regenerateVariants();
	}

	function addOption2Value() {
		if (newOption2Value.trim() && !option2Values.includes(newOption2Value.trim())) {
			option2Values = [...option2Values, newOption2Value.trim()];
			newOption2Value = '';
			regenerateVariants();
		}
	}

	function removeOption2Value(val: string) {
		option2Values = option2Values.filter((v) => v !== val);
		regenerateVariants();
	}

	function regenerateVariants() {
		if (!hasVariations || option1Values.length === 0) {
			variants = [];
			return;
		}

		const newVariants: ProductVariant[] = [];

		if (hasSecondOption && option2Values.length > 0) {
			for (const opt1 of option1Values) {
				for (const opt2 of option2Values) {
					const name = `${opt1} / ${opt2}`;
					const existing = variants.find((v) => v.name === name);
					newVariants.push(
						existing || {
							name,
							stock: 100,
							openingStock: 100,
							price: defaultPrice,
							sku: `VAR-${name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`
						}
					);
				}
			}
		} else {
			for (const opt1 of option1Values) {
				const name = opt1;
				const existing = variants.find((v) => v.name === name);
				newVariants.push(
					existing || {
						name,
						stock: 100,
						openingStock: 100,
						price: defaultPrice,
						sku: `VAR-${name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`
					}
				);
			}
		}

		variants = newVariants;
	}

	function removeVariantRow(index: number) {
		variants = variants.filter((_, i) => i !== index);
	}
</script>

<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-5">
	<div class="border-b border-slate-100 pb-3">
		<h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
			<span>Multi-Variant Management</span>
		</h2>
		<p class="text-xs text-slate-500 font-normal mt-0.5">
			For More Advance Multi Variant Product Manage (For Example, Color, Size, etc. Based Price and Stock Manage)
		</p>
	</div>

	{#if !hasVariations}
		<!-- Enable Variation Button (matching screenshot) -->
		<div class="space-y-3 pt-1">
			<button
				type="button"
				onclick={enableVariants}
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
			>
				<Plus class="w-4 h-4" />
				<span>Enable Variation +</span>
			</button>
		</div>
	{:else}
		<div class="space-y-5 animate-in fade-in">
			<!-- Option 1 Configurator -->
			<div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="text-xs font-bold text-slate-700">Option 1:</span>
						<input
							type="text"
							bind:value={option1Name}
							class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#5845eb]"
						/>
					</div>

					<button
						type="button"
						onclick={() => {
							hasVariations = false;
							variants = [];
						}}
						class="text-xs text-rose-500 hover:underline cursor-pointer"
					>
						Disable Variations
					</button>
				</div>

				<!-- Option 1 Value Chips -->
				<div class="flex flex-wrap items-center gap-1.5">
					{#each option1Values as val}
						<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs">
							<span>{val}</span>
							<button
								type="button"
								onclick={() => removeOption1Value(val)}
								class="text-slate-400 hover:text-rose-500"
							>
								×
							</button>
						</span>
					{/each}

					<!-- Add new value -->
					<div class="flex items-center gap-1">
						<input
							type="text"
							bind:value={newOption1Value}
							placeholder="Add value (e.g. Red)"
							class="px-2.5 py-1 rounded-lg border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb]"
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									addOption1Value();
								}
							}}
						/>
						<button
							type="button"
							onclick={addOption1Value}
							class="p-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
						>
							<Plus class="w-3.5 h-3.5" />
						</button>
					</div>
				</div>
			</div>

			<!-- Option 2 Configurator (if enabled) -->
			{#if hasSecondOption}
				<div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 animate-in fade-in">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="text-xs font-bold text-slate-700">Option 2:</span>
							<input
								type="text"
								bind:value={option2Name}
								class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#5845eb]"
							/>
						</div>

						<button
							type="button"
							onclick={() => {
								hasSecondOption = false;
								regenerateVariants();
							}}
							class="text-xs text-rose-500 hover:underline cursor-pointer"
						>
							Remove Option 2
						</button>
					</div>

					<!-- Option 2 Value Chips -->
					<div class="flex flex-wrap items-center gap-1.5">
						{#each option2Values as val}
							<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs">
								<span>{val}</span>
								<button
									type="button"
									onclick={() => removeOption2Value(val)}
									class="text-slate-400 hover:text-rose-500"
								>
									×
								</button>
							</span>
						{/each}

						<div class="flex items-center gap-1">
							<input
								type="text"
								bind:value={newOption2Value}
								placeholder="Add value (e.g. XL)"
								class="px-2.5 py-1 rounded-lg border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb]"
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										addOption2Value();
									}
								}}
							/>
							<button
								type="button"
								onclick={addOption2Value}
								class="p-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
							>
								<Plus class="w-3.5 h-3.5" />
							</button>
						</div>
					</div>
				</div>
			{:else}
				<!-- Add Variation 2 Button (matching screenshot) -->
				<button
					type="button"
					onclick={enableSecondOption}
					class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
				>
					<Plus class="w-3.5 h-3.5" />
					<span>Add Variation 2 +</span>
				</button>
			{/if}

			<!-- Generated Variant Matrix Table -->
			{#if variants.length > 0}
				<div class="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
					<table class="w-full text-left text-xs">
						<thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
							<tr>
								<th class="px-3.5 py-2.5">Variant</th>
								<th class="px-3.5 py-2.5">Price (৳)</th>
								<th class="px-3.5 py-2.5">Stock</th>
								<th class="px-3.5 py-2.5">SKU</th>
								<th class="px-3.5 py-2.5 text-center">Action</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100 bg-white">
							{#each variants as variant, i}
								<tr class="hover:bg-slate-50/60 transition-colors">
									<td class="px-3.5 py-2 font-bold text-slate-800">
										{variant.name}
									</td>
									<td class="px-3.5 py-2">
										<input
											type="number"
											bind:value={variant.price}
											class="w-24 px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono"
										/>
									</td>
									<td class="px-3.5 py-2">
										<input
											type="number"
											bind:value={variant.stock}
											class="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono"
										/>
									</td>
									<td class="px-3.5 py-2">
										<input
											type="text"
											bind:value={variant.sku}
											class="w-28 px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono uppercase"
										/>
									</td>
									<td class="px-3.5 py-2 text-center">
										<button
											type="button"
											onclick={() => removeVariantRow(i)}
											class="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
											title="Delete"
										>
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>
