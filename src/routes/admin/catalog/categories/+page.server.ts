import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { CategoryService } from '#lib/server/services/category.service';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let categories: any[] = [];

	try {
		const db = getDb(platform);
		const liveCategories = await CategoryService.listCategories(db, { parentId: null });
		categories = (liveCategories || []) as any;
	} catch (error) {
		console.error('Failed to load categories from D1:', error);
	}

	return {
		...parentData,
		categories
	};
};

export const actions: Actions = {
	createCategory: async ({ request, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const image = data.get('image')?.toString()?.trim() || '';
		const priority = Number(data.get('priority')) || 0;
		const status = data.get('status')?.toString() || 'publish';

		if (!name) {
			return { success: false, message: 'Category Name is required' };
		}

		try {
			const db = getDb(platform);
			const result = await CategoryService.createCategory(db, {
				name,
				image,
				sortOrder: priority,
				isActive: status === 'publish',
				parentId: null
			});
			return { success: true, category: result, message: 'ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে!' };
		} catch (e: any) {
			console.error('Failed to create category in D1:', e);
			return { success: false, message: e.message || 'ক্যাটাগরি তৈরি করতে সমস্যা হয়েছে' };
		}
	},

	updateCategory: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString()?.trim();
		const image = data.get('image')?.toString()?.trim();
		const priority = Number(data.get('priority')) || 0;
		const status = data.get('status')?.toString();

		if (!id || !name) {
			return { success: false, message: 'ID and Category Name are required' };
		}

		try {
			const db = getDb(platform);
			await CategoryService.updateCategory(db, id, {
				name,
				image,
				sortOrder: priority,
				isActive: status === 'publish'
			});
			return { success: true, message: 'ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!' };
		} catch (e: any) {
			console.error('Failed to update category in D1:', e);
			return { success: false, message: e.message || 'ক্যাটাগরি আপডেট করতে সমস্যা হয়েছে' };
		}
	},

	toggleStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return { success: false, message: 'Category ID required' };
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

	deleteCategory: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return { success: false, message: 'Category ID required' };
		}

		try {
			const db = getDb(platform);
			await CategoryService.deleteCategory(db, id);
			return { success: true, message: 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে' };
		} catch (e: any) {
			console.error('Failed to delete category in D1:', e);
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
			return { success: false, message: 'No category IDs provided' };
		}

		try {
			const db = getDb(platform);
			await CategoryService.bulkDeleteCategories(db, ids);
			return { success: true, message: `${ids.length}টি ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে` };
		} catch (e: any) {
			console.error('Failed to bulk delete categories in D1:', e);
			return { success: false, message: e.message };
		}
	}
};

