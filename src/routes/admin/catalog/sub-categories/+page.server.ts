import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { CategoryService } from '#lib/server/services/category.service';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let subCategories: any[] = [];
	let parentCategories: any[] = [];

	try {
		const db = getDb(platform);
		const [liveSubs, liveParents] = await Promise.all([
			CategoryService.listSubCategories(db),
			CategoryService.listCategories(db, { parentId: null })
		]);
		subCategories = liveSubs || [];
		parentCategories = liveParents || [];
	} catch (error) {
		console.error('Failed to load sub-categories from D1:', error);
	}

	return {
		...parentData,
		subCategories,
		parentCategories
	};
};

export const actions: Actions = {
	createSubCategory: async ({ request, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const categoryId = data.get('categoryId')?.toString()?.trim();
		const image = data.get('image')?.toString()?.trim() || '';
		const priority = Number(data.get('priority')) || 0;
		const status = data.get('status')?.toString() || 'publish';

		if (!name) {
			return { success: false, message: 'Sub Category Name is required' };
		}
		if (!categoryId) {
			return { success: false, message: 'Parent Category is required' };
		}

		try {
			const db = getDb(platform);
			const result = await CategoryService.createCategory(db, {
				name,
				parentId: categoryId,
				image,
				sortOrder: priority,
				isActive: status === 'publish'
			});
			return { success: true, subCategory: result, message: 'সাব ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে!' };
		} catch (e: any) {
			console.error('Failed to create sub-category in D1:', e);
			return { success: false, message: e.message || 'সাব ক্যাটাগরি তৈরিতে সমস্যা হয়েছে' };
		}
	},

	updateSubCategory: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString()?.trim();
		const categoryId = data.get('categoryId')?.toString()?.trim();
		const image = data.get('image')?.toString()?.trim();
		const priority = Number(data.get('priority')) || 0;
		const status = data.get('status')?.toString();

		if (!id || !name) {
			return { success: false, message: 'ID and Name are required' };
		}

		try {
			const db = getDb(platform);
			await CategoryService.updateCategory(db, id, {
				name,
				parentId: categoryId || undefined,
				image,
				sortOrder: priority,
				isActive: status === 'publish'
			});
			return { success: true, message: 'সাব ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!' };
		} catch (e: any) {
			console.error('Failed to update sub-category in D1:', e);
			return { success: false, message: e.message || 'সাব ক্যাটাগরি আপডেটে সমস্যা হয়েছে' };
		}
	},

	toggleStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return { success: false, message: 'ID is required' };
		}

		try {
			const db = getDb(platform);
			const res = await CategoryService.toggleStatus(db, id);
			return { success: true, status: res.statusLabel, message: `স্ট্যাটাস ${res.statusLabel}-এ পরিবর্তিত হয়েছে` };
		} catch (e: any) {
			console.error('Failed to toggle status in D1:', e);
			return { success: false, message: e.message };
		}
	},

	deleteSubCategory: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return { success: false, message: 'ID is required' };
		}

		try {
			const db = getDb(platform);
			await CategoryService.deleteCategory(db, id);
			return { success: true, message: 'সাব ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে' };
		} catch (e: any) {
			console.error('Failed to delete sub-category in D1:', e);
			return { success: false, message: e.message };
		}
	},

	bulkDelete: async ({ request, platform }) => {
		const data = await request.formData();
		const rawIds = data.get('ids')?.toString();
		let ids: string[] = [];

		try {
			ids = JSON.parse(rawIds || '[]');
		} catch {
			ids = rawIds ? rawIds.split(',') : [];
		}

		if (ids.length === 0) {
			return { success: false, message: 'No IDs provided' };
		}

		try {
			const db = getDb(platform);
			await CategoryService.bulkDeleteCategories(db, ids);
			return { success: true, message: `${ids.length}টি সাব ক্যাটাগরি মুছে ফেলা হয়েছে` };
		} catch (e: any) {
			console.error('Failed to bulk delete sub-categories in D1:', e);
			return { success: false, message: e.message };
		}
	}
};

