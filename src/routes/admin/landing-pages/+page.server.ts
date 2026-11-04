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
	delete: async ({ request, platform }) => {
		try {
			const db = getDb(platform);
			const data = await request.formData();
			const id = data.get('id')?.toString();

			if (!id) {
				return fail(400, { message: 'আইডি প্রয়োজন' });
			}

			await LandingPageService.deleteLandingPage(db, id);
			return { success: true, message: 'ল্যান্ডিং পেজ সফলভাবে মুছে ফেলা হয়েছে!' };
		} catch (e: any) {
			return fail(500, { message: e.message || 'মুছে ফেলতে ব্যর্থ হয়েছে' });
		}
	},

	duplicate: async ({ request, platform }) => {
		try {
			const db = getDb(platform);
			const data = await request.formData();
			const id = data.get('id')?.toString();

			if (!id) {
				return fail(400, { message: 'আইডি প্রয়োজন' });
			}

			const result = await LandingPageService.duplicateLandingPage(db, id);
			return { success: true, message: 'পেজ ডুপ্লিকেট করা হয়েছে!', id: result.id, slug: result.slug };
		} catch (e: any) {
			return fail(500, { message: e.message || 'ডুপ্লিকেট করতে ব্যর্থ হয়েছে' });
		}
	}
};
