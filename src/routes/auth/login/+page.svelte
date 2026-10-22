<script lang="ts">
	import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign In | AURA Acoustics</title>
</svelte:head>

<main class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#08090f]">
	<!-- Ambient Background Glows -->
	<div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none -z-10"></div>
	<div class="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

	<div class="w-full max-w-md bg-[#10121d] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
		
		<!-- Brand Logo -->
		<a href="/" class="flex items-center justify-center gap-2 mb-6 group">
			<div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1.5px] transition-transform group-hover:scale-105">
				<div class="w-full h-full bg-[#10121d] rounded-[9px] flex items-center justify-center">
					<Sparkles class="w-4 h-4 text-cyan-400" />
				</div>
			</div>
			<span class="text-xl font-black text-white font-heading">AURA</span>
		</a>

		<div class="text-center mb-8">
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white font-heading">Creator Sign In</h1>
			<p class="text-xs text-slate-400 mt-1">Access your acoustic telemetry, VST licenses, and hardware orders</p>
		</div>

		{#if form?.message}
			<div class="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
				{form.message}
			</div>
		{/if}

		<form action="?/signInEmail" method="POST" class="space-y-4">
			<div>
				<label for="login-email" class="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
				<div class="relative">
					<Mail class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
					<input
						id="login-email"
						name="email"
						type="email"
						required
						placeholder="creator@studio.com"
						class="w-full pl-10 pr-3.5 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
					/>
				</div>
			</div>

			<div>
				<label for="login-password" class="block text-xs font-medium text-slate-300 mb-1">Password</label>
				<div class="relative">
					<Lock class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
					<input
						id="login-password"
						name="password"
						type="password"
						required
						placeholder="••••••••••••"
						class="w-full pl-10 pr-3.5 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
					/>
				</div>
			</div>

			<button
				type="submit"
				class="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/30 transition-transform hover:scale-[1.01] active:scale-[0.99]"
			>
				<span>Sign In to Account</span>
				<ArrowRight class="w-4 h-4" />
			</button>
		</form>

		<div class="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
			Don't have an acoustic account?
			<a href="/auth/register" class="text-cyan-400 font-bold hover:underline ml-1">
				Create one here
			</a>
		</div>

		<div class="flex items-center justify-center gap-2 text-[11px] text-slate-500 mt-4">
			<ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
			<span>Secured with Better Auth & Cloudflare D1</span>
		</div>
	</div>
</main>
