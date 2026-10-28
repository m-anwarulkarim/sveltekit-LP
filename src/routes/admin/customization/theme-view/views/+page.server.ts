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
	updateThemeViews: async ({ request, platform }) => {
		const data = await request.formData();
		const header = data.get('header')?.toString() || 'header_1';
		const showcase = data.get('showcase')?.toString() || 'showcase_2';
		const category = data.get('category')?.toString() || 'category_1';
		const productCard = data.get('productCard')?.toString() || 'product_card_3';
		const bottomNav = data.get('bottomNav')?.toString() || 'bottom_nav_1';
		const footer = data.get('footer')?.toString() || 'footer_1';
		const productSectionsJson = data.get('productSections')?.toString() || '["tag"]';

		let productSections = ['tag'];
		try {
			productSections = JSON.parse(productSectionsJson);
		} catch {
			productSections = ['tag'];
		}

		try {
			const db = getDb(platform);
			const res = await ThemeCustomizationService.updateThemeViews(db, {
				header,
				showcase,
				category,
				productCard,
				bottomNav,
				footer,
				productSections
			});

			return {
				success: true,
				message: res.message
			};
		} catch (error: any) {
			console.error('updateThemeViews error:', error);
			return {
				success: false,
				message: error.message || 'থিম ভিউ আপডেট ব্যর্থ হয়েছে!'
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

