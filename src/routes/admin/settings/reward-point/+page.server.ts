import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { SettingsService, type RewardPointConfig } from '#lib/server/services/settings.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let rewardConfig: RewardPointConfig = {
		isEnabled: true,
		pointsThreshold: 100,
		currencyValue: 10,
		calcMethod: 'manual'
	};

	try {
		const db = getDb(platform);
		const config = await SettingsService.getRewardPointConfig(db);
		if (config) {
			rewardConfig = config;
		}
	} catch (e) {
		console.error('Failed to load reward point config from D1:', e);
	}

	return {
		...parentData,
		rewardConfig
	};
};

export const actions: Actions = {
	saveRewardPoint: async ({ request, platform }) => {
		const data = await request.formData();

		const isEnabled = data.get('isEnabled') === 'true' || data.get('isEnabled') === 'on';
		const pointsThreshold = Number(data.get('pointsThreshold')) || 100;
		const currencyValue = Number(data.get('currencyValue')) || 10;
		const calcMethod = (data.get('calcMethod')?.toString() || 'manual') as 'manual' | 'percentage';

		if (pointsThreshold <= 0 || currencyValue <= 0) {
			return fail(400, {
				success: false,
				message: 'পয়েন্ট সংখ্যা এবং টাকার মান শূন্যের চেয়ে বেশি হতে হবে'
			});
		}

		try {
			const db = getDb(platform);
			await SettingsService.saveRewardPointConfig(db, {
				isEnabled,
				pointsThreshold,
				currencyValue,
				calcMethod
			});

			return {
				success: true,
				message: 'রিওয়ার্ড পয়েন্ট সেটিংস সফলভাবে সংরক্ষিত হয়েছে'
			};
		} catch (e: any) {
			console.error('Failed to save reward point config to D1:', e);
			return fail(500, {
				success: false,
				message: e.message || 'সংরক্ষণ ব্যর্থ হয়েছে'
			});
		}
	}
};

