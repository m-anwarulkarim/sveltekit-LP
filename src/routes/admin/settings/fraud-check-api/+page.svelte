<script lang="ts">
	import { submitAction } from '#lib/client/submit-action';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	const saved = data.settings ?? {};
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Check, ShieldCheck, AlertTriangle } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Fraud Check API Settings Saved!');

	let enableCourierFraudCheck = $state(saved.enableCourierFraudCheck ?? true);
	let returnRateThreshold = $state(saved.returnRateThreshold ?? 25);
	let autoBlockBadIps = $state(saved.autoBlockBadIps ?? false);
	let steadFastApiKey = $state(saved.steadFastApiKey ?? '');
	let steadFastSecretKey = $state(saved.steadFastSecretKey ?? '');
	let pathaoApiKey = $state(saved.pathaoApiKey ?? '');
	let pathaoSecret = $state(saved.pathaoSecret ?? '');
	let pathaoUsername = $state(saved.pathaoUsername ?? '');
	let pathaoPassword = $state(saved.pathaoPassword ?? '');

	let isSaving = $state(false);
	async function triggerSave(msg = 'Fraud Check API Settings Saved!') {
		if (isSaving) return;
		isSaving = true;
		const fd = new FormData();
		fd.append(
			'settings',
			JSON.stringify({
				enableCourierFraudCheck,
				returnRateThreshold,
				autoBlockBadIps,
				steadFastApiKey,
				steadFastSecretKey,
				pathaoApiKey,
				pathaoSecret,
				pathaoUsername,
				pathaoPassword
			})
		);
		const res = await submitAction('?/save', fd);
		isSaving = false;
		if (!res.ok) {
			toast.error(res.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
			return;
		}
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}
</script>

<svelte:head>
	<title>Fraud Check API | Admin</title>
</svelte:head>

<div class="space-y-6 max-w-2xl mx-auto p-4 sm:p-6">
	{#if isSaved}
		<div class="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
			<CheckCircle2 class="w-4 h-4" />
			<span>{saveMessage}</span>
		</div>
	{/if}

	<div class="flex items-center justify-between gap-4 pb-2">
		<a href="/admin/settings">
			<Button variant="outline" size="sm" class="gap-2">
				<ArrowLeft class="w-4 h-4" />
				<span>Back to Settings</span>
			</Button>
		</a>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="gap-1.5 bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			<Check class="w-4 h-4" />
			<span>Save Settings</span>
		</Button>
	</div>

	<Card class="p-6 space-y-6 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		<div class="flex items-center gap-3 pb-3 border-b border-slate-100">
			<div class="w-10 h-10 rounded-full bg-[#1d6ee5] flex items-center justify-center text-white">
				<ShieldCheck class="w-5 h-5" />
			</div>
			<div>
				<h3 class="text-base font-bold text-slate-900">Fraud Check API কনফিগারেশন</h3>
				<p class="text-xs text-slate-500">ভুয়া অর্ডার, উচ্চ রিটার্ন রেটের গ্রাহক ও ফেক ট্র্যাফিক সনাক্তকরণ</p>
			</div>
		</div>

		<div class="space-y-4">
			<div class="flex items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
				<div>
					<h4 class="text-xs font-bold text-slate-900">কুরিয়ার রিটার্ন হিস্ট্রি চেক সক্রিয় করুন</h4>
					<p class="text-[11px] text-slate-500">অর্ডার আসার সাথে সাথে গ্রাহকের অতীতের সফল ডেলিভারি ও রিটার্ন পারসেন্টেজ চেক হবে</p>
				</div>
				<Switch bind:checked={enableCourierFraudCheck} />
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">রিটার্ন সতর্কতা থ্রেশহোল্ড (%)</label>
					<Input type="number" bind:value={returnRateThreshold} class="font-mono text-sm" />
					<span class="text-[11px] text-slate-400">রিটার্ন রেট এর বেশি হলে অর্ডারে লাল সতর্কবার্তা দেখাবে</span>
				</div>

				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">হাই-রিস্ক আইপি অটো ব্লক</label>
					<div class="pt-2">
						<Switch bind:checked={autoBlockBadIps} />
					</div>
					<span class="text-[11px] text-slate-400">বারবার ফেক রিকোয়েস্ট পাঠালে ব্লক হবে</span>
				</div>
			</div>

			<!-- Steadfast Credentials -->
			<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
				<div class="flex items-center justify-between">
					<h4 class="text-xs font-bold text-slate-800 flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
						Steadfast Courier API (Fraud Check & Score)
					</h4>
					<span class="text-[10px] font-mono text-slate-400">/api/v1/fraud_check/score</span>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="text-[11px] font-bold text-slate-600">Steadfast API Key</label>
						<Input type="password" bind:value={steadFastApiKey} placeholder="যেমন: 0y5n7641gq0z5j42h3b1f1e7" class="font-mono text-xs" />
					</div>
					<div class="space-y-1">
						<label class="text-[11px] font-bold text-slate-600">Steadfast Secret Key</label>
						<Input type="password" bind:value={steadFastSecretKey} placeholder="Steadfast ড্যাশবোর্ডের Secret Key" class="font-mono text-xs" />
					</div>
				</div>
				<p class="text-[11px] text-slate-400">
					Steadfast ড্যাশবোর্ড > API guide > Authentication থেকে আপনার Api-Key ও Secret-Key সংগ্রহ করুন।
				</p>
			</div>

			<!-- Pathao Credentials -->
			<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
				<div class="flex items-center justify-between">
					<h4 class="text-xs font-bold text-slate-800 flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
						Pathao Courier API (Success Rate Check)
					</h4>
					<span class="text-[10px] font-mono text-slate-400">/api/v1/user/success-rate</span>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div class="space-y-1">
						<label class="text-[11px] font-bold text-slate-600">Pathao Client ID (API Key)</label>
						<Input type="password" bind:value={pathaoApiKey} placeholder="Pathao Developer Client ID" class="font-mono text-xs" />
					</div>
					<div class="space-y-1">
						<label class="text-[11px] font-bold text-slate-600">Pathao Client Secret</label>
						<Input type="password" bind:value={pathaoSecret} placeholder="Pathao Client Secret" class="font-mono text-xs" />
					</div>
					<div class="space-y-1">
						<label class="text-[11px] font-bold text-slate-600">Pathao Username / Email</label>
						<Input type="text" bind:value={pathaoUsername} placeholder="মার্চেন্ট ইমেইল বা ইউজারনেম" class="text-xs" />
					</div>
					<div class="space-y-1">
						<label class="text-[11px] font-bold text-slate-600">Pathao Password</label>
						<Input type="password" bind:value={pathaoPassword} placeholder="মার্চেন্ট পাসওয়ার্ড" class="text-xs" />
					</div>
				</div>
			</div>
		</div>

		<Button
			type="button"
			onclick={() => triggerSave()}
			class="w-full bg-[#1d6ee5] hover:bg-[#1557b0] text-white font-bold"
		>
			ফ্রড চেক সেটিংস সংরক্ষণ
		</Button>
	</Card>
</div>
