<script lang="ts">
	import { Button, Input, Card } from '#lib/components/ui';
	import {
		CheckCircle2,
		Camera,
		Lock,
		X,
		KeyRound,
		ShieldCheck
	} from 'lucide-svelte';

	// Profile Form State
	let name = $state('Thecolorlighthouse');
	let username = $state('Thecolorlighthouse');
	let createdAt = $state('Sep 3, 2025');
	let updatedAt = $state('Oct 22, 2026');
	let phoneNumber = $state('01780081623');
	let emailAddress = $state('admin@thecolorlighthouse.com');
	let role = $state('OWNER');

	// Image Avatar state
	let avatarImage = $state<string | null>(null);

	// Modals
	let isChangePasswordOpen = $state(false);
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	let isPickImageOpen = $state(false);

	// Toast Feedback
	let toastMessage = $state<string | null>(null);
	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => (toastMessage = null), 3000);
	}

	function handleUpdateProfile(e: Event) {
		e.preventDefault();
		updatedAt = new Date().toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
		showToast('প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!');
	}

	function handleChangePassword(e: Event) {
		e.preventDefault();
		if (!newPassword || newPassword !== confirmPassword) {
			alert('নতুন পাসওয়ার্ড মেলেনি!');
			return;
		}
		isChangePasswordOpen = false;
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
		showToast('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
	}

	function handleImageUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				avatarImage = reader.result as string;
				isPickImageOpen = false;
				showToast('প্রোফাইল ছবি পরিবর্তন সম্পন্ন হয়েছে!');
			};
			reader.readAsDataURL(file);
		}
	}
</script>

<svelte:head>
	<title>Profile Settings | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-6xl mx-auto pb-16">

	<!-- Toast Message -->
	{#if toastMessage}
		<div class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
			<CheckCircle2 class="w-4 h-4 text-emerald-400" />
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Header Title -->
	<div class="flex items-center justify-between gap-4 pt-1">
		<h1 class="text-xl font-bold text-slate-900 tracking-tight">Profile</h1>
	</div>

	<!-- Main Profile Card Container (Exact Replica of Reference Image) -->
	<Card class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-10">
		<div class="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
			
			<!-- Left Column: Circular Avatar & Action Buttons -->
			<div class="md:col-span-4 lg:col-span-3 flex flex-col items-center text-center space-y-4">
				
				<!-- Large Profile Logo / Circular Avatar -->
				<div class="w-44 h-44 rounded-full bg-black flex items-center justify-center p-3 text-center border-4 border-slate-100 shadow-md relative overflow-hidden group">
					{#if avatarImage}
						<img src={avatarImage} alt="Avatar" class="w-full h-full object-cover rounded-full" />
					{:else}
						<!-- Exact "COLOR LIGHT HOUSE" Logo in Reference Image -->
						<div class="flex flex-col items-center justify-center select-none">
							<div class="p-2 rounded bg-pink-950/40 border border-pink-500/20">
								<div class="text-[13px] font-black uppercase tracking-wider text-pink-400 leading-none">
									COLOR
								</div>
								<div class="text-[14px] font-black uppercase tracking-widest text-pink-500 leading-tight mt-0.5">
									LIGHT
								</div>
								<div class="text-[8px] font-bold uppercase tracking-[0.25em] text-pink-300/80 leading-none mt-0.5">
									HOUSE
								</div>
							</div>
						</div>
					{/if}

					<!-- Hover Overlay -->
					<button
						type="button"
						onclick={() => (isPickImageOpen = true)}
						class="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer text-xs font-semibold"
					>
						<Camera class="w-5 h-5" />
						<span>Change Photo</span>
					</button>
				</div>

				<!-- Action Buttons (Pick Image & Change Password) -->
				<div class="w-full max-w-[200px] space-y-2.5 pt-2">
					<button
						type="button"
						onclick={() => (isPickImageOpen = true)}
						class="w-full py-2 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer block text-center"
					>
						Pick Image
					</button>

					<button
						type="button"
						onclick={() => (isChangePasswordOpen = true)}
						class="w-full py-2 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer block text-center"
					>
						Change Password
					</button>
				</div>

			</div>

			<!-- Center / Main Column: Personal & Contact Information -->
			<div class="md:col-span-8 lg:col-span-6 space-y-6">
				
				<form onsubmit={handleUpdateProfile} class="space-y-6">
					
					<!-- 1. Personal Information Section -->
					<div class="space-y-4">
						<h3 class="text-xs font-bold text-slate-500 tracking-wide">Personal Information:</h3>

						<!-- Name* Field -->
						<div class="relative">
							<fieldset class="border border-slate-200 rounded-xl px-3.5 pb-2 pt-1 transition-colors focus-within:border-[#5845eb]">
								<legend class="text-[11px] font-semibold text-slate-500 px-1">Name*</legend>
								<input
									type="text"
									bind:value={name}
									required
									class="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
								/>
							</fieldset>
						</div>

						<!-- User Name* Field -->
						<div class="relative">
							<fieldset class="border border-slate-200 rounded-xl px-3.5 pb-2 pt-1 transition-colors focus-within:border-[#5845eb]">
								<legend class="text-[11px] font-semibold text-slate-500 px-1">User Name*</legend>
								<input
									type="text"
									bind:value={username}
									required
									class="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
								/>
							</fieldset>
						</div>

						<!-- Created At Field -->
						<div class="relative">
							<fieldset class="border border-slate-200 rounded-xl px-3.5 pb-2 pt-1 bg-slate-50/40">
								<legend class="text-[11px] font-semibold text-slate-400 px-1">Created At</legend>
								<input
									type="text"
									readonly
									bind:value={createdAt}
									class="w-full bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
								/>
							</fieldset>
						</div>

						<!-- Updated At Field -->
						<div class="relative">
							<fieldset class="border border-slate-200 rounded-xl px-3.5 pb-2 pt-1 bg-slate-50/40">
								<legend class="text-[11px] font-semibold text-slate-400 px-1">Updated At</legend>
								<input
									type="text"
									readonly
									bind:value={updatedAt}
									class="w-full bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
								/>
							</fieldset>
						</div>
					</div>

					<!-- 2. Contact Information Section -->
					<div class="space-y-4 pt-2">
						<h3 class="text-xs font-bold text-slate-500 tracking-wide">Contact Information:</h3>

						<!-- Phone Number Field -->
						<div class="relative">
							<fieldset class="border border-slate-200 rounded-xl px-3.5 pb-2 pt-1 transition-colors focus-within:border-[#5845eb]">
								<legend class="text-[11px] font-semibold text-slate-500 px-1">Phone Number</legend>
								<input
									type="text"
									bind:value={phoneNumber}
									class="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none font-mono"
								/>
							</fieldset>
						</div>

						<!-- Email Address Field -->
						<div class="relative">
							<fieldset class="border border-slate-200 rounded-xl px-3.5 pb-2 pt-1 transition-colors focus-within:border-[#5845eb]">
								<legend class="text-[11px] font-semibold text-slate-500 px-1">Email Address</legend>
								<input
									type="email"
									bind:value={emailAddress}
									placeholder="Email Address"
									class="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
								/>
							</fieldset>
						</div>
					</div>

					<!-- Bottom Right: Update Profile Button -->
					<div class="flex justify-end pt-3">
						<Button
							type="submit"
							class="bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-md shadow-indigo-500/20"
						>
							Update Profile
						</Button>
					</div>

				</form>

			</div>

			<!-- Right Column: Role Badge -->
			<div class="md:col-span-12 lg:col-span-3 space-y-2">
				<span class="text-xs font-bold text-slate-500 block">Role :</span>
				
				<!-- Large OWNER Box -->
				<div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
					<span class="text-base font-black text-[#1d6ee5] tracking-wide">
						{role}
					</span>
					<ShieldCheck class="w-5 h-5 text-[#1d6ee5]" />
				</div>
			</div>

		</div>
	</Card>

</div>

<!-- Pick Image Modal -->
{#if isPickImageOpen}
	<div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
			<div class="flex items-center justify-between pb-3 border-b border-slate-100">
				<h3 class="text-base font-bold text-slate-900">Upload Profile Photo</h3>
				<button
					type="button"
					onclick={() => (isPickImageOpen = false)}
					class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<div class="space-y-3">
				<label class="border-2 border-dashed border-slate-200 hover:border-[#5845eb] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50/50">
					<Camera class="w-8 h-8 text-slate-400" />
					<span class="text-xs font-semibold text-slate-600">Click to choose image file</span>
					<span class="text-[10px] text-slate-400">PNG, JPG or WebP (Max 2MB)</span>
					<input type="file" accept="image/*" onchange={handleImageUpload} class="hidden" />
				</label>
			</div>
		</div>
	</div>
{/if}

<!-- Change Password Modal -->
{#if isChangePasswordOpen}
	<div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
			
			<div class="flex items-center justify-between pb-3 border-b border-slate-100">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#5845eb]">
						<KeyRound class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900">Change Password</h3>
						<p class="text-xs text-slate-500">আপনার অ্যাকাউন্টের নতুন পাসওয়ার্ড সেট করুন</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (isChangePasswordOpen = false)}
					class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<form onsubmit={handleChangePassword} class="space-y-4">
				<div class="space-y-1.5">
					<label for="cur-pass" class="text-xs font-bold text-slate-700">Current Password</label>
					<Input
						id="cur-pass"
						type="password"
						bind:value={currentPassword}
						required
						placeholder="••••••••"
						class="text-xs"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="new-pass" class="text-xs font-bold text-slate-700">New Password</label>
					<Input
						id="new-pass"
						type="password"
						bind:value={newPassword}
						required
						placeholder="Minimum 8 characters"
						class="text-xs"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="confirm-pass" class="text-xs font-bold text-slate-700">Confirm New Password</label>
					<Input
						id="confirm-pass"
						type="password"
						bind:value={confirmPassword}
						required
						placeholder="Re-type new password"
						class="text-xs"
					/>
				</div>

				<div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (isChangePasswordOpen = false)}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						size="sm"
						class="bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold"
					>
						Update Password
					</Button>
				</div>
			</form>

		</div>
	</div>
{/if}
