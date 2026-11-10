import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { SettingsService, type GoogleConsoleConfig, DEFAULT_GOOGLE_CONSOLE_CONFIG } from '#lib/server/services/settings.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let googleConsole: GoogleConsoleConfig = { ...DEFAULT_GOOGLE_CONSOLE_CONFIG };

	try {
		const db = getDb(platform);
		const config = await SettingsService.getGoogleConsoleConfig(db);
		if (config) {
			googleConsole = config;
		}
	} catch (e) {
		console.error('Failed to load Google Search Console config from D1:', e);
	}

	return {
		...parentData,
		googleConsole
	};
};

export const actions: Actions = {
	saveSettings: async ({ request, platform }) => {
		const data = await request.formData();
		const verificationToken = data.get('verificationToken')?.toString() || '';
		// Only update facebookDomainToken if explicitly submitted; otherwise leave unchanged in D1
		const facebookDomainToken = data.has('facebookDomainToken')
			? data.get('facebookDomainToken')?.toString() || ''
			: undefined;

		try {
			const db = getDb(platform);
			const saved = await SettingsService.saveGoogleConsoleConfig(db, verificationToken, facebookDomainToken);

			return {
				success: true,
				verificationToken: saved.verificationToken,
				message: 'Google Search Console ভেরিফিকেশন কোড সফলভাবে সংরক্ষিত হয়েছে'
			};
		} catch (e: any) {
			console.error('Failed to save Google Search Console config to D1:', e);
			return fail(500, {
				success: false,
				message: e.message || 'সংরক্ষণ ব্যর্থ হয়েছে'
			});
		}
	}
};

