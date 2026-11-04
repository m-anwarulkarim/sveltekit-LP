<script lang="ts">
	import { untrack } from 'svelte';
	import { deserialize } from '$app/forms';
	import { Button, Dialog } from '#lib/components/ui';
	import { CheckCircle2, XCircle, Loader2, Clock, RotateCcw, AlertTriangle, Settings } from 'lucide-svelte';

	type RowStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';
	type Row = { id: string; label: string; status: RowStatus; detail: string };

	interface Props {
		open: boolean;
		orders: { id: string; label: string }[];
		/** Courier id sent to the server; empty means the default courier. */
		provider: string;
		providerName: string;
		onfinish?: (successIds: string[]) => void;
	}

	let { open = $bindable(false), orders, provider, providerName, onfinish }: Props = $props();

	let rows = $state<Row[]>([]);
	let isRunning = $state(false);
	let cancelRequested = $state(false);

	let total = $derived(rows.length);
	let successCount = $derived(rows.filter((r) => r.status === 'success').length);
	let failedCount = $derived(rows.filter((r) => r.status === 'failed').length);
	let skippedCount = $derived(rows.filter((r) => r.status === 'skipped').length);
	let processedCount = $derived(successCount + failedCount + skippedCount);
	let percent = $derived(total > 0 ? Math.round((processedCount / total) * 100) : 0);
	let finished = $derived(!isRunning && total > 0 && !rows.some((r) => r.status === 'pending' || r.status === 'running'));

	// 'success' = all booked, 'partial' = some booked, 'failed' = none booked
	let outcome = $derived.by(() => {
		if (!finished) return 'running';
		if (successCount === total) return 'success';
		if (successCount > 0) return 'partial';
		return 'failed';
	});

	let title = $derived(
		outcome === 'running'
			? `${providerName} এ বুকিং চলছে`
			: outcome === 'success'
				? `${providerName} এ বুকিং সফল হয়েছে`
				: outcome === 'partial'
					? 'কিছু অর্ডার বুক হয়নি'
					: 'কুরিয়ার বুকিং ব্যর্থ হয়েছে'
	);

	let barClass = $derived(
		outcome === 'failed' ? 'bg-rose-500' : outcome === 'partial' ? 'bg-amber-500' : 'bg-emerald-500'
	);

	// Missing courier setup fails every row the same way; point straight to the fix.
	let needsCourierSetup = $derived(
		finished && rows.some((r) => r.status === 'failed' && r.detail.includes('Settings > Courier'))
	);

	let startedFor = '';
	$effect(() => {
		if (!open) {
			startedFor = '';
			return;
		}
		const key = orders.map((o) => o.id).join(',');
		if (startedFor === key || isRunning) return;
		startedFor = key;
		rows = orders.map((o) => ({ ...o, status: 'pending' as RowStatus, detail: '' }));
		untrack(run);
	});

	async function bookOne(row: Row) {
		const fd = new FormData();
		fd.append('orderId', row.id);
		fd.append('provider', provider);
		try {
			const res = await fetch('?/bookCourier', {
				method: 'POST',
				headers: { 'x-sveltekit-action': 'true' },
				body: fd
			});
			const result = deserialize(await res.text()) as any;
			if (result.type === 'success') {
				row.status = 'success';
				row.detail = result.data?.trackingCode ? `ট্র্যাকিং: ${result.data.trackingCode}` : 'বুকিং সম্পন্ন';
			} else {
				row.status = 'failed';
				row.detail = result.data?.message || 'বুকিং ব্যর্থ হয়েছে';
			}
		} catch {
			row.status = 'failed';
			row.detail = 'নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন';
		}
	}

	async function run() {
		isRunning = true;
		cancelRequested = false;
		for (const row of rows) {
			if (row.status !== 'pending') continue;
			if (cancelRequested) {
				row.status = 'skipped';
				row.detail = 'বন্ধ করা হয়েছে';
				continue;
			}
			row.status = 'running';
			await bookOne(row);
		}
		isRunning = false;
		onfinish?.(rows.filter((r) => r.status === 'success').map((r) => r.id));
	}

	function retryFailed() {
		for (const row of rows) {
			if (row.status === 'failed' || row.status === 'skipped') {
				row.status = 'pending';
				row.detail = '';
			}
		}
		run();
	}

	function handleClose() {
		if (isRunning) open = true;
	}

	$effect(() => {
		if (!isRunning) return;
		const warn = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener('beforeunload', warn);
		return () => window.removeEventListener('beforeunload', warn);
	});
</script>

<Dialog bind:open onclose={handleClose} {title} class="max-w-lg">
	<div class="space-y-4">
		<div class="space-y-1.5">
			<div class="flex items-center justify-between text-xs font-bold text-slate-600">
				<span>{processedCount}/{total} প্রসেস হয়েছে</span>
				<span>{percent}%</span>
			</div>
			<div class="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
				<div class="h-full rounded-full transition-all duration-300 {barClass}" style="width: {percent}%"></div>
			</div>
			{#if isRunning}
				<p class="text-[11px] text-slate-400">অর্ডারগুলো একটা একটা করে পাঠানো হচ্ছে — অনুগ্রহ করে অপেক্ষা করুন।</p>
			{:else if finished}
				<p
					class="text-xs font-bold {outcome === 'success'
						? 'text-emerald-700'
						: outcome === 'partial'
							? 'text-amber-700'
							: 'text-rose-700'}"
				>
					{successCount} টি বুক হয়েছে{failedCount > 0 ? `, ${failedCount} টি ব্যর্থ` : ''}{skippedCount > 0 ? `, ${skippedCount} টি বাদ` : ''}।
				</p>
			{/if}
		</div>

		{#if needsCourierSetup}
			<div class="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
				<AlertTriangle class="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
				<div class="space-y-1.5">
					<p class="font-bold">{providerName} এর API সেটআপ করা নেই, তাই কোনো অর্ডার কুরিয়ারে যায়নি।</p>
					<a
						href="/admin/settings/courier"
						class="inline-flex items-center gap-1 font-bold text-amber-800 underline underline-offset-2 hover:text-amber-950"
					>
						<Settings class="w-3.5 h-3.5" />
						কুরিয়ার সেটিংসে যান
					</a>
				</div>
			</div>
		{/if}

		<ul class="max-h-72 overflow-y-auto space-y-1.5 pr-1">
			{#each rows as row (row.id)}
				<li
					class="flex items-start gap-2.5 rounded-xl border px-3 py-2 text-xs transition-colors
					{row.status === 'success'
						? 'border-emerald-200 bg-emerald-50/60'
						: row.status === 'failed'
							? 'border-rose-200 bg-rose-50/60'
							: row.status === 'running'
								? 'border-indigo-200 bg-indigo-50/60'
								: 'border-slate-200 bg-white'}"
				>
					<span class="mt-0.5 shrink-0">
						{#if row.status === 'success'}
							<CheckCircle2 class="w-4 h-4 text-emerald-600" />
						{:else if row.status === 'failed'}
							<XCircle class="w-4 h-4 text-rose-600" />
						{:else if row.status === 'running'}
							<Loader2 class="w-4 h-4 text-indigo-600 animate-spin" />
						{:else}
							<Clock class="w-4 h-4 text-slate-300" />
						{/if}
					</span>
					<div class="min-w-0 flex-1">
						<div class="font-bold text-slate-800 truncate">{row.label}</div>
						{#if row.detail}
							<div class="text-[11px] break-words {row.status === 'failed' ? 'text-rose-700' : 'text-slate-500'}">
								{row.detail}
							</div>
						{/if}
					</div>
				</li>
			{/each}
		</ul>

		<div class="flex flex-wrap items-center justify-end gap-2 pt-1">
			{#if isRunning}
				<Button
					variant="outline"
					size="sm"
					class="text-xs font-bold"
					disabled={cancelRequested}
					onclick={() => (cancelRequested = true)}
				>
					{cancelRequested ? 'বাকিগুলো বন্ধ হচ্ছে...' : 'বাকিগুলো বন্ধ করুন'}
				</Button>
			{:else}
				{#if failedCount + skippedCount > 0}
					<Button size="sm" variant="outline" class="gap-1.5 text-xs font-bold" onclick={retryFailed}>
						<RotateCcw class="w-3.5 h-3.5" />
						<span>ব্যর্থগুলো আবার চেষ্টা করুন ({failedCount + skippedCount})</span>
					</Button>
				{/if}
				{#if outcome === 'success'}
					<Button
						size="sm"
						class="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
						onclick={() => (open = false)}
					>
						<CheckCircle2 class="w-3.5 h-3.5" />
						<span>ঠিক আছে</span>
					</Button>
				{:else}
					<Button size="sm" variant="outline" class="text-xs font-bold" onclick={() => (open = false)}>
						বন্ধ করুন
					</Button>
				{/if}
			{/if}
		</div>
	</div>
</Dialog>
