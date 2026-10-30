import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { orders } from '#lib/server/db/schemas/orders.schema';
import { eq, or, desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/auth/login');
	}

	const user = event.locals.user;
	let userOrders: any[] = [];

	try {
		const db = getDb(event.platform);
		if (db) {
			const conditions = [];
			if (user.id) {
				conditions.push(eq(orders.userId, user.id));
			}
			if (user.email) {
				conditions.push(eq(orders.customerEmail, user.email));
			}

			if (conditions.length > 0) {
				userOrders = await db
					.select()
					.from(orders)
					.where(conditions.length === 1 ? conditions[0] : or(...conditions))
					.orderBy(desc(orders.createdAt))
					.limit(20);
			}
		}
	} catch (err) {
		console.error('Failed to load user orders:', err);
	}

	return {
		user,
		session: event.locals.session,
		orders: userOrders
	};
};
