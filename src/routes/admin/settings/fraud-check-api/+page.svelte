<script lang="ts">
	import { submitAction } from '#lib/client/submit-action';
	import { toast } from 'svelte-sonner';
	import {
		ArrowLeft,
		CheckCircle2,
		Check,
		ShieldCheck,
		Eye,
		EyeOff,
		Zap,
		AlertCircle,
		RotateCw
	} from 'lucide-svelte';
	import { Button, Input, Card, Switch } from '#lib/components/ui';

	let { data } = $props();
	const saved = data.settings ?? {};

	let enableCourierFraudCheck = $state(saved.enableCourierFraudCheck ?? true);
	let returnRateThreshold = $state(saved.returnRateThreshold ?? 25);
	let autoBlockBadIps = $state(saved.autoBlockBadIps ?? false);
	let smartposBdApiKey = $state(saved.smartposBdApiKey ?? '');

	let showKey = $state(false);
	let isSaving = $state(false);
	let isTesting = $state(false);
	let testFeedback = $state<{ success: boolean; message: string } | null>(null);
	let isSaved = $state(false);

	async function handleTest() {
		if (isTesting) return;
		isTesting = true;
		testFeedback = null;
		await new Promise((r) => setTimeout(r, 700));
		if (!smartposBdApiKey.trim()) {
			testFeedback = { success: false, message: 'API Key দেওয়া নেই, সংযোগ পরীক্ষা করা সম্ভব হয়নি।' };
		} else {
			testFeedback = { success: true, message: 'API Key সেভ করা আছে। লাইভ পরীক্ষার জন্য সেটিংস সংরক্ষণ করুন।' };
		}
		isTesting = false;
	}

	async function handleSave() {
		if (isSaving) return;
		isSaving = true;
		testFeedback = null;
		const fd = new FormData();
		fd.append(
			'settings',
			JSON.stringify({ enableCourierFraudCheck, returnRateThreshold, autoBlockBadIps, smartposBdApiKey })
		);
		const res = await submitAction('?/save', fd);
		isSaving = false;
		if (!res.ok) {
			toast.error(res.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
			return;
		}
		isSaved = true;
		setTimeout(() => (isSaved = false), 3000);
		toast.success('Fraud Check সেটিংস সংরক্ষিত হয়েছে!');
	}
</script>

<svelte:head>
	<title>Fraud Check API | Admin</title>
</svelte:head>

{#if isSaved}
	<div
		class="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4"
	>
		<CheckCircle2 class="w-4 h-4" />
		<span>Fraud Check Settings Saved!</span>
	</div>
{/if}

<div class="space-y-6 max-w-2xl mx-auto p-4 sm:p-6">
	<!-- Header -->
	<div class="flex items-center justify-between gap-4 pb-2">
		<a href="/admin/settings">
			<Button variant="outline" size="sm" class="gap-2">
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</Button>
		</a>
		<Button
			type="button"
			onclick={handleSave}
			disabled={isSaving}
			class="gap-1.5 bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			{#if isSaving}
				<RotateCw class="w-4 h-4 animate-spin" />
				<span>সংরক্ষণ হচ্ছে...</span>
			{:else}
				<Check class="w-4 h-4" />
				<span>Save Settings</span>
			{/if}
		</Button>
	</div>

	<!-- Global Settings -->
	<Card class="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center gap-3 mb-4">
			<div class="w-9 h-9 rounded-full bg-[#1d6ee5] flex items-center justify-center text-white shrink-0">
				<ShieldCheck class="w-4.5 h-4.5" />
			</div>
			<div>
				<h3 class="text-sm font-bold text-slate-900">Fraud Detection সেটিংস</h3>
				<p class="text-[11px] text-slate-500">ভুয়া অর্ডার ও উচ্চ রিটার্ন রেটের গ্রাহক সনাক্তকরণের গ্লোবাল কনফিগারেশন</p>
			</div>
		</div>
		<div class="space-y-3">
			<div class="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
				<div>
					<h4 class="text-xs font-bold text-slate-900">Fraud Check সক্রিয় করুন</h4>
					<p class="text-[11px] text-slate-500 mt-0.5">নতুন অর্ডারে গ্রাহকের পূর্ববর্তী অর্ডার ইতিহাস ও রিস্ক স্কোর স্বয়ংক্রিয়ভাবে যাচাই হবে</p>
				</div>
				<Switch bind:checked={enableCourierFraudCheck} />
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">রিস্ক সতর্কতা থ্রেশহোল্ড (%)</label>
					<Input type="number" bind:value={returnRateThreshold} class="font-mono text-sm" />
					<span class="text-[10px] text-slate-400">সফল ডেলিভারি রেট এর কম হলে সতর্কবার্তা দেখাবে</span>
				</div>
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">হাই-রিস্ক আইপি অটো ব্লক</label>
					<div class="pt-2">
						<Switch bind:checked={autoBlockBadIps} />
					</div>
					<span class="text-[10px] text-slate-400">বারবার ফেক রিকোয়েস্টে অটো ব্লক হবে</span>
				</div>
			</div>
		</div>
	</Card>

	<!-- SmartPOS BD API -->
	<Card class="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-3">
				<div class="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center shrink-0">
					<ShieldCheck class="w-4.5 h-4.5 text-white" />
				</div>
				<div>
					<h3 class="text-sm font-bold text-slate-900">SmartPOS Bangladesh API</h3>
					<p class="text-[11px] text-slate-500">fraudchecker.smartposbd.com — ফোন নম্বর ফ্রড স্কোর যাচাই</p>
				</div>
			</div>
			<a
				href="https://fraudchecker.smartposbd.com/bn/api-docs"
				target="_blank"
				rel="noopener noreferrer"
				class="text-[11px] text-blue-600 hover:underline font-medium shrink-0"
			>
				API Docs →
			</a>
		</div>

		<div class="space-y-3">
			<div class="space-y-1.5">
				<label class="text-xs font-bold text-slate-700">SmartPOS API Key / Token</label>
				<div class="relative">
					<Input
						type={showKey ? 'text' : 'password'}
						bind:value={smartposBdApiKey}
						placeholder="SmartPOS ড্যাশবোর্ড থেকে API Key সংগ্রহ করুন"
						class="font-mono text-xs pr-10"
					/>
					<button
						type="button"
						onclick={() => (showKey = !showKey)}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
					>
						{#if showKey}
							<EyeOff class="w-3.5 h-3.5" />
						{:else}
							<Eye class="w-3.5 h-3.5" />
						{/if}
					</button>
				</div>
				<p class="text-[11px] text-slate-400">
					SmartPOS Bangladesh ড্যাশবোর্ড থেকে API Key তৈরি করুন। বিস্তারিত:
					<a
						href="https://fraudchecker.smartposbd.com/bn/api-docs"
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-600 hover:underline"
					>API Documentation</a>
				</p>
			</div>
		</div>

		{#if testFeedback}
			<div
				class="mt-4 p-3 rounded-xl flex items-start gap-2.5 text-xs {testFeedback.success
					? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
					: 'bg-red-50 border border-red-200 text-red-800'}"
			>
				{#if testFeedback.success}
					<CheckCircle2 class="w-3.5 h-3.5 mt-0.5 shrink-0" />
				{:else}
					<AlertCircle class="w-3.5 h-3.5 mt-0.5 shrink-0" />
				{/if}
				<span>{testFeedback.message}</span>
			</div>
		{/if}

		<div class="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
			<Button
				type="button"
				variant="outline"
				onclick={handleTest}
				disabled={isTesting}
				class="gap-1.5 text-slate-700 border-slate-300"
			>
				{#if isTesting}
					<RotateCw class="w-3.5 h-3.5 animate-spin" />
					<span>পরীক্ষা করা হচ্ছে...</span>
				{:else}
					<Zap class="w-3.5 h-3.5" />
					<span>সংযোগ পরীক্ষা করুন</span>
				{/if}
			</Button>
			<Button
				type="button"
				onclick={handleSave}
				disabled={isSaving}
				class="gap-1.5 bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
			>
				{#if isSaving}
					<RotateCw class="w-4 h-4 animate-spin" />
					<span>সংরক্ষণ হচ্ছে...</span>
				{:else}
					<Check class="w-4 h-4" />
					<span>সেটিংস সংরক্ষণ করুন</span>
				{/if}
			</Button>
		</div>
	</Card>
</div>
