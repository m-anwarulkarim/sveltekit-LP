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
	applyPreset: async ({ request, platform }) => {
		const data = await request.formData();
		const presetId = data.get('presetId')?.toString() || '';
		const presetName = data.get('presetName')?.toString() || '';
		const header = data.get('header')?.toString() || 'header_1';
		const showcase = data.get('showcase')?.toString() || 'showcase_2';
		const productCard = data.get('productCard')?.toString() || 'product_card_3';
		const footer = data.get('footer')?.toString() || 'footer_1';

		if (!presetName) {
			return {
				success: false,
				message: 'প্রিসেটের নাম পাওয়া যায়নি!'
			};
		}

		try {
			const db = getDb(platform);
			const res = await ThemeCustomizationService.applyDesignPreset(db, {
				id: presetId,
				name: presetName,
				components: {
					header,
					showcase,
					productCard,
					footer
				}
			});

			return {
				success: true,
				message: res.message
			};
		} catch (error: any) {
			console.error('applyPreset error:', error);
			return {
				success: false,
				message: error.message || 'থিম ডিজাইন প্রয়োগ ব্যর্থ হয়েছে!'
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

