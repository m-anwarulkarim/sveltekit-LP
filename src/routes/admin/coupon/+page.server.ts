import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { CouponService } from '#lib/server/services/coupon.service';

export const load: PageServerLoad = async ({ url, platform, parent }) => {
	const parentData = await parent();
	const status = url.searchParams.get('status') || 'all';
	const search = url.searchParams.get('search') || '';

	let coupons: any[] = [];
	let counts = { all: 0, publish: 0, draft: 0, trash: 0 };

	try {
		const db = getDb(platform);
		const res = await CouponService.listCoupons(db, { status, search });
		coupons = res.coupons;
		counts = res.counts;
	} catch (e) {
		console.error('Failed to load coupons:', e);
	}

	return {
		...parentData,
		coupons,
		counts,
		activeTab: status,
		searchQuery: search
	};
};

export const actions: Actions = {
	toggleStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString()?.trim();
		if (!id) return { success: false, message: 'কুপন আইডি পাওয়া যায়নি!' };

		try {
			const db = getDb(platform);
			const res = await CouponService.toggleStatus(db, id);
			const label = res.status === 'publish' ? 'পাবলিশ' : 'ড্রাফট';
			return { success: true, message: `কুপনের স্ট্যাটাস সফলভাবে "${label}" করা হয়েছে।` };
		} catch (e: any) {
			return { success: false, message: e?.message || 'স্ট্যাটাস পরিবর্তনে ত্রুটি হয়েছে!' };
		}
	},

	trash: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString()?.trim();
		if (!id) return { success: false, message: 'কুপন আইডি পাওয়া যায়নি!' };

		try {
			const db = getDb(platform);
			await CouponService.moveToTrash(db, id);
			return { success: true, message: 'কুপনটি ট্র্যাশে সরানো হয়েছে।' };
		} catch (e: any) {
			return { success: false, message: e?.message || 'ট্র্যাশে পাঠাতে ত্রুটি হয়েছে!' };
		}
	},

	restore: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString()?.trim();
		if (!id) return { success: false, message: 'কুপন আইডি পাওয়া যায়নি!' };

		try {
			const db = getDb(platform);
			await CouponService.restore(db, id);
			return { success: true, message: 'কুপনটি সফলভাবে রিস্টোর করা হয়েছে।' };
		} catch (e: any) {
			return { success: false, message: e?.message || 'রিস্টোর করতে ত্রুটি হয়েছে!' };
		}
	},

	deletePermanent: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString()?.trim();
		if (!id) return { success: false, message: 'কুপন আইডি পাওয়া যায়নি!' };

		try {
			const db = getDb(platform);
			await CouponService.permanentDelete(db, id);
			return { success: true, message: 'কুপনটি স্থায়ীভাবে মুছে ফেলা হয়েছে।' };
		} catch (e: any) {
			return { success: false, message: e?.message || 'ডিলিট করতে ত্রুটি হয়েছে!' };
		}
	}
};

