import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { EmailSettingsService } from '#lib/server/services/email-settings.service';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/account');
	}

	let isEmailEnabled = false;
	try {
		const db = getDb(event.platform);
		const emailSettings = await EmailSettingsService.getEmailSettings(db);
		isEmailEnabled = Boolean(emailSettings?.enabled && emailSettings?.apiKey);
	} catch {
		isEmailEnabled = false;
	}

	return {
		isEmailEnabled
	};
};

export const actions: Actions = {
	requestReset: async (event) => {
		const { auth } = event.locals;
		if (!auth) {
			return fail(500, { message: 'সার্ভার সেবা সাময়িকভাবে অনুপলব্ধ। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।' });
		}

		const formData = await event.request.formData();
		const email = formData.get('email')?.toString()?.trim()?.toLowerCase() ?? '';

		if (!email || !email.includes('@')) {
			return fail(400, { message: 'একটি সঠিক ইমেইল অ্যাড্রেস লিখুন।' });
		}

		try {
			await auth.api.requestPasswordReset({
				body: {
					email,
					redirectTo: `${event.url.origin}/auth/reset-password`
				}
			});
		} catch (error: any) {
			console.error('Password reset request error:', error);
			// Do not leak if user doesn't exist, but log the error
		}

		return {
			success: true,
			email
		};
	}
};
