<script lang="ts">
	import { Button, Input, Card, Badge, Dialog } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import {
		MessageSquare,
		Ticket,
		PlusCircle,
		Headphones,
		Users,
		Zap,
		ShieldCheck,
		Send,
		Paperclip,
		Smile,
		CheckCircle2,
		Clock,
		AlertCircle,
		ChevronRight,
		Star,
		X,
		MessageCircle,
		PhoneCall,
		ExternalLink,
		Sparkles
	} from 'lucide-svelte';

	// Active Tab State: 'live' or 'tickets'
	let activeTab = $state<'live' | 'tickets'>('live');

	// Language Selector State: 'bn', 'en', 'it'
	let selectedLang = $state<'bn' | 'en' | 'it'>('bn');

	// Live Chat Drawer/Modal State
	let isLiveChatOpen = $state(false);
	let chatMessages = $state([
		{
			id: 1,
			sender: 'agent',
			name: 'Asif (সাপোর্ট স্পেশালিস্ট)',
			text: 'আসসালামু আলাইকুম! AURA সাপোর্টে আপনাকে স্বাগতম। আমি আসিফ, আপনার জন্য অনলাইন আছি। আপনার শপ বা অর্ডার সংক্রান্ত কী সাহায্য প্রয়োজন?',
			time: '০২:১১ AM'
		}
	]);
	let newChatMessage = $state('');
	let isAgentTyping = $state(false);

	function sendLiveMessage(e?: Event) {
		if (e) e.preventDefault();
		if (!newChatMessage.trim()) return;

		const userMsg = newChatMessage.trim();
		chatMessages = [
			...chatMessages,
			{
				id: Date.now(),
				sender: 'user',
				name: 'আপনি (Owner)',
				text: userMsg,
				time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
			}
		];
		newChatMessage = '';

		// Simulate Agent reply
		isAgentTyping = true;
		setTimeout(() => {
			isAgentTyping = false;
			chatMessages = [
				...chatMessages,
				{
					id: Date.now() + 1,
					sender: 'agent',
					name: 'Asif',
					text: 'ধন্যবাদ আপনার বার্তার জন্য। আমরা বিষয়টি গুরুত্ব সহকারে দেখছি এবং দ্রুত সমাধান করছি। আর কিছু কি জানতে চান?',
					time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
				}
			];
		}, 1200);
	}

	// Create Ticket Modal State
	let isCreateTicketOpen = $state(false);
	let ticketSubject = $state('');
	let ticketCategory = $state('অর্ডার ও কুরিয়ার');
	let ticketPriority = $state('জরুরি');
	let ticketDescription = $state('');

	// Tickets List
	let tickets = $state([
		{
			id: 'TCK-8921',
			subject: 'Steadfast কুরিয়ার ট্র্যাকিং সিঙ্ক সমস্যা',
			category: 'কুরিয়ার ও এপিআই',
			priority: 'জরুরি',
			status: 'ইন প্রগ্রেস',
			createdAt: '২২ অক্টো, ২০২৬ - ০৯:১৫ PM',
			updatedAt: '১০ মিনিট আগে'
		},
		{
			id: 'TCK-8740',
			subject: 'Meta Conversions API (CAPI) ইভেন্ট টেস্ট',
			category: 'পিক্সেল ও ট্র্যাকিং',
			priority: 'সাধারণ',
			status: 'সমাধান হয়েছে',
			createdAt: '১৫ অক্টো, ২০২৬ - ০৩:৪৫ PM',
			updatedAt: '১৬ অক্টো, ২০২৬'
		}
	]);

	// Toast Feedback
	function showToast(msg: string) {
		toast.success(msg);
	}

	function handleCreateTicket(e: Event) {
		e.preventDefault();
		if (!ticketSubject.trim()) {
			toast.warning('দয়া করে টিকেটের বিষয় লিখুন');
			return;
		}

		const newTicket = {
			id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
			subject: ticketSubject,
			category: ticketCategory,
			priority: ticketPriority,
			status: 'পেন্ডিং',
			createdAt: 'আজ, ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
			updatedAt: 'এখনই'
		};

		tickets = [newTicket, ...tickets];
		isCreateTicketOpen = false;
		ticketSubject = '';
		ticketDescription = '';
		activeTab = 'tickets';
		showToast('সাপোর্ট টিকেট সফলভাবে তৈরি হয়েছে!');
	}

	// Rating Modal State
	let isRatingModalOpen = $state(false);
	let selectedRating = $state(5);
	let ratingFeedback = $state('');

	function submitRating() {
		isRatingModalOpen = false;
		showToast('আপনার রেটিং ও মতামতের জন্য ধন্যবাদ!');
	}

	// Session History Modal
	let isSessionHistoryOpen = $state(false);

	// Team Members Avatars
	const teamMembers = [
		{ name: 'Asif', role: 'সাপোর্ট স্পেশালিস্ট', status: 'online', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
		{ name: 'Tanvir', role: 'টেকনিক্যাল ইঞ্জিনিয়ার', status: 'online', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
		{ name: 'Rashed', role: 'এপিআই ও কুরিয়ার বিশেষজ্ঞ', status: 'online', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
		{ name: 'Nadia', role: 'কাস্টমার সাকসেস', status: 'online', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
		{ name: 'Sakib', role: 'সাপোর্ট লিড', status: 'online', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face' },
		{ name: 'Mahmud', role: 'বিলিং স্পেশালিস্ট', status: 'online', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
		{ name: 'Farhana', role: 'অ্যাকাউন্ট ম্যানেজার', status: 'online', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' }
	];
</script>

<svelte:head>
	<title>Support Center | AURA Executive Panel</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto font-['Anek_Bangla',sans-serif]">

	<!-- ============================================== -->
	<!-- TOP SUB-HEADER BAR (Matching Reference Image)   -->
	<!-- ============================================== -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
		
		<!-- Left: Tab Switcher (Live Support / Ticket Management) -->
		<div class="inline-flex items-center p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/70 shadow-2xs">
			
			<!-- Live Support Tab -->
			<button
				type="button"
				onclick={() => (activeTab = 'live')}
				class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer {activeTab === 'live'
					? 'bg-white text-indigo-700 shadow-sm'
					: 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}"
			>
				<MessageSquare class="w-4 h-4 fill-current text-indigo-600" />
				<span>Live Support</span>
			</button>

			<!-- Ticket Management Tab -->
			<button
				type="button"
				onclick={() => (activeTab = 'tickets')}
				class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer {activeTab === 'tickets'
					? 'bg-white text-indigo-700 shadow-sm'
					: 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}"
			>
				<Ticket class="w-4 h-4 text-slate-500" />
				<span>Ticket Management</span>
				{#if tickets.length > 0}
					<span class="ml-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full {activeTab === 'tickets' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'}">
						{tickets.length}
					</span>
				{/if}
			</button>
		</div>

		<!-- Right: + Create Ticket Button (Exact Match) -->
		<button
			type="button"
			onclick={() => (isCreateTicketOpen = true)}
			class="px-5 py-2.5 rounded-2xl bg-[#0b1324] hover:bg-[#1a233a] active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
		>
			<div class="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
				<span class="text-xs font-black leading-none">+</span>
			</div>
			<span>Create Ticket</span>
		</button>
	</div>

	<!-- ============================================== -->
	<!-- TAB 1: LIVE SUPPORT VIEW (Exact Replica)       -->
	<!-- ============================================== -->
	{#if activeTab === 'live'}
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
			
			<!-- ========================================== -->
			<!-- LEFT PRIMARY CARD: INSTANT LIVE SUPPORT    -->
			<!-- ========================================== -->
			<div class="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-9 shadow-2xs space-y-7">
				
				<!-- Top Status & Language Switcher Row -->
				<div class="flex items-center justify-between gap-3 flex-wrap">
					
					<!-- Online Indicator Badge -->
					<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold">
						<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
						<span>অনলাইন আছেন</span>
					</div>

					<!-- Language Selector Pills (BD বাংলা / US English / IT Italiano) -->
					<div class="inline-flex items-center p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs font-semibold text-slate-600">
						<button
							type="button"
							onclick={() => (selectedLang = 'bn')}
							class="px-3 py-1 rounded-xl transition-all cursor-pointer {selectedLang === 'bn'
								? 'bg-white text-indigo-900 font-bold shadow-xs'
								: 'hover:text-slate-900'}"
						>
							<span class="font-bold text-slate-400 mr-1 text-[10px]">BD</span> বাংলা
						</button>
						<button
							type="button"
							onclick={() => (selectedLang = 'en')}
							class="px-3 py-1 rounded-xl transition-all cursor-pointer {selectedLang === 'en'
								? 'bg-white text-indigo-900 font-bold shadow-xs'
								: 'hover:text-slate-900'}"
						>
							<span class="font-bold text-slate-400 mr-1 text-[10px]">US</span> English
						</button>
						<button
							type="button"
							onclick={() => (selectedLang = 'it')}
							class="px-3 py-1 rounded-xl transition-all cursor-pointer {selectedLang === 'it'
								? 'bg-white text-indigo-900 font-bold shadow-xs'
								: 'hover:text-slate-900'}"
						>
							<span class="font-bold text-slate-400 mr-1 text-[10px]">IT</span> Italiano
						</button>
					</div>
				</div>

				<!-- Heading & Subtitle -->
				<div>
					<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
						{#if selectedLang === 'bn'}
							ইনস্ট্যান্ট লাইভ সাপোর্ট
						{:else if selectedLang === 'en'}
							Instant Live Support
						{:else}
							Supporto Dal Vivo Istantaneo
						{/if}
					</h2>
					<p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed max-w-xl">
						{#if selectedLang === 'bn'}
							কোনো প্রশ্ন আছে বা সাহায্য প্রয়োজন? আমাদের সাপোর্ট ইঞ্জিনিয়াররা আপনার জন্য রিয়েল-টাইমে সাহায্য করতে প্রস্তুত আছেন।
						{:else if selectedLang === 'en'}
							Have questions or need assistance? Our support engineers are ready to assist you in real time.
						{:else}
							Hai domande o hai bisogno di aiuto? I nostri ingegneri di supporto sono pronti ad aiutarti in tempo reale.
						{/if}
					</p>
				</div>

				<!-- 4 Feature Highlights Stack (Exact Match) -->
				<div class="space-y-4 pt-1">
					
					<!-- 1. Real-time Live Chat -->
					<div class="flex items-start gap-3.5">
						<div class="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-[#5845eb] shadow-2xs">
							<MessageSquare class="w-5 h-5 fill-current" />
						</div>
						<div>
							<h4 class="font-bold text-slate-900 text-sm sm:text-base">রিয়েল-টাইম লাইভ চ্যাট</h4>
							<p class="text-xs text-slate-500 mt-0.5">আমাদের অভিজ্ঞ এজেন্টদের সাথে ইনস্ট্যান্ট চ্যাট করুন</p>
						</div>
					</div>

					<!-- 2. Expert Support Team -->
					<div class="flex items-start gap-3.5">
						<div class="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-[#5845eb] shadow-2xs">
							<Users class="w-5 h-5" />
						</div>
						<div>
							<h4 class="font-bold text-slate-900 text-sm sm:text-base">অভিজ্ঞ সাপোর্ট টিম</h4>
							<p class="text-xs text-slate-500 mt-0.5">আমাদের অভিজ্ঞ টিম আপনাকে সাহায্য করতে প্রস্তুত</p>
						</div>
					</div>

					<!-- 3. Ultra Fast Response -->
					<div class="flex items-start gap-3.5">
						<div class="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-[#5845eb] shadow-2xs">
							<Zap class="w-5 h-5 fill-current" />
						</div>
						<div>
							<h4 class="font-bold text-slate-900 text-sm sm:text-base">অতি দ্রুত রেসপন্স</h4>
							<p class="text-xs text-slate-500 mt-0.5">গড় রেসপন্স সময় ১ মিনিটেরও কম</p>
						</div>
					</div>

					<!-- 4. Secure Session -->
					<div class="flex items-start gap-3.5">
						<div class="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-[#5845eb] shadow-2xs">
							<ShieldCheck class="w-5 h-5" />
						</div>
						<div>
							<h4 class="font-bold text-slate-900 text-sm sm:text-base">নিরাপদ সেশন</h4>
							<p class="text-xs text-slate-500 mt-0.5">সম্পূর্ণ নিরাপদ এবং ব্যক্তিগত সাপোর্ট আলোচনা</p>
						</div>
					</div>

				</div>

				<!-- Full-width Action CTA Button (Exact Replica) -->
				<div class="pt-2">
					<button
						type="button"
						onclick={() => (isLiveChatOpen = true)}
						class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#5845eb] via-[#6366f1] to-[#7c3aed] hover:from-[#4936d6] hover:to-[#6d28d9] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-[0_12px_24px_-6px_rgba(88,69,235,0.4)] hover:shadow-[0_16px_28px_-6px_rgba(88,69,235,0.5)] active:scale-[0.99] transition-all cursor-pointer"
					>
						<Headphones class="w-5 h-5" />
						<span>লাইভ সাপোর্ট সেশন শুরু করুন</span>
					</button>
				</div>

			</div>

			<!-- ========================================== -->
			<!-- RIGHT COLUMN: TEAM & PAST SESSIONS         -->
			<!-- ========================================== -->
			<div class="lg:col-span-5 xl:col-span-4 space-y-6">
				
				<!-- CARD 1: বিশেষজ্ঞ সাপোর্ট টিম -->
				<div class="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
					
					<h3 class="text-base font-bold text-slate-900">আমাদের বিশেষজ্ঞ সাপোর্ট টিম</h3>

					<!-- Featured Active Agent Card (Asif) -->
					<button
						type="button"
						onclick={() => (isLiveChatOpen = true)}
						class="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/70 transition-all flex items-center gap-3.5 text-left cursor-pointer group"
					>
						<div class="relative shrink-0">
							<img
								src={teamMembers[0].avatar}
								alt="Asif"
								class="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs group-hover:scale-105 transition-transform"
							/>
							<span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
						</div>
						<div class="flex-1 min-w-0">
							<h4 class="font-bold text-slate-900 text-sm">Asif</h4>
							<p class="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
								<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
								<span>আপনার জন্য অনলাইন আছি, বলুন।</span>
							</p>
						</div>
					</button>

					<!-- Overlapping Avatars Row + Online Count -->
					<div class="pt-2 flex items-center justify-between border-t border-slate-100">
						<div class="flex items-center -space-x-2">
							{#each teamMembers as member, i}
								<img
									src={member.avatar}
									alt={member.name}
									title={`${member.name} (${member.role})`}
									class="w-8 h-8 rounded-full object-cover border-2 border-white ring-1 ring-slate-100 shadow-2xs hover:scale-110 hover:z-10 transition-all cursor-pointer"
								/>
							{/each}
						</div>
						<span class="text-xs font-bold text-slate-700">৭ জন অনলাইন আছেন</span>
					</div>

				</div>

				<!-- CARD 2: পূর্ববর্তী সেশন সমূহ -->
				<div class="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-3">
					
					<!-- Title & Count Badge -->
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-base font-bold text-slate-900">পূর্ববর্তী সেশন সমূহ</h3>
							<p class="text-xs text-slate-400 mt-0.5">আপনার সাম্প্রতিক সাপোর্টের ইতিহাস</p>
						</div>
						<span class="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
							১ টি সেশন
						</span>
					</div>

					<!-- Session Row Item (Matching Reference Screenshot) -->
					<div class="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 mt-3">
						<div class="flex items-center gap-3 min-w-0">
							<div class="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 shrink-0 shadow-2xs">
								<MessageSquare class="w-4 h-4" />
							</div>
							<div class="min-w-0">
								<div class="text-xs font-bold text-slate-800 tracking-tight">12 May, 2026 - 02:11AM</div>
								<button
									type="button"
									onclick={() => (isRatingModalOpen = true)}
									class="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-0.5 cursor-pointer hover:underline"
								>
									<span>☆</span>
									<span>রেটিং দিন</span>
								</button>
							</div>
						</div>

						<button
							type="button"
							onclick={() => (isSessionHistoryOpen = true)}
							class="px-3 py-1 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer shrink-0 transition-colors"
						>
							<span>দেখুন</span>
							<span class="text-[10px] text-slate-400">&gt;</span>
						</button>
					</div>

				</div>

			</div>

		</div>

	<!-- ============================================== -->
	<!-- TAB 2: TICKET MANAGEMENT VIEW                  -->
	<!-- ============================================== -->
	{:else}
		<div class="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
			
			<div class="p-6 border-b border-slate-100 flex items-center justify-between">
				<div>
					<h3 class="text-lg font-bold text-slate-900">আপনার সাপোর্ট টিকেটসমূহ</h3>
					<p class="text-xs text-slate-500 mt-0.5">সব সমস্যা ও অনুসন্ধানের বর্তমান স্ট্যাটাস ও ট্র্যাকিং</p>
				</div>
				<button
					type="button"
					onclick={() => (isCreateTicketOpen = true)}
					class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
				>
					<span>+ নতুন টিকেট খুলুন</span>
				</button>
			</div>

			<div class="divide-y divide-slate-100">
				{#each tickets as ticket}
					<div class="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div class="space-y-1.5 min-w-0">
							<div class="flex items-center gap-2.5 flex-wrap">
								<span class="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
									{ticket.id}
								</span>
								<span class="text-xs font-bold px-2 py-0.5 rounded-full {ticket.status === 'সমাধান হয়েছে'
									? 'bg-emerald-50 text-emerald-700'
									: ticket.status === 'ইন প্রগ্রেস'
										? 'bg-amber-50 text-amber-700'
										: 'bg-indigo-50 text-indigo-700'}">
									{ticket.status}
								</span>
								<span class="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
									{ticket.priority}
								</span>
								<span class="text-xs text-slate-400">
									{ticket.category}
								</span>
							</div>

							<h4 class="font-bold text-slate-900 text-sm sm:text-base">{ticket.subject}</h4>
							<p class="text-xs text-slate-400">তৈরি: {ticket.createdAt} • শেষ আপডেট: {ticket.updatedAt}</p>
						</div>

						<div class="flex items-center gap-2 shrink-0">
							<button
								type="button"
								onclick={() => (isLiveChatOpen = true)}
								class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
							>
								চ্যাট দেখুন
							</button>
						</div>
					</div>
				{/each}
			</div>

		</div>
	{/if}

</div>

<!-- ============================================== -->
<!-- MODAL 1: LIVE CHAT WINDOW WITH AGENT ASIF      -->
<!-- ============================================== -->
<Dialog bind:open={isLiveChatOpen} title="AURA ইনস্ট্যান্ট লাইভ সাপোর্ট সেশন">
	<div class="space-y-4 py-1">
		
		<!-- Agent Header Card -->
		<div class="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="relative">
					<img
						src={teamMembers[0].avatar}
						alt="Asif"
						class="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-2xs"
					/>
					<span class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
				</div>
				<div>
					<div class="font-bold text-slate-900 text-sm">Asif</div>
					<div class="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
						<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
						<span>লাইভ সাপোর্ট স্পেশালিস্ট (একটিভ)</span>
					</div>
				</div>
			</div>
			
			<div class="text-right">
				<span class="text-[10px] font-mono text-slate-400">গড় রেসপন্স: &lt; ১ মিনিট</span>
			</div>
		</div>

		<!-- Chat Log Window -->
		<div class="h-64 overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
			{#each chatMessages as msg}
				<div class="flex flex-col {msg.sender === 'user' ? 'items-end' : 'items-start'}">
					<span class="text-[10px] text-slate-400 mb-0.5">{msg.name} • {msg.time}</span>
					<div class="max-w-[80%] p-3 rounded-2xl leading-relaxed {msg.sender === 'user'
						? 'bg-[#5845eb] text-white rounded-br-xs font-medium'
						: 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs font-normal shadow-2xs'}">
						{msg.text}
					</div>
				</div>
			{/each}

			{#if isAgentTyping}
				<div class="flex items-center gap-1 text-[11px] text-slate-400 animate-pulse pl-2">
					<span class="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
					<span class="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 0.2s"></span>
					<span class="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 0.4s"></span>
					<span class="ml-1">Asif টাইপ করছেন...</span>
				</div>
			{/if}
		</div>

		<!-- Message Input Form -->
		<form onsubmit={sendLiveMessage} class="flex items-center gap-2">
			<input
				type="text"
				placeholder="আপনার বার্তা বা প্রশ্ন লিখুন..."
				bind:value={newChatMessage}
				class="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5845eb] shadow-2xs"
			/>
			<button
				type="submit"
				class="px-4 py-2.5 rounded-2xl bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
			>
				<Send class="w-3.5 h-3.5" />
				<span>পাঠান</span>
			</button>
		</form>

	</div>
</Dialog>

<!-- ============================================== -->
<!-- MODAL 2: CREATE TICKET MODAL                   -->
<!-- ============================================== -->
<Dialog bind:open={isCreateTicketOpen} title="নতুন সাপোর্ট টিকেট তৈরি করুন">
	<form onsubmit={handleCreateTicket} class="space-y-4 py-1">
		
		<div class="space-y-1.5">
			<label for="ticket-subject" class="text-xs font-bold text-slate-700">টিকেটের বিষয় / শিরোনাম *</label>
			<input
				id="ticket-subject"
				type="text"
				required
				placeholder="উদাঃ Steadfast কুরিয়ার ট্র্যাকিং আপডেট হচ্ছে না"
				bind:value={ticketSubject}
				class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
			/>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div class="space-y-1.5">
				<label for="ticket-category" class="text-xs font-bold text-slate-700">ক্যাটাগরি</label>
				<select
					id="ticket-category"
					bind:value={ticketCategory}
					class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
				>
					<option value="অর্ডার ও কুরিয়ার">অর্ডার ও কুরিয়ার</option>
					<option value="পিক্সেল ও ট্র্যাকিং">পিক্সেল ও ট্র্যাকিং</option>
					<option value="পেমেন্ট গেটওয়ে">পেমেন্ট গেটওয়ে</option>
					<option value="কারিগরি সহায়তা">কারিগরি সহায়তা</option>
					<option value="বিলিং ও প্যাকেজ">বিলিং ও প্যাকেজ</option>
				</select>
			</div>

			<div class="space-y-1.5">
				<label for="ticket-priority" class="text-xs font-bold text-slate-700">জরুরিতা (Priority)</label>
				<select
					id="ticket-priority"
					bind:value={ticketPriority}
					class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
				>
					<option value="জরুরি">জরুরি (Urgent)</option>
					<option value="সাধারণ">সাধারণ (Normal)</option>
					<option value="অতি জরুরি">অতি জরুরি (Critical)</option>
				</select>
			</div>
		</div>

		<div class="space-y-1.5">
			<label for="ticket-desc" class="text-xs font-bold text-slate-700">বিস্তারিত বিবরণ</label>
			<textarea
				id="ticket-desc"
				rows="3"
				placeholder="সমস্যাটির বিস্তারিত লিখুন যেন আমরা দ্রুত সমাধান করতে পারি..."
				bind:value={ticketDescription}
				class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white"
			></textarea>
		</div>

		<div class="flex items-center justify-end gap-2 pt-2">
			<Button type="button" variant="outline" onclick={() => (isCreateTicketOpen = false)}>
				বাতিল
			</Button>
			<Button type="submit" class="bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold">
				টিকেট জমা দিন
			</Button>
		</div>

	</form>
</Dialog>

<!-- ============================================== -->
<!-- MODAL 3: SESSION RATING MODAL                  -->
<!-- ============================================== -->
<Dialog bind:open={isRatingModalOpen} title="পূর্ববর্তী সাপোর্ট সেশন রেটিং দিন">
	<div class="space-y-4 py-2 text-center">
		<p class="text-xs text-slate-600">১২ মে, ২০২৬ তারিখের সাপোর্ট সেশনটি আপনার কাছে কেমন লেগেছিল?</p>
		
		<!-- Star Rating Selection -->
		<div class="flex items-center justify-center gap-2 py-2">
			{#each [1, 2, 3, 4, 5] as star}
				<button
					type="button"
					onclick={() => (selectedRating = star)}
					class="p-1 hover:scale-125 transition-transform cursor-pointer"
				>
					<Star class="w-8 h-8 {star <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}" />
				</button>
			{/each}
		</div>

		<textarea
			rows="2"
			placeholder="আপনার মূল্যবান মন্তব্য লিখুন (ঐচ্ছিক)..."
			bind:value={ratingFeedback}
			class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb]"
		></textarea>

		<div class="flex items-center justify-end gap-2 pt-2">
			<Button type="button" variant="outline" onclick={() => (isRatingModalOpen = false)}>
				বন্ধ করুন
			</Button>
			<Button type="button" onclick={submitRating} class="bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold">
				রেটিং জমা দিন
			</Button>
		</div>
	</div>
</Dialog>

<!-- ============================================== -->
<!-- MODAL 4: SESSION HISTORY VIEW MODAL            -->
<!-- ============================================== -->
<Dialog bind:open={isSessionHistoryOpen} title="১২ মে, ২০২৬ - সাপোর্ট সেশন হিস্ট্রি">
	<div class="space-y-3 py-2 text-xs">
		<div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
			<div class="font-bold text-slate-800">এজেন্ট: Asif • সেশন সময়কাল: ৮ মিনিট</div>
			<div class="text-slate-500">বিষয়: Facebook CAPI ইভেন্ট ডুপ্লিকেশন চেক</div>
		</div>

		<div class="space-y-2 p-3 bg-white rounded-xl border border-slate-100 max-h-56 overflow-y-auto">
			<div class="p-2 bg-slate-50 rounded-lg text-slate-700">
				<strong>Asif:</strong> আপনার CAPI ইভেন্ট deduplication সফলভাবে কনফিগার করা হয়েছে।
			</div>
			<div class="p-2 bg-indigo-50 rounded-lg text-indigo-900">
				<strong>User:</strong> অসংখ্য ধন্যবাদ, এখন টেস্ট ইভেন্টে সঠিক ডেটা দেখাচ্ছে।
			</div>
		</div>

		<div class="flex justify-end pt-2">
			<Button type="button" variant="outline" onclick={() => (isSessionHistoryOpen = false)}>
				বন্ধ করুন
			</Button>
		</div>
	</div>
</Dialog>
