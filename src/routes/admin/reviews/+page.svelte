<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button, Badge, Input, Card, Separator } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import {
		MessageSquare,
		Star,
		Clock,
		CheckCircle2,
		XCircle,
		Award,
		Search,
		ChevronLeft,
		ChevronRight,
		Trash2,
		Reply,
		ThumbsUp,
		Eye,
		MoreVertical,
		Filter,
		X,
		ShieldCheck,
		AlertTriangle,
		ExternalLink,
		Sparkles
	} from 'lucide-svelte';

	let { data, form }: { data: any; form: any } = $props();

	// Reactive data from server
	let reviews = $derived(data?.reviews || []);
	let stats = $derived(data?.stats || { total: 0, pending: 0, approved: 0, rejected: 0, featured: 0, avgRating: 0 });
	let totalCount = $derived(data?.totalCount || 0);
	let currentPage = $derived(data?.currentPage || 1);
	let perPage = $derived(data?.perPage || 15);
	let filterStatus = $derived(data?.filterStatus || 'all');
	let searchQuery = $state('');

	// Local UI state
	let selectedIds = $state<Set<string>>(new Set());
	let replyingTo = $state<string | null>(null);
	let replyText = $state('');
	let expandedReview = $state<string | null>(null);
	let isSubmitting = $state(false);
	let confirmDeleteId = $state<string | null>(null);

	// Sync searchQuery from server data
	$effect(() => {
		searchQuery = data?.searchQuery || '';
	});

	const totalPages = $derived(Math.ceil(totalCount / perPage));

	// ─── URL Navigation ──────────────────────────────────────────
	function navUrl(overrides: Record<string, string | number> = {}) {
		const params = new URLSearchParams();
		const s = String(overrides.status ?? filterStatus);
		const q = 'q' in overrides ? String(overrides.q) : searchQuery.trim();
		const p = Number(overrides.page ?? currentPage);
		const l = Number(overrides.limit ?? perPage);

		if (s && s !== 'all') params.set('status', s);
		if (q) params.set('q', q);
		if (p > 1) params.set('page', String(p));
		if (l !== 15) params.set('limit', String(l));

		const qs = params.toString();
		return `/admin/reviews${qs ? '?' + qs : ''}`;
	}

	let searchTimer: ReturnType<typeof setTimeout>;
	function handleSearchInput() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => goto(navUrl({ q: searchQuery, page: 1 })), 350);
	}

	// ─── Selection ───────────────────────────────────────────────
	function toggleSelect(id: string) {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedIds = next;
	}

	function toggleSelectAll() {
		if (selectedIds.size === reviews.length) {
			selectedIds = new Set();
		} else {
			selectedIds = new Set(reviews.map((r: any) => r.id));
		}
	}

	// ─── Stars helper ────────────────────────────────────────────
	function starArray(rating: number): boolean[] {
		return Array.from({ length: 5 }, (_, i) => i < rating);
	}

	// ─── Date helper ─────────────────────────────────────────────
	function formatDate(ts: any): string {
		if (!ts) return '—';
		const d = new Date(typeof ts === 'number' ? ts : ts);
		return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	// ─── Status badge ────────────────────────────────────────────
	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
			case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
			case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
			default: return 'bg-slate-50 text-slate-600 border-slate-200';
		}
	}
	function statusLabel(status: string): string {
		switch (status) {
			case 'pending': return 'পেন্ডিং';
			case 'approved': return 'অনুমোদিত';
			case 'rejected': return 'রিজেক্ট';
			default: return status;
		}
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
		<div>
			<h1 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
				<MessageSquare class="w-6 h-6 text-[#5845eb]" />
				রিভিউ ম্যানেজমেন্ট
			</h1>
			<p class="text-xs sm:text-sm text-slate-500 mt-0.5">কাস্টমার রিভিউ মডারেশন, রিপ্লাই ও ফিচার্ড ম্যানেজমেন্ট</p>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
		<!-- Total -->
		<Card class="p-3 sm:p-4 border-slate-200 hover:border-indigo-200 transition-colors">
			<div class="flex items-center gap-2.5">
				<div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
					<MessageSquare class="w-4 h-4 text-indigo-600" />
				</div>
				<div>
					<div class="text-lg sm:text-xl font-black text-slate-900">{stats.total}</div>
					<div class="text-[10px] sm:text-xs text-slate-500 font-medium">মোট রিভিউ</div>
				</div>
			</div>
		</Card>

		<!-- Pending -->
		<button
			type="button"
			onclick={() => goto(navUrl({ status: 'pending', page: 1 }))}
			class="text-left cursor-pointer"
		>
			<Card class="p-3 sm:p-4 border-amber-200 bg-amber-50/30 hover:bg-amber-50/60 transition-colors h-full">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
						<Clock class="w-4 h-4 text-amber-600" />
					</div>
					<div>
						<div class="text-lg sm:text-xl font-black text-amber-700">{stats.pending}</div>
						<div class="text-[10px] sm:text-xs text-amber-600 font-medium">পেন্ডিং</div>
					</div>
				</div>
			</Card>
		</button>

		<!-- Approved -->
		<Card class="p-3 sm:p-4 border-emerald-200 bg-emerald-50/30">
			<div class="flex items-center gap-2.5">
				<div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
					<CheckCircle2 class="w-4 h-4 text-emerald-600" />
				</div>
				<div>
					<div class="text-lg sm:text-xl font-black text-emerald-700">{stats.approved}</div>
					<div class="text-[10px] sm:text-xs text-emerald-600 font-medium">অনুমোদিত</div>
				</div>
			</div>
		</Card>

		<!-- Rejected -->
		<Card class="p-3 sm:p-4 border-rose-200 bg-rose-50/30">
			<div class="flex items-center gap-2.5">
				<div class="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
					<XCircle class="w-4 h-4 text-rose-600" />
				</div>
				<div>
					<div class="text-lg sm:text-xl font-black text-rose-700">{stats.rejected}</div>
					<div class="text-[10px] sm:text-xs text-rose-600 font-medium">রিজেক্ট</div>
				</div>
			</div>
		</Card>

		<!-- Featured -->
		<Card class="p-3 sm:p-4 border-purple-200 bg-purple-50/30">
			<div class="flex items-center gap-2.5">
				<div class="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
					<Award class="w-4 h-4 text-purple-600" />
				</div>
				<div>
					<div class="text-lg sm:text-xl font-black text-purple-700">{stats.featured}</div>
					<div class="text-[10px] sm:text-xs text-purple-600 font-medium">ফিচার্ড</div>
				</div>
			</div>
		</Card>

		<!-- Average Rating -->
		<Card class="p-3 sm:p-4 border-yellow-200 bg-yellow-50/30">
			<div class="flex items-center gap-2.5">
				<div class="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
					<Star class="w-4 h-4 text-yellow-600 fill-yellow-500" />
				</div>
				<div>
					<div class="text-lg sm:text-xl font-black text-yellow-700">{stats.avgRating}</div>
					<div class="text-[10px] sm:text-xs text-yellow-600 font-medium">গড় রেটিং</div>
				</div>
			</div>
		</Card>
	</div>

	<!-- Filter Tabs + Search -->
	<div class="flex flex-col sm:flex-row sm:items-center gap-3">
		<!-- Status Tabs -->
		<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
			{#each [
				{ key: 'all', label: 'সব', count: stats.total },
				{ key: 'pending', label: 'পেন্ডিং', count: stats.pending },
				{ key: 'approved', label: 'অনুমোদিত', count: stats.approved },
				{ key: 'rejected', label: 'রিজেক্ট', count: stats.rejected }
			] as tab}
				<button
					type="button"
					onclick={() => goto(navUrl({ status: tab.key, page: 1 }))}
					class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer
						{filterStatus === tab.key
							? 'bg-[#5845eb] text-white shadow-sm'
							: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
				>
					{tab.label}
					{#if tab.count > 0}
						<span class="ml-1 {filterStatus === tab.key ? 'text-white/80' : 'text-slate-400'}">({tab.count})</span>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Search -->
		<div class="flex-1 sm:max-w-xs relative">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
			<Input
				type="text"
				placeholder="নাম, রিভিউ বা শিরোনামে খুঁজুন..."
				bind:value={searchQuery}
				oninput={handleSearchInput}
				class="pl-9 h-9 text-xs rounded-lg"
			/>
		</div>

		<!-- Bulk Actions -->
		{#if selectedIds.size > 0}
			<div class="flex items-center gap-2">
				<span class="text-xs font-bold text-slate-500">{selectedIds.size}টি নির্বাচিত</span>
				<form method="POST" action="?/bulkAction" use:enhance={() => {
					isSubmitting = true;
					return async ({ result, update }) => {
						isSubmitting = false;
						if (result.type === 'success') {
							toast.success((result.data as any)?.message || 'সম্পন্ন!');
							selectedIds = new Set();
						} else if (result.type === 'failure') {
							toast.error((result.data as any)?.message || 'ব্যর্থ হয়েছে');
						}
						await update({ reset: false });
					};
				}}>
					<input type="hidden" name="ids" value={JSON.stringify([...selectedIds])} />
					<div class="flex gap-1.5">
						<Button type="submit" name="action" value="approve" variant="outline" size="sm" class="h-8 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 cursor-pointer" disabled={isSubmitting}>
							<CheckCircle2 class="w-3.5 h-3.5 mr-1" /> অনুমোদন
						</Button>
						<Button type="submit" name="action" value="reject" variant="outline" size="sm" class="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer" disabled={isSubmitting}>
							<XCircle class="w-3.5 h-3.5 mr-1" /> রিজেক্ট
						</Button>
						<Button type="submit" name="action" value="delete" variant="outline" size="sm" class="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 cursor-pointer" disabled={isSubmitting}>
							<Trash2 class="w-3.5 h-3.5 mr-1" /> ডিলিট
						</Button>
					</div>
				</form>
			</div>
		{/if}
	</div>

	<!-- Reviews List -->
	{#if reviews.length === 0}
		<Card class="p-10 text-center border-dashed">
			<MessageSquare class="w-10 h-10 text-slate-300 mx-auto mb-3" />
			<p class="text-sm font-bold text-slate-500">কোনো রিভিউ পাওয়া যায়নি</p>
			<p class="text-xs text-slate-400 mt-1">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
		</Card>
	{:else}
		<!-- Select All Header -->
		<div class="flex items-center gap-3 px-1">
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					checked={selectedIds.size === reviews.length && reviews.length > 0}
					onchange={toggleSelectAll}
					class="w-4 h-4 rounded border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer"
				/>
				<span class="text-xs font-bold text-slate-500">সব নির্বাচন করুন</span>
			</label>
			<span class="text-xs text-slate-400">মোট {totalCount}টি রিভিউ</span>
		</div>

		<!-- Review Cards -->
		<div class="space-y-3">
			{#each reviews as review (review.id)}
				{@const isExpanded = expandedReview === review.id}
				{@const isReplying = replyingTo === review.id}

				<Card class="overflow-hidden border transition-all {review.isFeatured ? 'border-purple-200 bg-purple-50/20' : 'border-slate-200'} {isExpanded ? 'ring-1 ring-[#5845eb]/20' : ''}">
					<div class="p-4">
						<!-- Top Row: Checkbox + Author + Product + Status + Actions -->
						<div class="flex items-start gap-3">
							<!-- Checkbox -->
							<input
								type="checkbox"
								checked={selectedIds.has(review.id)}
								onchange={() => toggleSelect(review.id)}
								class="w-4 h-4 mt-1 rounded border-slate-300 text-[#5845eb] focus:ring-[#5845eb] cursor-pointer shrink-0"
							/>

							<!-- Main Content -->
							<div class="flex-1 min-w-0">
								<!-- Author + Product Row -->
								<div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
									<div class="flex items-center gap-2">
										<div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shrink-0">
											{review.author?.charAt(0)?.toUpperCase() || '?'}
										</div>
										<div>
											<span class="text-sm font-bold text-slate-900">{review.author}</span>
											{#if review.verified}
												<ShieldCheck class="w-3.5 h-3.5 text-emerald-500 inline ml-1" />
											{/if}
											{#if review.phone}
												<span class="text-[10px] text-slate-400 ml-1">{review.phone}</span>
											{/if}
										</div>
									</div>
									<Separator orientation="vertical" class="h-4 hidden sm:block" />
									{#if review.productName}
										<a href="/products/{review.productSlug}" target="_blank" class="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#5845eb] transition-colors truncate">
											{#if review.productImage}
												<img src={review.productImage} alt="" class="w-5 h-5 rounded object-cover shrink-0" />
											{/if}
											<span class="truncate">{review.productName}</span>
											<ExternalLink class="w-3 h-3 shrink-0" />
										</a>
									{/if}
								</div>

								<!-- Rating Stars -->
								<div class="flex items-center gap-1.5 mb-1.5">
									<div class="flex gap-0.5">
										{#each starArray(review.rating) as filled}
											<Star class="w-3.5 h-3.5 {filled ? 'text-yellow-500 fill-yellow-400' : 'text-slate-300'}" />
										{/each}
									</div>
									{#if review.title}
										<span class="text-xs font-bold text-slate-700">{review.title}</span>
									{/if}
								</div>

								<!-- Review Content -->
								<p class="text-xs text-slate-600 leading-relaxed {isExpanded ? '' : 'line-clamp-2'}">
									{review.content}
								</p>

								{#if review.content?.length > 150}
									<button
										type="button"
										onclick={() => expandedReview = isExpanded ? null : review.id}
										class="text-[10px] text-[#5845eb] font-bold mt-1 hover:underline cursor-pointer"
									>
										{isExpanded ? 'সংক্ষেপে দেখুন' : 'পুরোটা পড়ুন'}
									</button>
								{/if}

								<!-- Admin Reply (if exists) -->
								{#if review.adminReply}
									<div class="mt-2.5 pl-3 border-l-2 border-indigo-200 bg-indigo-50/50 rounded-r-lg p-2.5">
										<div class="flex items-center gap-1.5 mb-1">
											<Reply class="w-3 h-3 text-indigo-500" />
											<span class="text-[10px] font-bold text-indigo-600">
												{review.repliedBy || 'Admin'} এর রিপ্লাই
											</span>
											<span class="text-[10px] text-slate-400">
												{review.adminReplyAt ? formatDate(review.adminReplyAt) : ''}
											</span>
										</div>
										<p class="text-xs text-slate-600">{review.adminReply}</p>
										<form method="POST" action="?/removeReply" use:enhance={() => {
											return async ({ result, update }) => {
												if (result.type === 'success') toast.success('রিপ্লাই সরানো হয়েছে');
												await update({ reset: false });
											};
										}}>
											<input type="hidden" name="id" value={review.id} />
											<button type="submit" class="text-[10px] text-rose-500 font-bold mt-1 hover:underline cursor-pointer">
												রিপ্লাই সরান
											</button>
										</form>
									</div>
								{/if}

								<!-- Reply Form -->
								{#if isReplying}
									<form
										method="POST"
										action="?/reply"
										class="mt-3 space-y-2"
										use:enhance={() => {
											isSubmitting = true;
											return async ({ result, update }) => {
												isSubmitting = false;
												if (result.type === 'success') {
													toast.success((result.data as any)?.message || 'রিপ্লাই যুক্ত হয়েছে!');
													replyingTo = null;
													replyText = '';
												} else if (result.type === 'failure') {
													toast.error((result.data as any)?.message || 'ব্যর্থ হয়েছে');
												}
												await update({ reset: false });
											};
										}}
									>
										<input type="hidden" name="id" value={review.id} />
										<textarea
											name="reply"
											bind:value={replyText}
											placeholder="কাস্টমারকে রিপ্লাই লিখুন..."
											rows="3"
											class="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:border-[#5845eb] focus:ring-1 focus:ring-[#5845eb]/20 outline-none resize-none"
											maxlength="1000"
										></textarea>
										<div class="flex items-center gap-2">
											<Button type="submit" size="sm" class="h-8 text-xs bg-[#5845eb] hover:bg-[#4936d6] text-white cursor-pointer" disabled={!replyText.trim() || isSubmitting}>
												<Reply class="w-3.5 h-3.5 mr-1" /> রিপ্লাই পাঠান
											</Button>
											<Button type="button" variant="ghost" size="sm" class="h-8 text-xs cursor-pointer" onclick={() => { replyingTo = null; replyText = ''; }}>
												বাতিল
											</Button>
											<span class="text-[10px] text-slate-400 ml-auto">{replyText.length}/1000</span>
										</div>
									</form>
								{/if}

								<!-- Meta Row: Date + Actions -->
								<div class="flex items-center flex-wrap gap-2 mt-3 pt-2.5 border-t border-slate-100">
									<span class="text-[10px] text-slate-400">{formatDate(review.createdAt)}</span>

									<!-- Status Badge -->
									<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border {statusBadgeClass(review.status)}">
										{statusLabel(review.status)}
									</span>

									{#if review.isFeatured}
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-200">
											<Sparkles class="w-3 h-3" /> ফিচার্ড
										</span>
									{/if}

									<!-- Spacer -->
									<div class="flex-1"></div>

									<!-- Action Buttons -->
									<div class="flex items-center gap-1">
										<!-- Quick Approve -->
										{#if review.status !== 'approved'}
											<form method="POST" action="?/updateStatus" use:enhance={() => {
												return async ({ result, update }) => {
													if (result.type === 'success') toast.success('অনুমোদিত!');
													else if (result.type === 'failure') toast.error((result.data as any)?.message || 'ব্যর্থ');
													await update({ reset: false });
												};
											}}>
												<input type="hidden" name="id" value={review.id} />
												<input type="hidden" name="status" value="approved" />
												<button type="submit" class="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer" title="অনুমোদন করুন">
													<CheckCircle2 class="w-4 h-4" />
												</button>
											</form>
										{/if}

										<!-- Quick Reject -->
										{#if review.status !== 'rejected'}
											<form method="POST" action="?/updateStatus" use:enhance={() => {
												return async ({ result, update }) => {
													if (result.type === 'success') toast.success('রিজেক্ট হয়েছে!');
													else if (result.type === 'failure') toast.error((result.data as any)?.message || 'ব্যর্থ');
													await update({ reset: false });
												};
											}}>
												<input type="hidden" name="id" value={review.id} />
												<input type="hidden" name="status" value="rejected" />
												<button type="submit" class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer" title="রিজেক্ট করুন">
													<XCircle class="w-4 h-4" />
												</button>
											</form>
										{/if}

										<!-- Reply -->
										{#if !isReplying}
											<button
												type="button"
												onclick={() => { replyingTo = review.id; replyText = ''; }}
												class="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer"
												title="রিপ্লাই দিন"
											>
												<Reply class="w-4 h-4" />
											</button>
										{/if}

										<!-- Toggle Featured -->
										<form method="POST" action="?/toggleFeatured" use:enhance={() => {
											return async ({ result, update }) => {
												if (result.type === 'success') toast.success((result.data as any)?.message || 'আপডেট হয়েছে!');
												await update({ reset: false });
											};
										}}>
											<input type="hidden" name="id" value={review.id} />
											<button type="submit" class="p-1.5 rounded-lg transition-colors cursor-pointer {review.isFeatured ? 'text-purple-600 bg-purple-50' : 'text-slate-400 hover:bg-slate-50'}" title={review.isFeatured ? 'ফিচার্ড থেকে সরান' : 'ফিচার্ড করুন'}>
												<Award class="w-4 h-4" />
											</button>
										</form>

										<!-- Delete -->
										{#if confirmDeleteId === review.id}
											<div class="flex items-center gap-1 bg-red-50 rounded-lg px-2 py-1 border border-red-200">
												<span class="text-[10px] font-bold text-red-600">নিশ্চিত?</span>
												<form method="POST" action="?/deleteReview" use:enhance={() => {
													return async ({ result, update }) => {
														confirmDeleteId = null;
														if (result.type === 'success') toast.success('ডিলিট হয়েছে!');
														else toast.error('ডিলিট ব্যর্থ');
														await update({ reset: false });
													};
												}}>
													<input type="hidden" name="id" value={review.id} />
													<button type="submit" class="text-[10px] font-bold text-red-600 hover:underline cursor-pointer">হ্যাঁ</button>
												</form>
												<button type="button" onclick={() => confirmDeleteId = null} class="text-[10px] font-bold text-slate-500 hover:underline cursor-pointer ml-1">না</button>
											</div>
										{:else}
											<button
												type="button"
												onclick={() => confirmDeleteId = review.id}
												class="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
												title="ডিলিট করুন"
											>
												<Trash2 class="w-4 h-4" />
											</button>
										{/if}
									</div>
								</div>
							</div>
						</div>
					</div>
				</Card>
			{/each}
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex items-center justify-between pt-2">
				<span class="text-xs text-slate-500">
					পেইজ {currentPage} / {totalPages} (মোট {totalCount}টি)
				</span>
				<div class="flex items-center gap-1.5">
					<Button
						variant="outline"
						size="sm"
						class="h-8 text-xs cursor-pointer"
						disabled={currentPage <= 1}
						onclick={() => goto(navUrl({ page: currentPage - 1 }))}
					>
						<ChevronLeft class="w-4 h-4" />
					</Button>

					{#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
						const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
						return start + i;
					}).filter((p) => p <= totalPages) as pg}
						<button
							type="button"
							onclick={() => goto(navUrl({ page: pg }))}
							class="h-8 w-8 rounded-lg text-xs font-bold transition-colors cursor-pointer
								{pg === currentPage
									? 'bg-[#5845eb] text-white shadow-sm'
									: 'text-slate-600 hover:bg-slate-100'}"
						>
							{pg}
						</button>
					{/each}

					<Button
						variant="outline"
						size="sm"
						class="h-8 text-xs cursor-pointer"
						disabled={currentPage >= totalPages}
						onclick={() => goto(navUrl({ page: currentPage + 1 }))}
					>
						<ChevronRight class="w-4 h-4" />
					</Button>
				</div>
			</div>
		{/if}
	{/if}
</div>
