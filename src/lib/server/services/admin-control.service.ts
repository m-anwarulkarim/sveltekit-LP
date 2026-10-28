import { eq, desc, and, or, sql, inArray, like } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

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
}

export interface UpdateAdminUserInput {
	name?: string;
	username?: string;
	email?: string;
	role?: string;
	access?: 'Allowed' | 'Restricted' | 'Suspended';
}

/**
 * Enterprise Admin Control & Role Access Management Service
 */
export class AdminControlService {
	/**
	 * Lists admin users with auto-seeding
	 */
	static async listAdminUsers(
		db: DrizzleD1Database<typeof schema>,
		options: AdminUserFilterOptions = {}
	) {
		try {
			// Auto-seed initial admin users if table is empty
			const countRes = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.adminUsers)
				.all();
			const totalInDb = countRes[0]?.count ?? 0;

			if (totalInDb === 0) {
				await this.seedInitialAdmins(db);
			}

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
				lastLogin: r.lastLogin || 'Oct 28, 2026',
				registeredAt: r.createdAt
					? new Date(r.createdAt).toLocaleDateString('en-US', {
							month: 'short',
							day: 'numeric',
							year: 'numeric'
						})
					: 'Sep 3, 2025',
				access: r.access as 'Allowed' | 'Restricted' | 'Suspended',
				isTrashed: r.isTrashed,
				avatarBg: r.avatarBg || 'bg-indigo-600 text-white border-indigo-400',
				avatarText: r.avatarText || 'AK'
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

		await db.insert(schema.adminUsers).values({
			id,
			name: input.name.trim(),
			username: input.username.trim().toLowerCase(),
			email: input.email.trim().toLowerCase(),
			role: input.role || 'Admin',
			access: input.access || 'Allowed',
			isTrashed: false,
			lastLogin: 'Never',
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
			role: input.role || 'Admin',
			access: input.access || 'Allowed',
			isTrashed: false,
			lastLogin: 'Never',
			registeredAt: 'Just Now',
			avatarBg: input.avatarBg || 'bg-[#5845eb] text-white border-indigo-300',
			avatarText: initials
		};
	}

	/**
	 * Update access level
	 */
	static async updateAccess(
		db: DrizzleD1Database<typeof schema>,
		id: string,
		access: 'Allowed' | 'Restricted' | 'Suspended'
	) {
		await db
			.update(schema.adminUsers)
			.set({ access, updatedAt: new Date() })
			.where(eq(schema.adminUsers.id, id));
		return { success: true, id, access };
	}

	/**
	 * Move admin user to trash
	 */
	static async moveToTrash(db: DrizzleD1Database<typeof schema>, id: string) {
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
	 * Permanently delete admin user
	 */
	static async deletePermanently(db: DrizzleD1Database<typeof schema>, id: string) {
		await db.delete(schema.adminUsers).where(eq(schema.adminUsers.id, id));
		return { success: true, id };
	}

	/**
	 * Bulk delete or trash
	 */
	static async bulkAction(
		db: DrizzleD1Database<typeof schema>,
		ids: string[],
		action: 'trash' | 'restore' | 'delete'
	) {
		if (ids.length === 0) return { count: 0 };

		if (action === 'delete') {
			await db.delete(schema.adminUsers).where(inArray(schema.adminUsers.id, ids));
		} else {
			const isTrashed = action === 'trash';
			await db
				.update(schema.adminUsers)
				.set({ isTrashed, updatedAt: new Date() })
				.where(inArray(schema.adminUsers.id, ids));
		}

		return { success: true, count: ids.length };
	}

	/**
	 * Seed initial admins into database
	 */
	static async seedInitialAdmins(db: DrizzleD1Database<typeof schema>) {
		const seedList = [
			{
				id: '1',
				name: 'thecolorlighthouse',
				username: 'thecolorlighthouse',
				email: 'contact@thecolorlighthouse.com',
				role: 'Owner',
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
				access: 'Suspended',
				isTrashed: true,
				avatarBg: 'bg-slate-700 text-slate-300 border-slate-500',
				avatarText: 'LG'
			}
		];

		for (const admin of seedList) {
			try {
				await db
					.insert(schema.adminUsers)
					.values({
						id: admin.id,
						name: admin.name,
						username: admin.username,
						email: admin.email,
						role: admin.role,
						access: admin.access,
						isTrashed: admin.isTrashed,
						avatarBg: admin.avatarBg,
						avatarText: admin.avatarText,
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.onConflictDoNothing();
			} catch (e) {
				console.error(`Failed to seed admin user ${admin.username}:`, e);
			}
		}
	}
}
