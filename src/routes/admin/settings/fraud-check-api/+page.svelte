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
	import { Button, Input, Badge, Card, Switch } from '#lib/components/ui';

	let { data } = $props();
	const saved = data.settings ?? {};

	// Global settings
	let enableCourierFraudCheck = $state(saved.enableCourierFraudCheck ?? true);
	let returnRateThreshold = $state(saved.returnRateThreshold ?? 25);
	let autoBlockBadIps = $state(saved.autoBlockBadIps ?? false);

	// Provider credentials
	let smartposBdApiKey = $state(saved.smartposBdApiKey ?? '');
	let steadFastApiKey = $state(saved.steadFastApiKey ?? '');
	let steadFastSecretKey = $state(saved.steadFastSecretKey ?? '');
	let pathaoApiKey = $state(saved.pathaoApiKey ?? '');
	let pathaoSecret = $state(saved.pathaoSecret ?? '');
	let pathaoUsername = $state(saved.pathaoUsername ?? '');
	let pathaoPassword = $state(saved.pathaoPassword ?? '');

	// UI states
	type ProviderId = 'smartpos_bd' | 'steadfast' | 'pathao';
	let selectedProvider = $state<ProviderId>('smartpos_bd');
	let showSecret = $state(false);
	let showPassword = $state(false);
	let isSaving = $state(false);
	let isTesting = $state(false);
	let testFeedback = $state<{ success: boolean; message: string } | null>(null);
	let isSaved = $state(false);

	const PROVIDERS: { id: ProviderId; name: string; tag: string; color: string; badge: string }[] = [
		{
			id: 'smartpos_bd',
			name: 'SmartPOS Bangladesh',
			tag: 'ফোন নম্বর ফ্রড স্কোর যাচাই',
			color: 'bg-violet-500',
			badge: 'প্রাইমারি'
		},
		{
			id: 'steadfast',
			name: 'Steadfast',
			tag: 'অর্ডার ইতিহাস ও ফ্রড স্কোর',
			color: 'bg-emerald-500',
			badge: 'ফ্রড স্কোর'
		},
		{
			id: 'pathao',
			name: 'Pathao',
			tag: 'গ্রাহকের সফল অর্ডার রেট',
			color: 'bg-red-500',
			badge: 'সাকসেস রেট'
		}
	];

	function isConfigured(id: ProviderId): boolean {
		if (id === 'smartpos_bd') return !!smartposBdApiKey.trim();
		if (id === 'steadfast') return !!(steadFastApiKey.trim() && steadFastSecretKey.trim());
		if (id === 'pathao') return !!(pathaoApiKey.trim() && pathaoSecret.trim());
		return false;
	}

	function selectProvider(id: ProviderId) {
		selectedProvider = id;
		testFeedback = null;
		showSecret = false;
		showPassword = false;
	}

	async function handleTest() {
		if (isTesting) return;
		isTesting = true;
		testFeedback = null;

		await new Promise((r) => setTimeout(r, 800));

		if (!isConfigured(selectedProvider)) {
			testFeedback = { success: false, message: 'API Credentials দেওয়া নেই, সংযোগ পরীক্ষা করা সম্ভব হয়নি।' };
		} else {
			testFeedback = { success: true, message: 'API Credentials সেভ করা আছে। লাইভ পরীক্ষার জন্য সেভ করুন।' };
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
			JSON.stringify({
				enableCourierFraudCheck,
				returnRateThreshold,
				autoBlockBadIps,
				smartposBdApiKey,
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
		setTimeout(() => (isSaved = false), 3000);
		toast.success('Fraud Check API সেটিংস সংরক্ষিত হয়েছে!');
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
		<span>Fraud Check API Settings Saved!</span>
	</div>
{/if}

<div class="space-y-6 max-w-3xl mx-auto p-4 sm:p-6">
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

	<!-- Provider Cards -->
	<div>
		<h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">API Providers</h4>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
			{#each PROVIDERS as provider}
				{@const configured = isConfigured(provider.id)}
				{@const active = selectedProvider === provider.id}
				<button
					type="button"
					onclick={() => selectProvider(provider.id)}
					class="relative text-left p-4 rounded-2xl border-2 transition-all cursor-pointer {active
						? 'border-[#1d6ee5] bg-blue-50/70 shadow-md'
						: 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}"
				>
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-xl {provider.color} flex items-center justify-center shrink-0">
							<ShieldCheck class="w-4 h-4 text-white" />
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-xs font-bold text-slate-900 leading-tight">{provider.name}</p>
							<p class="text-[10px] text-slate-500 mt-0.5 leading-tight">{provider.tag}</p>
						</div>
					</div>
					<div class="mt-2.5 flex items-center justify-between">
						<Badge
							variant={configured ? 'default' : 'secondary'}
							class="text-[10px] px-2 py-0.5 {configured ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500'}"
						>
							{configured ? 'সক্রিয়' : 'কনফিগার করুন'}
						</Badge>
						<span class="text-[10px] text-slate-400">{provider.badge}</span>
					</div>
					{#if active}
						<div class="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#1d6ee5]"></div>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Dynamic Form Panel -->
	<Card class="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-3xl">
		{#if selectedProvider === 'smartpos_bd'}
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2.5">
						<div class="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center">
							<ShieldCheck class="w-4 h-4 text-white" />
						</div>
						<div>
							<h3 class="text-sm font-bold text-slate-900">SmartPOS Bangladesh API</h3>
							<p class="text-[11px] text-slate-500">fraudchecker.smartposbd.com</p>
						</div>
					</div>
					<a
						href="https://fraudchecker.smartposbd.com/bn/api-docs"
						target="_blank"
						rel="noopener noreferrer"
						class="text-[11px] text-blue-600 hover:underline font-medium"
					>
						API Docs →
					</a>
				</div>
				<div class="space-y-1.5">
					<label class="text-xs font-bold text-slate-700">SmartPOS API Key / Token</label>
					<div class="relative">
						<Input
							type={showSecret ? 'text' : 'password'}
							bind:value={smartposBdApiKey}
							placeholder="SmartPOS ড্যাশবোর্ড থেকে API Key সংগ্রহ করুন"
							class="font-mono text-xs pr-10"
						/>
						<button
							type="button"
							onclick={() => (showSecret = !showSecret)}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
						>
							{#if showSecret}
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
						>
							API Documentation
						</a>
					</p>
				</div>
			</div>

		{:else if selectedProvider === 'steadfast'}
			<div class="space-y-4">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
						<ShieldCheck class="w-4 h-4 text-white" />
					</div>
					<div>
						<h3 class="text-sm font-bold text-slate-900">Steadfast Fraud Check API</h3>
						<p class="text-[11px] text-slate-500">অর্ডার ইতিহাস ও ফ্রড স্কোর যাচাই</p>
					</div>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700">Steadfast API Key</label>
						<Input
							type="password"
							bind:value={steadFastApiKey}
							placeholder="যেমন: 0y5n7641gq0z5j42h3b1f1e7"
							class="font-mono text-xs"
						/>
					</div>
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700">Steadfast Secret Key</label>
						<div class="relative">
							<Input
								type={showSecret ? 'text' : 'password'}
								bind:value={steadFastSecretKey}
								placeholder="Steadfast Dashboard > Secret Key"
								class="font-mono text-xs pr-10"
							/>
							<button
								type="button"
								onclick={() => (showSecret = !showSecret)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								{#if showSecret}
									<EyeOff class="w-3.5 h-3.5" />
								{:else}
									<Eye class="w-3.5 h-3.5" />
								{/if}
							</button>
						</div>
					</div>
				</div>
				<p class="text-[11px] text-slate-400">
					Steadfast ড্যাশবোর্ড › API guide › Authentication থেকে Api-Key ও Secret-Key সংগ্রহ করুন। এই API ফোন নম্বরের ফ্রড স্কোর রিটার্ন করে।
				</p>
			</div>

		{:else if selectedProvider === 'pathao'}
			<div class="space-y-4">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center">
						<ShieldCheck class="w-4 h-4 text-white" />
					</div>
					<div>
						<h3 class="text-sm font-bold text-slate-900">Pathao Fraud Check API</h3>
						<p class="text-[11px] text-slate-500">গ্রাহকের সফল অর্ডার রেট যাচাই</p>
					</div>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700">Pathao Client ID</label>
						<Input
							type="password"
							bind:value={pathaoApiKey}
							placeholder="Pathao Developer Client ID"
							class="font-mono text-xs"
						/>
					</div>
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700">Pathao Client Secret</label>
						<div class="relative">
							<Input
								type={showSecret ? 'text' : 'password'}
								bind:value={pathaoSecret}
								placeholder="Pathao Client Secret"
								class="font-mono text-xs pr-10"
							/>
							<button
								type="button"
								onclick={() => (showSecret = !showSecret)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								{#if showSecret}
									<EyeOff class="w-3.5 h-3.5" />
								{:else}
									<Eye class="w-3.5 h-3.5" />
								{/if}
							</button>
						</div>
					</div>
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700">Pathao Username / Email</label>
						<Input
							type="text"
							bind:value={pathaoUsername}
							placeholder="মার্চেন্ট ইমেইল বা ইউজারনেম"
							class="text-xs"
						/>
					</div>
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-700">Pathao Password</label>
						<div class="relative">
							<Input
								type={showPassword ? 'text' : 'password'}
								bind:value={pathaoPassword}
								placeholder="মার্চেন্ট পাসওয়ার্ড"
								class="text-xs pr-10"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								{#if showPassword}
									<EyeOff class="w-3.5 h-3.5" />
								{:else}
									<Eye class="w-3.5 h-3.5" />
								{/if}
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Test Feedback -->
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

		<!-- Action Buttons -->
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
