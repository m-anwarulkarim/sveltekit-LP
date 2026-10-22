<script lang="ts">
	import {
		Search,
		Plus,
		MoreVertical,
		ChevronDown,
		ChevronLeft,
		ChevronRight,
		ShieldCheck,
		UserCheck,
		Trash2,
		RotateCcw,
		KeyRound,
		UserCog,
		X,
		Check
	} from 'lucide-svelte';
	import { Button, Input, Badge } from '#lib/components/ui';

	interface AdminUser {
		id: string;
		name: string;
		username: string;
		email: string;
		role: string;
		lastLogin: string;
		registeredAt: string;
		access: 'Allowed' | 'Restricted' | 'Suspended';
		isTrashed: boolean;
		avatarBg: string;
		avatarText: string;
	}

	let admins = $state<AdminUser[]>([
		{
			id: '1',
			name: 'thecolorlighthouse',
			username: 'thecolorlighthouse',
			email: 'contact@thecolorlighthouse.com',
			role: 'Owner',
			lastLogin: 'Oct 22, 2026',
			registeredAt: 'Sep 3, 2025',
			access: 'Allowed',
			isTrashed: false,
			avatarBg: 'bg-black text-pink-500 border-pink-500/40',
			avatarText: 'COLOR LIGHT'
		},
		{
			id: '2',
			name: 'Anwarul Karim',
			username: 'anwarulkarim',
			email: 'anwarul@haqplus.com',
			role: 'Super Admin',
			lastLogin: 'Oct 22, 2026',
			registeredAt: 'Jan 15, 2026',
			access: 'Allowed',
			isTrashed: false,
			avatarBg: 'bg-indigo-600 text-white border-indigo-400',
			avatarText: 'AK'
		},
		{
			id: '3',
			name: 'AURA Support Desk',
			username: 'aura_support',
			email: 'support@haqplus.com',
			role: 'Manager',
			lastLogin: 'Oct 21, 2026',
			registeredAt: 'Feb 10, 2026',
			access: 'Allowed',
			isTrashed: false,
			avatarBg: 'bg-emerald-600 text-white border-emerald-400',
			avatarText: 'AS'
		},
		{
			id: '4',
			name: 'Legacy Guest Tech',
			username: 'test_contractor',
			email: 'contractor@legacy.dev',
			role: 'Developer',
			lastLogin: 'Aug 14, 2026',
			registeredAt: 'Jul 2, 2026',
			access: 'Suspended',
			isTrashed: true,
			avatarBg: 'bg-slate-700 text-slate-300 border-slate-500',
			avatarText: 'LG'
		}
	]);

	// Filter & search states
	let currentTab = $state<'all' | 'trash'>('all');
	let searchQuery = $state('');
	let selectedIds = $state<string[]>([]);
	let openActionMenuId = $state<string | null>(null);

	// Add Admin Modal State
	let isAddModalOpen = $state(false);
	let newAdminName = $state('');
	let newAdminUsername = $state('');
	let newAdminEmail = $state('');
	let newAdminRole = $state('Admin');
	let newAdminAccess = $state<'Allowed' | 'Restricted'>('Allowed');

	// Notification Toast
	let toastMessage = $state<string | null>(null);
	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) toastMessage = null;
		}, 3000);
	}

	// Derived counts
	let activeAdmins = $derived(admins.filter((a) => !a.isTrashed));
	let trashedAdmins = $derived(admins.filter((a) => a.isTrashed));

	// Filtered list
	let displayedAdmins = $derived(
		admins.filter((admin) => {
			if (currentTab === 'all' && admin.isTrashed) return false;
			if (currentTab === 'trash' && !admin.isTrashed) return false;

			if (searchQuery.trim() !== '') {
				const q = searchQuery.toLowerCase().trim();
				return (
					admin.name.toLowerCase().includes(q) ||
					admin.username.toLowerCase().includes(q) ||
					admin.role.toLowerCase().includes(q) ||
					admin.email.toLowerCase().includes(q)
				);
			}

			return true;
		})
	);

	function toggleSelectAll() {
		if (selectedIds.length === displayedAdmins.length) {
			selectedIds = [];
		} else {
			selectedIds = displayedAdmins.map((a) => a.id);
		}
	}

	function toggleSelect(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((item) => item !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function updateAccess(id: string, newAccess: 'Allowed' | 'Restricted' | 'Suspended') {
		const target = admins.find((a) => a.id === id);
		if (target) {
			target.access = newAccess;
			showToast(`${target.username} এর অ্যাক্সেস "${newAccess}" এ পরিবর্তিত হয়েছে।`);
		}
	}

	function moveToTrash(id: string) {
		const target = admins.find((a) => a.id === id);
		if (target) {
			target.isTrashed = true;
			openActionMenuId = null;
			showToast(`${target.username} কে ট্র্যাশে পাঠানো হয়েছে।`);
		}
	}

	function restoreFromTrash(id: string) {
		const target = admins.find((a) => a.id === id);
		if (target) {
			target.isTrashed = false;
			openActionMenuId = null;
			showToast(`${target.username} কে সফলভাবে পুনরুদ্ধার করা হয়েছে।`);
		}
	}

	function deletePermanently(id: string) {
		const target = admins.find((a) => a.id === id);
		if (target && confirm(`আপনি কি নিশ্চিত যে "${target.username}" কে স্থায়ীভাবে মুছে ফেলতে চান?`)) {
			admins = admins.filter((a) => a.id !== id);
			openActionMenuId = null;
			showToast(`${target.username} স্থায়ীভাবে মুছে ফেলা হয়েছে।`);
		}
	}

	function handleAddAdmin(e: SubmitEvent) {
		e.preventDefault();
		if (!newAdminName || !newAdminUsername) return;

		const initials = newAdminName
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);

		const newEntry: AdminUser = {
			id: String(Date.now()),
			name: newAdminName.trim(),
			username: newAdminUsername.trim().toLowerCase(),
			email: newAdminEmail.trim() || `${newAdminUsername.trim().toLowerCase()}@example.com`,
			role: newAdminRole,
			lastLogin: 'Never',
			registeredAt: 'Just Now',
			access: newAdminAccess,
			isTrashed: false,
			avatarBg: 'bg-[#5845eb] text-white border-indigo-300',
			avatarText: initials || 'AD'
		};

		admins = [newEntry, ...admins];
		isAddModalOpen = false;
		newAdminName = '';
		newAdminUsername = '';
		newAdminEmail = '';
		showToast(`নতুন অ্যাডমিন "${newEntry.name}" সফলভাবে যুক্ত হয়েছে!`);
	}
</script>

<svelte:head>
	<title>Vendor Admins | Admin Control</title>
</svelte:head>

<div class="space-y-5 max-w-7xl mx-auto pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
	<!-- Toast Message -->
	{#if toastMessage}
		<div class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
			<Check class="w-4 h-4 text-emerald-400" />
			<span>{toastMessage}</span>
		</div>
	{/if}

	<!-- Top Search & Action Bar (Exact match with reference screenshot) -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
		<!-- Search Input with Attached Purple Search Button -->
		<div class="flex items-center w-full sm:w-96 shadow-2xs">
			<input
				type="text"
				placeholder="Search"
				bind:value={searchQuery}
				class="w-full bg-[#f4f2ff] border border-r-0 border-[#e5e0ff] rounded-l-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#5845eb] transition-all"
			/>
			<button
				type="button"
				class="w-12 h-[38px] bg-[#cfc5fe] hover:bg-[#bfaefc] text-[#5845eb] rounded-r-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
				title="Search"
				aria-label="Search"
			>
				<Search class="w-4 h-4" />
			</button>
		</div>

		<!-- + Add Admin Button (Matching Screenshot) -->
		<button
			type="button"
			onclick={() => (isAddModalOpen = true)}
			class="bg-[#635BFF] hover:bg-[#5249e6] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
		>
			<Plus class="w-4 h-4" />
			<span>Add Admin</span>
		</button>
	</div>

	<!-- Tabs & Pagination Bar (Exact match with screenshot) -->
	<div class="flex items-center justify-between border-b border-slate-200/80 pt-1">
		<!-- Left Filter Tabs (All & Trash) -->
		<div class="flex items-center gap-6">
			<!-- All Tab -->
			<button
				type="button"
				onclick={() => (currentTab = 'all')}
				class="flex items-center gap-2 pb-3 transition-all cursor-pointer {currentTab === 'all'
					? 'border-b-2 border-[#5845eb] text-[#5845eb] font-bold'
					: 'text-slate-600 font-semibold hover:text-slate-900'}"
			>
				<span class="text-sm">All</span>
				<span
					class="text-[11px] font-bold px-2 py-0.5 rounded-full {currentTab === 'all'
						? 'bg-[#5845eb] text-white'
						: 'bg-slate-200 text-slate-700'}"
				>
					{activeAdmins.length}
				</span>
			</button>

			<!-- Trash Tab -->
			<button
				type="button"
				onclick={() => (currentTab = 'trash')}
				class="flex items-center gap-2 pb-3 transition-all cursor-pointer {currentTab === 'trash'
					? 'border-b-2 border-[#5845eb] text-[#5845eb] font-bold'
					: 'text-slate-600 font-semibold hover:text-slate-900'}"
			>
				<span class="text-sm">Trash</span>
				<span
					class="text-[11px] font-bold px-2 py-0.5 rounded-full {currentTab === 'trash'
						? 'bg-[#5845eb] text-white'
						: 'bg-slate-200 text-slate-700'}"
				>
					{trashedAdmins.length}
				</span>
			</button>
		</div>

		<!-- Right Pagination ( < [1] of 1 > ) -->
		<div class="flex items-center gap-2 pb-3 text-xs text-slate-500">
			<button
				type="button"
				disabled
				class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-300 cursor-not-allowed"
				aria-label="Previous Page"
			>
				<ChevronLeft class="w-3.5 h-3.5" />
			</button>
			<span class="w-7 h-7 rounded-lg border border-slate-300 bg-white flex items-center justify-center font-bold text-slate-900 text-xs shadow-2xs">
				1
			</span>
			<span class="text-xs text-slate-500">of 1</span>
			<button
				type="button"
				disabled
				class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-300 cursor-not-allowed"
				aria-label="Next Page"
			>
				<ChevronRight class="w-3.5 h-3.5" />
			</button>
		</div>
	</div>

	<!-- Main Table Container (Exact visual match) -->
	<div class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-slate-100 text-[12px] font-semibold text-slate-500">
						<!-- Checkbox Column -->
						<th class="py-3.5 px-4 w-12 text-center">
							<input
								type="checkbox"
								checked={selectedIds.length === displayedAdmins.length && displayedAdmins.length > 0}
								onchange={toggleSelectAll}
								class="w-4 h-4 rounded-md border-slate-300 text-[#5845eb] focus:ring-[#5845eb]/20 cursor-pointer"
							/>
						</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600">Image</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600">Name</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600">Username</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600">Role</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600">Last Login</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600">Registered At</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600">Access</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600 text-right pr-6">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 text-xs">
					{#if displayedAdmins.length === 0}
						<tr>
							<td colspan="9" class="py-12 text-center text-slate-400">
								<p class="font-bold text-slate-700">কোন অ্যাডমিন পাওয়া যায়নি</p>
								<p class="text-[11px] mt-1">
									{currentTab === 'trash' ? 'ট্র্যাশে কোন অ্যাডমিন নেই।' : 'সার্চ কিওয়ার্ড রিসেট করুন বা নতুন অ্যাডমিন যুক্ত করুন।'}
								</p>
							</td>
						</tr>
					{:else}
						{#each displayedAdmins as admin}
							<tr class="hover:bg-slate-50/70 transition-colors group {selectedIds.includes(admin.id) ? 'bg-indigo-50/30' : ''}">
								<!-- Checkbox -->
								<td class="py-3.5 px-4 text-center">
									<input
										type="checkbox"
										checked={selectedIds.includes(admin.id)}
										onchange={() => toggleSelect(admin.id)}
										class="w-4 h-4 rounded-md border-slate-300 text-[#5845eb] focus:ring-[#5845eb]/20 cursor-pointer"
									/>
								</td>

								<!-- Image / Avatar (Matching Screenshot Neon Logo) -->
								<td class="py-3.5 px-4">
									<div class="w-8 h-8 rounded-full {admin.avatarBg} flex items-center justify-center font-black text-[7px] tracking-tighter shadow-2xs border">
										{#if admin.avatarText === 'COLOR LIGHT'}
											<div class="flex flex-col items-center leading-none text-center">
												<span class="text-[6px] text-pink-400">COLOR</span>
												<span class="text-[6px] text-pink-500">LIGHT</span>
											</div>
										{:else}
											<span>{admin.avatarText}</span>
										{/if}
									</div>
								</td>

								<!-- Name -->
								<td class="py-3.5 px-4 font-medium text-slate-800">
									{admin.name}
								</td>

								<!-- Username -->
								<td class="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
									{admin.username}
								</td>

								<!-- Role -->
								<td class="py-3.5 px-4">
									<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border {admin.role === 'Owner'
										? 'bg-amber-50 text-amber-800 border-amber-200'
										: admin.role === 'Super Admin'
										? 'bg-purple-50 text-purple-700 border-purple-200'
										: 'bg-slate-100 text-slate-700 border-slate-200'}">
										{admin.role}
									</span>
								</td>

								<!-- Last Login -->
								<td class="py-3.5 px-4 text-slate-600">
									{admin.lastLogin}
								</td>

								<!-- Registered At -->
								<td class="py-3.5 px-4 text-slate-600">
									{admin.registeredAt}
								</td>

								<!-- Access Select Dropdown (Matching Screenshot border box) -->
								<td class="py-3.5 px-4">
									<select
										value={admin.access}
										onchange={(e) => updateAccess(admin.id, e.currentTarget.value as any)}
										class="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#5845eb] cursor-pointer shadow-2xs hover:border-slate-400 transition-colors"
									>
										<option value="Allowed">Allowed</option>
										<option value="Restricted">Restricted</option>
										<option value="Suspended">Suspended</option>
									</select>
								</td>

								<!-- Actions (Three dots ⋮ menu) -->
								<td class="py-3.5 px-4 text-right pr-6 relative">
									<div class="relative inline-block text-left">
										<button
											type="button"
											onclick={() => (openActionMenuId = openActionMenuId === admin.id ? null : admin.id)}
											class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
											title="More Options"
										>
											<MoreVertical class="w-4 h-4" />
										</button>

										{#if openActionMenuId === admin.id}
											<div class="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-50 text-left animate-in fade-in duration-100">
												<button
													type="button"
													onclick={() => {
														alert(`রোল পরিবর্তন করুন: ${admin.name}`);
														openActionMenuId = null;
													}}
													class="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
												>
													<UserCog class="w-3.5 h-3.5 text-slate-400" />
													<span>Change Role</span>
												</button>

												<button
													type="button"
													onclick={() => {
														alert(`পাসওয়ার্ড রিসেট লিংক তৈরি হয়েছে: ${admin.email}`);
														openActionMenuId = null;
													}}
													class="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
												>
													<KeyRound class="w-3.5 h-3.5 text-slate-400" />
													<span>Reset Password</span>
												</button>

												<div class="border-t border-slate-100 my-1"></div>

												{#if !admin.isTrashed}
													<button
														type="button"
														onclick={() => moveToTrash(admin.id)}
														class="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-amber-700 hover:bg-amber-50"
													>
														<Trash2 class="w-3.5 h-3.5 text-amber-500" />
														<span>Move to Trash</span>
													</button>
												{:else}
													<button
														type="button"
														onclick={() => restoreFromTrash(admin.id)}
														class="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50"
													>
														<RotateCcw class="w-3.5 h-3.5 text-emerald-500" />
														<span>Restore Admin</span>
													</button>
													<button
														type="button"
														onclick={() => deletePermanently(admin.id)}
														class="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-700 hover:bg-rose-50"
													>
														<Trash2 class="w-3.5 h-3.5 text-rose-500" />
														<span>Delete Permanently</span>
													</button>
												{/if}
											</div>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Add Admin Modal -->
{#if isAddModalOpen}
	<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150">
			<!-- Modal Header -->
			<div class="flex items-center justify-between pb-4 border-b border-slate-100">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-[#5845eb] flex items-center justify-center">
						<UserCog class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900">Add New Admin</h3>
						<p class="text-[11px] text-slate-400">নতুন অ্যাডমিন অ্যাকাউন্ট তথ্য প্রদান করুন</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (isAddModalOpen = false)}
					class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Form -->
			<form onsubmit={handleAddAdmin} class="space-y-4 pt-4">
				<div>
					<label for="admin-name" class="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
					<Input
						id="admin-name"
						type="text"
						required
						placeholder="e.g. Tanvir Hossain"
						bind:value={newAdminName}
						class="bg-slate-50/70 border-slate-200"
					/>
				</div>

				<div>
					<label for="admin-username" class="block text-xs font-bold text-slate-700 mb-1">Username</label>
					<Input
						id="admin-username"
						type="text"
						required
						placeholder="e.g. tanvir_admin"
						bind:value={newAdminUsername}
						class="bg-slate-50/70 border-slate-200 font-mono"
					/>
				</div>

				<div>
					<label for="admin-email" class="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
					<Input
						id="admin-email"
						type="email"
						placeholder="e.g. tanvir@haqplus.com"
						bind:value={newAdminEmail}
						class="bg-slate-50/70 border-slate-200"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="admin-role" class="block text-xs font-bold text-slate-700 mb-1">Role</label>
						<select
							id="admin-role"
							bind:value={newAdminRole}
							class="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white cursor-pointer"
						>
							<option value="Admin">Admin</option>
							<option value="Super Admin">Super Admin</option>
							<option value="Manager">Manager</option>
							<option value="Support Agent">Support Agent</option>
						</select>
					</div>

					<div>
						<label for="admin-access" class="block text-xs font-bold text-slate-700 mb-1">Access Status</label>
						<select
							id="admin-access"
							bind:value={newAdminAccess}
							class="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] focus:bg-white cursor-pointer"
						>
							<option value="Allowed">Allowed</option>
							<option value="Restricted">Restricted</option>
						</select>
					</div>
				</div>

				<!-- Actions -->
				<div class="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onclick={() => (isAddModalOpen = false)}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="default"
						size="sm"
						class="bg-[#635BFF] hover:bg-[#5249e6] font-bold"
					>
						Save Admin
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
