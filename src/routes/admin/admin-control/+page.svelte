<script lang="ts">
	import {
		Search,
		Plus,
		MoreVertical,
		ChevronLeft,
		ChevronRight,
		ShieldCheck,
		UserCheck,
		Trash2,
		RotateCcw,
		KeyRound,
		UserCog,
		X,
		Check,
		Loader2,
		Eye,
		EyeOff,
		Copy,
		Sparkles,
		CheckSquare,
		Square,
		ExternalLink,
		Settings,
		ShoppingBag,
		Package,
		Layers,
		Palette,
		Globe,
		Target,
		Percent,
		Users,
		FileText,
		ShieldAlert,
		Image as ImageIcon,
		Database,
		LayoutDashboard
	} from 'lucide-svelte';
	import { Button, Input, Badge } from '#lib/components/ui';
	import { confirmModal } from '#lib/stores/confirm.svelte';
	import { toast } from 'svelte-sonner';
	import {
		ADMIN_MENU_LIST,
		ROLE_PRESETS,
		getMenuLabel,
		hasMenuAccess,
		type AdminMenuItem,
		type RolePreset
	} from '#lib/constants/admin-permissions';
	import { generateRandomPassword } from '#lib/utils/passwordGenerator';

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
		avatarUrl?: string | null;
		permissions?: string[];
		plainPasswordHint?: string;
	}

	let { data }: { data?: any } = $props();

	// Reactive admins state
	let admins = $state<AdminUser[]>(data?.admins || []);

	$effect(() => {
		admins = data?.admins ? [...data.admins] : [];
	});

	// Filter & search states
	let currentTab = $state<'all' | 'trash'>('all');
	let searchQuery = $state('');
	let selectedIds = $state<string[]>([]);
	let menuCoords = $state<{ top: number; right: number; openUpwards: boolean } | null>(null);
	let activeAdmin = $state<AdminUser | null>(null);
	let isSaving = $state(false);

	function handleActionClick(admin: AdminUser, e: MouseEvent) {
		e.stopPropagation();
		if (activeAdmin?.id === admin.id) {
			handleWindowClick();
			return;
		}

		const btn = e.currentTarget as HTMLElement;
		const rect = btn.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		const openUpwards = spaceBelow < 260;

		menuCoords = {
			top: openUpwards ? Math.max(10, rect.top - 220) : rect.bottom + 6,
			right: Math.max(16, window.innerWidth - rect.right),
			openUpwards
		};
		activeAdmin = admin;
	}

	function handleWindowClick() {
		activeAdmin = null;
		menuCoords = null;
	}

	// ----------------------------------------------------
	// 1. ADD ADMIN MODAL STATE
	// ----------------------------------------------------
	let isAddModalOpen = $state(false);
	let newAdminName = $state('');
	let newAdminUsername = $state('');
	let newAdminEmail = $state('');
	let newAdminPassword = $state('');
	let newAdminRole = $state('Order Manager');
	let newAdminAccess = $state<'Allowed' | 'Restricted'>('Allowed');
	let newAdminPermissions = $state<string[]>(['dashboard', 'orders', 'customers']);
	let showNewPassword = $state(false);

	function openAddModal() {
		newAdminName = '';
		newAdminUsername = '';
		newAdminEmail = '';
		newAdminRole = 'Order Manager';
		newAdminAccess = 'Allowed';
		newAdminPermissions = ['dashboard', 'orders', 'customers'];
		newAdminPassword = generateRandomPassword(10);
		showNewPassword = true;
		isAddModalOpen = true;
	}

	function handleRolePresetChange(roleName: string) {
		newAdminRole = roleName;
		const preset = ROLE_PRESETS.find((p) => p.role === roleName);
		if (preset && preset.permissions.length > 0) {
			newAdminPermissions = [...preset.permissions];
		}
	}

	function toggleNewPermission(menuId: string) {
		if (newAdminPermissions.includes('*')) {
			// If previously full access, switch to specific menus
			newAdminPermissions = ADMIN_MENU_LIST.map((m) => m.id).filter((id) => id !== menuId);
			return;
		}
		if (newAdminPermissions.includes(menuId)) {
			newAdminPermissions = newAdminPermissions.filter((id) => id !== menuId);
		} else {
			newAdminPermissions = [...newAdminPermissions, menuId];
		}
	}

	function selectAllPermissions() {
		newAdminPermissions = ADMIN_MENU_LIST.filter((m) => !m.isOwnerOnly).map((m) => m.id);
	}

	function clearAllPermissions() {
		newAdminPermissions = [];
	}

	function generateAddPassword() {
		newAdminPassword = generateRandomPassword(10);
		showNewPassword = true;
		toast.info('নতুন পাসওয়ার্ড তৈরি করা হয়েছে');
	}

	// ----------------------------------------------------
	// 2. EDIT ADMIN & PERMISSIONS MODAL STATE
	// ----------------------------------------------------
	let isEditModalOpen = $state(false);
	let editingAdmin = $state<AdminUser | null>(null);
	let editName = $state('');
	let editUsername = $state('');
	let editEmail = $state('');
	let editRole = $state('');
	let editAccess = $state<'Allowed' | 'Restricted' | 'Suspended'>('Allowed');
	let editPermissions = $state<string[]>([]);
	let editPassword = $state('');
	let showEditPassword = $state(false);

	function openEditModal(admin: AdminUser) {
		editingAdmin = admin;
		editName = admin.name;
		editUsername = admin.username;
		editEmail = admin.email;
		editRole = admin.role;
		editAccess = admin.access;
		editPermissions = admin.permissions ? [...admin.permissions] : ['*'];
		editPassword = '';
		showEditPassword = false;
		handleWindowClick();
		isEditModalOpen = true;
	}

	function handleEditRolePresetChange(roleName: string) {
		editRole = roleName;
		const preset = ROLE_PRESETS.find((p) => p.role === roleName);
		if (preset && preset.permissions.length > 0) {
			editPermissions = [...preset.permissions];
		}
	}

	function toggleEditPermission(menuId: string) {
		if (editPermissions.includes('*')) {
			editPermissions = ADMIN_MENU_LIST.map((m) => m.id).filter((id) => id !== menuId);
			return;
		}
		if (editPermissions.includes(menuId)) {
			editPermissions = editPermissions.filter((id) => id !== menuId);
		} else {
			editPermissions = [...editPermissions, menuId];
		}
	}

	function selectAllEditPermissions() {
		editPermissions = ADMIN_MENU_LIST.filter((m) => !m.isOwnerOnly).map((m) => m.id);
	}

	function clearAllEditPermissions() {
		editPermissions = [];
	}

	// ----------------------------------------------------
	// 3. QUICK PASSWORD RESET MODAL STATE
	// ----------------------------------------------------
	let isPasswordModalOpen = $state(false);
	let passwordAdmin = $state<AdminUser | null>(null);
	let resetPasswordValue = $state('');
	let showResetPassword = $state(true);

	function openPasswordModal(admin: AdminUser) {
		passwordAdmin = admin;
		resetPasswordValue = generateRandomPassword(10);
		showResetPassword = true;
		handleWindowClick();
		isPasswordModalOpen = true;
	}

	function generateQuickPassword() {
		resetPasswordValue = generateRandomPassword(10);
		showResetPassword = true;
		toast.info('নতুন পাসওয়ার্ড তৈরি হয়েছে');
	}

	function copyToClipboard(text: string, label: string = 'পাসওয়ার্ড') {
		if (!text) return;
		navigator.clipboard.writeText(text);
		toast.success(`${label} ক্লিপবোর্ডে কপি করা হয়েছে!`);
	}

	// Notification Toast
	function showToast(msg: string) {
		toast.success(msg);
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
		const selectableAdmins = displayedAdmins.filter((a) => a.role !== 'Owner');
		if (selectedIds.length === selectableAdmins.length && selectableAdmins.length > 0) {
			selectedIds = [];
		} else {
			selectedIds = selectableAdmins.map((a) => a.id);
		}
	}

	function toggleSelect(id: string) {
		const target = admins.find((a) => a.id === id);
		if (target?.role === 'Owner') {
			toast.info('Owner অ্যাকাউন্ট সুরক্ষিত, এটি নির্বাচন করা সম্ভব নয়!');
			return;
		}
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((item) => item !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	async function updateAccess(id: string, newAccess: 'Allowed' | 'Restricted' | 'Suspended') {
		const target = admins.find((a) => a.id === id);
		if (!target) return;

		if (target.role === 'Owner' && newAccess !== 'Allowed') {
			toast.error('Owner অ্যাকাউন্টের অ্যাক্সেস পরিবর্তন করা সম্ভব নয়!');
			return;
		}

		target.access = newAccess;
		showToast(`${target.username} এর অ্যাক্সেস "${newAccess}" এ পরিবর্তিত হয়েছে।`);

		try {
			const fd = new FormData();
			fd.append('id', id);
			fd.append('access', newAccess);
			await fetch('?/updateAccess', {
				method: 'POST',
				body: fd
			});
		} catch (error) {
			console.error('Error updating access on server:', error);
		}
	}

	async function moveToTrash(id: string) {
		const target = admins.find((a) => a.id === id);
		if (!target) return;

		if (target.role === 'Owner') {
			toast.error('Owner অ্যাকাউন্টকে ট্র্যাশে স্থানান্তর করা নিষিদ্ধ!');
			return;
		}

		const confirmed = await confirmModal({
			title: 'অ্যাডমিন ট্র্যাশে স্থানান্তর',
			message: `আপনি কি "${target.name}" (${target.username}) কে ট্র্যাশে পাঠাতে চান?`,
			confirmText: 'হ্যাঁ, ট্র্যাশে পাঠান',
			variant: 'warning',
			icon: 'trash'
		});
		if (!confirmed) return;

		target.isTrashed = true;
		handleWindowClick();
		showToast(`${target.username} কে ট্র্যাশে পাঠানো হয়েছে।`);

		try {
			const fd = new FormData();
			fd.append('id', id);
			await fetch('?/moveToTrash', {
				method: 'POST',
				body: fd
			});
		} catch (error) {
			console.error('Error moving to trash on server:', error);
		}
	}

	async function restoreFromTrash(id: string) {
		const target = admins.find((a) => a.id === id);
		if (target) {
			target.isTrashed = false;
			handleWindowClick();
			showToast(`${target.username} কে সফলভাবে পুনরুদ্ধার করা হয়েছে।`);
		}

		try {
			const fd = new FormData();
			fd.append('id', id);
			await fetch('?/restoreFromTrash', {
				method: 'POST',
				body: fd
			});
		} catch (error) {
			console.error('Error restoring from trash on server:', error);
		}
	}

	async function deletePermanently(id: string) {
		const target = admins.find((a) => a.id === id);
		if (!target) return;

		if (target.role === 'Owner') {
			toast.error('Owner অ্যাকাউন্টকে মুছে ফেলা সম্পূর্ণ নিষিদ্ধ!');
			return;
		}

		const confirmed = await confirmModal({
			title: 'অ্যাডমিন অ্যাকাউন্ট অপসারণ',
			message: `আপনি কি নিশ্চিত যে "${target.username}" কে স্থায়ীভাবে মুছে ফেলতে চান? এই অ্যাকাউন্টটি পুনরুদ্ধার করা যাবে না।`,
			confirmText: 'হ্যাঁ, স্থায়ীভাবে মুছুন',
			variant: 'destructive',
			icon: 'trash'
		});
		if (!confirmed) return;

		admins = admins.filter((a) => a.id !== id);
		handleWindowClick();
		showToast(`${target.username} স্থায়ীভাবে মুছে ফেলা হয়েছে।`);

		try {
			const fd = new FormData();
			fd.append('id', id);
			await fetch('?/deletePermanently', {
				method: 'POST',
				body: fd
			});
		} catch (error) {
			console.error('Error permanently deleting admin:', error);
		}
	}

	async function handleBulkAction(action: 'trash' | 'restore' | 'delete') {
		if (selectedIds.length === 0) return;
		const actionName = action === 'trash' ? 'ট্র্যাশে পাঠাতে' : action === 'restore' ? 'পুনরুদ্ধার করতে' : 'স্থায়ীভাবে মুছতে';
		const confirmed = await confirmModal({
			title: 'বাল্ক অ্যাকশন নিশ্চিতকরণ',
			message: `আপনি কি নিশ্চিত যে নির্বাচিত ${selectedIds.length} জন ইউজারকে ${actionName} চান?`,
			confirmText: action === 'delete' ? 'হ্যাঁ, মুছুন' : 'নিশ্চিত করুন',
			variant: action === 'delete' ? 'destructive' : 'primary',
			icon: action === 'delete' ? 'trash' : 'alert'
		});
		if (!confirmed) return;

		const idsToProcess = selectedIds.filter((id) => admins.find((a) => a.id === id)?.role !== 'Owner');
		if (idsToProcess.length === 0) {
			toast.info('Owner অ্যাকাউন্ট সুরক্ষিত, কোনো অ্যাকশন প্রয়োজন নেই।');
			selectedIds = [];
			return;
		}
		const count = idsToProcess.length;

		if (action === 'delete') {
			admins = admins.filter((a) => !idsToProcess.includes(a.id));
		} else if (action === 'trash') {
			admins = admins.map((a) => idsToProcess.includes(a.id) ? { ...a, isTrashed: true } : a);
		} else {
			admins = admins.map((a) => idsToProcess.includes(a.id) ? { ...a, isTrashed: false } : a);
		}

		selectedIds = [];
		showToast(`${count} জন অ্যাডমিনে অ্যাকশন সফল হয়েছে!`);

		try {
			const fd = new FormData();
			fd.append('ids', JSON.stringify(idsToProcess));
			fd.append('action', action);
			await fetch('?/bulkAction', {
				method: 'POST',
				body: fd
			});
		} catch (error) {
			console.error('Error executing bulk action:', error);
		}
	}

	// ----------------------------------------------------
	// SAVE NEW ADMIN
	// ----------------------------------------------------
	async function handleAddAdmin(e: SubmitEvent) {
		e.preventDefault();
		if (!newAdminName.trim() || !newAdminUsername.trim()) {
			toast.error('নাম এবং ইউজারনেম আবশ্যক!');
			return;
		}
		if (!newAdminPassword.trim()) {
			toast.error('পাসওয়ার্ড আবশ্যক!');
			return;
		}

		isSaving = true;
		const initials = newAdminName
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2) || 'AD';

		const finalEmail = newAdminEmail.trim() || `${newAdminUsername.trim().toLowerCase()}@gmail.com`;

		const formData = new FormData();
		formData.append('name', newAdminName.trim());
		formData.append('username', newAdminUsername.trim().toLowerCase());
		formData.append('email', finalEmail);
		formData.append('role', newAdminRole);
		formData.append('access', newAdminAccess);
		formData.append('password', newAdminPassword.trim());
		formData.append('permissions', JSON.stringify(newAdminPermissions));

		try {
			const res = await fetch('?/createAdmin', {
				method: 'POST',
				body: formData
			});
			const result: any = await res.json();
			const newId = result?.data?.admin?.id || 'adm-' + Date.now();

			const newEntry: AdminUser = {
				id: newId,
				name: newAdminName.trim(),
				username: newAdminUsername.trim().toLowerCase(),
				email: finalEmail,
				role: newAdminRole,
				lastLogin: 'Never',
				registeredAt: 'Just Now',
				access: newAdminAccess,
				isTrashed: false,
				permissions: [...newAdminPermissions],
				plainPasswordHint: newAdminPassword.trim(),
				avatarBg: 'bg-[#5845eb] text-white border-indigo-300',
				avatarText: initials
			};

			admins = [newEntry, ...admins];
			isAddModalOpen = false;
			showToast(`নতুন অ্যাডমিন "${newEntry.name}" সফলভাবে যুক্ত হয়েছে!`);
		} catch (error) {
			console.error('Error creating admin user:', error);
			toast.error('অ্যাডমিন তৈরি করতে সমস্যা হয়েছে');
		} finally {
			isSaving = false;
		}
	}

	// ----------------------------------------------------
	// SAVE EDITED ADMIN
	// ----------------------------------------------------
	async function handleSaveEdit(e: SubmitEvent) {
		e.preventDefault();
		if (!editingAdmin) return;
		if (!editName.trim() || !editUsername.trim() || !editEmail.trim()) {
			toast.error('নাম, ইউজারনেম ও ইমেইল আবশ্যক!');
			return;
		}

		isSaving = true;
		const formData = new FormData();
		formData.append('id', editingAdmin.id);
		formData.append('name', editName.trim());
		formData.append('username', editUsername.trim().toLowerCase());
		formData.append('email', editEmail.trim().toLowerCase());
		formData.append('role', editRole);
		formData.append('access', editAccess);
		formData.append('permissions', JSON.stringify(editPermissions));
		if (editPassword.trim()) {
			formData.append('password', editPassword.trim());
		}

		try {
			await fetch('?/updateAdmin', {
				method: 'POST',
				body: formData
			});

			admins = admins.map((a) => {
				if (a.id === editingAdmin!.id) {
					return {
						...a,
						name: editName.trim(),
						username: editUsername.trim().toLowerCase(),
						email: editEmail.trim().toLowerCase(),
						role: editRole,
						access: editAccess,
						permissions: [...editPermissions],
						plainPasswordHint: editPassword.trim() ? editPassword.trim() : a.plainPasswordHint
					};
				}
				return a;
			});

			isEditModalOpen = false;
			showToast(`অ্যাডমিন "${editName}" এর তথ্য ও মেনু পারমিশন আপডেট হয়েছে!`);
		} catch (error) {
			console.error('Error updating admin:', error);
			toast.error('আপডেট করতে সমস্যা হয়েছে');
		} finally {
			isSaving = false;
		}
	}

	// ----------------------------------------------------
	// SUBMIT RESET PASSWORD
	// ----------------------------------------------------
	async function handleResetPasswordSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!passwordAdmin || !resetPasswordValue.trim()) return;

		isSaving = true;
		const formData = new FormData();
		formData.append('id', passwordAdmin.id);
		formData.append('password', resetPasswordValue.trim());

		try {
			await fetch('?/resetPassword', {
				method: 'POST',
				body: formData
			});

			admins = admins.map((a) => {
				if (a.id === passwordAdmin!.id) {
					return {
						...a,
						plainPasswordHint: resetPasswordValue.trim()
					};
				}
				return a;
			});

			isPasswordModalOpen = false;
			showToast(`"${passwordAdmin.name}" এর নতুন পাসওয়ার্ড সেট করা হয়েছে!`);
		} catch (error) {
			console.error('Error resetting password:', error);
			toast.error('পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে');
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} onscroll={handleWindowClick} onresize={handleWindowClick} />

<svelte:head>
	<title>অ্যাডমিন ও রোল পারমিশন কন্ট্রোল | Admin Control</title>
</svelte:head>

<div class="space-y-6 max-w-7xl mx-auto pb-16 font-['Anek_Bangla',sans-serif]">
	
	<!-- Top Banner & Quick Info -->
	<div class="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div class="flex items-center gap-3.5">
			<div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5845eb] shadow-2xs shrink-0">
				<ShieldCheck class="w-6 h-6" />
			</div>
			<div>
				<div class="flex items-center gap-2 flex-wrap">
					<h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">অ্যাডমিন ও টিম কন্ট্রোল</h2>
					<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
						RBAC পারমিশন ও পাসওয়ার্ড ম্যানেজমেন্ট
					</span>
				</div>
				<p class="text-xs text-slate-500 mt-0.5">টিম মেম্বারদের নির্দিষ্ট মেনু অ্যাক্সেস ও লগইন পাসওয়ার্ড ওনার কর্তৃক নিয়ন্ত্রিত</p>
			</div>
		</div>

		<!-- Add Admin Button -->
		<Button
			type="button"
			onclick={openAddModal}
			class="bg-[#5845eb] hover:bg-[#4936d8] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all self-start md:self-auto"
		>
			<Plus class="w-4 h-4" />
			<span>নতুন অ্যাডমিন / স্টাফ যুক্ত করুন</span>
		</Button>
	</div>

	<!-- Top Search & Bulk Action Bar -->
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
		<!-- Search Input with Attached Purple Search Button -->
		<div class="flex items-center w-full sm:w-96 shadow-2xs">
			<input
				type="text"
				placeholder="নাম, ইমেইল বা রোল দিয়ে খুঁজুন..."
				bind:value={searchQuery}
				class="w-full bg-[#f4f2ff] border border-r-0 border-[#e5e0ff] rounded-l-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#5845eb] transition-all font-sans"
			/>
			<button
				type="button"
				class="w-12 h-[38px] bg-[#cfc5fe] hover:bg-[#bfaefc] text-[#5845eb] rounded-r-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
				title="খুঁজুন"
				aria-label="Search"
			>
				<Search class="w-4 h-4" />
			</button>
		</div>

		<!-- Bulk Action Dropdown & Actions -->
		<div class="flex items-center gap-3">
			{#if selectedIds.length > 0}
				<div class="flex items-center gap-2 bg-indigo-50/80 border border-indigo-200/90 px-3 py-1.5 rounded-xl animate-in fade-in duration-150">
					<span class="text-xs font-bold text-indigo-900">
						{selectedIds.length} টি নির্বাচিত
					</span>
					<div class="h-4 w-px bg-indigo-200"></div>
					{#if currentTab === 'all'}
						<button
							type="button"
							onclick={() => handleBulkAction('trash')}
							class="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
						>
							<Trash2 class="w-3.5 h-3.5" />
							<span>ট্র্যাশে পাঠান</span>
						</button>
					{:else}
						<button
							type="button"
							onclick={() => handleBulkAction('restore')}
							class="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
						>
							<RotateCcw class="w-3.5 h-3.5" />
							<span>পুনরুদ্ধার</span>
						</button>
						<button
							type="button"
							onclick={() => handleBulkAction('delete')}
							class="text-xs font-bold text-rose-700 hover:text-rose-800 hover:underline flex items-center gap-1 cursor-pointer ml-1"
						>
							<Trash2 class="w-3.5 h-3.5" />
							<span>স্থায়ী মুছুন</span>
						</button>
					{/if}
				</div>
			{/if}

			<!-- Filter Tabs: All vs Trash -->
			<div class="flex items-center bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs text-xs">
				<button
					type="button"
					onclick={() => { currentTab = 'all'; selectedIds = []; }}
					class="px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer {currentTab === 'all'
						? 'bg-[#5845eb] text-white shadow-2xs'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					সক্রিয় ({activeAdmins.length})
				</button>
				<button
					type="button"
					onclick={() => { currentTab = 'trash'; selectedIds = []; }}
					class="px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer {currentTab === 'trash'
						? 'bg-rose-500 text-white shadow-2xs'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					ট্র্যাশ ({trashedAdmins.length})
				</button>
			</div>
		</div>
	</div>

	<!-- Main Table Container -->
	<div class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden min-h-[300px]">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-slate-100 text-[12px] font-semibold text-slate-500 bg-slate-50/50">
						<!-- Checkbox Column -->
						<th class="py-3.5 px-4 w-12 text-center">
							<input
								type="checkbox"
								checked={selectedIds.length === displayedAdmins.length && displayedAdmins.length > 0}
								onchange={toggleSelectAll}
								aria-label="সব সিলেক্ট করুন"
								class="w-4 h-4 rounded-md border-slate-300 text-[#5845eb] focus:ring-[#5845eb]/20 cursor-pointer"
							/>
						</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600">অ্যাডমিন ইউজার</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600">রোল ও অধিকার</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600">অনুমোদিত মেনুসমূহ (Access)</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600">পাসওয়ার্ড তথ্য</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600">স্ট্যাটাস</th>
						<th class="py-3.5 px-4 font-semibold text-slate-600 text-right pr-6">অ্যাকশন</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 text-xs">
					{#if displayedAdmins.length === 0}
						<tr>
							<td colspan="7" class="py-12 text-center text-slate-400">
								<p class="font-bold text-slate-700 text-sm">কোনো অ্যাডমিন পাওয়া যায়নি</p>
								<p class="text-[11px] mt-1">
									{currentTab === 'trash' ? 'ট্র্যাশে কোনো অ্যাডমিন অ্যাকাউন্ট নেই।' : 'সার্চ ফিল্টার চেক করুন বা নতুন অ্যাডমিন যুক্ত করুন।'}
								</p>
							</td>
						</tr>
					{:else}
						{#each displayedAdmins as admin (admin.id)}
							<tr class="hover:bg-slate-50/70 transition-colors group {selectedIds.includes(admin.id) ? 'bg-indigo-50/30' : ''}">
								<!-- Checkbox -->
								<td class="py-3.5 px-4 text-center">
									{#if admin.role === 'Owner'}
										<input
											type="checkbox"
											checked={false}
											disabled
											class="w-4 h-4 rounded-md border-slate-200 text-slate-300 opacity-40 cursor-not-allowed"
											title="Owner একাউন্ট সুরক্ষিত (মুছে ফেলা যাবে না)"
										/>
									{:else}
										<input
											type="checkbox"
											checked={selectedIds.includes(admin.id)}
											onchange={() => toggleSelect(admin.id)}
											aria-label={`Select ${admin.name}`}
											class="w-4 h-4 rounded-md border-slate-300 text-[#5845eb] focus:ring-[#5845eb]/20 cursor-pointer"
										/>
									{/if}
								</td>

								<!-- User Info (Avatar + Name + Username + Email) -->
								<td class="py-3.5 px-4">
									<div class="flex items-center gap-3">
										<div class="w-9 h-9 rounded-xl {admin.avatarBg} flex items-center justify-center font-black text-[9px] tracking-tight shadow-2xs border shrink-0">
											{#if admin.avatarText === 'COLOR LIGHT'}
												<div class="flex flex-col items-center leading-none text-center">
													<span class="text-[7px] text-pink-400">COLOR</span>
													<span class="text-[7px] text-pink-500">LIGHT</span>
												</div>
											{:else}
												<span>{admin.avatarText}</span>
											{/if}
										</div>
										<div class="min-w-0">
											<div class="flex items-center gap-1.5 flex-wrap">
												<span class="font-bold text-slate-900 text-xs">{admin.name}</span>
												{#if admin.role === 'Owner'}
													<span class="px-1.5 py-0.2 rounded text-[9px] font-black bg-pink-50 text-pink-700 border border-pink-200 uppercase">
														Owner
													</span>
												{/if}
											</div>
											<div class="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
												<span>@{admin.username}</span>
												<span>•</span>
												<span class="text-slate-500">{admin.email}</span>
											</div>
										</div>
									</div>
								</td>

								<!-- Role Badge -->
								<td class="py-3.5 px-4">
									<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold {admin.role === 'Owner'
										? 'bg-black text-pink-400 border border-pink-500/30'
										: admin.role === 'Super Admin'
											? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
											: admin.role === 'Order Manager'
												? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
												: admin.role === 'Product Specialist'
													? 'bg-violet-50 text-violet-700 border border-violet-200'
													: 'bg-slate-100 text-slate-700 border border-slate-200'}">
										{admin.role}
									</span>
								</td>

								<!-- Allowed Menus Chips -->
								<td class="py-3.5 px-4">
									<div class="flex items-center gap-1 flex-wrap max-w-xs">
										{#if admin.role === 'Owner' || (admin.permissions && admin.permissions.includes('*'))}
											<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-pink-50 text-pink-700 border border-pink-200">
												<ShieldCheck class="w-3 h-3 text-pink-600" />
												<span>সম্পূর্ণ সিস্টেম অ্যাক্সেস (Full)</span>
											</span>
										{:else if admin.permissions && admin.permissions.length > 0}
											{#each admin.permissions.slice(0, 3) as menuId}
												<span class="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
													{getMenuLabel(menuId)}
												</span>
											{/each}
											{#if admin.permissions.length > 3}
												<span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
													+{admin.permissions.length - 3} আরো
												</span>
											{/if}
										{:else}
											<span class="text-[11px] text-slate-400 italic">কোনো মেনু অ্যাক্সেস নেই</span>
										{/if}
									</div>
								</td>

								<!-- Password Hint & Quick View -->
								<td class="py-3.5 px-4">
									{#if admin.plainPasswordHint}
										<div class="flex items-center gap-1.5">
											<code class="px-2 py-1 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-700">
												{admin.plainPasswordHint}
											</code>
											<button
												type="button"
												onclick={() => copyToClipboard(admin.plainPasswordHint!, 'পাসওয়ার্ড')}
												class="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
												title="পাসওয়ার্ড কপি করুন"
											>
												<Copy class="w-3 h-3" />
											</button>
										</div>
									{:else}
										<button
											type="button"
											onclick={() => openPasswordModal(admin)}
											class="text-[11px] font-bold text-[#5845eb] hover:underline flex items-center gap-1 cursor-pointer"
										>
											<KeyRound class="w-3 h-3" />
											<span>পাসওয়ার্ড সেট করুন</span>
										</button>
									{/if}
								</td>

								<!-- Access Status Dropdown -->
								<td class="py-3.5 px-4">
									{#if admin.role === 'Owner'}
										<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
											<ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
											<span>Allowed</span>
										</span>
									{:else}
										<select
											value={admin.access}
											onchange={(e) => updateAccess(admin.id, e.currentTarget.value as any)}
											class="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#5845eb] cursor-pointer shadow-2xs"
										>
											<option value="Allowed">Allowed</option>
											<option value="Restricted">Restricted</option>
											<option value="Suspended">Suspended</option>
										</select>
									{/if}
								</td>

								<!-- Actions (Three dots ⋮ menu) -->
								<td class="py-3.5 px-4 text-right pr-6">
									<button
										type="button"
										onclick={(e) => handleActionClick(admin, e)}
										class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer {activeAdmin?.id === admin.id ? 'bg-slate-100 text-slate-900' : ''}"
										title="More Options"
									>
										<MoreVertical class="w-4 h-4" />
									</button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Global Fixed Floating Action Menu -->
{#if activeAdmin && menuCoords}
	<button
		type="button"
		class="fixed inset-0 z-[9998] cursor-default bg-transparent"
		tabindex="-1"
		aria-hidden="true"
		onclick={handleWindowClick}
	></button>

	<div
		class="fixed z-[9999] w-52 bg-white border border-slate-200/90 rounded-2xl shadow-2xl py-1.5 text-xs font-medium text-left animate-in fade-in zoom-in-95 duration-100 font-['Anek_Bangla',sans-serif]"
		style="top: {menuCoords.top}px; right: {menuCoords.right}px;"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- 1. Edit & Menu Permissions -->
		<button
			type="button"
			onclick={() => openEditModal(activeAdmin!)}
			class="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors"
		>
			<UserCog class="w-3.5 h-3.5 text-[#5845eb]" />
			<span>মেনু পারমিশন ও এডিট</span>
		</button>

		<!-- 2. Password Reset -->
		<button
			type="button"
			onclick={() => openPasswordModal(activeAdmin!)}
			class="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors"
		>
			<KeyRound class="w-3.5 h-3.5 text-amber-500" />
			<span>পাসওয়ার্ড পরিবর্তন / রিসেট</span>
		</button>

		<div class="border-t border-slate-100 my-1"></div>

		{#if activeAdmin.role === 'Owner'}
			<div class="px-3.5 py-2 text-[11px] font-bold text-pink-800 bg-pink-50/90 rounded-xl flex items-center gap-2 border border-pink-200 mx-1 mb-1">
				<ShieldCheck class="w-4 h-4 text-pink-600 shrink-0" />
				<span>Protected Owner<br/><span class="text-[10px] font-normal text-pink-700">মুছে ফেলা নিষিদ্ধ</span></span>
			</div>
		{:else if !activeAdmin.isTrashed}
			<button
				type="button"
				onclick={() => {
					const id = activeAdmin!.id;
					handleWindowClick();
					moveToTrash(id);
				}}
				class="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-amber-700 hover:bg-amber-50 cursor-pointer transition-colors"
			>
				<Trash2 class="w-3.5 h-3.5 text-amber-500" />
				<span>ট্র্যাশে পাঠান</span>
			</button>
		{:else}
			<button
				type="button"
				onclick={() => {
					const id = activeAdmin!.id;
					handleWindowClick();
					restoreFromTrash(id);
				}}
				class="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50 cursor-pointer transition-colors"
			>
				<RotateCcw class="w-3.5 h-3.5 text-emerald-500" />
				<span>পুনরুদ্ধার করুন</span>
			</button>
			<button
				type="button"
				onclick={() => {
					const id = activeAdmin!.id;
					handleWindowClick();
					deletePermanently(id);
				}}
				class="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-700 hover:bg-rose-50 cursor-pointer transition-colors"
			>
				<Trash2 class="w-3.5 h-3.5 text-rose-500" />
				<span>স্থায়ীভাবে মুছে ফেলুন</span>
			</button>
		{/if}
	</div>
{/if}

<!-- ========================================================================= -->
<!-- 1. ADD ADMIN MODAL (With Menu Permissions Selector & Password Generator) -->
<!-- ========================================================================= -->
{#if isAddModalOpen}
	<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
		<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-2xl p-6 sm:p-7 animate-in zoom-in-95 duration-150 my-8">
			<!-- Header -->
			<div class="flex items-center justify-between pb-4 border-b border-slate-100">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#5845eb] flex items-center justify-center">
						<UserCog class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-lg font-black text-slate-900">নতুন অ্যাডমিন / স্টাফ যুক্ত করুন</h3>
						<p class="text-xs text-slate-400">জিমেইল, পাসওয়ার্ড এবং নির্দিষ্ট মেনুর অ্যাক্সেস কনফিগার করুন</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (isAddModalOpen = false)}
					class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
					aria-label="Close"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Form -->
			<form onsubmit={handleAddAdmin} class="space-y-5 pt-4">
				
				<!-- Grid: Name, Username, Gmail -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="new-admin-name" class="block text-xs font-bold text-slate-700 mb-1">পূর্ণ নাম *</label>
						<Input
							id="new-admin-name"
							type="text"
							required
							placeholder="যেমন: মোঃ তানভীর হাসান"
							bind:value={newAdminName}
							class="bg-slate-50 border-slate-200 text-xs"
						/>
					</div>

					<div>
						<label for="new-admin-username" class="block text-xs font-bold text-slate-700 mb-1">ইউজারনেম (Username) *</label>
						<Input
							id="new-admin-username"
							type="text"
							required
							placeholder="যেমন: tanvir_order"
							bind:value={newAdminUsername}
							class="bg-slate-50 border-slate-200 font-mono text-xs"
						/>
					</div>
				</div>

				<!-- Email & Password -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="new-admin-email" class="block text-xs font-bold text-slate-700 mb-1">লগইন ইমেইল (Gmail) *</label>
						<Input
							id="new-admin-email"
							type="email"
							required
							placeholder="যেমন: tanvir@gmail.com"
							bind:value={newAdminEmail}
							class="bg-slate-50 border-slate-200 text-xs font-sans"
						/>
					</div>

					<div>
						<div class="flex items-center justify-between mb-1">
							<label for="new-admin-password" class="block text-xs font-bold text-slate-700">লগইন পাসওয়ার্ড *</label>
							<button
								type="button"
								onclick={generateAddPassword}
								class="text-[11px] font-bold text-[#5845eb] hover:underline flex items-center gap-1 cursor-pointer"
							>
								<Sparkles class="w-3 h-3" />
								<span>অটো জেনারেট</span>
							</button>
						</div>
						<div class="relative">
							<Input
								id="new-admin-password"
								type={showNewPassword ? 'text' : 'password'}
								required
								placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
								bind:value={newAdminPassword}
								class="bg-slate-50 border-slate-200 font-mono text-xs pr-16"
							/>
							<div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
								<button
									type="button"
									onclick={() => (showNewPassword = !showNewPassword)}
									class="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
									title={showNewPassword ? 'হাইড করুন' : 'পাসওয়ার্ড দেখুন'}
								>
									{#if showNewPassword}
										<EyeOff class="w-3.5 h-3.5" />
									{:else}
										<Eye class="w-3.5 h-3.5" />
									{/if}
								</button>
								<button
									type="button"
									onclick={() => copyToClipboard(newAdminPassword, 'পাসওয়ার্ড')}
									class="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
									title="কপি করুন"
								>
									<Copy class="w-3.5 h-3.5" />
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Role Preset & Access Status -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="new-admin-role" class="block text-xs font-bold text-slate-700 mb-1">রোল প্রিসেট (Role)</label>
						<select
							id="new-admin-role"
							value={newAdminRole}
							onchange={(e) => handleRolePresetChange(e.currentTarget.value)}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] cursor-pointer"
						>
							{#each ROLE_PRESETS.filter((p) => p.role !== 'Owner') as preset}
								<option value={preset.role}>{preset.label}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="new-admin-access" class="block text-xs font-bold text-slate-700 mb-1">অ্যাক্সেস স্ট্যাটাস</label>
						<select
							id="new-admin-access"
							bind:value={newAdminAccess}
							class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] cursor-pointer"
						>
							<option value="Allowed">Allowed (অনুমোদিত)</option>
							<option value="Restricted">Restricted (সীমিত)</option>
						</select>
					</div>
				</div>

				<!-- Granular Menu Permissions Selector Grid -->
				<div class="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/50 space-y-3">
					<div class="flex items-center justify-between flex-wrap gap-2">
						<div>
							<h4 class="text-xs font-black text-slate-900">অনুমোদিত মেনু অ্যাক্সেস (Menu Permissions)</h4>
							<p class="text-[11px] text-slate-500">স্টাফ লগইন করলে সাইডবারে শুধুমাত্র এই টিক দেওয়া মেনুগুলো দেখতে পারবে</p>
						</div>
						<div class="flex items-center gap-2">
							<button
								type="button"
								onclick={selectAllPermissions}
								class="px-2.5 py-1 text-[11px] font-bold text-[#5845eb] bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 cursor-pointer transition-colors"
							>
								সব সিলেক্ট
							</button>
							<button
								type="button"
								onclick={clearAllPermissions}
								class="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
							>
								সব ক্লিয়ার
							</button>
						</div>
					</div>

					<!-- Menus Grid -->
					<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 max-h-56 overflow-y-auto pr-1">
						{#each ADMIN_MENU_LIST.filter((m) => !m.isOwnerOnly) as menu}
							{@const isChecked = newAdminPermissions.includes('*') || newAdminPermissions.includes(menu.id)}
							<button
								type="button"
								onclick={() => toggleNewPermission(menu.id)}
								class="flex items-start gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer {isChecked
									? 'bg-indigo-50/70 border-indigo-300 text-slate-900 shadow-2xs'
									: 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}"
							>
								<div class="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 {isChecked ? 'bg-[#5845eb] text-white' : 'border border-slate-300'}">
									{#if isChecked}
										<Check class="w-3 h-3 stroke-[3]" />
									{/if}
								</div>
								<div class="min-w-0">
									<div class="font-bold text-xs leading-snug">{menu.name}</div>
									<div class="text-[10px] text-slate-400 font-mono truncate">{menu.englishName}</div>
								</div>
							</button>
						{/each}
					</div>
					<div class="text-[11px] font-bold text-[#5845eb]">
						নির্বাচিত: {newAdminPermissions.includes('*') ? 'সকল মেনু' : `${newAdminPermissions.length} টি মেনু`}
					</div>
				</div>

				<!-- Actions -->
				<div class="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onclick={() => (isAddModalOpen = false)}
						class="cursor-pointer"
					>
						বাতিল
					</Button>
					<Button
						type="submit"
						variant="default"
						size="sm"
						disabled={isSaving}
						class="bg-[#5845eb] hover:bg-[#4936d8] text-white font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
					>
						{#if isSaving}
							<Loader2 class="w-3.5 h-3.5 animate-spin" />
							<span>সংরক্ষণ হচ্ছে...</span>
						{:else}
							<span>অ্যাডমিন অ্যাকাউন্ট তৈরি করুন</span>
						{/if}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ========================================================================= -->
<!-- 2. EDIT ADMIN & PERMISSIONS MODAL -->
<!-- ========================================================================= -->
{#if isEditModalOpen && editingAdmin}
	<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
		<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-2xl p-6 sm:p-7 animate-in zoom-in-95 duration-150 my-8">
			<!-- Header -->
			<div class="flex items-center justify-between pb-4 border-b border-slate-100">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#5845eb] flex items-center justify-center">
						<UserCog class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-lg font-black text-slate-900">অ্যাডমিন এডিট ও পারমিশন কন্ট্রোল</h3>
						<p class="text-xs text-slate-400">"{editingAdmin.name}" এর রোল, মেনু অধিকার ও তথ্য আপডেট করুন</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (isEditModalOpen = false)}
					class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
					aria-label="Close"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Form -->
			<form onsubmit={handleSaveEdit} class="space-y-5 pt-4">
				
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="edit-admin-name" class="block text-xs font-bold text-slate-700 mb-1">পূর্ণ নাম *</label>
						<Input
							id="edit-admin-name"
							type="text"
							required
							bind:value={editName}
							class="bg-slate-50 border-slate-200 text-xs"
						/>
					</div>

					<div>
						<label for="edit-admin-username" class="block text-xs font-bold text-slate-700 mb-1">ইউজারনেম *</label>
						<Input
							id="edit-admin-username"
							type="text"
							required
							bind:value={editUsername}
							class="bg-slate-50 border-slate-200 font-mono text-xs"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="edit-admin-email" class="block text-xs font-bold text-slate-700 mb-1">লগইন ইমেইল (Gmail) *</label>
						<Input
							id="edit-admin-email"
							type="email"
							required
							bind:value={editEmail}
							class="bg-slate-50 border-slate-200 text-xs font-sans"
						/>
					</div>

					<div>
						<label for="edit-admin-role" class="block text-xs font-bold text-slate-700 mb-1">রোল (Role)</label>
						{#if editingAdmin.role === 'Owner'}
							<Input
								id="edit-admin-role"
								type="text"
								value="Owner"
								disabled
								class="bg-slate-100 border-slate-200 text-xs font-bold text-pink-700 cursor-not-allowed"
							/>
						{:else}
							<select
								id="edit-admin-role"
								value={editRole}
								onchange={(e) => handleEditRolePresetChange(e.currentTarget.value)}
								class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5845eb] cursor-pointer"
							>
								{#each ROLE_PRESETS.filter((p) => p.role !== 'Owner') as preset}
									<option value={preset.role}>{preset.label}</option>
								{/each}
							</select>
						{/if}
					</div>
				</div>

				<!-- New Password Optional -->
				<div>
					<label for="edit-admin-password" class="block text-xs font-bold text-slate-700 mb-1">
						নতুন পাসওয়ার্ড (পরিবর্তন করতে চাইলে লিখুন)
					</label>
					<div class="relative">
						<Input
							id="edit-admin-password"
							type={showEditPassword ? 'text' : 'password'}
							placeholder="অপরিবর্তিত রাখতে খালি রাখুন"
							bind:value={editPassword}
							class="bg-slate-50 border-slate-200 font-mono text-xs pr-10"
						/>
						<button
							type="button"
							onclick={() => (showEditPassword = !showEditPassword)}
							class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
						>
							{#if showEditPassword}
								<EyeOff class="w-3.5 h-3.5" />
							{:else}
								<Eye class="w-3.5 h-3.5" />
							{/if}
						</button>
					</div>
				</div>

				<!-- Granular Menu Permissions Selector Grid -->
				{#if editingAdmin.role !== 'Owner'}
					<div class="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/50 space-y-3">
						<div class="flex items-center justify-between flex-wrap gap-2">
							<div>
								<h4 class="text-xs font-black text-slate-900">অনুমোদিত মেনু অ্যাক্সেস (Menu Permissions)</h4>
								<p class="text-[11px] text-slate-500">এই ইউজার শুধুমাত্র নির্বাচিত মেনুগুলো ব্যবহার করতে পারবে</p>
							</div>
							<div class="flex items-center gap-2">
								<button
									type="button"
									onclick={selectAllEditPermissions}
									class="px-2.5 py-1 text-[11px] font-bold text-[#5845eb] bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 cursor-pointer transition-colors"
								>
									সব সিলেক্ট
								</button>
								<button
									type="button"
									onclick={clearAllEditPermissions}
									class="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
								>
									সব ক্লিয়ার
								</button>
							</div>
						</div>

						<!-- Menus Grid -->
						<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 max-h-56 overflow-y-auto pr-1">
							{#each ADMIN_MENU_LIST.filter((m) => !m.isOwnerOnly) as menu}
								{@const isChecked = editPermissions.includes('*') || editPermissions.includes(menu.id)}
								<button
									type="button"
									onclick={() => toggleEditPermission(menu.id)}
									class="flex items-start gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer {isChecked
										? 'bg-indigo-50/70 border-indigo-300 text-slate-900 shadow-2xs'
										: 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}"
								>
									<div class="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 {isChecked ? 'bg-[#5845eb] text-white' : 'border border-slate-300'}">
										{#if isChecked}
											<Check class="w-3 h-3 stroke-[3]" />
										{/if}
									</div>
									<div class="min-w-0">
										<div class="font-bold text-xs leading-snug">{menu.name}</div>
										<div class="text-[10px] text-slate-400 font-mono truncate">{menu.englishName}</div>
									</div>
								</button>
							{/each}
						</div>
						<div class="text-[11px] font-bold text-[#5845eb]">
							নির্বাচিত: {editPermissions.includes('*') ? 'সকল মেনু' : `${editPermissions.length} টি মেনু`}
						</div>
					</div>
				{/if}

				<!-- Actions -->
				<div class="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onclick={() => (isEditModalOpen = false)}
						class="cursor-pointer"
					>
						বাতিল
					</Button>
					<Button
						type="submit"
						variant="default"
						size="sm"
						disabled={isSaving}
						class="bg-[#5845eb] hover:bg-[#4936d8] text-white font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
					>
						{#if isSaving}
							<Loader2 class="w-3.5 h-3.5 animate-spin" />
							<span>আপডেট হচ্ছে...</span>
						{:else}
							<span>পরিবর্তন সংরক্ষণ করুন</span>
						{/if}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ========================================================================= -->
<!-- 3. QUICK PASSWORD RESET MODAL -->
<!-- ========================================================================= -->
{#if isPasswordModalOpen && passwordAdmin}
	<div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-md p-6 sm:p-7 animate-in zoom-in-95 duration-150">
			<!-- Header -->
			<div class="flex items-center justify-between pb-4 border-b border-slate-100">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
						<KeyRound class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-base font-black text-slate-900">পাসওয়ার্ড পরিবর্তন / রিসেট</h3>
						<p class="text-xs text-slate-400">"{passwordAdmin.name}" এর নতুন পাসওয়ার্ড সেট করুন</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (isPasswordModalOpen = false)}
					class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
					aria-label="Close"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Form -->
			<form onsubmit={handleResetPasswordSubmit} class="space-y-4 pt-4">
				
				<!-- Current Hint if available -->
				{#if passwordAdmin.plainPasswordHint}
					<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
						<div>
							<div class="text-[11px] text-slate-400 font-bold">বর্তমান পাসওয়ার্ড:</div>
							<code class="font-mono text-xs font-bold text-slate-800">{passwordAdmin.plainPasswordHint}</code>
						</div>
						<button
							type="button"
							onclick={() => copyToClipboard(passwordAdmin!.plainPasswordHint!, 'বর্তমান পাসওয়ার্ড')}
							class="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer shadow-2xs"
							title="কপি করুন"
						>
							<Copy class="w-3.5 h-3.5" />
						</button>
					</div>
				{/if}

				<div>
					<div class="flex items-center justify-between mb-1">
						<label for="reset-pass-val" class="block text-xs font-bold text-slate-700">নতুন পাসওয়ার্ড *</label>
						<button
							type="button"
							onclick={generateQuickPassword}
							class="text-[11px] font-bold text-[#5845eb] hover:underline flex items-center gap-1 cursor-pointer"
						>
							<Sparkles class="w-3 h-3" />
							<span>অটো জেনারেট</span>
						</button>
					</div>
					<div class="relative">
						<Input
							id="reset-pass-val"
							type={showResetPassword ? 'text' : 'password'}
							required
							bind:value={resetPasswordValue}
							class="bg-slate-50 border-slate-200 font-mono text-xs pr-16"
						/>
						<div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
							<button
								type="button"
								onclick={() => (showResetPassword = !showResetPassword)}
								class="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
							>
								{#if showResetPassword}
									<EyeOff class="w-3.5 h-3.5" />
								{:else}
									<Eye class="w-3.5 h-3.5" />
								{/if}
							</button>
							<button
								type="button"
								onclick={() => copyToClipboard(resetPasswordValue, 'নতুন পাসওয়ার্ড')}
								class="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
								title="কপি করুন"
							>
								<Copy class="w-3.5 h-3.5" />
							</button>
						</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onclick={() => (isPasswordModalOpen = false)}
						class="cursor-pointer"
					>
						বাতিল
					</Button>
					<Button
						type="submit"
						variant="default"
						size="sm"
						disabled={isSaving}
						class="bg-[#5845eb] hover:bg-[#4936d8] text-white font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
					>
						{#if isSaving}
							<Loader2 class="w-3.5 h-3.5 animate-spin" />
							<span>আপডেট হচ্ছে...</span>
						{:else}
							<span>পাসওয়ার্ড সেট করুন</span>
						{/if}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
