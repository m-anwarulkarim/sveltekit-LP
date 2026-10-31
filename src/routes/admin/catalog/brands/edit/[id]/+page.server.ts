import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { BrandService } from '#lib/server/services/brand.service';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, platform, parent }) => {
	const parentData = await parent();
	const db = getDb(platform);
	const brand = await BrandService.getBrandById(db, params.id);

	if (!brand) {
		throw error(404, 'ব্র্যান্ড পাওয়া যায়নি');
	}

	return {
		...parentData,
		brand
	};
};

export const actions: Actions = {
	default: async ({ params, request, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const logo = data.get('logo')?.toString()?.trim() || '';
		const website = data.get('website')?.toString()?.trim() || '';
		const isFeatured = data.get('isFeatured') === 'true' || data.get('homeShow') === 'Yes';
		const sortOrder = Number(data.get('priority') ?? data.get('sortOrder')) || 0;
		const status = data.get('status')?.toString() || 'publish';

		if (!name) {
			return fail(400, { success: false, message: 'ব্র্যান্ডের নাম প্রদান করা আবশ্যক' });
		}

		try {
			const db = getDb(platform);
			await BrandService.updateBrand(db, params.id, {
				name,
				logo,
				website,
				isFeatured,
				sortOrder,
				isActive: status === 'publish'
			});
		} catch (e: any) {
			console.error('Failed to update brand in D1:', e);
			return fail(500, { success: false, message: e.message || 'ব্র্যান্ড আপডেটে সমস্যা হয়েছে' });
		}

		throw redirect(303, '/admin/catalog/brands');
	}
};

