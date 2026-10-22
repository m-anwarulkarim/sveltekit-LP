import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index.ts';
import * as schema from '#lib/server/db/schema.ts';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		...parentData
	};
};

export const actions: Actions = {
	toggleProductStock: async ({ request, platform }) => {
		const data = await request.formData();
		const productId = data.get('productId')?.toString();
		const inStock = data.get('inStock') === 'true';

		if (!productId) {
			return fail(400, { message: 'Product ID required' });
		}

		if (platform?.env?.DB) {
			try {
				const db = getDb(platform.env.DB);
				await db.update(schema.products)
					.set({ inStock })
					.where(eq(schema.products.id, productId));
				return { success: true, productId, inStock };
			} catch (err: any) {
				return fail(500, { message: err?.message || 'Failed to update product' });
			}
		}

		return { success: true, productId, inStock };
	}
};
