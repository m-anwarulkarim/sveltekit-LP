import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { ReviewService, type ReviewStatus } from '#lib/server/services/review.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform, url }) => {
	const parentData = await parent();

	const status = (url.searchParams.get('status') as ReviewStatus | 'all') || 'all';
	const search = url.searchParams.get('q') || '';
	const rating = Number(url.searchParams.get('rating')) || 0;
	const productId = url.searchParams.get('product') || '';
	const featured = url.searchParams.get('featured') === '1';
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit')) || 15));
	const offset = (page - 1) * limit;

	let reviews: any[] = [];
	let totalCount = 0;
	let stats = { total: 0, pending: 0, approved: 0, rejected: 0, featured: 0, avgRating: 0 };

	try {
		const db = getDb(platform);

		const [listResult, statsResult] = await Promise.all([
			ReviewService.listAll(db, {
				status,
				search,
				rating: rating || undefined,
				productId: productId || undefined,
				featured,
				limit,
				offset
			}),
			ReviewService.getStats(db)
		]);

		reviews = listResult.items;
		totalCount = listResult.totalCount;
		stats = statsResult;
	} catch (error) {
		console.error('Failed to load reviews:', error);
	}

	return {
		...parentData,
		reviews,
		totalCount,
		stats,
		currentPage: page,
		perPage: limit,
		filterStatus: status,
		searchQuery: search,
		filterRating: rating,
		filterProduct: productId,
		filterFeatured: featured
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const status = data.get('status')?.toString() as ReviewStatus;

		if (!id || !['pending', 'approved', 'rejected'].includes(status)) {
			return fail(400, { message: 'অবৈধ রিকোয়েস্ট' });
		}

		try {
			const db = getDb(platform);
			await ReviewService.updateStatus(db, id, status);
			const label =
				status === 'approved'
					? 'অনুমোদিত'
					: status === 'rejected'
						? 'রিজেক্ট'
						: 'পেন্ডিং';
			return { success: true, message: `রিভিউটি ${label} করা হয়েছে!` };
		} catch (e: any) {
			return fail(500, { message: e?.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে' });
		}
	},

	bulkAction: async ({ request, platform }) => {
		const data = await request.formData();
		const rawIds = data.get('ids')?.toString();
		const action = data.get('action')?.toString();

		let ids: string[] = [];
		try {
			ids = JSON.parse(rawIds || '[]');
		} catch {
			ids = rawIds ? rawIds.split(',') : [];
		}

		if (ids.length === 0) {
			return fail(400, { message: 'কোনো রিভিউ নির্বাচন করা হয়নি' });
		}

		try {
			const db = getDb(platform);

			if (action === 'approve') {
				const r = await ReviewService.bulkUpdateStatus(db, ids, 'approved');
				return { success: true, message: `${r.count}টি রিভিউ অনুমোদিত হয়েছে!` };
			} else if (action === 'reject') {
				const r = await ReviewService.bulkUpdateStatus(db, ids, 'rejected');
				return { success: true, message: `${r.count}টি রিভিউ রিজেক্ট হয়েছে!` };
			} else if (action === 'delete') {
				const r = await ReviewService.bulkDelete(db, ids);
				return { success: true, message: `${r.count}টি রিভিউ ডিলিট হয়েছে!` };
			}

			return fail(400, { message: 'অবৈধ অ্যাকশন' });
		} catch (e: any) {
			return fail(500, { message: e?.message || 'বাল্ক অ্যাকশন ব্যর্থ হয়েছে' });
		}
	},

	reply: async ({ request, platform, locals }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const reply = data.get('reply')?.toString()?.trim();

		if (!id || !reply) {
			return fail(400, { message: 'রিভিউ আইডি ও রিপ্লাই আবশ্যক' });
		}
		if (reply.length > 1000) {
			return fail(400, { message: 'রিপ্লাই ১০০০ অক্ষরের মধ্যে হতে হবে' });
		}

		try {
			const db = getDb(platform);
			const adminName = locals.admin?.name || locals.admin?.username || 'Admin';
			await ReviewService.addAdminReply(db, id, reply, adminName);
			return { success: true, message: 'রিপ্লাই সফলভাবে যুক্ত হয়েছে!' };
		} catch (e: any) {
			return fail(500, { message: e?.message || 'রিপ্লাই যুক্ত করতে ব্যর্থ হয়েছে' });
		}
	},

	removeReply: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) return fail(400, { message: 'রিভিউ আইডি আবশ্যক' });

		try {
			const db = getDb(platform);
			await ReviewService.removeAdminReply(db, id);
			return { success: true, message: 'রিপ্লাই সরিয়ে ফেলা হয়েছে!' };
		} catch (e: any) {
			return fail(500, { message: e?.message || 'রিপ্লাই সরাতে ব্যর্থ হয়েছে' });
		}
	},

	toggleFeatured: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) return fail(400, { message: 'রিভিউ আইডি আবশ্যক' });

		try {
			const db = getDb(platform);
			const result = await ReviewService.toggleFeatured(db, id);
			const msg = result.isFeatured ? 'ফিচার্ড হিসেবে চিহ্নিত হয়েছে!' : 'ফিচার্ড থেকে সরানো হয়েছে!';
			return { success: true, message: msg };
		} catch (e: any) {
			return fail(500, { message: e?.message || 'ফিচার্ড টগল ব্যর্থ হয়েছে' });
		}
	},

	deleteReview: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) return fail(400, { message: 'রিভিউ আইডি আবশ্যক' });

		try {
			const db = getDb(platform);
			await ReviewService.deleteReview(db, id);
			return { success: true, message: 'রিভিউটি সফলভাবে ডিলিট হয়েছে!' };
		} catch (e: any) {
			return fail(500, { message: e?.message || 'ডিলিট করতে ব্যর্থ হয়েছে' });
		}
	}
};
