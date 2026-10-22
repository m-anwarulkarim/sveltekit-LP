<script lang="ts">
	import { Button, Card, Input, Switch } from '#lib/components/ui';
	import { ArrowLeft, CheckCircle2, Package, RefreshCw, Check } from 'lucide-svelte';

	let isSaved = $state(false);
	let saveMessage = $state('Courier Settings Saved!');

	let steadfastApiKey = $state('stdf_live_89a47b2c918e001');
	let steadfastSecretKey = $state('••••••••••••••••••••••••');
	let isSteadfastEnabled = $state(true);

	let pathaoClientId = $state('pt_client_98214');
	let pathaoClientSecret = $state('••••••••••••••••••••••••');
	let pathaoUsername = $state('store@example.com');
	let pathaoPassword = $state('••••••••••••••••');
	let isPathaoEnabled = $state(false);

	let isCourierSyncing = $state(false);
	let courierStatusMessage = $state<string | null>(null);

	function triggerSave(msg = 'Courier Settings Saved!') {
		isSaved = true;
		saveMessage = msg;
		setTimeout(() => (isSaved = false), 3000);
	}

	function testCourierApi() {
		isCourierSyncing = true;
		courierStatusMessage = 'Connecting to Steadfast & Pathao APIs...';
		setTimeout(() => {
			isCourierSyncing = false;
			courierStatusMessage = 'Steadfast & Pathao APIs are connected and active!';
			setTimeout(() => (courierStatusMessage = null), 3500);
		}, 1200);
	}
</script>

<svelte:head>
	<title>Courier Settings | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-3xl mx-auto">
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
			variant="secondary"
			size="sm"
			onclick={testCourierApi}
			loading={isCourierSyncing}
			class="gap-1.5"
		>
			<RefreshCw class="w-3.5 h-3.5 {isCourierSyncing ? 'animate-spin' : ''}" />
			<span>Test API Connection</span>
		</Button>
	</div>

	{#if courierStatusMessage}
		<div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
			<CheckCircle2 class="w-4 h-4 text-emerald-600" />
			<span>{courierStatusMessage}</span>
		</div>
	{/if}

	<!-- Steadfast Courier Card -->
	<Card class="p-6 space-y-5 bg-white border border-slate-200/90 shadow-2xs rounded-2xl">
		<div class="flex items-center justify-between pb-3 border-b border-slate-100">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white">
					<Package class="w-5 h-5" />
				</div>
				<div>
					<h3 class="text-base font-bold text-slate-900">Steadfast Courier API</h3>
					<p class="text-xs text-slate-500">অটোমেটিক পার্সেল বুকিং এবং ট্র্যাকিং সিঙ্ক</p>
				</div>
			</div>
			<Switch bind:checked={isSteadfastEnabled} />
		</div>

		{#if isSteadfastEnabled}
			<div class="space-y-4">
				<div class="space-y-1.5">
					<label for="st-key" class="text-xs font-bold text-slate-700">Steadfast API Key</label>
					<Input
						id="st-key"
						type="text"
						bind:value={steadfastApiKey}
						class="font-mono text-xs"
					/>
				</div>
				<div class="space-y-1.5">
					<label for="st-sec" class="text-xs font-bold text-slate-700">Steadfast Secret Key</label>
					<Input
						id="st-sec"
						type="password"
						bind:value={steadfastSecretKey}
						class="font-mono text-xs"
					/>
				</div>
			</div>
		{/if}
	</Card>

	<!-- Pathao Courier Card -->
	<Card class="p-6 space-y-5 bg-white border border-slate-200/90 shadow-2xs rounded-2xl">
		<div class="flex items-center justify-between pb-3 border-b border-slate-100">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-full bg-[#ea4335] flex items-center justify-center text-white">
					<Package class="w-5 h-5" />
				</div>
				<div>
					<h3 class="text-base font-bold text-slate-900">Pathao Courier API</h3>
					<p class="text-xs text-slate-500">পাঠাও কুরিয়ার মার্চেন্ট ইন্টিগ্রেশন</p>
				</div>
			</div>
			<Switch bind:checked={isPathaoEnabled} />
		</div>

		{#if isPathaoEnabled}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label for="pt-id" class="text-xs font-bold text-slate-700">Client ID</label>
					<Input
						id="pt-id"
						type="text"
						bind:value={pathaoClientId}
						class="font-mono text-xs"
					/>
				</div>
				<div class="space-y-1.5">
					<label for="pt-sec" class="text-xs font-bold text-slate-700">Client Secret</label>
					<Input
						id="pt-sec"
						type="password"
						bind:value={pathaoClientSecret}
						class="font-mono text-xs"
					/>
				</div>
				<div class="space-y-1.5">
					<label for="pt-user" class="text-xs font-bold text-slate-700">Username / Email</label>
					<Input
						id="pt-user"
						type="text"
						bind:value={pathaoUsername}
						class="font-mono text-xs"
					/>
				</div>
				<div class="space-y-1.5">
					<label for="pt-pass" class="text-xs font-bold text-slate-700">Password</label>
					<Input
						id="pt-pass"
						type="password"
						bind:value={pathaoPassword}
						class="font-mono text-xs"
					/>
				</div>
			</div>
		{/if}
	</Card>

	<Button
		type="button"
		onclick={() => triggerSave('Courier API Credentials Saved!')}
		class="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold"
	>
		Save Courier Settings
	</Button>
</div>
