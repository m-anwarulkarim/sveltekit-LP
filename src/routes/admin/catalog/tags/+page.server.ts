import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { TagService } from '#lib/server/services/tag.service';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let tags: any[] = [];

	try {
		const db = getDb(platform);
		const liveTags = await TagService.listTags(db);
		tags = (liveTags || []) as any;
	} catch (error) {
		console.error('Failed to load tags from D1:', error);
	}

	return {
		...parentData,
		tags
	};
};

export const actions: Actions = {
	createTag: async ({ request, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const homeShow = (data.get('homeShow')?.toString() as 'Yes' | 'No') || 'Yes';
		const priority = data.get('priority')?.toString()?.trim() || '-';
		const status = (data.get('status')?.toString() as 'publish' | 'draft') || 'publish';

		if (!name) {
			return { success: false, message: 'Tag Name is required' };
		}

		try {
			const db = getDb(platform);
			const result = await TagService.createTag(db, {
				name,
				homeShow,
				priority,
				status
			});
			return { success: true, tag: result, message: 'ট্যাগ সফলভাবে তৈরি করা হয়েছে!' };
		} catch (e: any) {
			console.error('Failed to create tag in D1:', e);
			return { success: false, message: e.message || 'ট্যাগ তৈরিতে সমস্যা হয়েছে' };
		}
	},

	updateTag: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString()?.trim();
		const homeShow = (data.get('homeShow')?.toString() as 'Yes' | 'No') || 'Yes';
		const priority = data.get('priority')?.toString()?.trim() || '-';
		const status = (data.get('status')?.toString() as 'publish' | 'draft') || 'publish';

		if (!id || !name) {
			return { success: false, message: 'Tag ID and Name are required' };
		}

		try {
			const db = getDb(platform);
			await TagService.updateTag(db, id, {
				name,
				homeShow,
				priority,
				status
			});
			return { success: true, message: 'ট্যাগ সফলভাবে আপডেট করা হয়েছে!' };
		} catch (e: any) {
			console.error('Failed to update tag in D1:', e);
			return { success: false, message: e.message || 'ট্যাগ আপডেটে সমস্যা হয়েছে' };
		}
	},

	toggleStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return { success: false, message: 'Tag ID required' };
		}

		try {
			const db = getDb(platform);
			const res = await TagService.toggleStatus(db, id);
			return { success: true, status: res.statusLabel, message: `স্ট্যাটাস ${res.statusLabel}-এ পরিবর্তিত হয়েছে` };
		} catch (e: any) {
			console.error('Failed to toggle tag status in D1:', e);
			return { success: false, message: e.message };
		}
	},

	deleteTag: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return { success: false, message: 'Tag ID required' };
		}

		try {
			const db = getDb(platform);
			await TagService.deleteTag(db, id);
			return { success: true, message: 'ট্যাগ সফলভাবে মুছে ফেলা হয়েছে' };
		} catch (e: any) {
			console.error('Failed to delete tag in D1:', e);
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
			return { success: false, message: 'No tag IDs provided' };
		}

		try {
			const db = getDb(platform);
			await TagService.bulkDeleteTags(db, ids);
			return { success: true, message: `${ids.length}টি ট্যাগ সফলভাবে মুছে ফেলা হয়েছে` };
		} catch (e: any) {
			console.error('Failed to bulk delete tags in D1:', e);
			return { success: false, message: e.message };
		}
	}
};
