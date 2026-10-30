<script lang="ts">
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { page } from '$app/state';
	import { Home, Compass, ShoppingBag, User } from 'lucide-svelte';

	interface Props {
		user?: { name?: string; email?: string } | null;
		onOpenAuth?: () => void;
		isStandalonePreview?: boolean;
	}

	let { user = null, onOpenAuth = () => {}, isStandalonePreview = false }: Props = $props();

	let pathname = $derived(page.url.pathname);
</script>

<!-- Mobile Bottom Navigation: Bottom Nav 2 (Floating Pill Island) -->
<nav
	class="{isStandalonePreview
		? 'relative w-full max-w-sm mx-auto'
		: 'md:hidden fixed bottom-3 inset-x-3 max-w-md mx-auto'} z-40 bg-slate-900/95 backdrop-blur-xl text-white rounded-3xl py-2 px-3 shadow-2xl border border-slate-700/60 flex items-center justify-between font-['Anek_Bangla',sans-serif]"
>
	<!-- 1. Home -->
	<a
		href="/"
		class="flex items-center gap-1.5 px-3 py-2 rounded-2xl transition-all {pathname === '/'
			? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
			: 'text-slate-400 hover:text-white'}"
	>
		<Home class="w-4 h-4" />
		{#if pathname === '/'}
			<span class="text-xs">হোম</span>
		{/if}
	</a>

	<!-- 2. Explore / Catalog -->
	<a
		href="/catalog/all-category"
		class="flex items-center gap-1.5 px-3 py-2 rounded-2xl transition-all {pathname.includes('/category')
			? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
			: 'text-slate-400 hover:text-white'}"
	>
		<Compass class="w-4 h-4" />
		{#if pathname.includes('/category')}
			<span class="text-xs">ক্যাটালগ</span>
		{/if}
	</a>

	<!-- 3. Cart with Badge -->
	<button
		type="button"
		onclick={() => cart.toggleCart()}
		class="relative flex items-center gap-1.5 px-3 py-2 rounded-2xl text-slate-400 hover:text-white transition-all cursor-pointer"
	>
		<div class="relative">
			<ShoppingBag class="w-4 h-4" />
			{#if cart.totalQuantity > 0}
				<span
					class="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse"
				>
					{cart.totalQuantity}
				</span>
			{/if}
		</div>
	</button>

	<!-- 4. Profile / Login -->
	<a
		href={user ? "/account" : "/auth/login"}
		class="flex items-center gap-1.5 px-3 py-2 rounded-2xl transition-all {pathname.includes('/account') || pathname.includes('/auth')
			? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
			: 'text-slate-400 hover:text-white'}"
	>
		<User class="w-4 h-4" />
		{#if pathname.includes('/account')}
			<span class="text-xs">অ্যাকাউন্ট</span>
		{:else if pathname.includes('/auth')}
			<span class="text-xs">লগইন</span>
		{/if}
	</a>
</nav>

