import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb } from '#lib/server/db/index';
import { ProductService } from '#lib/server/services/product.service';
import { productActionError, readIdList } from '#lib/server/utils/product-action';

export const load: PageServerLoad = async ({ platform }) => {
	let loadError: string | null = null;
	let products: Awaited<ReturnType<typeof ProductService.listAdminProducts>> = [];

	try {
		products = await ProductService.listAdminProducts(getDb(platform));
	} catch (e) {
		console.error('Failed to load products from D1 in admin/products:', e);
		loadError = 'প্রোডাক্ট তালিকা লোড করা যায়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।';
	}

	return { products, debugError: loadError };
};

export const actions: Actions = {
	deleteProduct: async ({ request, platform }) => {
		const productId = (await request.formData()).get('productId')?.toString();
		if (!productId) return fail(400, { message: 'প্রোডাক্ট আইডি পাওয়া যায়নি' });

		try {
			await ProductService.deleteProduct(getDb(platform), productId);
			return { success: true, message: 'প্রোডাক্ট সফলভাবে ডিলিট করা হয়েছে' };
		} catch (e) {
			return productActionError(e, 'ডিলিট করতে সমস্যা হয়েছে', 'Delete product failed');
		}
	},

	toggleStatus: async ({ request, platform }) => {
		const productId = (await request.formData()).get('productId')?.toString();
		if (!productId) return fail(400, { message: 'প্রোডাক্ট আইডি পাওয়া যায়নি' });

		try {
			const res = await ProductService.toggleProductStatus(getDb(platform), productId);
			return { success: true, nextStatus: res.nextStatus };
		} catch (e) {
			return productActionError(e, 'স্ট্যাটাস বদলানো যায়নি', 'Toggle product status failed');
		}
	},

	duplicateProduct: async ({ request, platform }) => {
		const productId = (await request.formData()).get('productId')?.toString();
		if (!productId) return fail(400, { message: 'প্রোডাক্ট আইডি পাওয়া যায়নি' });

		try {
			const res = await ProductService.duplicateProduct(getDb(platform), productId);
			return { success: true, duplicatedId: res.duplicatedProduct.id };
		} catch (e) {
			return productActionError(e, 'ডুপ্লিকেট করা যায়নি', 'Duplicate product failed');
		}
	},

	bulkDelete: async ({ request, platform }) => {
		const ids = readIdList(await request.formData(), 'productIds');
		if (ids.length === 0) return fail(400, { message: 'কোনো প্রোডাক্ট সিলেক্ট করা হয়নি' });

		try {
			const { deleted, skipped } = await ProductService.deleteProducts(getDb(platform), ids);
			const note = skipped > 0 ? ` (${skipped}টি ল্যান্ডিং পেজে ব্যবহৃত, তাই রাখা হয়েছে)` : '';
			return { success: true, deleted, skipped, message: `${deleted}টি প্রোডাক্ট ডিলিট করা হয়েছে${note}` };
		} catch (e) {
			return productActionError(e, 'ডিলিট করতে সমস্যা হয়েছে', 'Bulk delete failed');
		}
	},

	bulkSetStatus: async ({ request, platform }) => {
		const formData = await request.formData();
		const ids = readIdList(formData, 'productIds');
		const status = formData.get('status')?.toString();
		if (ids.length === 0) return fail(400, { message: 'কোনো প্রোডাক্ট সিলেক্ট করা হয়নি' });
		if (status !== 'published' && status !== 'draft') {
			return fail(400, { message: 'স্ট্যাটাস সঠিক নয়' });
		}

		try {
			const { updated } = await ProductService.setStatus(getDb(platform), ids, status);
			return { success: true, updated, status };
		} catch (e) {
			return productActionError(e, 'স্ট্যাটাস বদলানো যায়নি', 'Bulk status update failed');
		}
	}
};
