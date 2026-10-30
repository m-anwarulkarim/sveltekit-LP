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
	signUpEmail: async (event) => {
		const { auth } = event.locals;
		if (!auth) {
			return fail(500, { message: 'সার্ভার সেবা সাময়িকভাবে অনুপলব্ধ।' });
		}

		const formData = await event.request.formData();
		const name = formData.get('name')?.toString()?.trim() ?? '';
		const email = formData.get('email')?.toString()?.trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!name || !email || !password) {
			return fail(400, { message: 'অনুগ্রহ করে সকল ফিল্ড পূরণ করুন।' });
		}

		if (password.length < 6) {
			return fail(400, { message: 'পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।' });
		}

		try {
			await auth.api.signUpEmail({
				body: {
					name,
					email,
					password,
					callbackURL: '/account'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				const raw = error.message?.toLowerCase() || '';
				if (raw.includes('already') || raw.includes('exists') || raw.includes('duplicate')) {
					return fail(400, { message: 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।' });
				}
				return fail(400, { message: error.message || 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে।' });
			}
			return fail(500, { message: 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।' });
		}

		return redirect(302, '/account');
	}
};
