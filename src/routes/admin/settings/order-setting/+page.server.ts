import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import {
	SettingsService,
	DEFAULT_ORDER_SETTINGS,
	type OrderSettingsConfig
} from '#lib/server/services/settings.service';

export const load: PageServerLoad = async ({ platform }) => {
	try {
		const db = getDb(platform);
		const settings = await SettingsService.getOrderSettings(db);
		return { settings };
	} catch (e: any) {
		console.error('Failed to load order settings:', e);
		return {
			settings: { ...DEFAULT_ORDER_SETTINGS }
		};
	}
};

export const actions: Actions = {
	save: async ({ request, platform }) => {
		try {
			const data = await request.formData();
			const rawPayload = data.get('settings')?.toString();

			if (!rawPayload) {
				return fail(400, {
					success: false,
					message: 'কোনো সেটিংস ডেটা পাওয়া যায়নি!'
				});
			}

			let config: Partial<OrderSettingsConfig> = {};
			try {
				config = JSON.parse(rawPayload);
			} catch (parseErr) {
				return fail(400, {
					success: false,
					message: 'অবৈধ ডেটা ফরম্যাট!'
				});
			}

			const db = getDb(platform);
			const saved = await SettingsService.saveOrderSettings(db, config);

			return {
				success: true,
				message: 'অর্ডার সেটিংস সফলভাবে ক্লাউডফ্লেয়ার D1-এ সংরক্ষিত হয়েছে!',
				settings: saved
			};
		} catch (error: any) {
			console.error('Error saving order settings:', error);
			return fail(500, {
				success: false,
				message: error?.message || 'অর্ডার সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে!'
			});
		}
	}
};

