<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import {
		Bell,
		CheckCircle2,
		Clock,
		ShoppingBag,
		Truck,
		AlertTriangle,
		Trash2,
		CheckCheck,
		Search,
		ChevronRight,
		Volume2,
		VolumeX,
		Music,
		RotateCw
	} from 'lucide-svelte';
	import {
		playNotificationSound,
		testNotificationSound,
		isSoundEnabled,
		setSoundEnabled
	} from '#lib/utils/notificationSound';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	// Live D1 Notifications State
	let notifications = $state<any[]>(data?.notifications || []);
	let isRefreshing = $state(false);

	$effect(() => {
		notifications = data?.notifications || [];
	});

	// Sound Alert State
	let soundEnabled = $state(true);

	onMount(() => {
		soundEnabled = isSoundEnabled();
	});

	function toggleSound() {
		soundEnabled = !soundEnabled;
		setSoundEnabled(soundEnabled);
		if (soundEnabled) {
			testNotificationSound();
			showToast('🔔 নোটিফিকেশন সাউন্ড চালু করা হয়েছে');
		} else {
			showToast('🔕 নোটিফিকেশন সাউন্ড বন্ধ (Mute) করা হয়েছে');
		}
	}

	function handleTestSound() {
		testNotificationSound();
		showToast('🎶 নোটিফিকেশন অ্যালার্ট সাউন্ড টেস্ট বাজানো হয়েছে');
	}

	// Filter Tabs: 'all' | 'unread' | 'order' | 'courier' | 'system'
	let activeFilter = $state<'all' | 'unread' | 'order' | 'courier' | 'system'>('all');
	let searchQuery = $state('');

	function showToast(msg: string) {
		toast.success(msg);
	}

	// Counts
	let unreadCount = $derived(notifications.filter((n) => !n.isRead).length);
	let orderCount = $derived(notifications.filter((n) => n.category === 'order').length);
	let courierCount = $derived(notifications.filter((n) => n.category === 'courier').length);
	let systemCount = $derived(notifications.filter((n) => n.category === 'system').length);

	// Bengali Number & Date Formatters
	function toBengaliNumber(val: number | string): string {
		const digits: Record<string, string> = {
			'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
			'5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
		};
		return String(val).replace(/\d/g, (d) => digits[d] || d);
	}

	function formatRelativeTime(dateInput: any): string {
		if (!dateInput) return 'সম্প্রতি';
		const date = new Date(dateInput);
		if (isNaN(date.getTime())) return 'সম্প্রতি';
		const now = Date.now();
		const diffMs = now - date.getTime();
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHour = Math.floor(diffMin / 60);
		const diffDay = Math.floor(diffHour / 24);

		if (diffSec < 45) return 'এইমাত্র';
		if (diffMin < 60) return `${toBengaliNumber(diffMin)} মিনিট আগে`;
		if (diffHour < 24) return `${toBengaliNumber(diffHour)} ঘণ্টা আগে`;
		if (diffDay === 1) return 'গতকাল';
		if (diffDay < 7) return `${toBengaliNumber(diffDay)} দিন আগে`;
		return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function formatFullTimestamp(dateInput: any): string {
		if (!dateInput) return '';
		const date = new Date(dateInput);
		if (isNaN(date.getTime())) return '';
		return date.toLocaleString('bn-BD', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}

	function getLinkLabel(notif: any): string {
		if (notif.category === 'order') return 'অর্ডার দেখুন';
		if (notif.category === 'courier') return 'কুরিয়ার হিস্ট্রি';
		if (notif.category === 'system') return 'সিস্টেম লগ';
		return 'বিস্তারিত দেখুন';
	}

	// Filtered Notifications
	let filteredNotifications = $derived(
		notifications.filter((n) => {
			const matchesFilter =
				activeFilter === 'all'
					? true
					: activeFilter === 'unread'
						? !n.isRead
						: n.category === activeFilter;

			const matchesSearch =
				searchQuery === ''
					? true
					: (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
						(n.description || '').toLowerCase().includes(searchQuery.toLowerCase());

			return matchesFilter && matchesSearch;
		})
	);

	// Action Handlers
	async function markAsRead(id: string) {
		const target = notifications.find((n) => n.id === id);
		if (!target || target.isRead) return;

		// Optimistic update
		notifications = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));

		try {
			const fd = new FormData();
			fd.append('id', id);
			await fetch('?/markAsRead', { method: 'POST', body: fd });
			await invalidateAll();
		} catch (e) {
			console.error('Failed to mark notification as read:', e);
		}
	}

	async function markAllAsRead() {
		if (unreadCount === 0) return;
		// Optimistic update
		notifications = notifications.map((n) => ({ ...n, isRead: true }));
		showToast('সব নোটিফিকেশন পড়া হয়েছে হিসেবে চিহ্নিত করা হয়েছে');

		try {
			const fd = new FormData();
			await fetch('?/markAllAsRead', { method: 'POST', body: fd });
			await invalidateAll();
		} catch (e) {
			console.error('Failed to mark all as read:', e);
		}
	}

	async function deleteNotification(id: string) {
		// Optimistic update
		notifications = notifications.filter((n) => n.id !== id);
		showToast('নোটিফিকেশন মুছে ফেলা হয়েছে');

		try {
			const fd = new FormData();
			fd.append('id', id);
			await fetch('?/deleteNotification', { method: 'POST', body: fd });
			await invalidateAll();
		} catch (e) {
			console.error('Failed to delete notification:', e);
		}
	}

	async function clearAll() {
		if (notifications.length === 0) return;
		const confirmed = await confirmModal({
			title: 'সব নোটিফিকেশন মুছুন',
			message: 'আপনি কি নিশ্চিত যে সব নোটিফিকেশন মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না!',
			confirmText: 'হ্যাঁ, সব মুছুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) return;

		// Optimistic update
		notifications = [];
		showToast('সব নোটিফিকেশন ক্লিয়ার করা হয়েছে');

		try {
			const fd = new FormData();
			await fetch('?/clearAll', { method: 'POST', body: fd });
			await invalidateAll();
		} catch (e) {
			console.error('Failed to clear notifications:', e);
		}
	}

	async function refreshNotifications() {
		isRefreshing = true;
		await invalidateAll();
		setTimeout(() => {
			isRefreshing = false;
			showToast('নোটিফিকেশন তালিকা আপডেট করা হয়েছে');
		}, 300);
	}
</script>

<svelte:head>
	<title>নোটিফিকেশন সেন্টার | Notifications</title>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-6 font-['Anek_Bangla',sans-serif]">
	
	<!-- Top Header Banner -->
	<div class="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-3.5">
			<div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb] shadow-2xs relative shrink-0">
				<Bell class="w-6 h-6" />
				{#if unreadCount > 0}
					<span class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
						{toBengaliNumber(unreadCount)}
					</span>
				{/if}
			</div>
			<div>
				<div class="flex items-center gap-2 flex-wrap">
					<h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">নোটিফিকেশন সেন্টার</h2>
					{#if unreadCount > 0}
						<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
							{toBengaliNumber(unreadCount)} টি অপঠিত
						</span>
					{:else}
						<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
							সব আপডেট সম্পন্ন
						</span>
					{/if}
				</div>
				<p class="text-xs text-slate-500 mt-0.5">রিয়েল-টাইম নতুন ওয়েবসাইট অর্ডার, কুরিয়ার আপডেট ও সিস্টেম নিরাপত্তা সতর্কতা</p>
			</div>
		</div>

		<!-- Action Controls -->
		<div class="flex items-center gap-2 flex-wrap">
			<!-- Sound Toggle Button -->
			<button
				type="button"
				onclick={toggleSound}
				class="px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs {soundEnabled
					? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
					: 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'}"
				title={soundEnabled ? 'নোটিফিকেশন সাউন্ড চালু আছে (ক্লিক করে মিউট করুন)' : 'নোটিফিকেশন সাউন্ড বন্ধ আছে (ক্লিক করে অন করুন)'}
			>
				{#if soundEnabled}
					<Volume2 class="w-4 h-4 text-emerald-600 animate-pulse" />
					<span>সাউন্ড চালু</span>
				{:else}
					<VolumeX class="w-4 h-4 text-slate-400" />
					<span>সাউন্ড বন্ধ</span>
				{/if}
			</button>

			<!-- Sound Test Button -->
			<button
				type="button"
				onclick={handleTestSound}
				class="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/90 text-[#5845eb] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
				title="নোটিফিকেশন সাউন্ড প্রিভিউ শুনুন"
			>
				<Music class="w-3.5 h-3.5" />
				<span class="hidden sm:inline">সাউন্ড টেস্ট</span>
			</button>

			<!-- Refresh Button -->
			<button
				type="button"
				onclick={refreshNotifications}
				class="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
				title="রিফ্রেশ করুন"
			>
				<RotateCw class="w-4 h-4 {isRefreshing ? 'animate-spin text-[#5845eb]' : ''}" />
			</button>

			{#if unreadCount > 0}
				<button
					type="button"
					onclick={markAllAsRead}
					class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
				>
					<CheckCheck class="w-4 h-4 text-indigo-600" />
					<span>সব পড়া হয়েছে</span>
				</button>
			{/if}

			{#if notifications.length > 0}
				<button
					type="button"
					onclick={clearAll}
					class="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
				>
					<Trash2 class="w-3.5 h-3.5" />
					<span>ক্লিয়ার করুন</span>
				</button>
			{/if}
		</div>
	</div>

	<!-- Search & Category Filter Pills -->
	<div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
		
		<!-- Search Input -->
		<div class="relative">
			<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
			<input
				type="text"
				placeholder="নোটিফিকেশনের বিষয় বা বিবরণ দিয়ে খুঁজুন..."
				bind:value={searchQuery}
				class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] focus:bg-white transition-all"
			/>
		</div>

		<!-- Filter Tabs -->
		<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
			<button
				type="button"
				onclick={() => (activeFilter = 'all')}
				class="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer {activeFilter === 'all'
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
			>
				সবগুলো ({toBengaliNumber(notifications.length)})
			</button>

			<button
				type="button"
				onclick={() => (activeFilter = 'unread')}
				class="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer {activeFilter === 'unread'
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
			>
				নতুন / অপঠিত ({toBengaliNumber(unreadCount)})
			</button>

			<button
				type="button"
				onclick={() => (activeFilter = 'order')}
				class="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer {activeFilter === 'order'
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
			>
				অর্ডার আপডেট ({toBengaliNumber(orderCount)})
			</button>

			<button
				type="button"
				onclick={() => (activeFilter = 'courier')}
				class="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer {activeFilter === 'courier'
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
			>
				কুরিয়ার ও ট্র্যাকিং ({toBengaliNumber(courierCount)})
			</button>

			<button
				type="button"
				onclick={() => (activeFilter = 'system')}
				class="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer {activeFilter === 'system'
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
			>
				সিস্টেম ও সিকিউরিটি ({toBengaliNumber(systemCount)})
			</button>
		</div>

	</div>

	<!-- Notifications List -->
	{#if filteredNotifications.length === 0}
		<div class="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs space-y-3">
			<div class="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
				<Bell class="w-7 h-7" />
			</div>
			<h4 class="font-bold text-slate-800 text-base">কোনো নোটিফিকেশন পাওয়া যায়নি</h4>
			<p class="text-xs text-slate-400 max-w-sm mx-auto">
				আপনার নির্বাচিত ফিল্টারে কোনো তথ্য নেই অথবা সব নোটিফিকেশন ক্লিয়ার করা হয়েছে।
			</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each filteredNotifications as notif (notif.id)}
				<div
					onclick={() => markAsRead(notif.id)}
					class="p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer {notif.isRead
						? 'bg-white border-slate-200/80 hover:border-slate-300'
						: 'bg-indigo-50/40 border-indigo-200/90 hover:bg-indigo-50/70 shadow-2xs'}"
				>
					<div class="flex items-start gap-3.5 min-w-0">
						<!-- Icon container depending on type -->
						<div class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5 {notif.category === 'order'
							? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
							: notif.category === 'courier'
								? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
								: 'bg-amber-50 text-amber-600 border border-amber-200'}">
							{#if notif.category === 'order'}
								<ShoppingBag class="w-5 h-5" />
							{:else if notif.category === 'courier'}
								<Truck class="w-5 h-5" />
							{:else}
								<AlertTriangle class="w-5 h-5" />
							{/if}
						</div>

						<!-- Content -->
						<div class="min-w-0 space-y-1">
							<div class="flex items-center gap-2 flex-wrap">
								<h4 class="font-bold text-slate-900 text-sm leading-snug">
									{notif.title}
								</h4>
								{#if !notif.isRead}
									<span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
								{/if}
							</div>
							<p class="text-xs text-slate-600 leading-relaxed">
								{notif.description}
							</p>
							<div class="flex items-center gap-3 text-[11px] text-slate-400 pt-1 flex-wrap">
								<span class="flex items-center gap-1 font-medium text-slate-500">
									<Clock class="w-3.5 h-3.5" />
									<span>{formatRelativeTime(notif.createdAt)}</span>
								</span>
								{#if notif.createdAt}
									<span>•</span>
									<span>{formatFullTimestamp(notif.createdAt)}</span>
								{/if}
							</div>
						</div>
					</div>

					<!-- Right Action Buttons -->
					<div class="flex items-center gap-2 shrink-0 sm:self-center pl-13 sm:pl-0">
						<a
							href={notif.link || '/admin/orders'}
							class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors"
						>
							<span>{getLinkLabel(notif)}</span>
							<ChevronRight class="w-3.5 h-3.5" />
						</a>

						<button
							type="button"
							onclick={(e) => {
								e.stopPropagation();
								deleteNotification(notif.id);
							}}
							class="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 transition-colors cursor-pointer shadow-2xs"
							title="মুছে ফেলুন"
						>
							<Trash2 class="w-3.5 h-3.5" />
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}

</div>
