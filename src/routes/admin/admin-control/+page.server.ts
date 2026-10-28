import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { AdminControlService } from '#lib/server/services/admin-control.service';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let admins: any[] = [];

	try {
		const db = getDb(platform);
		const liveAdmins = await AdminControlService.listAdminUsers(db);
		admins = (liveAdmins || []) as any;
	} catch (error) {
		console.error('Failed to load admin users from D1:', error);
	}

	return {
		...parentData,
		admins
	};
};

export const actions: Actions = {
	createAdmin: async ({ request, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const username = data.get('username')?.toString()?.trim()?.toLowerCase();
		const email = data.get('email')?.toString()?.trim()?.toLowerCase();
		const role = data.get('role')?.toString()?.trim() || 'Staff';
		const access = (data.get('access')?.toString() || 'Allowed') as 'Allowed' | 'Restricted' | 'Suspended';
		const password = data.get('password')?.toString()?.trim();
		const rawPermissions = data.get('permissions')?.toString();

		if (!name || !username) {
			return { success: false, message: 'নাম এবং ইউজারনেম আবশ্যক' };
		}

		let permissions: string[] = [];
		if (rawPermissions) {
			try {
				permissions = JSON.parse(rawPermissions);
			} catch {
				permissions = rawPermissions.split(',').map((p) => p.trim()).filter(Boolean);
			}
		}

		const finalEmail = email || `${username}@gmail.com`;

		try {
			const db = getDb(platform);
			const newAdmin = await AdminControlService.createAdminUser(db, {
				name,
				username,
				email: finalEmail,
				role,
				access,
				password: password || undefined,
				permissions: permissions.length > 0 ? permissions : undefined
			});
			return { success: true, admin: newAdmin, message: `নতুন অ্যাডমিন "${name}" সফলভাবে যুক্ত হয়েছে!` };
		} catch (error: any) {
			console.error('Failed to create admin user in D1:', error);
			return { success: false, message: error.message || 'অ্যাডমিন ইউজার যুক্ত করতে সমস্যা হয়েছে' };
		}
	},

	updateAdmin: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString()?.trim();
		const username = data.get('username')?.toString()?.trim()?.toLowerCase();
		const email = data.get('email')?.toString()?.trim()?.toLowerCase();
		const role = data.get('role')?.toString()?.trim();
		const access = data.get('access')?.toString() as 'Allowed' | 'Restricted' | 'Suspended' | undefined;
		const password = data.get('password')?.toString()?.trim();
		const rawPermissions = data.get('permissions')?.toString();

		if (!id) {
			return { success: false, message: 'অ্যাডমিন আইডি আবশ্যক' };
		}

		let permissions: string[] | undefined = undefined;
		if (rawPermissions !== undefined) {
			try {
				permissions = JSON.parse(rawPermissions);
			} catch {
				permissions = rawPermissions.split(',').map((p) => p.trim()).filter(Boolean);
			}
		}

		try {
			const db = getDb(platform);
			await AdminControlService.updateAdminUser(db, id, {
				name,
				username,
				email,
				role,
				access,
				permissions,
				password: password || undefined
			});
			return { success: true, message: 'অ্যাডমিন তথ্য ও মেনু পারমিশন সফলভাবে আপডেট হয়েছে!' };
		} catch (error: any) {
			console.error('Failed to update admin user in D1:', error);
			return { success: false, message: error.message || 'অ্যাডমিন তথ্য আপডেট করতে সমস্যা হয়েছে' };
		}
	},

	resetPassword: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const password = data.get('password')?.toString()?.trim();

		if (!id || !password) {
			return { success: false, message: 'আইডি এবং নতুন পাসওয়ার্ড আবশ্যক' };
		}

		try {
			const db = getDb(platform);
			await AdminControlService.resetPassword(db, id, password);
			return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' };
		} catch (error: any) {
			console.error('Failed to reset admin password in D1:', error);
			return { success: false, message: error.message || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে' };
		}
	},

	updateAccess: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const access = data.get('access')?.toString() as 'Allowed' | 'Restricted' | 'Suspended';

		if (!id || !access) {
			return { success: false, message: 'ID and Access are required' };
		}

		try {
			const db = getDb(platform);
			await AdminControlService.updateAccess(db, id, access);
			return { success: true, message: `অ্যাক্সেস "${access}" এ পরিবর্তিত হয়েছে।` };
		} catch (error: any) {
			console.error('Failed to update access in D1:', error);
			return { success: false, message: error.message };
		}
	},

	moveToTrash: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return { success: false, message: 'ID required' };

		try {
			const db = getDb(platform);
			await AdminControlService.moveToTrash(db, id);
			return { success: true, message: 'ইউজারকে ট্র্যাশে পাঠানো হয়েছে।' };
		} catch (error: any) {
			console.error('Failed to trash admin in D1:', error);
			return { success: false, message: error.message };
		}
	},

	restoreFromTrash: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return { success: false, message: 'ID required' };

		try {
			const db = getDb(platform);
			await AdminControlService.restoreFromTrash(db, id);
			return { success: true, message: 'ইউজারকে সফলভাবে পুনরুদ্ধার করা হয়েছে।' };
		} catch (error: any) {
			console.error('Failed to restore admin in D1:', error);
			return { success: false, message: error.message };
		}
	},

	deletePermanently: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return { success: false, message: 'ID required' };

		try {
			const db = getDb(platform);
			await AdminControlService.deletePermanently(db, id);
			return { success: true, message: 'ইউজার স্থায়ীভাবে মুছে ফেলা হয়েছে।' };
		} catch (error: any) {
			console.error('Failed to permanently delete admin in D1:', error);
			return { success: false, message: error.message };
		}
	},

	bulkAction: async ({ request, platform }) => {
		const data = await request.formData();
		const rawIds = data.get('ids')?.toString();
		const action = (data.get('action')?.toString() || 'trash') as 'trash' | 'restore' | 'delete';
		let ids: string[] = [];

		try {
			ids = JSON.parse(rawIds || '[]');
		} catch {
			ids = rawIds ? rawIds.split(',') : [];
		}

		if (ids.length === 0) {
			return { success: false, message: 'No IDs provided' };
		}

		try {
			const db = getDb(platform);
			await AdminControlService.bulkAction(db, ids, action);
			return { success: true, message: `${ids.length}টি ইউজারে অ্যাকশন সফল হয়েছে!` };
		} catch (error: any) {
			console.error('Failed bulk action in D1:', error);
			return { success: false, message: error.message };
		}
	}
};
