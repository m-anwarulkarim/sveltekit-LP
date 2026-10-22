<script lang="ts">
	import { enhance } from '$app/forms';
	import { Package, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-svelte';

	let { data }: { data: any } = $props();

	function formatTaka(amount: number) {
		return '৳' + (amount || 0).toLocaleString('en-US');
	}
</script>

<div class="space-y-6 max-w-7xl mx-auto">
	<!-- Header -->
	<div class="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
		<div>
			<h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
				<Package class="w-5 h-5 text-[#5845eb]" />
				<span>পণ্য ক্যাটালগ ও স্টক ব্যবস্থাপনা</span>
			</h2>
			<p class="text-xs text-slate-500 mt-0.5">
				ইনভেন্টরি ট্র্যাকিং, লাইভ প্রাইসিং এবং ইনস্ট্যান্ট ইন-স্টক সুইচ
			</p>
		</div>

		<div class="flex items-center gap-3">
			<span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#5845eb] border border-indigo-200">
				মোট {(data.products || []).length} টি প্রডাক্ট
			</span>
		</div>
	</div>

	<!-- Products Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
		{#each data.products || [] as prod}
			<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-[#5845eb] border border-indigo-200">
							{prod.badge || 'PRO'}
						</span>
						<span class="inline-flex items-center gap-1 text-xs font-bold {prod.inStock ? 'text-emerald-600' : 'text-rose-600'}">
							{#if prod.inStock}
								<CheckCircle2 class="w-3.5 h-3.5" />
								<span>স্টকে আছে</span>
							{:else}
								<AlertCircle class="w-3.5 h-3.5" />
								<span>স্টক শেষ</span>
							{/if}
						</span>
					</div>

					<div>
						<h4 class="font-bold text-base text-slate-900">{prod.name}</h4>
						<p class="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{prod.tagline || prod.description}</p>
					</div>
				</div>

				<div class="pt-4 border-t border-slate-100 flex items-center justify-between">
					<div>
						<span class="text-[10px] text-slate-400 block font-bold">মূল্য</span>
						<span class="font-bold text-lg text-slate-900 font-['Outfit']">{formatTaka(prod.price)}</span>
					</div>
					
					<form method="POST" action="?/toggleProductStock" use:enhance>
						<input type="hidden" name="productId" value={prod.id} />
						<input type="hidden" name="inStock" value={(!prod.inStock).toString()} />
						<button
							type="submit"
							class="px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer {prod.inStock
								? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
								: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}"
						>
							{prod.inStock ? 'আউট অফ স্টক করুন' : 'ইন-স্টক করুন'}
						</button>
					</form>
				</div>
			</div>
		{/each}
	</div>
</div>
