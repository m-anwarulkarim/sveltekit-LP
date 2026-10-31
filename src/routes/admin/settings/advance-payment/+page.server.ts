import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { SettingsService, DEFAULT_ADVANCE_PAYMENT } from '#lib/server/services/settings.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let advancePaymentConfig = { ...DEFAULT_ADVANCE_PAYMENT };

	try {
		const db = getDb(platform);
		const config = await SettingsService.getAdvancePaymentConfig(db);
		if (config) {
			advancePaymentConfig = config;
		}
	} catch (e) {
		console.error('Failed to load advance payment settings from D1:', e);
	}

	return {
		...parentData,
		advancePaymentConfig
	};
};

export const actions: Actions = {
	save: async ({ request, platform }) => {
		const data = await request.formData();

		const enableAdvancePayment = data.get('enableAdvancePayment') === 'true' || data.get('enableAdvancePayment') === 'on';
		const advanceType = (data.get('advanceType') === 'percentage' ? 'percentage' : 'fixed') as 'fixed' | 'percentage';
		const advanceAmount = Math.max(0, Number(data.get('advanceAmount')) || 0);
		const onlyOutsideDhaka = data.get('onlyOutsideDhaka') === 'true' || data.get('onlyOutsideDhaka') === 'on';
		const autoCancelMinutes = Math.max(1, Number(data.get('autoCancelMinutes')) || 30);
		const bkashNumber = String(data.get('bkashNumber') || '').trim();
		const nagadNumber = String(data.get('nagadNumber') || '').trim();
		const rocketNumber = String(data.get('rocketNumber') || '').trim();
		const instructions = String(data.get('instructions') || '').trim();

		if (enableAdvancePayment && advanceAmount <= 0) {
			return fail(400, {
				success: false,
				message: 'অগ্রিম পেমেন্ট চালু থাকলে টাকার পরিমাণ বা শতকরা হার ০ এর বেশি হতে হবে।'
			});
		}

		try {
			const db = getDb(platform);
			await SettingsService.saveAdvancePaymentConfig(db, {
				enableAdvancePayment,
				advanceType,
				advanceAmount,
				onlyOutsideDhaka,
				autoCancelMinutes,
				bkashNumber,
				nagadNumber,
				rocketNumber,
				instructions
			});

			return {
				success: true,
				message: 'অগ্রিম পেমেন্ট সেটিংস সফলভাবে ডাটাবেসে সংরক্ষিত হয়েছে!'
			};
		} catch (e: any) {
			console.error('Failed to save advance payment settings to D1:', e);
			return fail(500, {
				success: false,
				message: e.message || 'অগ্রিম পেমেন্ট সেটিংস সংরক্ষণে সমস্যা হয়েছে।'
			});
		}
	}
};
