<script lang="ts">
	import {
		LayoutDashboard,
		Package,
		MapPin,
		User,
		PhoneCall,
		LogOut,
		ShieldCheck,
		ChevronRight
	} from 'lucide-svelte';

	interface Props {
		user: {
			id?: string;
			name?: string;
			email?: string;
			image?: string | null;
		};
		activeTab: string;
		orderCount: number;
		onTabChange: (tab: string) => void;
	}

	let { user, activeTab = 'overview', orderCount = 0, onTabChange }: Props = $props();

	const MENU_ITEMS = [
		{
			id: 'overview',
			label: 'ড্যাশবোর্ড ওভারভিউ',
			english: 'Account Overview',
			icon: LayoutDashboard
		},
		{
			id: 'orders',
			label: 'আমার অর্ডারসমূহ',
			english: 'My Orders',
			icon: Package,
			badge: orderCount > 0 ? orderCount : null
		},
		{
			id: 'address',
			label: 'ঠিকানা খাতা',
			english: 'Address Book',
			icon: MapPin
		},
		{
			id: 'profile',
			label: 'প্রোফাইল ও নিরাপত্তা',
			english: 'Profile & Security',
			icon: User
		},
		{
			id: 'support',
			label: 'সহায়তা ও যোগাযোগ',
			english: 'Help & Policies',
			icon: PhoneCall
		}
	];
</script>

<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- User Profile Header Summary -->
	<div class="p-5 sm:p-6 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white border-b border-slate-100 flex items-center gap-3.5">
		<!-- Avatar -->
		<div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5845eb] to-[#7c3aed] p-0.5 shadow-md shadow-indigo-600/20 shrink-0">
			{#if user.image}
				<img
					src={user.image}
					alt={user.name || 'User'}
					class="w-full h-full object-cover rounded-[14px]"
				/>
			{:else}
				<div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-black text-xl text-[#5845eb]">
					{user.name ? user.name.charAt(0).toUpperCase() : 'U'}
				</div>
			{/if}
		</div>

		<!-- User Info -->
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-1.5">
				<h2 class="text-sm sm:text-base font-bold text-slate-900 truncate">
					{user.name || 'সম্মানিত গ্রাহক'}
				</h2>
			</div>
			<p class="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
				{user.email || ''}
			</p>
			<div class="mt-1">
				<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
					<ShieldCheck class="w-3 h-3 text-emerald-600" />
					<span>ভেরিফাইড কাস্টমার</span>
				</span>
			</div>
		</div>
	</div>

	<!-- Navigation Menu -->
	<nav class="p-3 space-y-1">
		{#each MENU_ITEMS as item}
			{@const isActive = activeTab === item.id}
			{@const Icon = item.icon}
			<button
				type="button"
				onclick={() => onTabChange(item.id)}
				class="w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer group {isActive
					? 'bg-[#5845eb] text-white shadow-sm shadow-indigo-500/20'
					: 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'}"
			>
				<div class="flex items-center gap-3">
					<div
						class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors {isActive
							? 'bg-white/20 text-white'
							: 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'}"
					>
						<Icon class="w-4 h-4 stroke-[2.2]" />
					</div>
					<div>
						<div class="leading-tight">{item.label}</div>
						<div class="text-[10px] {isActive ? 'text-indigo-100' : 'text-slate-400'} font-normal font-mono">
							{item.english}
						</div>
					</div>
				</div>

				<div class="flex items-center gap-1.5">
					{#if item.badge !== null && item.badge !== undefined}
						<span
							class="px-2 py-0.5 rounded-full text-[10px] font-mono font-black {isActive
								? 'bg-white text-[#5845eb]'
								: 'bg-indigo-50 text-[#5845eb] border border-indigo-100'}"
						>
							{item.badge}
						</span>
					{/if}
					<ChevronRight class="w-3.5 h-3.5 transition-transform {isActive ? 'translate-x-0.5 text-white' : 'text-slate-400 group-hover:translate-x-0.5'}" />
				</div>
			</button>
		{/each}
	</nav>

	<!-- Logout Footer -->
	<div class="p-3 border-t border-slate-100 bg-slate-50/50">
		<form action="/auth/login?/signOut" method="POST">
			<button
				type="submit"
				class="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-transparent hover:border-rose-100"
			>
				<LogOut class="w-3.5 h-3.5" />
				<span>অ্যাকাউন্ট থেকে লগআউট</span>
			</button>
		</form>
	</div>
</div>
