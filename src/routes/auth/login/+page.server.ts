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
			return fail(500, { message: 'Auth service unavailable' });
		}

		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

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
				return fail(400, { message: error.message || 'Invalid credentials' });
			}
			return fail(500, { message: 'Sign in failed. Please check your credentials.' });
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
