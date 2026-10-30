<script lang="ts">
	import { cart } from '#lib/modules/cart/cart.svelte';
	import { page } from '$app/state';
	import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-svelte';

	interface Props {
		user?: { name?: string; email?: string } | null;
		onOpenAuth?: () => void;
		isStandalonePreview?: boolean;
	}

	let { user = null, onOpenAuth = () => {}, isStandalonePreview = false }: Props = $props();

	let pathname = $derived(page.url.pathname);
</script>

<!-- Mobile Bottom Navigation: Bottom Nav 1 (Default Classic Bar) -->
<nav
	class="{isStandalonePreview
		? 'relative w-full'
		: 'md:hidden fixed bottom-0 inset-x-0'} z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-4 shadow-lg flex items-center justify-around font-['Anek_Bangla',sans-serif]"
>
	<!-- 1. Home -->
	<a
		href="/"
		class="flex flex-col items-center gap-1 transition-colors {pathname === '/'
			? 'text-[#2563eb]'
			: 'text-slate-500 hover:text-slate-900'}"
	>
		<Home class="w-5 h-5" />
		<span class="text-[10px] font-bold">হোম</span>
	</a>

	<!-- 2. Categories -->
	<a
		href="/catalog/all-category"
		class="flex flex-col items-center gap-1 transition-colors {pathname.includes('/category')
			? 'text-[#2563eb]'
			: 'text-slate-500 hover:text-slate-900'}"
	>
		<LayoutGrid class="w-5 h-5" />
		<span class="text-[10px] font-bold">ক্যাটাগরি</span>
	</a>

	<!-- 3. Cart with Badge -->
	<button
		type="button"
		onclick={() => cart.toggleCart()}
		class="relative flex flex-col items-center gap-1 text-slate-500 hover:text-[#2563eb] transition-colors cursor-pointer"
	>
		<div class="relative">
			<ShoppingCart class="w-5 h-5" />
			{#if cart.totalQuantity > 0}
				<span
					class="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center"
				>
					{cart.totalQuantity}
				</span>
			{/if}
		</div>
		<span class="text-[10px] font-bold">কার্ট</span>
	</button>

	<!-- 4. Profile / Login -->
	<a
		href={user ? "/account" : "/auth/login"}
		class="flex flex-col items-center gap-1 transition-colors {pathname.includes('/account') || pathname.includes('/auth')
			? 'text-[#2563eb]'
			: 'text-slate-500 hover:text-slate-900'}"
	>
		<User class="w-5 h-5" />
		<span class="text-[10px] font-bold">{user ? 'অ্যাকাউন্ট' : 'লগইন'}</span>
	</a>
</nav>
