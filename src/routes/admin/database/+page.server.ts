import type { Actions, PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import * as schema from '#lib/server/db/schema';
import { INITIAL_PRODUCTS } from '../_data';
import { fail } from '@sveltejs/kit';
import { count } from 'drizzle-orm';

export const load: PageServerLoad = async ({ platform, locals }) => {
	const db = getDb(platform);
	let isD1Connected = Boolean(platform?.env?.DB);

	let entityCounts = {
		products: 0,
		categories: 0,
		coupons: 0,
		orders: 0,
		customers: 0,
		reviews: 0
	};

	try {
		const [
			prodCount,
			catCount,
			coupCount,
			ordCount,
			custCount,
			revCount
		] = await Promise.all([
			db.select({ value: count() }).from(schema.products).get().catch(() => ({ value: 0 })),
			db.select({ value: count() }).from(schema.categories).get().catch(() => ({ value: 0 })),
			db.select({ value: count() }).from(schema.coupons).get().catch(() => ({ value: 0 })),
			db.select({ value: count() }).from(schema.orders).get().catch(() => ({ value: 0 })),
			db.select({ value: count() }).from(schema.customers).get().catch(() => ({ value: 0 })),
			db.select({ value: count() }).from(schema.reviews).get().catch(() => ({ value: 0 }))
		]);

		entityCounts = {
			products: Number(prodCount?.value || 0),
			categories: Number(catCount?.value || 0),
			coupons: Number(coupCount?.value || 0),
			orders: Number(ordCount?.value || 0),
			customers: Number(custCount?.value || 0),
			reviews: Number(revCount?.value || 0)
		};
	} catch (e) {
		console.warn('Could not fetch D1 entity counts:', e);
	}

	return {
		isD1Connected,
		entityCounts,
		userRole: locals.admin?.role || 'Staff'
	};
};

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
