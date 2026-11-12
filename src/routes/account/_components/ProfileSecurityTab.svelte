<script lang="ts">
	import { User, Lock, Mail, Phone, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-svelte';
	import { Button, Input } from '#lib/components/ui';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	interface Props {
		user: any;
		customer: any;
	}

	let { user, customer }: Props = $props();

	// Profile Form States
	let name = $state(user?.name || '');
	let phone = $state(customer?.phone || '');
	let isSavingProfile = $state(false);

	// Password Form States
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let isChangingPassword = $state(false);
</script>

<div class="space-y-6 font-['Anek_Bangla',sans-serif]">
	<!-- Section 1: Personal Details (ব্যক্তিগত প্রোফাইল) -->
	<div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
		<div class="flex items-center gap-3 pb-4 border-b border-slate-100">
			<div class="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5845eb] flex items-center justify-center shrink-0">
				<User class="w-5 h-5 stroke-[2.2]" />
			</div>
			<div>
				<h2 class="text-base sm:text-lg font-black text-slate-900 tracking-tight">
					ব্যক্তিগত প্রোফাইল তথ্য (Personal Profile)
				</h2>
				<p class="text-xs text-slate-500 font-medium">
					আপনার নাম ও যোগাযোগের ফোন নম্বর আপডেট করুন
				</p>
			</div>
		</div>

		<form
			action="?/updateProfile"
			method="POST"
			use:enhance={() => {
				isSavingProfile = true;
				return async ({ result, update }) => {
					isSavingProfile = false;
					if (result.type === 'success') {
						toast.success('প্রোফাইল সফলভাবে আপডেট করা হয়েছে!');
						update();
					} else if (result.type === 'failure') {
						toast.error((result.data as any)?.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে');
					}
				};
			}}
			class="space-y-4 text-xs"
		>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label for="prof-name" class="font-bold text-slate-700 block">পূর্ণ নাম</label>
					<Input
						id="prof-name"
						name="name"
						type="text"
						required
						bind:value={name}
						placeholder="আপনার নাম"
						class="rounded-xl h-10 text-xs"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="prof-phone" class="font-bold text-slate-700 block">মোবাইল ফোন নম্বর</label>
					<Input
						id="prof-phone"
						name="phone"
						type="tel"
						bind:value={phone}
						placeholder="01XXXXXXXXX"
						class="rounded-xl h-10 text-xs font-mono"
					/>
				</div>
			</div>

			<div class="space-y-1.5">
				<label for="prof-email" class="font-bold text-slate-700 block">ইমেইল ঠিকানা</label>
				<div class="relative">
					<Input
						id="prof-email"
						type="email"
						disabled
						value={user.email}
						class="rounded-xl h-10 text-xs bg-slate-50 text-slate-500 font-mono pr-28 cursor-not-allowed"
					/>
					<div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
						<ShieldCheck class="w-3 h-3" />
						<span>ভেরিফাইড</span>
					</div>
				</div>
				<p class="text-[10px] text-slate-400">নিরাপত্তার স্বার্থে ইমেইল ঠিকানা সরাসরি পরিবর্তনযোগ্য নয়।</p>
			</div>

			<div class="pt-2 flex justify-end">
				<Button
					type="submit"
					disabled={isSavingProfile}
					size="sm"
					class="rounded-xl text-xs font-bold bg-[#5845eb] hover:bg-[#4936d6] text-white shadow-xs cursor-pointer"
				>
					{isSavingProfile ? 'সংরক্ষণ হচ্ছে...' : 'প্রোফাইল সেভ করুন'}
				</Button>
			</div>
		</form>
	</div>

	<!-- Section 2: Change Password (পাসওয়ার্ড পরিবর্তন) -->
	<div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
		<div class="flex items-center gap-3 pb-4 border-b border-slate-100">
			<div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
				<Lock class="w-5 h-5 stroke-[2.2]" />
			</div>
			<div>
				<h2 class="text-base sm:text-lg font-black text-slate-900 tracking-tight">
					পাসওয়ার্ড পরিবর্তন ও নিরাপত্তা (Change Password)
				</h2>
				<p class="text-xs text-slate-500 font-medium">
					অ্যাকাউন্টের সুরক্ষার জন্য শক্তিশালী পাসওয়ার্ড ব্যবহার করুন
				</p>
			</div>
		</div>

		<form
			action="?/changePassword"
			method="POST"
			use:enhance={() => {
				if (newPassword !== confirmPassword) {
					toast.error('নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড একই হতে হবে!');
					return () => {};
				}
				if (newPassword.length < 6) {
					toast.error('পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে!');
					return () => {};
				}
				isChangingPassword = true;
				return async ({ result, update }) => {
					isChangingPassword = false;
					if (result.type === 'success') {
						toast.success('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
						currentPassword = '';
						newPassword = '';
						confirmPassword = '';
						update();
					} else if (result.type === 'failure') {
						toast.error((result.data as any)?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে');
					}
				};
			}}
			class="space-y-4 text-xs"
		>
			<div class="space-y-1.5">
				<label for="pwd-curr" class="font-bold text-slate-700 block">বর্তমান পাসওয়ার্ড (Current Password)</label>
				<Input
					id="pwd-curr"
					name="currentPassword"
					type="password"
					required
					bind:value={currentPassword}
					placeholder="••••••••"
					class="rounded-xl h-10 text-xs"
				/>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label for="pwd-new" class="font-bold text-slate-700 block">নতুন পাসওয়ার্ড (New Password)</label>
					<Input
						id="pwd-new"
						name="newPassword"
						type="password"
						required
						minlength="6"
						bind:value={newPassword}
						placeholder="কমপক্ষে ৬ অক্ষর"
						class="rounded-xl h-10 text-xs"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="pwd-conf" class="font-bold text-slate-700 block">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
					<Input
						id="pwd-conf"
						name="confirmPassword"
						type="password"
						required
						minlength="6"
						bind:value={confirmPassword}
						placeholder="••••••••"
						class="rounded-xl h-10 text-xs"
					/>
				</div>
			</div>

			<div class="pt-2 flex justify-end">
				<Button
					type="submit"
					disabled={isChangingPassword}
					size="sm"
					class="rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer"
				>
					{isChangingPassword ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
				</Button>
			</div>
		</form>
	</div>
</div>

