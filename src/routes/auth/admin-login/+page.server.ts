import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { getAdminBootstrapPassword, getAuthSecret } from '#lib/server/secrets';
import {
	ADMIN_SESSION_COOKIE,
	ADMIN_SESSION_MAX_AGE,
	AdminAuthService
} from '#lib/server/services/admin-auth.service';

/** Only same-site admin paths are allowed, so the login page cannot be an open redirect. */
function safeRedirectTarget(value: string | null | undefined): string {
	if (value && (value === '/admin' || value.startsWith('/admin/')) && !value.includes('\\')) {
		return value;
	}
	return '/admin';
}

export const load: PageServerLoad = async ({ cookies, platform, url }) => {
	const redirectTo = safeRedirectTarget(url.searchParams.get('redirectTo'));
	const admin = await AdminAuthService.resolveSession(
		getDb(platform),
		cookies.get(ADMIN_SESSION_COOKIE),
		getAuthSecret()
	).catch(() => null);

	if (admin) throw redirect(303, redirectTo);
	return { redirectTo, isConfigured: Boolean(getAuthSecret()) };
};

export const actions: Actions = {
	login: async ({ request, cookies, platform }) => {
		const formData = await request.formData();
		const login = formData.get('login')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const redirectTo = safeRedirectTarget(formData.get('redirectTo')?.toString());

		if (!login.trim() || !password) {
			return fail(400, { message: 'ইউজারনেম এবং পাসওয়ার্ড দুটিই পূরণ করুন।' });
		}

		const secret = getAuthSecret();
		if (!secret) {
			return fail(400, { message: 'অ্যাডমিন লগইন এখনো কনফিগার করা হয়নি।' });
		}

		let admin;
		try {
			const db = getDb(platform);
			admin = await AdminAuthService.authenticate(db, login, password, getAdminBootstrapPassword());
			if (admin) {
				await AdminAuthService.recordLogin(db, admin.id).catch((err) =>
					console.error('Failed to record admin login:', err)
				);
			}
		} catch (err) {
			console.error('Admin login failed:', err);
			return fail(400, { message: 'লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' });
		}

		if (!admin) {
			return fail(401, { message: 'ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।' });
		}

		cookies.set(ADMIN_SESSION_COOKIE, await AdminAuthService.createSessionToken(admin, secret), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: ADMIN_SESSION_MAX_AGE
		});

		throw redirect(303, redirectTo);
	},

	logout: async ({ cookies }) => {
		cookies.delete(ADMIN_SESSION_COOKIE, { path: '/' });
		return { success: true };
	}
};
