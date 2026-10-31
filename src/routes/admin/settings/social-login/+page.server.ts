import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { SettingsService, DEFAULT_SOCIAL_LOGIN_CONFIG } from '#lib/server/services/settings.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform }) => {
	try {
		const db = getDb(platform);
		const settings = await SettingsService.getSocialLoginConfig(db);
		return { settings };
	} catch (error) {
		console.error('Failed to load social login settings from D1:', error);
		return { settings: { ...DEFAULT_SOCIAL_LOGIN_CONFIG } };
	}
};

export const actions: Actions = {
	save: async ({ request, platform }) => {
		try {
			const data = await request.formData();
			const payloadRaw = data.get('settings');

			let settingsPayload: any = {};
			if (typeof payloadRaw === 'string') {
				settingsPayload = JSON.parse(payloadRaw);
			} else {
				settingsPayload = {
					enableGoogleLogin: data.get('enableGoogleLogin') === 'true' || data.get('enableGoogleLogin') === 'on',
					googleClientId: data.get('googleClientId')?.toString() || '',
					googleClientSecret: data.get('googleClientSecret')?.toString() || '',
					enableOneTap: data.get('enableOneTap') === 'true' || data.get('enableOneTap') === 'on'
				};
			}

			const db = getDb(platform);
			const saved = await SettingsService.saveSocialLoginConfig(db, settingsPayload);

			return {
				success: true,
				settings: saved,
				message: 'Google সোশ্যাল লগইন সেটিংস সফলভাবে সংরক্ষিত হয়েছে!'
			};
		} catch (err: any) {
			console.error('Failed to save social login settings to D1:', err);
			return fail(500, {
				error: true,
				message: err?.message || 'সোশ্যাল লগইন সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে।'
			});
		}
	}
};
