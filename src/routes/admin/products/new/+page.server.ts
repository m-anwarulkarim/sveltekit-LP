import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { ProductService } from '#lib/server/services/product.service';
import { MediaService } from '#lib/server/services/media.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const parentData = await parent();
	let galleryImages: any[] = [];

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB);
			galleryImages = await MediaService.listMedia(db, { limit: 60 });
		} catch (e) {
			console.error('Failed to query gallery in product new:', e);
		}
	}

	return {
		...parentData,
		galleryImages
	};
};

export const actions: Actions = {
	createProduct: async ({ request, platform }) => {
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
			// Extract direct fields
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

		if (!payload.name) {
			return fail(400, { message: 'প্রোডাক্টের নাম অবশ্যই প্রদান করতে হবে' });
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				const created = await ProductService.createProduct(db, payload);
				return { success: true, createdProduct: created, message: 'নতুন প্রোডাক্ট সফলভাবে সেভ হয়েছে!' };
			} catch (e: any) {
				console.error('Failed to create product in DB:', e);
				return fail(500, { message: e?.message || 'প্রোডাক্ট তৈরিতে সমস্যা হয়েছে' });
			}
		}

		return { success: true, message: 'প্রোডাক্ট সফলভাবে তৈরি হয়েছে (Simulation)' };
	}
};
