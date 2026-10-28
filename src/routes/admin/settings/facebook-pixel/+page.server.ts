import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db';
import { PixelService, DEFAULT_PIXEL_SETTINGS, type MetaPixelSettings } from '#lib/server/services/pixel.service';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	const [settings, gtmStatus] = await Promise.all([
		PixelService.getSettings(db),
		PixelService.getGtmStatus(db)
	]);

	return {
		settings,
		gtmStatus
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
			const parsed = JSON.parse(rawSettings) as MetaPixelSettings;
			const db = getDb(platform);
			const success = await PixelService.saveSettings(db, parsed);

			if (success) {
				return { success: true, message: 'ফেসবুক পিক্সেল ও CAPI সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' };
			} else {
				return fail(500, { message: 'ডাটাবেজে সেটিংস সংরক্ষণ করা যায়নি' });
			}
		} catch (err: any) {
			return fail(500, { message: err?.message || 'সেটিংস সংরক্ষণে অপ্রত্যাশিত সমস্যা হয়েছে' });
		}
	},

	testCapi: async ({ request }) => {
		const formData = await request.formData();
		const pixelId = formData.get('pixelId')?.toString() || '';
		const capiToken = formData.get('capiToken')?.toString() || '';
		const testEventCode = formData.get('testEventCode')?.toString() || '';

		if (!pixelId || !capiToken) {
			return fail(400, { message: 'Pixel ID এবং CAPI Access Token উভয়ই প্রদান করা আবশ্যক' });
		}

		try {
			const result = await PixelService.testCapiConnection(pixelId, capiToken, testEventCode);
			if (result.success) {
				return { success: true, message: result.message, details: result.details };
			} else {
				return fail(400, { message: result.message, details: result.details });
			}
		} catch (err: any) {
			return fail(500, { message: err?.message || 'কানেকশন টেস্টে নেটওয়ার্ক সমস্যা' });
		}
	},

	resetDefaults: async ({ platform }) => {
		try {
			const db = getDb(platform);
			await PixelService.saveSettings(db, DEFAULT_PIXEL_SETTINGS);
			return { success: true, message: 'ডিফল্ট সেটিংস সফলভাবে রিসেট করা হয়েছে' };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'রিসেট করা যায়নি' });
		}
	}
};

