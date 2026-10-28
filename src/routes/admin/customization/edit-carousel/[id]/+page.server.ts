import type { PageServerLoad, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { CustomizationService } from '#lib/server/services/customization.service';

export const load: PageServerLoad = async ({ params, parent, platform }) => {
	const parentData = await parent();
	const id = params.id;

	let carousel = null;

	if (id === 'new') {
		carousel = {
			id: 'new',
			name: '',
			image: '/images/banners/banner-home.svg',
			mobileImage: '',
			targetUrl: '/home',
			urlType: 'Internal',
			description: '',
			sortOrder: 1,
			status: 'Publish'
		};
	} else {
		try {
			const db = getDb(platform);
			carousel = await CustomizationService.getCarouselById(db, id);
		} catch (e) {
			console.error('Failed to load carousel by id from D1:', e);
		}

		if (!carousel) {
			// Fallback placeholder if record not found yet
			carousel = {
				id,
				name: 'Banner',
				image: '/images/banners/banner-home.svg',
				mobileImage: '',
				targetUrl: '/home',
				urlType: 'Internal',
				description: '',
				sortOrder: 1,
				status: 'Publish'
			};
		}
	}

	return {
		...parentData,
		carousel
	};
};

export const actions: Actions = {
	updateCarousel: async ({ request, params, platform }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const status = data.get('status')?.toString() || 'Publish';
		const description = data.get('description')?.toString() || '';
		const urlType = data.get('urlType')?.toString() || 'Internal';
		const targetUrl = data.get('targetUrl')?.toString()?.trim() || '/home';
		const serial = Number(data.get('serial')?.toString()) || 1;
		const image = data.get('image')?.toString() || '/images/banners/banner-home.svg';
		const mobileImage = data.get('mobileImage')?.toString() || '';
		const startDateRaw = data.get('startDate')?.toString();
		const endDateRaw = data.get('endDate')?.toString();

		const startDate = startDateRaw ? new Date(startDateRaw) : undefined;
		const endDate = endDateRaw ? new Date(endDateRaw) : undefined;

		if (!name) {
			return { success: false, message: 'Carousel Name is required' };
		}

		const id = params.id;

		try {
			const db = getDb(platform);
			if (id === 'new') {
				await CustomizationService.createCarousel(db, {
					name,
					status,
					description,
					urlType,
					targetUrl,
					sortOrder: serial,
					image,
					mobileImage
				});
			} else {
				await CustomizationService.updateCarousel(db, id, {
					name,
					status,
					description,
					urlType,
					targetUrl,
					sortOrder: serial,
					image,
					mobileImage
				});
			}
		} catch (e: any) {
			console.error('Failed to save carousel:', e);
			return { success: false, message: e.message || 'ক্যারোসেল সংরক্ষণ করতে সমস্যা হয়েছে' };
		}

		throw redirect(303, '/admin/customization/carousel');
	}
};

