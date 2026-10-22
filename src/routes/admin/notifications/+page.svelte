<script lang="ts">
	import { Button, Input, Card, Badge } from '#lib/components/ui';
	import {
		Bell,
		CheckCircle2,
		Clock,
		ShoppingBag,
		Truck,
		AlertTriangle,
		ShieldCheck,
		Zap,
		Trash2,
		CheckCheck,
		Filter,
		Search,
		ExternalLink,
		Settings,
		ChevronRight,
		SlidersHorizontal
	} from 'lucide-svelte';

	// Filter Tabs: 'all' | 'unread' | 'order' | 'courier' | 'system'
	let activeFilter = $state<'all' | 'unread' | 'order' | 'courier' | 'system'>('all');
	let searchQuery = $state('');

	// Notifications State
	let notifications = $state([
		{
			id: 'notif-1',
			title: 'নতুন ওয়েবসাইট অর্ডার #AUR-9842 প্রাপ্ত হয়েছে',
			description: 'কাস্টমার সাইদুর রহমান ২ টি আইটেম অর্ডার করেছেন। মোট বিল: ৳৩,৯৫০ (ক্যাশ অন ডেলিভারি)।',
			category: 'order',
			time: '১০ মিনিট আগে',
			timestamp: '২২ অক্টো, ২০২৬ - ০৯:৪৫ PM',
			isRead: false,
			link: '/admin/orders',
			linkLabel: 'অর্ডার দেখুন'
		},
		{
			id: 'notif-2',
			title: 'Steadfast কুরিয়ার পার্সেল ডেলিভারি সম্পন্ন',
			description: 'ট্র্যাকিং নম্বর CID-884920 সফলভাবে ডেলিভারি হয়েছে। টাকা অ্যাকাউন্টে জমা হয়েছে।',
			category: 'courier',
			time: '২৫ মিনিট আগে',
			timestamp: '২২ অক্টো, ২০২৬ - ০৯:৩০ PM',
			isRead: false,
			link: '/admin/orders/list',
			linkLabel: 'ট্র্যাকিং হিস্ট্রি'
		},
		{
			id: 'notif-3',
			title: 'স্টক অ্যালার্ট: AURA Spectrum X অবশিষ্ট মাত্র ৪ টি',
			description: 'ইনভেন্টরিতে স্টক কমে এসেছে। দ্রুত নতুন ব্যাচ রি-স্টক করার অনুরোধ করা হচ্ছে।',
			category: 'system',
			time: '১ ঘণ্টা আগে',
			timestamp: '২২ অক্টো, ২০২৬ - ০৮:৫৫ PM',
			isRead: false,
			link: '/admin/orders',
			linkLabel: 'ইনভেন্টরি চেক'
		},
		{
			id: 'notif-4',
			title: 'Meta Conversions API (CAPI) ইভেন্ট সফলভাবে সিঙ্ক হয়েছে',
			description: 'গত ২৪ ঘণ্টায় ১,২৪০ টি Purchase ও AddToCart ইভেন্ট মেটাতে সফলভাবে পাঠানো হয়েছে।',
			category: 'system',
			time: '২ ঘণ্টা আগে',
			timestamp: '২২ অক্টো, ২০২৬ - ০৭:৫০ PM',
			isRead: false,
			link: '/admin/settings/facebook-pixel',
			linkLabel: 'পিক্সেল সেটিংস'
		},
		{
			id: 'notif-5',
			title: 'নতুন কাস্টমার রিভিউ যোগ হয়েছে (#REV-819)',
			description: 'Sarah Chen আপনার পণ্যে ৫-স্টার রেটিং দিয়ে নতুন রিভিউ পোস্ট করেছেন।',
			category: 'order',
			time: '৫ ঘণ্টা আগে',
			timestamp: '২২ অক্টো, ২০২৬ - ০৪:৩০ PM',
			isRead: true,
			link: '/admin',
			linkLabel: 'ড্যাশবোর্ড'
		},
		{
			id: 'notif-6',
			title: 'Pathao কুরিয়ার এপিআই কানেকশন টেস্ট সফল',
			description: 'পাথাও কুরিয়ার মার্চেন্ট টোকেন ভ্যালিডেশন সফলভাবে সম্পন্ন হয়েছে।',
			category: 'courier',
			time: 'গতকাল - ১১:১৫ PM',
			timestamp: '২১ অক্টো, ২০২৬ - ১১:১৫ PM',
			isRead: true,
			link: '/admin/settings/courier',
			linkLabel: 'কুরিয়ার পেজ'
		},
		{
			id: 'notif-7',
			title: 'অ্যাডমিন প্রোফাইল সিকিউরিটি লগইন যাচাই',
			description: 'আইপি 103.145.72.19 থেকে সফলভাবে অ্যাডমিন প্যানেলে লগইন সম্পন্ন হয়েছে।',
			category: 'system',
			time: 'গতকাল - ০২:০০ PM',
			timestamp: '২১ অক্টো, ২০২৬ - ০২:০০ PM',
			isRead: true,
			link: '/admin/profile',
			linkLabel: 'প্রোফাইল'
		}
	]);

	// Toast Feedback
	let toastMessage = $state<string | null>(null);
	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => (toastMessage = null), 2500);
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
					: n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						n.description.toLowerCase().includes(searchQuery.toLowerCase());

			return matchesFilter && matchesSearch;
		})
	);

	let unreadCount = $derived(notifications.filter((n) => !n.isRead).length);

	function markAsRead(id: string) {
		notifications = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
	}

	function markAllAsRead() {
		notifications = notifications.map((n) => ({ ...n, isRead: true }));
		showToast('সব নোটিফিকেশন পড়া হয়েছে হিসেবে চিহ্নিত করা হয়েছে');
	}

	function deleteNotification(id: string) {
		notifications = notifications.filter((n) => n.id !== id);
		showToast('নোটিফিকেশন মুছে ফেলা হয়েছে');
	}

	function clearAll() {
		if (confirm('আপনি কি সব নোটিফিকেশন মুছে ফেলতে চান?')) {
			notifications = [];
			showToast('সব নোটিফিকেশন ক্লিয়ার করা হয়েছে');
		}
	}
</script>

<svelte:head>
	<title>নোটিফিকেশন সেন্টার | Notifications</title>
</svelte:head>

<!-- Toast Alert -->
{#if toastMessage}
	<div class="fixed bottom-24 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs font-bold">
		<CheckCircle2 class="w-4 h-4 text-emerald-400" />
		<span>{toastMessage}</span>
	</div>
{/if}

<div class="max-w-5xl mx-auto space-y-6 font-['Hind_Siliguri',sans-serif]">
	
	<!-- Top Header Banner -->
	<div class="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-3.5">
			<div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb] shadow-2xs relative">
				<Bell class="w-6 h-6" />
				{#if unreadCount > 0}
					<span class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
						{unreadCount}
					</span>
				{/if}
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">নোটিফিকেশন সেন্টার</h2>
					{#if unreadCount > 0}
						<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
							{unreadCount} টি নতুন
						</span>
					{/if}
				</div>
				<p class="text-xs text-slate-500 mt-0.5">আপনার শপের নতুন অর্ডার, কুরিয়ার স্ট্যাটাস ও সিস্টেম সতর্কতা</p>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex items-center gap-2 flex-wrap">
			{#if unreadCount > 0}
				<button
					type="button"
					onclick={markAllAsRead}
					class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
				>
					<CheckCheck class="w-4 h-4 text-indigo-600" />
					<span>সব পড়া হয়েছে</span>
				</button>
			{/if}

			{#if notifications.length > 0}
				<button
					type="button"
					onclick={clearAll}
					class="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
				সবগুলো ({notifications.length})
			</button>

			<button
				type="button"
				onclick={() => (activeFilter = 'unread')}
				class="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer {activeFilter === 'unread'
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
			>
				নতুন / অপঠিত ({unreadCount})
			</button>

			<button
				type="button"
				onclick={() => (activeFilter = 'order')}
				class="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer {activeFilter === 'order'
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
			>
				অর্ডার আপডেট
			</button>

			<button
				type="button"
				onclick={() => (activeFilter = 'courier')}
				class="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer {activeFilter === 'courier'
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
			>
				কুরিয়ার ও ট্র্যাকিং
			</button>

			<button
				type="button"
				onclick={() => (activeFilter = 'system')}
				class="px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer {activeFilter === 'system'
					? 'bg-[#5845eb] text-white shadow-xs'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
			>
				সিস্টেম ও সিকিউরিটি
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
									<span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
								{/if}
							</div>
							<p class="text-xs text-slate-600 leading-relaxed">
								{notif.description}
							</p>
							<div class="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
								<span class="flex items-center gap-1 font-medium text-slate-500">
									<Clock class="w-3.5 h-3.5" />
									<span>{notif.time}</span>
								</span>
								<span>•</span>
								<span>{notif.timestamp}</span>
							</div>
						</div>
					</div>

					<!-- Right Action Buttons -->
					<div class="flex items-center gap-2 shrink-0 sm:self-center pl-13 sm:pl-0">
						<a
							href={notif.link}
							class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors"
						>
							<span>{notif.linkLabel}</span>
							<ChevronRight class="w-3.5 h-3.5" />
						</a>

						<button
							type="button"
							onclick={(e) => {
								e.stopPropagation();
								deleteNotification(notif.id);
							}}
							class="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
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
