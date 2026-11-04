import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { ProductService } from '#lib/server/services/product.service';
import { MediaService } from '#lib/server/services/media.service';
import { CategoryService } from '#lib/server/services/category.service';
import { productActionError, readProductPayload } from '#lib/server/utils/product-action';

export const load: PageServerLoad = async ({ platform }) => {
	let galleryImages: any[] = [];
	let taxonomyTree: any[] = [];
	let brands: string[] = [];

	try {
		const db = getDb(platform);
		const [mediaList, tree, brandNames] = await Promise.all([
			MediaService.listMedia(db, { limit: 60 }),
			CategoryService.getTaxonomyTree(db),
			ProductService.listBrandNames(db)
		]);
		galleryImages = mediaList || [];
		taxonomyTree = tree || [];
		brands = brandNames;
	} catch (e) {
		console.error('Failed to query data in product new:', e);
	}

	return { galleryImages, taxonomyTree, brands };
};

export const actions: Actions = {
	createProduct: async ({ request, platform }) => {
		try {
			const payload = readProductPayload(await request.formData());
			const created = await ProductService.createProduct(getDb(platform), payload);
			return { success: true, id: created.id, message: 'নতুন প্রোডাক্ট সফলভাবে সেভ হয়েছে!' };
		} catch (e) {
			return productActionError(e, 'প্রোডাক্ট তৈরিতে সমস্যা হয়েছে', 'Failed to create product');
		}
	}
};
