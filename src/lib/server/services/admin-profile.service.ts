import { eq, and, ne, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface UpdateProfileInput {
	name: string;
	username: string;
	email: string;
	phone?: string;
}

export interface ChangePasswordInput {
	currentPassword?: string;
	newPassword: string;
	confirmPassword: string;
}

export class AdminProfileService {
	private static columnsEnsured = false;

	/**
	 * Columns already guaranteed by migrations.
	 */
	static async ensureColumns(_db: DrizzleD1Database<typeof schema>) {
		// No-op: Columns are defined in schema and applied via migrations
	}

	/**
	 * Cryptographic password hasher using standard Web Crypto API (SHA-256 with Salt).
	 * Fully native in Cloudflare Workers and Node.js without binary dependencies.
	 */
	static async hashPassword(password: string, salt?: string): Promise<string> {
		const s = salt || crypto.randomUUID().replace(/-/g, '').slice(0, 16);
		const enc = new TextEncoder();
		const data = enc.encode(`${password}:${s}`);
		const hashBuf = await crypto.subtle.digest('SHA-256', data);
		const hashHex = Array.from(new Uint8Array(hashBuf))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
		return `${s}:${hashHex}`;
	}

	static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
		if (!storedHash || !storedHash.includes(':')) return false;
		const [salt] = storedHash.split(':');
		const computed = await this.hashPassword(password, salt);
		return computed === storedHash;
	}

	/**
	 * Fetches the active Owner profile from D1.
	 */
	static async getOwnerProfile(db: DrizzleD1Database<typeof schema>) {
		await this.ensureColumns(db);

		// 1. Try to find Owner
		let owner = await db
			.select()
			.from(schema.adminUsers)
			.where(eq(schema.adminUsers.role, 'Owner'))
			.limit(1)
			.all();

		// 2. If no explicit owner, fetch first admin
		if (!owner || owner.length === 0) {
			owner = await db.select().from(schema.adminUsers).limit(1).all();
		}

		if (owner && owner.length > 0) {
			const adm = owner[0];
			return {
				id: adm.id,
				name: adm.name || 'Thecolorlighthouse',
				username: adm.username || 'thecolorlighthouse',
				email: adm.email || 'contact@thecolorlighthouse.com',
				phone: adm.phone || '01780081623',
				role: adm.role || 'OWNER',
				avatarUrl: adm.avatarUrl || null,
				avatarBg: adm.avatarBg || 'bg-black text-pink-500 border-pink-500/40',
				avatarText: adm.avatarText || 'COLOR LIGHT',
				hasPassword: Boolean(adm.passwordHash),
				createdAt: adm.createdAt ? new Date(adm.createdAt) : new Date('2025-09-03'),
				updatedAt: adm.updatedAt ? new Date(adm.updatedAt) : new Date()
			};
		}

		// Fallback default
		return {
			id: '1',
			name: 'Thecolorlighthouse',
			username: 'thecolorlighthouse',
			email: 'admin@thecolorlighthouse.com',
			phone: '01780081623',
			role: 'OWNER',
			avatarUrl: null,
			avatarBg: 'bg-black text-pink-500 border-pink-500/40',
			avatarText: 'COLOR LIGHT',
			hasPassword: true,
			createdAt: new Date('2025-09-03'),
			updatedAt: new Date()
		};
	}

	/**
	 * Updates profile details (Name, Username, Email, Phone).
	 */
	static async updateProfile(
		db: DrizzleD1Database<typeof schema>,
		adminId: string,
		input: UpdateProfileInput
	) {
		await this.ensureColumns(db);

		const name = input.name.trim();
		const username = input.username.trim().toLowerCase();
		const email = input.email.trim().toLowerCase();
		const phone = input.phone?.trim() || '';

		if (!name || !username || !email) {
			throw new Error('নাম, ইউজারনেম এবং ইমেইল প্রদান করা বাধ্যতামূলক!');
		}

		// Check for email collision with other accounts
		const conflictEmail = await db
			.select({ id: schema.adminUsers.id })
			.from(schema.adminUsers)
			.where(and(eq(schema.adminUsers.email, email), ne(schema.adminUsers.id, adminId)))
			.get();

		if (conflictEmail) {
			throw new Error(`এই ইমেইলটি (${email}) ইতিমধ্যে অন্য একজন অ্যাডমিনের অ্যাকাউন্টে ব্যবহৃত হচ্ছে! অন্য কোনো ইমেইল দিন।`);
		}

		// Check for username collision with other accounts
		const conflictUsername = await db
			.select({ id: schema.adminUsers.id })
			.from(schema.adminUsers)
			.where(and(eq(schema.adminUsers.username, username), ne(schema.adminUsers.id, adminId)))
			.get();

		if (conflictUsername) {
			throw new Error(`এই ইউজারনেমটি (${username}) ইতিমধ্যে অন্য কারো অ্যাকাউন্টে ব্যবহৃত হচ্ছে! অন্য ইউজারনেম দিন।`);
		}

		try {
			// Update in D1
			await db
				.update(schema.adminUsers)
				.set({
					name,
					username,
					email,
					phone,
					updatedAt: new Date()
				})
				.where(eq(schema.adminUsers.id, adminId));
		} catch (err: any) {
			if (err.message?.includes('UNIQUE constraint failed: admin_users.email')) {
				throw new Error(`এই ইমেইলটি (${email}) ইতিমধ্যে অন্য একটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে!`);
			}
			if (err.message?.includes('UNIQUE constraint failed: admin_users.username')) {
				throw new Error(`এই ইউজারনেমটি (${username}) ইতিমধ্যে অন্য একটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে!`);
			}
			throw new Error(err.message || 'ডাটাবেসে প্রোফাইল আপডেট ব্যর্থ হয়েছে!');
		}

		return {
			success: true,
			message: 'প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!'
		};
	}

	/**
	 * Updates the profile avatar image.
	 */
	static async updateAvatar(
		db: DrizzleD1Database<typeof schema>,
		adminId: string,
		avatarUrl: string
	) {
		await this.ensureColumns(db);

		if (!avatarUrl) {
			throw new Error('অবৈধ ইমেজ পাথ!');
		}

		await db
			.update(schema.adminUsers)
			.set({
				avatarUrl,
				updatedAt: new Date()
			})
			.where(eq(schema.adminUsers.id, adminId));

		return {
			success: true,
			message: 'প্রোফাইল ছবি সফলভাবে পরিবর্তন করা হয়েছে!'
		};
	}

	/**
	 * Changes admin password securely with current password verification.
	 */
	static async changePassword(
		db: DrizzleD1Database<typeof schema>,
		adminId: string,
		input: ChangePasswordInput
	) {
		await this.ensureColumns(db);

		const { currentPassword, newPassword, confirmPassword } = input;

		if (!newPassword || newPassword.length < 6) {
			throw new Error('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!');
		}

		if (newPassword !== confirmPassword) {
			throw new Error('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মেলেনি!');
		}

		// Fetch existing admin
		const [admin] = await db
			.select()
			.from(schema.adminUsers)
			.where(eq(schema.adminUsers.id, adminId))
			.limit(1);

		if (!admin) {
			throw new Error('অ্যাডমিন ইউজার পাওয়া যায়নি!');
		}

		// Verify current password if one is already set
		if (admin.passwordHash) {
			if (!currentPassword) {
				throw new Error('বর্তমান পাসওয়ার্ড প্রদান করা বাধ্যতামূলক!');
			}
			const isValid = await this.verifyPassword(currentPassword, admin.passwordHash);
			if (!isValid) {
				throw new Error('বর্তমান পাসওয়ার্ডটি সঠিক নয়!');
			}
		}

		// Generate new salt and hash
		const newHash = await this.hashPassword(newPassword);

		await db
			.update(schema.adminUsers)
			.set({
				passwordHash: newHash,
				updatedAt: new Date()
			})
			.where(eq(schema.adminUsers.id, adminId));

		return {
			success: true,
			message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!'
		};
	}
}
