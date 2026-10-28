<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Card } from '#lib/components/ui';
	import { toast } from 'svelte-sonner';
	import {
		CheckCircle2,
		Camera,
		Lock,
		X,
		KeyRound,
		ShieldCheck,
		Loader2,
		UploadCloud,
		Link2
	} from 'lucide-svelte';

	let { data, form } = $props();

	// Reactive Profile State
	let profile = $derived(data?.profile || {});
	let adminId = $derived(profile.id || '1');
	let name = $state(profile.name || 'Thecolorlighthouse');
	let username = $state(profile.username || 'thecolorlighthouse');
	let phoneNumber = $state(profile.phone || '01780081623');
	let emailAddress = $state(profile.email || 'contact@thecolorlighthouse.com');
	let role = $derived(profile.role || 'OWNER');
	let avatarImage = $state<string | null>(profile.avatarUrl || null);

	// Synchronize when server updates data
	$effect(() => {
		if (data?.profile) {
			name = data.profile.name || '';
			username = data.profile.username || '';
			phoneNumber = data.profile.phone || '';
			emailAddress = data.profile.email || '';
			avatarImage = data.profile.avatarUrl || null;
		}
	});

	// Date displays
	let createdAtDisplay = $derived(
		profile.createdAt
			? new Date(profile.createdAt).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric'
				})
			: 'Sep 3, 2025'
	);

	let updatedAtDisplay = $derived(
		profile.updatedAt
			? new Date(profile.updatedAt).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric'
				})
			: 'Oct 28, 2026'
	);

	// Loading & Modal States
	let isSubmittingProfile = $state(false);
	let isSubmittingPassword = $state(false);
	let isSubmittingAvatar = $state(false);

	let isChangePasswordOpen = $state(false);
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	let isPickImageOpen = $state(false);
	let directImageUrl = $state('');
	let avatarFormElement: HTMLFormElement | null = $state(null);
	let avatarInputUrl = $state('');

	function handleLocalFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			if (file.size > 3 * 1024 * 1024) {
				toast.error('ফাইলের সাইজ ৩ মেগাবাইটের কম হতে হবে!');
				return;
			}
			const reader = new FileReader();
			reader.onload = () => {
				const base64Url = reader.result as string;
				avatarInputUrl = base64Url;
				avatarImage = base64Url;
				submitAvatarForm();
			};
			reader.readAsDataURL(file);
		}
	}

	function handleDirectUrlSubmit(e: Event) {
		e.preventDefault();
		if (!directImageUrl.trim()) return;
		avatarInputUrl = directImageUrl.trim();
		avatarImage = directImageUrl.trim();
		submitAvatarForm();
	}

	function submitAvatarForm() {
		setTimeout(() => {
			if (avatarFormElement) {
				avatarFormElement.requestSubmit();
			}
		}, 20);
	}
</script>

<svelte:head>
	<title>Profile Settings | AURA Enterprise</title>
</svelte:head>

<div class="space-y-6 max-w-6xl mx-auto pb-16 font-['Anek_Bangla',sans-serif]">

	<!-- Header Title -->
	<div class="flex items-center justify-between gap-4 pt-1">
		<div>
			<h1 class="text-xl font-bold text-slate-900 tracking-tight">Admin Profile</h1>
			<p class="text-xs text-slate-500 mt-0.5">আপনার অ্যাডমিন প্রোফাইল তথ্য, সিকিউরিটি ও পাসওয়ার্ড পরিচালনা করুন</p>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold flex items-center gap-1.5">
				<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
				<span>Cloudflare D1 Live</span>
			</span>
		</div>
	</div>

	<!-- Main Profile Card Container -->
	<Card class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-10">
		<div class="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
			
			<!-- Left Column: Circular Avatar & Action Buttons -->
			<div class="md:col-span-4 lg:col-span-3 flex flex-col items-center text-center space-y-4">
				
				<!-- Large Profile Logo / Circular Avatar -->
				<div class="w-44 h-44 rounded-full bg-black flex items-center justify-center p-3 text-center border-4 border-slate-100 shadow-md relative overflow-hidden group">
					{#if avatarImage}
						<img src={avatarImage} alt="Avatar" class="w-full h-full object-cover rounded-full" />
					{:else}
						<!-- Exact "COLOR LIGHT HOUSE" Logo -->
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
						class="absolute inset-0 bg-black/55 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer text-xs font-semibold"
					>
						<Camera class="w-5 h-5 text-indigo-300" />
						<span>Change Photo</span>
					</button>
				</div>

				<!-- Action Buttons (Pick Image & Change Password) -->
				<div class="w-full max-w-[200px] space-y-2.5 pt-2">
					<button
						type="button"
						onclick={() => (isPickImageOpen = true)}
						class="w-full py-2 px-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer block text-center"
					>
						Pick Image
					</button>

					<button
						type="button"
						onclick={() => (isChangePasswordOpen = true)}
						class="w-full py-2 px-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer block text-center"
					>
						Change Password
					</button>
				</div>

			</div>

			<!-- Center / Main Column: Personal & Contact Information -->
			<div class="md:col-span-8 lg:col-span-6 space-y-6">
				
				<!-- Real SvelteKit Action Form -->
				<form
					action="?/updateProfile"
					method="POST"
					use:enhance={() => {
						isSubmittingProfile = true;
						return async ({ result, update }) => {
							isSubmittingProfile = false;
							if (result.type === 'success') {
								toast.success(result.data?.message || 'প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!');
							} else if (result.type === 'failure') {
								toast.error(result.data?.message || 'আপডেট ব্যর্থ হয়েছে!');
							}
							await update({ reset: false });
						};
					}}
					class="space-y-6"
				>
					<input type="hidden" name="adminId" value={adminId} />
					
					<!-- 1. Personal Information Section -->
					<div class="space-y-4">
						<h3 class="text-xs font-bold text-slate-500 tracking-wide uppercase">Personal Information:</h3>

						<!-- Name* Field -->
						<div class="relative">
							<fieldset class="border border-slate-200 rounded-xl px-3.5 pb-2 pt-1 transition-colors focus-within:border-[#5845eb] focus-within:ring-2 focus-within:ring-[#5845eb]/10">
								<legend class="text-[11px] font-semibold text-slate-500 px-1">Name*</legend>
								<input
									type="text"
									name="name"
									bind:value={name}
									required
									placeholder="Admin full name"
									class="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
								/>
							</fieldset>
						</div>

						<!-- User Name* Field -->
						<div class="relative">
							<fieldset class="border border-slate-200 rounded-xl px-3.5 pb-2 pt-1 transition-colors focus-within:border-[#5845eb] focus-within:ring-2 focus-within:ring-[#5845eb]/10">
								<legend class="text-[11px] font-semibold text-slate-500 px-1">User Name*</legend>
								<input
									type="text"
									name="username"
									bind:value={username}
									required
									placeholder="username"
									class="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none font-mono"
								/>
							</fieldset>
						</div>

						<!-- Created At Field (Readonly) -->
						<div class="relative">
							<fieldset class="border border-slate-200 rounded-xl px-3.5 pb-2 pt-1 bg-slate-50/60">
								<legend class="text-[11px] font-semibold text-slate-400 px-1">Created At</legend>
								<input
									type="text"
									readonly
									value={createdAtDisplay}
									class="w-full bg-transparent text-sm font-semibold text-slate-600 focus:outline-none cursor-not-allowed"
								/>
							</fieldset>
						</div>

						<!-- Updated At Field (Readonly) -->
						<div class="relative">
							<fieldset class="border border-slate-200 rounded-xl px-3.5 pb-2 pt-1 bg-slate-50/60">
								<legend class="text-[11px] font-semibold text-slate-400 px-1">Updated At</legend>
								<input
									type="text"
									readonly
									value={updatedAtDisplay}
									class="w-full bg-transparent text-sm font-semibold text-slate-600 focus:outline-none cursor-not-allowed"
								/>
							</fieldset>
						</div>
					</div>

					<!-- 2. Contact Information Section -->
					<div class="space-y-4 pt-2">
						<h3 class="text-xs font-bold text-slate-500 tracking-wide uppercase">Contact Information:</h3>

						<!-- Phone Number Field -->
						<div class="relative">
							<fieldset class="border border-slate-200 rounded-xl px-3.5 pb-2 pt-1 transition-colors focus-within:border-[#5845eb] focus-within:ring-2 focus-within:ring-[#5845eb]/10">
								<legend class="text-[11px] font-semibold text-slate-500 px-1">Phone Number</legend>
								<input
									type="text"
									name="phone"
									bind:value={phoneNumber}
									placeholder="017xxxxxxxx"
									class="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none font-mono"
								/>
							</fieldset>
						</div>

						<!-- Email Address Field -->
						<div class="relative">
							<fieldset class="border border-slate-200 rounded-xl px-3.5 pb-2 pt-1 transition-colors focus-within:border-[#5845eb] focus-within:ring-2 focus-within:ring-[#5845eb]/10">
								<legend class="text-[11px] font-semibold text-slate-500 px-1">Email Address*</legend>
								<input
									type="email"
									name="email"
									bind:value={emailAddress}
									required
									placeholder="admin@example.com"
									class="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none font-mono"
								/>
							</fieldset>
						</div>
					</div>

					<!-- Bottom Right: Update Profile Button -->
					<div class="flex justify-end pt-3">
						<Button
							type="submit"
							disabled={isSubmittingProfile}
							class="bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer flex items-center gap-2"
						>
							{#if isSubmittingProfile}
								<Loader2 class="w-4 h-4 animate-spin" />
								<span>সংরক্ষণ হচ্ছে...</span>
							{:else}
								<span>Update Profile</span>
							{/if}
						</Button>
					</div>

				</form>

			</div>

			<!-- Right Column: Role Badge -->
			<div class="md:col-span-12 lg:col-span-3 space-y-3">
				<span class="text-xs font-bold text-slate-500 block uppercase">Role :</span>
				
				<!-- Large OWNER Box -->
				<div class="p-4 rounded-xl bg-slate-50/90 border border-slate-200/90 flex items-center justify-between shadow-2xs">
					<div>
						<span class="text-base font-black text-[#1d6ee5] tracking-wide block uppercase">
							{role}
						</span>
						<span class="text-[11px] text-slate-400 font-medium">Full Access Admin</span>
					</div>
					<ShieldCheck class="w-6 h-6 text-[#1d6ee5]" />
				</div>

				<div class="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1">
					<div class="font-bold flex items-center gap-1.5 text-[#5845eb]">
						<CheckCircle2 class="w-4 h-4" />
						<span>Database Connected</span>
					</div>
					<p class="text-[11px] text-slate-600">সব তথ্য Cloudflare D1-এর <code>admin_users</code> টেবিলে রিয়েল-টাইমে সংরক্ষিত হচ্ছে।</p>
				</div>
			</div>

		</div>
	</Card>

</div>

<!-- Hidden Avatar Form Action -->
<form
	bind:this={avatarFormElement}
	action="?/updateAvatar"
	method="POST"
	use:enhance={() => {
		isSubmittingAvatar = true;
		return async ({ result, update }) => {
			isSubmittingAvatar = false;
			isPickImageOpen = false;
			if (result.type === 'success') {
				toast.success(result.data?.message || 'প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!');
			} else if (result.type === 'failure') {
				toast.error(result.data?.message || 'ছবি আপডেট ব্যর্থ হয়েছে!');
			}
			await update({ reset: false });
		};
	}}
	class="hidden"
>
	<input type="hidden" name="adminId" value={adminId} />
	<input type="hidden" name="avatarUrl" value={avatarInputUrl} />
</form>

<!-- Pick Image Modal -->
{#if isPickImageOpen}
	<div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
			<div class="flex items-center justify-between pb-3 border-b border-slate-100">
				<div class="flex items-center gap-2">
					<Camera class="w-5 h-5 text-[#5845eb]" />
					<h3 class="text-base font-bold text-slate-900">Upload Profile Photo</h3>
				</div>
				<button
					type="button"
					onclick={() => (isPickImageOpen = false)}
					class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Option 1: File Upload -->
			<div class="space-y-2">
				<span class="text-xs font-bold text-slate-700">১. কম্পিউটার থেকে ফাইল সিলেক্ট করুন:</span>
				<label class="border-2 border-dashed border-slate-200 hover:border-[#5845eb] hover:bg-indigo-50/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50/50">
					{#if isSubmittingAvatar}
						<Loader2 class="w-8 h-8 text-[#5845eb] animate-spin" />
						<span class="text-xs font-semibold text-slate-600">ছবি সেভ হচ্ছে...</span>
					{:else}
						<UploadCloud class="w-8 h-8 text-slate-400 group-hover:text-[#5845eb]" />
						<span class="text-xs font-semibold text-slate-700">ফাইল আপলোড করতে ক্লিক করুন</span>
						<span class="text-[10px] text-slate-400">PNG, JPG বা WebP (সর্বোচ্চ ৩ মেগাবাইট)</span>
					{/if}
					<input type="file" accept="image/*" onchange={handleLocalFileSelect} class="hidden" />
				</label>
			</div>

			<!-- Option 2: Image URL -->
			<form onsubmit={handleDirectUrlSubmit} class="space-y-2 pt-2 border-t border-slate-100">
				<span class="text-xs font-bold text-slate-700">২. অথবা সরাসরি ইমেজের ওয়েব লিংক দিন:</span>
				<div class="flex items-center gap-2">
					<div class="relative flex-1">
						<Link2 class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
						<Input
							type="url"
							bind:value={directImageUrl}
							placeholder="https://example.com/avatar.jpg"
							class="pl-9 text-xs"
						/>
					</div>
					<Button type="submit" size="sm" class="bg-[#5845eb] hover:bg-indigo-700 text-white font-bold text-xs px-4">
						সেভ করুন
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Change Password Modal -->
{#if isChangePasswordOpen}
	<div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 font-['Anek_Bangla',sans-serif]">
			
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
					class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<form
				action="?/changePassword"
				method="POST"
				use:enhance={() => {
					isSubmittingPassword = true;
					return async ({ result, update }) => {
						isSubmittingPassword = false;
						if (result.type === 'success') {
							toast.success(result.data?.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
							isChangePasswordOpen = false;
							currentPassword = '';
							newPassword = '';
							confirmPassword = '';
						} else if (result.type === 'failure') {
							toast.error(result.data?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে!');
						}
						await update({ reset: false });
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="adminId" value={adminId} />

				<div class="space-y-1.5">
					<label for="cur-pass" class="text-xs font-bold text-slate-700">Current Password (বর্তমান পাসওয়ার্ড)</label>
					<Input
						id="cur-pass"
						type="password"
						name="currentPassword"
						bind:value={currentPassword}
						placeholder="••••••••"
						class="text-xs font-mono"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="new-pass" class="text-xs font-bold text-slate-700">New Password (নতুন পাসওয়ার্ড)*</label>
					<Input
						id="new-pass"
						type="password"
						name="newPassword"
						bind:value={newPassword}
						required
						minlength="6"
						placeholder="Minimum 6 characters"
						class="text-xs font-mono"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="confirm-pass" class="text-xs font-bold text-slate-700">Confirm New Password (পাসওয়ার্ড নিশ্চিত করুন)*</label>
					<Input
						id="confirm-pass"
						type="password"
						name="confirmPassword"
						bind:value={confirmPassword}
						required
						minlength="6"
						placeholder="Re-type new password"
						class="text-xs font-mono"
					/>
				</div>

				<div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (isChangePasswordOpen = false)}
						class="cursor-pointer"
					>
						বাতিল
					</Button>
					<Button
						type="submit"
						size="sm"
						disabled={isSubmittingPassword}
						class="bg-[#5845eb] hover:bg-[#4936d6] text-white font-bold cursor-pointer flex items-center gap-1.5"
					>
						{#if isSubmittingPassword}
							<Loader2 class="w-3.5 h-3.5 animate-spin" />
							<span>পরিবর্তন হচ্ছে...</span>
						{:else}
							<span>Update Password</span>
						{/if}
					</Button>
				</div>
			</form>

		</div>
	</div>
{/if}
