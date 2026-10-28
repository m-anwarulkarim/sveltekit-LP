import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { CourierService, type CourierProviderId } from '#lib/server/services/courier.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let courierData = {
		methods: [] as any[],
		defaultProvider: 'steadfast' as CourierProviderId
	};

	try {
		const db = getDb(platform);
		courierData = await CourierService.getCourierSettings(db);
	} catch (e) {
		console.error('Failed to load courier settings from D1:', e);
	}

	return {
		...parentData,
		courierMethods: courierData.methods,
		defaultProvider: courierData.defaultProvider
	};
};

export const actions: Actions = {
	saveCourier: async ({ request, platform }) => {
		const data = await request.formData();
		const providerId = (data.get('providerId')?.toString() || 'steadfast') as CourierProviderId;
		const name = data.get('providerName')?.toString() || 'Courier';
		const specialInstruction = data.get('specialInstruction')?.toString() || '';
		const isDefault = data.get('isDefault') === 'true';

		// Extract all credential keys from form
		const credentials: Record<string, string> = {};
		for (const [key, val] of data.entries()) {
			if (!['providerId', 'providerName', 'specialInstruction', 'isDefault'].includes(key)) {
				credentials[key] = val.toString().trim();
			}
		}

		try {
			const db = getDb(platform);
			const res = await CourierService.saveCourierMethod(db, {
				id: providerId,
				name,
				credentials,
				specialInstruction,
				isDefault
			});
			return { success: true, message: res.message };
		} catch (e: any) {
			console.error('Failed to save courier:', e);
			return fail(500, { message: e.message || 'সেটিংস সেভ করতে ব্যর্থ হয়েছে' });
		}
	},

	deleteCourier: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString() as CourierProviderId;
		if (!id) return fail(400, { message: 'কুরিয়ার আইডি প্রয়োজন' });

		try {
			const db = getDb(platform);
			const res = await CourierService.deleteCourierMethod(db, id);
			return { success: true, message: res.message };
		} catch (e: any) {
			console.error('Failed to delete courier:', e);
			return fail(500, { message: e.message || 'মুছে ফেলতে ব্যর্থ হয়েছে' });
		}
	},

	setDefault: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString() as CourierProviderId;
		if (!id) return fail(400, { message: 'কুরিয়ার আইডি প্রয়োজন' });

		try {
			const db = getDb(platform);
			const res = await CourierService.setDefaultCourier(db, id);
			return { success: true, message: res.message };
		} catch (e: any) {
			console.error('Failed to set default courier:', e);
			return fail(500, { message: e.message });
		}
	},

	testConnection: async ({ request }) => {
		const data = await request.formData();
		const providerId = (data.get('providerId')?.toString() || 'steadfast') as CourierProviderId;

		const credentials: Record<string, string> = {};
		for (const [key, val] of data.entries()) {
			if (!['providerId', 'providerName', 'specialInstruction'].includes(key)) {
				credentials[key] = val.toString().trim();
			}
		}

		try {
			const result = await CourierService.testConnection(providerId, credentials);
			return {
				success: result.success,
				message: result.message,
				balance: result.balance
			};
		} catch (e: any) {
			return fail(500, { message: e.message || 'কানেকশন টেস্ট ব্যর্থ হয়েছে' });
		}
	}
};

