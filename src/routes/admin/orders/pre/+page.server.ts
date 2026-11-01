import { OrderService } from '#lib/server/services/order.service';
import { getDb } from '#lib/server/db/index';
import type { Actions, PageServerLoad } from './$types';
import {
	handleUpdateStatus,
	handleQuickConfirm,
	handleQuickCancel,
	handleDeleteOrder
} from '#lib/server/orders';

export const load: PageServerLoad = async ({ platform }) => {
	return {
		orders: await OrderService.listAdminOrders(getDb(platform), 'pre')
	};
};

export const actions: Actions = {
	updateOrderStatus: async ({ request, platform }) => handleUpdateStatus(request, platform),
	quickConfirmOrder: async ({ request, platform }) => handleQuickConfirm(request, platform),
	quickCancelOrder: async ({ request, platform }) => handleQuickCancel(request, platform),
	deleteOrder: async ({ request, platform }) => handleDeleteOrder(request, platform)
};
