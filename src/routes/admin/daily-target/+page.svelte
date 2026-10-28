<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Target,
		Calendar,
		Plus,
		TrendingUp,
		Trash2,
		Edit3,
		ChevronRight,
		CheckCircle2,
		Clock,
		AlertCircle,
		Sparkles,
		X,
		Check,
		DollarSign,
		Percent,
		Flame
	} from 'lucide-svelte';
	import { Button, Input } from '#lib/components/ui';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Local Form State for New Target
	const todayStr = new Date().toISOString().split('T')[0];
	const nextWeekDate = new Date();
	nextWeekDate.setDate(nextWeekDate.getDate() + 7);
	const nextWeekStr = nextWeekDate.toISOString().split('T')[0];

	let formTitle = $state('');
	let formStartDate = $state(todayStr);
	let formEndDate = $state(nextWeekStr);
	let formTargetAmount = $state('1500000');

	// Edit Modal State
	interface TargetItem {
		id: string;
		title: string;
		startDate: string;
		endDate: string;
		targetAmount: number;
		consumedAmount: number;
		status: 'active' | 'upcoming' | 'completed';
	}

	let editTargetData = $state<TargetItem | null>(null);
	let selectedProgressTarget = $state<TargetItem | null>(null);
	let isProgressModalOpen = $state(false);
	let deleteTargetItem = $state<TargetItem | null>(null);

	// Notification Toast
	let toastMessage = $state<string | null>(null);
	let toastType = $state<'success' | 'error'>('success');

	$effect(() => {
		if (form?.message) {
			toastMessage = form.message;
			toastType = form.success ? 'success' : 'error';
			const timer = setTimeout(() => {
				toastMessage = null;
			}, 3500);
			return () => clearTimeout(timer);
		}
	});

	function showToast(msg: string, type: 'success' | 'error' = 'success') {
		toastMessage = msg;
		toastType = type;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3500);
	}

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

	function getDailyBreakdown(target: TargetItem) {
		const days: { label: string; date: string; amount: number }[] = [];
		const start = new Date(target.startDate);
		const end = new Date(target.endDate);

		if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
			return days;
		}

		let curr = new Date(start);
		let dayIndex = 1;
		const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
		const avgDaily = target.consumedAmount > 0 ? Math.round(target.consumedAmount / totalDays) : 0;

		while (curr <= end && dayIndex <= 15) {
			const dateFmt = curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			days.push({
				label: `Day ${dayIndex} (${dateFmt})`,
				date: curr.toISOString().split('T')[0],
				amount: target.consumedAmount > 0 ? (dayIndex === 1 ? Math.round(avgDaily * 1.2) : avgDaily) : 0
			});
			curr.setDate(curr.getDate() + 1);
			dayIndex++;
		}
		return days;
	}

	function openProgress(target: TargetItem) {
		selectedProgressTarget = target;
		isProgressModalOpen = true;
	}

	function openEdit(target: TargetItem) {
		editTargetData = { ...target };
	}
</script>

<svelte:head>
	<title>Daily Target | AURA Enterprise Control Deck</title>
</svelte:head>

<div class="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
	<!-- Toast Notification -->
	{#if toastMessage}
		<div
			class="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold transition-all transform animate-in fade-in slide-in-from-bottom-2 {toastType ===
			'success'
				? 'bg-slate-900 text-white border border-slate-700'
				: 'bg-rose-600 text-white'}"
		>
			{#if toastType === 'success'}
				<CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
			{:else}
				<AlertCircle class="w-4 h-4 text-amber-300 shrink-0" />
			{/if}
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Page Heading -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
				<Target class="w-6 h-6 text-[#635BFF]" />
				<span>Daily Target</span>
				<span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#5845eb] border border-indigo-200 font-bold">
					Revenue Goals
				</span>
			</h2>
			<p class="text-xs text-slate-500 mt-1">
				নির্দিষ্ট সময়সীমার বিক্রয় লক্ষ্যমাত্রা নির্ধারণ এবং প্রতিদিনের বিক্রয় অগ্রগতি পর্যবেক্ষণ করুন
			</p>
		</div>

		<div class="flex items-center gap-2">
			<span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#5845eb] border border-indigo-200">
				{data.summary?.activeTargets ?? 0} টি সক্রিয় ক্যাম্পেইন
			</span>
		</div>
	</div>

	<!-- Top Summary Metric Cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<!-- 1. Total Goals -->
		<div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
			<div>
				<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট টার্গেট</p>
				<h3 class="text-2xl font-black text-slate-900 mt-1 font-['Outfit']">{data.summary?.totalTargets ?? 0} টি</h3>
				<span class="text-[11px] text-slate-500 font-medium mt-0.5 inline-block">সর্বমোট ক্যাম্পেইন</span>
			</div>
			<div class="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#635BFF]">
				<Target class="w-5 h-5" />
			</div>
		</div>

		<!-- 2. Active Targets -->
		<div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
			<div>
				<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">চলমান লক্ষ্যমাত্রা</p>
				<h3 class="text-2xl font-black text-emerald-600 mt-1 font-['Outfit']">{data.summary?.activeTargets ?? 0} টি</h3>
				<span class="text-[11px] text-emerald-700/80 font-medium mt-0.5 inline-block">লাইভ সেলস ট্র্যাকিং</span>
			</div>
			<div class="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
				<Flame class="w-5 h-5" />
			</div>
		</div>

		<!-- 3. Consumed Revenue -->
		<div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
			<div>
				<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">অর্জিত বিক্রয়</p>
				<h3 class="text-xl font-black text-slate-900 mt-1 font-['Outfit']">{formatTaka(data.summary?.totalConsumedAmount ?? 0)}</h3>
				<span class="text-[11px] text-indigo-600 font-semibold mt-0.5 inline-block">{data.summary?.overallPercent ?? 0}% লক্ষ্য পূরণ</span>
			</div>
			<div class="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
				<DollarSign class="w-5 h-5" />
			</div>
		</div>

		<!-- 4. Remaining Goal -->
		<div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
			<div>
				<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">বাকি বিক্রয় লক্ষ্য</p>
				<h3 class="text-xl font-black text-amber-600 mt-1 font-['Outfit']">{formatTaka(data.summary?.remainingAmount ?? 0)}</h3>
				<span class="text-[11px] text-amber-700/80 font-medium mt-0.5 inline-block">টার্গেট পূরণ অবশিষ্ট</span>
			</div>
			<div class="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
				<TrendingUp class="w-5 h-5" />
			</div>
		</div>
	</div>

	<!-- Form Card: Create Target (Exact match with reference screenshot) -->
	<div class="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-2xs space-y-5">
		<h3 class="text-base font-bold text-slate-900">
			Set New Daily Target
		</h3>

		<form
			method="POST"
			action="?/createTarget"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					formTitle = '';
				};
			}}
			class="space-y-4"
		>
			<!-- 4 Form Inputs in a Row / Grid -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
				<!-- 1. Title (optional) -->
				<div>
					<label for="target-title" class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
						Title (optional)
					</label>
					<Input
						id="target-title"
						name="title"
						type="text"
						placeholder="Title (optional)"
						bind:value={formTitle}
						class="bg-slate-50/70 border-slate-200 text-xs font-medium placeholder:text-slate-400"
					/>
				</div>

				<!-- 2. Start date* -->
				<div>
					<label for="target-start-date" class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
						Start date*
					</label>
					<div class="relative">
						<Input
							id="target-start-date"
							name="startDate"
							type="date"
							required
							bind:value={formStartDate}
							class="bg-slate-50/70 border-slate-200 text-xs font-medium text-slate-800 pr-10"
						/>
						<Calendar class="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
					</div>
				</div>

				<!-- 3. End date* -->
				<div>
					<label for="target-end-date" class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
						End date*
					</label>
					<div class="relative">
						<Input
							id="target-end-date"
							name="endDate"
							type="date"
							required
							bind:value={formEndDate}
							class="bg-slate-50/70 border-slate-200 text-xs font-medium text-slate-800 pr-10"
						/>
						<Calendar class="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
					</div>
				</div>

				<!-- 4. Target amount* -->
				<div>
					<label for="target-amount" class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
						Target amount*
					</label>
					<Input
						id="target-amount"
						name="targetAmount"
						type="number"
						required
						placeholder="Target amount*"
						bind:value={formTargetAmount}
						class="bg-slate-50/70 border-slate-200 text-xs font-medium placeholder:text-slate-400"
					/>
				</div>
			</div>

			<!-- Submit Button: Create Target (Purple) -->
			<div class="pt-2">
				<Button
					type="submit"
					variant="default"
					size="sm"
					class="bg-[#635BFF] hover:bg-[#5249e6] font-bold px-6 py-2.5 rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
				>
					Create Target
				</Button>
			</div>
		</form>
	</div>

	<!-- Section: Existing Targets (Exact match with reference screenshot) -->
	<div class="space-y-4">
		<h3 class="text-base font-bold text-slate-900">
			Existing Targets
		</h3>

		<div class="space-y-4">
			{#if (data.targets || []).length === 0}
				<div class="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-400 text-xs shadow-2xs">
					<Target class="w-8 h-8 mx-auto mb-2 text-slate-300" />
					<p class="font-bold text-slate-600">কোন সক্রিয় লক্ষ্যমাত্রা নেই।</p>
					<p class="text-[11px] text-slate-400 mt-1">উপরের ফর্ম ব্যবহার করে নতুন লক্ষ্যমাত্রা তৈরি করুন।</p>
				</div>
			{:else}
				{#each data.targets || [] as target (target.id)}
					{@const remaining = Math.max(0, target.targetAmount - target.consumedAmount)}
					{@const percent = Math.min(100, Math.round((target.consumedAmount / target.targetAmount) * 100))}

					<!-- Target Item Card (Matching Screenshot) -->
					<div class="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-7 shadow-2xs hover:shadow-md transition-all space-y-4">
						<div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
							<!-- Left Column: Title, Dates, Status, Actions -->
							<div class="space-y-1.5 flex-1">
								<h4 class="text-base font-bold text-slate-900 leading-tight">
									{target.title}
								</h4>
								<div class="text-xs text-slate-500 font-medium">
									{formatDisplayDate(target.startDate)} - {formatDisplayDate(target.endDate)}
								</div>
								<div class="text-xs text-slate-500 flex items-center gap-1.5">
									<span>Status:</span>
									{#if target.status === 'active'}
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
											<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
											চলমান (Active)
										</span>
									{:else if target.status === 'upcoming'}
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
											<Clock class="w-3 h-3" />
											আসন্ন (Upcoming)
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
											<CheckCircle2 class="w-3 h-3 text-slate-500" />
											সম্পন্ন (Completed)
										</span>
									{/if}
								</div>

								<!-- Action Links Row -->
								<div class="flex items-center gap-4 text-xs font-semibold pt-2">
									<button
										type="button"
										onclick={() => openProgress(target)}
										class="text-[#635BFF] hover:underline cursor-pointer font-bold"
									>
										View Daily Progress
									</button>
									<button
										type="button"
										onclick={() => openEdit(target)}
										class="text-sky-600 hover:underline cursor-pointer font-medium"
									>
										Edit
									</button>
									<button
										type="button"
										onclick={() => (deleteTargetItem = target)}
										class="text-rose-600 hover:underline cursor-pointer font-medium"
									>
										Delete
									</button>
								</div>
							</div>

							<!-- Right Column: Target, Consumed, Remaining -->
							<div class="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 min-w-[240px] text-xs space-y-1.5 text-right shrink-0">
								<div class="flex items-center justify-between text-slate-500">
									<span>Target:</span>
									<span class="font-bold text-slate-900 font-mono text-sm">
										{target.targetAmount.toLocaleString()}
									</span>
								</div>
								<div class="flex items-center justify-between text-slate-500">
									<span>Consumed:</span>
									<span class="font-bold text-sky-600 font-mono text-sm">
										{target.consumedAmount.toLocaleString()}
									</span>
								</div>
								<div class="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/80">
									<span class="font-bold text-amber-700">Remaining:</span>
									<span class="font-bold text-amber-600 font-mono text-sm">
										{remaining.toLocaleString()}
									</span>
								</div>
							</div>
						</div>

						<!-- Progress Bar Strip -->
						<div class="space-y-1 pt-1">
							<div class="flex items-center justify-between text-[11px] font-bold text-slate-500">
								<span>অগ্রগতি অর্জন: {percent}%</span>
								<span>অবশিষ্ট: ৳ {remaining.toLocaleString()}</span>
							</div>
							<div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
								<div
									class="h-full rounded-full bg-gradient-to-r from-[#635BFF] to-indigo-400 transition-all duration-500"
									style="width: {percent}%"
								></div>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<!-- Edit Target Modal Dialog -->
{#if editTargetData}
	<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-150">
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
				<button
					type="button"
					onclick={() => (editTargetData = null)}
					class="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
				>
					<X class="w-5 h-5" />
				</button>
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
					<label for="edit-title" class="block text-xs font-bold text-slate-700 mb-1">টার্গেটের নাম</label>
					<Input
						id="edit-title"
						name="title"
						type="text"
						bind:value={editTargetData.title}
						class="text-xs"
						required
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="edit-start" class="block text-xs font-bold text-slate-700 mb-1">শুরুর তারিখ</label>
						<Input
							id="edit-start"
							name="startDate"
							type="date"
							bind:value={editTargetData.startDate}
							class="text-xs"
							required
						/>
					</div>
					<div>
						<label for="edit-end" class="block text-xs font-bold text-slate-700 mb-1">সমাপ্তির তারিখ</label>
						<Input
							id="edit-end"
							name="endDate"
							type="date"
							bind:value={editTargetData.endDate}
							class="text-xs"
							required
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="edit-amount" class="block text-xs font-bold text-slate-700 mb-1">টার্গেট অ্যামাউন্ট (৳)</label>
						<Input
							id="edit-amount"
							name="targetAmount"
							type="number"
							bind:value={editTargetData.targetAmount}
							class="text-xs"
							required
						/>
					</div>
					<div>
						<label for="edit-status" class="block text-xs font-bold text-slate-700 mb-1">স্ট্যাটাস</label>
						<select
							id="edit-status"
							name="status"
							bind:value={editTargetData.status}
							class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF] focus:outline-none"
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
					>
						বাতিল
					</Button>
					<Button
						type="submit"
						size="sm"
						class="bg-[#635BFF] hover:bg-[#5249e6] text-white font-bold"
					>
						সংরক্ষণ করুন
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Daily Progress Modal Dialog -->
{#if isProgressModalOpen && selectedProgressTarget}
	<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-150">
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
				<button
					type="button"
					onclick={() => (isProgressModalOpen = false)}
					class="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Daily Breakdown -->
			<div class="space-y-3">
				<div class="grid grid-cols-3 gap-2.5 text-center">
					<div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
						<span class="text-[10px] uppercase font-bold text-slate-400">Target</span>
						<p class="text-sm font-black text-slate-900 mt-0.5">{formatTaka(selectedProgressTarget.targetAmount)}</p>
					</div>
					<div class="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
						<span class="text-[10px] uppercase font-bold text-indigo-500">Achieved</span>
						<p class="text-sm font-black text-indigo-700 mt-0.5">{formatTaka(selectedProgressTarget.consumedAmount)}</p>
					</div>
					<div class="p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
						<span class="text-[10px] uppercase font-bold text-amber-600">Remaining</span>
						<p class="text-sm font-black text-amber-700 mt-0.5">
							{formatTaka(Math.max(0, selectedProgressTarget.targetAmount - selectedProgressTarget.consumedAmount))}
						</p>
					</div>
				</div>

				<div class="pt-2 text-xs text-slate-500 space-y-2 max-h-60 overflow-y-auto pr-1">
					{#each getDailyBreakdown(selectedProgressTarget) as day}
						<div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
							<span class="font-medium text-slate-700">{day.label}</span>
							<span class="font-bold text-slate-900 font-mono">{formatTaka(day.amount)}</span>
						</div>
					{/each}
				</div>
			</div>

			<div class="pt-3 border-t border-slate-100 flex justify-end">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={() => (isProgressModalOpen = false)}
				>
					Close
				</Button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if deleteTargetItem}
	<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-150 text-center">
			<div class="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
				<Trash2 class="w-6 h-6" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">টার্গেট মুছে ফেলতে চান?</h3>
				<p class="text-xs text-slate-500 mt-1">
					"{deleteTargetItem.title}" টার্গেটটি স্থায়ীভাবে মুছে ফেলা হবে।
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
				>
					বাতিল
				</Button>
				<Button
					type="submit"
					size="sm"
					class="bg-rose-600 hover:bg-rose-700 text-white font-bold"
				>
					হ্যাঁ, মুছে ফেলুন
				</Button>
			</form>
		</div>
	</div>
{/if}
