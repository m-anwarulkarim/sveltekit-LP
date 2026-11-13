import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, '/account');
	}

	const token = event.url.searchParams.get('token');
	const error = event.url.searchParams.get('error');

	if (!token || error) {
		return {
			validToken: false,
			token: '',
			errorMessage: error || 'পাসওয়ার্ড রিসেট লিংকটি অকার্যকর বা মেয়াদোত্তীর্ণ।'
		};
	}

	return {
		validToken: true,
		token,
		errorMessage: null
	};
};

export const actions: Actions = {
	resetPassword: async (event) => {
		const { auth } = event.locals;
		if (!auth) {
			return fail(500, { message: 'সার্ভার সেবা সাময়িকভাবে অনুপলব্ধ।' });
		}

		const formData = await event.request.formData();
		const token = formData.get('token')?.toString()?.trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

		if (!token) {
			return fail(400, { message: 'পাসওয়ার্ড রিসেট টোকেন পাওয়া যায়নি। নতুন লিংকের জন্য অনুরোধ করুন।' });
		}

		if (!password || !confirmPassword) {
			return fail(400, { message: 'অনুগ্রহ করে নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড পূরণ করুন।' });
		}

		if (password.length < 8) {
			return fail(400, { message: 'পাসওয়ার্ডটি অন্তত ৮ অক্ষরের হতে হবে।' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'উভয় পাসওয়ার্ড একই হতে হবে।' });
		}

		try {
			await auth.api.resetPassword({
				body: {
					newPassword: password,
					token
				}
			});
		} catch (error: any) {
			console.error('Password reset execution failed:', error);
			if (error instanceof APIError) {
				return fail(400, {
					message: 'রিসেট লিংকটির মেয়াদ শেষ হয়ে গেছে বা লিংকটি সঠিক নয়। অনুগ্রহ করে নতুন লিংকের জন্য অনুরোধ করুন।'
				});
			}
			return fail(400, {
				message: 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।'
			});
		}

		return redirect(303, '/auth/login?reset=success');
	}
};

