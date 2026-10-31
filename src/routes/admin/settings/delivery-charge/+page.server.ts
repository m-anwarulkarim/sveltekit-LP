import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { SettingsService } from '#lib/server/services/settings.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let deliveryConfig = {
		insideDhakaCharge: 60,
		outsideDhakaCharge: 120,
		subAreaCharge: 100,
		enableFreeDelivery: false,
		freeShippingThreshold: 2000,
		hotlinePhone: '01860-229546',
		storeName: 'AURA Store'
	};

	try {
		const db = getDb(platform);
		const config = await SettingsService.getStoreDeliveryConfig(db);
		if (config) {
			deliveryConfig = {
				...deliveryConfig,
				...config
			};
		}
	} catch (e) {
		console.error('Failed to load delivery settings from D1:', e);
	}

	return {
		...parentData,
		deliveryConfig
	};
};

export const actions: Actions = {
	saveCharges: async ({ request, platform }) => {
		const data = await request.formData();

		const insideDhakaCharge = Number(data.get('insideDhakaCharge')) || 0;
		const outsideDhakaCharge = Number(data.get('outsideDhakaCharge')) || 0;
		const subAreaCharge = Number(data.get('subAreaCharge')) || 0;
		const enableFreeDelivery = data.get('enableFreeDelivery') === 'true' || data.get('enableFreeDelivery') === 'on';
		const freeShippingThreshold = Number(data.get('freeShippingThreshold')) || 0;

		if (insideDhakaCharge < 0 || outsideDhakaCharge < 0 || subAreaCharge < 0) {
			return fail(400, {
				success: false,
				message: 'ডেলিভারি চার্জ ঋণাত্মক (Negative) হতে পারে না'
			});
		}

		try {
			const db = getDb(platform);
			await SettingsService.saveStoreDeliveryConfig(db, {
				insideDhakaCharge,
				outsideDhakaCharge,
				subAreaCharge,
				enableFreeDelivery,
				freeShippingThreshold
			});

			return {
				success: true,
				message: 'ডেলিভারি চার্জ সফলভাবে ডাটাবেসে সংরক্ষিত হয়েছে'
			};
		} catch (e: any) {
			console.error('Failed to save delivery charges to D1:', e);
			return fail(500, {
				success: false,
				message: e.message || 'ডেলিভারি চার্জ সংরক্ষণ ব্যর্থ হয়েছে'
			});
		}
	}
};

