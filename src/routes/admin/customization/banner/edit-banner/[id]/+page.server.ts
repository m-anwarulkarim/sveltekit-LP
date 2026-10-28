import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { CustomizationService } from '#lib/server/services/customization.service';

export const load: PageServerLoad = async ({ params, parent, platform }) => {
	const parentData = await parent();
	const id = params.id;

	let banner = null;

	if (id === 'new') {
		banner = {
			id: 'new',
			title: '',
			image: '/images/banners/banner-home.svg',
			targetUrl: '/home',
			urlType: 'Internal',
			placement: 'Home Page Top Banner',
			displayOptions: 'Show on Home',
			sortOrder: 10,
			status: 'Draft'
		};
	} else {
		try {
			const db = getDb(platform);
			banner = await CustomizationService.getBannerById(db, id);
		} catch (e) {
			console.error('Failed to load banner by id from D1:', e);
		}

		if (!banner) {
			// Fallback placeholder
			banner = {
				id,
				title: 'bannar1',
				image: '/images/banners/banner-home.svg',
				targetUrl: '/home',
				urlType: 'Internal',
				placement: 'Home Page Top Banner',
				displayOptions: 'Show on Home',
				sortOrder: 10,
				status: 'Draft'
			};
		}
	}

	return {
		...parentData,
		banner
	};
};

export const actions: Actions = {
	updateBanner: async ({ request, params, platform }) => {
		const data = await request.formData();
		const title = data.get('title')?.toString()?.trim();
		const status = data.get('status')?.toString() || 'Draft';
		const urlType = data.get('urlType')?.toString() || 'Internal';
		const targetUrl = data.get('targetUrl')?.toString()?.trim() || '/home';
		const placement = data.get('placement')?.toString() || 'Home Page Top Banner';
		const displayOptions = data.get('displayOptions')?.toString() || 'Show on Home';
		const priority = Number(data.get('priority')?.toString()) || 10;
		const image = data.get('image')?.toString() || '/images/banners/banner-home.svg';

		if (!title) {
			return { success: false, message: 'Banner Title is required' };
		}

		const id = params.id;

		try {
			const db = getDb(platform);
			if (id === 'new') {
				await CustomizationService.createBanner(db, {
					title,
					status,
					urlType,
					targetUrl,
					placement,
					displayOptions,
					sortOrder: priority,
					image
				});
			} else {
				await CustomizationService.updateBanner(db, id, {
					title,
					status,
					urlType,
					targetUrl,
					placement,
					displayOptions,
					sortOrder: priority,
					image
				});
			}
		} catch (e: any) {
			console.error('Failed to save banner:', e);
			return { success: false, message: e.message || 'ব্যানার সংরক্ষণ করতে সমস্যা হয়েছে' };
		}

		throw redirect(303, '/admin/customization/banner');
	}
};

