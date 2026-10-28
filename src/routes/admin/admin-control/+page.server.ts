import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { AdminControlService } from '#lib/server/services/admin-control.service';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let admins: any[] = [];

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);
			const liveAdmins = await AdminControlService.listAdminUsers(db);
			admins = (liveAdmins || []) as any;
		} catch (error) {
			console.error('Failed to load admin users from D1:', error);
		}
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
		const role = data.get('role')?.toString()?.trim() || 'Admin';
		const access = (data.get('access')?.toString() || 'Allowed') as 'Allowed' | 'Restricted' | 'Suspended';

		if (!name || !username) {
			return { success: false, message: 'Name and Username are required' };
		}

		const finalEmail = email || `${username}@example.com`;

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				const newAdmin = await AdminControlService.createAdminUser(db, {
					name,
					username,
					email: finalEmail,
					role,
					access
				});
				return { success: true, admin: newAdmin, message: `নতুন অ্যাডমিন "${name}" সফলভাবে যুক্ত হয়েছে!` };
			} catch (error: any) {
				console.error('Failed to create admin user in D1:', error);
				return { success: false, message: error.message || 'অ্যাডমিন ইউজার যুক্ত করতে সমস্যা হয়েছে' };
			}
		}

		return {
			success: true,
			admin: {
				id: 'adm-' + Date.now(),
				name,
				username,
				email: finalEmail,
				role,
				access,
				isTrashed: false,
				lastLogin: 'Never',
				registeredAt: 'Just Now',
				avatarBg: 'bg-[#5845eb] text-white border-indigo-300',
				avatarText: name.slice(0, 2).toUpperCase()
			},
			message: `নতুন অ্যাডমিন "${name}" সফলভাবে যুক্ত হয়েছে!`
		};
	},

	updateAccess: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const access = data.get('access')?.toString() as 'Allowed' | 'Restricted' | 'Suspended';

		if (!id || !access) {
			return { success: false, message: 'ID and Access are required' };
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await AdminControlService.updateAccess(db, id, access);
				return { success: true, message: `অ্যাক্সেস "${access}" এ পরিবর্তিত হয়েছে।` };
			} catch (error: any) {
				console.error('Failed to update access in D1:', error);
				return { success: false, message: error.message };
			}
		}

		return { success: true, message: `অ্যাক্সেস "${access}" এ পরিবর্তিত হয়েছে।` };
	},

	moveToTrash: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return { success: false, message: 'ID required' };

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await AdminControlService.moveToTrash(db, id);
				return { success: true, message: 'ইউজারকে ট্র্যাশে পাঠানো হয়েছে।' };
			} catch (error: any) {
				console.error('Failed to trash admin in D1:', error);
				return { success: false, message: error.message };
			}
		}

		return { success: true, message: 'ইউজারকে ট্র্যাশে পাঠানো হয়েছে।' };
	},

	restoreFromTrash: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return { success: false, message: 'ID required' };

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await AdminControlService.restoreFromTrash(db, id);
				return { success: true, message: 'ইউজারকে সফলভাবে পুনরুদ্ধার করা হয়েছে।' };
			} catch (error: any) {
				console.error('Failed to restore admin in D1:', error);
				return { success: false, message: error.message };
			}
		}

		return { success: true, message: 'ইউজারকে সফলভাবে পুনরুদ্ধার করা হয়েছে।' };
	},

	deletePermanently: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return { success: false, message: 'ID required' };

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await AdminControlService.deletePermanently(db, id);
				return { success: true, message: 'ইউজার স্থায়ীভাবে মুছে ফেলা হয়েছে।' };
			} catch (error: any) {
				console.error('Failed to permanently delete admin in D1:', error);
				return { success: false, message: error.message };
			}
		}

		return { success: true, message: 'ইউজার স্থায়ীভাবে মুছে ফেলা হয়েছে।' };
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

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await AdminControlService.bulkAction(db, ids, action);
				return { success: true, message: `${ids.length}টি ইউজারে অ্যাকশন সফল হয়েছে!` };
			} catch (error: any) {
				console.error('Failed bulk action in D1:', error);
				return { success: false, message: error.message };
			}
		}

		return { success: true, message: `${ids.length}টি ইউজারে অ্যাকশন সফল হয়েছে!` };
	}
};
