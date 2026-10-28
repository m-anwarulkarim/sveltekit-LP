import type { PageServerLoad, Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import { ProductService } from '#lib/server/services/product.service';

export const load: PageServerLoad = async ({ parent, platform }) => {
	let debugError = null;
	const parentData = await parent();
	let productsList: any[] = [];

	try {
		const db = getDb(platform);
		productsList = await ProductService.listProducts(db);
	} catch (e: any) {
		console.error('Failed to load products from D1 in admin/products:', e);
		debugError = e?.message || String(e);
		if (Array.isArray(parentData?.products)) {
			productsList = parentData.products;
		}
	}

	return {
		...parentData,
		products: productsList,
		debugError
	};
};

export const actions: Actions = {
	deleteProduct: async ({ request, platform }) => {
		const data = await request.formData();
		const productId = data.get('productId')?.toString();
		if (!productId) return { success: false, message: 'Product ID required' };

		try {
			const db = getDb(platform);
			await ProductService.deleteProduct(db, productId);
			return { success: true, message: 'প্রোডাক্ট সফলভাবে ডিলিট করা হয়েছে' };
		} catch (e: any) {
			console.error('Delete product failed:', e);
			return { success: false, message: e?.message || 'ডিলিট করতে সমস্যা হয়েছে' };
		}
	},

	toggleStatus: async ({ request, platform }) => {
		const data = await request.formData();
		const productId = data.get('productId')?.toString();
		if (!productId) return { success: false, message: 'Product ID required' };

		try {
			const db = getDb(platform);
			const res = await ProductService.toggleProductStatus(db, productId);
			return { success: true, nextStatus: res.nextStatus };
		} catch (e: any) {
			return { success: false, message: e?.message };
		}
	},

	duplicateProduct: async ({ request, platform }) => {
		const data = await request.formData();
		const productId = data.get('productId')?.toString();
		if (!productId) return { success: false, message: 'Product ID required' };

		try {
			const db = getDb(platform);
			const res = await ProductService.duplicateProduct(db, productId);
			return { success: true, duplicated: res.duplicatedProduct };
		} catch (e: any) {
			return { success: false, message: e?.message };
		}
	},

	bulkDelete: async ({ request, platform }) => {
		const data = await request.formData();
		const idsRaw = data.get('productIds')?.toString() || '[]';
		let ids: string[] = [];
		try {
			ids = JSON.parse(idsRaw);
		} catch {
			ids = [];
		}

		if (ids.length === 0) return { success: false, message: 'কোনো প্রোডাক্ট সিলেক্ট করা হয়নি' };

		try {
			const db = getDb(platform);
			for (const id of ids) {
				await ProductService.deleteProduct(db, id);
			}
			return { success: true, count: ids.length, message: `${ids.length} টি প্রোডাক্ট ডিলিট করা হয়েছে` };
		} catch (e: any) {
			return { success: false, message: e?.message };
		}
	}
};
