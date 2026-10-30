import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { LandingPageService } from '#lib/server/services/landing-page.service';
import { ProductService } from '#lib/server/services/product.service';
import { fail, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, parent, platform }) => {
	const parentData = await parent();
	const db = getDb(platform);

	let landingPage = null;
	let productsList: any[] = [];

	try {
		[landingPage, productsList] = await Promise.all([
			LandingPageService.getLandingPageById(db, params.id),
			ProductService.listProducts(db, { status: 'published' }).catch(() => [])
		]);
	} catch (e) {
		console.error('Failed to load landing page for edit:', e);
	}

	if (!landingPage) {
		throw error(404, 'ল্যান্ডিং পেজটি খুঁজে পাওয়া যায়নি');
	}

	return {
		...parentData,
		landingPage,
		products: productsList
	};
};

export const actions: Actions = {
	update: async ({ params, request, platform }) => {
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
			const countdownMinutes = Number(data.get('countdownMinutes')) || 35;
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

			await LandingPageService.updateLandingPage(db, params.id, {
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

			return { success: true, message: 'ল্যান্ডিং পেজ সফলভাবে আপডেট করা হয়েছে!' };
		} catch (e: any) {
			console.error('Error updating landing page:', e);
			return fail(500, { message: e.message || 'আপডেট করতে ব্যর্থ হয়েছে' });
		}
	}
};

