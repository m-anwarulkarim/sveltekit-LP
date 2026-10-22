<script lang="ts">
	import { enhance } from '$app/forms';
	import { Database, RefreshCw, Server, Table } from 'lucide-svelte';

	let { data }: { data: any } = $props();
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Header -->
	<div class="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
		<div>
			<h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
				<Database class="w-5 h-5 text-[#5845eb]" />
				<span>Cloudflare D1 ডেটাবেজ কনসোল</span>
			</h2>
			<p class="text-xs text-slate-500 mt-0.5">
				গ্লোবাল এজ ডেটাবেজ স্ট্যাটাস, রিলেশনাল টেবিল মেট্রিক্স ও অটোমেটেড সিডিং
			</p>
		</div>

		<div class="flex items-center gap-2">
			<span class="w-2.5 h-2.5 rounded-full {data.isD1Connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}"></span>
			<span class="text-xs font-bold text-slate-700">
				{data.isD1Connected ? 'Cloudflare D1 লাইভ সংযুক্ত' : 'লোকাল মেমোরি মিরর'}
			</span>
		</div>
	</div>

	<!-- Database Metrics Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
		<div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
			<span class="text-xs text-slate-500 font-bold block">products টেবিল</span>
			<span class="text-2xl font-black text-slate-900 font-['Outfit'] mt-1 block">{(data.products || []).length}</span>
			<span class="text-[11px] text-slate-400 mt-0.5 block">সক্রিয় প্রোডাক্টস</span>
		</div>

		<div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
			<span class="text-xs text-slate-500 font-bold block">orders টেবিল</span>
			<span class="text-2xl font-black text-slate-900 font-['Outfit'] mt-1 block">{(data.orders || []).length}</span>
			<span class="text-[11px] text-slate-400 mt-0.5 block">মোট রেকর্ড</span>
		</div>

		<div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
			<span class="text-xs text-slate-500 font-bold block">reviews টেবিল</span>
			<span class="text-2xl font-black text-slate-900 font-['Outfit'] mt-1 block">{(data.reviews || []).length}</span>
			<span class="text-[11px] text-slate-400 mt-0.5 block">কাস্টমার মতামত</span>
		</div>

		<div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
			<span class="text-xs text-slate-500 font-bold block">newsletter টেবিল</span>
			<span class="text-2xl font-black text-slate-900 font-['Outfit'] mt-1 block">{(data.newsletter || []).length}</span>
			<span class="text-[11px] text-slate-400 mt-0.5 block">ভিআইপি গ্রাহক</span>
		</div>
	</div>

	<!-- Schema Table Summary -->
	<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
		<div class="p-4 border-b border-slate-100 flex items-center justify-between">
			<h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
				<Table class="w-4 h-4 text-[#5845eb]" />
				<span>ডেটাবেজ স্কিমা বিবরণ (Drizzle ORM + SQLite D1)</span>
			</h3>
			<span class="text-xs font-mono text-slate-500">d1-test-landing</span>
		</div>

		<div class="p-5 space-y-4 text-xs">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
					<div class="font-bold text-slate-800">orders (অর্ডারস স্কিমা)</div>
					<div class="font-mono text-[11px] text-slate-500 mt-1">
						id (TEXT PK), customerName, customerEmail, shippingAddress, items (JSON), total (INT), status, createdAt
					</div>
				</div>

				<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
					<div class="font-bold text-slate-800">products (প্রোডাক্টস স্কিমা)</div>
					<div class="font-mono text-[11px] text-slate-500 mt-1">
						id (TEXT PK), name, slug, price, originalPrice, inStock (BOOLEAN), category, badge
					</div>
				</div>
			</div>
		</div>

		<div class="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
			<div>
				<span class="text-xs font-bold text-slate-800 block">ডেটাবেজ রিসিড বা রিসেট</span>
				<span class="text-[11px] text-slate-500">স্যাম্পল ডেটা পুনরায় ইনস্টল করতে এই অ্যাকশন ব্যবহার করুন</span>
			</div>

			<form method="POST" action="?/seedDatabase" use:enhance>
				<button
					type="submit"
					class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
				>
					<RefreshCw class="w-3.5 h-3.5" />
					<span>D1 ডেটাবেজ রিসিড করুন</span>
				</button>
			</form>
		</div>
	</div>
</div>
