import type { Actions } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { INITIAL_PRODUCTS } from '../_data';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
	seedDatabase: async ({ platform, locals }) => {
		// This action wipes the products table, so only the Owner may run it.
		if (locals.admin?.role !== 'Owner') {
			return fail(403, { message: 'শুধুমাত্র Owner এই কাজটি করতে পারবেন।' });
		}

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

			return { success: true, message: 'D1 ডেটাবেজের প্রোডাক্ট সফলভাবে ইনিশিয়ালাইজ করা হয়েছে!' };
		} catch (err: any) {
			return fail(500, { message: err?.message || 'ডেটাবেজ সিড করতে ব্যর্থ হয়েছে' });
		}
	}
};
