import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { CouponService } from '#lib/server/services/coupon.service';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		...parentData
	};
};

export const actions: Actions = {
	create: async ({ request, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const code = data.get('code')?.toString()?.trim();
		const bannerImage = data.get('bannerImage')?.toString()?.trim() || null;
		const discountType = (data.get('discountType')?.toString()?.trim() || 'percentage') as 'percentage' | 'fixed';
		const discountValueStr = data.get('discountValue')?.toString()?.trim() || '0';
		const minOrderAmountStr = data.get('minOrderAmount')?.toString()?.trim() || '0';
		const description = data.get('description')?.toString()?.trim() || null;
		const startDate = data.get('startDate')?.toString()?.trim() || null;
		const endDate = data.get('endDate')?.toString()?.trim() || null;
		const status = (data.get('status')?.toString()?.trim() || 'publish') as 'publish' | 'draft';

		if (!name) {
			return fail(400, { success: false, message: 'কুপনের নাম দেওয়া আবশ্যক!' });
		}

		if (!code) {
			return fail(400, { success: false, message: 'কুপন কোড দেওয়া আবশ্যক!' });
		}

		const discountValue = parseFloat(discountValueStr);
		if (isNaN(discountValue) || discountValue <= 0) {
			return fail(400, { success: false, message: 'সঠিক ছাড়ের পরিমাণ লিখুন!' });
		}

		if (discountType === 'percentage' && discountValue > 100) {
			return fail(400, { success: false, message: 'শতকরা ছাড় ১০০% এর বেশি হতে পারে না!' });
		}

		if (startDate && endDate && startDate > endDate) {
			return fail(400, { success: false, message: 'সমাপ্তির তারিখ শুরুর তারিখের আগের হতে পারে না!' });
		}

		try {
			const db = getDb(platform);
			await CouponService.createCoupon(db, {
				name,
				code,
				bannerImage,
				discountType,
				discountValue,
				minOrderAmount: parseFloat(minOrderAmountStr) || 0,
				description,
				startDate,
				endDate,
				status
			});
		} catch (e: any) {
			console.error('Failed to create coupon:', e);
			return fail(400, { success: false, message: e?.message || 'কুপন তৈরিতে ত্রুটি হয়েছে!' });
		}

		throw redirect(303, '/admin/coupon');
	}
};

