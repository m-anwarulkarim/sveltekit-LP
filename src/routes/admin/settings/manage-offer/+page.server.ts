import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { SettingsService, type ManageOfferItem } from '#lib/server/services/settings.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let offers: ManageOfferItem[] = [];

	try {
		const db = getDb(platform);
		offers = await SettingsService.getManageOffers(db);

		// If no offers exist yet, provide a starter offer matching the user's screenshot
		if (offers.length === 0) {
			offers = [
				{
					id: 'off-new-reg',
					offerType: 'New Registration',
					discount: '10%',
					status: 'active',
					createdAt: new Date().toISOString()
				}
			];
			await SettingsService.saveManageOffers(db, offers);
		}
	} catch (e) {
		console.error('Failed to load manage offers from D1:', e);
	}

	return {
		...parentData,
		offers
	};
};

export const actions: Actions = {
	saveOffer: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString() || `off-${Date.now()}`;
		const offerType = data.get('offerType')?.toString() as any;
		const discount = data.get('discount')?.toString()?.trim() || '';
		const status = (data.get('status')?.toString() || 'active') as 'active' | 'inactive';

		const validTypes = ['New Registration', 'Online Payment', 'Free Delivery (1st Order)'];
		if (!validTypes.includes(offerType)) {
			return fail(400, { success: false, message: 'সঠিক অফারের ধরণ নির্বাচন করুন' });
		}

		if (!discount && offerType !== 'Free Delivery (1st Order)') {
			return fail(400, { success: false, message: 'ডিসকাউন্টের পরিমাণ আবশ্যক (যেমন: 500 বা 10%)' });
		}

		try {
			const db = getDb(platform);
			const currentOffers = await SettingsService.getManageOffers(db);

			const existingIndex = currentOffers.findIndex((o) => o.id === id);
			const newOffer: ManageOfferItem = {
				id,
				offerType,
				discount: discount || 'Free Delivery',
				status,
				createdAt: new Date().toISOString()
			};

			let updatedOffers: ManageOfferItem[];
			if (existingIndex >= 0) {
				updatedOffers = [...currentOffers];
				updatedOffers[existingIndex] = {
					...updatedOffers[existingIndex],
					...newOffer
				};
			} else {
				updatedOffers = [newOffer, ...currentOffers];
			}

			await SettingsService.saveManageOffers(db, updatedOffers);
			return { success: true, message: 'অফার সফলভাবে সংরক্ষিত হয়েছে' };
		} catch (e: any) {
			console.error('Failed to save offer to D1:', e);
			return fail(500, { success: false, message: e.message });
		}
	},

	deleteOffer: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { success: false, message: 'ID required' });

		try {
			const db = getDb(platform);
			const currentOffers = await SettingsService.getManageOffers(db);
			const updatedOffers = currentOffers.filter((o) => o.id !== id);
			await SettingsService.saveManageOffers(db, updatedOffers);
			return { success: true, message: 'অফার মুছে ফেলা হয়েছে' };
		} catch (e: any) {
			console.error('Failed to delete offer:', e);
			return fail(500, { success: false, message: e.message });
		}
	},

	toggleStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { success: false, message: 'ID required' });

		try {
			const db = getDb(platform);
			const currentOffers = await SettingsService.getManageOffers(db);
			const updatedOffers = currentOffers.map((o) => {
				if (o.id === id) {
					return {
						...o,
						status: o.status === 'active' ? ('inactive' as const) : ('active' as const)
					};
				}
				return o;
			});
			await SettingsService.saveManageOffers(db, updatedOffers);
			return { success: true, message: 'স্ট্যাটাস পরিবর্তন হয়েছে' };
		} catch (e: any) {
			console.error('Failed to toggle offer status:', e);
			return fail(500, { success: false, message: e.message });
		}
	}
};

