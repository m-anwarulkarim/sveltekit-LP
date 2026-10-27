<script lang="ts">
	import type { AdminProduct } from '../../_data.ts';
	import { X, Plus, Trash2, Image as ImageIcon, Sparkles } from 'lucide-svelte';
	import { MediaPickerModal } from '../gallery';

	interface Props {
		open: boolean;
		product: AdminProduct | null;
		onClose: () => void;
		onSave: (product: Partial<AdminProduct>) => void;
	}

	let { open = $bindable(false), product = null, onClose, onSave }: Props = $props();

	let isGalleryPickerOpen = $state(false);
	let name = $state('');
	let category = $state('CAR COLOUR');
	let subCategory = $state('-');
	let price = $state(490);
	let originalPrice = $state(750);
	let stock = $state(100);
	let openingStock = $state(0);
	let status = $state<'published' | 'draft'>('published');
	let priority = $state('-');
	let tags = $state('Best Sale Products, New Arrival');
	let image = $state('/images/products/car-paint-pen.svg');
	let hasVariants = $state(false);
	let variants = $state<Array<{ name: string; stock: number; openingStock?: number }>>([
		{ name: 'WHITE', stock: 9997, openingStock: 0 },
		{ name: 'BLACK', stock: 9995, openingStock: 0 }
	]);

	$effect(() => {
		if (product) {
			name = product.name;
			category = product.category;
			subCategory = product.subCategory || '-';
			price = product.price;
			originalPrice = product.originalPrice;
			stock = product.stock ?? 100;
			openingStock = product.openingStock ?? 0;
			status = product.status || 'published';
			priority = product.priority || '-';
			tags = (product.tags || []).join(', ');
			image = product.image;
			hasVariants = !!(product.variants && product.variants.length > 0);
			variants = product.variants ? JSON.parse(JSON.stringify(product.variants)) : [];
		} else {
			name = '';
			category = 'CAR COLOUR';
			subCategory = '-';
			price = 490;
			originalPrice = 750;
			stock = 100;
			openingStock = 0;
			status = 'published';
			priority = '-';
			tags = 'Best Sale Products, New Arrival';
			image = '/images/products/car-paint-pen.svg';
			hasVariants = false;
			variants = [
				{ name: 'WHITE', stock: 9997, openingStock: 0 },
				{ name: 'BLACK', stock: 9995, openingStock: 0 }
			];
		}
	});

	function addVariant() {
		variants = [...variants, { name: 'NEW VARIANT', stock: 100, openingStock: 0 }];
	}

	function removeVariant(index: number) {
		variants = variants.filter((_, i) => i !== index);
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!name.trim()) return;

		const tagList = tags
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);

		onSave({
			name,
			slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
			tagline: name,
			category,
			subCategory,
			price: Number(price),
			originalPrice: Number(originalPrice),
			stock: hasVariants ? variants.reduce((sum, v) => sum + v.stock, 0) : Number(stock),
			openingStock: hasVariants
				? variants.reduce((sum, v) => sum + (v.openingStock || 0), 0)
				: Number(openingStock),
			status,
			priority,
			tags: tagList,
			image: image || '/images/products/car-paint-pen.svg',
			inStock: true,
			badge: status === 'published' ? 'Published' : 'Draft',
			description: name,
			variants: hasVariants ? variants : undefined
		});
		onClose();
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
		<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
			<!-- Header -->
			<div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb]">
						<Sparkles class="w-4 h-4" />
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900">
							{product ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট যুক্ত করুন'}
						</h3>
						<p class="text-xs text-slate-500">প্রোডাক্টের বিবরণ ও ভেরিয়েন্ট কনফিগার করুন</p>
					</div>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
					aria-label="Close dialog"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Form Content (Scrollable) -->
			<form onsubmit={handleSubmit} class="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
				<!-- 1. Product Name -->
				<div>
					<label for="prod_name" class="block text-xs font-bold text-slate-700 mb-1.5">
						প্রোডাক্টের নাম *
					</label>
					<input
						id="prod_name"
						type="text"
						bind:value={name}
						required
						placeholder="যেমন: Car Paint Touch-up Pen"
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-all shadow-2xs font-medium"
					/>
				</div>

				<!-- 2. Category & Subcategory -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="prod_cat" class="block text-xs font-bold text-slate-700 mb-1.5">ক্যাটাগরি</label>
						<select
							id="prod_cat"
							bind:value={category}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-all shadow-2xs font-medium cursor-pointer"
						>
							<option value="CAR COLOUR">CAR COLOUR</option>
							<option value="3D WALL STICKER">3D WALL STICKER</option>
							<option value="Mosquito lamp">Mosquito lamp</option>
							<option value="Hardware">Hardware</option>
							<option value="Audio">Audio</option>
							<option value="Studio">Studio</option>
							<option value="Home Improvement">Home Improvement</option>
						</select>
					</div>
					<div>
						<label for="prod_subcat" class="block text-xs font-bold text-slate-700 mb-1.5">সাব-ক্যাটাগরি</label>
						<input
							id="prod_subcat"
							type="text"
							bind:value={subCategory}
							placeholder="-"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-all shadow-2xs font-medium"
						/>
					</div>
				</div>

				<!-- 3. Price & Original Price -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="prod_price" class="block text-xs font-bold text-slate-700 mb-1.5">বিক্রয় মূল্য (৳) *</label>
						<input
							id="prod_price"
							type="number"
							bind:value={price}
							required
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-all shadow-2xs font-mono font-semibold"
						/>
					</div>
					<div>
						<label for="prod_orig_price" class="block text-xs font-bold text-slate-700 mb-1.5">মূল মূল্য / MRP (৳)</label>
						<input
							id="prod_orig_price"
							type="number"
							bind:value={originalPrice}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-all shadow-2xs font-mono font-semibold"
						/>
					</div>
				</div>

				<!-- 4. Tags & Priority -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="prod_tags" class="block text-xs font-bold text-slate-700 mb-1.5">ট্যাগসমূহ (কমা দিয়ে পৃথক করুন)</label>
						<input
							id="prod_tags"
							type="text"
							bind:value={tags}
							placeholder="Best Sale Products, New Arrival"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-all shadow-2xs"
						/>
					</div>
					<div>
						<label for="prod_priority" class="block text-xs font-bold text-slate-700 mb-1.5">প্রায়োরিটি / স্টার</label>
						<input
							id="prod_priority"
							type="text"
							bind:value={priority}
							placeholder="-"
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-all shadow-2xs"
						/>
					</div>
				</div>

				<!-- 5. Status & Image URL -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="prod_status" class="block text-xs font-bold text-slate-700 mb-1.5">স্ট্যাটাস</label>
						<select
							id="prod_status"
							bind:value={status}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-all shadow-2xs font-semibold cursor-pointer"
						>
							<option value="published">Published</option>
							<option value="draft">Draft</option>
						</select>
					</div>
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<label for="prod_image" class="block text-xs font-bold text-slate-700">ইমেজ URL / পাথ</label>
							<button
								type="button"
								onclick={() => (isGalleryPickerOpen = true)}
								class="text-[11px] font-bold text-[#5845eb] hover:underline flex items-center gap-1 cursor-pointer"
							>
								<ImageIcon class="w-3 h-3" />
								<span>গ্যালারি থেকে নিন</span>
							</button>
						</div>
						<div class="flex items-center gap-2">
							<input
								id="prod_image"
								type="text"
								bind:value={image}
								class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-all shadow-2xs font-mono"
							/>
							{#if image}
								<div class="w-9 h-9 rounded-lg border border-slate-200 bg-white p-1 shrink-0 flex items-center justify-center overflow-hidden">
									<img src={image} alt="Preview" class="max-w-full max-h-full object-contain" />
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- 6. Variants Section Toggle -->
				<div class="pt-2 border-t border-slate-100">
					<div class="flex items-center justify-between mb-3">
						<div>
							<h4 class="text-xs font-bold text-slate-800">মাল্টিপল ভেরিয়েন্ট ও স্টক</h4>
							<p class="text-[11px] text-slate-500">কালার বা সাইজ অনুযায়ী আলাদা আলাদা স্টক নির্ধারণ করুন</p>
						</div>
						<label class="relative inline-flex items-center cursor-pointer">
							<input type="checkbox" bind:checked={hasVariants} class="sr-only peer" />
							<div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5845eb]"></div>
						</label>
					</div>

					{#if hasVariants}
						<div class="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
							{#each variants as variant, i}
								<div class="flex items-center gap-2">
									<input
										type="text"
										bind:value={variant.name}
										placeholder="ভেরিয়েন্টের নাম (WHITE)"
										class="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 uppercase focus:outline-none focus:border-[#5845eb]"
									/>
									<input
										type="number"
										bind:value={variant.stock}
										placeholder="স্টক"
										class="w-24 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#5845eb]"
									/>
									<input
										type="number"
										bind:value={variant.openingStock}
										placeholder="ওপেনিং"
										class="w-24 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#5845eb]"
									/>
									<button
										type="button"
										onclick={() => removeVariant(i)}
										class="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
										title="মুছুন"
									>
										<Trash2 class="w-4 h-4" />
									</button>
								</div>
							{/each}

							<button
								type="button"
								onclick={addVariant}
								class="text-xs font-bold text-[#5845eb] hover:text-[#4936d6] inline-flex items-center gap-1 pt-1 cursor-pointer"
							>
								<Plus class="w-3.5 h-3.5" />
								<span>আরও ভেরিয়েন্ট যোগ করুন</span>
							</button>
						</div>
					{:else}
						<div class="grid grid-cols-2 gap-3">
							<div>
								<label for="single_stock" class="block text-xs font-bold text-slate-700 mb-1">কারেন্ট স্টক</label>
								<input
									id="single_stock"
									type="number"
									bind:value={stock}
									class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono font-semibold"
								/>
							</div>
							<div>
								<label for="single_opening_stock" class="block text-xs font-bold text-slate-700 mb-1">ওপেনিং স্টক</label>
								<input
									id="single_opening_stock"
									type="number"
									bind:value={openingStock}
									class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono font-semibold"
								/>
							</div>
						</div>
					{/if}
				</div>

				<!-- Footer Buttons -->
				<div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
					<button
						type="button"
						onclick={onClose}
						class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
					>
						বাতিল
					</button>
					<button
						type="submit"
						class="px-5 py-2.5 rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
					>
						সংরক্ষণ করুন
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Reusable Media Picker Modal for Instant Reuse -->
	<MediaPickerModal
		bind:open={isGalleryPickerOpen}
		onSelect={(url) => {
			image = url;
		}}
		title="প্রোডাক্টের জন্য গ্যালারি থেকে ছবি বেছে নিন"
	/>
{/if}
