<script lang="ts">
	import { Truck, Wallet, CheckCircle2, ArrowRight, Clock } from 'lucide-svelte';

	interface Props {
		courierSummary: {
			dispatchedToday: number;
			inTransitCount: number;
			deliveredCount: number;
			liveBalance: number;
			netPayableTotal: number;
			liveBalanceProvider: string;
		};
	}

	let { courierSummary }: Props = $props();

	function formatTaka(amount: number): string {
		return '৳ ' + Math.round(amount || 0).toLocaleString('en-IN');
	}
</script>

<div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 font-['Plus_Jakarta_Sans',sans-serif]">
	<div class="flex items-center gap-3.5">
		<div class="w-11 h-11 rounded-2xl bg-[#5845eb]/30 border border-[#5845eb]/40 text-[#a59bff] flex items-center justify-center shrink-0 shadow-inner">
			<Truck class="w-6 h-6 stroke-[2.2]" />
		</div>
		<div>
			<div class="flex items-center gap-2">
				<h2 class="text-sm sm:text-base font-black tracking-tight text-white">
					কুরিয়ার অপারেশন ও ডেলিভারি ওভারভিউ
				</h2>
				<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
					Live
				</span>
			</div>
			<p class="text-xs text-slate-400 mt-0.5">
				আজকের বুকিং, রাস্তায় থাকা পার্সেল ও কুরিয়ার ওয়ালেট ব্যালেন্স ট্র্যাকিং
			</p>
		</div>
	</div>

	<!-- Stats Badges Strip -->
	<div class="flex flex-wrap items-center gap-2 sm:gap-3">
		<!-- 1. Dispatched Today -->
		<div class="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
			<Clock class="w-3.5 h-3.5 text-sky-400" />
			<div class="text-left">
				<div class="text-[10px] text-slate-300 font-medium">আজকের বুকিং</div>
				<div class="text-xs font-bold text-white">{courierSummary?.dispatchedToday ?? 0} টি</div>
			</div>
		</div>

		<!-- 2. In Transit -->
		<div class="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
			<Truck class="w-3.5 h-3.5 text-amber-400" />
			<div class="text-left">
				<div class="text-[10px] text-slate-300 font-medium">ইন-ট্রানজিট</div>
				<div class="text-xs font-bold text-amber-300">{courierSummary?.inTransitCount ?? 0} টি</div>
			</div>
		</div>

		<!-- 3. Delivered Today -->
		<div class="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
			<CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" />
			<div class="text-left">
				<div class="text-[10px] text-slate-300 font-medium">ডেলিভার্ড</div>
				<div class="text-xs font-bold text-emerald-300">{courierSummary?.deliveredCount ?? 0} টি</div>
			</div>
		</div>

		<!-- 4. Live Wallet Balance -->
		<div class="bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30 flex items-center gap-2">
			<Wallet class="w-3.5 h-3.5 text-emerald-300" />
			<div class="text-left">
				<div class="text-[10px] text-emerald-200 font-medium">কুরিয়ার ওয়ালেট</div>
				<div class="text-xs font-black text-white">{formatTaka(courierSummary?.liveBalance ?? 0)}</div>
			</div>
		</div>

		<!-- Action link to full courier hub -->
		<a
			href="/admin/courier"
			class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#5845eb] hover:bg-[#4a38d9] text-white shadow-xs transition-all cursor-pointer hover:gap-2 shrink-0"
		>
			<span>কুরিয়ার হাব</span>
			<ArrowRight class="w-3.5 h-3.5" />
		</a>
	</div>
</div>
