import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { SettingsService, type PaymentConfig } from '#lib/server/services/settings.service';
import { BkashService } from '#lib/server/services/bkash.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let paymentConfig: PaymentConfig = {
		enableCOD: true,
		enableBkash: false,
		bkashMode: 'sandbox',
		bkashAppKey: '',
		bkashAppSecret: '',
		bkashUsername: '',
		bkashPassword: '',
		enableNagad: false,
		nagadMerchantId: '',
		enableSSLCommerz: false,
		sslStoreId: ''
	};

	try {
		const db = getDb(platform);
		paymentConfig = await SettingsService.getPaymentConfig(db);
	} catch (e) {
		console.error('Failed to load payment config:', e);
	}

	return {
		...parentData,
		paymentConfig
	};
};

export const actions: Actions = {
	save: async ({ request, platform }) => {
		try {
			const data = await request.formData();
			const enableCOD = data.get('enableCOD') === 'true';
			const enableBkash = data.get('enableBkash') === 'true';
			const bkashMode = (data.get('bkashMode')?.toString() === 'live' ? 'live' : 'sandbox') as 'sandbox' | 'live';
			const bkashAppKey = data.get('bkashAppKey')?.toString()?.trim() || '';
			const bkashAppSecret = data.get('bkashAppSecret')?.toString()?.trim() || '';
			const bkashUsername = data.get('bkashUsername')?.toString()?.trim() || '';
			const bkashPassword = data.get('bkashPassword')?.toString()?.trim() || '';

			const enableNagad = data.get('enableNagad') === 'true';
			const nagadMerchantId = data.get('nagadMerchantId')?.toString()?.trim() || '';
			const enableSSLCommerz = data.get('enableSSLCommerz') === 'true';
			const sslStoreId = data.get('sslStoreId')?.toString()?.trim() || '';

			if (enableBkash && (!bkashAppKey || !bkashAppSecret)) {
				return fail(400, {
					message: 'বিকাশ সক্রিয় করতে App Key এবং App Secret উভয়ই প্রদান করা আবশ্যক'
				});
			}

			const db = getDb(platform);
			await SettingsService.savePaymentConfig(db, {
				enableCOD,
				enableBkash,
				bkashMode,
				bkashAppKey,
				bkashAppSecret,
				bkashUsername,
				bkashPassword,
				enableNagad,
				nagadMerchantId,
				enableSSLCommerz,
				sslStoreId
			});

			return { success: true, message: 'পেমেন্ট গেটওয়ে সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' };
		} catch (e: any) {
			console.error('Failed to save payment settings:', e);
			return fail(500, { message: e.message || 'সেটিংস সেভ করতে ব্যর্থ হয়েছে' });
		}
	},

	testBkash: async ({ request }) => {
		try {
			const data = await request.formData();
			const mode = (data.get('bkashMode')?.toString() === 'live' ? 'live' : 'sandbox') as 'sandbox' | 'live';
			const appKey = data.get('bkashAppKey')?.toString()?.trim() || '';
			const appSecret = data.get('bkashAppSecret')?.toString()?.trim() || '';
			const username = data.get('bkashUsername')?.toString()?.trim() || '';
			const password = data.get('bkashPassword')?.toString()?.trim() || '';

			if (!appKey || !appSecret || !username || !password) {
				return fail(400, {
					message: 'কানেকশন টেস্টের জন্য App Key, App Secret, Username এবং Password সব তথ্য প্রয়োজন'
				});
			}

			const result = await BkashService.testConnection({
				mode,
				appKey,
				appSecret,
				username,
				password
			});

			if (result.success) {
				return {
					success: true,
					message: result.message,
					mode: result.mode
				};
			} else {
				return fail(400, {
					message: result.message,
					mode: result.mode
				});
			}
		} catch (err: any) {
			console.error('bKash test connection error:', err);
			return fail(500, { message: err?.message || 'কানেকশন টেস্টে নেটওয়ার্ক ত্রুটি' });
		}
	}
};
