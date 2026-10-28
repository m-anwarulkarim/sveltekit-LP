import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index';
import { CategoryService } from '#lib/server/services/category.service';

export const load: PageServerLoad = async (event) => {
	let liveCategories: any[] = [];

	try {
		const db = getDb(event.platform);
		const list = await CategoryService.listCategories(db, { parentId: null });
		liveCategories = list || [];
	} catch (e) {
		console.error('Failed to load categories for storefront:', e);
	}

	return {
		categories: liveCategories,
		user: event.locals.user ?? null
	};
};

