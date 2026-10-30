import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import { GtmService, DEFAULT_GTM_SETTINGS, type GtmSettings } from '#lib/server/services/gtm.service';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	const settings = await GtmService.getSettings(db);

	return {
		settings
	};
};

export const actions: Actions = {
	saveSettings: async ({ request, platform }) => {
		const formData = await request.formData();
		const rawSettings = formData.get('settings')?.toString();

		if (!rawSettings) {
			return fail(400, { message: 'সেটিংস ডেটা পাওয়া যায়নি' });
		}

		try {
			const parsed = JSON.parse(rawSettings) as GtmSettings;
			const db = getDb(platform);

			// Validate GTM ID format if provided and enabled
			if (parsed.isEnabled && parsed.gtmId) {
				const trimmedId = parsed.gtmId.trim().toUpperCase();
				if (!trimmedId.startsWith('GTM-') || trimmedId.length < 6) {
					return fail(400, { message: 'অনুগ্রহ করে সঠিক GTM কন্টেইনার আইডি দিন (যেমন: GTM-XXXXXXX)' });
				}
				parsed.gtmId = trimmedId;
			}

			// Validate GA4 ID if provided
			if (parsed.ga4MeasurementId) {
				parsed.ga4MeasurementId = parsed.ga4MeasurementId.trim().toUpperCase();
			}

			const success = await GtmService.saveSettings(db, parsed);

			if (success) {
				return { success: true, message: 'Google Tag Manager ও GA4 সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' };
			} else {
				return fail(500, { message: 'ডাটাবেজে সেটিংস সংরক্ষণ করা যায়নি' });
			}
		} catch (err: any) {
			return fail(500, { message: err?.message || 'সেটিংস সংরক্ষণে অপ্রত্যাশিত সমস্যা হয়েছে' });
		}
	},

	resetDefaults: async ({ platform }) => {
		try {
			const db = getDb(platform);
			await GtmService.saveSettings(db, DEFAULT_GTM_SETTINGS);
			return { success: true, message: 'GTM ডিফল্ট সেটিংস সফলভাবে রিসেট করা হয়েছে' };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'রিসেট করা যায়নি' });
		}
	}
};

