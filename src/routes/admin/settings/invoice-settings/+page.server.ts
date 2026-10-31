import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { SettingsService, DEFAULT_INVOICE_CONFIG } from '#lib/server/services/settings.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let invoiceConfig = { ...DEFAULT_INVOICE_CONFIG };

	try {
		const db = getDb(platform);
		const config = await SettingsService.getInvoiceConfig(db);
		if (config) {
			invoiceConfig = config;
		}
	} catch (e) {
		console.error('Failed to load invoice settings from D1:', e);
	}

	return {
		...parentData,
		invoiceConfig
	};
};

export const actions: Actions = {
	save: async ({ request, platform }) => {
		const data = await request.formData();

		const template = String(data.get('template') || 'classicDesign');
		const disablePrice = data.get('disablePrice') === 'true' || data.get('disablePrice') === 'on';
		const enableCourier = data.get('enableCourier') === 'true' || data.get('enableCourier') === 'on';
		const enableReturnPolicy = data.get('enableReturnPolicy') === 'true' || data.get('enableReturnPolicy') === 'on';

		try {
			const db = getDb(platform);
			await SettingsService.saveInvoiceConfig(db, {
				template,
				disablePrice,
				enableCourier,
				enableReturnPolicy
			});

			return {
				success: true,
				message: 'ইনভয়েস ডিজাইন ও সেটিংস সফলভাবে সংরক্ষিত হয়েছে!'
			};
		} catch (e: any) {
			console.error('Failed to save invoice settings to D1:', e);
			return fail(500, {
				success: false,
				message: e.message || 'ইনভয়েস সেটিংস সংরক্ষণে সমস্যা হয়েছে।'
			});
		}
	}
};

