<script lang="ts">
	import { Sparkles, User, ShieldCheck, Package, Download, Key, LogOut, ArrowLeft, Radio } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { toast } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Member Portal | AURA Acoustics</title>
</svelte:head>

<main class="min-h-screen bg-[#08090f] text-slate-200 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
	<!-- Background glow -->
	<div class="absolute top-10 left-1/3 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none -z-10"></div>
	<div class="absolute bottom-10 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>

	<div class="max-w-5xl mx-auto space-y-8">
		
		<!-- Top Bar -->
		<div class="flex items-center justify-between pb-6 border-b border-white/10">
			<a href="/" class="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors">
				<ArrowLeft class="w-4 h-4" />
				<span>Return to Store</span>
			</a>

			<form action="/auth/login?/signOut" method="POST" class="inline">
				<button
					type="submit"
					class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-xs font-semibold text-slate-300 hover:text-rose-400 transition-all"
				>
					<LogOut class="w-3.5 h-3.5" />
					<span>Sign Out</span>
				</button>
			</form>
		</div>

		<!-- User Greeting Card -->
		<div class="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
			<div class="flex items-center gap-4">
				<div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1.5px] shadow-lg shadow-violet-600/30">
					<div class="w-full h-full bg-[#0d0f1a] rounded-[14px] flex items-center justify-center font-black text-2xl text-white font-heading">
						{data.user?.name ? data.user.name.charAt(0).toUpperCase() : 'U'}
					</div>
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-xl sm:text-2xl font-extrabold text-white font-heading">{data.user?.name || 'Creator'}</h1>
						<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
							VIP Member
						</span>
					</div>
					<div class="text-xs text-slate-400 mt-0.5">{data.user?.email}</div>
				</div>
			</div>

			<div class="flex items-center gap-3 text-xs text-slate-300 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10">
				<ShieldCheck class="w-4 h-4 text-emerald-400" />
				<span>Better Auth Session Validated</span>
			</div>
		</div>

		<!-- Content Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			
			<!-- Digital Licenses Card -->
			<div class="glass-card rounded-2xl p-6 border border-white/10">
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-2.5">
						<Key class="w-5 h-5 text-cyan-400" />
						<h2 class="text-base font-bold text-white font-heading">Digital VST Licenses</h2>
					</div>
					<span class="text-[11px] text-cyan-400 font-semibold">Active</span>
				</div>

				<div class="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold text-white">AURA Atmos Suite VST3</span>
						<span class="text-[10px] text-emerald-400 font-mono">AUR-VST-9942</span>
					</div>
					<p class="text-[11px] text-slate-400">AU, VST3, AAX Native 64-bit installer with 120 spatial impulse responses.</p>
					<button
						onclick={() => toast.info('Download link generated! Checking Cloudflare CDN token...')}
						class="flex items-center gap-1.5 mt-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
					>
						<Download class="w-3.5 h-3.5" />
						<span>Download Plugin Installer (v2.4)</span>
					</button>
				</div>
			</div>

			<!-- Registered Hardware & Firmware Telemetry -->
			<div class="glass-card rounded-2xl p-6 border border-white/10">
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-2.5">
						<Radio class="w-5 h-5 text-violet-400" />
						<h2 class="text-base font-bold text-white font-heading">Connected Hardware</h2>
					</div>
					<span class="text-[11px] text-emerald-400 font-semibold">Pairing Synced</span>
				</div>

				<div class="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold text-white">AURA Spectrum X (Obsidian)</span>
						<span class="text-[10px] text-violet-300 font-mono">FW: v3.1.8-Edge</span>
					</div>
					<p class="text-[11px] text-slate-400">96kHz Lossless 2.4GHz RF profile active. Battery Health: 99%.</p>
					<div class="pt-1 text-[11px] text-slate-400">
						Warranty Valid Through: <strong class="text-slate-200">October 2028</strong>
					</div>
				</div>
			</div>

		</div>

		<!-- Recent Orders History Table -->
		<div class="glass-card rounded-2xl p-6 border border-white/10">
			<div class="flex items-center gap-2.5 mb-6">
				<Package class="w-5 h-5 text-cyan-400" />
				<h2 class="text-base font-bold text-white font-heading">Order & Shipping History</h2>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead>
						<tr class="border-b border-white/10 text-slate-400 pb-2">
							<th class="pb-3 font-semibold">Order ID</th>
							<th class="pb-3 font-semibold">Item(s)</th>
							<th class="pb-3 font-semibold">Date</th>
							<th class="pb-3 font-semibold">Status</th>
							<th class="pb-3 font-semibold text-right">Amount</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						<tr>
							<td class="py-4 font-mono text-cyan-400 font-semibold">AUR-847291</td>
							<td class="py-4 text-white font-medium">AURA Spectrum X (Obsidian Void)</td>
							<td class="py-4 text-slate-400">Oct 20, 2026</td>
							<td class="py-4">
								<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
									Dispatched • Express Air
								</span>
							</td>
							<td class="py-4 text-right font-bold text-white font-heading">$349.00</td>
						</tr>
						<tr>
							<td class="py-4 font-mono text-cyan-400 font-semibold">AUR-310542</td>
							<td class="py-4 text-white font-medium">AURA Atmos Suite VST3 License</td>
							<td class="py-4 text-slate-400">Oct 12, 2026</td>
							<td class="py-4">
								<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
									Instant Digital Delivered
								</span>
							</td>
							<td class="py-4 text-right font-bold text-white font-heading">$99.00</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

	</div>
</main>
