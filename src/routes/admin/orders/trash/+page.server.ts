import { OrderService } from '#lib/server/services/order.service';
import { getDb } from '#lib/server/db/index';
import type { Actions, PageServerLoad } from './$types';
import {
	handleRestoreOrder,
	handlePermanentDelete,
	handleEmptyTrash
} from '#lib/server/orders';

export const load: PageServerLoad = async ({ platform }) => {
	return {
		orders: await OrderService.listAdminOrders(getDb(platform), 'trash')
	};
};

export const actions: Actions = {
	restoreOrder: async ({ request, platform }) => handleRestoreOrder(request, platform),
	permanentDeleteOrder: async ({ request, platform }) => handlePermanentDelete(request, platform),
	emptyTrash: async ({ platform }) => handleEmptyTrash(platform)
};
