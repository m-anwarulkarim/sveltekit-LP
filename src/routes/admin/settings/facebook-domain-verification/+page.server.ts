import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { SettingsService } from '#lib/server/services/settings.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform }) => {
	try {
		const db = getDb(platform);
		const config = await SettingsService.getGoogleConsoleConfig(db);
		return { facebookDomainToken: config.facebookDomainToken };
	} catch (e) {
		console.error('Failed to load Facebook domain verification config:', e);
		return { facebookDomainToken: '' };
	}
};

export const actions: Actions = {
	saveToken: async ({ request, platform }) => {
		const data = await request.formData();
		const facebookDomainToken = data.get('facebookDomainToken')?.toString() || '';

		try {
			const db = getDb(platform);

			let cleanToken = facebookDomainToken.trim();
			const match = cleanToken.match(/content=["']([^"']+)["']/i);
			if (match && match[1]) cleanToken = match[1].trim();
			else cleanToken = cleanToken.replace(/^<meta[^>]*>/i, '').replace(/["']/g, '').trim();

			await SettingsService.setSetting(db, 'google_console', 'facebook_domain_token', cleanToken);

			return {
				success: true,
				facebookDomainToken: cleanToken,
				message: 'Facebook Domain Verification Token সফলভাবে সংরক্ষিত হয়েছে'
			};
		} catch (e: any) {
			console.error('Failed to save Facebook domain token:', e);
			return fail(500, {
				success: false,
				message: e.message || 'সংরক্ষণ ব্যর্থ হয়েছে'
			});
		}
	}
};
