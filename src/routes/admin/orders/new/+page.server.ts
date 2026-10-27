import type { Actions, PageServerLoad } from './$types';
import { handleCreateManualOrder } from '#lib/server/orders';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '../../_data.ts';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	return {
		...parentData
	};
};

export const actions: Actions = {
	createManualOrder: async ({ request, platform }) => handleCreateManualOrder(request, platform)
};
