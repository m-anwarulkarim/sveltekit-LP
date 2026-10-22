<script lang="ts">
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
		Sparkles
	} from 'lucide-svelte';
	import { Button, Input, Card, Badge } from '#lib/components/ui';

	interface DailyTargetItem {
		id: string;
		title: string;
		startDate: string;
		endDate: string;
		targetAmount: number;
		consumedAmount: number;
		status: 'active' | 'upcoming' | 'completed';
	}

	// Form State
	let formTitle = $state('');
	let formStartDate = $state('2026-10-24');
	let formEndDate = $state('2026-10-28');
	let formTargetAmount = $state('15555555');

	// Active Targets List matching screenshot
	let targets = $state<DailyTargetItem[]>([
		{
			id: '1',
			title: 'Test',
			startDate: 'Oct 24, 2026',
			endDate: 'Oct 28, 2026',
			targetAmount: 15555555,
			consumedAmount: 0,
			status: 'upcoming'
		},
		{
			id: '2',
			title: 'Eid Mega Campaign Target',
			startDate: 'Oct 15, 2026',
			endDate: 'Oct 23, 2026',
			targetAmount: 25000000,
			consumedAmount: 18450200,
			status: 'active'
		}
	]);

	// Modal or View Progress
	let selectedProgressTarget = $state<DailyTargetItem | null>(null);
	let isProgressModalOpen = $state(false);

	// Notification Toast
	let toastMessage = $state<string | null>(null);
	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3000);
	}

	function handleCreateTarget(e: SubmitEvent) {
		e.preventDefault();
		const amount = parseFloat(formTargetAmount);
		if (isNaN(amount) || amount <= 0) {
			alert('সঠিক টার্গেট অ্যামাউন্ট লিখুন');
			return;
		}

		const newTarget: DailyTargetItem = {
			id: String(Date.now()),
			title: formTitle.trim() || 'Daily Sales Target',
			startDate: formStartDate,
			endDate: formEndDate,
			targetAmount: amount,
			consumedAmount: 0,
			status: 'upcoming'
		};

		targets = [newTarget, ...targets];
		formTitle = '';
		formTargetAmount = '';
		showToast(`নতুন টার্গেট "${newTarget.title}" সফলভাবে তৈরি হয়েছে!`);
	}

	function handleDelete(id: string) {
		const target = targets.find((t) => t.id === id);
		if (target && confirm(`আপনি কি নিশ্চিত যে "${target.title}" টার্গেটটি মুছে ফেলতে চান?`)) {
			targets = targets.filter((t) => t.id !== id);
			showToast('টার্গেটটি সফলভাবে মুছে ফেলা হয়েছে।');
		}
	}

	function openProgress(target: DailyTargetItem) {
		selectedProgressTarget = target;
		isProgressModalOpen = true;
	}
</script>

<svelte:head>
	<title>Daily Target | AURA Enterprise</title>
</svelte:head>

<div class="space-y-8 max-w-6xl mx-auto pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Toast Message -->
	{#if toastMessage}
		<div class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
			<CheckCircle2 class="w-4 h-4 text-emerald-400" />
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Page Heading -->
	<div>
		<h2 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
			<span>Daily Target</span>
			<span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#5845eb] border border-indigo-200 font-bold">
				Revenue Goals
			</span>
		</h2>
		<p class="text-xs text-slate-500 mt-0.5">
			নির্দিষ্ট সময়সীমার বিক্রয় লক্ষ্যমাত্রা নির্ধারণ এবং প্রতিদিনের বিক্রয় অগ্রগতি পর্যবেক্ষণ করুন
		</p>
	</div>

	<!-- Form Card: Create Target (Exact match with reference screenshot) -->
	<div class="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-2xs space-y-5">
		<h3 class="text-base font-bold text-slate-900">
			Set New Daily Target
		</h3>

		<form onsubmit={handleCreateTarget} class="space-y-4">
			<!-- 4 Form Inputs in a Row / Grid -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
				<!-- 1. Title (optional) -->
				<div>
					<label for="target-title" class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
						Title (optional)
					</label>
					<Input
						id="target-title"
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
			{#if targets.length === 0}
				<div class="bg-white rounded-2xl border border-slate-200/90 p-8 text-center text-slate-400 text-xs shadow-2xs">
					কোন সক্রিয় লক্ষ্যমাত্রা নেই। উপরের ফর্ম দিয়ে নতুন টার্গেট তৈরি করুন।
				</div>
			{:else}
				{#each targets as target}
					{@const remaining = Math.max(0, target.targetAmount - target.consumedAmount)}
					{@const percent = Math.min(100, Math.round((target.consumedAmount / target.targetAmount) * 100))}

					<!-- Target Item Card (Matching Screenshot) -->
					<div class="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-7 shadow-2xs hover:shadow-md transition-all space-y-4">
						<div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
							<!-- Left Column: Title, Dates, Status, Actions -->
							<div class="space-y-1.5">
								<h4 class="text-base font-bold text-slate-900 leading-tight">
									{target.title}
								</h4>
								<div class="text-xs text-slate-500 font-medium">
									{target.startDate} - {target.endDate}
								</div>
								<div class="text-xs text-slate-500">
									Status: <span class="font-medium {target.status === 'active' ? 'text-emerald-600 font-bold' : 'text-slate-700'}">dailyTarget.status.{target.status}</span>
								</div>

								<!-- Action Links Row -->
								<div class="flex items-center gap-4 text-xs font-semibold pt-2">
									<button
										type="button"
										onclick={() => openProgress(target)}
										class="text-[#5845eb] hover:underline cursor-pointer font-bold"
									>
										View Daily Progress
									</button>
									<button
										type="button"
										onclick={() => alert(`টার্গেট এডিট: ${target.title}`)}
										class="text-sky-600 hover:underline cursor-pointer"
									>
										Edit
									</button>
									<button
										type="button"
										onclick={() => handleDelete(target.id)}
										class="text-rose-600 hover:underline cursor-pointer"
									>
										Delete
									</button>
								</div>
							</div>

							<!-- Right Column: Target, Consumed, Remaining -->
							<div class="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 min-w-[240px] text-xs space-y-1 text-right">
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
								<div class="flex items-center justify-between text-slate-500 pt-0.5 border-t border-slate-200/80">
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
									class="h-full rounded-full bg-gradient-to-r from-[#5845eb] to-indigo-400 transition-all duration-500"
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

<!-- Daily Progress Modal Dialog -->
{#if isProgressModalOpen && selectedProgressTarget}
	<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-150">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-slate-100 pb-4">
				<div class="flex items-center gap-2.5">
					<div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-[#5845eb] flex items-center justify-center">
						<TrendingUp class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900">{selectedProgressTarget.title}</h3>
						<p class="text-xs text-slate-400">{selectedProgressTarget.startDate} — {selectedProgressTarget.endDate}</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (isProgressModalOpen = false)}
					class="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
				>
					✕
				</button>
			</div>

			<!-- Daily Breakdown -->
			<div class="space-y-3">
				<div class="grid grid-cols-3 gap-2.5 text-center">
					<div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
						<span class="text-[10px] uppercase font-bold text-slate-400">Target</span>
						<p class="text-sm font-black text-slate-900 mt-0.5">৳ {selectedProgressTarget.targetAmount.toLocaleString()}</p>
					</div>
					<div class="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
						<span class="text-[10px] uppercase font-bold text-indigo-500">Achieved</span>
						<p class="text-sm font-black text-indigo-700 mt-0.5">৳ {selectedProgressTarget.consumedAmount.toLocaleString()}</p>
					</div>
					<div class="p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
						<span class="text-[10px] uppercase font-bold text-amber-600">Remaining</span>
						<p class="text-sm font-black text-amber-700 mt-0.5">৳ {(selectedProgressTarget.targetAmount - selectedProgressTarget.consumedAmount).toLocaleString()}</p>
					</div>
				</div>

				<div class="pt-2 text-xs text-slate-500 space-y-2">
					<div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
						<span>Day 1 (Oct 24)</span>
						<span class="font-bold text-slate-800">৳ 0</span>
					</div>
					<div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
						<span>Day 2 (Oct 25)</span>
						<span class="font-bold text-slate-800">৳ 0</span>
					</div>
					<div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
						<span>Day 3 (Oct 26)</span>
						<span class="font-bold text-slate-800">৳ 0</span>
					</div>
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
