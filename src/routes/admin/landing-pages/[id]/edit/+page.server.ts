import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { LandingPageService } from '#lib/server/services/landing-page.service';
import { ProductService } from '#lib/server/services/product.service';
import { fail, error } from '@sveltejs/kit';
import { parseLandingPageForm } from '#lib/server/validations/landing-page.validation';

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
		throw error(404, 'ল্যান্ডিং পেজটি খুঁজে পাওয়া যায়নি');
	}

	return {
		...parentData,
		landingPage,
		products: productsList
	};
};

export const actions: Actions = {
	update: async ({ params, request, platform }) => {
		const db = getDb(platform);
		const data = await request.formData();

		const parsed = parseLandingPageForm(data);
		if (!parsed.ok) {
			return fail(400, { message: parsed.message });
		}

		try {
			await LandingPageService.updateLandingPage(db, params.id, parsed.data);
			return { success: true, message: 'ল্যান্ডিং পেজ সফলভাবে আপডেট করা হয়েছে!' };
		} catch (e: any) {
			console.error('Error updating landing page:', e);
			if (e?.message?.includes?.('UNIQUE') || e?.message?.includes?.('unique')) {
				return fail(400, { message: 'এই স্ল্যাগ (/lp/…) ইতোমধ্যে অন্য একটি পেজে ব্যবহৃত। অন্য একটি দিন।' });
			}
			return fail(500, { message: 'আপডেট করতে ব্যর্থ হয়েছে' });
		}
	}
};
