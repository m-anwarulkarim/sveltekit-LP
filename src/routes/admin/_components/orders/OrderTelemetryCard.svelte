<script lang="ts">
	import { Card, Badge } from '#lib/components/ui';
	import { Globe, Smartphone, MapPin, Radio, Shield, Target } from 'lucide-svelte';

	interface Props {
		source?: string | null;
		ipAddress?: string | null;
		userAgent?: string | null;
		deviceFingerprint?: string | null;
		orderType?: string | null;
		dropOffStage?: string | null;
	}

	let {
		source = 'Direct',
		ipAddress = '127.0.0.1',
		userAgent = '',
		deviceFingerprint = '',
		orderType = 'web',
		dropOffStage
	}: Props = $props();

	let isAdSource = $derived(
		source?.toLowerCase().includes('ad') ||
		source?.toLowerCase().includes('facebook') ||
		source?.toLowerCase().includes('tiktok') ||
		source?.toLowerCase().includes('google')
	);
</script>

<Card class="p-4 bg-white/90 shadow-xs border-slate-200/90 space-y-3 font-['Anek_Bangla',sans-serif]">
	<!-- Header -->
	<div class="flex items-center justify-between pb-2 border-b border-slate-100">
		<div class="flex items-center gap-2">
			<Radio class="w-4 h-4 text-[#5845eb]" />
			<h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">
				টেলিমেট্রি ও অ্যাড ট্র্যাকিং
			</h3>
		</div>
		<Badge variant={isAdSource ? 'purple' : 'outline'} class="text-[9px] font-bold py-0.5 px-2">
			{orderType === 'web' ? 'Web Store' : orderType}
		</Badge>
	</div>

	<div class="space-y-2.5 text-xs">
		<!-- 1. Marketing / Campaign Source -->
		<div class="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
			<div class="flex items-center gap-2">
				<Target class="w-3.5 h-3.5 text-indigo-600 shrink-0" />
				<span class="text-slate-600 font-semibold text-[11px]">মার্কেটিং সোর্স:</span>
			</div>
			<span class="font-bold text-slate-900 text-right truncate max-w-[150px] text-[11px]">
				{source || 'Direct Traffic'}
			</span>
		</div>

		<!-- 2. Device & Browser -->
		<div class="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
			<div class="flex items-center gap-2">
				<Smartphone class="w-3.5 h-3.5 text-blue-600 shrink-0" />
				<span class="text-slate-600 font-semibold text-[11px]">ডিভাইস ও ব্রাউজার:</span>
			</div>
			<span class="font-bold text-slate-900 text-right text-[11px]">
				{deviceFingerprint ? deviceFingerprint.split('•')[0].trim() : 'Mobile / Desktop'}
			</span>
		</div>

		<!-- 3. IP & Geo Location -->
		<div class="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
			<div class="flex items-center gap-2">
				<MapPin class="w-3.5 h-3.5 text-rose-500 shrink-0" />
				<span class="text-slate-600 font-semibold text-[11px]">আইপি ও অবস্থান:</span>
			</div>
			<div class="text-right">
				<span class="font-mono font-bold text-slate-900 text-[11px] block">{ipAddress || '127.0.0.1'}</span>
				{#if deviceFingerprint && deviceFingerprint.includes('•')}
					<span class="text-[10px] text-slate-500 font-medium">{deviceFingerprint.split('•')[1].trim()}</span>
				{/if}
			</div>
		</div>

		{#if dropOffStage}
			<!-- Drop-off indicator if recovered -->
			<div class="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center justify-between">
				<span>ড্রপ-অফ পর্যায়:</span>
				<span class="uppercase">{dropOffStage}</span>
			</div>
		{/if}
	</div>
</Card>

