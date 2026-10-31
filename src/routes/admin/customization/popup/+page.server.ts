import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { CustomizationService } from '#lib/server/services/customization.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let popupsList: any[] = [];

	try {
		const db = getDb(platform);
		const rows = await CustomizationService.listPopups(db);
		popupsList = rows.map((r) => ({
			id: r.id,
			name: r.title,
			image: r.imageUrl || '/images/banners/banner-combo.svg',
			url: r.targetUrl || '/catalog/all-product',
			urlType: 'Internal',
			triggerType: r.triggerType || 'on_load',
			delaySeconds: r.delaySeconds || 5,
			priority: '1',
			status: r.status === 'active' || r.status === 'PUBLISH' ? 'PUBLISH' : 'DRAFT'
		}));
	} catch (e) {
		console.error('Failed to load popups from D1:', e);
	}

	return {
		...parentData,
		popups: popupsList
	};
};

export const actions: Actions = {
	savePopup: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString()?.trim();
		const image = data.get('image')?.toString()?.trim();
		const url = data.get('url')?.toString()?.trim();
		const triggerType = (data.get('triggerType')?.toString() || 'on_load') as any;
		const delaySeconds = Number(data.get('delaySeconds')) || 5;
		const status = data.get('status')?.toString() === 'DRAFT' ? 'inactive' : 'active';

		if (!name) {
			return fail(400, { success: false, message: 'পপআপের নাম/টাইটেল আবশ্যক' });
		}

		try {
			const db = getDb(platform);
			if (id) {
				await CustomizationService.updatePopup(db, id, {
					title: name,
					imageUrl: image,
					targetUrl: url,
					triggerType,
					delaySeconds,
					status
				});
				return { success: true, message: 'পপআপ সফলভাবে আপডেট করা হয়েছে' };
			} else {
				await CustomizationService.createPopup(db, {
					title: name,
					imageUrl: image,
					targetUrl: url,
					triggerType,
					delaySeconds,
					status
				});
				return { success: true, message: 'নতুন পপআপ সফলভাবে যোগ করা হয়েছে' };
			}
		} catch (e: any) {
			console.error('Failed to save popup:', e);
			return fail(500, { success: false, message: e.message });
		}
	},

	deletePopup: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { success: false, message: 'ID required' });

		try {
			const db = getDb(platform);
			await CustomizationService.deletePopup(db, id);
			return { success: true, message: 'পপআপ সফলভাবে মুছে ফেলা হয়েছে' };
		} catch (e: any) {
			console.error('Failed to delete popup:', e);
			return fail(500, { success: false, message: e.message });
		}
	},

	toggleStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const currentStatus = data.get('status')?.toString();
		if (!id) return fail(400, { success: false, message: 'ID required' });

		const newStatus = currentStatus === 'PUBLISH' ? 'inactive' : 'active';

		try {
			const db = getDb(platform);
			await CustomizationService.updatePopup(db, id, { status: newStatus });
			return {
				success: true,
				status: newStatus === 'active' ? 'PUBLISH' : 'DRAFT',
				message: 'স্ট্যাটাস পরিবর্তন হয়েছে'
			};
		} catch (e: any) {
			console.error('Failed to toggle popup status:', e);
			return fail(500, { success: false, message: e.message });
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

		if (ids.length === 0) return fail(400, { success: false, message: 'IDs required' });

		try {
			const db = getDb(platform);
			for (const id of ids) {
				await CustomizationService.deletePopup(db, id);
			}
			return { success: true, message: `${ids.length}টি পপআপ মুছে ফেলা হয়েছে` };
		} catch (e: any) {
			console.error('Failed to bulk delete popups:', e);
			return fail(500, { success: false, message: e.message });
		}
	}
};

