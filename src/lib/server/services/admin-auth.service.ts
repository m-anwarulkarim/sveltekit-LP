import { eq, or } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { hashPassword, needsPasswordUpgrade, timingSafeEqual, verifyPassword } from '../utils/password';
import { normalizePermissions } from '../../constants/admin-permissions';

export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthenticatedAdmin {
	id: string;
	name: string;
	username: string;
	email: string;
	role: string;
	access: string;
	permissions: string[];
	avatarBg: string | null;
	avatarText: string | null;
}

type AdminRow = typeof schema.adminUsers.$inferSelect;

function toBase64Url(bytes: Uint8Array): string {
	return btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

async function hmac(secret: string, value: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(`admin-session:${secret}`),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
	return toBase64Url(new Uint8Array(signature));
}

/** Binds a session to the current password, so changing it revokes every older session. */
async function passwordFingerprint(passwordHash: string | null): Promise<string> {
	const digest = await crypto.subtle.digest(
		'SHA-256',
		new TextEncoder().encode(passwordHash || 'no-password')
	);
	return toBase64Url(new Uint8Array(digest)).slice(0, 16);
}

function canSignIn(admin: AdminRow): boolean {
	return !admin.isTrashed && admin.access !== 'Suspended';
}

function toAuthenticatedAdmin(admin: AdminRow): AuthenticatedAdmin {
	return {
		id: admin.id,
		name: admin.name,
		username: admin.username,
		email: admin.email,
		role: admin.role,
		access: admin.access,
		permissions: admin.role === 'Owner' ? ['*'] : normalizePermissions(admin.permissions),
		avatarBg: admin.avatarBg,
		avatarText: admin.avatarText
	};
}

export class AdminAuthService {
	/**
	 * Verifies credentials. Returns null for every failure so callers cannot reveal
	 * whether a username exists.
	 */
	static async authenticate(
		db: DrizzleD1Database<typeof schema>,
		login: string,
		password: string,
		bootstrapPassword: string | null
	): Promise<AdminRow | null> {
		const identifier = login.trim().toLowerCase();
		if (!identifier || !password) return null;

		const admin = await db
			.select()
			.from(schema.adminUsers)
			.where(or(eq(schema.adminUsers.username, identifier), eq(schema.adminUsers.email, identifier)))
			.get();

		if (!admin || !canSignIn(admin)) return null;

		if (admin.role === 'Owner' && bootstrapPassword && timingSafeEqual(password, bootstrapPassword)) {
			if (admin.passwordHash) return admin;
			const passwordHash = await hashPassword(password);
			await db
				.update(schema.adminUsers)
				.set({ passwordHash })
				.where(eq(schema.adminUsers.id, admin.id));
			return { ...admin, passwordHash };
		}

		if (!admin.passwordHash || !(await verifyPassword(password, admin.passwordHash))) {
			return null;
		}

		if (needsPasswordUpgrade(admin.passwordHash)) {
			const passwordHash = await hashPassword(password);
			await db
				.update(schema.adminUsers)
				.set({ passwordHash })
				.where(eq(schema.adminUsers.id, admin.id));
			return { ...admin, passwordHash };
		}

		return admin;
	}

	static async recordLogin(db: DrizzleD1Database<typeof schema>, adminId: string) {
		await db
			.update(schema.adminUsers)
			.set({ lastLogin: new Date().toISOString() })
			.where(eq(schema.adminUsers.id, adminId));
	}

	static async createSessionToken(admin: AdminRow, secret: string): Promise<string> {
		const payload = toBase64Url(
			new TextEncoder().encode(
				JSON.stringify({
					id: admin.id,
					exp: Date.now() + ADMIN_SESSION_MAX_AGE * 1000,
					fp: await passwordFingerprint(admin.passwordHash)
				})
			)
		);
		return `${payload}.${await hmac(secret, payload)}`;
	}

	/**
	 * Resolves a session cookie to the live admin record. The database lookup means
	 * suspending, trashing, or changing a password takes effect on the next request.
	 */
	static async resolveSession(
		db: DrizzleD1Database<typeof schema>,
		token: string | undefined,
		secret: string | null
	): Promise<AuthenticatedAdmin | null> {
		if (!token || !secret) return null;

		const [payload, signature] = token.split('.');
		if (!payload || !signature || !timingSafeEqual(signature, await hmac(secret, payload))) {
			return null;
		}

		let claims: { id?: string; exp?: number; fp?: string };
		try {
			const binary = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
			claims = JSON.parse(binary);
		} catch {
			return null;
		}
		if (!claims.id || !claims.exp || claims.exp < Date.now()) return null;

		const admin = await db
			.select()
			.from(schema.adminUsers)
			.where(eq(schema.adminUsers.id, claims.id))
			.get();

		if (!admin || !canSignIn(admin)) return null;
		if (claims.fp !== (await passwordFingerprint(admin.passwordHash))) return null;

		return toAuthenticatedAdmin(admin);
	}
}
