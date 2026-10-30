<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Tag,
		Plus,
		Search,
		Calendar,
		Percent,
		DollarSign,
		Edit3,
		Trash2,
		RotateCcw,
		Copy,
		Check,
		ExternalLink,
		Sparkles
	} from 'lucide-svelte';
	import {
		Button,
		Input,
		Badge,
		Card,
		Table,
		TableHeader,
		TableRow,
		TableHead,
		TableBody,
		TableCell,
		Switch
	} from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let searchQuery = $state(data.searchQuery || '');
	let copiedId = $state<string | null>(null);
	let activeTab = $derived(data.activeTab || 'all');

	// Notification toasts
	$effect(() => {
		if (form?.message) {
			if (form.success) {
				toast.success(form.message);
			} else {
				toast.error(form.message);
			}
		}
	});

	function formatTaka(amount: number) {
		return '৳ ' + (amount || 0).toLocaleString('en-US');
	}

	function formatDisplayDate(dateStr: string | null): string {
		if (!dateStr) return 'আজীবন মেয়াদী';
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
		} catch {
			return dateStr;
		}
	}

	function copyToClipboard(code: string, id: string) {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(code);
			copiedId = id;
			toast.success(`কুপন কোড "${code}" কপি করা হয়েছে!`);
			setTimeout(() => {
				if (copiedId === id) copiedId = null;
			}, 2000);
		}
	}
</script>

<svelte:head>
	<title>কুপন ব্যবস্থাপনা | AURA Admin Control Deck</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
				<Tag class="w-6 h-6 text-[#635BFF]" />
				<span>কুপন ও ডিসকাউন্ট অফার (Coupons)</span>
			</h2>
			<p class="text-xs text-slate-500 mt-1">
				গ্রাহকদের জন্য বিশেষ ডিসকাউন্ট কোড, ফ্ল্যাট অফার ও প্রচারমূলক ক্যাম্পেইন পরিচালনা করুন
			</p>
		</div>

		<div class="flex items-center gap-2.5">
			<Button
				href="/admin/coupon/add-coupon"
				class="bg-[#635BFF] hover:bg-[#5249e6] text-white font-bold px-5 py-2.5 rounded-xl shadow-sm text-xs flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
			>
				<Plus class="w-4 h-4 stroke-[2.5]" />
				<span>নতুন কুপন যোগ করুন (Add Coupon)</span>
			</Button>
		</div>
	</div>

	<!-- Top Metric Counters -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<Card class="p-4 rounded-3xl border-slate-200/90 shadow-2xs bg-white flex items-center justify-between">
			<div>
				<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট কুপন</p>
				<h3 class="text-2xl font-black text-slate-900 mt-1 font-['Outfit']">{data.counts.all} টি</h3>
				<span class="text-[11px] text-slate-500 font-medium mt-0.5 inline-block">সর্বমোট অফার</span>
			</div>
			<div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#635BFF]">
				<Tag class="w-5 h-5" />
			</div>
		</Card>

		<Card class="p-4 rounded-3xl border-slate-200/90 shadow-2xs bg-white flex items-center justify-between">
			<div>
				<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">প্রকাশিত (Active)</p>
				<h3 class="text-2xl font-black text-emerald-600 mt-1 font-['Outfit']">{data.counts.publish} টি</h3>
				<span class="text-[11px] text-emerald-700/80 font-medium mt-0.5 inline-block">লাইভ চেকআউট সচল</span>
			</div>
			<div class="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
				<Sparkles class="w-5 h-5" />
			</div>
		</Card>

		<Card class="p-4 rounded-3xl border-slate-200/90 shadow-2xs bg-white flex items-center justify-between">
			<div>
				<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ড্রাফট (Draft)</p>
				<h3 class="text-2xl font-black text-slate-700 mt-1 font-['Outfit']">{data.counts.draft} টি</h3>
				<span class="text-[11px] text-slate-500 font-medium mt-0.5 inline-block">অপ্রকাশিত অফার</span>
			</div>
			<div class="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
				<Edit3 class="w-5 h-5" />
			</div>
		</Card>

		<Card class="p-4 rounded-3xl border-slate-200/90 shadow-2xs bg-white flex items-center justify-between">
			<div>
				<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ট্র্যাশ (Trash)</p>
				<h3 class="text-2xl font-black text-rose-600 mt-1 font-['Outfit']">{data.counts.trash} টি</h3>
				<span class="text-[11px] text-rose-700/80 font-medium mt-0.5 inline-block">বাতিলকৃত কুপন</span>
			</div>
			<div class="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
				<Trash2 class="w-5 h-5" />
			</div>
		</Card>
	</div>

	<!-- Main Filter & Content Card -->
	<Card class="rounded-3xl border-slate-200/90 p-5 md:p-6 shadow-2xs bg-white space-y-5">
		<!-- Search & Tabs Header -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
			<!-- Status Filter Tabs -->
			<div class="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70">
				<a
					href="/admin/coupon?status=all"
					class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 {activeTab === 'all'
						? 'bg-white text-slate-900 shadow-xs'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					<span>All Data</span>
					<Badge variant="outline" class="h-4 px-1.5 text-[10px] font-mono {activeTab === 'all' ? 'bg-indigo-50 text-[#5845eb] border-indigo-200' : 'bg-slate-200/80 text-slate-600'}">
						{data.counts.all}
					</Badge>
				</a>

				<a
					href="/admin/coupon?status=publish"
					class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 {activeTab === 'publish'
						? 'bg-white text-slate-900 shadow-xs'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					<span>Publish</span>
					<Badge variant="outline" class="h-4 px-1.5 text-[10px] font-mono {activeTab === 'publish' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-200/80 text-slate-600'}">
						{data.counts.publish}
					</Badge>
				</a>

				<a
					href="/admin/coupon?status=draft"
					class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 {activeTab === 'draft'
						? 'bg-white text-slate-900 shadow-xs'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					<span>Draft</span>
					<Badge variant="outline" class="h-4 px-1.5 text-[10px] font-mono {activeTab === 'draft' ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-200/80 text-slate-600'}">
						{data.counts.draft}
					</Badge>
				</a>

				<a
					href="/admin/coupon?status=trash"
					class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 {activeTab === 'trash'
						? 'bg-white text-slate-900 shadow-xs'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					<span>Trash</span>
					<Badge variant="outline" class="h-4 px-1.5 text-[10px] font-mono {activeTab === 'trash' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-200/80 text-slate-600'}">
						{data.counts.trash}
					</Badge>
				</a>
			</div>

			<!-- Search Form -->
			<form method="GET" class="relative min-w-[260px] md:min-w-[320px]">
				{#if activeTab !== 'all'}
					<input type="hidden" name="status" value={activeTab} />
				{/if}
				<Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
				<Input
					type="search"
					name="search"
					placeholder="কুপনের নাম বা কোড খুঁজুন..."
					bind:value={searchQuery}
					class="pl-10 pr-4 h-10 rounded-2xl bg-slate-50/80 border-slate-200 text-xs font-medium focus:bg-white"
				/>
			</form>
		</div>

		<!-- Coupons Table / List -->
		<div class="overflow-x-auto rounded-2xl border border-slate-200/80">
			{#if (data.coupons || []).length === 0}
				<!-- Empty State Matching Screenshot 1 -->
				<div class="py-20 flex flex-col items-center justify-center text-center p-6 space-y-3">
					<div class="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#635BFF] shadow-xs">
						<Tag class="w-8 h-8 stroke-[1.75]" />
					</div>
					<div class="space-y-1">
						<h4 class="text-base font-bold text-slate-900">কোনো কুপন পাওয়া যায়নি</h4>
						<p class="text-xs text-slate-400 max-w-sm">
							{searchQuery
								? 'আপনার সার্চ করা শব্দের সাথে মিল রেখে কোনো কুপন পাওয়া যায়নি।'
								: 'গ্রাহকদের জন্য নতুন ডিসকাউন্ট অফার তৈরি করতে নিচের বাটনে ক্লিক করুন।'}
						</p>
					</div>
					<Button
						href="/admin/coupon/add-coupon"
						class="bg-[#635BFF] hover:bg-[#5249e6] text-white font-bold px-6 py-2 rounded-xl text-xs mt-2"
					>
						<Plus class="w-3.5 h-3.5 mr-1.5" />
						নতুন কুপন তৈরি করুন
					</Button>
				</div>
			{:else}
				<Table>
					<TableHeader>
						<TableRow class="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
							<TableHead class="w-16 text-center">ব্যানার</TableHead>
							<TableHead>কুপনের বিবরণ</TableHead>
							<TableHead>কুপন কোড</TableHead>
							<TableHead>ছাড়ের পরিমাণ</TableHead>
							<TableHead>নূন্যতম অর্ডার</TableHead>
							<TableHead>মেয়াদকাল</TableHead>
							<TableHead class="text-center">স্ট্যাটাস</TableHead>
							<TableHead class="text-right">অ্যাকশন</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each data.coupons as coupon (coupon.id)}
							<TableRow class="hover:bg-slate-50/60 transition-colors text-xs">
								<!-- Banner Image -->
								<TableCell class="text-center">
									{#if coupon.bannerImage}
										<img
											src={coupon.bannerImage}
											alt={coupon.name}
											class="w-10 h-10 rounded-xl object-cover border border-slate-200 mx-auto"
										/>
									{:else}
										<div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-[#635BFF] flex items-center justify-center mx-auto">
											<Tag class="w-4 h-4" />
										</div>
									{/if}
								</TableCell>

								<!-- Name & Notes -->
								<TableCell>
									<div class="space-y-0.5">
										<span class="font-bold text-slate-900 block">{coupon.name}</span>
										{#if coupon.description}
											<p class="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{coupon.description}</p>
										{/if}
									</div>
								</TableCell>

								<!-- Coupon Code with Copy Button -->
								<TableCell>
									<button
										type="button"
										onclick={() => copyToClipboard(coupon.code, coupon.id)}
										class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/90 text-[#5845eb] font-mono font-bold text-xs hover:bg-indigo-100/80 transition-colors cursor-pointer"
										title="কপি করতে ক্লিক করুন"
									>
										<span>{coupon.code}</span>
										{#if copiedId === coupon.id}
											<Check class="w-3 h-3 text-emerald-600" />
										{:else}
											<Copy class="w-3 h-3 opacity-60" />
										{/if}
									</button>
								</TableCell>

								<!-- Discount Type & Value -->
								<TableCell>
									{#if coupon.discountType === 'percentage'}
										<Badge variant="outline" class="font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
											{coupon.discountValue}% ছাড়
										</Badge>
									{:else}
										<Badge variant="outline" class="font-bold text-sky-700 bg-sky-50 border-sky-200">
											{formatTaka(coupon.discountValue)} ফ্ল্যাট
										</Badge>
									{/if}
								</TableCell>

								<!-- Min Order -->
								<TableCell class="font-mono font-semibold text-slate-700">
									{coupon.minOrderAmount > 0 ? formatTaka(coupon.minOrderAmount) : 'কোন শর্ত নেই'}
								</TableCell>

								<!-- Validity (Start - End) -->
								<TableCell class="text-[11px] text-slate-600">
									<div class="flex items-center gap-1">
										<Calendar class="w-3 h-3 text-slate-400 shrink-0" />
										<span>{formatDisplayDate(coupon.startDate)} — {formatDisplayDate(coupon.endDate)}</span>
									</div>
								</TableCell>

								<!-- Status Switch -->
								<TableCell class="text-center">
									{#if coupon.status === 'trash'}
										<Badge variant="outline" class="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">
											ট্র্যাশে আছে
										</Badge>
									{:else}
										<form method="POST" action="?/toggleStatus" use:enhance>
											<input type="hidden" name="id" value={coupon.id} />
											<button
												type="submit"
												class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all {coupon.status === 'publish'
													? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
													: 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'}"
											>
												<span class="w-1.5 h-1.5 rounded-full {coupon.status === 'publish' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}"></span>
												<span>{coupon.status === 'publish' ? 'পাবলিশড' : 'ড্রাফট'}</span>
											</button>
										</form>
									{/if}
								</TableCell>

								<!-- Actions -->
								<TableCell class="text-right">
									<div class="flex items-center justify-end gap-1.5">
										{#if coupon.status === 'trash'}
											<form method="POST" action="?/restore" use:enhance>
												<input type="hidden" name="id" value={coupon.id} />
												<Button
													type="submit"
													variant="ghost"
													size="icon"
													class="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-xl"
													title="রিস্টোর করুন"
												>
													<RotateCcw class="w-4 h-4" />
												</Button>
											</form>
											<form method="POST" action="?/deletePermanent" use:enhance>
												<input type="hidden" name="id" value={coupon.id} />
												<Button
													type="submit"
													variant="ghost"
													size="icon"
													class="h-8 w-8 text-rose-600 hover:bg-rose-50 rounded-xl"
													title="স্থায়ীভাবে মুছুন"
												>
													<Trash2 class="w-4 h-4" />
												</Button>
											</form>
										{:else}
											<Button
												href="/admin/coupon/edit/{coupon.id}"
												variant="ghost"
												size="icon"
												class="h-8 w-8 text-sky-600 hover:bg-sky-50 rounded-xl"
												title="এডিট করুন"
											>
												<Edit3 class="w-4 h-4" />
											</Button>
											<form method="POST" action="?/trash" use:enhance>
												<input type="hidden" name="id" value={coupon.id} />
												<Button
													type="submit"
													variant="ghost"
													size="icon"
													class="h-8 w-8 text-rose-600 hover:bg-rose-50 rounded-xl"
													title="ট্র্যাশে সরান"
												>
													<Trash2 class="w-4 h-4" />
												</Button>
											</form>
										{/if}
									</div>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{/if}
		</div>
	</Card>
</div>

