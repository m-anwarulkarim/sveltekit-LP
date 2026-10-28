import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { CustomizationService } from '#lib/server/services/customization.service';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let carouselsList: any[] = [];

	try {
		const db = getDb(platform);
		const rows = await CustomizationService.listCarousels(db);
		carouselsList = rows.map((r) => ({
			id: r.id,
			image: r.image,
			mobileImage: r.mobileImage || '',
			name: r.name,
			url: r.targetUrl,
			urlType: r.urlType || 'Internal',
			serial: String(r.sortOrder || 1),
			status: r.status || 'Publish',
			description: r.description || '',
			startDate: r.startDate ? new Date(r.startDate).toISOString() : null,
			endDate: r.endDate ? new Date(r.endDate).toISOString() : null,
			viewCount: r.viewCount || 0,
			clickCount: r.clickCount || 0,
			ctr: r.viewCount ? ((r.clickCount / r.viewCount) * 100).toFixed(1) : '0.0'
		}));
	} catch (e) {
		console.error('Failed to load carousels from D1:', e);
	}

	return {
		...parentData,
		carousels: carouselsList
	};
};

export const actions: Actions = {
	deleteCarousel: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return { success: false, message: 'ID required' };

		try {
			const db = getDb(platform);
			await CustomizationService.deleteCarousel(db, id);
			return { success: true, message: 'ক্যারোসেল মুছে ফেলা হয়েছে' };
		} catch (e: any) {
			console.error('Failed to delete carousel:', e);
			return { success: false, message: e.message };
		}
	},

	toggleStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const currentStatus = data.get('status')?.toString();
		if (!id) return { success: false, message: 'ID required' };

		const newStatus = currentStatus === 'Publish' ? 'Draft' : 'Publish';

		try {
			const db = getDb(platform);
			await CustomizationService.updateCarousel(db, id, { status: newStatus });
			return { success: true, status: newStatus, message: 'স্ট্যাটাস পরিবর্তন হয়েছে' };
		} catch (e: any) {
			console.error('Failed to toggle carousel status:', e);
			return { success: false, message: e.message };
		}
	},

	duplicateCarousel: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return { success: false, message: 'ID required' };

		try {
			const db = getDb(platform);
			const clone = await CustomizationService.duplicateCarousel(db, id);
			return { success: true, clone, message: 'ক্যারোসেল সফলভাবে ডুপ্লিকেট করা হয়েছে' };
		} catch (e: any) {
			console.error('Failed to duplicate carousel:', e);
			return { success: false, message: e.message };
		}
	},

	reorder: async ({ request, platform }) => {
		const data = await request.formData();
		const rawIds = data.get('ids')?.toString();
		let ids: string[] = [];
		try {
			ids = JSON.parse(rawIds || '[]');
		} catch {
			ids = rawIds ? rawIds.split(',') : [];
		}

		if (ids.length === 0) return { success: false, message: 'IDs required' };

		try {
			const db = getDb(platform);
			await CustomizationService.reorderCarousels(db, ids);
			return { success: true, message: 'ক্রম সফলভাবে সাজানো হয়েছে' };
		} catch (e: any) {
			console.error('Failed to reorder carousels:', e);
			return { success: false, message: e.message };
		}
	},

	bulkAction: async ({ request, platform }) => {
		const data = await request.formData();
		const rawIds = data.get('ids')?.toString();
		const action = data.get('action')?.toString() as 'publish' | 'draft' | 'delete';
		let ids: string[] = [];
		try {
			ids = JSON.parse(rawIds || '[]');
		} catch {
			ids = rawIds ? rawIds.split(',') : [];
		}

		if (ids.length === 0) return { success: false, message: 'IDs required' };

		try {
			const db = getDb(platform);
			for (const id of ids) {
				if (action === 'delete') {
					await CustomizationService.deleteCarousel(db, id);
				} else if (action === 'publish') {
					await CustomizationService.updateCarousel(db, id, { status: 'Publish' });
				} else if (action === 'draft') {
					await CustomizationService.updateCarousel(db, id, { status: 'Draft' });
				}
			}
			return { success: true, message: `${ids.length}টি ক্যারোসেলে অ্যাকশন সফল হয়েছে!` };
		} catch (e: any) {
			console.error('Failed bulk action:', e);
			return { success: false, message: e.message };
		}
	}
};
