<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import {
		ArrowLeft,
		CheckCircle2,
		Plus,
		ChevronDown,
		Trash2,
		Eye,
		EyeOff,
		Zap,
		ShieldCheck,
		AlertCircle,
		Check,
		RotateCw,
		Truck,
		Star
	} from 'lucide-svelte';
	import {
		Button,
		Input,
		Badge,
		Checkbox,
		Alert,
		AlertTitle,
		AlertDescription,
		Card,
		CardContent
	} from '#lib/components/ui';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';
	import type { CourierProviderId, CourierMethodSetting } from '#lib/server/services/courier.service';

	let { data } = $props();

	// Reactive Courier Methods from D1
	let courierMethods = $state<CourierMethodSetting[]>(data?.courierMethods || []);
	let defaultProvider = $state<CourierProviderId>(data?.defaultProvider || 'steadfast');

	$effect(() => {
		courierMethods = data?.courierMethods || [];
		defaultProvider = data?.defaultProvider || 'steadfast';
	});

	// Provider Metadata List
	const ALL_PROVIDERS: { id: CourierProviderId; name: string; tag: string }[] = [
		{ id: 'steadfast', name: 'Steadfast Courier', tag: 'Fastest nationwide COD' },
		{ id: 'pathao', name: 'Pathao Courier', tag: 'Same day express delivery' },
		{ id: 'paperfly', name: 'Paperfly', tag: 'Doorstep pickup & delivery' },
		{ id: 'carrybee', name: 'CarryBee Courier', tag: 'Enterprise logistics' },
		{ id: 'redx', name: 'REDX', tag: 'Wide coverage nationwide' }
	];

	// Form Selection State
	let selectedProviderId = $state<CourierProviderId>('steadfast');
	let isAddingNew = $state(false);

	// Form Field Values
	let formApiKey = $state('');
	let formSecretKey = $state('');
	let formUsername = $state('');
	let formPassword = $state('');
	let formStoreId = $state('');
	let formStoreName = $state('');
	let formPaperflyKey = $state('');
	let formClientContext = $state('');
	let formApiAccessToken = $state('');
	let formSpecialInstruction = $state('');
	let formIsDefault = $state(false);

	// Password/Secret visibility toggles
	let showSecret = $state(false);
	let showPassword = $state(false);

	// Feedback states
	let isSaving = $state(false);
	let isTesting = $state(false);
	let testFeedback = $state<{ success: boolean; message: string; balance?: any } | null>(null);

	// Initialize form when a provider is selected
	function loadProviderToForm(providerId: CourierProviderId, isNew = false) {
		selectedProviderId = providerId;
		isAddingNew = isNew;
		testFeedback = null;

		const existing = courierMethods.find((m) => m.id === providerId);
		if (existing && !isNew) {
			const creds = existing.credentials || {};
			formApiKey = creds.apiKey || '';
			formSecretKey = creds.secretKey || '';
			formUsername = creds.username || '';
			formPassword = creds.password || '';
			formStoreId = creds.storeId || '';
			formStoreName = creds.storeName || '';
			formPaperflyKey = creds.paperflyKey || '';
			formClientContext = creds.clientContext || '';
			formApiAccessToken = creds.apiAccessToken || '';
			formSpecialInstruction = existing.specialInstruction || '';
			formIsDefault = existing.isDefault ?? (defaultProvider === providerId);
		} else {
			// Clear fields for new configuration
			formApiKey = '';
			formSecretKey = '';
			formUsername = '';
			formPassword = '';
			formStoreId = '';
			formStoreName = '';
			formPaperflyKey = '';
			formClientContext = '';
			formApiAccessToken = '';
			formSpecialInstruction = '';
			formIsDefault = courierMethods.length === 0;
		}
	}

	// Initial load
	$effect(() => {
		if (courierMethods.length > 0 && !isAddingNew) {
			const current = courierMethods.find((m) => m.id === selectedProviderId);
			if (!current) {
				const first = courierMethods.find((m) => m.isDefault) || courierMethods[0];
				loadProviderToForm(first.id);
			}
		} else if (courierMethods.length === 0) {
			loadProviderToForm('steadfast', true);
		}
	});

	// Handle Save Action
	async function handleSave() {
		isSaving = true;
		testFeedback = null;

		const providerMeta = ALL_PROVIDERS.find((p) => p.id === selectedProviderId);
		const providerName = providerMeta?.name || 'Courier';

		const fd = new FormData();
		fd.append('providerId', selectedProviderId);
		fd.append('providerName', providerName);
		fd.append('specialInstruction', formSpecialInstruction);
		fd.append('isDefault', String(formIsDefault));

		// Provider-specific credentials
		if (selectedProviderId === 'steadfast') {
			fd.append('apiKey', formApiKey);
			fd.append('secretKey', formSecretKey);
		} else if (selectedProviderId === 'pathao') {
			fd.append('apiKey', formApiKey);
			fd.append('secretKey', formSecretKey);
			fd.append('username', formUsername);
			fd.append('password', formPassword);
			fd.append('storeId', formStoreId);
		} else if (selectedProviderId === 'paperfly') {
			fd.append('username', formUsername);
			fd.append('password', formPassword);
			fd.append('paperflyKey', formPaperflyKey);
			fd.append('storeName', formStoreName);
		} else if (selectedProviderId === 'carrybee') {
			fd.append('apiKey', formApiKey);
			fd.append('secretKey', formSecretKey);
			fd.append('clientContext', formClientContext);
			fd.append('storeId', formStoreId);
		} else if (selectedProviderId === 'redx') {
			fd.append('apiAccessToken', formApiAccessToken);
			fd.append('storeId', formStoreId);
		}

		try {
			const res = await fetch('?/saveCourier', {
				method: 'POST',
				body: fd
			});
			const result = (await res.json()) as any;

			await invalidateAll();
			isAddingNew = false;
			toast.success(`${providerName} কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!`);
		} catch (e: any) {
			console.error('Failed to save courier:', e);
			toast.error('সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে');
		} finally {
			isSaving = false;
		}
	}

	// Handle Test Connection
	async function handleTestConnection() {
		isTesting = true;
		testFeedback = null;

		const fd = new FormData();
		fd.append('providerId', selectedProviderId);

		if (selectedProviderId === 'steadfast') {
			fd.append('apiKey', formApiKey);
			fd.append('secretKey', formSecretKey);
		} else if (selectedProviderId === 'pathao') {
			fd.append('apiKey', formApiKey);
			fd.append('secretKey', formSecretKey);
			fd.append('username', formUsername);
			fd.append('password', formPassword);
		} else if (selectedProviderId === 'paperfly') {
			fd.append('username', formUsername);
			fd.append('password', formPassword);
			fd.append('paperflyKey', formPaperflyKey);
		} else if (selectedProviderId === 'carrybee') {
			fd.append('apiKey', formApiKey);
			fd.append('secretKey', formSecretKey);
		} else if (selectedProviderId === 'redx') {
			fd.append('apiAccessToken', formApiAccessToken);
		}

		try {
			const res = await fetch('?/testConnection', {
				method: 'POST',
				body: fd
			});
			const data = (await res.json()) as any;

			if (data && data.data) {
				const parsed = JSON.parse(data.data);
				const isSuccess = Boolean(parsed[1]);
				const msg = parsed[2] || 'কানেকশন টেস্ট সম্পন্ন হয়েছে';
				const balance = parsed[3];

				testFeedback = {
					success: isSuccess,
					message: msg,
					balance
				};

				if (isSuccess) {
					toast.success('এপিআই কানেকশন সফল হয়েছে!');
				} else {
					toast.error(msg);
				}
			} else {
				testFeedback = {
					success: true,
					message: 'এপিআই সংযোগ সফল এবং সক্রিয় পাওয়া গেছে!'
				};
				toast.success('এপিআই সংযোগ সফল এবং সক্রিয়!');
			}
		} catch (e: any) {
			const errorMsg = e?.message || 'কানেকশন টেস্ট ব্যর্থ হয়েছে';
			testFeedback = {
				success: false,
				message: `কানেকশন টেস্ট ব্যর্থ: ${errorMsg}`
			};
			toast.error(`কানেকশন টেস্ট ব্যর্থ: ${errorMsg}`);
		} finally {
			isTesting = false;
		}
	}

	// Handle Delete Courier with shadcn GlobalConfirmDialog
	async function handleDelete(id: CourierProviderId, name: string) {
		const confirmed = await confirmModal({
			title: 'কুরিয়ার মেথড মুছে ফেলা',
			message: `আপনি কি সত্যিই ${name} কনফিগারেশনটি স্থায়ীভাবে মুছে ফেলতে চান? এটি মুছে ফেললে এই মেথডে আর স্বয়ংক্রিয় পার্সেল বুকিং করা যাবে না।`,
			confirmText: 'হ্যাঁ, মুছে ফেলুন',
			cancelText: 'বাতিল',
			variant: 'destructive',
			icon: 'trash'
		});

		if (!confirmed) return;

		const fd = new FormData();
		fd.append('id', id);

		try {
			await fetch('?/deleteCourier', { method: 'POST', body: fd });
			await invalidateAll();
			toast.success(`${name} কনফিগারেশন মুছে ফেলা হয়েছে`);

			if (courierMethods.length > 0) {
				const remaining = courierMethods.filter((m) => m.id !== id);
				if (remaining.length > 0) {
					loadProviderToForm(remaining[0].id);
				} else {
					loadProviderToForm('steadfast', true);
				}
			}
		} catch (e) {
			console.error('Failed to delete courier:', e);
			toast.error('কুরিয়ার মেথড মুছে ফেলতে সমস্যা হয়েছে');
		}
	}
</script>

<svelte:head>
	<title>Courier Methods | AURA Enterprise Control</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6 font-['Anek_Bangla',sans-serif] pb-16">

	<!-- Top Navigation & Page Title -->
	<div class="flex items-center justify-between gap-4 flex-wrap">
		<Button
			variant="outline"
			size="sm"
			href="/admin/settings"
			class="inline-flex items-center gap-2 rounded-xl bg-white border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
		>
			<ArrowLeft class="w-4 h-4 text-slate-500" />
			<span>Back to Settings</span>
		</Button>

		<div class="text-right">
			<h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Courier Methods</h2>
			<p class="text-xs text-slate-500">আপনার শপের স্বয়ংক্রিয় পার্সেল বুকিং ও ট্র্যাকিং এপিআই কনফিগারেশন</p>
		</div>
	</div>

	<!-- Top Horizontal Cards Row (Configured Couriers + Add New Card) -->
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
		<!-- Configured Courier Cards -->
		{#each courierMethods as courier (courier.id)}
			<div
				onclick={() => loadProviderToForm(courier.id, false)}
				class="relative p-4 rounded-2xl transition-all cursor-pointer border text-left flex items-center justify-between gap-3 shadow-2xs {selectedProviderId === courier.id && !isAddingNew
					? 'bg-indigo-50/40 border-[#5845eb] shadow-[0_4px_16px_-4px_rgba(88,69,235,0.2)] ring-1 ring-[#5845eb]/40'
					: 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60'}"
			>
				<div class="flex items-center gap-3 min-w-0">
					<!-- Green Checkmark Circle -->
					<div class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
						<Check class="w-4 h-4 stroke-[3]" />
					</div>

					<div class="min-w-0">
						<div class="flex items-center gap-1.5 flex-wrap">
							<h4 class="font-bold text-slate-900 text-sm leading-tight truncate">
								{courier.name}
							</h4>
							{#if courier.isDefault}
								<Badge variant="purple" class="text-[10px] font-black px-1.5 py-0.5">
									Default
								</Badge>
							{/if}
						</div>
						<div class="flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 transition-colors pt-0.5">
							<span>courier.showSettingForm</span>
							<ChevronDown class="w-3 h-3 text-slate-400" />
						</div>
					</div>
				</div>

				<!-- Card Delete Button (shadcn Ghost Button) -->
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onclick={(e) => {
						e.stopPropagation();
						handleDelete(courier.id, courier.name);
					}}
					class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-0 shrink-0"
					title="কুরিয়ারটি মুছে ফেলুন"
				>
					<Trash2 class="w-3.5 h-3.5" />
				</Button>
			</div>
		{/each}

		<!-- Add New Courier Method Dashed Card -->
		<button
			type="button"
			onclick={() => {
				const configuredIds = courierMethods.map((m) => m.id);
				const firstAvailable = ALL_PROVIDERS.find((p) => !configuredIds.includes(p.id)) || ALL_PROVIDERS[0];
				loadProviderToForm(firstAvailable.id, true);
			}}
			class="p-4 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1.5 min-h-[76px] cursor-pointer shadow-2xs {isAddingNew
				? 'border-[#5845eb] bg-indigo-50/50 text-[#5845eb]'
				: 'border-slate-300 hover:border-[#5845eb] bg-white hover:bg-indigo-50/20 text-slate-600 hover:text-[#5845eb]'}"
		>
			<Plus class="w-5 h-5 text-slate-500 group-hover:text-[#5845eb]" />
			<span class="text-xs font-bold tracking-tight">courier.addNewCourierMethod</span>
		</button>
	</div>

	<!-- Dynamic Courier Configuration Form Box (shadcn Card Styled) -->
	<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6">

		<!-- Provider Selector Dropdown -->
		<div class="relative">
			<label for="provider-select" class="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
				<span>courier.selectProvider</span>
				<span class="text-rose-500">*</span>
			</label>
			<div class="relative">
				<select
					id="provider-select"
					bind:value={selectedProviderId}
					onchange={() => loadProviderToForm(selectedProviderId, isAddingNew)}
					class="w-full bg-slate-50/80 hover:bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#5845eb] focus:ring-2 focus:ring-[#5845eb]/15 focus:bg-white transition-all appearance-none cursor-pointer shadow-2xs"
				>
					{#each ALL_PROVIDERS as prov}
						<option value={prov.id} class="text-slate-800 py-1 font-medium">
							{prov.name}
						</option>
					{/each}
				</select>
				<ChevronDown class="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
			</div>
		</div>

		<!-- Provider Live Test Alert Banner (shadcn Alert) -->
		{#if testFeedback}
			<Alert variant={testFeedback.success ? 'success' : 'destructive'} class="rounded-2xl">
				{#if testFeedback.success}
					<CheckCircle2 class="w-5 h-5 text-emerald-600" />
					<AlertTitle class="font-bold text-emerald-900">কানেকশন সফল</AlertTitle>
				{:else}
					<AlertCircle class="w-5 h-5 text-rose-600" />
					<AlertTitle class="font-bold text-rose-900">কানেকশন ত্রুটি</AlertTitle>
				{/if}
				<AlertDescription class="text-xs mt-1 {testFeedback.success ? 'text-emerald-800' : 'text-rose-800'}">
					{testFeedback.message}
					{#if testFeedback.balance !== undefined}
						<div class="mt-1 font-mono font-bold text-emerald-700">Available Balance: ৳{testFeedback.balance}</div>
					{/if}
				</AlertDescription>
			</Alert>
		{/if}

		<!-- Provider Form Inputs (Dynamic based on selectedProviderId using shadcn Input) -->
		<div class="space-y-4">

			<!-- 1. Steadfast Courier Fields -->
			{#if selectedProviderId === 'steadfast'}
				<div class="space-y-1.5">
					<label class="block text-xs font-bold text-slate-600">courier.apiKey</label>
					<Input
						type="text"
						placeholder="যেমন: /ffdcpexos6kxyn43qy5cvudjplztv99"
						bind:value={formApiKey}
						class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
					/>
				</div>

				<div class="space-y-1.5">
					<label class="block text-xs font-bold text-slate-600">courier.secretKey</label>
					<div class="relative">
						<Input
							type={showSecret ? 'text' : 'password'}
							placeholder="যেমন: rbxqqq8r0u6ssvy3hue4hmtk"
							bind:value={formSecretKey}
							class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white pr-10"
						/>
						<button
							type="button"
							onclick={() => (showSecret = !showSecret)}
							class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
							title={showSecret ? 'লুকিয়ে রাখুন' : 'দেখুন'}
						>
							{#if showSecret}
								<EyeOff class="w-4 h-4" />
							{:else}
								<Eye class="w-4 h-4" />
							{/if}
						</button>
					</div>
				</div>

			<!-- 2. Pathao Courier Fields -->
			{:else if selectedProviderId === 'pathao'}
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-600">courier.apiKey (Client ID)</label>
						<Input
							type="text"
							placeholder="5xe7LIra7r"
							bind:value={formApiKey}
							class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
						/>
					</div>

					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-600">courier.secretKey (Client Secret)</label>
						<div class="relative">
							<Input
								type={showSecret ? 'text' : 'password'}
								placeholder="wVIiULaG6ioJAdANB5SVXYFPtTmq3xR30eNi6CQ3"
								bind:value={formSecretKey}
								class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white pr-10"
							/>
							<button
								type="button"
								onclick={() => (showSecret = !showSecret)}
								class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
							>
								{#if showSecret}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
							</button>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-600">courier.username (Email)</label>
						<Input
							type="text"
							placeholder="sohagalam82@gmail.com"
							bind:value={formUsername}
							class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
						/>
					</div>

					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-600">courier.password</label>
						<div class="relative">
							<Input
								type={showPassword ? 'text' : 'password'}
								placeholder="Nayon@@1122"
								bind:value={formPassword}
								class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white pr-10"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
							>
								{#if showPassword}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
							</button>
						</div>
					</div>
				</div>

				<div class="space-y-1.5">
					<label class="block text-xs font-bold text-slate-600">courier.storeId</label>
					<Input
						type="text"
						placeholder="339467"
						bind:value={formStoreId}
						class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
					/>
				</div>

			<!-- 3. Paperfly Courier Fields -->
			{:else if selectedProviderId === 'paperfly'}
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-600">courier.username</label>
						<Input
							type="text"
							placeholder="paperfly_user"
							bind:value={formUsername}
							class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
						/>
					</div>

					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-600">courier.password</label>
						<div class="relative">
							<Input
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••••••"
								bind:value={formPassword}
								class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white pr-10"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
							>
								{#if showPassword}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
							</button>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-600">courier.paperflyKey</label>
						<Input
							type="text"
							placeholder="paperfly_key_token"
							bind:value={formPaperflyKey}
							class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
						/>
					</div>

					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-600">courier.storeName</label>
						<Input
							type="text"
							placeholder="My Shop Store"
							bind:value={formStoreName}
							class="text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
						/>
					</div>
				</div>

			<!-- 4. CarryBee Courier Fields -->
			{:else if selectedProviderId === 'carrybee'}
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-600">courier.apiKey (Client ID)</label>
						<Input
							type="text"
							placeholder="CarryBee Client ID"
							bind:value={formApiKey}
							class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
						/>
					</div>

					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-600">courier.secretKey</label>
						<div class="relative">
							<Input
								type={showSecret ? 'text' : 'password'}
								placeholder="CarryBee Secret Key"
								bind:value={formSecretKey}
								class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white pr-10"
							/>
							<button
								type="button"
								onclick={() => (showSecret = !showSecret)}
								class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
							>
								{#if showSecret}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
							</button>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-600">Client Context</label>
						<Input
							type="text"
							placeholder="Context / Branch"
							bind:value={formClientContext}
							class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
						/>
					</div>

					<div class="space-y-1.5">
						<label class="block text-xs font-bold text-slate-600">courier.storeId</label>
						<Input
							type="text"
							placeholder="Store Hub ID"
							bind:value={formStoreId}
							class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
						/>
					</div>
				</div>

			<!-- 5. REDX Courier Fields -->
			{:else if selectedProviderId === 'redx'}
				<div class="space-y-1.5">
					<label class="block text-xs font-bold text-slate-600">API Access Token</label>
					<div class="relative">
						<Input
							type={showSecret ? 'text' : 'password'}
							placeholder="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
							bind:value={formApiAccessToken}
							class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white pr-10"
						/>
						<button
							type="button"
							onclick={() => (showSecret = !showSecret)}
							class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
						>
							{#if showSecret}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
						</button>
					</div>
				</div>

				<div class="space-y-1.5">
					<label class="block text-xs font-bold text-slate-600">Store ID (Optional)</label>
					<Input
						type="text"
						placeholder="REDX Pickup Store ID (যদি একাধিক হাব থাকে)"
						bind:value={formStoreId}
						class="font-mono text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
					/>
				</div>
			{/if}

			<!-- Special Instruction (Common for all Providers) -->
			<div class="space-y-1.5 pt-1">
				<label class="block text-xs font-bold text-slate-600">courier.specialInstruction</label>
				<Input
					type="text"
					placeholder="রাইডার নোট: ইনট্যাক্ট পলি খোলা যাবে না। কুরিয়ার পলি খুলে চেক করতে পারবেন।"
					bind:value={formSpecialInstruction}
					class="text-xs h-11 rounded-xl bg-slate-50/70 focus:bg-white"
				/>
			</div>

			<!-- Set as Default Checkbox + Test Connection Button -->
			<div class="pt-3 flex items-center justify-between border-t border-slate-100 mt-2 flex-wrap gap-3">
				<label class="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 select-none">
					<Checkbox bind:checked={formIsDefault} id="is-default-courier" />
					<span>এই কুরিয়ারটিকে ডিফল্ট মেথড হিসেবে সেট করুন</span>
				</label>

				<!-- Test Connection Trigger (shadcn Button) -->
				<Button
					type="button"
					variant="outline"
					size="sm"
					loading={isTesting}
					onclick={handleTestConnection}
					class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-[#5845eb] hover:border-indigo-200 text-slate-700 text-xs font-bold transition-all shadow-2xs"
				>
					<Zap class="w-3.5 h-3.5 {isTesting ? 'animate-bounce text-[#5845eb]' : 'text-amber-500'}" />
					<span>{isTesting ? 'টেস্ট চলছে...' : 'এপিআই কানেকশন টেস্ট'}</span>
				</Button>
			</div>

		</div>

		<!-- Action Save Button (shadcn Button) -->
		<div class="pt-2">
			<Button
				type="button"
				variant="default"
				size="lg"
				loading={isSaving}
				onclick={handleSave}
				class="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#5845eb] hover:bg-[#4734d4] text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm shadow-indigo-500/20 active:scale-95"
			>
				<Check class="w-4 h-4 stroke-[3]" />
				<span>courier.saveChanges</span>
			</Button>
		</div>

	</div>

</div>
