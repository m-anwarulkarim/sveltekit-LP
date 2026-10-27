import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index.ts';
import * as schema from '#lib/server/db/schema.ts';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '../_data.ts';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		...parentData
	};
};

export const actions: Actions = {
	seedDatabase: async ({ platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { message: 'Cloudflare D1 binding unavailable' });
		}

		try {
			const db = getDb(platform.env.DB);
			await db.delete(schema.products);
			for (const p of INITIAL_PRODUCTS) {
				const { variants, tags, status, priority, stock, openingStock, subCategory, isLowStock, ...dbProduct } = p as any;
				await db.insert(schema.products).values(dbProduct);
			}

			await db.delete(schema.orders);
			for (const o of INITIAL_ORDERS) {
				await db.insert(schema.orders).values(o);
			}

			return { success: true, message: 'D1 ডেটাবেজ সফলভাবে রিসিড করা হয়েছে!' };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'ডেটাবেজ সিড করতে ব্যর্থ হয়েছে' });
		}
	}
};
