<script lang="ts">
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { ShoppingBag, User, Sparkles, Menu, X, LogOut } from 'lucide-svelte';

	interface Props {
		user: { name?: string; email?: string; image?: string | null } | null;
		onOpenAuth: () => void;
	}

	let { user, onOpenAuth }: Props = $props();
	let isMobileMenuOpen = $state(false);
	let isScrolled = $state(false);

	function handleScroll() {
		isScrolled = window.scrollY > 20;
	}
</script>

<svelte:window onscroll={handleScroll} />

<header
	class="fixed top-0 left-0 right-0 z-40 transition-all duration-300 {isScrolled
		? 'bg-[#090a0f]/85 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40 py-3'
		: 'bg-transparent py-5'}"
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between">
			<!-- Brand Logo -->
			<a href="/" class="flex items-center gap-3 group">
				<div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1.5px] transition-transform duration-300 group-hover:scale-105 shadow-lg shadow-violet-500/20">
					<div class="w-full h-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
						<Sparkles class="w-5 h-5 text-cyan-400 animate-pulse" />
					</div>
				</div>
				<div class="flex flex-col">
					<span class="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-heading">
						AURA
					</span>
					<span class="text-[10px] uppercase tracking-widest text-violet-400 font-semibold -mt-1">
						Acoustics
					</span>
				</div>
			</a>

			<!-- Desktop Nav Links -->
			<nav class="hidden md:flex items-center gap-8">
				<a href="#products" class="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
					Products
				</a>
				<a href="#sound-engine" class="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
					Sound Engine
				</a>
				<a href="#specifications" class="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
					Specs
				</a>
				<a href="#reviews" class="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
					Reviews
				</a>
				<a href="#faq" class="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
					FAQ
				</a>
				<a
					href="/admin"
					class="text-xs font-semibold text-violet-300 hover:text-white transition-all flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600/15 hover:bg-violet-600/30 border border-violet-500/30"
				>
					<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
					Dashboard
				</a>
			</nav>

			<!-- Actions: Auth & Cart -->
			<div class="flex items-center gap-3">
				<!-- Auth State Button with Real Account Link -->
				{#if user}
					<a
						href="/account"
						class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition-colors"
					>
						<span class="w-2 h-2 rounded-full bg-emerald-400"></span>
						<span class="max-w-[100px] truncate font-medium">{user.name || user.email}</span>
					</a>
					<form action="/auth/login?/signOut" method="POST" class="inline">
						<button type="submit" title="Sign out" class="text-slate-400 hover:text-rose-400 p-1.5 transition-colors">
							<LogOut class="w-4 h-4" />
						</button>
					</form>
				{:else}
					<button
						onclick={onOpenAuth}
						id="nav-login-btn"
						class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all hover:border-violet-500/50"
					>
						<User class="w-3.5 h-3.5 text-violet-400" />
						<span class="hidden sm:inline">Sign In</span>
					</button>
				{/if}

				<!-- Cart Button -->
				<button
					onclick={() => cart.toggleCart()}
					id="nav-cart-btn"
					class="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-violet-600/20 to-cyan-500/20 border border-violet-500/30 text-white hover:border-violet-400 transition-all duration-300 hover:scale-105"
					aria-label="View Shopping Cart"
				>
					<ShoppingBag class="w-4 h-4 text-cyan-300" />
					{#if cart.count > 0}
						<span class="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-md shadow-violet-600/50 animate-bounce">
							{cart.count}
						</span>
					{/if}
				</button>

				<!-- Mobile Menu Toggle -->
				<button
					onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
					class="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
					aria-label="Toggle menu"
				>
					{#if isMobileMenuOpen}
						<X class="w-6 h-6" />
					{:else}
						<Menu class="w-6 h-6" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile Navigation Dropdown -->
		{#if isMobileMenuOpen}
			<div class="md:hidden mt-3 p-4 rounded-2xl bg-[#11131e]/95 border border-white/10 backdrop-blur-xl flex flex-col gap-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
				<a
					href="#products"
					onclick={() => isMobileMenuOpen = false}
					class="py-2 px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-cyan-400"
				>
					Products
				</a>
				<a
					href="#sound-engine"
					onclick={() => isMobileMenuOpen = false}
					class="py-2 px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-cyan-400"
				>
					Sound Engine
				</a>
				<a
					href="#specifications"
					onclick={() => isMobileMenuOpen = false}
					class="py-2 px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-cyan-400"
				>
					Specifications
				</a>
				<a
					href="#reviews"
					onclick={() => isMobileMenuOpen = false}
					class="py-2 px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-cyan-400"
				>
					Reviews
				</a>
				<a
					href="#faq"
					onclick={() => isMobileMenuOpen = false}
					class="py-2 px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-cyan-400"
				>
					FAQ
				</a>
				<a
					href="/admin"
					onclick={() => isMobileMenuOpen = false}
					class="py-2 px-3 rounded-lg text-sm font-medium text-violet-300 bg-violet-600/15 border border-violet-500/30 flex items-center justify-between"
				>
					<span class="flex items-center gap-2">
						<span class="w-2 h-2 rounded-full bg-emerald-400"></span>
						Operations Dashboard
					</span>
					<span class="text-xs text-violet-400">Live D1 →</span>
				</a>
				{#if user}
					<a
						href="/account"
						onclick={() => isMobileMenuOpen = false}
						class="py-2 px-3 rounded-lg text-sm font-medium text-cyan-400 bg-white/5 flex items-center justify-between"
					>
						<span>My Account</span>
						<span class="text-xs text-slate-400">View Portal →</span>
					</a>
				{/if}
			</div>
		{/if}
	</div>
</header>
