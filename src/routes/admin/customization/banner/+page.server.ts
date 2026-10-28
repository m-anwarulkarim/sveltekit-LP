import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { CustomizationService } from '#lib/server/services/customization.service';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let bannersList: any[] = [];

	try {
		const db = getDb(platform);
		const rows = await CustomizationService.listBanners(db);
		bannersList = rows.map((r) => ({
			id: r.id,
			image: r.image,
			title: r.title,
			url: r.targetUrl,
			urlType: r.urlType || 'Internal',
			placement: r.placement || 'Home Page Top Banner',
			displayOptions: r.displayOptions || 'Show on Home',
			priority: String(r.sortOrder || 10),
			status: r.status || 'Publish'
		}));
	} catch (e) {
		console.error('Failed to load banners from D1:', e);
	}

	return {
		...parentData,
		banners: bannersList
	};
};

export const actions: Actions = {
	deleteBanner: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return { success: false, message: 'ID required' };

		try {
			const db = getDb(platform);
			await CustomizationService.deleteBanner(db, id);
			return { success: true, message: 'ব্যানার মুছে ফেলা হয়েছে' };
		} catch (e: any) {
			console.error('Failed to delete banner:', e);
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
			await CustomizationService.updateBanner(db, id, { status: newStatus });
			return { success: true, status: newStatus, message: 'স্ট্যাটাস পরিবর্তন হয়েছে' };
		} catch (e: any) {
			console.error('Failed to toggle banner status:', e);
			return { success: false, message: e.message };
		}
	}
};

