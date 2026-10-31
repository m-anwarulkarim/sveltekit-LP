import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { CategoryService } from '#lib/server/services/category.service';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, platform, parent }) => {
	const parentData = await parent();
	const db = getDb(platform);
	const category = await CategoryService.getCategory(db, params.id);

	if (!category) {
		throw error(404, 'ক্যাটাগরি পাওয়া যায়নি');
	}

	return {
		...parentData,
		category
	};
};

export const actions: Actions = {
	default: async ({ params, request, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const image = data.get('image')?.toString()?.trim() || '';
		const priority = Number(data.get('priority')) || 0;
		const status = data.get('status')?.toString() || 'publish';

		if (!name) {
			return fail(400, { success: false, message: 'ক্যাটাগরির নাম দেওয়া বাধ্যতামূলক' });
		}

		try {
			const db = getDb(platform);
			await CategoryService.updateCategory(db, params.id, {
				name,
				image,
				sortOrder: priority,
				isActive: status === 'publish'
			});
		} catch (e: any) {
			console.error('Failed to update category in D1:', e);
			return fail(500, { success: false, message: e.message || 'ক্যাটাগরি আপডেটে সমস্যা হয়েছে' });
		}

		throw redirect(303, '/admin/catalog/categories');
	}
};

