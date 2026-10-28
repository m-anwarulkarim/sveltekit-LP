import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { ThemeCustomizationService } from '#lib/server/services/theme-customization.service';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		...parentData
	};
};

export const actions: Actions = {
	updateAppearance: async ({ request, platform }) => {
		const data = await request.formData();
		const primary = data.get('primary')?.toString() || '#e8007c';
		const secondary = data.get('secondary')?.toString() || '#00c153';
		const tertiary = data.get('tertiary')?.toString() || '#ff00ae';
		const dashboardStyle = (data.get('dashboardStyle')?.toString() || 'professional') as 'classic' | 'professional';
		const searchKeywords = data.get('searchKeywords')?.toString() || '';
		const checkoutLanguage = (data.get('checkoutLanguage')?.toString() || 'bangla') as 'bangla' | 'english' | 'italian';

		try {
			const db = getDb(platform);
			const res = await ThemeCustomizationService.updateAppearance(db, {
				colors: { primary, secondary, tertiary },
				dashboardStyle,
				searchKeywords,
				checkoutLanguage
			});

			return {
				success: true,
				message: res.message
			};
		} catch (error: any) {
			console.error('updateAppearance error:', error);
			return {
				success: false,
				message: error.message || 'অ্যাপিয়ারেন্স আপডেট ব্যর্থ হয়েছে!'
			};
		}
	},

	resetDefaults: async ({ platform }) => {
		try {
			const db = getDb(platform);
			const res = await ThemeCustomizationService.resetDefaults(db);
			return {
				success: true,
				message: res.message
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || 'রিসেট ব্যর্থ হয়েছে!'
			};
		}
	}
};

