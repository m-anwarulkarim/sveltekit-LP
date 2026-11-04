import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { ProductService } from '#lib/server/services/product.service';
import { MediaService } from '#lib/server/services/media.service';
import { CategoryService } from '#lib/server/services/category.service';
import { productActionError, readProductPayload } from '#lib/server/utils/product-action';

export const load: PageServerLoad = async ({ params, platform }) => {
	let product: Awaited<ReturnType<typeof ProductService.getForEdit>> = null;
	let galleryImages: any[] = [];
	let taxonomyTree: any[] = [];
	let brands: string[] = [];

	try {
		const db = getDb(platform);
		const [found, mediaList, tree, brandNames] = await Promise.all([
			ProductService.getForEdit(db, params.id),
			MediaService.listMedia(db, { limit: 60 }),
			CategoryService.getTaxonomyTree(db),
			ProductService.listBrandNames(db)
		]);
		product = found;
		galleryImages = mediaList || [];
		taxonomyTree = tree || [];
		brands = brandNames;
	} catch (e) {
		console.error('Failed to query product/taxonomy from D1:', e);
	}

	return { product, productId: params.id, galleryImages, taxonomyTree, brands };
};

export const actions: Actions = {
	updateProduct: async ({ request, platform, params }) => {
		try {
			const payload = readProductPayload(await request.formData());
			await ProductService.updateProduct(getDb(platform), params.id, payload);
			return { success: true, message: 'প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!' };
		} catch (e) {
			return productActionError(e, 'প্রোডাক্ট আপডেট করতে সমস্যা হয়েছে', 'Update product failed');
		}
	},

	deleteProduct: async ({ platform, params }) => {
		try {
			await ProductService.deleteProduct(getDb(platform), params.id);
			return { success: true, message: 'প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে!' };
		} catch (e) {
			return productActionError(e, 'ডিলিট করতে সমস্যা হয়েছে', 'Delete product failed');
		}
	}
};
