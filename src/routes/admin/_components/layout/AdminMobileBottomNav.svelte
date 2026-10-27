<script lang="ts">
	import { page } from '$app/state';
	import { LayoutGrid, ReceiptText, Bell, Menu } from 'lucide-svelte';

	interface Props {
		onToggleMenu: () => void;
	}

	let { onToggleMenu }: Props = $props();

	let currentPath = $derived(page.url.pathname);
	let isDashboard = $derived(currentPath === '/admin');
	let isNotificationsActive = $derived(currentPath.startsWith('/admin/notifications'));
</script>

<div class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5">
	<div class="grid grid-cols-4 items-center">
		<!-- 1. Dashboard -->
		<a
			href="/admin"
			class="flex flex-col items-center justify-center gap-1 py-1 transition-colors {isDashboard ? 'text-[#5845eb]' : 'text-slate-600 hover:text-slate-900'}"
		>
			<LayoutGrid class="w-5 h-5 {isDashboard ? 'stroke-[2.5]' : 'stroke-2'}" />
			<span class="text-[11px] {isDashboard ? 'font-bold' : 'font-medium'} leading-none">Dashboard</span>
		</a>

		<!-- 2. Order List -->
		<a
			href="/admin/orders/list"
			class="flex flex-col items-center justify-center gap-1 py-1 transition-colors {currentPath === '/admin/orders/list' ? 'text-[#5845eb]' : 'text-slate-600 hover:text-slate-900'}"
		>
			<ReceiptText class="w-5 h-5 {currentPath === '/admin/orders/list' ? 'stroke-[2.5]' : 'stroke-2'}" />
			<span class="text-[11px] {currentPath === '/admin/orders/list' ? 'font-bold' : 'font-medium'} leading-none">Order List</span>
		</a>

		<!-- 3. Notification -->
		<a
			href="/admin/notifications"
			class="flex flex-col items-center justify-center gap-1 py-1 transition-colors {isNotificationsActive ? 'text-[#5845eb]' : 'text-slate-600 hover:text-slate-900'} relative"
		>
			<div class="relative">
				<Bell class="w-5 h-5 {isNotificationsActive ? 'stroke-[2.5]' : 'stroke-2'}" />
				<span class="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
					4
				</span>
			</div>
			<span class="text-[11px] {isNotificationsActive ? 'font-bold' : 'font-medium'} leading-none">Notification</span>
		</a>

		<!-- 4. Menu -->
		<button
			type="button"
			onclick={onToggleMenu}
			class="flex flex-col items-center justify-center gap-1 py-1 transition-colors text-slate-600 hover:text-slate-900 cursor-pointer"
		>
			<Menu class="w-5 h-5 stroke-2" />
			<span class="text-[11px] font-medium leading-none">Menu</span>
		</button>
	</div>
</div>
