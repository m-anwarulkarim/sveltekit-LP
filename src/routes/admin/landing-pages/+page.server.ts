import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { LandingPageService } from '#lib/server/services/landing-page.service';
import { ProductService } from '#lib/server/services/product.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	const db = getDb(platform);

	let landingPagesList: any[] = [];
	let productsList: any[] = [];

	try {
		[landingPagesList, productsList] = await Promise.all([
			LandingPageService.listLandingPages(db),
			ProductService.listProducts(db, { status: 'published' }).catch(() => [])
		]);
	} catch (e) {
		console.error('Failed to load landing pages in admin:', e);
	}

	return {
		...parentData,
		landingPages: landingPagesList,
		products: productsList
	};
};

export const actions: Actions = {
	create: async ({ request, platform }) => {
		try {
			const db = getDb(platform);
			const data = await request.formData();

			const title = data.get('title')?.toString()?.trim() || '';
			let slug = data.get('slug')?.toString()?.trim() || '';
			const productId = data.get('productId')?.toString() || null;
			const tag = data.get('tag')?.toString() || 'স্পেশাল অফার';
			const headline = data.get('headline')?.toString()?.trim() || title;
			const subheadline = data.get('subheadline')?.toString()?.trim() || '';
			const offerBadge = data.get('offerBadge')?.toString() || tag;
			const countdownMinutes = Number(data.get('countdownMinutes')) || 45;
			const customPrice = data.get('customPrice') ? Number(data.get('customPrice')) : undefined;
			const customOriginalPrice = data.get('customOriginalPrice')
				? Number(data.get('customOriginalPrice'))
				: undefined;

			const bulletPointsRaw = data.get('bulletPoints')?.toString() || '';
			const bulletPoints = bulletPointsRaw
				.split('\n')
				.map((s) => s.trim())
				.filter(Boolean);

			if (!title) {
				return fail(400, { message: 'ল্যান্ডিং পেজের শিরোনাম লিখুন' });
			}

			if (!slug) {
				slug = title
					.toLowerCase()
					.replace(/[^a-z0-9]/g, '-')
					.replace(/-+/g, '-');
				if (!slug) slug = `offer-${Date.now()}`;
			}

			await LandingPageService.createLandingPage(db, {
				title,
				slug,
				productId,
				tag,
				template: 'style_1_animated',
				headline,
				subheadline,
				offerBadge,
				countdownMinutes,
				customPrice,
				customOriginalPrice,
				bulletPoints: bulletPoints.length > 0 ? bulletPoints : undefined
			});

			return { success: true, message: 'নতুন ল্যান্ডিং পেজ সফলভাবে তৈরি হয়েছে!' };
		} catch (e: any) {
			console.error('Error creating landing page:', e);
			return fail(500, { message: e.message || 'ল্যান্ডিং পেজ তৈরিতে ব্যর্থ হয়েছে' });
		}
	},

	delete: async ({ request, platform }) => {
		try {
			const db = getDb(platform);
			const data = await request.formData();
			const id = data.get('id')?.toString();

			if (!id) {
				return fail(400, { message: 'আইডি প্রয়োজন' });
			}

			await LandingPageService.deleteLandingPage(db, id);
			return { success: true, message: 'ল্যান্ডিং পেজ সফলভাবে মুছে ফেলা হয়েছে!' };
		} catch (e: any) {
			return fail(500, { message: e.message || 'মুছে ফেলতে ব্যর্থ হয়েছে' });
		}
	}
};

