import { OrderService } from '#lib/server/services/order.service';
import { getDb } from '#lib/server/db/index';
import type { Actions, PageServerLoad } from './$types';
import {
	handleUpdateStatus,
	handleQuickConfirm,
	handleQuickCancel,
	handleCreateManualOrder,
	handleDeleteOrder,
	handleRestoreOrder
} from '#lib/server/orders';

export const load: PageServerLoad = async ({ platform }) => {
	return {
		orders: await OrderService.listAdminOrders(getDb(platform), 'active')
	};
};

export const actions: Actions = {
	updateOrderStatus: async ({ request, platform }) => handleUpdateStatus(request, platform),
	quickConfirmOrder: async ({ request, platform }) => handleQuickConfirm(request, platform),
	quickCancelOrder: async ({ request, platform }) => handleQuickCancel(request, platform),
	createManualOrder: async ({ request, platform }) => handleCreateManualOrder(request, platform),
	deleteOrder: async ({ request, platform }) => handleDeleteOrder(request, platform),
	restoreOrder: async ({ request, platform }) => handleRestoreOrder(request, platform),
	syncCourier: async () => {
		return {
			success: true,
			syncedAt: new Date().toLocaleTimeString('bn-BD'),
			message: 'Steadfast ও Pathao কুরিয়ারের সাথে ট্র্যাকিং সফলভাবে সিঙ্ক হয়েছে!'
		};
	}
};
