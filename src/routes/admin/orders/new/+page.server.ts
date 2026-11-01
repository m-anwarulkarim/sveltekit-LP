import { ProductService } from '#lib/server/services/product.service';
import { OrderService } from '#lib/server/services/order.service';
import { getDb } from '#lib/server/db/index';
import type { Actions, PageServerLoad } from './$types';
import { handleCreateManualOrder } from '#lib/server/orders';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	const [orders, products] = await Promise.all([
		OrderService.listOrderHistoryIndex(db),
		ProductService.listProducts(db)
	]);
	return { orders, products };
};

export const actions: Actions = {
	createManualOrder: async ({ request, platform }) => handleCreateManualOrder(request, platform)
};
