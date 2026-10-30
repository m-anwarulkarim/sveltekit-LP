<script lang="ts">
	import { Card, Badge, Button } from '#lib/components/ui';
	import {
		Globe,
		Smartphone,
		Monitor,
		Fingerprint,
		Network,
		Ban,
		Clock,
		Flame,
		CheckCircle2
	} from 'lucide-svelte';

	interface VisitorMeta {
		source?: string;
		fingerprint?: string;
		ip?: string;
		device?: string;
		totalVisits?: number;
		activeTime?: string;
		avgLoad?: string;
		firstVisit?: string;
	}

	interface Props {
		meta?: VisitorMeta;
		isBanned?: boolean;
		onToggleBan: () => void;
	}

	let {
		meta = {
			source: 'Direct',
			fingerprint: 'অনুপলব্ধ',
			ip: 'রেকর্ড নেই',
			device: 'ওয়েব ব্রাউজার',
			totalVisits: 1,
			activeTime: 'N/A',
			avgLoad: 'N/A',
			firstVisit: 'আজ'
		},
		isBanned = $bindable(false),
		onToggleBan
	}: Props = $props();
</script>

<Card class="p-4 bg-white/90 shadow-xs border-slate-200/90 space-y-3">
	<!-- Header -->
	<div class="flex items-center justify-between pb-2 border-b border-slate-100">
		<div class="flex items-center gap-2">
			<Globe class="w-4 h-4 text-slate-700" />
			<h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">
				ডিভাইস ও ভিজিটর তথ্য
			</h3>
		</div>
		<Badge variant={meta.source?.includes('Facebook') ? 'purple' : 'outline'} class="text-[10px] px-2 py-0.2">
			{meta.source || 'Direct'}
		</Badge>
	</div>

	<!-- Info Grid -->
	<div class="space-y-2 text-xs">
		<!-- IP & Fingerprint -->
		<div class="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
			<span class="flex items-center gap-1.5 font-bold text-slate-500">
				<Network class="w-3.5 h-3.5" />
				<span>IP অ্যাড্রেস:</span>
			</span>
			<span class="font-mono font-bold text-slate-900">{meta.ip || 'রেকর্ড নেই'}</span>
		</div>

		<!-- Device -->
		<div class="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
			<span class="flex items-center gap-1.5 font-bold text-slate-500">
				<Smartphone class="w-3.5 h-3.5" />
				<span>ডিভাইস:</span>
			</span>
			<span class="font-semibold text-slate-800 text-right truncate max-w-[210px] text-[11px]" title={meta.device}>{meta.device || 'ওয়েব ব্রাউজার'}</span>
		</div>

		<!-- Visits & Session Stats -->
		<div class="grid grid-cols-2 gap-2 text-center pt-0.5">
			<div class="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
				<span class="text-[10px] text-slate-400 font-bold block">মোট ভিজিট</span>
				<span class="font-mono font-bold text-slate-900">{meta.totalVisits || 1} বার</span>
			</div>
			<div class="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
				<span class="text-[10px] text-slate-400 font-bold block">সক্রিয় সময়</span>
				<span class="font-mono font-bold text-slate-900">{meta.activeTime || '১ মিনিট'}</span>
			</div>
		</div>
	</div>

	<!-- Ban Spammer Button -->
	<div class="pt-1">
		{#if isBanned}
			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={onToggleBan}
				class="w-full text-xs font-bold border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 gap-1.5"
			>
				<CheckCircle2 class="w-3.5 h-3.5" />
				<span>ব্লক প্রত্যাহার করুন (Unban)</span>
			</Button>
		{:else}
			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={onToggleBan}
				class="w-full text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors gap-1.5 shadow-2xs"
			>
				<Ban class="w-3.5 h-3.5" />
				<span>ফেইক কাস্টমার ব্লক করুন (Ban)</span>
			</Button>
		{/if}
	</div>
</Card>

