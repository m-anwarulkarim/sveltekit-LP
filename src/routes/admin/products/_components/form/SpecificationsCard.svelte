<script lang="ts">
	import { Plus, Trash2, Tag, Check, X } from 'lucide-svelte';
	import type { ProductSpec } from '../../../_data';

	interface Props {
		brand: string;
		model: string;
		specifications: ProductSpec[];
	}

	let {
		brand = $bindable(''),
		model = $bindable(''),
		specifications = $bindable([])
	}: Props = $props();

	// Preloaded brands list
	let availableBrands = $state<string[]>([
		'AURA Acoustics',
		'Sony',
		'Bose',
		'Sennheiser',
		'Apple',
		'Samsung',
		'Xiaomi',
		'No Brand'
	]);

	let isAddingBrandModal = $state(false);
	let newBrandName = $state('');

	function handleAddBrand() {
		if (newBrandName.trim() && !availableBrands.includes(newBrandName.trim())) {
			availableBrands = [newBrandName.trim(), ...availableBrands];
			brand = newBrandName.trim();
			newBrandName = '';
			isAddingBrandModal = false;
		}
	}

	function addSpecification() {
		specifications = [...specifications, { key: '', value: '' }];
	}

	function removeSpecification(index: number) {
		specifications = specifications.filter((_, i) => i !== index);
	}
</script>

<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-6">
	<!-- 1. Product Specification (Brand & Model) -->
	<div class="space-y-4">
		<div class="border-b border-slate-100 pb-3">
			<h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
				<span>Product Specification</span>
			</h2>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<!-- Brand Selection -->
			<div class="space-y-1.5">
				<label for="brand-select-input" class="block text-xs font-bold text-slate-700">Brand</label>
				<select
					id="brand-select-input"
					bind:value={brand}
					class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-medium transition-all"
				>
					<option value="">Select Brand</option>
					{#each availableBrands as b}
						<option value={b}>{b}</option>
					{/each}
				</select>

				<!-- Add New Brand Button matching screenshot (+ button) -->
				<button
					type="button"
					onclick={() => (isAddingBrandModal = true)}
					class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-[#5845eb] bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer mt-1"
				>
					<Plus class="w-3.5 h-3.5" />
					<span>Add New Brand +</span>
				</button>
			</div>

			<!-- Model Input -->
			<div class="space-y-1.5">
				<label for="product-model-input" class="block text-xs font-bold text-slate-700">Model</label>
				<input
					id="product-model-input"
					type="text"
					bind:value={model}
					placeholder="Enter model (e.g. Pro-X9)"
					class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb] focus:ring-3 focus:ring-[#5845eb]/10 text-sm font-medium transition-all"
				/>
			</div>
		</div>
	</div>

	<!-- 2. Others Specification (Key-Value pairs) -->
	<div class="space-y-4 pt-2 border-t border-slate-100">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-sm font-bold text-slate-800">Others Specification</h3>
				<p class="text-xs text-slate-400 font-normal">যেমন: Material, Warranty, Weight, Color, Origin ইত্যাদি</p>
			</div>

			<!-- + Add New Spec Button (matching screenshot style) -->
			<button
				type="button"
				onclick={addSpecification}
				class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
			>
				<Plus class="w-3.5 h-3.5" />
				<span>Add New Spec. +</span>
			</button>
		</div>

		<!-- Specifications List -->
		{#if specifications.length === 0}
			<div class="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
				কোনো অতিরিক্ত স্পেসিফিকেশন যুক্ত করা নেই। উপরে <span class="font-bold text-emerald-700">+ Add New Spec.</span> এ ক্লিক করে যুক্ত করুন।
			</div>
		{:else}
			<div class="space-y-2.5">
				{#each specifications as spec, idx}
					<div class="flex items-center gap-2.5 animate-in fade-in">
						<input
							type="text"
							bind:value={spec.key}
							placeholder="Specification Name (e.g. Material)"
							class="w-1/3 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb]"
						/>
						<input
							type="text"
							bind:value={spec.value}
							placeholder="Specification Value (e.g. Cotton 100%)"
							class="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#5845eb]"
						/>
						<button
							type="button"
							onclick={() => removeSpecification(idx)}
							class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
							title="Delete specification"
						>
							<Trash2 class="w-4 h-4" />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Add Brand Mini Modal -->
{#if isAddingBrandModal}
	<div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95">
			<div class="flex items-center justify-between border-b border-slate-100 pb-3">
				<h3 class="text-sm font-bold text-slate-900">Add New Brand</h3>
				<button
					type="button"
					onclick={() => (isAddingBrandModal = false)}
					class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<div class="space-y-1.5">
				<label for="new-brand-modal-input" class="block text-xs font-bold text-slate-700">Brand Name</label>
				<input
					id="new-brand-modal-input"
					type="text"
					bind:value={newBrandName}
					placeholder="Enter brand name"
					class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#5845eb]"
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							handleAddBrand();
						}
					}}
				/>
			</div>

			<div class="flex justify-end gap-2 pt-2">
				<button
					type="button"
					onclick={() => (isAddingBrandModal = false)}
					class="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleAddBrand}
					class="px-4 py-1.5 rounded-xl bg-[#5845eb] text-white text-xs font-bold hover:bg-[#4834d4] cursor-pointer shadow-xs"
				>
					Add Brand
				</button>
			</div>
		</div>
	</div>
{/if}

