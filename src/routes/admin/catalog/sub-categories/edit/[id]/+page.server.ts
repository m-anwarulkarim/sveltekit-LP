import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { CategoryService } from '#lib/server/services/category.service';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, platform, parent }) => {
	const parentData = await parent();
	const db = getDb(platform);
	const [category, parentCategories] = await Promise.all([
		CategoryService.getCategory(db, params.id),
		CategoryService.listCategories(db, { parentId: null })
	]);

	if (!category) {
		throw error(404, 'সাব-ক্যাটাগরি পাওয়া যায়নি');
	}

	return {
		...parentData,
		category,
		parentCategories: parentCategories || []
	};
};

export const actions: Actions = {
	default: async ({ params, request, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const categoryId = data.get('categoryId')?.toString()?.trim();
		const image = data.get('image')?.toString()?.trim() || '';
		const priority = Number(data.get('priority')) || 0;
		const status = data.get('status')?.toString() || 'publish';

		if (!name) {
			return fail(400, { success: false, message: 'সাব-ক্যাটাগরির নাম দেওয়া বাধ্যতামূলক' });
		}
		if (!categoryId) {
			return fail(400, { success: false, message: 'মূল ক্যাটাগরি নির্বাচন করা বাধ্যতামূলক' });
		}

		try {
			const db = getDb(platform);
			await CategoryService.updateCategory(db, params.id, {
				name,
				parentId: categoryId,
				image,
				sortOrder: priority,
				isActive: status === 'publish'
			});
		} catch (e: any) {
			console.error('Failed to update sub-category in D1:', e);
			return fail(500, { success: false, message: e.message || 'সাব-ক্যাটাগরি আপডেটে সমস্যা হয়েছে' });
		}

		throw redirect(303, '/admin/catalog/sub-categories');
	}
};

