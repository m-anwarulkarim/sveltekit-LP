import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { AdminControlService } from '#lib/server/services/admin-control.service';
import { ROLE_PRESETS } from '#lib/constants/admin-permissions';

const MIN_PASSWORD_LENGTH = 8;
const VALID_ROLES = ROLE_PRESETS.map((r) => r.role);
const VALID_ACCESS = ['Allowed', 'Restricted', 'Suspended'] as const;

/** Rejects the request with 403 if the acting admin is not an Owner. */
function requireOwner(locals: App.Locals) {
	if (locals.admin?.role !== 'Owner') {
		return fail(403, { message: 'এই অ্যাকশনটি শুধুমাত্র Owner করতে পারবেন।' });
	}
}

function validatePassword(pw: string | undefined): string | null {
	if (!pw || pw.length < MIN_PASSWORD_LENGTH) {
		return `পাসওয়ার্ড ন্যূনতম ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।`;
	}
	return null;
}

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let admins: any[] = [];

	try {
		const db = getDb(platform);
		admins = (await AdminControlService.listAdminUsers(db)) as any;
	} catch (error) {
		console.error('Failed to load admin users from D1:', error);
	}

	return { ...parentData, admins };
};

export const actions: Actions = {
	createAdmin: async ({ request, platform, locals }) => {
		const guard = requireOwner(locals);
		if (guard) return guard;

		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim() || '';
		const username = data.get('username')?.toString()?.trim()?.toLowerCase() || '';
		const email = data.get('email')?.toString()?.trim()?.toLowerCase() || '';
		const rawRole = data.get('role')?.toString()?.trim() || 'Support Staff';
		const rawAccess = data.get('access')?.toString() || 'Allowed';
		const password = data.get('password')?.toString()?.trim() || '';
		const rawPermissions = data.get('permissions')?.toString();

		if (!name) return fail(400, { message: 'নাম আবশ্যক।' });
		if (!username) return fail(400, { message: 'ইউজারনেম আবশ্যক।' });
		if (!/^[a-z0-9_.-]+$/.test(username))
			return fail(400, { message: 'ইউজারনেমে শুধু a-z, 0-9, _ বা . ব্যবহার করুন।' });

		const pwErr = validatePassword(password);
		if (pwErr) return fail(400, { message: pwErr });

		// Only Owner can create another Owner — downgrade silently if not.
		const role = VALID_ROLES.includes(rawRole) ? rawRole : 'Support Staff';
		if (role === 'Owner')
			return fail(403, { message: 'Owner রোলের অ্যাডমিন তৈরি করা সম্ভব নয়।' });

		const access = (VALID_ACCESS as readonly string[]).includes(rawAccess)
			? (rawAccess as (typeof VALID_ACCESS)[number])
			: 'Allowed';

		let permissions: string[] = [];
		if (rawPermissions) {
			try {
				permissions = JSON.parse(rawPermissions);
			} catch {
				permissions = rawPermissions.split(',').map((p) => p.trim()).filter(Boolean);
			}
		}

		const finalEmail = email || `${username}@haqplus.com`;

		try {
			const db = getDb(platform);
			const newAdmin = await AdminControlService.createAdminUser(db, {
				name,
				username,
				email: finalEmail,
				role,
				access,
				password,
				permissions: permissions.length > 0 ? permissions : undefined
			});
			return { success: true, admin: newAdmin, message: `নতুন অ্যাডমিন "${name}" সফলভাবে যুক্ত হয়েছে!` };
		} catch (error: any) {
			console.error('Failed to create admin user in D1:', error);
			return fail(400, { message: error.message || 'অ্যাডমিন ইউজার যুক্ত করতে সমস্যা হয়েছে।' });
		}
	},

	updateAdmin: async ({ request, platform, locals }) => {
		const guard = requireOwner(locals);
		if (guard) return guard;

		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString()?.trim();
		const username = data.get('username')?.toString()?.trim()?.toLowerCase();
		const email = data.get('email')?.toString()?.trim()?.toLowerCase();
		const rawRole = data.get('role')?.toString()?.trim();
		const rawAccess = data.get('access')?.toString();
		const password = data.get('password')?.toString()?.trim();
		const rawPermissions = data.get('permissions')?.toString();

		if (!id) return fail(400, { message: 'অ্যাডমিন আইডি আবশ্যক।' });

		if (username !== undefined && username !== '' && !/^[a-z0-9_.-]+$/.test(username))
			return fail(400, { message: 'ইউজারনেমে শুধু a-z, 0-9, _ বা . ব্যবহার করুন।' });

		if (password) {
			const pwErr = validatePassword(password);
			if (pwErr) return fail(400, { message: pwErr });
		}

		const role =
			rawRole !== undefined
				? VALID_ROLES.includes(rawRole)
					? rawRole
					: undefined
				: undefined;

		// Prevent escalating any account to Owner via edit
		if (role === 'Owner') return fail(403, { message: 'কারো রোল Owner-এ পরিবর্তন করা যাবে না।' });

		const access =
			rawAccess !== undefined && (VALID_ACCESS as readonly string[]).includes(rawAccess)
				? (rawAccess as (typeof VALID_ACCESS)[number])
				: undefined;

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
			return { success: true, message: 'অ্যাডমিন তথ্য ও মেনু পারমিশন সফলভাবে আপডেট হয়েছে!' };
		} catch (error: any) {
			console.error('Failed to update admin user in D1:', error);
			return fail(400, { message: error.message || 'অ্যাডমিন তথ্য আপডেট করতে সমস্যা হয়েছে।' });
		}
	},

	resetPassword: async ({ request, platform, locals }) => {
		const guard = requireOwner(locals);
		if (guard) return guard;

		const data = await request.formData();
		const id = data.get('id')?.toString();
		const password = data.get('password')?.toString()?.trim();

		if (!id) return fail(400, { message: 'অ্যাডমিন আইডি আবশ্যক।' });
		const pwErr = validatePassword(password);
		if (pwErr) return fail(400, { message: pwErr });

		try {
			const db = getDb(platform);
			await AdminControlService.resetPassword(db, id, password!);
			return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' };
		} catch (error: any) {
			console.error('Failed to reset admin password in D1:', error);
			return fail(400, { message: error.message || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে।' });
		}
	},

	updateAccess: async ({ request, platform, locals }) => {
		const guard = requireOwner(locals);
		if (guard) return guard;

		const data = await request.formData();
		const id = data.get('id')?.toString();
		const rawAccess = data.get('access')?.toString();

		if (!id) return fail(400, { message: 'অ্যাডমিন আইডি আবশ্যক।' });
		if (!rawAccess || !(VALID_ACCESS as readonly string[]).includes(rawAccess))
			return fail(400, { message: 'অবৈধ অ্যাক্সেস স্তর।' });

		const access = rawAccess as (typeof VALID_ACCESS)[number];

		try {
			const db = getDb(platform);
			await AdminControlService.updateAccess(db, id, access);
			const label =
				access === 'Allowed'
					? 'অনুমোদিত'
					: access === 'Suspended'
						? 'সাসপেন্ড'
						: 'সীমাবদ্ধ';
			return { success: true, message: `অ্যাক্সেস "${label}" করা হয়েছে।` };
		} catch (error: any) {
			console.error('Failed to update access in D1:', error);
			return fail(400, { message: error.message || 'অ্যাক্সেস পরিবর্তন করতে সমস্যা হয়েছে।' });
		}
	},

	moveToTrash: async ({ request, platform, locals }) => {
		const guard = requireOwner(locals);
		if (guard) return guard;

		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(400, { message: 'অ্যাডমিন আইডি আবশ্যক।' });

		try {
			const db = getDb(platform);
			await AdminControlService.moveToTrash(db, id);
			return { success: true, message: 'অ্যাডমিনকে ট্র্যাশে পাঠানো হয়েছে।' };
		} catch (error: any) {
			console.error('Failed to trash admin in D1:', error);
			return fail(400, { message: error.message || 'ট্র্যাশে পাঠাতে সমস্যা হয়েছে।' });
		}
	},

	restoreFromTrash: async ({ request, platform, locals }) => {
		const guard = requireOwner(locals);
		if (guard) return guard;

		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(400, { message: 'অ্যাডমিন আইডি আবশ্যক।' });

		try {
			const db = getDb(platform);
			await AdminControlService.restoreFromTrash(db, id);
			return { success: true, message: 'অ্যাডমিনকে সফলভাবে পুনরুদ্ধার করা হয়েছে।' };
		} catch (error: any) {
			console.error('Failed to restore admin in D1:', error);
			return fail(400, { message: error.message || 'পুনরুদ্ধার করতে সমস্যা হয়েছে।' });
		}
	},

	deletePermanently: async ({ request, platform, locals }) => {
		const guard = requireOwner(locals);
		if (guard) return guard;

		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(400, { message: 'অ্যাডমিন আইডি আবশ্যক।' });

		try {
			const db = getDb(platform);
			await AdminControlService.deletePermanently(db, id);
			return { success: true, message: 'অ্যাডমিন স্থায়ীভাবে মুছে ফেলা হয়েছে।' };
		} catch (error: any) {
			console.error('Failed to permanently delete admin in D1:', error);
			return fail(400, { message: error.message || 'মুছে ফেলতে সমস্যা হয়েছে।' });
		}
	},

	bulkAction: async ({ request, platform, locals }) => {
		const guard = requireOwner(locals);
		if (guard) return guard;

		const data = await request.formData();
		const rawIds = data.get('ids')?.toString();
		const action = data.get('action')?.toString() as 'trash' | 'restore' | 'delete' | undefined;

		if (!action || !['trash', 'restore', 'delete'].includes(action))
			return fail(400, { message: 'অবৈধ bulk action।' });

		let ids: string[] = [];
		try {
			ids = JSON.parse(rawIds || '[]');
		} catch {
			ids = rawIds ? rawIds.split(',').filter(Boolean) : [];
		}

		if (ids.length === 0) return fail(400, { message: 'কোনো অ্যাডমিন নির্বাচন করা হয়নি।' });

		try {
			const db = getDb(platform);
			const result = await AdminControlService.bulkAction(db, ids, action);
			const actionLabel = action === 'trash' ? 'ট্র্যাশে পাঠানো' : action === 'restore' ? 'পুনরুদ্ধার' : 'মুছে ফেলা';
			return { success: true, message: `${result.count}জন অ্যাডমিন ${actionLabel} হয়েছে।` };
		} catch (error: any) {
			console.error('Failed bulk action in D1:', error);
			return fail(400, { message: error.message || 'Bulk action সম্পন্ন হয়নি।' });
		}
	}
};
