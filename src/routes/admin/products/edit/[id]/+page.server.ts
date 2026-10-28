import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { eq, or } from 'drizzle-orm';
import { ProductService } from '#lib/server/services/product.service';
import { MediaService } from '#lib/server/services/media.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, parent, platform }) => {
	const layoutData = await parent();
	let foundProduct: any = null;
	let galleryImages: any[] = [];

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);
			const row = await db
				.select()
				.from(schema.products)
				.where(or(eq(schema.products.id, params.id), eq(schema.products.slug, params.id)))
				.get();

			if (row) {
				foundProduct = { ...row };
				if (row.galleryImages) {
					try {
						foundProduct.images = JSON.parse(row.galleryImages);
					} catch {
						foundProduct.images = [row.image];
					}
				} else {
					foundProduct.images = [row.image];
				}
			}

			// Preload gallery images for picker
			galleryImages = await MediaService.listMedia(db, { limit: 60 });
		} catch (e) {
			console.error('Failed to query product from D1:', e);
		}
	}

	if (!foundProduct && Array.isArray(layoutData?.products)) {
		foundProduct =
			layoutData.products.find((p: any) => p.id === params.id || p.slug === params.id) || null;
		if (foundProduct && !foundProduct.images) {
			foundProduct.images = [foundProduct.image];
		}
	}

	return {
		product: foundProduct,
		productId: params.id,
		galleryImages
	};
};

export const actions: Actions = {
	updateProduct: async ({ request, platform, params }) => {
		const formData = await request.formData();
		const productDataRaw = formData.get('productData')?.toString();

		let payload: any = {};
		if (productDataRaw) {
			try {
				payload = JSON.parse(productDataRaw);
			} catch {
				return fail(400, { message: 'Invalid product data format' });
			}
		} else {
			payload = {
				name: formData.get('name')?.toString() || '',
				slug: formData.get('slug')?.toString() || '',
				price: Number(formData.get('price')) || 0,
				regularPrice: Number(formData.get('regularPrice')) || 0,
				stock: Number(formData.get('stock')) || 0,
				category: formData.get('category')?.toString() || 'General',
				description: formData.get('description')?.toString() || '',
				image: formData.get('image')?.toString() || '/images/products/soundcore.svg'
			};
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await ProductService.updateProduct(db, params.id, payload);
				return { success: true, message: 'প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!' };
			} catch (e: any) {
				console.error('Update product failed in DB:', e);
				return fail(500, { message: e?.message || 'প্রোডাক্ট আপডেট করতে সমস্যা হয়েছে' });
			}
		}

		return { success: true, message: 'প্রোডাক্ট সফলভাবে আপডেট সম্পন্ন (Simulation)' };
	},

	deleteProduct: async ({ platform, params }) => {
		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await ProductService.deleteProduct(db, params.id);
				return { success: true, message: 'প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে!' };
			} catch (e: any) {
				return fail(500, { message: e?.message });
			}
		}

		return { success: true, message: 'প্রোডাক্ট মুছে ফেলা হয়েছে (Simulation)' };
	}
};
