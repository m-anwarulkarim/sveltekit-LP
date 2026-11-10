import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { CourierService, type CourierProviderId } from '#lib/server/services/courier.service';
import { fail } from '@sveltejs/kit';

const SENSITIVE_KEYS = ['secretKey', 'password', 'apiAccessToken', 'clientSecret', 'paperflyKey'];
const MASKED_PLACEHOLDER = '••••••••';

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

	// Mask sensitive credentials so raw secrets are never leaked to client/browser
	const maskedMethods = (courierData.methods || []).map((method) => {
		const creds = { ...(method.credentials || {}) };
		for (const key of SENSITIVE_KEYS) {
			if (creds[key]) {
				creds[key] = MASKED_PLACEHOLDER;
			}
		}
		return {
			...method,
			credentials: creds
		};
	});

	return {
		...parentData,
		courierMethods: maskedMethods,
		defaultProvider: courierData.defaultProvider
	};
};

export const actions: Actions = {
	saveCourier: async ({ request, platform }) => {
		const data = await request.formData();
		const providerId = (data.get('providerId')?.toString() || 'steadfast') as CourierProviderId;
		const name = data.get('providerName')?.toString() || 'Courier';
		const specialInstruction = data.get('specialInstruction')?.toString() || '';
		const isDefaultParam = data.get('isDefault');

		// Extract all credential keys from form
		const submittedCredentials: Record<string, string> = {};
		for (const [key, val] of data.entries()) {
			if (!['providerId', 'providerName', 'specialInstruction', 'isDefault'].includes(key)) {
				submittedCredentials[key] = val.toString().trim();
			}
		}

		try {
			const db = getDb(platform);
			// Fetch existing stored settings from D1 to preserve masked/unchanged secrets and default status
			const { methods } = await CourierService.getCourierSettings(db);
			const existingMethod = methods.find((m) => m.id === providerId);
			const existingCreds = existingMethod?.credentials || {};

			const mergedCredentials = { ...submittedCredentials };
			for (const key of SENSITIVE_KEYS) {
				const submittedVal = submittedCredentials[key];
				// If submitted value is masked or empty, preserve existing stored secret
				if (submittedVal === MASKED_PLACEHOLDER || (!submittedVal && existingCreds[key])) {
					mergedCredentials[key] = existingCreds[key];
				}
			}

			// Determine isDefault: if not explicitly specified, preserve existing default status
			const shouldBeDefault = isDefaultParam !== null
				? isDefaultParam === 'true'
				: (existingMethod?.isDefault ?? (methods.length === 0));

			const res = await CourierService.saveCourierMethod(db, {
				id: providerId,
				name,
				credentials: mergedCredentials,
				specialInstruction,
				isDefault: shouldBeDefault
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

	testConnection: async ({ request, platform }) => {
		const data = await request.formData();
		const providerId = (data.get('providerId')?.toString() || 'steadfast') as CourierProviderId;

		const credentials: Record<string, string> = {};
		for (const [key, val] of data.entries()) {
			if (!['providerId', 'providerName', 'specialInstruction'].includes(key)) {
				credentials[key] = val.toString().trim();
			}
		}

		try {
			const db = getDb(platform);
			const { methods } = await CourierService.getCourierSettings(db).catch(() => ({ methods: [] }));
			const existing = methods.find((m) => m.id === providerId);
			if (existing?.credentials) {
				for (const key of SENSITIVE_KEYS) {
					if (credentials[key] === MASKED_PLACEHOLDER || (!credentials[key] && existing.credentials[key])) {
						credentials[key] = existing.credentials[key];
					}
				}
			}

			const result = await CourierService.testConnection(providerId, credentials);
			if (!result.success) {
				return fail(400, { message: result.message || 'কানেকশন টেস্ট ব্যর্থ হয়েছে' });
			}
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

