import type { Actions, PageServerLoad } from './$types';
import {
	handleUpdateStatus,
	handleQuickConfirm,
	handleQuickCancel,
	handleDeleteOrder
} from '#lib/server/orders';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		...parentData
	};
};

export const actions: Actions = {
	updateOrderStatus: async ({ request, platform }) => handleUpdateStatus(request, platform),
	quickConfirmOrder: async ({ request, platform }) => handleQuickConfirm(request, platform),
	quickCancelOrder: async ({ request, platform }) => handleQuickCancel(request, platform),
	deleteOrder: async ({ request, platform }) => handleDeleteOrder(request, platform)
};
