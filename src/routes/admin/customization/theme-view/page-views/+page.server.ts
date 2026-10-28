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
	updatePageViews: async ({ request, platform }) => {
		const data = await request.formData();
		const checkout = data.get('checkout')?.toString() || 'checkout_2';
		const productDetails = data.get('productDetails')?.toString() || 'product_details_1';
		const cartView = data.get('cartView')?.toString() || 'cart_view_1';
		const orderSuccess = data.get('orderSuccess')?.toString() || 'order_success_1';

		try {
			const db = getDb(platform);
			const res = await ThemeCustomizationService.updatePageViews(db, {
				checkout,
				productDetails,
				cartView,
				orderSuccess
			});

			return {
				success: true,
				message: res.message
			};
		} catch (error: any) {
			console.error('updatePageViews error:', error);
			return {
				success: false,
				message: error.message || 'পেজ ভিউ সেটিংস আপডেট ব্যর্থ হয়েছে!'
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

