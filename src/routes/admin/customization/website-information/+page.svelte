<script lang="ts">
	import {
		Button,
		Input,
		Textarea,
		Card,
		CardContent,
		Alert,
		AlertDescription
	} from '#lib/components/ui';
	import {
		Upload,
		Plus,
		Trash2,
		CheckCircle2,
		Globe,
		Building2,
		Mail,
		Phone,
		Save,
		Info
	} from 'lucide-svelte';

	let websiteName = $state('thecolorlighthouse');
	let shortDescription = $state('A Best Online shop in Bangladesh. All the product are available online.');
	let whatsappNumber = $state('+8801860229546');

	let addresses = $state<string[]>([
		'Nawabpur Kaptan Bazar Complex Dhaka, Bangladesh'
	]);

	let emails = $state<string[]>([
		'support@thecolorlighthouse.com'
	]);

	let logoUrl = $state('/images/products/window-sticker.svg');
	let faviconUrl = $state('/images/products/window-sticker.svg');

	let toastMessage = $state<string | null>(null);

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			toastMessage = null;
		}, 3000);
	}

	function addAddress() {
		addresses = [...addresses, ''];
	}

	function removeAddress(index: number) {
		addresses = addresses.filter((_, i) => i !== index);
	}

	function addEmail() {
		emails = [...emails, ''];
	}

	function removeEmail(index: number) {
		emails = emails.filter((_, i) => i !== index);
	}

	function handleSave(e: SubmitEvent) {
		e.preventDefault();
		showToast('ওয়েবসাইটের তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');
	}
</script>

<svelte:head>
	<title>Website Information - Customization - AURA Admin</title>
</svelte:head>

<!-- Toast Alert -->
{#if toastMessage}
	<div class="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
		<CheckCircle2 class="w-4 h-4 text-emerald-400" />
		<span>{toastMessage}</span>
	</div>
{/if}

<div class="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
	<!-- Page Centered Heading -->
	<div class="text-center">
		<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
			Website Information
		</h2>
	</div>

	<form onsubmit={handleSave} class="space-y-8">
		<!-- 1. Logo Section -->
		<div class="flex flex-col items-center justify-center space-y-3">
			<div class="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-2 flex flex-col items-center justify-center shadow-2xs hover:border-[#5845eb] transition-colors cursor-pointer group">
				<div class="flex flex-col items-center justify-center text-center">
					<div class="w-10 h-8 flex items-center justify-center">
						<svg class="w-8 h-8 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
							<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
							<polyline points="9 21 9 12 15 12 15 21" />
						</svg>
					</div>
					<span class="text-[7.5px] font-black uppercase text-pink-500 tracking-tighter leading-none mt-1">
						The<br/>COLOR<br/>LIGHT<br/>- HOUSE -
					</span>
				</div>
			</div>

			<!-- Green Info Banner using shadcn Alert -->
			<div class="w-full max-w-xl">
				<Alert class="bg-emerald-50/80 border-emerald-200 text-emerald-800 text-center py-2 px-4 rounded-xl">
					<AlertDescription class="text-[11px] sm:text-xs font-semibold text-emerald-800">
						The website logo should be horizontal, (256x56px)
					</AlertDescription>
				</Alert>
			</div>
		</div>

		<!-- 2. Favicon Section -->
		<div class="flex flex-col items-center justify-center space-y-3">
			<div class="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-2 flex flex-col items-center justify-center shadow-2xs hover:border-[#5845eb] transition-colors cursor-pointer group">
				<div class="flex flex-col items-center justify-center text-center">
					<div class="w-10 h-8 flex items-center justify-center">
						<svg class="w-8 h-8 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
							<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
							<polyline points="9 21 9 12 15 12 15 21" />
						</svg>
					</div>
					<span class="text-[7.5px] font-black uppercase text-pink-500 tracking-tighter leading-none mt-1">
						The<br/>COLOR<br/>LIGHT<br/>- HOUSE -
					</span>
				</div>
			</div>

			<!-- Green Info Banner for Favicon -->
			<div class="w-full max-w-xl">
				<Alert class="bg-emerald-50/80 border-emerald-200 text-emerald-800 text-center py-2 px-4 rounded-xl">
					<AlertDescription class="text-[11px] sm:text-xs font-semibold text-emerald-800">
						A small image displayed in the browser tab, typically sized at 32x32 pixels.
					</AlertDescription>
				</Alert>
			</div>
		</div>

		<!-- 3. Form Input Fields using shadcn components -->
		<div class="space-y-5 max-w-2xl mx-auto">
			<!-- Website Name -->
			<div class="space-y-1.5">
				<label for="site-name" class="block text-xs font-medium text-slate-500">
					Website Name *
				</label>
				<Input
					id="site-name"
					type="text"
					bind:value={websiteName}
					required
					class="rounded-2xl h-12 text-sm font-semibold focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
				/>
			</div>

			<!-- Short Description -->
			<div class="space-y-1.5">
				<label for="site-desc" class="block text-xs font-medium text-slate-500">
					Short Description
				</label>
				<Input
					id="site-desc"
					type="text"
					bind:value={shortDescription}
					class="rounded-2xl h-12 text-sm font-normal focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
				/>
			</div>

			<!-- Whatsapp Number -->
			<div class="space-y-1.5">
				<label for="whatsapp" class="block text-xs font-medium text-slate-500">
					Whatsapp Number
				</label>
				<Input
					id="whatsapp"
					type="text"
					bind:value={whatsappNumber}
					class="rounded-2xl h-12 text-sm font-mono font-semibold focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
				/>
			</div>

			<!-- Addresses Section using shadcn Button & Textarea -->
			<div class="space-y-3 pt-2">
				<Button
					type="button"
					onclick={addAddress}
					size="sm"
					class="rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white px-4 py-2 text-xs font-bold gap-1.5 shadow-md shadow-indigo-500/20"
				>
					<Plus class="w-3.5 h-3.5 stroke-[2.5]" />
					<span>Add New Address</span>
				</Button>

				{#each addresses as _, index}
					<div class="flex items-start gap-3">
						<div class="flex-1 space-y-1.5">
							<label for="address-{index}" class="block text-xs font-medium text-slate-500">
								Type Address {index + 1} *
							</label>
							<Textarea
								id="address-{index}"
								bind:value={addresses[index]}
								rows={2}
								class="rounded-2xl p-3 text-xs sm:text-sm font-medium focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
							/>
						</div>

						<Button
							type="button"
							variant="destructive"
							size="icon"
							onclick={() => removeAddress(index)}
							class="w-10 h-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white shrink-0 mt-6 shadow-md shadow-rose-500/20"
							title="ঠিকানা মুছুন"
						>
							<Trash2 class="w-4 h-4" />
						</Button>
					</div>
				{/each}
			</div>

			<!-- Email Section using shadcn Button & Input -->
			<div class="space-y-3 pt-2">
				<Button
					type="button"
					onclick={addEmail}
					size="sm"
					class="rounded-xl bg-[#5845eb] hover:bg-[#4936d6] text-white px-4 py-2 text-xs font-bold gap-1.5 shadow-md shadow-indigo-500/20"
				>
					<Plus class="w-3.5 h-3.5 stroke-[2.5]" />
					<span>Add New Email</span>
				</Button>

				{#each emails as _, index}
					<div class="flex items-start gap-3">
						<div class="flex-1 space-y-1.5">
							<label for="email-{index}" class="block text-xs font-medium text-slate-500">
								Type Email {index + 1} *
							</label>
							<Input
								id="email-{index}"
								type="email"
								bind:value={emails[index]}
								class="rounded-2xl h-11 text-xs sm:text-sm font-mono font-medium focus-visible:ring-[#5845eb]/15 focus-visible:border-[#5845eb]"
							/>
						</div>

						<Button
							type="button"
							variant="destructive"
							size="icon"
							onclick={() => removeEmail(index)}
							class="w-10 h-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white shrink-0 mt-6 shadow-md shadow-rose-500/20"
							title="ইমেইল মুছুন"
						>
							<Trash2 class="w-4 h-4" />
						</Button>
					</div>
				{/each}
			</div>

			<!-- Save Button using shadcn Button -->
			<div class="pt-6 text-center">
				<Button
					type="submit"
					size="lg"
					class="rounded-2xl bg-[#5845eb] hover:bg-[#4936d6] text-white px-8 py-3.5 text-sm font-bold shadow-lg shadow-indigo-500/30 gap-2 active:scale-95"
				>
					<Save class="w-4 h-4" />
					<span>Save Information</span>
				</Button>
			</div>
		</div>
	</form>
</div>
