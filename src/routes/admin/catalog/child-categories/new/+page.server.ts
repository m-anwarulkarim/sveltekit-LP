import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { CategoryService } from '#lib/server/services/category.service';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	const db = getDb(platform);
	const subCategories = await CategoryService.listSubCategories(db);

	return {
		...parentData,
		subCategories: subCategories || []
	};
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const subCategoryId = data.get('subCategoryId')?.toString()?.trim();
		const image = data.get('image')?.toString()?.trim() || '';
		const priority = Number(data.get('priority')) || 0;
		const status = data.get('status')?.toString() || 'publish';

		if (!name) {
			return fail(400, { success: false, message: 'চাইল্ড-ক্যাটাগরির নাম দেওয়া বাধ্যতামূলক' });
		}
		if (!subCategoryId) {
			return fail(400, { success: false, message: 'সাব-ক্যাটাগরি নির্বাচন করা বাধ্যতামূলক' });
		}

		try {
			const db = getDb(platform);
			await CategoryService.createCategory(db, {
				name,
				parentId: subCategoryId,
				image,
				sortOrder: priority,
				isActive: status === 'publish'
			});
		} catch (e: any) {
			console.error('Failed to create child-category in D1:', e);
			return fail(500, { success: false, message: e.message || 'চাইল্ড-ক্যাটাগরি তৈরিতে সমস্যা হয়েছে' });
		}

		throw redirect(303, '/admin/catalog/child-categories');
	}
};

