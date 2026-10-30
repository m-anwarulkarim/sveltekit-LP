<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import {
		Button,
		Card,
		Input,
		Switch,
		Badge,
		Alert,
		AlertTitle,
		AlertDescription
	} from '#lib/components/ui';
	import {
		ArrowLeft,
		CheckCircle2,
		AlertCircle,
		Check,
		CreditCard,
		Loader2,
		ShieldCheck,
		Eye,
		EyeOff,
		Zap,
		ExternalLink,
		Info,
		Sparkles
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data }: { data: any } = $props();

	let isSaving = $state(false);
	let isTestingBkash = $state(false);
	let testFeedback = $state<{ success: boolean; message: string; mode?: string } | null>(null);

	// Visibility toggles for sensitive passwords
	let showBkashSecret = $state(false);
	let showBkashPassword = $state(false);

	// Reactive state initialized from D1
	let enableCOD = $state(data?.paymentConfig?.enableCOD ?? true);

	// bKash credentials
	let enableBkash = $state(data?.paymentConfig?.enableBkash ?? false);
	let bkashMode = $state<'sandbox' | 'live'>(data?.paymentConfig?.bkashMode || 'sandbox');
	let bkashAppKey = $state(data?.paymentConfig?.bkashAppKey ?? '');
	let bkashAppSecret = $state(data?.paymentConfig?.bkashAppSecret ?? '');
	let bkashUsername = $state(data?.paymentConfig?.bkashUsername ?? '');
	let bkashPassword = $state(data?.paymentConfig?.bkashPassword ?? '');

	// Nagad
	let enableNagad = $state(data?.paymentConfig?.enableNagad ?? false);
	let nagadMerchantId = $state(data?.paymentConfig?.nagadMerchantId ?? '');

	// SSLCommerz
	let enableSSLCommerz = $state(data?.paymentConfig?.enableSSLCommerz ?? false);
	let sslStoreId = $state(data?.paymentConfig?.sslStoreId ?? '');

	// Fill official bKash sandbox test credentials
	function fillSandboxCredentials() {
		bkashMode = 'sandbox';
		bkashUsername = 'sandboxTokenizedUser02';
		bkashPassword = 'sandboxTokenizedUser02@12345';
		bkashAppKey = '4f6o0cjiki2rfm34kfdadl1eqq';
		bkashAppSecret = '2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b';
		toast.success('অফিসিয়াল bKash স্যান্ডবক্স টেস্ট ক্রেডেনশিয়াল লোড করা হয়েছে');
	}

	async function handleTestBkash() {
		if (!bkashAppKey.trim() || !bkashAppSecret.trim() || !bkashUsername.trim() || !bkashPassword.trim()) {
			toast.error('টেস্ট করার জন্য App Key, Secret, Username এবং Password পূরণ করুন');
			return;
		}

		isTestingBkash = true;
		testFeedback = null;

		const fd = new FormData();
		fd.append('bkashMode', bkashMode);
		fd.append('bkashAppKey', bkashAppKey.trim());
		fd.append('bkashAppSecret', bkashAppSecret.trim());
		fd.append('bkashUsername', bkashUsername.trim());
		fd.append('bkashPassword', bkashPassword.trim());

		try {
			const res = await fetch('?/testBkash', {
				method: 'POST',
				body: fd
			});
			const result = (await res.json()) as any;

			if (result.type === 'success' || result.status === 200) {
				testFeedback = {
					success: true,
					message: result?.data?.message || 'bKash API সফলভাবে সংযুক্ত হয়েছে!',
					mode: bkashMode.toUpperCase()
				};
				toast.success('bKash API ভ্যালিডেশন সফল!');
			} else {
				testFeedback = {
					success: false,
					message: result?.data?.message || 'কানেকশন টেস্ট ব্যর্থ হয়েছে',
					mode: bkashMode.toUpperCase()
				};
				toast.error(testFeedback.message);
			}
		} catch (err: any) {
			testFeedback = {
				success: false,
				message: err?.message || 'সার্ভারে নেটওয়ার্ক সমস্যা হয়েছে'
			};
			toast.error('নেটওয়ার্ক ত্রুটি');
		} finally {
			isTestingBkash = false;
		}
	}

	async function saveSettings() {
		if (enableBkash && (!bkashAppKey.trim() || !bkashAppSecret.trim())) {
			toast.error('বিকাশ সক্রিয় রাখতে App Key এবং App Secret পূরণ করা আবশ্যক');
			return;
		}

		isSaving = true;
		try {
			const fd = new FormData();
			fd.append('enableCOD', String(enableCOD));
			fd.append('enableBkash', String(enableBkash));
			fd.append('bkashMode', bkashMode);
			fd.append('bkashAppKey', bkashAppKey.trim());
			fd.append('bkashAppSecret', bkashAppSecret.trim());
			fd.append('bkashUsername', bkashUsername.trim());
			fd.append('bkashPassword', bkashPassword.trim());
			fd.append('enableNagad', String(enableNagad));
			fd.append('nagadMerchantId', nagadMerchantId.trim());
			fd.append('enableSSLCommerz', String(enableSSLCommerz));
			fd.append('sslStoreId', sslStoreId.trim());

			const res = await fetch('?/save', {
				method: 'POST',
				body: fd
			});
			const result = (await res.json()) as any;

			if (result.type === 'success' || result.status === 200) {
				await invalidateAll();
				toast.success('পেমেন্ট গেটওয়ে সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
			} else {
				toast.error(result?.data?.message || 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে');
			}
		} catch (e) {
			toast.error('নেটওয়ার্ক ত্রুটি');
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Payment Gateways & bKash Setup | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 pb-20">
	<!-- Top Navigation & Action Bar -->
	<div class="flex items-center justify-between gap-4 pb-2 border-b border-slate-200">
		<div class="flex items-center gap-3">
			<a href="/admin/settings">
				<Button variant="outline" size="sm" class="gap-2 rounded-xl">
					<ArrowLeft class="w-4 h-4" />
					<span>সেটিংস মেন্যু</span>
				</Button>
			</a>
			<div>
				<h1 class="text-xl font-bold text-slate-900 flex items-center gap-2">
					<CreditCard class="w-5 h-5 text-emerald-600" />
					<span>পেমেন্ট গেটওয়ে ও বিকাশ কনফিগারেশন</span>
				</h1>
				<p class="text-xs text-slate-500 mt-0.5">
					ক্যাশ অন ডেলিভারি, বিকাশ অনলাইন পেমেন্ট API, নগদ এবং SSLCommerz গেটওয়ে
				</p>
			</div>
		</div>

		<Button
			type="button"
			disabled={isSaving}
			onclick={saveSettings}
			class="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-5 shadow-sm cursor-pointer"
		>
			{#if isSaving}
				<Loader2 class="w-4 h-4 animate-spin" />
				<span>সংরক্ষণ হচ্ছে...</span>
			{:else}
				<Check class="w-4 h-4" />
				<span>সেটিংস সেভ করুন</span>
			{/if}
		</Button>
	</div>

	<!-- Main Settings Form -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Left: Gateways List (2 Cols) -->
		<div class="lg:col-span-2 space-y-6">
			<!-- 1. Cash on Delivery (COD) -->
			<Card class="bg-white border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden">
				<div class="p-5 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 font-bold text-xs">
							COD
						</div>
						<div>
							<div class="flex items-center gap-2">
								<h3 class="text-sm font-bold text-slate-900">Cash on Delivery (ক্যাশ অন ডেলিভারি)</h3>
								<Badge variant={enableCOD ? 'default' : 'secondary'} class={enableCOD ? 'bg-emerald-600 text-[10px]' : 'text-[10px]'}>
									{enableCOD ? 'ACTIVE' : 'OFF'}
								</Badge>
							</div>
							<p class="text-xs text-slate-500 mt-0.5">
								গ্রাহক পার্সেল হাতে পেয়ে ডেলিভারিম্যানকে টাকা পরিশোধ করবেন
							</p>
						</div>
					</div>
					<Switch bind:checked={enableCOD} />
				</div>
			</Card>

			<!-- 2. bKash Payment Gateway (Tokenized Checkout API) -->
			<Card class="bg-white border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden border-pink-200/60">
				<div class="p-5 bg-gradient-to-r from-pink-50/70 to-rose-50/40 border-b border-pink-100 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-2xl bg-[#d12053] flex items-center justify-center text-white shrink-0 font-bold text-xs shadow-xs">
							bKash
						</div>
						<div>
							<div class="flex items-center gap-2">
								<h3 class="text-sm font-bold text-slate-900">bKash Payment Gateway</h3>
								<Badge variant={enableBkash ? 'default' : 'secondary'} class={enableBkash ? (bkashMode === 'live' ? 'bg-emerald-600' : 'bg-amber-600 text-white') : ''}>
									{enableBkash ? (bkashMode === 'live' ? 'LIVE PRODUCTION' : 'SANDBOX TEST') : 'DISABLED'}
								</Badge>
							</div>
							<p class="text-xs text-pink-900/80 mt-0.5">
								বিকাশ অফিসিয়াল টোকেনাইজড পেমেন্ট গেটওয়ে API (v1.2.0-beta)
							</p>
						</div>
					</div>
					<Switch bind:checked={enableBkash} />
				</div>

				{#if enableBkash}
					<div class="p-6 space-y-5 animate-in fade-in duration-200">
						<!-- Mode Selector (Sandbox vs Live) -->
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label class="text-xs font-bold text-slate-700 block">পরিবেশ মোড (Environment)</label>
								<button
									type="button"
									onclick={fillSandboxCredentials}
									class="text-[11px] text-pink-700 hover:text-pink-900 font-bold underline flex items-center gap-1 cursor-pointer"
								>
									<Sparkles class="w-3 h-3" />
									<span>টেস্ট স্যান্ডবক্স ক্রেডেনশিয়াল লোড করুন</span>
								</button>
							</div>
							<div class="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
								<button
									type="button"
									onclick={() => (bkashMode = 'sandbox')}
									class="py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer {bkashMode === 'sandbox' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
								>
									Sandbox (টেস্ট মোড)
								</button>
								<button
									type="button"
									onclick={() => (bkashMode = 'live')}
									class="py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer {bkashMode === 'live' ? 'bg-[#d12053] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
								>
									Live (রিয়েল প্রোডাকশন মোড)
								</button>
							</div>
						</div>

						<!-- Credentials Grid -->
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<!-- App Key -->
							<div class="space-y-1.5">
								<label for="bkash-app-key" class="text-xs font-bold text-slate-700 block">
									bKash App Key <span class="text-red-500">*</span>
								</label>
								<Input
									id="bkash-app-key"
									type="text"
									bind:value={bkashAppKey}
									placeholder="e.g. 4f6o0cjiki2rfm34kfd..."
									class="font-mono text-xs rounded-xl"
								/>
							</div>

							<!-- App Secret -->
							<div class="space-y-1.5">
								<div class="flex items-center justify-between">
									<label for="bkash-app-secret" class="text-xs font-bold text-slate-700">
										bKash App Secret <span class="text-red-500">*</span>
									</label>
									<button
										type="button"
										onclick={() => (showBkashSecret = !showBkashSecret)}
										class="text-[11px] text-slate-400 hover:text-slate-700"
									>
										{showBkashSecret ? 'Hide' : 'Show'}
									</button>
								</div>
								<div class="relative">
									<Input
										id="bkash-app-secret"
										type={showBkashSecret ? 'text' : 'password'}
										bind:value={bkashAppSecret}
										placeholder="e.g. 2is7hdktrekvrbljjh4..."
										class="font-mono text-xs rounded-xl pr-9"
									/>
									<button
										type="button"
										onclick={() => (showBkashSecret = !showBkashSecret)}
										class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
									>
										{#if showBkashSecret}
											<EyeOff class="w-3.5 h-3.5" />
										{:else}
											<Eye class="w-3.5 h-3.5" />
										{/if}
									</button>
								</div>
							</div>

							<!-- Merchant Username -->
							<div class="space-y-1.5">
								<label for="bkash-username" class="text-xs font-bold text-slate-700 block">
									Merchant Username <span class="text-red-500">*</span>
								</label>
								<Input
									id="bkash-username"
									type="text"
									bind:value={bkashUsername}
									placeholder="e.g. 017XXXXXXXX বা Merchant Portal User"
									class="font-mono text-xs rounded-xl"
								/>
							</div>

							<!-- Merchant Password -->
							<div class="space-y-1.5">
								<div class="flex items-center justify-between">
									<label for="bkash-password" class="text-xs font-bold text-slate-700">
										Merchant Password <span class="text-red-500">*</span>
									</label>
									<button
										type="button"
										onclick={() => (showBkashPassword = !showBkashPassword)}
										class="text-[11px] text-slate-400 hover:text-slate-700"
									>
										{showBkashPassword ? 'Hide' : 'Show'}
									</button>
								</div>
								<div class="relative">
									<Input
										id="bkash-password"
										type={showBkashPassword ? 'text' : 'password'}
										bind:value={bkashPassword}
										placeholder="Portal API Password"
										class="font-mono text-xs rounded-xl pr-9"
									/>
									<button
										type="button"
										onclick={() => (showBkashPassword = !showBkashPassword)}
										class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
									>
										{#if showBkashPassword}
											<EyeOff class="w-3.5 h-3.5" />
										{:else}
											<Eye class="w-3.5 h-3.5" />
										{/if}
									</button>
								</div>
							</div>
						</div>

						<!-- Test Connection Action Button & Feedback -->
						<div class="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
							<p class="text-[11px] text-slate-500">
								সেটিংস সেভ করার আগে bKash সার্ভারের সাথে অথেনটিকেশন ও টোকেন টেস্ট করুন
							</p>

							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={isTestingBkash}
								onclick={handleTestBkash}
								class="gap-1.5 border-pink-300 text-pink-700 hover:bg-pink-50 rounded-xl font-bold cursor-pointer shrink-0"
							>
								{#if isTestingBkash}
									<Loader2 class="w-3.5 h-3.5 animate-spin text-pink-600" />
									<span>টেস্ট হচ্ছে...</span>
								{:else}
									<Zap class="w-3.5 h-3.5" />
									<span>Test bKash Connection</span>
								{/if}
							</Button>
						</div>

						{#if testFeedback}
							<div class="p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in {testFeedback.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'}">
								{#if testFeedback.success}
									<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
								{:else}
									<AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
								{/if}
								<div class="flex-1">
									<strong class="font-bold block">
										{testFeedback.success ? 'কানেকশন সফল:' : 'কানেকশন ব্যর্থ:'}
									</strong>
									<span class="text-[11px]">{testFeedback.message}</span>
								</div>
								{#if testFeedback.mode}
									<Badge variant="outline" class="text-[10px] uppercase font-mono">
										{testFeedback.mode}
									</Badge>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</Card>

			<!-- 3. Nagad Gateway -->
			<Card class="bg-white border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden border-orange-200/60">
				<div class="p-5 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-2xl bg-[#ea5424] flex items-center justify-center text-white shrink-0 font-bold text-xs shadow-xs">
							Nagad
						</div>
						<div>
							<div class="flex items-center gap-2">
								<h3 class="text-sm font-bold text-slate-900">Nagad Payment Gateway</h3>
								<Badge variant={enableNagad ? 'default' : 'secondary'} class={enableNagad ? 'bg-orange-600 text-[10px]' : 'text-[10px]'}>
									{enableNagad ? 'ACTIVE' : 'OFF'}
								</Badge>
							</div>
							<p class="text-xs text-slate-500 mt-0.5">
								নগদ ডিজিটাল পেমেন্ট মার্চেন্ট অ্যাকাউন্ট
							</p>
						</div>
					</div>
					<Switch bind:checked={enableNagad} />
				</div>

				{#if enableNagad}
					<div class="p-6 pt-0 space-y-3">
						<div class="space-y-1.5">
							<label for="nagad-merchant" class="text-xs font-bold text-slate-700 block">
								Nagad Merchant ID
							</label>
							<Input
								id="nagad-merchant"
								type="text"
								bind:value={nagadMerchantId}
								placeholder="e.g. 680XXXXXXXX"
								class="font-mono text-xs rounded-xl max-w-sm"
							/>
						</div>
					</div>
				{/if}
			</Card>

			<!-- 4. SSLCommerz Gateway -->
			<Card class="bg-white border-slate-200/90 shadow-2xs rounded-3xl overflow-hidden">
				<div class="p-5 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-white shrink-0 font-bold text-xs">
							SSL
						</div>
						<div>
							<div class="flex items-center gap-2">
								<h3 class="text-sm font-bold text-slate-900">SSLCommerz (কার্ড ও নেট ব্যাংকিং)</h3>
								<Badge variant={enableSSLCommerz ? 'default' : 'secondary'} class={enableSSLCommerz ? 'bg-blue-600 text-[10px]' : 'text-[10px]'}>
									{enableSSLCommerz ? 'ACTIVE' : 'OFF'}
								</Badge>
							</div>
							<p class="text-xs text-slate-500 mt-0.5">
								ভিসা, মাস্টারকার্ড, অ্যামেক্স ও বাংলাদেশের সকল ব্যাংক কার্ড
							</p>
						</div>
					</div>
					<Switch bind:checked={enableSSLCommerz} />
				</div>

				{#if enableSSLCommerz}
					<div class="p-6 pt-0 space-y-3">
						<div class="space-y-1.5">
							<label for="ssl-store-id" class="text-xs font-bold text-slate-700 block">
								SSLCommerz Store ID
							</label>
							<Input
								id="ssl-store-id"
								type="text"
								bind:value={sslStoreId}
								placeholder="e.g. aura_live_store"
								class="font-mono text-xs rounded-xl max-w-sm"
							/>
						</div>
					</div>
				{/if}
			</Card>
		</div>

		<!-- Right: Safety & Guidelines (1 Col) -->
		<div class="space-y-6">
			<!-- Zero-Risk Architecture Card -->
			<Card class="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border-emerald-200/80 shadow-2xs rounded-3xl">
				<div class="p-5 space-y-3.5 text-xs text-emerald-950/80 leading-relaxed">
					<div class="flex items-center gap-2 font-bold text-emerald-900 text-sm">
						<ShieldCheck class="w-4 h-4 text-emerald-600" />
						<span>জিরো-রিস্ক সিকিউরিটি ফ্রেমওয়ার্ক</span>
					</div>

					<div class="space-y-2">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
							<div>
								<strong class="text-slate-900 block font-bold">সিক্রেট মাস্কিং:</strong>
								App Secret এবং পাসওয়ার্ড সবসময় সার্ভার সাইডে এনক্রিপ্ট হয়ে সংরক্ষিত থাকে, ক্লায়েন্ট ব্রাউজারে কখনো এক্সপোজ হয় না।
							</div>
						</div>

						<div class="flex items-start gap-2">
							<CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
							<div>
								<strong class="text-slate-900 block font-bold">ট্যাম্পারিং রোধ:</strong>
								টাকার পরিমাণ (Amount) ক্লায়েন্ট ইনপুট থেকে গ্রহণ না করে সার্ভার সাইডে যাচাইকৃত আইটেম ও ডেলিভারি চার্জ থেকে ক্যালকুলেট হয়।
							</div>
						</div>

						<div class="flex items-start gap-2">
							<CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
							<div>
								<strong class="text-slate-900 block font-bold">সার্ভার-টু-সার্ভার এক্সিকিউট:</strong>
								কাস্টমারের ওটিপি/পিন ভ্যালিডেশনের পর bKash সরাসরি ব্যাকএন্ড কলব্যাক রুটকে পেমেন্ট আইডি দেয়, যা সাথে সাথে `executePayment` কল করে নিশ্চিত করে।
							</div>
						</div>
					</div>
				</div>
			</Card>

			<!-- Sandbox Testing Guide -->
			<Card class="bg-white border-slate-200/90 shadow-2xs rounded-3xl">
				<div class="p-5 space-y-3 text-xs text-slate-600">
					<h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
						<Info class="w-4 h-4 text-pink-600" />
						<span>বিকাশ স্যান্ডবক্স টেস্ট করবেন যেভাবে</span>
					</h4>

					<ol class="list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
						<li>উপরে <strong>"টেস্ট স্যান্ডবক্স ক্রেডেনশিয়াল লোড করুন"</strong> বাটনে ক্লিক করুন।</li>
						<li><strong>"Test bKash Connection"</strong> বাটনে ক্লিক করে ভ্যালিডেশন চেক করুন।</li>
						<li>স্টোরফ্রন্ট চেকআউটে গিয়ে যেকোনো অর্ডারে বিকাশ সিলেক্ট করুন।</li>
						<li>টেস্ট ওয়ালেট: <code class="font-mono bg-slate-100 px-1 py-0.5 rounded text-pink-700">01770618575</code></li>
						<li>টেস্ট OTP: <code class="font-mono bg-slate-100 px-1 py-0.5 rounded text-pink-700">123456</code></li>
						<li>টেস্ট PIN: <code class="font-mono bg-slate-100 px-1 py-0.5 rounded text-pink-700">12121</code></li>
					</ol>
				</div>
			</Card>
		</div>
	</div>
</div>
