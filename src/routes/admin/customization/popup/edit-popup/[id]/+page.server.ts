import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { CustomizationService } from '#lib/server/services/customization.service';

export const load: PageServerLoad = async ({ params, parent, platform }) => {
	const parentData = await parent();
	const id = params.id;

	let popup = null;

	if (id === 'new') {
		popup = {
			id: 'new',
			title: '',
			imageUrl: '/images/banners/banner-combo.svg',
			targetUrl: '/catalog/all-product',
			triggerType: 'delay_seconds',
			delaySeconds: 4,
			status: 'active'
		};
	} else {
		try {
			const db = getDb(platform);
			popup = await CustomizationService.getPopupById(db, id);
		} catch (e) {
			console.error('Failed to load popup by id from D1:', e);
		}

		if (!popup) {
			popup = {
				id,
				title: 'অফার পপআপ',
				imageUrl: '/images/banners/banner-combo.svg',
				targetUrl: '/catalog/all-product',
				triggerType: 'delay_seconds',
				delaySeconds: 4,
				status: 'active'
			};
		}
	}

	return {
		...parentData,
		popup
	};
};

export const actions: Actions = {
	updatePopup: async ({ request, params, platform }) => {
		const data = await request.formData();
		const title = data.get('title')?.toString()?.trim();
		const status = data.get('status')?.toString() === 'inactive' ? 'inactive' : 'active';
		const targetUrl = data.get('targetUrl')?.toString()?.trim() || '/catalog/all-product';
		const triggerType = (data.get('triggerType')?.toString() || 'delay_seconds') as any;
		const delaySeconds = Number(data.get('delaySeconds')) || 4;
		const imageUrl = data.get('imageUrl')?.toString() || '/images/banners/banner-combo.svg';

		if (!title) {
			return { success: false, message: 'পপআপের নাম/টাইটেল আবশ্যক' };
		}

		const id = params.id;

		try {
			const db = getDb(platform);
			if (id === 'new') {
				const created = await CustomizationService.createPopup(db, {
					title,
					status,
					targetUrl,
					triggerType,
					delaySeconds,
					imageUrl
				});
				throw redirect(303, `/admin/customization/popup`);
			} else {
				await CustomizationService.updatePopup(db, id, {
					title,
					status,
					targetUrl,
					triggerType,
					delaySeconds,
					imageUrl
				});
				return { success: true, message: 'পপআপ সফলভাবে আপডেট করা হয়েছে' };
			}
		} catch (e: any) {
			if (e?.status === 303) throw e;
			console.error('Failed to save popup:', e);
			return { success: false, message: e.message };
		}
	}
};

