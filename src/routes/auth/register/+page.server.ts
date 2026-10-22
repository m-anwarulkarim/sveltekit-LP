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
			return fail(500, { message: 'Auth service unavailable' });
		}

		const formData = await event.request.formData();
		const name = formData.get('name')?.toString() ?? '';
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

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
				return fail(400, { message: error.message || 'Registration failed' });
			}
			return fail(500, { message: 'Could not create account. Please try again.' });
		}

		return redirect(302, '/account');
	}
};
