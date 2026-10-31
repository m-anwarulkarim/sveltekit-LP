import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db';
import { SettingsService, DEFAULT_PRODUCT_SETTINGS } from '#lib/server/services/settings.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform }) => {
	try {
		const db = getDb(platform);
		const settings = await SettingsService.getProductSettings(db);
		return {
			settings
		};
	} catch (err) {
		console.error('Failed to load product settings from D1:', err);
		return {
			settings: { ...DEFAULT_PRODUCT_SETTINGS }
		};
	}
};

export const actions: Actions = {
	save: async ({ request, platform }) => {
		try {
			const formData = await request.formData();
			const payloadRaw = formData.get('settings');

			let settingsPayload: any = {};
			if (typeof payloadRaw === 'string') {
				settingsPayload = JSON.parse(payloadRaw);
			}

			const db = getDb(platform);
			await SettingsService.saveProductSettings(db, settingsPayload);

			return {
				success: true
			};
		} catch (err: any) {
			console.error('Failed to save product settings to D1:', err);
			return fail(500, {
				error: true,
				message: err?.message || 'প্রোডাক্ট সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে।'
			});
		}
	}
};

