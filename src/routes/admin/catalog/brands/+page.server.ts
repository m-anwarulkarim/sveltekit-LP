import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { BrandService } from '#lib/server/services/brand.service';

export const load: PageServerLoad = async ({ url, platform }) => {
	const search = url.searchParams.get('q') || '';
	const tab = (url.searchParams.get('tab') as 'all' | 'publish' | 'draft' | 'trash') || 'all';

	try {
		const db = getDb(platform);
		const { brands, counts } = await BrandService.listBrandsAdmin(db, {
			search,
			tab
		});

		return {
			brands,
			counts,
			activeTab: tab,
			searchQuery: search
		};
	} catch (error) {
		console.error('Failed to load brands in admin/catalog/brands/+page.server.ts:', error);
		return {
			brands: [],
			counts: { allCount: 0, publishCount: 0, draftCount: 0, trashCount: 0 },
			activeTab: tab,
			searchQuery: search
		};
	}
};

export const actions: Actions = {
	createBrand: async ({ request, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const slug = data.get('slug')?.toString()?.trim() || undefined;
		const logo = data.get('logo')?.toString()?.trim() || undefined;
		const website = data.get('website')?.toString()?.trim() || undefined;
		const isFeatured = data.get('isFeatured') === 'true' || data.get('homeShow') === 'Yes';
		const sortOrder = Number(data.get('priority') ?? data.get('sortOrder')) || 0;
		const status = data.get('status')?.toString() || 'publish';

		if (!name) {
			return fail(400, { success: false, message: 'ব্র্যান্ডের নাম প্রদান করা আবশ্যক' });
		}

		try {
			const db = getDb(platform);
			const created = await BrandService.createBrand(db, {
				name,
				slug,
				logo,
				website,
				isFeatured,
				sortOrder,
				isActive: status === 'publish'
			});

			return {
				success: true,
				brand: created,
				message: 'নতুন ব্র্যান্ড সফলভাবে তৈরি করা হয়েছে!'
			};
		} catch (e: any) {
			console.error('Failed to create brand in D1:', e);
			return fail(500, {
				success: false,
				message: e?.message || 'ব্র্যান্ড তৈরি করতে সমস্যা হয়েছে'
			});
		}
	},

	updateBrand: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString()?.trim();
		const slug = data.get('slug')?.toString()?.trim() || undefined;
		const logo = data.get('logo')?.toString()?.trim() || undefined;
		const website = data.get('website')?.toString()?.trim() || undefined;
		const isFeatured = data.get('isFeatured') === 'true' || data.get('homeShow') === 'Yes';
		const sortOrder = Number(data.get('priority') ?? data.get('sortOrder')) || 0;
		const status = data.get('status')?.toString();

		if (!id || !name) {
			return fail(400, { success: false, message: 'ব্র্যান্ড আইডি ও নাম উভয়ই আবশ্যক' });
		}

		try {
			const db = getDb(platform);
			const updated = await BrandService.updateBrand(db, id, {
				name,
				slug,
				logo,
				website,
				isFeatured,
				sortOrder,
				isActive: status === 'publish'
			});

			if (updated) {
				return { success: true, message: 'ব্র্যান্ড সফলভাবে আপডেট করা হয়েছে!' };
			} else {
				return fail(500, { success: false, message: 'আপডেট করা সম্ভব হয়নি' });
			}
		} catch (e: any) {
			console.error('Failed to update brand in D1:', e);
			return fail(500, {
				success: false,
				message: e?.message || 'ব্র্যান্ড আপডেট করতে সমস্যা হয়েছে'
			});
		}
	},

	toggleStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { success: false, message: 'ব্র্যান্ড আইডি আবশ্যক' });
		}

		try {
			const db = getDb(platform);
			const res = await BrandService.toggleStatus(db, id);
			if (res.success) {
				const label = res.newStatus ? 'Publish' : 'Draft';
				return {
					success: true,
					newStatus: res.newStatus,
					message: `স্ট্যাটাস ${label}-এ পরিবর্তিত হয়েছে`
				};
			}
			return fail(500, { success: false, message: 'স্ট্যাটাস পরিবর্তন করা যায়নি' });
		} catch (e: any) {
			return fail(500, { success: false, message: e?.message });
		}
	},

	trashBrand: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { success: false, message: 'ব্র্যান্ড আইডি আবশ্যক' });
		}

		try {
			const db = getDb(platform);
			const ok = await BrandService.moveToTrash(db, id);
			if (ok) {
				return { success: true, message: 'ব্র্যান্ড ট্র্যাশে পাঠানো হয়েছে' };
			}
			return fail(500, { success: false, message: 'ট্র্যাশে পাঠানো যায়নি' });
		} catch (e: any) {
			return fail(500, { success: false, message: e?.message });
		}
	},

	restoreBrand: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { success: false, message: 'ব্র্যান্ড আইডি আবশ্যক' });
		}

		try {
			const db = getDb(platform);
			const ok = await BrandService.restoreBrand(db, id);
			if (ok) {
				return { success: true, message: 'ব্র্যান্ড রিস্টোর করা হয়েছে' };
			}
			return fail(500, { success: false, message: 'রিস্টোর করা সম্ভব হয়নি' });
		} catch (e: any) {
			return fail(500, { success: false, message: e?.message });
		}
	},

	deleteBrand: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { success: false, message: 'ব্র্যান্ড আইডি আবশ্যক' });
		}

		try {
			const db = getDb(platform);
			const ok = await BrandService.deletePermanently(db, id);
			if (ok) {
				return { success: true, message: 'ব্র্যান্ড স্থায়ীভাবে মুছে ফেলা হয়েছে' };
			}
			return fail(500, { success: false, message: 'মুছে ফেলা সম্ভব হয়নি' });
		} catch (e: any) {
			return fail(500, { success: false, message: e?.message });
		}
	},

	bulkAction: async ({ request, platform }) => {
		const data = await request.formData();
		const rawIds = data.get('ids')?.toString();
		const action = data.get('action')?.toString() as 'publish' | 'draft' | 'trash' | 'restore' | 'delete';

		if (!rawIds || !action) {
			return fail(400, { success: false, message: 'আইডি ও অ্যাকশন উভয়ই আবশ্যক' });
		}

		try {
			const ids: string[] = JSON.parse(rawIds);
			const db = getDb(platform);
			const res = await BrandService.bulkAction(db, ids, action);

			return {
				success: true,
				count: res.count,
				message: `${res.count} টি ব্র্যান্ড সফলভাবে প্রক্রিয়া করা হয়েছে!`
			};
		} catch (e: any) {
			return fail(500, { success: false, message: e?.message || 'বাল্ক অ্যাকশন ব্যর্থ হয়েছে' });
		}
	}
};

