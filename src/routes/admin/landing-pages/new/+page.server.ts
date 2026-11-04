import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { LandingPageService } from '#lib/server/services/landing-page.service';
import { ProductService } from '#lib/server/services/product.service';
import { fail } from '@sveltejs/kit';
import { parseLandingPageForm } from '#lib/server/validations/landing-page.validation';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	const db = getDb(platform);

	let productsList: any[] = [];
	try {
		productsList = await ProductService.listProducts(db, { status: 'published' }).catch(() => []);
	} catch (e) {
		console.error('Failed to load products for landing creation:', e);
	}

	return {
		...parentData,
		products: productsList
	};
};

export const actions: Actions = {
	create: async ({ request, platform }) => {
		const db = getDb(platform);
		const data = await request.formData();

		const parsed = parseLandingPageForm(data);
		if (!parsed.ok) {
			return fail(400, { message: parsed.message });
		}

		try {
			await LandingPageService.createLandingPage(db, parsed.data);
			return { success: true, message: 'নতুন ল্যান্ডিং পেজ সফলভাবে তৈরি হয়েছে!' };
		} catch (e: any) {
			console.error('Error creating landing page:', e);
			// Unique slug collision
			if (e?.message?.includes?.('UNIQUE') || e?.message?.includes?.('unique')) {
				return fail(400, { message: 'এই স্ল্যাগ (/lp/…) ইতোমধ্যে ব্যবহৃত হয়েছে। অন্য একটি দিন।' });
			}
			return fail(500, { message: 'ল্যান্ডিং পেজ তৈরিতে ব্যর্থ হয়েছে' });
		}
	}
};
