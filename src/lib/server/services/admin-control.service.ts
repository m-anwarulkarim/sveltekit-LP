import { eq, desc, and, or, sql, inArray, like } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { hashPassword } from '../utils/password';
import { normalizePermissions } from '../../constants/admin-permissions';

export interface AdminUserFilterOptions {
	search?: string;
	isTrashed?: boolean;
	role?: string;
}

export interface CreateAdminUserInput {
	name: string;
	username: string;
	email: string;
	role?: string;
	access?: 'Allowed' | 'Restricted' | 'Suspended';
	avatarBg?: string;
	avatarText?: string;
	password?: string;
	permissions?: string[];
}

export interface UpdateAdminUserInput {
	name?: string;
	username?: string;
	email?: string;
	role?: string;
	access?: 'Allowed' | 'Restricted' | 'Suspended';
	permissions?: string[];
	password?: string;
}

/**
 * Enterprise Admin Control & Role Access Management Service
 */
export class AdminControlService {
	/**
	 * Lists admin users
	 */
	static async listAdminUsers(
		db: DrizzleD1Database<typeof schema>,
		options: AdminUserFilterOptions = {}
	) {
		try {
			const conditions: any[] = [];

			if (options.isTrashed !== undefined) {
				conditions.push(eq(schema.adminUsers.isTrashed, options.isTrashed));
			}

			if (options.role && options.role !== 'all') {
				conditions.push(eq(schema.adminUsers.role, options.role));
			}

			if (options.search && options.search.trim()) {
				const term = `%${options.search.trim().toLowerCase()}%`;
				conditions.push(
					or(
						like(schema.adminUsers.name, term),
						like(schema.adminUsers.username, term),
						like(schema.adminUsers.email, term),
						like(schema.adminUsers.role, term)
					)
				);
			}

			let query = db.select().from(schema.adminUsers);

			if (conditions.length > 0) {
				query = query.where(and(...conditions)) as any;
			}

			query = query.orderBy(desc(schema.adminUsers.createdAt)) as any;

			const rows = await query.all();

			return rows.map((r) => ({
				id: r.id,
				name: r.name,
				username: r.username,
				email: r.email,
				role: r.role,
				lastLogin: r.lastLogin || null,
				registeredAt: r.createdAt
					? new Date(r.createdAt).toLocaleDateString('en-US', {
							month: 'short',
							day: 'numeric',
							year: 'numeric'
						})
					: null,
				access: r.access as 'Allowed' | 'Restricted' | 'Suspended',
				isTrashed: r.isTrashed,
				avatarBg: r.avatarBg || 'bg-indigo-600 text-white border-indigo-400',
				avatarText: r.avatarText || 'AK',
				avatarUrl: r.avatarUrl || null,
				permissions: normalizePermissions(r.permissions),
				hasPassword: Boolean(r.passwordHash)
			}));
		} catch (error) {
			console.error('Error in AdminControlService.listAdminUsers:', error);
			return [];
		}
	}

	/**
	 * Create a new admin user
	 */
	static async createAdminUser(
		db: DrizzleD1Database<typeof schema>,
		input: CreateAdminUserInput
	) {
		const id = crypto.randomUUID();
		const now = new Date();

		const initials = input.avatarText || input.name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2) || 'AD';

		if (input.password && input.password.trim().length < 8) {
			throw new Error('পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে।');
		}
		const passwordHash = input.password ? await hashPassword(input.password.trim()) : null;
		const permissions = JSON.stringify(input.permissions || (input.role === 'Owner' ? ['*'] : []));

		await db.insert(schema.adminUsers).values({
			id,
			name: input.name.trim(),
			username: input.username.trim().toLowerCase(),
			email: input.email.trim().toLowerCase(),
			role: input.role || 'Staff',
			access: input.access || 'Allowed',
			isTrashed: false,
			lastLogin: 'Never',
			passwordHash,
			permissions,
			avatarBg: input.avatarBg || 'bg-[#5845eb] text-white border-indigo-300',
			avatarText: initials,
			createdAt: now,
			updatedAt: now
		});

		return {
			id,
			name: input.name,
			username: input.username,
			email: input.email,
			role: input.role || 'Staff',
			access: input.access || 'Allowed',
			isTrashed: false,
			lastLogin: 'Never',
			registeredAt: 'Just Now',
			permissions: normalizePermissions(permissions),
			hasPassword: Boolean(passwordHash),
			avatarBg: input.avatarBg || 'bg-[#5845eb] text-white border-indigo-300',
			avatarText: initials
		};
	}

	/**
	 * Update admin user details and permissions
	 */
	static async updateAdminUser(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		input: UpdateAdminUserInput
	) {
		const target = await db
			.select()
			.from(schema.adminUsers)
			.where(eq(schema.adminUsers.id, id))
			.get();

		if (!target) {
			throw new Error('অ্যাডমিন ইউজার পাওয়া যায়নি!');
		}

		const updates: any = {
			updatedAt: new Date()
		};

		if (input.name !== undefined) updates.name = input.name.trim();
		if (input.username !== undefined) updates.username = input.username.trim().toLowerCase();
		if (input.email !== undefined) updates.email = input.email.trim().toLowerCase();
		if (input.role !== undefined) {
			if (target.role === 'Owner' && input.role !== 'Owner') {
				throw new Error('Owner এর রোল পরিবর্তন করা যাবে না!');
			}
			updates.role = input.role;
		}
		if (input.access !== undefined) {
			if (target.role === 'Owner' && input.access !== 'Allowed') {
				throw new Error('Owner অ্যাকাউন্টের অ্যাক্সেস পরিবর্তন করা সম্ভব নয়!');
			}
			updates.access = input.access;
		}
		if (input.permissions !== undefined) {
			updates.permissions = JSON.stringify(input.permissions);
		}
		if (input.password && input.password.trim()) {
			if (input.password.trim().length < 8) throw new Error('পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে।');
			updates.passwordHash = await hashPassword(input.password.trim());
		}

		await db
			.update(schema.adminUsers)
			.set(updates)
			.where(eq(schema.adminUsers.id, id));

		return { success: true, id };
	}

	/**
	 * Reset admin user password
	 */
	static async resetPassword(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		newPassword: string
	) {
		if (!newPassword || newPassword.trim().length < 8) {
			throw new Error('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে!');
		}

		const passwordHash = await hashPassword(newPassword.trim());
		await db
			.update(schema.adminUsers)
			.set({
				passwordHash,
				updatedAt: new Date()
			})
			.where(eq(schema.adminUsers.id, id));

		return { success: true, id };
	}

	/**
	 * Update access level
	 */
	static async updateAccess(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		access: 'Allowed' | 'Restricted' | 'Suspended'
	) {
		const target = await db
			.select({ role: schema.adminUsers.role })
			.from(schema.adminUsers)
			.where(eq(schema.adminUsers.id, id))
			.get();

		if (target?.role === 'Owner' && access !== 'Allowed') {
			throw new Error('Owner অ্যাকাউন্টের অ্যাক্সেস পরিবর্তন করা সম্ভব নয়!');
		}

		await db
			.update(schema.adminUsers)
			.set({ access, updatedAt: new Date() })
			.where(eq(schema.adminUsers.id, id));
		return { success: true, id, access };
	}

	/**
	 * Move admin user to trash (Protected: Owner cannot be trashed)
	 */
	static async moveToTrash(db: DrizzleD1Database<typeof schema>, id: string) {
		const target = await db
			.select({ role: schema.adminUsers.role })
			.from(schema.adminUsers)
			.where(eq(schema.adminUsers.id, id))
			.get();

		if (target?.role === 'Owner') {
			throw new Error('Owner অ্যাকাউন্টকে ট্র্যাশে স্থানান্তর করা নিষিদ্ধ!');
		}

		await db
			.update(schema.adminUsers)
			.set({ isTrashed: true, updatedAt: new Date() })
			.where(eq(schema.adminUsers.id, id));
		return { success: true, id };
	}

	/**
	 * Restore admin user from trash
	 */
	static async restoreFromTrash(db: DrizzleD1Database<typeof schema>, id: string) {
		await db
			.update(schema.adminUsers)
			.set({ isTrashed: false, updatedAt: new Date() })
			.where(eq(schema.adminUsers.id, id));
		return { success: true, id };
	}

	/**
	 * Permanently delete admin user (Protected: Owner cannot be deleted)
	 */
	static async deletePermanently(db: DrizzleD1Database<typeof schema>, id: string) {
		const target = await db
			.select({ role: schema.adminUsers.role })
			.from(schema.adminUsers)
			.where(eq(schema.adminUsers.id, id))
			.get();

		if (target?.role === 'Owner') {
			throw new Error('Owner অ্যাকাউন্টকে মুছে ফেলা সম্পূর্ণ নিষিদ্ধ!');
		}

		await db.delete(schema.adminUsers).where(eq(schema.adminUsers.id, id));
		return { success: true, id };
	}

	/**
	 * Bulk delete or trash (Protected: Owner is automatically excluded)
	 */
	static async bulkAction(
		db: DrizzleD1Database<typeof schema>,
		ids: string[],
		action: 'trash' | 'restore' | 'delete'
	) {
		if (ids.length === 0) return { count: 0 };

		let safeIds = ids;
		if (action === 'delete' || action === 'trash') {
			const owners = await db
				.select({ id: schema.adminUsers.id })
				.from(schema.adminUsers)
				.where(and(inArray(schema.adminUsers.id, ids), eq(schema.adminUsers.role, 'Owner')))
				.all();
			const ownerIds = new Set(owners.map((o) => o.id));
			safeIds = ids.filter((id) => !ownerIds.has(id));
		}

		if (safeIds.length === 0) {
			return { success: true, count: 0, message: 'Owner অ্যাকাউন্ট সুরক্ষিত রাখা হয়েছে।' };
		}

		if (action === 'delete') {
			await db.delete(schema.adminUsers).where(inArray(schema.adminUsers.id, safeIds));
		} else {
			const isTrashed = action === 'trash';
			await db
				.update(schema.adminUsers)
				.set({ isTrashed, updatedAt: new Date() })
				.where(inArray(schema.adminUsers.id, safeIds));
		}

		return { success: true, count: safeIds.length };
	}
}
