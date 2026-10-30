<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Target,
		Calendar,
		TrendingUp,
		Trash2,
		Edit3,
		CheckCircle2,
		Clock,
		Flame,
		DollarSign,
		ShoppingBag,
		BarChart3,
		RefreshCw,
		AlertCircle,
		X
	} from 'lucide-svelte';
	import {
		Button,
		Input,
		Badge,
		Card,
		Progress,
		Table,
		TableHeader,
		TableRow,
		TableHead,
		TableBody,
		TableCell
	} from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import type { PageData, ActionData } from './$types';
	import type { TargetViewItem, DailyBreakdownItem } from '#lib/server/services/daily-target.service';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Local Form State for New Target
	const today = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

	const nextWeek = new Date(today);
	nextWeek.setDate(nextWeek.getDate() + 7);
	const nextWeekStr = `${nextWeek.getFullYear()}-${pad(nextWeek.getMonth() + 1)}-${pad(nextWeek.getDate())}`;

	let formTitle = $state('');
	let formStartDate = $state(todayStr);
	let formEndDate = $state(nextWeekStr);
	let formTargetAmount = $state('500000');
	let isSubmitting = $state(false);

	// Modals State
	let editTargetData = $state<TargetViewItem | null>(null);
	let selectedProgressTarget = $state<TargetViewItem | null>(null);
	let isProgressModalOpen = $state(false);
	let deleteTargetItem = $state<TargetViewItem | null>(null);

	// Real Breakdown State
	let breakdownDays = $state<DailyBreakdownItem[]>([]);
	let isLoadingBreakdown = $state(false);

	// Reactive Toast Notifications
	$effect(() => {
		if (form?.message) {
			if (form.success) {
				toast.success(form.message);
			} else {
				toast.error(form.message);
			}
		}
	});

	function formatTaka(amount: number) {
		return '৳ ' + (amount || 0).toLocaleString('en-US');
	}

	function formatDisplayDate(dateStr: string): string {
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
		} catch {
			return dateStr;
		}
	}

	async function openProgress(target: TargetViewItem) {
		selectedProgressTarget = target;
		isProgressModalOpen = true;
		isLoadingBreakdown = true;
		breakdownDays = [];

		try {
			const res = await fetch(
				`/api/admin/daily-target/breakdown?startDate=${target.startDate}&endDate=${target.endDate}`
			);
			const resData = await res.json();
			if (resData.success && Array.isArray(resData.days)) {
				breakdownDays = resData.days;
			}
		} catch (e) {
			console.error('Failed to load breakdown:', e);
			toast.error('দিনভিত্তিক সেলস লোড করতে সমস্যা হয়েছে!');
		} finally {
			isLoadingBreakdown = false;
		}
	}

	function openEdit(target: TargetViewItem) {
		editTargetData = { ...target };
	}
</script>

<svelte:head>
	<title>Daily Sales Target | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
	<!-- Page Heading -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
				<Target class="w-6 h-6 text-[#635BFF]" />
				<span>দৈনিক ও সাপ্তাহিক সেলস টার্গেট (Daily Target)</span>
			</h2>
			<p class="text-xs text-slate-500 mt-1">
				লাইভ অর্ডারের সাথে স্বয়ংক্রিয়ভাবে সিঙ্ক হওয়া বিক্রয় লক্ষ্যমাত্রা ও অগ্রগতি পর্যবেক্ষণ হাব
			</p>
		</div>

		<div class="flex items-center gap-2">
			<Badge variant="outline" class="px-3 py-1 text-xs font-bold bg-indigo-50/70 text-[#5845eb] border-indigo-200">
				{data.summary?.activeTargets ?? 0} টি সক্রিয় ক্যাম্পেইন
			</Badge>
		</div>
	</div>

	<!-- Top Summary Metric Cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- 1. Total Goals -->
		<Card class="p-5 rounded-3xl border-slate-200/90 shadow-2xs flex items-center justify-between bg-white">
			<div>
				<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট লক্ষ্যমাত্রা</p>
				<h3 class="text-2xl font-black text-slate-900 mt-1 font-['Outfit']">
					{data.summary?.totalTargets ?? 0} টি
				</h3>
				<span class="text-[11px] text-slate-500 font-medium mt-0.5 inline-block">সর্বমোট ক্যাম্পেইন</span>
			</div>
			<div class="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#635BFF]">
				<Target class="w-5 h-5" />
			</div>
		</Card>

		<!-- 2. Active Targets -->
		<Card class="p-5 rounded-3xl border-slate-200/90 shadow-2xs flex items-center justify-between bg-white">
			<div>
				<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">সক্রিয় ক্যাম্পেইন</p>
				<h3 class="text-2xl font-black text-emerald-600 mt-1 font-['Outfit']">
					{data.summary?.activeTargets ?? 0} টি
				</h3>
				<span class="text-[11px] text-emerald-700/80 font-medium mt-0.5 inline-block">লাইভ সেলস সিঙ্ক</span>
			</div>
			<div class="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
				<Flame class="w-5 h-5" />
			</div>
		</Card>

		<!-- 3. Consumed Revenue -->
		<Card class="p-5 rounded-3xl border-slate-200/90 shadow-2xs flex items-center justify-between bg-white">
			<div>
				<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">অর্জিত বিক্রয়</p>
				<h3 class="text-xl font-black text-slate-900 mt-1 font-['Outfit']">
					{formatTaka(data.summary?.totalConsumedAmount ?? 0)}
				</h3>
				<span class="text-[11px] text-indigo-600 font-semibold mt-0.5 inline-block">
					{data.summary?.overallPercent ?? 0}% লক্ষ্য পূরণ
				</span>
			</div>
			<div class="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
				<DollarSign class="w-5 h-5" />
			</div>
		</Card>

		<!-- 4. Remaining Goal & Orders -->
		<Card class="p-5 rounded-3xl border-slate-200/90 shadow-2xs flex items-center justify-between bg-white">
			<div>
				<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">বাকি বিক্রয় লক্ষ্য</p>
				<h3 class="text-xl font-black text-amber-600 mt-1 font-['Outfit']">
					{formatTaka(data.summary?.remainingAmount ?? 0)}
				</h3>
				<span class="text-[11px] text-slate-500 font-medium mt-0.5 inline-block">
					মোট {data.summary?.totalOrdersAchieved ?? 0} টি সফল অর্ডার
				</span>
			</div>
			<div class="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
				<TrendingUp class="w-5 h-5" />
			</div>
		</Card>
	</div>

	<!-- Form Card: Create Target -->
	<Card class="rounded-3xl border-slate-200/90 p-6 md:p-8 shadow-2xs space-y-5 bg-white">
		<div class="flex items-center justify-between">
			<h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
				<Target class="w-4 h-4 text-[#635BFF]" />
				<span>নতুন লক্ষ্যমাত্রা নির্ধারণ করুন (Set Target)</span>
			</h3>
			<span class="text-[11px] text-slate-400 font-medium">তারিখ অনুযায়ী স্বয়ংক্রিয় সেলস ক্যালকুলেট হবে</span>
		</div>

		<form
			method="POST"
			action="?/createTarget"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
					formTitle = '';
				};
			}}
			class="space-y-4"
		>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<!-- 1. Title -->
				<div>
					<label for="target-title" class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
						টার্গেটের নাম (ঐচ্ছিক)
					</label>
					<Input
						id="target-title"
						name="title"
						type="text"
						placeholder="যেমন: উইকএন্ড সেলস লক্ষ্য"
						bind:value={formTitle}
						class="bg-slate-50/70 border-slate-200 text-xs font-medium placeholder:text-slate-400 h-10 rounded-xl"
					/>
				</div>

				<!-- 2. Start date* -->
				<div>
					<label for="target-start-date" class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
						শুরুর তারিখ *
					</label>
					<div class="relative">
						<Input
							id="target-start-date"
							name="startDate"
							type="date"
							required
							bind:value={formStartDate}
							class="bg-slate-50/70 border-slate-200 text-xs font-medium text-slate-800 pr-10 h-10 rounded-xl"
						/>
						<Calendar class="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
					</div>
				</div>

				<!-- 3. End date* -->
				<div>
					<label for="target-end-date" class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
						সমাপ্তির তারিখ *
					</label>
					<div class="relative">
						<Input
							id="target-end-date"
							name="endDate"
							type="date"
							required
							bind:value={formEndDate}
							class="bg-slate-50/70 border-slate-200 text-xs font-medium text-slate-800 pr-10 h-10 rounded-xl"
						/>
						<Calendar class="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
					</div>
				</div>

				<!-- 4. Target amount* -->
				<div>
					<label for="target-amount" class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
						টার্গেট অ্যামাউন্ট (৳) *
					</label>
					<Input
						id="target-amount"
						name="targetAmount"
						type="number"
						required
						min="1"
						placeholder="যেমন: 500000"
						bind:value={formTargetAmount}
						class="bg-slate-50/70 border-slate-200 text-xs font-medium placeholder:text-slate-400 h-10 rounded-xl"
					/>
				</div>
			</div>

			<!-- Submit Button -->
			<div class="pt-2">
				<Button
					type="submit"
					disabled={isSubmitting}
					class="bg-[#635BFF] hover:bg-[#5249e6] text-white font-bold px-6 py-2.5 rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all text-xs"
				>
					{#if isSubmitting}
						<RefreshCw class="w-3.5 h-3.5 mr-2 animate-spin" />
						তৈরি হচ্ছে...
					{:else}
						নতুন টার্গেট সেট করুন
					{/if}
				</Button>
			</div>
		</form>
	</Card>

	<!-- Section: Existing Targets -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-base font-bold text-slate-900">
				নির্ধারিত লক্ষ্যমাত্রাসমূহ ({data.targets?.length ?? 0})
			</h3>
			<span class="text-xs text-slate-400">রিয়েল-টাইম অর্ডার থেকে হালনাগাদকৃত</span>
		</div>

		<div class="space-y-4">
			{#if (data.targets || []).length === 0}
				<Card class="rounded-3xl border-slate-200/90 p-12 text-center text-slate-400 text-xs shadow-2xs bg-white">
					<Target class="w-8 h-8 mx-auto mb-2 text-slate-300" />
					<p class="font-bold text-slate-600">কোন সক্রিয় লক্ষ্যমাত্রা নেই।</p>
					<p class="text-[11px] text-slate-400 mt-1">উপরের ফর্ম ব্যবহার করে নতুন লক্ষ্যমাত্রা তৈরি করুন।</p>
				</Card>
			{:else}
				{#each data.targets || [] as target (target.id)}
					<!-- Target Item Card -->
					<Card class="rounded-3xl border-slate-200/90 p-6 md:p-7 shadow-2xs hover:shadow-md transition-all space-y-4 bg-white">
						<div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
							<!-- Left Column: Title, Dates, Status, Metrics -->
							<div class="space-y-2 flex-1">
								<div class="flex flex-wrap items-center gap-2">
									<h4 class="text-base font-bold text-slate-900 leading-tight">
										{target.title}
									</h4>
									{#if target.status === 'active'}
										<Badge variant="outline" class="gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
											<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
											চলমান (Active)
										</Badge>
									{:else if target.status === 'upcoming'}
										<Badge variant="outline" class="gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-indigo-50 text-indigo-700 border-indigo-200">
											<Clock class="w-3 h-3" />
											আসন্ন (Upcoming)
										</Badge>
									{:else}
										<Badge variant="outline" class="gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-700 border-slate-200">
											<CheckCircle2 class="w-3 h-3 text-slate-500" />
											সম্পন্ন (Completed)
										</Badge>
									{/if}
								</div>

								<div class="text-xs text-slate-500 font-medium flex items-center gap-1.5">
									<Calendar class="w-3.5 h-3.5 text-slate-400" />
									<span>{formatDisplayDate(target.startDate)}</span>
									<span>—</span>
									<span>{formatDisplayDate(target.endDate)}</span>
								</div>

								<!-- Live Insights Pill -->
								<div class="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
									<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/80 font-medium">
										<ShoppingBag class="w-3 h-3 text-slate-500" />
										<span>{target.ordersCount} টি কনফার্মড অর্ডার</span>
									</span>
									{#if target.aov > 0}
										<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/80 font-medium">
											<span>গড় বাস্কেট (AOV): {formatTaka(target.aov)}</span>
										</span>
									{/if}
									{#if target.status === 'active' && target.daysRemaining > 0 && target.remainingAmount > 0}
										<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold text-[11px]">
											<Flame class="w-3 h-3 text-amber-600" />
											<span>আর {target.daysRemaining} দিন বাকি • দৈনিক সেলস প্রয়োজন {formatTaka(target.dailyRequiredRate)}</span>
										</span>
									{/if}
								</div>

								<!-- Action Links Row -->
								<div class="flex items-center gap-4 text-xs font-semibold pt-2">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => openProgress(target)}
										class="h-auto p-0 text-[#635BFF] hover:text-[#5249e6] font-bold flex items-center gap-1"
									>
										<BarChart3 class="w-3.5 h-3.5" />
										<span>দিনভিত্তিক সেলস দেখুন</span>
									</Button>
									<span class="text-slate-300">•</span>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => openEdit(target)}
										class="h-auto p-0 text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
									>
										<Edit3 class="w-3.5 h-3.5" />
										<span>এডিট</span>
									</Button>
									<span class="text-slate-300">•</span>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => (deleteTargetItem = target)}
										class="h-auto p-0 text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
									>
										<Trash2 class="w-3.5 h-3.5" />
										<span>মুছে ফেলুন</span>
									</Button>
								</div>
							</div>

							<!-- Right Column: Target, Consumed, Remaining -->
							<div class="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 min-w-[240px] text-xs space-y-2 text-right shrink-0">
								<div class="flex items-center justify-between text-slate-500">
									<span>টার্গেট অ্যামাউন্ট:</span>
									<span class="font-bold text-slate-900 font-mono text-sm">
										{formatTaka(target.targetAmount)}
									</span>
								</div>
								<div class="flex items-center justify-between text-slate-500">
									<span>অর্জিত বিক্রয়:</span>
									<span class="font-bold text-emerald-600 font-mono text-sm">
										{formatTaka(target.consumedAmount)}
									</span>
								</div>
								<div class="flex items-center justify-between text-slate-500 pt-1.5 border-t border-slate-200/80">
									<span class="font-bold text-amber-700">টার্গেট অবশিষ্ট:</span>
									<span class="font-bold text-amber-600 font-mono text-sm">
										{formatTaka(target.remainingAmount)}
									</span>
								</div>
							</div>
						</div>

						<!-- Progress Bar Strip using shadcn-svelte Progress -->
						<div class="space-y-1.5 pt-1">
							<div class="flex items-center justify-between text-[11px] font-bold text-slate-500">
								<span>অগ্রগতি অর্জন: {target.percent}%</span>
								<span>অবশিষ্ট: {formatTaka(target.remainingAmount)}</span>
							</div>
							<Progress value={target.percent} class="h-2 bg-slate-100" />
						</div>
					</Card>
				{/each}
			{/if}
		</div>
	</div>
</div>

<!-- Edit Target Modal Dialog -->
{#if editTargetData}
	<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
		<Card class="rounded-3xl border-slate-200/90 shadow-2xl w-full max-w-lg p-6 space-y-5 bg-white animate-in zoom-in-95 duration-150">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-slate-100 pb-4">
				<div class="flex items-center gap-2.5">
					<div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-[#635BFF] flex items-center justify-center">
						<Edit3 class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900">টার্গেট সম্পাদনা করুন</h3>
						<p class="text-xs text-slate-400">বিক্রয় লক্ষ্যমাত্রা ও সময়সীমা পরিবর্তন</p>
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => (editTargetData = null)}
					class="p-2 text-slate-400 hover:text-slate-700 rounded-full"
				>
					<X class="w-5 h-5" />
				</Button>
			</div>

			<form
				method="POST"
				action="?/updateTarget"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						editTargetData = null;
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="id" value={editTargetData.id} />

				<div>
					<label for="edit-title" class="block text-xs font-bold text-slate-700 mb-1.5">টার্গেটের নাম</label>
					<Input
						id="edit-title"
						name="title"
						type="text"
						bind:value={editTargetData.title}
						class="text-xs h-10 rounded-xl"
						required
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="edit-start" class="block text-xs font-bold text-slate-700 mb-1.5">শুরুর তারিখ</label>
						<Input
							id="edit-start"
							name="startDate"
							type="date"
							bind:value={editTargetData.startDate}
							class="text-xs h-10 rounded-xl"
							required
						/>
					</div>
					<div>
						<label for="edit-end" class="block text-xs font-bold text-slate-700 mb-1.5">সমাপ্তির তারিখ</label>
						<Input
							id="edit-end"
							name="endDate"
							type="date"
							bind:value={editTargetData.endDate}
							class="text-xs h-10 rounded-xl"
							required
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="edit-amount" class="block text-xs font-bold text-slate-700 mb-1.5">টার্গেট অ্যামাউন্ট (৳)</label>
						<Input
							id="edit-amount"
							name="targetAmount"
							type="number"
							bind:value={editTargetData.targetAmount}
							class="text-xs h-10 rounded-xl"
							required
						/>
					</div>
					<div>
						<label for="edit-status" class="block text-xs font-bold text-slate-700 mb-1.5">স্ট্যাটাস</label>
						<select
							id="edit-status"
							name="status"
							bind:value={editTargetData.status}
							class="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF] focus:outline-none"
						>
							<option value="active">চলমান (Active)</option>
							<option value="upcoming">আসন্ন (Upcoming)</option>
							<option value="completed">সম্পন্ন (Completed)</option>
						</select>
					</div>
				</div>

				<div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (editTargetData = null)}
						class="rounded-xl"
					>
						বাতিল
					</Button>
					<Button
						type="submit"
						size="sm"
						class="bg-[#635BFF] hover:bg-[#5249e6] text-white font-bold rounded-xl"
					>
						সংরক্ষণ করুন
					</Button>
				</div>
			</form>
		</Card>
	</div>
{/if}

<!-- Real Daily Progress Modal Dialog -->
{#if isProgressModalOpen && selectedProgressTarget}
	<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
		<Card class="rounded-3xl border-slate-200/90 shadow-2xl w-full max-w-2xl p-6 space-y-5 bg-white animate-in zoom-in-95 duration-150">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-slate-100 pb-4">
				<div class="flex items-center gap-2.5">
					<div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-[#635BFF] flex items-center justify-center">
						<TrendingUp class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900">{selectedProgressTarget.title}</h3>
						<p class="text-xs text-slate-400">
							{formatDisplayDate(selectedProgressTarget.startDate)} — {formatDisplayDate(selectedProgressTarget.endDate)}
						</p>
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => (isProgressModalOpen = false)}
					class="p-2 text-slate-400 hover:text-slate-700 rounded-full"
				>
					<X class="w-5 h-5" />
				</Button>
			</div>

			<!-- Summary Cards in Modal -->
			<div class="grid grid-cols-3 gap-2.5 text-center">
				<div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
					<span class="text-[10px] uppercase font-bold text-slate-400">টার্গেট</span>
					<p class="text-sm font-black text-slate-900 mt-0.5">{formatTaka(selectedProgressTarget.targetAmount)}</p>
				</div>
				<div class="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
					<span class="text-[10px] uppercase font-bold text-emerald-600">অর্জিত সেলস</span>
					<p class="text-sm font-black text-emerald-700 mt-0.5">{formatTaka(selectedProgressTarget.consumedAmount)}</p>
				</div>
				<div class="p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
					<span class="text-[10px] uppercase font-bold text-amber-600">বাকি লক্ষ্য</span>
					<p class="text-sm font-black text-amber-700 mt-0.5">
						{formatTaka(selectedProgressTarget.remainingAmount)}
					</p>
				</div>
			</div>

			<!-- Real Daily Breakdown Table -->
			<div class="space-y-2">
				<div class="flex items-center justify-between text-xs">
					<span class="font-bold text-slate-800">দিনভিত্তিক সেলস ও অর্ডার বিশ্লেষণ (D1 Data):</span>
					{#if isLoadingBreakdown}
						<span class="text-indigo-600 flex items-center gap-1 font-medium">
							<RefreshCw class="w-3 h-3 animate-spin" /> ডেটা লোড হচ্ছে...
						</span>
					{/if}
				</div>

				<div class="max-h-72 overflow-y-auto rounded-2xl border border-slate-200/80">
					{#if isLoadingBreakdown}
						<div class="p-8 text-center text-xs text-slate-400 space-y-2">
							<RefreshCw class="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
							<p>ডাটাবেস থেকে দিনভিত্তিক সেলস ও অর্ডার গোনা হচ্ছে...</p>
						</div>
					{:else if breakdownDays.length === 0}
						<div class="p-8 text-center text-xs text-slate-400">
							এই সময়সীমার মধ্যে কোনো সেলস রেকর্ড পাওয়া যায়নি।
						</div>
					{:else}
						<Table>
							<TableHeader>
								<TableRow class="bg-slate-50 text-[11px] text-slate-500 font-bold">
									<TableHead>তারিখ / দিন</TableHead>
									<TableHead class="text-center">সফল অর্ডার</TableHead>
									<TableHead class="text-right">মোট বিক্রয়</TableHead>
									<TableHead class="text-right">গড় বাস্কেট (AOV)</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each breakdownDays as day}
									<TableRow class="text-xs hover:bg-slate-50/60 transition-colors">
										<TableCell class="font-semibold text-slate-800">
											{day.dayLabel}
										</TableCell>
										<TableCell class="text-center">
											{#if day.ordersCount > 0}
												<Badge variant="outline" class="font-bold text-slate-700 bg-white">
													{day.ordersCount} টি
												</Badge>
											{:else}
												<span class="text-slate-300">-</span>
											{/if}
										</TableCell>
										<TableCell class="text-right font-mono font-bold {day.salesAmount > 0 ? 'text-emerald-600' : 'text-slate-400'}">
											{formatTaka(day.salesAmount)}
										</TableCell>
										<TableCell class="text-right font-mono text-slate-600">
											{day.aov > 0 ? formatTaka(day.aov) : '-'}
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					{/if}
				</div>
			</div>

			<div class="pt-3 border-t border-slate-100 flex justify-end">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={() => (isProgressModalOpen = false)}
					class="rounded-xl text-xs"
				>
					বন্ধ করুন (Close)
				</Button>
			</div>
		</Card>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if deleteTargetItem}
	<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
		<Card class="rounded-3xl border-slate-200/90 shadow-2xl w-full max-w-sm p-6 space-y-4 bg-white animate-in zoom-in-95 duration-150 text-center">
			<div class="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
				<Trash2 class="w-6 h-6" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">টার্গেট মুছে ফেলতে চান?</h3>
				<p class="text-xs text-slate-500 mt-1">
					"{deleteTargetItem.title}" লক্ষ্যমাত্রাটি স্থায়ীভাবে মুছে ফেলা হবে।
				</p>
			</div>

			<form
				method="POST"
				action="?/deleteTarget"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						deleteTargetItem = null;
					};
				}}
				class="pt-2 flex items-center justify-center gap-2"
			>
				<input type="hidden" name="id" value={deleteTargetItem.id} />
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={() => (deleteTargetItem = null)}
					class="rounded-xl text-xs"
				>
					বাতিল
				</Button>
				<Button
					type="submit"
					size="sm"
					class="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer"
				>
					হ্যাঁ, মুছে ফেলুন
				</Button>
			</form>
		</Card>
	</div>
{/if}
