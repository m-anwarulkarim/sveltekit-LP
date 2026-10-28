<script lang="ts">
	import { Button } from '#lib/components/ui';
	import { User, Lock, Mail, Sparkles, ArrowRight, X } from 'lucide-svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();
	let isRegister = $state(false);
	let email = $state('');
	let password = $state('');
	let name = $state('');
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
		<div class="relative w-full max-w-md bg-[#10121d] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
			
			<Button
				variant="ghost"
				size="icon"
				onclick={onClose}
				class="absolute top-5 right-5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-8 w-8 cursor-pointer"
				aria-label="Close authentication modal"
			>
				<X class="w-4 h-4" />
			</Button>

			<!-- Header -->
			<div class="text-center mb-6">
				<div class="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1.5px] mb-3">
					<div class="w-full h-full bg-[#10121d] rounded-[14px] flex items-center justify-center">
						<Sparkles class="w-6 h-6 text-cyan-400" />
					</div>
				</div>
				<h3 class="text-2xl font-extrabold text-white font-heading">
					{isRegister ? 'Create Creator Account' : 'Welcome Back'}
				</h3>
				<p class="text-xs text-slate-400 mt-1">
					{isRegister ? 'Join 3,400+ audio creators & unlock VIP acoustics pricing' : 'Sign in to access your orders, VST licenses & soundscapes'}
				</p>
			</div>

			<!-- Tab Switcher -->
			<div class="flex p-1 rounded-xl bg-black/40 border border-white/10 mb-6">
				<button
					type="button"
					onclick={() => isRegister = false}
					class="flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer {!isRegister ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}"
				>
					Sign In
				</button>
				<button
					type="button"
					onclick={() => isRegister = true}
					class="flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer {isRegister ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}"
				>
					Register
				</button>
			</div>

			<!-- Real Better Auth Form -->
			<form
				action={isRegister ? '/auth/register?/signUpEmail' : '/auth/login?/signInEmail'}
				method="POST"
				class="space-y-4"
			>
				{#if isRegister}
					<div>
						<label for="auth-name-input" class="block text-xs font-medium text-slate-300 mb-1">Your Full Name</label>
						<div class="relative">
							<User class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
							<input
								id="auth-name-input"
								name="name"
								type="text"
								required
								bind:value={name}
								placeholder="e.g. Liam Sterling"
								class="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
							/>
						</div>
					</div>
				{/if}

				<div>
					<label for="auth-email-input" class="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
					<div class="relative">
						<Mail class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
						<input
							id="auth-email-input"
							name="email"
							type="email"
							required
							bind:value={email}
							placeholder="creator@studio.com"
							class="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="auth-password-input" class="block text-xs font-medium text-slate-300 mb-1">Password</label>
					<div class="relative">
						<Lock class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
						<input
							id="auth-password-input"
							name="password"
							type="password"
							required
							bind:value={password}
							placeholder="••••••••••••"
							class="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
						/>
					</div>
				</div>

				<Button
					type="submit"
					class="w-full h-auto flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/30 transition-transform hover:scale-[1.01] active:scale-[0.99] border-0"
				>
					<span>{isRegister ? 'Create Account' : 'Sign In'}</span>
					<ArrowRight class="w-4 h-4" />
				</Button>
			</form>

			<div class="mt-4 text-center">
				<a
					href="/account"
					class="text-[11px] text-cyan-400 hover:underline"
				>
					Visit Member Acoustic Portal →
				</a>
			</div>
		</div>
	</div>
{/if}