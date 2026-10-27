import type { Actions, PageServerLoad } from './$types';
import { handleCreateManualOrder } from '#lib/server/orders';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '../../_data.ts';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		products: parentData?.products || INITIAL_PRODUCTS,
		orders: parentData?.orders || INITIAL_ORDERS,
		...parentData
	};
};

export const actions: Actions = {
	createManualOrder: async ({ request, platform }) => handleCreateManualOrder(request, platform)
};
