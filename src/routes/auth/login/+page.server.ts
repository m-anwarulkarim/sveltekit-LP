import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, '/account');
	}
	return {};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const { auth } = event.locals;
		if (!auth) {
			return fail(500, { message: 'সার্ভার সেবা সাময়িকভাবে অনুপলব্ধ।' });
		}

		const formData = await event.request.formData();
		const email = formData.get('email')?.toString()?.trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!email || !password) {
			return fail(400, { message: 'অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দুটিই পূরণ করুন।' });
		}

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/account'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				const raw = error.message?.toLowerCase() || '';
				if (raw.includes('invalid') || raw.includes('password') || raw.includes('credential')) {
					return fail(400, { message: 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।' });
				}
				return fail(400, { message: error.message || 'লগইন করতে ব্যর্থ হয়েছে।' });
			}
			return fail(500, { message: 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আপনার তথ্য পুনরায় চেক করুন।' });
		}

		return redirect(302, '/account');
	},
	signOut: async (event) => {
		const { auth } = event.locals;
		if (auth) {
			try {
				await auth.api.signOut({
					headers: event.request.headers
				});
			} catch {
				// Continue to redirect
			}
		}
		return redirect(302, '/');
	}
};
